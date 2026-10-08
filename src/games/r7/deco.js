/* ================= РЕЗОНАНС 7 · ДЕКОРАЦИИ И НОВИ ВРАГОВЕ ================= */
const PXC=()=>{ const P=TH[LVL&&LVL.theme?LVL.theme():'pxboot']||{}; return P; };
function pxSign(tx,ty,t){ const P=PXC(); drawSign(tx,ty,t,P.fx==='web'?'#000000':(P.top||'#8aff9a'),P.fx==='web'?'#c0c0c0':'#061006'); }
// компютър „Правец“ с монитор
function pxPC(tx,fy,s=1){ const x=tx*T; R(x,fy-10,30,10,'#d8d0b8'); R(x+2,fy-8,20,2,'#8a8270'); R(x+24,fy-8,4,2,'#c83a2a');
  R(x+3,fy-34,24,22,'#c8c0a8'); R(x+5,fy-32,20,16,'#041004'); for(let i=0;i<4;i++) R(x+7,fy-30+i*4,4+((i*5+tx)%12),1,'#3aff5a'); R(x+12,fy-12,6,2,'#a8a090'); }
function pxFloppy(tx,fy,lbl){ const x=tx*T; R(x,fy-14,14,14,'#1a1a22'); R(x+3,fy-14,8,5,'#9aa2aa'); R(x+2,fy-7,10,6,'#e8e0c8'); if(lbl){ R(x+3,fy-5,8,1,'#c83a2a'); } }
function pxCassette(tx,fy){ const x=tx*T; R(x,fy-12,24,12,'#2a2a30'); R(x+2,fy-10,20,6,'#e8d8a8'); lx.fillStyle='#2a2a30'; for(const cx of [x+7,x+17]){ lx.beginPath(); lx.arc(cx,fy-7,2.5,0,7); lx.fill(); } }
function pxKey(tx,fy,ch){ const x=tx*T; R(x,fy-14,16,14,'#3a3a40'); R(x+1,fy-14,14,11,'#c8c0b0'); R(x+1,fy-3,14,3,'#8a8270'); lx.fillStyle='#2a2a2a'; lx.font='700 8px "IBM Plex Mono",monospace'; lx.fillText(ch||'?',x+5,fy-6); }
function pxChip(tx,fy,w=3){ const x=tx*T; R(x,fy-12,w*T,10,'#14161c'); for(let i=3;i<w*T-2;i+=4){ R(x+i,fy-14,2,2,'#9aa2aa'); R(x+i,fy-2,2,2,'#9aa2aa'); } R(x+3,fy-9,6,1,'#5a5e66'); }
function pxWin(tx,ty,w,h,t){ const x=tx*T, y=ty*T; R(x,y,w,h,'#c0c0c0'); R(x,y,w,1,'#ffffff'); R(x,y,1,h,'#ffffff'); R(x+w-1,y,1,h,'#404040'); R(x,y+h-1,w,1,'#404040'); R(x+2,y+2,w-4,9,'#000080');
  lx.fillStyle='#ffffff'; lx.font='600 6px "IBM Plex Mono",monospace'; lx.fillText(t||'',x+4,y+8); R(x+w-10,y+3,7,7,'#c0c0c0'); }
// малки поздрави за внимателните
function pxCrystal(tx,fy){ const x=tx*T+8; lx.fillStyle='#3dff7a'; lx.beginPath(); lx.moveTo(x,fy-12); lx.lineTo(x+4,fy-5); lx.lineTo(x,fy); lx.lineTo(x-4,fy-5); lx.closePath(); lx.fill(); lx.fillStyle='#d8ffe0'; lx.fillRect(x-1,fy-9,1,3); }
function pxTriDot(tx,ty,col){ const x=tx*T+8, y=ty*T+8; lx.strokeStyle=col||'#e8c25a'; lx.lineWidth=1; lx.beginPath(); lx.arc(x,y,5,0,7); lx.stroke(); lx.fillStyle=col||'#e8c25a'; for(let i=0;i<3;i++){ const a=-1.57+i*2.094; lx.fillRect(Math.round(x+Math.cos(a)*2.5)-1,Math.round(y+Math.sin(a)*2.5)-1,2,2); } }

