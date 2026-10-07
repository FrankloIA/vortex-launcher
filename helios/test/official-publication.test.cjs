const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),os=require('os'),path=require('path')
const {ReleaseStore,hash}=require('../vortex/release-store.cjs'),{TestGate}=require('../vortex/test-gate.cjs')
const {GithubPublisher}=require('../vortex/github-publisher.cjs'),{bundles,unpack}=require('../vortex/pack-bundles.cjs')
function setup(t) {
    const root=fs.mkdtempSync(path.join(os.tmpdir(),'vortex-official-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}))
    const store=new ReleaseStore(root),gate=new TestGate(root),input=path.join(root,'input');store.create('trial','1.0.1','test');store.setWorkspace({activeId:'trial'})
    fs.writeFileSync(input,'Jarvis personalizado');store.add('trial',0,input,'mods/example.jar','managed');store.publish('trial',1)
    const run=()=>{const r=gate.prepare('trial');gate.launcherStarted(r.id,process.pid);gate.gameStarted(r.id,process.pid,path.join(root,'game'),'Mystwer');gate.ready(r.id);const current=gate.read(r.id);current.startedAt=Date.now()-61000;gate.write(current);return r}
    return {root,store,gate,input,run}
}
test('La publicación exige arranque, salida limpia y confirmación; cualquier cambio invalida la prueba',t=>{
    const s=setup(t)
    assert.throws(()=>s.store.promote('trial',1),/Prueba esta revisión/)
    let run=s.run();s.gate.finished(run.id,1,null);assert.equal(s.gate.status('trial').status,'failed');assert.throws(()=>s.gate.approve('trial',run.id))
    run=s.run();s.gate.finished(run.id,0,null);assert.equal(s.gate.status('trial').status,'awaitingApproval');assert.throws(()=>s.store.promote('trial',1))
    s.gate.launcherClosed(run.id);s.gate.approve('trial',run.id);assert(s.gate.status('trial').eligible)
    s.store.edit('trial',1,d=>{d.notes='Otro cambio'});assert.equal(s.gate.status('trial').status,'outdated');assert.throws(()=>s.store.promote('trial',2))
})
test('Un informe de crash, una señal o cerrar antes de cargar mantiene la publicación bloqueada',t=>{
    const s=setup(t);let run=s.run();fs.mkdirSync(path.join(s.root,'game/crash-reports'),{recursive:true});fs.writeFileSync(path.join(s.root,'game/crash-reports/crash.txt'),'fallo')
    s.gate.finished(run.id,0,null);assert.equal(s.gate.status('trial').status,'failed')
    run=s.run();s.gate.finished(run.id,0,'SIGTERM');assert.equal(s.gate.status('trial').status,'failed')
    run=s.gate.prepare('trial');s.gate.launcherStarted(run.id,process.pid);s.gate.gameStarted(run.id,process.pid,path.join(s.root,'game'),'Mystwer');s.gate.finished(run.id,0,null);assert.equal(s.gate.status('trial').status,'failed')
})
test('Publicar en GitHub actualiza el canal al final y bloquea también versiones oficiales anteriores',async t=>{
    const s=setup(t),run=s.run();s.gate.finished(run.id,0,null);s.gate.launcherClosed(run.id);s.gate.approve('trial',run.id)
    const calls=[],publisher=new GithubPublisher(s.root,async args=>{calls.push(args);if(args[0]==='api')return JSON.stringify({private:false,permissions:{push:true}});return ''},fs.readFileSync(path.join(s.root,'public-signing-key.pem'),'utf8'),{historyFile:require('path').join(s.root,'history.md')})
    const result=await publisher.publish('trial',1)
    assert.equal(result.published,'1.0.1');assert.equal(s.store.workspace().activeId,null)
    assert.equal(calls.at(-1)[2],'vortex-pack-stable');assert(calls.at(-1).some(a=>a.endsWith('stable.json')))
    assert.throws(()=>s.store.edit('trial',1,d=>{d.notes='no'}),/crear una nueva versión/)
    fs.writeFileSync(path.join(s.root,'channels/stable.json'),JSON.stringify({version:'1.0.2'}))
    assert.throws(()=>s.store.edit('trial',1,d=>{d.notes='no'}),/crear una nueva versión/)
})
test('Si GitHub falla durante la subida no se publica el canal estable',async t=>{
    const s=setup(t),run=s.run();s.gate.finished(run.id,0,null);s.gate.launcherClosed(run.id);s.gate.approve('trial',run.id)
    const publisher=new GithubPublisher(s.root,async args=>{if(args[0]==='api')return JSON.stringify({private:false,permissions:{push:true}});if(args[1]==='upload')throw Error('Subida fallida');return ''},fs.readFileSync(path.join(s.root,'public-signing-key.pem'),'utf8'))
    await assert.rejects(publisher.publish('trial',1),/Subida fallida/)
    assert(!fs.existsSync(path.join(s.root,'channels/stable.json')));assert.equal(s.store.workspace().activeId,'trial')
})
test('Los paquetes preservan los archivos exactos y rechazan corrupción y truncamiento',t=>{
    const s=setup(t),files=s.store.getDraft('trial').files,out=path.join(s.root,'parts'),blobs=path.join(s.root,'downloaded')
    const parts=bundles(s.root,files,out,1000);unpack(parts[0].file,{files},blobs)
    assert.equal(hash(fs.readFileSync(path.join(blobs,files[0].sha256))),files[0].sha256)
    const bytes=fs.readFileSync(parts[0].file);fs.writeFileSync(parts[0].file,bytes.subarray(0,bytes.length-1));assert.throws(()=>unpack(parts[0].file,{files},blobs),/incompleto/)
})
test('Las notas registran automáticamente añadido, cambio y retirada sin duplicar las notas manuales',t=>{
    const s=setup(t);fs.writeFileSync(s.input,'corregido');s.store.add('trial',1,s.input,'mods/example.jar','managed');s.store.remove('trial',2,'mods/example.jar')
    assert.deepEqual(s.store.getDraft('trial').automaticNotes.map(n=>n.text),['Añadido: mods/example.jar','Actualizado o sustituido: mods/example.jar','Retirado: mods/example.jar'])
})
test('Publicar oficialmente también publica el instalador de la versión como actualización del launcher',async t=>{
    const s=setup(t),run=s.run();s.gate.finished(run.id,0,null);s.gate.launcherClosed(run.id);s.gate.approve('trial',run.id)
    const installer=path.join(s.root,'Vortex Launcher-setup-1.0.1.exe');fs.writeFileSync(installer,'instalador de prueba')
    const calls=[],gh=async args=>{calls.push(args);if(args[0]==='api'){if(args[1].includes('/releases/tags/'))throw Error('404');return JSON.stringify({private:false,permissions:{push:true}})}return ''}
    const publisher=new GithubPublisher(s.root,gh,fs.readFileSync(path.join(s.root,'public-signing-key.pem'),'utf8'),{historyFile:path.join(s.root,'history.md'),launcherBuild:()=>({version:'1.0.1',installer,sha256:hash(fs.readFileSync(installer))})})
    await publisher.publish('trial',1)
    assert(calls.some(args=>args[1]==='upload' && args[2]==='v1.0.1' && args.includes(installer)))
    assert.equal(calls.at(-1)[2],'v1.0.1');assert(calls.at(-1).includes('--latest=true'))
})

test('sin canal de pruebas informa el paso necesario sin mostrar ENOENT',t=>{const s=setup(t);fs.unlinkSync(path.join(s.root,'channels/test.json'));assert.throws(()=>s.gate.snapshot('trial'),/Publica primero esta versión en pruebas/)})
