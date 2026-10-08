/* ================= SURVIVAL: LEVEL GENERATOR ================= */
let SURV=false, survK=0, survSeed=0, survScore=0, survLives=0, bossMul=1, ehpMul=1, modeSel=0, survNewBest=false, survBestShown=0;
const survBest=(i=DI)=>parseInt(store.get(KEY('best')+i,'0'),10)||0;
const survBestK=(i=DI)=>parseInt(store.get(KEY('bestK')+i,'0'),10)||0;
let survStartBest=0;
function saveSurv(score,sector){ if(score>survBest()){ store.set(KEY('best')+DI,score); store.set(KEY('bestK')+DI,sector); } }
const bestTxt=i=>{ const b=survBest(i), k=survBestK(i); return b+(k?' (сектор '+k+')':''); };
/* ---------- procedural generator v2: themes, plan ---------- */
const SV_TG={
 lab:{acid:1,elec:1,laser:1,human:1}, hall:{acid:1,elec:1,vent:1,human:1}, office:{human:1,turret:1}, depot:{conv:1,crush:1,human:1}, waste:{acid:1,human:1},
 vih:{laser:1,elec:1,human:1,turret:1}, mil:{human:1,turret:1,vent:1}, tunnel:{track:1,human:1}, mine:{lift:1,human:1,cave:1}, bio:{laser:1,acid:1,human:1},
 cool:{vent:1,elec:1,human:1}, core:{elec:1,vent:1,laser:1,human:1}, out:{sky:1,human:1,lift:1,turret:1}, snow:{sky:1,human:1,lift:1,turret:1}, night:{sky:1,human:1,lift:1,turret:1},
 xen:{sky:1,alien:1,lowg:1,lift:1,pad:1}, hive:{alien:1,lowg:1,acid:1,pad:1,nest:1,cave:1}, factory:{alien:1,lowg:1,conv:1,crush:1,pad:1},
 citadel:{alien:1,lowg:1,crush:1,laser:1,elec:1,pad:1}, cave:{alien:1,lowg:1,dark:1,acid:1,nest:1,pad:1,cave:1}, ice:{alien:1,dark:1,acid:1,nest:1,pad:1,cave:1},
};
const SV_EARLY=['lab','hall','office','depot','waste','vih','mil'], SV_MID=['tunnel','mine','bio','cool','core','out','snow','night'], SV_LATE=['xen','hive','factory','citadel','cave','ice'];
const THEME_NAME={lab:'Лаборатории',hall:'Коридори',office:'Администрация',depot:'Склад',waste:'Канали',tunnel:'Тунели',mine:'Шахти',bio:'Биолаборатория',cool:'Охладителна система',core:'Хранилище',night:'Повърхност',xen:'Острови',hive:'Кошер',factory:'Фабрика',citadel:'Цитадела',cave:'Пещери',vih:'Комплексът',mil:'Военна база',out:'Каньонът',snow:'Заснежен проход',ice:'Ледени пещери'};
const THEME_MUSIC={lab:{tr:0,bpm:108},hall:{tr:2,bpm:112},office:{tr:-3,bpm:96},depot:{tr:0,bpm:118},waste:{tr:-4,bpm:100},tunnel:{tr:1,bpm:120},mine:{tr:-6,bpm:104},bio:{tr:-1,bpm:98},cool:{tr:3,bpm:112},core:{tr:-2,bpm:100},night:{tr:-1,bpm:112},xen:{tr:4,bpm:96,alien:true},hive:{tr:3,bpm:92,alien:true},factory:{tr:-2,bpm:124,alien:true},citadel:{tr:-5,bpm:116,alien:true},cave:{tr:2,bpm:88,alien:true},vih:{tr:-1,bpm:110},mil:{tr:1,bpm:116},out:{tr:2,bpm:116},snow:{tr:2,bpm:118},ice:{tr:3,bpm:92,alien:true}};
const MUT_NAME={dark:'Тъмнина',lowg:'Слаба гравитация',swarm:'Нашествие',scarce:'Оскъдни запаси',alarm:'Тревога'};
const BOSS_NORM={worm:1.27,colossus:1,guardian:0.875,warden:0.5,exo:1.3,tank:1,hunter:1.08,queen:0.82,titan:0.44};
function mkRng(seed){ let a=seed>>>0; return ()=>{ a=(a+0x6D2B79F5)>>>0; let t=a; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; }; }
function svBossPool(tg){ const p=['colossus']; if(tg.acid) p.push('worm');
  if(tg.alien){ p.push('guardian','warden'); if(!tg.sky) p.push('queen'); } else { p.push('exo','titan'); if(tg.cave) p.push('queen'); }
  if(tg.sky) p.push('hunter'); if(tg.human) p.push('tank'); return p; }
