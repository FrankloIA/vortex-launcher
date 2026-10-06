const { DistributionAPI } = require('helios-core/common')

const ConfigManager = require('./configmanager')
const fs = require('fs-extra')
const path = require('path')

// Old WesterosCraft url.
// exports.REMOTE_DISTRO_URL = 'http://mc.westeroscraft.com/WesterosCraftLauncher/distribution.json'
exports.REMOTE_DISTRO_URL = null

// Catálogo mínimo local de desarrollo; nunca consulta la distribución de otra comunidad.
fs.ensureDirSync(ConfigManager.getLauncherDirectory())
const catalog = fs.readJsonSync(path.resolve(__dirname, '../../../vortex/distribution.json'))
for(const server of catalog.servers) server.icon = 'assets/images/vortex-logo-full.png'
const testChannel = path.join(process.env.VORTEX_ADMIN_ROOT || path.resolve(__dirname,'../../../.runtime/pack-admin'),'channels/test.json')
const publishedTest = catalog.servers.find(server => server.id === 'vortex-published-test')
if(publishedTest && fs.existsSync(testChannel)) {
    const channel = fs.readJsonSync(testChannel)
    publishedTest.version = channel.version
    publishedTest.name = 'Vortex — pruebas · ' + channel.version
    publishedTest.description = 'Publicación firmada del panel · instancia aislada · ' + channel.version
}
if(process.env.VORTEX_TEST_MODE === '1') {
    catalog.servers = catalog.servers.filter(server => server.id === 'vortex-published-test')
    for(const server of catalog.servers) server.mainServer = true
} else if(publishedTest) {
    const official={...structuredClone(publishedTest),id:'vortex-official',name:'Vortex',description:'Versión oficial · actualizaciones firmadas',version:'1.0.1',mainServer:true}
    for(const server of catalog.servers) server.mainServer=false
    catalog.servers.unshift(official)
    if(require('@electron/remote').app.isPackaged) catalog.servers=[official]
}
fs.writeJsonSync(path.join(ConfigManager.getLauncherDirectory(), 'distribution_dev.json'), catalog, { spaces: 2 })

const api = new DistributionAPI(
    ConfigManager.getLauncherDirectory(),
    null, // Injected forcefully by the preloader.
    null, // Injected forcefully by the preloader.
    exports.REMOTE_DISTRO_URL,
    true
)

exports.DistroAPI = api
