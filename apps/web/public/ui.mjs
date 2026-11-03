import {element} from './components.mjs';
export function button(text,action,secondary=false){const b=element('button',secondary?'secondary':'',text);b.type='button';b.addEventListener('click',action);return b;}
export function textLink(text,href){const a=element('a','text-link',text);a.href=href;return a;}
export function panel(title,description){const card=element('section','card stack');if(title)card.append(element('h2','',title));if(description)card.append(element('p','',description));return card;}

