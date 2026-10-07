// Las dependencias del catálogo identifican proyectos (o versiones exactas en Modrinth).
async function assertDependencies(release, files, metadata, providers, replacePath) {
    const sources = files.filter(f => f.path.startsWith('mods/') && f.path !== replacePath)
        .map(f => f.source || metadata.get(f)?.source).filter(Boolean)
    const missing = []
    for (const dependency of release.dependencies || []) {
        let projectId = dependency.projectId ?? dependency.modId ?? dependency.project_id
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
