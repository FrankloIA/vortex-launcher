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
    byId('launch_button').textContent = '▶  JUGAR'
    const versionButton = byId('server_selection_button')
    const showVersion = async () => {
        const selected = ConfigManager.getSelectedServer()
        const server = (await DistroAPI.getDistribution()).getServerById(selected)
        if(selected !== ConfigManager.getSelectedServer()) return
        const raw = server?.rawServer
        const numeric = String(raw?.version || '').match(/\d+\.\d+\.\d+(?:\.\d+)?/)
        const label = numeric ? 'Versión: ' + numeric[0] : 'Seleccionar versión'
        versionButton.title = raw?.name || 'Seleccionar versión'
        if(versionButton.textContent !== label) versionButton.textContent = label
    }
    const refreshVersion = () => showVersion().catch(() => {})
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
