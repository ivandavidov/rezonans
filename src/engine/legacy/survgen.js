/* ================= SURVIVAL: LEVEL GENERATOR ================= */
let SURV=false, survK=0, survSeed=0, survScore=0, survLives=0, bossMul=1, ehpMul=1, modeSel=0, survNewBest=false, survBestShown=0;
const survBest=(i=DI)=>parseInt(store.get(KEY('best')+i,'0'),10)||0;
const survBestK=(i=DI)=>parseInt(store.get(KEY('bestK')+i,'0'),10)||0;
let survStartBest=0;
function saveSurv(score,sector){ if(score>survBest()){ store.set(KEY('best')+DI,score); store.set(KEY('bestK')+DI,sector); } }
const bestTxt=i=>{ const b=survBest(i), k=survBestK(i); return b+(k?' (сектор '+k+')':''); };
const THEME_NAME={};   // имената на темите — попълват ги частите (множителите на босовете — defBoss norm)
const MUT_NAME={dark:'Тъмнина',lowg:'Слаба гравитация',swarm:'Нашествие',scarce:'Оскъдни запаси',alarm:'Тревога'};
function mkRng(seed){ let a=seed>>>0; return ()=>{ a=(a+0x6D2B79F5)>>>0; let t=a; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; }; }
function svPlan(k){ return svPlanBy(GAME.svSpec,k); }
/* ---------- reachability validator ---------- */
// Jump reach measured in the engine (tiles) by headroom f (free rows above the higher ledge) and rise dy (index +5..-4).
const SV_MT={g900:{2:[0,0,3,2,1,1,2,2,2,3],3:[0,0,4,3,3,2,3,3,3,4],4:[0,0,4,5,4,3,4,4,4,5],5:[0,0,4,5,5,4,5,5,5,5],9:[0,0,4,5,5,6,6,6,6,7]},
             g600:{2:[4,3,2,2,2,1,2,2,2,3],3:[6,5,4,3,3,3,3,4,4,4],4:[6,6,5,5,4,3,4,4,5,5],5:[6,6,7,6,5,4,5,5,6,6],9:[6,6,7,7,8,8,8,8,8,8]}};
