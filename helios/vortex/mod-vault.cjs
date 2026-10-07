const fs=require('fs'),path=require('path'),crypto=require('crypto'),{spawnSync}=require('child_process')
const {safe,atomic}=require('./release-store.cjs')
// Explicitly identified original projects. Third-party patches require a license review.
const ownHashes=new Set(['1457767595ee827e4cd6784dae843cad7e4c30020918518d3c3787224113a570','ce56392e13fa0766a1fe99e5f239bf44c43a83642a771561234c7cb7fd5845a3','57ddd12392b78642444b6145e38d76ed9e4965758455f8935409d28357137c22'])
function protect(data,encrypt) {
    if(process.platform!=='win32')throw Error('El almacén cifrado requiere Windows')
    const operation=encrypt?'Protect':'Unprotect'
    const script=`Add-Type -AssemblyName System.Security; $vortexBytes=[Convert]::FromBase64String([Console]::In.ReadToEnd()); $vortexResult=[Security.Cryptography.ProtectedData]::${operation}($vortexBytes,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser); [Console]::Out.Write([Convert]::ToBase64String($vortexResult))`
    const result=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',script],{input:data.toString('base64'),windowsHide:true,encoding:'utf8',maxBuffer:256*1024*1024,timeout:120000})
    if(result.status!==0)throw Error('No se pudo '+(encrypt?'cifrar':'descifrar')+' el almacén de mods de este usuario Windows')
    return Buffer.from(result.stdout.trim(),'base64')
}
function open(instance,crypt=protect) {
    const index=path.join(instance,'.vortex-vault/index.json');if(!fs.existsSync(index))return
    const entries=JSON.parse(fs.readFileSync(index))
    for(const e of entries){if(!ownHashes.has(e.sha256))throw Error('Registro de cifrado desconocido');const target=safe(instance,e.path),encrypted=safe(instance,'.vortex-vault/'+e.sha256+'.vxmod');if(fs.existsSync(target))continue
        const bytes=crypt(fs.readFileSync(encrypted),false);if(crypto.createHash('sha256').update(bytes).digest('hex')!==e.sha256)throw Error('Almacén cifrado alterado');atomic(target,bytes)
    }
}
function seal(instance,manifest,crypt=protect) {
    const entries=[]
    for(const f of manifest.files){if(!f.path.startsWith('mods/')||!ownHashes.has(f.sha256))continue;const target=safe(instance,f.path);if(!fs.existsSync(target)){if(stored(instance,f,crypt))entries.push({path:f.path,sha256:f.sha256});continue}
        const bytes=fs.readFileSync(target);if(crypto.createHash('sha256').update(bytes).digest('hex')!==f.sha256)throw Error('Mod propio modificado; no se reemplaza la copia cifrada')
        atomic(safe(instance,'.vortex-vault/'+f.sha256+'.vxmod'),crypt(bytes,true));entries.push({path:f.path,sha256:f.sha256})
    }
    if(entries.length){atomic(path.join(instance,'.vortex-vault/index.json'),JSON.stringify(entries));for(const e of entries)fs.unlinkSync(safe(instance,e.path))}
    return entries.length
}
function stored(instance,file,crypt=protect){if(!ownHashes.has(file.sha256))return null;const p=safe(instance,'.vortex-vault/'+file.sha256+'.vxmod');if(!fs.existsSync(p))return null;const data=crypt(fs.readFileSync(p),false);if(crypto.createHash('sha256').update(data).digest('hex')!==file.sha256)throw Error('Almacén cifrado alterado');return data}
module.exports={open,seal,stored,ownHashes,protect}
