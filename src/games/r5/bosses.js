/* ================= РЕЗОНАНС 5 · БОСОВЕ ================= */
defBosses('intro',{
  combine:'Комбайнът! Кристалът на покрива е уязвим, когато машината се забие в края на нивата.',
  cascade:'Каскадата! Разбий кристалите във вировете — тогава травертиновата ѝ кожа ще се напука.',
  moth:'Нощницата! Уязвима е само на светло — в лъчите от тавана или до сигнална ракета.',
  valchev:'Вълчев! Щитът му пада само докато зарежда удара си.',
  resonator:'Третият резонатор! Удряй ядрото, когато пластините се отворят. Не пускай хората до машината!'});
defBosses('name',{combine:'КОМБАЙНЪТ',cascade:'КАСКАДАТА',moth:'НОЩНИЦАТА',valchev:'ПРОФ. ВЪЛЧЕВ',resonator:'„КАМЕРТОН-3“'});
defBosses('col',{combine:'#d8a040',cascade:'#5ad8c8',moth:'#b8a0d8',valchev:'#9aff8a',resonator:'#3fd0a0'});
defBosses('norm',{combine:1,cascade:1,moth:1,valchev:1,resonator:0.85});
const bHit5=(b,col)=>{ b.hitT=0.08; sparks(b.x+b.w/2+rnd(-10,10),b.y+b.h/2+rnd(-10,10),4,col); };
const hint5=(b,t)=>{ b.hintT=(b.hintT||0)-1; if(b.hintT<=0){ b.hintT=28; showMsg(t,1.8); } };
const summ5=(type,tx,row,tag,o={})=>{ const e=makeEnemy(type,tx*T+8,(row+1)*T); e.summoned=true; e.tag=tag; e.alert=true; Object.assign(e,o); enemies.push(e); for(let i=0;i<10;i++) part(tx*T+8,(row+1)*T-10,rnd(-50,50),rnd(-70,10),0.5,'#9aff8a',1.5,0); return e; };
const alive5=tag=>enemies.filter(e=>e.tag===tag&&!e.dead);
const crystalFx=(x,y,col,t)=>{ ctx.save(); ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(x,y,1,x,y,16); g.addColorStop(0,`rgba(${col},${0.7+0.3*Math.sin(t*6)})`); g.addColorStop(1,`rgba(${col},0)`); ctx.fillStyle=g; ctx.fillRect(x-16,y-16,32,32); ctx.restore(); };

/* ---------- 1. КОМБАЙНЪТ ---------- */
defBoss('combine',{make:()=>({type:'combine',x:AX()+20*T,y:15*T-44,w:84,h:44,hp:900*D.bhp,max:900*D.bhp,state:'intro',t:2,face:-1,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,phase:1,baleT:3,act:0,mech:true})});
defBoss('combine',{hurt:(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return;
  if(b.state!=='stun'){ sparks(b.x+b.w/2+rnd(-20,20),b.y+8,3,'#d8a040'); hint5(b,'Бронята е дебела. Изчакай да се забие в края на нивата!'); b.hp-=d*0.05; return; }
  b.hp-=d*1.2; bHit5(b,'#9aff8a'); if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; showMsg('Жетварката се върти още по-бързо!',2); shake=6; } if(b.hp<=0) bossDie(); }});
