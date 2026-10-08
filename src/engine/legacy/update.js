/* ================= UPDATE ================= */
function update(dt){
  const p=player; lvT+=dt; const edt=dt*timeScale();
  stats.time+=dt;
  if(LVL.tick) LVL.tick(dt);
  updLifts(); r2Update(dt);
  updPlayer(dt);
  if(p.dead&&p.deadT>1.4&&state==='play'){ state='dead'; deadT=0; }
  for(const t of triggers) if(!t.done&&p.x>t.x*T&&!p.dead&&(!t.cond||t.cond())){ t.done=true; t.fn(); }
  updEncounter(dt);
  if(LVL.gate&&!gateOpen&&!enemies.some(e=>e.tag==='gate'&&!e.dead)){ gateOpen=true; setDoor(LVL.gate.door,'.'); SFX.door(); radio(LVL.gate.msg); }
  updTrains(dt); updRockets(dt); updCrushers(dt); updHazards(dt);
  for(const k of pickups) if(k.taken&&k.respawn&&k.rt!==undefined){ k.rt-=dt; if(k.rt<=0){ k.taken=false; k.rt=undefined; sparks(k.x+6,k.y+5,6,'#ffd36b'); } }
  if(LVL.fires) for(const [fx,fy] of LVL.fires){ if(Math.abs(fx-cam-W/2)>W) continue; if(Math.random()<dt*40) part(fx+rnd(-10,10),fy,rnd(-8,8),rnd(-60,-25),rnd(0.4,0.9),Math.random()<0.5?'#ffb53a':'#ff6a1a',rnd(1,3),-30,1); if(Math.random()<dt*6) part(fx+rnd(-6,6),fy-20,rnd(-6,6),rnd(-30,-15),rnd(1.5,2.5),'#2a2224',rnd(4,7),-5,2); }
  let threat=false; const ccx=cam+W/2;
  for(const e of enemies){
    if(e.dead){ e.deadT+=dt; if(!FOES[e.type].fixed&&e.y<ROWS*T+60){ e.vx*=0.9; physics(e,dt); } continue; }
    if(Math.abs(e.x-ccx)>440) continue;
    e.hitT-=dt; e.flashT=(e.flashT||0)-dt;
    if(e.stunT>0){ e.stunT-=dt; continue; }
    FOES[e.type].upd(e,edt);
    if(!e.dead&&ACID_DIE[e.type]&&rectHas(e.x,e.y+e.h-6,e.w,6,'~')){ hurtEnemy(e,e.hp+1,0,true); for(let i=0;i<10;i++) part(e.x+rnd(e.w),e.y+e.h-4,rnd(-30,30),rnd(-90,-30),rnd(0.3,0.6),'#9dff6a',2,200); }
    if(!FOES[e.type].fixed&&!FOES[e.type].fly&&e.onGround&&elecOn()&&onTile(e,'Z')){ e.elecT-=dt; if(e.elecT<=0){ e.elecT=0.25; hurtEnemy(e,10,0,true); sparks(e.x+e.w/2,e.y+e.h,3,'#bfe8ff'); } }
    if(e.y>ROWS*T+40){ e.dead=true; e.deadT=99; }
    if(e.alert&&Math.abs(e.x-p.x)<380) threat=true;
  }
  for(const s of scientists) updScientist(s,dt);
  if(boss) BOSSES[boss.type].upd(edt);
  if(bmiss.length) updMissiles(dt);
  combatHold=threat?4:combatHold-dt;
  mInt=bossActive&&boss&&!boss.dead?2:combatHold>0?1:0;
  // electricity sound
  const eo=elecOn(); if(eo&&!elecWas&&zTiles.some(([tx])=>Math.abs(tx*T-p.x)<300)) SFX.elec(); elecWas=eo;
  for(const b of barrels) if(!b.dead&&b.fuse>=0){ b.fuse-=dt; if(b.fuse<0){ b.dead=true; explode(b.x+6,b.y+8,74,90); } }
  for(const b of ebullets){
    if(b.grav) b.vy+=G*edt;
    if(b.hornet&&!p.dead){ const sp=Math.hypot(b.vx,b.vy), cur=Math.atan2(b.vy,b.vx), tg=Math.atan2(p.y+p.h/2-b.y,p.x+p.w/2-b.x), turn=(DI===0?0.9:DI===2?2.2:1.5)*dt, na=cur+clamp(angDiff(tg,cur),-turn,turn); b.vx=Math.cos(na)*sp; b.vy=Math.sin(na)*sp; }
    b.x+=b.vx*edt; b.y+=b.vy*edt; b.life-=edt;
    if(b.orb&&Math.random()<0.5) part(b.x,b.y,rnd(-10,10),rnd(-10,10),0.3,b.ice?'#cfe8ff':b.acid?'#a6ff6a':b.hornet?'#e8ff6a':b.red?'#ff8a5a':'#d79bff',1,0);
    if(solidAt(b.x,b.y)){ b.life=0; sparks(b.x,b.y,3,b.orb?'#d79bff':'#ffd36b'); }
    else if(!p.dead&&!(b.fq!=null&&b.fq===FREQ)){ const r=b.r||0, nx=clamp(b.x,p.x,p.x+p.w), ny=clamp(b.y,p.y,p.y+p.h); if(Math.hypot(nx-b.x,ny-b.y)<=r+0.5){ b.life=0; hurtPlayer(b.dmg||7,sgn(b.vx)*40); if(!b.orb) blood(b.x,b.y,false,3); else sparks(b.x,b.y,6,'#d79bff'); } } }
  ebullets=ebullets.filter(b=>b.life>0);
  for(const g of grenades){ g.vy+=G*dt; const nx=g.x+g.vx*dt; if(solidAt(nx,g.y)){ g.vx*=-0.45; sfxAt('bounce',g); } else g.x=nx;
    const ny=g.y+g.vy*dt; if(g.impact&&solidAt(g.x,ny)){ g.t=0; g.y=ny-4; } else if(solidAt(g.x,ny)){ if(Math.abs(g.vy)>60) sfxAt('bounce',g); g.vy*=-0.4; g.vx*=0.7; } else g.y=ny;
    g.t-=dt; if(g.y>ROWS*T+40) g.t=-1; else if(g.t<=0) explode(g.x,g.y,g.impact?56:66,g.impact?55:g.own?100:70,1,!!g.impact||!!g.bossG); }
  grenades=grenades.filter(g=>g.t>0);
  for(const o of orbs){ o.x+=o.vx*edt; o.life-=edt; if(Math.random()<0.7) part(o.x,o.y+rnd(-4,4),-o.vx*0.1,rnd(-40,-10),0.35,'#9dff5a',1.5,0);
    if(solidAt(o.x+sgn(o.vx)*o.r,o.y)){ o.life=0; sparks(o.x,o.y,10,'#c8ff9a'); }
    if(!p.dead){ const nx=clamp(o.x,p.x,p.x+p.w), ny=clamp(o.y,p.y,p.y+p.h); if(Math.hypot(nx-o.x,ny-o.y)<o.r){ o.life=0; hurtPlayer(12,sgn(o.vx)*200); p.vy=-160; sparks(o.x,o.y,10,'#c8ff9a'); } } }
  orbs=orbs.filter(o=>o.life>0);
  for(const k of pickups) if(k.vy!==undefined&&!k.taken){ k.vy+=G*dt; const ny=k.y+k.vy*dt; if(rectSolid(k.x,ny,k.w,k.h)||(k.vy>0&&onOneWay({x:k.x,y:ny,w:k.w,h:k.h}))){ k.vy=undefined; } else k.y=ny; if(k.y>ROWS*T) k.taken=true; }
  for(const t of tracers) t.life-=dt; tracers=tracers.filter(t=>t.life>0);
  for(const b of bolts) b.life-=dt; bolts=bolts.filter(b=>b.life>0);
  for(const f of flashes) f.life-=dt; flashes=flashes.filter(f=>f.life>0);
  for(const b of barks) b.d-=dt; barks=barks.filter(b=>b.d>0&&!(b.e.dead));
  for(const q of particles){ q.life-=dt; q.vy+=q.g*dt; q.x+=q.vx*dt; q.y+=q.vy*dt; if(q.kind===0&&q.g>0&&solidAt(q.x,q.y)){ q.vy*=-0.3; q.vx*=0.5; q.y-=1; } }
  particles=particles.filter(q=>q.life>0);
  { const tp=TP(Math.floor((cam+W/2)/T)); if(tp.snow&&LVL.sky&&Math.random()<dt*30) part(cam+rnd(-40,W+40),-4,rnd(-20,-6),rnd(30,50),rnd(5,7),Math.random()<0.7?'#f2f7fb':'#c8d6e2',Math.random()<0.3?2:1,0); else if(tp.ice&&Math.random()<dt*5) part(cam+rnd(W),rnd(40,220),rnd(-6,6),rnd(-8,8),rnd(2,4),'#bfe8ff',1,0); }
  if(TP(Math.floor((cam+W/2)/T)).alien&&Math.random()<dt*6) part(cam+rnd(W),H+4,rnd(-6,6),rnd(-30,-12),rnd(3,6),Math.random()<0.5?'#4dffc3':'#ff6ad5',1,0);
  for(const po of portals){ po.t+=dt; if(po.t>0&&!po.played){ po.played=true; sfxAt('portal',po); } if(!po.spawned&&po.t>0.45){ po.spawned=true; const e=makeEnemy(po.type,po.x,po.feet); e.alert=true; e.cd=1; e.tag=po.tag; e.summoned=po.tag==='boss'; enemies.push(e); } }
  portals=portals.filter(po=>po.t<(po.big?1.6:1.0));
  if(exitPortal){ exitPortal.t+=dt; if(Math.random()<0.6){ const a=rnd(6.28); part(exitPortal.x+Math.cos(a)*30,exitPortal.y+Math.sin(a)*30,-Math.cos(a)*40,-Math.sin(a)*40,0.7,LVL.arena&&LVL.arena.home?'#cfe8ff':'#9dff5a',1.5,0); }
    if(!p.dead&&Math.hypot(p.x+p.w/2-exitPortal.x,p.y+p.h/2-exitPortal.y)<22&&exitPortal.t>0.8){ flash=1; flashCol=LVL.arena&&LVL.arena.home?'#e8f4ff':'#c8ffb0'; completeLevel(); } }
  if(LVL.exit&&p.x>LVL.exit*T&&!p.dead&&r2ExitOk()) completeLevel();
  // camera
  const lock=bossActive&&boss&&LVL.arena.lock!==false;
  const tc=lock?lockCam():clamp(p.x+p.w/2-W/2+p.face*36,0,COLS*T-W);
  cam+=(tc-cam)*Math.min(1,dt*5);
  shake=Math.max(0,shake-dt*25); flash=Math.max(0,flash-dt*1.6); dmgFlash=Math.max(0,dmgFlash-dt*1.5);
  if(msg){ msg.age+=dt; if(msg.age>msg.d) msg=null; }
  const zx=Math.floor(p.x/T); let ta=TP(zx).amb; if(LVL.vent&&zx>=LVL.vent[0]&&zx<=LVL.vent[1]) ta=0.62; amb+=(ta-amb)*dt*2;
}

