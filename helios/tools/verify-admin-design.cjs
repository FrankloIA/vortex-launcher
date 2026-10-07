const {app,BrowserWindow}=require('electron'),fs=require('fs'),path=require('path')
app.whenReady().then(async()=>{
    const window=new BrowserWindow({show:false,width:1600,height:1050,webPreferences:{nodeIntegration:false,contextIsolation:true}}),errors=[]
    window.webContents.on('console-message',(_e,level,message)=>{if(level>=3)errors.push(message)})
    const wait=ms=>new Promise(r=>setTimeout(r,ms)),output=path.resolve(__dirname,'../.runtime/admin-design');fs.mkdirSync(output,{recursive:true})
    try{
        await window.loadURL('http://127.0.0.1:43117');await wait(1600)
        const desktop=await window.webContents.executeJavaScript(`(()=>{switchPanel('library');window.VortexDesign.sync();return {title:document.querySelector('h1').textContent,cards:document.querySelectorAll('.summaryCard').length,scopeButtons:document.querySelectorAll('[data-scope]').length,rows:document.querySelectorAll('.tableRow').length,visibleRows:document.querySelectorAll('.tableRow:not([hidden])').length,overflow:document.documentElement.scrollWidth>innerWidth,layout:getComputedStyle(document.querySelector('.libraryLayout')).gridTemplateColumns,sidebar:getComputedStyle(document.querySelector('.mainTabs')).position}})()`)
        if(desktop.cards!==4 || desktop.scopeButtons!==2 || desktop.overflow || desktop.visibleRows>4)throw Error('Distribución incorrecta: '+JSON.stringify(desktop))
        const paging=await window.webContents.executeJavaScript(`(()=>{const first=get('content').querySelector('.fileRow:not([hidden]) h3').textContent;document.querySelector('[aria-label="Página siguiente"]').click();const second=get('content').querySelector('.fileRow:not([hidden]) h3').textContent;document.querySelector('[aria-label="Página anterior"]').click();return first!==second})()`);if(!paging)throw Error('La paginación no funciona');
        fs.writeFileSync(path.join(output,'desktop.png'),(await window.webContents.capturePage()).toPNG())
        await window.webContents.executeJavaScript(`switchPanel('create');window.VortexDesign.sync()`);await wait(5200)
        const stays=await window.webContents.executeJavaScript(`panel==='create' && !get('createContent').hidden`);if(!stays)throw Error('La pestaña Crear no conserva la selección')
        await window.webContents.executeJavaScript(`switchPanel('library');get('search').value='distant';render();window.VortexDesign.sync()`);await wait(200)
        const search=await window.webContents.executeJavaScript(`get('content').querySelectorAll('.fileRow').length`)
        await window.webContents.executeJavaScript(`get('search').value='';render();window.VortexDesign.sync()`)
        window.setSize(1000,900);await wait(200);const medium=await window.webContents.executeJavaScript(`document.documentElement.scrollWidth<=innerWidth`)
        fs.writeFileSync(path.join(output,'medium.png'),(await window.webContents.capturePage()).toPNG())
        window.setSize(420,900);await wait(200);const mobile=await window.webContents.executeJavaScript(`document.documentElement.scrollWidth<=innerWidth`)
        fs.writeFileSync(path.join(output,'mobile.png'),(await window.webContents.capturePage()).toPNG())
        if(!medium || !mobile || errors.length)throw Error('Revisión responsive o consola: '+JSON.stringify({medium,mobile,errors}))
        const result={desktop,staysOnCreate:stays,pagination:paging,searchResults:search,medium,mobile,errors};fs.writeFileSync(path.join(output,'result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));app.exit(0)
    }catch(error){console.error(error.message);app.exit(1)}
})
