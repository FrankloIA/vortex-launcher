const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const hash = data => crypto.createHash('sha256').update(data).digest('hex')
const id = value => { if(typeof value !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/.test(value)) throw Error('Identificador inválido'); return value }
function safe(root, relative) {
    if(typeof relative !== 'string' || !relative || /[\\:\x00-\x1f]/.test(relative) || relative.startsWith('/') || relative.split('/').some(p => !p || p === '.' || p === '..' || /[. ]$/.test(p) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i.test(p))) throw Error('Ruta inválida')
    const target = path.resolve(root, relative)
    if(!target.startsWith(path.resolve(root) + path.sep)) throw Error('Ruta fuera de la instancia')
    let cursor = path.resolve(root)
    for(const segment of relative.split('/')) {
        cursor = path.join(cursor, segment)
        if(fs.existsSync(cursor) && fs.lstatSync(cursor).isSymbolicLink()) throw Error('Enlace simbólico no permitido')
    }
    return target
}
function atomic(file, data) {
    fs.mkdirSync(path.dirname(file), { recursive: true })
    const temporary = file + '.' + crypto.randomUUID() + '.tmp'
    fs.writeFileSync(temporary, data)
    fs.renameSync(temporary, file)
}
const json = (file, fallback) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback
const save = (file, value) => atomic(file, JSON.stringify(value, null, 2))
function validate(manifest) {
    if(manifest.schema !== 1 || manifest.minecraft !== '1.21.1' || manifest.neoforge !== '21.1.250' || !Array.isArray(manifest.files) || manifest.files.length > 10000) throw Error('Catálogo incompatible')
    id(manifest.version)
    const names = new Set()
    for(const file of manifest.files) {
        safe(path.resolve('.'), file.path)
        if(!/^(mods|resourcepacks|shaderpacks|config|defaultconfigs|kubejs|scripts|customnpcs|bivrik)\//.test(file.path) && !['options.txt', 'servers.dat'].includes(file.path)) throw Error('Archivo fuera del pack permitido')
        if(!['managed', 'seed'].includes(file.policy)) throw Error('Política inválida')
        if(!/^(mods|resourcepacks|shaderpacks)\//.test(file.path) && file.policy !== 'seed') throw Error('Configuración debe conservarse como seed en esta etapa')
        if(!/^[a-f0-9]{64}$/.test(file.sha256) || !Number.isSafeInteger(file.size) || file.size < 0) throw Error('Metadatos inválidos')
        const key = file.path.toLowerCase()
        if(names.has(key)) throw Error('Rutas duplicadas')
        names.add(key)
    }
    return manifest
}
class ReleaseStore {
    constructor(root) { this.root = path.resolve(root); fs.mkdirSync(this.root, { recursive: true }) }
    draftFile(name) { return path.join(this.root, 'drafts', id(name) + '.json') }
    getDraft(name) { const d = json(this.draftFile(name)); if(!d) throw Error('Borrador inexistente'); return d }
    create(name, version, author) {
        const target = this.draftFile(name)
        if(fs.existsSync(target)) throw Error('El borrador ya existe')
        const draft = { schema: 1, version: id(version), minecraft: '1.21.1', neoforge: '21.1.250', revision: 0, author, notes: '', files: [] }
        save(target, draft); return draft
    }
    edit(name, revision, change) {
        const draft = this.getDraft(name)
        if(draft.revision !== revision) throw Error('Conflicto: recarga el borrador')
        change(draft); validate(draft); draft.revision++; save(this.draftFile(name), draft); return draft
    }
    add(name, revision, source, target, policy, replacePath) {
        const data = fs.readFileSync(source)
        const sha256 = hash(data)
        const candidate = { path: target, sha256, size: data.length, policy }
        validate({ ...this.getDraft(name), files: [candidate] })
        const blob = path.join(this.root, 'blobs', sha256)
        if(!fs.existsSync(blob)) atomic(blob, data)
        return this.edit(name, revision, d => { d.files = d.files.filter(f => f.path.toLowerCase() !== target.toLowerCase() && f.path !== replacePath); d.files.push(candidate) })
    }
    remove(name, revision, target) { return this.edit(name, revision, d => { d.files = d.files.filter(f => f.path !== target) }) }
    publish(name, revision, channel = 'test') {
        if(channel !== 'test') throw Error('Solo publicación en pruebas habilitada; promoción estable pendiente de validación')
        const draft = validate(this.getDraft(name))
        if(draft.revision !== revision) throw Error('Conflicto de revisión')
        if(!draft.files.length) throw Error('No se publica un pack vacío')
        const releaseFile = path.join(this.root, 'releases', id(draft.version) + '.json')
        if(fs.existsSync(releaseFile)) throw Error('La versión es inmutable; usa una nueva versión')
        for(const file of draft.files) {
            const data = fs.readFileSync(path.join(this.root, 'blobs', file.sha256))
            if(data.length !== file.size || hash(data) !== file.sha256) throw Error('Blob corrupto')
        }
        const keyFile = path.join(this.root, 'private-signing-key.pem')
        if(!fs.existsSync(keyFile)) {
            const keys = crypto.generateKeyPairSync('ed25519')
            fs.writeFileSync(keyFile, keys.privateKey.export({ type: 'pkcs8', format: 'pem' }), { flag: 'wx', mode: 0o600 })
            fs.writeFileSync(path.join(this.root, 'public-signing-key.pem'), keys.publicKey.export({ type: 'spki', format: 'pem' }), { flag: 'wx' })
        }
        const manifest = { ...draft, publishedAt: new Date().toISOString() }
        const payload = JSON.stringify(manifest)
        const envelope = { payload, signature: crypto.sign(null, Buffer.from(payload), fs.readFileSync(keyFile)).toString('base64') }
        save(releaseFile, envelope)
        save(path.join(this.root, 'channels', channel + '.json'), { version: manifest.version, releaseSha256: hash(Buffer.from(JSON.stringify(envelope, null, 2))) })
        return envelope
    }
}
function verify(envelope, publicKey) {
    if(typeof envelope.payload !== 'string' || typeof envelope.signature !== 'string' || !crypto.verify(null, Buffer.from(envelope.payload), publicKey, Buffer.from(envelope.signature, 'base64'))) throw Error('Firma de publicación inválida')
    return validate(JSON.parse(envelope.payload))
}
function recover(instance) {
    safe(instance, '.vortex-update/journal.json')
    const journalFile = path.join(instance, '.vortex-update', 'journal.json')
    const journal = json(journalFile)
    if(!journal) return
    if(journal.phase !== 'committed') {
        for(const file of [...journal.changes].reverse()) {
            const target = safe(instance, file.path)
            const backup = safe(path.join(instance, '.vortex-update', 'backup'), file.path)
            if(file.existed) { fs.mkdirSync(path.dirname(target), { recursive: true }); fs.copyFileSync(backup, target) }
            else if(fs.existsSync(target)) fs.unlinkSync(target)
        }
        if(journal.previous) save(path.join(instance, '.vortex-owned.json'), journal.previous)
        else if(fs.existsSync(path.join(instance, '.vortex-owned.json'))) fs.unlinkSync(path.join(instance, '.vortex-owned.json'))
    }
    // Solo el directorio interno fijo de esta instancia; nunca rutas del catálogo.
    fs.rmSync(path.join(instance, '.vortex-update'), { recursive: true, force: true })
}
function applyRelease(instance, envelope, publicKey, blobReader, options = {}) {
    instance = path.resolve(instance)
    fs.mkdirSync(instance, { recursive: true })
    if(fs.lstatSync(instance).isSymbolicLink()) throw Error('Instancia enlazada no permitida')
    const lockFile = path.join(instance, '.vortex-update.lock')
    let lock
    try { lock = fs.openSync(lockFile, 'wx') } catch { throw Error('Otra actualización está activa; revisa el bloqueo antes de continuar') }
    try {
        recover(instance)
        const manifest = verify(envelope, publicKey)
        const ownedFile = path.join(instance, '.vortex-owned.json')
        const previous = json(ownedFile, null)
        if(previous) validate(previous)
        const priorFiles = new Map((previous?.files || []).map(file => [file.path.toLowerCase(), file]))
        const work = path.join(instance, '.vortex-update')
        const changes = []
        const nextNames = new Set(manifest.files.map(f => f.path.toLowerCase()))
        for(const file of manifest.files) {
            const target = safe(instance, file.path)
            if(file.policy === 'seed' && fs.existsSync(target)) continue
            if(fs.existsSync(target) && hash(fs.readFileSync(target)) === file.sha256) continue
            if(fs.existsSync(target) && !priorFiles.has(file.path.toLowerCase())) throw Error('Archivo existente ajeno a Vortex: ' + file.path)
            const data = blobReader(file.sha256)
            if(data.length !== file.size || hash(data) !== file.sha256) throw Error('Descarga corrupta: ' + file.path)
            const staging = safe(path.join(work, 'staging'), file.path)
            fs.mkdirSync(path.dirname(staging), { recursive: true }); fs.writeFileSync(staging, data)
            changes.push({ path: file.path, existed: fs.existsSync(target), remove: false })
        }
        for(const file of previous?.files || []) {
            if(file.policy !== 'managed' || nextNames.has(file.path.toLowerCase())) continue
            const target = safe(instance, file.path)
            if(!fs.existsSync(target)) continue
            if(hash(fs.readFileSync(target)) !== file.sha256) throw Error('Archivo retirado modificado por el jugador: ' + file.path)
            changes.push({ path: file.path, existed: true, remove: true })
        }
        for(const change of changes) {
            if(change.existed) {
                const backup = safe(path.join(work, 'backup'), change.path)
                fs.mkdirSync(path.dirname(backup), { recursive: true }); fs.copyFileSync(safe(instance, change.path), backup)
            }
        }
        save(path.join(work, 'journal.json'), { phase: 'applying', previous, changes })
        for(const change of changes) {
            const target = safe(instance, change.path)
            if(change.remove) fs.unlinkSync(target)
            else { fs.mkdirSync(path.dirname(target), { recursive: true }); fs.copyFileSync(safe(path.join(work, 'staging'), change.path), target) }
            options.afterChange?.(change)
        }
        save(ownedFile, manifest)
        save(path.join(work, 'journal.json'), { phase: 'committed', changes })
        recover(instance)
        return { version: manifest.version, changed: changes.length }
    } catch(error) { recover(instance); throw error }
    finally { fs.closeSync(lock); fs.unlinkSync(lockFile) }
}
module.exports = { ReleaseStore, applyRelease, verify, hash, safe, validate }

