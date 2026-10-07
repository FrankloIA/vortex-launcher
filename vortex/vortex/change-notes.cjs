const path=require('path')
const {execFileSync}=require('child_process')
function sourceCommit() {
    try {return execFileSync('git',['rev-parse','HEAD'],{cwd:path.resolve(__dirname,'../..'),encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','ignore']}).trim()} catch {return null}
}
function launcherChanges(base) {
    if(!/^[a-f0-9]{40}$/.test(base || '')) return []
    try {return execFileSync('git',['log','--format=%H%x09%s',base+'..HEAD','--','vortex/app','vortex/index.js','vortex/vortex','vortex/tools'],{cwd:path.resolve(__dirname,'../..'),encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','ignore']}).trim().split('\n').filter(Boolean).map(line=>{const [commit,...subject]=line.split('\t');return {key:'git:'+commit,text:'Launcher: '+subject.join('\t')}})} catch {return []}
}
function recordChanges(before,draft) {
    const old=new Map(before.files.map(f=>[f.path,f])), next=new Map(draft.files.map(f=>[f.path,f]))
    const lines=[]
    for(const file of draft.files) {
        const previous=old.get(file.path)
        if(!previous) lines.push('Añadido: '+file.path)
        else if(previous.sha256!==file.sha256) lines.push((file.path.startsWith('config/') ? 'Configuración modificada: ' : 'Actualizado o sustituido: ')+file.path)
        else if(JSON.stringify(previous.customization)!==JSON.stringify(file.customization)) lines.push('Protegido como modificación de Jarvis: '+file.path)
    }
    for(const file of before.files) if(!next.has(file.path)) lines.push('Retirado: '+file.path)
    if(before.version!==draft.version) lines.push('Versión cambiada de '+before.version+' a '+draft.version)
    if(before.minecraft!==draft.minecraft || before.loader!==draft.loader) lines.push('Destino: Minecraft '+draft.minecraft+' · '+(draft.loader || 'neoforge'))
    draft.automaticNotes ||= []
    for(const text of lines) draft.automaticNotes.push({key:require('crypto').randomUUID(),text})
}
function notesFor(draft) {
    return [draft.notes || '',(draft.automaticNotes || []).map(n=>'- '+n.text).join('\n')].filter(Boolean).join('\n\n')
}
module.exports={sourceCommit,launcherChanges,recordChanges,notesFor}
