const fs = require('fs')
const path = require('path')
const clientId = process.argv[2]
if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientId || '')) {
    console.error('Uso: node tools/configure-microsoft.cjs <Application-client-ID público>')
    process.exitCode = 1
} else {
    fs.writeFileSync(path.resolve(__dirname, '../vortex/microsoft-auth.json'), JSON.stringify({ clientId }, null, 2) + '\n')
    console.log('ID público configurado. Reinicia Vortex para iniciar sesión; el acceso a Minecraft aún debe verificarse.')
}