defBoss('combine',{upd:dt=>{
  const b=boss, p=player; b.anim+=dt; b.hitT-=dt;
  if(b.dead){ bossDeathFx(b,dt); return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0){ b.state='aim'; b.t=1.2; } return; }
  const minX=AX()+T, maxX=AX()+29*T-b.w, sp=(b.phase>1?1.3:1)*D.bspd, pcx=p.x+p.w/2, bcx=b.x+b.w/2;
  if(b.state==='aim'){ b.face=sgn(pcx-bcx)||b.face; b.t-=dt; if(Math.random()<dt*10) part(b.face>0?b.x:b.x+b.w,b.y+10,-b.face*rnd(20,60),rnd(-40,-10),0.5,'#6a6a6a',3,0);
    if(b.t<=0){ b.state='drive'; sfxAt('charge',b); } }
  else if(b.state==='drive'){ b.x+=b.face*170*sp*dt; if(Math.random()<0.6) part(b.face>0?b.x:b.x+b.w,15*T-2,-b.face*rnd(40,120),rnd(-60,-10),0.4,'#d8b44a',1.5,300);
    if(b.x<=minX||b.x>=maxX){ b.x=clamp(b.x,minX,maxX); b.state='stun'; b.t=b.phase>1?1.8:2.4; shake=10; sfxAt('stomp',b); for(let i=0;i<20;i++) part(b.face>0?b.x+b.w:b.x,b.y+20,rnd(-80,80),rnd(-120,-20),0.6,'#d8b44a',2,300); } }
  else if(b.state==='stun'){ b.t-=dt; if(b.t<=0){ b.state='aim'; b.t=b.phase>1?0.7:1.1; b.face=-b.face; } }
  b.baleT-=dt; if(b.baleT<=0&&b.state!=='stun'){ b.baleT=b.phase>1?2.2:3.2; const bx=b.face>0?b.x:b.x+b.w; ebullets.push({x:bx,y:15*T-8,vx:-b.face*150*D.bspd,vy:0,life:4,dmg:12,r:7,orb:true}); sfxAt('throwG',b); }
  if(!p.dead&&ov(b,p)){ b.bite=(b.bite||0)-dt; if(b.bite<=0){ b.bite=0.8; hurtPlayer(b.state==='drive'?24:8,sgn(pcx-bcx||1)*260); p.vy=-220; } }
}});
defBoss('combine',{draw:()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; const x=Math.round(b.x-cam), y=Math.round(b.y), f=b.face; ctx.save(); if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1);
  const hit=b.hitT>0; ctx.fillStyle=hit?'#fff':'#3a7a3a'; ctx.fillRect(x+8,y+12,68,24); ctx.fillStyle=hit?'#fff':'#2e6a2e'; ctx.fillRect(x+8,y+30,68,6);
  const cx=f>0?x+58:x+10; ctx.fillStyle='#4a8a4a'; ctx.fillRect(cx,y,18,14); ctx.fillStyle='#9ac8d8'; ctx.fillRect(cx+2,y+2,14,8);
  const rx=f>0?x+76:x-6; ctx.fillStyle='#c8a040'; ctx.fillRect(rx,y+18,14,20); for(let i=0;i<4;i++){ const a=b.anim*(b.state==='drive'?18:6)+i*1.57; ctx.fillStyle='#8a6a2a'; ctx.fillRect(rx+7+Math.cos(a)*6-1,y+28+Math.sin(a)*8-1,3,3); }
  ctx.fillStyle='#1a1a1a'; for(const wx of [x+20,x+62]){ ctx.beginPath(); ctx.arc(wx,y+38,7,0,7); ctx.fill(); }
  crystalFx(x+40,y+8,'120,255,140',b.anim); ctx.fillStyle=b.state==='stun'?'#ffffff':'#9aff8a'; ctx.beginPath(); ctx.moveTo(x+40,y-2); ctx.lineTo(x+45,y+8); ctx.lineTo(x+40,y+14); ctx.lineTo(x+35,y+8); ctx.closePath(); ctx.fill();
  if(b.state==='stun'&&Math.floor(b.anim*6)%2){ ctx.fillStyle='#ffe6a0'; ctx.fillRect(x+34,y-10,12,2); } ctx.restore(); }});

