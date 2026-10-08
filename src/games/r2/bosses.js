/* ================= РЕЗОНАНС 2 · BOSSES ================= */
defBosses('intro',{
  deep:'Дълбинният! Стреляй по пипалата. Когато паднат, главата му изплува — тогава я удряй.',
  breach:'Пробивът! Пази генераторите, докато д-р Илиева претоварва портала. Можеш да спреш лъча с тялото си.',
  stone:'Каменният страж! В миналото е непробиваем. Смени епохата с E — в настоящето ядрото му е открито.',
  swarm:'Роякът! Хиляди малки машини в една форма. Унищожавай ги на групи — гранатите и пушката помагат.',
  storm:'Бурята! Пази се от мълниите и вятъра. Стреляй в окото, когато се отвори.',
  maker:'Създателят. Тук законите се пишат наново — гравитацията ще се обръща. Стреляй в сърцевината.'});
defBosses('name',{deep:'ДЪЛБИННИЯТ',breach:'ПРОБИВЪТ · ПРЕТОВАРВАНЕ',stone:'КАМЕННИЯТ СТРАЖ',swarm:'РОЯКЪТ',storm:'БУРЯТА',maker:'СЪЗДАТЕЛЯТ'});
defBosses('col',{deep:'#4fe3d6',breach:'#ff6ad5',stone:'#e0c08a',swarm:'#ffd36b',storm:'#9fc8ff',maker:'#ffffff'});

/* ---------- 1. ДЪЛБИННИЯТ ---------- */
defBoss('deep',{make:()=>{ const a=LVL.arena, cx=AX()+15*T; if(!FLOOD) FLOOD={y:11*T,y0:11*T,rate:0,top:11*T,on:false,x0:AX()+T,x1:AX()+29*T}; FLOOD.y=FLOOD.y0;
  return {type:'deep',cx,x:cx-24,y:H+100,w:48,h:36,hp:700*D.bhp,max:700*D.bhp,state:'intro',t:2,phase:1,wave:0,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,rise:0,st:0,surgeT:12,surge:0}; }});
function deepWave(b){ const a=LVL.arena, n=b.phase===1?(DI===0?2:3):(DI===0?3:4), hs=a.hatches.slice().sort(()=>Math.random()-0.5).slice(0,n);
  b.wave++; for(const hx of hs){ const e=makeEnemy('tent',hx*T+8,15*T); e.hp=(DI===0?45:70)*D.ehp; e.summoned=true; e.tag='tent'; e.baseY=15*T; e.topY=(a.tentTop||6)*T+Math.round(rnd(0,2))*T; e.y=15*T-4; e.h=4; e.grow=0; e.cd=rnd(1.5,3); e.slam=0; enemies.push(e); }
  sfxAt('roar',{x:b.cx,y:12*T,w:0}); shake=6; }
defBoss('deep',{hurt:(d,blast)=>{ const b=boss; if(!b||b.dead||b.state!=='head') return; b.hp-=d; b.hitT=0.08; blood(b.cx+rnd(-14,14),b.y+rnd(6,24),true,blast?10:3);
  if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; showMsg('Дълбинният побесня — водата се надига!',2.2); sfxAt('roar',b); shake=8; }
  if(b.hp<=0){ bossDie(); FLOOD.y=11*T; } }});
