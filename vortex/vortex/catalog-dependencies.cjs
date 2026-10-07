// Las dependencias del catálogo identifican proyectos (o versiones exactas en Modrinth).
async function assertDependencies(release, files, metadata, providers, replacePath, bytes) {
    const sources = files.filter(f => f.path.startsWith('mods/') && f.path !== replacePath)
        .map(f => f.source || metadata.get(f)?.source).filter(Boolean)
    const missing = []
    for (const dependency of release.dependencies || []) {
        let projectId = dependency.projectId ?? dependency.modId ?? dependency.project_id
        // Giselle Addon 8.5 conserva Botarium en CurseForge aunque su descriptor NeoForge
        // ya exige Common Storage Lib. Excepción limitada al archivo oficial auditado.
        if(bytes && release.provider==='curseforge' && String(release.projectId)==='714958' && String(release.fileId)==='9080559' && String(projectId)==='704113') {
            const zip=new (require('adm-zip'))(bytes)
            const descriptor=zip.readAsText('META-INF/neoforge.mods.toml')
            if(/modId\s*=\s*"common_storage_lib"/.test(descriptor) && !/modId\s*=\s*"botarium"/.test(descriptor)) continue
        }
        if (!projectId && dependency.version_id) {
            const version = await providers.request('modrinth', 'version/' + encodeURIComponent(dependency.version_id))
            projectId = version.project_id
        }
        const present = sources.some(s => s.provider === release.provider && String(s.projectId) === String(projectId)
            && (!dependency.version_id || String(s.fileId) === String(dependency.version_id)))
        if (!projectId || !present) missing.push(dependency.version_id ? `${projectId || '?'} (versión ${dependency.version_id})` : String(projectId || '?'))
    }
    if (missing.length) throw Error('Faltan dependencias requeridas o no se ha podido verificar su identidad: ' + missing.join(', ') + '. Añádelas antes de actualizar este mod')
}
module.exports = { assertDependencies }
