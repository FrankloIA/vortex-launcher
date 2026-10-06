const http = require('http')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { ReleaseStore } = require('../vortex/release-store.cjs')
const { Providers } = require('../vortex/providers.cjs')
function startAdmin({ root = path.resolve(__dirname, '../.runtime/pack-admin'), port = 43117, password } = {}) {
    const store = new ReleaseStore(root)
    const providers = new Providers(root)
    const metadata = new (require('../vortex/content-metadata.cjs').ContentMetadata)(root, providers)
    const protection = new (require('../vortex/jarvis-protection.cjs').JarvisProtection)(root)
    const updateCache = new Map()
    const configTextCache = new Map()
    const canEditConfig = file => {
        const key=file?.path+':'+file?.sha256
        if(!configTextCache.has(key)) configTextCache.set(key,require('../vortex/config-text.cjs').editableConfig(file,sha=>fs.readFileSync(path.join(root,'blobs',sha))))
        return configTextCache.get(key)
    }
    const getCatalog = name => name?.startsWith('release:') ? store.releases().find(r => 'release:' + r.version === name) : store.getDraft(name)
    const targetFor = name => { const d=name ? getCatalog(name) : null;return d ? {minecraft:d.minecraft,loader:d.loader || 'neoforge'} : store.workspace().target }
    const Zip = require('adm-zip')
    const libraryMetadata = new Map()
    const instances = path.join(process.env.USERPROFILE, 'curseforge/minecraft/Instances')
    if(fs.existsSync(instances)) for(const folder of fs.readdirSync(instances)) {
        const metadata = path.join(instances, folder, 'minecraftinstance.json')
        if(!fs.existsSync(metadata)) continue
        try { for(const addon of JSON.parse(fs.readFileSync(metadata)).installedAddons || []) libraryMetadata.set(String(addon.addonID) + ':' + addon.installedFile?.id, { title: addon.name, author: (addon.authors || []).map(a => a.name).join(', '), icon: addon.attachment?.thumbnailUrl || addon.logo?.thumbnailUrl, version: addon.installedFile?.displayName || addon.installedFile?.fileName, filename:addon.installedFile?.fileName }) } catch {}
    }
    const credentialsFile = path.join(root, 'admin-password.txt')
    // El panel local abre directamente; las pruebas pueden pedir autenticación explícita.
    const requirePassword = typeof password === 'string' && password.length > 0
    const sessions = new Map()
    const server = http.createServer(async (req, res) => {
        res.setHeader('Cache-Control', 'no-store')
        res.setHeader('X-Content-Type-Options', 'nosniff')
        res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' https://cdn.modrinth.com https://media.forgecdn.net https://mediafilez.forgecdn.net; script-src 'self'; style-src 'self'; frame-ancestors 'none'; base-uri 'none'")
        const reply = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)) }
        try {
            const origin = `http://127.0.0.1:${server.address().port}`
            if(req.headers.host !== `127.0.0.1:${server.address().port}`) return reply(403, { error: 'Host no permitido' })
            if(req.method === 'POST' && (req.headers.origin !== origin || req.headers['content-type'] !== 'application/json')) return reply(403, { error: 'Origen no permitido' })
            let body = {}
            if(req.method === 'POST') {
                const chunks = []; let length = 0
                for await(const chunk of req) { length += chunk.length; if(length > 96 * 1024 * 1024) throw Error('Archivo demasiado grande: máximo 64 MiB'); chunks.push(chunk) }
                body = JSON.parse(Buffer.concat(chunks).toString())
            }
            if(req.url === '/api/login' && req.method === 'POST') {
                if(!requirePassword) return reply(200, { ok: true })
                const actual = crypto.createHash('sha256').update(String(body.password || '')).digest()
                const expected = crypto.createHash('sha256').update(password).digest()
                if(!crypto.timingSafeEqual(actual, expected)) return reply(401, { error: 'Contraseña incorrecta' })
                const session = crypto.randomBytes(32).toString('hex'); sessions.set(session, Date.now() + 8 * 3600000)
                res.setHeader('Set-Cookie', `vortex_admin=${session}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800`)
                return reply(200, { ok: true })
            }
            if(req.url.startsWith('/api/')) {
                const session = req.headers.cookie?.match(/(?:^|;\s*)vortex_admin=([a-f0-9]{64})(?:;|$)/)?.[1]
                if(requirePassword && (sessions.get(session) || 0) < Date.now()) return reply(401, { error: 'Inicia sesión para administrar' })
                if(req.url === '/api/targets' && req.method === 'GET') {
                    const response=await fetch('https://piston-meta.mojang.com/mc/game/version_manifest_v2.json',{signal:AbortSignal.timeout(15000)})
                    if(!response.ok) throw Error('No se pudo consultar el catálogo oficial de Minecraft')
                    const manifest=await response.json();return reply(200,{versions:manifest.versions.filter(v=>v.type==='release' && /^\d+\.\d+(\.\d+)?$/.test(v.id)).map(v=>v.id)})
                }
                if(req.method === 'GET' && /^\/api\/icon\/[a-f0-9]{64}$/.test(req.url)) {
                    try {
                        const zip = new Zip(fs.readFileSync(path.join(root, 'blobs', req.url.split('/').at(-1))))
                        const meta = zip.getEntries().find(e => /^(META-INF\/(neoforge\.)?mods\.toml|pack\.mcmeta)$/.test(e.entryName))
                        let logo = meta?.getData().toString().match(/logoFile\s*=\s*"([^"]+)"/)?.[1] || 'pack.png'
                        const fabric=zip.getEntry('fabric.mod.json')
                        if(fabric) {const icon=JSON.parse(fabric.getData()).icon;logo=typeof icon==='string'?icon:Object.values(icon || {}).at(-1) || logo}
                        const entry = zip.getEntries().find(e=>e.entryName.toLowerCase()===logo.replace(/\\/g,'/').toLowerCase()) || zip.getEntries().find(e=>/(^|\/)(logo|icon|pack)\.png$/i.test(e.entryName))
                        if(!entry || !/\.png$/i.test(logo) || entry.header.size > 2 * 1048576) return reply(404, { error: 'Sin imagen' })
                        res.writeHead(200, { 'Content-Type': 'image/png' }); return res.end(entry.getData())
                    } catch { return reply(404, { error: 'Sin imagen' }) }
                }
                if(req.url === '/api/state' && req.method === 'GET') {
                    store.recoverWorkspace()
                    const directory = path.join(root, 'drafts')
                    const drafts = fs.existsSync(directory) ? fs.readdirSync(directory).filter(n => n.endsWith('.json')).map(n => ({ id: n.slice(0, -5), ...store.getDraft(n.slice(0, -5)) })) : []
                    const channels = Object.fromEntries(['test', 'stable'].map(channel => { const file = path.join(root, 'channels', channel + '.json'); return [channel, fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : null] }))
                    const releases=store.releases()
                    drafts.push(...releases.slice(0,4).map(r=>({...r,id:'release:'+r.version,published:true,readOnly:true})))
                    for(const draft of drafts) {
                        draft.published = store.isOfficial(draft)
                        draft.status = store.isOfficial(draft) ? 'stable' : store.isPublished(draft) ? 'test' : 'draft'
                        for(const file of draft.files) {
                            if(file.path.startsWith('config/')) file.editableText=canEditConfig(file)
                            const cached=metadata.get(file);file.source ||= cached?.source
                            file.display = cached?.display || protection.display(file) || libraryMetadata.get(String(file.source?.projectId) + ':' + file.source?.fileId) || [...libraryMetadata.values()].find(item=>item.filename?.toLowerCase()===file.path.split('/').at(-1).toLowerCase())
                            file.protection=protection.status(file)
                        }
                    }
                    return reply(200, { drafts, channels, workspace:store.workspace(), history:releases.filter((r,index)=>index>0 || r.version===store.workspace().baselineVersion).slice(0,3).map(r=>({version:r.version,publishedAt:r.publishedAt,minecraft:r.minecraft,loader:r.loader || 'neoforge',files:r.files.length,notes:r.notes})), currentRelease:releases[0]?.version })
                }
                if(req.method !== 'POST') return reply(404, { error: 'Ruta no encontrada' })
                let result
                const mutations=['/api/library/rename','/api/library/delete','/api/library/mark-jarvis','/api/providers/install','/api/remove','/api/notes','/api/add','/api/library/add','/api/config/save','/api/config/autosave','/api/publish']
                if(mutations.includes(req.url) && store.workspace().activeId !== body.id) throw Error('Biblioteca de solo lectura: crea una nueva versión para modificar contenido')
                switch(req.url) {
                    case '/api/library/start': result = store.createNext(body.mode, body.source); break
                    case '/api/library/cancel': result=store.cancel(body.id,body.revision);break
                    case '/api/library/restore': {
                        if(store.workspace().activeId) throw Error('Cancela o publica la versión actual antes de recuperar una anterior')
                        result=store.restore(body.version);break
                    }
                    case '/api/target/save': {
                        if(store.workspace().activeId) throw Error('Termina o cancela la versión actual antes de cambiar Minecraft o loader')
                        if(typeof body.minecraft!=='string' || !/^\d+\.\d+(\.\d+)?$/.test(body.minecraft) || !['neoforge','forge','fabric','quilt'].includes(body.loader)) throw Error('Minecraft o loader inválido')
                        result=store.setWorkspace({target:{minecraft:body.minecraft,loader:body.loader}});break
                    }
                    case '/api/providers/identify': result=await metadata.identify(getCatalog(body.id).files);break
                    case '/api/library/mark-jarvis': {
                        result=store.edit(body.id,body.revision,d=>{const file=d.files.find(f=>f.path===body.path);if(!file || !/^(mods|resourcepacks|shaderpacks)\//.test(file.path))throw Error('Archivo inválido');file.customization=protection.mark(file);file.upstream=file.source || metadata.get(file)?.source || file.upstream});break
                    }
                    case '/api/library/rename': {
                        if(typeof body.version !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}( fixed)?$/.test(body.version)) throw Error('Nombre de versión inválido')
                        const directory = path.join(root, 'drafts')
                        if(fs.readdirSync(directory).filter(n => n.endsWith('.json') && n !== body.id + '.json').some(n => store.getDraft(n.slice(0, -5)).version.toLowerCase() === body.version.toLowerCase())) throw Error('Ya existe otro borrador con ese nombre')
                        if(fs.existsSync(path.join(root, 'releases', body.version + '.json'))) throw Error('Ese nombre ya está publicado; utiliza uno nuevo')
                        result = store.edit(body.id, body.revision, d => { d.version = body.version }); break
                    }
                    case '/api/library/delete': {
                        const draft = store.getDraft(body.id)
                        if(store.isPublished(draft)) throw Error('Las versiones publicadas no se pueden eliminar como borradores')
                        if(draft.revision !== body.revision) throw Error('El borrador cambió; recarga antes de eliminarlo')
                        fs.unlinkSync(store.draftFile(body.id))
                        result = { deleted: body.id, publishedVersionsPreserved: true }; break
                    }
                    case '/api/test/prepare': {
                        const version = getCatalog(body.id).version
                        const testing=require('../vortex/test-launcher.cjs').prepareTestLauncher(path.resolve(__dirname,'../.runtime'))
                        result = require('../vortex/test-release.cjs').prepareTestRelease(testing.instances, version)
                        result.account=testing.account
                        const launcher = require('child_process').spawn(path.resolve(__dirname, '../node_modules/electron/dist/electron.exe'), [path.resolve(__dirname, '..'), '--vortex-test'], { cwd: path.resolve(__dirname, '..'), detached: true, stdio: 'ignore', windowsHide: false })
                        await new Promise((resolve, reject) => { launcher.once('spawn', resolve); launcher.once('error', reject) })
                        launcher.unref()
                        result.launcherOpened = true
                        break
                    }
                    case '/api/providers/search': result = await providers.search(body.provider, String(body.query || '').slice(0,200), body.category,targetFor(body.id)); break
                    case '/api/providers/install': {
                        const draft = store.getDraft(body.id)
                        if(store.isOfficial(draft)) throw Error('Para añadir o modificar debes crear una nueva versión')
                        protection.assertCatalogReplacement(draft,body.replacePath,body.replacePath,body.projectId)
                        if(draft.revision !== body.revision) throw Error('Recarga el borrador')
                        if(body.replacePath && !draft.files.some(f => {const source=f.source || metadata.get(f)?.source;return f.path === body.replacePath && f.path.startsWith(body.category + '/') && source?.provider === body.provider && String(source.projectId) === String(body.projectId)})) throw Error('La actualización no corresponde al archivo seleccionado')
                        const file = await providers.latest(body.provider, body.projectId, body.category,targetFor(body.id))
                        protection.assertCatalogReplacement(draft,body.category+'/'+file.filename,body.replacePath,body.projectId)
                        if(file.dependencies.length) throw Error('Esta versión requiere dependencias: instalación automática pendiente. Usa Añadir archivo tras revisar las dependencias.')
                        if(path.basename(file.filename) !== file.filename || !({ mods: '.jar', resourcepacks: '.zip', shaderpacks: '.zip' }[body.category]) || path.extname(file.filename).toLowerCase() !== { mods: '.jar', resourcepacks: '.zip', shaderpacks: '.zip' }[body.category]) throw Error('Archivo incompatible')
                        const temp = path.join(root, 'download-' + crypto.randomUUID())
                        fs.writeFileSync(temp, await providers.download(file))
                        try {
                            result = store.add(body.id, body.revision, temp, body.category + '/' + file.filename, 'managed', body.replacePath, 'catalog')
                            result = store.edit(body.id, result.revision, d => { d.files.find(f => f.path === body.category + '/' + file.filename).source = { provider: file.provider, projectId: file.projectId, fileId: file.fileId, version: file.version } })
                        } finally { fs.unlinkSync(temp) }
                        break
                    }
                    case '/api/providers/updates': {
                        const draft = getCatalog(body.id), updates = []
                        await metadata.identify(draft.files)
                        for(const file of draft.files) file.source ||= metadata.get(file)?.source
                        const files=draft.files.filter(f => f.source && !protection.status(f).protected && f.path.startsWith(body.category + '/'))
                        let cursor=0
                        await Promise.all(Array.from({length:Math.min(6,files.length)},async()=>{
                            while(cursor<files.length) {
                                const file=files[cursor++], target=targetFor(body.id)
                                try {
                                    const key=JSON.stringify([file.source.provider,file.source.projectId,body.category,target])
                                    let cached=updateCache.get(key)
                                    if(!cached || cached.expires<Date.now() || body.force) {
                                        cached={expires:Date.now()+300000,promise:providers.latest(file.source.provider,file.source.projectId,body.category,target)}
                                        updateCache.set(key,cached);cached.promise.catch(()=>updateCache.delete(key))
                                    }
                                    const latest=await cached.promise
                                    if(String(latest.fileId)!==String(file.source.fileId) && !Object.entries(latest.hashes).some(([algo,h])=>crypto.createHash(algo).update(fs.readFileSync(path.join(root,'blobs',file.sha256))).digest('hex')===h.toLowerCase())) updates.push({path:file.path,source:file.source,version:latest.version})
                                } catch(error) { updates.push({path:file.path,error:error.message}) }
                            }
                        }))
                        result = updates; break
                    }
                    case '/api/library/create': {
                        const draftId = 'pack-' + crypto.randomUUID()
                        const source = body.source ? store.getDraft(body.source) : null
                        store.create(draftId, body.version, 'administrador local')
                        if(source) store.edit(draftId, 0, d => { d.files = structuredClone(source.files); d.notes = '' })
                        store.setWorkspace({activeId:draftId})
                        result = { id: draftId }; break
                    }
                    case '/api/create': result = store.create(body.id, body.version, 'administrador local'); store.setWorkspace({activeId:body.id});break
                    case '/api/remove': result = store.remove(body.id, body.revision, body.path); break
                    case '/api/notes': result = store.edit(body.id, body.revision, d => { if(typeof body.notes !== 'string' || body.notes.length > 20000) throw Error('Notas inválidas'); d.notes = body.notes }); break
                    case '/api/add': {
                        if(typeof body.base64 !== 'string') throw Error('Archivo inválido')
                        const data = Buffer.from(body.base64, 'base64')
                        if(data.length > 64 * 1024 * 1024) throw Error('Archivo demasiado grande')
                        const upload = path.join(root, 'upload-' + crypto.randomUUID())
                        fs.writeFileSync(upload, data)
                        try { result = store.add(body.id, body.revision, upload, body.path, body.policy) }
                        finally { fs.unlinkSync(upload) }
                        break
                    }
                    case '/api/library/add': {
                        const categories = { mods: ['.jar'], resourcepacks: ['.zip'], shaderpacks: ['.zip'], config: ['.json', '.toml', '.properties', '.txt', '.cfg', '.yaml', '.yml', '.conf', '.ini'] }
                        if(!categories[body.category] || typeof body.filename !== 'string' || path.basename(body.filename) !== body.filename || !categories[body.category].includes(path.extname(body.filename).toLowerCase())) throw Error('El archivo no corresponde a esta categoría')
                        if(typeof body.base64 !== 'string') throw Error('Archivo inválido')
                        const data = Buffer.from(body.base64, 'base64')
                        if(data.length > 64 * 1024 * 1024) throw Error('Máximo 64 MiB por archivo')
                        if(body.category !== 'config') {
                            const sha256=crypto.createHash('sha256').update(data).digest('hex')
                            const blob=path.join(root,'blobs',sha256);fs.mkdirSync(path.dirname(blob),{recursive:true});if(!fs.existsSync(blob))fs.writeFileSync(blob,data)
                            await metadata.identify([{path:body.category+'/'+body.filename,sha256}])
                            require('../vortex/local-compatibility.cjs').checkLocal(data,body.category,targetFor(body.id),metadata.get({sha256}))
                        }
                        if(body.replacePath && !store.getDraft(body.id).files.some(f => f.path === body.replacePath && f.path.startsWith(body.category + '/'))) throw Error('El archivo a sustituir no existe en esta categoría')
                        const upload = path.join(root, 'upload-' + crypto.randomUUID())
                        fs.writeFileSync(upload, data)
                        try { result = store.add(body.id, body.revision, upload, body.category + '/' + body.filename, body.category === 'config' ? 'seed' : 'managed', body.replacePath) }
                        finally { fs.unlinkSync(upload) }
                        break
                    }
                    case '/api/config/read':
                    case '/api/config/save': {
                        const file = getCatalog(body.id).files.find(f => f.path === body.path)
                        if(!canEditConfig(file)) throw Error('Esta configuración no se puede editar como texto')
                        const current = fs.readFileSync(path.join(root, 'blobs', file.sha256))
                        if(current.includes(0)) throw Error('Archivo binario: usa Sustituir archivo')
                        if(req.url === '/api/config/read') { result = { path: file.path, text: getCatalog(body.id).editorDrafts?.[body.path] ?? current.toString('utf8'), savedText:current.toString('utf8') }; break }
                        if(typeof body.text !== 'string' || Buffer.byteLength(body.text) > 1024 * 1024 || body.text.includes('\0')) throw Error('Texto inválido')
                        if(file.path.endsWith('.json')) { try { JSON.parse(body.text) } catch { throw Error('JSON inválido: corrige el contenido antes de guardar') } }
                        const upload = path.join(root, 'upload-' + crypto.randomUUID()); fs.writeFileSync(upload, body.text)
                        try { result = store.add(body.id, body.revision, upload, file.path, 'seed'); result = store.edit(body.id, result.revision, d => { if(d.editorDrafts) delete d.editorDrafts[body.path] }) }
                        finally { fs.unlinkSync(upload) }
                        break
                    }
                    case '/api/config/autosave': {
                        if(typeof body.text !== 'string' || Buffer.byteLength(body.text) > 1024 * 1024 || body.text.includes('\0')) throw Error('Texto inválido')
                        result = store.edit(body.id, body.revision, d => {
                            if(!d.files.some(f => f.path === body.path && f.path.startsWith('config/'))) throw Error('Configuración inexistente')
                            d.editorDrafts ||= {}; d.editorDrafts[body.path] = body.text
                        }); break
                    }
                    case '/api/publish': {
                        const target=targetFor(body.id)
                        if(target.minecraft!=='1.21.1' || target.loader!=='neoforge') throw Error('El launcher ejecutable actual admite Minecraft 1.21.1 y NeoForge; puedes preparar otros destinos pero todavía no probarlos con este ejecutable')
                        result = store.publish(body.id, body.revision, 'test'); result = { published: JSON.parse(result.payload).version }; break
                    }
                    default: return reply(404, { error: 'Ruta no encontrada' })
                }
                return reply(200, result)
            }
            if(req.url === '/vortex-logo.png' && req.method==='GET') {res.writeHead(200,{'Content-Type':'image/png'});return res.end(fs.readFileSync(path.resolve(__dirname,'../app/assets/images/vortex-icon-pixel.png')))}
            const assets = { '/': ['admin.html', 'text/html; charset=utf-8'], '/admin.js': ['admin.js', 'text/javascript'], '/syntax.js': ['syntax.js', 'text/javascript'], '/admin.css': ['admin.css', 'text/css'] }
            if(req.method !== 'GET' || !assets[req.url]) return reply(404, { error: 'Ruta no encontrada' })
            const [file, type] = assets[req.url]
            res.writeHead(200, { 'Content-Type': type }); res.end(fs.readFileSync(path.join(__dirname, '../vortex/admin', file)))
        } catch(error) { reply(400, { error: error.message }) }
    })
    return new Promise(resolve => server.listen(port, '127.0.0.1', () => resolve({ server, credentialsFile, url: `http://127.0.0.1:${server.address().port}` })))
}
if(require.main === module) startAdmin().then(({ url, credentialsFile }) => console.log(`Panel: ${url}\nContraseña local: ${credentialsFile}\nSolo canal de pruebas; no expuesto a Internet.`)).catch(e => { console.error(e.message); process.exitCode = 1 })
module.exports = { startAdmin }