defBoss('deep',{upd:dt=>{
  const b=boss, p=player, a=LVL.arena; b.anim+=dt; b.hitT-=dt;
  if(FLOOD){ const target=b.surge>0?(b.phase>1?6.5:8)*T:11*T; FLOOD.y+=(target-FLOOD.y)*Math.min(1,dt*0.9); }
  if(b.dead){ b.rise=Math.max(0,b.rise-dt*0.3); b.y=11*T-36*b.rise+6; bossDeathFx(b,dt); return; }
  const tents=enemies.filter(e=>e.tag==='tent'&&!e.dead);
  for(const e of tents){ e.grow=Math.min(1,e.grow+dt*1.2); const h=(e.baseY-e.topY)*e.grow; e.y=e.baseY-h; e.h=h; e.x=e.home-e.w/2; e.cd-=dt; e.hitT-=dt;
    if(e.cd<=0&&e.grow>=1&&!p.dead){ e.cd=rnd(2.2,3.4)*D.rate; const ex=e.x+e.w/2, ey=e.y+6, dx=p.x+p.w/2-ex, dy=p.y+p.h/2-ey, d=Math.hypot(dx,dy)||1; bossOrb(ex,ey,dx/d*120*D.bspd,dy/d*120*D.bspd,{dmg:9,r:4,ice:true}); sfxAt('spit',e); }
    if(!p.dead&&ov(e,p)){ e.bite=(e.bite||0)-dt; if(e.bite<=0){ e.bite=0.9; hurtPlayer(10,sgn(p.x-e.x)*160); } } }
  if(b.phase>1){ b.surgeT-=dt; if(b.surgeT<=0){ if(b.surge>0){ b.surge=0; b.surgeT=rnd(9,12); } else { b.surge=1; b.surgeT=7; showMsg('Водата се надига!',1.5); } } }
  switch(b.state){
    case 'intro': b.t-=dt; if(b.t<=0){ b.state='tents'; deepWave(b); } break;
    case 'tents': if(!tents.length){ b.state='rise'; sfxAt('roar',{x:b.cx,y:12*T,w:0}); } break;
    case 'rise': b.rise=Math.min(1,b.rise+dt*1.5); if(b.rise>=1){ b.state='head'; b.t=(DI===0?6.5:5); b.st=0.8; } break;
    case 'head': b.t-=dt; b.st-=dt; if(b.st<=0&&!p.dead){ b.st=(b.phase===1?1.1:0.8)*D.rate; const hx=b.cx, hy=b.y+16; for(let i=-1;i<=1;i++){ const dx=p.x+p.w/2-hx, dy=p.y+p.h/2-hy, an=Math.atan2(dy,dx)+i*0.28; bossOrb(hx,hy,Math.cos(an)*130*D.bspd,Math.sin(an)*130*D.bspd,{dmg:10,ice:true}); } sfxAt('spit',b); }
      if(b.t<=0) b.state='sink'; break;
    case 'sink': b.rise=Math.max(0,b.rise-dt*1.5); if(b.rise<=0){ b.state='tents'; deepWave(b); } break;
  }
  b.x=b.cx-24; b.y=b.rise>0.02?11*T-36*b.rise+4:H+100; b.h=36;
  if(b.rise>0.4&&!p.dead&&ov(b,p)){ b.bite=(b.bite||0)-dt; if(b.bite<=0){ b.bite=1; hurtPlayer(14,sgn(p.x-b.cx)*220); } }
}});
defBoss('deep',{draw:()=>{ const b=boss; if(b.rise<=0.02||(b.dead&&b.deathT>2.6)) return; const x=Math.round(b.cx-cam), y=Math.round(b.y); ctx.save(); if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1);
  tint=b.hitT>0?'#fff':null; ctx.fillStyle=tint||'#2e5a5a'; ctx.beginPath(); ctx.ellipse(x,y+22,30,24,0,Math.PI,0); ctx.fill(); ctx.fillStyle=tint||'#3a6e6a'; ctx.beginPath(); ctx.ellipse(x,y+18,24,16,0,Math.PI,0); ctx.fill();
  for(let i=-2;i<=2;i++){ ctx.fillStyle='#c8f0e0'; ctx.fillRect(x+i*9-1,y+8+Math.abs(i)*2,2,2); }
  const open=b.state==='head'&&b.st<0.3; ctx.fillStyle='#ffef5a'; ctx.beginPath(); ctx.ellipse(x,y+12,8,open?7:5,0,0,7); ctx.fill(); ctx.fillStyle='#120a08'; ctx.fillRect(x-1,y+8,2,8);
  ctx.fillStyle='#1a2a2a'; ctx.fillRect(x-14,y+22,28,3); for(let i=-3;i<=3;i++) ctx.fillRect(x+i*4,y+20,1,4);
  tint=null; ctx.restore(); }});

/* ---------- 2. ПРОБИВЪТ ---------- */
defBoss('breach',{onRespawn:()=>{ for(const g of GENS) g.hp=g.max; }});   // генераторите се възстановяват при прераждане
defBoss('breach',{make:()=>{ const a=LVL.arena, tot=[45,60,72][DI]; for(const g of GENS){ g.hp=g.max; }
  return {type:'breach',x:AX()+15*T-34,y:2.2*T,w:68,h:60,hp:tot,max:tot,state:'intro',t:2,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,spawnT:2,beamT:6,beam:null,flyT:10}; }});
