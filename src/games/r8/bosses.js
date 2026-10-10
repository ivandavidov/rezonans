/* ================= РЕЗОНАНС 8 · БОСОВЕ И АРЕНИ =================
   Арените ги строи r8SvArena (генерираните епизоди и оцеляването — както r1). 34 колони: под на ред 15, изход в колона 29. */
defBosses('intro',{r8trolley:'Тролеят! Качи се на площадките, докато минава отдолу — и стреляй, когато спре да обърне щангите.',
  r8switch:'Стрелочникът! Будката пуска вагоните по релсите — прескачай ги или се качи горе. Стреляй по будката.',
  r8xray:'Рентгенът! Където мине лъчът, нещата се забравят. Крий се под оловните паравани и стреляй нагоре (↑).',
  r8mirror:'Отражението! Върви по стъпките ти със закъснение. Не стой на едно място — и стреляй.',
  r8drafter:'Чертожника! В СЕГА щитът го пази — превключи на СПОМЕН (E), за да го удариш.'});
defBosses('name',{r8trolley:'ТРОЛЕЯТ',r8switch:'СТРЕЛОЧНИКЪТ',r8xray:'РЕНТГЕНЪТ',r8mirror:'ОТРАЖЕНИЕТО',r8drafter:'ЧЕРТОЖНИКА'});
defBosses('col',{r8trolley:'#8ad8ff',r8switch:'#ff6a5a',r8xray:'#c8f0ff',r8mirror:'#9ad8e8',r8drafter:'#ffd27a'});
defBosses('norm',{r8trolley:1,r8switch:1,r8xray:1,r8mirror:1,r8drafter:1});

function r8SvArena(type,d,o){   // вика я svTry
  const {fill,colG,sky,fixed}=o, r0=sky?0:2;
  for(let x=d;x<d+32;x++) colG(x,15);
  fill(d+29,r0,d+29,14,'D');
  const A={type,door:d,r0,r1:14,exitDoor:[d+29,r0,14],msg:'Пътят е свободен.'};
  if(type==='r8trolley'){   // площадки на ред 10 и стълби до тях — тролеят минава отдолу
    for(const [a,b] of [[1,6],[11,18],[23,28]]) fill(d+a,10,d+b,10,'=');
    for(const lx of [3,14,26]) fill(d+lx,10,d+lx,14,'H');
    fixed.push(['health',d+5,9],['ammo',d+16,9],['health',d+24,9],['battery',d+8,14,'E']); A.msg='Тролеят спря. Пътят към депото е свободен.'; }
  if(type==='r8switch'){   // площадки на ред 11 — над вагоните; будката е вдясно (колони 22–26)
    for(const [a,b] of [[1,7],[10,17]]) fill(d+a,11,d+b,11,'=');
    for(const lx of [4,13]) fill(d+lx,11,d+lx,14,'H');
    fixed.push(['health',d+6,10],['ammo',d+15,10],['grenade',d+2,10],['health',d+9,14,'E']); A.msg='Стрелките замръзнаха. Влаковете спряха.'; }
  if(type==='r8xray'){   // оловните паравани на ред 11 — лъчът ги топи; при прераждане се връщат
    A.covers=[]; for(const [a,b] of [[3,6],[11,14],[19,22]]) for(let x=d+a;x<=d+b;x++){ fill(x,11,x,11,'='); A.covers.push([x,11]); }
    fixed.push(['health',d+5,14],['ammo',d+13,14],['health',d+21,14],['battery',d+9,14,'E']); A.msg='Апаратът угасна. Кабинетът е отворен.'; }
  if(type==='r8mirror'){   // витринната зала: две площадки със стълби — има къде да се бяга
    for(const [a,b] of [[4,9],[17,22]]) fill(d+a,11,d+b,11,'=');
    for(const lx of [6,19]) fill(d+lx,11,d+lx,14,'H');
    fixed.push(['health',d+8,10],['ammo',d+18,10],['health',d+13,14],['battery',d+25,14,'E']); A.msg='Стъклото се пропука. Залата е отворена.'; }
  if(type==='r8drafter'){   // дворът на „Христо Ботев“: финалът няма изход — завършва с избора (лостовете при бюста)
    for(const [a,b] of [[8,12],[16,20]]) fill(d+a,11,d+b,11,'='); for(const lx of [10,18]) fill(d+lx,11,d+lx,14,'H');
    A.exitDoor=[d,r0,14]; A.cp=d+2; fixed.push(['health',d+11,10],['ammo',d+19,10],['health',d+6,14],['battery',d+14,14,'E']);
    A.msg='Резонаторът замлъкна. При бюста на Ботев: запази града такъв — или върни старата карта.'; }
  return A;
}