let SV_PLAN=[], SV_PLAN_SEED=-1;
function svPlan(k){ if(SEQ) return GAME.svPlan(k);
  if(SV_PLAN_SEED!==survSeed){ SV_PLAN=[]; SV_PLAN_SEED=survSeed; }
  while(SV_PLAN.length<=k){
    const j=SV_PLAN.length, r=mkRng(survSeed*131+j*7717+5), pick=a=>a[Math.floor(r()*a.length)];
    const pool=j<5?SV_EARLY:j<10?SV_EARLY.concat(SV_MID):SV_EARLY.concat(SV_MID,SV_LATE,SV_LATE);
    const recent=SV_PLAN.slice(-4).map(q=>q.theme); let cand=pool.filter(t=>!recent.includes(t)); if(!cand.length) cand=pool;
    const theme=pick(cand), tg=SV_TG[theme], isBoss=j%5===4, muts=[], mp=j<2?0:Math.min(0.7,0.2+j*0.03);
    if(r()<mp){ const opts=['swarm','scarce']; if(!tg.sky&&!tg.dark) opts.push('dark'); if(tg.human) opts.push('alarm');
      muts.push(pick(opts)); if(r()<mp*0.4){ const o2=opts.filter(o=>o!==muts[0]); muts.push(pick(o2)); } }
    let boss=null; if(isBoss){ const bp=svBossPool(tg), rb=SV_PLAN.filter(q=>q.boss).slice(-3).map(q=>q.boss), c2=bp.filter(b=>!rb.includes(b)); boss=pick(c2.length?c2:bp); }
    SV_PLAN.push({theme,muts,boss});
  }
  return SV_PLAN[k];
}

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

