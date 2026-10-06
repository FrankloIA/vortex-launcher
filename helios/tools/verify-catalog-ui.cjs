const { app, BrowserWindow } = require('electron')
const fs = require('fs')
const path = require('path')
app.whenReady().then(async () => {
    const window = new BrowserWindow({ width: 1400, height: 1000, show: false, webPreferences: { contextIsolation: true } })
    try {
        await window.loadURL('http://127.0.0.1:43117/')
        const result = await window.webContents.executeJavaScript(`(async () => {
            await refresh(); switchPanel('add');
            get('onlineQuery').value = 'sodium'; get('onlineSearch').click();
            for(let i=0;i<100 && !document.querySelector('.catalogRow');i++) await new Promise(r=>setTimeout(r,200));
            const rows = document.querySelectorAll('.catalogRow');
            if(!rows.length || !get('library').hidden || get('onlineContent').hidden) throw Error('Catálogo no visible');
            await new Promise(r=>setTimeout(r,1500));
            const images = [...document.querySelectorAll('.catalogIcon img')].filter(img=>img.complete && img.naturalWidth>0).length;
            if(!images) throw Error('Imágenes no cargadas');
            return { results: rows.length, loadedImages: images, first: rows[0].querySelector('h3').textContent };
        })()`)
        fs.writeFileSync(path.resolve(__dirname, '../.runtime/catalog-ui.png'), (await window.webContents.capturePage()).toPNG())
        console.log(JSON.stringify(result)); app.exit(0)
    } catch(error) { console.error(error.message); app.exit(1) }
})
