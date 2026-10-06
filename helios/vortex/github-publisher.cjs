const fs=require('fs'),path=require('path'),crypto=require('crypto')
const {promisify}=require('util'),execute=promisify(require('child_process').execFile)
const {TestGate}=require('./test-gate.cjs')
const {hash,verify}=require('./release-store.cjs')
const REPOSITORY='FrankloIA/vortex-launcher',CHANNEL_TAG='vortex-pack-stable'
class GithubPublisher {
    constructor(root,gh=async args=>(await execute('gh',args,{windowsHide:true,timeout:600000,maxBuffer:1024*1024})).stdout,expectedKey=require('./pack-feed.json').publicKey) {this.root=root;this.gh=gh;this.expectedKey=expectedKey}
    async available() {
        if(!fs.existsSync(path.join(this.root,'private-signing-key.pem')) || fs.readFileSync(path.join(this.root,'public-signing-key.pem'),'utf8')!==this.expectedKey) return false
        try {const repo=JSON.parse(await this.gh(['api','repos/'+REPOSITORY]));return !repo.private && !!repo.permissions?.push} catch {return false}
    }
    async publish(name,revision) {
        const gate=new TestGate(this.root),run=gate.assertPassed(name),draft=gate.store.getDraft(name)
        if(draft.revision!==revision) throw Error('La revisión cambió antes de publicar')
        if(!await this.available()) throw Error('Inicia sesión con GitHub CLI y comprueba el permiso de publicación del repositorio público de Vortex')
        const bytes=fs.readFileSync(path.join(this.root,'releases',draft.version+'.json'))
        if(hash(bytes)!==run.releaseSha256) throw Error('La versión cambió después de probar')
        const key=fs.readFileSync(path.join(this.root,'public-signing-key.pem')),manifest=verify(JSON.parse(bytes),key)
        const tag='vortex-pack-'+draft.version.replace(/ /g,'-')+'-'+run.releaseSha256.slice(0,12),output=path.join(this.root,'publication',tag)
        const parts=require('./pack-bundles.cjs').bundles(this.root,manifest.files,output)
        const releaseFile=path.join(output,'release.json'),notesFile=path.join(output,'notes.txt')
        fs.writeFileSync(releaseFile,bytes);fs.writeFileSync(notesFile,manifest.notes)
        const url=asset=>'https://github.com/'+REPOSITORY+'/releases/download/'+tag+'/'+asset
        let exists=false;try {await this.gh(['release','view',tag,'--repo',REPOSITORY]);exists=true} catch {}
        if(!exists) await this.gh(['release','create',tag,'--repo',REPOSITORY,'--draft','--latest=false','--title','Vortex '+draft.version,'--notes-file',notesFile])
        await this.gh(['release','upload',tag,releaseFile,...parts.map(p=>p.file),'--repo',REPOSITORY,'--clobber'])
        gate.assertPassed(name)
        await this.gh(['release','edit',tag,'--repo',REPOSITORY,'--draft=false','--latest=false'])
        const payload=JSON.stringify({schema:1,version:draft.version,releaseSha256:run.releaseSha256,releaseUrl:url('release.json'),bundles:parts.map(p=>({url:url(p.name),sha256:p.sha256,size:p.size})),publishedAt:new Date().toISOString()})
        const pointer={payload,signature:crypto.sign(null,Buffer.from(payload),fs.readFileSync(path.join(this.root,'private-signing-key.pem'))).toString('base64')},stableFile=path.join(output,'stable.json')
        fs.writeFileSync(stableFile,JSON.stringify(pointer,null,2))
        let channelExists=false;try {await this.gh(['release','view',CHANNEL_TAG,'--repo',REPOSITORY]);channelExists=true} catch {}
        if(!channelExists) await this.gh(['release','create',CHANNEL_TAG,'--repo',REPOSITORY,'--latest=false','--title','Canal oficial del pack Vortex','--notes','Canal de distribución firmado de Vortex'])
        gate.assertPassed(name)
        await this.gh(['release','upload',CHANNEL_TAG,stableFile,'--repo',REPOSITORY,'--clobber'])
        return {...gate.store.promote(name,revision),url:'https://github.com/'+REPOSITORY+'/releases/tag/'+tag}
    }
}
module.exports={GithubPublisher,REPOSITORY,CHANNEL_TAG}
