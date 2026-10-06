// Importa únicamente referencias exactas del export; nunca sustituye por latest.
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const Zip = require('adm-zip')
const { ReleaseStore, hash, safe, validate } = require('../vortex/release-store.cjs')
const [source, instances, name, version] = process.argv.slice(2)
if(!source || !instances || !name || !version) throw Error('Indica ZIP, carpeta de instancias, borrador y versión')
const bytes = fs.readFileSync(source)
const zip = new Zip(bytes)
const manifest = JSON.parse(zip.readAsText('manifest.json'))
if(manifest.minecraft.version !== '1.21.1' || !manifest.minecraft.modLoaders.some(x => x.id === 'neoforge-21.1.250')) throw Error('Export incompatible')
const caches = fs.readdirSync(instances, { withFileTypes: true }).filter(x => x.isDirectory()).flatMap(x => {
    const root = path.join(instances, x.name)
    const file = path.join(root, 'minecraftinstance.json')
    return fs.existsSync(file) ? [{ root, data: JSON.parse(fs.readFileSync(file)) }] : []
})
const files = new Map(), missing = [], origins = []
for(const ref of manifest.files) {
    let resolved
    for(const cache of caches) {
        const addon = cache.data.installedAddons?.find(x => x.addonID === ref.projectID && x.installedFile?.id === ref.fileID)
        if(!addon) continue
        const f = addon.installedFile, folder = addon.categorySection?.path
        if(!['mods', 'resourcepacks', 'shaderpacks'].includes(folder)) continue
        const target = folder + '/' + (addon.fileNameOnDisk || f.fileName)
        const file = safe(cache.root, target)
        if(!fs.existsSync(file)) continue
        const data = fs.readFileSync(file)
        if(data.length !== f.fileLength || !f.hashes?.length || !f.hashes.every(h => [1, 2].includes(h.type) && crypto.createHash(h.type === 1 ? 'sha1' : 'md5').update(data).digest('hex') === h.value.toLowerCase())) continue
        resolved = { target, data, metadata: { provider: 'curseforge', projectId: ref.projectID, fileId: ref.fileID, title: addon.name } }
        break
    }
    if(!resolved) missing.push(ref)
    else { files.set(resolved.target.toLowerCase(), resolved); origins.push(resolved.metadata) }
}
const skipped = []
for(const entry of zip.getEntries()) {
    if(entry.isDirectory || !entry.entryName.startsWith(manifest.overrides + '/')) continue
    const target = entry.entryName.slice(manifest.overrides.length + 1)
    safe(path.resolve('.'), target)
    if(!/^(mods|resourcepacks|shaderpacks|config|defaultconfigs|kubejs|scripts|customnpcs|bivrik)\//.test(target) && !['options.txt', 'servers.dat'].includes(target)) { skipped.push(target); continue }
    const data = entry.getData(), previous = files.get(target.toLowerCase())
    if(previous && hash(previous.data) !== hash(data)) throw Error('Colisión de override: ' + target)
    files.set(target.toLowerCase(), { target, data, metadata: previous?.metadata })
}
const report = { zip: path.basename(source), sha256: hash(bytes), version, references: manifest.files.length, resolved: origins.length, missing, skipped, counts: {}, files: [...files.values()].map(f => ({ path: f.target, sha256: hash(f.data), size: f.data.length, policy: /^(mods|resourcepacks|shaderpacks)\//.test(f.target) ? 'managed' : 'seed', source: f.metadata })) }
for(const file of report.files) { const category = file.path.split('/')[0]; report.counts[category] = (report.counts[category] || 0) + 1 }
const reportFile = path.resolve(__dirname, '../../docs/stage-3/import-' + version + '.json')
fs.writeFileSync(reportFile, JSON.stringify(report, null, 2))
if(missing.length) { console.log(JSON.stringify({ ...report, files: undefined, skipped: undefined })); throw Error('Importación detenida: faltan referencias exactas; informe guardado') }
const store = new ReleaseStore(path.resolve(__dirname, '../.runtime/pack-admin'))
validate({ schema: 1, minecraft: '1.21.1', neoforge: '21.1.250', version, files: report.files })
// Todos los archivos están verificados antes de crear el borrador.
store.create(name, version, 'Importación local de export CurseForge')
for(const file of files.values()) {
    const sha = hash(file.data), destination = path.join(store.root, 'blobs', sha)
    fs.mkdirSync(path.dirname(destination), { recursive: true })
    if(!fs.existsSync(destination)) fs.writeFileSync(destination, file.data, { flag: 'wx' })
    if(hash(fs.readFileSync(destination)) !== sha) throw Error('Blob alterado')
}
store.edit(name, 0, d => { d.files = report.files; d.notes = 'Importado desde ' + report.zip + '. Referencias exactas verificadas. Pendiente de prueba de arranque y revisión de redistribución.' })
if(hash(fs.readFileSync(source)) !== report.sha256) throw Error('El ZIP cambió durante la importación')
console.log(JSON.stringify({ draft: name, files: report.files.length, counts: report.counts, skipped: skipped.length, originalUnchanged: true }))

