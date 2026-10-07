const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path')
test('resuelve alias en desarrollo y nombres npm en el empaquetado, incluidos submódulos',()=>{
    const source=fs.readFileSync(path.join(__dirname,'../vortex/dependency-alias.cjs'),'utf8')
    for(const packaged of [false,true]) {
        const core=packaged?['heli','os-core'].join(''):'vortex-core'
        const types=packaged?['heli','os-distribution-types'].join(''):'vortex-distribution-types'
        const mod={_resolveFilename(name){if([core,core+'/mojang',types,types+'/common'].includes(name))return 'found:'+name;throw Object.assign(Error(name),{code:'MODULE_NOT_FOUND'})}}
        vm.runInNewContext(source,{require:()=>mod,Symbol})
        assert.equal(mod._resolveFilename('vortex-core'),'found:'+core)
        assert.equal(mod._resolveFilename('vortex-core/mojang'),'found:'+core+'/mojang')
        assert.equal(mod._resolveFilename('vortex-distribution-types/common'),'found:'+types+'/common')
        assert.throws(()=>mod._resolveFilename('other-module'),/other-module/)
    }
})
