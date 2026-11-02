import {createServer} from 'node:http';
import {handler} from './app.mjs';
const server=createServer(handler);
server.listen(Number(process.env.API_PORT||4000),process.env.API_HOST||'127.0.0.1',()=>console.log('NodePath demo API listening'));
for(const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>server.close());

