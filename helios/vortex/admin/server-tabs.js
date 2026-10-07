(() => {
    const $=id=>document.getElementById(id),root=$('serverContent')
    $('hostingCredentials').hidden=true
    const oldChildren=[...root.children],nav=document.createElement('nav')
    nav.className='serverSubtabs';nav.setAttribute('aria-label','Secciones del servidor')
    const panes={}
    for(const [key,label] of [['status','Estatus'],['console','Consola'],['publish','Publicar']]) {
        const button=document.createElement('button');button.id='serverSection-'+key;button.textContent=label;button.type='button';button.setAttribute('aria-controls','serverPane-'+key)
        const pane=document.createElement('section');pane.id='serverPane-'+key;pane.className='serverPane';panes[key]=pane
        button.onclick=()=>{for(const [name,p]of Object.entries(panes)){p.hidden=name!==key;$('serverSection-'+name).setAttribute('aria-pressed',String(name===key))}}
        nav.append(button)
    }
    root.querySelector('h2').after(nav);root.append(...Object.values(panes))
    panes.status.innerHTML='<p class="serverIntro">Actividad y recursos del servidor en tiempo real</p><div class="serverMetrics"><article><span>Estado del juego</span><strong id="metricOnline">Consultando…</strong></article><article><span>Jugadores</span><strong id="metricPlayers">—</strong></article><article><span>Memoria RAM</span><strong id="metricRAM">—</strong></article><article><span>Uso de CPU</span><strong id="metricCPU">—</strong></article></div>'
    panes.status.append($('serverState'),$('serverPlayers'));$('serverResources').hidden=true;panes.status.append($('serverResources'))
    const consoleSection=root.querySelector('.serverConsole'),actions=document.createElement('div');actions.className='serverActions'
    panes.console.append(actions,consoleSection)
    const descriptions={serverRefresh:'Consulta de nuevo el estado, los jugadores y los recursos del hosting',serverImport:'Carga los archivos actuales del servidor en la biblioteca, sin modificarlos',serverAnalyze:'Identifica imágenes y actualizaciones; conserva los archivos modificados por Jarvis',serverBackup:'Crea y verifica un backup completo; después elimina la copia anterior',serverRestart:'Avisa a los jugadores y reinicia el servidor tras 10 segundos',serverStart:'Arranca el servidor cuando está apagado',serverStop:'Avisa a los jugadores y apaga el servidor tras 10 segundos',serverDeploy:'Detiene el servidor, verifica un backup, aplica los cambios y vuelve a arrancarlo',serverRollback:'Prepara los archivos del último despliegue para revisar su recuperación; no los aplica todavía'}
    for(const [id,label,signal]of [['serverStart','Arrancar','start'],['serverStop','Apagar','stop']]) {
        const b=document.createElement('button');b.id=id;b.textContent=label;b.className='secondary';b.onclick=()=>action(async()=>{
            if(!confirm(signal==='stop'?'¿Apagar el servidor? Se avisará a los jugadores con 10 segundos de antelación':'¿Arrancar el servidor?'))return
            await api('server/power',{signal});await loadServerLibrary();message(signal==='stop'?'Apagado solicitado con aviso a los jugadores':'Arranque solicitado')
        });actions.append(b)
    }
    for(const id of ['serverRefresh','serverImport','serverAnalyze','serverBackup','serverRestart'])actions.insertBefore($(id),$('serverStart'))
    for(const [id,description]of Object.entries(descriptions)){$(id).title=description;$(id).setAttribute('aria-description',description)}
    panes.publish.innerHTML='<p class="serverIntro">Revisa los cambios antes de aplicarlos al servidor</p><h3>Cambios de esta versión</h3>'
    panes.publish.append($('serverChanges'))
    const publishActions=document.createElement('div');publishActions.className='serverActions';publishActions.append($('serverDeploy'),$('serverRollback'));panes.publish.append(publishActions)
    const backup=document.createElement('section');backup.className='serverBackupCard';backup.innerHTML='<h3>Backup de recuperación</h3><p>Se conserva una sola copia. La anterior se elimina únicamente cuando el nuevo backup está completo y verificado</p>';backup.append($('serverBackups'));panes.publish.append(backup)
    for(const child of oldChildren)if(child.parentElement===root && child.tagName!=='H2' && child.id!=='serverJob')child.hidden=true
    root.append($('serverJob'))
    const originalRefresh=refreshServer
    refreshServer=async()=>{
        const data=await originalRefresh();$('metricOnline').textContent=data.online?'● ONLINE':'● OFFLINE';$('metricOnline').dataset.online=String(data.online)
        $('metricPlayers').textContent=data.players?data.players.online+' / '+data.players.max:'Sin respuesta'
        $('metricRAM').textContent=Number.isFinite(data.memory)?(data.memory/1073741824).toFixed(1)+' GB':'—'
        $('metricCPU').textContent=Number.isFinite(data.cpu)?data.cpu.toFixed(1)+' %':'—'
        $('serverStart').disabled=data.state!=='offline' || !!serverLibrary?.job?.running
        $('serverStop').disabled=data.state!=='running' || !!serverLibrary?.job?.running
        return data
    }
    $('serverSection-status').click()
})()
