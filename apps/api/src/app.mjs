import {normalizeWallet} from '@nodepath/domain';
export function handler(req,res) {
  const url=new URL(req.url,'http://localhost');
  const send=(status,body)=>{res.writeHead(status,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(body));};
  if(req.method!=='GET') return send(405,{error:'Method not allowed'});
  if(url.pathname==='/health') return send(200,{status:'ok',service:'nodepath-api',mode:'demo'});
  if(url.pathname==='/v1/overview') return send(200,{mode:'demo',projectId:'demo',trackedWallets:1200,activeWallets:450,retention30d:0.38});
  if(url.pathname.startsWith('/v1/wallets/')) {
    try { const address=normalizeWallet(url.pathname.slice('/v1/wallets/'.length));return send(200,{mode:'demo',address,transactions:12,segment:'sample-active'}); }
    catch {return send(400,{error:'Invalid EVM wallet address'});}
  }
  return send(404,{error:'Not found'});
}

