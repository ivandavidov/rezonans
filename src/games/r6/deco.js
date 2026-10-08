/* ================= РЕЗОНАНС 6 · ДЕКОРАЦИИ И НОВИ ВРАГОВЕ ================= */
function acSign(tx,ty,t){ drawSign(tx,ty,t,'#fff0c8','#2a2440'); }
function acLamp(tx,fy){ const x=tx*T+7; R(x,fy-50,2,50,'#2a2c32'); R(x-6,fy-52,14,3,'#2a2c32'); R(x-5,fy-49,12,2,'#f4e8c0'); lightDot(x+1,fy-47,'#f4e8c0'); }
function acBlock(tx,fy,w,h,seed){ const x=tx*T; R(x,fy-h,w*T,h,'#4a4e56'); for(let yy=fy-h+6;yy<fy-8;yy+=14) for(let xx=x+4;xx<x+w*T-8;xx+=12){ R(xx,yy,8,8,'#1a1c24'); if(hash(xx+seed,yy)>0.6) R(xx+1,yy+1,6,6,hash(xx,yy+seed)>0.5?'#ffd890':'#8ac0ff'); } R(x,fy-h,w*T,3,'#5a5e66'); }
function acTree(x,fy,s=1){ R(x-1,fy-24*s,3,24*s,'#3a2a1c'); for(let i=0;i<8;i++){ const a=hash(Math.round(x)+i,fy), b=hash(i,Math.round(x)); lx.fillStyle=i%2?'#2a4a26':'#3a5e2e'; lx.beginPath(); lx.arc(x+(a-0.5)*28*s,fy-28*s-b*14*s,(8+a*5)*s,0,7); lx.fill(); } }
function acBench(tx,fy){ const x=tx*T; R(x,fy-8,28,3,'#6a4a2a'); R(x+2,fy-5,2,5,'#2a2a2a'); R(x+24,fy-5,2,5,'#2a2a2a'); R(x,fy-14,28,2,'#6a4a2a'); }
function acNiche(tx,ty){ const x=tx*T, y=ty*T; R(x+2,y+2,12,14,'#4a2a1e'); R(x+3,y+3,10,12,'#2a160e'); }
function acSteps(tx,fy,n){ for(let i=0;i<n;i++) R(tx*T+i*6,fy-3-i*3,8,3+i*3,'#8a5a3e'); }
function acAltar(tx,fy){ const x=tx*T; R(x,fy-14,32,14,'#8a7a62'); R(x+4,fy-18,24,4,'#a89a80'); R(x+12,fy-24,8,6,'#6a5a46'); }
function acStalag(x,fy,h){ lx.fillStyle='#8a7a68'; lx.beginPath(); lx.moveTo(x-5,fy); lx.lineTo(x,fy-h); lx.lineTo(x+5,fy); lx.closePath(); lx.fill(); lx.fillStyle='#a89680'; lx.fillRect(x-1,fy-h+2,2,h-4); }
function acStalac(x,y,h){ lx.fillStyle='#6a5a4a'; lx.beginPath(); lx.moveTo(x-4,y); lx.lineTo(x,y+h); lx.lineTo(x+4,y); lx.closePath(); lx.fill(); }
function acMenhir(tx,fy,h){ const x=tx*T+3; R(x,fy-h,10,h,'#6a6258'); R(x,fy-h,10,2,'#8a8274'); R(x+2,fy-h+6,1,h-10,'#4a443c'); }
function acGlyph(tx,ty){ const x=tx*T, y=ty*T; lx.strokeStyle='#8ab4ff'; lx.lineWidth=1; lx.beginPath(); lx.arc(x+8,y+8,6,0,7); lx.moveTo(x+2,y+8); lx.lineTo(x+14,y+8); lx.moveTo(x+8,y+2); lx.lineTo(x+8,y+14); lx.stroke(); }
function acFrame(tx,ty,t){ const x=tx*T, y=ty*T; R(x,y,26,20,'#5a3a1e'); R(x+2,y+2,22,16,'#f4ecd8'); lx.fillStyle=t||'#4a8aca'; lx.fillRect(x+5,y+9,6,6); lx.fillStyle='#e8c25a'; lx.beginPath(); lx.arc(x+18,y+7,3,0,7); lx.fill(); }
function acCrib(tx,fy){ const x=tx*T; R(x,fy-18,26,2,'#e8d8f0'); R(x,fy-6,26,2,'#e8d8f0'); for(let i=0;i<=26;i+=4) R(x+i,fy-18,1,18,'#e8d8f0'); }
function acStone(tx,fy,w,h){ const x=tx*T; lx.fillStyle='#5a5248'; lx.beginPath(); lx.ellipse(x+w/2,fy-h/2,w/2,h/2,0,0,7); lx.fill(); lx.fillStyle='#7a7062'; lx.beginPath(); lx.ellipse(x+w/2-2,fy-h/2-2,w/3,h/4,0,0,7); lx.fill(); }

