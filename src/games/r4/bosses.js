/* ================= РЕЗОНАНС 4 · БОСОВЕ ================= */
Object.assign(R2B.intro,{
  puppeteer:'Кукловодът! Докато куклите са на сцената, той е недостижим. Свали ги — тогава ще слезе.',
  canvas:'Платното! Затвори разкъсванията — тогава окото му ще се отвори. Спреш ли, спира и времето.',
  legion:'Стражът! Щитът спира всичко отпред. Удряй в гръб или когато вдигне копието.',
  silent:'Безмълвният! Движи се само когато ти се движиш. Сонарът ще ти го покаже — и ще те издаде.',
  conductor:'Диригентът! Удряй всеки тон в неговия цвят. Нотите в твоя тон минават през теб.'});
Object.assign(R2B.name,{puppeteer:'КУКЛОВОДЪТ',canvas:'ПЛАТНОТО',legion:'СТРАЖЪТ НА СТОРГОЗИЯ',silent:'БЕЗМЪЛВНИЯТ',conductor:'ДИРИГЕНТЪТ'});
Object.assign(R2B.col,{puppeteer:'#e0a050',canvas:'#e8d8b0',legion:'#c8b890',silent:'#8adcff',conductor:'#b48cff'});
addUnique(BOSS_NORM,{puppeteer:1,canvas:1,legion:1,silent:1,conductor:0.8},'BOSS_NORM');
const bHit4=(b,col)=>{ b.hitT=0.08; sparks(b.x+b.w/2+rnd(-10,10),b.y+b.h/2+rnd(-10,10),4,col); };
const hint4=(b,t)=>{ b.hintT=(b.hintT||0)-1; if(b.hintT<=0){ b.hintT=28; showMsg(t,1.8); } };
const mySumm=tag=>enemies.filter(e=>e.tag===tag&&!e.dead);
function summ4(type,tx,row,tag,o={}){ const e=makeEnemy(type,tx*T+8,(row+1)*T); e.summoned=true; e.tag=tag; e.alert=true; Object.assign(e,o); enemies.push(e); for(let i=0;i<10;i++) part(tx*T+8,(row+1)*T-10,rnd(-50,50),rnd(-70,10),0.5,'#e8d8b0',1.5,0); return e; }

/* ---------- 1. КУКЛОВОДЪТ ---------- */
R2B.make.puppeteer=()=>({type:'puppeteer',x:AX()+13*T,y:2.4*T,w:44,h:30,hp:1000*D.bhp,max:1000*D.bhp,state:'intro',t:2,dir:1,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,phase:1,dropT:3,wave:0,mech:true});
R2B.hurt.puppeteer=(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return;
  if(b.state!=='low'){ sparks(b.x+b.w/2+rnd(-12,12),b.y+b.h,3,'#e8d8b0'); hint4(b,'Конците го пазят. Първо свали куклите!'); return; }
  b.hp-=d; bHit4(b,'#e0a050'); if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; showMsg('Кукловодът дърпа всички конци наведнъж!',2); shake=6; } if(b.hp<=0) bossDie(); };
