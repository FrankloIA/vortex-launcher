const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),crypto=require('crypto')
const {ReleaseStore,hash}=require('../vortex/release-store.cjs'),{bundles}=require('../vortex/pack-bundles.cjs')
test('El cliente recibe una versión firmada, conserva Jarvis y rechaza una firma inválida',async t=>{
    const root=fs.mkdtempSync(path.join(os.tmpdir(),'vortex-client-')),store=new ReleaseStore(root),file=path.join(root,'source'),feed=require('../vortex/pack-feed.json'),oldKey=feed.publicKey,oldFetch=global.fetch
    t.after(()=>{feed.publicKey=oldKey;global.fetch=oldFetch;fs.rmSync(root,{recursive:true,force:true})})
    store.create('trial','1.0.2','test');fs.writeFileSync(file,'Mod Jarvis original personalizado');store.add('trial',0,file,'mods/jarvis.jar','managed');const envelope=store.publish('trial',1)
    feed.publicKey=fs.readFileSync(path.join(root,'public-signing-key.pem'),'utf8')
    const parts=bundles(root,store.getDraft('trial').files,path.join(root,'parts')),base='https://github.com/'+feed.repository+'/releases/download/',releaseUrl=base+'fixture/release.json',bytes=fs.readFileSync(path.join(root,'releases/1.0.2.json'))
    const pointer={schema:1,version:'1.0.2',releaseUrl,releaseSha256:hash(bytes),bundles:parts.map(p=>({url:base+'fixture/'+p.name,size:p.size,sha256:p.sha256}))}
    const payload=JSON.stringify(pointer),signed={payload,signature:crypto.sign(null,Buffer.from(payload),fs.readFileSync(path.join(root,'private-signing-key.pem'))).toString('base64')}
    global.fetch=async url=>new Response(url.endsWith('/stable.json')?JSON.stringify(signed):url.endsWith('/release.json')?bytes:fs.readFileSync(parts[0].file))
    const client=require('../vortex/official-release.cjs'),instances=path.join(root,'instances')
    assert((await client.checkOfficialRelease(instances)).pending)
    await client.prepareOfficialRelease(instances)
    assert.equal(fs.readFileSync(path.join(instances,'vortex-official/mods/jarvis.jar'),'utf8'),'Mod Jarvis original personalizado')
    assert.equal((await client.checkOfficialRelease(instances)).pending,false)
    signed.signature=Buffer.alloc(64).toString('base64');await assert.rejects(client.checkOfficialRelease(instances),/Firma del canal oficial/)
})