/* ---------- the generator ---------- */
function genLevel(k){ if(SEQ) return svGen(k);
  const plan=svPlan(k);
  for(let a=0;a<16;a++){ const L=svTry(k,plan,a,false); if(L){ genLevel.att=a; return L; } }
  genLevel.att=99; return svTry(k,plan,99,true)||svTry(k,{theme:'hall',muts:[],boss:null},98,true);
}
function svTry(k,plan,att,simple){
  const r=mkRng(survSeed*7919+k*104729+att*31337+13), ri=(a,b)=>a+Math.floor(r()*(b-a+1)), pick=a=>a[Math.floor(r()*a.length)], ch=p=>r()<p;
  const theme=plan.theme, tg=SV_TG[theme], sky=!!tg.sky, lowg=!!tg.lowg||plan.muts.includes('lowg'), alien=!!tg.alien, isBoss=!!plan.boss;
  const swarm=plan.muts.includes('swarm'), scarce=plan.muts.includes('scarce');
  const MAXC=460, g=[]; for(let y=0;y<ROWS;y++) g.push(new Array(MAXC).fill('.'));
  const set=(x,y,c)=>{ if(x>=0&&x<MAXC&&y>=0&&y<ROWS) g[y][x]=c; };
  const fill=(x0,y0,x1,y1,c)=>{ for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++) set(x,y,c); };
  const gtop=new Int16Array(MAXC).fill(99);
  const colG=(x,top,c='#')=>{ fill(x,top,x,16,c); gtop[x]=top; };
  const GMIN=sky?6:8, b={x:2,gy:ri(sky?11:12,15)};
  const env=dy=>svMD(dy,sky?99:5,lowg);
  const noCeil=new Set(), fixed=[], triggers=[], lifts=[], lasers=[], vents=[], crushers=[], tracks=[], decos=[], segs=[]; let gate=null, encDone=false, nestDone=false, trainDone=false;
  const mat=()=>alien||tg.cave?'#':pick(['-','-','=','#']);
  const ground=n=>{ for(let i=0;i<n;i++){ colG(b.x,b.gy); b.x++; } };
  const stepTo=ty=>{ let guard=0; while(b.gy!==ty&&guard++<20){ const d=ty-b.gy; b.gy+=d<0?-Math.min(-d,ri(1,2)):Math.min(d,ri(1,3)); ground(ri(2,4)); } };
  const loot=(x,y,good)=>{ const roll=r(); let t; if(good) t=roll<0.35?'battery':roll<0.6&&k>=2?'grenade':roll<0.8&&k>=6?'rockets':'health'; else t=roll<0.4?'health':roll<0.8?'ammo':'battery'; fixed.push([t,x,y-1]); };
  const F={
    terrain(){ const n=ri(8,16), x0=b.x; for(let i=0;i<n;i++){ if(i>1&&ch(0.22)){ b.gy=clamp(b.gy+(ch(0.5)?-ri(1,2):ri(1,2)),GMIN,15); } colG(b.x,b.gy); b.x++; }
      for(let j=ri(0,2);j>0;j--){ const x=x0+ri(1,n-3), w=ri(1,2), h=ri(1,3); if(gtop[x]===gtop[x+w-1]&&gtop[x]-h>GMIN-2) fill(x,gtop[x]-h,x+w-1,gtop[x]-1,'B'); } },
    stairs(){ const up=b.gy>GMIN+2&&ch(0.55); for(let n=ri(2,4);n>0;n--){ b.gy=clamp(b.gy+(up?-ri(1,lowg?3:2):ri(1,3)),GMIN,15); ground(ri(2,5)); }
      if(ch(0.35)){ const x=b.x-ri(3,6), y=Math.min(gtop[x],gtop[x+1],gtop[x+2])-3; if(y>GMIN-3){ fill(x,y,x+2,y,'-'); loot(x+1,y,true); } } },
    gaps(){ const pit=sky?'void':tg.acid&&ch(0.6)?'acid':tg.elec&&ch(0.5)?'elec':'void'; ground(ri(2,3));
      for(let n=ri(1,3);n>0;n--){ const ty=clamp(b.gy-ri(-2,lowg?3:2),GMIN,15), dy=b.gy-ty, w=ri(2,Math.max(2,env(dy)-1)), lo=Math.max(b.gy,ty);
        for(let j=0;j<w;j++){ const x=b.x+j; if(pit==='acid'&&lo<=12){ colG(x,15); fill(x,lo+1,x,14,'~'); if(j===w-1) fill(x,ty,x,14,'H'); } else if(pit==='elec'&&lo<=13){ colG(x,15); set(x,15,'Z'); if(j===w-1) fill(x,ty,x,14,'H'); } }
        b.x+=w; b.gy=ty; ground(ri(2,6)); } },
    chain(big){ let haz=sky||big?'void':pick([tg.acid?'acid':'void',tg.elec?'elec':'void','void']);
      if(haz==='acid'&&b.gy>12) stepTo(ri(10,12)); if(haz==='elec'&&b.gy>13) stepTo(ri(10,13)); ground(2);
      const W=ri(10,18)+Math.min(8,k>>1), x0=b.x, x1=b.x+W-1, maxRow=haz==='acid'?11:haz==='elec'?13:15;
      for(let x=x0;x<=x1;x++){ if(haz==='acid'){ colG(x,15); fill(x,13,x,14,'~'); } else if(haz==='elec'){ colG(x,15); set(x,15,'Z'); } }
      let cx=x0-1, cy=b.gy, bank=cy, guard=0;
      while(guard++<40){ const ty=clamp(cy+ri(-2,2),GMIN,Math.min(maxRow,15)); if(x1+1-cx<=env(cy-ty)){ bank=ty; break; }
        const ny=clamp(cy-ri(-2,lowg?3:2),GMIN,maxRow), dy=cy-ny, px=cx+ri(2,Math.max(2,env(dy))); if(px>x1){ bank=cy; break; }
        const pw=Math.min(big?ri(3,6):ri(1,3)+(ch(0.3)?1:0),x1-px+1), m=big?'#':mat();
        if(big) fill(px,ny,px+pw-1,Math.min(16,ny+ri(1,3)),'#'); else fill(px,ny,px+pw-1,ny,m);
        if(ch(0.25)) loot(px+(pw>>1),ny,ch(0.3)); if(ch(0.3)) fixed.push(['flyer',px,Math.max(2,ny-4)]);
        cx=px+pw-1; cy=ny; }
      if(haz==='elec'||haz==='acid'){ fill(x1,bank,x1,14,'H'); fill(x1,Math.max(2,bank-2),x1,bank-1,'.'); }
      b.x=x1+1; b.gy=bank; ground(ri(3,6)); },
    tower(){ const lim=sky?3:6; if(b.gy-4<lim) return F.terrain(); const h=ri(4,Math.min(8,b.gy-lim)), top=b.gy-h; ground(ri(1,2));
      fill(b.x,top,b.x,b.gy-1,'H'); colG(b.x,b.gy); noCeil.add(b.x); b.x++; const ww=ri(3,9); for(let i=0;i<ww;i++){ colG(b.x,top); noCeil.add(b.x); b.x++; }
      fixed.push([ch(0.5)&&!alien?'soldier':'crab',b.x-2,top-1]); b.gy=top; if(ch(0.65)) b.gy=clamp(top+ri(2,6),GMIN,15); },
    liftH(){ ground(2); const W=ri(8,13), x0=b.x; lifts.push({x0,y0:b.gy,x1:x0+W-3,y1:b.gy,w:3,per:5+r()*2,off:r()}); for(let x=x0;x<x0+W;x++) noCeil.add(x); if(ch(0.4)) fixed.push(['flyer',x0+(W>>1),Math.max(2,b.gy-6)]); b.x+=W; ground(ri(3,5)); },
    liftV(){ const lim=sky?3:6, maxH=b.gy-lim; if(maxH<5) return F.liftH(); const h=ri(5,Math.min(9,maxH)), top=b.gy-h; ground(2); const x0=b.x;
      for(let i=0;i<3;i++){ colG(b.x,b.gy); noCeil.add(b.x); b.x++; } lifts.push({x0,y0:b.gy,x1:x0,y1:top,w:3,per:6,off:r()}); for(let i=ri(4,9);i>0;i--){ colG(b.x,top); noCeil.add(b.x); b.x++; } b.gy=top; },
    pad(){ if(!sky&&b.gy<14) stepTo(15); ground(ri(2,3)); const h=ri(5,Math.min(9,b.gy-(sky?2:5))), top=b.gy-h; set(b.x,b.gy,'^'); colG(b.x,b.gy); set(b.x,b.gy,'^'); noCeil.add(b.x); b.x++;
      for(let i=ri(2,3);i>0;i--){ colG(b.x,b.gy); noCeil.add(b.x); b.x++; } const ww=ri(3,7); for(let i=0;i<ww;i++){ colG(b.x,top); noCeil.add(b.x); b.x++; } loot(b.x-2,top,true); b.gy=clamp(top+ri(2,7),GMIN,15); },
    crawl(){ ground(2); const n=ri(3,8); for(let i=0;i<n;i++){ colG(b.x,b.gy); if(sky) fill(b.x,b.gy-5,b.x,b.gy-2,'#'); else fill(b.x,2,b.x,b.gy-2,'#'); b.x++; } ground(2); },
    lasers(){ ground(2); for(let n=ri(1,2+Math.min(2,k>>2));n>0;n--){ ground(ri(1,2)); lasers.push({tx:b.x,r0:sky?0:2,r1:b.gy-1,off:r()}); noCeil.add(b.x); noCeil.add(b.x-1); noCeil.add(b.x+1); ground(1); ground(ri(2,4)); } },
    crushers(){ stepTo(15); ground(2); for(let n=ri(1,3);n>0;n--){ crushers.push({tx:b.x,off:r()}); for(let i=0;i<2;i++){ noCeil.add(b.x); ground(1); } ground(ri(3,5)); } },
    vents(){ stepTo(15); ground(2); for(let n=ri(2,4);n>0;n--){ vents.push({tx:b.x,off:r()}); noCeil.add(b.x); ground(ri(3,5)); } },
    conveyor(){ ground(1); for(let n=ri(1,3);n>0;n--){ const c=ch(0.5)?'>':'<'; for(let i=ri(4,8);i>0;i--){ colG(b.x,b.gy); set(b.x,b.gy,c); b.x++; } if(ch(0.5)) fill(b.x-2,b.gy-ri(1,2),b.x-2,b.gy-1,'B'); ground(ri(1,3)); } },
    train(){ if(trainDone) return F.terrain(); trainDone=true; stepTo(15); ground(2); const L=ri(26,38), x0=b.x;
      for(let i=0;i<L;i++){ colG(b.x,15); noCeil.add(b.x); b.x++; } fill(x0,13,x0,14,'#'); fill(x0+L-1,13,x0+L-1,14,'#');
      let px=x0+ri(3,5); while(px<x0+L-6){ const w=ri(3,4); fill(px,12,px+w-1,12,'='); if(ch(0.3)) loot(px+1,12,false); px+=w+ri(4,7); }
      tracks.push({x0:x0+1,x1:x0+L-2,dir:ch(0.5)?1:-1,off:2.5+r()*2}); decos.push(()=>rails(x0+1,x0+L-2)); b.gy=15; },
    encounter(){ if(encDone||k<1) return F.terrain(); encDone=true; ground(2); const W=ri(18,24), x0=b.x; ground(W);
      for(let n=ri(1,3);n>0;n--){ const px=x0+ri(2,W-6), py=b.gy-pick([3,3,6]); if(py>GMIN-2){ fill(px,py,px+ri(2,4),py,'-'); if(b.gy-py>3) fill(px-3,b.gy-3,px-1,b.gy-3,'-'); } }
      const dxc=b.x; colG(dxc,b.gy); fill(dxc,sky?0:2,dxc,b.gy-1,'D'); noCeil.add(dxc); b.x++; ground(2);
      const waves=[], nw=2+(k>=8?1:0), per=2+Math.floor(k/6);
      for(let w=0;w<nw;w++){ const wv=[]; for(let i=0;i<per;i++){ const t=foeT(false); wv.push(t==='flyer'?[t,x0+ri(3,W-3),'portal',null,b.gy-ri(4,6)]:[t,x0+ri(3,W-3),(t==='soldier'&&!sky)?'drop':'portal']); } wv.push([foeT(true),x0+ri(3,W-3),'portal','H']); waves.push(wv); }
      const door=[dxc,sky?0:2,b.gy-1];
      triggers.push({x:x0+3,fn:()=>startEncounter({msg:'Засада!',doorOut:door,waves,done:()=>showMsg('Чисто е. Продължавай.',1.8)})}); },
    nests(){ if(nestDone) return F.terrain(); nestDone=true; ground(2); const W=ri(14,20), x0=b.x; ground(W);
      for(let n=ri(2,3),i=0;i<n;i++) fixed.push(['nestG',x0+2+Math.floor((W-4)*(i+0.5)/n),b.gy-1]);
      const dxc=b.x; colG(dxc,b.gy); fill(dxc,sky?0:2,dxc,b.gy-1,'D'); noCeil.add(dxc); b.x++; gate={door:[dxc,sky?0:2,b.gy-1],msg:'Гнездата са унищожени — проходът е свободен.'}; ground(2); },
    perch(){ ground(2); const w=ri(3,5), h=ri(2,3); for(let i=0;i<w;i++) colG(b.x+i,b.gy-h); fixed.push([!alien&&ch(0.6)?'turret':'shocker',b.x+(w>>1),b.gy-h-1]); b.x+=w; ground(ri(3,6)); },
    islands(){ F.chain(true); },
    drop(){ if(b.gy>11) return F.stairs(); ground(2); b.gy=ri(b.gy+3,15); ground(ri(3,6)); },
    zfloor(){ if(b.gy<GMIN+3) stepTo(GMIN+4); ground(2); const n=ri(6,11), x0=b.x; for(let i=0;i<n;i++){ colG(b.x,b.gy); set(b.x,b.gy,'Z'); b.x++; }
      let px=x0+ri(1,2); while(px<x0+n-2){ const w=ri(2,3); fill(px,b.gy-3,px+w-1,b.gy-3,'-'); px+=w+ri(2,3); } ground(2); },
    secret(){ ground(3); const x=b.x; ground(ri(7,10)); const y1=b.gy-3, y2=b.gy-6; if(y2<(sky?2:5)) return; fill(x,y1,x+2,y1,'-'); fill(x+4,y2,x+6,y2,'-'); loot(x+5,y2,true); if(ch(0.5)) loot(x+1,y1,false); },
  };
  const foeT=ground=>{ if(alien){ const pool=['crab','crab','shocker']; if(!ground) pool.push('flyer'); if(k>=6) pool.push('shocker'); if(k>=10) pool.push('guard'); if(k>=16) pool.push('guard'); return pick(pool); }
    const pool=['crab','zombie']; if(k>=1) pool.push('zombie'); if(k>=2) pool.push('shocker'); if(k>=3) pool.push('soldier','soldier'); if(k>=8) pool.push('soldier'); return pick(pool); };
  const W_={terrain:3,stairs:2,gaps:2.5,chain:2.2,tower:tg.cave||tg.human?1.3:0.4,liftH:tg.lift||sky?1.2:0.3,liftV:tg.lift?1:0.2,pad:tg.pad?1.6:0,crawl:sky?0.5:1,lasers:tg.laser?1.4:0,crushers:tg.crush?1.4:0,
    vents:tg.vent?1.2:0,conveyor:tg.conv?1.3:0,train:tg.track?1.6:0,encounter:k>=1?1:0,nests:tg.nest?1.2:0,perch:tg.human||tg.turret?1:0.4,islands:sky||lowg?1.4:0,drop:0.8,zfloor:tg.elec?1.1:0,secret:0.8};
  // ----- build -----
  ground(10); segs.push({id:'start',x:2});
  const runLen=isBoss?ri(80,110)+Math.min(30,k*2):ri(135,165)+Math.min(60,k*3), stop=2+runLen;
  const used={}; let last=null, guard=0;
  while(b.x<stop&&guard++<80){
    let id;
    if(simple) id=pick(['terrain','stairs','terrain']);
    else { const cand=Object.keys(W_).filter(f=>W_[f]>0&&f!==last); let tot=0; const w=cand.map(f=>{ const v=W_[f]/(1+(used[f]||0)*0.8); tot+=v; return v; }); let x=r()*tot; id=cand[cand.length-1]; for(let i=0;i<cand.length;i++){ x-=w[i]; if(x<=0){ id=cand[i]; break; } } }
    segs.push({id,x:b.x}); F[id](); used[id]=(used[id]||0)+1; last=id;
  }
  let arena=null, exit=null, cols;
  if(isBoss){ stepTo(15); ground(3); const d=b.x; segs.push({id:'boss-'+plan.boss,x:d}); arena=svArena(plan.boss,d,{g,fill,colG,ri,r,pick,ch,sky,lowg,fixed,k}); cols=d+34; exit=d+30; triggers.push({x:d-2,fn:()=>setCp(d-2)},{x:d+3,fn:()=>startBoss()}); }
  else { const eg=b.gy; ground(12); cols=b.x+2; exit=cols-5; segs.push({id:'end',x:cols-14}); }
  fill(0,0,1,16,'#'); fill(cols-2,0,cols-1,16,'#');
  // ceiling
  if(!sky){ fill(0,0,cols-1,1,'#'); let cb=1, hold=0;
    const topmost=x=>{ for(let y=2;y<ROWS;y++) if(g[y][x]!=='.') return y; return 99; };
    for(let x=2;x<cols-2;x++){ if(noCeil.has(x)||x<12||(arena&&x>=arena.door-2)){ cb=1; continue; }
      let hi=99; for(let xx=Math.max(2,x-3);xx<=Math.min(cols-3,x+3);xx++) hi=Math.min(hi,topmost(xx)); const allowed=hi-6;
      if(tg.cave){ if(ch(0.3)) cb+=ri(-1,1); let c=cb+(ch(0.15)?ri(1,2):0); c=clamp(c,1,allowed); if(c>=2) fill(x,2,x,c,'#'); cb=clamp(cb,1,Math.max(1,allowed)); }
      else { if(--hold<=0){ cb=ch(0.55)?1:ri(2,5); hold=ri(6,14); } const c=Math.min(cb,allowed); if(c>=2) fill(x,2,x,c,'#'); } } }
  // trim grid
  for(let y=0;y<ROWS;y++) g[y].length=cols;
  const V=svValidate(g,cols,sky,lowg,lifts,4,exit); if(window.__svdbg) window.__svdbg(g,V,cols);
  if(!V) return null;
  const {kind,R,Q,path,gyEq}=V, safe=(x,y)=>{ const id=y*cols+x; return kind[id]===1&&!V.virt[id]&&R[id]&&Q[id]&&!(y>0&&g[y-1][x]==='D')&&![x-1,x+1].some(xx=>g[y-1][xx]==='~'||(y>1&&g[y-2][xx]==='~')); };
  // checkpoints
  const cps=[];
  for(const s of segs){ for(let x=s.x;x<s.x+6&&x<cols-3;x++){ const y=gyEq(x); if(y<16&&safe(x,y)&&g[y][x]!=='Z'){ triggers.push({x:x,fn:()=>setCp(x)}); cps.push(x); break; } } }
  // enemies
  const spawns=fixed.slice(), arenaX=arena?arena.door-1:cols;
  const cells=[]; for(let x=14;x<Math.min(arenaX,exit-2);x++) for(let y=1;y<ROWS;y++) if(safe(x,y)&&g[y][x]!=='Z'&&g[y][x]!=='^'&&!cps.some(c=>Math.abs(c-x)<3)) cells.push([x,y]);
  const nE=Math.min(26,Math.round((arenaX-14)/15*(0.7+0.05*k)*(swarm?1.5:1)));
  let lastX=-9; const shuffled=cells.sort(()=>r()-0.5);
  const placed=[];
  for(const [x,y] of shuffled){ if(placed.length>=nE*1.35) break; if(placed.some(p=>Math.abs(p[0]-x)<4)) continue; placed.push([x,y]); }
  placed.forEach(([x,y],i)=>{ const hard=i>=nE, elev=y<gtop[x]-1; let t=foeT(true);
    if(!alien&&elev&&k>=3&&ch(0.5)) t=ch(0.3)&&(tg.turret||tg.human)?'turret':'soldier';
    if(alien&&ch(0.22)){ let fy=y-ri(3,5); if(fy>1&&g[fy][x]==='.'&&g[fy+1][x]==='.') { spawns.push(['flyer',x,fy].concat(hard?['H']:[])); return; } }
    spawns.push([t,x,y-1].concat(hard?['H']:[])); });
  // loot
  let lx=14; while(lx<Math.min(arenaX,exit)-4){ lx+=ri(12,20)*(scarce?1.6:1);
    let best=null; for(let x=Math.floor(lx);x<lx+6&&x<cols-3;x++) for(let y=1;y<ROWS;y++) if(safe(x,y)&&g[y][x]!=='Z'){ const off=!path[y*cols+x]; if(!best||(off&&!best[2])) best=[x,y,off]; }
    if(best) loot(best[0],best[1],best[2]); }
  for(let x=20;x<Math.min(arenaX,exit);x+=ri(24,32)){ for(let xx=x;xx<x+5;xx++){ const y=gyEq(xx); if(y<16&&safe(xx,y)){ spawns.push(['health',xx,y-1,'E']); break; } } }
  // start goodies
  const WEAP={1:'shotgun',2:'grenade',6:'pulse',10:'rocket'}; const sy=gyEq(8);
  if(WEAP[k]) spawns.push([WEAP[k],8,sy-1]); if(k>=10&&k%5===0) spawns.push(['rockets',9,sy-1]); spawns.push(['health',10,sy-1,'E']);
  for(let i=spawns.length-1;i>=0;i--){ const [t,x,y]=spawns[i]; if(DIMS[t]||t==='barrel'||t.startsWith('nest')||V.R[(y+1)*cols+x]) continue;
    let to=null; for(let d=0;d<=8&&!to;d++) for(const xx of d?[x-d,x+d]:[x]){ if(xx<2||xx>=cols-2) continue; for(let yy=1;yy<ROWS&&!to;yy++) if(safe(xx,yy)&&g[yy][xx]!=='Z'&&g[yy][xx]!=='^') to=[xx,yy]; if(to) break; }
    if(to) spawns[i]=[t,to[0],to[1]-1].concat(spawns[i].slice(3)); else spawns.splice(i,1); }
  // decorations
  const signY=sky?Math.max(2,gyEq(3)-5):Math.max(3,gyEq(3)-4);
  decos.push(()=>drawSign(3,signY,'СЕКТОР '+(k+1)+' · '+THEME_NAME[theme].toUpperCase()));
  if(!isBoss) decos.push(()=>{ const y=gyEq(cols-6); drawSign(cols-10,Math.max(sky?2:3,y-4),'ИЗХОД →','#0d1a10','#4bdc6a'); lightDot((cols-4)*T,(y-2)*T,'#4bdc6a',0); });
  const dsp=[]; for(let x=4;x<cols-4;x+=ri(4,9)){ const y=gyEq(x); if(y<16&&g[y][x]==='#'&&g[y-1][x]==='.') dsp.push([x,y]); }
  decos.push(()=>{
    if(!sky&&!alien&&theme!=='mine'&&theme!=='ice') pipeH(3*T+4,2,cols-2);
    for(const [x,y] of dsp){ const h=hash(x,y);
      if(alien||theme==='mine'||theme==='ice') { if(h>0.35) crystal(x*T+h*8,y*T,theme==='ice'?'#bfe8ff':theme==='mine'?'#7ac8ff':(h>0.7?'#ff6ad5':'#59ffd6')); }
      else if(theme==='snow'||theme==='night') { if(h>0.3) (theme==='snow'?pine(x*T+8,y*T,0.6+h*0.5):bush(x*T,y*T)); }
      else if(theme==='out') { if(h>0.6) bush(x*T,y*T); }
      else if(h>0.72) consoleAt(x*T,y*T,1+(h>0.86?1:0)); }
  });
  const skyOf=t=>{ const ttl={night:'АНТЕНАТА',xen:'ОТВЪД',out:'ПОД ОБСТРЕЛ',snow:r()<0.5?'ПРОХОДЪТ':'ЛИФТЪТ'}[t]; const L=LEVELS.find(l=>l.title===ttl); return L&&L.sky; };
  const mus=Object.assign({},THEME_MUSIC[theme]);
  const muts=plan.muts.slice(); const darkM=muts.includes('dark');
  return {n:100+k,title:'СЕКТОР '+(k+1),surv:true,cols,grav:lowg?600:900,music:mus,start:4,dark:!!tg.dark||darkM,alarm:muts.includes('alarm'),
    theme:()=>theme, sky:sky?skyOf(theme):null, liftStyle:alien?'float':'cable',
    loadout:{w:['wrench','pistol'],ammo:{pistol:[17,51]},armor:0,cur:'pistol'}, story:[], end:[],
    build(F_){ for(let y=0;y<ROWS;y++) for(let xx=0;xx<cols;xx++) if(g[y][xx]!=='.') F_(xx,y,xx,y,g[y][xx]); },
    deco(){ decos.forEach(fn=>fn()); },
    spawns, triggers, lifts, lasers, vents, crushers, tracks, exit, arena, gate, chunkLog:segs, themeName:THEME_NAME[theme], isBoss, muts, attempt:att};
}
function svArena(type,d,o){
  const {fill,colG,ri,r,pick,ch,sky,fixed,k}=o, r0=sky?0:2;
  for(let x=d;x<d+32;x++) colG(x,15);
  fill(d+29,r0,d+29,14,'D');
  const A={type,door:d,r0,r1:14,exitDoor:[d+29,r0,14],msg:'Вратата към следващия сектор е отворена!'};
  // random reachable platforms
  const plats=(xmin,xmax)=>{ let cx=xmin+ri(0,3), y=12, out=[]; while(cx<xmax-3){ const w=ri(3,5); fill(cx,y,cx+w-1,y,'-'); out.push([cx,y,w]); const ny=y===12?pick([9,12]):pick([12,9,(sky?6:9)]); cx+=w+(ny<=y?ri(1,2):ri(2,3))+(ny===12&&y===12?ri(1,3):0); y=ny; } return out; };
  if(type==='worm'){ fill(d+1,13,d+6,14,'#'); fill(d+7,13,d+22,14,'~'); fill(d+23,13,d+28,14,'#');
    const a=ri(8,9), b2=ri(13,14), c=ri(18,19); fill(d+a,10,d+a+2,10,'-'); fill(d+b2,9,d+b2+3,9,'-'); fill(d+c,10,d+c+2,10,'-');
    fixed.push(['barrel',d+3,12],['barrel',d+26,12],['health',d+2,12],['health',d+27,12],['ammo',d+b2+1,8],['grenade',d+a+1,9]); A.pool=[d+7,d+22]; }
  else if(type==='guardian'){ const P=plats(d+2,d+28); const top3=P.slice().sort((a,b)=>a[1]-b[1]).slice(0,3); while(top3.length<3) top3.push(P[top3.length%P.length]);
    A.pylons=top3.map(([x,y,w])=>[x+w/2,y]); A.bx=d+16; fixed.push(['health',d+3,14],['health',d+26,14],['battery',d+14,14],['barrel',d+11,14],['barrel',d+20,14]); }
  else { const P=plats(d+2,type==='queen'?d+21:d+28); P.forEach(([x,y,w],i)=>fixed.push([i%2?'ammo':'health',x+1,y-1]));
    if(type==='colossus'){ A.bx=d+21; A.crab=d+25; for(const b of [5,15,24]) fixed.push(['barrel',d+b,14]); }
    else if(type==='warden'){ A.bx=d+16; A.minX=d+2; A.maxX=d+27; }
    else if(type==='exo'){ A.bx=d+23; A.maxX=d+27; fixed.push(['barrel',d+9,14],['barrel',d+19,14],['grenadeR',d+2,14]); }
    else if(type==='tank'){ A.bx=d+23; A.minX=d+2; A.maxX=d+28; fixed.push(['rocketsR',d+2,14],['rocketsR',d+27,14],['grenadeR',d+14,14]); }
    else if(type==='hunter'){ A.minX=d+2; A.maxX=d+28; }
    else if(type==='queen'){ A.bx=d+25; }
    else if(type==='titan'){ A.bx=d+23; fixed.push(['rocketsR',d+2,14],['rocketsR',d+27,14]); } }
  const top=x=>{ let y=14; while(y>0&&o.g[y][x]!=='.') y--; return y; };
  fixed.push(['health',d+2,top(d+2),'E'],['battery',d+4,top(d+4)]); if(k>=10&&!['tank','titan'].includes(type)) fixed.push(['rocketsR',d+2,top(d+2)],['rocketsR',d+27,top(d+27)]);
  A.trigs=[d-2,d+3];
  return A;
}

function startSurv(k,carry){
  const sv=carry&&carry!==true?carry:null; if(sv) carry=false; const prev=carry?player:null;
  SURV=true; survK=k; bossMul=0.75+0.2*Math.floor(k/5); ehpMul=1+0.03*k;
  if(!carry){ survScore=0; survLives=[3,2,1][DI]; survSeed=(Date.now()%90000)+10000; survNewBest=false; survStartBest=survBest(); if(sv){ survSeed=sv.seed; survScore=sv.score|0; } }
  loadLevel(-1,genLevel(k)); if(LVL.arena) bossMul*=BOSS_NORM[LVL.arena.type]||1; if(SEQ&&LVL.arena&&(GAME.bossMulOne||[]).includes(LVL.arena.type)) bossMul=1;
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

