/* ================= РЕЗОНАНС 3 · БОСОВЕ ================= */
Object.assign(R2B.intro,{
  wolf:'Вълкът! Брониран е отвсякъде. Накарай го да се блъсне в стената — тогава ядрото му е открито.',
  beacon:'Прожекторът! Унищожи трите захранващи възела. Когато лъчът те търси, се крий зад бетона.',
  mirror:'Ехото! То повтаря движенията ти със закъснение. Не стой на едно място.',
  stalker:'Ловецът! Вижда само звука. Стреляй и се мести — когато не те намери, е уязвим.',
  fork:'Камертонът! Удряй кристалите на зъбите. Прескачай вълните по пода.'});
Object.assign(R2B.name,{wolf:'ВЪЛКЪТ',beacon:'ПРОЖЕКТОРЪТ',mirror:'ЕХОТО',stalker:'ЛОВЕЦЪТ НА ЧЕСТОТИ',fork:'КАМЕРТОНЪТ'});
Object.assign(R2B.col,{wolf:'#ffb04a',beacon:'#fff0b0',mirror:'#ff3b4f',stalker:'#c86aff',fork:'#ffffff'});
Object.assign(BOSS_NORM,{wolf:1,beacon:1,mirror:1,stalker:1,fork:0.85});
const bHitFx=(b,col)=>{ b.hitT=0.08; sparks(b.x+b.w/2+rnd(-10,10),b.y+b.h/2+rnd(-10,10),4,col); };

/* ---------- 1. ВЪЛКЪТ ---------- */
R2B.make.wolf=()=>({type:'wolf',x:AX()+20*T,y:15*T-34,w:58,h:34,hp:900*D.bhp,max:900*D.bhp,state:'intro',t:2,face:-1,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,phase:1,vol:0,hintT:0});
R2B.hurt.wolf=(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return;
  if(b.state==='stun'){ b.hp-=d*1.25; bHitFx(b,'#ffb04a'); } else { b.hp-=d*0.12; sparks(b.x+b.w/2+rnd(-14,14),b.y+rnd(4,20),2,'#c8c8c8'); b.hintT-=1; if(b.hintT<=0){ b.hintT=30; showMsg('Бронята е твърде дебела. Накарай го да се блъсне в стената!',1.8); } }
  if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; showMsg('Вълкът превключва на пълна мощност!',2); shake=8; }
  if(b.hp<=0) bossDie(); };
