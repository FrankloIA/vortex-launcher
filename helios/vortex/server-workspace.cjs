const fs=require('fs'),path=require('path'),crypto=require('crypto')
const {hash,safe,atomic,ReleaseStore}=require('./release-store.cjs')
const roots=['mods','resourcepacks','config','defaultconfigs','plugins']
const binary=name=>/\.(jar|zip|db|sqlite|dat|gz|log|disabled|bak)$/i.test(name)
function serverFile(value) {safe(path.resolve('.'),value);if(!roots.includes(value.split('/')[0]))throw Error('Archivo fuera de la biblioteca del servidor');return value}
const read=(file,fallback)=>fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):fallback
const save=(file,data)=>atomic(file,JSON.stringify(data,null,2))
class ServerWorkspace {
    constructor(root,api) {
        this.root=root;this.folder=path.join(root,'server');this.api=api;this.store=new ReleaseStore(root);this.job=read(path.join(this.folder,'job.json'),null)
        if(this.job?.running){this.job.running=false;this.job.ok=false;this.job.error='La operación se interrumpió al cerrar el panel. Revisa el backup y los cambios antes de continuar';this.job.progress='Operación interrumpida';save(path.join(this.folder,'job.json'),this.job)}
    }
    planFile(id) {this.store.draftFile(id);return path.join(this.folder,'drafts',id+'.json')}
    baseline() {return read(path.join(this.folder,'baseline.json'),{files:[],loaded:false})}
    current(id) {return id && !id.startsWith('release:')?read(this.planFile(id),null):null}
    editable(id,revision) {
        if(this.job?.running) throw Error('Espera a que termine la operación del servidor')
        const draft=this.store.getDraft(id);if(this.store.workspace().activeId!==id || this.store.isOfficial(draft))throw Error('Crea una versión para modificar el servidor')
        if(draft.revision!==revision)throw Error('La versión cambió; actualiza antes de modificar el servidor');return draft
    }
    async inventory() {
        const folders=await this.api.list('/'),files=[],queue=roots.filter(name=>folders.some(f=>f.name===name && !f.is_file)).map(name=>'/'+name)
        while(queue.length) {
            const group=queue.splice(0,4)
            await Promise.all(group.map(async directory=>{
                let entries;try{entries=await this.api.list(directory)}catch(error){if(error.message.includes('HTTP 404'))return;throw error}
                for(const entry of entries) {
                    if(entry.is_symlink || !entry.name || entry.name.includes('/') || /[\\\x00-\x1f]/.test(entry.name))continue
                    const name=(directory+'/'+entry.name).slice(1);serverFile(name)
                    if(entry.is_file) {
                        const category=name.split('/')[0]
                        if(/\.(disabled|bak|log|db|sqlite|gz)$/i.test(entry.name) || /(^|\/)(logs?|cache|backups?)(\/|$)/i.test(name))continue
                        if(category==='mods' && !/\.jar$/i.test(entry.name) || category==='resourcepacks' && !/\.zip$/i.test(entry.name))continue
                        files.push({path:name,size:entry.size,modifiedAt:entry.modified_at,remote:true,editableText:entry.size<=1048576 && !binary(entry.name),...(/\.(jar|zip)$/i.test(entry.name)?{protection:{protected:true,reason:'Archivo del servidor sin identidad exacta; protegido hasta verificar'}}:{})})
                    } else if(!/(^|\/)(logs?|cache|backups?|libraries)(\/|$)/i.test(name) && name.split('/').length<9)queue.push('/'+name)
                }
                if(files.length>10000 || queue.length>3000)throw Error('Biblioteca demasiado grande; revisa las carpetas del servidor')
            }))
        }
        files.sort((a,b)=>a.path.localeCompare(b.path));const catalog={loaded:true,loadedAt:new Date().toISOString(),files};save(path.join(this.folder,'baseline.json'),catalog);return catalog
    }
    view(id) {
        if(this.job)save(path.join(this.folder,'job.json'),this.job)
        const base=this.baseline(),plan=this.current(id)
        if(id?.startsWith('release:')){const version=id.slice(8);if(!/^[\w.-]+( fixed)?$/.test(version))throw Error('Versión inválida');const archived=read(path.join(this.folder,'official',version+'.json'),null);if(archived)return {loaded:true,loadedAt:archived.archivedAt,files:archived.files,changes:[],job:this.job,archived:true}}
        return {loaded:base.loaded,loadedAt:base.loadedAt,files:(plan?.files || base.files).map(file=>{const cached=base.files.find(b=>b.path===file.path);return cached && (!file.sha256 || cached.sha256===file.sha256)?{...cached,...file,source:file.source || cached.source,display:file.display || cached.display,protection:file.protection || cached.protection}:file}),changes:plan?.changes || [],job:this.job}
    }
    async analyze(metadata,job) {
        const catalog=this.baseline();if(!catalog.loaded)throw Error('Carga primero la biblioteca del servidor')
        const pending=catalog.files.filter(f=>/^(mods|resourcepacks)\//.test(f.path) && !f.sha256)
        for(let start=0;start<pending.length;start+=3){job.progress='Identificando archivos: '+Math.min(start+3,pending.length)+'/'+pending.length;await Promise.all(pending.slice(start,start+3).map(async file=>{file.sha256=this.blob(await this.bytes(file))}));save(path.join(this.folder,'baseline.json'),catalog)}
        await metadata.identify(catalog.files.filter(f=>f.sha256))
        for(const file of catalog.files.filter(f=>f.sha256)) {
            const info=metadata.get(file);file.source=info?.source;file.display=info?.display
            let reviewed,inspectionError
            if(file.path.startsWith('mods/'))try{reviewed=require('./mod-destination.cjs').inspectMod(fs.readFileSync(path.join(this.root,'blobs',file.sha256)))}catch(error){inspectionError=error.message}
            file.protection={protected:!!reviewed?.jarvis || !info?.source || !!inspectionError,jarvis:!!reviewed?.jarvis,reason:reviewed?.jarvis?'Modificado por Jarvis':inspectionError?'Pendiente de revisión: '+inspectionError:'Archivo sin identidad exacta; protegido hasta verificar'}
        }
        save(path.join(this.folder,'baseline.json'),catalog);return {identified:catalog.files.filter(f=>f.source).length,protected:catalog.files.filter(f=>f.protection?.protected).length}
    }
    ensure(id) {
        let plan=this.current(id);if(plan)return plan
        const base=this.baseline();if(!base.loaded)throw Error('Carga primero la biblioteca del servidor')
        plan={draftId:id,base:structuredClone(base.files),files:structuredClone(base.files),changes:[],createdAt:Date.now()};save(this.planFile(id),plan);return plan
    }
    async bytes(file) {
        if(file.sha256) {const data=fs.readFileSync(path.join(this.root,'blobs',file.sha256));if(hash(data)!==file.sha256)throw Error('Archivo local del servidor alterado');return data}
        const data=await this.api.download('/'+serverFile(file.path));if(data.length!==file.size)throw Error('El archivo cambió en el servidor; vuelve a cargar la biblioteca')
        return data
    }
    blob(data) {const sha=hash(data),file=path.join(this.root,'blobs',sha);if(!fs.existsSync(file))atomic(file,data);return sha}
    async original(plan,name) {const original=plan.base.find(f=>f.path===name);if(original && !original.sha256)original.sha256=this.blob(await this.bytes(original));return original}
    async replacementFor(id,name,data,source) {
        const files=this.view(id).files.filter(f=>f.path.startsWith('mods/'))
        if(files.some(f=>f.path===name))return name
        const ids=require('./mod-destination.cjs').modIds(data);if(!ids.length)throw Error('No se pudo identificar el mod para evitar duplicados en el servidor')
        // La identidad se comprueba dentro de los JAR, incluso si los nombres de cliente y servidor difieren.
        const probable=source?files.filter(f=>f.source?.provider===source.provider && String(f.source?.projectId)===String(source.projectId)):[]
        const ordered=[...probable,...files.filter(f=>!probable.includes(f))];let match
        for(const file of ordered) {
            const bytes=await this.bytes(file),existingIds=require('./mod-destination.cjs').modIds(bytes)
            if(ids.some(value=>existingIds.includes(value))){if(match)throw Error('Hay varias variantes del mismo mod en el servidor: revisa '+match+' y '+file.path);match=file.path}
        }
        return match
    }
    note(id,revision,text) {this.store.edit(id,revision,d=>{d.automaticNotes ||= [];d.automaticNotes.push({key:'server:'+crypto.randomUUID(),text:'Servidor: '+text})})}
    async add(id,revision,name,data,replacePath,source) {
        this.editable(id,revision);serverFile(name);const plan=this.ensure(id)
        if(replacePath) {serverFile(replacePath);if(replacePath.split('/')[0]!==name.split('/')[0] || !plan.files.some(f=>f.path===replacePath))throw Error('Archivo a sustituir inválido')}
        const previous=replacePath || name,original=await this.original(plan,previous)
        const current=this.view(id).files.find(f=>f.path===previous)
        if(source?.provider && current?.protection?.protected)throw Error('El catálogo no puede sustituir un archivo Jarvis o desconocido')
        const sha256=this.blob(data)
        plan.files=plan.files.filter(f=>f.path!==previous && f.path!==name)
        plan.files.push({path:name,size:data.length,sha256,policy:'managed',editableText:data.length<=1048576 && !binary(name),source,protection:source?undefined:{protected:true,jarvis:!!original,reason:original?'Modificado por Jarvis':'Archivo local protegido'}})
        plan.changes=plan.changes.filter(c=>c.path!==previous && c.path!==name)
        if(original && original.path!==name)plan.changes.push({path:previous,type:'remove',before:original.sha256})
        const targetOriginal=await this.original(plan,name)
        if(!targetOriginal || targetOriginal.sha256!==sha256)plan.changes.push({path:name,type:targetOriginal?'replace':'add',before:targetOriginal?.sha256,after:sha256})
        this.note(id,revision,(original?'Sustituido ':'Añadido ')+name);save(this.planFile(id),plan);return this.view(id)
    }
    async remove(id,revision,name) {
        this.editable(id,revision);serverFile(name);const plan=this.ensure(id);if(!plan.files.some(f=>f.path===name))throw Error('Archivo inexistente')
        const original=await this.original(plan,name);plan.files=plan.files.filter(f=>f.path!==name);plan.changes=plan.changes.filter(c=>c.path!==name)
        if(original)plan.changes.push({path:name,type:'remove',before:original.sha256})
        this.note(id,revision,'Retirado '+name);save(this.planFile(id),plan);return this.view(id)
    }
    async config(id,name) {serverFile(name);const file=this.view(id).files.find(f=>f.path===name);if(!file?.editableText)throw Error('Esta configuración no se puede editar como texto');const data=await this.bytes(file);if(data.includes(0))throw Error('Archivo binario');return {path:name,text:this.current(id)?.editorDrafts?.[name] ?? data.toString('utf8'),savedText:data.toString('utf8')}}
    autosave(id,revision,name,text) {this.editable(id,revision);serverFile(name);const plan=this.ensure(id);if(!plan.files.some(f=>f.path===name && f.editableText))throw Error('Configuración inexistente');plan.editorDrafts ||= {};plan.editorDrafts[name]=text;const draft=this.store.edit(id,revision,()=>{});save(this.planFile(id),plan);return {revision:draft.revision}}
    start(label,operation) {
        if(this.job?.running)throw Error('Ya hay una operación del servidor en curso')
        const job=this.job={id:crypto.randomUUID(),running:true,label,progress:label,startedAt:Date.now()}
        save(path.join(this.folder,'job.json'),job)
        Promise.resolve().then(()=>operation(job)).then(result=>{job.result=result;job.progress='Operación completada';job.ok=true}).catch(error=>{job.error=error.message;job.progress='La operación no se completó';job.ok=false}).finally(()=>{job.running=false;job.finishedAt=Date.now();save(path.join(this.folder,'job.json'),job)})
        return {jobId:job.id}
    }
    async deploy(id,revision,job) {
        const wasRunning=(await this.api.status()).state==='running'
        try {return await this.deployCore(id,revision,job)}catch(error){
            if(wasRunning && (!job.filesTouched || job.restored)) {
                try{if((await this.api.status()).state==='offline')await this.api.power('start')}catch{throw Error(error.message+' · No se pudo arrancar la versión anterior; inicia el servidor desde el hosting')}
            }
            throw error
        }
    }
    async deployCore(id,revision,job) {
        // The caller holds the global job lock; validate the immutable selection again.
        const draft=this.store.getDraft(id);if(this.store.workspace().activeId!==id || this.store.isOfficial(draft) || draft.revision!==revision)throw Error('La versión seleccionada cambió')
        const plan=this.current(id);if(!plan?.changes.length)throw Error('No hay cambios del servidor para aplicar')
        if(Object.keys(plan.editorDrafts || {}).length)throw Error('Guarda las configuraciones del servidor pendientes antes de aplicar cambios')
        const stamp=hash(Buffer.from(JSON.stringify(plan)));job.progress='Avisando a los jugadores y deteniendo el servidor'
        const state=await this.api.status();if(state.state==='running'){await this.api.warn();await this.api.power('stop')}else if(state.state!=='offline')throw Error('Espera a que el servidor esté encendido o detenido')
        await this.api.waitOffline();job.progress='Creando backup completo del servidor'
        const backup=await this.api.backup('Vortex '+draft.version+' '+new Date().toISOString());job.backupId=backup.uuid
        let complete=false
        for(let i=0;i<300;i++){const b=await this.api.backupStatus(backup.uuid);if(b.completed_at){if(!b.is_successful)throw Error('El backup falló; no se cambiaron archivos');complete=true;break}await this.api.sleep(2000)}
        if(!complete)throw Error('El backup no terminó a tiempo; no se cambiaron archivos')
        if(this.store.getDraft(id).revision!==revision || hash(Buffer.from(JSON.stringify(this.current(id))))!==stamp)throw Error('La versión cambió; no se aplicaron archivos')
        job.progress='Comparando hashes con el servidor'
        for(const change of plan.changes) {
            if(change.before && hash(await this.api.download('/'+change.path))!==change.before)throw Error('Otro proceso modificó '+change.path+'; se conserva su contenido')
            if(!change.before){const parent=path.posix.dirname('/'+change.path),name=path.posix.basename(change.path);let entries;try{entries=await this.api.list(parent)}catch(error){if(!error.message.includes('HTTP 404'))throw error;entries=[]}if(entries.some(f=>f.name===name))throw Error('El archivo ya existe en producción: '+change.path)}
        }
        const staging='/vortex-stage-'+job.id,rollback='/vortex-rollback-'+job.id
        await this.api.mkdir(staging);await this.api.mkdir(rollback)
        for(const [i,change] of plan.changes.entries()) {
            if(!change.after)continue
            job.progress='Subiendo y verificando '+change.path
            const data=fs.readFileSync(path.join(this.root,'blobs',change.after));if(hash(data)!==change.after)throw Error('Blob alterado: '+change.path)
            await this.api.upload(staging,String(i),data);if(hash(await this.api.download(staging+'/'+i))!==change.after)throw Error('La subida no conserva el hash: '+change.path)
        }
        if(this.store.getDraft(id).revision!==revision)throw Error('La versión cambió; archivos originales conservados')
        const receipt={version:draft.version,draftId:id,revision,backupId:backup.uuid,rollback,changes:structuredClone(plan.changes),previousFiles:structuredClone(plan.base),appliedAt:new Date().toISOString(),started:false,phase:'applying'}
        plan.lastDeployment=receipt;save(this.planFile(id),plan);save(path.join(this.folder,'deployments',job.id+'.json'),receipt)
        const applied=[],moved=[];job.progress='Aplicando cambios con copias de recuperación'
        try {
            for(const [i,change] of plan.changes.entries()) {
                job.filesTouched=true
                if(change.before){await this.api.rename('/'+change.path,rollback+'/'+i);moved.push({path:change.path,index:i})}
                if(change.after){await this.ensureRemoteDirectory(path.posix.dirname('/'+change.path));await this.api.rename(staging+'/'+i,'/'+change.path);applied.push({path:change.path,index:i})}
            }
            for(const change of plan.changes)if(change.after && hash(await this.api.download('/'+change.path))!==change.after)throw Error('Verificación final fallida: '+change.path)
        } catch(error) {
            const errors=[]
            for(const item of applied.reverse())try{await this.api.rename('/'+item.path,staging+'/failed-'+item.index)}catch{errors.push(item.path)}
            for(const item of moved.reverse())try{await this.api.rename(rollback+'/'+item.index,'/'+item.path)}catch{errors.push(item.path)}
            job.restored=!errors.length
            throw Error(error.message+(errors.length?' · Recuperación manual necesaria; utiliza backup '+backup.uuid:' · Archivos originales restaurados'))
        }
        receipt.phase='applied';save(path.join(this.folder,'deployments',job.id+'.json'),receipt)
        plan.base=structuredClone(plan.files);plan.changes=[];plan.lastDeployment=receipt;save(this.planFile(id),plan)
        save(path.join(this.folder,'baseline.json'),{loaded:true,loadedAt:receipt.appliedAt,files:plan.files})
        job.progress='Arrancando el servidor';await this.api.power('start');let running=false
        for(let i=0;i<120;i++){const status=await this.api.status();if(status.state==='running'){running=true;break}if(i>3 && status.state==='offline')break;await this.api.sleep(2000)}
        receipt.started=running;plan.lastDeployment=receipt;save(this.planFile(id),plan);save(path.join(this.folder,'deployments',job.id+'.json'),receipt)
        if(!running)throw Error('Cambios aplicados pero el servidor no arrancó; publicación oficial bloqueada. Backup: '+backup.uuid)
        return receipt
    }
    async ensureRemoteDirectory(directory) {if(directory==='/')return;try{await this.api.list(directory)}catch(error){if(!error.message.includes('HTTP 404'))throw error;await this.ensureRemoteDirectory(path.posix.dirname(directory));await this.api.mkdir(directory)}}
    async prepareRestore(id,revision,version) {
        const snapshotFile=path.join(this.folder,'official',version+'.json');if(!fs.existsSync(snapshotFile))return {available:false}
        const snapshot=read(snapshotFile);return this.prepareFiles(id,revision,snapshot.files,'Restauración del servidor de '+version)
    }
    async prepareRollback(id,revision) {
        const receipt=this.current(id)?.lastDeployment;if(!receipt?.previousFiles)throw Error('No hay un despliegue de esta versión que recuperar')
        this.editable(id,revision)
        if(this.current(id)?.changes.length || !receipt.started){const live=await this.inventory(),plan=this.current(id);plan.base=structuredClone(live.files);plan.files=structuredClone(live.files);plan.changes=[];save(this.planFile(id),plan)}
        return this.prepareFiles(id,revision,receipt.previousFiles,'Recuperación del servidor anterior al último despliegue')
    }
    async prepareFiles(id,revision,files,text) {
        this.editable(id,revision);const plan=this.ensure(id);if(plan.changes.length)throw Error('Aplica o cancela los cambios preparados antes de recuperar otra instantánea')
        const changes=[],base=plan.base
        for(const next of files){serverFile(next.path);const previous=base.find(f=>f.path===next.path);if(!next.sha256){if(!previous || previous.modifiedAt!==next.modifiedAt || previous.size!==next.size)throw Error('La instantánea no contiene los bytes necesarios: '+next.path);continue}if(!previous){changes.push({path:next.path,type:'add',after:next.sha256});continue}await this.original(plan,next.path);if(previous.sha256!==next.sha256)changes.push({path:next.path,type:'replace',before:previous.sha256,after:next.sha256})}
        for(const previous of base)if(!files.some(f=>f.path===previous.path)){await this.original(plan,previous.path);changes.push({path:previous.path,type:'remove',before:previous.sha256})}
        plan.files=structuredClone(files);plan.changes=changes;this.note(id,revision,text);save(this.planFile(id),plan);return {available:true,...this.view(id)}
    }
    async archiveOfficial(id) {
        const draft=this.store.getDraft(id);this.assertOfficial(id)
        const plan=this.current(id),base=this.baseline();if(!base.loaded)return null
        const files=structuredClone(plan?.files || base.files)
        for(let i=0;i<files.length;i+=3)await Promise.all(files.slice(i,i+3).map(async file=>{if(!file.sha256)file.sha256=this.blob(await this.bytes(file));if(hash(fs.readFileSync(path.join(this.root,'blobs',file.sha256)))!==file.sha256)throw Error('Instantánea del servidor corrupta')}))
        if(this.store.getDraft(id).revision!==draft.revision)throw Error('La versión cambió mientras se guardaba el historial del servidor')
        return {version:draft.version,files,backupId:plan?.lastDeployment?.backupId,archivedAt:new Date().toISOString()}
    }
    saveOfficial(snapshot) {if(snapshot)save(path.join(this.folder,'official',snapshot.version+'.json'),snapshot)}
    assertOfficial(id) {const plan=this.current(id);if(Object.keys(plan?.editorDrafts || {}).length)throw Error('Hay configuraciones del servidor pendientes');if(plan?.changes.length)throw Error('Aplica y verifica los cambios del servidor antes de publicar oficialmente');if(plan?.lastDeployment && !plan.lastDeployment.started)throw Error('El último despliegue del servidor no arrancó correctamente')}
}
module.exports={ServerWorkspace,serverFile}
