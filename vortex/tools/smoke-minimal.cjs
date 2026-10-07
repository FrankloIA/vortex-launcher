// Prueba técnica de arranque; no autentica, no conecta ni configura una cuenta del usuario.
const fs = require('fs-extra')
const path = require('path')
const { VortexDistribution } = require('vortex-core/common')
const ProcessBuilder = require('../app/assets/js/processbuilder')

async function main() {
    const root = path.resolve(__dirname, '..', '.runtime')
    const common = path.join(root, 'data', 'common')
    const instances = path.join(root, 'data', 'instances')
    const raw = await fs.readJson(path.join(__dirname, '..', 'vortex', 'distribution.json'))
    const fullPack = process.env.VORTEX_PROBE_PACK === '1'
    if(fullPack) {
        raw.servers[0].id = 'vortex-pack-test'
        const snapshot = await fs.readJson(path.join(instances, 'vortex-pack-test', '.vortex-test-snapshot.json'))
        if(snapshot.mods !== 200) throw new Error('Instantánea incompleta del pack Vortex')
    }
    const server = new VortexDistribution(raw, common, instances).getMainServer()
    const vanilla = await fs.readJson(path.join(common, 'versions', '1.21.1', '1.21.1.json'))
    const mod = await fs.readJson(path.join(common, 'versions', 'neoforge-21.1.250', 'neoforge-21.1.250.json'))
    const config = {
        getCommonDirectory: () => common,
        getInstanceDirectory: () => instances,
        getTempNativeFolder: () => 'vortex-stage2-natives',
        getModConfiguration: () => ({ mods: {} }),
        getJavaExecutable: () => process.env.VORTEX_JAVA_EXECUTABLE || 'java',
        getLaunchDetached: () => false,
        getAutoConnect: () => false,
        getFullscreen: () => false,
        getMinRAM: () => '1G',
        getMaxRAM: () => fullPack ? '8G' : '4G',
        getJVMOptions: () => process.env.VORTEX_PROBE_IPV4 === '1' ? ['-Djava.net.preferIPv4Stack=true'] : [],
        getGameWidth: () => 960,
        getGameHeight: () => 540
    }
    const probe = { displayName: 'VortexProbe', uuid: '00000000000000000000000000000000', accessToken: '0', type: 'microsoft' }
    const builder = new ProcessBuilder(server, vanilla, mod, probe, '1.0.0-stage2', config)
    const logFile = path.join(root, fullPack ? 'pack-launch.log' : 'minimal-launch.log')
    const log = fs.createWriteStream(logFile)
    const child = builder.build()
    let stdout = ''
    let stderr = ''
    let timedOut = false
    let spawnError
    child.stdout.on('data', data => { stdout += data; log.write(data) })
    child.stderr.on('data', data => { stderr += data; log.write(data) })
    child.once('error', error => { spawnError = error })
    const timeoutSeconds = fullPack ? 180 : 90
    const timer = setTimeout(() => { timedOut = true; child.kill() }, timeoutSeconds * 1000)
    child.once('close', async (code, signal) => {
        clearTimeout(timer)
        log.end()
        const output = stdout + stderr
        const result = {
            javaSpawned: !spawnError,
            exitCode: code,
            signal,
            stoppedAfterTimeout: timedOut,
            timeoutSeconds,
            fullPack,
            ipv4Only: process.env.VORTEX_PROBE_IPV4 === '1',
            neoForgeVersionObserved: /21\.1\.250/.test(output),
            lwjglInitialized: /LWJGL version|Backend library: LWJGL/.test(output),
            openALInitialized: /OpenAL initialized/.test(output),
            textureAtlasCreated: /Created:.*minecraft:textures\/atlas/.test(output),
            authenticated: false,
            serverConnectionTested: false,
            logFile,
            error: spawnError?.message || null
        }
        await fs.writeJson(path.join(root, fullPack ? 'pack-launch-result.json' : 'minimal-launch-result.json'), result, { spaces: 2 })
        console.log(JSON.stringify(result, null, 2))
        if(!result.textureAtlasCreated || !result.neoForgeVersionObserved) process.exitCode = 1
    })
}

main().catch(error => { console.error(error); process.exitCode = 1 })