defBoss('breach',{hurt:(d,blast)=>{ const b=boss; if(!b||b.dead) return; b.hitT=0.05; if(Math.random()<0.3) sparks(b.x+b.w/2+rnd(-20,20),b.y+b.h/2+rnd(-20,20),3,'#ff9af0'); }});
function segHitsRect(x0,y0,x1,y1,r){ for(let i=0;i<=24;i++){ const t=i/24, x=x0+(x1-x0)*t, y=y0+(y1-y0)*t; if(x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h) return true; } return false; }
defBoss('breach',{upd:dt=>{
  const b=boss, p=player, a=LVL.arena; b.anim+=dt; b.hitT-=dt;
  if(b.dead){ bossDeathFx(b,dt); return; }
  const cx=b.x+b.w/2, cy=b.y+b.h/2;
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0) b.state='fight'; return; }
  b.hp=Math.max(0,b.hp-dt);
  if(b.hp<=0){ bossDie(); for(const e of enemies) if(!e.dead&&e.summoned) hurtEnemy(e,999,0); return; }
  if(GENS.every(g=>g.hp<=0)&&!p.dead){ showMsg('Генераторите паднаха! Порталът не може да бъде затворен.',3); die(); return; }
  b.spawnT-=dt; if(b.spawnT<=0){ b.spawnT=[5.2,3.9,3.0][DI]*(b.hp<b.max*0.4?0.85:1); const alive=enemies.filter(e=>!e.dead&&e.summoned).length; if(alive<[3,5,6][DI]){ let x; do { x=AX()+rnd(3,27)*T; } while(Math.abs(x-p.x)<70); portalSpawn('imp',x,15*T,0,'boss'); } }
  b.flyT-=dt; if(b.flyT<=0){ b.flyT=rnd(9,13); if(DI>0) portalSpawn('flyer',cx+rnd(-40,40),cy+40,0,'boss'); }
  if(!b.beam){ b.beamT-=dt; if(b.beamT<=0){ const al=GENS.filter(g=>g.hp>0); if(al.length){ const g=al[Math.floor(rnd(al.length))]; b.beam={g,t:1.5,fire:0}; sfxAt('charge',{x:cx,y:cy,w:0}); } b.beamT=[13,10,8][DI]; } }
  else { const bm=b.beam; if(bm.t>0){ bm.t-=dt; if(bm.t<=0){ bm.fire=0.5; shake=6; sfxAt('zap',{x:cx,y:cy,w:0});
        const gx=bm.g.x+14, gy=bm.g.y+10; if(!p.dead&&segHitsRect(cx,cy+20,gx,gy,p)){ hurtPlayer(18,0); showMsg('Блокира лъча!',1.2); } else { bm.g.hp-=[16,24,32][DI]; bm.g.hitT=0.3; if(bm.g.hp<=0){ bm.g.hp=0; explode(gx,gy,40,0,0,true); showMsg('Генератор е унищожен!',2); } } } }
    else { bm.fire-=dt; if(bm.fire<=0) b.beam=null; } }
}});
defBoss('breach',{draw:()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; const x=b.x+b.w/2-cam, y=b.y+b.h/2, k=b.dead?Math.max(0,1-b.deathT/2.6):1;
  ctx.save(); ctx.globalCompositeOperation='lighter';
  for(let i=0;i<6;i++){ ctx.strokeStyle=`rgba(${i%2?'255,90,210':'120,230,255'},${(0.55-i*0.07)*k})`; ctx.lineWidth=2; ctx.beginPath(); ctx.ellipse(x,y,(34-i*4)*k,(30-i*3.5)*k,b.anim*(i%2?1.3:-1),0,Math.PI*1.7); ctx.stroke(); }
  const g=ctx.createRadialGradient(x,y,0,x,y,34*k); g.addColorStop(0,'rgba(255,240,255,0.95)'); g.addColorStop(0.35,'rgba(255,90,210,0.6)'); g.addColorStop(1,'rgba(80,20,120,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,34*k,0,7); ctx.fill();
  if(b.beam){ const gx=b.beam.g.x+14-cam, gy=b.beam.g.y+10; if(b.beam.t>0){ ctx.strokeStyle=`rgba(255,80,120,${0.3+0.4*(Math.sin(titleT*30)+1)/2})`; ctx.lineWidth=1; ctx.setLineDash([4,4]); ctx.beginPath(); ctx.moveTo(x,y+20); ctx.lineTo(gx,gy); ctx.stroke(); ctx.setLineDash([]); }
    else { ctx.strokeStyle='rgba(255,140,230,0.9)'; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(x,y+20); ctx.lineTo(gx,gy); ctx.stroke(); ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke(); } }
  ctx.restore(); }});