/* ---------- 1. ТРОЛЕЯТ ---------- */
const R8_BUS={w:112,h:40};
defBoss('r8trolley',{make:()=>{ const a=LVL.arena;
  return {type:'r8trolley',mech:true,x:(a.door+27)*T-R8_BUS.w,y:15*T-R8_BUS.h,w:R8_BUS.w,h:R8_BUS.h,hp:620*D.bhp,max:620*D.bhp,state:'intro',t:1.6,anim:0,
    dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,dir:-1,phase:1,sparkT:2.4,spawnT:4,drops:[],bite:0,pole:0}; }});
defBoss('r8trolley',{hurt:(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return;
  b.hp-=d*(b.state==='stop'?1.5:1); b.hitT=0.08; sparks(b.x+b.w/2+rnd(-30,30),b.y+rnd(4,30),3,'#bfe8ff');
  if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; b.spawnT=0; shake=6; showMsg('Щангите пращят — от жицата падат искри!',2); }
  if(b.hp<=0) bossDie(); }});
defBoss('r8trolley',{upd:dt=>{
  const b=boss, p=player, a=LVL.arena; b.anim+=dt; b.hitT-=dt; b.bite-=dt;
  if(b.dead){ b.vx*=0.9; b.x+=b.vx*dt; bossDeathFx(b,dt); return; }
  if(b.state==='intro'){ b.t-=dt; b.pole=Math.min(1,b.pole+dt); if(b.t<=0){ b.state='drive'; b.dir=-1; } return; }
  const minX=(a.door+1)*T, maxX=(a.door+28)*T-b.w, spd=(b.phase>1?185:135)*D.bspd;
  if(b.state==='drive'){ b.pole=Math.min(1,b.pole+dt*2); b.vx+=(b.dir*spd-b.vx)*Math.min(1,dt*1.6); b.x+=b.vx*dt;
    if((b.dir<0&&b.x<=minX)||(b.dir>0&&b.x>=maxX)){ b.x=clamp(b.x,minX,maxX); b.vx=0; b.state='stop'; b.t=b.phase>1?1.2:1.7; shake=4; sfxAt('door',b); } }
  else if(b.state==='stop'){ b.pole=Math.max(0,b.pole-dt*3); b.t-=dt; if(b.t<=0){ b.state='drive'; b.dir=-b.dir; } }
  if(Math.abs(b.vx)>30&&!p.dead&&ov(b,p)&&b.bite<=0){ hurtPlayer(18,sgn(b.vx)*260); p.vy=-220; b.bite=0.9; }
  // искри от жицата: първо светват (0,8 s), после падат
  b.sparkT-=dt; if(b.sparkT<=0&&!p.dead){ b.sparkT=(b.phase>1?1.5:2.5)*D.rate; b.drops.push({x:clamp(p.x+p.w/2+rnd(-24,24),AX()+T,AX()+28*T),t:0.8}); }
  for(const q of b.drops){ q.t-=dt; if(q.t<=0){ bossOrb(q.x,4*T+6,0,190,{dmg:10,r:4,life:3}); sfxAt('zapS',{x:q.x,y:4*T,w:0}); } }
  b.drops=b.drops.filter(q=>q.t>0);
  if(b.phase>1){ b.spawnT-=dt; if(b.spawnT<=0){ b.spawnT=9; if(enemies.filter(e=>e.summoned&&!e.dead).length<3) for(const sx of [3,25]){ const e=makeEnemy('r8spark',(a.door+sx)*T+8,15*T); e.summoned=true; e.alert=true; enemies.push(e); sparks(e.x+5,e.y,10,'#bfe8ff'); } } }
}});
defBoss('r8trolley',{draw:()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; const ax=AX()-cam, wy=4*T+2, x=Math.round(b.x-cam), y=Math.round(b.y), f=b.dir>0;
  ctx.save(); ctx.strokeStyle='rgba(150,160,190,0.7)'; ctx.lineWidth=1; for(const dy of [0,5]){ ctx.beginPath(); ctx.moveTo(ax,wy+dy); ctx.lineTo(ax+30*T,wy+dy); ctx.stroke(); }
  for(const q of b.drops){ const k=1-q.t/0.8; ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(q.x-cam,wy+3,1,q.x-cam,wy+3,6+k*10); g.addColorStop(0,'rgba(220,245,255,0.9)'); g.addColorStop(1,'rgba(80,160,255,0)'); ctx.fillStyle=g; ctx.fillRect(q.x-cam-16,wy-13,32,32); ctx.globalCompositeOperation='source-over'; }
  if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1);
  // щангите: от покрива до жицата; при спиране се свалят
  const px0=x+b.w*(f?0.35:0.65), ang=0.55+(1-b.pole)*0.9; ctx.strokeStyle='#22262e'; ctx.lineWidth=2;
  for(const o of [0,6]){ const ex=px0+(f?-1:1)*Math.cos(ang)*60, ey=Math.max(wy+o,y-Math.sin(ang)*60); ctx.beginPath(); ctx.moveTo(px0+o,y); ctx.lineTo(ex+o,ey); ctx.stroke();
    if(b.pole>0.95&&(b.phase>1||Math.sin(b.anim*9+o)>0.6)){ ctx.strokeStyle='#bfe8ff'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(ex+o,ey); ctx.lineTo(ex+o+rnd(-6,6),ey+rnd(2,8)); ctx.stroke(); ctx.strokeStyle='#22262e'; ctx.lineWidth=2; } }
  ctx.lineWidth=1;
  const hit=b.hitT>0; ctx.fillStyle=hit?'#ffffff':'#b8322a'; ctx.fillRect(x,y+4,b.w,b.h-12); ctx.fillStyle=hit?'#ffffff':'#e8dcc0'; ctx.fillRect(x,y,b.w,16);
  ctx.fillStyle='#1a2a3a'; for(let i=0;i<6;i++) ctx.fillRect(x+(f?6:12)+i*16,y+3,12,10);
  const fx=f?x+b.w-10:x; ctx.fillStyle=b.state==='stop'?'#ffe9a0':'#2a3a4e'; ctx.fillRect(fx,y+2,10,16);   // предното стъкло
  ctx.fillStyle='#ffb04a'; ctx.fillRect(f?x+b.w-24:x+12,y+1,12,4); ctx.fillStyle='#7a1a14'; ctx.fillRect(x,y+b.h-14,b.w,3);
  ctx.fillStyle='#fff6d0'; ctx.fillRect(f?x+b.w-3:x,y+b.h-16,3,4);   // фарът
  ctx.fillStyle='#14161c'; for(const wx of [18,b.w-22]){ ctx.beginPath(); ctx.arc(x+wx,y+b.h-6,7,0,7); ctx.fill(); }
  ctx.fillStyle='#5a6068'; for(const wx of [18,b.w-22]){ const a=b.x*0.1; ctx.fillRect(x+wx+Math.cos(a)*4-1,y+b.h-6+Math.sin(a)*4-1,2,2); }
  ctx.restore(); }});