function svMD(dy,f,lowg){ if(f<2||dy>5) return 0; const row=SV_MT[lowg?'g600':'g900'][f>=9?9:f>=5?5:f]; const v=row[5-Math.max(-4,dy)]; return v>0?Math.max(1,v>=5?v-2:v-1):0; }
function svValidate(g,cols,sky,lowg,lifts,startX,exitX){
  const N=cols*ROWS, solidT=c=>c==='#'||c==='='||c==='B'||c==='Z'||c==='>'||c==='<'||c==='^';
  const tile=(x,y)=>x<0||x>=cols?'#':y<0?(sky?'.':'#'):y>=ROWS?'.':g[y][x];
  const freeT=(x,y)=>{ const c=tile(x,y); return !solidT(c)&&c!=='~'; };
  const bodyT=(x,y)=>freeT(x,y)&&tile(x,y)!=='-';
  const kind=new Int8Array(N), virt=new Uint8Array(N), acid=new Uint8Array(N);
  for(let y=1;y<ROWS;y++) for(let x=1;x<cols-1;x++){ const c=g[y][x]; const surf=solidT(c)||c==='-'||(c==='H'&&tile(x,y-1)!=='H');
    if(surf&&tile(x,y-1)==='~'&&!solidT(tile(x,y-2))){ kind[y*cols+x]=3; acid[y*cols+x]=1; continue; }
    if(!surf||!bodyT(x,y-1)) continue; kind[y*cols+x]=bodyT(x,y-2)?(c==='Z'?3:1):2; }
  const pairs=[];
  for(const l of lifts){ const A=[],B=[]; for(let i=0;i<l.w;i++) for(const [xx,yy,arr] of [[l.x0+i,l.y0,A],[l.x1+i,l.y1,B]]){ const id=yy*cols+xx; if(!kind[id]&&freeT(xx,yy-1)&&freeT(xx,yy-2)){ kind[id]=1; virt[id]=1; } if(kind[id]) arr.push(id); } pairs.push([A,B]); }
  // optimistic model: every cell along a lift's track is a place the player can step or jump off from
  const kindO=Int8Array.from(kind), liftGroups=[];
  for(const l of lifts){ const n=Math.max(Math.abs(l.x1-l.x0),Math.abs(l.y1-l.y0)), G=[];
    for(let t=0;t<=n;t++){ const px=l.x0+Math.round(t*(l.x1-l.x0)/(n||1)), py=l.y0+Math.round(t*(l.y1-l.y0)/(n||1));
      for(let i=0;i<l.w;i++){ const xx=px+i, id=py*cols+xx; if(xx<1||xx>=cols-1||py<1) continue; if(!kindO[id]&&freeT(xx,py-1)&&freeT(xx,py-2)) kindO[id]=1; if(kindO[id]) G.push(id); } }
    liftGroups.push(G); }
  const up=new Int16Array(N); for(let x=0;x<cols;x++){ let run=sky?99:0; for(let y=0;y<ROWS;y++){ up[y*cols+x]=run; const c=g[y][x]; run=(!solidT(c)&&c!=='~'&&c!=='-')?run+1:0; } }
  const MDo=(dy,f)=>{ if(f<2||dy>5) return 0; const row=SV_MT[lowg?'g600':'g900'][f>=9?9:f>=5?5:f], v=row[5-Math.max(-4,dy)]; return v>0?v+1+(dy<-4?Math.ceil((-4-dy)*0.7):0):0; };
  const build=opt=>{ const K=opt?kindO:kind, MD=opt?MDo:(dy,f)=>svMD(dy,f,lowg);
  const nbs=(x,y)=>{ const res=[], k0=K[y*cols+x], onPad=tile(x,y)==='^';
    if(!onPad) for(const d of [-1,1]){ const nx=x+d; if(nx<1||nx>=cols-1) continue; const nid=y*cols+nx;
      if(K[nid]){ res.push(nid); continue; }
      if(!bodyT(nx,y-1)||(k0!==2&&!bodyT(nx,y-2))||solidT(tile(nx,y))) continue;
      for(let ry=y+1;ry<ROWS;ry++){ const rid=ry*cols+nx; if(K[rid]){ res.push(rid); break; } if(solidT(tile(nx,ry))) break; } }
    const c0=tile(x,y);
    if(c0==='-'||c0==='H'||(opt&&!solidT(c0))) for(let ry=y+1;ry<ROWS;ry++){ const rid=ry*cols+x; if(K[rid]&&tile(x,ry)!=='H'){ res.push(rid); break; } if(solidT(tile(x,ry))) break; }
    if(tile(x,y-1)==='H'){ let a=y-1; while(a>0&&tile(x,a-1)==='H') a--; const tid=a*cols+x; if(K[tid]) res.push(tid); }
    if(acid[y*cols+x]&&!opt) for(const d of [-1,1]) for(let dy=1;dy<=2;dy++){ const tx=x+d, ty=y-dy, tid=ty*cols+tx; if(tx<1||tx>=cols-1||ty<1) continue; if((K[tid]===1||K[tid]===3)&&!acid[tid]){ let ok=true; for(let ry=Math.max(0,ty-2);ry<y;ry++) if(solidT(tile(x,ry))){ ok=false; break; } if(ok) res.push(tid); } }
    if((k0===1||k0===3)&&!onPad&&(opt||!acid[y*cols+x])){
      for(let dx=-9;dx<=9;dx++){ if(!dx) continue; const tx=x+dx; if(tx<1||tx>=cols-1) continue;
        for(let ty=Math.max(1,y-6);ty<=Math.min(ROWS-1,y+14);ty++){ const tid=ty*cols+tx, kt=K[tid]; if(kt!==1&&kt!==3) continue; if((dx===1||dx===-1)&&ty===y) continue;
          const dy=y-ty, top=Math.min(y,ty), bot=Math.max(y,ty), x0=Math.min(x,tx), x1=Math.max(x,tx); let f=99, ok=true;
          for(let cx=x0;cx<=x1&&ok;cx++){ const fa=up[top*cols+cx]; if(fa<f) f=fa; if(cx!==x&&cx!==tx) for(let ry=Math.max(0,top-(opt?1:3));ry<bot;ry++){ const cc=tile(cx,ry); if(solidT(cc)||(!opt&&cc==='-'&&ry<top)){ ok=false; break; } } }
          if(ok&&dy>0) for(let ry=Math.max(0,top-2);ry<y;ry++) if(solidT(tile(x,ry))){ ok=false; break; }
          if(ok&&Math.abs(dx)<=MD(dy,f)) res.push(tid); } } }
    if(onPad){ const R0=opt?6:5; for(let dx=-R0;dx<=R0;dx++){ const tx=x+dx; if(tx<1||tx>=cols-1) continue;
      for(let ty=Math.max(1,y-(opt?11:10));ty<=(opt?ROWS-1:y);ty++){ const tid=ty*cols+tx, kt=K[tid]; if(kt!==1&&kt!==3) continue; if(tile(tx,ty)==='^') continue; let ok=true; const top=Math.min(ty,y);
        for(let ry=Math.max(0,top-3);ry<y;ry++) if(solidT(tile(x,ry))){ ok=false; break; }
        for(let cx=Math.min(x,tx);cx<=Math.max(x,tx)&&ok;cx++){ if(cx===x) continue; for(let ry=Math.max(0,top-3);ry<top;ry++) if(solidT(tile(cx,ry))){ ok=false; break; } }
        if(ok) res.push(tid); } } }
    return res; };
  const adj=new Array(N);
  for(let id=0;id<N;id++) if(K[id]) adj[id]=nbs(id%cols,(id/cols)|0);
  if(opt){ for(const G of liftGroups) for(const a of G) for(const b of G) if(a!==b) adj[a].push(b); }
  else for(const [A,B] of pairs) for(const a of A) for(const b of B){ adj[a].push(b); adj[b].push(a); }
  return adj; };
  const adj=build(false), adjO=build(true);
  const gyEq=x=>{ let ty=1; while(ty<16&&solidT(tile(x,ty))) ty++; while(ty<16&&!solidT(tile(x,ty))&&tile(x,ty)!=='-') ty++; return ty; };
  const sid=gyEq(startX)*cols+startX; if(!kind[sid]) return null;
  const R=new Uint8Array(N), par=new Int32Array(N).fill(-1), q=[sid]; R[sid]=1; let ex=-1;
  for(let h=0;h<q.length;h++){ const id=q[h]; if(id%cols>=exitX&&ex<0) ex=id; for(const n of adj[id]) if(!R[n]){ R[n]=1; par[n]=id; q.push(n); } }
  if(ex<0) return null;
  const radj=new Array(N); for(let id=0;id<N;id++) if(adj[id]) for(const n of adj[id]) (radj[n]||(radj[n]=[])).push(id);
  const Q=new Uint8Array(N), q2=[]; for(let id=0;id<N;id++) if(kind[id]&&id%cols>=exitX){ Q[id]=1; q2.push(id); }
  for(let h=0;h<q2.length;h++){ const id=q2[h]; if(radj[id]) for(const n of radj[id]) if(!Q[n]){ Q[n]=1; q2.push(n); } }
  // trap check: anywhere the player could possibly get to (optimistic model) must still lead to the exit (strict model)
  const RO=new Uint8Array(N), q3=[sid]; RO[sid]=1;
  for(let h=0;h<q3.length;h++){ const id=q3[h]; if(adjO[id]) for(const n of adjO[id]) if(!RO[n]){ RO[n]=1; q3.push(n); } }
  const traps=[]; for(let id=0;id<N;id++) if(RO[id]&&kind[id]&&!Q[id]) traps.push(id);
  if(traps.length&&!svValidate.noTrap) return svValidate.dbg?{traps}:null;
  // weighted route (walking is cheaper than jumping) for the bot and loot placement
  const dist=new Float64Array(N).fill(1e9), pr=new Int32Array(N).fill(-1), heap=[[0,sid]]; dist[sid]=0;
  const cost=(a,b)=>{ const ax=a%cols, ay=(a/cols)|0, bx=b%cols, by=(b/cols)|0; return (acid[b]?40:0)+((Math.abs(ax-bx)<=1&&by>=ay)?1:(ax===bx?2:3+Math.abs(ax-bx))); };
  while(heap.length){ let bi=0; for(let h=1;h<heap.length;h++) if(heap[h][0]<heap[bi][0]) bi=h; const [dd,id]=heap[bi]; heap[bi]=heap[heap.length-1]; heap.pop(); if(dd>dist[id]) continue;
    for(const n of adj[id]){ const nd=dd+cost(id,n); if(nd<dist[n]){ dist[n]=nd; pr[n]=id; heap.push([nd,n]); } } }
  let best=-1; for(let id=0;id<N;id++) if(kind[id]&&id%cols>=exitX&&dist[id]<1e9&&(best<0||dist[id]<dist[best])) best=id;
  const path=new Uint8Array(N), pathList=[]; for(let id=best;id>=0;id=pr[id]){ path[id]=1; pathList.push(id); } pathList.reverse();
  return {kind,virt,R,Q,RO,traps,path,pathList,gyEq,cols,adj};
}

