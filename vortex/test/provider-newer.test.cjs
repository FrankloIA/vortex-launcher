const {test}=require('node:test'),assert=require('node:assert/strict')
const {Providers}=require('../vortex/providers.cjs')
test('no ofrece una versión estable anterior como actualización de una beta posterior',async()=>{
    const p=new Providers('.');p.request=async()=>({data:{fileDate:'2026-09-01'}})
    const installed={provider:'curseforge',projectId:1,fileId:10}
    const candidate={...installed,fileId:11,publishedAt:'2026-08-01'}
    assert.equal(await p.isNewer(candidate,installed),false)
    candidate.publishedAt='2026-10-01';assert.equal(await p.isNewer(candidate,installed),true)
    candidate.publishedAt='invalid';await assert.rejects(p.isNewer(candidate,installed),/fecha/)
    candidate.projectId=2;await assert.rejects(p.isNewer(candidate,installed),/proyecto/)
})
