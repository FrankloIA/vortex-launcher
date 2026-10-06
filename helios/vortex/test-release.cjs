const fs = require('fs')
const path = require('path')
const { applyRelease, hash, verify } = require('./release-store.cjs')
function prepareTestRelease(instancesRoot, expectedVersion, onProgress = () => {}) {
    const root = path.resolve(__dirname, '../.runtime/pack-admin')
    const channel = JSON.parse(fs.readFileSync(path.join(root, 'channels/test.json')))
    if(expectedVersion && channel.version !== expectedVersion) throw Error('Publica este borrador en pruebas antes de probarlo')
    const bytes = fs.readFileSync(path.join(root, 'releases', channel.version + '.json'))
    if(hash(bytes) !== channel.releaseSha256) throw Error('Publicación alterada')
    const envelope = JSON.parse(bytes), key = fs.readFileSync(path.join(root, 'public-signing-key.pem'))
    const manifest = verify(envelope, key)
    const instance = path.join(instancesRoot, 'vortex-published-test')
    const needed = manifest.files.filter(file => {
        const target = path.join(instance, file.path)
        return !(fs.existsSync(target) && (file.policy === 'seed' || hash(fs.readFileSync(target)) === file.sha256))
    })
    const total = needed.reduce((n, f) => n + f.size, 0)
    let loaded = 0
    onProgress({ percent: 0 })
    const result = applyRelease(instance, envelope, key, sha => {
        const data = fs.readFileSync(path.join(root, 'blobs', sha))
        loaded += data.length
        onProgress({ percent: total ? Math.min(99, Math.floor(loaded * 100 / total)) : 99 })
        return data
    }, {replaceSeeds:process.env.VORTEX_TEST_MODE==='1'})
    require('./mod-policy.cjs').applyOptional(instance)
    const shaders = require('./shader-policy.cjs'); shaders.set(instance, shaders.get(instance))
    onProgress({ percent: 100 })
    return { version: manifest.version, mods: manifest.files.filter(f => f.path.startsWith('mods/')).length, instance, result }
}
function getTestReleaseStatus(instancesRoot) {
    const file = path.resolve(__dirname, '../.runtime/pack-admin/channels/test.json')
    if(!fs.existsSync(file)) return null
    const channel = JSON.parse(fs.readFileSync(file))
    const installed = path.join(instancesRoot, 'vortex-published-test', '.vortex-owned.json')
    const current = fs.existsSync(installed) ? JSON.parse(fs.readFileSync(installed)).version : null
    return { version: channel.version, pending: current !== channel.version }
}
module.exports = { prepareTestRelease, getTestReleaseStatus }
