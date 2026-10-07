const http = require('http')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { AstrolNodesApi } = require('../vortex/astrolnodes-api.cjs')
const { ReleaseStore } = require('../vortex/release-store.cjs')
const { Providers } = require('../vortex/providers.cjs')
function startAdmin({ root = path.resolve(__dirname, '../.runtime/pack-admin'), port = 43117, password, hostingApi, syncVersion=()=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'../package.json'))).version } = {}) {
    const store = new ReleaseStore(root)
    const gate=new (require('../vortex/test-gate.cjs').TestGate)(root)
    const publisher=new (require('../vortex/github-publisher.cjs').GithubPublisher)(root,undefined,undefined,{launcherBuild:require('../vortex/build-launcher.cjs').launcherBuild})
    let githubReady=false,publishing=false,preparingTest=false
    publisher.available().then(ready=>{githubReady=ready})
    const providers = new Providers(root)
    const metadata = new (require('../vortex/content-metadata.cjs').ContentMetadata)(root, providers)
    const protection = new (require('../vortex/jarvis-protection.cjs').JarvisProtection)(root)
    const updateCache = new Map()
    const hostingCredentials=new (require('../vortex/hosting-credentials.cjs').HostingCredentials)(root)
    const astrol=hostingApi || new AstrolNodesApi({token:()=>hostingCredentials.token()})
    const hostingStatus=new (require('../vortex/hosting-status.cjs').HostingStatus)(astrol)
    const serverConsole=new (require('../vortex/server-console.cjs').ServerConsole)(astrol)
    const serverWorkspace=new (require('../vortex/server-workspace.cjs').ServerWorkspace)(root,astrol)
    const hostPlan = body => {store.draftFile(body.id);return serverWorkspace.current(body.id)}
    const inspectDestination=async (data,source) => {
        let catalog
        if(source?.provider==='modrinth'){try{catalog=await providers.request('modrinth','project/'+encodeURIComponent(source.projectId))}catch{}}
        const review=require('../vortex/mod-destination.cjs').inspectMod(data,catalog && {client_side:catalog.client_side,server_side:catalog.server_side})
        const saved=path.join(root,'server','reviews',review.sha256+'.json')
        if(fs.existsSync(saved) && review.evidence.maxJava<=21){const manual=JSON.parse(fs.readFileSync(saved));return {...review,verified:true,destination:manual.destination,reason:'Doble revisión registrada para este hash: '+manual.documentation,evidence:{...review.evidence,manual}}}
        return review
    }
    const prepareRouting=async (body,data,source) => {
        if(body.category!=='mods')return null
        const review=await inspectDestination(data,source)
        if(review.verified && ['both','server'].includes(review.destination)) {
            serverWorkspace.editable(body.id,body.revision)
            if(!serverWorkspace.baseline().loaded)await serverWorkspace.inventory()
            review.serverReplace=await serverWorkspace.replacementFor(body.id,'mods/'+body.filename,data,source)
            const previous=serverWorkspace.view(body.id).files.find(f=>f.path===review.serverReplace)
            if(source?.provider && previous?.protection?.protected)throw Error('El servidor conserva una variante Jarvis o sin identificar; no puede sustituirse desde el catálogo')
        }
        return review
    }
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
            const requestUrl=new URL(req.url,origin),route=requestUrl.pathname
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
                if(req.url === '/api/test/status' && req.method==='GET') {
                    const id=store.workspace().activeId
                    return reply(200,{id,testResult:id ? gate.status(id) : null,githubReady,publishing})
                }
                if(route==='/api/server/console' && req.method==='GET')return reply(200,await serverConsole.read(Math.max(0,Number(requestUrl.searchParams.get('since')) || 0)))
                if(route === '/api/server/status' && req.method === 'GET') {
                    return reply(200, await hostingStatus.get(requestUrl.searchParams.get('force')==='true'))
                }
                if(route === '/api/server/files' && req.method === 'GET') {
                    if(!astrol.configured()) return reply(200, { configured:false, data:[] })
                    const directory = requestUrl.searchParams.get('directory') || '/'
                    if(!/^\/(mods|resourcepacks|config|defaultconfigs|plugins)(\/|$)/.test(directory) && directory!=='/')throw Error('Carpeta fuera de la biblioteca')
                    return reply(200, { configured:true, data:await astrol.list(directory) })
                }
                if(route==='/api/server/library' && req.method==='GET') {
                    const id=requestUrl.searchParams.get('id');if(id && !id.startsWith('release:'))store.getDraft(id)
                    return reply(200,serverWorkspace.view(id))
                }
                if(route==='/api/server/backups' && req.method==='GET') {
                    return reply(200,{backups:await astrol.backups()})
                }
                if(route==='/api/server/job' && req.method==='GET') {
                    return reply(200,{job:serverWorkspace.job})
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
                    if(syncVersion) store.synchronizeLauncherVersion(syncVersion())
                    if(store.workspace().activeId) store.syncLauncherNotes(store.workspace().activeId)
                    const directory = path.join(root, 'drafts')
                    const drafts = fs.existsSync(directory) ? fs.readdirSync(directory).filter(n => n.endsWith('.json')).map(n => ({ id: n.slice(0, -5), ...store.getDraft(n.slice(0, -5)) })) : []
                    const channels = Object.fromEntries(['test', 'stable'].map(channel => { const file = path.join(root, 'channels', channel + '.json'); return [channel, fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : null] }))
                    const releases=store.releases()
                    drafts.push(...releases.filter(r=>!drafts.some(d=>d.version===r.version)).slice(0,4).map(r=>({...r,id:'release:'+r.version,published:true,readOnly:true})))
                    for(const draft of drafts) {
                        draft.published = store.isOfficial(draft)
                        draft.status = store.isOfficial(draft) ? 'stable' : releases.some(r=>r.version===draft.version && r.revision===draft.revision) ? 'test' : 'draft'
                        if(draft.readOnly) draft.notes=draft.manualNotes ?? draft.notes
                        if(!draft.readOnly) draft.testResult=gate.status(draft.id)
                        for(const file of draft.files) {
                            if(file.path.startsWith('config/')) file.editableText=canEditConfig(file)
                            const cached=metadata.get(file);file.source ||= cached?.source
                            file.display = cached?.display || protection.display(file) || libraryMetadata.get(String(file.source?.projectId) + ':' + file.source?.fileId) || [...libraryMetadata.values()].find(item=>item.filename?.toLowerCase()===file.path.split('/').at(-1).toLowerCase())
                            file.protection=protection.status(file)
                        }
                    }
                    return reply(200, { drafts, channels, githubReady, publishing, workspace:store.workspace(), hosting:{configured:astrol.configured(),job:serverWorkspace.job}, history:releases.filter(r=>store.isOfficial(r)).slice(0,3).map(r=>({version:r.version,publishedAt:r.publishedAt,minecraft:r.minecraft,loader:r.loader || 'neoforge',files:r.files.length,notes:r.notes})), currentRelease:releases[0]?.version })
                }
                if(req.method !== 'POST') return reply(404, { error: 'Ruta no encontrada' })
                let result
                if(publishing || preparingTest) throw Error('Espera a que termine la publicación o la preparación de la prueba antes de modificar')
                const mutations=['/api/library/rename','/api/library/delete','/api/library/mark-jarvis','/api/providers/install','/api/remove','/api/notes','/api/add','/api/library/add','/api/config/save','/api/config/autosave','/api/publish']
                if(serverWorkspace.job?.running && (mutations.includes(req.url) || ['/api/library/start','/api/library/cancel','/api/publish/official','/api/test/prepare','/api/library/restore'].includes(req.url)))throw Error('Espera a que termine la operación del servidor')
                if(mutations.includes(req.url) && store.workspace().activeId !== body.id) throw Error('Biblioteca de solo lectura: crea una nueva versión para modificar contenido')
                switch(req.url) {
                    case '/api/server/command': {if(serverWorkspace.job?.running)throw Error('Espera a que termine la operación del servidor');result=await serverConsole.command(body.command);break}
                    case '/api/server/connect': {
                        const previous=hostingCredentials.session;hostingCredentials.set(body.token,false)
                        try{await astrol.details();result=hostingCredentials.set(body.token,body.persist===true);hostingStatus.cached=null}catch(error){hostingCredentials.session=previous;throw error}break
                    }
                    case '/api/server/power': {
                        if(!['start','stop','restart'].includes(body.signal))throw Error('Operación de encendido inválida')
                        result=serverWorkspace.start({start:'Arrancando servidor',stop:'Apagando servidor con aviso de 10 segundos',restart:'Reiniciando servidor con aviso de 10 segundos'}[body.signal],async()=>{
                            if(body.signal==='restart')return astrol.restart()
                            const status=await astrol.status()
                            if(body.signal==='start'){if(status.state!=='offline')throw Error('El servidor debe estar apagado para arrancarlo');await astrol.power('start')}
                            else{if(status.state!=='running')throw Error('El servidor debe estar encendido para apagarlo');await astrol.warn();await astrol.power('stop');await astrol.waitOffline()}
                            return {requested:true}
                        });break
                    }
                    case '/api/server/import': {
                        if(store.workspace().activeId && serverWorkspace.current(store.workspace().activeId)?.changes.length)throw Error('Hay cambios preparados; aplícalos o cancela la versión antes de recargar la base')
                        result=serverWorkspace.start('Cargando biblioteca del servidor',()=>serverWorkspace.inventory());break
                    }
                    case '/api/server/analyze': result=serverWorkspace.start('Identificando imágenes y actualizaciones',job=>serverWorkspace.analyze(metadata,job));break
                    case '/api/server/backup': result=serverWorkspace.start('Creando backup',job=>require('../vortex/server-backup.cjs').createServerBackup(astrol,'Vortex manual '+new Date().toISOString(),job));break
                    case '/api/server/deploy': {
                        serverWorkspace.editable(body.id,body.revision)
                        result=serverWorkspace.start('Preparando despliegue del servidor',job=>serverWorkspace.deploy(body.id,body.revision,job));break
                    }
                    case '/api/server/rollback': result=await serverWorkspace.prepareRollback(body.id,body.revision);break
                    case '/api/server/remove': result=await serverWorkspace.remove(body.id,body.revision,body.path);break
                    case '/api/server/config/read': result=await serverWorkspace.config(body.id,body.path);break
                    case '/api/server/config/save': {
                        if(typeof body.text!=='string' || Buffer.byteLength(body.text)>1048576 || body.text.includes('\0'))throw Error('Configuración de texto inválida')
                        if(body.path.endsWith('.json'))JSON.parse(body.text)
                        const plan=hostPlan(body);if(!(plan?.files || serverWorkspace.baseline().files).some(f=>f.path===body.path && f.editableText))throw Error('Configuración inexistente')
                        result=await serverWorkspace.add(body.id,body.revision,body.path,Buffer.from(body.text))
                        const nextPlan=hostPlan(body);if(nextPlan?.editorDrafts){delete nextPlan.editorDrafts[body.path];require('../vortex/release-store.cjs').atomic(serverWorkspace.planFile(body.id),JSON.stringify(nextPlan,null,2))}break
                    }
                    case '/api/server/config/autosave': {
                        if(typeof body.text!=='string' || Buffer.byteLength(body.text)>1048576 || body.text.includes('\0'))throw Error('Texto inválido')
                        result=serverWorkspace.autosave(body.id,body.revision,body.path,body.text);break
                    }
                    case '/api/server/updates': {
                        const files=serverWorkspace.view(body.id).files.filter(f=>f.path.startsWith(body.category+'/') && f.source && !f.protection?.protected)
                        result=[]
                        for(const file of files)try{const latest=await providers.latest(file.source.provider,file.source.projectId,body.category,targetFor(body.id));if(String(latest.fileId)!==String(file.source.fileId))result.push({path:file.path,source:file.source,version:latest.version})}catch(error){result.push({path:file.path,error:error.message})}break
                    }
                    case '/api/server/update': {
                        serverWorkspace.editable(body.id,body.revision)
                        const file=serverWorkspace.view(body.id).files.find(f=>f.path===body.path);if(!file?.source || file.protection?.protected)throw Error('El archivo del servidor está protegido o sin identidad exacta')
                        const category=file.path.split('/')[0],latest=await providers.latest(file.source.provider,file.source.projectId,category,targetFor(body.id)),data=await providers.download(latest)
                        require('../vortex/local-compatibility.cjs').checkLocal(data,category,targetFor(body.id))
                        if(latest.dependencies.length)throw Error('Revisa las dependencias requeridas antes de actualizar este mod del servidor')
                        const review=category==='mods'?await inspectDestination(data,file.source):null;if(review && (!review.verified || review.destination==='client'))throw Error('Revisa el destino de esta versión antes de actualizar el servidor')
                        result=await serverWorkspace.add(body.id,body.revision,category+'/'+latest.filename,data,file.path,{provider:file.source.provider,projectId:file.source.projectId,fileId:latest.fileId,version:latest.version});break
                    }
                    case '/api/server/add': {
                        serverWorkspace.editable(body.id,body.revision)
                        if(typeof body.base64!=='string')throw Error('Archivo inválido');const data=Buffer.from(body.base64,'base64')
                        if(data.length>64*1048576)throw Error('Máximo 64 MiB por archivo')
                        if(typeof body.filename!=='string' || path.basename(body.filename)!==body.filename)throw Error('Nombre inválido')
                        const category=body.category;if(!['mods','resourcepacks','config','plugins','defaultconfigs'].includes(category))throw Error('Categoría de servidor inválida')
                        if(category==='mods') {
                            require('../vortex/local-compatibility.cjs').checkLocal(data,category,targetFor(body.id))
                            const review=await inspectDestination(data)
                            if(!review.verified || review.destination==='client')throw Error(review.reason+' · Revisa el destino desde Biblioteca del launcher')
                        }
                        if(category==='plugins' && (!/\.jar$/i.test(body.filename) || !new Zip(data).getEntry('plugin.yml')))throw Error('Se necesita un plugin Bukkit compatible con Arclight')
                        if(category==='resourcepacks')require('../vortex/local-compatibility.cjs').checkLocal(data,category,targetFor(body.id))
                        result=await serverWorkspace.add(body.id,body.revision,category+'/'+body.filename,data,body.replacePath);break
                    }
                    case '/api/server/review': {
                        const draft=store.getDraft(body.id),file=draft.files.find(f=>f.path===body.path && f.path.startsWith('mods/'));if(!file)throw Error('Mod inexistente')
                        result=await inspectDestination(fs.readFileSync(path.join(root,'blobs',file.sha256)),file.source || metadata.get(file)?.source);break
                    }
                    case '/api/server/review/save': {
                        serverWorkspace.editable(body.id,body.revision)
                        if(!['client','server','both'].includes(body.destination) || typeof body.documentation!=='string' || body.documentation.trim().length<20 || body.documentation.length>3000)throw Error('Registra el destino y la evidencia de la documentación del proyecto')
                        const file=store.getDraft(body.id).files.find(f=>f.path===body.path && f.path.startsWith('mods/'));if(!file)throw Error('Mod inexistente')
                        const review=await inspectDestination(fs.readFileSync(path.join(root,'blobs',file.sha256)),file.source || metadata.get(file)?.source)
                        if(review.evidence.maxJava>21)throw Error('Este JAR requiere una versión de Java superior a la del servidor')
                        require('../vortex/release-store.cjs').atomic(path.join(root,'server','reviews',file.sha256+'.json'),JSON.stringify({destination:body.destination,documentation:body.documentation.trim(),evidence:review.evidence,sha256:file.sha256,reviewedAt:new Date().toISOString()}))
                        serverWorkspace.note(body.id,body.revision,'Destino revisado para '+file.path+': '+body.destination);result={saved:true};break
                    }
                    case '/api/server/stage-client': {
                        serverWorkspace.editable(body.id,body.revision)
                        const file=store.getDraft(body.id).files.find(f=>f.path===body.path && f.path.startsWith('mods/'));if(!file)throw Error('Mod inexistente')
                        const data=fs.readFileSync(path.join(root,'blobs',file.sha256)),review=await inspectDestination(data,file.source || metadata.get(file)?.source)
                        if(!review.verified || review.destination==='client')throw Error(review.reason)
                        const replace=body.replacePath || await serverWorkspace.replacementFor(body.id,file.path,data)
                        result=await serverWorkspace.add(body.id,body.revision,file.path,data,replace);break
                    }
                    case '/api/library/start': result = store.createNext(body.mode, body.source); break
                    case '/api/library/cancel': result=store.cancel(body.id,body.revision);break
                    case '/api/library/restore': {
                        if(store.workspace().activeId) throw Error('Cancela o publica la versión actual antes de recuperar una anterior')
                        result=store.restore(body.version)
                        result.server=await serverWorkspace.prepareRestore(result.id,store.getDraft(result.id).revision,body.version);break
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
                        const snapshot=gate.snapshot(body.id), version=snapshot.version
                        const previousId=store.workspace().testRunId
                        if(previousId) {
                            const previous=gate.read(previousId)
                            if(previous.launcherPid && !previous.launcherClosedNormally) {
                                let alive=false;try {process.kill(previous.launcherPid,0);alive=true} catch {}
                                if(alive) throw Error('Cierra el juego y el launcher de pruebas antes de preparar otra prueba')
                            }
                        }
                        preparingTest=true
                        try {
                        const build=await require('../vortex/build-launcher.cjs').ensureLauncherBuild(version)
                        const run=gate.prepare(body.id)
                        const testing=require('../vortex/test-launcher.cjs').prepareTestLauncher(path.resolve(__dirname,'../.runtime'))
                        result = require('../vortex/test-release.cjs').prepareTestRelease(testing.instances, version)
                        result.account=testing.account
                        const launcher = require('child_process').spawn(build.executable, ['--vortex-test','--vortex-test-run='+run.id], { cwd: path.resolve(__dirname, '..'), detached: true, stdio: 'ignore', windowsHide: false,env:{...process.env,VORTEX_TEST_DIRECTORY:testing.root,VORTEX_ADMIN_ROOT:root,VORTEX_SOURCE_ROOT:path.resolve(__dirname,'..')} })
                        await new Promise((resolve, reject) => { launcher.once('spawn', resolve); launcher.once('error', reject) })
                        launcher.unref()
                        gate.launcherStarted(run.id,launcher.pid)
                        result.launcherOpened = true
                        result.launcherVersion=build.version
                        } finally {preparingTest=false}
                        break
                    }
                    case '/api/test/approve': result=gate.approve(body.id,body.runId);break
                    case '/api/test/reject': {
                        const run=gate.status(body.id);if(run.id!==body.runId) throw Error('Prueba inválida')
                        result=gate.fail(run.id,'Se encontraron problemas durante la prueba');break
                    }
                    case '/api/publish/official': {
                        if(store.workspace().activeId!==body.id) throw Error('Selecciona la versión activa')
                        serverWorkspace.assertOfficial(body.id)
                        store.syncLauncherNotes(body.id);gate.assertPassed(body.id)
                        publishing=true
                        try {const serverSnapshot=await serverWorkspace.archiveOfficial(body.id);result=await publisher.publish(body.id,body.revision);serverWorkspace.saveOfficial(serverSnapshot)} finally {publishing=false}
                        break
                    }
                    case '/api/providers/search': result = await providers.search(body.provider, String(body.query || '').slice(0,200), body.category,targetFor(body.id)); break
                    case '/api/providers/catalog': {
                        result=await providers.search(body.provider,String(body.query || '').slice(0,200),body.category,targetFor(body.id),{offset:body.offset,paginated:true})
                        const files=getCatalog(body.id)?.files || []
                        result.items=result.items.filter(item=>!files.some(file=>{
                            if(!file.path.startsWith(body.category+'/')) return false
                            const info=metadata.get(file),source=file.source || info?.source,display=file.display || info?.display
                            return source?.provider===body.provider && String(source.projectId)===String(item.projectId) || display?.title?.trim().toLowerCase()===item.title.trim().toLowerCase()
                        }))
                        break
                    }
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
                        const bytes=await providers.download(file),routing=await prepareRouting({...body,filename:file.filename},bytes,{provider:body.provider,projectId:body.projectId})
                        fs.writeFileSync(temp, bytes)
                        try {
                            if(routing?.verified && routing.destination==='server') {
                                await serverWorkspace.add(body.id,body.revision,body.category+'/'+file.filename,bytes,routing.serverReplace,{provider:file.provider,projectId:file.projectId,fileId:file.fileId,version:file.version})
                                result=store.getDraft(body.id);break
                            }
                            result = store.add(body.id, body.revision, temp, body.category + '/' + file.filename, 'managed', body.replacePath, 'catalog')
                            result = store.edit(body.id, result.revision, d => { d.files.find(f => f.path === body.category + '/' + file.filename).source = { provider: file.provider, projectId: file.projectId, fileId: file.fileId, version: file.version } })
                            if(routing?.verified && routing.destination==='both'){await serverWorkspace.add(body.id,result.revision,body.category+'/'+file.filename,bytes,routing.serverReplace,{provider:file.provider,projectId:file.projectId,fileId:file.fileId,version:file.version});result=store.getDraft(body.id)}
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
                        const routing=await prepareRouting(body,data,metadata.get({sha256:crypto.createHash('sha256').update(data).digest('hex')})?.source)
                        fs.writeFileSync(upload, data)
                        try {
                            if(routing?.verified && routing.destination==='server'){await serverWorkspace.add(body.id,body.revision,body.category+'/'+body.filename,data,routing.serverReplace);result=store.getDraft(body.id)}
                            else {
                                result = store.add(body.id, body.revision, upload, body.category + '/' + body.filename, body.category === 'config' ? 'seed' : 'managed', body.replacePath)
                                if(routing?.verified && routing.destination==='both'){await serverWorkspace.add(body.id,result.revision,body.category+'/'+body.filename,data,routing.serverReplace);result=store.getDraft(body.id)}
                            }
                        }
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
            if(req.url==='/vortex-background.png' && req.method==='GET'){res.writeHead(200,{'Content-Type':'image/png'});return res.end(fs.readFileSync(path.resolve(__dirname,'../app/assets/images/vortex-night.png')))}
            const assets = { '/server-tabs.js': ['server-tabs.js','text/javascript'], '/console.js': ['console.js','text/javascript'], '/design.js': ['design.js','text/javascript'], '/design.css': ['design.css','text/css'], '/': ['admin.html', 'text/html; charset=utf-8'], '/admin.js': ['admin.js', 'text/javascript'], '/syntax.js': ['syntax.js', 'text/javascript'], '/admin.css': ['admin.css', 'text/css'] }
            if(req.method !== 'GET' || !assets[req.url]) return reply(404, { error: 'Ruta no encontrada' })
            const [file, type] = assets[req.url]
            res.writeHead(200, { 'Content-Type': type }); res.end(fs.readFileSync(path.join(__dirname, '../vortex/admin', file)))
        } catch(error) { reply(400, { error: error.message }) }
    })
    server.on('close',()=>serverConsole.close())
    return new Promise(resolve => server.listen(port, '127.0.0.1', () => resolve({ server, credentialsFile, url: `http://127.0.0.1:${server.address().port}` })))
}
if(require.main === module) startAdmin().then(({ url, credentialsFile }) => console.log(`Panel: ${url}\nContraseña local: ${credentialsFile}\nSolo canal de pruebas; no expuesto a Internet.`)).catch(e => { console.error(e.message); process.exitCode = 1 })
module.exports = { startAdmin }
