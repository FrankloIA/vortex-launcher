const fs = require('fs-extra')
const path = require('path')
const { validateLocalFile } = require('helios-core/common')

// Catálogo de pruebas: comprobar la instantánea importada, sin restaurar
// configuraciones del jugador ni fingir que existe un servicio de actualización.
async function verifyPackSnapshot(server, instancesRoot) {
    if(server.rawServer.id === 'vortex-published-test') {
        return require('../../../vortex/test-release.cjs').prepareTestRelease(instancesRoot)
    }
    if(!server.rawServer.vortexPackSnapshot) return
    if(server.rawServer.id !== 'vortex-pack-test') throw new Error('Instancia de pack de pruebas desconocida')
    const root = path.resolve(instancesRoot, server.rawServer.id)
    const snapshot = await fs.readJson(path.join(root, '.vortex-test-snapshot.json'))
    if(snapshot.sourceZipSha256 !== server.rawServer.vortexPackSnapshot || snapshot.mods !== 200) {
        throw new Error('La instantánea del pack no corresponde al catálogo de Vortex')
    }
    const binaries = snapshot.files.filter(file => /^(mods|resourcepacks|shaderpacks)\//.test(file.path))
    for(const file of binaries) {
        if(path.isAbsolute(file.path) || file.path.includes('\\') || file.path.split('/').includes('..')) throw new Error('Ruta de pack inválida')
        const target = path.resolve(root, file.path)
        if(!target.startsWith(root + path.sep) || !await validateLocalFile(target, 'sha256', file.sha256)) {
            throw new Error(`Archivo del pack ausente o alterado: ${file.path}. Revisa la importación antes de jugar.`)
        }
    }
}

module.exports = { verifyPackSnapshot }
