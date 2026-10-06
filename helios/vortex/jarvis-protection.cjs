const fs = require('fs')
const path = require('path')
class JarvisProtection {
    constructor(root) { this.file=path.join(root,'jarvis-protection.json');this.root=root }
    entries() { return fs.existsSync(this.file) ? JSON.parse(fs.readFileSync(this.file)) : {} }
    upstream(file) {
        const cacheFile=path.join(this.root,'content-metadata.json'),cache=fs.existsSync(cacheFile)?JSON.parse(fs.readFileSync(cacheFile)):{}
        return file.source || file.upstream || this.entries()[file.sha256]?.upstream || cache[file.sha256]?.source
    }
    display(file) {
        const upstream=this.upstream(file),cacheFile=path.join(this.root,'content-metadata.json')
        if(!upstream || !fs.existsSync(cacheFile)) return null
        return Object.values(JSON.parse(fs.readFileSync(cacheFile))).find(item=>item.source?.provider===upstream.provider && String(item.source?.projectId)===String(upstream.projectId))?.display
    }
    status(file) {
        if(!/^(mods|resourcepacks|shaderpacks)\//.test(file.path)) return {protected:false}
        const marked=this.entries()[file.sha256]
        const cacheFile=path.join(this.root,'content-metadata.json')
        const verified=fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile))[file.sha256]?.source : null
        const jarvis=!!marked || file.customization?.author==='Jarvis'
        return {protected:jarvis || !verified,jarvis,reason:jarvis ? 'Modificado por Jarvis' : !verified ? 'Protegido · origen sin verificar' : 'Original verificado'}
    }
    mark(file, upstream) {
        const entries=this.entries();entries[file.sha256]={author:'Jarvis',markedAt:new Date().toISOString(),upstream:upstream || file.upstream || file.source || null}
        fs.mkdirSync(this.root,{recursive:true});const temp=this.file+'.tmp';fs.writeFileSync(temp,JSON.stringify(entries,null,2));fs.renameSync(temp,this.file)
        return {author:'Jarvis',protected:true}
    }
    assertCatalogReplacement(draft,target,replacePath,projectId) {
        for(const file of draft.files) {
            if((file.path===target || file.path===replacePath || (projectId && String(file.source?.projectId || file.upstream?.projectId)===String(projectId))) && this.status(file).protected) throw Error('Archivo protegido: el catálogo no puede sustituir modificaciones de Jarvis ni archivos sin verificar')
        }
    }
}
module.exports={JarvisProtection}
