addUnique(MUT_NAME,{bats:'Рояци прилепи'},'MUT_NAME');   // мутацията е в двигателя (mech3) — ползват я Р5 и Р6
/* ================= ДВИГАТЕЛ · ОЦЕЛЯВАНЕ (процедурни сектори) =================
   Темите се регистрират от игрите в SV_THEMES (ключовете трябва да са уникални за поредицата),
   небетата — в SKIES (engine/lib/themes.js). Планът на секторите (кои теми и босове) — svPlanBy(GAME.svSpec,k),
   а сектор с бос копира арената на епизод GLV[GAME.svBoss[boss][0]]. */
const SV_THEMES={};
const SV_LOAD={w:['wrench','pistol'],ammo:{pistol:[17,51]},armor:0,cur:'pistol'};
const svSky=key=>key&&SKIES[key]||null;
/* ---------- план на секторите: една функция, данните са на частта (GAME.svSpec) ----------
   salt — множители на семето; early/mid/late — темите по етапи; recent — без повторение в последните N теми;
   boss: {map:{бос:[епизод,тема]}, early, recent} — първо бос, после неговата тема (продълженията)
         или {pool:tg=>[босове], recent} — първо тема, после подходящ за нея бос (r1);
   mut: {base, max, opts(tg,j), special(тема,r), second} — мутация с вероятност base+0.03·j (до max); special — правило на темата. */
function svPlanBy(P,k){
  if(P.seedNow!==survSeed){ P.list=[]; P.seedNow=survSeed; }
  const L=P.list, B=P.boss, M=P.mut;
  while(L.length<=k){
    const j=L.length, r=mkRng(survSeed*P.salt[0]+j*P.salt[1]+P.salt[2]), pick=a=>a[Math.floor(r()*a.length)], isBoss=j%5===4;
    if(isBoss&&B.map){ const pool=j<10?B.early:Object.keys(B.map), rb=L.filter(q=>q.boss).slice(-B.recent).map(q=>q.boss), c=pool.filter(b=>!rb.includes(b)), boss=pick(c.length?c:pool);
      L.push({theme:B.map[boss][1],muts:[],boss}); continue; }
    const pool=j<5?P.early:j<10?P.early.concat(P.mid):P.early.concat(P.mid,P.late,P.late);
    const recent=L.slice(-P.recent).map(q=>q.theme); let cand=pool.filter(t=>!recent.includes(t)); if(!cand.length) cand=pool;
    const theme=pick(cand), tg=SV_THEMES[theme], muts=[], mp=j<2?0:Math.min(M.max,M.base+j*0.03), sp=M.special&&M.special(theme,r);
    if(sp) muts.push(sp);
    else if(r()<mp){ const opts=M.opts(tg,j); muts.push(pick(opts)); if(M.second&&r()<mp*M.second){ const o2=opts.filter(o=>o!==muts[0]); muts.push(pick(o2)); } }
    let boss=null; if(isBoss){ const bp=B.pool(tg), rb=L.filter(q=>q.boss).slice(-B.recent).map(q=>q.boss), c2=bp.filter(b=>!rb.includes(b)); boss=pick(c2.length?c2:bp); }
    L.push({theme,muts,boss});
  }
  return L[k];
}
function svGen(k){
  const plan=svPlan(k);
  if(plan.boss) return svBoss(k,plan);
  const zg=plan.muts.includes('zerog');
  for(let a=0;a<20;a++){ const L=zg?svZero(k,plan,a):svTry2(k,plan,a,false); if(L){ genLevel.att=a; return L; } }
  genLevel.att=99; return svTry2(k,{theme:plan.theme,muts:[],boss:null},99,true)||svTry2(k,{theme:GAME.svFallback,muts:[],boss:null},98,true);
}
function svBoss(k,plan){
  const L=GLV[GAME.svBoss[plan.boss][0]], portal=L.arena.px!=null;
  const trig=L.triggers.map(t=>{ const s=String(t.fn); if(s.includes('startBoss')) return t; if(s.includes('setCp')){ const m=s.match(/setCp\((\d+)\)/), cx=m?+m[1]:t.x; return {x:t.x,fn:()=>setCp(cx)}; } return null; }).filter(Boolean);
  return Object.assign({},L,{n:100+k,title:'СЕКТОР '+(k+1),surv:true,story:[],end:[],triggers:trig,loadout:SV_LOAD,
    arena:Object.assign({},L.arena,{home:false,msg:portal?'Порталът към следващия сектор е отворен!':'Вратата към следващия сектор е отворена!'}),
    themeName:THEME_NAME[plan.theme],isBoss:true,muts:[],attempt:0});
}

