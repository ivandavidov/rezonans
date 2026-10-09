/* ================= PARTICLES & FX ================= */
function part(x,y,vx,vy,life,col,size=1,g=0,kind=0){ if(particles.length>700) particles.shift(); particles.push({x,y,vx,vy,life,max:life,col,size,g,kind}); }
function sparks(x,y,n=5,col='#ffd36b'){ for(let i=0;i<n;i++) part(x,y,rnd(-90,90),rnd(-110,30),rnd(0.15,0.35),col,1,300); }
function blood(x,y,alien,n=8){ const c=alien?['#c9e23b','#9fbf1e','#e8f56b']:['#a31616','#7a0f0f','#c42a2a']; for(let i=0;i<n;i++) part(x,y,rnd(-80,80),rnd(-120,10),rnd(0.3,0.7),c[i%3],rnd(1,2.5),500); }
function light(x,y,r,a,col){ flashes.push({x,y,r,a,col,life:0.06,max:0.06}); }
function explode(x,y,r=70,dmg=80,selfMul=1,fromBoss=false){
  for(let i=0;i<26;i++){ const a=rnd(6.28),s=rnd(30,170); part(x,y,Math.cos(a)*s,Math.sin(a)*s-30,rnd(0.25,0.6),['#fff1a8','#ffb53a','#ff6a1a'][i%3],rnd(2,4),40,1); }
  for(let i=0;i<14;i++) part(x+rnd(-10,10),y+rnd(-10,10),rnd(-30,30),rnd(-60,-10),rnd(0.8,1.4),'#3b3b3b',rnd(4,7),-20,2);
  for(let i=0;i<10;i++) part(x,y,rnd(-200,200),rnd(-260,-60),rnd(0.5,1),'#5a5f63',2,700);
  flashes.push({x,y,r:150,a:0.9,col:'rgba(255,150,40,',life:0.4,max:0.4});
  shake=Math.max(shake,9); flash=Math.max(flash,0.25); flashCol='#ffb060';
  sfxAt('boom',{x,y,w:0});
  const hurtIn=e=>{ const cx=e.x+e.w/2,cy=e.y+e.h/2,d=Math.hypot(cx-x,cy-y); return d<r?dmg*(1-d/r)+12:0; };
  if(player&&!player.dead&&selfMul>0){ const d=hurtIn(player)*selfMul; if(d>0){ hurtPlayer(d,sgn(player.x+5-x)*220); player.vy=-220; } }
  for(const e of enemies) if(!e.dead){ const d=hurtIn(e); if(d>0){ hurtEnemy(e,d*1.4,sgn(e.x-x)*200); if(e.type!=='turret') e.vy=-200; } }
  for(const s of scientists) if(s.state!=='dead'&&hurtIn(s)>0) killSci(s);
  if(boss&&!boss.dead&&!fromBoss){ const cx=boss.x+boss.w/2,cy=boss.y+boss.h/2,d=Math.hypot(cx-x,cy-y); if(d<r+30) hurtBoss(150*(1-d/(r+30))+40,true); }
  for(const b of barrels) if(!b.dead&&b.fuse<0&&Math.hypot(b.x+6-x,b.y+8-y)<r) b.fuse=0.15;
  for(const m of bmiss) if(!m.dead&&Math.hypot(m.x-x,m.y-y)<r) missPop(m);
}

