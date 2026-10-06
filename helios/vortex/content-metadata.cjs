const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
function fingerprint(data) {
    const ignored=b=>b===9 || b===10 || b===13 || b===32
    let length=0;for(const byte of data) if(!ignored(byte)) length++
    let h=(1 ^ length) >>> 0, word=0, count=0
    for(const byte of data) {
        if(ignored(byte)) continue
        word |= byte << (8 * count++)
        if(count===4) { let k=Math.imul(word,0x5bd1e995)>>>0;k^=k>>>24;k=Math.imul(k,0x5bd1e995)>>>0;h=(Math.imul(h,0x5bd1e995)^k)>>>0;word=0;count=0 }
    }
    if(count) { h^=word;h=Math.imul(h,0x5bd1e995)>>>0 }
    h^=h>>>13;h=Math.imul(h,0x5bd1e995)>>>0;h^=h>>>15;return h>>>0
}
class ContentMetadata {
    constructor(root, providers) {
        this.root = root; this.providers = providers; this.file = path.join(root, 'content-metadata.json')
        this.cache = fs.existsSync(this.file) ? JSON.parse(fs.readFileSync(this.file)) : {}
    }
    get(file) { return this.cache[file.sha256] }
    async identify(files) {
        if(this.pending) await this.pending
        this.pending=this.identifyFiles(files).finally(()=>{this.pending=null})
        return this.pending
    }
    async identifyFiles(files) {
        const unknown = files.filter(f => !this.cache[f.sha256] && /^(mods|resourcepacks|shaderpacks)\//.test(f.path))
        if(!unknown.length) return { identified:0, unmatched:0 }
        const workspaceFile=path.join(this.root,'workspace.json')
        const workspace=fs.existsSync(workspaceFile) ? JSON.parse(fs.readFileSync(workspaceFile)) : {}
        if(!workspace.providerIdentificationConsent) return {identified:0,unmatched:unknown.length,needsConsent:true}
        const entries = unknown.map(file => { const data=fs.readFileSync(path.join(this.root,'blobs',file.sha256)); return {file,fingerprint:fingerprint(data),sha1:crypto.createHash('sha1').update(data).digest('hex')} })
        const response = this.providers.key() ? await this.providers.request('curseforge','fingerprints/432',{fingerprints:entries.map(e=>e.fingerprint)}) : null
        const exact = response?.data.exactMatches || []
        const matches = entries.map(entry => ({entry, match:exact.find(m => m.file.hashes.some(h=>h.algo===1 && h.value.toLowerCase()===entry.sha1))})).filter(e=>e.match)
        const ids = [...new Set(matches.map(m=>m.match.id))]
        const projects = ids.length ? (await this.providers.request('curseforge','mods',{modIds:ids})).data : []
        for(const {entry,match} of matches) {
            const project = projects.find(p=>p.id===match.id)
            this.cache[entry.file.sha256] = {gameVersions:match.file.gameVersions,source:{provider:'curseforge',projectId:match.id,fileId:match.file.id,version:match.file.displayName},display:{title:project?.name,author:project?.authors.map(a=>a.name).join(', '),icon:project?.logo?.thumbnailUrl}}
        }
        const remaining=entries.filter(e=>!this.cache[e.file.sha256])
        if(remaining.length) {
            const versions=await this.providers.request('modrinth','version_files',{hashes:remaining.map(e=>e.sha1),algorithm:'sha1'})
            const projectIds=[...new Set(Object.values(versions).map(v=>v.project_id))]
            const projects=projectIds.length ? await this.providers.request('modrinth','projects?'+new URLSearchParams({ids:JSON.stringify(projectIds)})) : []
            for(const entry of remaining) {
                const version=versions[entry.sha1], project=projects.find(p=>p.id===version?.project_id)
                if(version) this.cache[entry.file.sha256]={gameVersions:version.game_versions.concat(version.loaders.map(l=>({neoforge:'NeoForge',forge:'Forge',fabric:'Fabric',quilt:'Quilt'}[l] || l))),source:{provider:'modrinth',projectId:version.project_id,fileId:version.id,version:version.version_number},display:{title:project?.title,icon:project?.icon_url}}
                else this.cache[entry.file.sha256]={unmatched:true}
            }
        }
        const temp=this.file+'.tmp';fs.writeFileSync(temp,JSON.stringify(this.cache));fs.renameSync(temp,this.file)
        const identified=entries.filter(e=>this.cache[e.file.sha256]?.source).length
        return {identified,unmatched:unknown.length-identified}
    }
}
module.exports = {ContentMetadata,fingerprint}
