import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
// Explicit asset map prevents arbitrary filesystem reads.
const assets=new Map([['/',[new URL('./index.html',import.meta.url),'text/html; charset=utf-8']],...['styles.css','app.mjs','components.mjs'].map(name=>['/assets/'+name,[new URL('./public/'+name,import.meta.url),name.endsWith('.css')?'text/css':'text/javascript']]),...[400,600,700].map(weight=>['/assets/manrope-'+weight+'.woff2',['https://cdn.jsdelivr.net/npm/@fontsource/manrope@5.1.0/files/manrope-latin-'+weight+'-normal.woff2','font/woff2']]),...['wallet','x'].map(name=>['/assets/icons/'+name+'.svg',['https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/regular/'+name+'.svg','image/svg+xml']])]);
const server=createServer(async(req,res)=>{const pathname=new URL(req.url,'http://localhost').pathname;if(req.method!=='GET'){res.writeHead(405);return res.end();}
 if(pathname.startsWith('/v1/')){try{const upstream=await fetch('http://'+(process.env.API_HOST||'127.0.0.1')+':'+(process.env.API_PORT||4000)+req.url,{signal:AbortSignal.timeout(5000)});res.writeHead(upstream.status,{'content-type':'application/json'});res.end(await upstream.text());}catch{res.writeHead(502,{'content-type':'application/json'});res.end(JSON.stringify({error:'API unavailable'}));}return;}
 const asset=assets.get(pathname);if(!asset){res.writeHead(404);return res.end('Not found');}if(typeof asset[0]==='string'&&asset[0].startsWith('https://')){res.writeHead(302,{location:asset[0]});return res.end();}try{const body=await readFile(asset[0]);res.writeHead(200,{'content-type':asset[1]});res.end(body);}catch{res.writeHead(500);res.end('Asset unavailable');}});
server.listen(Number(process.env.WEB_PORT||3000),process.env.WEB_HOST||'127.0.0.1',()=>console.log('NodePath web: http://localhost:'+(process.env.WEB_PORT||3000)));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close());

