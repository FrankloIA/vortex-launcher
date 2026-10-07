const {app,BrowserWindow}=require('electron'),fs=require('fs'),os=require('os'),path=require('path')
const {startAdmin}=require('./admin-server.cjs')
const {ReleaseStore}=require('../vortex/release-store.cjs')
app.whenReady().then(async()=>{
    const root=fs.mkdtempSync(path.join(os.tmpdir(),'vortex-hosting-ui-')),store=new ReleaseStore(root)
    store.create('ui','1.0.2','verificación');store.setWorkspace({activeId:'ui'})
    const upload=path.join(root,'fixture.txt');fs.writeFileSync(upload,'{"enabled":true}');store.add('ui',0,upload,'config/fixture.json','seed')
    const hostingApi={configured:()=>true,details:async()=>({relationships:{allocations:{data:[{attributes:{is_default:true,ip:'127.0.0.1',port:9}}]}}}),status:async()=>({state:'offline',memory:0,cpu:0}),backups:async()=>[],list:async directory=>directory==='/'?[{name:'config',is_file:false}]:directory==='/config'?[{name:'server.json',is_file:true,size:16,modified_at:'fixture'}]:[],download:async()=>Buffer.from('{"enabled":true}')}
    const {server,url}=await startAdmin({root,port:0,hostingApi,syncVersion:null})
    const window=new BrowserWindow({show:false,width:1400,height:950,webPreferences:{nodeIntegration:false,contextIsolation:true}})
    const errors=[];window.webContents.on('console-message',(_event,level,message)=>{if(level>=3)errors.push(message)})
    try {
        await window.loadURL(url);await new Promise(resolve=>setTimeout(resolve,800))
        const result=await window.webContents.executeJavaScript(`(async()=>{
            await refresh(); switchPanel('server'); await refreshServer();
            await api('server/import',{}); for(let i=0;i<30;i++){const status=await api('server/job');if(!status.job.running)break;await new Promise(r=>setTimeout(r,20))}
            await loadServerLibrary();get('libraryScope').value='server';get('libraryScope').onchange();await loadServerLibrary();switchPanel('library');render();
            const rows=[...get('content').querySelectorAll('article')];category='config';render();
            const edit=[...get('content').querySelectorAll('button')].find(b=>b.textContent==='Editar');edit.click();await new Promise(r=>setTimeout(r,150));
            const result={serverTab:!!get('serverTab'),credentialsInput:get('hostingToken').type,serverFiles:serverLibrary.files.length,configDialog:get('configDialog').open,configScope:editing?.scope,clientFiles:current().files.length,htmlErrors:[]};get('configDialog').close();return result;
        })()`)
        if(!result.serverTab || result.credentialsInput!=='password' || result.serverFiles!==1 || !result.configDialog || result.configScope!=='server')throw Error('Interfaz de hosting incompleta: '+JSON.stringify(result))
        if(errors.length)throw Error(errors.join('; '));console.log(JSON.stringify(result));app.exit(0)
    }catch(error){console.error(error.message);app.exit(1)}finally{server.close();fs.rmSync(root,{recursive:true,force:true})}
})