defBoss('r8trolley',{glow:b=>[b.dir>0?b.x+b.w:b.x,b.y+b.h-14,90,0.8]});

/* ---------- 2. СТРЕЛОЧНИКЪТ ---------- */
// будката е неподвижна; пуска вагони по релсите (отдясно, във втората фаза — и отляво) и сигнални лампи по дъга
const R8_WAG={w:44,h:22};
defBoss('r8switch',{make:()=>{ const a=LVL.arena;
  return {type:'r8switch',mech:true,x:(a.door+22)*T,y:15*T-72,w:72,h:72,hp:700*D.bhp,max:700*D.bhp,state:'intro',t:1.4,anim:0,
    dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,phase:1,wagT:1.5,fireT:2.5,side:1,wag:[],lever:0}; }});
defBoss('r8switch',{hurt:(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return;
  b.hp-=d*(b.lever>0.5?1.5:1); b.hitT=0.08; sparks(b.x+rnd(8,b.w-8),b.y+rnd(10,b.h-10),3,'#ffb04a');
  if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; shake=6; showMsg('Будката превключва всички стрелки — вагоните идват и от двете страни!',2.2); }
  if(b.hp<=0){ b.wag=[]; bossDie(); } }});
defBoss('r8switch',{upd:dt=>{
  const b=boss, p=player, a=LVL.arena; b.anim+=dt; b.hitT-=dt; b.lever=Math.max(0,b.lever-dt*1.5);
  if(b.dead){ bossDeathFx(b,dt); return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0) b.state='fight'; return; }
  const x0=(a.door+1)*T, x1=b.x, sp=(b.phase>1?185:155)*D.bspd;
  b.wagT-=dt; if(b.wagT<=0){ b.wagT=(b.phase>1?2.1:3.1)*D.rate; b.lever=1; sfxAt('door',b);
    const fromL=b.phase>1&&(b.side=-b.side)<0; b.wag.push(fromL?{x:x0,dir:1,cd:0}:{x:x1-R8_WAG.w,dir:-1,cd:0}); }
  for(const w of b.wag){ w.x+=w.dir*sp*dt; w.cd-=dt; const r={x:w.x,y:15*T-R8_WAG.h,w:R8_WAG.w,h:R8_WAG.h};
    if(!p.dead&&w.cd<=0&&ov(r,p)){ hurtPlayer(15,w.dir*240); p.vy=-220; w.cd=1; } }
  b.wag=b.wag.filter(w=>w.x>x0-R8_WAG.w&&w.x<x1);
  b.fireT-=dt; if(b.fireT<=0&&!p.dead){ b.fireT=(b.phase>1?1.6:2.4)*D.rate; const ox=b.x+14, oy=b.y+10, dx=p.x+p.w/2-ox, t=1;
    for(const o of b.phase>1?[-0.15,0,0.15]:[0]) bossOrb(ox,oy,dx/t*(1+o),(p.y+p.h/2-oy)/t-0.5*G*t,{grav:true,dmg:10,r:4,red:true,life:4}); sfxAt('laser',b); }
}});
defBoss('r8switch',{draw:()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; const a=LVL.arena, ax=AX()-cam, x=Math.round(b.x-cam), y=Math.round(b.y), fy=15*T;
  ctx.save(); ctx.fillStyle='#9aa0a4'; ctx.fillRect(ax,fy-3,(b.x-AX()),1); ctx.fillStyle='#3a2a1c'; for(let i=0;i<b.x-AX();i+=8) ctx.fillRect(ax+i,fy-2,5,2);   // релсите
  for(const w of b.wag){ const wx=Math.round(w.x-cam), wy=fy-R8_WAG.h; ctx.fillStyle='#2e4a36'; ctx.fillRect(wx,wy,R8_WAG.w,R8_WAG.h-4); ctx.fillStyle='#4a6a50'; ctx.fillRect(wx,wy,R8_WAG.w,2);
    ctx.fillStyle='#14161c'; for(const k of [8,R8_WAG.w-8]){ ctx.beginPath(); ctx.arc(wx+k,fy-4,4,0,7); ctx.fill(); } ctx.fillStyle='#ffb04a'; ctx.fillRect(w.dir>0?wx+R8_WAG.w-3:wx,wy+6,3,3); }
  if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1);
  const hit=b.hitT>0; ctx.fillStyle=hit?'#ffffff':'#6a3428'; ctx.fillRect(x,y+18,b.w,b.h-18); ctx.fillStyle=hit?'#ffffff':'#3a1c16'; ctx.fillRect(x-4,y+12,b.w+8,8);   // будката и покривът
  ctx.fillStyle='#ffd890'; ctx.fillRect(x+10,y+28,20,14); ctx.fillRect(x+42,y+28,20,14); ctx.fillStyle='#3a1c16'; ctx.fillRect(x+19,y+28,2,14); ctx.fillRect(x+51,y+28,2,14);
  ctx.fillStyle='#14161c'; ctx.fillRect(x+28,y+50,16,22);
  // семафорът: рамото се вдига при всяка смяна на стрелката
  ctx.fillStyle='#2a2e36'; ctx.fillRect(x+4,y-26,3,40); ctx.save(); ctx.translate(x+6,y-24); ctx.rotate(-b.lever*0.8); ctx.fillStyle='#e8e0d0'; ctx.fillRect(0,-2,22,5); ctx.fillStyle='#b8322a'; ctx.fillRect(8,-2,6,5); ctx.restore();
  ctx.fillStyle=b.phase>1||b.lever>0.5?'#ff4a3a':'#5a1a14'; ctx.beginPath(); ctx.arc(x+14,y+6,5,0,7); ctx.fill();
  ctx.restore(); }});
