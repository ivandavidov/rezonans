/* ================= МЕХАНИКА · ВЯТЪР =================
   LVL.winds: [[x0,y0,x1,y1,силаX,силаY]] — течения; LVL.gusts: {per,dur,force} — пориви (GWIND). */
let GWIND=0;
function windForce(p,dt){
  if(LVL.winds) for(const w of LVL.winds){ const cx=p.x+p.w/2, cy=p.y+p.h/2; if(cx>w[0]*T&&cx<(w[2]+1)*T&&cy>w[1]*T&&cy<(w[3]+1)*T){ p.vx+=w[4]*dt; p.vy+=w[5]*dt; if(w[5]<0){ p.vy=Math.max(p.vy,-300); p.onGround=false; p.padT=0.2; } } }
  if(GWIND) p.vx+=GWIND*(p.onGround?0.55:1)*dt;
}
defMech('winds',{
  load(){ GWIND=0; },
  force:windForce,
  update(dt){
  // wind particles
  if(LVL.winds) for(const w of LVL.winds){ const x0=w[0]*T, x1=(w[2]+1)*T; if(x1<cam-20||x0>cam+W+20) continue; if(Math.random()<dt*((x1-x0)/T)*(w[3]-w[1]+1)*0.35){ const px_=rnd(x0,x1), py=rnd(w[1]*T,(w[3]+1)*T); part(px_,py,w[4]*0.25,w[5]*0.25,rnd(0.5,0.9),'rgba(220,240,255,0.7)',1,0,0); } }
  if(GWIND&&Math.random()<dt*30) part(cam+(GWIND>0?-4:W+4),rnd(20,H-40),GWIND*0.5,rnd(-10,10),rnd(1,1.6),'rgba(220,240,255,0.6)',1,0,0);
  },
  drawWorld(){
  if(LVL.winds){ ctx.save(); ctx.globalCompositeOperation='lighter'; for(const w of LVL.winds){ if(w[5]>=0) continue; const x0=w[0]*T-cam, x1=(w[2]+1)*T-cam, y0=w[1]*T, y1=(w[3]+1)*T; if(x1<-10||x0>W+10) continue;
    const g=ctx.createLinearGradient(0,y1,0,y0); g.addColorStop(0,'rgba(150,230,255,0.10)'); g.addColorStop(1,'rgba(150,230,255,0.02)'); ctx.fillStyle=g; ctx.fillRect(x0,y0,x1-x0,y1-y0);
    ctx.fillStyle='rgba(200,245,255,0.18)'; for(let i=0;i<Math.max(2,(x1-x0)/12);i++){ const sx=x0+((i*37)%Math.max(1,x1-x0-2)), len=14+(i%3)*6, sy=y1-((titleT*160+i*53)%(y1-y0+len)); ctx.fillRect(Math.round(sx),Math.round(sy),1,len); } } ctx.restore(); }
  },
  respawn(){ GWIND=0; } });
defMech('gusts',{
  update(){
  // gusts
  if(LVL.gusts){ const g=LVL.gusts, tt=lvT%g.per; GWIND=tt>g.per-g.dur?g.force:0; if(tt>g.per-g.dur-1.2&&tt<g.per-g.dur&&!MST.gw){ MST.gw=1; showMsg('Поривът идва!',1.2); } if(tt<1) MST.gw=0; }
  },
  chips(chip){
  if(LVL.gusts) chip(GWIND?'❄ ПОРИВ НА ВЯТЪРА!':'❄ вятър','#cfe0ff');
  } });
