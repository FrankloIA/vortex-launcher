const {test}=require('node:test'),assert=require('node:assert/strict')
const {Providers}=require('../vortex/providers.cjs')
test('El catálogo oculta proyectos instalados y modificaciones Jarvis sin cambiar sus archivos',async t=>{
    const fs=require('fs'),os=require('os'),path=require('path'),{ReleaseStore}=require('../vortex/release-store.cjs')
    const root=fs.mkdtempSync(path.join(os.tmpdir(),'vortex-catalog-')),store=new ReleaseStore(root)
    t.after(()=>fs.rmSync(root,{recursive:true,force:true}))
    store.create('draft','1.0.2','');const input=path.join(root,'input');fs.writeFileSync(input,'bytes personalizados de Jarvis')
    store.add('draft',0,input,'mods/custom.jar','managed');store.edit('draft',1,d=>{d.files[0].source={provider:'curseforge',projectId:123};d.files[0].customization={author:'Jarvis'}})
    const before=JSON.stringify(store.getDraft('draft')),file=store.getDraft('draft').files[0]
    fs.writeFileSync(path.join(root,'content-metadata.json'),JSON.stringify({[file.sha256]:{display:{title:'Original mod'}}}))
    t.mock.method(Providers.prototype,'request',async()=>({hits:[{project_id:'existing',title:'Original mod',categories:[]},{project_id:'new',title:'Nuevo',categories:[]}],total_hits:40}))
    const {server,url}=await require('../tools/admin-server.cjs').startAdmin({root,port:0,syncVersion:null})
    t.after(()=>new Promise(resolve=>server.close(resolve)))
    const response=await fetch(url+'/api/providers/catalog',{method:'POST',headers:{Origin:url,'Content-Type':'application/json'},body:JSON.stringify({id:'draft',provider:'modrinth',category:'mods',query:'',offset:0})})
    assert.equal(response.status,200);const result=await response.json();assert.deepEqual(result.items.map(i=>i.projectId),['new']);assert.equal(result.nextOffset,20)
    assert.equal(JSON.stringify(store.getDraft('draft')),before);assert.equal(fs.readFileSync(path.join(root,'blobs',file.sha256),'utf8'),'bytes personalizados de Jarvis')
})
test('Modrinth navega sin texto y mantiene destino, orden y paginación',async()=>{
    const p=new Providers('.'),calls=[]
    p.request=async(provider,route)=>{calls.push(new URL('https://example.test/'+route));return {hits:[],total_hits:65}}
    const result=await p.search('modrinth','','mods',{minecraft:'1.21.1',loader:'neoforge'},{offset:20,paginated:true})
    const params=calls[0].searchParams
    assert.equal(params.get('offset'),'20');assert.equal(params.get('index'),'downloads')
    assert.deepEqual(JSON.parse(params.get('facets')),[['project_type:mod'],['versions:1.21.1'],['categories:neoforge']]);assert.equal(result.nextOffset,40)
    await p.search('modrinth','agua','resourcepacks',{minecraft:'1.21.1',loader:'neoforge'},{offset:0,paginated:true})
    assert.equal(calls[1].searchParams.get('index'),'relevance');assert(!calls[1].searchParams.get('facets').includes('neoforge'))
})
test('CurseForge pagina con Minecraft y loader y respeta el límite del catálogo',async()=>{
    const p=new Providers('.'),calls=[]
    p.request=async(provider,route)=>{calls.push(new URL('https://example.test/'+route));return {data:[],pagination:{totalCount:20000}}}
    const result=await p.search('curseforge','','mods',{minecraft:'1.21.1',loader:'neoforge'},{offset:9980,paginated:true})
    const params=calls[0].searchParams
    assert.equal(params.get('index'),'9980');assert.equal(params.get('gameVersion'),'1.21.1');assert.equal(params.get('modLoaderType'),'6');assert.equal(params.get('sortField'),'6');assert.equal(result.nextOffset,null)
    await assert.rejects(p.search('curseforge','','mods',undefined,{offset:10000,paginated:true}),/inválida/)
    await assert.rejects(p.search('modrinth','','mods',undefined,{offset:-1}),/inválida/)
})