R2B.upd.puppeteer=dt=>{
  const b=boss, p=player; b.anim+=dt; b.hitT-=dt;
  if(b.dead){ b.y=Math.min(b.y+60*dt,12*T); bossDeathFx(b,dt); return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0){ b.state='spawn'; } return; }
  const minX=AX()+3*T, maxX=AX()+26*T-b.w;
  if(b.state==='spawn'){ b.wave++; const n=b.phase>1?4:3; for(let i=0;i<n;i++) summ4('puppet',27+4+Math.floor(i*(22/n))+((b.wave+i)%3),14,'pp'); b.state='puppets'; sfxAt('horn',b); }
  else if(b.state==='puppets'){ b.x+=b.dir*(b.phase>1?70:50)*dt; if(b.x<minX){ b.x=minX; b.dir=1; } if(b.x>maxX){ b.x=maxX; b.dir=-1; }
    b.dropT-=dt; if(b.dropT<=0){ b.dropT=b.phase>1?1.7:2.5; const tx=clamp(p.x+p.w/2+rnd(-20,20),AX()+2*T,AX()+28*T); b.mark={x:tx,t:0.8}; }
    if(b.mark){ b.mark.t-=dt; if(b.mark.t<=0){ bossOrb(b.mark.x,2*T,0,40,{grav:true,dmg:16,r:7}); sfxAt('throwG',b); b.mark=null; } }
    if(!mySumm('pp').length){ b.state='lower'; b.t=0; showMsg('Конците отслабнаха — Кукловодът слиза!',1.6); } }
  else if(b.state==='lower'){ b.y=Math.min(b.y+140*dt,9.6*T); if(b.y>=9.6*T){ b.state='low'; b.t=b.phase>1?3.2:4; } }
  else if(b.state==='low'){ b.t-=dt; if(Math.random()<dt*2) part(b.x+rnd(b.w),b.y+rnd(b.h),rnd(-20,20),rnd(-40,0),0.5,'#c8a070',1.5,200); if(b.t<=0) b.state='raise'; }
  else if(b.state==='raise'){ b.y=Math.max(b.y-120*dt,2.4*T); if(b.y<=2.4*T){ b.state='spawn'; } }
  if(!p.dead&&b.state==='low'&&ov(b,p)){ b.bite=(b.bite||0)-dt; if(b.bite<=0){ b.bite=0.8; hurtPlayer(12,sgn(p.x-b.x)*200); } }
};
R2B.draw.puppeteer=()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; const x=Math.round(b.x-cam), y=Math.round(b.y); ctx.save(); if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1);
  ctx.strokeStyle='rgba(230,220,200,0.55)'; ctx.lineWidth=1; for(const e of mySumm('pp')){ ctx.beginPath(); ctx.moveTo(x+b.w/2,y+b.h); ctx.lineTo(e.x+e.w/2-cam,e.y); ctx.stroke(); }
  for(const ox of [6,b.w-6]){ ctx.beginPath(); ctx.moveTo(x+ox,y); ctx.lineTo(x+ox,0); ctx.stroke(); }
  const c=b.hitT>0?'#ffffff':'#6a4a2a'; ctx.fillStyle='#4a3018'; ctx.fillRect(x-8,y+2,b.w+16,4); ctx.fillRect(x+b.w/2-2,y-6,4,18);
  ctx.fillStyle=c; ctx.fillRect(x+8,y+6,b.w-16,b.h-6); for(let i=0;i<5;i++){ ctx.fillStyle='#8a6a42'; ctx.fillRect(x+10+i*5,y+8,1,b.h-10); }
  const sw=Math.sin(b.anim*3)*4; ctx.fillStyle='#e8c8a0'; ctx.fillRect(x+2,y+10+sw,6,3); ctx.fillRect(x+b.w-8,y+10-sw,6,3);
  ctx.fillStyle='#f4ece0'; ctx.fillRect(x+b.w/2-7,y-2,14,12); ctx.fillStyle='#1a1010'; ctx.fillRect(x+b.w/2-5,y+2,3,3); ctx.fillRect(x+b.w/2+2,y+2,3,3); ctx.fillStyle='#a83a2a'; ctx.fillRect(x+b.w/2-3,y+7,6,1);
  if(b.mark){ const mx=b.mark.x-cam; ctx.fillStyle=`rgba(255,200,120,${0.3+0.4*Math.sin(titleT*20)})`; ctx.fillRect(mx-8,15*T-3,16,3); }
  ctx.restore(); };

/* ---------- 2. ПЛАТНОТО ---------- */
Object.assign(DIMS,{rip:[14,22,110]});
R2UPD.rip=(e,dt)=>{ e.anim+=dt; e.alert=false; e.mech=true; };
R2DRAW.rip=e=>{ if(e.dead&&e.deadT>0.5) return; const x=Math.round(e.x+e.w/2-cam), y=Math.round(e.y), a=0.6+0.4*Math.sin(e.anim*5);
  ctx.save(); ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(x,y+11,1,x,y+11,20); g.addColorStop(0,`rgba(255,250,235,${e.dead?0.2:a})`); g.addColorStop(1,'rgba(200,170,255,0)'); ctx.fillStyle=g; ctx.fillRect(x-20,y-9,40,40); ctx.restore();
  ctx.fillStyle=e.hitT>0?'#ffffff':'#2a1a30'; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+4,y+8); ctx.lineTo(x+2,y+14); ctx.lineTo(x+5,y+22); ctx.lineTo(x-1,y+16); ctx.lineTo(x-4,y+8); ctx.closePath(); ctx.fill(); };