/* ---------- генераторът: общият (engine/survival.js · svGen) ---------- */
function genLevel(k){ return svGen(k); }
function startSurv(k,carry){
  const sv=carry&&carry!==true?carry:null; if(sv) carry=false; const prev=carry?player:null;
  SURV=true; survK=k; bossMul=0.75+0.2*Math.floor(k/5); ehpMul=1+0.03*k;
  if(!carry){ survScore=0; survLives=[3,2,1][DI]; survSeed=(Date.now()%90000)+10000; survNewBest=false; survStartBest=survBest(); if(sv){ survSeed=sv.seed; survScore=sv.score|0; } }
  loadLevel(-1,genLevel(k)); if(LVL.arena) bossMul*=bossNorm(LVL.arena.type); if(LVL.arena&&(GAME.bossMulOne||[]).includes(LVL.arena.type)) bossMul=1;
  const p=player;
  if(prev){ for(const w of ORDER) if(prev.weapons[w]) p.weapons[w]=true;
    for(const kk in p.ammo){ p.ammo[kk].mag=Math.max(p.ammo[kk].mag,prev.ammo[kk].mag); p.ammo[kk].res=Math.max(p.ammo[kk].res,prev.ammo[kk].res); }
    p.armor=prev.armor; p.hp=Math.min(100,Math.max(1,prev.hp)+(DI===0?50:25)); if(p.weapons[prev.cur]) p.cur=prev.cur; }
  if(sv) svApply(sv); svSave(k);
  state='play'; mInt=0; storyT=0;
  showMsg('СЕКТОР '+(k+1)+' · '+LVL.themeName+(LVL.muts&&LVL.muts.length?' · '+LVL.muts.map(m=>MUT_NAME[m]).join(', '):'')+(LVL.isBoss?' · БОС':''),3.5);
}
function endSurv(){
  survScore+=stats.kills*10; saveSurv(survScore,survK+1);
  survNewBest=survScore>survStartBest; survBestShown=survBest(); state='survOver'; winT=0; mInt=0; bossMusic=false;
}

