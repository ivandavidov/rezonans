/* ================= РЕЗОНАНС 7 · БОСОВЕ ================= */
defBosses('intro',{
  syntax:'?SYNTAX ERROR! Поправи трите реда — застани на курсорите и натисни E. Едва тогава грешката става уязвима.',
  snake:'Змията! Уязвима е единствено главата ѝ. Пази се от опашката!',
  dark:'Тъмния! Удряй го само когато сте в една и съща палитра — сменяй я с E.',
  copy:'Копието! Повтаря движенията ти със забавяне. Спри за миг, отдръпни се и стреляй по замръзналата фигура!',
  nula:'Нулата! BREAK сваля защитното ѝ поле. Щом отслабне — активирай RUN на средната платформа!'});
defBosses('name',{syntax:'?SYNTAX ERROR',snake:'ЗМИЯТА',dark:'ТЪМНИЯ',copy:'КОПИЕТО',nula:'НУЛАТА'});
defBosses('col',{syntax:'#8aff9a',snake:'#2ae84a',dark:'#e82ae8',copy:'#ffd84a',nula:'#ffffff'});
defBosses('norm',{syntax:1,snake:1,dark:1,copy:1,nula:0.85});
const ax7=tx=>AX()/T+tx-26;
const bHit7=(b,col)=>{ b.hitT=0.08; sparks(b.x+b.w/2+rnd(-8,8),b.y+b.h/2+rnd(-8,8),4,col); };
const hint7=(b,t)=>{ b.hintT=(b.hintT||0)-1; if(b.hintT<=0){ b.hintT=28; showMsg(t,1.8); } };
const dropBossCursors=()=>{ CURS=CURS.filter(c=>!c.o.boss); };
const bite7=(b,dt,dmg,kx)=>{ const p=player; if(!p.dead&&ov(b,p)){ b.bite=(b.bite||0)-dt; if(b.bite<=0){ b.bite=0.8; hurtPlayer(dmg,kx); p.vy=-170; } } };
const glow7=(x,y,col,r,a)=>{ ctx.save(); ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(x,y,1,x,y,r); g.addColorStop(0,`rgba(${col},${a})`); g.addColorStop(1,`rgba(${col},0)`); ctx.fillStyle=g; ctx.fillRect(x-r,y-r,r*2,r*2); ctx.restore(); };

/* ---------- 1. ?SYNTAX ERROR ---------- */
const SYN_FIX=[[29,14,'FIX 10'],[40,8,'FIX 20'],[52,14,'FIX 30']];
defBoss('syntax',{make:()=>{ dropBossCursors(); for(const [tx,row,l] of SYN_FIX) addCursor('POKE',ax7(tx),row,{label:l,boss:true,syn:1});
  return {type:'syntax',x:AX()+8*T,y:3*T,w:13*10,h:18,hp:700*D.bhp,max:700*D.bhp,state:'intro',t:2,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,phase:1,fireT:1.5,rainT:3,open:0}; }});
defBoss('syntax',{onCmd:c=>{ const b=boss; if(!c.o.syn||b.state==='open') return; const left=CURS.filter(k=>k.o.syn&&!k.done).length; if(left>0) showMsg('Поправен ред. Остават още '+left+'.',1.2);
  else { b.state='open'; b.t=b.phase>1?5:6.5; shake=6; showMsg('Синтаксисът е възстановен — грешката вече е уязвима!',1.6); } }});
defBoss('syntax',{hurt:(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return;
  if(b.state!=='open'){ sparks(b.x+rnd(b.w),b.y+b.h/2,3,'#8aff9a'); hint7(b,'Грешката е неуязвима! Поправи трите реда от курсорите!'); return; }
  b.hp-=d; bHit7(b,'#ffffff'); if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; showMsg('„?SYNTAX ERROR IN EVERYTHING!“',2); shake=6; } if(b.hp<=0){ dropBossCursors(); bossDie(); } }});
