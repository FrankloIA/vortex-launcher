const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),os=require('os'),path=require('path')
const {archive,plan,cleanup}=require('../vortex/release-retention.cjs'),{hash}=require('../vortex/release-store.cjs')
test('Conserva tres oficiales, el canal, el instalador vigente, borradores y versiones desconocidas',async t=>{
    const root=fs.mkdtempSync(path.join(os.tmpdir(),'vortex-retention-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}))
    fs.mkdirSync(path.join(root,'releases'))
    const releases=['1.0.4','1.0.3 fixed','1.0.3','1.0.2','1.0.1'].map(version=>({version,publishedAt:'2026-10-06',notes:'Configuración cambiada',files:[{path:'config/test.json',sha256:'a'.repeat(64)}]}))
    for(const r of releases) fs.writeFileSync(path.join(root,'releases',r.version+'.json'),JSON.stringify(r))
    const store={root,releases:()=>releases,isOfficial:()=>true}
    const tags=releases.map(r=>'vortex-pack-'+r.version.replace(/ /g,'-')+'-'+hash(fs.readFileSync(path.join(root,'releases',r.version+'.json'))).slice(0,12))
    const remote=[...tags,'v1.0.1','v1.0.2','v1.0.3','v1.0.4','vortex-pack-stable','unknown'].map(tag_name=>({tag_name,draft:false}))
    remote.find(r=>r.tag_name===tags[4]).draft=true
    assert.deepEqual(plan(store,remote,'v1.0.1'),[tags[3],'v1.0.2'])
    const file=path.join(root,'history.md');fs.writeFileSync(file,'# Historial\n');archive(store,file);const once=fs.readFileSync(file,'utf8');archive(store,file);assert.equal(fs.readFileSync(file,'utf8'),once);assert(once.includes('config/test.json'));assert(once.includes('a'.repeat(64)))
    const calls=[];await cleanup(store,async args=>{calls.push(args);if(args[0]==='api')return JSON.stringify(args[1].endsWith('/latest')?{tag_name:'v1.0.1'}:[remote]);return ''},file)
    assert.equal(calls.filter(c=>c[0]==='release').length,2);assert(calls.every(c=>!c.includes('--cleanup-tag')))
    await assert.rejects(cleanup(store,async()=>{throw Error('No debe acceder a GitHub')},path.join(root,'missing.md')),/Falta el historial/)
    assert.deepEqual(plan({...store,releases:()=>releases.slice(0,2)},remote,'v1.0.4'),[])
})
