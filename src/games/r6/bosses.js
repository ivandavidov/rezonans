/* ================= РЕЗОНАНС 6 · БОСОВЕ ================= */
defBosses('intro',{
  shadow:'Сянката! Оловото минава през нея като през дим. Изпей тона (E) — за няколко мига ще се вплътни.',
  echoes:'Ехотата! Наяве са просто сенки. Премини в съня с E — само там можеш да ги раниш.',
  priest:'Жрецът! Жертвените пламъци го бранят. Потуши и трите огъня, за да свалиш защитата му.',
  cerber:'Триглавият! Откликни с тона, докато главите реват в хор — така ще секнеш гласа им и ще откриеш пролука.',
  firsttone:'Първият тон! Акустичният му щит отблъсква всичко. Приближи се и изпей тона от упор, за да го пробиеш!'});
defBosses('name',{shadow:'СЯНКАТА',echoes:'ЕХОТАТА',priest:'ЖРЕЦЪТ',cerber:'ТРИГЛАВИЯТ',firsttone:'ПЪРВИЯТ ТОН'});
defBosses('col',{shadow:'#b8a0ff',echoes:'#f0c8ff',priest:'#ff9a4a',cerber:'#e8c25a',firsttone:'#8ab4ff'});
defBosses('norm',{shadow:1,echoes:1,priest:1,cerber:1,firsttone:0.85});
const ax6=tx=>AX()/T+tx-26;   // абсолютна колона от плана (врата на 26) → колона в текущата арена
const bHit6=(b,col)=>{ b.hitT=0.08; sparks(b.x+b.w/2+rnd(-10,10),b.y+b.h/2+rnd(-10,10),4,col); };
const hint6=(b,t)=>{ b.hintT=(b.hintT||0)-1; if(b.hintT<=0){ b.hintT=28; showMsg(t,1.8); } };
const summ6=(type,tx,row,tag,o={})=>{ const x=ax6(tx); const e=makeEnemy(type,x*T+8,(row+1)*T); e.summoned=true; e.tag=tag; e.alert=true; Object.assign(e,o); enemies.push(e); for(let i=0;i<10;i++) part(x*T+8,(row+1)*T-10,rnd(-50,50),rnd(-70,10),0.5,'#e8c25a',1.5,0); return e; };
const alive6=tag=>enemies.filter(e=>e.tag===tag&&!e.dead);
const glow6=(x,y,col,r,a)=>{ ctx.save(); ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(x,y,1,x,y,r); g.addColorStop(0,`rgba(${col},${a})`); g.addColorStop(1,`rgba(${col},0)`); ctx.fillStyle=g; ctx.fillRect(x-r,y-r,r*2,r*2); ctx.restore(); };
const wisps6=(n,x,y)=>{ if(enemies.filter(e=>!e.dead&&e.type==='wisp').length>=n) return; const e=makeEnemy('wisp',x,y); e.summoned=true; e.alert=true; enemies.push(e); for(let i=0;i<8;i++) part(x,y-6,rnd(-40,40),rnd(-40,40),0.5,'#c8d8ff',1.5,0); };

/* ---------- 1. СЯНКАТА ---------- */
defBoss('shadow',{make:()=>({type:'shadow',x:AX()+22*T,y:15*T-30,w:14,h:30,hp:700*D.bhp,max:700*D.bhp,state:'intro',t:2,face:-1,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,phase:1,solidT:0,fireT:1.6,wispT:6,dashT:5,onGround:false})});
defBoss('shadow',{onTone:d=>{ const b=boss; if(d<260&&b.state!=='intro'){ b.solidT=b.phase>1?2.8:3.6; for(let i=0;i<16;i++) part(b.x+b.w/2,b.y+b.h/2,rnd(-80,80),rnd(-80,80),0.5,'#e8c25a',2,0); showMsg('Сянката се вплътни!',1.2); } }});
defBoss('shadow',{hurt:(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return;
  if(!(b.solidT>0)){ for(let i=0;i<3;i++) part(b.x+rnd(b.w),b.y+rnd(b.h),rnd(-30,30),rnd(-30,30),0.4,'#3a2a5a',2,0); hint6(b,'Куршумите минават през сянката. Изпей тона с E!'); return; }
  b.hp-=d; bHit6(b,'#e8c25a'); if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; showMsg('Сянката се разпада на реещи се искри!',2); shake=6; } if(b.hp<=0) bossDie(); }});