defBoss('syntax',{upd:dt=>{
  const b=boss, p=player; b.anim+=dt; b.hitT-=dt;
  if(b.dead){ bossDeathFx(b,dt); return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0) b.state='fight'; return; }
  const pcx=p.x+p.w/2, bcx=b.x+b.w/2;
  if(b.state==='open'){ b.open=Math.min(1,b.open+dt*2); b.y+=(9.5*T-b.y)*Math.min(1,dt*3); b.t-=dt;
    if(b.t<=0){ b.state='fight'; for(const c of CURS) if(c.o.syn) c.done=false; showMsg('Някой отново натрака PRNIT! Грешката се върна!',1.6); } return; }
  b.open=Math.max(0,b.open-dt*2); b.y+=(3*T-b.y)*Math.min(1,dt*2); b.x=AX()+8*T+Math.sin(b.anim*0.6)*7*T;
  b.fireT-=dt; if(b.fireT<=0&&!p.dead){ b.fireT=(b.phase>1?1.1:1.6)*D.rate; const a=Math.atan2(p.y+p.h/2-(b.y+b.h),pcx-bcx); for(const o of (b.phase>1?[-0.2,0,0.2]:[-0.1,0.1])) ebullets.push({x:bcx,y:b.y+b.h,vx:Math.cos(a+o)*170*D.bspd,vy:Math.sin(a+o)*170*D.bspd,life:3,dmg:10,r:4,orb:true}); }
  b.rainT-=dt; if(b.rainT<=0){ b.rainT=b.phase>1?2.6:3.6; for(let i=0;i<(b.phase>1?5:3);i++) bossOrb(b.x+rnd(b.w),b.y+b.h,rnd(-30,30),20,{grav:true,dmg:10,r:4,life:4}); }
}});
defBoss('syntax',{draw:()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; const x=Math.round(b.x-cam), y=Math.round(b.y), t='?SYNTAX ERROR'; ctx.save(); if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1);
  glow7(x+b.w/2,y+9,'120,255,140',70,0.25); ctx.font='700 14px "IBM Plex Mono",monospace';
  for(let i=0;i<t.length;i++){ const o=b.open, dy=o*(Math.sin(i*1.7)*10+8)+Math.sin(b.anim*4+i)*2*(1-o), rot=o*Math.sin(i*2.3)*0.5;
    ctx.save(); ctx.translate(x+i*10+5,y+14+dy); ctx.rotate(rot); ctx.fillStyle=b.hitT>0?'#ffffff':(b.state==='open'?'#ffffff':(Math.floor(b.anim*3+i)%5?'#8aff9a':'#3aff5a')); ctx.fillText(t[i],-4,0); ctx.restore(); }
  ctx.restore(); }});

/* ---------- 2. ЗМИЯТА ---------- */
defBoss('snake',{make:()=>({type:'snake',x:AX()+20*T,y:8*T,w:14,h:14,hp:800*D.bhp,max:800*D.bhp,state:'intro',t:2,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:-1,vy:0,phase:1,trail:[],len:10,turnT:1,growT:6,spitT:3})});
defBoss('snake',{hurt:(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return; b.hp-=d; bHit7(b,'#2ae84a');
  if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; showMsg('Змията ускорява и бълва байтове!',2); shake=6; } if(b.hp<=0) bossDie(); }});
