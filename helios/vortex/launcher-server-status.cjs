const {getServerStatus}=require('./server-status.cjs')
async function launcherServerStatus(protocol,hostname,port,{fetcher=fetch,ping=getServerStatus}={}) {
    // Solo se recibe un resumen público desde el panel local. Ninguna clave llega al launcher.
    try {
        const response=await fetcher('http://127.0.0.1:43117/api/server/status',{signal:AbortSignal.timeout(1200)})
        if(response.ok){const status=await response.json();if(status.hostname===hostname && Number(status.port)===Number(port) && Date.now()-status.checkedAt<20000 && status.online && Number.isInteger(status.players?.online) && Number.isInteger(status.players?.max))return {players:status.players,hostingState:status.state}}
    } catch {}
    try{return await ping(protocol,hostname,port)}catch{return ping(protocol,hostname,port)}
}
module.exports={launcherServerStatus}
