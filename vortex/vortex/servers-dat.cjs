const fs=require('fs'),path=require('path'),zlib=require('zlib'),crypto=require('crypto')
// Conserva etiquetas desconocidas, iconos y entradas ajenas; Java usa NBT big endian.
function parse(data) {
    let at=0
    const take=n=>{if(!Number.isSafeInteger(n)||n<0||at+n>data.length)throw Error('servers.dat truncado');const start=at;at+=n;return data.subarray(start,at)}
    const number=()=>take(4).readInt32BE(),string=()=>take(take(2).readUInt16BE()).toString('utf8')
    function payload(type,depth=0){if(depth>64)throw Error('NBT demasiado profundo');const start=at;let value
        if(type===8)value=string()
        else if(type===9){const subtype=take(1)[0],length=number();if(length<0||length>100000)throw Error('Lista NBT inválida');value={subtype,items:Array.from({length},()=>payload(subtype,depth+1))}}
        else if(type===10){value=[];while(true){const t=take(1)[0];if(!t)break;const name=string();value.push({name,type:t,...payload(t,depth+1)})}}
        else if([7,11,12].includes(type)){const count=number();take(count*({7:1,11:4,12:8}[type]))}
        else {const size={1:1,2:2,3:4,4:8,5:4,6:8}[type];if(!size)throw Error('Etiqueta NBT inválida');take(size)}
        return {type,value,raw:data.subarray(start,at)}
    }
    if(take(1)[0]!==10)throw Error('Raíz NBT inválida');const name=string(),root=payload(10);if(at!==data.length)throw Error('NBT con datos sobrantes');return {name,root}
}
function str(value){const b=Buffer.from(value),length=Buffer.alloc(2);if(b.length>65535)throw Error('Texto NBT demasiado grande');length.writeUInt16BE(b.length);return Buffer.concat([length,b])}
function encode(node){if(node.raw)return node.raw;if(node.type===8)return str(node.value);if(node.type===10)return Buffer.concat([...node.value.map(n=>Buffer.concat([Buffer.from([n.type]),str(n.name),encode(n)])),Buffer.from([0])]);if(node.type===9){const length=Buffer.alloc(4);length.writeInt32BE(node.value.items.length);return Buffer.concat([Buffer.from([node.value.subtype]),length,...node.value.items.map(encode)])}throw Error('Etiqueta sin bytes originales')}
function updateServersDat(instance,address,previous=['ly06.astrolnodes.net:25622']) {
    const file=path.join(instance,'servers.dat'),ip=address.hostname+':'+address.port
    let bytes=fs.existsSync(file)?fs.readFileSync(file):null;if(bytes?.length>8*1048576)throw Error('servers.dat demasiado grande')
    const gzip=bytes?.[0]===31 && bytes?.[1]===139,doc=bytes?parse(gzip?zlib.gunzipSync(bytes,{maxOutputLength:8*1048576}):bytes):{name:'',root:{type:10,value:[]}}
    let list=doc.root.value.find(n=>n.name==='servers');if(!list){list={name:'servers',type:9,value:{subtype:10,items:[]}};doc.root.value.push(list)}
    if(list.type!==9 || list.value.subtype!==10)throw Error('Lista de servidores inválida')
    let found=false,changed=!bytes
    for(const entry of list.value.items){const name=entry.value.find(n=>n.name==='name' && n.type===8)?.value,current=entry.value.find(n=>n.name==='ip' && n.type===8);if(!/^Vortex\b|^Servidor Vortex\b/i.test(name || '') && !previous.includes(current?.value))continue;found=true;if(current?.value!==ip){if(current){current.value=ip;delete current.raw}else entry.value.push({name:'ip',type:8,value:ip});delete entry.raw;changed=true}}
    if(!found){list.value.items.push({type:10,value:[{name:'name',type:8,value:'Servidor Vortex'},{name:'ip',type:8,value:ip}]});changed=true}
    if(!changed)return false;delete doc.root.raw;delete list.raw;let output=Buffer.concat([Buffer.from([10]),str(doc.name),encode(doc.root)]);if(gzip)output=zlib.gzipSync(output)
    fs.mkdirSync(instance,{recursive:true});if(bytes)fs.writeFileSync(file+'.vortex-backup',bytes);const temp=file+'.'+crypto.randomUUID()+'.tmp';fs.writeFileSync(temp,output);fs.renameSync(temp,file);return true
}
module.exports={updateServersDat,parse,encode,str}
