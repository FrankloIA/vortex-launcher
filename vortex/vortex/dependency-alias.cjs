// Compatibilidad de imports internos de la dependencia original, sin carpetas duplicadas.
const Module=require('module')
const key=Symbol.for('vortex.dependency-alias')
if(!Module[key]){
    const resolve=Module._resolveFilename
    Module._resolveFilename=function(request,...args){
        const original=['heli','os-distribution-types'].join('')
        if(request===original||request.startsWith(original+'/'))request='vortex-distribution-types'+request.slice(original.length)
        try {return resolve.call(this,request,...args)} catch(error) {
            // electron-builder conserva el nombre npm real de los paquetes aliased.
            // Solo se usa la alternativa si no existe el alias solicitado.
            if(error.code!=='MODULE_NOT_FOUND')throw error
            const aliases={ 'vortex-core':['heli','os-core'].join(''), 'vortex-distribution-types':original }
            const alias=Object.keys(aliases).find(name=>request===name || request.startsWith(name+'/'))
            if(!alias)throw error
            return resolve.call(this,aliases[alias]+request.slice(alias.length),...args)
        }
    }
    Module[key]=true
}
