const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),os=require('os'),path=require('path')
const {AstrolNodesApi}=require('../vortex/astrolnodes-api.cjs')
const {HostingStatus}=require('../vortex/hosting-status.cjs')
const {ServerWorkspace}=require('../vortex/server-workspace.cjs')
const {ReleaseStore,hash}=require('../vortex/release-store.cjs')
const {launcherServerStatus}=require('../vortex/launcher-server-status.cjs')
const {startAdmin}=require('../tools/admin-server.cjs')
const Zip=require('adm-zip')
function fixture(t) {
    const root=fs.mkdtempSync(path.join(os.tmpdir(),'vortex-hosting-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}))
    const api={files:new Map([['/config/settings.json',Buffer.from('{"enabled":true}')],['/mods/base.jar',Buffer.from('old')]]),calls:[],state:'running',backupOk:true,corrupt:false,failApply:false,
        configured:()=>true,details:async()=>({name:'Fixture'}),status:async()=>({state:api.state}),sleep:async()=>{},warn:async()=>api.calls.push('warn'),power:async signal=>{api.calls.push(signal);api.state=signal==='stop'?'offline':'running'},waitOffline:async()=>assert.equal(api.state,'offline'),
        list:async directory=>{const prefix=directory==='/'?'/':directory+'/';const result=new Map();for(const [name,data]of api.files){if(!name.startsWith(prefix))continue;const rest=name.slice(prefix.length),first=rest.split('/')[0];result.set(first,{name:first,is_file:!rest.includes('/'),size:rest.includes('/')?0:data.length,modified_at:'fixture'})}return [...result.values()]},
        download:async name=>{if(!api.files.has(name))throw Error('HTTP 404');return api.files.get(name)},
        backup:async()=>{api.calls.push('backup');return {uuid:'11111111-1111-1111-1111-111111111111'}},backupStatus:async()=>({completed_at:'now',is_successful:api.backupOk}),
        mkdir:async name=>api.calls.push('mkdir:'+name),upload:async(dir,name,data)=>{api.calls.push('upload');api.files.set(dir+'/'+name,api.corrupt?Buffer.from('corrupt'):data)},
        rename:async(from,to)=>{if(api.failApply && from.includes('vortex-stage') && to==='/mods/base.jar')throw Error('Falló la aplicación');if(!api.files.has(from))throw Error('Missing '+from);api.files.set(to,api.files.get(from));api.files.delete(from);api.calls.push('rename')}
    }
    const store=new ReleaseStore(root);store.create('work','1.0.2','fixture');store.setWorkspace({activeId:'work'})
    return {root,api,store,workspace:new ServerWorkspace(root,api)}
}
test('Pterodactyl usa las rutas correctas y no envía credenciales a URLs de transferencia ajenas',async()=>{
    const calls=[],api=new AstrolNodesApi({token:'fixture-secret',fetcher:async(url,options)=>{calls.push({url:String(url),options});return new Response(JSON.stringify({data:[{attributes:{name:'a.jar',is_file:true}}]}))}})
    assert.equal((await api.list('/mods'))[0].name,'a.jar');assert.match(calls[0].url,/\/files\/list\?directory=%2Fmods$/)
    assert.equal(calls[0].options.redirect,'error');assert.equal(calls[0].options.headers.Authorization,'Bearer fixture-secret')
    assert.throws(()=>api.signedUrl('https://other.example/file?token=x'));assert.throws(()=>api.signedUrl('http://ly06.astrolnodes.net/file'));await assert.rejects(api.list('/mods/../world'))
})
test('el reinicio espera el aviso; iniciar un servidor apagado no envía comandos al chat',async()=>{
    const calls=[],api=new AstrolNodesApi({token:'fixture',sleep:async ms=>calls.push(ms)});api.status=async()=>({state:'running'});api.command=async()=>calls.push('command');api.power=async s=>calls.push(s)
    await api.restart();assert.deepEqual(calls,['command','command','command',10000,'restart']);calls.length=0;api.status=async()=>({state:'offline'});await api.restart();assert.deepEqual(calls,['start'])
})
test('los jugadores proceden de Minecraft y el estado running no inventa disponibilidad del juego',async()=>{
    const api={configured:()=>true,details:async()=>({}),status:async()=>({state:'running',memory:10})}
    const yes=await new HostingStatus(api,{ping:async()=>({players:{online:3,max:20}})}).get();assert.equal(yes.online,true);assert.deepEqual(yes.players,{online:3,max:20})
    const no=await new HostingStatus(api,{ping:async()=>{throw Error('timeout')}}).get();assert.equal(no.online,false);assert.equal(no.state,'running');assert.equal(no.players,null)
})
test('launcher utiliza solo el resumen de su servidor y consulta Minecraft si el panel falla o devuelve otro servidor',async()=>{
    const summary={hostname:'fixture',port:25565,checkedAt:Date.now(),online:true,players:{online:2,max:20},state:'running'}
    let pings=0;const ping=async()=>{pings++;return {players:{online:4,max:20}}}
    const result=await launcherServerStatus(767,'fixture',25565,{fetcher:async()=>new Response(JSON.stringify(summary)),ping});assert.equal(result.players.online,2);assert.equal(pings,0)
    await launcherServerStatus(767,'another',25565,{fetcher:async()=>new Response(JSON.stringify(summary)),ping});assert.equal(pings,1)
})
test('borrador del servidor conserva bytes y notas, rechaza edición sin versión y configura autosave sin aplicar a producción',async t=>{
    const {workspace,api,store}=fixture(t);await workspace.inventory();await workspace.add('work',0,'config/settings.json',Buffer.from('{"enabled":false}'))
    assert.equal(api.files.get('/config/settings.json').toString(),'{"enabled":true}');assert.equal(workspace.view('work').changes.length,1);assert.match(store.getDraft('work').automaticNotes[0].text,/Servidor/)
    workspace.autosave('work',1,'config/settings.json','{partial');assert.equal((await workspace.config('work','config/settings.json')).text,'{partial');await assert.rejects(workspace.add('work',1,'mods/x.jar',Buffer.from('x')),/versión cambió/)
    store.setWorkspace({activeId:null});await assert.rejects(workspace.remove('work',2,'mods/base.jar'),/Crea una versión/)
})
test('backup fallido mantiene todos los archivos originales y no inicia subidas',async t=>{
    const {workspace,api}=fixture(t);await workspace.inventory();await workspace.add('work',0,'mods/base.jar',Buffer.from('new'));api.backupOk=false
    await assert.rejects(workspace.deploy('work',1,{}),/backup falló/);assert.equal(api.files.get('/mods/base.jar').toString(),'old');assert.ok(!api.calls.includes('upload'))
})
test('cambio externo aborta el despliegue antes de mover archivos',async t=>{
    const {workspace,api}=fixture(t);await workspace.inventory();await workspace.add('work',0,'mods/base.jar',Buffer.from('new'));api.files.set('/mods/base.jar',Buffer.from('other'))
    await assert.rejects(workspace.deploy('work',1,{}),/Otro proceso/);assert.equal(api.files.get('/mods/base.jar').toString(),'other');assert.ok(!api.calls.includes('rename'))
})
test('subida corrupta mantiene el original; fallo durante la aplicación recupera el original',async t=>{
    const {workspace,api}=fixture(t);await workspace.inventory();await workspace.add('work',0,'mods/base.jar',Buffer.from('new'));api.corrupt=true
    await assert.rejects(workspace.deploy('work',1,{}),/hash/);assert.equal(api.files.get('/mods/base.jar').toString(),'old');api.corrupt=false;api.failApply=true
    await assert.rejects(workspace.deploy('work',1,{id:'retry'}),/originales restaurados/);assert.equal(api.files.get('/mods/base.jar').toString(),'old')
})
test('despliegue verificado guarda backup y permite preparar recuperación sin cambiar mundos',async t=>{
    const {workspace,api}=fixture(t);await workspace.inventory();await workspace.add('work',0,'mods/base.jar',Buffer.from('new'))
    const receipt=await workspace.deploy('work',1,{id:'success'});assert.equal(api.files.get('/mods/base.jar').toString(),'new');assert.equal(receipt.started,true);assert.equal(workspace.view('work').changes.length,0);workspace.assertOfficial('work')
    await workspace.prepareRollback('work',1);assert.equal(workspace.view('work').changes[0].after,hash(Buffer.from('old')));assert.ok(api.calls.indexOf('backup')<api.calls.indexOf('upload'));assert.equal(api.files.get('/mods/base.jar').toString(),'new')
})
test('despliegue añade contenido a una carpeta que todavía no existe',async t=>{
    const {workspace,api}=fixture(t);await workspace.inventory();await workspace.add('work',0,'resourcepacks/new.zip',Buffer.from('local pack'))
    const originalList=api.list.bind(api);let created=false
    api.list=async directory=>{if(directory==='/resourcepacks' && !created)throw Error('HTTP 404');return originalList(directory)}
    const originalMkdir=api.mkdir.bind(api);api.mkdir=async directory=>{if(directory==='/resourcepacks')created=true;return originalMkdir(directory)}
    await workspace.deploy('work',1,{id:'new-directory'});assert.equal(api.files.get('/resourcepacks/new.zip').toString(),'local pack');assert.equal(created,true)
})
test('la identificación conserva archivos sin metadatos como protegidos sin abortar el inventario',async t=>{
    const {workspace}=fixture(t);await workspace.inventory()
    const result=await workspace.analyze({identify:async()=>{},get:()=>({source:{provider:'modrinth',projectId:'example'}})},{})
    assert.equal(result.identified,1);assert.equal(result.protected,1);assert.match(workspace.view().files.find(f=>f.path==='mods/base.jar').protection.reason,/Pendiente/)
})
test('inspección de un mod no convierte metadatos genéricos en ambos ni referencias cliente en clasificación definitiva',()=>{
    const zip=new Zip();zip.addFile('META-INF/neoforge.mods.toml',Buffer.from('[[mods]]\nmodId="example"'))
    const review=require('../vortex/mod-destination.cjs').inspectMod(zip.toBuffer());assert.equal(review.destination,'unknown');assert.equal(review.verified,false)
})
test('API del panel reconoce parámetros del listado, exige origen para credenciales y no devuelve la clave',async t=>{
    const {root,api}=fixture(t),{server,url}=await startAdmin({root,port:0,hostingApi:api,syncVersion:null});t.after(()=>new Promise(resolve=>server.close(resolve)))
    const response=await fetch(url+'/api/server/files?directory=%2Fmods');assert.equal(response.status,200);assert.equal((await response.json()).data[0].name,'base.jar')
    assert.equal((await fetch(url+'/api/server/connect',{method:'POST',headers:{'Content-Type':'application/json',Origin:'http://evil.example'},body:JSON.stringify({token:'ptlc_abcdefghijklmnopqrstuvwxyz'})})).status,403)
    const r=await fetch(url+'/api/server/connect',{method:'POST',headers:{'Content-Type':'application/json',Origin:url},body:JSON.stringify({token:'ptlc_abcdefghijklmnopqrstuvwxyz'})});assert.equal(r.status,200);assert.ok(!(await r.text()).includes('ptlc_'))
})
