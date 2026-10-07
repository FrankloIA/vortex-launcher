require('../../../vortex/dependency-alias.cjs')
const fs = require('fs-extra')
const path = require('path')
const crypto = require('crypto')
const { spawn } = require('child_process')
const AdmZip = require('adm-zip')
const { MojangIndexProcessor, downloadQueue, downloadFile, getExpectedDownloadSize } = require('vortex-core/dl')
const { validateLocalFile, isLibraryCompatible } = require('vortex-core/common')

const MINECRAFT = '1.21.1'
const NEOFORGE = '21.1.250'
const INSTALLER_SHA256 = '0e47a91ba2139a8db4bf7627af081f7b5789b508bb039ee8dea1272b79693d60'
const INSTALLER_URL = `https://maven.neoforged.net/releases/net/neoforged/neoforge/${NEOFORGE}/neoforge-${NEOFORGE}-installer.jar`
const pending = new Map()

// vortex-core serializa estos JSON al guardarlos y cambia su hash. Conservar
// los bytes oficiales permite verificar la caché y reutilizarla sin red.
class RawMojangIndexProcessor extends MojangIndexProcessor {
    async loadContentWithRemoteFallback(url, filename, hash) {
        if(hash && await validateLocalFile(filename, hash.algo, hash.value)) {
            return fs.readJson(filename)
        }
        const temporary = filename + '.download'
        await fs.ensureDir(path.dirname(filename))
        await downloadFile(url, temporary)
        if(hash && !await validateLocalFile(temporary, hash.algo, hash.value)) {
            throw new Error(`Hash incorrecto en metadatos oficiales: ${url}`)
        }
        const json = await fs.readJson(temporary)
        await fs.move(temporary, filename, { overwrite: true })
        return json
    }
}

function isNeoForge(server) {
    return server.rawServer.vortexLoader?.type === 'neoforge'
}

function inside(root, relative) {
    if(typeof relative !== 'string' || path.isAbsolute(relative) || relative.includes('\\') || relative.split('/').includes('..')) {
        throw new Error(`Ruta de biblioteca no permitida: ${relative}`)
    }
    const destination = path.resolve(root, relative)
    if(!destination.startsWith(path.resolve(root) + path.sep)) {
        throw new Error('La biblioteca queda fuera de la instancia')
    }
    return destination
}

async function sha256(filename) {
    return crypto.createHash('sha256').update(await fs.readFile(filename)).digest('hex')
}

function runtimeLibraries(manifest, commonDir) {
    return manifest.libraries.filter(lib => isLibraryCompatible(lib.rules, lib.natives)).map(lib => {
        const artifact = lib.downloads?.artifact
        if(!artifact?.path || !artifact.sha1) {
            throw new Error(`Biblioteca NeoForge sin metadatos: ${lib.name}`)
        }
        return { name: lib.name, path: inside(path.join(commonDir, 'libraries'), artifact.path), sha1: artifact.sha1 }
    })
}

function runInstaller(javaExecutable, installer, commonDir, logFile) {
    return new Promise((resolve, reject) => {
        const log = fs.createWriteStream(logFile)
        const child = spawn(javaExecutable, ['-Djava.awt.headless=true', '-jar', installer, '--installClient', commonDir], {
            cwd: commonDir,
            windowsHide: true,
            stdio: ['ignore', 'pipe', 'pipe']
        })
        let logError
        log.on('error', error => { logError = error; child.kill() })
        child.stdout.pipe(log, { end: false })
        child.stderr.pipe(log, { end: false })
        const timeout = setTimeout(() => child.kill(), 10 * 60 * 1000)
        child.once('error', error => { clearTimeout(timeout); log.end(); reject(error) })
        child.once('close', (code, signal) => {
            clearTimeout(timeout)
            log.end(() => {
                if(logError) reject(logError)
                else if(code !== 0) reject(new Error(`El instalador NeoForge terminó con código ${code} (${signal || 'sin señal'}). Registro: ${logFile}`))
                else resolve()
            })
        })
    })
}

