const fs = require('fs'), path = require('path'), {execFileSync} = require('child_process')
const variable = 'VORTEX_PTERODACTYL_API_TOKEN'
function windowsUserToken() {
    if(process.platform !== 'win32') return ''
    try { return execFileSync('powershell.exe', ['-NoProfile','-NonInteractive','-Command', `[Environment]::GetEnvironmentVariable('${variable}','User')`], {encoding:'utf8',windowsHide:true,timeout:10000}).trim() } catch {return ''}
}
class HostingCredentials {
    constructor(root) {this.file=path.join(root,'hosting-token.dpapi');this.session='';this.loaded=false;this.cached=''}
    token() {
        if(this.session) return this.session
        if(!this.loaded) {
            this.loaded=true;this.cached=String(process.env[variable] || windowsUserToken()).trim()
            if(!this.cached && process.platform==='win32' && fs.existsSync(this.file)) {
                try {this.cached=execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-Command', '$s=[Console]::In.ReadToEnd() | ConvertTo-SecureString; $p=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($s); try {[Runtime.InteropServices.Marshal]::PtrToStringBSTR($p)} finally {[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($p)}'],{input:fs.readFileSync(this.file,'utf8'),encoding:'utf8',windowsHide:true,timeout:10000}).trim()} catch {}
            }
        }
        return this.cached
    }
    set(token, persist=false) {
        if(typeof token!=='string' || !/^ptlc_[A-Za-z0-9_-]{20,200}$/.test(token.trim())) throw Error('Clave API de cliente inválida')
        this.session=token.trim()
        if(persist) {
            if(process.platform!=='win32') throw Error('Guardado cifrado disponible en Windows; utiliza una variable de entorno en este equipo')
            const encrypted=execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-Command','$s=ConvertTo-SecureString ([Console]::In.ReadToEnd()) -AsPlainText -Force; ConvertFrom-SecureString $s'],{input:this.session,encoding:'utf8',windowsHide:true,timeout:10000}).trim()
            fs.mkdirSync(path.dirname(this.file),{recursive:true});fs.writeFileSync(this.file,encrypted,{mode:0o600})
        }
        return {configured:true,persisted:persist}
    }
}
module.exports={HostingCredentials,windowsUserToken}
