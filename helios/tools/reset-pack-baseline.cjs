// Restablecimiento solicitado: conservar bytes, retirar el historial de pruebas anterior.
const fs=require('fs'),path=require('path'),assert=require('assert')
const {ReleaseStore,hash}=require('../vortex/release-store.cjs')
function resetBaseline(root) {
    const store=new ReleaseStore(root), workspace=store.workspace()
    const source=workspace.activeId ? store.getDraft(workspace.activeId) : store.releases()[0]
    if(!source) throw Error('No hay contenido para conservar como base')
    if(Object.keys(source.editorDrafts || {}).length) throw Error('Guarda las configuraciones pendientes antes de restablecer la base')
    const records=[]
    for(const folder of ['drafts','releases','channels']) {
        const directory=path.join(store.root,folder)
        if(fs.existsSync(directory)) for(const name of fs.readdirSync(directory).filter(n=>n.endsWith('.json'))) records.push({folder,name,text:fs.readFileSync(path.join(directory,name),'utf8')})
    }
    const backup=path.join(store.root,'baseline-backups',Date.now()+'.json')
    fs.mkdirSync(path.dirname(backup),{recursive:true});fs.writeFileSync(backup,JSON.stringify({workspace,records},null,2))
    const baseId='baseline-1.0.1'
    store.create(baseId,'1.0.1','Jarvis')
    store.edit(baseId,0,d=>{d.files=structuredClone(source.files);d.notes=source.notes;d.minecraft=source.minecraft;d.loader=source.loader || 'neoforge';d.neoforge=source.neoforge})
    const envelope=store.publish(baseId,1)
    assert.deepEqual(JSON.parse(envelope.payload).files,source.files)
    for(const record of records) {
        const value=record.folder==='releases' ? JSON.parse(JSON.parse(record.text).payload) : JSON.parse(record.text)
        if(['drafts','releases'].includes(record.folder) && /^1\.0\.(3|4)(?:[ ._-]|$)/.test(value.version)) {
            const target=path.resolve(store.root,record.folder,record.name)
            if(!target.startsWith(store.root+path.sep)) throw Error('Ruta fuera del panel')
            fs.unlinkSync(target)
        }
    }
    fs.unlinkSync(store.draftFile(baseId))
    store.setWorkspace({activeId:null,draftRecoveryApplied:true})
    return {version:'1.0.1',files:source.files.length,contentHash:hash(Buffer.from(JSON.stringify(source.files))),backup}
}
if(require.main===module) {
    if(!process.argv.includes('--apply')) throw Error('Usa --apply para ejecutar el restablecimiento explícito')
    console.log(JSON.stringify(resetBaseline(path.resolve(__dirname,'../.runtime/pack-admin'))))
}
module.exports={resetBaseline}
