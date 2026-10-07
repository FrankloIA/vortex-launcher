const fs=require('fs'),path=require('path'),crypto=require('crypto')
const roots=['mods','resourcepacks','shaderpacks','config','defaultconfigs','kubejs','scripts','.vortex-vault']
async function repair(instancesRoot,serverId,onProgress=()=>{}) {
    if(!['vortex-official','vortex-published-test'].includes(serverId))throw Error('Instancia no reparable')
    const instance=path.resolve(instancesRoot,serverId),work=path.resolve(instancesRoot,'.vortex-repair-'+crypto.randomUUID()),stage=path.join(work,serverId),backup=path.join(work,'previous'),moved=[]
    if(fs.existsSync(instance)&&fs.lstatSync(instance).isSymbolicLink())throw Error('No se repara una instancia enlazada')
    let removeWork=true
    fs.mkdirSync(work,{recursive:true})
    try {
        if(serverId==='vortex-official')await require('./official-release.cjs').prepareOfficialRelease(work,onProgress)
        else require('./test-release.cjs').prepareTestRelease(work,undefined,onProgress)
        require('./launcher-protection.cjs').check(work,serverId)
        fs.mkdirSync(instance,{recursive:true});fs.mkdirSync(backup,{recursive:true})
        const files=['.vortex-owned.json','.vortex-authority.json','.vortex-protected','.vortex-release.json','.vortex-optional.json','.vortex-shaders.json']
        for(const name of [...roots,...files]) {
            const target=path.join(instance,name),source=path.join(stage,name),old=path.join(backup,name)
            if(fs.existsSync(target)&&fs.lstatSync(target).isSymbolicLink())throw Error('Enlace no permitido en '+name)
            const step={name,had:fs.existsSync(target),installed:false};moved.push(step)
            if(step.had)fs.renameSync(target,old)
            if(fs.existsSync(source)){fs.renameSync(source,target);step.installed=true}
        }
        require('./launcher-protection.cjs').check(instancesRoot,serverId)
        return {repaired:true}
    }catch(error){try{for(const step of moved.reverse()){const target=path.join(instance,step.name),old=path.join(backup,step.name);if(step.installed)fs.rmSync(target,{recursive:true,force:true});if(step.had&&fs.existsSync(old))fs.renameSync(old,target)}}catch(rollbackError){removeWork=false;throw new Error('La recuperación requiere revisar la copia conservada en '+backup,{cause:rollbackError})}throw error}
    finally{if(removeWork&&work.startsWith(path.resolve(instancesRoot)+path.sep+'.vortex-repair-'))fs.rmSync(work,{recursive:true,force:true})}
}
module.exports={repair}
