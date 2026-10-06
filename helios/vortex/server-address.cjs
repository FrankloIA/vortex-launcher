const fs=require('fs'),path=require('path'),crypto=require('crypto'),settings=require('./server-address.json')
let cached,pending,checked=0
function validate(value) {
    if(value?.serverId!==settings.serverId || typeof value.hostname!=='string' || !/^[a-zA-Z0-9.-]{1,253}$/.test(value.hostname) || !Number.isInteger(value.port) || value.port<1 || value.port>65535)throw Error('Dirección de Vortex inválida')
    return value
}
function verify(envelope) {
    if(typeof envelope?.payload!=='string' || envelope.payload.length>4096 || typeof envelope.signature!=='string' || !crypto.verify(null,Buffer.from(envelope.payload),settings.publicKey,Buffer.from(envelope.signature,'base64')))throw Error('Firma de dirección inválida')
    const value=validate(JSON.parse(envelope.payload));if(value.schema!==1 || !Number.isSafeInteger(value.updatedAt) || value.updatedAt>Date.now()+300000)throw Error('Registro de dirección inválido');return value
}
async function resolveAddress({fetcher=fetch,cacheFile,force=false}={}) {
    if(!cached && cacheFile)try{cached=verify(JSON.parse(fs.readFileSync(cacheFile,'utf8')))}catch{}
    if(!force && cached && Date.now()-checked<30000)return cached
    if(pending)return pending
    pending=(async()=>{
        let envelope,value
        try {const r=await fetcher(settings.url+'?checked='+Date.now(),{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(5000)});if(!r.ok)throw Error('Dirección no disponible');const text=await r.text();if(text.length>8192)throw Error('Registro demasiado grande');envelope=JSON.parse(text);value=verify(envelope);if(cached?.updatedAt>value.updatedAt)throw Error('Registro anterior');if(cacheFile){fs.mkdirSync(path.dirname(cacheFile),{recursive:true});const temp=cacheFile+'.tmp';fs.writeFileSync(temp,JSON.stringify(envelope));fs.renameSync(temp,cacheFile)}}catch{
            if(cached)return cached
            if(cacheFile)try{value=verify(JSON.parse(fs.readFileSync(cacheFile,'utf8')))}catch{}
            if(!value)value={serverId:settings.serverId,...settings.fallback}
        }
        checked=Date.now();return cached=value
    })().finally(()=>{pending=null});return pending
}
function isVortex(server) {return /^vortex(?:-|$)/.test(server?.rawServer?.id || server?.id || '')}
module.exports={resolveAddress,verify,validate,isVortex}