/* ---------- 2. КАСКАДАТА ---------- */
defFoes('dims',{rim:[16,16,90]});
defFoe('rim',{upd:(e,dt)=>{ e.anim+=dt; e.alert=false; e.mech=true; }});
defFoe('rim',{draw:e=>{ if(e.dead&&e.deadT>0.5) return; const x=Math.round(e.x+e.w/2-cam), y=Math.round(e.y+e.h/2); crystalFx(x,y,'90,220,210',e.anim);
  ctx.fillStyle=e.hitT>0?'#fff':'#5ad8c8'; ctx.beginPath(); ctx.moveTo(x,y-9); ctx.lineTo(x+6,y); ctx.lineTo(x,y+8); ctx.lineTo(x-6,y); ctx.closePath(); ctx.fill(); ctx.fillStyle='#e6d8b0'; ctx.fillRect(x-8,y+7,16,3); }});
defBoss('cascade',{make:()=>{ for(const [tx,row] of [[32,11],[40,8],[48,11]]) summ5('rim',tx,row,'rim'); return {type:'cascade',x:AX()+12*T,y:2*T,w:5*T,h:7*T,hp:1100*D.bhp,max:1100*D.bhp,state:'intro',t:2,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,phase:1,fireT:2,waveT:5,open:0}; }});
defBoss('cascade',{hurt:(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return;
  if(b.state!=='open'){ sparks(b.x+b.w/2+rnd(-20,20),b.y+b.h/2,3,'#e6d8b0'); hint5(b,'Травертинът я пази. Разбий кристалите във вировете!'); return; }
  b.hp-=d; bHit5(b,'#5ad8c8'); if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; showMsg('Каскадата надига езерото!',2); shake=6; } if(b.hp<=0) bossDie(); }});
defBoss('cascade',{upd:dt=>{
  const b=boss, p=player; b.anim+=dt; b.hitT-=dt;
  if(b.dead){ bossDeathFx(b,dt); return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0) b.state='fight'; return; }
  const bcx=b.x+b.w/2, bcy=b.y+b.h/2, pcx=p.x+p.w/2;
  b.x=AX()+12*T+Math.sin(b.anim*0.5)*3*T;
  b.fireT-=dt; if(b.fireT<=0){ b.fireT=b.phase>1?1.4:2.0; const tt=1.3; for(const o of (b.phase>1?[-30,0,30]:[-15,15])){ const tx=pcx+o; bossOrb(bcx,bcy,(tx-bcx)/tt,(p.y+p.h-6-bcy)/tt-0.5*G*tt,{grav:true,dmg:12,r:5,life:5}); } sfxAt('throwG',b); }
  b.waveT-=dt; if(b.waveT<=0){ b.waveT=b.phase>1?3.5:5; for(const s of [-1,1]) ebullets.push({x:bcx,y:15*T-6,vx:s*160*D.bspd,vy:0,life:3,dmg:14,r:6,orb:true}); for(let i=0;i<24;i++) part(bcx+rnd(-40,40),15*T-4,rnd(-80,80),rnd(-160,-40),0.6,'#bff4ee',2,300); sfxAt('stomp',b); }
  if(b.state==='fight'&&!alive5('rim').length){ b.state='open'; b.t=b.phase>1?5:6.5; showMsg('Кожата ѝ се напука!',1.6); shake=5; }
  if(b.state==='open'){ b.open=Math.min(1,b.open+dt*3); b.t-=dt; if(b.t<=0){ b.state='fight'; const pos=b.phase>1?[[32,11],[38,8],[43,8],[48,11]]:[[32,11],[40,8],[48,11]]; for(const [tx,row] of pos) summ5('rim',tx,row,'rim'); } }
  else b.open=Math.max(0,b.open-dt*3);
}});
defBoss('cascade',{draw:()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; const x=Math.round(b.x-cam), y=Math.round(b.y), cx=x+b.w/2; ctx.save(); if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1);
  ctx.globalAlpha*=0.85; ctx.fillStyle=b.hitT>0?'#ffffff':'rgba(90,220,210,0.55)'; ctx.beginPath(); ctx.ellipse(cx,y+b.h*0.55,b.w*0.45,b.h*0.48,0,0,7); ctx.fill();
  ctx.fillStyle='rgba(235,255,250,0.6)'; for(let i=0;i<10;i++){ const yy=y+((b.anim*80+i*23)%b.h); ctx.fillRect(cx-30+i*6,yy,1,8); }
  const sh=1-b.open; ctx.globalAlpha=(b.dead?1-clamp((b.deathT-1.8)/0.8,0,1):1)*Math.max(0.15,sh); ctx.fillStyle='#d8c89e'; for(let i=0;i<6;i++){ ctx.fillRect(cx-28+i*10,y+b.h*0.25+(i%2)*10,9,b.h*0.55); } ctx.globalAlpha=b.dead?1-clamp((b.deathT-1.8)/0.8,0,1):1;
  ctx.fillStyle='#0e3a36'; ctx.fillRect(cx-10,y+18,5,4); ctx.fillRect(cx+5,y+18,5,4); if(b.open>0.3){ crystalFx(cx,y+b.h*0.5,'255,255,255',b.anim); } ctx.restore(); }});