/* ---------- 3. КАМЕННИЯТ СТРАЖ ---------- */
defBoss('stone',{make:()=>{ const cx=AX()+20*T, a=LVL.arena; setDoorAll([a.door,a.r0,a.r1],'D'); return {type:'stone',x:cx-20,y:15*T-62,w:40,h:62,hp:900*D.bhp,max:900*D.bhp,state:'intro',t:2,face:-1,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,phase:1,at:2.5,pulse:0,hintT:0}; }});
defBoss('stone',{hurt:(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return;
  if(ERA===0){ sparks(b.x+b.w/2+rnd(-10,10),b.y+rnd(10,50),3,'#d8c8a0'); b.hintT-=1; if(b.hintT<=0){ b.hintT=25; showMsg('Камъкът е непробиваем — смени епохата с E!',1.8); } return; }
  b.hp-=d*1.1; b.hitT=0.08; sparks(b.x+b.w/2+rnd(-8,8),b.y+28+rnd(-8,8),5,'#ffd08a');
  if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; showMsg('Стражът побесня!',2); shake=8; }
  if(b.hp<=0) bossDie(); }});
defBoss('stone',{upd:dt=>{
  const b=boss, p=player, a=LVL.arena; b.anim+=dt; b.hitT-=dt;
  if(b.dead){ bossDeathFx(b,dt); if(b.exitDone&&!b.allOpen){ b.allOpen=true; setDoorAll(a.exitDoor,'.'); } return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0) b.state='walk'; return; }
  const pcx=p.x+p.w/2, bcx=b.x+b.w/2, dx=pcx-bcx; b.face=sgn(dx)||b.face;
  const minX=AX()+2*T, maxX=AX()+28*T-b.w, spd=(ERA===0?34:20)*D.bspd*(b.phase>1?1.3:1);
  if(b.state==='walk'){ if(Math.abs(dx)>50) b.x=clamp(b.x+sgn(dx)*spd*dt,minX,maxX); b.at-=dt;
    if(b.at<=0){ b.at=(b.phase>1?1.8:2.5)*D.rate; const r=Math.random(); if(r<0.45){ b.state='stomp'; b.t=0.8; } else { b.state='throw'; b.t=0.7; } }
    if(ERA===1){ b.pulse+=dt; if(b.pulse>(DI===0?7:5.5)){ b.state='pulse'; b.t=1.2; b.pulse=0; sfxAt('charge',b); } } }
  else if(b.state==='stomp'){ b.t-=dt; if(b.t<=0){ shake=9; sfxAt('stomp',b); const n=b.phase>1?2:1; for(let i=0;i<n;i++) for(const s of [-1,1]) bossOrb(bcx+s*22,15*T-7,s*(150+i*40)*D.bspd,0,{dmg:12,r:6,life:3}); b.state='walk'; } }
  else if(b.state==='throw'){ b.t-=dt; if(b.t<=0){ const n=b.phase>1?3:2, tt=1.0, hx=bcx, hy=b.y+6; for(let i=0;i<n;i++){ const tx=pcx+(i-(n-1)/2)*40, ty=p.y+p.h-6; bossOrb(hx,hy,(tx-hx)/tt,(ty-hy)/tt-0.5*G*tt,{dmg:12,r:5,grav:true,red:true}); } sfxAt('stomp',b); b.state='walk'; } }
  else if(b.state==='pulse'){ b.t-=dt; if(b.t<=0){ if(ERA===1){ switchEra(true); showMsg('Стражът те връща в миналото!',1.8); flash=0.8; flashCol='#ffe2b0'; } b.state='walk'; } }
  if(!p.dead&&ov(b,p)){ b.bite=(b.bite||0)-dt; if(b.bite<=0){ b.bite=1; hurtPlayer(14,sgn(dx||1)*220); p.vy=-180; } }
}});
defBoss('stone',{draw:()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; begin(b); if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1);
  const ruin=ERA===1, st=ruin?'#7a7266':'#b8a888', sd=ruin?'#4a443c':'#8a7a5c', hi=ruin?'#9a9284':'#d8cca8'; tint=b.hitT>0?'#fff':null;
  const w=Math.round(Math.sin(b.anim*3)*2*(b.state==='walk'?1:0)), lift=b.state==='stomp'?-Math.round((0.8-b.t)*6):0;
  px(-14+w,-20,10,20,sd); px(4-w,-20+lift,10,20,sd); px(-16,-46,32,28,st); px(-16,-46,32,2,hi); px(-20,-44,6,22,st); px(14,-44,6,22,st);
  px(-10,-62,20,17,st); px(-10,-62,20,2,hi); px(-12,-64,24,3,sd); px(-7,-56,4,3,'#1a1410'); px(3,-56,4,3,'#1a1410');
  if(!ruin){ px(-8,-40,16,4,'#c9a24a'); for(let i=0;i<4;i++) px(-12+i*7,-30,3,3,'#a8884a'); }
  else { px(-6,-42,12,12,'#2a1a10'); const a=(Math.sin(titleT*8)+1)/2; px(-4,-40,8,8,`rgba(255,${160+a*80},80,1)`); px(-16,-30,6,8,'rgba(0,0,0,0)'); px(8,-22,8,4,'#5a5248'); }
  if(b.state==='pulse'){ ctx.globalCompositeOperation='lighter'; ctx.fillStyle=`rgba(255,200,120,${0.4*(1-b.t/1.2)})`; ctx.beginPath(); ctx.arc(0,-36,60*(1.2-b.t),0,7); ctx.fill(); }
  tint=null; ctx.restore(); }});

