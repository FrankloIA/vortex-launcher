const {test}=require('node:test')
const assert=require('node:assert/strict')
const crypto=require('node:crypto')
const {Providers}=require('../vortex/providers.cjs')
test('descarga sigue CDN oficial y rechaza redirecciones externas antes de solicitarlas',async t=>{
    const original=global.fetch;t.after(()=>{global.fetch=original})
    const bytes=Buffer.from('mod'),file={url:'https://edge.forgecdn.net/a.jar',size:3,hashes:{sha1:crypto.createHash('sha1').update(bytes).digest('hex')}}
    let calls=[]
    global.fetch=async url=>{calls.push(String(url));return calls.length===1?new Response(null,{status:302,headers:{location:'https://mediafilez.forgecdn.net/a.jar'}}):new Response(bytes)}
    assert.deepEqual(await new Providers('.').download(file),bytes)
    assert.equal(calls.length,2)
    calls=[]
    global.fetch=async url=>{calls.push(String(url));return new Response(null,{status:302,headers:{location:'https://example.com/a.jar'}})}
    await assert.rejects(new Providers('.').download(file),/no permitido/)
    assert.equal(calls.length,1)
    global.fetch=async()=>new Response(null,{status:302,headers:{location:'/a.jar'}})
    await assert.rejects(new Providers('.').download(file),/excesiva/)
})
