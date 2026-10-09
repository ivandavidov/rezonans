/* ================= РЕЗОНАНС 5 · ДЕКОРАЦИИ И НОВИ ВРАГОВЕ ================= */
function axSign(tx,ty,t){ drawSign(tx,ty,t,'#fff4d8','#2a4a3a'); }
function axLamp(tx,fy){ const x=tx*T+7; R(x,fy-48,2,48,'#3a3a3a'); R(x,fy-48,8,2,'#3a3a3a'); R(x+6,fy-47,4,3,'#d8d0b0'); lightDot(x+8,fy-43,'#ffe6a0'); }
function poplar(x,fy,s=1){ const h=70*s; R(x-1,fy-h*0.3,3,h*0.3,'#3a2a1a'); lx.fillStyle='#3a5a2a'; lx.beginPath(); lx.ellipse(x,fy-h*0.62,8*s,h*0.4,0,0,7); lx.fill(); lx.fillStyle='#4a6e32'; lx.beginPath(); lx.ellipse(x-2,fy-h*0.66,4*s,h*0.3,0,0,7); lx.fill(); }
function walnut(x,fy,s=1){ R(x-2,fy-26*s,4,26*s,'#4a3420'); for(let i=0;i<10;i++){ const a=hash(Math.round(x)+i,fy), b=hash(i,Math.round(x)); lx.fillStyle=i%2?'#3e5e2a':'#56783a'; lx.beginPath(); lx.arc(x+(a-0.5)*34*s,fy-30*s-b*18*s,(9+a*6)*s,0,7); lx.fill(); } }
function fence(t0,t1,fy){ for(let x=t0*T;x<(t1+1)*T;x+=6){ R(x,fy-12,2,12,'#6a4a2a'); } R(t0*T,fy-9,(t1-t0+1)*T,2,'#7a5a32'); R(t0*T,fy-4,(t1-t0+1)*T,2,'#7a5a32'); }
function vHouse(tx,fy,w=6,seed=0){ const x=tx*T, W_=w*T, h=46; R(x,fy-h,W_,h,hash(seed,3)>0.5?'#ece4d0':'#e4d8bc'); R(x,fy-6,W_,6,'#9a8a6a');
  lx.fillStyle='#a8442a'; lx.beginPath(); lx.moveTo(x-6,fy-h); lx.lineTo(x+W_/2,fy-h-22); lx.lineTo(x+W_+6,fy-h); lx.closePath(); lx.fill(); lx.fillStyle='#8a3a22'; for(let i=0;i<W_+12;i+=5) lx.fillRect(x-6+i,fy-h-2,2,2);
  for(let i=0;i<Math.floor(w/3);i++){ const wx=x+10+i*3*T; R(wx,fy-36,14,14,'#5a3a1e'); R(wx+1,fy-35,12,12,hash(seed,i)>0.4?'#ffd890':'#2a3040'); R(wx+7,fy-35,1,12,'#5a3a1e'); R(wx-2,fy-36,2,14,'#3a6a8a'); R(wx+14,fy-36,2,14,'#3a6a8a'); }
  R(x+W_-22,fy-30,12,24,'#6a4a2a'); R(x+W_-12,fy-18,1,2,'#d8c890'); if(hash(seed,9)>0.5){ R(x+W_/2+10,fy-h-26,6,12,'#9a5a3a'); } }
function healthService(tx,fy){ vHouse(tx,fy,10,4); drawSign(tx+1,Math.round(fy/T)-5,'ЗДРАВНА СЛУЖБА','#ffffff','#a82a2a'); R(tx*T+70,fy-58,12,12,'#ffffff'); R(tx*T+74,fy-56,4,8,'#c82a2a'); R(tx*T+72,fy-54,8,4,'#c82a2a'); }
function chitalishte(tx,fy){ const x=tx*T, W_=12*T; R(x,fy-64,W_,64,'#e8dcc0'); R(x-4,fy-70,W_+8,8,'#c8b890'); lx.fillStyle='#c8b890'; lx.beginPath(); lx.moveTo(x+W_/2-40,fy-70); lx.lineTo(x+W_/2,fy-92); lx.lineTo(x+W_/2+40,fy-70); lx.closePath(); lx.fill();
  for(let i=0;i<4;i++) R(x+W_/2-34+i*20,fy-62,8,56,'#f4ecd8'); R(x+W_/2-12,fy-30,24,30,'#5a3a1e'); drawSign(tx+2,Math.round(fy/T)-6,'НАРОДНО ЧИТАЛИЩЕ','#3a2a1a','#f4ecd8'); }
