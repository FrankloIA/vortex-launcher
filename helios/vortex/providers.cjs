const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
class Providers {
    constructor(root) { this.keyFile = path.join(root, 'curseforge-key.txt') }
    key() { return process.env.VORTEX_CURSEFORGE_KEY || (fs.existsSync(this.keyFile) ? fs.readFileSync(this.keyFile, 'utf8').trim() : '') }
    async request(provider, route, body) {
        if(!['modrinth', 'curseforge'].includes(provider)) throw Error('Proveedor inválido')
        const headers = { 'User-Agent': 'VortexLauncher/1.0', Accept: 'application/json' }
        if(provider === 'curseforge') { if(!this.key()) throw Error('Configura una clave API de CurseForge'); headers['x-api-key'] = this.key() }
        const response = await fetch((provider === 'modrinth' ? 'https://api.modrinth.com/v2/' : 'https://api.curseforge.com/v1/') + route, { headers:body ? {...headers,'Content-Type':'application/json'} : headers, method:body ? 'POST' : 'GET', body:body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(20000) })
        if(!response.ok) throw Error(`${provider}: HTTP ${response.status}`)
        return response.json()
    }
    async search(provider, query, category, target = {minecraft:'1.21.1',loader:'neoforge'}, options = {}) {
        const offset=Number(options.offset || 0)
        if(!Number.isInteger(offset) || offset<0 || (provider==='curseforge' && offset>9980)) throw Error('Página del catálogo inválida')
        const page=(items,total)=>options.paginated ? {items,total,offset,nextOffset:offset+20<Math.min(total,provider==='curseforge'?10000:Infinity)?offset+20:null} : items
        const type = { mods: 'mod', resourcepacks: 'resourcepack', shaderpacks: 'shader' }[category]
        if(!type) throw Error('Selecciona mods, resourcepacks o shaders')
        if(provider === 'modrinth') {
            const facets = [['project_type:' + type], ['versions:' + target.minecraft]]
            if(category === 'mods') facets.push(['categories:' + target.loader])
            const data = await this.request(provider, 'search?' + new URLSearchParams({ query, facets: JSON.stringify(facets), limit: 20, offset, index:query.trim()?'relevance':'downloads' }))
            return page(data.hits.map(p => ({ projectId: p.project_id, slug:p.slug, title: p.title, author: p.author, description: p.description, icon: p.icon_url, categories: p.categories, downloads: p.downloads, updated: p.date_modified, environment: [p.client_side !== 'unsupported' ? 'Cliente' : '', p.server_side !== 'unsupported' ? 'Servidor' : ''].filter(Boolean).join(' y ') })),data.total_hits)
        }
        const params = { gameId: 432, classId: { mods: 6, resourcepacks: 12, shaderpacks: 6552 }[category], gameVersion: target.minecraft, searchFilter: query, pageSize: 20, index:offset,sortField:query.trim()?2:6,sortOrder:'desc' }
        if(category === 'mods') params.modLoaderType = {forge:1,fabric:4,quilt:5,neoforge:6}[target.loader]
        const data = await this.request(provider, 'mods/search?' + new URLSearchParams(params))
        return page(data.data.map(p => ({ projectId: p.id, slug:p.slug, title: p.name, author: p.authors.map(a => a.name).join(', '), description: p.summary, icon: p.logo?.thumbnailUrl, categories: p.categories.map(c => c.name), downloads: p.downloadCount, updated: p.dateModified })),data.pagination?.totalCount ?? offset+data.data.length)
    }
    async latest(provider, projectId, category, target = {minecraft:'1.21.1',loader:'neoforge'}) {
        const project = encodeURIComponent(String(projectId))
        if(provider === 'modrinth') {
            const params = { game_versions: JSON.stringify([target.minecraft]) }
            if(category === 'mods') params.loaders = JSON.stringify([target.loader])
            const versions = await this.request(provider, `project/${project}/version?` + new URLSearchParams(params))
            const v = versions.filter(v => v.version_type === 'release').sort((a,b) => b.date_published.localeCompare(a.date_published))[0]
            if(!v) throw Error('No hay versión estable compatible')
            const f = v.files.find(f => f.primary) || v.files[0]
            return { provider, projectId, fileId: v.id, filename: f.filename, url: f.url, hashes: f.hashes, size: f.size, dependencies: v.dependencies.filter(d => d.dependency_type === 'required'), version: v.version_number }
        }
        const params = { gameVersion: target.minecraft, pageSize: 50 }
        if(category === 'mods') params.modLoaderType = {forge:1,fabric:4,quilt:5,neoforge:6}[target.loader]
        const data = await this.request(provider, `mods/${project}/files?` + new URLSearchParams(params))
        const f = data.data.filter(f => f.releaseType === 1 && f.gameVersions.includes(target.minecraft) && (category !== 'mods' || f.gameVersions.includes({neoforge:'NeoForge',forge:'Forge',fabric:'Fabric',quilt:'Quilt'}[target.loader]))).sort((a,b) => b.fileDate.localeCompare(a.fileDate))[0]
        if(!f) throw Error('No hay versión estable compatible')
        return { provider, projectId, fileId: f.id, filename: f.fileName, url: f.downloadUrl, hashes: Object.fromEntries(f.hashes.filter(h => [1,2].includes(h.algo)).map(h => [h.algo === 1 ? 'sha1' : 'md5', h.value])), size: f.fileLength, dependencies: f.dependencies.filter(d => d.relationType === 3), version: f.displayName }
    }
    async download(file) {
        if(!file.url) throw Error('El autor no permite esta descarga externa')
        const url = new URL(file.url)
        if(url.protocol !== 'https:' || !['cdn.modrinth.com', 'edge.forgecdn.net', 'mediafilez.forgecdn.net', 'media.forgecdn.net'].includes(url.hostname)) throw Error('Servidor de descarga no permitido')
        const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(60000), headers: { 'User-Agent': 'VortexLauncher/1.0' } })
        if(!response.ok) throw Error('Descarga: HTTP ' + response.status)
        const chunks = []; let size = 0
        for await(const chunk of response.body) { size += chunk.length; if(size > 64 * 1048576) throw Error('Descarga supera 64 MiB'); chunks.push(chunk) }
        const data = Buffer.concat(chunks)
        if(data.length !== file.size || !Object.entries(file.hashes).length || !Object.entries(file.hashes).every(([algorithm, value]) => ['sha512','sha1','md5'].includes(algorithm) && crypto.createHash(algorithm).update(data).digest('hex') === value.toLowerCase())) throw Error('Descarga no coincide con los hashes oficiales')
        return data
    }
}
module.exports = { Providers }
