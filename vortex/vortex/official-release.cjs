const fs=require('fs'),path=require('path'),crypto=require('crypto')
const {Readable,Transform}=require('stream'),{pipeline}=require('stream/promises')
const {hash,verify,applyRelease}=require('./release-store.cjs')
const {fileHash,unpack}=require('./pack-bundles.cjs')
const feed=require('./pack-feed.json')
const prefix='https://github.com/'+feed.repository+'/releases/download/'
function validateUrl(url) {if(typeof url!=='string' || !url.startsWith(prefix) || new URL(url).search) throw Error('Origen de actualización inválido');return url}
async function readJson(url) {
    const response=await fetch(validateUrl(url),{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(30000)})
    if(response.status===404) return null
    if(!response.ok) throw Error('No se pudo consultar la publicación oficial (HTTP '+response.status+')')
    const chunks=[];let size=0
    for await(const chunk of response.body) {size+=chunk.length;if(size>8*1024*1024) throw Error('Catálogo demasiado grande');chunks.push(Buffer.from(chunk))}
    return JSON.parse(Buffer.concat(chunks).toString())
}
function verifyPointer(envelope) {
    if(!envelope || typeof envelope.payload!=='string' || typeof envelope.signature!=='string' || !crypto.verify(null,Buffer.from(envelope.payload),feed.publicKey,Buffer.from(envelope.signature,'base64'))) throw Error('Firma del canal oficial inválida')
    const pointer=JSON.parse(envelope.payload)
    if(pointer.schema!==1 || !/^[a-f0-9]{64}$/.test(pointer.releaseSha256) || !Array.isArray(pointer.bundles) || pointer.bundles.length>1000) throw Error('Canal oficial inválido')
    validateUrl(pointer.releaseUrl)
    for(const part of pointer.bundles) {validateUrl(part.url);if(!/^[a-f0-9]{64}$/.test(part.sha256) || !Number.isSafeInteger(part.size) || part.size<6 || part.size>256*1024*1024) throw Error('Paquete oficial inválido')}
    return pointer
}
async function checkOfficialRelease(instancesRoot) {
    const signed=await readJson(prefix+'vortex-pack-stable/stable.json')
    if(!signed) return null
    const pointer=verifyPointer(signed),state=path.join(instancesRoot,'vortex-official','.vortex-release.json')
    const installed=fs.existsSync(state)?JSON.parse(fs.readFileSync(state)):null
    return {...pointer,pending:installed?.releaseSha256!==pointer.releaseSha256}
}
async function prepareOfficialRelease(instancesRoot,onProgress=()=>{},options={}) {
    const release=await checkOfficialRelease(instancesRoot)
    if(!release) throw Error('Todavía no hay una versión oficial publicada')
    const instance=path.join(instancesRoot,'vortex-official'),cache=path.join(instancesRoot,'.vortex-downloads'),blobs=path.join(cache,'blobs')
    fs.mkdirSync(cache,{recursive:true})
    const envelope=await readJson(release.releaseUrl)
    // El hash se calcula sobre los mismos bytes serializados por el publicador.
    if(hash(Buffer.from(JSON.stringify(envelope,null,2)))!==release.releaseSha256) throw Error('La publicación descargada no corresponde al canal oficial')
    const manifest=verify(envelope,feed.publicKey)
    if(manifest.version!==release.version || manifest.minecraft!=='1.21.1' || (manifest.loader || 'neoforge')!=='neoforge') throw Error('Esta versión necesita otro ejecutable del launcher')
    const modVault=require('./mod-vault.cjs');const readBlob=sha=>{const blob=path.join(blobs,sha);return fs.existsSync(blob)?fs.readFileSync(blob):modVault.protect(fs.readFileSync(blob+'.vxmod'),false)}
    let done=0
    const missing=manifest.files.some(f=>{const blob=path.join(blobs,f.sha256);if(!fs.existsSync(blob)&&fs.existsSync(blob+'.vxmod')){try{const bytes=readBlob(f.sha256);return bytes.length!==f.size || hash(bytes)!==f.sha256}catch{return true}}return !fs.existsSync(blob) || fs.statSync(blob).size!==f.size || fileHash(blob)!==f.sha256})
    for(const part of release.bundles) {
        const file=path.join(cache,part.sha256+'.vxp')
        if(missing && (!fs.existsSync(file) || fileHash(file)!==part.sha256)) {
            const response=await fetch(validateUrl(part.url),{signal:AbortSignal.timeout(600000)})
            if(!response.ok) throw Error('No se pudo descargar el pack oficial')
            const temp=file+'.'+crypto.randomUUID()+'.tmp';let received=0
            const counter=new Transform({transform(chunk,encoding,callback){received+=chunk.length;if(received>part.size)return callback(Error('Descarga demasiado grande'));callback(null,chunk)}})
            try {await pipeline(Readable.fromWeb(response.body),counter,fs.createWriteStream(temp));if(received!==part.size || fileHash(temp)!==part.sha256) throw Error('Descarga corrupta');fs.renameSync(temp,file)} finally {if(fs.existsSync(temp))fs.unlinkSync(temp)}
        }
        if(missing) unpack(file,manifest,blobs)
        onProgress({percent:Math.floor(++done*90/release.bundles.length),message:'Actualizando Vortex · '+release.version})
    }
    const vault=require('./mod-vault.cjs'),integrity=require('./instance-integrity.cjs');vault.open(instance);const prior=fs.existsSync(path.join(instance,'.vortex-authority.json'))?JSON.parse(fs.readFileSync(path.join(instance,'.vortex-authority.json'))):null;if(!options.administrator && prior)integrity.scan(instance,prior,feed.publicKey,readBlob)
    const result=applyRelease(instance,envelope,feed.publicKey,readBlob,{preservePersonal:options.administrator===true})
    require('./resourcepack-options.cjs').restoreEmptySelection(instance,manifest,readBlob)
    require('./mod-policy.cjs').applyOptional(instance);const shaders=require('./shader-policy.cjs');shaders.set(instance,shaders.get(instance))
    fs.writeFileSync(path.join(instance,'.vortex-release.json'),JSON.stringify({version:manifest.version,releaseSha256:release.releaseSha256}))
    fs.writeFileSync(path.join(instance,'.vortex-authority.json'),JSON.stringify(envelope));if(manifest.security?.integrity)fs.writeFileSync(path.join(instance,'.vortex-protected'),'1')
    if(manifest.security?.vault!==false && manifest.files.some(f=>modVault.ownHashes.has(f.sha256))){for(const f of manifest.files){if(!modVault.ownHashes.has(f.sha256))continue;const blob=path.join(blobs,f.sha256);if(fs.existsSync(blob)){require('./release-store.cjs').atomic(blob+'.vxmod',modVault.protect(fs.readFileSync(blob),true));fs.unlinkSync(blob)}}for(const part of release.bundles){const archive=path.join(cache,part.sha256+'.vxp');if(fs.existsSync(archive))fs.unlinkSync(archive)}}
    onProgress({percent:100,message:'Vortex '+manifest.version+' actualizado'})
    return result
}
module.exports={checkOfficialRelease,prepareOfficialRelease,verifyPointer}
