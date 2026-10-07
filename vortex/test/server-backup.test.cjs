const test=require('node:test'),assert=require('node:assert/strict')
const {createServerBackup}=require('../vortex/server-backup.cjs')
function fixture({limit=2,success=true}={}) {
    const calls=[],entries=[{uuid:'old',completed_at:'yesterday',created_at:'yesterday',is_successful:true}]
    return {calls,entries,api:{backups:async()=>[...entries],details:async()=>({feature_limits:{backups:limit}}),sleep:async()=>{},backup:async()=>{calls.push('create');entries.push({uuid:'new',completed_at:'now',is_successful:success});return {uuid:'new'}},backupStatus:async()=>{calls.push('verify');return entries.at(-1)},deleteBackup:async uuid=>{calls.push('delete:'+uuid);entries.splice(entries.findIndex(b=>b.uuid===uuid),1)}}}
}
test('el backup anterior solo se borra tras verificar su sustituto y queda una copia',async()=>{
    const {api,calls,entries}=fixture();await createServerBackup(api,'fixture');assert.deepEqual(calls,['create','verify','delete:old']);assert.deepEqual(entries.map(b=>b.uuid),['new'])
})
test('un backup fallido conserva la copia anterior',async()=>{
    const {api,calls,entries}=fixture({success:false});await assert.rejects(createServerBackup(api,'fixture'),/backup falló/);assert.ok(entries.some(b=>b.uuid==='old'));assert.ok(!calls.includes('delete:old'))
})
test('sin plaza temporal no se pierde el único backup anterior',async()=>{
    const {api,calls}=fixture({limit:1});await assert.rejects(createServerBackup(api,'fixture'),/dos plazas/);assert.deepEqual(calls,[])
})
test('fallo borrando la copia anterior impide continuar el despliegue',async()=>{
    const {api,entries}=fixture();api.deleteBackup=async()=>{throw Error('Sin permiso')};await assert.rejects(createServerBackup(api,'fixture'),/Sin permiso/);assert.equal(entries.length,2)
})
