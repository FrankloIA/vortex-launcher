const fs = require('fs')
const path = require('path')
const { applyRelease, hash, verify } = require('./release-store.cjs')
function prepareTestRelease(instancesRoot, expectedVersion) {
    const root = path.resolve(__dirname, '../.runtime/pack-admin')
    const channel = JSON.parse(fs.readFileSync(path.join(root, 'channels/test.json')))
    if(expectedVersion && channel.version !== expectedVersion) throw Error('Publica este borrador en pruebas antes de probarlo')
    const bytes = fs.readFileSync(path.join(root, 'releases', channel.version + '.json'))
    if(hash(bytes) !== channel.releaseSha256) throw Error('Publicación alterada')
    const envelope = JSON.parse(bytes), key = fs.readFileSync(path.join(root, 'public-signing-key.pem'))
    const manifest = verify(envelope, key)
    const instance = path.join(instancesRoot, 'vortex-published-test')
    const result = applyRelease(instance, envelope, key, sha => fs.readFileSync(path.join(root, 'blobs', sha)))
    return { version: manifest.version, mods: manifest.files.filter(f => f.path.startsWith('mods/')).length, instance, result }
}
module.exports = { prepareTestRelease }
