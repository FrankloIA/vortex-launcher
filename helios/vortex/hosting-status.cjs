const {getServerStatus}=require('./server-status.cjs')
class HostingStatus {
    constructor(api,{ping=getServerStatus}={}) {this.api=api;this.ping=ping;this.cached=null;this.pending=null;this.address=null}
    async get(force=false) {
        if(!force && this.cached && Date.now()-this.cached.checkedAt<15000)return this.cached
        if(this.pending)return this.pending
        this.pending=this.check().then(result=>this.cached=result).finally(()=>{this.pending=null});return this.pending
    }
    async check() {
        let host='ly06.astrolnodes.net',port=25622,state='unknown',resources={},apiError
        if(this.api.configured()) {
            try {
                if(!this.address || Date.now()-this.address.time>60000){const d=await this.api.details(),a=d.relationships?.allocations?.data?.find(item=>item.attributes.is_default)?.attributes;if(a)this.address={host:a.ip_alias || a.ip,port:a.port,time:Date.now()}}
                if(this.address){host=this.address.host;port=this.address.port}
                resources=await this.api.status();state=resources.state
            } catch(error) {apiError=error.message}
        }
        let players=null,gameOnline=false
        try {const status=await this.ping(767,host,port);players={online:status.players.online,max:status.players.max};gameOnline=true} catch {}
        return {configured:this.api.configured(),online:gameOnline,state,players,hostname:host,port,cpu:resources.cpu,memory:resources.memory,disk:resources.disk,apiError,checkedAt:Date.now()}
    }
}
module.exports={HostingStatus}
