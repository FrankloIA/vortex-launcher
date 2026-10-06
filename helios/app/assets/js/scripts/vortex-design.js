document.addEventListener('DOMContentLoaded', () => {
    const byId = id => document.getElementById(id)
    byId('vortexAccount').append(byId('user_content'))
    const sidebar = document.querySelector('.vortexSide')
    byId('main').append(sidebar)
    const syncSidebar = () => {
        const settings = getComputedStyle(byId('settingsContainer')).display !== 'none'
        const home = getComputedStyle(byId('landingContainer')).display !== 'none'
        sidebar.style.display = settings || home ? 'flex' : 'none'
        byId('vortexHome').classList.toggle('is-active', !settings)
        byId('vortexSettings').classList.toggle('is-active', settings)
    }
    for(const id of ['settingsContainer','landingContainer']) new MutationObserver(syncSidebar).observe(byId(id), {attributes:true,attributeFilter:['style']})
    syncSidebar()
    const icons = {
        Account:'<circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',
        Minecraft:'<path d="m12 2 9 5v10l-9 5-9-5V7zM3 7l9 5 9-5M12 12v10"/>',
        Mods:'<path d="M3 3h6a3 3 0 1 1 6 0h6v6a3 3 0 1 0 0 6v6h-6a3 3 0 1 0-6 0H3v-6a3 3 0 1 1 0-6z"/>',
        Shaders:'<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
        Java:'<path d="M5 10h12v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4zM17 11h2a3 3 0 0 1 0 6h-2M10 8c-4-4 5-3 1-7"/>',
        Launcher:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 8h18"/>',
        About:'<circle cx="12" cy="12" r="10"/><path d="M12 11v6m0-11v2"/>',
        Update:'<path d="M21 4v6h-6M3 20v-6h6M20 9a8 8 0 0 0-14-4M4 15a8 8 0 0 0 14 4"/>'
    }
    for(const button of document.querySelectorAll('.settingsNavItem')) {
        const icon = icons[button.getAttribute('rSc').replace('settingsTab','')]
        button.insertAdjacentHTML('afterbegin', '<svg viewBox="0 0 24 24" aria-hidden="true">'+icon+'</svg>')
    }
    const avatar = byId('avatarContainer')
    const showHead = () => {
        const current = avatar.style.backgroundImage
        const head = current.replace(/mc-heads\.net\/body\/([^/'")]+)\/right/, 'mc-heads.net/avatar/$1/256').replace(/mc-heads\.net\/avatar\/([^/'")]+)\/\d+/, 'mc-heads.net/avatar/$1/256')
        if(head !== current) avatar.style.backgroundImage = head
    }
    showHead()
    new MutationObserver(showHead).observe(avatar, { attributes: true, attributeFilter: ['style'] })
    byId('vortexServerStatus').append(byId('server_status_wrapper'))
    byId('vortexLaunchSlot').append(byId('launch_content'))
    byId('vortexProgress').append(byId('launch_details'))
    const play = byId('launch_button')
    const releases = require('../vortex/test-release.cjs')
    let pending = null, updating = false
    const progress = document.createElement('div')
    progress.id = 'vortexUpdateProgress'
    progress.hidden = true
    const progressText = document.createElement('span')
    const progressBar = document.createElement('progress')
    progressBar.max = 100
    progress.append(progressText, progressBar)
    byId('vortexProgress').append(progress)
    const refreshUpdate = () => {
        if(updating) return
        try { pending = ConfigManager.getSelectedServer() === 'vortex-published-test' ? releases.getTestReleaseStatus(ConfigManager.getInstanceDirectory()) : null }
        catch { pending = null }
        play.textContent = pending?.pending ? 'ACTUALIZAR' : '▶  JUGAR'
    }
    play.addEventListener('click', event => {
        refreshUpdate()
        if(!pending?.pending && !updating) return
        event.preventDefault(); event.stopImmediatePropagation()
        if(updating) return
        updating = true; play.disabled = true; play.textContent = 'ACTUALIZANDO…'
        progress.hidden = false; progressBar.value = 0; progressText.textContent = 'Preparando actualización…'
        const worker = require('child_process').fork(require('path').resolve(__dirname, '../vortex/update-worker.cjs'), [], { execPath: process.execPath, env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' }, stdio: ['ignore','ignore','ignore','ipc'], windowsHide: true })
        let completed = false
        const finish = error => {
            if(completed) return
            completed = true; updating = false; play.disabled = false
            if(error) { progressText.textContent = 'No se pudo actualizar: ' + error; progressBar.removeAttribute('value') }
            else { progressBar.value = 100; progress.hidden = true }
            refreshUpdate()
        }
        worker.on('message', message => {
            if(message.progress) { progressBar.value = message.progress.percent; progressText.textContent = 'Descargando pack · ' + message.progress.percent + '%' }
            if(message.done) finish()
            if(message.error) finish(message.error)
        })
        worker.on('error', error => finish(error.message))
        worker.on('exit', () => { if(!completed) finish('La actualización se interrumpió') })
        worker.send({ instancesRoot: ConfigManager.getInstanceDirectory(), version: pending.version })
    }, true)
    refreshUpdate()
    setInterval(refreshUpdate, 30000)
    window.addEventListener('focus', refreshUpdate)
    const versionButton = byId('server_selection_button')
    const showVersion = async () => {
        const selected = ConfigManager.getSelectedServer()
        const server = (await DistroAPI.getDistribution()).getServerById(selected)
        if(selected !== ConfigManager.getSelectedServer()) return
        const raw = server?.rawServer
        const numeric = String((selected === 'vortex-published-test' ? releases.getTestReleaseStatus(ConfigManager.getInstanceDirectory())?.version : null) || raw?.version || '').match(/\d+\.\d+\.\d+(?:\.\d+)?/)
        const label = numeric ? 'Versión: ' + numeric[0] : 'Seleccionar versión'
        versionButton.title = raw?.name || 'Seleccionar versión'
        if(versionButton.textContent !== label) versionButton.textContent = label
    }
    const refreshVersion = () => { refreshUpdate(); showVersion().catch(() => {}) }
    refreshVersion()
    new MutationObserver(refreshVersion).observe(versionButton, { childList: true, characterData: true, subtree: true })
    const status = byId('player_count')
    const normalizeStatus = () => {
        const value = status.textContent.trim()
        if(!value || /^(null|undefined)$/i.test(value)) status.textContent = 'Estado no disponible'
    }
    normalizeStatus()
    new MutationObserver(normalizeStatus).observe(status, { childList: true, characterData: true, subtree: true })
    byId('vortexSettings').onclick = () => byId('settingsMediaButton').click()
    byId('vortexHome').onclick = () => { if(getComputedStyle(byId('settingsContainer')).display !== 'none') { byId('settingsNavDone').click(); return } if(byId('newsContainer').style.top === '0px') byId('newsButton').click() }
})