/* ---------- нови врагове ---------- */
defFoes('dims',{bug:[14,9,30],blink:[8,14,40],errbox:[34,12,50],packet:[10,8,22],popup:[40,26,70]});
defFoe('bug',{upd:(e,dt)=>{ const p=player; e.anim+=dt; const dx=p.x+p.w/2-(e.x+e.w/2), dy=p.y+p.h/2-(e.y+e.h/2);
  if(!e.alert){ if(Math.abs(dx)<200&&Math.abs(dy)<80) e.alert=true; e.vx=0; physics(e,dt); return; }
  e.face=sgn(dx)||e.face; const sp=(DI===2?62:DI===0?38:50); e.vx=e.face*sp; if(!groundAhead(e,e.face)) e.vx=0;
  e.cd-=dt; if(e.onGround&&(wallAhead(e,e.face)||(e.cd<=0&&Math.abs(dx)<60))){ e.vy=-260; e.cd=rnd(1.2,2); }
  physics(e,dt); if(!p.dead&&ov(e,p)){ e.bite-=dt; if(e.bite<=0){ e.bite=0.7; hurtPlayer(8,sgn(dx)*120); } } }});
defFoe('bug',{draw:e=>{ const x=Math.round(e.x+e.w/2-cam), y=Math.round(e.y+e.h); if(e.dead){ if(e.deadT>0.6) return; ctx.fillStyle='#5a5a5a'; ctx.fillRect(x-6,y-2,12,2); return; }
  const P=PXC(), c=e.hitT>0?'#ffffff':(P.sh||'#3aff5a'), k=Math.floor(e.anim*12)%2;
  ctx.fillStyle=c; ctx.fillRect(x-5,y-8,10,6); ctx.fillRect(x+(e.face>0?4:-7),y-7,3,3); for(let i=0;i<3;i++){ ctx.fillRect(x-5+i*4,y-2,1,2+(i+k)%2); } ctx.fillStyle='#000'; ctx.fillRect(x+(e.face>0?5:-6),y-6,1,1); ctx.fillStyle=P.top||'#fff'; ctx.fillRect(x-3,y-9,1,2); ctx.fillRect(x+2,y-9,1,2); }});
defFoe('blink',{upd:(e,dt)=>{ const p=player; e.anim+=dt; e.cd-=dt; const dx=p.x+p.w/2-(e.x+e.w/2), dy=p.y+p.h/2-(e.y+e.h/2), d=Math.hypot(dx,dy)||1;
  if(!e.alert){ if(d<230) e.alert=true; e.vx=0; physics(e,dt); return; } e.face=sgn(dx)||e.face;
  if(e.cd<=0&&!p.dead&&d<280){ if(d>140&&Math.random()<0.55){ const tx=Math.floor((p.x+(Math.random()<0.5?-1:1)*rnd(60,100))/T); if(tx>2&&tx<COLS-3){ for(let i=0;i<8;i++) part(e.x+4,e.y+7,rnd(-50,50),rnd(-50,50),0.4,'#ffffff',2,0); e.x=tx*T+4; e.y=groundY(tx)-e.h; } e.cd=0.7; }
    else { const a=Math.atan2(dy,dx); ebullets.push({x:e.x+4,y:e.y+6,vx:Math.cos(a)*190*D.bspd,vy:Math.sin(a)*190*D.bspd,life:3,dmg:9,r:3,orb:true}); e.cd=rnd(1.5,2.4)*D.rate; } }
  e.vx=0; physics(e,dt); }});
defFoe('blink',{draw:e=>{ if(e.dead&&e.deadT>0.5) return; const x=Math.round(e.x-cam), y=Math.round(e.y), on=Math.floor(e.anim*3)%2||e.cd<0.3; const P=PXC();
  ctx.fillStyle=e.hitT>0?'#ffffff':on?(P.top||'#8aff9a'):'rgba(140,255,150,0.25)'; ctx.fillRect(x,y,8,14); if(!on){ ctx.strokeStyle=P.top||'#8aff9a'; ctx.strokeRect(x+0.5,y+0.5,7,13); } }});
