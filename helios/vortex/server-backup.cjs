// Keep the last successful snapshot until its replacement has been verified.
async function createServerBackup(api,name,job={}) {
    const previous=await api.backups()
    if(previous.some(b=>!b.completed_at))throw Error('Hay un backup en curso; espera antes de crear otro')
    const limit=(await api.details()).feature_limits?.backups
    if(!Number.isInteger(limit) || limit<1)throw Error('El hosting no permite crear backups')
    if(limit<2 && previous.length)throw Error('Se necesitan dos plazas temporales para reemplazar el backup sin perder la copia anterior')
    // Remove surplus snapshots only when capacity is full, retaining the latest success.
    const ordered=[...previous].sort((a,b)=>Number(b.is_successful)-Number(a.is_successful) || String(b.created_at).localeCompare(String(a.created_at)))
    while(ordered.length>=limit){const old=ordered.pop();await api.deleteBackup(old.uuid)}
    job.progress='Creando y verificando backup completo'
    const backup=await api.backup(name);job.backupId=backup.uuid
    let complete=false
    for(let i=0;i<1800;i++) {
        const current=await api.backupStatus(backup.uuid)
        if(current.completed_at){if(!current.is_successful){await api.deleteBackup(backup.uuid);throw Error('El backup falló; no se cambiaron archivos y se conserva la copia anterior')};complete=true;break}
        await api.sleep(2000)
    }
    if(!complete)throw Error('El backup no terminó a tiempo; no se cambiaron archivos')
    job.progress='Backup verificado; retirando copias anteriores'
    for(const old of ordered)await api.deleteBackup(old.uuid)
    const remaining=await api.backups()
    if(remaining.length!==1 || remaining[0].uuid!==backup.uuid)throw Error('No se pudo verificar que queda un único backup; despliegue detenido')
    job.progress='Backup completo y verificado'
    return backup
}
module.exports={createServerBackup}