/* ---------- normal sectors ---------- */
function svTry2(k,plan,att,simple){
  const r=mkRng(survSeed*7919+k*104729+att*31337+71), ri=(a,b)=>a+Math.floor(r()*(b-a+1)), pick=a=>a[Math.floor(r()*a.length)], ch=p=>r()<p;
  const theme=plan.theme, tg=SV_THEMES[theme], sky=!!tg.sky, era=!!tg.era;
  const swarm=plan.muts.includes('swarm'), scarce=plan.muts.includes('scarce');
  const MAXC=460, g=[]; for(let y=0;y<ROWS;y++) g.push(new Array(MAXC).fill('.'));
  const set=(x,y,c)=>{ if(x>=0&&x<MAXC&&y>=0&&y<ROWS) g[y][x]=c; };
  const fill=(x0,y0,x1,y1,c)=>{ for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++) set(x,y,c); };
  const gtop=new Int16Array(MAXC).fill(99);
  const colG=(x,top,c='#')=>{ fill(x,top,x,16,c); gtop[x]=top; };
  const GMIN=sky?6:8, b={x:2,gy:ri(sky?11:12,15)};
  const env=dy=>svMD(dy,sky?99:5,false);
  const noCeil=new Set(), noSpawn=new Set(), fixed=[], triggers=[], lifts=[], lasers=[], crushers=[], decos=[], decosB=[], segs=[], levers=[], winds=[], shifters=[], eraR=[], gvOps=[], lights3=[], terms3=[], plates3=[];
  let gate=null, encDone=false, nestDone=false, usedFreq=false; const hint={};
  const once=(key,x,txt,d=3.2)=>{ if(hint[key]) return; hint[key]=1; triggers.push({x,fn:()=>showMsg(txt,d)}); };
  const mat=()=>pick(['-','-','=','#']);
  const ground=n=>{ for(let i=0;i<n;i++){ colG(b.x,b.gy); b.x++; } };
  const stepTo=ty=>{ let guard=0; while(b.gy!==ty&&guard++<20){ const d=ty-b.gy; b.gy+=d<0?-Math.min(-d,ri(1,2)):Math.min(d,ri(1,3)); ground(ri(2,4)); } };
  const loot=(x,y,good)=>{ const roll=r(); let t; if(good) t=roll<0.35?'battery':roll<0.6&&k>=2?'grenade':roll<0.8&&k>=6?'rockets':'health'; else t=roll<0.4?'health':roll<0.8?'ammo':'battery'; fixed.push([t,x,y-1]); };
  const foeT=(onGround,B)=>{ let pool=((B&&tg.foesB)||tg.foes).slice(); if(onGround) pool=pool.filter(t=>t!=='flyer'); if(k>=6&&!tg.noGuard) pool.push('guard'); if(k>=4&&tg.turret&&!onGround) pool.push('soldier'); return pick(pool.length?pool:['crab']); };
  const F={
    terrain(){ const n=ri(8,16), x0=b.x; for(let i=0;i<n;i++){ if(i>1&&ch(0.22)){ b.gy=clamp(b.gy+(ch(0.5)?-ri(1,2):ri(1,2)),GMIN,15); } colG(b.x,b.gy); b.x++; }
      for(let j=ri(0,2);j>0;j--){ const x=x0+ri(1,n-3), w=ri(1,2), h=ri(1,3); if(gtop[x]===gtop[x+w-1]&&gtop[x]-h>GMIN-2) fill(x,gtop[x]-h,x+w-1,gtop[x]-1,'B'); } },
    stairs(){ const up=b.gy>GMIN+2&&ch(0.55); for(let n=ri(2,4);n>0;n--){ b.gy=clamp(b.gy+(up?-ri(1,2):ri(1,3)),GMIN,15); ground(ri(2,5)); }
      if(ch(0.35)){ const x=b.x-ri(3,6), y=Math.min(gtop[x],gtop[x+1],gtop[x+2])-ri(3,4); if(y>GMIN-3){ fill(x,y,x+2,y,'-'); loot(x+1,y,true); } } },
    gaps(){ ground(ri(2,3));
      for(let n=ri(1,3);n>0;n--){ const ty=clamp(b.gy-ri(-2,2),GMIN,15), dy=b.gy-ty, w=ri(2,Math.max(2,env(dy)-1)); b.x+=w; b.gy=ty; ground(ri(2,6)); } },
    chain(big){ ground(2);
      const W=ri(10,18)+Math.min(8,k>>1), x0=b.x, x1=b.x+W-1;
      let cx=x0-1, cy=b.gy, bank=cy, guard=0;
      while(guard++<40){ const ty=clamp(cy+ri(-2,2),GMIN,15); if(x1+1-cx<=env(cy-ty)){ bank=ty; break; }
        const ny=clamp(cy-ri(-2,2),GMIN,15), dy=cy-ny, px=cx+ri(2,Math.max(2,env(dy))); if(px>x1){ bank=cy; break; }
        const pw=Math.min(big?ri(3,6):ri(1,3)+(ch(0.3)?1:0),x1-px+1), m=big?'#':mat();
        if(big) fill(px,ny,px+pw-1,Math.min(16,ny+ri(1,3)),'#'); else fill(px,ny,px+pw-1,ny,m);
        if(ch(0.25)) loot(px+(pw>>1),ny,ch(0.3)); if(ch(0.3)&&tg.foes.includes('flyer')) fixed.push(['flyer',px,Math.max(2,ny-4)]);
        cx=px+pw-1; cy=ny; }
      b.x=x1+1; b.gy=bank; ground(ri(3,6)); },
    tower(){ const lim=sky?3:6; if(b.gy-4<lim) return F.terrain(); const h=ri(4,Math.min(8,b.gy-lim)), top=b.gy-h; ground(ri(1,2));
      fill(b.x,top,b.x,b.gy-1,'H'); colG(b.x,b.gy); noCeil.add(b.x); b.x++; const ww=ri(3,9); for(let i=0;i<ww;i++){ colG(b.x,top); noCeil.add(b.x); b.x++; }
      fixed.push([foeT(true),b.x-2,top-1]); b.gy=top; if(ch(0.65)) b.gy=clamp(top+ri(2,6),GMIN,15); },
    liftH(){ ground(2); const W=ri(8,13), x0=b.x; lifts.push({x0,y0:b.gy,x1:x0+W-3,y1:b.gy,w:3,per:5+r()*2,off:r()}); for(let x=x0;x<x0+W;x++){ noCeil.add(x); noSpawn.add(x); } b.x+=W; ground(ri(3,5)); },
    liftV(){ const lim=sky?3:6, maxH=b.gy-lim; if(maxH<5) return F.liftH(); const h=ri(5,Math.min(9,maxH)), top=b.gy-h; ground(2); const x0=b.x;
      for(let i=0;i<3;i++){ colG(b.x,b.gy); noCeil.add(b.x); b.x++; } lifts.push({x0,y0:b.gy,x1:x0,y1:top,w:3,per:6,off:r()}); for(let i=ri(4,9);i>0;i--){ colG(b.x,top); noCeil.add(b.x); b.x++; } b.gy=top; },
    crawl(){ ground(2); const n=ri(3,8); for(let i=0;i<n;i++){ colG(b.x,b.gy); if(sky) fill(b.x,b.gy-5,b.x,b.gy-2,'#'); else fill(b.x,2,b.x,b.gy-2,'#'); b.x++; } ground(2); },
    lasers(){ ground(2); for(let n=ri(1,2+Math.min(2,k>>2));n>0;n--){ ground(ri(1,2)); lasers.push({tx:b.x,r0:sky?0:2,r1:b.gy-1,off:r()}); noCeil.add(b.x); noCeil.add(b.x-1); noCeil.add(b.x+1); ground(1); ground(ri(2,4)); } },
    crushers(){ stepTo(15); ground(2); for(let n=ri(1,3);n>0;n--){ crushers.push({tx:b.x,off:r()}); for(let i=0;i<2;i++){ noCeil.add(b.x); ground(1); } ground(ri(3,5)); } },
    conveyor(){ ground(1); for(let n=ri(1,3);n>0;n--){ const c=ch(0.5)?'>':'<'; for(let i=ri(4,8);i>0;i--){ colG(b.x,b.gy); set(b.x,b.gy,c); b.x++; } if(ch(0.5)) fill(b.x-2,b.gy-ri(1,2),b.x-2,b.gy-1,'B'); ground(ri(1,3)); } },
    encounter(){ if(encDone||k<1||era) return F.terrain(); encDone=true; ground(2); const W=ri(18,24), x0=b.x; ground(W);
      for(let n=ri(1,3);n>0;n--){ const px=x0+ri(2,W-6), py=b.gy-pick([3,3,6]); if(py>GMIN-2) fill(px,py,px+ri(2,4),py,'-'); }
      const dxc=b.x; colG(dxc,b.gy); fill(dxc,sky?0:2,dxc,b.gy-1,'D'); noCeil.add(dxc); noSpawn.add(dxc); b.x++; ground(2);
      const waves=[], nw=2+(k>=8?1:0), per=2+Math.floor(k/6);
      for(let w=0;w<nw;w++){ const wv=[]; for(let i=0;i<per;i++){ const t=foeT(false); wv.push(t==='flyer'||t==='drone'?[t,x0+ri(3,W-3),'portal',null,b.gy-ri(4,6)]:[t,x0+ri(3,W-3),(t==='soldier'&&!sky)?'drop':'portal']); } wv.push([foeT(true),x0+ri(3,W-3),'portal','H']); waves.push(wv); }
      const door=[dxc,sky?0:2,b.gy-1];
      triggers.push({x:x0+3,fn:()=>startEncounter({msg:'Засада!',doorOut:door,waves,done:()=>showMsg('Чисто е. Продължавай.',1.8)})}); },
    nests(){ if(nestDone||era) return F.terrain(); nestDone=true; ground(2); const W=ri(14,20), x0=b.x; ground(W);
      for(let n=ri(2,3),i=0;i<n;i++) fixed.push(['nestG',x0+2+Math.floor((W-4)*(i+0.5)/n),b.gy-1]);
      const dxc=b.x; colG(dxc,b.gy); fill(dxc,sky?0:2,dxc,b.gy-1,'D'); noCeil.add(dxc); noSpawn.add(dxc); b.x++; gate={door:[dxc,sky?0:2,b.gy-1],msg:'Гнездата са унищожени — проходът е свободен.'}; ground(2); },
    perch(){ ground(2); const w=ri(3,5), h=ri(2,3); for(let i=0;i<w;i++) colG(b.x+i,b.gy-h); fixed.push([tg.turret&&ch(0.6)?'turret':'shocker',b.x+(w>>1),b.gy-h-1]); b.x+=w; ground(ri(3,6)); },
    islands(){ F.chain(true); },
    drop(){ if(b.gy>11) return F.stairs(); ground(2); b.gy=ri(b.gy+3,15); ground(ri(3,6)); },
    zfloor(){ if(b.gy<GMIN+3) stepTo(GMIN+4); ground(2); const n=ri(6,11), x0=b.x; for(let i=0;i<n;i++){ colG(b.x,b.gy); set(b.x,b.gy,'Z'); b.x++; }
      let px=x0+ri(1,2); while(px<x0+n-2){ const w=ri(2,3); fill(px,b.gy-3,px+w-1,b.gy-3,'-'); px+=w+ri(2,3); } ground(2); },
    secret(){ ground(3); const x=b.x; ground(ri(7,10)); const y1=b.gy-3, y2=b.gy-6; if(y2<(sky?2:4)) return; fill(x,y1,x+2,y1,'-'); fill(x+4,y2,x+6,y2,'-'); loot(x+5,y2,true); if(ch(0.5)) loot(x+1,y1,false); },
    /* --- РЕЗОНАНС 2 --- */
    pool(){ const dive=ch(0.65); if(dive){ if(b.gy>10||b.gy<8) stepTo(ri(8,10)); } else if(b.gy>12||b.gy<8) stepTo(ri(9,12)); ground(2);
      const W=ri(dive?8:6,dive?13:11), x0=b.x, x1=x0+W-1, gy=b.gy;
      once('swim',x0-4,'Във водата плуваш с ← → ↑ ↓, а X дава тласък. Следи въздуха!',4);
      for(let x=x0;x<=x1;x++){ colG(x,15); fill(x,gy,x,14,'w'); gtop[x]=99; noSpawn.add(x); }
      gvOps.push([x0,gy,x1,16,'#']);
      if(dive){ const xm=x0+ri(3,W-5); fill(xm,2,xm+1,gy+1,'#'); gvOps.push([xm,0,xm+1,gy-1,'.']); fixed.push([ch(0.5)?'air':'airR',xm+(ch(0.5)?-1:2),13]); once('dive',x0-1,'Стената стига до водата — гмурни се отдолу.',3); }
      if(k>=1&&ch(0.8)) fixed.push([ch(0.65)?'fish':'jelly',x0+ri(1,W-2),13]);
      if(k>=5&&ch(0.4)) fixed.push(['fish',x0+ri(1,W-2),12,'H']);
      if(ch(0.35)) loot(x0+(W>>1),15,ch(0.5));
      b.x=x1+1; ground(ri(2,4)); },
    sluice(){ if(b.gy<8||b.gy>13) stepTo(ri(9,12)); ground(4);
      const gy=b.gy, lvx=b.x-2, dx=b.x; colG(dx,gy); fill(dx,2,dx,gy-1,'D'); noCeil.add(dx); b.x++;
      const L=ri(8,13), x0=b.x, x1=x0+L-1, top=gy-3;
      for(let x=x0;x<=x1;x++){ colG(x,gy); fill(x,2,x,top,'#'); fill(x,top+1,x,gy-1,'w'); noCeil.add(x); noSpawn.add(x); }
      for(let x=lvx-1;x<=dx;x++) noSpawn.add(x);
      gvOps.push([x0,top+1,x1,gy-1,'.']);
      levers.push({x:lvx,y:gy,label:'отвори шлюза',fn:()=>{ setDoor([dx,2,gy-1],'.'); drainRegion(x0,top+1,x1,gy-1); showMsg('Шлюзът се отваря, водата се оттича.',2.2); }});
      once('lever',lvx-3,'Шлюзът е затворен. Застани до лоста и натисни ↑.',3.5);
      b.x=x1+1; ground(ri(3,5)); },
    updraft(){ if(!sky) return F.gaps(); ground(2); const W=ri(7,11), x0=b.x, x1=x0+W-1, gy=b.gy, ty=clamp(gy-ri(-2,2),GMIN,13);
      once('wind',x0-4,'Скочи в сияещия въздушен стълб — течението ще те пренесе.',3.5);
      winds.push([x0+1,2,x1,14,300,-1300]); for(let x=x0;x<=x1;x++) noSpawn.add(x);
      gvOps.push([x0,Math.max(gy,ty),x1,16,'#']);
      b.x=x1+1; b.gy=ty; ground(ri(3,6)); },
    eraWall(){ if(!era) return F.terrain(); ground(2); const r0=sky?0:2; let e=ri(0,1);
      once('era',b.x-4,'Стената я няма в другата епоха — натисни E, за да превключиш.',3.5);
      for(let n=ri(1,2);n>0;n--){ const x=b.x, w=ri(1,2); eraR.push({r:[x,r0,x+w-1,b.gy-1,'#'],era:e}); for(let j=0;j<w;j++){ colG(b.x,b.gy); noCeil.add(b.x); noSpawn.add(b.x); b.x++; } ground(ri(3,5)); e=1-e; } },
    eraBridge(){ if(!era) return F.gaps(); ground(2); const W=ri(6,9), x0=b.x, e=ri(0,1), gy=b.gy;
      once('bridge',x0-4,'Мостът съществува само в едната епоха — смени я с E.',3.5);
      for(let i=0;i<W;i++){ noSpawn.add(b.x); b.x++; }
      eraR.push({r:[x0,gy,x0+W-1,16,'#'],era:e,bridge:true}); gvOps.push([x0,gy,x0+W-1,16,'#']);
      ground(ri(3,5)); },
    shift(){ if(sky) return F.terrain(); ground(3); const xa=b.x, gap=ri(4,6), xb=xa+gap;
      once('shift',xa-4,'Стените се местят — изчакай момента и мини.',3);
      for(let x=xa;x<=xb;x++){ colG(b.x,b.gy); noCeil.add(b.x); b.x++; } ground(3);
      shifters.push({per:ri(5,7)+r(),off:r(),a:[[xa,2,xa,b.gy-1]],b:[[xb,2,xb,b.gy-1]]}); noSpawn.add(xa); noSpawn.add(xb); },
    stealth(){ ground(3); const x0=b.x, Ln=ri(16,22); for(let i=0;i<Ln;i++){ colG(b.x,b.gy); b.x++; }
      for(const cx of [x0+3,x0+9,x0+15]) if(cx<x0+Ln-2) fill(cx,b.gy-2,cx+1,b.gy-1,'B');
      for(const lx of [x0+6,x0+Ln-5]) lights3.push({x:lx,y:sky?3:2,a0:1.0,a1:2.14,spd:0.8+r()*0.6,len:13,cam:ch(0.35)?1:0});
      for(let x=x0;x<b.x;x++) noCeil.add(x);
      once('stealth',x0-3,'Прожектори! Ако лъчът те хване, вдигат тревога. Крий се зад сандъците.',3.5); ground(2); },
    term(){ ground(3); const gy=b.gy, tx=b.x; ground(5); const dxc=b.x, r0=sky?0:2; colG(dxc,gy); fill(dxc,r0,dxc,gy-1,'D'); noCeil.add(dxc); noSpawn.add(dxc); noSpawn.add(tx); noSpawn.add(tx+1); b.x++;
      terms3.push({x:tx,y:gy,time:3+Math.min(3,k/6),label:'ВРАТА',fn:()=>{ setDoor([dxc,r0,gy-1],'.'); SFX.door(); }});
      once('term',tx-3,'Вратата се отваря от терминала. Застани до него и задръж ↑.',3.2); ground(2); },
    plate(){ ground(3); const gy=b.gy, px_=b.x; ground(2); ground(ri(4,7)); const dxc=b.x, r0=sky?0:2; colG(dxc,gy); fill(dxc,r0,dxc,gy-1,'D'); noCeil.add(dxc); noSpawn.add(dxc); for(let x=px_;x<px_+2;x++) noSpawn.add(x); b.x++;
      plates3.push({x:px_,y:gy,door:[dxc,r0,gy-1]});
      once('plate',px_-3,'Плочата държи вратата отворена само докато някой стои на нея. Запиши ехо с E.',4); ground(2); },
    rhythm(){ ground(2); const gy=b.gy, x0=b.x, W=ri(10,15), bpm=(tg.mus&&tg.mus.bpm)||100, A=[], B=[]; let x=x0+1, tgl=0;
      while(x+2<x0+W){ (tgl?B:A).push([x,gy,x+2,gy]); gvOps.push([x,gy,x+2,gy,'=']); x+=4; tgl^=1; }
      for(let i=x0;i<x0+W;i++) noSpawn.add(i); b.x=x0+W;
      shifters.push(rhythmA(A,bpm,0)); if(B.length) shifters.push(rhythmA(B,bpm,0.5));
      once('rhythm',x0-3,'Мостовете пулсират в ритъма на музиката. Скачай, когато се появят.',3.2); ground(ri(3,5)); },
    freq(){ ground(3); const gy=b.gy, a=ri(0,2), c=(a+1+ri(0,1))%3, r0=sky?Math.max(0,gy-7):2, wx=b.x;
      colG(wx,gy); fill(wx,r0,wx,gy-1,String(a+1)); gvOps.push([wx,r0,wx,gy-1,'.']); noCeil.add(wx); noSpawn.add(wx); b.x++; ground(3);
      const pw=ri(4,6); for(let i=0;i<pw;i++){ set(b.x,gy,String(c+1)); gvOps.push([b.x,gy,b.x,gy,'#']); gtop[b.x]=gy; noSpawn.add(b.x); b.x++; } ground(3);
      if(ch(0.6)){ const w2=b.x; colG(w2,gy); fill(w2,r0,w2,gy-1,String(c+1)); gvOps.push([w2,r0,w2,gy-1,'.']); noCeil.add(w2); noSpawn.add(w2); b.x++; ground(2); }
      usedFreq=true; once('freq',wx-4,'Цветните стени и мостове са твърди само в твоя тон. E сменя тона.',3.5); ground(2); },
    shrine(){ ground(3); const x=b.x; ground(ri(5,8)); const fy=gtop[x]*T;
      decos.push(()=>ghostShrine(x,fy)); triggers.push({x:x+1,fn:()=>{ if(ALLIES.length<3){ addGhost(); showMsg(ALLIES.length===1?'Дух на жител от града се присъедини към теб. Духовете стрелят по враговете.':'Още един дух те последва.',2.6); } }}); },
  };
  const W_={terrain:3,stairs:2,gaps:2.2,chain:2,tower:tg.tower?1.4:0.5,liftH:tg.lift?1:0,liftV:tg.lift?0.9:0,crawl:sky?0.4:0.9,
    lasers:tg.laser?1.3:0,crushers:tg.crush?1.4:0,conveyor:tg.conv?1.4:0,encounter:k>=1&&!era?1:0,nests:tg.nest?1.2:0,perch:0.8,islands:tg.wind?1.2:0,drop:0.7,zfloor:tg.zfloor?1:0,secret:0.7,
    pool:tg.water?2.6:0,sluice:tg.lever?1.3:0,updraft:tg.wind?2.4:0,eraWall:era?2.6:0,eraBridge:era?1.8:0,shift:tg.shift?2:0,shrine:tg.ghost?1.5:0,stealth:tg.stealth?2.2:0,term:tg.term?1.5:0,plate:tg.plate?2.2:0,rhythm:tg.rhythm?2.2:0,freq:tg.freq?2.4:0};
  const PRIMARY=tg.freq?'freq':tg.stealth?'stealth':tg.plate?'plate':tg.rhythm?'rhythm':tg.water?'pool':era?'eraWall':tg.wind?'updraft':tg.shift?'shift':tg.ghost?'shrine':tg.conv?'conveyor':null;
  // ----- build -----
  ground(10); segs.push({id:'start',x:2});
  if(tg.ghost) triggers.push({x:6,fn:()=>{ if(!ALLIES.length){ addGhost(); showMsg('Дух на жител от града се присъедини към теб. Духовете стрелят по враговете.',3.2); } }});
  const runLen=ri(135,165)+Math.min(60,k*3), stop=2+runLen;
  const used={}; let last=null, guard=0;
  if(PRIMARY&&!simple){ ground(2); segs.push({id:PRIMARY,x:b.x}); F[PRIMARY](); used[PRIMARY]=1; last=PRIMARY; }
  while(b.x<stop&&guard++<80){
    let id;
    if(simple) id=pick(['terrain','stairs','terrain']);
    else { const cand=Object.keys(W_).filter(f=>W_[f]>0&&f!==last); let tot=0; const w=cand.map(f=>{ const v=W_[f]/(1+(used[f]||0)*0.8); tot+=v; return v; }); let x=r()*tot; id=cand[cand.length-1]; for(let i=0;i<cand.length;i++){ x-=w[i]; if(x<=0){ id=cand[i]; break; } } }
    segs.push({id,x:b.x}); F[id](); used[id]=(used[id]||0)+1; last=id;
  }
  ground(12); const cols=b.x+2, exit=cols-5; segs.push({id:'end',x:cols-14});
  fill(0,0,1,16,'#'); fill(cols-2,0,cols-1,16,'#');
  // ceiling
  if(!sky){ fill(0,0,cols-1,1,'#'); let cb=1, hold=0;
    const topmost=x=>{ for(let y=2;y<ROWS;y++) if(g[y][x]!=='.') return y; return 99; };
    for(let x=2;x<cols-2;x++){ if(noCeil.has(x)||x<12){ cb=1; continue; }
      let hi=99; for(let xx=Math.max(2,x-3);xx<=Math.min(cols-3,x+3);xx++) hi=Math.min(hi,topmost(xx)); const allowed=hi-6;
      if(--hold<=0){ cb=ch(0.55)?1:ri(2,5); hold=ri(6,14); } const c=Math.min(cb,allowed); if(c>=2) fill(x,2,x,c,'#'); } }
  // sun shade
  if(tg.sun){ let lastS=2;
    for(let x=4;x<cols-6;x++){ const t=gtop[x]; if(t>=99) continue; let sh=false; for(let y=t-3;y>=0;y--) if(g[y][x]!=='.'){ sh=true; break; }
      if(sh){ lastS=x; continue; }
      if(x-lastS>=10){ for(const dy of [5,4]){ const y=t-dy; if(y>=1&&[0,1,2,3].every(i=>gtop[x+i]===t&&g[y][x+i]==='.'&&g[y+1][x+i]==='.'&&g[y-1][x+i]==='.')){ fill(x,y,x+3,y,'#'); lastS=x+3; x+=3; break; } } } } }
  // trim grid
  for(let y=0;y<ROWS;y++) g[y].length=cols;
  // validation grid: water/updrafts bridged, era walls ignored, era bridges solid
  const gv=g.map(row=>row.slice()); for(const [x0,y0,x1,y1,c] of gvOps) for(let y=Math.max(0,y0);y<=Math.min(16,y1);y++) for(let x=x0;x<=x1;x++) gv[y][x]=c;
  const V=svValidate(gv,cols,sky,false,lifts,4,exit); if(window.__svdbg) window.__svdbg(gv,V,cols);
  if(!V) return null;
  const {kind,Q,path,gyEq}=V, RR=V.R, safe=(x,y)=>{ const id=y*cols+x; return kind[id]===1&&!V.virt[id]&&RR[id]&&Q[id]&&!noSpawn.has(x)&&!noSpawn.has(x-1)&&!noSpawn.has(x+1); };
  // checkpoints
  const cps=[];
  for(const s of segs){ for(let x=s.x;x<s.x+6&&x<cols-3;x++){ const y=gyEq(x); if(y<16&&safe(x,y)&&g[y][x]!=='Z'&&g[y][x]===gv[y][x]){ triggers.push({x:x,fn:()=>setCp(x)}); cps.push(x); break; } } }
  // enemies
  const spawns=fixed.slice(), spawnsB=[];
  const cells=[]; for(let x=14;x<exit-2;x++) for(let y=1;y<ROWS;y++) if(safe(x,y)&&g[y][x]!=='Z'&&!cps.some(c=>Math.abs(c-x)<3)) cells.push([x,y]);
  const nE=Math.min(26,Math.round((exit-14)/15*(0.7+0.05*k)*(swarm?1.5:1)));
  const shuffled=cells.sort(()=>r()-0.5), placed=[];
  for(const [x,y] of shuffled){ if(placed.length>=nE*1.35) break; if(placed.some(p=>Math.abs(p[0]-x)<4)) continue; placed.push([x,y]); }
  const put=(arr,B)=>(([x,y],i)=>{ const hard=i>=nE; let t=foeT(true,B);
    const fl=((B&&tg.foesB)||tg.foes).includes('flyer');
    if(fl&&ch(0.22)){ const fy=y-ri(3,5); if(fy>1&&g[fy][x]==='.'&&g[fy+1][x]==='.'){ arr.push(['flyer',x,fy].concat(hard?['H']:[])); return; } }
    if(t==='drone'){ const fy=y-ri(2,4); if(fy>1&&g[fy][x]==='.'&&g[fy+1][x]==='.'){ arr.push(['drone',x,fy].concat(hard?['H']:[])); return; } }
    arr.push([t,x,y-1].concat(hard?['H']:[])); });
  placed.forEach(put(spawns,false));
  if(era) placed.forEach(put(spawnsB,true));
  // loot
  let lx_=14; while(lx_<exit-4){ lx_+=ri(12,20)*(scarce?1.6:1);
    let best=null; for(let x=Math.floor(lx_);x<lx_+6&&x<cols-3;x++) for(let y=1;y<ROWS;y++) if(safe(x,y)&&g[y][x]!=='Z'){ const off=!path[y*cols+x]; if(!best||(off&&!best[2])) best=[x,y,off]; }
    if(best) loot(best[0],best[1],best[2]); }
  for(let x=20;x<exit;x+=ri(24,32)){ for(let xx=x;xx<x+5;xx++){ const y=gyEq(xx); if(y<16&&safe(xx,y)){ spawns.push(['health',xx,y-1,'E']); break; } } }
  for(const f of fixed) if(!spawns.includes(f)) spawns.push(f);
  for(let i=spawns.length-1;i>=0;i--) if(spawns[i]===undefined) spawns.splice(i,1);
  const WEAP={1:'shotgun',2:'grenade',6:'pulse',10:'rocket'}; const sy=gyEq(8);
  if(WEAP[k]) spawns.push([WEAP[k],8,sy-1]); if(k>=10&&k%5===0) spawns.push(['rockets',9,sy-1]); spawns.push(['health',10,sy-1,'E']);
  // decorations
  const signY=sky?Math.max(2,gyEq(3)-5):Math.max(3,gyEq(3)-4), signT='СЕКТОР '+(k+1)+' · '+tg.name.toUpperCase();
  const dsp=[]; for(let x=4;x<cols-4;x+=ri(4,9)){ const y=gyEq(x); if(y<16&&g[y][x]==='#'&&g[y-1][x]==='.'&&!noSpawn.has(x)) dsp.push([x,y]); }
  const exitDeco=()=>{ const y=gyEq(cols-6); drawSign(cols-10,Math.max(sky?2:3,y-4),'ИЗХОД →','#06201e','#4fe3d6'); lightDot((cols-4)*T,(y-2)*T,'#4fe3d6',0); };
  decos.push(()=>{ (tg.sign||drawSign)(3,signY,signT); exitDeco();
    if(!sky&&!tg.noPipes) pipeH(3*T+4,2,cols-2);
    if(tg.deco) for(const [x,y] of dsp) tg.deco(x,y,hash(x,y),y*T); });
  decosB.push(()=>{ drawSign(3,signY,signT); exitDeco();
    if(tg.decoB) for(const [x,y] of dsp) tg.decoB(x,y,hash(x,y),y*T); });
  // era maps
  const gA=g.map(row=>row.slice()), gB=g.map(row=>row.slice());
  for(const q of eraR){ const tgt=q.era?gB:gA, [x0,y0,x1,y1,c]=q.r; for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++) tgt[y][x]=c; }
  const copyTo=(src,F_)=>{ for(let y=0;y<ROWS;y++) for(let xx=0;xx<cols;xx++) if(src[y][xx]!=='.') F_(xx,y,xx,y,src[y][xx]); };
  const L={n:100+k,title:'СЕКТОР '+(k+1),surv:true,cols,grav:900,music:Object.assign({},tg.mus),start:4,dark:plan.muts.includes('dark'),alarm:false,
    theme:()=>tg.th, sky:svSky(tg.sky), liftStyle:tg.lift==='float'?'float':'cable', loadout:SV_LOAD, story:[], end:[],
    build(F_){ copyTo(gA,F_); }, deco(){ decos.forEach(fn=>fn()); },
    spawns, triggers, lifts, lasers, vents:[], crushers, tracks:[], exit, arena:null, gate, chunkLog:segs, themeName:tg.name, isBoss:false, muts:plan.muts.slice(), attempt:att};
  if(levers.length) L.levers=levers;
  if(lights3.length) L.lights=lights3; if(terms3.length) L.terms=terms3; if(plates3.length){ L.plates=plates3; L.echo=1; } if(tg.alarmFoe) L.alarmFoe=tg.alarmFoe; if(tg.snow) L.snow=tg.snow; if(tg.gusts) L.gusts={per:10,dur:3,force:-200};
  if(usedFreq) L.freq=true;
  if(tg.still||plan.muts.includes('still')) L.still=true;
  if(tg.sonar||plan.muts.includes('sonar')){ L.dark=true; L.sonar=true; }
  if(tg.flares||plan.muts.includes('bats')){ L.dark=true; L.flares=true; L.flash=true; L.shafts=[]; for(let x=16;x<exit-6;x+=ri(18,30)) L.shafts.push([x,ri(2,4),8+r()*5,r()*6]);
    if(plan.muts.includes('bats')) for(let x=24;x<exit-8;x+=ri(10,16)){ for(let yy=4;yy<10;yy++) if(g[yy][x]==='.'&&g[yy+1][x]==='.'&&g[yy-1][x]==='.'){ spawns.push(['bat',x,yy]); break; } } }
  if(tg.sleepers){ const fl=dsp.filter(([x,y])=>x>12&&x<exit-20); const used=new Set(); L.sleepers=[];
    for(let i=0;i<Math.min(2,fl.length);i++){ const [x,y]=fl[Math.floor(r()*fl.length)]; if(used.has(x)) continue; used.add(x); L.sleepers.push([x,x+ri(10,14),{row:y-1}]); } }
  if(GAME.flashlight&&L.dark&&!L.sonar) L.flash=true;
  if(tg.tone&&!era&&!L.flares&&!L.sonar&&!L.freq) L.tone=true;   // Р6: тонът зашеметява (E)
  if(winds.length) L.winds=winds;
  if(shifters.length) L.shifters=shifters;
  if(tg.sun) L.sun={per:k<8?10:9,warn:1.8,dur:2.2};
  if(era){ L.buildB=F_=>copyTo(gB,F_); L.themeB=()=>tg.thB; L.skyB=svSky(tg.skyB); L.decoB=()=>decosB.forEach(fn=>fn()); L.eraNames=tg.eraNames; L.spawnsB=spawnsB; }
  return L;
}