R2B.make.canvas=()=>{ for(const [tx,row] of [[31,11],[40,8],[49,11]]) summ4('rip',tx,row,'rip'); return {type:'canvas',x:AX()+11*T,y:1.2*T,w:7*T,h:4*T,hp:1100*D.bhp,max:1100*D.bhp,state:'intro',t:2,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,phase:1,fireT:2.5,spawnT:6,open:0}; };
R2B.hurt.canvas=(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return;
  if(b.state!=='open'){ sparks(b.x+b.w/2+rnd(-20,20),b.y+b.h/2,3,'#e8d8b0'); hint4(b,'Окото е затворено. Затвори разкъсванията!'); return; }
  b.hp-=d; bHit4(b,'#fff0d0'); if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; showMsg('Платното се разкъсва още по-силно!',2); shake=6; } if(b.hp<=0) bossDie(); };
R2B.upd.canvas=dt=>{
  const b=boss, p=player; b.anim+=dt; b.hitT-=dt;
  if(b.dead){ bossDeathFx(b,dt); return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0) b.state='fight'; return; }
  b.fireT-=dt; if(b.fireT<=0){ b.fireT=b.phase>1?1.8:2.6; const side=Math.random()<0.5, hx=side?AX()+1.5*T:AX()+28*T, hy=11*T, tt=1.4, tx=p.x+p.w/2+rnd(-24,24);
    bossOrb(hx,hy,(tx-hx)/tt,(p.y+p.h-6-hy)/tt-0.5*G*tt,{grav:true,dmg:14,r:6,life:5}); sfxAt('boom',{x:hx,y:hy,w:0}); for(let i=0;i<12;i++) part(hx,hy,rnd(-40,40),rnd(-60,0),0.8,'rgba(240,232,214,0.8)',3,-20); }
  b.spawnT-=dt; if(b.spawnT<=0){ b.spawnT=b.phase>1?7:10; if(enemies.filter(e=>!e.dead&&e.type==='shade').length<(b.phase>1?3:2)) mechSpawn('shade',AX()+rnd(4,24)*T); }
  if(b.state==='fight'&&!mySumm('rip').length){ b.state='open'; b.t=b.phase>1?5:6.5; b.open=0; showMsg('Окото на платното е отворено!',1.6); }
  if(b.state==='open'){ b.open=Math.min(1,b.open+dt*3); b.t-=dt; if(b.t<=0){ b.state='fight'; const pos=b.phase>1?[[30,7],[36,11],[44,7],[50,11]]:[[33,10],[41,7],[48,10]]; for(const [tx,row] of pos) summ4('rip',tx,row,'rip'); } }
  else b.open=Math.max(0,b.open-dt*3);
};
R2B.draw.canvas=()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; const cx=Math.round(b.x+b.w/2-cam), cy=Math.round(b.y+b.h/2); ctx.save(); if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1);
  for(let i=0;i<14;i++){ const a=b.anim*0.6+i*0.45, r=20+i*3.5; ctx.strokeStyle=i%2?'rgba(120,96,70,0.55)':'rgba(200,180,140,0.5)'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(cx,cy,r,a,a+1.6); ctx.stroke(); } ctx.lineWidth=1;
  const o=b.open; ctx.fillStyle='#f0e6cc'; ctx.beginPath(); ctx.ellipse(cx,cy,18,2+12*o,0,0,7); ctx.fill();
  if(o>0.1){ ctx.fillStyle=b.hitT>0?'#ffffff':'#4a2a5a'; ctx.beginPath(); ctx.arc(cx,cy,7*o,0,7); ctx.fill(); ctx.fillStyle='#0a0508'; ctx.beginPath(); ctx.arc(cx,cy,3*o,0,7); ctx.fill(); }
  ctx.strokeStyle='#6a5032'; ctx.lineWidth=2; ctx.beginPath(); ctx.ellipse(cx,cy,19,3+12*o,0,0,7); ctx.stroke(); ctx.lineWidth=1; ctx.restore(); };