defBoss('shadow',{upd:dt=>{
  const b=boss, p=player; b.anim+=dt; b.hitT-=dt; b.solidT=Math.max(0,b.solidT-dt);
  if(b.dead){ bossDeathFx(b,dt); return; }
  if(b.state==='intro'){ b.t-=dt; physics(b,dt); if(b.t<=0) b.state='mirror'; return; }
  const pcx=p.x+p.w/2, pcy=p.y+p.h/2, bcx=b.x+b.w/2, bcy=b.y+b.h/2, mid=AX()+15*T, sp=(b.phase>1?1.25:1)*D.bspd;
  b.face=sgn(pcx-bcx)||b.face;
  if(b.state==='mirror'){ const tx=clamp(2*mid-pcx,AX()+2*T,AX()+28*T), dx=tx-bcx; b.vx=Math.abs(dx)>6?sgn(dx)*130*sp:0;
    if(p.vy<-160&&b.onGround) b.vy=-390;   // скача, когато и ти скочиш
    b.dashT-=dt; if(b.dashT<=0&&b.onGround){ b.state='dash'; b.t=0.55; b.dashT=b.phase>1?3.5:5; sfxAt('charge',b); } }
  else if(b.state==='dash'){ b.t-=dt; b.vx=b.face*330*sp; if(Math.random()<0.7) part(bcx,bcy,-b.face*rnd(20,60),rnd(-20,20),0.4,'#6a4aa8',2,0); if(b.t<=0) b.state='mirror'; }
  physics(b,dt); b.x=clamp(b.x,AX()+T,AX()+29*T-b.w);
  b.fireT-=dt; if(b.fireT<=0&&!p.dead){ b.fireT=(b.phase>1?1.1:1.6)*D.rate; const a=Math.atan2(pcy-bcy,pcx-bcx); for(const o of (b.phase>1?[-0.12,0.12]:[0])) ebullets.push({x:bcx,y:bcy-6,vx:Math.cos(a+o)*190*D.bspd,vy:Math.sin(a+o)*190*D.bspd,life:3,dmg:10,r:4,orb:true}); sfxAt('flyer',b); }
  b.wispT-=dt; if(b.wispT<=0){ b.wispT=b.phase>1?5:8; wisps6(b.phase>1?3:2,bcx,b.y); }
  if(!p.dead&&ov(b,p)){ b.bite=(b.bite||0)-dt; if(b.bite<=0){ b.bite=0.8; hurtPlayer(b.state==='dash'?18:8,sgn(pcx-bcx||1)*220); p.vy=-160; } }
}});
defBoss('shadow',{draw:()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; const solid=b.solidT>0; if(!b.dead) glow6(Math.round(b.x+b.w/2-cam),Math.round(b.y+b.h/2),solid?'232,194,90':'150,110,255',30,solid?0.4:0.35); begin(b); ctx.globalAlpha=b.dead?1-clamp((b.deathT-1.8)/0.8,0,1):solid?1:0.55+0.15*Math.sin(b.anim*7);
  tint=b.hitT>0?'#fff':null; const c=solid?'#5a4a7a':'#2a1e48', c2=solid?'#e8c25a':'#b8a0ff', w=Math.abs(b.vx)>5?Math.round(Math.sin(b.anim*12)*2):0;
  px(-4+w,-10,3,10,c); px(1-w,-10,3,10,c); px(-5,-23,10,14,c); px(-5,-23,10,1,c2); px(-3,-30,7,7,c); px(-2,-27,2,1,c2); px(1,-27,2,1,c2); px(5,-19,6,2,c);
  tint=null; ctx.restore(); if(b.dead) return;
  const x=Math.round(b.x+b.w/2-cam), y=Math.round(b.y+b.h/2);
  if(solid) glow6(x,y,'232,194,90',24,0.35); else { ctx.save(); ctx.globalAlpha=0.5; for(let i=0;i<6;i++){ const a=b.anim*2+i*1.05; ctx.fillStyle='#6a4aa8'; ctx.fillRect(x+Math.cos(a)*12,y+Math.sin(a)*16,2,2); } ctx.restore(); }
  // обратната сянка — към тонът, не към светлината
  ctx.fillStyle='rgba(180,150,255,0.25)'; ctx.fillRect(x-(b.face>0?24:-4),Math.round(b.y+b.h)-2,20,2); }});

