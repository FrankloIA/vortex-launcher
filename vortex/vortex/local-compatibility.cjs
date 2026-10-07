const Zip = require('adm-zip')
const semver = require('semver')
function matches(version, ranges) {
    const v = semver.coerce(version)?.version
    if(!v) return false
    return (Array.isArray(ranges) ? ranges : [ranges]).some(range => {
        if(typeof range !== 'string') return false
        if(range === '*') return true
        const exact = range.match(/^\[([^,]+)\]$/)
        if(exact) return semver.eq(v,semver.coerce(exact[1]).version)
        const interval = range.match(/^([[(])([^,]*),([^\])]*)([\])])$/)
        if(interval) {
            const [,left,min,max,right]=interval
            return (!min || (left==='[' ? semver.gte : semver.gt)(v,semver.coerce(min).version)) && (!max || (right===']' ? semver.lte : semver.lt)(v,semver.coerce(max).version))
        }
        try { return semver.satisfies(v,range) } catch { return false }
    })
}
function checkLocal(data, category, target, metadata) {
    if(category === 'config') return
    if(category==='mods' && target.loader==='neoforge' && target.neoforge) {
        const entry=new Zip(data).getEntry('META-INF/neoforge.mods.toml')
        for(const block of entry?.getData().toString('utf8').split(/(?=\[\[dependencies\.)/) || []) {
            if(!/modId\s*=\s*["']neoforge["']/.test(block) || /type\s*=\s*["'](?:optional|discouraged|incompatible)["']/.test(block))continue
            const range=block.match(/versionRange\s*=\s*["']([^"']+)["']/)?.[1]
            if(range && !matches(target.neoforge,range))throw Error('Este mod requiere NeoForge '+range+'; tu versión configurada es '+target.neoforge)
        }
    }
    if(metadata?.gameVersions) {
        const loader = {neoforge:'NeoForge',forge:'Forge',fabric:'Fabric',quilt:'Quilt'}[target.loader]
        if(!metadata.gameVersions.includes(target.minecraft) || (category==='mods' && !metadata.gameVersions.includes(loader))) throw Error('El archivo no es compatible con Minecraft ' + target.minecraft + ' y ' + target.loader)
        return
    }
    const zip = new Zip(data)
    if(category === 'mods') {
        const fabric = zip.getEntry('fabric.mod.json'), quilt = zip.getEntry('quilt.mod.json')
        if(target.loader === 'fabric' && fabric) {
            const mod=JSON.parse(fabric.getData()); if(matches(target.minecraft,mod.depends?.minecraft)) return
        }
        if(target.loader === 'quilt' && quilt) {
            const mod=JSON.parse(quilt.getData()); const dep=mod.quilt_loader?.depends?.find(d=>d.id==='minecraft'); if(matches(target.minecraft,dep?.versions)) return
        }
        const entry=zip.getEntry(target.loader==='neoforge' ? 'META-INF/neoforge.mods.toml' : target.loader==='forge' ? 'META-INF/mods.toml' : '')
        if(entry) {
            const text=entry.getData().toString('utf8')
            const blocks=text.split(/(?=\[\[dependencies\.)/)
            const mc=blocks.filter(b=>/modId\s*=\s*["']minecraft["']/.test(b))
            if(mc.length && mc.every(b=>matches(target.minecraft,b.match(/versionRange\s*=\s*["']([^"']+)["']/)?.[1]))) return
        }
    }
    if(category==='resourcepacks' && target.minecraft==='1.21.1') {
        const entry=zip.getEntry('pack.mcmeta')
        if(entry) {
            const pack=JSON.parse(entry.getData()).pack
            const supported=pack.supported_formats
            if(pack.pack_format===34 || (Array.isArray(supported) && supported[0]<=34 && supported[1]>=34) || (supported?.min_inclusive<=34 && supported.max_inclusive>=34)) return
        }
    }
    throw Error('No se puede verificar la compatibilidad de este archivo con Minecraft ' + target.minecraft + ' y ' + target.loader + '; usa una versión identificable del catálogo')
}
module.exports = {checkLocal,matches}
