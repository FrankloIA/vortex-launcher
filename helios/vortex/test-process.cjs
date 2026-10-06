function monitorTestProcess(child,gate,id,{instance,account}) {
    gate.gameStarted(id,child.pid,instance,account)
    let buffer=''
    const output=data=>{
        buffer=(buffer+data.toString()).slice(-16384)
        if(/Sound engine started|OpenAL initialized/i.test(buffer)) gate.ready(id)
        if(/Crash report saved|This crash report has been saved|Minecraft has crashed|Exception in thread "Render thread"|A fatal error has been detected by the Java Runtime/i.test(buffer)) gate.fail(id,'El cliente notificó un fallo durante la prueba')
    }
    child.stdout.on('data',output);child.stderr.on('data',output)
    child.on('error',()=>gate.fail(id,'No se pudo iniciar el proceso del juego'))
    child.on('close',(code,signal)=>gate.finished(id,code,signal))
}
module.exports={monitorTestProcess}
