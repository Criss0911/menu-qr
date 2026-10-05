export const GAME_SECONDS=30;
export const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
export function makeGame(){return {remaining:GAME_SECONDS,score:0,caught:0,combo:0,basket:.5,items:[],spawnIn:.15,nextId:0,over:false};}
export function makeTreat(rng=Math.random){const roll=rng();return {kind:roll<.15?'pepper':roll<.28?'gold':'food',x:.1+rng()*.8,y:-.08,speed:.23+rng()*.1};}
export function collect(state,kind){if(state.over)return 0;let points;if(kind==='pepper'){points=-2;state.combo=0;}else{state.caught++;state.combo++;points=(kind==='gold'?3:1)+(state.combo%5===0?2:0);}const before=state.score;state.score=Math.max(0,state.score+points);return state.score-before;}
export function advance(state,seconds,rng=Math.random){if(state.over||!Number.isFinite(seconds)||seconds<=0)return [];const dt=Math.min(seconds,state.remaining);state.remaining=Math.max(0,state.remaining-dt);const hits=[];state.spawnIn-=dt;if(state.spawnIn<=0){state.items.push({...makeTreat(rng),id:state.nextId++});state.spawnIn=.6;}
 state.items=state.items.filter(item=>{const previous=item.y;item.y+=item.speed*dt;if(previous<.86&&item.y>=.86&&Math.abs(item.x-state.basket)<.14){hits.push({kind:item.kind,points:collect(state,item.kind)});return false;}if(item.y>1.12){if(item.kind!=='pepper')state.combo=0;return false;}return true;});
 if(state.remaining<=0)state.over=true;return hits;
}
export function readRecord(storage,key){try{const n=Number(storage.getItem(key));return Number.isInteger(n)&&n>=0&&n<=100000?n:0;}catch{return 0;}}
export function saveRecord(storage,key,score){const best=Math.max(readRecord(storage,key),score);try{storage.setItem(key,String(best));}catch{}return best;}