/* ---------- 2. ЕХОТАТА ---------- */
defBoss('echoes',{make:()=>{ const a=LVL.arena; if(ERAD) setDoorAll([a.door,a.r0,a.r1],'D'); return {type:'echoes',x:AX()+13*T,y:2.5*T,w:4*T,h:4*T,hp:1000*D.bhp,max:1000*D.bhp,state:'intro',t:2,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,phase:1,fireT:2,rainT:5,wispT:4,pullT:9}; }});
const echoVuln=()=>!ERAD||ERA===1;
defBoss('echoes',{hurt:(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return;
  if(!echoVuln()){ sparks(b.x+b.w/2+rnd(-20,20),b.y+b.h/2,3,'#c8b8e8'); hint6(b,'Наяве ехотата са недосегаеми. Премини в съня с E!'); return; }
  b.hp-=d; bHit6(b,'#f0c8ff'); if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; showMsg('Трите гласа запяват в зловещ унисон!',2); shake=6; } if(b.hp<=0) bossDie(); }});
defBoss('echoes',{upd:dt=>{
  const b=boss, p=player, a=LVL.arena; b.anim+=dt; b.hitT-=dt;
  if(b.dead){ bossDeathFx(b,dt); if(ERAD&&b.exitDone&&!b.allOpen){ b.allOpen=true; setDoorAll(a.exitDoor,'.'); } return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0) b.state='fight'; return; }
  const pcx=p.x+p.w/2, pcy=p.y+p.h/2, dream=echoVuln();
  b.x=AX()+13*T+Math.sin(b.anim*0.5)*8*T; b.y=2.5*T+Math.sin(b.anim*0.9)*T;
  const heads=[0,1,2].map(i=>{ const an=b.anim*1.4+i*2.094; return [b.x+b.w/2+Math.cos(an)*26,b.y+b.h/2+Math.sin(an)*18]; });
  b.fireT-=dt; if(b.fireT<=0&&!p.dead){ b.fireT=(dream?(b.phase>1?1.2:1.6):2.2)*D.rate; const hs=dream?heads:[heads[Math.floor(b.anim)%3]];
    for(const [hx,hy] of hs){ const an=Math.atan2(pcy-hy,pcx-hx); ebullets.push({x:hx,y:hy,vx:Math.cos(an)*165*D.bspd,vy:Math.sin(an)*165*D.bspd,life:4,dmg:10,r:4,orb:true}); } sfxAt('flyer',b); }
  if(dream){ b.rainT-=dt; if(b.rainT<=0){ b.rainT=b.phase>1?3.5:5; for(let i=0;i<(b.phase>1?7:5);i++) bossOrb(AX()+(2+Math.random()*26)*T,T,rnd(-20,20),40,{grav:true,dmg:10,r:4,life:4}); showMsg('Небето на съня се пропуква!',1); } }
  else { b.wispT-=dt; if(b.wispT<=0){ b.wispT=b.phase>1?4:6; wisps6(b.phase>1?3:2,b.x+b.w/2,b.y+b.h); } }
  // във втората фаза ехотата те изтръгват от съня
  if(b.phase>1&&ERAD&&ERA===1){ b.pullT-=dt; if(b.pullT<=0){ b.pullT=9; if(switchEra(true)){ showMsg('Ехотата те изтръгнаха от съня! Върни се обратно с E.',2); flash=0.6; flashCol='#f0c8ff'; } } }
}});
defBoss('echoes',{draw:()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; const cx=Math.round(b.x+b.w/2-cam), cy=Math.round(b.y+b.h/2), v=echoVuln(); ctx.save(); const fa=b.dead?1-clamp((b.deathT-1.8)/0.8,0,1):1;
  ctx.globalAlpha=fa*(v?1:0.4); glow6(cx,cy,v?'240,200,255':'140,120,200',40,0.35);
  const cols=['#e8e0f0','#e8c25a','#8ab4ff'];
  for(let i=0;i<3;i++){ const an=b.anim*1.4+i*2.094, x=cx+Math.cos(an)*26, y=cy+Math.sin(an)*18;
    ctx.fillStyle=b.hitT>0?'#fff':cols[i]; ctx.beginPath(); ctx.ellipse(x,y,8,10,0,0,7); ctx.fill(); ctx.fillStyle='#1a1028'; ctx.fillRect(x-5,y-3,3,2); ctx.fillRect(x+2,y-3,3,2); ctx.fillRect(x-2,y+3,4,2+Math.round(Math.abs(Math.sin(b.anim*6+i))*3)); }
  ctx.strokeStyle=`rgba(240,200,255,${0.3*fa})`; ctx.beginPath(); ctx.ellipse(cx,cy,26,18,0,0,7); ctx.stroke(); ctx.restore(); }});