function kiosk(tx,fy){ const x=tx*T; R(x,fy-30,40,30,'#3a6a8a'); R(x-2,fy-34,44,5,'#c83a2a'); R(x+4,fy-24,32,12,'#ffe8b0'); lx.font='600 5px "IBM Plex Mono",monospace'; lx.fillStyle='#ffffff'; lx.fillText('ВЕСТНИЦИ',x+8,fy-30); }
function haystack(tx,fy,s=1){ const x=tx*T+8; lx.fillStyle='#c8a050'; lx.beginPath(); lx.ellipse(x,fy-14*s,16*s,18*s,0,Math.PI,0); lx.fill(); lx.fillRect(x-16*s,fy-14*s,32*s,14*s); lx.fillStyle='#a88038'; for(let i=0;i<6;i++) lx.fillRect(x-14*s+i*5*s,fy-24*s+(i%2)*6,1,18*s); R(x-1,fy-38*s,2,8,'#6a4a2a'); }
function sunflowers(t0,t1,fy){ for(let x=t0*T;x<(t1+1)*T;x+=7){ const h=22+hash(x,3)*10; R(x,fy-h,1,h,'#4a7a2a'); R(x-2,fy-h*0.6,4,2,'#5a8a32'); lx.fillStyle='#f4c42a'; lx.beginPath(); lx.arc(x,fy-h,4,0,7); lx.fill(); lx.fillStyle='#5a3a1a'; lx.beginPath(); lx.arc(x,fy-h,2,0,7); lx.fill(); } }
function tractor(tx,fy){ const x=tx*T; R(x+4,fy-20,26,12,'#c83a2a'); R(x+20,fy-34,14,16,'#c83a2a'); R(x+22,fy-32,10,8,'#9ac8d8'); R(x+8,fy-26,2,6,'#3a3a3a'); lx.fillStyle='#1a1a1a'; lx.beginPath(); lx.arc(x+28,fy-10,10,0,7); lx.fill(); lx.beginPath(); lx.arc(x+8,fy-6,6,0,7); lx.fill(); lx.fillStyle='#8a8a8a'; lx.beginPath(); lx.arc(x+28,fy-10,4,0,7); lx.fill(); }
function travSteps(tx,fy,n=4){ for(let i=0;i<n;i++){ const x=tx*T+i*10; lx.fillStyle='rgba(90,220,210,0.55)'; lx.fillRect(x,fy-4-i*3,12,4); lx.fillStyle='#e6d8b0'; lx.fillRect(x,fy-i*3,12,2); } }
function moss(tx,ty,w){ for(let i=0;i<w*T;i+=2) if(hash(tx*T+i,ty)>0.4) R(tx*T+i,ty*T,1,3+Math.floor(hash(i,ty)*5),'#6aa83a'); }
function drip(x,y,h,up){ lx.fillStyle='#6a6250'; lx.beginPath(); if(up){ lx.moveTo(x-4,y); lx.lineTo(x,y-h); lx.lineTo(x+4,y); } else { lx.moveTo(x-4,y); lx.lineTo(x,y+h); lx.lineTo(x+4,y); } lx.closePath(); lx.fill(); }
function batCluster(x,y){ for(let i=0;i<9;i++){ const a=hash(Math.round(x)+i,y), b=hash(i,Math.round(x)); R(x+a*30,y+b*6,3,4,'#14100e'); } }
function fuelTank(tx,fy){ const x=tx*T; R(x,fy-80,64,80,'#5a6266'); R(x,fy-80,64,4,'#7a8488'); for(let i=0;i<4;i++) R(x,fy-70+i*18,64,1,'#454c50'); R(x+6,fy-60,4,50,'#3a4246'); lx.font='600 6px "IBM Plex Mono",monospace'; lx.fillStyle='#c9a21c'; lx.fillText('ДЪРЖАВЕН РЕЗЕРВ',x+10,fy-40); }
function varHouse(tx,fy,seed=0){ const x=tx*T, W_=7*T; R(x,fy-24,W_,24,'#8a7e6a'); for(let i=0;i<W_;i+=8) R(x+i,fy-24,1,24,'#6a604e'); R(x-6,fy-56,W_+12,32,'#f0ece4'); R(x-6,fy-56,W_+12,2,'#5a3a1e'); R(x-6,fy-26,W_+12,3,'#5a3a1e');
  for(let i=0;i<3;i++){ R(x+i*36+4,fy-50,14,16,'#5a3a1e'); R(x+i*36+5,fy-49,12,14,hash(seed,i)>0.5?'#ffd890':'#2a2a30'); }
  lx.fillStyle='#7a3a22'; lx.beginPath(); lx.moveTo(x-12,fy-56); lx.lineTo(x+W_/2,fy-74); lx.lineTo(x+W_+12,fy-56); lx.closePath(); lx.fill(); }
