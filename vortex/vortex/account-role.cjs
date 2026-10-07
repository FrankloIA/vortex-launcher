const administrator='c9b7ffb3fca444658a885eceaa68e6d6'
let verifiedToken=null,verifiedUntil=0,pendingToken=null,pendingRole=null
async function accountRole(account,fetcher=fetch) {
    if(account?.type!=='microsoft'||account.uuid?.replace(/-/g,'').toLowerCase()!==administrator || !account.accessToken)return 'Jugador'
    if(fetcher===fetch){if(verifiedToken===account.accessToken&&Date.now()<verifiedUntil)return 'Administrador';if(pendingToken===account.accessToken&&pendingRole)return pendingRole}
    const verifyRole=async()=>{try{const response=await fetcher('https://api.minecraftservices.com/minecraft/profile',{headers:{Authorization:'Bearer '+account.accessToken},redirect:'error',signal:AbortSignal.timeout(10000)});if(!response.ok)return 'Jugador';const profile=await response.json();return profile.id?.replace(/-/g,'').toLowerCase()===administrator?'Administrador':'Jugador'}catch{return 'Jugador'}}
    if(fetcher!==fetch)return verifyRole()
    const token=account.accessToken;pendingToken=token;const operation=verifyRole();pendingRole=operation
    try{const role=await operation;if(role==='Administrador'){verifiedToken=token;verifiedUntil=Date.now()+60000}return role}finally{if(pendingRole===operation){pendingRole=null;pendingToken=null}}
}
module.exports={accountRole}