/* ---------- 4. РОЯКЪТ ---------- */
defBoss('swarm',{make:()=>{ const n=[40,55,70][DI], cx=AX()+15*T, cy=7*T;
  for(let i=0;i<n;i++){ const e=makeEnemy('mite',cx+rnd(-60,60),cy+rnd(-30,30)+8); e.hp=6*D.ehp; e.summoned=true; e.tag='swarm'; e.ctl=true; e.k=i; e.mech=true; e.alert=true; enemies.push(e); }
  return {type:'swarm',x:-500,y:-500,w:1,h:1,hp:n,max:n,state:'intro',t:1.5,form:'cloud',ft:3,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,fx:cx,fy:cy,fireT:1}; }});
defBoss('swarm',{hurt:()=>{}});
defBoss('swarm',{upd:dt=>{
  const b=boss, p=player, a=LVL.arena; b.anim+=dt;
  const mites=enemies.filter(e=>e.tag==='swarm'&&!e.dead); b.hp=mites.length;
  if(b.dead){ b.x=b.fx-20; b.y=b.fy-20; b.w=40; b.h=40; bossDeathFx(b,dt); return; }
  if(!mites.length){ b.fx=b.fx||AX()+15*T; bossDie(); return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0) b.state='fight'; }
  const pcx=p.x+p.w/2, pcy=p.y+p.h/2, n=mites.length, fast=n<b.max*0.35?1.4:1, AC_=AX()+15*T;
  b.ft-=dt*fast;
  if(b.ft<=0&&b.state==='fight'){ const forms=['fist','ring','snake','cloud']; let nf; do { nf=forms[Math.floor(rnd(forms.length))]; } while(nf===b.form); b.form=nf; b.ft=nf==='cloud'?2.5:nf==='fist'?4.2:6; b.fx=nf==='fist'?pcx:AC_; b.fy=nf==='fist'?Math.max(3*T,pcy-90):7*T; b.slam=0; b.trail=[]; if(nf==='fist') showMsg('Юмрук!',0.9); }
  let tgt;
  if(b.form==='cloud'){ b.fx+=(AC_-b.fx)*dt; b.fy+=(6.5*T-b.fy)*dt; tgt=(e,i)=>[b.fx+Math.sin(b.anim*1.3+i*2.1)*70,b.fy+Math.cos(b.anim*1.7+i*1.3)*35]; }
  else if(b.form==='fist'){ if(b.ft>1.6){ b.fx+=(pcx-b.fx)*Math.min(1,dt*2.5); b.fy+=((pcy-95)-b.fy)*Math.min(1,dt*2); } else { b.slam=1; b.fy=Math.min(14.3*T,b.fy+460*dt); if(b.fy>=14.3*T&&!b.landed){ b.landed=true; shake=8; sfxAt('stomp',{x:b.fx,y:b.fy,w:0}); } } if(b.ft>1.6) b.landed=false; tgt=(e,i)=>{ const r=6+(i%7)*2.4, an=i*2.4; return [b.fx+Math.cos(an)*r,b.fy+Math.sin(an)*r]; }; }
  else if(b.form==='ring'){ const R_=72+Math.sin(b.anim*2)*8; tgt=(e,i)=>{ const an=b.anim*(1.1*fast)+i/n*Math.PI*2; return [AC_+Math.cos(an)*R_*1.5,7.5*T+Math.sin(an)*R_*0.8]; };
    b.fireT-=dt; if(b.fireT<=0&&!p.dead){ b.fireT=(DI===0?0.9:0.55)/fast; const m=mites[Math.floor(rnd(n))], mx=m.x+4, my=m.y+4, dx=pcx-mx, dy=pcy-my, d=Math.hypot(dx,dy)||1; bossOrb(mx,my,dx/d*130*D.bspd,dy/d*130*D.bspd,{dmg:7,r:3}); } }
  else { const L=b.trail; const hx=(L.length?L[0][0]:AC_), hy=(L.length?L[0][1]:7*T); const dx=pcx-hx, dy=pcy-hy, d=Math.hypot(dx,dy)||1, sp=(DI===0?85:115)*fast; const nx=hx+dx/d*sp*dt+Math.cos(b.anim*5)*30*dt, ny=hy+dy/d*sp*dt+Math.sin(b.anim*6)*40*dt; L.unshift([nx,ny]); if(L.length>n*3) L.length=n*3; tgt=(e,i)=>L[Math.min(L.length-1,i*3)]; }
  mites.forEach((e,i)=>{ const [tx,ty]=tgt(e,i); const k=b.form==='fist'&&b.slam?14:6; e.x+=(tx-4-e.x)*Math.min(1,dt*k); e.y+=(ty-4-e.y)*Math.min(1,dt*k); e.hitT-=dt; e.bite=(e.bite||0)-dt;
    if(!p.dead&&ov(e,p)&&e.bite<=0){ e.bite=0.7; hurtPlayer(b.form==='fist'&&b.slam?9:5,sgn(p.x-e.x)*80); } });
}});
defBoss('swarm',{draw:()=>{ const b=boss; if(b.form==='fist'&&b.ft>1.6&&b.state==='fight'){ const x=b.fx-cam; ctx.strokeStyle=`rgba(255,200,80,${0.3+0.3*Math.sin(titleT*20)})`; ctx.setLineDash([3,4]); ctx.beginPath(); ctx.moveTo(x,b.fy); ctx.lineTo(x,15*T); ctx.stroke(); ctx.setLineDash([]); } }});