defBoss('snake',{upd:dt=>{
  const b=boss, p=player; b.anim+=dt; b.hitT-=dt;
  if(b.dead){ bossDeathFx(b,dt); if(b.trail.length>0&&Math.random()<0.5){ const s=b.trail.shift(); for(let i=0;i<4;i++) part(s[0],s[1],rnd(-60,60),rnd(-60,60),0.4,'#2ae84a',2,0); } return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0) b.state='fight'; return; }
  const sp=(b.phase>1?150:115)*D.bspd, minX=AX()+T, maxX=AX()+29*T-b.w, minY=3*T, maxY=15*T-b.h;
  b.turnT-=dt; const pcx=p.x+p.w/2, pcy=p.y+p.h/2, hx=b.x+b.w/2, hy=b.y+b.h/2;
  if(b.turnT<=0){ b.turnT=rnd(0.6,1.3); const dx=pcx-hx, dy=pcy-hy; if(b.vx!==0){ b.vx=0; b.vy=Math.abs(dy)>10?sgn(dy):(Math.random()<0.5?-1:1); } else { b.vy=0; b.vx=Math.abs(dx)>10?sgn(dx):(Math.random()<0.5?-1:1); } }
  b.x+=b.vx*sp*dt; b.y+=b.vy*sp*dt;
  if(b.x<minX||b.x>maxX){ b.x=clamp(b.x,minX,maxX); b.vx=0; b.vy=hy>8*T?-1:1; b.turnT=0.5; }
  if(b.y<minY||b.y>maxY){ b.y=clamp(b.y,minY,maxY); b.vy=0; b.vx=hx>AX()+15*T?-1:1; b.turnT=0.5; }
  b.trail.unshift([b.x+b.w/2,b.y+b.h/2]); const maxN=b.len*6; if(b.trail.length>maxN) b.trail.length=maxN;
  b.growT-=dt; if(b.growT<=0){ b.growT=b.phase>1?4:6; b.len=Math.min(26,b.len+2); if(AC) osc({type:'square',f:660,t:0.05,v:0.04}); }
  if(b.phase>1){ b.spitT-=dt; if(b.spitT<=0&&!p.dead){ b.spitT=2; const a=Math.atan2(pcy-hy,pcx-hx); ebullets.push({x:hx,y:hy,vx:Math.cos(a)*180*D.bspd,vy:Math.sin(a)*180*D.bspd,life:3,dmg:10,r:4,orb:true}); } }
  // тялото боли, но не може да се удари
  if(!p.dead){ for(let i=6;i<b.trail.length;i+=6){ const [sx,sy]=b.trail[i]; if(Math.abs(sx-pcx)<10&&Math.abs(sy-pcy)<16){ b.tb=(b.tb||0)-dt; if(b.tb<=0){ b.tb=0.8; hurtPlayer(7,sgn(pcx-sx||1)*160); } break; } } }
  bite7(b,dt,14,sgn(pcx-hx||1)*200);
}});
defBoss('snake',{draw:()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; ctx.save(); if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1);
  for(let i=b.trail.length-1;i>=6;i-=6){ const [sx,sy]=b.trail[i]; ctx.fillStyle=(i/6)%2?'#2ae84a':'#9a3ae8'; ctx.fillRect(Math.round(sx-5-cam),Math.round(sy-5),10,10); ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.fillRect(Math.round(sx-5-cam),Math.round(sy+3),10,2); }
  const x=Math.round(b.x-cam), y=Math.round(b.y); glow7(x+7,y+7,'42,232,74',22,0.4); ctx.fillStyle=b.hitT>0?'#ffffff':'#2ae84a'; ctx.fillRect(x,y,14,14); ctx.fillStyle='#ffffff';
  const ex=b.vx>0?9:b.vx<0?2:5, ey=b.vy>0?9:b.vy<0?2:4; ctx.fillRect(x+ex,y+ey,3,3); ctx.fillRect(x+(b.vy!==0?ex+5:ex),y+(b.vy!==0?ey:ey+5),3,3);
  if(Math.floor(b.anim*6)%2){ ctx.fillStyle='#e82a2a'; ctx.fillRect(x+(b.vx>0?14:b.vx<0?-4:6),y+(b.vy>0?14:b.vy<0?-4:6),4,2); }
  ctx.restore(); }});

/* ---------- 3. ТЪМНИЯ ---------- */
const DARK_POS=[[32.5,12],[40.5,9],[48.5,12],[40.5,15]];
defBoss('dark',{make:()=>{ const a=LVL.arena; if(ERAD) setDoorAll([a.door,a.r0,a.r1],'D'); return {type:'dark',x:AX()+14.5*T-8,y:9*T-30,w:16,h:30,hp:950*D.bhp,max:950*D.bhp,state:'intro',t:2,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,phase:1,pal:1,palT:7,pos:1,fireT:1.4,tpT:3,sumT:8}; }});
const darkVuln=b=>ERAD?ERA===b.pal:b.pal===0;
defBoss('dark',{hurt:(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return;
  if(!darkVuln(b)){ for(let i=0;i<3;i++) part(b.x+rnd(b.w),b.y+rnd(b.h),rnd(-40,40),rnd(-40,40),0.4,'#555555',2,0); hint7(b,ERAD?'Не сте в една палитра! Превключи с E.':'Изчакай да смени цвета си!'); return; }
  b.hp-=d; bHit7(b,'#ffffff'); if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; showMsg('Тъмния сменя цветовете все по-бясно!',2); shake=6; } if(b.hp<=0) bossDie(); }});
