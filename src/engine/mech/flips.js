/* ================= МЕХАНИКА · ОБРЪЩАНЕ НА ГРАВИТАЦИЯТА =================
   LVL.flips: [[tx,ty]] — сфери, които обръщат света; при прераждане светът се връща както е бил при контролната точка. */
let FLIPS=[], FLIP=false, flipCd=0, cpFlip=false;
/* ---------- gravity flip ---------- */
function flipWorld(quiet){
  const Hh=ROWS*T; map.reverse(); FLIP=!FLIP;
  const p=player; p.y=Hh-p.y-p.h; p.vy=-p.vy*0.25; p.onGround=false; p.climb=false;
  for(const e of enemies){ e.y=Hh-e.y-e.h; e.vy=-(e.vy||0); e.onGround=false; }
  for(const k of pickups) k.y=Hh-k.y-k.h;
  for(const b of barrels) b.y=Hh-b.y-b.h;
  for(const s of scientists) s.y=Hh-s.y-s.h;
  for(const b of ebullets){ b.y=Hh-b.y; b.vy=-b.vy; }
  for(const g of grenades){ g.y=Hh-g.y; g.vy=-g.vy; }
  for(const o of orbs) o.y=Hh-o.y;
  for(const q of particles){ q.y=Hh-q.y; q.vy=-q.vy; }
  for(const f of FLIPS) f.y=Hh-f.y;
  for(const a of ALLIES) a.y=Hh-a.y;
  for(const l of lasers){ const r0=l.r0; l.r0=ROWS-1-l.r1; l.r1=ROWS-1-r0; }
  for(const m of bmiss){ m.y=Hh-m.y; m.vy=-m.vy; }
  if(boss){ boss.y=Hh-boss.y-boss.h; boss.vy=-(boss.vy||0); if(boss.onFlip) boss.onFlip(); }
  prerender();
  if(!quiet){ shake=6; flash=0.55; flashCol='#e0d4ff'; SFX.portal&&SFX.portal(0.6); }
}
defMech('flips',{
  chips(chip){ if(FLIPS.length) chip(FLIP?'⇅ ГРАВИТАЦИЯТА Е ОБЪРНАТА':'⇅ НОРМАЛНА ГРАВИТАЦИЯ','#d8c4ff'); },
  load(){ FLIPS=[]; FLIP=false; flipCd=0; cpFlip=false; const L=LVL;
  if(L.flips) FLIPS=L.flips.map(([tx,ty])=>({x:tx*T+8,y:ty*T+8,t:0,armed:true}));
  },
  update(dt){ const p=player;
  // flips
  flipCd-=dt;
  for(const f of FLIPS){ f.t+=dt; const d=Math.hypot(p.x+p.w/2-f.x,p.y+p.h/2-f.y); if(d>26) f.armed=true; if(d<14&&f.armed&&flipCd<=0&&!p.dead){ f.armed=false; flipCd=0.6; flipWorld(); for(const g of FLIPS) if(Math.hypot(p.x+p.w/2-g.x,p.y+p.h/2-g.y)<26) g.armed=false; } }
  },
  drawWorld(){
  // flip orbs
  for(const f of FLIPS){ const x=f.x-cam; if(x<-30||x>W+30) continue; const r=7+Math.sin(f.t*4)*1.5; const g=ctx.createRadialGradient(x,f.y,0,x,f.y,r*2.4); g.addColorStop(0,f.armed?'rgba(230,210,255,0.95)':'rgba(140,120,170,0.6)'); g.addColorStop(0.4,f.armed?'rgba(170,110,255,0.6)':'rgba(90,70,120,0.4)'); g.addColorStop(1,'rgba(120,60,220,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,f.y,r*2.4,0,7); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.8)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x,f.y-5); ctx.lineTo(x-3,f.y-2); ctx.moveTo(x,f.y-5); ctx.lineTo(x+3,f.y-2); ctx.moveTo(x,f.y+5); ctx.lineTo(x-3,f.y+2); ctx.moveTo(x,f.y+5); ctx.lineTo(x+3,f.y+2); ctx.moveTo(x,f.y-5); ctx.lineTo(x,f.y+5); ctx.stroke(); }
  },
  lights(L){
  for(const f of FLIPS) L.push([f.x,f.y,60,0.8]);
  },
  preRespawn(){ if(FLIPS.length&&FLIP!==cpFlip) flipWorld(true); },
  setCp(){ cpFlip=FLIP; } });