defBoss('r8switch',{glow:b=>[b.x+14,b.y+6,80,0.8]});

/* ---------- 3. РЕНТГЕНЪТ ---------- */
// апаратът се движи по релса под тавана; лъчът първо се прицелва (тънка линия), после удря надолу до първата плочка —
// под паравана е безопасно, но всеки удар го топи (на третия паравана го няма)
const r8XrHit={};
function r8XrStop(x){ const tx=Math.floor(x/T); for(let ty=3;ty<ROWS;ty++) if(isS(tx,ty)) return ty; return ROWS; }
defBoss('r8xray',{make:()=>{ const a=LVL.arena; for(const k in r8XrHit) delete r8XrHit[k];
  return {type:'r8xray',mech:true,x:(a.door+14)*T,y:2*T+2,w:40,h:24,hp:640*D.bhp,max:640*D.bhp,state:'intro',t:1.5,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,phase:1,beam:0,bx:0,tick:0,cool:1.2}; }});
defBoss('r8xray',{onRespawn:()=>{ const a=LVL.arena; for(const [x,y] of a.covers) if(map[y][x]!=='='){ map[y][x]='='; redrawCols(x,x); } for(const k in r8XrHit) delete r8XrHit[k]; }});
defBoss('r8xray',{hurt:(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return;
  b.hp-=d; b.hitT=0.08; sparks(b.x+b.w/2+rnd(-12,12),b.y+b.h,3,'#c8f0ff');
  if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; shake=6; showMsg('Апаратът се нагрява — лъчът е по-бърз!',2); for(const sx of [4,24]){ const e=makeEnemy('drone',(LVL.arena.door+sx)*T+8,8*T); e.summoned=true; e.alert=true; enemies.push(e); } }
  if(b.hp<=0) bossDie(); }});
