const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),os=require('os')
const {ReleaseStore}=require('../vortex/release-store.cjs'),{startAdmin}=require('../tools/admin-server.cjs')
test('Sincronizar el launcher conserva todo el contenido y no reescribe el historial anterior',t=>{
    const root=fs.mkdtempSync(path.join(os.tmpdir(),'vortex-sync-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));const store=new ReleaseStore(root),input=path.join(root,'input')
    store.create('active','1.0.1','test');fs.writeFileSync(input,'personalizado Jarvis');store.add('active',0,input,'mods/example.jar','managed');store.publish('active',1);store.setWorkspace({activeId:'active'})
    const files=store.getDraft('active').files,before=fs.readFileSync(path.join(root,'releases/1.0.1.json'),'utf8')
    store.synchronizeLauncherVersion('1.0.2');assert.equal(store.getDraft('active').version,'1.0.2');assert.deepEqual(store.getDraft('active').files,files);assert.equal(fs.readFileSync(path.join(root,'releases/1.0.1.json'),'utf8'),before)
    const revision=store.getDraft('active').revision;store.synchronizeLauncherVersion('1.0.2');assert.equal(store.getDraft('active').revision,revision)
    store.edit('active',revision,d=>{d.version='1.0.3'});store.synchronizeLauncherVersion('1.0.2');assert.equal(store.getDraft('active').version,'1.0.3')
})
test('El historial de Crear incluye exclusivamente publicaciones oficiales',async t=>{
    const root=fs.mkdtempSync(path.join(os.tmpdir(),'vortex-history-')),store=new ReleaseStore(root),input=path.join(root,'input');fs.writeFileSync(input,'contenido')
    for(const [id,version] of [['official','1.0.1'],['trial','1.0.2']]) {store.create(id,version,'test');store.add(id,0,input,'mods/example.jar','managed');store.publish(id,1)}
    fs.writeFileSync(path.join(root,'official-releases.json'),JSON.stringify({'1.0.1':'registro'}))
    const {server,url}=await startAdmin({root,port:0,syncVersion:null});t.after(async()=>{await new Promise(r=>server.close(r));fs.rmSync(root,{recursive:true,force:true})})
    const state=await(await fetch(url+'/api/state')).json();assert.deepEqual(state.history.map(r=>r.version),['1.0.1']);assert(state.drafts.some(d=>d.version==='1.0.2'))
})
