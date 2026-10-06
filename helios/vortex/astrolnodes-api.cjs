const remotePath = value => {
    if(typeof value!=='string' || !value.startsWith('/') || /[\\\x00-\x1f]/.test(value) || value.split('/').some(p=>p==='.' || p==='..')) throw Error('Ruta del servidor inválida')
    return value
}
const pause = ms => new Promise(resolve=>setTimeout(resolve,ms))
class AstrolNodesApi {
    constructor({token=()=>process.env.VORTEX_PTERODACTYL_API_TOKEN,serverId=process.env.VORTEX_PTERODACTYL_SERVER_ID || 'd2c7637e',fetcher=fetch,sleep=pause}={}) {
        if(!/^[a-f0-9]{8}(-[a-f0-9-]{27})?$/.test(serverId)) throw Error('Identificador del servidor inválido')
        this.token=typeof token==='function'?token:()=>token;this.serverId=serverId;this.fetcher=fetcher;this.sleep=sleep;this.baseUrl='https://gamedash.astrolnodes.net'
    }
    configured() {return !!String(this.token() || '').trim()}
    async request(route,{method='GET',body,raw=false}={}) {
        const token=String(this.token() || '').trim();if(!token) throw Error('Conecta la API de AstrolNodes en Servidor')
        let response
        try {response=await this.fetcher(this.baseUrl+'/api/client/servers/'+this.serverId+route,{method,headers:{Authorization:'Bearer '+token,Accept:'application/json',...(body!==undefined?{'Content-Type':raw?'text/plain':'application/json'}:{})},body:body===undefined?undefined:raw?body:JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(30000)})} catch {throw Error('No se pudo conectar con AstrolNodes; comprueba la conexión y vuelve a intentarlo')}
        if(!response.ok) {
            if(response.status===401) throw Error('AstrolNodes rechazó la clave API; configura una clave válida')
            if(response.status===403) throw Error('La clave API no tiene permiso para esta operación')
            throw Error('AstrolNodes respondió HTTP '+response.status)
        }
        if(response.status===204) return null
        return raw?response.text():response.json()
    }
    async details() {return (await this.request('')).attributes}
    async status() {const a=(await this.request('/resources')).attributes || {};return {configured:true,serverId:this.serverId,state:a.current_state || 'unknown',online:a.current_state==='running',cpu:a.resources?.cpu_absolute ?? null,memory:a.resources?.memory_bytes ?? null,disk:a.resources?.disk_bytes ?? null}}
    async list(directory='/') {return (await this.request('/files/list?directory='+encodeURIComponent(remotePath(directory)))).data.map(e=>e.attributes)}
    async contents(file) {return this.request('/files/contents?file='+encodeURIComponent(remotePath(file)),{raw:true})}
    signedUrl(value) {const url=new URL(value);if(url.protocol!=='https:' || !(url.hostname==='astrolnodes.net' || url.hostname.endsWith('.astrolnodes.net')) || url.username || url.password) throw Error('Dirección de transferencia AstrolNodes no permitida');return url}
    async download(file) {
        const data=await this.request('/files/download?file='+encodeURIComponent(remotePath(file))),url=this.signedUrl(data.attributes.url)
        let response;try {response=await this.fetcher(url,{redirect:'error',signal:AbortSignal.timeout(120000)})} catch {throw Error('No se pudo descargar el archivo del servidor')}
        if(!response.ok) throw Error('No se pudo descargar el archivo del servidor')
        const chunks=[];let size=0;for await(const chunk of response.body){size+=chunk.length;if(size>128*1048576)throw Error('Archivo del servidor supera 128 MiB');chunks.push(chunk)}return Buffer.concat(chunks)
    }
    async upload(directory,name,data) {
        remotePath(directory);if(typeof name!=='string' || /[\\/\x00-\x1f]/.test(name) || !name || name==='.' || name==='..') throw Error('Nombre de archivo inválido')
        const signed=await this.request('/files/upload'),url=this.signedUrl(signed.attributes.url);url.searchParams.set('directory',directory)
        const form=new FormData();form.append('files',new Blob([data]),name)
        let response;try {response=await this.fetcher(url,{method:'POST',body:form,redirect:'error',signal:AbortSignal.timeout(120000)})} catch {throw Error('No se pudo subir el archivo a AstrolNodes')}
        if(!response.ok) throw Error('La subida al servidor falló: HTTP '+response.status)
    }
    async mkdir(directory) {remotePath(directory);const pos=directory.lastIndexOf('/');return this.request('/files/create-folder',{method:'POST',body:{root:directory.slice(0,pos) || '/',name:directory.slice(pos+1)}})}
    async rename(from,to) {return this.request('/files/rename',{method:'PUT',body:{root:'/',files:[{from:remotePath(from).slice(1),to:remotePath(to).slice(1)}]}})}
    async command(command) {return this.request('/command',{method:'POST',body:{command}})}
    async power(signal) {if(!['start','stop','restart'].includes(signal))throw Error('Operación de encendido inválida');return this.request('/power',{method:'POST',body:{signal}})}
    async warn() {await this.command('title @a times 10 160 20');await this.command('title @a subtitle {"text":"El servidor se va a reiniciar en 10 segundos. ¡Ponte a salvo!","color":"yellow"}');await this.command('title @a title {"text":"¡ATENCIÓN!","color":"red","bold":true}');await this.sleep(10000)}
    async restart() {const s=await this.status();if(s.state==='running'){await this.warn();await this.power('restart')}else if(s.state==='offline')await this.power('start');else throw Error('Espera a que el servidor termine de arrancar o detenerse');return {requested:true}}
    async backups() {return (await this.request('/backups?per_page=50')).data.map(e=>e.attributes)}
    async backup(name) {return (await this.request('/backups',{method:'POST',body:{name,is_locked:true}})).attributes}
    async backupStatus(uuid) {if(!/^[a-f0-9-]{36}$/.test(uuid))throw Error('Backup inválido');return (await this.request('/backups/'+uuid)).attributes}
    async waitOffline() {for(let i=0;i<90;i++){if((await this.status()).state==='offline')return;await this.sleep(2000)}throw Error('El servidor no se detuvo; no se cambiaron archivos')}
}
module.exports={AstrolNodesApi,remotePath}
