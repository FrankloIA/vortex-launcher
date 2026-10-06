const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const hash = data => crypto.createHash('sha256').update(data).digest('hex')
const id = value => { if(typeof value !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/.test(value)) throw Error('Identificador inválido'); return value }
const versionName = value => { if(typeof value !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}( fixed)?$/.test(value)) throw Error('Nombre de versión inválido'); return value }
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
    if(manifest.schema !== 1 || !/^\d+\.\d+(\.\d+)?$/.test(manifest.minecraft) || !['neoforge','forge','fabric','quilt'].includes(manifest.loader || 'neoforge') || !Array.isArray(manifest.files) || manifest.files.length > 10000) throw Error('Catálogo incompatible')
    versionName(manifest.version)
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
    workspace() { return json(path.join(this.root,'workspace.json'),{activeId:null,target:{minecraft:'1.21.1',loader:'neoforge'}}) }
    setWorkspace(change) { const workspace={...this.workspace(),...change};save(path.join(this.root,'workspace.json'),workspace);return workspace }
    synchronizeLauncherVersion(version) {
        if(!/^\d+\.\d+\.\d+$/.test(version)) throw Error('Versión del launcher inválida')
        const workspace=this.workspace(),name=workspace.activeId
        if(name) {
            const draft=this.getDraft(name),match=draft.version.match(/^(\d+)\.(\d+)\.(\d+)( fixed)?$/)
            if(!this.isOfficial(draft) && match) {
                const current=match.slice(1,4).map(Number),next=version.split('.').map(Number)
                const newer=next.some((value,index)=>value>current[index] && next.slice(0,index).every((n,i)=>n===current[i]))
                if(newer) {
                    if(this.isPublished({version})) throw Error('La versión del launcher ya tiene una publicación: selecciona su borrador para continuar')
                    this.edit(name,draft.revision,d=>{d.version=version})
                }
            }
        }
        return this.setWorkspace({launcherVersion:version})
    }
    syncLauncherNotes(name) {
        const draft=this.getDraft(name), notes=require('./change-notes.cjs')
        if(this.isOfficial(draft)) return draft
        if(!draft.launcherBaseCommit) {draft.launcherBaseCommit=notes.sourceCommit();save(this.draftFile(name),draft)}
        const existing=new Set((draft.automaticNotes || []).map(n=>n.key)), additions=notes.launcherChanges(draft.launcherBaseCommit).filter(n=>!existing.has(n.key))
        return additions.length ? this.edit(name,draft.revision,d=>{d.automaticNotes ||= [];d.automaticNotes.push(...additions)}) : draft
    }
    recoverWorkspace() {
        const workspace=this.workspace()
        if(workspace.draftRecoveryApplied) return workspace
        const directory=path.join(this.root,'drafts')
        const drafts=fs.existsSync(directory) ? fs.readdirSync(directory).filter(n=>n.endsWith('.json')).map(n=>({id:n.slice(0,-5),draft:json(path.join(directory,n)),modified:fs.statSync(path.join(directory,n)).mtimeMs})).filter(item=>!this.isPublished(item.draft)).sort((a,b)=>b.modified-a.modified) : []
        return this.setWorkspace({activeId:workspace.activeId || drafts[0]?.id || null,draftRecoveryApplied:true})
    }
    releases() {
        const folder=path.join(this.root,'releases')
        return fs.existsSync(folder) ? fs.readdirSync(folder).filter(n=>n.endsWith('.json')).map(n=>JSON.parse(json(path.join(folder,n)).payload)).sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt)) : []
    }
    cancel(name,revision) {
        if(this.workspace().activeId !== name) throw Error('No hay una versión activa para cancelar')
        const draft=this.getDraft(name)
        if(draft.revision!==revision) throw Error('Recarga la versión antes de cancelarla')
        if(this.isOfficial(draft)) throw Error('La publicación se conserva; crea otra versión')
        save(path.join(this.root,'cancelled-drafts',crypto.randomUUID()+'.json'),{cancelledAt:new Date().toISOString(),draft})
        const releaseFile=path.join(this.root,'releases',draft.version+'.json')
        if(fs.existsSync(releaseFile)) {
            const history=path.join(this.root,'release-history');fs.mkdirSync(history,{recursive:true})
            fs.renameSync(releaseFile,path.join(history,'cancelled-'+crypto.randomUUID()+'.json'))
            const channelFile=path.join(this.root,'channels/test.json'),channel=json(channelFile)
            if(channel?.version===draft.version) {
                const previous=this.releases()[0]
                if(previous) save(channelFile,{version:previous.version,releaseSha256:hash(fs.readFileSync(path.join(this.root,'releases',previous.version+'.json'))),publishedAt:previous.publishedAt})
                else fs.unlinkSync(channelFile)
            }
        }
        fs.unlinkSync(this.draftFile(name));this.setWorkspace({activeId:null});return {cancelled:name}
    }
    restoreCancelled(version) {
        versionName(version)
        if(this.workspace().activeId) throw Error('Hay una versión de trabajo activa; no se sustituirá')
        let draft
        const backups=path.join(this.root,'cancelled-drafts')
        if(fs.existsSync(backups)) draft=fs.readdirSync(backups).filter(n=>n.endsWith('.json')).map(n=>json(path.join(backups,n))).filter(b=>b.draft.version===version).sort((a,b)=>b.cancelledAt.localeCompare(a.cancelledAt))[0]?.draft
        if(!draft) {
            const folder=path.join(this.root,'release-history')
            const manifests=fs.existsSync(folder)?fs.readdirSync(folder).filter(n=>n.startsWith('cancelled-') && n.endsWith('.json')).map(n=>verify(json(path.join(folder,n)),fs.readFileSync(path.join(this.root,'public-signing-key.pem')))).filter(r=>r.version===version):[]
            draft=manifests.sort((a,b)=>b.revision-a.revision || b.publishedAt.localeCompare(a.publishedAt))[0]
            if(draft) draft={...draft,notes:draft.manualNotes ?? draft.notes}
        }
        if(!draft) throw Error('No hay una instantánea recuperable de esta versión')
        draft=validate({...draft});if(this.isOfficial(draft)) throw Error('La versión ya está publicada oficialmente')
        for(const file of draft.files) {const bytes=fs.readFileSync(path.join(this.root,'blobs',file.sha256));if(bytes.length!==file.size || hash(bytes)!==file.sha256) throw Error('Archivo de recuperación corrupto: '+file.path)}
        delete draft.publishedAt;delete draft.manualNotes
        const name='recovered-'+crypto.randomUUID();save(this.draftFile(name),draft)
        this.setWorkspace({activeId:name,target:{minecraft:draft.minecraft,loader:draft.loader || 'neoforge'}})
        this.syncLauncherNotes(name)
        return {id:name,version,files:draft.files.length}
    }
    restore(version) {
        const manifest=this.releases().find(r=>r.version===version)
        if(!manifest) throw Error('Versión del historial inexistente')
        const name='pack-'+crypto.randomUUID(), releases=this.releases()
        const target=this.workspace().target
        let draftVersion=manifest.version.replace(/ fixed$/, '')+'-restored'
        let suffix=1
        while(this.isPublished({version:draftVersion}) || (fs.existsSync(path.join(this.root,'drafts')) && fs.readdirSync(path.join(this.root,'drafts')).filter(n=>n.endsWith('.json')).some(n=>json(path.join(this.root,'drafts',n)).version===draftVersion))) draftVersion=manifest.version.replace(/ fixed$/, '')+'-restored-'+suffix++
        const draft={...manifest,version:draftVersion,revision:0,notes:'',automaticNotes:[{key:crypto.randomUUID(),text:'Restauración completa de '+version}],launcherBaseCommit:require('./change-notes.cjs').sourceCommit(),restoredFrom:version}
        delete draft.publishedAt;delete draft.editorDrafts
        save(this.draftFile(name),draft);this.setWorkspace({activeId:name,target:{minecraft:draft.minecraft,loader:draft.loader || 'neoforge'}})
        return {id:name,version:draftVersion,restoredFrom:version}
    }
    create(name, version, author) {
        const target = this.draftFile(name)
        if(fs.existsSync(target)) throw Error('El borrador ya existe')
        const draft = { schema: 1, version: versionName(version), minecraft: '1.21.1', neoforge: '21.1.250', revision: 0, author, notes: '', automaticNotes:[],launcherBaseCommit:require('./change-notes.cjs').sourceCommit(),files: [] }
        save(target, draft); return draft
    }
    edit(name, revision, change) {
        const draft = this.getDraft(name)
        if(draft.revision !== revision) throw Error('Conflicto: recarga el borrador')
        if(this.isOfficial(draft)) throw Error('Para añadir o modificar debes crear una nueva versión')
        const before=structuredClone(draft)
        change(draft); validate(draft); require('./change-notes.cjs').recordChanges(before,draft); draft.revision++; save(this.draftFile(name), draft); return draft
    }
    add(name, revision, source, target, policy, replacePath, origin = 'local') {
        const data = fs.readFileSync(source)
        const sha256 = hash(data)
        const candidate = { path: target, sha256, size: data.length, policy }
        const draft=this.getDraft(name), protection=new (require('./jarvis-protection.cjs').JarvisProtection)(this.root)
        if(origin==='catalog') protection.assertCatalogReplacement(draft,target,replacePath)
        const old=draft.files.find(f=>f.path===replacePath || f.path.toLowerCase()===target.toLowerCase())
        if(origin==='local' && old && old.sha256!==sha256 && /^(mods|resourcepacks|shaderpacks)\//.test(target)) {
            candidate.customization=protection.mark(candidate,protection.upstream(old))
            candidate.upstream=protection.upstream(old)
        }
        validate({ ...this.getDraft(name), files: [candidate] })
        const blob = path.join(this.root, 'blobs', sha256)
        if(!fs.existsSync(blob)) atomic(blob, data)
        return this.edit(name, revision, d => { d.files = d.files.filter(f => f.path.toLowerCase() !== target.toLowerCase() && f.path !== replacePath); d.files.push(candidate) })
    }
    remove(name, revision, target) { return this.edit(name, revision, d => { d.files = d.files.filter(f => f.path !== target) }) }
    isOfficial(draft) { return json(path.join(this.root,'channels/stable.json'))?.version === draft.version || !!json(path.join(this.root,'official-releases.json'),{})[draft.version] }
    promote(name,revision) {
        const draft=this.getDraft(name)
        if(draft.revision!==revision) throw Error('Conflicto de revisión')
        if(this.isOfficial(draft)) throw Error('La versión ya es oficial')
        const run=new (require('./test-gate.cjs').TestGate)(this.root).assertPassed(name)
        const channel=json(path.join(this.root,'channels/test.json'))
        if(channel.releaseSha256!==run.releaseSha256) throw Error('La publicación cambió después de la prueba')
        save(path.join(this.root,'channels/stable.json'),channel)
        const history=json(path.join(this.root,'official-releases.json'),{});history[draft.version]=channel.releaseSha256;save(path.join(this.root,'official-releases.json'),history)
        this.setWorkspace({activeId:null})
        return {published:draft.version,releaseSha256:channel.releaseSha256}
    }
    isPublished(draft) { return fs.existsSync(path.join(this.root, 'releases', versionName(draft.version) + '.json')) }
    createNext(mode, sourceId) {
        if(this.workspace().activeId) throw Error('Continúa, publica o cancela la versión actual antes de crear otra')
        if(!['fix', 'new'].includes(mode)) throw Error('Tipo de versión inválido')
        const channel = json(path.join(this.root, 'channels', 'stable.json')) || json(path.join(this.root, 'channels', 'test.json'))
        const source = channel ? JSON.parse(json(path.join(this.root, 'releases', versionName(channel.version) + '.json')).payload) : sourceId ? this.getDraft(sourceId) : null
        const numbers = source?.version.match(/^(\d+)\.(\d+)\.(\d+)/)
        if(mode === 'fix' && !numbers) throw Error('Crea primero una versión para poder preparar un Fix')
        let version = '1.0.0'
        if(numbers) {
            const [, major, minor, patch] = numbers.map(Number)
            version = mode === 'fix' ? `${major}.${minor}.${patch} fixed` : `${major}.${minor + Math.floor((patch + 1) / 10)}.${(patch + 1) % 10}`
        }
        const directory = path.join(this.root, 'drafts')
        const exists = this.isPublished({version}) || (fs.existsSync(directory) && fs.readdirSync(directory).filter(n => n.endsWith('.json')).some(n => json(path.join(directory,n)).version === version))
        if(exists) throw Error('Ya existe la versión ' + version + '; selecciona su borrador para continuar')
        const name = 'pack-' + crypto.randomUUID()
        const target=this.workspace().target
        const sameTarget=!source || (source.minecraft===target.minecraft && (source.loader || 'neoforge')===target.loader)
        if(mode==='fix' && !sameTarget) throw Error('Un Fix debe usar la misma versión de Minecraft y loader que la publicación')
        const draft = { schema:1, version, minecraft:target.minecraft, loader:target.loader, neoforge:'21.1.250', revision:0, author:'administrador local', notes:'', automaticNotes:[],launcherBaseCommit:require('./change-notes.cjs').sourceCommit(),files:structuredClone(sameTarget ? source?.files || [] : []) }
        validate(draft); save(this.draftFile(name), draft)
        this.setWorkspace({activeId:name})
        return {id:name, version}
    }
    publish(name, revision, channel = 'test') {
        if(channel !== 'test') throw Error('Solo publicación en pruebas habilitada; promoción estable pendiente de validación')
        const draft = validate(this.getDraft(name))
        if(draft.revision !== revision) throw Error('Conflicto de revisión')
        if(!draft.files.length) throw Error('No se publica un pack vacío')
        if(Object.keys(draft.editorDrafts || {}).length) throw Error('Hay configuraciones pendientes: abre el editor y guarda los cambios antes de publicar')
        const releaseFile = path.join(this.root, 'releases', versionName(draft.version) + '.json')
        if(fs.existsSync(releaseFile)) {
            if(this.isOfficial(draft)) throw Error('La versión oficial es inmutable; usa una nueva versión')
            const archive=path.join(this.root,'release-history',draft.version+'-'+Date.now()+'.json');fs.mkdirSync(path.dirname(archive),{recursive:true});fs.copyFileSync(releaseFile,archive)
        }
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
        const manifest = { ...draft, manualNotes:draft.notes, notes:require('./change-notes.cjs').notesFor(draft), publishedAt: new Date().toISOString() }
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
            if(file.policy === 'seed' && fs.existsSync(target) && !options.replaceSeeds) {
                const prior=priorFiles.get(file.path.toLowerCase())
                if(!prior || hash(fs.readFileSync(target))!==prior.sha256) continue
            }
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

