const get = id => document.getElementById(id)
const names = { mods: 'Mods', resourcepacks: 'Resourcepacks', shaderpacks: 'Shaders', config: 'Configuraciones' }
const extensions = { mods: '.jar', resourcepacks: '.zip', shaderpacks: '.zip', config: '.json,.toml,.properties,.txt,.cfg,.yaml,.yml,.conf,.ini' }
let state, selected, category = 'mods', replacePath, editing, folder = '', originalText = ''
let panel = 'library'
let actionActive=false
const availableUpdates = new Map()
const createdThisSession = new Set()
let targetEditing = false, identifying = false
const updateChecks = new Map()
async function checkLibraryUpdates(contentCategory = category, force = false) {
    if(!current()) throw Error('Selecciona un borrador')
    const draftId = selected
    const draft=current(), key=JSON.stringify([draftId,contentCategory,draft.files.filter(f=>f.path.startsWith(contentCategory+'/')).map(f=>f.sha256)])
    if(!force && updateChecks.has(key)) {
        const results=await updateChecks.get(key)
        if(selected===draftId && category===contentCategory) get('updatesSummary').textContent=`${results.filter(item=>!item.error).length} actualizaciones disponibles`
        return results
    }
    get('updatesSummary').textContent='Buscando actualizaciones compatibles…'
    const request=api('providers/updates', { id: draftId, category: contentCategory, force })
    updateChecks.set(key,request)
    const results = await request
    for(const key of [...availableUpdates.keys()]) if(key.startsWith(draftId + ':' + contentCategory + '/')) availableUpdates.delete(key)
    for(const item of results) if(!item.error) availableUpdates.set(draftId + ':' + item.path, item)
    const errors = results.filter(item => item.error)
    if(selected === draftId && category===contentCategory) {
        get('updatesSummary').textContent=`${results.length-errors.length} actualizaciones disponibles${errors.length ? ' · ' + errors.length + ' consultas fallidas' : ''}`
        render()
    }
    return results
}
function canEdit() { return !!current() && !current().published && selected === state.workspace?.activeId }
function requireEditable() { if(canEdit()) return true; get('lockedDialog').showModal(); return false }
function switchPanel(next) {
    if(next === 'add' && !requireEditable()) return
    panel = next; get('library').hidden = next !== 'library' || !current(); get('onlineContent').hidden = next !== 'add'
    get('publishContent').hidden = next !== 'publish'
    get('createContent').hidden = next !== 'create'
    get('renameVersion').hidden = next !== 'publish' || !canEdit()
    get('createTab').setAttribute('aria-pressed', String(next === 'create'))
    get('publishTab').setAttribute('aria-pressed', String(next === 'publish'))
    get('libraryTab').setAttribute('aria-pressed', String(next === 'library')); get('addTab').setAttribute('aria-pressed', String(next === 'add'))
}
get('createTab').onclick = () => switchPanel('create')
get('closeLocked').onclick = () => get('lockedDialog').close()
get('goCreate').onclick = () => { get('lockedDialog').close(); switchPanel('create') }
get('startVersion').onclick = () => get('versionDialog').showModal()
get('libraryTab').onclick = () => switchPanel('library')
get('addTab').onclick = () => switchPanel('add')
get('publishTab').onclick = () => switchPanel('publish')
const testVersionButton = document.createElement('button'); testVersionButton.textContent = 'Probar versión'; testVersionButton.id = 'tryVersion'
get('publish').after(testVersionButton)
testVersionButton.onclick = () => action(async () => {
    get('testStatus').textContent='Preparando el launcher de esta versión · La primera compilación puede tardar unos minutos'
    const result = await api('test/prepare', { id: selected })
    await refresh()
    message(`Launcher ${result.launcherVersion} de pruebas abierto con ${result.account} · Versión ${result.version} · ${result.mods} mods. Pulsa Jugar para probar el cliente.`)
})
for(const button of document.querySelectorAll('[data-provider]')) button.onclick = () => {
    get('provider').value = button.dataset.provider; get('onlineResults').replaceChildren()
    get('remoteControls').hidden = button.dataset.provider === 'local'
    get('localContent').hidden = button.dataset.provider !== 'local'
    for(const tab of document.querySelectorAll('[data-provider]')) tab.setAttribute('aria-pressed', String(tab === button))
    message('')
}
get('addLocal').onclick = () => { if(requireEditable()) { get('upload').accept = extensions[get('localCategory').value]; get('upload').click() } }
let messageTimer
const message = text => {
    clearTimeout(messageTimer)
    get('message').textContent = text
    if(text) messageTimer = setTimeout(() => { get('message').textContent = '' }, 6000)
}
const current = () => state?.drafts.find(d => d.id === selected)
function onlineRow(title, description, callback, label, item) {
    const row = document.createElement('article'); row.className = 'fileRow'
    if(item) {
        row.classList.add('catalogRow')
        const icon = document.createElement('div'); icon.className = 'catalogIcon'; icon.textContent = title.slice(0,2).toUpperCase()
        if(item.icon) { try { const url = new URL(item.icon); if(url.protocol === 'https:' && ['cdn.modrinth.com','media.forgecdn.net','mediafilez.forgecdn.net'].includes(url.hostname)) { const img = document.createElement('img'); img.src = url.href; img.alt = ''; img.loading = 'lazy'; img.onerror = () => img.remove(); icon.append(img) } } catch {} }
        row.append(icon)
    }
    const info = document.createElement('div'); info.className = 'fileInfo'
    const heading = document.createElement('h3'); heading.textContent = title
    const detail = document.createElement('p'); detail.textContent = description
    info.append(heading, detail); row.append(info)
    if(item) {
        const footer = document.createElement('div'); footer.className = 'catalogMeta'
        const tags = document.createElement('span'); tags.textContent = (item.categories || []).slice(0,5).join(' · ')
        const stats = document.createElement('span'); stats.textContent = [Number.isFinite(item.downloads) ? new Intl.NumberFormat('es',{notation:'compact'}).format(item.downloads) + ' descargas' : '', item.updated ? new Date(item.updated).toLocaleDateString('es') : '', item.environment || '', 'Minecraft ' + current().minecraft, get('onlineCategory').value === 'mods' ? current().loader || 'neoforge' : ''].filter(Boolean).join(' · ')
        footer.append(tags, stats); info.append(footer)
    }
    if(callback) { const button = document.createElement('button'); button.textContent = label; button.onclick = () => action(callback); row.append(button) }
    get('onlineResults').append(row)
}
get('onlineSearch').onclick = () => action(async () => {
    if(!current()) throw Error('Selecciona un borrador')
    const provider = get('provider').value, contentCategory = get('onlineCategory').value
    const results = await api('providers/search', { id:selected, provider, category: contentCategory, query: get('onlineQuery').value })
    get('onlineResults').replaceChildren()
    for(const item of results) {
        const installed = current().files.some(f => f.source?.provider === provider && String(f.source.projectId) === String(item.projectId))
        onlineRow(item.title, 'Por ' + item.author + ' — ' + item.description, installed ? null : async () => {
        await api('providers/install', { id: selected, revision: current().revision, provider, projectId: item.projectId, category: contentCategory }); await refresh(); message('Contenido descargado y guardado en el borrador')
    }, 'Instalar', item)
        if(installed) { const badge = document.createElement('span'); badge.textContent = 'En tu biblioteca'; badge.className = 'badge'; get('onlineResults').lastElementChild.append(badge) }
    }
    message(results.length + ' resultados compatibles')
})
get('onlineUpdates').onclick = () => action(async () => {
    if(!current()) throw Error('Selecciona un borrador')
    message('Consultando versiones; puede tardar unos minutos…')
    const contentCategory = get('onlineCategory').value, draftId = selected
    const results = await checkLibraryUpdates(contentCategory)
    get('onlineResults').replaceChildren()
    for(const item of results) onlineRow(item.path, item.error || 'Versión disponible: ' + item.version, item.error ? null : async () => {
        if(selected !== draftId) throw Error('Vuelve al borrador consultado')
        await api('providers/install', { id: draftId, revision: current().revision, provider: item.source.provider, projectId: item.source.projectId, category: contentCategory, replacePath: item.path }); await refresh(); message('Actualización guardada en el borrador')
    }, 'Actualizar')
    message(results.length ? 'Consulta completada. Revisa los resultados.' : 'No se encontraron actualizaciones en los archivos vinculados a un proveedor')
})
async function api(route, data) {
    const response = await fetch('/api/' + route, data ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) } : {})
    const result = await response.json()
    if(!response.ok) throw Error(result.error)
    return result
}
const pendingSaves = new Map()
let saveTimer, saveChain = Promise.resolve()
function queueAutosave(kind, id, text, path) {
    const item = {kind,id,text,path}; const key = id + ':' + kind + ':' + (path || '')
    pendingSaves.set(key,item); localStorage.setItem('vortexAutosave:' + key, JSON.stringify(item))
    clearTimeout(saveTimer); saveTimer = setTimeout(() => flushAutosave().catch(error => message('No se pudo guardar: ' + error.message)), 650)
}
function flushAutosave() {
    clearTimeout(saveTimer)
    saveChain = saveChain.catch(() => {}).then(async () => {
        for(const [key,item] of [...pendingSaves]) {
            const draft = state?.drafts.find(d => d.id === item.id)
            if(!state) continue
            if(!draft || draft.published || item.id !== state.workspace?.activeId) { pendingSaves.delete(key); localStorage.removeItem('vortexAutosave:' + key); continue }
            const result = await api(item.kind === 'notes' ? 'notes' : 'config/autosave', item.kind === 'notes' ? {id:item.id,revision:draft.revision,notes:item.text} : {id:item.id,revision:draft.revision,path:item.path,text:item.text})
            Object.assign(draft,result)
            if(pendingSaves.get(key) === item) { pendingSaves.delete(key); localStorage.removeItem('vortexAutosave:' + key) }
            if(editing?.id === item.id) editing.revision = result.revision
            if(item.kind === 'config') get('dirtyStatus').textContent = 'Borrador guardado · Pendiente de aplicar'
            get('revision').textContent = draft.files.length + ' archivos · Guardado'
        }
    })
    return saveChain
}
for(let i=0;i<localStorage.length;i++) { const key=localStorage.key(i); if(key.startsWith('vortexAutosave:')) { try { const item=JSON.parse(localStorage.getItem(key)); pendingSaves.set(key.slice(15),item) } catch {} } }
window.addEventListener('beforeunload', event => { if(pendingSaves.size) { event.preventDefault(); event.returnValue = '' } })
async function action(callback) {
    actionActive=true
    const buttons = [...document.querySelectorAll('button')]; buttons.forEach(b => { b.disabled = true })
    try { await flushAutosave(); await callback() } catch(error) { message(error.message) }
    finally {actionActive=false; buttons.forEach(b => { b.disabled = false }); render(); switchPanel(panel) }
}
async function refresh() {
    state = await api('state')
    if(state.workspace.activeId && (!current() || current().published)) selected = state.workspace.activeId
    if(!current() || (selected === localStorage.getItem('vortexWorkingDraft') && !state.workspace.activeId)) selected = state.workspace.activeId || state.drafts.find(d => d.readOnly)?.id || state.drafts.find(d => !d.readOnly)?.id
    get('workspace').hidden = false

    get('draftSelect').replaceChildren()
    for(const draft of state.drafts) { const option = document.createElement('option'); option.value = draft.id; option.textContent = draft.version; get('draftSelect').append(option) }
    get('draftSelect').value = selected || ''
    render()
    if(pendingSaves.size) { await flushAutosave(); render() }
    if(panel === 'add' && !canEdit()) panel = 'library'
    renderTargetAndHistory()
    if(current() && !identifying) { identifying = true; api('providers/identify',{id:selected}).then(result => { if(result.identified) refresh() }).catch(error => message('Identificación de contenido: ' + error.message)).finally(() => { identifying = false }) }
    switchPanel(panel)
}
function render() {
    const draft = current()
    if(draft) localStorage.setItem('vortexWorkingDraft', selected)
    get('workingStatus').textContent = (draft?.status === 'stable' ? 'Publicada' : draft?.status === 'test' ? 'En prueba' : 'Sin publicar')
    get('workingStatus').dataset.status = draft?.status || 'draft'
    get('draftNotice').hidden = !canEdit() || draft.status === 'test'
    get('cancelDraft').disabled = !draft || draft.published
    get('notes').disabled = !canEdit()
    get('saveNotes').disabled = !canEdit()
    get('publish').disabled = !canEdit()
    get('publishOfficial').disabled = !canEdit() || !draft?.testResult?.eligible || !state.githubReady || state.publishing
    get('approveTest').hidden = !canEdit() || draft?.testResult?.status !== 'awaitingApproval' || !draft.testResult.launcherClosedNormally
    get('rejectTest').hidden = !canEdit() || !['prepared','running','awaitingApproval','passed'].includes(draft?.testResult?.status)
    const statuses={untested:'Debes publicar y probar esta versión',prepared:'Prueba abierta con Mystwer · Pulsa Jugar en el launcher de pruebas',running:'Prueba en curso · Juega al menos un minuto y cierra el cliente normalmente',awaitingApproval:draft?.testResult?.launcherClosedNormally ? 'El cliente y el launcher cerraron sin fallos detectados · Confirma cómo fue la partida' : 'El cliente cerró correctamente · Cierra también el launcher de pruebas para confirmar el resultado',passed:'Prueba aprobada · Lista para publicar oficialmente',failed:'Prueba fallida · Corrige los problemas y vuelve a probar',outdated:'La versión cambió · Publica y prueba los últimos cambios'}
    get('testStatus').textContent=state.publishing ? 'Publicando oficialmente en GitHub…' : (statuses[draft?.testResult?.status] || statuses.untested)+(draft?.testResult?.reason ? ' · '+draft.testResult.reason : '')+(!state.githubReady ? ' · GitHub no está conectado para publicar' : '')
    get('automaticNotes').textContent=(draft?.automaticNotes || []).map(n=>'- '+n.text).join('\n') || 'Los cambios se registrarán aquí automáticamente'

    get('emptyPack').hidden = !!draft; get('library').hidden = !draft
    if(!draft) return
    if(category!=='config') checkLibraryUpdates(category).catch(error=>{get('updatesSummary').textContent='No se pudieron consultar las actualizaciones: ' + error.message})
    else get('updatesSummary').textContent=''
    get('revision').textContent = `${draft.files.length} archivos · Guardado`
    if(document.activeElement !== get('notes')) get('notes').value = draft.notes
    for(const button of document.querySelectorAll('[data-category]')) {
        const key = button.dataset.category
        button.textContent = `${names[key]} (${draft.files.filter(f => f.path.startsWith(key + '/')).length})`
        button.setAttribute('aria-pressed', String(key === category))
    }

    get('upload').accept = extensions[get('localCategory').value]; get('replacement').accept = extensions[category]
    get('categoryHint').textContent = !canEdit() ? 'Biblioteca de solo lectura. Crea una versión para modificar su contenido.' : category === 'config' ? 'Edita las configuraciones con colores de sintaxis y guardado automático del borrador.' : 'Puedes sustituir, actualizar o quitar contenido de esta versión'
    const query = get('search').value.toLowerCase()
    const providerFilter = get('libraryProvider').value
    const categoryFiles = draft.files.filter(f => f.path.startsWith(category + '/') && (providerFilter === 'all' || (f.source?.provider || 'unlinked') === providerFilter))
    get('folders').hidden = category !== 'config'
    get('folders').replaceChildren()
    if(category === 'config') {
        const folders = [...new Set(categoryFiles.map(f => f.path.slice(0, f.path.lastIndexOf('/'))))].sort()
        for(const name of ['', ...folders]) {
            const button = document.createElement('button')
            button.textContent = name ? name.replace(/^config\/?/, '') || 'Carpeta principal' : 'Todas las carpetas'
            button.setAttribute('aria-pressed', String(folder === name))
            button.onclick = () => { folder = name; render() }; get('folders').append(button)
        }
    }
    const files = categoryFiles.filter(f => (f.path + ' ' + (f.display?.title || '')).toLowerCase().includes(query) && (category !== 'config' || !folder || f.path.slice(0, f.path.lastIndexOf('/')) === folder)).sort((a, b) => {
        if(category === 'config' && !!a.editableText !== !!b.editableText) return Number(!!b.editableText) - Number(!!a.editableText)
        const priority = Number(availableUpdates.has(draft.id + ':' + b.path)) - Number(availableUpdates.has(draft.id + ':' + a.path))
        return priority || (a.display?.title || a.path).localeCompare(b.display?.title || b.path)
    })
    get('content').replaceChildren()
    if(!files.length) {
        const empty = document.createElement('div'); empty.className = 'empty'
        const title = document.createElement('h2'); title.textContent = query ? 'No hay coincidencias' : 'Todavía no hay ' + names[category].toLowerCase()
        const p = document.createElement('p'); p.textContent = query ? 'Prueba otro nombre o borra la búsqueda.' : 'Usa Añadir para guardar el contenido en esta versión del pack.'
        empty.append(title, p); get('content').append(empty)
    }
    for(const file of files) {
        const row = document.createElement('article'); row.className = 'fileRow'
        const icon = document.createElement('span'); icon.className = 'fileIcon'; icon.textContent = category === 'mods' ? 'MOD' : category === 'config' ? 'CFG' : 'ZIP'
        if(category !== 'config') {
            const img = document.createElement('img'); img.src = file.display?.icon || '/api/icon/' + file.sha256; img.alt = ''; img.loading = 'lazy'; img.onerror = () => { img.onerror = null; img.src = '/vortex-logo.png' }; icon.append(img)
        }
        const info = document.createElement('div'); info.className = 'fileInfo'
        const title = document.createElement('h3'); title.textContent = file.display?.title || file.source?.title || file.path.split('/').at(-1)
        const providerName = { modrinth: 'Modrinth', curseforge: 'CurseForge' }[file.source?.provider] || 'Sin proveedor asociado'
        const detail = document.createElement('p'); detail.textContent = `${category === 'config' ? file.path + ' · ' : ''}${(file.size / 1048576).toFixed(2)} MiB · ${providerName} · ${file.policy === 'seed' ? 'Conservar ajustes existentes' : 'Incluido en el pack'}`
        info.append(title, detail)
        if(file.protection?.protected) { const badge=document.createElement('p');badge.className='jarvisBadge';badge.textContent=file.protection.reason;info.append(badge) }
        if(category !== 'config') {
            const filename = document.createElement('p'); filename.className = 'libraryFilename'; filename.textContent = file.path.split('/').at(-1)
            const author = document.createElement('span'); author.className = 'libraryAuthor'; author.textContent = file.display?.author ? 'Por ' + file.display.author : ''
            title.append(author); info.append(filename)
        }
        const actions = document.createElement('div'); actions.className = 'fileActions'
        const button = (text, callback) => { const b = document.createElement('button'); b.className = 'secondary'; b.textContent = text; b.onclick = () => { if(requireEditable()) callback() }; if(canEdit()) actions.append(b) }
        if(category === 'config' && file.editableText) button('Editar', () => action(async () => {
            const result = await api('config/read', { id: draft.id, path: file.path }); editing = { id: draft.id, revision: draft.revision, path: file.path }
            get('configTitle').textContent = file.path; originalText = result.savedText ?? result.text; get('configText').value = result.text
            get('configSearch').value = ''; get('editorMessage').textContent = ''
            get('formatJson').hidden = !file.path.endsWith('.json'); get('configDialog').showModal(); updateEditor(); get('configText').focus()
        }))
        if(category !== 'config' && !file.protection?.jarvis) button('Marcar como Jarvis', () => action(async () => {
            if(!confirm('¿Confirmas que este archivo contiene modificaciones de Jarvis? Los catálogos no podrán sustituirlo.')) return
            await api('library/mark-jarvis',{id:draft.id,revision:current().revision,path:file.path});await refresh();message('Modificaciones de Jarvis protegidas')
        }))
        button('Sustituir', () => { replacePath = file.path; get('replacement').click() })
        const update = availableUpdates.get(draft.id + ':' + file.path)
        if(update && !file.protection?.protected) {
            const badge=document.createElement('p');badge.className='pendingUpdateBadge';badge.textContent='Actualización disponible · ' + update.version;info.append(badge);row.classList.add('hasUpdate')
            const updateButton=document.createElement('button');updateButton.textContent='Actualizar';updateButton.className='updateButton';updateButton.title='Actualizar a ' + update.version
            updateButton.disabled = !canEdit()
            if(!canEdit()) updateButton.title = 'Crea una nueva versión para actualizar este archivo'
            updateButton.onclick = () => { if(!requireEditable()) return; action(async () => {
                await api('providers/install', { id: draft.id, revision: current().revision, provider: update.source.provider, projectId: update.source.projectId, category, replacePath: file.path })
                availableUpdates.delete(draft.id + ':' + file.path)
                await refresh(); message('Mod actualizado en el borrador')
            }) }
            actions.append(updateButton)
        }
        button('Quitar', () => action(async () => {
            if(!confirm(`¿Quitar ${title.textContent} de este borrador? Las versiones publicadas se conservan.`)) return
            await api('remove', { id: draft.id, revision: draft.revision, path: file.path }); await refresh(); message('Archivo quitado del borrador')
        }))
        row.append(icon, info, actions); get('content').append(row)
    }
}
async function upload(files, oldPath) {
    if(!requireEditable()) return
    const draftId = selected, uploadCategory = oldPath ? category : get('localCategory').value
    for(const file of files) {
        if(file.size > 64 * 1048576) throw Error('El archivo supera 64 MiB: ' + file.name)
        const base64 = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result.split(',')[1]); reader.onerror = reject; reader.readAsDataURL(file) })
        await api('library/add', { id: draftId, revision: state.drafts.find(d => d.id === draftId).revision, category: uploadCategory, filename: file.name, base64, replacePath: oldPath })
        await refresh()
    }
    message(oldPath ? 'Archivo sustituido. La versión anterior se ha retirado del borrador.' : `${files.length} archivo(s) añadido(s) al pack`)
}
get('draftSelect').onchange = () => { selected = get('draftSelect').value; folder = ''; render(); switchPanel('library') }
for(const button of document.querySelectorAll('[data-category]')) button.onclick = () => { category = button.dataset.category; get('search').value = ''; render() }
get('search').oninput = render
const providerLabel = document.createElement('label'); providerLabel.textContent = 'Proveedor'
const providerSelect = document.createElement('select'); providerSelect.id = 'libraryProvider'
for(const [value, text] of [['all', 'Todos los proveedores'], ['modrinth', 'Modrinth'], ['curseforge', 'CurseForge'], ['unlinked', 'Sin proveedor asociado']]) {
    const option = document.createElement('option'); option.value = value; option.textContent = text; providerSelect.append(option)
}
providerLabel.append(providerSelect); get('search').closest('label').after(providerLabel)
providerSelect.onchange = () => { folder = ''; render() }

