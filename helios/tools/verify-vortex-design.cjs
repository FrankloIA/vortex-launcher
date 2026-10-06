const { app, BrowserWindow, nativeImage } = require('electron')
const fs = require('fs')
const path = require('path')
process.env.ELECTRON_IS_DEV = '1'
require('../index')
app.whenReady().then(async () => {
    try {
        const root = path.resolve(__dirname, '..')
        const png = nativeImage.createFromPath(path.join(root, 'app/assets/images/vortex-icon-pixel.png')).resize({width:256,height:256}).toPNG()
        const header = Buffer.alloc(22); header.writeUInt16LE(1,2); header.writeUInt16LE(1,4); header.writeUInt16LE(1,10); header.writeUInt16LE(32,12); header.writeUInt32LE(png.length,14); header.writeUInt32LE(22,18)
        fs.writeFileSync(path.join(root, 'app/assets/images/vortex-icon-pixel.ico'), Buffer.concat([header,png]))
        const window = BrowserWindow.getAllWindows()[0]
        if(window.webContents.isLoading()) await new Promise(r=>window.webContents.once('did-finish-load',r))
        await new Promise(r=>setTimeout(r,3500))
        const result = await window.webContents.executeJavaScript(`(() => {
            const ids = ['vortexSettings','vortexHome','launch_button','server_selection_button','avatarOverlay'];
            for(const id of ids) if(!document.getElementById(id)) throw Error('Control ausente: '+id);
            if(!document.getElementById('vortexServerStatus').contains(document.getElementById('player_count'))) throw Error('Estado del servidor sin conectar');
            if(document.getElementById('vortexServerStatus').textContent.trim()==='null') throw Error('Estado nulo visible');
            if(document.querySelectorAll('.vortexNav button').length!==2 || document.querySelector('.vortexCards')) throw Error('Navegación sin simplificar');
            if(document.querySelectorAll('#launch_button').length!==1) throw Error('Control duplicado');
            document.getElementById('main').style.display='block';document.getElementById('landingContainer').style.display='block';document.getElementById('loadingContainer').style.display='none';
            for(const id of ['welcomeContainer','loginContainer','loginOptionsContainer','settingsContainer','waitingContainer']) {const el=document.getElementById(id);if(el)el.style.display='none'}
            return { playMoved: document.getElementById('vortexLaunchSlot').contains(document.getElementById('launch_button')), accountMoved: document.getElementById('vortexAccount').contains(document.getElementById('avatarOverlay')), title: document.querySelector('.vortexHero h1').textContent };
        })()`)
        if(!result.playMoved || !result.accountMoved) throw Error('Controles sin conectar')
        await new Promise(r=>setTimeout(r,500))
        fs.writeFileSync(path.join(root,'.runtime/vortex-design.png'),(await window.webContents.capturePage()).toPNG())
        console.log(JSON.stringify(result)); app.exit(0)
    } catch(e) {console.error(e.message);app.exit(1)}
})