/* ---------- 3. СТРАЖЪТ НА СТОРГОЗИЯ ---------- */
R2B.make.legion=()=>({type:'legion',x:AX()+20*T,y:15*T-42,w:26,h:42,hp:1000*D.bhp,max:1000*D.bhp,state:'intro',t:2,face:-1,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,phase:1,act:0,spawnT:9});
R2B.hurt.legion=(d,blast)=>{ const b=boss, p=player; if(!b||b.dead||b.state==='intro') return;
  const front=sgn(p.x+p.w/2-(b.x+b.w/2))===b.face, open=b.state==='windup'||b.state==='stun';
  if(front&&!open&&!blast){ sparks(b.face>0?b.x+b.w:b.x,b.y+18,3,'#e8e0c8'); hint4(b,'Щитът спира куршумите! Заобиколи го — или удряй, когато вдигне копието.'); b.hp-=d*0.08; }
  else { b.hp-=d*(b.state==='stun'?1.3:1); bHit4(b,'#c8b890'); }
  if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; showMsg('Стражът вика легиона си!',2); shake=6; } if(b.hp<=0) bossDie(); };
R2B.upd.legion=dt=>{
  const b=boss, p=player; b.anim+=dt; b.hitT-=dt;
  if(b.dead){ bossDeathFx(b,dt); return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0){ b.state='walk'; b.t=2; } return; }
  const pcx=p.x+p.w/2, bcx=b.x+b.w/2, minX=AX()+T, maxX=AX()+29*T-b.w, sp=(b.phase>1?1.25:1)*D.bspd;
  if(b.state==='walk'){ b.face=sgn(pcx-bcx)||b.face; b.x=clamp(b.x+b.face*48*sp*dt,minX,maxX); b.t-=dt;
    if(b.t<=0){ b.act++; if(b.act%3===0){ b.state='charge'; b.t=0.5; sfxAt('charge',b); } else { b.state='windup'; b.t=b.phase>1?0.6:0.85; } } }
  else if(b.state==='windup'){ b.t-=dt; if(b.t<=0){ b.state='walk'; b.t=1.6; const hy=b.y+14; for(let i=0;i<(b.phase>1?2:1);i++) ebullets.push({x:bcx+b.face*14,y:hy+i*10,vx:b.face*260*D.bspd,vy:0,life:3,dmg:16,r:4,orb:true}); sfxAt('throwG',b); } }
  else if(b.state==='charge'){ b.t-=dt; if(b.t<=0){ b.x+=b.face*300*sp*dt; if(Math.random()<0.5) part(b.face>0?b.x:b.x+b.w,15*T-2,-b.face*rnd(40,100),rnd(-50,-10),0.3,'#c8b890',1.5,300);
      if(b.x<=minX||b.x>=maxX){ b.x=clamp(b.x,minX,maxX); b.state='stun'; b.t=b.phase>1?1.4:1.9; shake=8; sfxAt('stomp',b); } } }
  else if(b.state==='stun'){ b.t-=dt; if(b.t<=0){ b.state='walk'; b.t=1.4; } }
  if(b.phase>1){ b.spawnT-=dt; if(b.spawnT<=0){ b.spawnT=9; if(enemies.filter(e=>!e.dead&&e.type==='shade').length<2) mechSpawn('shade',AX()+(pcx>AX()+15*T?4:24)*T); } }
  if(!p.dead&&ov(b,p)){ b.bite=(b.bite||0)-dt; if(b.bite<=0){ b.bite=0.8; hurtPlayer(b.state==='charge'?22:10,sgn(pcx-bcx||1)*240); p.vy=-180; } }
};
R2B.draw.legion=()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; begin(b); if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1);
  tint=b.hitT>0?'#fff':null; const w=b.state==='walk'?Math.round(Math.sin(b.anim*6)*2):0, st=b.state==='stun', up=b.state==='windup';
  px(-7+w,-14,5,14,'#6a5a40'); px(2-w,-14,5,14,'#6a5a40'); px(-9,-32,18,19,'#8a8a8e'); for(let i=0;i<4;i++) px(-9,-30+i*4,18,1,'#6a6a70'); px(-10,-15,20,3,'#7a2a1e');
  px(-6,-40,12,8,'#9a9aa0'); px(-7,-42,14,3,'#b8a060'); px(-1,-46,2,4,'#a82a1e');
  if(up){ px(-3,-56,2,30,'#6a4a2a'); px(-4,-60,4,5,'#c8c8c8'); } else px(4,-36,2,28,'#6a4a2a');
  if(!st&&!up){ px(8,-34,6,26,'#7a2a1e'); px(9,-33,4,24,'#b8a060'); px(10,-24,2,4,'#e8d8a0'); } else { px(-14,-30,5,22,'#7a2a1e'); }
  tint=null; ctx.restore(); };

