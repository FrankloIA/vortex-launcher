const fs=require('fs'),path=require('path')
const {hash}=require('./release-store.cjs')
const repository='FrankloIA/vortex-launcher'
const journal=path.resolve(__dirname,'../../HISTORIAL_VORTEX.md')
function archive(store,file=journal) {
    if(!fs.existsSync(file)) throw Error('Falta el historial compartido; no se eliminarán publicaciones')
    let text=fs.readFileSync(file,'utf8')
    for(const release of store.releases().slice().reverse()) {
        const bytes=fs.readFileSync(path.join(store.root,'releases',release.version+'.json'))
        const marker='<!-- manifest:'+hash(bytes)+' -->'
        if(text.includes(marker)) continue
        text+='\n'+marker+'\n## Pack '+release.version+' · '+release.publishedAt+'\n\n'
        text+='Estado al registrar: '+(store.isOfficial(release)?'oficial':'en pruebas')+'\n\n'+(release.notes || 'Sin notas históricas disponibles')+'\n\n'
        text+='Inventario exacto (ruta, SHA-256, protección):\n\n'
        for(const f of release.files) text+='- `'+f.path+'` · `'+f.sha256+'`'+(f.customization?' · '+JSON.stringify(f.customization):'')+'\n'
    }
    const temporary=file+'.tmp';fs.writeFileSync(temporary,text);fs.renameSync(temporary,file)
}
function plan(store,remote,latestTag) {
    const official=store.releases().filter(r=>store.isOfficial(r)),keep=official.slice(0,3)
    if(keep.length<3) return []
    const tags=new Set(['vortex-pack-stable',latestTag])
    const packTag=r=>'vortex-pack-'+r.version.replace(/ /g,'-')+'-'+hash(fs.readFileSync(path.join(store.root,'releases',r.version+'.json'))).slice(0,12)
    const installerTag=r=>'v'+r.version.replace(/ fixed$/,'')
    for(const r of keep) {tags.add(packTag(r));tags.add(installerTag(r))}
    const obsolete=new Set(official.slice(3).flatMap(r=>[packTag(r),installerTag(r)]))
    return remote.filter(r=>!r.draft && obsolete.has(r.tag_name) && !tags.has(r.tag_name)).map(r=>r.tag_name)
}
async function cleanup(store,gh,file=journal) {
    // Persist the full file inventory before any irreversible removal of binaries.
    archive(store,file)
    if(store.releases().filter(r=>store.isOfficial(r)).length<3) return {deleted:[]}
    const pages=JSON.parse(await gh(['api','repos/'+repository+'/releases','--paginate','--slurp']))
    const latest=JSON.parse(await gh(['api','repos/'+repository+'/releases/latest']))
    const deleted=[]
    for(const tag of plan(store,pages.flat(),latest.tag_name)) {
        // Deliberately omit --cleanup-tag: source commits and tags remain recoverable.
        await gh(['release','delete',tag,'--repo',repository,'--yes']);deleted.push(tag)
    }
    return {deleted}
}
module.exports={archive,plan,cleanup}
