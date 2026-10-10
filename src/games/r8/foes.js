/* ================= РЕЗОНАНС 8 · ВРАГОВЕ =================
   Искрата — кълбо ток от скъсаните жици: тича и скача към Вела. Минувачът — отпечатък на жител от старата карта: върви
   по своя път и блъска, ако му се изпречиш. Останалите (дронове, войници…) — от двигателя. */
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