/* ---------- 4. БЕЗМЪЛВНИЯТ ---------- */
R2B.make.silent=()=>({type:'silent',x:AX()+22*T,y:15*T-40,w:48,h:40,hp:900*D.bhp,max:900*D.bhp,state:'intro',t:2,face:-1,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,phase:1,tx:0,heard:0,spawnT:10});
R2B.hurt.silent=(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return;
  if(b.state!=='recover'){ b.hp-=d*0.12; sparks(b.x+b.w/2,b.y+10,2,'#8adcff'); hint4(b,'Кожата му поглъща куршумите. Изчакай да се хвърли — и стреляй в сърцето.'); }
  else { b.hp-=d*1.3; bHit4(b,'#8adcff'); }
  b.tx=player.x; b.heard=1; if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; showMsg('Безмълвният вече чува и стъпките ти!',2); shake=6; } if(b.hp<=0) bossDie(); };
R2B.upd.silent=dt=>{
  const b=boss, p=player; b.anim+=dt; b.hitT-=dt;
  if(b.dead){ bossDeathFx(b,dt); return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0){ b.state='hunt'; b.tx=p.x; } return; }
  const last=NOISE[NOISE.length-1]; if(last&&lvT-last.t<0.3){ b.tx=last.x; b.heard=1; }
  if(b.phase>1&&Math.abs(p.vx)>60&&p.onGround) { b.tx=p.x; }
  const pcx=p.x+p.w/2, bcx=b.x+b.w/2, minX=AX()+T, maxX=AX()+29*T-b.w;
  if(b.state==='hunt'){ const d=b.tx-bcx; b.face=sgn(d)||b.face; b.x=clamp(b.x+clamp(d,-1,1)*Math.min(Math.abs(d),(b.phase>1?95:70)*D.bspd*dt),minX,maxX);
    if(Math.abs(pcx-bcx)<5*T&&!p.dead){ b.state='crouch'; b.t=0.6; b.face=sgn(pcx-bcx)||b.face; } }
  else if(b.state==='crouch'){ b.t-=dt; if(b.t<=0){ b.state='lunge'; b.t=0.55; b.vx=b.face*330*D.bspd; sfxAt('roar',b); } }
  else if(b.state==='lunge'){ b.t-=dt; b.x+=b.vx*dt; if(b.x<=minX||b.x>=maxX||b.t<=0){ b.x=clamp(b.x,minX,maxX); b.state='recover'; b.t=b.phase>1?1.8:2.4; shake=7; sfxAt('stomp',b); } }
  else if(b.state==='recover'){ b.t-=dt; if(b.t<=0){ b.state='hunt'; b.tx=p.x; } }
  b.spawnT-=dt; if(b.phase>1&&b.spawnT<=0){ b.spawnT=11; if(enemies.filter(e=>!e.dead&&e.type==='crab').length<3) mechSpawn('crab',AX()+rnd(3,26)*T); }
  if(!p.dead&&ov(b,p)){ b.bite=(b.bite||0)-dt; if(b.bite<=0){ b.bite=0.8; hurtPlayer(b.state==='lunge'?26:12,sgn(pcx-bcx||1)*260); p.vy=-180; } }
};
R2B.draw.silent=()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; const x=Math.round(b.x-cam), y=Math.round(b.y);
  const ping=SONAR.some(s=>s.t<1.2&&Math.abs(s.x-(b.x+b.w/2))<s.t*300+40), rec=b.state==='recover', al=b.dead?1-clamp((b.deathT-1.8)/0.8,0,1):Math.max(ping?0.9:0.1,rec?0.8:0,b.hitT>0?0.9:0);
  ctx.save(); ctx.globalAlpha=al; const c=b.hitT>0?'#ffffff':'#2a2e38';
  ctx.fillStyle=c; ctx.beginPath(); ctx.ellipse(x+b.w/2,y+b.h*0.55,b.w/2,b.h*0.45,0,0,7); ctx.fill();
  for(let i=0;i<4;i++){ ctx.fillStyle='#1a1e26'; ctx.fillRect(x+6+i*11,y+b.h-8+Math.round(Math.sin(b.anim*5+i)*2),5,8); }
  ctx.fillStyle='#3a404c'; const hx=b.face>0?x+b.w-10:x-6; ctx.fillRect(hx,y+8,16,14);
  if(rec){ ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(x+b.w/2,y+b.h/2,1,x+b.w/2,y+b.h/2,18); g.addColorStop(0,'rgba(140,220,255,0.95)'); g.addColorStop(1,'rgba(140,220,255,0)'); ctx.fillStyle=g; ctx.fillRect(x+b.w/2-18,y+b.h/2-18,36,36); }
  if(b.state==='crouch'){ ctx.fillStyle='#8adcff'; ctx.globalAlpha=0.8; ctx.fillRect(hx+4,y+12,3,2); ctx.fillRect(hx+9,y+12,3,2); }
  ctx.restore(); };

