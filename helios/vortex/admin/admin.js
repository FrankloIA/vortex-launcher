const get = id => document.getElementById(id)
const names = { mods: 'Mods', resourcepacks: 'Resourcepacks', shaderpacks: 'Shaders', config: 'Configuraciones' }
const extensions = { mods: '.jar', resourcepacks: '.zip', shaderpacks: '.zip', config: '.json,.toml,.properties,.txt,.cfg,.yaml,.yml,.conf,.ini' }
let state, selected, category = 'mods', replacePath, editing, folder = '', originalText = ''
const message = text => { get('message').textContent = text }
const current = () => state?.drafts.find(d => d.id === selected)
async function api(route, data) {
    const response = await fetch('/api/' + route, data ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) } : {})
    const result = await response.json()
    if(!response.ok) throw Error(result.error)
    return result
}
async function action(callback) {
    const buttons = [...document.querySelectorAll('button')]; buttons.forEach(b => { b.disabled = true })
    try { await callback() } catch(error) { message(error.message) }
    finally { buttons.forEach(b => { b.disabled = false }) }
}
async function refresh() {
    state = await api('state')
    if(!current()) selected = state.drafts.find(d => d.files.some(f => f.path.startsWith('mods/')))?.id || state.drafts.at(-1)?.id
    get('login').hidden = true; get('workspace').hidden = false
    get('testVersion').textContent = state.channels.test?.version || 'Sin publicar'
    get('draftSelect').replaceChildren()
    for(const draft of state.drafts) { const option = document.createElement('option'); option.value = draft.id; option.textContent = draft.version; get('draftSelect').append(option) }
    get('draftSelect').value = selected || ''
    render()
}
function render() {
    const draft = current()
    get('emptyPack').hidden = !!draft; get('library').hidden = !draft
    if(!draft) return
    get('revision').textContent = `${draft.files.length} archivos · Cambios guardados en borrador`
    get('notes').value = draft.notes
    for(const button of document.querySelectorAll('[data-category]')) {
        const key = button.dataset.category
        button.textContent = `${names[key]} (${draft.files.filter(f => f.path.startsWith(key + '/')).length})`
        button.setAttribute('aria-pressed', String(key === category))
    }
    get('addButton').textContent = '+ Añadir ' + names[category].toLowerCase()
    get('upload').accept = extensions[category]; get('replacement').accept = extensions[category]
    get('categoryHint').textContent = category === 'config' ? 'Añade archivos de configuración o edita los que ya están guardados. Los ajustes existentes se conservan.' : 'Selecciona archivos descargados compatibles con Minecraft 1.21.1 y NeoForge. Puedes añadir varios a la vez.'
    const query = get('search').value.toLowerCase()
    const categoryFiles = draft.files.filter(f => f.path.startsWith(category + '/'))
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
    const files = categoryFiles.filter(f => f.path.toLowerCase().includes(query) && (category !== 'config' || !folder || f.path.slice(0, f.path.lastIndexOf('/')) === folder)).sort((a, b) => a.path.localeCompare(b.path))
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
        const info = document.createElement('div'); info.className = 'fileInfo'
        const title = document.createElement('h3'); title.textContent = file.path.split('/').at(-1)
        const detail = document.createElement('p'); detail.textContent = `${category === 'config' ? file.path + ' · ' : ''}${(file.size / 1048576).toFixed(2)} MiB · ${file.policy === 'seed' ? 'Conservar ajustes existentes' : 'Incluido en el pack'}`
        info.append(title, detail)
        const actions = document.createElement('div'); actions.className = 'fileActions'
        const button = (text, callback) => { const b = document.createElement('button'); b.className = 'secondary'; b.textContent = text; b.onclick = callback; actions.append(b) }
        if(category === 'config') button('Editar', () => action(async () => {
            const result = await api('config/read', { id: draft.id, path: file.path }); editing = { id: draft.id, revision: draft.revision, path: file.path }
            get('configTitle').textContent = file.path; originalText = result.text; get('configText').value = result.text
            get('configSearch').value = ''; get('editorMessage').textContent = ''
            get('formatJson').hidden = !file.path.endsWith('.json'); get('configDialog').showModal(); updateEditor(); get('configText').focus()
        }))
        button('Sustituir', () => { replacePath = file.path; get('replacement').click() })
        button('Quitar', () => action(async () => {
            if(!confirm(`¿Quitar ${title.textContent} de este borrador? Las versiones publicadas se conservan.`)) return
            await api('remove', { id: draft.id, revision: draft.revision, path: file.path }); await refresh(); message('Archivo quitado del borrador')
        }))
        row.append(icon, info, actions); get('content').append(row)
    }
}
async function upload(files, oldPath) {
    const draftId = selected, uploadCategory = category
    for(const file of files) {
        if(file.size > 64 * 1048576) throw Error('El archivo supera 64 MiB: ' + file.name)
        const base64 = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result.split(',')[1]); reader.onerror = reject; reader.readAsDataURL(file) })
        await api('library/add', { id: draftId, revision: state.drafts.find(d => d.id === draftId).revision, category: uploadCategory, filename: file.name, base64, replacePath: oldPath })
        await refresh()
    }
    message(oldPath ? 'Archivo sustituido. La versión anterior se ha retirado del borrador.' : `${files.length} archivo(s) añadido(s) al pack`)
}
get('loginForm').onsubmit = event => { event.preventDefault(); action(async () => { await api('login', { password: get('password').value }); get('password').value = ''; await refresh(); message('Biblioteca lista para editar') }) }
get('draftSelect').onchange = () => { selected = get('draftSelect').value; render() }
for(const button of document.querySelectorAll('[data-category]')) button.onclick = () => { category = button.dataset.category; get('search').value = ''; render() }
get('search').oninput = render
get('addButton').onclick = () => get('upload').click()
get('upload').onchange = () => { const files = [...get('upload').files]; if(files.length) action(() => upload(files)); get('upload').value = '' }
get('replacement').onchange = () => { const files = [...get('replacement').files]; if(files.length) action(() => upload(files, replacePath)); get('replacement').value = '' }
function newVersion() { get('versionHint').textContent = current() ? 'El contenido actual se copiará para que puedas seguir editándolo.' : 'Crea una versión y empieza a añadir contenido.'; get('versionDialog').showModal() }
get('newDraft').onclick = newVersion; get('firstDraft').onclick = newVersion
get('cancelVersion').onclick = () => get('versionDialog').close()
get('versionForm').onsubmit = event => { event.preventDefault(); action(async () => {
    const version = get('version').value, source = current()?.id
    const result = await api('library/create', { version, source }); selected = result.id
    get('versionDialog').close(); await refresh(); message('Versión preparada para editar')
}) }
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
    if(get('configText').value !== originalText && !confirm('Hay cambios sin guardar. ¿Cerrar y descartarlos?')) return
    get('configDialog').close()
}
async function saveConfig() {
    await api('config/save', { ...editing, text: get('configText').value })
    originalText = get('configText').value; await refresh()
    editing.revision = state.drafts.find(d => d.id === editing.id).revision
    get('editorMessage').textContent = 'Configuración guardada'; updateEditor(); message('Configuración guardada en el borrador')
}
get('cancelConfig').onclick = closeEditor
get('configDialog').oncancel = event => { event.preventDefault(); closeEditor() }
get('saveConfig').onclick = () => action(async () => { try { await saveConfig() } catch(error) { get('editorMessage').textContent = error.message; throw error } })
get('configText').oninput = updateEditor
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
    if(event.key === 'Tab') { event.preventDefault(); const editor = get('configText'); editor.setRangeText('    ', editor.selectionStart, editor.selectionEnd, 'end'); updateEditor() }
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
    try { get('configText').value = JSON.stringify(JSON.parse(get('configText').value), null, 2) + '\n'; updateEditor(); get('editorMessage').textContent = 'JSON formateado; guarda para aplicar el cambio' }
    catch { get('editorMessage').textContent = 'JSON inválido: revisa su sintaxis antes de formatearlo' }
}
get('saveNotes').onclick = () => action(async () => { await api('notes', { id: selected, revision: current().revision, notes: get('notes').value }); await refresh(); message('Notas guardadas') })
get('publish').onclick = () => action(async () => { const draft = current(); if(!confirm(`¿Publicar la versión ${draft.version} en pruebas?`)) return; await api('publish', { id: draft.id, revision: draft.revision }); await refresh(); message('Versión publicada en el canal de pruebas') })
action(async () => { try { await refresh() } catch { message('Inicia sesión para abrir tu biblioteca') } })
