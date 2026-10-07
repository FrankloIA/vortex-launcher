const fs = require('fs')
const path = require('path')
const {hash, atomic} = require('./release-store.cjs')

// Minecraft puede vaciar la selección después de una recuperación de recursos.
// Recuperar solo esas dos opciones, conservando los ajustes personales.
function restoreEmptySelection(instance, manifest, readBlob) {
    const file = manifest.files.find(f => f.path === 'options.txt')
    const target = path.join(instance, 'options.txt')
    if(!file || !fs.existsSync(target)) return false
    const current = fs.readFileSync(target, 'utf8')
    const line = current.match(/^resourcePacks:(.*)$/m)
    if(!line) return false
    let selected
    try { selected = JSON.parse(line[1]) } catch { return false }
    if(!Array.isArray(selected) || selected.length) return false
    const bytes = readBlob(file.sha256)
    if(bytes.length !== file.size || hash(bytes) !== file.sha256) throw Error('Opciones originales del pack alteradas')
    const original = bytes.toString('utf8')
    const packsLine = original.match(/^resourcePacks:(.*)$/m)
    if(!packsLine) return false
    const packs = JSON.parse(packsLine[1])
    if(!Array.isArray(packs) || !packs.length) return false
    // No activar archivos que el administrador haya retirado de su perfil.
    const present = new Set(manifest.files.filter(f=>f.path.startsWith('resourcepacks/') && fs.existsSync(path.join(instance,f.path))).map(f=>'file/'+f.path.slice('resourcepacks/'.length)))
    const restored = packs.filter(p => typeof p === 'string' && (!p.startsWith('file/') || present.has(p)))
    if(!restored.length) return false
    let next = current.replace(/^resourcePacks:.*$/m, 'resourcePacks:'+JSON.stringify(restored))
    const incompatibleLine = original.match(/^incompatibleResourcePacks:(.*)$/m)
    const incompatible = incompatibleLine ? JSON.parse(incompatibleLine[1]).filter(p=>restored.includes(p)) : []
    const replacement = 'incompatibleResourcePacks:'+JSON.stringify(incompatible)
    next = /^incompatibleResourcePacks:.*$/m.test(next) ? next.replace(/^incompatibleResourcePacks:.*$/m,replacement) : next+'\n'+replacement+'\n'
    atomic(target,next)
    return true
}
module.exports = {restoreEmptySelection}
