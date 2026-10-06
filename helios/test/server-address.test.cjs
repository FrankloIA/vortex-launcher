const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),os=require('os'),path=require('path'),zlib=require('zlib')
const {updateServersDat,parse,encode,str}=require('../vortex/servers-dat.cjs')
const {verify,validate}=require('../vortex/server-address.cjs')
function string(name,value){return {name,type:8,value}}
test('servers.dat actualiza Vortex preservando iconos, etiquetas desconocidas y servidores ajenos, sin duplicar',t=>{
    const directory=fs.mkdtempSync(path.join(os.tmpdir(),'vortex-nbt-'));t.after(()=>fs.rmSync(directory,{recursive:true,force:true}))
    const entry=(name,ip)=>({type:10,value:[string('name',name),string('ip',ip),string('icon','original-icon')]})
    const root={type:10,value:[string('custom','conservar'),{name:'servers',type:9,value:{subtype:10,items:[entry('Vortex','ly06.astrolnodes.net:25622'),entry('Otro','example.org:25565')]}}]}
    const original=Buffer.concat([Buffer.from([10]),str(''),encode(root)]);fs.writeFileSync(path.join(directory,'servers.dat'),zlib.gzipSync(original))
    assert.equal(updateServersDat(directory,{hostname:'new.astrolnodes.net',port:25570}),true)
    const document=parse(zlib.gunzipSync(fs.readFileSync(path.join(directory,'servers.dat')))),items=document.root.value.find(n=>n.name==='servers').value.items
    assert.equal(items[0].value.find(n=>n.name==='ip').value,'new.astrolnodes.net:25570');assert.equal(items[0].value.find(n=>n.name==='icon').value,'original-icon');assert.equal(items[1].value.find(n=>n.name==='ip').value,'example.org:25565');assert.equal(document.root.value.find(n=>n.name==='custom').value,'conservar');assert.equal(updateServersDat(directory,{hostname:'new.astrolnodes.net',port:25570}),false)
})
test('instalación nueva crea el perfil y un servers.dat corrupto se conserva intacto',t=>{
    const directory=fs.mkdtempSync(path.join(os.tmpdir(),'vortex-nbt-'));t.after(()=>fs.rmSync(directory,{recursive:true,force:true}))
    updateServersDat(directory,{hostname:'vortex.example',port:25565});assert.equal(parse(fs.readFileSync(path.join(directory,'servers.dat'))).root.value[0].value.items.length,1)
    fs.writeFileSync(path.join(directory,'servers.dat'),'corrupt');assert.throws(()=>updateServersDat(directory,{hostname:'vortex.example',port:25565}));assert.equal(fs.readFileSync(path.join(directory,'servers.dat'),'utf8'),'corrupt')
})
test('rechaza direcciones de otro servidor y registros sin firma',()=>{
    assert.throws(()=>validate({serverId:'another',hostname:'example.org',port:25565}));assert.throws(()=>validate({serverId:'d2c7637e',hostname:'example.org/path',port:25565}));assert.throws(()=>verify({payload:'{}',signature:''}))
})