defBoss('r8xray',{upd:dt=>{
  const b=boss, p=player, a=LVL.arena; b.anim+=dt; b.hitT-=dt;
  if(b.dead){ bossDeathFx(b,dt); return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0) b.state='move'; return; }
  const minX=(a.door+2)*T, maxX=(a.door+27)*T-b.w, pcx=p.x+p.w/2;
  if(b.state==='move'){ const tx=clamp(pcx-b.w/2,minX,maxX), sp=(b.phase>1?110:80)*D.bspd; b.x+=clamp(tx-b.x,-sp*dt,sp*dt); b.cool-=dt;
    if(b.cool<=0&&Math.abs(tx-b.x)<12){ b.state='aim'; b.t=b.phase>1?0.6:0.9; b.bx=b.x+b.w/2; } }
  else if(b.state==='aim'){ b.t-=dt; if(b.t<=0){ b.state='fire'; b.t=0.55; b.tick=0; shake=3; sfxAt('laser',b); } }
  else if(b.state==='fire'){ b.t-=dt; b.tick-=dt;
    if(b.tick<=0){ b.tick=0.18; const stop=r8XrStop(b.bx), tx=Math.floor(b.bx/T);
      if(stop<ROWS&&map[stop][tx]==='='){ const k=tx+','+stop; r8XrHit[k]=(r8XrHit[k]||0)+1; sparks(b.bx,stop*T,4,'#c8f0ff'); if(r8XrHit[k]>=3){ map[stop][tx]='.'; redrawCols(tx,tx); delete r8XrHit[k]; } }
      if(!p.dead&&Math.abs(pcx-b.bx)<10&&p.y>=stop*T-p.h-2&&p.y<stop*T) hurtPlayer(10,0); }
    if(b.t<=0){ b.state='move'; b.cool=(b.phase>1?0.7:1.3)*D.rate; } }
}});
defBoss('r8xray',{draw:()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; const a=LVL.arena, x=Math.round(b.x-cam), y=Math.round(b.y);
  ctx.save(); ctx.fillStyle='#2a3430'; ctx.fillRect(AX()+T-cam,2*T,28*T,3);   // релсата
  if(b.state==='aim'||b.state==='fire'){ const bx=Math.round(b.bx-cam), sy=r8XrStop(b.bx)*T;
    if(b.state==='aim'){ ctx.fillStyle='rgba(200,240,255,0.35)'; for(let yy=y+b.h;yy<sy;yy+=6) ctx.fillRect(bx,yy,1,3); }
    else { ctx.globalCompositeOperation='lighter'; ctx.fillStyle='rgba(160,230,255,0.35)'; ctx.fillRect(bx-10,y+b.h,20,sy-y-b.h); ctx.fillStyle='rgba(230,250,255,0.8)'; ctx.fillRect(bx-3,y+b.h,6,sy-y-b.h); ctx.globalCompositeOperation='source-over'; } }
  if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1);
  const hit=b.hitT>0; ctx.fillStyle=hit?'#ffffff':'#d8d4c4'; ctx.fillRect(x,y,b.w,14); ctx.fillStyle=hit?'#ffffff':'#8a9690'; ctx.fillRect(x+4,y+14,b.w-8,6);
  ctx.fillStyle='#3a4440'; ctx.fillRect(x+b.w/2-6,y+20,12,4); ctx.fillStyle=b.state==='aim'||b.state==='fire'?'#c8f0ff':'#4a6a7a'; ctx.fillRect(x+b.w/2-3,y+21,6,3);
  ctx.fillStyle='#2a3430'; ctx.fillRect(x+6,y-2,4,4); ctx.fillRect(x+b.w-10,y-2,4,4); ctx.fillStyle='#ffb04a'; ctx.fillRect(x+4,y+4,4,3); ctx.fillStyle=b.phase>1?'#ff4a3a':'#3a1a16'; ctx.fillRect(x+b.w-8,y+4,4,3);
  ctx.restore(); }});
defBoss('r8xray',{glow:b=>[b.x+b.w/2,b.y+b.h,70,0.7]});

/* ---------- 4. ОТРАЖЕНИЕТО ---------- */
// записва пътя на Вела и върви по него със закъснение (1 s; във втората фаза — второ отражение с 2 s); удря там, където е била
defBoss('r8mirror',{make:()=>{ const a=LVL.arena;
  return {type:'r8mirror',x:(a.door+24)*T,y:15*T-28,w:16,h:28,hp:560*D.bhp,max:560*D.bhp,state:'intro',t:1.4,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,
    phase:1,trail:[],face:-1,fireT:2.2,bite:0,twin:null}; }});
defBoss('r8mirror',{hurt:(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return;
  b.hp-=d; b.hitT=0.08; sparks(b.x+b.w/2,b.y+b.h/2,4,'#c8f0ff');
  if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; shake=5; showMsg('Стъклото се пука — отраженията стават две!',2); b.twin={x:b.x,y:b.y}; }
  if(b.hp<=0){ b.twin=null; bossDie(); } }});
