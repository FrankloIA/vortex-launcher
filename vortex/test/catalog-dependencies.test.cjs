const {test}=require('node:test')
const assert=require('node:assert/strict')
const {assertDependencies}=require('../vortex/catalog-dependencies.cjs')
const metadata={get:()=>null},providers={request:async()=>({project_id:'lib'})}
test('solo omite Botarium obsoleto en el archivo Giselle auditado y con descriptor nuevo',async()=>{
    const Zip=require('adm-zip'),zip=new Zip()
    zip.addFile('META-INF/neoforge.mods.toml',Buffer.from('modId="common_storage_lib"'))
    const release={provider:'curseforge',projectId:714958,fileId:9080559,dependencies:[{modId:704113}]}
    await assertDependencies(release,[],metadata,providers,undefined,zip.toBuffer())
    await assert.rejects(assertDependencies({...release,fileId:1},[],metadata,providers,undefined,zip.toBuffer()),/704113/)
    zip.addFile('META-INF/neoforge.mods.toml',Buffer.from('modId="botarium"'))
    await assert.rejects(assertDependencies(release,[],metadata,providers,undefined,zip.toBuffer()),/704113/)
})
test('CurseForge: permite una dependencia instalada, bloquea ausente y el propio archivo sustituido',async()=>{
    const release={provider:'curseforge',dependencies:[{modId:123}]}
    const files=[{path:'mods/lib.jar',source:{provider:'curseforge',projectId:123}}]
    await assertDependencies(release,files,metadata,providers)
    await assert.rejects(assertDependencies(release,[],metadata,providers),/123/)
    await assert.rejects(assertDependencies(release,files,metadata,providers,'mods/lib.jar'),/123/)
})
test('Modrinth: comprueba versión exacta y resuelve dependencias sin proyecto',async()=>{
    const release={provider:'modrinth',dependencies:[{version_id:'v1'}]}
    const files=[{path:'mods/lib.jar',source:{provider:'modrinth',projectId:'lib',fileId:'v1'}}]
    await assertDependencies(release,files,metadata,providers)
    files[0].source.fileId='v2'
    await assert.rejects(assertDependencies(release,files,metadata,providers),/versión v1/)
})
test('No considera equivalentes identidades de proveedores diferentes; usa metadatos del hash',async()=>{
    const release={provider:'curseforge',dependencies:[{modId:123}]}
    const files=[{path:'mods/lib.jar',sha256:'abc'}]
    await assertDependencies(release,files,{get:()=>({source:{provider:'curseforge',projectId:123}})},providers)
    await assert.rejects(assertDependencies(release,files,{get:()=>({source:{provider:'modrinth',projectId:123}})},providers),/123/)
})
