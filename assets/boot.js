// Show a recoverable screen if a required module cannot be downloaded.
const entry=document.currentScript?.dataset.entry==='admin'?'admin':'menu';
import('./'+entry+'.js?v=public-16').catch(()=>{
 const host=document.querySelector(entry==='admin'?'#status':'#app');if(!host)return;
 host.textContent='No se pudo iniciar esta página. Comprueba tu conexión e inténtalo otra vez. ';
 const button=document.createElement('button');button.type='button';button.textContent='Volver a intentar';button.onclick=()=>location.reload();host.append(button);
});
