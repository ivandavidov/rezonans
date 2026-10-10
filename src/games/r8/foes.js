/* ================= РЕЗОНАНС 8 · ВРАГОВЕ =================
   Искрата — кълбо ток от скъсаните жици: тича и скача към Вела. Минувачът — отпечатък на жител от старата карта: върви
   по своя път и блъска, ако му се изпречиш. Табелата — знак на стълб, стреля. Гълъбите — ято, налита на вълни.
   Останалите (дронове, войници…) — от двигателя. */
defFoe('r8spark',{dims:[10,10,18],glow:true,mech:true,noTorch:true,upd:(e,dt)=>{
  const p=player, dx=p.x+p.w/2-(e.x+e.w/2), dy=p.y+p.h/2-(e.y+e.h/2), d=Math.hypot(dx,dy); e.anim+=dt*12; e.bite-=dt; e.cd-=dt;
  if(!e.alert&&d<170&&!p.dead) e.alert=true;
  if(e.onGround){
    if(e.alert&&!p.dead){ e.face=sgn(dx); if(e.cd<=0&&Math.abs(dx)<120){ e.vy=-260; e.vx=e.face*130*D.bspd; e.cd=rnd(0.9,1.5)*D.rate; } else e.vx=e.face*55*D.bspd; if(wallAhead(e,e.face)) e.vy=-280; }
    else { e.vx=e.side*25; if(wallAhead(e,e.side)) e.side=-e.side; } }
  physics(e,dt);
  if(!p.dead&&ov(e,p)&&e.bite<=0){ hurtPlayer(8,sgn(dx||1)*100); e.bite=0.8; sparks(e.x+5,e.y+5,6,'#bfe8ff'); sfxAt('zapS',e); } },
  dieFx:(e,cx,cy)=>{ sparks(cx,cy,14,'#bfe8ff'); sfxAt('zapS',e); }});
defFoe('r8spark',{draw:e=>{ if(e.dead&&e.deadT>0.3) return; const x=Math.round(e.x+e.w/2-cam), y=Math.round(e.y+e.h/2); ctx.save(); if(e.dead) ctx.globalAlpha=1-e.deadT/0.3;
  ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(x,y,1,x,y,12); g.addColorStop(0,'rgba(200,240,255,0.9)'); g.addColorStop(1,'rgba(80,160,255,0)'); ctx.fillStyle=g; ctx.fillRect(x-12,y-12,24,24);
  ctx.strokeStyle=e.hitT>0?'#ffffff':'#bfe8ff'; ctx.lineWidth=1; ctx.beginPath();
  for(let i=0;i<4;i++){ const a=e.anim+i*1.57, r=5+Math.sin(e.anim*3+i)*2; ctx.moveTo(x,y); ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r); ctx.lineTo(x+Math.cos(a+0.5)*(r+2),y+Math.sin(a+0.5)*(r+2)); }
  ctx.stroke(); ctx.fillStyle='#ffffff'; ctx.fillRect(x-2,y-2,4,4); ctx.restore(); }});
defFoe('r8walker',{dims:[12,26,30],noTorch:true,upd:(e,dt)=>{
  const p=player; e.anim+=dt*6; e.bite-=dt;
  if(e.onGround){ e.vx=e.side*28*D.bspd; if(wallAhead(e,e.side)||!solidAt(e.x+e.w/2+e.side*10,e.y+e.h+4)) e.side=-e.side; e.face=e.side; }
  physics(e,dt);
  if(!p.dead&&ov(e,p)&&e.bite<=0){ hurtPlayer(7,e.side*160); e.bite=1; } },
  dieFx:(e,cx,cy)=>{ for(let i=0;i<16;i++) part(cx+rnd(-5,5),cy+rnd(-12,12),rnd(-30,30),rnd(-60,-10),rnd(0.4,0.8),'#8a9ab8',2,0); }});
defFoe('r8walker',{draw:e=>{ begin(e); if(e.dead&&!fade(e,0)){ ctx.restore(); return; } if(!e.dead) ctx.globalAlpha=0.78; tint=e.hitT>0?'#ffffff':null;
  const s=Math.sin(e.anim)*2; px(-5,-24,10,14,'#2a3044'); px(-3,-30,6,6,'#34405a'); px(-4,-31,8,2,'#1a1e2a'); px(-6,-25,12,2,'#1a1e2a');
  px(-4,-10,3,10+Math.round(s*0.5),'#20263a'); px(1,-10,3,10-Math.round(s*0.5),'#20263a'); px(3,-20,2,8,'#2a3044'); px(1,-29,1,1,'#9ab0d8');
  tint=null; ctx.globalAlpha=1; ctx.restore(); }});