/* ---------- 3. ЖРЕЦЪТ ---------- */
defFoes('dims',{pyre:[16,26,80]});
defFoe('pyre',{upd:(e,dt)=>{ e.anim+=dt; e.alert=false; e.mech=true; e.cd-=dt; const p=player;
  if(e.cd<=0&&!p.dead){ e.cd=rnd(2.6,3.6)*D.rate; const x=e.x+e.w/2, y=e.y, tt=1.1, tx=p.x+p.w/2; if(Math.abs(tx-x)<260) bossOrb(x,y,(tx-x)/tt,(p.y+p.h-6-y)/tt-0.5*G*tt,{grav:true,dmg:10,r:4,red:true,life:4}); } }});
defFoe('pyre',{draw:e=>{ if(e.dead&&e.deadT>0.6) return; const x=Math.round(e.x+e.w/2-cam), y=Math.round(e.y+e.h)-12;
  ctx.fillStyle='#5a4a3a'; ctx.fillRect(x-4,y,8,12); ctx.fillStyle='#7a6a52'; ctx.fillRect(x-6,y+10,12,2);
  ctx.fillStyle='#6a5a46'; ctx.fillRect(x-8,y-6,16,6); ctx.fillStyle='#8a7a62'; ctx.fillRect(x-9,y-7,18,2);
  if(e.dead){ ctx.fillStyle='#3a3a3a'; ctx.fillRect(x-4,y-9,8,2); return; }
  glow6(x,y-12,'255,150,70',20,0.55+0.2*Math.sin(e.anim*9)); const f=Math.sin(e.anim*11);
  ctx.fillStyle=e.hitT>0?'#fff':'#ff8a3a'; ctx.beginPath(); ctx.moveTo(x-6,y-7); ctx.lineTo(x+f*2,y-20); ctx.lineTo(x+6,y-7); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#ffe08a'; ctx.beginPath(); ctx.moveTo(x-3,y-7); ctx.lineTo(x-f,y-14); ctx.lineTo(x+3,y-7); ctx.closePath(); ctx.fill(); }});
const PRIEST_POS=[[32.5,12],[40.5,9],[48.5,12],[40.5,15]], PYRES=[[29,14],[40,8],[52,14]];
defBoss('priest',{make:()=>{ for(const [tx,row] of PYRES) summ6('pyre',tx,row,'pyre'); return {type:'priest',x:AX()+14.5*T-7,y:9*T-32,w:14,h:32,hp:900*D.bhp,max:900*D.bhp,state:'intro',t:2,face:-1,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,phase:1,pos:1,fireT:1.6,tpT:2.6,sumT:8}; }});
defBoss('priest',{onTone:d=>{ const b=boss; if(d<200&&b.state==='fight'){ b.tpT=Math.max(b.tpT,2.2); b.fireT=Math.max(b.fireT,1.8); showMsg('Тонът прекъсна призоваването!',1); } }});
defBoss('priest',{hurt:(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return;
  if(b.state!=='open'){ sparks(b.x+b.w/2+rnd(-6,6),b.y+b.h/2+rnd(-10,10),3,'#ff9a4a'); hint6(b,'Пламъците го бранят. Потуши трите огъня!'); return; }
  b.hp-=d; bHit6(b,'#ff9a4a'); if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; showMsg('„Стражи на древното семе, надигнете се!“',2); shake=6; } if(b.hp<=0) bossDie(); }});
const priestTp=(b,n)=>{ b.pos=n; const [tx,row]=PRIEST_POS[n]; b.x=AX()+(tx-26)*T-b.w/2; b.y=row*T-b.h; for(let i=0;i<18;i++) part(b.x+b.w/2,b.y+b.h/2,rnd(-70,70),rnd(-70,70),0.5,'#ff9a4a',2,0); };
defBoss('priest',{upd:dt=>{
  const b=boss, p=player; b.anim+=dt; b.hitT-=dt;
  if(b.dead){ bossDeathFx(b,dt); return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0) b.state='fight'; return; }
  const pcx=p.x+p.w/2, bcx=b.x+b.w/2, bcy=b.y+b.h/2; b.face=sgn(pcx-bcx)||b.face;
  if(b.state==='fight'){
    b.tpT-=dt; if(b.tpT<=0){ b.tpT=b.phase>1?2:2.6; let n=b.pos; while(n===b.pos) n=Math.floor(Math.random()*3); priestTp(b,n); }
    b.fireT-=dt; if(b.fireT<=0&&!p.dead){ b.fireT=(b.phase>1?1.3:1.8)*D.rate; const tt=1.1; for(const o of (b.phase>1?[-32,0,32]:[-16,16])){ const tx=pcx+o; bossOrb(bcx,b.y+4,(tx-bcx)/tt,(p.y+p.h-6-b.y)/tt-0.5*G*tt,{grav:true,dmg:12,r:5,red:true,life:5}); } sfxAt('throwG',b); }
    if(!alive6('pyre').length){ b.state='open'; b.t=b.phase>1?5:6.5; priestTp(b,3); showMsg('Огньовете угаснаха! Жрецът е открит за удар!',1.6); shake=5; } }
  else if(b.state==='open'){ b.t-=dt; if(b.t<=0){ b.state='fight'; b.tpT=0.4; for(const [tx,row] of PYRES) summ6('pyre',tx,row,'pyre'); showMsg('Жрецът възпламени олтарите наново.',1.4); } }
  if(b.phase>1){ b.sumT-=dt; if(b.sumT<=0){ b.sumT=9; if(enemies.filter(e=>!e.dead&&e.type==='thrax').length<2) mechSpawn('thrax',AX()+(pcx>AX()+15*T?4:25)*T); } }
  if(!p.dead&&ov(b,p)){ b.bite=(b.bite||0)-dt; if(b.bite<=0){ b.bite=0.8; hurtPlayer(10,sgn(pcx-bcx||1)*220); } }
}});
defBoss('priest',{draw:()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; begin(b); if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1);
  const open=b.state==='open', k=open?Math.round(Math.sin(b.anim*3)):0; tint=b.hitT>0?'#fff':null;
  px(-6,-14+k,12,14-k,'#5a2a3a'); px(-5,-26,10,13,'#7a3a4a'); px(-6,-26,12,2,'#e8c25a'); px(-1,-24,2,10,'#e8c25a');
  px(-3,-32,7,6,'#d8b890'); px(-4,-34,9,3,'#e8e0d0'); px(-2,-29,2,1,'#2a1a1a'); px(1,-29,2,1,'#2a1a1a'); px(-2,-27,5,3,'#e8e0d0');
  if(!open){ px(-9,-34,3,12,'#7a3a4a'); px(7,-34,3,12,'#7a3a4a'); } else { px(-9,-20,3,8,'#7a3a4a'); px(7,-20,3,8,'#7a3a4a'); }
  tint=null; ctx.restore(); if(b.dead) return;
  const x=Math.round(b.x+b.w/2-cam), y=Math.round(b.y+b.h/2);
  if(!open){ ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.strokeStyle=`rgba(255,150,70,${0.35+0.15*Math.sin(b.anim*8)})`; ctx.lineWidth=2; ctx.beginPath(); ctx.ellipse(x,y,14,22,0,0,7); ctx.stroke(); ctx.restore(); ctx.lineWidth=1;
    for(let i=0;i<2;i++) glow6(x+(i?9:-9),y-18,'255,150,70',8,0.6); } }});

