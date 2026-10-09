/* ================= РАКЕТИ НА БОСОВЕТЕ (bmiss) ================= */
function missPop(m){ m.dead=true; sparks(m.x,m.y,10,'#ffb53a'); for(let i=0;i<6;i++) part(m.x,m.y,rnd(-40,40),rnd(-40,20),rnd(0.3,0.6),'#3b3b3b',rnd(3,5),-20,2); sfxAt('smallBoom',{x:m.x,y:m.y,w:0}); light(m.x,m.y,70,0.8,'rgba(255,150,40,'); }
function updMissiles(dt){
  const p=player;
  for(const m of bmiss){ if(m.dead) continue; m.t+=dt; m.life-=dt; const sp=Math.hypot(m.vx,m.vy);
    if(m.t>0.5&&!p.dead){ const cur=Math.atan2(m.vy,m.vx), tg=Math.atan2(p.y+p.h/2-m.y,p.x+p.w/2-m.x), turn=(DI===0?1.1:DI===2?2.2:1.6)*dt, na=cur+clamp(angDiff(tg,cur),-turn,turn), ns=Math.min(DI===0?115:DI===2?180:155,sp+60*dt); m.vx=Math.cos(na)*ns; m.vy=Math.sin(na)*ns; }
    m.x+=m.vx*dt; m.y+=m.vy*dt;
    if(Math.random()<0.6) part(m.x-m.vx*0.03,m.y-m.vy*0.03,rnd(-10,10),rnd(-10,10),rnd(0.3,0.5),'#8a8a8a',2,-10,2);
    if(m.life<=0||(m.t>0.3&&solidAt(m.x,m.y))) missPop(m);
    else if(!p.dead&&m.x>p.x-3&&m.x<p.x+p.w+3&&m.y>p.y-3&&m.y<p.y+p.h+3){ missPop(m); hurtPlayer(15,sgn(m.vx)*160); p.vy=-120; } }
  bmiss=bmiss.filter(m=>!m.dead);
}
function drawMissiles(){ for(const m of bmiss){ ctx.save(); ctx.translate(Math.round(m.x-cam),Math.round(m.y)); ctx.rotate(Math.atan2(m.vy,m.vx)); px(-5,-1,7,3,'#5a5f63'); px(2,-1,3,3,'#c9473a'); px(-8,-1,3,3,Math.random()<0.5?'#ffd36b':'#ff8a3a'); ctx.restore(); } }


