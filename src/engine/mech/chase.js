/* ================= МЕХАНИКА · ГОНИТБА =================
   LVL.chase: {start,lead,speed,end,msg,die,safe,kind,draw} — лавина (или влак, или своя стена), която те гони. */
let CHASE=null;
function drawTrainChase(){ const fx=CHASE.x-cam; if(fx<-40) return; const y=9*T, fy=15*T;
  ctx.fillStyle='#2a2e36'; ctx.fillRect(fx-520,y,520,fy-y); ctx.fillStyle='#454b56'; ctx.fillRect(fx-520,y,520,3); ctx.fillStyle='#7a1a26'; ctx.fillRect(fx-520,y+40,520,4);
  for(let i=0;i<10;i++){ ctx.fillStyle='#14181e'; ctx.fillRect(fx-500+i*50,y+12,26,16); }
  ctx.fillStyle='#3a404a'; ctx.beginPath(); ctx.moveTo(fx-16,y); ctx.lineTo(fx+4,y+14); ctx.lineTo(fx+4,fy); ctx.lineTo(fx-16,fy); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.globalCompositeOperation='lighter'; for(const hy of [y+22,y+52]){ const g=ctx.createRadialGradient(fx+4,hy,1,fx+4,hy,70); g.addColorStop(0,'rgba(255,250,220,0.9)'); g.addColorStop(1,'rgba(255,250,220,0)'); ctx.fillStyle=g; ctx.fillRect(fx-60,hy-70,140,140); }
  const g2=ctx.createLinearGradient(fx,0,fx+220,0); g2.addColorStop(0,'rgba(255,246,210,0.22)'); g2.addColorStop(1,'rgba(255,246,210,0)'); ctx.fillStyle=g2; ctx.beginPath(); ctx.moveTo(fx+4,y+20); ctx.lineTo(fx+220,y-10); ctx.lineTo(fx+220,fy); ctx.lineTo(fx+4,y+56); ctx.closePath(); ctx.fill(); ctx.restore();
  if(Math.random()<0.7) part(CHASE.x-rnd(0,300),fy-2,rnd(-120,-20),rnd(-80,-10),rnd(0.2,0.4),'#ffd080',1.5,300);
  if(Math.random()<0.05&&AC) nz({t:0.4,v:0.08,type:'bandpass',f:2400,q:4}); }
defMech('chase',{
  load(){ CHASE=null; },
  update(dt){ const p=player;
  // chase
  const C=LVL.chase;
  if(C&&!CHASE&&p.x>C.start*T){ CHASE={x:p.x-C.lead*T,done:false}; shake=10; showMsg(C.msg||'Лавина! Бягай!',2.5); SFX.cascade&&SFX.cascade(); }
  if(CHASE&&!CHASE.done){ CHASE.x+=C.speed*[0.82,1,1.12][DI]*dt; if(p.x-CHASE.x>C.lead*T+6*T) CHASE.x=p.x-(C.lead+6)*T;
    shake=Math.max(shake,clamp(6-(p.x-CHASE.x)/(3*T),0,5));
    if(!p.dead&&p.x<CHASE.x+4){ die(); showMsg(C.die||'Лавината те затрупа!',2.5); }
    for(const e of enemies) if(!e.dead&&e.x<CHASE.x) hurtEnemy(e,999,0,true);
    if(p.x>C.end*T){ CHASE.done=true; shake=12; showMsg(C.safe||'Спаси се!',2); } }
  },
  drawWorld(){
  if(CHASE&&!CHASE.done&&LVL.chase.kind==='train') drawTrainChase();
  else if(CHASE&&!CHASE.done&&LVL.chase.draw) LVL.chase.draw(CHASE.x-cam);   // собствен вид на гонитбата (напр. Р7)
  else if(CHASE&&!CHASE.done){ const fx=CHASE.x-cam; if(fx>-40){ ctx.fillStyle='#e8f0f6'; ctx.beginPath(); ctx.moveTo(fx-600,0); for(let y=0;y<=H;y+=8) ctx.lineTo(fx+Math.sin(y*0.09+titleT*7)*7+Math.sin(y*0.031+titleT*3)*10,y); ctx.lineTo(fx-600,H); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#bfd0dc'; for(let i=0;i<10;i++){ const y=(i*37+titleT*90)%H; ctx.fillRect(fx-30-((i*53)%80),y,10+(i%3)*6,6); }
      if(Math.random()<0.8) part(CHASE.x+rnd(-4,10),rnd(H),rnd(40,160),rnd(-60,30),rnd(0.4,0.9),Math.random()<0.6?'#ffffff':'#cfdde8',rnd(2,4),200); } }
  },
  lights(L){
  if(CHASE&&!CHASE.done&&LVL.chase.kind==='train') L.push([CHASE.x+60,12*T,120,1]);
  },
  respawn(){ const p=player;
  if(CHASE&&!CHASE.done) CHASE.x=Math.min(CHASE.x,p.x-LVL.chase.lead*T);
  } });
