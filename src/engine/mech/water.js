/* ================= МЕХАНИКА · ВОДА, ПЛУВАНЕ, БЕЗТЕГЛОВНОСТ, НАВОДНЕНИЕ =================
   Плочки 'w'; LVL.flood ({y,rate,top,wait,x0,x1,msg}) — надигаща се вода; LVL.zeroG / LVL.zgZones — безтегловност.
   Под водата въздухът свършва; мехурчетата ('air') го пълнят. */
let FLOOD=null, airWarned=false;
function isWater(x,y){ const c=tileP(x,y); if(c==='w') return true; if(FLOOD&&y>FLOOD.y&&x>=FLOOD.x0&&x<FLOOD.x1&&!solidAt(x,y)) return true; return false; }
function waterMove(p,dt,dir,U,Dn){
  if(p.leapT>0){ p.leapT-=dt; p.swim=false; return false; }
  const cx=p.x+p.w/2, wet=isWater(cx,p.y+p.h*0.8), zg=!!LVL.zeroG||inZG(p);
  p.wet=wet; p.headWet=wet&&isWater(cx,p.y+4);
  if((!wet&&!zg)||p.climb){ if(p.swim){ p.swim=false; } return false; }
  if(!p.swim){ p.swim=true; if(p.crouch){ p.crouch=false; p.y-=12; p.h=26; } if(wet&&p.vy>140){ for(let i=0;i<12;i++) part(cx+rnd(-8,8),p.y+p.h*0.5,rnd(-60,60),rnd(-120,-40),0.5,'#bfe8ff',1.5,400); SFX.land(); } }
  const acc=zg?320:560, max=zg?135:100, vmax=zg?135:150, drag=zg?0.55:3.0;
  const ay=(Dn?1:0)-(U?1:0);
  if(dir){ p.vx+=dir*acc*dt; p.face=dir; }
  if(ay) p.vy+=ay*acc*dt;
  else if(wet&&!zg){ const nearSurf=!isWater(cx,p.y-12); if(p.headWet&&nearSurf) p.vy+=(-45-p.vy)*Math.min(1,dt*3); else if(!p.headWet) p.vy*=Math.pow(0.02,dt); else p.vy*=Math.pow(0.15,dt); }
  if(pressed.jump){
    if(wet&&!zg&&!isWater(cx,p.y-8)){ p.vy=JUMP*0.95; p.swim=false; p.leapT=0.45; p.vx+=dir*40; SFX.jump(); for(let i=0;i<8;i++) part(cx+rnd(-6,6),p.y+p.h*0.5,rnd(-50,50),rnd(-100,-30),0.4,'#bfe8ff',1.5,400); }
    else if(zg){ const ix=dir||0, iy=ay||(dir?0:-1); p.vx+=ix*110; p.vy+=iy*110; for(let i=0;i<6;i++) part(cx-ix*6,p.y+p.h/2-iy*6,-ix*80+rnd(-20,20),-iy*80+rnd(-20,20),0.4,'#9fe8ff',1.5,0); SFX.jump(); }
    else { p.vy=Math.min(p.vy,-185); p.anim+=1; }
  }
  if(p.swim){
    p.vx-=p.vx*Math.min(1,drag*dt); p.vy-=p.vy*Math.min(1,(zg?drag:drag*0.6)*dt);
    p.vx=clamp(p.vx,-max,max); p.vy=clamp(p.vy,-vmax*(zg?1:1.4),vmax);
  }
  moveX(p,p.vx*dt); moveY(p,p.vy*dt);
  if(zg){ p.onGround=false; }
  if(Math.abs(p.vx)+Math.abs(p.vy)>20) p.anim+=dt*8;
  p.coyote=0;
  return true;
}
defMech('water',{
  load(){ FLOOD=null; airWarned=false; const L=LVL;
  if(player){ player.air=100; player.swim=false; player.wet=false; player.headWet=false; }
  if(L.flood) FLOOD={y:L.flood.y*T, y0:L.flood.y*T, rate:L.flood.rate, top:L.flood.top*T, on:!L.flood.wait, x0:(L.flood.x0||0)*T, x1:(L.flood.x1||COLS)*T};
  },
  update(dt){ const p=player;
  // air
  if(!p.dead){
    if(p.headWet){ p.air-=dt*100/[22,15,11][DI]; if(p.air<30&&!airWarned){ airWarned=true; showMsg('Въздухът свършва — изплувай или намери мехурчета!',2.5); }
      if(p.air<=0){ p.air=0; p.drownT=(p.drownT||0)-dt; if(p.drownT<=0){ p.drownT=0.6; hurtPlayer(7,0,true); } }
      if(Math.random()<dt*2.5) part(p.x+p.w/2+p.face*4,p.y+6,rnd(-6,6),rnd(-40,-25),1.2,'#cfefff',1.5,-10); }
    else { if(p.air<100) p.air=Math.min(100,p.air+dt*60); if(p.air>60) airWarned=false; }
  }
  // flood
  if(FLOOD&&FLOOD.on){ const far=FLOOD.y-(p.y+p.h)>8*T; FLOOD.y=Math.max(FLOOD.top,FLOOD.y-FLOOD.rate*[0.7,1,1.25][DI]*(far?1.8:1)*dt); if(Math.random()<dt*0.5) sfxAt('steam',{x:p.x,y:FLOOD.y,w:0}); }
  if(FLOOD&&FLOOD.drain){ FLOOD.y=Math.min(FLOOD.y0,FLOOD.y+70*dt); if(FLOOD.y>=FLOOD.y0) FLOOD.drain=false; }
  if(LVL.flood&&LVL.flood.wait&&FLOOD&&!FLOOD.on&&!FLOOD.drain&&FLOOD.y>=FLOOD.y0&&p.x>LVL.flood.wait*T&&!MT.floodDone){ FLOOD.on=true; MT.floodDone=true; shake=8; showMsg(LVL.flood.msg||'Водата нахлува!',2.5); }
  },
  respawn(){ const p=player; p.air=100; p.swim=false;
  if(FLOOD){ const g=groundY(cp); FLOOD.y=Math.max(FLOOD.y,Math.min(FLOOD.y0,g+3*T)); }
  },
  move:waterMove,
  drawWorld(){
  // water overlay
  const c0=Math.max(0,Math.floor(cam/T)-1), c1=Math.min(COLS-1,Math.floor((cam+W)/T)+1);
  ctx.save();
  for(let tx=c0;tx<=c1;tx++) for(let ty=0;ty<ROWS;ty++){ if(map[ty][tx]!=='w') continue; const x=tx*T-cam, y=ty*T, top=ty===0||map[ty-1][tx]!=='w';
    { const P=TP(tx); ctx.fillStyle=top?(P.wTop||'rgba(40,150,200,0.38)'):(P.wDeep||'rgba(20,90,150,0.42)'); } ctx.fillRect(x,y,T,T);
    if(top){ const wv=Math.sin(titleT*3+tx*0.9)*1.5; ctx.fillStyle='rgba(190,240,255,0.55)'; ctx.fillRect(x,y+2+wv,T,1); } }
  if(FLOOD){ const y=FLOOD.y, x0=Math.max(FLOOD.x0-cam,0), x1=Math.min(FLOOD.x1-cam,W); if(y<H){ ctx.fillStyle='rgba(20,100,160,0.42)'; ctx.fillRect(x0,y,x1-x0,H-y); ctx.fillStyle='rgba(190,240,255,0.6)'; for(let x=Math.floor(x0);x<x1;x+=2) ctx.fillRect(x,Math.round(y+Math.sin(titleT*3+(x+cam)*0.12)*1.5),2,1); } }
  ctx.restore();
  },
  lights(L){
  if(FLOOD&&FLOOD.y<H) L.push([player.x,FLOOD.y,60,0.3]);
  },
  postFx(){
  const p=player;
  if(p&&p.headWet){ ctx.fillStyle='rgba(10,70,110,0.28)'; ctx.fillRect(0,0,W,H); }
  } });
/* ---------- pickups ---------- */
defItem('air',{take:k=>{ const p=player; if(p.air>=99) return false; p.air=Math.min(100,p.air+45); SFX.pickup(); for(let i=0;i<10;i++) part(k.x+6,k.y+5,rnd(-30,30),rnd(-60,-10),0.6,'#cfefff',1.5,-20); }});
defItem('air',{draw:(k,x,y)=>{ const a=titleT*3+k.bob; for(let i=0;i<3;i++){ const bx=x+6+Math.sin(a+i*2)*3, by=y+8-((titleT*14+i*6)%14); ctx.strokeStyle='rgba(220,250,255,0.85)'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(bx,by,2+i*0.6,0,7); ctx.stroke(); } ctx.fillStyle='rgba(160,230,255,0.25)'; ctx.beginPath(); ctx.arc(x+6,y+4,7,0,7); ctx.fill(); }});
