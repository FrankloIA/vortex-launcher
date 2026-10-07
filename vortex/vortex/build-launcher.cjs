const fs=require('fs'),path=require('path'),{promisify}=require('util')
const execute=promisify(require('child_process').execFile)
const {launcherHash}=require('./test-gate.cjs'),{fileHash}=require('./pack-bundles.cjs')
const source=path.resolve(__dirname,'..'),output=path.join(source,'dist'),receiptFile=path.join(output,'vortex-build.json')
function launcherBuild(version) {
    const base=version.replace(/ fixed$/,'')
    if(!/^\d+\.\d+\.\d+$/.test(base)) throw Error('El instalador necesita una versión numérica, por ejemplo 1.0.2')
    if(!fs.existsSync(receiptFile)) return null
    const receipt=JSON.parse(fs.readFileSync(receiptFile)),buildOutput=path.join(output,receipt.directory || ''),installer=path.join(buildOutput,'Vortex Launcher-setup-'+base+'.exe'),executable=path.join(buildOutput,'win-unpacked/Vortex Launcher.exe')
    if(receipt.version!==base || receipt.launcherHash!==launcherHash() || !fs.existsSync(installer) || !fs.existsSync(executable) || fileHash(installer)!==receipt.sha256) return null
    return {...receipt,installer,executable}
}
async function ensureLauncherBuild(version) {
    const existing=launcherBuild(version);if(existing)return existing
    const base=version.replace(/ fixed$/,'')
    if(!/^\d+\.\d+\.\d+$/.test(base)) throw Error('El instalador necesita una versión numérica')
    const before=launcherHash(),directory='build-'+base+'-'+before.slice(0,16),buildOutput=path.join(output,directory)
    await execute(process.execPath,[path.join(source,'node_modules/electron-builder/cli.js'),'--win','nsis','--x64','--publish','never','--config.extraMetadata.version='+base,'--config.directories.output='+buildOutput],{cwd:source,windowsHide:true,timeout:600000,maxBuffer:4*1024*1024,env:{...process.env,PATH:path.dirname(process.execPath)+path.delimiter+process.env.PATH}})
    if(launcherHash()!==before) throw Error('El código cambió durante la compilación; vuelve a preparar la prueba')
    const installer=path.join(buildOutput,'Vortex Launcher-setup-'+base+'.exe')
    fs.writeFileSync(receiptFile,JSON.stringify({version:base,directory,launcherHash:before,sha256:fileHash(installer)},null,2))
    return launcherBuild(version)
}
module.exports={launcherBuild,ensureLauncherBuild}