/* ---------- 4. ТРИГЛАВИЯТ ---------- */
defBoss('cerber',{make:()=>({type:'cerber',x:AX()+18*T,y:15*T-46,w:72,h:46,hp:1000*D.bhp,max:1000*D.bhp,state:'intro',t:2,face:-1,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,phase:1,act:0})});
defBoss('cerber',{onTone:d=>{ const b=boss; if(b.state==='sing'&&d<320){ b.state='quiet'; b.t=b.phase>1?3.4:4.2; shake=6; showMsg('Главите замлъкнаха! Стреляй сега!',1.4); for(let i=0;i<24;i++) part(b.x+b.w/2,b.y+10,rnd(-100,100),rnd(-80,20),0.6,'#e8c25a',2,0); }
  else if(b.state!=='quiet'&&b.state!=='intro') hint6(b,'Изчакай хорът да запее — тогава откликни с тона.'); }});
defBoss('cerber',{hurt:(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return;
  if(b.state!=='quiet'){ sparks(b.x+b.w/2+rnd(-20,20),b.y+12,3,'#e8c25a'); hint6(b,'Хорът на звера го пази. Изпей тона точно докато пеят!'); return; }
  b.hp-=d; bHit6(b,'#e8c25a'); if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; showMsg('Триглавият завива диво — сенките на мъртвите прииждат!',2); shake=8; } if(b.hp<=0) bossDie(); }});
