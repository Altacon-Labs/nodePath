import {validateBackup} from './model.mjs';
export function createStore(){const key='nodepath-workspace-v1';let state={projects:[],activeId:null},persistent=true;try{const raw=localStorage.getItem(key);if(raw)state=validateBackup(raw);}catch{persistent=false;}return{get state(){return state;},get persistent(){return persistent;},replace(next){state=next;},save(){try{localStorage.setItem(key,JSON.stringify({version:1,...state}));persistent=true;return true;}catch{persistent=false;return false;}}};}