/* ---------- 5. БУРЯТА ---------- */
defBoss('storm',{make:()=>{ const cx=AX()+15*T; return {type:'storm',cx,x:cx-45,y:0.6*T,w:90,h:46,hp:800*D.bhp,max:800*D.bhp,state:'intro',t:2,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,phase:1,eye:0,cols:[],at:2.5,gust:0,gustT:8}; }});
defBoss('storm',{hurt:(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return; if(b.eye<0.5){ if(Math.random()<0.4) sparks(b.cx+rnd(-30,30),b.y+rnd(10,40),2,'#cfe8ff'); return; }
  b.hp-=d; b.hitT=0.08; sparks(b.cx+rnd(-8,8),b.y+24,4,'#9fe8ff'); if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; showMsg('Бурята се засилва!',2); shake=8; } if(b.hp<=0){ bossDie(); GWIND=0; } }});
defBoss('storm',{upd:dt=>{
  const b=boss, p=player; b.anim+=dt; b.hitT-=dt;
  if(b.dead){ GWIND=0; b.y+=dt*20; bossDeathFx(b,dt); return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0) b.state='fight'; return; }
  const AC_=AX()+15*T; b.cx=AC_+Math.sin(b.anim*0.35)*150; b.x=b.cx-45;
  b.gustT-=dt; if(b.gust>0){ b.gust-=dt; if(b.gust<=0) GWIND=0; } else if(b.gustT<=1&&b.gustT>0&&!b.gw){ b.gw=1; b.gdir=Math.random()<0.5?-1:1; showMsg(b.gdir>0?'Вятър → надясно!':'Вятър ← наляво!',1); } else if(b.gustT<=0){ b.gw=0; b.gust=3; GWIND=b.gdir*[220,300,360][DI]; b.gustT=rnd(8,11)*(b.phase>1?0.75:1); }
  if(b.eye>0){ b.eye-=dt; }
  else { b.at-=dt; if(b.at<=0&&!b.cols.length){ const n=b.phase>1?(DI===0?3:4):(DI===0?2:3); const pcx=p.x+p.w/2; b.cols=[]; for(let i=0;i<n;i++) b.cols.push({x:clamp(pcx+(i-(n-1)/2)*46+rnd(-10,10),AX()+2*T,AX()+28*T),t:1.15}); sfxAt('charge',{x:b.cx,y:b.y,w:0}); } }
  if(b.cols.length){ let fired=false; for(const c of b.cols){ c.t-=dt; if(c.t<=0&&!c.done){ c.done=true; fired=true; shake=6; light(c.x,8*T,140,1,'rgba(200,230,255,'); if(!p.dead&&Math.abs(p.x+p.w/2-c.x)<11) hurtPlayer(22,0); for(let i=0;i<8;i++) part(c.x,rnd(2*T,15*T),rnd(-30,30),rnd(-30,30),0.3,'#e8f6ff',2,0); } }
    if(fired) sfxAt('zap',{x:b.cx,y:b.y,w:0});
    if(b.cols.every(c=>c.done)){ b.cols=b.cols.filter(c=>c.t>-0.25); if(!b.cols.length){ b.eye=(DI===0?4:3.2); b.at=(b.phase>1?1.6:2.4)*D.rate; showMsg('Окото е отворено!',1); } } }
  if(b.eye>0){ b.fire=(b.fire||0)-dt; if(b.fire<=0&&!p.dead){ b.fire=1.1*D.rate; const dx=p.x+p.w/2-b.cx, dy=p.y+p.h/2-(b.y+24), d=Math.hypot(dx,dy)||1; bossOrb(b.cx,b.y+24,dx/d*140,dy/d*140,{dmg:9,ice:true}); } }
}});
defBoss('storm',{draw:()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; const x=b.cx-cam, y=b.y+22;
  ctx.save(); if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.6)/1,0,1);
  for(let i=0;i<9;i++){ const ox=Math.cos(b.anim*0.7+i)*38+(i-4)*7, oy=Math.sin(b.anim*0.9+i*1.7)*8; ctx.fillStyle=b.hitT>0?'#fff':(i%2?'#4a5a78':'#5c6c8c'); ctx.beginPath(); ctx.arc(x+ox,y+oy,16+(i%3)*4,0,7); ctx.fill(); }
  if(b.eye>0){ ctx.fillStyle='#e8f6ff'; ctx.beginPath(); ctx.ellipse(x,y+2,13,9,0,0,7); ctx.fill(); ctx.fillStyle='#3a8ac8'; ctx.beginPath(); ctx.arc(x+clamp((player.x-b.cx)/30,-5,5),y+2,5,0,7); ctx.fill(); ctx.fillStyle='#0a1a2a'; ctx.fillRect(x-1+clamp((player.x-b.cx)/30,-5,5),y,2,4); }
  else { ctx.fillStyle='#2a3448'; ctx.fillRect(x-12,y+2,24,2); }
  for(const c of b.cols){ const cx=c.x-cam; if(c.t>0){ ctx.strokeStyle=`rgba(255,120,120,${0.35+0.4*(Math.sin(titleT*30)+1)/2})`; ctx.setLineDash([4,5]); ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(cx,y+20); ctx.lineTo(cx,H); ctx.stroke(); ctx.setLineDash([]); }
    else { ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.strokeStyle='rgba(200,230,255,0.9)'; ctx.lineWidth=3; ctx.beginPath(); let yy=y+20; ctx.moveTo(cx,yy); while(yy<H){ yy+=14; ctx.lineTo(cx+rnd(-6,6),yy); } ctx.stroke(); ctx.restore(); } }
  if(b.gw||b.gust>0){ ctx.font='600 14px "IBM Plex Mono",monospace'; ctx.fillStyle=`rgba(220,240,255,${0.4+0.4*Math.sin(titleT*10)})`; ctx.textAlign='center'; ctx.fillText(b.gdir>0?'» » »':'« « «',W/2,60); ctx.textAlign='left'; }
  ctx.restore(); }});