defBoss('cerber',{upd:dt=>{
  const b=boss, p=player; b.anim+=dt; b.hitT-=dt;
  if(b.dead){ bossDeathFx(b,dt); return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0){ b.state='aim'; b.t=1.2; } return; }
  const minX=AX()+T, maxX=AX()+29*T-b.w, sp=(b.phase>1?1.25:1)*D.bspd, pcx=p.x+p.w/2, bcx=b.x+b.w/2;
  if(b.state==='aim'){ b.face=sgn(pcx-bcx)||b.face; b.t-=dt; if(b.t<=0){ b.act++; if(b.act%2===0){ b.state='sing'; b.t=b.phase>1?2.6:3; sfxAt('charge',b); if(AC){ osc({type:'sawtooth',f:110,t:1.4,v:0.04}); osc({type:'sawtooth',f:139,t:1.4,v:0.03}); osc({type:'sawtooth',f:165,t:1.4,v:0.03}); } } else { b.state='charge'; sfxAt('roar',b); } } }
  else if(b.state==='charge'){ b.x+=b.face*190*sp*dt; if(Math.random()<0.5) part(b.face>0?b.x:b.x+b.w,15*T-2,-b.face*rnd(40,120),rnd(-60,-10),0.4,'#3a2a3a',2,300);
    if(b.x<=minX||b.x>=maxX){ b.x=clamp(b.x,minX,maxX); shake=8; sfxAt('stomp',b); for(const s of [-1,1]) bossOrb(bcx+s*30,15*T-7,s*150*D.bspd,0,{dmg:12,r:6,life:3}); b.state='aim'; b.t=b.phase>1?0.8:1.2; b.face=-b.face; } }
  else if(b.state==='sing'){ b.t-=dt; b.tick=(b.tick||0)+dt; if(b.tick>(b.phase>1?0.45:0.6)){ b.tick=0; b.hd=((b.hd||0)+1)%3; const hx=b.x+14+b.hd*24, hy=b.y+6, a=Math.atan2(p.y+p.h/2-hy,pcx-hx); for(const o of [-0.28,0,0.28]) ebullets.push({x:hx,y:hy,vx:Math.cos(a+o)*130*D.bspd,vy:Math.sin(a+o)*130*D.bspd,life:3.5,dmg:9,r:4,orb:true}); }
    if(b.t<=0){ b.state='aim'; b.t=0.8; } }
  else if(b.state==='quiet'){ b.t-=dt; if(b.t<=0){ b.state='aim'; b.t=0.6; } }
  if(b.phase>1){ b.sumT=(b.sumT||6)-dt; if(b.sumT<=0){ b.sumT=8; wisps6(3,bcx,b.y); } }
  if(!p.dead&&ov(b,p)){ b.bite=(b.bite||0)-dt; if(b.bite<=0){ b.bite=0.8; hurtPlayer(b.state==='charge'?24:10,sgn(pcx-bcx||1)*260); p.vy=-220; } }
}});
defBoss('cerber',{draw:()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; const x=Math.round(b.x-cam), y=Math.round(b.y), hit=b.hitT>0, q=b.state==='quiet', s=b.state==='sing'; ctx.save(); if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1);
  const run=b.state==='charge'?Math.round(Math.sin(b.anim*14)*3):0;
  glow6(x+36,y+20,'255,90,60',50,0.18); ctx.fillStyle=hit?'#fff':'#4a3446'; ctx.fillRect(x+6,y+18,60,20); for(const lx2 of [x+10,x+24,x+46,x+58]) ctx.fillRect(lx2,y+36+(lx2%2?run:-run),6,10);
  ctx.fillStyle=hit?'#fff':'#6a4a62'; ctx.fillRect(x+6,y+18,60,3);
  const tail=b.face>0?x:x+66; ctx.fillStyle='#4a3446'; ctx.fillRect(tail-(b.face>0?8:0),y+16+Math.round(Math.sin(b.anim*5)*3),8,3);
  for(let h=0;h<3;h++){ const hx=x+6+h*24+(b.face>0?6:-2), hy=y+2+(h===1?-6:0)+Math.round(Math.sin(b.anim*4+h)*2);
    ctx.fillStyle=hit?'#fff':'#5a4058'; ctx.fillRect(hx,hy,16,14); ctx.fillRect(hx+(b.face>0?12:-6),hy+6,10,6);
    ctx.fillStyle=q?'#4a4a4a':'#ff5a3a'; ctx.fillRect(hx+(b.face>0?9:3),hy+4,3,2); if(!q) glow6(hx+(b.face>0?10:4),hy+5,'255,90,60',8,0.6);
    if(s){ ctx.fillStyle='#ffe08a'; ctx.fillRect(hx+(b.face>0?14:-4),hy+11,6,3+Math.round(Math.abs(Math.sin(b.anim*12+h))*3)); glow6(hx+8,hy+8,'232,194,90',16,0.45); } }
  if(q){ for(let i=0;i<3;i++){ const a=titleT*5+i*2.1; ctx.fillStyle='#e8c25a'; ctx.fillRect(Math.round(x+36+Math.cos(a)*14),Math.round(y-10+Math.sin(a)*3),2,2); } }
  ctx.restore(); }});

