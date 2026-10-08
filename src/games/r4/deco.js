/* ================= РЕЗОНАНС 4 · ДЕКОРАЦИИ И НОВИ ВРАГОВЕ ================= */
function plSign(tx,ty,t){ drawSign(tx,ty,t,'#f0dca0','#3a2a40'); }
function plLamp(tx,fy){ const x=tx*T+7; R(x,fy-44,2,44,'#2a2a2e'); R(x-1,fy-6,4,6,'#3a3a40'); R(x-5,fy-50,12,2,'#2a2a2e'); R(x-4,fy-48,10,6,'#3a3a40'); R(x-3,fy-47,8,4,'#ffe2a0'); lightDot(x+1,fy-45,'#ffd890'); }
function plTree(x,fy,s=1){ const h=34*s; R(x-1,fy-h*0.45,3,h*0.45,'#3a2a1c'); for(let i=0;i<9;i++){ const a=hash(Math.round(x)+i,fy), b=hash(fy,Math.round(x)+i); lx.fillStyle=['#c86a2a','#e0a03a','#8a5a2a','#d8862a'][i%4]; lx.beginPath(); lx.arc(x+(a-0.5)*22*s,fy-h*0.55-b*h*0.45,(6+a*5)*s,0,7); lx.fill(); } }
function mausoleum(tx,fy){ const x=tx*T; R(x,fy-60,96,60,'#cfc4a8'); R(x,fy-60,96,3,'#e8e0c8'); for(let i=0;i<5;i++) R(x+8+i*18,fy-50,8,40,'#b8ac90');
  lx.fillStyle='#3a3a30'; for(let i=0;i<4;i++){ lx.beginPath(); lx.arc(x+17+i*18+4,fy-34,4,Math.PI,0); lx.fill(); lx.fillRect(x+17+i*18,fy-34,8,18); }
  R(x+30,fy-84,36,24,'#d8ccb0'); lx.fillStyle='#8a9a7a'; lx.beginPath(); lx.arc(x+48,fy-84,18,Math.PI,0); lx.fill(); lx.fillStyle='#a8b894'; lx.beginPath(); lx.arc(x+48,fy-84,12,Math.PI,Math.PI*1.5); lx.fill();
  for(const o of [8,88]){ R(x+o-6,fy-72,12,12,'#d8ccb0'); lx.fillStyle='#8a9a7a'; lx.beginPath(); lx.arc(x+o,fy-72,6,Math.PI,0); lx.fill(); }
  R(x+47,fy-112,2,10,'#c8a050'); R(x+44,fy-108,8,2,'#c8a050'); R(x+40,fy-26,16,26,'#2a2620'); lx.fillStyle='#2a2620'; lx.beginPath(); lx.arc(x+48,fy-26,8,Math.PI,0); lx.fill(); }
function theatreFront(tx,fy){ const x=tx*T; R(x,fy-80,128,80,'#d8c8a0'); R(x,fy-84,128,6,'#ece0c0'); lx.fillStyle='#c8b890'; lx.beginPath(); lx.moveTo(x+10,fy-84); lx.lineTo(x+64,fy-108); lx.lineTo(x+118,fy-84); lx.closePath(); lx.fill();
  for(let i=0;i<6;i++){ R(x+12+i*20,fy-74,8,74,'#efe4c8'); R(x+12+i*20,fy-74,2,74,'#fff8e8'); R(x+10+i*20,fy-76,12,3,'#c0b088'); }
  for(let i=0;i<3;i++){ R(x+30+i*28,fy-30,14,30,'#3a2418'); R(x+31+i*28,fy-29,12,10,'#ffd890'); lightDot(x+37+i*28,fy-24,'#ffd890'); }
  lx.font='600 7px "IBM Plex Mono",monospace'; lx.fillStyle='#5a3a20'; lx.textBaseline='middle'; lx.fillText('ТЕАТЪР „ИВАН РАДОЕВ“',x+22,fy-90); }
function rotunda(tx,fy){ const x=tx*T, cx=x+64; R(x,fy-70,128,70,'#d0c8b8'); for(let i=0;i<8;i++) R(x+6+i*16,fy-64,6,58,'#b8b0a0'); R(x,fy-74,128,6,'#a8a090');
  lx.fillStyle='#7a8a8a'; lx.beginPath(); lx.ellipse(cx,fy-74,62,36,0,Math.PI,0); lx.fill(); lx.fillStyle='#9aaaa8'; lx.beginPath(); lx.ellipse(cx,fy-74,50,28,0,Math.PI*1.15,Math.PI*1.6); lx.lineTo(cx,fy-74); lx.fill(); R(cx-4,fy-116,8,6,'#9aaaa8');
  R(cx-14,fy-30,28,30,'#2a2a26'); lx.font='600 6px "IBM Plex Mono",monospace'; lx.fillStyle='#4a4436'; lx.textBaseline='middle'; lx.fillText('ПАНОРАМА · 1877',cx-30,fy-40); }
