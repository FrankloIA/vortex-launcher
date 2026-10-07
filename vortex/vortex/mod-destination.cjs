const Zip=require('adm-zip'),crypto=require('crypto'),fs=require('fs'),path=require('path')
// Hashes entregados por Claude: la asociación nunca se deduce del nombre del archivo.
const reviewed={
    '1457767595ee827e4cd6784dae843cad7e4c30020918518d3c3787224113a570':'client',
    'ce56392e13fa0766a1fe99e5f239bf44c43a83642a771561234c7cb7fd5845a3':'client',
    '57ddd12392b78642444b6145e38d76ed9e4965758455f8935409d28357137c22':'server',
    'af354d7d036324ae533d672c9293c9326b4f6e5352aa1092041ff08612830731':'both',
    'c68d6cce3d0812727d8c317f426a174f4615cec30fcb5638fbdcdcd9f999d75d':'client',
    '8ccb74e4896089ef5f606edc02f967b8e76eb60174cfa7198a6eef7dbf418484':'client',
    '0791f5ff5bf06c5414e7fb351bddc95fe02f05e002320063b9bd9b95967744bc':'server',
    '9538c94390a117153974189fb075b08b391a308c4e8d66b70ca903079397b02a':'server',
    'c6024d70cc363dbca1ca1797720957046e9b70b30f174a3207726c990e3fa7f8':'server',
    '7b0a08b97e9f66c353fa8c397fb8512794e8060583df6d6b1c7531e89ee72504':'server'
}
// Decisión del propietario del pack: DH nunca se distribuye al servidor,
// aunque el proyecto soporte funciones dedicadas opcionales.
const clientOnlyPolicy=new Set(['distanthorizons'])
function modIds(data) {
    const zip=new Zip(data),fabric=zip.getEntry('fabric.mod.json'),toml=zip.getEntry('META-INF/neoforge.mods.toml') || zip.getEntry('META-INF/mods.toml')
    if(fabric)return [JSON.parse(fabric.getData()).id]
    return toml?toml.getData().toString().split(/(?=\[\[)/).filter(b=>/^\[\[mods\]\]/.test(b.trim())).map(b=>b.match(/modId\s*=\s*["']([^"']+)["']/)?.[1]).filter(Boolean):[]
}
function inspectMod(data,catalog) {
    const sha256=crypto.createHash('sha256').update(data).digest('hex'),zip=new Zip(data),entries=zip.getEntries()
    const fabric=zip.getEntry('fabric.mod.json'),neo=zip.getEntry('META-INF/neoforge.mods.toml'),forge=zip.getEntry('META-INF/mods.toml')
    const library=/^FMLModType:\s*LIBRARY\s*$/m.test(zip.getEntry('META-INF/MANIFEST.MF')?.getData().toString() || '')
    if(!fabric && !neo && !forge && !library)throw Error('No se encontraron metadatos de un mod compatible')
    let environment,entrypoints=[]
    if(fabric){const meta=JSON.parse(fabric.getData());environment=meta.environment;entrypoints=Object.keys(meta.entrypoints || {})}
    const classEntries=entries.filter(e=>e.entryName.endsWith('.class'));let clientReferences=0,serverReferences=0,maxJava=0
    for(const e of classEntries){if(e.header.size>2*1048576 || Number(e.entryName.match(/^META-INF\/versions\/(\d+)\//)?.[1] || 0)>21)continue;const b=e.getData();if(b.length<8 || b.readUInt32BE(0)!==0xcafebabe)continue;maxJava=Math.max(maxJava,b.readUInt16BE(6)-44);const text=b.toString('latin1');if(text.includes('net/minecraft/client/'))clientReferences++;if(text.includes('net/minecraft/server/'))serverReferences++}
    // Essential y Kotlin pueden ser contenedores FML LIBRARY: su ausencia de mods.toml
    // no les asigna un destino. Se revisan también sus clases empaquetadas.
    let nestedClassCount=0
    const inspectLibrary=(archive,depth)=>{
        for(const e of archive.getEntries()) {
            if(e.entryName.endsWith('.class') && !e.entryName.startsWith('META-INF/versions/') && e.header.size<=2*1048576) {
                const b=e.getData();if(b.length>=8 && b.readUInt32BE(0)===0xcafebabe){nestedClassCount++;maxJava=Math.max(maxJava,b.readUInt16BE(6)-44)}
            } else if(depth<3 && e.entryName.endsWith('.jar') && e.header.size<=64*1048576)inspectLibrary(new Zip(e.getData()),depth+1)
        }
    }
    if(library)for(const e of entries.filter(e=>e.entryName.endsWith('.jar') && e.header.size<=64*1048576))inspectLibrary(new Zip(e.getData()),1)
    const ids=modIds(data)
    const evidence={metadata:fabric?'fabric.mod.json':neo?'neoforge.mods.toml':forge?'mods.toml':'MANIFEST.MF: FML LIBRARY',modIds:ids,classCount:classEntries.length,nestedClassCount,clientReferences,serverReferences,maxJava,environment,entrypoints,catalog:catalog || null}
    // Referencias a clases cliente no prueban que un mod sea exclusivo de cliente: pueden estar aisladas por dist.
    if(maxJava>21)return {sha256,destination:'unknown',verified:false,reason:'Requiere Java '+maxJava+'; el servidor utiliza Java 21',evidence}
    if(ids.some(id=>clientOnlyPolicy.has(id)))return {sha256,destination:'client',verified:true,policy:true,reason:'Solo cliente por decisión del propietario: Distant Horizons nunca debe instalarse en el servidor',evidence}
    if(reviewed[sha256])return {sha256,destination:reviewed[sha256],verified:true,jarvis:true,reason:'Hash exacto de la entrega de Claude y metadatos/bytecode revisados; conserva la variante específica de cada destino',evidence}
    const local=environment==='client'?'client':environment==='server'?'server':null
    const remote=catalog?.client_side==='unsupported' && catalog?.server_side!=='unsupported'?'server':catalog?.server_side==='unsupported' && catalog?.client_side!=='unsupported'?'client':null
    if(local && remote===local)return {sha256,destination:local,verified:true,reason:'Catálogo y entorno explícito del JAR coinciden',evidence}
    return {sha256,destination:local || 'unknown',verified:false,reason:local?'El JAR declara un destino, falta corroborarlo con la documentación del proyecto':'Pendiente de doble revisión: metadatos genéricos o referencias de bytecode no prueban compatibilidad dedicada',evidence}
}
// Una revisión se aplica solo a los bytes exactos que se revisaron, no al nombre.
function destinationSummary(root,sha256) {
    if(!/^[a-f0-9]{64}$/.test(sha256 || ''))return {destination:'unknown',verified:false}
    const file=path.join(root,'server','reviews',sha256+'.json')
    if(fs.existsSync(file)) {
        try {
            const review=JSON.parse(fs.readFileSync(file))
            if(review.sha256===sha256 && review.evidence?.modIds?.some(id=>clientOnlyPolicy.has(id)))return {destination:'client',verified:true,reason:'Solo cliente por decisión del propietario; excluido del servidor'}
            if(review.sha256===sha256 && ['client','server','both'].includes(review.destination) && review.documentation?.length>=20 && review.evidence?.maxJava<=21)
                return {destination:review.destination,verified:true,reason:review.documentation}
        } catch {}
    }
    return reviewed[sha256]?{destination:reviewed[sha256],verified:true,reason:'Entrega Jarvis revisada por hash exacto'}:{destination:'unknown',verified:false}
}
module.exports={inspectMod,modIds,destinationSummary}