const floatFoe=(e,dt,o)=>{ const p=player; e.anim+=dt; e.cd-=dt; const cx=e.x+e.w/2, cy=e.y+e.h/2, dx=p.x+p.w/2-cx, dy=p.y+8-cy, d=Math.hypot(dx,dy)||1;
  if(!e.alert){ if(d<o.see) e.alert=true; e.x+=Math.sin(e.anim)*8*dt; return; }
  const want=o.keep, k=(d-want)/d; e.x+=dx*k*o.sp*dt/60; e.y+=(dy-30)*o.sp*dt/90+Math.sin(e.anim*2)*10*dt; e.y=clamp(e.y,T,13*T);
  if(e.cd<=0&&!p.dead&&d<o.range){ e.cd=rnd(o.cd[0],o.cd[1])*D.rate; const a=Math.atan2(dy,dx); for(const s of o.spread) ebullets.push({x:cx,y:cy,vx:Math.cos(a+s)*o.bs*D.bspd,vy:Math.sin(a+s)*o.bs*D.bspd,life:3,dmg:o.dmg,r:4,orb:true}); } };
defFoe('errbox',{upd:(e,dt)=>{ e.mech=false; floatFoe(e,dt,{see:220,keep:110,sp:50,range:240,cd:[1.6,2.4],spread:[0],bs:160,dmg:9}); }});
defFoe('popup',{upd:(e,dt)=>{ floatFoe(e,dt,{see:240,keep:130,sp:35,range:260,cd:[2,2.8],spread:[-0.2,0,0.2],bs:140,dmg:8}); }});
const drawBox7=(e,t,title)=>{ if(e.dead&&e.deadT>0.5) return; const x=Math.round(e.x-cam), y=Math.round(e.y), w=e.w, h=e.h, hit=e.hitT>0; ctx.save(); if(e.dead) ctx.globalAlpha=1-e.deadT*2;
  if(title){ ctx.fillStyle=hit?'#ffffff':'#c0c0c0'; ctx.fillRect(x,y,w,h); ctx.fillStyle='#000080'; ctx.fillRect(x+2,y+2,w-4,7); ctx.fillStyle='#ffffff'; ctx.font='600 5px "IBM Plex Mono",monospace'; ctx.fillText(title,x+3,y+7); ctx.fillStyle='#000000'; ctx.fillText(t,x+4,y+h-6); }
  else { const P=PXC(); ctx.fillStyle=hit?'#ffffff':'#000000'; ctx.fillRect(x,y,w,h); ctx.strokeStyle=P.top||'#8aff9a'; ctx.strokeRect(x+0.5,y+0.5,w-1,h-1); ctx.fillStyle=P.top||'#8aff9a'; ctx.font='700 7px "IBM Plex Mono",monospace'; ctx.fillText(t,x+3,y+9); }
  ctx.restore(); };
defFoe('errbox',{draw:e=>drawBox7(e,['?ERROR','?SYNTAX','?OOPS','?REDO'][Math.floor(e.anim*0.7+e.home)%4],null)});
defFoe('popup',{draw:e=>drawBox7(e,['СПЕЧЕЛИХТЕ!','НАТИСНИ ТУК','ОБНОВИ СЕГА','ВИРУС НЯМА'][Math.floor(e.home/T)%4],'!!!')});
defFoe('packet',{upd:(e,dt)=>{ const p=player; e.anim+=dt; e.bite-=dt; const dx=p.x+p.w/2-(e.x+e.w/2), dy=p.y+10-(e.y+e.h/2), d=Math.hypot(dx,dy)||1;
  if(!e.alert){ if(d<210) e.alert=true; e.x+=Math.sin(e.anim*2)*12*dt; return; }
  const sp=(DI===2?110:DI===0?70:90); e.vx=(e.vx||0)+(dx/d*sp-(e.vx||0))*Math.min(1,dt*2); e.vy=(e.vy||0)+(dy/d*sp-(e.vy||0))*Math.min(1,dt*2); e.x+=e.vx*dt; e.y+=e.vy*dt;
  if(!p.dead&&ov(e,p)&&e.bite<=0){ hurtPlayer(7,sgn(dx)*90); e.bite=0.8; e.vx=-e.vx; e.vy=-80; } }});
defFoe('packet',{draw:e=>{ if(e.dead&&e.deadT>0.4) return; const x=Math.round(e.x-cam), y=Math.round(e.y), P=PXC(); ctx.fillStyle=e.hitT>0?'#ffffff':(P.sh||'#3aff5a'); ctx.fillRect(x,y,10,8); ctx.fillStyle='#000'; ctx.fillRect(x+2,y+2,6,1); ctx.fillRect(x+2,y+4,4,1);
  ctx.fillStyle=P.top||'#ffffff'; ctx.fillRect(x-Math.round(sgn(e.vx||1)*3),y+3,2,2); }});