R2B.upd.wolf=dt=>{
  const b=boss, p=player; b.anim+=dt; b.hitT-=dt;
  if(b.dead){ bossDeathFx(b,dt); return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0){ b.state='aim'; b.t=1; } return; }
  const pcx=p.x+p.w/2, bcx=b.x+b.w/2, minX=AX()+T, maxX=AX()+29*T-b.w, sp=(b.phase>1?330:260)*D.bspd;
  if(b.state==='aim'){ b.face=sgn(pcx-bcx)||b.face; b.t-=dt; if(b.t<=0){ b.state='charge'; sfxAt('charge',b); } }
  else if(b.state==='charge'){ b.x+=b.face*sp*dt; if(Math.random()<0.6) part(b.x+(b.face>0?0:b.w),15*T-2,-b.face*rnd(40,120),rnd(-60,-10),0.3,'#ffd080',1.5,300);
    if(b.x<=minX||b.x>=maxX){ b.x=clamp(b.x,minX,maxX); b.state='stun'; b.t=b.phase>1?1.7:2.3; shake=10; sfxAt('stomp',b); for(let i=0;i<20;i++) part(b.face>0?b.x+b.w:b.x,b.y+rnd(b.h),-b.face*rnd(20,120),rnd(-120,20),0.6,'#c8c8c8',2,300); } }
  else if(b.state==='stun'){ b.t-=dt; if(b.t<=0){ b.vol++; if(b.vol%2===0||b.phase>1){ b.state='volley'; b.t=0.5; b.n=b.phase>1?5:3; } else { b.state='aim'; b.t=b.phase>1?0.6:0.9; } } }
  else if(b.state==='volley'){ b.t-=dt; if(b.t<=0&&b.n>0){ b.n--; b.t=0.22; const hx=bcx, hy=b.y+4, tt=0.9, tx=pcx+rnd(-30,30); bossOrb(hx,hy,(tx-hx)/tt,(p.y+p.h-6-hy)/tt-0.5*G*tt,{dmg:12,r:5,grav:true,red:true}); sfxAt('pistol',b); } if(b.n<=0&&b.t<=0){ b.state='aim'; b.t=0.8; } }
  if(!p.dead&&ov(b,p)){ b.bite=(b.bite||0)-dt; if(b.bite<=0){ b.bite=0.9; hurtPlayer(b.state==='charge'?24:10,sgn(pcx-bcx||1)*260); p.vy=-200; } }
};
R2B.draw.wolf=()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; const x=Math.round(b.x-cam), y=Math.round(b.y), f=b.face; ctx.save(); if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1);
  const c=b.hitT>0?'#ffffff':'#3a3e46'; ctx.fillStyle=c; ctx.fillRect(x,y+8,b.w,b.h-14); ctx.fillStyle='#22262c'; ctx.fillRect(x,y+b.h-8,b.w,8);
  for(let i=0;i<5;i++){ ctx.fillStyle='#14161a'; ctx.beginPath(); ctx.arc(x+6+i*11.5,y+b.h-4,4,0,7); ctx.fill(); }
  ctx.fillStyle='#4a505a'; ctx.fillRect(x+6,y,b.w-12,10); ctx.fillStyle='#c9a21c'; ctx.fillRect(x,y+18,b.w,3);
  const nx=f>0?x+b.w-6:x; ctx.fillStyle='#2a2e34'; ctx.fillRect(nx,y+6,6,b.h-14);
  ctx.save(); ctx.globalCompositeOperation='lighter'; for(const hy of [y+12,y+24]){ const hx=f>0?x+b.w:x; const g=ctx.createRadialGradient(hx,hy,1,hx,hy,26); g.addColorStop(0,b.state==='aim'?'rgba(255,80,60,0.95)':'rgba(255,240,200,0.9)'); g.addColorStop(1,'rgba(255,240,200,0)'); ctx.fillStyle=g; ctx.fillRect(hx-26,hy-26,52,52); } ctx.restore();
  if(b.state==='stun'){ const cx=x+b.w/2; ctx.fillStyle=Math.floor(titleT*10)%2?'#ffb04a':'#ff3b4f'; ctx.fillRect(cx-6,y+10,12,8); ctx.fillStyle='#fff0c0'; ctx.fillRect(cx-3,y+12,6,4); }
  ctx.fillStyle='#e8e8e8'; ctx.font='600 5px "IBM Plex Mono",monospace'; ctx.fillText('К-77',x+10,y+30); ctx.restore(); };

/* ---------- 2. ПРОЖЕКТОРЪТ ---------- */
R2B.make.beacon=()=>{ const ax=AX(); const nodes=[]; for(const [tx,row] of [[33,12],[37,9],[44,9]]){ const e=makeEnemy('node',(tx)*T+8,(row+1)*T); e.summoned=true; e.tag='bnode'; enemies.push(e); nodes.push(e); }
  return {type:'beacon',x:ax+25*T,y:3*T,w:3*T,h:12*T,hp:1000*D.bhp,max:1000*D.bhp,state:'intro',t:2,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,phase:1,ang:2.3,seen:0,fireT:0,spawnT:9,hintT:0}; };
R2B.hurt.beacon=(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return; const alive=enemies.some(e=>e.tag==='bnode'&&!e.dead);
  if(alive){ sparks(b.x+b.w/2+rnd(-8,8),b.y+20+rnd(-8,8),3,'#9fd8ff'); b.hintT-=1; if(b.hintT<=0){ b.hintT=30; showMsg('Щитът е активен — първо унищожи възлите!',1.8); } return; }
  b.hp-=d; bHitFx(b,'#fff0b0'); if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; showMsg('Кулата насочва и втория прожектор!',2); shake=8; } if(b.hp<=0) bossDie(); };
