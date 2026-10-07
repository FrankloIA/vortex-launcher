const fs=require('fs'),path=require('path')
function cleanupTests(store) {
    const workspace=store.workspace()
    if(workspace.activeId) throw Error('No limpiar pruebas mientras existe una versión activa')
    const stable=path.join(store.root,'channels/stable.json')
    if(!fs.existsSync(stable)) throw Error('Falta publicación oficial')
    const test=path.join(store.root,'channels/test.json')
    if(fs.existsSync(test)) fs.unlinkSync(test)
    let deleted=0
    const runs=path.join(store.root,'test-runs')
    if(fs.existsSync(runs)) for(const name of fs.readdirSync(runs)) {
        if(!/^[a-f0-9-]{36}\.json$/.test(name))continue
        fs.unlinkSync(path.join(runs,name));deleted++
    }
    store.setWorkspace({testRunId:null})
    return {testRunsDeleted:deleted,testChannelRemoved:true}
}
module.exports={cleanupTests}
