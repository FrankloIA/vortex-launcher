// Importación de una instantánea local solo en la instancia de pruebas vacía.
const fs = require('fs-extra')
const path = require('path')
const crypto = require('crypto')
const AdmZip = require('adm-zip')

const hash = data => crypto.createHash('sha256').update(data).digest('hex')
function safe(root, relative) {
    if(path.isAbsolute(relative) || relative.includes('\\') || relative.split('/').includes('..')) throw new Error('Ruta inválida')
    const destination = path.resolve(root, relative)
    if(!destination.startsWith(path.resolve(root) + path.sep)) throw new Error('Ruta fuera de la instancia')
    return destination
}

async function main() {
    if(!process.argv[2] || !process.argv[3]) throw new Error('Uso: node tools/prepare-pack.cjs <ZIP original> <instancia CurseForge de origen>')
    const zipPath = path.resolve(process.argv[2])
    const source = path.resolve(process.argv[3])
    const inventory = path.resolve(__dirname, '../../docs/stage-1/inventory')
    const target = path.resolve(__dirname, '../../.runtime/data/instances/vortex-pack-test')
    if(await fs.pathExists(target) && (await fs.readdir(target)).length) throw new Error('La instancia de pruebas debe estar vacía; no se sobrescriben datos existentes')
    const zipBytes = await fs.readFile(zipPath)
    const summary = await fs.readJson(path.join(inventory, 'summary.json'))
    if(hash(zipBytes) !== summary.source.sha256) throw new Error('El ZIP no coincide con la instantánea inventariada')
    const zip = new AdmZip(zipBytes)
    const files = await fs.readJson(path.join(inventory, 'files.json'))
    const external = await fs.readJson(path.join(inventory, 'installed-resolution.json'))
    const managed = []
    await fs.ensureDir(target)
    for(const file of external) {
        if(file.status !== 'verified-exact-file') throw new Error(`Referencia no resuelta: ${file.projectID}/${file.fileID}`)
        const origin = safe(source, file.targetPath)
        if(hash(await fs.readFile(origin)) !== file.sha256) throw new Error(`El archivo instalado ha cambiado: ${file.filename}`)
        const destination = safe(target, file.targetPath)
        await fs.ensureDir(path.dirname(destination))
        await fs.copyFile(origin, destination)
        managed.push({ path: file.targetPath, sha256: file.sha256, projectID: file.projectID, fileID: file.fileID })
    }
    for(const file of files.filter(x => x.path.startsWith('overrides/'))) {
        const data = zip.readFile(file.path)
        if(hash(data) !== file.sha256) throw new Error(`Hash incorrecto: ${file.path}`)
        const destination = safe(target, file.targetPath)
        if(await fs.pathExists(destination)) throw new Error(`Colisión de rutas: ${file.targetPath}`)
        await fs.ensureDir(path.dirname(destination))
        await fs.writeFile(destination, data)
        managed.push({ path: file.targetPath, sha256: file.sha256, policy: file.policy })
    }
    const iris = path.join(target, 'config', 'iris.properties')
    const testOverrides = []
    if(await fs.pathExists(iris)) {
        const before = await fs.readFile(iris, 'utf8')
        const after = /^enableShaders=/m.test(before) ? before.replace(/^enableShaders=.*$/m, 'enableShaders=false') : before + '\nenableShaders=false\n'
        await fs.writeFile(iris, after)
        testOverrides.push({ path: 'config/iris.properties', reason: 'Prueba inicial sin shaders', originalSha256: hash(Buffer.from(before)), testSha256: hash(Buffer.from(after)) })
    }
    const result = { version: '1.0.0', minecraft: '1.21.1', neoforge: '21.1.250', sourceZipSha256: summary.source.sha256, target, importedFiles: managed.length, mods: managed.filter(x=>x.path.startsWith('mods/')).length, resourcepacks: managed.filter(x=>x.path.startsWith('resourcepacks/')).length, shaderArchives: managed.filter(x=>x.path.startsWith('shaderpacks/')&&x.path.endsWith('.zip')).length, testOverrides, files: managed }
    await fs.writeJson(path.join(target, '.vortex-test-snapshot.json'), result, { spaces: 2 })
    console.log(JSON.stringify({ ...result, files: undefined }, null, 2))
}

main().catch(error => { console.error(error); process.exitCode = 1 })