defBoss('dark',{upd:dt=>{
  const b=boss, p=player, a=LVL.arena; b.anim+=dt; b.hitT-=dt;
  if(b.dead){ bossDeathFx(b,dt); if(ERAD&&b.exitDone&&!b.allOpen){ b.allOpen=true; setDoorAll(a.exitDoor,'.'); } return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0) b.state='fight'; return; }
  const pcx=p.x+p.w/2, pcy=p.y+p.h/2, bcx=b.x+b.w/2, bcy=b.y+b.h/2;
  b.palT-=dt; if(b.palT<=0){ b.palT=b.phase>1?5:7; b.pal=1-b.pal; for(let i=0;i<20;i++) part(bcx,bcy,rnd(-90,90),rnd(-90,90),0.5,b.pal?'#2ab82a':'#2ae8e8',2,0); if(AC) osc({type:'square',f:b.pal?330:494,t:0.12,v:0.06}); }
  b.tpT-=dt; if(b.tpT<=0){ b.tpT=b.phase>1?2.2:3; let n=b.pos; while(n===b.pos) n=Math.floor(Math.random()*4); b.pos=n; const [tx,row]=DARK_POS[n]; b.x=AX()+(tx-26)*T-b.w/2; b.y=row*T-b.h; for(let i=0;i<14;i++) part(b.x+b.w/2,b.y+b.h/2,rnd(-70,70),rnd(-70,70),0.5,'#e82ae8',2,0); }
  b.fireT-=dt; if(b.fireT<=0&&!p.dead){ b.fireT=(b.phase>1?1.1:1.5)*D.rate; const an=Math.atan2(pcy-bcy,pcx-bcx); for(const o of (b.phase>1?[-0.25,0,0.25]:[-0.12,0.12])) ebullets.push({x:bcx,y:bcy,vx:Math.cos(an+o)*175*D.bspd,vy:Math.sin(an+o)*175*D.bspd,life:3,dmg:11,r:4,orb:true}); sfxAt('flyer',b); }
  if(b.phase>1){ b.sumT-=dt; if(b.sumT<=0){ b.sumT=8; if(enemies.filter(e=>!e.dead&&e.type==='packet').length<3) for(let i=0;i<2;i++){ const e=makeEnemy('packet',bcx+rnd(-20,20),bcy); e.summoned=true; e.alert=true; enemies.push(e); } } }
  bite7(b,dt,10,sgn(pcx-bcx||1)*200);
}});
defBoss('dark',{draw:()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; const v=darkVuln(b), x=Math.round(b.x+b.w/2-cam), y=Math.round(b.y), cA=b.pal?'#2ab82a':'#2ae8e8', cB=b.pal?'#d83a2a':'#e82ae8'; ctx.save(); ctx.globalAlpha=(b.dead?1-clamp((b.deathT-1.8)/0.8,0,1):1)*(v?1:0.35);
  glow7(x,y+15,b.pal?'42,184,42':'42,232,232',30,v?0.4:0.15);
  ctx.fillStyle=b.hitT>0?'#ffffff':'#0a0a0a'; ctx.beginPath(); ctx.moveTo(x-9,y+30); ctx.lineTo(x-7,y+6); ctx.lineTo(x,y); ctx.lineTo(x+7,y+6); ctx.lineTo(x+9,y+30); for(let i=0;i<4;i++) ctx.lineTo(x+9-i*6,y+26+(i%2)*4); ctx.closePath(); ctx.fill();
  ctx.strokeStyle=cA; ctx.lineWidth=1; ctx.stroke(); ctx.fillStyle=cB; ctx.fillRect(x-4,y+8,3,2); ctx.fillRect(x+1,y+8,3,2);
  if(b.palT<1&&Math.floor(b.anim*10)%2){ ctx.fillStyle='#ffffff'; ctx.fillRect(x-1,y-6,2,3); } ctx.restore(); }});

/* ---------- 4. КОПИЕТО ---------- */
defBoss('copy',{make:()=>({type:'copy',x:AX()+24*T,y:15*T-26,w:10,h:26,hp:800*D.bhp,max:800*D.bhp,state:'intro',t:2,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,phase:1,buf:[],still:0,frozen:0,face:-1,fireT:2,sumT:9,f:null})});
defBoss('copy',{hurt:(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return;
  if(b.still<0.3){ sparks(b.x+5,b.y+13,2,'#ffd84a'); hint7(b,'Копието е неуловимо в движение! Спри за миг — и то ще замръзне.'); return; }
  b.hp-=d*1.1; bHit7(b,'#ffd84a'); if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; showMsg('Копието наваксва! Закъснението става все по-малко!',2); shake=6; } if(b.hp<=0) bossDie(); }});
