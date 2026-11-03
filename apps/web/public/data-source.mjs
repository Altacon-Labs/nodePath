import {sampleProject,sampleExploreData,validateBackup} from './model.mjs';
const unavailable=new Set([404,408,429,500,502,503,504]);
// Keep unauthorized or invalid responses visible; never disguise them as an outage.
export async function readProject(project,{fetcher=globalThis.fetch,timeout=4000}={}){
 const fallback=reason=>project.id==='sample'?{project:sampleProject(),origin:'mock',mode:'mock',reason}:{project,origin:project.source==='backend'?'cache':'local',mode:project.source==='backend'?'cached':'local',reason};
 let response;
 try{response=await fetcher('/v1/projects/'+encodeURIComponent(project.id),{signal:AbortSignal.timeout(timeout),cache:'no-store'});}catch(error){return fallback(error.name==='TimeoutError'?'Backend timed out':'Backend offline');}
 if(!response.ok){if(unavailable.has(response.status))return fallback(response.status===404?'No backend project connected':'Backend unavailable ('+response.status+')');throw Error(response.status===401||response.status===403?'Backend access denied. Sign in through your configured authentication service.':'Backend request failed ('+response.status+').');}
 let body;
 try{body=await response.json();if(body.version!==1||!['mock','live'].includes(body.mode)||body.project?.id!==project.id)throw Error();if(project.id!=='sample'&&(body.mode!=='live'||body.project.chainId!==project.chainId||body.project.contract?.toLowerCase()!==project.contract))throw Error();const source=body.mode==='mock'?'sample':'backend';const validated=validateBackup(JSON.stringify({version:1,projects:[{...body.project,source}],activeId:project.id}));return{project:validated.projects[0],origin:'backend',mode:body.mode,reason:body.mode==='mock'?'Demo API serves shared mock transactions':'Backend response validated'};}catch{throw Error('Backend returned an invalid project snapshot. Your saved data has been kept.');}
}
export async function readExplore({fetcher=globalThis.fetch,timeout=4000}={}){
 try{
  const res=await fetcher('/v1/explore',{signal:AbortSignal.timeout(timeout),cache:'no-store'});
  if(res.ok){
   const body=await res.json();
   if(body.version===1&&body.explore) return {explore:body.explore,origin:'backend',mode:body.mode||'mock',reason:'Public index feed via NodePath API'};
  }
 }catch{}
 return {explore:sampleExploreData(),origin:'mock',mode:'mock',reason:'Simulated multi-chain public metrics (offline / demo fallback)'};
}
export function sourceLabel(result){if(!result)return'Checking backend…';if(result.error)return'Data source error · saved data shown';if(result.origin==='backend')return result.mode==='mock'?'Mock data · backend':'Backend data';if(result.origin==='mock')return'Mock data · fallback';if(result.origin==='cache')return'Cached backend data · offline';return'Local project · '+result.reason;}
