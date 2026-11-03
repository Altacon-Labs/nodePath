import {element,createToasts,icon} from './components.mjs';
const signUp=location.pathname==='/sign-up';
const toast=createToasts(document.querySelector('#toasts'));
const host=document.querySelector('#account-form');

const h1=element('h1','',signUp?'Create your account':'Welcome back');
const subtitle=element('p','auth-form-subtitle',signUp?'Open access to Web3 growth intelligence in 30 seconds':'Pick up where your growth journey left off');
host.append(h1,subtitle);

const form=element('form','account-form');
form.noValidate=true;
form.setAttribute('aria-label',signUp?'Demo sign-up':'Demo sign-in');

function field({name,label,type,placeholder,autocomplete,optional=false}){
  const group=element('div','form-field');
  const labelRow=element('div','promo-header');
  const title=element('label','',label);
  title.htmlFor=name;
  labelRow.append(title);
  if(optional){
    labelRow.append(element('span','promo-optional','Optional'));
  }
  const shell=element('div','input-shell');
  const input=element('input');
  Object.assign(input,{id:name,name,type,placeholder,autocomplete});
  if(!optional) input.required=true;
  shell.append(input);
  
  if(type==='password'){
    const reveal=element('button','password-toggle');
    reveal.type='button';
    reveal.setAttribute('aria-label','Show password');
    reveal.append(icon('eye'));
    reveal.addEventListener('click',()=>{
      const shown=input.type==='password';
      input.type=shown?'text':'password';
      reveal.setAttribute('aria-label',shown?'Hide password':'Show password');
      reveal.replaceChildren(icon(shown?'eye-slash':'eye'));
    });
    shell.append(reveal);
  }
  
  const error=element('p','field-error');
  error.id=name+'-error';
  input.setAttribute('aria-describedby',name+'-error');
  
  group.append(labelRow,shell,error);
  input.addEventListener('input',()=>{
    input.removeAttribute('aria-invalid');
    error.textContent='';
  });
  form.append(group);
  return{input,error};
}

const email=field({name:'email',label:'Email',type:'email',placeholder:'trader@example.com',autocomplete:'email'});
const password=field({name:'password',label:'Password',type:'password',placeholder:signUp?'Minimum 8 characters':'Enter your password',autocomplete:signUp?'new-password':'current-password'});

let promoField=null;
let termsBox=null;
if(signUp){
  promoField=field({name:'promo',label:'Promo code',type:'text',placeholder:'Enter promo code',optional:true});
  
  const termsRow=element('label','terms-row');
  termsBox=element('input');
  termsBox.type='checkbox';
  termsBox.required=true;
  termsBox.id='terms-check';
  const termsText=element('span','');
  termsText.innerHTML='I accept the <a href="#" class="terms-link">Terms of Service</a> and <a href="#" class="terms-link">Privacy Policy</a>';
  termsRow.append(termsBox,termsText);
  form.append(termsRow);
}

const submit=element('button','submit-btn',signUp?'Create account':'Sign in');
submit.type='submit';
form.append(submit);
host.append(form);

const swap=element('p','auth-switch',signUp?'Already have an account? ':'New to NodePath? ');
const swapLink=element('a','',signUp?'Sign in':'Create account');
swapLink.href=signUp?'/login':'/sign-up';
swap.append(swapLink);
host.append(swap);

form.addEventListener('submit',event=>{
  event.preventDefault();
  let first;
  function fail(field,message){
    field.input.setAttribute('aria-invalid','true');
    field.error.textContent=message;
    first??=field.input;
  }
  
  if(!email.input.value.trim()||!email.input.validity.valid) fail(email,'Enter a valid email address.');
  if(!password.input.value) fail(password,'Enter a password.');
  else if(signUp&&password.input.value.length<8) fail(password,'Minimum 8 characters required.');
  
  if(signUp&&termsBox&&!termsBox.checked){
    toast('Please accept the Terms of Service to continue.',{error:true});
    first??=termsBox;
  }
  
  if(first){
    first.focus();
    toast('Check the highlighted fields.',{error:true});
    return;
  }
  
  submit.disabled=true;
  submit.textContent='Authenticating…';
  
  setTimeout(()=>{
    password.input.value='';
    submit.disabled=false;
    submit.textContent=signUp?'Create account':'Sign in';
    toast('Demo account validated. Redirecting to workspace…');
    setTimeout(()=>{
      location.href='/#overview';
    },800);
  },600);
});