function levski(tx,fy){ const x=tx*T; R(x,fy-20,24,20,'#8a8a8a'); R(x+6,fy-56,12,36,'#6a6a6e'); R(x+8,fy-64,8,8,'#6a6a6e'); R(x+4,fy-48,4,16,'#6a6a6e'); }
function crenels(t0,t1,y){ for(let x=t0*T;x<(t1+1)*T;x+=12) R(x,y-6,7,6,'#8a8070'); }
function fortTower(tx,fy,h){ const x=tx*T; R(x,fy-h,40,h,'#8a8070'); for(let y=fy-h;y<fy;y+=8) R(x,y,40,1,'#6a6050'); crenels(tx,tx+2,fy-h); R(x+16,fy-h+20,8,14,'#2a2420'); }
function crib(tx,fy){ const x=tx*T; R(x,fy-20,30,2,'#e8d8c0'); R(x,fy-8,30,2,'#e8d8c0'); for(let i=0;i<=30;i+=5) R(x+i,fy-20,1,20,'#e8d8c0'); R(x+4,fy-14,22,6,'#a8c8f0'); R(x+8,fy-16,8,4,'#f4d8c0'); }
function k3Sign(tx,ty,t){ drawSign(tx,ty,t,'#0e1a12','#9aff8a'); }
function busStop(tx,fy){ const x=tx*T; R(x,fy-34,40,4,'#5a6a7a'); R(x+2,fy-30,2,30,'#5a6a7a'); R(x+36,fy-30,2,30,'#5a6a7a'); R(x+6,fy-14,28,3,'#7a5a3a'); lx.font='600 5px "IBM Plex Mono",monospace'; lx.fillStyle='#ffffff'; lx.fillText('АВТОБУСНА СПИРКА',x+1,fy-36); }

/* ---------- нови врагове ---------- */
defFoes('dims',{agent:[12,26,55],hound:[18,12,40]});
defFoe('agent',{upd:(e,dt)=>{ updSoldier(e,dt); }});
defFoe('agent',{draw:e=>{ begin(e); tint=e.hitT>0?'#fff':null;
  if(e.dead){ if(fade(e,3)){ px(-9,-4,18,4,'#4a4a50'); px(-11,-4,4,3,'#e2b48f'); } ctx.globalAlpha=1; tint=null; ctx.restore(); return; }
  const w=Math.abs(e.vx)>1?Math.round(Math.sin(e.anim*7)*2):0;
  px(-4+w,-10,3,10,'#2a2a2e'); px(1-w,-10,3,10,'#2a2a2e'); px(-5,-22,11,14,'#5a5a60'); px(-5,-12,11,4,'#4a4a50'); px(-1,-22,2,10,'#3a3a40');
  px(-3,-28,7,6,'#e2b48f'); px(-5,-30,11,3,'#3a3a40'); px(-4,-31,9,2,'#4a4a50'); px(1,-26,2,1,'#2a2a2a');
  px(4,-19,9,2,'#1a1a1a'); px(12,-20,2,1,'#3a3a3a'); tint=null; ctx.restore(); }});
defFoe('hound',{upd:(e,dt)=>{ const p=player, dx=p.x+p.w/2-(e.x+e.w/2), dy=(p.y+p.h/2)-(e.y+e.h/2), adx=Math.abs(dx); e.anim+=dt; e.bite-=dt;
  if(!e.alert){ e.vx=0; if(adx<220&&Math.abs(dy)<80&&los(e.x+e.w/2,e.y+4,p.x+p.w/2,p.y+p.h/2)){ e.alert=true; sfxAt('flyer',e); } }
  else if(!p.dead){ e.face=sgn(dx)||e.face; const sp=(DI===2?95:DI===0?60:78); e.vx=e.face*sp; if(!groundAhead(e,e.face)) e.vx=0;
    if(wallAhead(e,e.face)&&e.onGround){ e.vy=-300; }
    if(adx<60&&e.onGround&&e.cd<=0&&Math.abs(dy)<30){ e.vy=-240; e.vx=e.face*170; e.cd=1.4*D.rate; }
    e.cd-=dt; if(ov(e,p)&&e.bite<=0){ hurtPlayer(12,e.face*160); e.bite=0.9; } }
  else e.vx=0;
  physics(e,dt); }});
defFoe('hound',{draw:e=>{ begin(e); tint=e.hitT>0?'#fff':null;
  if(e.dead){ if(fade(e,3)) px(-9,-4,18,4,'#3a3430'); ctx.globalAlpha=1; tint=null; ctx.restore(); return; }
  const r=Math.abs(e.vx)>1?Math.round(Math.sin(e.anim*14)*2):0;
  px(-8+r,-5,2,5,'#3a3430'); px(-4-r,-5,2,5,'#3a3430'); px(3+r,-5,2,5,'#3a3430'); px(6-r,-5,2,5,'#3a3430');
  px(-9,-11,17,7,'#4a4038'); px(6,-14,6,6,'#4a4038'); px(11,-12,3,3,'#3a3430'); px(-12,-12,4,2,'#4a4038');
  px(9,-13,1,1,'#3aff8a'); px(-6,-10,10,1,'rgba(60,255,140,0.35)'); tint=null; ctx.restore(); }});