const checkUpdatesButton = document.createElement('button')
checkUpdatesButton.id = 'libraryUpdates'; checkUpdatesButton.className = 'secondary'; checkUpdatesButton.textContent = 'Buscar actualizaciones'
checkUpdatesButton.onclick = () => checkLibraryUpdates(category,true).catch(error=>message(error.message))
const updatesSummary=document.createElement('p');updatesSummary.id='updatesSummary';updatesSummary.setAttribute('role','status');get('categoryHint').before(updatesSummary)
get('search').closest('.toolbar').append(checkUpdatesButton)
get('upload').onchange = () => { const files = [...get('upload').files]; if(files.length) action(() => upload(files)); get('upload').value = '' }
get('replacement').onchange = () => { const files = [...get('replacement').files]; if(files.length) action(() => upload(files, replacePath)); get('replacement').value = '' }
get('firstDraft').onclick = () => switchPanel('create')
get('renameVersion').onclick = () => action(async () => {
    if(!requireEditable()) return
    const draft=current(), name=prompt('Nuevo número de versión:',draft.version)
    if(name===null || name.trim()===draft.version) return
    await api('library/rename',{id:draft.id,revision:draft.revision,version:name.trim()});await refresh();message('Versión actualizada')
})
async function discardCurrentDraft(cancel = false){
    const draft = current()
    if(!draft) throw Error('Selecciona un borrador para cancelarlo')
    const verb = 'Cancelar esta versión'
    if(!requireEditable()) return
    if(!confirm(verb + ' el borrador ' + draft.version + '? Se perderán sus cambios sin publicar. Las versiones publicadas se conservan.')) return
    await api('library/cancel', { id: draft.id, revision: draft.revision })
    for(const key of [...availableUpdates.keys()]) if(key.startsWith(draft.id + ':')) availableUpdates.delete(key)
    selected = undefined; editing = undefined; folder = ''; panel = 'create'; localStorage.removeItem('vortexWorkingDraft')
    await refresh()
    message(cancel ? 'Borrador cancelado. Las versiones publicadas se conservan.' : 'Borrador eliminado. Las versiones publicadas se conservan.')
}
get('cancelDraft').onclick = () => action(() => discardCurrentDraft(true))
get('cancelVersion').onclick = () => get('versionDialog').close()
const loaderNames = {neoforge:'NeoForge',forge:'Forge',fabric:'Fabric',quilt:'Quilt'}
function renderTargetAndHistory() {
    const target=state.workspace.target
    const viewTarget=current() ? {minecraft:current().minecraft,loader:current().loader || 'neoforge'} : target
    get('targetBadge').textContent='Minecraft ' + viewTarget.minecraft + ' · ' + loaderNames[viewTarget.loader]
    get('compatibilityHint').textContent='Versiones estables para Minecraft ' + viewTarget.minecraft + '. Los mods se filtran por ' + loaderNames[viewTarget.loader]
    if(!targetEditing) { get('targetMinecraft').value=target.minecraft;get('targetLoader').value=target.loader }
    get('targetMinecraft').disabled=!targetEditing;get('targetLoader').disabled=!targetEditing
    get('saveTarget').hidden=!targetEditing;get('modifyTarget').hidden=targetEditing
    get('modifyTarget').disabled=!!state.workspace.activeId
    get('targetMessage').textContent='Destino guardado: Minecraft ' + target.minecraft + ' · ' + loaderNames[target.loader]
    get('versionHistory').replaceChildren()
    for(const release of state.history) {
        const row=document.createElement('article');row.className='historyRow'
        const info=document.createElement('div'), title=document.createElement('h4'), detail=document.createElement('p')
        title.textContent='Versión ' + release.version;detail.textContent=release.files + ' archivos · Minecraft ' + release.minecraft + ' · ' + loaderNames[release.loader] + ' · ' + new Date(release.publishedAt).toLocaleDateString('es')
        const notes=document.createElement('p');notes.textContent=release.notes || 'Contenido completo conservado'
        info.append(title,detail,notes)
        const button=document.createElement('button');button.textContent='Recuperar esta versión'
        button.onclick=()=>action(async()=>{
            if(!confirm('¿Recuperar todo el contenido de ' + release.version + '? Se creará una versión de restauración para revisar y publicar.')) return
            const result=await api('library/restore',{version:release.version});selected=result.id;createdThisSession.add(result.id);panel='library';await refresh();message('Contenido de ' + release.version + ' recuperado; revisa y publica la restauración')
        });row.append(info,button);get('versionHistory').append(row)
    }
    if(!state.history.length) get('versionHistory').textContent='Las versiones aparecerán aquí después de publicarlas oficialmente'
    get('pendingDrafts').replaceChildren()
    if(state.workspace.activeId) {
        const hint=document.createElement('p');hint.textContent='Tienes una versión sin finalizar. Puedes continuar o cancelarla desde Publicar';const resume=document.createElement('button');resume.textContent='Continuar versión';resume.onclick=()=>{selected=state.workspace.activeId;render();switchPanel('library')};get('pendingDrafts').append(hint,resume)
    }
}
get('modifyTarget').onclick=()=>{targetEditing=true;renderTargetAndHistory()}
get('saveTarget').onclick=()=>action(async()=>{await api('target/save',{minecraft:get('targetMinecraft').value,loader:get('targetLoader').value});targetEditing=false;await refresh();message('Minecraft y mod loader guardados para las siguientes versiones')})
api('targets').then(data=>{for(const version of data.versions){if([...get('targetMinecraft').options].some(o=>o.value===version))continue;const option=document.createElement('option');option.value=version;option.textContent=version;get('targetMinecraft').append(option)}if(state)renderTargetAndHistory()}).catch(()=>{})
async function createVersion(mode) {
    const result = await api('library/start', { mode, source:selected }); selected = result.id; createdThisSession.add(result.id)
    get('versionDialog').close(); panel = 'add'; await refresh(); message('Borrador ' + result.version + ' creado y guardado')
}
get('createFix').onclick = () => action(() => createVersion('fix'))
get('createNew').onclick = () => action(() => createVersion('new'))
function updateEditor() {
    const editor = get('configText'), before = editor.value.slice(0, editor.selectionStart)
    get('syntaxHighlight').innerHTML = highlightConfig(editor.value, editing?.path || '')
    get('syntaxHighlight').scrollTop = editor.scrollTop
    get('syntaxHighlight').scrollLeft = editor.scrollLeft
    get('lineNumbers').textContent = Array.from({ length: editor.value.split('\n').length }, (_, i) => i + 1).join('\n')
    get('lineNumbers').scrollTop = editor.scrollTop
    get('cursorStatus').textContent = `Línea ${before.split('\n').length} · Columna ${before.length - before.lastIndexOf('\n')}`
    get('dirtyStatus').textContent = editor.value === originalText ? 'Sin cambios' : 'Cambios sin guardar'
}
function closeEditor() {
    flushAutosave().then(() => get('configDialog').close()).catch(error => message(error.message))
}
async function saveConfig() {
    editing.revision = current().revision
    await api('config/save', { ...editing, text: get('configText').value })
    originalText = get('configText').value; await refresh()
    editing.revision = state.drafts.find(d => d.id === editing.id).revision
    get('editorMessage').textContent = 'Configuración guardada'; updateEditor(); message('Configuración guardada en el borrador')
}
get('cancelConfig').onclick = closeEditor
get('configDialog').oncancel = event => { event.preventDefault(); closeEditor() }
get('saveConfig').onclick = () => action(async () => { try { await saveConfig() } catch(error) { get('editorMessage').textContent = error.message; throw error } })
get('configText').oninput = () => { updateEditor(); queueAutosave('config', editing.id, get('configText').value, editing.path) }
get('configText').onclick = updateEditor
get('configText').onkeyup = updateEditor
get('configText').onscroll = () => {
    const editor = get('configText')
    get('lineNumbers').scrollTop = editor.scrollTop
    get('syntaxHighlight').scrollTop = editor.scrollTop
    get('syntaxHighlight').scrollLeft = editor.scrollLeft
}
get('configDialog').onkeydown = event => {
    if((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); get('saveConfig').click() }
    if((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') { event.preventDefault(); get('configSearch').focus() }
}
get('configText').onkeydown = event => {
    if(event.key === 'Tab') { event.preventDefault(); const editor = get('configText'); editor.setRangeText('    ', editor.selectionStart, editor.selectionEnd, 'end'); updateEditor(); queueAutosave('config', editing.id, editor.value, editing.path) }
}
get('findNext').onclick = () => {
    const editor = get('configText'), query = get('configSearch').value
    if(!query) return
    const index = editor.value.indexOf(query, editor.selectionEnd)
    const found = index < 0 ? editor.value.indexOf(query) : index
    if(found < 0) { get('editorMessage').textContent = 'No se encontró el texto'; return }
    editor.focus(); editor.setSelectionRange(found, found + query.length)
    editor.scrollTop = editor.value.slice(0, found).split('\n').length * 21 - editor.clientHeight / 2
    get('editorMessage').textContent = 'Coincidencia encontrada'; updateEditor()
}
get('formatJson').onclick = () => {
    try { get('configText').value = JSON.stringify(JSON.parse(get('configText').value), null, 2) + '\n'; updateEditor(); queueAutosave('config', editing.id, get('configText').value, editing.path); get('editorMessage').textContent = 'JSON formateado; guarda para aplicar el cambio' }
    catch { get('editorMessage').textContent = 'JSON inválido: revisa su sintaxis antes de formatearlo' }
}
get('notes').oninput = () => queueAutosave('notes', selected, get('notes').value)
get('saveNotes').onclick = () => action(async () => { await api('notes', { id: selected, revision: current().revision, notes: get('notes').value }); await refresh(); message('Notas guardadas') })
get('closePublishSuccess').onclick = () => get('publishSuccess').close()
get('approveTest').onclick=()=>action(async()=>{
    if(!confirm('¿Has probado la partida y no encontraste problemas? Esto permite publicar para todos los jugadores.')) return
    await api('test/approve',{id:selected,runId:current().testResult.id});await refresh()
})
get('rejectTest').onclick=()=>action(async()=>{await api('test/reject',{id:selected,runId:current().testResult.id});await refresh()})
get('publishOfficial').onclick=()=>action(async()=>{
    if(!confirm('¿Publicar oficialmente la versión '+current().version+' para todos los jugadores? La versión quedará bloqueada.')) return
    get('testStatus').textContent='Publicando oficialmente en GitHub…'
    const result=await api('publish/official',{id:selected,revision:current().revision});await refresh()
    get('publishSuccess').querySelector('h2').textContent='Versión publicada oficialmente'
    get('publishSuccessText').textContent='Vortex '+result.published+' se publicó en GitHub. Los jugadores con el nuevo launcher recibirán esta actualización';get('publishSuccess').showModal()
})
get('publish').onclick = () => action(async () => { const draft = current(); if(!confirm(`¿Publicar la versión ${draft.version} en pruebas?`)) return; const result=await api('publish', { id: draft.id, revision: draft.revision }); await refresh(); get('publishSuccess').querySelector('h2').textContent='Versión de pruebas publicada';get('publishSuccessText').textContent='La versión ' + result.published + ' se publicó correctamente en pruebas. Puedes abrir el launcher exclusivo con Probar versión';get('publishSuccess').showModal();message('Versión publicada en el canal de pruebas') })
setInterval(async()=>{
    if(!state || actionActive || !current()) return
    try {const result=await api('test/status');if(result.id===selected) current().testResult=result.testResult;state.githubReady=result.githubReady;state.publishing=result.publishing;render()} catch {}
},5000)
action(async () => { await refresh() })
