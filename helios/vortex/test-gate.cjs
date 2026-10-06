const fs=require('fs'),path=require('path'),crypto=require('crypto')
const {ReleaseStore,hash,verify}=require('./release-store.cjs')
function launcherHash() {
    const root=process.env.VORTEX_SOURCE_ROOT || path.resolve(__dirname,'..'),files=['index.js','package.json']
    const walk=directory=>{for(const entry of fs.readdirSync(path.join(root,directory),{withFileTypes:true})) {const relative=path.join(directory,entry.name);if(entry.isDirectory())walk(relative);else if(/\.(js|cjs|ejs|css|json|toml)$/.test(entry.name))files.push(relative)}}
    walk('app');walk('vortex');const digest=crypto.createHash('sha256')
    for(const file of files.sort()) {digest.update(file);digest.update(fs.readFileSync(path.join(root,file)))}
    return digest.digest('hex')
}
class TestGate {
    constructor(root) {this.root=root;this.store=new ReleaseStore(root)}
    file(id) {if(!/^[a-f0-9-]{36}$/.test(id || '')) throw Error('Prueba inválida');return path.join(this.root,'test-runs',id+'.json')}
    read(id) {return JSON.parse(fs.readFileSync(this.file(id)))}
    write(run) {fs.mkdirSync(path.dirname(this.file(run.id)),{recursive:true});const temp=this.file(run.id)+'.'+crypto.randomUUID()+'.tmp';fs.writeFileSync(temp,JSON.stringify(run,null,2));fs.renameSync(temp,this.file(run.id));return run}
    mutate(id,change) {
        const lock=this.file(id)+'.lock';let fd
        for(let attempt=0;attempt<100;attempt++) {try {fd=fs.openSync(lock,'wx');break} catch(error) {if(error.code!=='EEXIST')throw error;Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,10)}}
        if(fd===undefined) throw Error('La prueba está ocupada; su publicación permanece bloqueada')
        try {const run=this.read(id);change(run);return this.write(run)} finally {fs.closeSync(fd);fs.unlinkSync(lock)}
    }
    snapshot(name) {
        const draft=this.store.getDraft(name), channel=JSON.parse(fs.readFileSync(path.join(this.root,'channels/test.json')))
        const bytes=fs.readFileSync(path.join(this.root,'releases',channel.version+'.json'))
        if(hash(bytes)!==channel.releaseSha256) throw Error('La publicación de pruebas está alterada')
        const manifest=verify(JSON.parse(bytes),fs.readFileSync(path.join(this.root,'public-signing-key.pem')))
        if(channel.version!==draft.version || manifest.revision!==draft.revision) throw Error('Publica los últimos cambios en pruebas antes de probar o publicar oficialmente')
        return {version:draft.version,revision:draft.revision,releaseSha256:channel.releaseSha256,launcherHash:launcherHash()}
    }
    prepare(name) {
        const run={id:crypto.randomUUID(),draftId:name,...this.snapshot(name),status:'prepared',createdAt:Date.now(),account:'Mystwer'}
        this.write(run);this.store.setWorkspace({testRunId:run.id});return run
    }
    fail(id,reason) {return this.mutate(id,run=>{run.status='failed';run.reason=reason})}
    launcherStarted(id,pid) {return this.mutate(id,run=>{run.launcherPid=pid})}
    launcherClosed(id) {return this.mutate(id,run=>{if(['awaitingApproval','passed'].includes(run.status))run.launcherClosedNormally=true;else if(['prepared','running'].includes(run.status)){run.status='failed';run.reason='El launcher se cerró antes de completar la prueba'}})}
    gameStarted(id,pid,instance,account,launcherVersion) {
        return this.mutate(id,run=>{
        if(run.status!=='prepared' || account?.toLowerCase()!=='mystwer') throw Error('Abre Probar versión desde el panel con Mystwer antes de iniciar otra prueba')
        if(launcherVersion && launcherVersion!==run.version.replace(/ fixed$/,'')) throw Error('El launcher y la versión del panel no coinciden; vuelve a preparar la prueba')
        this.snapshot(run.draftId)
        run.status='running';run.gamePid=pid;run.instance=instance;run.startedAt=Date.now();run.ready=false
        })
    }
    ready(id) {return this.mutate(id,run=>{if(run.status==='running')run.ready=true})}
    finished(id,code,signal) {
        return this.mutate(id,run=>{
        if(run.status!=='running') return
        const crashFiles=[path.join(run.instance,'crash-reports'),run.instance].flatMap(folder=>fs.existsSync(folder)?fs.readdirSync(folder).filter(n=>folder.endsWith('crash-reports') || /^hs_err_pid.*\.log$/.test(n)).map(n=>path.join(folder,n)):[])
        const crash=crashFiles.some(f=>fs.statSync(f).isFile() && fs.statSync(f).mtimeMs>=run.startedAt)
        if(code!==0 || signal || crash || !run.ready || Date.now()-run.startedAt<60000) {run.status='failed';run.reason=crash?'Se generó un informe de crash':code!==0 || signal?'El cliente terminó con error':'La prueba no llegó a cargar el juego durante al menos 60 segundos';return}
        run.status='awaitingApproval';run.finishedAt=Date.now()
        })
    }
    status(name) {
        const id=this.store.workspace().testRunId
        if(!id || !fs.existsSync(this.file(id))) return {status:'untested',eligible:false}
        let run=this.read(id)
        if(run.draftId!==name) return {status:'untested',eligible:false}
        try {const snapshot=this.snapshot(name);if(snapshot.releaseSha256!==run.releaseSha256 || snapshot.launcherHash!==run.launcherHash) return {...run,status:'outdated',eligible:false}} catch {return {...run,status:'outdated',eligible:false}}
        if(['prepared','running'].includes(run.status)) {
            const pids=run.status==='running'?[run.launcherPid,run.gamePid]:[run.launcherPid]
            try {for(const pid of pids) {if(pid) process.kill(pid,0);else if(Date.now()-run.createdAt>30000) throw Error('No iniciado')}} catch {run=this.fail(id,'La prueba se interrumpió o el proceso dejó de responder')}
        }
        if(['awaitingApproval','passed'].includes(run.status) && run.launcherPid && !run.launcherClosedNormally) {
            try {process.kill(run.launcherPid,0)} catch {run=this.fail(id,'El launcher terminó de forma inesperada')}
        }
        return {...run,eligible:run.status==='passed' && run.launcherClosedNormally===true}
    }
    approve(name,id) {
        const run=this.status(name)
        if(run.id!==id || run.status!=='awaitingApproval') throw Error('La prueba debe arrancar y cerrar correctamente antes de confirmarla')
        if(!run.launcherClosedNormally) throw Error('Cierra también el launcher de pruebas antes de confirmar el resultado')
        return this.mutate(id,current=>{if(current.status!=='awaitingApproval')throw Error('La prueba cambió; revisa el resultado');current.status='passed';current.approvedAt=Date.now()})
    }
    assertPassed(name) {const run=this.status(name);if(!run.eligible) throw Error('Prueba esta revisión, cierra el juego sin fallos y confirma el resultado antes de publicar oficialmente');return run}
}
function currentGate() {return process.env.VORTEX_TEST_RUN ? new TestGate(process.env.VORTEX_ADMIN_ROOT || path.resolve(__dirname,'../.runtime/pack-admin')) : null}
module.exports={TestGate,currentGate,launcherHash}
