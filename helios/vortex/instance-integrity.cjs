const fs=require('fs'),path=require('path')
const {verify,safe}=require('./release-store.cjs'),{fileHash}=require('./pack-bundles.cjs')
const roots=['mods','resourcepacks','shaderpacks','config','defaultconfigs','kubejs','scripts']
class IntegrityError extends Error {constructor(files){super('Has realizado modificaciones a los archivos del juego. Debes reparar o descargar nuevamente la instalación para continuar');this.code='VORTEX_INTEGRITY';this.files=files}}
function scan(instance,envelope,key,expectedReader) {
    const manifest=verify(envelope,key),expected=new Map(),issues=[]
    for(const f of manifest.files){if(!roots.includes(f.path.split('/')[0]))continue;const entry={...f};if(f.path==='config/iris.properties'&&!entry.integrityHash&&expectedReader){const original=expectedReader(f.sha256);if(require('./release-store.cjs').hash(original)!==f.sha256)throw Error('Configuración original alterada');entry.integrityHash=require('./release-store.cjs').hash(original.toString('utf8').split(/\r?\n/).filter(line=>!/^\s*(shaderPack|enableShaders)\s*=/.test(line)).join('\n').trim())}expected.set(f.path.toLowerCase(),entry)}
    if(manifest.security?.runtimeIris || (!expected.has('config/iris.properties') && fs.existsSync(path.join(instance,'config/iris.properties'))))expected.set('config/iris.properties',{path:'config/iris.properties',integrityHash:require('./release-store.cjs').hash(Buffer.alloc(0))})
    for(const f of expected.values()) {
        let target
        try{target=safe(instance,f.path);if(!fs.existsSync(target) && /^mods\/DistantHorizons/i.test(f.path))target=safe(instance,f.path+'.disabled')
            if(!fs.existsSync(target)){const bytes=require('./mod-vault.cjs').stored(instance,f);if(!bytes)issues.push(f.path)}else if(!fs.statSync(target).isFile())issues.push(f.path);else if(f.path==='config/iris.properties' && f.integrityHash){const text=fs.readFileSync(target,'utf8');const props=Object.fromEntries(text.split(/\r?\n/).filter(l=>/^(shaderPack|enableShaders)=/.test(l)).map(l=>{const n=l.indexOf('=');return [l.slice(0,n),l.slice(n+1)]}));if(!['','Vortex Luxury Shader.zip','Vortex Ratrero Shader.zip'].includes(props.shaderPack)||!['true','false'].includes(props.enableShaders)||require('./release-store.cjs').hash(text.split(/\r?\n/).filter(line=>!/^\s*(shaderPack|enableShaders)\s*=/.test(line)).join('\n').trim())!==f.integrityHash)issues.push(f.path)}else if(fileHash(target)!==f.sha256)issues.push(f.path)
        }catch{issues.push(f.path)}
    }
    function walk(dir,relative){if(!fs.existsSync(dir))return;if(fs.lstatSync(dir).isSymbolicLink()){issues.push(relative);return}for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
        const name=relative+'/'+entry.name,target=path.join(dir,entry.name)
        if(entry.isSymbolicLink()){issues.push(name);continue}
        if(entry.isDirectory())walk(target,name)
        else if(!expected.has(name.toLowerCase()) && !(/^mods\/DistantHorizons.*\.jar\.disabled$/i.test(name)&&expected.has(name.slice(0,-9).toLowerCase())))issues.push(name)
    }}
    for(const root of roots)walk(path.join(instance,root),root)
    if(issues.length)throw new IntegrityError([...new Set(issues)])
    return manifest
}
function authority(instance,key){const p=path.join(instance,'.vortex-authority.json');if(!fs.existsSync(p)){if(fs.existsSync(path.join(instance,'.vortex-owned.json')))throw new IntegrityError(['Falta el manifiesto firmado de instalación']);return null}const envelope=JSON.parse(fs.readFileSync(p));scan(instance,envelope,key);return envelope}
module.exports={scan,authority,IntegrityError}