R2B.upd.beacon=dt=>{
  const b=boss, p=player; b.anim+=dt; b.hitT-=dt;
  if(b.dead){ bossDeathFx(b,dt); return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0) b.state='fight'; return; }
  const lx=b.x+b.w/2, ly=b.y+14, pcx=p.x+p.w/2, pcy=p.y+p.h/2, beams=b.phase>1?2:1;
  b.seen=Math.max(0,b.seen-dt*0.5); let spotted=false;
  for(let k=0;k<beams;k++){ const a=2.25+Math.sin(b.anim*(0.7+k*0.35)+k*2)*0.75; b['a'+k]=a; const ang=Math.atan2(pcy-ly,pcx-lx); let diff=Math.abs(((ang-a+Math.PI*3)%(Math.PI*2))-Math.PI);
    if(!p.dead&&diff<0.16&&los(lx,ly,pcx,pcy)) spotted=true; }
  if(spotted){ b.seen+=dt*1.6; } b.fireT-=dt;
  if(b.seen>0.6&&b.fireT<=0){ b.fireT=b.phase>1?1.1:1.6; b.seen=0.2; const dx=pcx-lx, dy=pcy-ly, d=Math.hypot(dx,dy)||1; bossOrb(lx,ly,dx/d*240*D.bspd,dy/d*240*D.bspd,{dmg:22,r:7,red:true}); sfxAt('charge',b); shake=3; }
  b.spawnT-=dt; if(b.spawnT<=0){ b.spawnT=b.phase>1?7:10; if(enemies.filter(e=>!e.dead&&e.type==='soldier').length<3) mechSpawn('soldier',AX()+rnd(4,22)*T); }
};
R2B.draw.beacon=()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; const x=Math.round(b.x-cam), y=b.y; ctx.save(); if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1);
  ctx.fillStyle='#2e353c'; ctx.fillRect(x+10,y+20,b.w-20,b.h-20); ctx.fillStyle='#4a545c'; for(let yy=y+28;yy<y+b.h;yy+=16) ctx.fillRect(x+10,yy,b.w-20,2);
  ctx.fillStyle=b.hitT>0?'#ffffff':'#3a4248'; ctx.fillRect(x,y,b.w,22); const shield=enemies.some(e=>e.tag==='bnode'&&!e.dead);
  if(shield){ ctx.strokeStyle=`rgba(140,210,255,${0.4+0.3*Math.sin(titleT*6)})`; ctx.lineWidth=2; ctx.strokeRect(x-3,y-3,b.w+6,28); ctx.lineWidth=1; }
  const lx=x+b.w/2, ly=y+14; ctx.save(); ctx.globalCompositeOperation='lighter';
  for(let k=0;k<(b.phase>1?2:1);k++){ const a=b['a'+k]||2.3, len=22*T, hot=b.seen>0.3; const g=ctx.createRadialGradient(lx,ly,4,lx,ly,len); g.addColorStop(0,hot?'rgba(255,80,70,0.4)':'rgba(255,246,210,0.3)'); g.addColorStop(1,'rgba(255,246,210,0)'); ctx.fillStyle=g;
    ctx.beginPath(); ctx.moveTo(lx,ly); for(let i=0;i<=8;i++){ const aa=a-0.16+i*0.04; let r=0; for(;r<len;r+=6){ if(solidAt(b.x+b.w/2+Math.cos(aa)*r,ly+Math.sin(aa)*r)) break; } ctx.lineTo(lx+Math.cos(aa)*r,ly+Math.sin(aa)*r); } ctx.closePath(); ctx.fill(); }
  ctx.restore(); ctx.fillStyle='#fff6d0'; ctx.fillRect(lx-5,ly-4,10,8); ctx.restore(); };
