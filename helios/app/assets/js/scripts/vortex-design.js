document.addEventListener('DOMContentLoaded', () => {
    const byId = id => document.getElementById(id)
    byId('vortexAccount').append(byId('user_content'))
    const avatar = byId('avatarContainer')
    const showHead = () => {
        const current = avatar.style.backgroundImage
        const head = current.replace(/mc-heads\.net\/body\/([^/'")]+)\/right/, 'mc-heads.net/avatar/$1/64')
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
    byId('vortexHome').onclick = () => { if(byId('newsContainer').style.top === '0px') byId('newsButton').click() }
})
