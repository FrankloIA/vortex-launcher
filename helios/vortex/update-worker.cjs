const { prepareTestRelease } = require('./test-release.cjs')
process.on('message', ({ instancesRoot, version }) => {
    try {
        const result = prepareTestRelease(instancesRoot, version, progress => process.send({ progress }))
        process.send({ done: true, version: result.version }, () => process.exit(0))
    } catch(error) { process.send({ error: error.message }, () => process.exit(1)) }
})