/* ---------- 3. НОЩНИЦАТА ---------- */
defBoss('moth',{make:()=>({type:'moth',x:AX()+13*T,y:3*T,w:70,h:30,hp:950*D.bhp,max:950*D.bhp,state:'intro',t:2,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,phase:1,diveT:4,spawnT:5,tx:0,ty:0})});
defBoss('moth',{hurt:(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return;
  if(!isLit(b.x+b.w/2,b.y+b.h/2)){ for(let i=0;i<3;i++) part(b.x+rnd(b.w),b.y+rnd(b.h),rnd(-40,40),rnd(-40,40),0.4,'#2a2024',2,0); hint5(b,'На тъмно куршумите минават през рояка. Освети я!'); return; }
  b.hp-=d; bHit5(b,'#b8a0d8'); if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; showMsg('Рояк се отделя от нея!',2); shake=6; } if(b.hp<=0) bossDie(); }});
defBoss('moth',{upd:dt=>{
  const b=boss, p=player; b.anim+=dt; b.hitT-=dt;
  if(b.dead){ b.y+=40*dt; bossDeathFx(b,dt); return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0){ b.state='hover'; } return; }
  const pcx=p.x+p.w/2, pcy=p.y+p.h/2, bcx=b.x+b.w/2, bcy=b.y+b.h/2, lit=isLit(bcx,bcy);
  if(b.state==='hover'){ const hx=AX()+(15+Math.sin(b.anim*0.6)*11)*T, hy=3*T+Math.sin(b.anim*1.3)*T; b.x+=(hx-b.w/2-b.x)*Math.min(1,dt*1.5); b.y+=(hy-b.y)*Math.min(1,dt*1.5);
    if(lit){ b.x+=Math.sin(b.anim*9)*40*dt; }
    b.diveT-=dt; if(b.diveT<=0&&!p.dead){ b.state='dive'; b.t=1.1; b.tx=pcx; b.ty=pcy; sfxAt('flyer',b); } }
  else if(b.state==='dive'){ b.t-=dt; const k=Math.min(1,dt*3); b.x+=(b.tx-b.w/2-b.x)*k; b.y+=(b.ty-b.h/2-b.y)*k; if(b.t<=0||lit){ b.state='hover'; b.diveT=(b.phase>1?2.4:3.4)*(lit?1.5:1); } }
  b.spawnT-=dt; if(b.spawnT<=0){ b.spawnT=b.phase>1?3.5:6; if(enemies.filter(e=>!e.dead&&e.type==='bat').length<(b.phase>1?6:3)) for(let i=0;i<2;i++){ const e=makeEnemy('bat',bcx+rnd(-20,20),bcy+10); e.summoned=true; e.alert=true; enemies.push(e); } }
  if(!p.dead&&ov(b,p)){ b.bite=(b.bite||0)-dt; if(b.bite<=0){ b.bite=0.7; hurtPlayer(b.state==='dive'?18:10,sgn(pcx-bcx||1)*200); } }
}});
defBoss('moth',{draw:()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; const x=Math.round(b.x+b.w/2-cam), y=Math.round(b.y+b.h/2), f=Math.sin(b.anim*(b.state==='dive'?16:8)), lit=isLit(b.x+b.w/2,b.y+b.h/2);
  ctx.save(); if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1); else ctx.globalAlpha=lit?1:0.75;
  ctx.fillStyle=b.hitT>0?'#fff':lit?'#4a3a4a':'#1a1418';
  for(const s of [-1,1]){ ctx.beginPath(); ctx.moveTo(x+s*6,y-4); ctx.lineTo(x+s*40,y-14-f*10); ctx.lineTo(x+s*36,y-2); ctx.lineTo(x+s*28,y+6-f*4); ctx.lineTo(x+s*18,y+2); ctx.lineTo(x+s*8,y+8); ctx.closePath(); ctx.fill(); }
  ctx.fillRect(x-7,y-10,14,20); ctx.fillRect(x-6,y-14,4,5); ctx.fillRect(x+2,y-14,4,5);
  ctx.fillStyle='#9aff8a'; ctx.fillRect(x-4,y-7,2,2); ctx.fillRect(x+2,y-7,2,2);
  if(!lit&&!b.dead){ for(let i=0;i<8;i++){ const a=b.anim*3+i; ctx.fillStyle='#14100e'; ctx.fillRect(x+Math.cos(a)*30,y+Math.sin(a*1.3)*16,2,2); } }
  ctx.restore(); }});