/* ---------- нови врагове ---------- */
defFoes('dims',{watcher:[12,28,70],wisp:[10,10,40],thrax:[12,26,60]});
defFoe('watcher',{upd:(e,dt)=>{ const p=player; e.para=true; e.anim+=dt; e.cd-=dt;
  const dx=p.x+p.w/2-(e.x+e.w/2), dy=p.y+p.h/2-(e.y+e.h/2), d=Math.hypot(dx,dy)||1;
  if(!e.alert){ if(d<240&&los(e.x+6,e.y+8,p.x+5,p.y+10)) e.alert=true; e.vx=0; physics(e,dt); return; }
  e.face=sgn(dx)||e.face;
  if(e.state==='beam'){ e.t-=dt; if(e.t<=0){ const a=Math.atan2(dy,dx); ebullets.push({x:e.x+e.w/2,y:e.y+8,vx:Math.cos(a)*200*D.bspd,vy:Math.sin(a)*200*D.bspd,life:3,dmg:12,r:4,orb:true}); e.state='idle'; e.cd=rnd(1.8,2.8)*D.rate; } }
  else if(e.cd<=0&&d<260&&!p.dead){ if(d>150&&Math.random()<0.5){ const nx=p.x+(Math.random()<0.5?-1:1)*rnd(70,110), tx=Math.floor(nx/T); if(tx>2&&tx<COLS-3){ for(let i=0;i<12;i++) part(e.x+6,e.y+14,rnd(-60,60),rnd(-60,60),0.5,'#8ab4ff',2,0); e.x=tx*T+2; e.y=groundY(tx)-e.h; e.cd=0.6; } } else { e.state='beam'; e.t=0.55; } }
  e.vx=0; physics(e,dt); }});
defFoe('watcher',{draw:e=>{ begin(e); tint=e.hitT>0?'#fff':null; const a=e.dead?Math.max(0,1-e.deadT):0.85+Math.sin(e.anim*3)*0.1; ctx.globalAlpha=a;
  if(e.dead){ px(-6,-3,12,3,'#8a8a96'); ctx.globalAlpha=1; tint=null; ctx.restore(); return; }
  px(-2,-12,2,12,'#9a9aa8'); px(1,-12,2,12,'#9a9aa8'); px(-4,-22,8,11,'#a8a8b8'); px(-5,-20,2,9,'#9a9aa8'); px(4,-20,2,9,'#9a9aa8');
  px(-5,-31,10,9,'#b8b8c8'); px(-4,-28,3,3,'#0a0a14'); px(1,-28,3,3,'#0a0a14');
  if(e.state==='beam'){ px(6,-19,4,2,'#8ab4ff'); px(-1,-27,1,1,'#8ab4ff'); px(2,-27,1,1,'#8ab4ff'); }
  ctx.globalAlpha=1; tint=null; ctx.restore(); }});
defFoe('wisp',{upd:(e,dt)=>{ const p=player; e.para=true; e.anim+=dt; e.bite-=dt; e.mech=false;
  const dx=p.x+p.w/2-(e.x+e.w/2), dy=p.y+10-(e.y+e.h/2), d=Math.hypot(dx,dy)||1;
  if(!e.alert){ if(d<200) e.alert=true; e.x+=Math.sin(e.anim)*10*dt; e.y+=Math.cos(e.anim*1.3)*8*dt; return; }
  const sp=(DI===2?62:DI===0?38:50); e.x+=dx/d*sp*dt+Math.sin(e.anim*4)*20*dt; e.y+=dy/d*sp*dt+Math.cos(e.anim*3)*16*dt;
  if(!p.dead&&ov(e,p)&&e.bite<=0){ hurtPlayer(8,sgn(dx)*80); e.bite=0.7; } }});
defFoe('wisp',{draw:e=>{ if(e.dead&&e.deadT>0.6) return; const x=Math.round(e.x+e.w/2-cam), y=Math.round(e.y+e.h/2), f=0.7+0.3*Math.sin(e.anim*7);
  ctx.save(); ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(x,y,1,x,y,14); g.addColorStop(0,`rgba(200,220,255,${e.dead?0.3:0.8*f})`); g.addColorStop(1,'rgba(120,140,255,0)'); ctx.fillStyle=g; ctx.fillRect(x-14,y-14,28,28); ctx.restore();
  ctx.fillStyle=e.hitT>0?'#fff':'#e8f0ff'; ctx.fillRect(x-2,y-2,4,4); for(let i=0;i<3;i++) ctx.fillRect(x-1+Math.round(Math.sin(e.anim*5+i)*3),y+3+i*2,2,2); }});
defFoe('thrax',{upd:(e,dt)=>{ e.para=true; updZombie(e,dt); }});
defFoe('thrax',{draw:e=>{ begin(e); tint=e.hitT>0?'#fff':null; ctx.globalAlpha=e.dead?Math.max(0,0.7-e.deadT*0.6):0.8;
  if(e.dead){ px(-8,-3,16,3,'#c8b890'); ctx.globalAlpha=1; tint=null; ctx.restore(); return; }
  const w=Math.abs(e.vx)>1?Math.round(Math.sin(e.anim*6)*2):0, sw=e.state==='swing';
  px(-4+w,-10,3,10,'#8a7a5a'); px(1-w,-10,3,10,'#8a7a5a'); px(-5,-22,10,13,'#a8946a'); px(-6,-14,12,3,'#7a2a1e');
  px(-3,-28,7,6,'#d8c8a0'); px(-4,-31,9,4,'#c8a050'); px(-2,-33,5,2,'#c8a050');
  if(sw){ px(4,-30,2,22,'#6a4a2a'); px(4,-32,2,3,'#d8d8d8'); } else { px(6,-24,2,22,'#6a4a2a'); px(5,-27,4,3,'#d8d8d8'); }
  px(-9,-22,5,12,'#8a5a2a'); ctx.globalAlpha=1; tint=null; ctx.restore(); }});