/* ---------- 5. ПЪРВИЯТ ТОН ---------- */
defBoss('firsttone',{make:()=>({type:'firsttone',x:AX()+13*T,y:2*T,w:4*T,h:4*T,hp:1500*D.bhp,max:1500*D.bhp,state:'intro',t:2.5,anim:0,dead:false,deathT:0,boomT:0,hitT:0,vx:0,vy:0,phase:1,shield:1,openT:0,fireT:2,beamT:5,sumT:7,mech:true})});
defBoss('firsttone',{onTone:d=>{ const b=boss; if(b.state==='intro') return; if(d<320){ b.openT=b.phase>2?2.6:3.4; showMsg('Щитът е пробит!',1); for(let i=0;i<30;i++) part(b.x+b.w/2,b.y+b.h/2,rnd(-120,120),rnd(-120,120),0.6,'#e8c25a',2,0); } else hint6(b,'Твърде далеч си! Приближи се плътно и изпей тона.'); }});
defBoss('firsttone',{hurt:(d,blast)=>{ const b=boss; if(!b||b.dead||b.state==='intro') return;
  if(b.shield>0.4){ sparks(b.x+b.w/2+rnd(-24,24),b.y+b.h/2+rnd(-24,24),3,'#8ab4ff'); hint6(b,'Звуковият щит отразява всичко. Изпей тона отблизо!'); return; }
  b.hp-=d; bHit6(b,'#ffffff');
  if(b.phase===1&&b.hp<b.max*0.6){ b.phase=2; showMsg('„Ти, който чуваш тона... Защо се противиш?“',2.2); shake=8; }
  else if(b.phase===2&&b.hp<b.max*0.3){ b.phase=3; showMsg('Светлината се сгъстява. Тонът става оглушителен!',2.2); shake=10; }
  if(b.hp<=0) bossDie(); }});
