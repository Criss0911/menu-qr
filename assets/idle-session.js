export const IDLE_LIMIT=60*60*1000;
export const IDLE_WARNING=2*60*1000;
// This is the panel's inactivity lock, not a replacement for RLS or JWT expiry.
export function createIdleClock({storage,now=Date.now,onExpire=()=>{},onWarning=()=>{},limit=IDLE_LIMIT,warning=IDLE_WARNING}){
 let key='',last=0,expired=true;
 const read=()=>{try{const v=storage.getItem(key);return v===null?null:Number(v);}catch{return null;}};
 const write=v=>{try{storage.setItem(key,String(v));}catch{}};
 function check(){
  if(!key||expired)return false;
  const shared=read(),time=now();
  if(shared===0||!Number.isFinite(shared)&&shared!==null){expire();return false;}
  if(shared!==null)last=shared;
  const left=limit-(time-last);
  if(left<=0||last>time){expire();return false;}
  onWarning(left<=warning?Math.ceil(left/1000):null);return true;
 }
 function expire(){if(expired)return;expired=true;write(0);onWarning(null);onExpire();}
 return {
  start(id,{fresh=false}={}){const next='menuqr:idle:v1:'+id;if(next===key&&!fresh)return check();key=next;expired=false;const saved=read();last=fresh||saved===null?now():saved;if(fresh||saved===null)write(last);return check();},
  check,
  touch(){if(!check())return false;last=now();write(last);onWarning(null);return true;},
  stop(){key='';expired=true;onWarning(null);},
  expire
 };
}
export function sessionIdentity(session){
 try{const part=session.access_token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');const claims=JSON.parse(atob(part));return session.user.id+':'+(claims.session_id||session.user.last_sign_in_at||'legacy');}
 catch{return session.user.id+':'+(session.user.last_sign_in_at||'legacy');}
}
export function installIdleSession({onExpire}){
 let storage;try{storage=window.localStorage;}catch{storage={getItem:()=>null,setItem:()=>{}};}
 const box=document.createElement('div');box.hidden=true;box.className='panel';box.setAttribute('role','alert');box.style.cssText='position:fixed;bottom:16px;left:16px;right:16px;z-index:2147483647;max-width:600px;margin:auto;border:2px solid #a52250';
 const message=document.createElement('p'),button=document.createElement('button');button.type='button';button.textContent='Continuar sesión';box.append(message,button);document.body.append(box);
 const clock=createIdleClock({storage,onExpire,onWarning:seconds=>{const host=document.querySelector('dialog[open]')||document.body;if(box.parentElement!==host)host.append(box);box.hidden=seconds===null;if(seconds!==null)message.textContent='Tu sesión se cerrará por inactividad en '+Math.ceil(seconds/60)+' minuto(s). Guarda tus cambios o continúa la sesión.';}});
 button.onclick=()=>clock.touch();
 const activity=e=>{if(!e.isTrusted||document.hidden)return;const wasActive=document.querySelector('#dashboard')&&!document.querySelector('#dashboard').hidden;if(!clock.check()){if(wasActive){e.preventDefault();e.stopImmediatePropagation();}return;}clock.touch();};
 for(const name of ['pointerdown','keydown','input','wheel','click','submit'])document.addEventListener(name,activity,{capture:true});
 window.addEventListener('storage',()=>clock.check());
 document.addEventListener('visibilitychange',()=>clock.check());window.addEventListener('focus',()=>clock.check());window.addEventListener('pageshow',()=>clock.check());
 setInterval(()=>clock.check(),1000);
 return {...clock,start:(session,options)=>clock.start(sessionIdentity(session),options)};
}
