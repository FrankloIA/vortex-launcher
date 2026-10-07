const { app, BrowserWindow } = require('electron')
const fs = require('fs')
const path = require('path')

process.env.ELECTRON_IS_DEV = '1'
const root = path.resolve(__dirname, '..', '.runtime')
require('../index')
const errors = []
app.on('web-contents-created', (_event, contents) => {
    contents.on('console-message', event => {
        if(event.level === 'error') errors.push(event.message)
    })
})
app.whenReady().then(async () => {
    try {
        const window = BrowserWindow.getAllWindows()[0]
        if(window.webContents.isLoading()) await new Promise(resolve => window.webContents.once('did-finish-load', resolve))
        const result = await window.webContents.executeJavaScript(`(async () => {
            const api = require(${JSON.stringify(path.resolve(__dirname, '../app/assets/js/distromanager'))}).DistroAPI;
            const config = require(${JSON.stringify(path.resolve(__dirname, '../app/assets/js/configmanager'))});
            const neoforge = require(${JSON.stringify(path.resolve(__dirname, '../app/assets/js/neoforge'))});
            const distro = await api.getDistribution();
            const server = distro.getMainServer();
            config.ensureJavaConfig(server.rawServer.id, server.effectiveJavaOptions, server.rawServer.javaOptions.ram);
            config.setSelectedServer(server.rawServer.id);
            config.setJavaExecutable(server.rawServer.id, ${JSON.stringify(process.env.VORTEX_JAVA_EXECUTABLE || 'C:\\Program Files\\Microsoft\\jdk-21.0.12.101-hotspot\\bin\\java.exe')});
            config.save();
            await dlAsync(false);
            return { title: document.title, serverId: server.rawServer.id, minecraft: server.rawServer.minecraftVersion,
                neoforge: server.rawServer.vortexLoader.version, localCatalog: api.isDevMode(),
                isolatedData: config.getDataDirectory(), authenticationConfigured: Boolean(require(${JSON.stringify(path.resolve(__dirname, '../app/assets/js/ipcconstants'))}).AZURE_CLIENT_ID),
                adapterLoaded: neoforge.isNeoForge(server), selectedJava: config.getJavaExecutable(server.rawServer.id),
                readyText: document.getElementById('launch_details_text')?.textContent };
        })()`)
        await new Promise(resolve => setTimeout(resolve, 7000))
        const mainVisible = await window.webContents.executeJavaScript("getComputedStyle(document.getElementById('main')).display !== 'none' && getComputedStyle(document.getElementById('loadingContainer')).display === 'none'")
        result.mainVisible = mainVisible
        const screenshot = await window.webContents.capturePage()
        fs.writeFileSync(path.join(root, 'vortex-ui.png'), screenshot.toPNG())
        fs.writeFileSync(path.join(root, 'vortex-ui-result.json'), JSON.stringify({ ...result, rendererErrors: errors }, null, 2))
        console.log(JSON.stringify({ ...result, rendererErrors: errors }, null, 2))
        if(!result.adapterLoaded || !mainVisible || errors.length) process.exitCode = 1
    } catch(error) {
        console.error(error)
        process.exitCode = 1
    } finally {
        app.exit(process.exitCode || 0)
    }
})