defBoss('r8mirror',{upd:dt=>{
  const b=boss, p=player; b.anim+=dt; b.hitT-=dt; b.bite-=dt;
  if(b.dead){ bossDeathFx(b,dt); return; }
  b.trail.push({x:p.x+p.w/2-b.w/2,y:p.y+p.h-b.h,f:p.face}); if(b.trail.length>150) b.trail.shift();
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0) b.state='fight'; return; }
  const lag=Math.round(60/(b.phase>1?1.2:1)*D.rate), q=b.trail[Math.max(0,b.trail.length-1-lag)];
  if(q){ b.x+=(q.x-b.x)*Math.min(1,dt*9); b.y+=(q.y-b.y)*Math.min(1,dt*9); b.face=q.f; }
  if(b.twin){ const q2=b.trail[Math.max(0,b.trail.length-1-lag*2)]; if(q2){ b.twin.x+=(q2.x-b.twin.x)*Math.min(1,dt*9); b.twin.y+=(q2.y-b.twin.y)*Math.min(1,dt*9); } }
  for(const m of b.twin?[b,{x:b.twin.x,y:b.twin.y,w:b.w,h:b.h}]:[b]) if(!p.dead&&b.bite<=0&&ov(m,p)){ hurtPlayer(14,sgn(p.x-m.x||1)*200); p.vy=-180; b.bite=0.9; }
  b.fireT-=dt; if(b.fireT<=0&&!p.dead){ b.fireT=(b.phase>1?1.5:2.2)*D.rate; const ox=b.x+b.w/2, oy=b.y+10, dx=p.x+p.w/2-ox, dy=p.y+p.h/2-oy, d=Math.hypot(dx,dy)||1, sp=150*D.bspd;
    bossOrb(ox,oy,dx/d*sp,dy/d*sp,{dmg:10,r:4,life:3}); sfxAt('laser',b); }
}});
function r8MirDraw(x,y,f,a,hit){ ctx.save(); ctx.globalAlpha=a; ctx.translate(x+8,y+28); if(f<0) ctx.scale(-1,1); const c=hit?'#ffffff':'#9ad8e8';
  ctx.fillStyle=c; ctx.fillRect(-5,-26,10,7); ctx.fillRect(-6,-19,12,11); ctx.fillRect(-5,-8,4,8); ctx.fillRect(1,-8,4,8); ctx.fillRect(4,-17,6,3);
  ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.fillRect(-3,-24,6,2); ctx.fillRect(-6,-19,2,11); ctx.restore(); }
defBoss('r8mirror',{draw:()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; const a=b.dead?1-clamp((b.deathT-1.8)/0.8,0,1):0.85;
  ctx.save(); ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(b.x+8-cam,b.y+14,2,b.x+8-cam,b.y+14,30); g.addColorStop(0,'rgba(150,220,240,0.35)'); g.addColorStop(1,'rgba(150,220,240,0)'); ctx.fillStyle=g; ctx.fillRect(b.x-22-cam,b.y-16,60,60); ctx.restore();
  if(b.twin) r8MirDraw(Math.round(b.twin.x-cam),Math.round(b.twin.y),b.face,a*0.55,false);
  r8MirDraw(Math.round(b.x-cam),Math.round(b.y),b.face,a,b.hitT>0); }});
defBoss('r8mirror',{glow:b=>[b.x+8,b.y+14,60,0.6]});

/* ---------- 5. ЧЕРТОЖНИКА ---------- */
// Асен Дамянов над резонатора. В СЕГА го пази щит — уязвим е само в СПОМЕН (E); на всеки 7 s връща СЕГА.
// Под 30 % щитът го пази и в двата слоя — сваля го дървеното оръдие (лостът в арената). След боя — изборът на края.
const R8_END={
 1:{t:'КРАЙ · ЗАПАЗЕНИЯТ ГРАД',
    end:['Вела спира резонатора. Тринадесетият удар не идва.','Плевен остава такъв, какъвто е тази нощ — разместен. Но на сутринта хората помнят: спирката, която я нямаше, тролея без шофьор, тринадесетте удара.','Дамянов сяда на пейката-книга в двора и гледа как децата влизат в училище.'],
    win:['Градът остана разместен, но вече никой не забравя.','Петър сверява часовника на кулата. Той бие дванадесет и спира.','Всеки сам ще си начертае пътя до училище.']},
 2:{t:'КРАЙ · СТАРАТА КАРТА',
    end:['Вела пуска тона за последен път — обратно.','Улиците се връщат по местата си една по една, като стрелки на часовник.','С последната улица си отива и споменът ѝ.'],
    win:['Плевен е такъв, какъвто беше. Никой не помни нищо.','На сутринта Вела кара към работа и спира пред „Христо Ботев“, без да знае защо.']},
 3:{t:'КРАЙ · ЗАПОМНЕНИЯТ ГРАД',   // само със всичките 20 картички
    end:['Вела пуска тона обратно — но преди тринадесетия удар изважда картичките.','Раздава ги една по една: на Петър, на Ганчева, на децата пред училището, на самия Дамянов. Всяка е място, което някой е обичал.','Улиците се връщат по местата си. И този път хората помнят — защото някой им е дал спомена в ръцете.'],
    win:['Плевен е такъв, какъвто беше — и всички помнят какво се случи.','Дамянов пази своята картичка от 1977 г. в джоба на палтото.','Вела кара към работа. На всяка спирка някой ѝ маха.']}};
