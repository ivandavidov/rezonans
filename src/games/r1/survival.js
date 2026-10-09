/* ================= РЕЗОНАНС 1 · ОЦЕЛЯВАНЕ: ТЕМИ, ПЛАН, ГЕНЕРАТОР, АРЕНИ ================= */
/* собственият генератор на r1 (svTry) — двигателят го вика през GAME.genSector; планът — svPlanBy(SV1_SPEC) */
/* темите на r1 (етикетите водят плана и генератора) */
const SV1={
 lab:{name:'Лаборатории',th:'lab',mus:{tr:0,bpm:108},acid:1,elec:1,laser:1,human:1},
 hall:{name:'Коридори',th:'hall',mus:{tr:2,bpm:112},acid:1,elec:1,vent:1,human:1},
 office:{name:'Администрация',th:'office',mus:{tr:-3,bpm:96},human:1,turret:1},
 depot:{name:'Склад',th:'depot',mus:{tr:0,bpm:118},conv:1,crush:1,human:1},
 waste:{name:'Канали',th:'waste',mus:{tr:-4,bpm:100},acid:1,human:1},
 vih:{name:'Комплексът',th:'vih',mus:{tr:-1,bpm:110},laser:1,elec:1,human:1,turret:1},
 mil:{name:'Военна база',th:'mil',mus:{tr:1,bpm:116},human:1,turret:1,vent:1},
 tunnel:{name:'Тунели',th:'tunnel',mus:{tr:1,bpm:120},track:1,human:1},
 mine:{name:'Шахти',th:'mine',mus:{tr:-6,bpm:104},lift:1,human:1,cave:1},
 bio:{name:'Биолаборатория',th:'bio',mus:{tr:-1,bpm:98},laser:1,acid:1,human:1},
 cool:{name:'Охладителна система',th:'cool',mus:{tr:3,bpm:112},vent:1,elec:1,human:1},
 core:{name:'Хранилище',th:'core',mus:{tr:-2,bpm:100},elec:1,vent:1,laser:1,human:1},
 out:{name:'Каньонът',th:'out',mus:{tr:2,bpm:116},sky:1,human:1,lift:1,turret:1},
 snow:{name:'Заснежен проход',th:'snow',mus:{tr:2,bpm:118},sky:1,human:1,lift:1,turret:1},
 night:{name:'Повърхност',th:'night',mus:{tr:-1,bpm:112},sky:1,human:1,lift:1,turret:1},
 xen:{name:'Острови',th:'xen',mus:{tr:4,bpm:96,alien:true},sky:1,alien:1,lowg:1,lift:1,pad:1},
 hive:{name:'Кошер',th:'hive',mus:{tr:3,bpm:92,alien:true},alien:1,lowg:1,acid:1,pad:1,nest:1,cave:1},
 factory:{name:'Фабрика',th:'factory',mus:{tr:-2,bpm:124,alien:true},alien:1,lowg:1,conv:1,crush:1,pad:1},
 citadel:{name:'Цитадела',th:'citadel',mus:{tr:-5,bpm:116,alien:true},alien:1,lowg:1,crush:1,laser:1,elec:1,pad:1},
 cave:{name:'Пещери',th:'cave',mus:{tr:2,bpm:88,alien:true},alien:1,lowg:1,dark:1,acid:1,nest:1,pad:1,cave:1},
 ice:{name:'Ледени пещери',th:'ice',mus:{tr:3,bpm:92,alien:true},alien:1,dark:1,acid:1,nest:1,pad:1,cave:1},
};
const SV1_EARLY=['lab','hall','office','depot','waste','vih','mil'], SV1_MID=['tunnel','mine','bio','cool','core','out','snow','night'], SV1_LATE=['xen','hive','factory','citadel','cave','ice'];
addUnique(SV_THEMES,SV1,'SV_THEMES'); for(const k in SV1) addUnique(THEME_NAME,{[k]:SV1[k].name},'THEME_NAME');
defBosses('norm',{worm:1.27,colossus:1,guardian:0.875,warden:0.5,exo:1.3,tank:1,hunter:1.08,queen:0.82,titan:0.44});
function r1BossPool(tg){ const p=['colossus']; if(tg.acid) p.push('worm');
  if(tg.alien){ p.push('guardian','warden'); if(!tg.sky) p.push('queen'); } else { p.push('exo','titan'); if(tg.cave) p.push('queen'); }
  if(tg.sky) p.push('hunter'); if(tg.human) p.push('tank'); return p; }
const SV1_SPEC={salt:[131,7717,5],early:SV1_EARLY,mid:SV1_MID,late:SV1_LATE,recent:4,boss:{pool:r1BossPool,recent:3},
  mut:{base:0.2,max:0.7,second:0.4,opts:tg=>{ const o=['swarm','scarce']; if(!tg.sky&&!tg.dark) o.push('dark'); if(tg.human) o.push('alarm'); return o; }}};

/* ---------- the generator ---------- */
function r1GenSector(k){
  const plan=svPlan(k);
  for(let a=0;a<16;a++){ const L=svTry(k,plan,a,false); if(L){ genLevel.att=a; return L; } }
  genLevel.att=99; return svTry(k,plan,99,true)||svTry(k,{theme:'hall',muts:[],boss:null},98,true);
}
function svTry(k,plan,att,simple){
  const r=mkRng(survSeed*7919+k*104729+att*31337+13), ri=(a,b)=>a+Math.floor(r()*(b-a+1)), pick=a=>a[Math.floor(r()*a.length)], ch=p=>r()<p;
  const theme=plan.theme, tg=SV_THEMES[theme], sky=!!tg.sky, lowg=!!tg.lowg||plan.muts.includes('lowg'), alien=!!tg.alien, isBoss=!!plan.boss;
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
  const mus=Object.assign({},tg.mus);
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

