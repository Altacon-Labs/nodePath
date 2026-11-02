import {readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const file=dir+'/'+entry.name;if(entry.isDirectory()){if(!['node_modules','.git'].includes(entry.name))await walk(file);}else if(file.endsWith('.mjs')){const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});if(result.status!==0)process.exit(1);}}}
await walk('.');console.log('JavaScript syntax checks passed. No compiled build is required.');