/* ---------- 6. СЪЗДАТЕЛЯТ ---------- */
defBoss('maker',{make:()=>{ LVL.zeroG=false; const cx=AX()+15*T, cy=ROWS*T/2; return {type:'maker',cx,cy,x:cx-20,y:cy-20,w:40,h:40,hp:1500*(DI===0?0.4:D.bhp),max:1500*(DI===0?0.4:D.bhp),state:'intro',t:2.5,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,phase:1,sp:0,at:2,flipT:7,fw:0,droneT:9,onFlip(){ this.cy=ROWS*T-this.cy; }}; }});
defBoss('maker',{hurt:(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return; b.hp-=d; b.hitT=0.08; sparks(b.cx+rnd(-10,10),b.cy+rnd(-10,10),4,'#ffffff');
  if(b.phase===1&&b.hp<b.max*0.66){ b.phase=2; b.flipT=3; showMsg('Създателят пренаписва гравитацията!',2.2); shake=10; }
  else if(b.phase===2&&b.hp<b.max*0.33){ b.phase=3; if(FLIP) flipWorld(); LVL.zeroG=true; showMsg('Гравитацията изчезна! Плувай във въздуха — X е тласък.',2.6); shake=10; }
  if(b.hp<=0){ bossDie(); LVL.zeroG=false; if(FLIP) flipWorld(true); } }});