/* ---------- zero-g sectors (Източникът · Безтегловност) ---------- */
function svZero(k,plan,att){
  const r=mkRng(survSeed*7919+k*104729+att*31337+29), ri=(a,b)=>a+Math.floor(r()*(b-a+1)), ch=p=>r()<p, pick=a=>a[Math.floor(r()*a.length)];
  const cols=ri(140,170)+Math.min(40,k*2), g=[]; for(let y=0;y<ROWS;y++) g.push(new Array(cols).fill('#'));
  const clr=(x0,y0,x1,y1)=>{ for(let y=Math.max(2,y0);y<=Math.min(14,y1);y++) for(let x=Math.max(2,x0);x<=Math.min(cols-3,x1);x++) g[y][x]='.'; };
  clr(2,8,15,14); const mid=[]; let cy=10, h=3;
  for(let x=14;x<cols-14;x++){ if(x%3===0){ cy=clamp(cy+ri(-1,1),5,10); if(ch(0.3)) h=ri(2,4); } const a=Math.max(2,cy-h), b2=Math.min(14,cy+h); clr(x,a,x,b2); mid[x]=[a,b2]; }
  clr(cols-15,8,cols-3,14); for(let x=cols-15;x<cols-2;x++) mid[x]=[8,14]; for(let x=2;x<16;x++) mid[x]=[8,14];
  // pillars
  for(let x=24;x<cols-22;x+=ri(8,13)){ const top=ch(0.5);
    for(let xx=x;xx<x+2;xx++){ const [a,b2]=mid[xx]; const span=b2-a+1; if(span<6) continue; const len=ri(2,span-4); if(top) for(let y=a;y<a+len;y++) g[y][xx]='#'; else for(let y=b2;y>b2-len;y--) g[y][xx]='#'; } }
  // validate: 1x2 body flood fill
  const free=(x,y)=>x>=0&&x<cols&&y>=0&&y<ROWS-1&&g[y][x]==='.'&&g[y+1][x]==='.';
  const seen=new Uint8Array(cols*ROWS), q=[[4,13]]; seen[13*cols+4]=1; let ok=false;
  for(let i=0;i<q.length;i++){ const [x,y]=q[i]; if(x>=cols-6){ ok=true; break; } for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx, ny=y+dy; if(free(nx,ny)&&!seen[ny*cols+nx]){ seen[ny*cols+nx]=1; q.push([nx,ny]); } } }
  if(!ok) return null;
  // lasers across the corridor
  const lasers=[]; for(let x=34;x<cols-24;x+=ri(16,26)){ if(!ch(0.65)) continue; const [a,b2]=mid[x]; let clear=true; for(let y=a;y<=b2;y++) if(g[y][x]!=='.') clear=false; if(clear&&g[a-1][x]==='#') lasers.push({tx:x,r0:a,r1:b2,off:r()}); }
  const lx=new Set(lasers.map(l=>l.tx));
  // spawns, loot, checkpoints
  const spawns=[], triggers=[{x:5,fn:()=>showMsg('Безтегловност! Стрелките те движат, а X дава тласък.',3.5)}];
  const bot=x=>{ let y=mid[x][1]; while(y>mid[x][0]&&g[y][x]!=='.') y--; return y; };
  const cell=x=>{ const [a,b2]=mid[x]; for(let t=0;t<8;t++){ const y=ri(a,b2-1); if(free(x,y)) return y; } return -1; };
  const nE=Math.min(22,Math.round((cols-30)/14*(0.7+0.05*k)*(plan.muts.includes('swarm')?1.5:1)));
  for(let i=0,x=22;i<nE*1.3&&x<cols-18;i++,x+=ri(5,9)){ if(lx.has(x)) continue; const y=cell(x); if(y<0) continue; const hard=i>=nE;
    const t=ch(0.65)?'drone':pick(['guard','shocker','crab']); spawns.push([t,x,t==='drone'?y:bot(x)].concat(hard?['H']:[])); }
  for(let x=18;x<cols-10;x+=ri(12,18)*(plan.muts.includes('scarce')?1.6:1)){ const xx=Math.floor(x); if(lx.has(xx)) continue; spawns.push([pick(['health','ammo','battery','ammo']),xx,bot(xx)]); }
  const WEAP={1:'shotgun',2:'grenade',6:'pulse',10:'rocket'}; if(WEAP[k]) spawns.push([WEAP[k],8,14]); spawns.push(['health',10,14,'E']);
  for(let x=30;x<cols-16;x+=ri(26,36)){ let cx=x; while(lx.has(cx)||lx.has(cx-1)||lx.has(cx+1)) cx++; triggers.push({x:cx,fn:()=>setCp(cx)}); }
  const zt=SV_THEMES[plan.theme], exit=cols-5, signT='СЕКТОР '+(k+1)+' · '+zt.name.toUpperCase()+' · БЕЗТЕГЛОВНОСТ';
  return {n:100+k,title:'СЕКТОР '+(k+1),surv:true,cols,grav:900,music:Object.assign({},zt.mus),start:4,dark:false,alarm:false,zeroG:true,
    theme:()=>zt.th, sky:null, liftStyle:'float', loadout:SV_LOAD, story:[], end:[],
    build(F_){ for(let y=0;y<ROWS;y++) for(let xx=0;xx<cols;xx++) if(g[y][xx]!=='.') F_(xx,y,xx,y,g[y][xx]); },
    deco(){ drawSign(3,5,signT); drawSign(cols-10,9,'ИЗХОД →','#06201e','#4fe3d6'); lightDot((cols-4)*T,12*T,'#4fe3d6',0); },
    spawns, triggers, lifts:[], lasers, vents:[], crushers:[], tracks:[], exit, arena:null, gate:null, chunkLog:[{id:'zerog',x:2}], themeName:zt.name, isBoss:false, muts:plan.muts.slice(), attempt:att};
}
