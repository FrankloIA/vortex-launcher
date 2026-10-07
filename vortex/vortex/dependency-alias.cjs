// Compatibilidad de imports internos de la dependencia original, sin carpetas duplicadas.
const Module=require('module')
const key=Symbol.for('vortex.dependency-alias')
if(!Module[key]){
    const resolve=Module._resolveFilename
    Module._resolveFilename=function(request,...args){
        const original=['heli','os-distribution-types'].join('')
        if(request===original||request.startsWith(original+'/'))request='vortex-distribution-types'+request.slice(original.length)
        return resolve.call(this,request,...args)
    }
    Module[key]=true
}
