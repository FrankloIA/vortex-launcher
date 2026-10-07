const administrator='c9b7ffb3fca444658a885eceaa68e6d6'
async function accountRole(account,fetcher=fetch) {
    if(account?.type!=='microsoft'||account.uuid?.replace(/-/g,'').toLowerCase()!==administrator || !account.accessToken)return 'Jugador'
    try{const response=await fetcher('https://api.minecraftservices.com/minecraft/profile',{headers:{Authorization:'Bearer '+account.accessToken},redirect:'error',signal:AbortSignal.timeout(10000)});if(!response.ok)return 'Jugador';const profile=await response.json();return profile.id?.replace(/-/g,'').toLowerCase()===administrator?'Administrador':'Jugador'}catch{return 'Jugador'}
}
module.exports={accountRole}
