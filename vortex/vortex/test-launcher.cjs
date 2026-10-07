const fs=require('fs'),path=require('path')
function prepareTestLauncher(runtimeRoot) {
    const sourceFile=path.join(runtimeRoot,'launcher/config.json')
    if(!fs.existsSync(sourceFile)) throw Error('Inicia sesión con Mystwer en el launcher antes de probar')
    const source=JSON.parse(fs.readFileSync(sourceFile)), accounts=source.authenticationDatabase || {}
    const entry=Object.entries(accounts).find(([,account])=>(account.displayName || '').toLowerCase()==='mystwer')
    if(!entry) throw Error('La cuenta Mystwer no tiene una sesión guardada; inicia sesión primero')
    const root=path.join(runtimeRoot,'testing'), configFile=path.join(root,'launcher/config.json')
    fs.mkdirSync(path.dirname(configFile),{recursive:true})
    const existing=fs.existsSync(configFile) ? JSON.parse(fs.readFileSync(configFile)) : source
    const config={...existing,authenticationDatabase:{[entry[0]]:entry[1]},selectedAccount:entry[0],selectedServer:'vortex-published-test'}
    config.settings ||= {};config.settings.launcher ||= {};config.settings.launcher.dataDirectory=path.join(root,'data')
    fs.writeFileSync(configFile,JSON.stringify(config,null,4),{mode:0o600})
    return {root,instances:path.join(root,'data/instances'),account:entry[1].displayName}
}
module.exports={prepareTestLauncher}