defBoss('copy',{upd:dt=>{
  const b=boss, p=player; b.anim+=dt; b.hitT-=dt;
  if(b.dead){ bossDeathFx(b,dt); return; }
  b.buf.push({x:p.x,y:p.y,h:p.h,face:p.face,crouch:p.crouch,aimUp:p.aimUp,anim:p.anim,onGround:p.onGround,climb:p.climb,vx:p.vx,vy:p.vy,cur:p.cur});
  const delay=Math.round((b.phase>1?1.0:1.5)*60); if(!(b.frozen>0)) while(b.buf.length>delay+1) b.buf.shift(); else if(b.buf.length>600) b.buf.shift();
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0) b.state='fight'; return; }
  if(b.buf.length<delay) return;
  if(b.frozen>0){ b.frozen-=dt; b.still=1; if(b.frozen<=0){ b.still=0; b.buf=b.buf.slice(-delay); for(let i=0;i<14;i++) part(b.x+5,b.y+13,rnd(-70,70),rnd(-70,70),0.4,'#ffd84a',2,0); } }
  else { while(b.buf.length>delay+1) b.buf.shift(); const f=b.buf[0], moved=Math.hypot(f.x-b.x,f.y-b.y); b.f=f; b.x=f.x; b.y=f.y; b.face=f.face; b.still=moved<0.6?b.still+dt:0;
    if(b.still>=0.3){ b.frozen=b.phase>1?2:2.6; if(AC) osc({type:'square',f:220,t:0.2,v:0.05}); } }
  const pcx=p.x+p.w/2, pcy=p.y+p.h/2;
  b.fireT-=dt; if(b.fireT<=0&&!p.dead&&b.still<0.3){ b.fireT=(b.phase>1?1.2:1.7)*D.rate; const a=Math.atan2(pcy-(b.y+12),pcx-(b.x+5)); ebullets.push({x:b.x+5,y:b.y+12,vx:Math.cos(a)*180*D.bspd,vy:Math.sin(a)*180*D.bspd,life:3,dmg:10,r:4,orb:true}); }
  if(b.phase>1){ b.sumT-=dt; if(b.sumT<=0){ b.sumT=9; if(enemies.filter(e=>!e.dead&&e.type==='bug').length<3) mechSpawn('bug',AX()+(pcx>AX()+15*T?4:25)*T); } }
  if(b.still<0.3) bite7(b,dt,8,sgn(pcx-(b.x+5)||1)*200);
}});
defBoss('copy',{draw:()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; const f=b.f; const fr=b.still>=0.3;
  const x=Math.round(b.x+5-cam), y=Math.round(b.y+13); glow7(x,y,fr?'255,255,255':'255,216,74',fr?26:20,fr?0.5:0.3);
  if(f){ const save=player; player=Object.assign({},save,f,{inv:0,hurtT:0,dead:false,flashT:0,swingT:0,reload:0}); ctx.save(); ctx.globalAlpha=b.dead?Math.max(0,1-b.deathT/2):(fr?0.95:0.6); drawPlayer(); ctx.restore(); player=save; }
  if(fr&&!b.dead&&Math.floor(b.anim*4)%2){ ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='#ffffff'; ctx.textAlign='center'; ctx.fillText('BUFFER EMPTY',x,Math.round(b.y)-6); ctx.textAlign='left'; } }});

/* ---------- 5. НУЛАТА ---------- */
defBoss('nula',{make:()=>{ dropBossCursors(); for(const tx of [29,52]) addCursor('BREAK',ax7(tx),14,{label:'BREAK',boss:true,r:10,t:4,cd:8});
  return {type:'nula',x:AX()+13*T,y:2*T,w:4*T,h:4*T,hp:1500*D.bhp,max:1500*D.bhp,state:'intro',t:2.5,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,phase:1,shield:1,openT:0,fireT:2,aimT:4,sumT:8,mech:true}; }});
defBoss('nula',{onCmd:c=>{ const b=boss; if(c.cmd==='BREAK'&&b.phase<3){ b.openT=b.phase>1?3.6:4.5; showMsg('BREAK! Защитният щит падна!',1.2); for(let i=0;i<30;i++) part(b.x+b.w/2,b.y+b.h/2,rnd(-120,120),rnd(-120,120),0.6,'#ffffff',2,0); }
  if(c.cmd==='RUN'&&b.phase===3){ b.hp-=b.max*0.105; b.hitT=0.3; shake=10; flash=0.6; flashCol='#8aff9a'; showMsg(b.hp>0?'Програмата на МИРА се изпълнява… давай пак!':'RUN!',1.4); if(b.hp<=0){ dropBossCursors(); bossDie(); } } }});
