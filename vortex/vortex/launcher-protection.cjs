const fs=require('fs'),path=require('path')
const {verify}=require('./release-store.cjs'),integrity=require('./instance-integrity.cjs'),vault=require('./mod-vault.cjs')
function context(instancesRoot,serverId) {
    if(!['vortex-official','vortex-published-test'].includes(serverId))return null
    const instance=path.join(instancesRoot,serverId),authority=path.join(instance,'.vortex-authority.json')
    if(!fs.existsSync(authority)){if(fs.existsSync(path.join(instance,'.vortex-owned.json')) && fs.existsSync(path.join(instance,'.vortex-protected')))throw new integrity.IntegrityError(['Falta el manifiesto firmado']);return null}
    const key=serverId==='vortex-official'?require('./pack-feed.json').publicKey:fs.readFileSync(path.join(process.env.VORTEX_ADMIN_ROOT || path.resolve(__dirname,'../.runtime/pack-admin'),'public-signing-key.pem'))
    const envelope=JSON.parse(fs.readFileSync(authority)),manifest=verify(envelope,key)
    const expectedReader=serverId==='vortex-official'?sha=>fs.readFileSync(path.join(instancesRoot,'.vortex-downloads/blobs',sha)):sha=>fs.readFileSync(path.join(process.env.VORTEX_ADMIN_ROOT || path.resolve(__dirname,'../.runtime/pack-admin'),'blobs',sha));return {instance,key,envelope,manifest,expectedReader}
}
function check(instancesRoot,serverId,{seal=false,administrator=false}={}) {
    if(administrator)return
    const c=context(instancesRoot,serverId);if(!c)return
    if(!administrator)integrity.scan(c.instance,c.envelope,c.key,c.expectedReader)
    if(seal && c.manifest.security?.vault!==false){if(administrator){try{vault.seal(c.instance,c.manifest)}catch{}}else vault.seal(c.instance,c.manifest)}
}
function close(instancesRoot,serverId){const c=context(instancesRoot,serverId);if(c?.manifest.security?.vault)vault.seal(c.instance,c.manifest)}
module.exports={check,close,context}