/* Табелата — пътен знак на стълб: обръща стрелката към Вела и стреля по нея (неподвижна, като картечница). */
defFoe('r8sign',{dims:[14,30,40],fixed:true,noKnock:true,mech:true,upd:(e,dt)=>{
  const p=player, ex=e.x+e.w/2, ey=e.y+8, dx=p.x+p.w/2-ex, dy=p.y+p.h/2-ey, d=Math.hypot(dx,dy)||1; e.anim+=dt; e.cd-=dt;
  if(!e.alert&&d<230&&los(ex,ey,p.x+p.w/2,p.y+p.h/2)) e.alert=true; if(e.alert) e.face=sgn(dx)||e.face; e.aim=Math.atan2(dy,dx);
  if(e.alert&&!p.dead&&e.cd<=0&&d<260&&los(ex,ey,p.x+p.w/2,p.y+p.h/2)){ e.cd=rnd(1.4,2)*D.rate; e.shot=0.15; const sp=170*D.bspd;
    ebullets.push({x:ex,y:ey,vx:dx/d*sp,vy:dy/d*sp,life:3,dmg:8,r:3,orb:true}); sfxAt('laser',e); }
  e.shot=Math.max(0,(e.shot||0)-dt); },
  dieFx:(e,cx,cy)=>{ sparks(cx,e.y+8,12,'#ffd27a'); for(let i=0;i<6;i++) part(cx,e.y+8,rnd(-80,80),rnd(-140,-40),rnd(0.4,0.8),'#e8ecf0',2,400); }});
defFoe('r8sign',{draw:e=>{ if(e.dead&&e.deadT>0.6) return; const x=Math.round(e.x+e.w/2-cam), y=Math.round(e.y), fy=Math.round(e.y+e.h); ctx.save(); if(e.dead) ctx.globalAlpha=1-e.deadT/0.6;
  ctx.fillStyle='#3a4048'; ctx.fillRect(x-1,y+12,3,fy-y-12); ctx.fillRect(x-4,fy-2,9,2);
  ctx.fillStyle=e.hitT>0?'#ffffff':'#2a6ad8'; ctx.fillRect(x-7,y,14,14); ctx.fillStyle='#e8ecf0'; ctx.fillRect(x-6,y+1,12,12); ctx.fillStyle=e.hitT>0?'#ffffff':'#2a6ad8'; ctx.fillRect(x-5,y+2,10,10);
  ctx.save(); ctx.translate(x,y+7); ctx.rotate(e.aim||0); ctx.fillStyle=e.shot>0?'#ffd27a':'#ffffff'; ctx.fillRect(-3,-1,6,2); ctx.beginPath(); ctx.moveTo(4,-3); ctx.lineTo(7,0); ctx.lineTo(4,3); ctx.fill(); ctx.restore();
  ctx.restore(); }});
/* Гълъбите — ято: първият гълъб довежда още двама; кръжат около мястото си и се спускат към Вела на вълни. */
defFoe('r8pigeon',{dims:[10,8,8],fly:true,noTorch:true,upd:(e,dt)=>{
  const p=player; e.anim+=dt; e.bite-=dt; e.cd-=dt;
  if(e.flock==null){ e.flock=1; e.hy=e.y; for(const o of [-14,14]){ const q=makeEnemy('r8pigeon',e.x+e.w/2+o,e.y+e.h+rnd(-6,6)); if(rectSolid(q.x,q.y,q.w,q.h)) continue;   // само на свободно място
    q.flock=1; q.hy=q.y; q.cd=e.cd+rnd(0.4,1.2); q.summoned=e.summoned; enemies.push(q); } }
  const ex=e.x+e.w/2, ey=e.y+e.h/2, dx=p.x+p.w/2-ex, dy=p.y+p.h/2-ey, d=Math.hypot(dx,dy)||1;
  if(!e.alert&&d<170&&!p.dead) e.alert=true;
  if(e.dive>0){ e.dive-=dt; } else if(e.alert&&e.cd<=0&&!p.dead&&d<200){ e.dive=1; e.cd=rnd(1.8,2.8)*D.rate; e.tx=dx/d; e.ty=dy/d; }
  let tvx, tvy; if(e.dive>0){ const sp=150*D.bspd; tvx=e.tx*sp; tvy=e.ty*sp; } else { tvx=Math.cos(e.anim*1.7+e.home)*40+(e.alert?sgn(dx)*20:0); tvy=(e.hy-e.y)*2+Math.sin(e.anim*2.3)*20; }
  e.vx+=(tvx-e.vx)*Math.min(1,dt*4); e.vy+=(tvy-e.vy)*Math.min(1,dt*4); moveX(e,e.vx*dt); moveY(e,e.vy*dt); e.face=sgn(e.vx)||e.face;
  if(!p.dead&&e.bite<=0&&ov(e,p)){ hurtPlayer(5,sgn(e.vx||1)*80); e.bite=0.8; e.dive=0; } },
  dieFx:(e,cx,cy)=>{ for(let i=0;i<10;i++) part(cx,cy,rnd(-50,50),rnd(-60,20),rnd(0.5,1),i%2?'#8a8e98':'#e8ecf0',1,120); }});
defFoe('r8pigeon',{draw:e=>{ begin(e); if(e.dead&&!fade(e,0.1)){ ctx.restore(); return; } tint=e.hitT>0?'#ffffff':null; const w=Math.sin(e.anim*18)>0?-3:1;
  px(-4,-6,8,5,'#8a8e98'); px(2,-8,3,3,'#6a6e78'); px(4,-7,2,1,'#c8a050'); px(3,-7,1,1,'#ff6a3a'); px(-3,-6+w,5,2,'#b8bcc6'); px(-6,-5,2,2,'#6a6e78'); px(-1,-1,1,1,'#c84a5a'); px(1,-1,1,1,'#c84a5a');
  tint=null; ctx.globalAlpha=1; ctx.restore(); }});
