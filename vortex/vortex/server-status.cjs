const net = require('net')
function varInt(value){const bytes=[];do{let byte=value&127;value>>>=7;if(value)byte|=128;bytes.push(byte)}while(value);return Buffer.from(bytes)}
function readVarInt(buffer,offset=0){let value=0;for(let i=0;i<5;i++){if(offset+i>=buffer.length)return null;const byte=buffer[offset+i];value|=(byte&127)<<(7*i);if(!(byte&128))return {value,bytes:i+1}}throw Error('Respuesta de estado no válida')}
function packet(body){return Buffer.concat([varInt(body.length),body])}
function getServerStatus(protocol,hostname,port=25565){
    return new Promise((resolve,reject)=>{
        let received=Buffer.alloc(0),finished=false
        const socket=net.createConnection({host:hostname,port:Number(port)})
        const finish=(error,status)=>{if(finished)return;finished=true;clearTimeout(deadline);socket.destroy();error?reject(error):resolve(status)}
        const deadline=setTimeout(()=>finish(Error('El servidor no respondió a tiempo')),5000)
        socket.once('connect',()=>{
            const host=Buffer.from(hostname,'utf8'),portBytes=Buffer.alloc(2);portBytes.writeUInt16BE(Number(port))
            socket.write(packet(Buffer.concat([varInt(0),varInt(protocol),varInt(host.length),host,portBytes,varInt(1)])))
            socket.write(packet(varInt(0)))
        })
        socket.on('data',chunk=>{
            try{
                received=Buffer.concat([received,chunk]);if(received.length>1048576)throw Error('Respuesta de estado demasiado grande')
                const length=readVarInt(received);if(!length||received.length<length.bytes+length.value)return
                const body=received.subarray(length.bytes,length.bytes+length.value),id=readVarInt(body)
                if(!id||id.value!==0)throw Error('Respuesta de estado no válida')
                const textLength=readVarInt(body,id.bytes);if(!textLength||id.bytes+textLength.bytes+textLength.value>body.length)throw Error('Respuesta de estado incompleta')
                const status=JSON.parse(body.subarray(id.bytes+textLength.bytes,id.bytes+textLength.bytes+textLength.value).toString('utf8'))
                if(!Number.isInteger(status.players?.online)||!Number.isInteger(status.players?.max))throw Error('Recuento de jugadores no válido')
                finish(null,status)
            }catch(error){finish(error)}
        })
        socket.once('error',error=>finish(error))
        socket.once('close',()=>{if(!finished)finish(Error('El servidor cerró la consulta de estado'))})
    })
}
module.exports={getServerStatus}
