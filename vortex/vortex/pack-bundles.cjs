const fs=require('fs'),path=require('path'),crypto=require('crypto')
const MAGIC=Buffer.from('VXPK1\n'),LIMIT=256*1024*1024
function fileHash(file) {const fd=fs.openSync(file,'r'),h=crypto.createHash('sha256'),buffer=Buffer.alloc(65536);try {let n;while((n=fs.readSync(fd,buffer,0,buffer.length,null))) h.update(buffer.subarray(0,n));return h.digest('hex')} finally {fs.closeSync(fd)}}
function bundles(root,files,output,limit=LIMIT) {
    fs.mkdirSync(output,{recursive:true});const parts=[];let fd,size=0,index=0,target
    const finish=()=>{if(fd===undefined)return;fs.closeSync(fd);fd=undefined;parts.push({file:target,name:path.basename(target),size:fs.statSync(target).size,sha256:fileHash(target)})}
    try {
        for(const file of [...new Map(files.map(f=>[f.sha256,f])).values()]) {
            if(file.size+72+MAGIC.length>limit) throw Error('Un archivo supera el tamaño permitido del paquete')
            if(fd===undefined || size+file.size+72>limit) {finish();target=path.join(output,'pack-'+(++index)+'.vxp');fd=fs.openSync(target,'w');fs.writeSync(fd,MAGIC);size=MAGIC.length}
            const source=path.join(root,'blobs',file.sha256)
            if(fs.statSync(source).size!==file.size || fileHash(source)!==file.sha256) throw Error('Archivo alterado antes de publicar: '+file.path)
            const header=Buffer.alloc(72);header.write(file.sha256,0,64,'ascii');header.writeBigUInt64BE(BigInt(file.size),64);fs.writeSync(fd,header)
            const input=fs.openSync(source,'r'),buffer=Buffer.alloc(65536)
            try {let n;while((n=fs.readSync(input,buffer,0,buffer.length,null))) fs.writeSync(fd,buffer,0,n)} finally {fs.closeSync(input)}
            size+=file.size+72
        }
        finish();return parts
    } finally {if(fd!==undefined)fs.closeSync(fd)}
}
function unpack(file,manifest,output) {
    fs.mkdirSync(output,{recursive:true});const expected=new Map(manifest.files.map(f=>[f.sha256,f.size])),fd=fs.openSync(file,'r')
    try {
        const magic=Buffer.alloc(MAGIC.length);if(fs.readSync(fd,magic)!==MAGIC.length || !magic.equals(MAGIC)) throw Error('Paquete inválido')
        const header=Buffer.alloc(72),buffer=Buffer.alloc(65536)
        let n
        while((n=fs.readSync(fd,header))) {
            if(n!==72) throw Error('Paquete incompleto')
            const sha=header.subarray(0,64).toString('ascii'),size=Number(header.readBigUInt64BE(64))
            if(!/^[a-f0-9]{64}$/.test(sha) || expected.get(sha)!==size) throw Error('Archivo ajeno a la publicación')
            const destination=path.join(output,sha),temporary=destination+'.'+crypto.randomUUID()+'.tmp',out=fs.openSync(temporary,'w'),hash=crypto.createHash('sha256')
            try {let remaining=size;while(remaining) {const count=fs.readSync(fd,buffer,0,Math.min(remaining,buffer.length),null);if(!count) throw Error('Paquete incompleto');hash.update(buffer.subarray(0,count));fs.writeSync(out,buffer,0,count);remaining-=count}if(hash.digest('hex')!==sha) throw Error('Archivo descargado corrupto')} catch(error) {fs.closeSync(out);fs.unlinkSync(temporary);throw error}
            fs.closeSync(out);fs.renameSync(temporary,destination)
        }
    } finally {fs.closeSync(fd)}
}
module.exports={bundles,unpack,fileHash}