function cannon(tx,fy,f=1){ const x=tx*T+8; lx.save(); lx.translate(x,fy-8); lx.scale(f,1); lx.fillStyle='#2a2a26'; lx.save(); lx.rotate(-0.25); lx.fillRect(-4,-4,26,7); lx.fillRect(18,-5,4,9); lx.restore(); lx.fillStyle='#4a3420'; lx.fillRect(-12,-2,18,4); lx.fillStyle='#3a2616'; lx.beginPath(); lx.arc(-2,2,7,0,7); lx.fill(); lx.fillStyle='#6a4a2a'; lx.beginPath(); lx.arc(-2,2,5,0,7); lx.fill(); lx.fillStyle='#3a2616'; lx.fillRect(-3,-3,2,10); lx.fillRect(-7,1,10,2); lx.restore(); }
function gabion(tx,fy){ const x=tx*T; for(let i=0;i<3;i++){ R(x+i*5,fy-12,4,12,'#6a5232'); R(x+i*5,fy-12,4,1,'#8a7048'); } R(x-1,fy-8,16,1,'#4a3820'); }
function stakes(t0,t1,fy){ for(let x=t0*T;x<(t1+1)*T;x+=5){ lx.strokeStyle='#5a4228'; lx.lineWidth=2; lx.beginPath(); lx.moveTo(x,fy); lx.lineTo(x+4,fy-14); lx.stroke(); } lx.lineWidth=1; }
function paintFig(x,fy,k){ const h=22+hash(x,k)*6; lx.fillStyle=`rgba(70,56,40,${0.35+hash(k,x)*0.2})`; lx.fillRect(x-3,fy-h,6,h-6); lx.fillRect(x-4,fy-6,3,6); lx.fillRect(x+1,fy-6,3,6); lx.beginPath(); lx.arc(x,fy-h-3,3,0,7); lx.fill(); lx.fillRect(x+3,fy-h+3,10,1); }
function smokePuff(x,y,r){ lx.fillStyle='rgba(240,232,214,0.35)'; for(let i=0;i<5;i++){ lx.beginPath(); lx.arc(x+(hash(x,i)-0.5)*r*1.6,y+(hash(i,y)-0.5)*r*0.8,r*(0.5+hash(i,x)*0.5),0,7); lx.fill(); } }
function frameEdge(t0,t1){ for(let x=t0*T;x<(t1+1)*T;x++){ R(x,0,1,6,'#6a5032'); R(x,6,1,2,'#c8a050'); } }
function antCol(tx,fy,h,broken){ const x=tx*T+3; R(x,fy-h,10,h,broken?'#a89a7c':'#d8ccaa'); R(x,fy-h,2,h,broken?'#8a7e64':'#efe4c8'); if(!broken){ R(x-2,fy-h-4,14,4,'#c8bc98'); R(x-2,fy-4,14,4,'#c8bc98'); } else R(x+2,fy-h-2,6,2,'#8a7e64'); }
function wineBarrels(tx,fy,n=3){ const x=tx*T; for(let i=0;i<n;i++){ const bx=x+i*22; lx.fillStyle='#5a3a1e'; lx.beginPath(); lx.ellipse(bx+10,fy-11,11,11,0,0,7); lx.fill(); lx.fillStyle='#3a2410'; lx.beginPath(); lx.ellipse(bx+10,fy-11,7,7,0,0,7); lx.fill(); R(bx+9,fy-12,2,2,'#c8a050'); R(bx-1,fy-22,22,1,'#2a1a0c'); } }
function bottleRack(tx,fy){ const x=tx*T; R(x,fy-40,30,40,'#2a1e14'); for(let r=0;r<6;r++) for(let c=0;c<5;c++){ R(x+2+c*6,fy-38+r*6,4,4,'#120c08'); if(hash(c+tx,r)>0.35) R(x+3+c*6,fy-37+r*6,2,2,hash(r,c+tx)>0.5?'#3a6a2a':'#5a1a20'); } }
function stalac(x,y,h,up){ lx.fillStyle='#4a4a52'; lx.beginPath(); if(up){ lx.moveTo(x-4,y); lx.lineTo(x,y-h); lx.lineTo(x+4,y); } else { lx.moveTo(x-4,y); lx.lineTo(x,y+h); lx.lineTo(x+4,y); } lx.closePath(); lx.fill(); }
function k2Sign(tx,ty,t){ drawSign(tx,ty,t,'#1a2a20','#c8c09a'); }
function curtains(t0,t1){ for(let x=t0*T;x<(t1+1)*T;x+=6){ R(x,2*T,4,4*T+((x/6)%3)*6,'#7a1a20'); R(x,2*T,1,4*T,'#9a2a2a'); } R(t0*T,2*T,(t1-t0+1)*T,6,'#c8a050'); }
function puppetHang(x,y){ R(x,2*T,1,y-2*T,'rgba(220,210,190,0.5)'); R(x-3,y,6,8,'#c8a070'); R(x-2,y-6,4,5,'#e8c8a0'); R(x-4,y+8,2,8,'#8a2a2a'); R(x+2,y+8,2,8,'#8a2a2a'); R(x-6,y+1,3,6,'#c8a070'); R(x+3,y+1,3,6,'#c8a070'); }
function invTower(tx,top,h){ const x=tx*T; R(x,top,30,h,'rgba(150,120,210,0.25)'); for(let y=top+6;y<top+h-6;y+=10) R(x+6,y,4,4,'rgba(255,255,255,0.5)'); }