/* ---------- 5. ДИРИГЕНТЪТ ---------- */
Object.assign(DIMS,{note:[16,16,240]});
R2UPD.note=(e,dt)=>{ e.anim+=dt; e.alert=false; e.mech=true; const b=boss; if(b&&b.type==='conductor'&&!b.dead){ const a=b.anim*0.55+e.fq*2.094; e.x=b.x+b.w/2+Math.cos(a)*64-e.w/2; e.y=b.y+b.h/2+30+Math.sin(a)*40-e.h/2; } };
R2DRAW.note=e=>{ if(e.dead&&e.deadT>0.5) return; const x=Math.round(e.x+e.w/2-cam), y=Math.round(e.y+e.h/2), on=e.fq===FREQ;
  ctx.save(); ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(x,y,1,x,y,16); g.addColorStop(0,`rgba(${FQ_RGB[e.fq]},${on?0.9:0.35})`); g.addColorStop(1,`rgba(${FQ_RGB[e.fq]},0)`); ctx.fillStyle=g; ctx.fillRect(x-16,y-16,32,32); ctx.restore();
  ctx.fillStyle=e.hitT>0?'#ffffff':FQ_COL[e.fq]; ctx.beginPath(); ctx.ellipse(x-2,y+3,5,4,-0.4,0,7); ctx.fill(); ctx.fillRect(x+2,y-8,2,11); ctx.fillRect(x+2,y-8,6,2); };
function cond4Phase(b,ph){ b.phase=ph; LVL.still=ph===2; LVL.dark=ph===3; LVL.sonar=ph===3; LVL.freq=ph!==3; shake=10; flash=1; flashCol='#ffffff';
  showMsg(ph===2?'Диригентът спира времето! Движи се — и само тогава то тече.':'Светлината угасва. Чуй го — сонарът е на E.',3); }
R2B.make.conductor=()=>{ LVL.still=false; LVL.dark=false; LVL.sonar=false; LVL.freq=true;
  const b={type:'conductor',x:AX()+13*T,y:4*T,w:3*T,h:3*T,hp:1500*D.bhp,max:1500*D.bhp,state:'intro',t:2.4,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,phase:1,fireT:1.5,waveT:3,tpT:4,mech:true};
  for(let f=0;f<3;f++) summ4('note',40,6,'note',{fq:f,hp:110*D.ehp}); return b; };
R2B.hurt.conductor=(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return;
  if(b.phase===1){ sparks(b.x+b.w/2,b.y+b.h/2,3,'#b48cff'); hint4(b,'Тоновете го пазят. Удряй всяка нота в нейния цвят!'); return; }
  b.hp-=d; bHit4(b,'#b48cff'); if(b.phase===2&&b.hp<b.max*0.4) cond4Phase(b,3); if(b.hp<=0){ LVL.still=false; LVL.dark=false; LVL.sonar=false; bossDie(); } };