defBoss('nula',{hurt:(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return;
  if(b.phase===3){ sparks(b.x+b.w/2+rnd(-20,20),b.y+b.h/2,3,'#ffffff'); hint7(b,'Куршумите вече не помагат! RUN — на средната платформа!'); return; }
  if(b.shield>0.4){ sparks(b.x+b.w/2+rnd(-24,24),b.y+b.h/2+rnd(-24,24),3,'#c0c0c0'); hint7(b,'Щитът е непокътнат! Задействай курсора BREAK!'); return; }
  b.hp-=d; bHit7(b,'#ffffff');
  if(b.phase===1&&b.hp<b.max*0.6){ b.phase=2; showMsg('„Аз съм нищото. И нищото поглъща всичко!“',2); shake=8; }
  if(b.phase===2&&b.hp<b.max*0.3){ b.hp=b.max*0.3; b.phase=3; b.openT=0; shake=10; addCursor('RUN',ax7(40),8,{label:'RUN',boss:true,cd:3.5}); showMsg('МИРА: „Програмата ми е готова! Активирай RUN на средната платформа!“',2.6); } }});
defBoss('nula',{upd:dt=>{
  const b=boss, p=player; b.anim+=dt; b.hitT-=dt;
  if(b.dead){ bossDeathFx(b,dt); return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0) b.state='fight'; return; }
  const bcx=b.x+b.w/2, bcy=b.y+b.h/2, pcx=p.x+p.w/2, pcy=p.y+p.h/2;
  b.x=AX()+13*T+Math.sin(b.anim*0.45)*8*T; b.y=2*T+Math.sin(b.anim*0.9)*T*0.7;
  b.openT=Math.max(0,b.openT-dt); b.shield+=(((b.openT>0&&b.phase<3)?0:1)-b.shield)*Math.min(1,dt*6);
  b.fireT-=dt; if(b.fireT<=0){ b.fireT=(b.phase>2?1.5:b.phase>1?1.3:1.7)*D.rate; const n=b.phase>1?10:8, a0=b.anim*0.6; for(let i=0;i<n;i++){ const a=a0+i/n*6.283; ebullets.push({x:bcx,y:bcy,vx:Math.cos(a)*110*D.bspd,vy:Math.sin(a)*110*D.bspd,life:4,dmg:10,r:4,orb:true}); } if(AC) osc({type:'square',f:110,t:0.2,v:0.05}); }
  b.aimT-=dt; if(b.aimT<=0&&!p.dead){ b.aimT=b.phase>1?3:4.2; const a=Math.atan2(pcy-bcy,pcx-bcx); for(let i=0;i<5;i++) ebullets.push({x:bcx,y:bcy,vx:Math.cos(a)*(150+i*30)*D.bspd,vy:Math.sin(a)*(150+i*30)*D.bspd,life:3,dmg:11,r:5,orb:true}); }
  if(b.phase>1){ b.sumT-=dt; if(b.sumT<=0){ b.sumT=b.phase>2?7:10; if(enemies.filter(e=>!e.dead&&e.type==='popup').length<2) mechSpawn('popup',AX()+(pcx>AX()+15*T?5:24)*T); } }
}});
defBoss('nula',{draw:()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; const cx=Math.round(b.x+b.w/2-cam), cy=Math.round(b.y+b.h/2), k=b.dead?Math.max(0.05,1-b.deathT/2):1; ctx.save(); if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1);
  glow7(cx,cy,'255,255,255',50*k,0.25);
  ctx.strokeStyle=b.hitT>0?'#8aff9a':'#ffffff'; ctx.lineWidth=Math.max(1,9*k); ctx.beginPath(); ctx.ellipse(cx,cy,22*k,30*k,0,0,7); ctx.stroke(); ctx.lineWidth=1;
  ctx.fillStyle='#000000'; ctx.beginPath(); ctx.ellipse(cx,cy,15*k,23*k,0,0,7); ctx.fill();
  if(b.dead){ ctx.fillStyle='#8aff9a'; ctx.fillRect(cx-1,cy-8,3,16); ctx.fillRect(cx-3,cy-6,2,2); }
  else { ctx.fillStyle='#ffffff'; ctx.fillRect(cx-6,cy-4,3,3); ctx.fillRect(cx+3,cy-4,3,3); }
  if(b.shield>0.05&&!b.dead){ ctx.globalCompositeOperation='lighter'; ctx.strokeStyle=`rgba(192,192,192,${0.6*b.shield})`; ctx.setLineDash([4,3]); ctx.lineWidth=2; ctx.strokeRect(cx-36,cy-42,72,84); ctx.setLineDash([]); ctx.lineWidth=1; }
  ctx.restore(); }});
