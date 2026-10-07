const https = require('https')
const semver = require('semver')
const endpoint = 'https://api.github.com/repos/FrankloIA/vortex-launcher/releases/latest'
function fetchLatest(){
    return new Promise((resolve,reject)=>{
        const request=https.get(endpoint,{headers:{'User-Agent':'Vortex-Launcher','Accept':'application/vnd.github+json','Cache-Control':'no-cache'}},response=>{
            let body='';response.setEncoding('utf8');response.on('data',chunk=>body+=chunk);response.on('end',()=>{
                if(response.statusCode===404)return resolve(null)
                if(response.statusCode!==200)return reject(Error('GitHub respondió HTTP '+response.statusCode))
                try{resolve(JSON.parse(body))}catch{reject(Error('Respuesta de actualización no válida'))}
            });response.on('error',reject)
        });request.setTimeout(15000,()=>request.destroy(Error('Tiempo de espera agotado')));request.on('error',reject)
    })
}
function assess(release,current,platform=process.platform){
    if(!release)return {status:'unpublished',current}
    const version=semver.valid(release.tag_name)
    if(!version||!semver.valid(current))throw Error('La publicación no tiene una versión válida')
    if(!semver.gt(version,current))return {status:'current',current,version}
    const extension=platform==='win32'?/\.exe$/i:platform==='darwin'?/\.dmg$/i:/\.AppImage$/i
    const asset=(release.assets||[]).find(a=>extension.test(a.name)&&!(/arm64/i.test(a.name)) )
    if(!asset)return {status:'unavailable',current,version}
    const url=asset.browser_download_url
    if(!url?.startsWith('https://github.com/FrankloIA/vortex-launcher/releases/download/'))throw Error('Destino de actualización no válido')
    return {status:'available',current,version,url}
}
module.exports={fetchLatest,assess}
