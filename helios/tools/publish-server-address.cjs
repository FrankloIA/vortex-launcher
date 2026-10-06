const fs=require('fs'),os=require('os'),path=require('path'),crypto=require('crypto'),{execFileSync}=require('child_process')
const {validate,verify}=require('../vortex/server-address.cjs'),settings=require('../vortex/server-address.json')
async function main(){
    const token=process.env.VORTEX_PTERODACTYL_API_TOKEN,key=process.env.VORTEX_ADDRESS_SIGNING_KEY;if(!token || !key)throw Error('Faltan secretos de la sincronización')
    const response=await fetch('https://gamedash.astrolnodes.net/api/client/servers/'+settings.serverId,{headers:{Authorization:'Bearer '+token,Accept:'application/json'},redirect:'error',signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('Consulta del hosting fallida: HTTP '+response.status)
    const data=await response.json(),allocation=data.attributes?.relationships?.allocations?.data?.find(a=>a.attributes.is_default)?.attributes;if(!allocation)throw Error('No hay asignación predeterminada')
    const value=validate({schema:1,serverId:settings.serverId,hostname:allocation.ip_alias || allocation.ip,port:allocation.port,updatedAt:Date.now()})
    try{const old=await fetch(settings.url,{signal:AbortSignal.timeout(10000)});if(old.ok){const last=verify(await old.json());if(last.hostname===value.hostname && last.port===value.port){console.log('La dirección no cambió');return}}}catch{}
    const envelope={payload:JSON.stringify(value),signature:crypto.sign(null,Buffer.from(JSON.stringify(value)),key).toString('base64')};verify(envelope)
    const directory=fs.mkdtempSync(path.join(os.tmpdir(),'vortex-address-')),file=path.join(directory,'address.json');fs.writeFileSync(file,JSON.stringify(envelope))
    const gh=args=>execFileSync(process.env.VORTEX_GH_PATH || 'gh',args,{encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','pipe']})
    try{let exists=true;try{gh(['release','view','vortex-server-address','--repo','FrankloIA/vortex-launcher'])}catch{exists=false}
        if(!exists)gh(['release','create','vortex-server-address','--repo','FrankloIA/vortex-launcher','--latest=false','--title','Dirección del servidor Vortex','--notes','Dirección pública firmada, sincronizada con el hosting'])
        gh(['release','upload','vortex-server-address',file,'--repo','FrankloIA/vortex-launcher','--clobber']);console.log('Dirección publicada: '+value.hostname+':'+value.port)
    }finally{fs.rmSync(directory,{recursive:true,force:true})}
}
if(require.main===module)main().catch(error=>{console.error(error.message);process.exitCode=1});module.exports={main}