/* ---------- 4. ВЪЛЧЕВ ---------- */
const VALCH_POS=[[32.5,12],[40.5,9],[48.5,12]];
defBoss('valchev',{make:()=>({type:'valchev',x:AX()+20*T,y:15*T-30,w:14,h:30,hp:850*D.bhp,max:850*D.bhp,state:'intro',t:2.2,face:-1,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,phase:1,pos:1,fireT:1.4,spawnT:8,act:0})});
defBoss('valchev',{hurt:(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return;
  if(b.state!=='charge'&&b.state!=='stun'){ sparks(b.x+b.w/2+rnd(-8,8),b.y+b.h/2+rnd(-10,10),3,'#9aff8a'); hint5(b,'Щитът го пази. Изчакай да започне да зарежда!'); return; }
  b.hp-=d*(b.state==='stun'?1.3:1); bHit5(b,'#9aff8a'); if(b.state==='charge'&&d>=10){ b.state='stun'; b.t=1.6; showMsg('Ударът е прекъснат!',1.2); }
  if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; vlc('„Охрана! Задръжте доктора!“'); shake=6; } if(b.hp<=0) bossDie(); }});
defBoss('valchev',{upd:dt=>{
  const b=boss, p=player; b.anim+=dt; b.hitT-=dt;
  if(b.dead){ b.y-=50*dt; bossDeathFx(b,dt); return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0){ b.state='idle'; b.t=1.5; } return; }
  const pcx=p.x+p.w/2, pcy=p.y+p.h/2, bcx=b.x+b.w/2, bcy=b.y+b.h/2; b.face=sgn(pcx-bcx)||b.face;
  if(b.state==='idle'){ b.t-=dt; b.fireT-=dt; if(b.fireT<=0){ b.fireT=b.phase>1?0.9:1.3; const a=Math.atan2(pcy-bcy,pcx-bcx); for(const o of (b.phase>1?[-0.15,0,0.15]:[0])) ebullets.push({x:bcx,y:bcy,vx:Math.cos(a+o)*180*D.bspd,vy:Math.sin(a+o)*180*D.bspd,life:4,dmg:12,r:4,orb:true}); sfxAt('flyer',b); }
    if(b.t<=0){ b.act++; if(b.act%2===0){ b.state='charge'; b.t=b.phase>1?1.5:1.9; showMsg('Вълчев зарежда!',1); } else { b.state='blink'; b.t=0.5; } } }
  else if(b.state==='blink'){ b.t-=dt; if(b.t<=0){ let n=b.pos; while(n===b.pos) n=Math.floor(Math.random()*3); b.pos=n; const [tx,row]=VALCH_POS[n]; b.x=AX()+(tx-26)*T-b.w/2; b.y=row*T-b.h; for(let i=0;i<20;i++) part(b.x+b.w/2,b.y+b.h/2,rnd(-80,80),rnd(-80,80),0.5,'#9aff8a',2,0); b.state='idle'; b.t=b.phase>1?1.4:2; } }
  else if(b.state==='charge'){ b.t-=dt; if(Math.random()<dt*20) part(bcx+rnd(-20,20),bcy+rnd(-20,20),(bcx-(bcx+rnd(-20,20)))*2,0,0.3,'#9aff8a',1.5,0);
    if(b.t<=0){ b.state='idle'; b.t=1.6; for(let i=0;i<14;i++){ const a=i/14*6.283; ebullets.push({x:bcx,y:bcy,vx:Math.cos(a)*150*D.bspd,vy:Math.sin(a)*150*D.bspd,life:4,dmg:14,r:5,orb:true}); } shake=6; sfxAt('boom',b); } }
  else if(b.state==='stun'){ b.t-=dt; if(b.t<=0){ b.state='blink'; b.t=0.3; } }
  if(b.phase>1){ b.spawnT-=dt; if(b.spawnT<=0){ b.spawnT=9; if(enemies.filter(e=>!e.dead&&e.type==='agent').length<2) mechSpawn('agent',AX()+(pcx>AX()+15*T?4:24)*T); } }
}});
defBoss('valchev',{draw:()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; begin(b); if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1);
  tint=b.hitT>0?'#fff':null; px(-4,-10,3,10,'#2a2a2e'); px(1,-10,3,10,'#2a2a2e'); px(-6,-24,12,15,'#4a4e52'); px(-6,-24,12,2,'#9aff8a'); px(-2,-20,4,4,'#9aff8a');
  px(-3,-30,7,6,'#e2c8a8'); px(-3,-31,7,2,'#e8e8e8'); px(-2,-28,2,1,'#2a2a2a'); px(1,-28,2,1,'#2a2a2a'); px(-2,-27,5,1,'#8a8a8a'); px(6,-22,6,2,'#4a4e52'); tint=null; ctx.restore();
  if(b.dead) return; const x=Math.round(b.x+b.w/2-cam), y=Math.round(b.y+b.h/2);
  if(b.state==='charge'){ crystalFx(x,y,'120,255,140',b.anim*3); }
  else if(b.state!=='stun'){ ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.strokeStyle=`rgba(150,255,160,${0.35+0.15*Math.sin(b.anim*8)})`; ctx.lineWidth=2; ctx.beginPath(); ctx.ellipse(x,y,15,21,0,0,7); ctx.stroke(); ctx.restore(); ctx.lineWidth=1; } }});