function r8Choose(n){ if(MST.chose) return; MST.chose=1; store.set('rz8.ending',n); flash=1; flashCol=n===1?'#ffe2a0':'#d8f4ff'; shake=8;
  if(AC){ for(let i=0;i<4;i++) osc({type:'sine',f:[523,659,784,1046][i],t:1.6,v:0.06,when:i*0.3}); }
  LVL.end=R8_END[n].end; MST.endAt=lvT+1.5; }
const r8Lev=v=>{ LEVERS=LEVERS.filter(q=>!q.r8); if(v) LEVERS.push(...v); };
defBoss('r8drafter',{make:()=>{ const a=LVL.arena;
  r8Lev([{x:a.door+5,y:15,label:'запали оръдието',r8:1,cannon:1,on:false,near:false,fn:v=>{ const b=boss; if(!b||b.dead) return;
    if(b.phase<3){ showMsg('Оръдието е заредено. Още не — щитът му още се пука сам в СПОМЕН.',2.4); v.on=false; return; }
    b.broken=7; b.ball=0.6; shake=10; flash=0.6; flashCol='#ffe2a0'; sfxAt('boom',b); showMsg('Оръдието гръмна! Щитът падна!',2); v.rearm=9; }}]);
  return {type:'r8drafter',x:(a.door+14)*T,y:15*T-34,w:22,h:34,hp:900*D.bhp,max:900*D.bhp,state:'intro',t:1.6,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,
    phase:1,ringT:2.5,rulT:4.5,rul:null,backT:7,broken:0,ball:0,dir:1,chose:false}; }});
const r8Open=b=>b.broken>0||(b.phase<3&&ERAD&&ERA===1);
defBoss('r8drafter',{hurt:(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return;
  if(!r8Open(b)){ sparks(b.x+b.w/2+rnd(-14,14),b.y+rnd(0,b.h),3,'#ffd27a'); if(!b.hintT||lvT-b.hintT>4){ b.hintT=lvT; showMsg(b.phase<3?'Щитът го пази. Превключи на СПОМЕН — E.':'Щитът го пази и в двата слоя. Оръдието!',1.6); } return; }
  b.hp-=d; b.hitT=0.08; sparks(b.x+b.w/2,b.y+b.h/2,4,'#ffd27a');
  if(b.phase===1&&b.hp<b.max*0.6){ b.phase=2; shake=5; showMsg('„Не разбираш ли? Аз го поправям!“',2.2); for(const sx of [4,24]){ const e=makeEnemy('r8walker',(LVL.arena.door+sx)*T+8,15*T); e.summoned=true; enemies.push(e); } }
  if(b.phase===2&&b.hp<b.max*0.3){ b.phase=3; shake=8; showMsg('„Тук няма спомен, който да ме спре!“ — щитът го пази и в двата слоя. Оръдието!',3); }
  if(b.hp<=0){ b.rul=null; bossDie(); } }});
