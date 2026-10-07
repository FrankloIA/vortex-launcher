class ServerConsole {
    constructor(api,{Socket=require('ws')}={}){this.api=api;this.Socket=Socket;this.lines=[];this.sequence=0;this.state='disconnected';this.socket=null;this.pending=null;this.lastRead=0;this.lastAttempt=0;this.closed=false;this.timer=setInterval(()=>{if(Date.now()-this.lastRead>60000)this.disconnect()},15000);this.timer.unref?.()}
    append(text){for(const line of String(text).replace(/\x1b\[[0-?]*[ -/]*[@-~]/g,'').replace(/[\x00-\x08\x0b-\x1f\x7f]/g,'').split('\n')){this.lines.push({id:++this.sequence,text:line.slice(0,8192)});if(this.lines.length>500)this.lines.shift()}}
    disconnect(){const socket=this.socket;this.socket=null;socket?.close();this.state='disconnected'}
    close(){this.closed=true;clearInterval(this.timer);this.disconnect()}
    async connect(){
        if(this.closed || this.socket || this.pending || Date.now()-this.lastAttempt<5000)return this.pending
        this.lastAttempt=Date.now();this.state='connecting'
        this.pending=(async()=>{try{
            const result=await this.api.request('/websocket'),data=result.data || result.attributes || result,url=new URL(data.socket)
            if(url.protocol!=='wss:' || !(url.hostname==='astrolnodes.net' || url.hostname.endsWith('.astrolnodes.net')) || typeof data.token!=='string')throw Error('Conexión de consola inválida')
            const socket=new this.Socket(url.href,{origin:'https://gamedash.astrolnodes.net',handshakeTimeout:10000,maxPayload:1048576});this.socket=socket
            socket.addEventListener('open',()=>{if(this.socket===socket)socket.send(JSON.stringify({event:'auth',args:[data.token]}))})
            socket.addEventListener('message',event=>{if(this.socket!==socket)return;try{const message=JSON.parse(event.data);if(message.event==='auth success'){this.state='connected';socket.send(JSON.stringify({event:'send logs',args:[]}))}else if(['console output','install output','daemon message'].includes(message.event))for(const text of message.args || [])this.append(text);else if(['token expiring','token expired'].includes(message.event))this.disconnect();else if(message.event==='auth error'){this.state='error';this.disconnect()}}catch{}})
            socket.addEventListener('close',()=>{if(this.socket===socket){this.socket=null;this.state='disconnected'}})
            socket.addEventListener('error',()=>{if(this.socket===socket){this.disconnect();this.state='error'}})
        }catch{this.state='error'}finally{this.pending=null}})();return this.pending
    }
    async read(since=0){this.lastRead=Date.now();await this.connect();if(since>this.sequence)since=0;return {state:this.state,lines:this.lines.filter(line=>line.id>since),cursor:this.sequence}}
    async command(value){if(typeof value!=='string' || !value.trim() || value.length>2000 || /[\x00-\x1f\x7f]/.test(value))throw Error('Escribe un comando válido de una sola línea');await this.api.command(value.trim().replace(/^\//,''));return {sent:true}}
}
module.exports={ServerConsole}