R2B.upd.conductor=dt=>{
  const b=boss, p=player; b.anim+=dt; b.hitT-=dt;
  if(b.dead){ bossDeathFx(b,dt); return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0) b.state='fight'; return; }
  const pcx=p.x+p.w/2, pcy=p.y+p.h/2, bcx=b.x+b.w/2, bcy=b.y+b.h/2;
  if(b.phase===1){ b.x=AX()+13*T+Math.sin(b.anim*0.5)*6*T; if(!mySumm('note').length) cond4Phase(b,2);
    b.fireT-=dt; if(b.fireT<=0){ b.fireT=1.1; const f=Math.floor(Math.random()*3), a=Math.atan2(pcy-bcy,pcx-bcx); for(const o of [-0.2,0,0.2]) ebullets.push({x:bcx,y:bcy,vx:Math.cos(a+o)*150*D.bspd,vy:Math.sin(a+o)*150*D.bspd,life:4,dmg:12,r:5,orb:true,fq:f}); osc&&AC&&osc({type:'sine',f:FQ_HZ[f],t:0.2,v:0.06}); } }
  else if(b.phase===2){ b.y+=(9*T-b.y)*Math.min(1,dt*2); b.x=AX()+13*T+Math.sin(b.anim*0.7)*8*T;
    b.waveT-=dt; if(b.waveT<=0){ b.waveT=2.2; for(const s of [-1,1]) ebullets.push({x:bcx,y:15*T-6,vx:s*170*D.bspd,vy:0,life:3,dmg:14,r:6,orb:true,fq:Math.floor(Math.random()*3)}); sfxAt('stomp',b); }
    b.fireT-=dt; if(b.fireT<=0){ b.fireT=1.6; for(let i=0;i<5;i++){ const a=-Math.PI/2+(i-2)*0.35; ebullets.push({x:bcx,y:b.y,vx:Math.cos(a)*120,vy:Math.sin(a)*120,life:4,dmg:10,r:4,orb:true,grav:true,fq:i%3}); } } }
  else { b.tpT-=dt; if(b.tpT<=0){ b.tpT=2.6; b.x=AX()+rnd(4,22)*T; b.y=rnd(3,9)*T; for(let i=0;i<20;i++) part(b.x+b.w/2,b.y+b.h/2,rnd(-90,90),rnd(-90,90),0.5,'#b48cff',2,0); if(AC) osc({type:'sine',f:FQ_HZ[Math.floor(Math.random()*3)]/2,t:0.6,v:0.08}); noise(b.x+b.w/2,b.y,'boss'); }
    b.fireT-=dt; if(b.fireT<=0){ b.fireT=1.3; const a=Math.atan2(pcy-bcy,pcx-bcx); ebullets.push({x:bcx,y:bcy,vx:Math.cos(a)*170*D.bspd,vy:Math.sin(a)*170*D.bspd,life:4,dmg:14,r:5,orb:true}); } }
  if(!p.dead&&ov(b,p)){ b.bite=(b.bite||0)-dt; if(b.bite<=0){ b.bite=0.8; hurtPlayer(14,sgn(pcx-bcx||1)*240); } }
};
R2B.draw.conductor=()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; const x=Math.round(b.x-cam), y=Math.round(b.y), cx=x+b.w/2;
  ctx.save(); if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1); if(b.phase===3) ctx.globalAlpha*=0.55+0.45*Math.abs(Math.sin(b.anim*2));
  ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(cx,y+b.h/2,2,cx,y+b.h/2,46); g.addColorStop(0,'rgba(220,200,255,0.8)'); g.addColorStop(1,'rgba(180,140,255,0)'); ctx.fillStyle=g; ctx.fillRect(cx-46,y+b.h/2-46,92,92); ctx.globalCompositeOperation='source-over';
  ctx.fillStyle=b.hitT>0?'#ffffff':'#f4f0fa'; ctx.fillRect(cx-6,y+10,12,26); ctx.fillRect(cx-4,y+2,8,8);
  const arm=Math.sin(b.anim*4)*10; ctx.strokeStyle='#f4f0fa'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(cx-5,y+14); ctx.lineTo(cx-18,y+6-arm); ctx.moveTo(cx+5,y+14); ctx.lineTo(cx+18,y+6+arm); ctx.stroke();
  ctx.strokeStyle='#b48cff'; ctx.beginPath(); ctx.moveTo(cx+18,y+6+arm); ctx.lineTo(cx+30,y-4+arm*1.5); ctx.stroke(); ctx.lineWidth=1;
  for(let i=0;i<3;i++){ ctx.strokeStyle=`rgba(${FQ_RGB[i]},0.5)`; ctx.beginPath(); ctx.arc(cx,y+b.h/2,22+i*6,b.anim*(1+i*0.3),b.anim*(1+i*0.3)+2); ctx.stroke(); }
  ctx.restore(); };
