const { prepareTestRelease } = require('./test-release.cjs')
process.on('message', async ({ instancesRoot, version, account }) => {
    try {
        const administrator=await require('./account-role.cjs').accountRole(account) === 'Administrador'
        const result = prepareTestRelease(instancesRoot, version, progress => process.send({ progress }),{administrator})
        process.send({ done: true, version: result.version }, () => process.exit(0))
    } catch(error) { process.send({ error: error.message }, () => process.exit(1)) }
})
