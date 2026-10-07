const path = require('path')
const extensions = new Set(['.json','.toml','.properties','.txt','.cfg','.yaml','.yml','.conf','.ini'])
function editableConfig(file, readBlob) {
    if(!file || !file.path.startsWith('config/') || file.size > 1024 * 1024 || !extensions.has(path.extname(file.path).toLowerCase())) return false
    try {
        const data=readBlob(file.sha256)
        if(data.length>1024*1024) return false
        const text=new TextDecoder('utf-8',{fatal:true}).decode(data)
        return !/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(text)
    } catch { return false }
}
module.exports={editableConfig}