Object.assign(DIMS,{node:[18,18,120]});
R2UPD.node=(e,dt)=>{ e.anim+=dt; e.alert=false; e.mech=true; };
R2DRAW.node=e=>{ if(e.dead&&e.deadT>0.6) return; begin(e,false); tint=e.hitT>0?'#fff':null; px(-9,-18,18,18,'#2a3238'); px(-9,-18,18,2,'#5a646c'); px(-5,-14,10,10,e.dead?'#1a1a1a':(Math.floor(titleT*4)%2?'#8fd8ff':'#3a8ab0')); px(-1,-22,2,4,'#5a646c'); tint=null; ctx.restore(); };

/* ---------- 3. ЕХОТО ---------- */
R2B.make.mirror=()=>{ MST.hist=[]; return {type:'mirror',x:AX()+22*T,y:15*T-26,w:12,h:26,hp:700*D.bhp,max:700*D.bhp,state:'intro',t:2,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,phase:1,fireT:1.4,fakes:[],face:-1}; };
R2B.hurt.mirror=(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return; b.hp-=d; bHitFx(b,'#ff3b4f');
  if(b.phase===1&&b.hp<b.max*0.66){ b.phase=2; b.fakes=[1.0]; showMsg('Ехото се раздвоява!',1.8); shake=6; }
  else if(b.phase===2&&b.hp<b.max*0.33){ b.phase=3; b.fakes=[0.7,2.2]; showMsg('Колко са?!',1.5); shake=6; }
  if(b.hp<=0) bossDie(); };
R2B.upd.mirror=dt=>{
  const b=boss, p=player; b.anim+=dt; b.hitT-=dt; const H_=MST.hist||(MST.hist=[]);
  H_.push({x:p.x,y:p.y,h:p.h,face:p.face,crouch:p.crouch,aimUp:p.aimUp,anim:p.anim,onGround:p.onGround,vx:p.vx,cur:p.cur}); if(H_.length>240) H_.shift();
  if(b.dead){ bossDeathFx(b,dt); return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0) b.state='fight'; return; }
  const delay=b.phase===1?1.4:b.phase===2?1.2:1.0, k=Math.max(0,H_.length-1-Math.round(delay*60)), f=H_[k];
  if(f){ b.x+=(f.x-b.x)*Math.min(1,dt*10); b.y+=(f.y+f.h-26-b.y)*Math.min(1,dt*10); b.face=sgn(p.x-b.x)||b.face; b.pose=f; }
  b.fireT-=dt; if(b.fireT<=0&&!p.dead){ b.fireT=(b.phase>2?0.8:1.1)*D.rate; const ox=b.x+6, oy=b.y+10, dx=p.x+p.w/2-ox, dy=p.y+p.h/2-oy, d=Math.hypot(dx,dy)||1; bossOrb(ox,oy,dx/d*200*D.bspd,dy/d*200*D.bspd,{dmg:9,r:3,red:true}); sfxAt('pistol',b); }
  if(!p.dead&&ov(b,p)){ b.bite=(b.bite||0)-dt; if(b.bite<=0){ b.bite=0.8; hurtPlayer(10,sgn(p.x-b.x||1)*200); } }
};
R2B.draw.mirror=()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; const H_=MST.hist||[];
  const draw=(f,alpha,real)=>{ if(!f) return; const save=player; player=Object.assign({},save,f,{x:f.x,y:f.y,inv:0,hurtT:real&&b.hitT>0?0.1:0,dead:false,flashT:0,swingT:0,reload:0,face:sgn(save.x-f.x)||1});
    ctx.save(); ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(f.x+5-cam,f.y+13,2,f.x+5-cam,f.y+13,24); g.addColorStop(0,`rgba(255,40,70,${real?0.5:0.25})`); g.addColorStop(1,'rgba(255,40,70,0)'); ctx.fillStyle=g; ctx.fillRect(f.x-20-cam,f.y-12,50,50); ctx.restore();
    ctx.save(); ctx.globalAlpha=alpha*(b.dead?1-clamp((b.deathT-1.6)/0.8,0,1):1); drawPlayer(); ctx.restore(); player=save; };
  for(const dl of b.fakes){ const k=Math.max(0,H_.length-1-Math.round(dl*60)); draw(H_[k],0.35+0.15*Math.sin(titleT*20),false); }
  draw({...(b.pose||{}),x:b.x,y:b.y,h:26},0.8,true); };

