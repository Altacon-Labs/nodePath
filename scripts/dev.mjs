import {spawn} from 'node:child_process';
const children=['apps/api/src/server.mjs','apps/web/server.mjs'].map(file=>spawn(process.execPath,['--env-file-if-exists=.env',file],{stdio:'inherit'}));
let stopping=false;
function stop(code=0){if(stopping)return;stopping=true;for(const child of children)child.kill();process.exitCode=code;}
for(const child of children){child.on('error',()=>stop(1));child.on('exit',code=>{if(!stopping)stop(code||0);});}
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());