/* ---------- 5. ТРЕТИЯТ РЕЗОНАТОР ---------- */
defBoss('resonator',{make:()=>({type:'resonator',x:AX()+12*T,y:2.5*T,w:5*T,h:5*T,hp:1600*D.bhp,max:1600*D.bhp,state:'intro',t:2.5,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,phase:1,cyc:0,open:0,fireT:2,waveT:6,sleepT:3,mech:true})});
defBoss('resonator',{hurt:(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return;
  if(b.open<0.6){ sparks(b.x+b.w/2+rnd(-20,20),b.y+b.h/2+rnd(-20,20),3,'#3fd0a0'); hint5(b,'Пластините са затворени. Изчакай да се отворят!'); return; }
  b.hp-=d; bHit5(b,'#3fd0a0'); if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; showMsg('Камбаната бие по-бързо!',2); shake=8; } if(b.hp<=0){ for(const s of SLEEPERS) if(s.boss&&!s.ok) wakeSleeper(s); bossDie(); } }});
defBoss('resonator',{upd:dt=>{
  const b=boss, p=player; b.anim+=dt; b.hitT-=dt;
  if(b.dead){ bossDeathFx(b,dt); return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0) b.state='fight'; return; }
  const bcx=b.x+b.w/2, bcy=b.y+b.h/2, pcx=p.x+p.w/2, pcy=p.y+p.h/2;
  b.cyc+=dt; const per=b.phase>1?7:8, openDur=b.phase>1?3:3.5, o=(b.cyc%per)>per-openDur; b.open+=((o?1:0)-b.open)*Math.min(1,dt*5);
  b.fireT-=dt; if(b.fireT<=0){ b.fireT=b.phase>1?1.2:1.7; const n=b.phase>1?10:7, a0=b.anim; for(let i=0;i<n;i++){ const a=a0+i/n*6.283; ebullets.push({x:bcx,y:bcy,vx:Math.cos(a)*120*D.bspd,vy:Math.sin(a)*120*D.bspd,life:4,dmg:10,r:4,orb:true}); } if(AC) osc({type:'sine',f:196,t:0.6,v:0.08}); }
  b.waveT-=dt; if(b.waveT<=0){ b.waveT=b.phase>1?4:6; for(const s of [-1,1]) ebullets.push({x:bcx,y:15*T-6,vx:s*170*D.bspd,vy:0,life:3,dmg:14,r:6,orb:true}); sfxAt('stomp',b); shake=4; }
  // хора в транс вървят към машината и я лекуват
  b.sleepT-=dt; if(b.sleepT<=0&&SLEEPERS.filter(s=>s.boss&&!s.ok).length<(b.phase>1?3:2)){ b.sleepT=b.phase>1?6:8; const left=Math.random()<0.5, tx=left?28:53;
    addSleeper(tx,left?36:45,{boss:true,gone:true,speed:1.1,line:'…какво… къде съм…',onLost:()=>{ if(!b.dead){ b.hp=Math.min(b.max,b.hp+b.max*0.08); showMsg('Машината се храни със съня им! Не ги пускай до нея.',2); for(let i=0;i<20;i++) part(bcx,bcy,rnd(-60,60),rnd(-60,60),0.6,'#3fd0a0',2,0); } }}); }
  if(!p.dead&&ov(b,p)){ b.bite=(b.bite||0)-dt; if(b.bite<=0){ b.bite=0.8; hurtPlayer(14,sgn(pcx-bcx||1)*240); } }
}});
defBoss('resonator',{draw:()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; const cx=Math.round(b.x+b.w/2-cam), cy=Math.round(b.y+b.h/2); ctx.save(); if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1);
  ctx.strokeStyle='#2a3a32'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(cx,0); ctx.lineTo(cx,cy-36); ctx.stroke(); ctx.lineWidth=1;
  ctx.fillStyle=b.hitT>0?'#fff':'#4e5e54'; ctx.beginPath(); ctx.moveTo(cx-18,cy-36); ctx.lineTo(cx+18,cy-36); ctx.lineTo(cx+34,cy+30); ctx.lineTo(cx-34,cy+30); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#2a3630'; ctx.fillRect(cx-36,cy+28,72,6);
  crystalFx(cx,cy,'63,208,160',b.anim); ctx.fillStyle=b.open>0.6?'#ffffff':'#3fd0a0'; ctx.beginPath(); ctx.arc(cx,cy,8+b.open*4,0,7); ctx.fill();
  const o=b.open; for(let i=0;i<4;i++){ const a=b.anim*0.8+i*1.571, r=26+o*22; ctx.save(); ctx.translate(cx+Math.cos(a)*r,cy+Math.sin(a)*r*0.7); ctx.rotate(a); ctx.fillStyle='#6e8274'; ctx.fillRect(-10,-5,20,10); ctx.fillStyle='#3fd0a0'; ctx.fillRect(-8,-1,16,2); ctx.restore(); }
  ctx.restore(); }});