defBoss('r8drafter',{upd:dt=>{
  const b=boss, p=player, a=LVL.arena; b.anim+=dt; b.hitT-=dt; b.broken=Math.max(0,b.broken-dt); b.ball=Math.max(0,b.ball-dt);
  for(const v of LEVERS) if(v.cannon&&v.rearm!=null){ v.rearm-=dt; if(v.rearm<=0){ v.rearm=null; v.on=false; } }
  if(b.dead){ bossDeathFx(b,dt); if(MST.r8all&&lvT>=MST.r8all){ MST.r8all=0; radio('Вела… ти събра всички картички. Има и трети път — раздай ги.'); }
    if(b.deathT>2.6&&!b.chose&&!SURV){ b.chose=true; const all=memCount()>=memTotal();   // третият лост — само със всичките картички
      r8Lev([{x:a.door+20,y:15,label:'запази града',r8:1,fn:()=>r8Choose(1),on:false,near:false},{x:a.door+25,y:15,label:'върни старата карта',r8:1,fn:()=>r8Choose(2),on:false,near:false}]
        .concat(all?[{x:a.door+14,y:15,label:'раздай картичките',r8:1,fn:()=>r8Choose(3),on:false,near:false}]:[]));
      if(all) MST.r8all=lvT+4; }
    return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0) b.state='fight'; return; }
  const minX=(a.door+11)*T, maxX=(a.door+21)*T, sp=(b.phase>1?40:28)*D.bspd; b.x+=b.dir*sp*dt; if(b.x<minX||b.x>maxX){ b.dir=-b.dir; b.x=clamp(b.x,minX,maxX); }
  b.y=15*T-34-Math.abs(Math.sin(b.anim*1.3))*10;
  if(ERAD&&ERA===1&&b.phase<3){ b.backT-=dt; if(b.backT<=0){ b.backT=(b.phase>1?5:7); switchEra(true); flash=0.5; flashCol='#ffe2b0'; showMsg('Дамянов връща СЕГА!',1.4); } } else b.backT=(b.phase>1?5:7);
  b.ringT-=dt; if(b.ringT<=0){ b.ringT=(b.phase>1?2.2:3)*D.rate; const n=b.phase>2?12:8, o=rnd(6.28); for(let i=0;i<n;i++){ const ang=o+i/n*Math.PI*2; bossOrb(b.x+b.w/2,b.y+12,Math.cos(ang)*90*D.bspd,Math.sin(ang)*90*D.bspd,{dmg:10,r:4,life:4}); } sfxAt('laser',b); }
  // линията на чертежа: първо тънка, после изгаря реда, на който стои Вела
  b.rulT-=dt; if(b.rulT<=0&&!b.rul&&!p.dead){ b.rulT=(b.phase>1?3.4:4.6)*D.rate; b.rul={y:p.y+p.h/2,t:0.8,hit:false}; }
  if(b.rul){ b.rul.t-=dt; if(b.rul.t<=0&&!b.rul.hit){ b.rul.hit=true; shake=3; if(!p.dead&&Math.abs(p.y+p.h/2-b.rul.y)<12&&p.x>AX()&&p.x<AX()+29*T) hurtPlayer(12,0); } if(b.rul.t<-0.3) b.rul=null; }
}});
defBoss('r8drafter',{draw:()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; const x=Math.round(b.x-cam), y=Math.round(b.y), ax=AX()-cam;
  ctx.save();
  if(b.rul){ const ry=Math.round(b.rul.y); if(b.rul.t>0){ ctx.fillStyle='rgba(255,210,122,0.5)'; for(let xx=0;xx<29*T;xx+=8) ctx.fillRect(ax+xx,ry,4,1); }
    else { ctx.globalCompositeOperation='lighter'; ctx.fillStyle='rgba(255,180,90,0.55)'; ctx.fillRect(ax,ry-6,29*T,12); ctx.fillStyle='rgba(255,240,200,0.9)'; ctx.fillRect(ax,ry-1,29*T,2); ctx.globalCompositeOperation='source-over'; } }
  if(b.ball>0){ const k=1-b.ball/0.6, cx=(LVL.arena.door+6)*T-cam, sx=cx+(x+b.w/2-cx)*k, sy=15*T-14-Math.sin(k*Math.PI)*60; ctx.fillStyle='#2a2a30'; ctx.beginPath(); ctx.arc(sx,sy,4,0,7); ctx.fill(); }
  if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1);
  const hit=b.hitT>0; ctx.fillStyle=hit?'#ffffff':'#3a3a48'; ctx.fillRect(x+3,y+10,16,18); ctx.fillStyle=hit?'#ffffff':'#e8e0d0'; ctx.fillRect(x+6,y+1,10,9);   // палтото и главата
  ctx.fillStyle='#c8c8c8'; ctx.fillRect(x+5,y,12,3); ctx.fillStyle='#22222a'; ctx.fillRect(x+8,y+5,2,1); ctx.fillRect(x+13,y+5,2,1); ctx.fillRect(x+6,y+28,4,6); ctx.fillRect(x+12,y+28,4,6);
  ctx.fillStyle='#c8c8d8'; ctx.fillRect(x+18,y+10,2,14); ctx.fillRect(x+16,y+9,6,2);   // камертонът
  if(!r8Open(b)){ const k=0.35+0.15*Math.sin(b.anim*5); ctx.strokeStyle=`rgba(255,210,122,${k})`; ctx.lineWidth=2; ctx.beginPath(); ctx.ellipse(x+11,y+17,20,24,0,0,7); ctx.stroke(); ctx.lineWidth=1;
    for(let i=0;i<6;i++){ const ang=b.anim+i*1.05; ctx.fillStyle=`rgba(255,226,160,${k})`; ctx.fillRect(x+11+Math.cos(ang)*20,y+17+Math.sin(ang)*24,2,2); } }
  ctx.restore(); }});
defBoss('r8drafter',{glow:b=>[b.x+11,b.y+16,80,0.8]});
