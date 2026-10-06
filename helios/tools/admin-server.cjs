const http = require('http')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { ReleaseStore } = require('../vortex/release-store.cjs')
const { Providers } = require('../vortex/providers.cjs')
function startAdmin({ root = path.resolve(__dirname, '../.runtime/pack-admin'), port = 43117, password } = {}) {
    const store = new ReleaseStore(root)
    const providers = new Providers(root)
    const credentialsFile = path.join(root, 'admin-password.txt')
    // El panel local abre directamente; las pruebas pueden pedir autenticación explícita.
    const requirePassword = typeof password === 'string' && password.length > 0
    const sessions = new Map()
    const server = http.createServer(async (req, res) => {
        res.setHeader('Cache-Control', 'no-store')
        res.setHeader('X-Content-Type-Options', 'nosniff')
        res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; frame-ancestors 'none'; base-uri 'none'")
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
                if(req.url === '/api/state' && req.method === 'GET') {
                    const directory = path.join(root, 'drafts')
                    const drafts = fs.existsSync(directory) ? fs.readdirSync(directory).filter(n => n.endsWith('.json')).map(n => ({ id: n.slice(0, -5), ...store.getDraft(n.slice(0, -5)) })) : []
                    const channels = Object.fromEntries(['test', 'stable'].map(channel => { const file = path.join(root, 'channels', channel + '.json'); return [channel, fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : null] }))
                    return reply(200, { drafts, channels })
                }
                if(req.method !== 'POST') return reply(404, { error: 'Ruta no encontrada' })
                let result
                switch(req.url) {
                    case '/api/providers/key': {
                        if(typeof body.key !== 'string' || !body.key.trim() || body.key.length > 1024) throw Error('Clave inválida')
                        fs.writeFileSync(providers.keyFile, body.key.trim(), { mode: 0o600 }); result = { ok: true }; break
                    }
                    case '/api/providers/search': result = await providers.search(body.provider, String(body.query || '').slice(0,200), body.category); break
                    case '/api/providers/install': {
                        const draft = store.getDraft(body.id)
                        if(draft.revision !== body.revision) throw Error('Recarga el borrador')
                        if(body.replacePath && !draft.files.some(f => f.path === body.replacePath && f.path.startsWith(body.category + '/') && f.source?.provider === body.provider && String(f.source.projectId) === String(body.projectId))) throw Error('La actualización no corresponde al archivo seleccionado')
                        const file = await providers.latest(body.provider, body.projectId, body.category)
                        if(file.dependencies.length) throw Error('Esta versión requiere dependencias: instalación automática pendiente. Usa Añadir archivo tras revisar las dependencias.')
                        if(path.basename(file.filename) !== file.filename || !({ mods: '.jar', resourcepacks: '.zip', shaderpacks: '.zip' }[body.category]) || path.extname(file.filename).toLowerCase() !== { mods: '.jar', resourcepacks: '.zip', shaderpacks: '.zip' }[body.category]) throw Error('Archivo incompatible')
                        const temp = path.join(root, 'download-' + crypto.randomUUID())
                        fs.writeFileSync(temp, await providers.download(file))
                        try {
                            result = store.add(body.id, body.revision, temp, body.category + '/' + file.filename, 'managed', body.replacePath)
                            result = store.edit(body.id, result.revision, d => { d.files.find(f => f.path === body.category + '/' + file.filename).source = { provider: file.provider, projectId: file.projectId, fileId: file.fileId, version: file.version } })
                        } finally { fs.unlinkSync(temp) }
                        break
                    }
                    case '/api/providers/updates': {
                        const draft = store.getDraft(body.id), updates = []
                        for(const file of draft.files.filter(f => f.source && f.path.startsWith(body.category + '/'))) {
                            try { const latest = await providers.latest(file.source.provider, file.source.projectId, body.category); if(String(latest.fileId) !== String(file.source.fileId)) updates.push({ path: file.path, source: file.source, version: latest.version }) }
                            catch(error) { updates.push({ path: file.path, error: error.message }) }
                        }
                        result = updates; break
                    }
                    case '/api/library/create': {
                        const draftId = 'pack-' + crypto.randomUUID()
                        const source = body.source ? store.getDraft(body.source) : null
                        store.create(draftId, body.version, 'administrador local')
                        if(source) store.edit(draftId, 0, d => { d.files = structuredClone(source.files); d.notes = '' })
                        result = { id: draftId }; break
                    }
                    case '/api/create': result = store.create(body.id, body.version, 'administrador local'); break
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
                        if(body.replacePath && !store.getDraft(body.id).files.some(f => f.path === body.replacePath && f.path.startsWith(body.category + '/'))) throw Error('El archivo a sustituir no existe en esta categoría')
                        const upload = path.join(root, 'upload-' + crypto.randomUUID())
                        fs.writeFileSync(upload, data)
                        try { result = store.add(body.id, body.revision, upload, body.category + '/' + body.filename, body.category === 'config' ? 'seed' : 'managed', body.replacePath) }
                        finally { fs.unlinkSync(upload) }
                        break
                    }
                    case '/api/config/read':
                    case '/api/config/save': {
                        const file = store.getDraft(body.id).files.find(f => f.path === body.path)
                        if(!file || !file.path.startsWith('config/') || file.size > 1024 * 1024 || !['.json', '.toml', '.properties', '.txt', '.cfg', '.yaml', '.yml', '.conf', '.ini'].includes(path.extname(file.path).toLowerCase())) throw Error('Esta configuración no se puede editar como texto')
                        const current = fs.readFileSync(path.join(root, 'blobs', file.sha256))
                        if(current.includes(0)) throw Error('Archivo binario: usa Sustituir archivo')
                        if(req.url === '/api/config/read') { result = { path: file.path, text: current.toString('utf8') }; break }
                        if(typeof body.text !== 'string' || Buffer.byteLength(body.text) > 1024 * 1024 || body.text.includes('\0')) throw Error('Texto inválido')
                        if(file.path.endsWith('.json')) { try { JSON.parse(body.text) } catch { throw Error('JSON inválido: corrige el contenido antes de guardar') } }
                        const upload = path.join(root, 'upload-' + crypto.randomUUID()); fs.writeFileSync(upload, body.text)
                        try { result = store.add(body.id, body.revision, upload, file.path, 'seed') }
                        finally { fs.unlinkSync(upload) }
                        break
                    }
                    case '/api/publish': result = store.publish(body.id, body.revision, 'test'); result = { published: JSON.parse(result.payload).version }; break
                    default: return reply(404, { error: 'Ruta no encontrada' })
                }
                return reply(200, result)
            }
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
