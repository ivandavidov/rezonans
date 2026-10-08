/* ================= ENEMIES ================= */
const ACID_DIE={soldier:1,zombie:1,shocker:1,guard:1};
function groundAhead(e,dir){ const fx=dir>0?e.x+e.w+2:e.x-2, fy=e.y+e.h+3, c=tileP(fx,fy); if(tileP(fx,e.y+e.h-4)==='~') return false; return (SOLID.has(c)&&c!=='Z')||c==='-'||c==='H'; }
function wallAhead(e,dir){ return solidAt(dir>0?e.x+e.w+2:e.x-2,e.y+e.h-4); }
function convAt(e){ if(!e.onGround) return 0; return CONV[tileAt(Math.floor((e.x+e.w/2)/T),Math.floor((e.y+e.h+1)/T))]||0; }
function physics(e,dt){ e.vy=Math.min(e.vy+G*dt,520); moveX(e,e.vx*dt); moveY(e,e.vy*dt); const cv=convAt(e); if(cv) moveX(e,cv*60*dt); }
function crabTarget(e){
  const ex=e.x+e.w/2, ey=e.y+e.h/2; let best=null,bd=1e9;
  const cand=[]; if(!player.dead) cand.push({r:player,isP:true}); for(const s of scientists) if(s.state!=='dead'&&s.state!=='idle') cand.push({r:s,isP:false});
  for(const c of cand){ const d=Math.hypot(c.r.x+c.r.w/2-ex,c.r.y+c.r.h/2-ey)*(c.isP?1:0.8); if(d<bd){bd=d;best=c;} }
  return best;
}
function updCrab(e,dt){
  const tg=crabTarget(e); e.bite-=dt; e.anim+=dt*8;
  if(e.onGround){
    e.vx*=Math.pow(0.001,dt); e.leaping=false; e.t-=dt;
    if(tg){ const tx=tg.r.x+tg.r.w/2, ty=tg.r.y+tg.r.h/2, ex=e.x+e.w/2, ey=e.y+e.h/2, dx=tx-ex, dy=ty-ey, dist=Math.hypot(dx,dy);
      if(!e.alert&&dist<190&&los(ex,ey-2,tx,ty)) e.alert=true;
      if(e.alert){ e.face=sgn(dx);
        if(dist<175&&e.t<=0&&Math.abs(dy)<120&&los(ex,ey-2,tx,ty)){ const k=Math.sqrt(900/G); e.vx=sgn(dx)*clamp(Math.abs(dx)*1.5*k+40,80,235)*Math.min(1.15,D.bspd+0.15); e.vy=clamp(-190+dy*1.1,-340,-150)*k; e.leaping=true; e.t=rnd(1.0,1.7)*D.rate; sfxAt('crabLeap',e); }
        else if(dist<320) e.vx=sgn(dx)*28;
      }
    }
    if(Math.random()<dt*0.25) sfxAt('crabIdle',e);
  }
  physics(e,dt);
  if(tg&&ov(e,tg.r)){
    if(e.leaping){ if(tg.isP) hurtPlayer(12,sgn(e.vx)*120); else killSci(tg.r); e.leaping=false; e.vx*=-0.3; }
    else if(tg.isP&&e.bite<=0){ hurtPlayer(6); e.bite=0.8; }
  }
  if(rectHas(e.x,e.y,e.w,e.h,'~')){ e.dead=true; e.deadT=0; sfxAt('crabDie',e); }
}
function updShocker(e,dt){
  const p=player, pcx=p.x+p.w/2, pcy=p.y+p.h/2, ex=e.x+e.w/2, ey=e.y+10, dx=pcx-ex;
  e.anim+=dt;
  if(!e.alert){ if(Math.abs(dx)<300&&Math.abs(pcy-ey)<120&&los(ex,ey,pcx,pcy)){ e.alert=true; sfxAt('growl',e); } }
  else if(!p.dead){
    if(e.state!=='charge') e.face=sgn(dx);
    if(e.state==='idle'||e.state==='walk'){
      e.state='walk'; e.vx=Math.abs(dx)>150?e.face*32:0; if(!groundAhead(e,e.face)||wallAhead(e,e.face)) e.vx=0; e.cd-=dt;
      if(e.cd<=0&&Math.abs(dx)<300&&los(ex+e.face*7,ey,pcx,p.y+p.h-18)){ e.state='charge'; e.t=e.tmax=Math.max(0.5,0.85*D.react); e.vx=0; sfxAt('charge',e); }
    } else if(e.state==='charge'){
      e.vx=0; e.t-=dt; if(e.t>0.28){ e.aimX=pcx; e.aimY=p.y+p.h-18; }
      if(Math.random()<0.6) part(ex+e.face*8+rnd(-3,3),ey+rnd(-3,3),rnd(-20,20),rnd(-20,20),0.15,'#9dff6a',1,0);
      if(e.t<=0){ shockBolt(e); e.state='walk'; e.cd=rnd(1.6,2.6)*D.rate; }
    } else if(e.state==='stagger'){ e.t-=dt; e.vx*=0.9; if(e.t<=0) e.state='walk'; }
  } else e.vx=0;
  physics(e,dt);
}
function shockBolt(e){
  const ox=e.x+e.w/2+e.face*8, oy=e.y+10; let ax=e.aimX-ox, ay=e.aimY-oy; if(ax*e.face<10) ax=e.face*10; const L=Math.hypot(ax,ay), dx=ax/L, dy=ay/L;
  let ex=ox,ey=oy, hit=false;
  for(let d=0;d<340;d+=3){ ex=ox+dx*d; ey=oy+dy*d; if(solidAt(ex,ey)) break; const p=player; if(!hit&&ex>=p.x&&ex<=p.x+p.w&&ey>=p.y&&ey<=p.y+p.h){ hit=true; break; } }
  const pts=[]; const n=10; for(let i=0;i<=n;i++){ const t=i/n; pts.push([ox+(ex-ox)*t+(i&&i<n?rnd(-4,4):0),oy+(ey-oy)*t+(i&&i<n?rnd(-5,5):0)]); }
  bolts.push({pts,life:0.2,max:0.2}); sfxAt('zap',e); light(ox,oy,90,0.9,'rgba(140,255,110,'); light(ex,ey,60,0.8,'rgba(140,255,110,'); sparks(ex,ey,6,'#c8ff9a');
  if(hit) hurtPlayer(20,e.face*90);
}
function updSoldier(e,dt){
  const p=player, pcx=p.x+p.w/2, pcy=p.y+p.h/2, ex=e.x+e.w/2, eye=e.y+7, dx=pcx-ex, adx=Math.abs(dx), ady=Math.abs(pcy-(e.y+e.h/2));
  e.anim+=Math.abs(e.vx)*dt*0.18;
  const sees=!p.dead&&adx<360&&ady<130&&(sgn(dx)===e.face||adx<110||e.alert)&&los(ex,eye,pcx,pcy);
  if(sees&&!e.alert){ e.alert=true; sfxAt('radio',e); bark(e,(LVL.barks||['Ето го!','Огън!','Там е!'])[Math.floor(rnd((LVL.barks||[0,0,0]).length))]); e.cd=0.7*D.react; }
  if(!e.alert){
    e.vx=e.face*28; if(wallAhead(e,e.face)||!groundAhead(e,e.face)||Math.abs(e.x+e.w/2-e.home)>48){ e.face*=-1; e.vx=e.face*28; }
  } else if(!p.dead){
    e.lastSeen=sees?0:e.lastSeen+dt; e.face=sgn(dx);
    let want=0; if(adx>250) want=e.face; else if(adx<110) want=-e.face;
    e.vx=want*45; if(want&&(!groundAhead(e,want)||wallAhead(e,want))) e.vx=0;
    if(!e.onGround) e.vx=0;
    e.cd-=dt; e.gcd-=dt;
    if(e.burst>0){ e.bt-=dt; if(e.bt<=0){ soldierShoot(e); e.burst--; e.bt=0.11; } }
    else if(e.cd<=0&&sees){ e.burst=D.burst; e.bt=0; e.cd=rnd(1.1,1.8)*D.rate; }
    if(D.gren&&e.gcd<=0&&adx>90&&adx<300&&(sees||e.lastSeen<3)&&ady<90&&e.onGround){ throwGrenade(e); e.gcd=rnd(5.5,8.5)*D.rate; }
  } else e.vx=0;
  physics(e,dt);
}
function soldierShoot(e){
  const p=player, ox=e.x+e.w/2+e.face*9, oy=e.y+9, tx=p.x+p.w/2, ty=p.y+p.h-17;
  const a=Math.atan2(ty-oy,tx-ox)+rnd(-D.spread,D.spread); ebullets.push({x:ox,y:oy,vx:Math.cos(a)*330*D.bspd,vy:Math.sin(a)*330*D.bspd,life:1.6,dmg:7});
  sfxAt('soldierShot',e); light(ox,oy,50,0.7,'rgba(255,200,90,'); e.flashT=0.05;
}
function throwGrenade(e){
  const p=player, ox=e.x+e.w/2, oy=e.y+4, tx=p.x+p.w/2, ty=p.y+p.h-4, tt=0.95;
  grenades.push({x:ox,y:oy,vx:clamp((tx-ox)/tt,-300,300),vy:(ty-oy)/tt-0.5*G*tt,t:1.8,bossG:e===boss}); bark(e,'Граната!',1.4);
}
function updTurret(e,dt){
  const p=player, ox=e.x+e.w/2, oy=e.y+3, pcx=p.x+p.w/2, pcy=p.y+p.h-16;
  if(e.ang===undefined) e.ang=Math.PI;
  e.anim+=dt;
  const dist=Math.hypot(pcx-ox,pcy-oy), sees=!p.dead&&dist<340&&los(ox,oy,pcx,pcy);
  if(sees){
    if(!e.alert||!e.seen){ e.cd=Math.max(e.cd,0.8*D.react); sfxAt('turret',e); }
    e.alert=true; e.seen=true;
    const tg=Math.atan2(pcy-oy,pcx-ox), da=angDiff(tg,e.ang), rs=2.6/D.react*dt; e.ang+=clamp(da,-rs,rs);
    e.cd-=dt; if(e.burst<=0&&e.cd<=0&&Math.abs(da)<0.2){ e.burst=D.burst+1; e.bt=0; e.cd=1.5*D.rate; }
  } else { e.seen=false; e.ang+=Math.sin(e.anim*0.8)*dt*0.4; }
  if(e.burst>0){ e.bt-=dt; if(e.bt<=0){ e.burst--; e.bt=0.1; const a=e.ang+rnd(-D.spread,D.spread)*1.5, mx=ox+Math.cos(e.ang)*9, my=oy+Math.sin(e.ang)*9;
    ebullets.push({x:mx,y:my,vx:Math.cos(a)*340*D.bspd,vy:Math.sin(a)*340*D.bspd,life:1.5,dmg:6}); sfxAt('soldierShot',e); light(mx,my,40,0.6,'rgba(255,200,90,'); e.flashT=0.05; } }
}
function updFlyer(e,dt){
  const p=player, pcx=p.x+p.w/2, pcy=p.y+p.h/2, ex=e.x+e.w/2, ey=e.y+e.h/2, dx=pcx-ex, dy=pcy-ey, dist=Math.hypot(dx,dy)||1;
  e.anim+=dt; e.dropThrough=1; e.bite-=dt;
  if(!e.alert){ e.vx=Math.sin(e.anim*0.8)*20; e.vy=Math.sin(e.anim*2)*14; if(dist<260*(DI===2?1.25:1)&&los(ex,ey,pcx,pcy)){ e.alert=true; sfxAt('flyer',e); } }
  else if(p.dead){ e.vy=-30; e.vx*=0.95; }
  else if(e.state==='dive'){ e.t-=dt; if(e.t<=0||e.hitWall){ e.state='retreat'; e.t=0.7; } }
  else if(e.state==='retreat'){ e.vy=-90; e.vx=-sgn(dx)*60; e.t-=dt; if(e.t<=0) e.state='hover'; }
  else {
    e.state='hover'; const hx=pcx+e.side*70-ex, hy=pcy-75-ey, k=Math.min(1,dt*3);
    e.vx+=(clamp(hx*1.5,-85,85)-e.vx)*k; e.vy+=(clamp(hy*1.5,-85,85)+Math.sin(e.anim*5)*20-e.vy)*k;
    e.cd-=dt;
    if(e.cd<=0&&dist<210&&los(ex,ey,pcx,pcy)){ e.state='dive'; e.t=0.9; const sp=210*D.bspd; e.vx=dx/dist*sp; e.vy=dy/dist*sp; e.cd=rnd(1.6,2.8)*D.rate; e.side=-e.side; sfxAt('flyer',e); }
  }
  if(Math.abs(e.vx)>1) e.face=sgn(e.vx);
  const bx=moveX(e,e.vx*dt), by=moveY(e,e.vy*dt); e.hitWall=bx||by;
  if(!p.dead&&ov(e,p)&&e.bite<=0){ hurtPlayer(10,sgn(e.vx||dx)*100); e.bite=0.8; if(e.state==='dive'){ e.state='retreat'; e.t=0.7; } }
}
function updZombie(e,dt){
  const p=player, dx=p.x+p.w/2-(e.x+e.w/2), dy=(p.y+p.h/2)-(e.y+e.h/2), adx=Math.abs(dx);
  e.anim+=dt;
  if(!e.alert){ e.vx=0; if(adx<230&&Math.abs(dy)<90&&los(e.x+e.w/2,e.y+6,p.x+p.w/2,p.y+p.h/2)){ e.alert=true; sfxAt('zgroan',e); } }
  else if(!p.dead){
    if(e.state==='swing'){ e.vx=0; e.t-=dt; if(e.t<=0){ if(adx<24&&Math.abs(dy)<26) hurtPlayer(14,sgn(dx)*170); sfxAt('swingZ',e); e.state='walk'; e.cd=0.9*D.rate; } }
    else { e.state='walk'; e.face=sgn(dx); e.vx=e.face*(DI===2?36:DI===0?20:28); if(!groundAhead(e,e.face)||wallAhead(e,e.face)) e.vx=0; e.cd-=dt;
      if(adx<20&&Math.abs(dy)<26&&e.cd<=0){ e.state='swing'; e.t=Math.max(0.3,0.55*D.react); e.vx=0; }
      if(Math.random()<dt*0.12) sfxAt('zgroan',e); }
  } else e.vx=0;
  physics(e,dt);
}
function updNest(e,dt){
  const p=player, dist=Math.hypot(p.x+p.w/2-(e.x+e.w/2),p.y+p.h/2-(e.y+e.h/2));
  e.anim+=dt; e.kids=(e.kids||[]).filter(k=>!k.dead);
  if(!p.dead&&dist<330){ e.alert=true; e.cd-=dt; const cap=e.big?4:2+(DI===2?1:0);
    if(e.cd<=0&&e.kids.length<cap){ const fl=e.big&&Math.random()<0.4, k=makeEnemy(fl?'flyer':'crab',e.x+e.w/2,e.y+e.h-2); k.alert=true;
      if(!fl){ k.vy=-230*Math.sqrt(G/900); k.vx=sgn(p.x-e.x)*90; k.t=0.6; }
      enemies.push(k); e.kids.push(k); sfxAt('birth',e); blood(e.x+e.w/2,e.y+4,true,6); e.cd=(e.big?3.5:6)*D.rate; e.pop=0.3; } }
  e.pop=Math.max(0,(e.pop||0)-dt);
}
function updGuard(e,dt){
  const p=player, pcx=p.x+p.w/2, pcy=p.y+p.h/2, ex=e.x+e.w/2, ey=e.y+10, dx=pcx-ex, adx=Math.abs(dx), dy=pcy-(e.y+e.h/2);
  e.anim+=dt;
  if(!e.alert){ e.vx=0; if(adx<300&&Math.abs(dy)<120&&los(ex,ey,pcx,pcy)){ e.alert=true; sfxAt('growl',e); } }
  else if(!p.dead){
    e.face=sgn(dx);
    if(e.state==='punch'){ e.vx=0; e.t-=dt; if(e.t<=0){ if(adx<28&&Math.abs(dy)<30) hurtPlayer(18,e.face*240); sfxAt('swingZ',e); e.state='walk'; e.cd2=1.2*D.rate; } }
    else { e.state='walk'; const want=adx>170?e.face:0; e.vx=want*30; if(want&&(!groundAhead(e,want)||wallAhead(e,want))) e.vx=0;
      e.cd-=dt; e.cd2=(e.cd2||0)-dt;
      if(adx<24&&Math.abs(dy)<30&&e.cd2<=0){ e.state='punch'; e.t=Math.max(0.25,0.4*D.react); e.vx=0; }
      else if(e.cd<=0&&e.burst<=0&&adx<330&&los(ex,ey,pcx,pcy)){ e.burst=DI===0?2:DI===2?4:3; e.bt=0.3; e.cd=rnd(2.2,3.2)*D.rate; } }
    if(e.burst>0){ e.bt-=dt; if(e.bt<=0){ e.burst--; e.bt=0.2; const ox=ex+e.face*10, oy=e.y+11, a=Math.atan2(pcy-oy,pcx-ox)+rnd(-0.25,0.25);
      ebullets.push({x:ox,y:oy,vx:Math.cos(a)*165*D.bspd,vy:Math.sin(a)*165*D.bspd,life:3,dmg:8,r:2,orb:true,hornet:true}); sfxAt('hornet',e); e.flashT=0.08; } }
  } else e.vx=0;
  physics(e,dt);
}
function updScientist(s,dt){ if(s.esc) return updEscort(s,dt);
  s.anim+=dt*12;
  if(s.state==='dead'){ s.vx*=0.9; physics(s,dt); return; }
  if(s.state==='run'){ s.vx=95; s.face=1; if(s.onGround&&wallAhead(s,1)) s.vy=-300; if(s.x>57*T){ s.state='cower'; s.vx=0; bark(s,'Не ме оставяй тук!',3); } }
  else s.vx=0;
  physics(s,dt);
}
/* ---------- общите врагове (регистрите — engine/defs.js) ---------- */
defFoes('dims',{crab:[12,8,20],shocker:[14,28,60],soldier:[12,26,60],turret:[12,10,50],flyer:[14,10,24],zombie:[12,26,55],nest:[20,16,90],guard:[16,30,110],target:[14,23,1]});
defFoes('upd',{crab:updCrab,shocker:updShocker,soldier:updSoldier,turret:updTurret,flyer:updFlyer,zombie:updZombie,nest:updNest,guard:updGuard,target:updTarget});
defFoes('draw',{crab:drawCrab,shocker:drawShocker,soldier:drawSoldier,turret:drawTurret,flyer:drawFlyer,zombie:drawZombie,nest:drawNest,guard:drawGuard,target:drawTarget});