defBoss('maker',{upd:dt=>{
  const b=boss, p=player; b.anim+=dt; b.hitT-=dt;
  if(b.dead){ bossDeathFx(b,dt); return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0) b.state='fight'; return; }
  const pcx=p.x+p.w/2, pcy=p.y+p.h/2;
  if(b.phase===3){ const dx=pcx-b.cx, dy=pcy-b.cy, d=Math.hypot(dx,dy)||1; if(d>90){ b.cx+=dx/d*28*dt; b.cy+=dy/d*28*dt; } b.cx=clamp(b.cx,AX()+4*T,AX()+26*T); b.cy=clamp(b.cy,4*T,13*T); }
  else { b.cx+=((AX()+15*T+Math.sin(b.anim*0.5)*100)-b.cx)*dt; b.cy+=((ROWS*T/2+Math.sin(b.anim*0.8)*30)-b.cy)*dt; }
  b.x=b.cx-20; b.y=b.cy-20;
  b.sp-=dt; if(b.sp<=0){ b.sp=(b.phase===1?0.22:b.phase===2?0.18:0.13)/(DI===0?0.7:DI===2?1.25:1); const k=b.phase===3?3:2; for(let i=0;i<k;i++){ const an=b.anim*(b.phase===3?2.4:1.6)+i*Math.PI*2/k; bossOrb(b.cx,b.cy,Math.cos(an)*95*D.bspd,Math.sin(an)*95*D.bspd,{dmg:8,r:3,life:4}); } }
  b.at-=dt; if(b.at<=0&&!p.dead){ b.at=(b.phase===1?3.2:2.6)*D.rate; for(let i=0;i<(DI===0?2:3);i++){ const an=Math.atan2(pcy-b.cy,pcx-b.cx)+(i-1)*0.6; ebullets.push({x:b.cx,y:b.cy,vx:Math.cos(an)*110,vy:Math.sin(an)*110,life:4,dmg:10,r:4,orb:true,hornet:true}); } sfxAt('hornet',b); }
  b.droneT-=dt; if(b.droneT<=0){ b.droneT=rnd(10,14); if(enemies.filter(e=>!e.dead&&e.summoned).length<(DI===2?3:2)){ portalSpawn('drone',AX()+rnd(4,26)*T,(FLIP?6:10)*T,0,'boss'); } }
  if(b.phase===2){ b.flipT-=dt; if(b.flipT<1&&!b.fw){ b.fw=1; showMsg('Гравитацията се обръща!',0.9); } if(b.flipT<=0){ b.fw=0; b.flipT=(DI===0?9:7); flipWorld(); } }
  if(!p.dead&&ov(b,p)){ b.bite=(b.bite||0)-dt; if(b.bite<=0){ b.bite=1; hurtPlayer(14,sgn(pcx-b.cx)*200); } }
}});
defBoss('maker',{draw:()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; const x=b.cx-cam, y=b.cy; ctx.save(); if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1);
  ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(x,y,0,x,y,46); g.addColorStop(0,'rgba(255,255,255,0.85)'); g.addColorStop(0.4,'rgba(180,160,255,0.35)'); g.addColorStop(1,'rgba(120,80,255,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,46,0,7); ctx.fill();
  ctx.globalCompositeOperation='source-over';
  for(let r=0;r<3;r++){ ctx.strokeStyle=r===0?'#ffffff':r===1?'#cfc4ff':'#8ad8ff'; ctx.lineWidth=1.5; ctx.beginPath(); const n=r+3, rad=14+r*7, rot=b.anim*(r%2?-0.9:1.2)*(b.phase); for(let i=0;i<=n;i++){ const an=rot+i/n*Math.PI*2; const X=x+Math.cos(an)*rad, Y=y+Math.sin(an)*rad*(r===1?0.6:1); if(i) ctx.lineTo(X,Y); else ctx.moveTo(X,Y); } ctx.stroke(); }
  ctx.fillStyle=b.hitT>0?'#ff8ad8':'#ffffff'; ctx.beginPath(); ctx.arc(x,y,6+Math.sin(b.anim*6),0,7); ctx.fill(); ctx.restore(); }});