/* ---------- 4. ЛОВЕЦЪТ НА ЧЕСТОТИ ---------- */
R2B.make.stalker=()=>({type:'stalker',x:AX()+18*T,y:15*T-40,w:64,h:40,hp:800*D.bhp,max:800*D.bhp,state:'intro',t:2,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,phase:1,face:-1,tx:0,lastT:-1,confT:0,hintT:0});
R2B.hurt.stalker=(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return;
  if(b.state==='confused'){ b.hp-=d*1.3; bHitFx(b,'#c86aff'); } else { b.hp-=d*0.1; sparks(b.x+b.w/2+rnd(-14,14),b.y+rnd(6,30),2,'#7a5a8a'); b.hintT-=1; if(b.hintT<=0){ b.hintT=30; showMsg('Козината му спира куршумите. Удряй, когато е объркан!',1.8); } }
  if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; showMsg('Ловецът чува и стъпките ти!',2); shake=8; } if(b.hp<=0) bossDie(); };
R2B.upd.stalker=dt=>{
  const b=boss, p=player; b.anim+=dt; b.hitT-=dt;
  if(b.dead){ bossDeathFx(b,dt); return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0){ b.state='wander'; b.t=2; } return; }
  const minX=AX()+T, maxX=AX()+29*T-b.w, bcx=b.x+b.w/2, pcx=p.x+p.w/2;
  const N=NOISE[NOISE.length-1], fresh=N&&N.t>b.lastT&&lvT-N.t<0.3;
  if(b.phase>1&&!p.dead&&p.onGround&&Math.abs(p.vx)>60&&Math.abs(pcx-bcx)<5*T&&b.state==='wander') { b.state='hunt'; b.tx=pcx; sfxAt('roar',b); }
  if(fresh&&b.state!=='confused'&&b.state!=='hunt'){ b.lastT=N.t; b.state='hunt'; b.tx=N.x; sfxAt('roar',b); }
  if(b.state==='wander'){ b.t-=dt; if(b.t<=0){ b.t=rnd(1.5,3); b.face=Math.random()<0.5?-1:1; } b.x=clamp(b.x+b.face*40*dt,minX,maxX); if(b.x<=minX||b.x>=maxX) b.face=-b.face; }
  else if(b.state==='hunt'){ const dx=b.tx-bcx; b.face=sgn(dx)||b.face; const sp=(b.phase>1?340:290)*D.bspd; b.x=clamp(b.x+sgn(dx)*Math.min(Math.abs(dx),sp*dt),minX,maxX);
    if(Math.abs(b.tx-(b.x+b.w/2))<8||b.x<=minX||b.x>=maxX){ if(!p.dead&&Math.abs(pcx-(b.x+b.w/2))<44&&p.y+p.h>b.y-10){ b.state='wander'; b.t=0.6; } else { b.state='confused'; b.t=b.phase>1?2.2:2.8; b.confT=lvT; showMsg('Ловецът е объркан!',1); } } }
  else if(b.state==='confused'){ b.t-=dt; if(b.t<=0){ b.state='wander'; b.t=0.5; const M=NOISE[NOISE.length-1]; if(M&&M.t>b.confT){ b.state='hunt'; b.tx=M.x; b.lastT=M.t; } } }
  if(!p.dead&&ov(b,p)&&b.state!=='confused'){ b.bite=(b.bite||0)-dt; if(b.bite<=0){ b.bite=1; hurtPlayer(b.state==='hunt'?28:12,sgn(pcx-bcx||1)*280); p.vy=-220; } }
};
R2B.draw.stalker=()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; const x=Math.round(b.x-cam), y=Math.round(b.y), f=b.face, conf=b.state==='confused'; ctx.save(); if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1);
  const body=b.hitT>0?'#ffffff':conf?'#6a3a8a':'#2a1a34'; const leg=Math.sin(b.anim*(b.state==='hunt'?18:6))*3;
  ctx.fillStyle='#1a0e22'; for(let i=0;i<4;i++) ctx.fillRect(x+8+i*14,y+28+(i%2?leg:-leg),5,12-(i%2?leg:-leg));
  ctx.fillStyle=body; ctx.beginPath(); ctx.ellipse(x+b.w/2,y+20,b.w/2,16,0,0,7); ctx.fill();
  const hx=f>0?x+b.w-6:x+6; ctx.beginPath(); ctx.ellipse(hx,y+16,13,11,0,0,7); ctx.fill();
  ctx.fillStyle='#e8d0f0'; for(let i=0;i<4;i++) ctx.fillRect(hx+(f>0?2:-6)+i*(f>0?1:-1),y+20+i*1.5,2,4);
  for(let i=0;i<3;i++){ ctx.strokeStyle=conf?`rgba(220,160,255,${0.5+0.4*Math.sin(titleT*10+i)})`:'rgba(200,106,255,0.35)'; ctx.beginPath(); ctx.arc(hx+f*4,y+10,8+i*5+Math.sin(titleT*4+i)*2,f>0?-1:Math.PI-0.6,f>0?0.6:Math.PI+1); ctx.stroke(); }
  if(conf){ ctx.fillStyle='#ffe0ff'; ctx.font='600 8px "IBM Plex Mono",monospace'; ctx.fillText('?',x+b.w/2-2,y-4); }
  ctx.restore(); };

