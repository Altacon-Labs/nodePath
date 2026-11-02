import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {handler} from '../src/app.mjs';
test('demo API reports status and rejects invalid wallets',async()=>{
 const server=createServer(handler);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try {const base='http://127.0.0.1:'+server.address().port;assert.equal((await (await fetch(base+'/health')).json()).mode,'demo');assert.equal((await fetch(base+'/v1/wallets/bad')).status,400);assert.equal((await fetch(base+'/missing')).status,404);assert.equal((await (await fetch(base+'/v1/overview')).json()).trackedWallets,1200);}
 finally {await new Promise(resolve=>server.close(resolve));}
});