/* ---------- нови врагове ---------- */
Object.assign(DIMS,{puppet:[12,24,45],shade:[12,26,45]});
R2UPD.puppet=(e,dt)=>{ updZombie(e,dt); e.mech=true; };
R2DRAW.puppet=e=>{ const jx=Math.round(Math.sin(e.anim*7)*1.5);
  if(!e.dead){ ctx.strokeStyle='rgba(230,220,200,0.45)'; ctx.lineWidth=1; for(const ox of [-5,0,5]){ ctx.beginPath(); ctx.moveTo(e.x+e.w/2+ox-cam,e.y-2); ctx.lineTo(e.x+e.w/2+ox*3-cam,Math.max(0,e.y-160)); ctx.stroke(); } }
  begin(e); tint=e.hitT>0?'#fff':null;
  if(e.dead){ if(fade(e,3)){ px(-8,-3,16,3,'#a87a46'); px(-3,-5,5,3,'#e8c8a0'); px(4,-2,4,2,'#8a2a2a'); } ctx.globalAlpha=1; tint=null; ctx.restore(); return; }
  const w=Math.abs(e.vx)>1?Math.round(Math.sin(e.anim*8)*2):0, sw=e.state==='swing';
  px(-4+w,-9,2,9,'#6a2a2a'); px(2-w,-9,2,9,'#6a2a2a'); px(-4+w,-2,3,2,'#2a1a10'); px(2-w,-2,3,2,'#2a1a10');
  px(-5,-19,10,10,'#a83a2a'); px(-5,-19,10,2,'#c8a050'); px(-1,-17,2,6,'#c8a050');
  px(-6,-18+jx,2,8,'#e8c8a0'); px(4,-18-jx+(sw?-5:0),2,8,'#e8c8a0');
  px(-3,-25,7,6,'#f0d8b8'); px(-2,-23,1,1,'#2a1a1a'); px(2,-23,1,1,'#2a1a1a'); px(-1,-21,3,1,'#c83a3a'); px(-4,-26,9,2,'#3a2a1a');
  px(-1,-20,1,1,'#2a1a10'); px(1,-20,1,1,'#2a1a10'); tint=null; ctx.restore(); };
R2UPD.shade=(e,dt)=>{ updSoldier(e,dt); e.mech=true; };
R2DRAW.shade=e=>{ begin(e); tint=e.hitT>0?'#fff':null; const fl=0.55+Math.sin(e.anim*5+e.x)*0.12; ctx.globalAlpha=e.dead?Math.max(0,0.6-e.deadT*0.8):fl;
  if(e.dead){ px(-8,-4,16,4,'#b8a888'); ctx.globalAlpha=1; tint=null; ctx.restore(); return; }
  const w=Math.abs(e.vx)>1?Math.round(Math.sin(e.anim*6)*2):0;
  px(-4+w,-10,3,10,'#7a6e5a'); px(1-w,-10,3,10,'#7a6e5a'); px(-5,-22,10,13,'#9a8c72'); px(-6,-12,12,3,'#8a7c64');
  px(-3,-27,7,5,'#c8b898'); px(-4,-30,9,3,'#6a604e'); px(2,-20,12,2,'#5a5040'); px(13,-21,4,1,'#d8d0c0');
  ctx.globalAlpha=1; tint=null; ctx.restore();
  if(!e.dead&&Math.random()<0.15) part(e.x+rnd(e.w),e.y+rnd(e.h),rnd(-10,10),rnd(-30,-10),0.6,'#e8d8b0',1,0); };