async function install({ commonDir, server, javaExecutable, onProgress = () => {} }) {
    if(server.rawServer.minecraftVersion !== MINECRAFT || server.rawServer.vortexLoader?.version !== NEOFORGE) {
        throw new Error('Esta adaptación está fijada a Minecraft 1.21.1 y NeoForge 21.1.250')
    }
    await fs.ensureDir(commonDir)
    onProgress({ phase: 'verifying', message: 'Verificando Minecraft 1.21.1', percent: 0 })
    const mojang = new RawMojangIndexProcessor(commonDir, MINECRAFT)
    await mojang.init()
    const invalid = Object.values(await mojang.validate(async () => {})).flat()
    if(invalid.length) {
        const size = getExpectedDownloadSize(invalid)
        await downloadQueue(invalid, received => onProgress({ phase: 'downloading', message: 'Descargando archivos oficiales de Minecraft', received, total:size, percent: Math.min(100, Math.floor(received / size * 100)) }))
        // Verificar el contenido, incluso cuando el tamaño recibido coincide.
        for(const asset of invalid) {
            if(!await validateLocalFile(asset.path, asset.algo, asset.hash)) {
                throw new Error(`Hash incorrecto tras descargar ${asset.id}`)
            }
        }
    }
    const vanillaManifest = await mojang.getVersionJson()
    const installer = path.join(commonDir, 'installers', `neoforge-${NEOFORGE}-installer.jar`)
    await fs.ensureDir(path.dirname(installer))
    if(!await validateLocalFile(installer, 'sha256', INSTALLER_SHA256)) {
        const temporary = installer + '.download'
        onProgress({ phase: 'downloading', message: 'Descargando instalador oficial NeoForge', percent: 0 })
        await downloadFile(INSTALLER_URL, temporary)
        if(!await validateLocalFile(temporary, 'sha256', INSTALLER_SHA256)) {
            throw new Error('El instalador NeoForge no coincide con la revisión aprobada')
        }
        await fs.move(temporary, installer, { overwrite: true })
    }
    const official = JSON.parse(new AdmZip(installer).readAsText('version.json'))
    const versionFile = path.join(commonDir, 'versions', official.id, `${official.id}.json`)
    const markerFile = path.join(commonDir, 'installers', `neoforge-${NEOFORGE}.verified.json`)
    let modManifest
    let valid = false
    if(await fs.pathExists(versionFile) && await fs.pathExists(markerFile)) {
        try {
            const marker = await fs.readJson(markerFile)
            modManifest = await fs.readJson(versionFile)
            valid = marker.schema === 2 && marker.generatedFiles?.length === 4 && marker.installerSha256 === INSTALLER_SHA256 && marker.versionSha256 === await sha256(versionFile)
            for(const file of marker.generatedFiles || []) {
                if(!await validateLocalFile(inside(commonDir, file.path), 'sha256', file.sha256)) valid = false
            }
            for(const lib of runtimeLibraries(modManifest, commonDir)) {
                if(!await validateLocalFile(lib.path, 'sha1', lib.sha1)) valid = false
            }
        } catch(_error) {
            valid = false
        }
    }
    if(!valid) {
        const launcherProfiles = path.join(commonDir, 'launcher_profiles.json')
        if(!await fs.pathExists(launcherProfiles)) await fs.writeJson(launcherProfiles, { profiles: {} })
        onProgress({ phase: 'installing', message: 'Ejecutando procesadores de NeoForge 21.1.250', percent: 0 })
        await runInstaller(javaExecutable, installer, commonDir, path.join(commonDir, 'installers', 'neoforge-install.log'))
        modManifest = await fs.readJson(versionFile)
        if(modManifest.id !== official.id || modManifest.inheritsFrom !== MINECRAFT || modManifest.mainClass !== official.mainClass) {
            throw new Error('El perfil instalado no corresponde a NeoForge 21.1.250')
        }
        for(const lib of runtimeLibraries(modManifest, commonDir)) {
            if(!await validateLocalFile(lib.path, 'sha1', lib.sha1)) {
                throw new Error(`Biblioteca NeoForge no verificada: ${lib.name}`)
            }
        }
        const generatedPaths = [
            `libraries/net/neoforged/neoforge/${NEOFORGE}/neoforge-${NEOFORGE}-client.jar`,
            `libraries/net/neoforged/neoforge/${NEOFORGE}/neoforge-${NEOFORGE}-universal.jar`,
            'libraries/net/minecraft/client/1.21.1-20240808.144430/client-1.21.1-20240808.144430-srg.jar',
            'libraries/net/minecraft/client/1.21.1-20240808.144430/client-1.21.1-20240808.144430-extra.jar'
        ]
        const generatedFiles = []
        for(const relative of generatedPaths) {
            const file = inside(commonDir, relative)
            if(!await fs.pathExists(file)) throw new Error(`No se generó ${relative}`)
            generatedFiles.push({ path: relative, sha256: await sha256(file) })
        }
        await fs.writeJson(markerFile, { schema: 2, installerSha256: INSTALLER_SHA256, versionSha256: await sha256(versionFile), generatedFiles }, { spaces: 2 })
    }
    onProgress({ phase: 'ready', message: 'Minecraft y NeoForge verificados', percent: 100 })
    return { vanillaManifest, modManifest, downloadedFiles: invalid.length, installed: !valid }
}

function prepareNeoForge(options) {
    const key = path.resolve(options.commonDir)
    if(pending.has(key)) return pending.get(key)
    const promise = install(options).finally(() => pending.delete(key))
    pending.set(key, promise)
    return promise
}

module.exports = { isNeoForge, prepareNeoForge, runtimeLibraries, INSTALLER_SHA256 }
