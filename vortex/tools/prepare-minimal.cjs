const path = require('path')
const fs = require('fs-extra')
const { VortexDistribution } = require('vortex-core/common')
const { prepareNeoForge } = require('../app/assets/js/neoforge')

async function main() {
    const root = path.resolve(__dirname, '..', '.runtime')
    const common = path.join(root, 'data', 'common')
    const raw = await fs.readJson(path.join(__dirname, '..', 'vortex', 'distribution.json'))
    const server = new VortexDistribution(raw, common, path.join(root, 'data', 'instances')).getMainServer()
    let previous = ''
    const result = await prepareNeoForge({
        commonDir: common,
        server,
        javaExecutable: process.env.VORTEX_JAVA_EXECUTABLE || 'java',
        onProgress: event => {
            const state = `${event.phase}:${Math.floor(event.percent / 10) * 10}`
            if(previous !== state) { console.log(`${event.message} (${event.percent}%)`); previous = state }
        }
    })
    await fs.ensureDir(path.join(root, 'data', 'instances', server.rawServer.id))
    const evidence = { minecraft: result.vanillaManifest.id, neoforge: result.modManifest.id, mainClass: result.modManifest.mainClass, runtimeLibraries: result.modManifest.libraries.length, downloadedFiles: result.downloadedFiles, installed: result.installed }
    await fs.writeJson(path.join(root, 'minimal-install-result.json'), evidence, { spaces: 2 })
    console.log(JSON.stringify(evidence, null, 2))
}

main().catch(error => { console.error(error); process.exitCode = 1 })
