// Runs before styles to apply the saved theme without a light-theme flash.
(()=>{const key='nodepath-theme';const media=window.matchMedia('(prefers-color-scheme: dark)');const valid=value=>['light','dark','system'].includes(value);let preference='system';try{const saved=localStorage.getItem(key);if(valid(saved))preference=saved;}catch{}
function apply(){document.documentElement.dataset.theme=preference==='system'?(media.matches?'dark':'light'):preference;const control=document.querySelector('#theme');if(control)control.value=preference;}
apply();media.addEventListener('change',()=>{if(preference==='system')apply();});
window.addEventListener('storage',event=>{if(event.key===key||event.key===null){preference=valid(event.newValue)?event.newValue:'system';apply();}});
document.addEventListener('DOMContentLoaded',()=>{const control=document.querySelector('#theme');if(!control)return;control.value=preference;control.addEventListener('change',()=>{preference=valid(control.value)?control.value:'system';try{localStorage.setItem(key,preference);}catch{}apply();});});})();
