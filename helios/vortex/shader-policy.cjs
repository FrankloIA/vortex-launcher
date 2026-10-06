const fs=require('fs'),path=require('path')
const packs=['Vortex Luxury Shader.zip','Vortex Ratrero Shader.zip']
function choices(instance){return [{fullName:'OFF',name:'Desactivados'},...packs.filter(n=>fs.existsSync(path.join(instance,'shaderpacks',n))).map(n=>({fullName:n,name:n.includes('Luxury')?'Luxury':'Ratrero'}))]}
function set(instance,pack){if(pack!=='OFF'&&!packs.includes(pack))throw Error('Shader no permitido');fs.mkdirSync(path.join(instance,'config'),{recursive:true});const p=path.join(instance,'config/iris.properties');let text=fs.existsSync(p)?fs.readFileSync(p,'utf8'):'';for(const [k,v] of Object.entries({shaderPack:pack==='OFF'?'':pack,enableShaders:String(pack!=='OFF')})){const re=new RegExp('^'+k+'=.*$','m');text=re.test(text)?text.replace(re,k+'='+v):text+'\n'+k+'='+v}fs.writeFileSync(p,text);fs.writeFileSync(path.join(instance,'.vortex-shaders.json'),JSON.stringify({pack}));}
function get(instance){const p=path.join(instance,'.vortex-shaders.json');if(fs.existsSync(p))return JSON.parse(fs.readFileSync(p)).pack;const pack=fs.existsSync(path.join(instance,'shaderpacks',packs[0]))?packs[0]:'OFF';set(instance,pack);return pack}
module.exports={choices,set,get}