/* ---------- 5. КАМЕРТОНЪТ ---------- */
R2B.make.fork=()=>{ const cx=AX()+15*T; return {type:'fork',cx,x:cx-14,y:3*T,w:28,h:6*T,hp:1600*D.bhp,max:1600*D.bhp,state:'intro',t:2.5,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,phase:1,waveT:2.5,ringT:5,droneT:6,crys:[{hp:500*D.bhp,x:cx-58},{hp:500*D.bhp,x:cx+58}],waves:[]}; };
R2B.hurt.fork=(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return;
  if(b.phase<3){ sparks(b.cx+rnd(-10,10),b.y+40+rnd(-20,20),3,'#ffffff'); return; }
  b.hp-=d; bHitFx(b,'#ffffff'); if(b.hp<=0) bossDie(); };
R2B.upd.fork=dt=>{
  const b=boss, p=player; b.anim+=dt; b.hitT-=dt;
  if(b.dead){ bossDeathFx(b,dt); return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0) b.state='fight'; return; }
  // crystals take damage from bullets via proxy enemies
  if(!b.prox){ b.prox=b.crys.map((c,i)=>{ const e=makeEnemy('crys',c.x,6*T); e.summoned=true; e.tag='fcrys'; e.hp=c.hp; e.ci=i; enemies.push(e); return e; }); }
  const alive=b.prox.filter(e=>!e.dead); const cryHp=alive.reduce((s,e)=>s+Math.max(0,e.hp),0);
  if(b.phase<3){ b.hp=Math.max(b.max*0.34,b.max*0.34+cryHp/(1000*D.bhp)*b.max*0.66); }
  if(b.phase===1&&alive.length<2){ b.phase=2; showMsg('Камертонът ускорява ритъма!',2); shake=8; }
  if(b.phase<3&&!alive.length){ b.phase=3; b.hp=b.max*0.34; showMsg('Ядрото е открито! Стреляй в сърцевината!',2.4); shake=12; flash=0.6; flashCol='#ffffff'; }
  const fast=b.phase===1?1:b.phase===2?1.35:1.6;
  b.waveT-=dt*fast; if(b.waveT<=0){ b.waveT=2.6; for(const s of [-1,1]) b.waves.push({x:b.cx,dir:s,life:3}); sfxAt('stomp',{x:b.cx,y:15*T,w:0}); shake=4; }
  for(const w of b.waves){ w.x+=w.dir*170*fast*D.bspd*dt; w.life-=dt; if(!p.dead&&Math.abs(p.x+p.w/2-w.x)<8&&p.y+p.h>15*T-14&&!w.hit){ w.hit=true; hurtPlayer(14,w.dir*200); p.vy=-200; } }
  b.waves=b.waves.filter(w=>w.life>0&&w.x>AX()&&w.x<AX()+30*T);
  if(b.phase>=2){ b.ringT-=dt; if(b.ringT<=0){ b.ringT=b.phase>2?2.6:3.6; const n=10; for(let i=0;i<n;i++){ const a=i/n*Math.PI*2+b.anim; bossOrb(b.cx,b.y+50,Math.cos(a)*110*D.bspd,Math.sin(a)*110*D.bspd,{dmg:8,r:4}); } sfxAt('charge',b); } }
  if(b.phase>=3){ b.droneT-=dt; if(b.droneT<=0){ b.droneT=6; if(enemies.filter(e=>!e.dead&&e.type==='drone').length<3) mechSpawn('drone',AX()+(Math.random()<0.5?4:26)*T); } }
};
R2B.draw.fork=()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; const cx=Math.round(b.cx-cam), y=b.y; ctx.save(); if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1);
  const vib=Math.sin(b.anim*40)*(b.phase>1?2:1); ctx.fillStyle='#8a8a96';
  ctx.fillRect(cx-62+vib,y-2*T,10,7*T); ctx.fillRect(cx+52-vib,y-2*T,10,7*T); ctx.fillRect(cx-62,y+5*T-6,124,10); ctx.fillRect(cx-6,y+5*T,12,3*T);
  ctx.fillStyle='#cfcfd8'; ctx.fillRect(cx-60+vib,y-2*T,2,7*T); ctx.fillRect(cx+54-vib,y-2*T,2,7*T);
  if(b.prox) b.prox.forEach((e,i)=>{ if(e.dead) return; const ex=Math.round(e.x+e.w/2-cam); ctx.save(); ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(ex,e.y+10,2,ex,e.y+10,22); g.addColorStop(0,'rgba(255,90,110,0.7)'); g.addColorStop(1,'rgba(255,90,110,0)'); ctx.fillStyle=g; ctx.fillRect(ex-22,e.y-12,44,44); ctx.restore(); });
  const core=b.phase>=3; ctx.save(); ctx.globalCompositeOperation='lighter'; const r=core?26+Math.sin(titleT*8)*4:12; const g=ctx.createRadialGradient(cx,y+50,2,cx,y+50,r*2); g.addColorStop(0,core?'rgba(255,255,255,0.95)':'rgba(255,200,210,0.6)'); g.addColorStop(1,'rgba(255,60,80,0)'); ctx.fillStyle=g; ctx.fillRect(cx-r*2,y+50-r*2,r*4,r*4); ctx.restore();
  if(!core){ ctx.strokeStyle='rgba(200,200,220,0.6)'; ctx.strokeRect(cx-14,y+36,28,28); }
  for(const w of b.waves){ const x=w.x-cam; ctx.fillStyle='rgba(255,90,110,0.8)'; ctx.fillRect(x-6,15*T-10,12,10); ctx.fillStyle='rgba(255,220,230,0.9)'; ctx.fillRect(x-3,15*T-14,6,4); }
  ctx.restore(); };
Object.assign(DIMS,{crys:[22,22,500]});
R2UPD.crys=(e,dt)=>{ e.anim+=dt; e.alert=false; e.mech=true; if(boss&&boss.type==='fork'){ const c=boss.crys[e.ci]; const vib=Math.sin(boss.anim*40); e.x=boss.cx+(e.ci?58:-58)-e.w/2+(e.ci?-vib:vib); e.y=boss.y+2*T; } };
R2DRAW.crys=e=>{ if(e.dead&&e.deadT>0.5) return; const x=Math.round(e.x-cam), y=Math.round(e.y); ctx.fillStyle=e.hitT>0?'#ffffff':'#ff5a70'; ctx.beginPath(); ctx.moveTo(x+11,y); ctx.lineTo(x+22,y+11); ctx.lineTo(x+11,y+22); ctx.lineTo(x,y+11); ctx.closePath(); ctx.fill(); ctx.fillStyle='#ffd0d6'; ctx.fillRect(x+9,y+5,3,8); };