defBoss('firsttone',{upd:dt=>{
  const b=boss, p=player; b.anim+=dt; b.hitT-=dt;
  if(b.dead){ bossDeathFx(b,dt); return; }
  if(b.state==='intro'){ b.t-=dt; if(b.t<=0) b.state='fight'; return; }
  const bcx=b.x+b.w/2, bcy=b.y+b.h/2, pcx=p.x+p.w/2, pcy=p.y+p.h/2;
  b.x=AX()+13*T+Math.sin(b.anim*0.4)*9*T; b.y=2*T+Math.sin(b.anim*0.8)*T;
  b.openT=Math.max(0,b.openT-dt); b.shield+=((b.openT>0?0:1)-b.shield)*Math.min(1,dt*6);
  b.fireT-=dt; if(b.fireT<=0){ b.fireT=(b.phase>2?1.1:b.phase>1?1.4:1.8)*D.rate; const n=b.phase>1?10:8, a0=b.anim*0.7; for(let i=0;i<n;i++){ const a=a0+i/n*6.283; ebullets.push({x:bcx,y:bcy,vx:Math.cos(a)*115*D.bspd,vy:Math.sin(a)*115*D.bspd,life:4,dmg:10,r:4,orb:true}); } if(AC) osc({type:'sine',f:262,t:0.5,v:0.06}); }
  b.beamT-=dt; if(b.beamT<=0&&!p.dead){ b.beamT=b.phase>1?3.5:5; const a=Math.atan2(pcy-bcy,pcx-bcx); for(let i=0;i<6;i++) ebullets.push({x:bcx,y:bcy,vx:Math.cos(a)*(150+i*28)*D.bspd,vy:Math.sin(a)*(150+i*28)*D.bspd,life:3,dmg:12,r:5,orb:true}); sfxAt('flyer',b); }
  if(b.phase>1){ b.sumT-=dt; if(b.sumT<=0){ b.sumT=b.phase>2?7:10; if(enemies.filter(e=>!e.dead&&e.type==='watcher').length<2) mechSpawn('watcher',AX()+(pcx>AX()+15*T?4:25)*T); } }
  if(b.phase>2){ b.wT=(b.wT||4)-dt; if(b.wT<=0){ b.wT=6; wisps6(3,bcx,bcy); } }
}});
defBoss('firsttone',{draw:()=>{ const b=boss; if(b.dead&&b.deathT>2.6) return; const cx=Math.round(b.x+b.w/2-cam), cy=Math.round(b.y+b.h/2); const fa=b.dead?1-clamp((b.deathT-1.8)/0.8,0,1):1, k=b.dead?Math.max(0.1,1-b.deathT/2):1;
  ctx.save(); ctx.globalAlpha=fa; glow6(cx,cy,'138,180,255',60*k,0.4); glow6(cx,cy,'255,255,255',22*k,0.7);
  for(let r=0;r<3;r++){ const n=3+r*2, rad=(14+r*10)*k, a0=b.anim*(r%2?-0.8:0.6); ctx.strokeStyle=b.hitT>0?'#fff':['#ffffff','#e8c25a','#8ab4ff'][r]; ctx.beginPath(); for(let i=0;i<=n;i++){ const a=a0+i/n*6.283, x=cx+Math.cos(a)*rad, y=cy+Math.sin(a)*rad; i?ctx.lineTo(x,y):ctx.moveTo(x,y); } ctx.stroke(); }
  if(b.shield>0.05&&!b.dead){ ctx.globalCompositeOperation='lighter'; ctx.strokeStyle=`rgba(138,180,255,${0.55*b.shield})`; ctx.lineWidth=2; for(let i=0;i<2;i++){ ctx.beginPath(); ctx.arc(cx,cy,40+i*5+Math.sin(b.anim*6+i)*2,0,7); ctx.stroke(); } ctx.lineWidth=1; }
  ctx.restore(); }});
