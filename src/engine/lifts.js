/* ================= LIFTS, LASERS, VENTS ================= */
function liftPos(l){ const per=l.per||5, t=((lvT+(l.off||0)*per)%per+per)%per, half=per/2, dw=Math.min(1,half*0.35), mv=half-dw; const u=t<mv?t/mv:t<half?1:t<half+mv?1-(t-half)/mv:0, e=0.5-0.5*Math.cos(Math.PI*u); return [(l.x0+(l.x1-l.x0)*e)*T,(l.y0+(l.y1-l.y0)*e)*T]; }
function updLifts(){ const p=player; for(const l of lifts){ const [nx,ny]=liftPos(l); l.dx=nx-l.x; l.dy=ny-l.y; l.x=nx; l.y=ny; if(p.onLift===l&&!p.dead){ moveX(p,l.dx); p.y+=l.dy; } } }
function drawLifts(){ for(const l of lifts){ const x=Math.round(l.x-cam), y=Math.round(l.y); if(x<-60||x>W+10) continue;
  if(LVL.liftStyle==='cable'){ px(x+4,2*T,1,y-2*T,'#3a3f45'); px(x+l.w-5,2*T,1,y-2*T,'#3a3f45'); px(x,y,l.w,6,'#4a4f56'); px(x,y,l.w,1,'#9aa2a7'); for(let i=0;i<l.w;i+=8) px(x+i,y+3,4,3,'#c99a1c'); }
  else { px(x,y,l.w,5,'#5c4878'); px(x,y,l.w,1,'#4dffc3'); px(x+4,y+5,l.w-8,3,'#3d2e52'); px(x+l.w/2-3,y+8,6,2,'#2c2238'); } } }
const lzPer=()=>DI===0?3.6:DI===2?2.6:3.0;
function lzState(l){ if(chtOn('traps')) return 0; const per=lzPer(), t=((lvT+(l.off||0)*per)%per+per)%per; if(t<per*0.5) return 2; if(t>per-0.45) return 1; return 0; }
const vtPer=()=>DI===0?3.8:DI===2?2.6:3.2;
function vtState(v){ if(chtOn('traps')) return 0; const per=vtPer(), t=((lvT+(v.off||0)*per)%per+per)%per; if(t<1.2) return 2; if(t>per-0.5) return 1; return 0; }
function updHazards(dt){
  const p=player;
  for(const l of lasers){ l.hitCd-=dt; const st=lzState(l); if(st===2&&!l.was&&Math.abs(l.tx*T-p.x)<300) sfxAt('laser',{x:l.tx*T,y:l.r0*T,w:0}); l.was=st===2;
    if(st===2){ const r={x:l.tx*T+6,y:l.r0*T,w:4,h:(l.r1-l.r0+1)*T}; if(l.hitCd<=0&&!p.dead&&ov(r,p)){ p.inv=0; hurtPlayer(20,sgn(p.x+p.w/2-(l.tx*T+8))*120); l.hitCd=0.6; sparks(l.tx*T+8,p.y+p.h/2,6,'#ff6a6a'); }
      for(const e of enemies) if(!e.dead&&!FOES[e.type].fixed&&ov(r,e)){ e.lz=(e.lz||0)-dt; if(e.lz<=0){ e.lz=0.4; hurtEnemy(e,15,0,true); } } } }
  for(const v of vents){ v.hitCd-=dt; const st=vtState(v), x=v.tx*T;
    if(st===2&&!v.was&&Math.abs(x-p.x)<300) sfxAt('steam',{x,y:14*T,w:0}); v.was=st===2;
    if(Math.abs(x-cam-W/2)<W){ if(st===2){ for(let i=0;i<2;i++) part(x+8+rnd(-5,5),15*T-2,rnd(-12,12),rnd(-160,-110),rnd(0.35,0.5),'#e8f0f4',rnd(3,5),-60,2); } else if(st===1&&Math.random()<0.3) part(x+8+rnd(-4,4),15*T-2,rnd(-6,6),rnd(-50,-30),0.4,'#c8d4da',3,0,2); }
    if(st===2&&v.hitCd<=0&&!p.dead&&ov({x:x+2,y:15*T-74,w:12,h:74},p)){ v.hitCd=0.25; hurtPlayer(8,0,true); SFX.sizzle(); } }
}
function drawLasers(){ for(const l of lasers){ const x=Math.round(l.tx*T-cam)+8; if(x<-10||x>W+10) continue; const y0=l.r0*T, y1=(l.r1+1)*T, st=lzState(l);
  px(x-5,y0,10,4,'#3a3f45'); px(x-2,y0+4,4,2,st?'#ff3b2e':'#5a1a14'); px(x-5,y1-4,10,4,'#3a3f45');
  if(st===2){ ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.fillStyle='rgba(255,40,40,0.35)'; ctx.fillRect(x-3,y0+6,6,y1-y0-10); ctx.fillStyle='rgba(255,220,220,0.95)'; ctx.fillRect(x-1,y0+6,2,y1-y0-10); ctx.restore(); }
  else if(st===1&&Math.floor(titleT*20)%2){ ctx.fillStyle='rgba(255,60,60,0.5)'; ctx.fillRect(x,y0+6,1,y1-y0-10); } } }
function drawVents(){ for(const v of vents){ const x=Math.round(v.tx*T-cam); if(x<-T||x>W) continue; px(x+1,15*T-2,14,2,'#2a3138'); for(let i=2;i<14;i+=3) px(x+1+i,15*T-2,1,2,'#0d1114'); } }

