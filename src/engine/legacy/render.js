/* ================= RENDER ================= */
let tint=null;
const px=(x,y,w,h,c)=>{ctx.fillStyle=tint||c;ctx.fillRect(x,y,w,h);};
function begin(e,flip=true){ ctx.save(); ctx.translate(Math.round(e.x+e.w/2-cam),Math.round(e.y+e.h)); if(flip&&e.face<0) ctx.scale(-1,1); }
function drawPlayer(){
  const p=player; if(p.inv>0.3&&Math.floor(p.inv*16)%2===0&&!p.dead) return;
  begin(p); tint=p.hurtT>0?'#ffffff':null;
  const {suit,suitD,plate,plateH,dark,helm}=GAME.suit;
  if(p.swim&&!p.onGround&&!p.dead&&!p.climb){ ctx.translate(0,-12); ctx.rotate(0.9); ctx.translate(0,12); }
  if(p.dead){ const a=Math.min(1,p.deadT*3); ctx.rotate(-a*Math.PI/2); ctx.translate(a*-2,0); }
  if(p.climb){
    const s=Math.sin(p.anim)>0?1:-1;
    px(-4,-11+s,3,8,suitD); px(1,-11-s,3,8,suitD); px(-5,-21,10,11,suit); px(-5,-20,10,6,plate); px(-4,-27,8,7,helm);
    px(-7,-25-s*2,3,6,suit); px(4,-25+s*2,3,6,suit); tint=null; ctx.restore(); return;
  }
  if(!p.crouch){
    const w=p.onGround&&Math.abs(p.vx)>10?Math.round(Math.sin(p.anim)*3):(p.onGround?0:2);
    px(-4+w,-11,3,8,suitD); px(1-w,-11,3,8,suitD); px(-5+w,-3,5,3,dark); px(0-w,-3,5,3,dark);
    px(-5,-21,10,11,suit); px(-4,-20,8,5,plate); px(-4,-20,8,1,plateH); px(-5,-12,10,2,dark); px(-3,-17,2,2,'#ff9a1f');
    px(-8,-20,3,9,plate); px(-8,-20,3,1,plateH);
    px(-4,-27,8,7,helm); px(-4,-27,8,1,'#e6e0d2'); px(0,-25,4,3,'#1b2a33'); px(1,-25,2,1,'#7fd8ff');
    drawGun(p,-17);
  } else {
    px(-6,-4,6,4,suitD); px(1,-3,5,3,dark); px(-6,-1,5,1,dark);
    px(-5,-12,10,8,suit); px(-4,-11,8,4,plate); px(-8,-11,3,7,plate);
    px(-4,-18,8,7,helm); px(0,-16,4,3,'#1b2a33'); px(1,-16,2,1,'#7fd8ff');
    drawGun(p,-9);
  }
  tint=null; ctx.restore();
}
function drawGun(p,y){
  if(p.cur==='none') return;
  ctx.save(); ctx.translate(1,y);
  if(p.cur==='wrench'){ const s=p.swingT>0?(1-p.swingT/0.22):0; ctx.rotate(p.swingT>0?-1.4+s*2.2:-0.5); }
  else if(p.cur==='grenade'){ ctx.rotate(p.swingT>0?-1.2+(1-p.swingT/0.2)*1.6:-0.2); }
  else if(p.aimUp) ctx.rotate(-Math.PI/4);
  px(-1,-1,5,2,'#b5832b'); px(3,-1,2,2,'#e2b48f');
  if(p.cur==='pistol'){ px(4,-2,6,2,'#2a2e33'); px(4,0,2,2,'#2a2e33'); px(5,-2,4,1,'#4b525a'); }
  else if(p.cur==='shotgun'){ px(0,-2,13,2,'#2a2e33'); px(5,0,6,1,'#6b4a2a'); px(-3,0,4,2,'#6b4a2a'); }
  else if(p.cur==='pulse'){ px(-2,-3,14,3,'#33413a'); px(2,0,5,2,'#33413a'); px(4,-2,6,1,'#5dffa8'); px(11,-2,3,1,'#9affc8'); }
  else if(p.cur==='grenade'){ px(4,-3,4,4,'#3c4a2a'); px(5,-4,2,1,'#9aa3aa'); }
  else if(p.cur==='rocket'){ px(-6,-4,20,4,'#3d4430'); px(-6,-4,20,1,'#5a6348'); px(13,-5,2,6,'#22261c'); px(2,0,3,3,'#22261c'); if(p.ammo.rocket.mag>0) px(14,-3,2,2,'#c9473a'); }
  else { px(4,-1,9,2,'#9aa3aa'); px(12,-3,3,2,'#9aa3aa'); px(12,1,3,2,'#9aa3aa'); px(4,-1,9,1,'#c6ccd0'); }
  if(p.flashT>0&&!tint){ const L=p.cur==='shotgun'?14:p.cur==='pulse'?15:11; ctx.fillStyle=p.cur==='pulse'?'#d8ffe8':'#fff6c8'; ctx.fillRect(L,-3,4,4); ctx.fillStyle=p.cur==='pulse'?'#5dffa8':'#ffb43a'; ctx.fillRect(L+3,-2,4,2); ctx.fillRect(L+1,-5,2,2); ctx.fillRect(L+1,2,2,2); }
  ctx.restore();
}
function fade(e,start){ const a=1-clamp(e.deadT-start,0,1); ctx.globalAlpha=a; return a>0; }
function drawCrab(e){
  begin(e); tint=e.hitT>0?'#fff':null;
  if(e.dead){ if(fade(e,2)){ px(-6,-3,12,3,'#7a6448'); px(-4,-4,8,1,'#9b8462'); } ctx.globalAlpha=1; tint=null; ctx.restore(); return; }
  const leg=e.onGround?Math.round(Math.sin(e.anim)):0, sh='#6f5b44', fl='#cdb48c', fd='#9b8462';
  if(e.onGround){ px(-7,-2+leg,2,2,sh); px(-4,-1,1,1,sh); px(3,-1,1,1,sh); px(5,-2-leg,2,2,sh); }
  else { px(5,-8,4,2,'#e7d9bd'); px(5,-4,4,1,'#e7d9bd'); px(-8,-3,3,1,sh); }
  px(-6,-6,12,4,fd); px(-5,-8,10,2,fl); px(-3,-9,6,1,fl); px(-4,-7,2,1,'#e0cba5'); px(-4,-2,8,1,'#5a1f1f');
  tint=null; ctx.restore();
}
function drawShocker(e){
  begin(e); tint=e.hitT>0?'#fff':null;
  const sk='#6e8a5d', sd='#4c6340', sl='#8fae79';
  if(e.dead){ if(fade(e,3)){ px(-12,-4,24,4,sd); px(-10,-6,10,2,sk); px(8,-5,6,4,sk); } ctx.globalAlpha=1; tint=null; ctx.restore(); return; }
  const w=Math.abs(e.vx)>1?Math.round(Math.sin(e.anim*8)*2):0, ch=e.state==='charge';
  px(-4+w,-10,3,9,sd); px(1-w,-10,3,9,sd); px(-6+w,-1,5,1,sd); px(0-w,-1,5,1,sd);
  px(-5,-22,10,12,sk); px(-3,-19,6,7,sl); px(-6,-21,2,6,sd);
  px(1,-27,8,6,sk); px(1,-27,8,1,sl); px(6,-25,2,2,'#ff3b2e'); px(8,-23,2,1,sd);
  if(ch){ px(2,-25,2,8,sd); px(-2,-25,2,8,sd); px(3,-27,7,2,sd); }
  else { px(2,-19,8,2,sd); px(9,-19,2,4,sd); px(-3,-18,2,7,sd); }
  tint=null;
  if(ch){ const r=3+Math.sin(e.anim*40)*1.5; ctx.fillStyle='rgba(160,255,110,0.9)'; ctx.beginPath(); ctx.arc(8,-26,r,0,7); ctx.fill(); ctx.fillStyle='#eaffd8'; ctx.fillRect(7,-27,2,2); }
  ctx.restore();
}
function drawSoldier(e){
  begin(e); tint=e.hitT>0?'#fff':null;
  const cm='#4d5636', cd='#363c26', vest='#2c2f22';
  if(e.dead){ if(fade(e,4)){ px(-12,-4,22,4,cm); px(8,-5,5,5,'#3f4630'); px(-12,-3,5,2,'#111'); } ctx.globalAlpha=1; tint=null; ctx.restore(); return; }
  const w=Math.abs(e.vx)>1?Math.round(Math.sin(e.anim)*3):0;
  px(-4+w,-11,3,8,cd); px(1-w,-11,3,8,cd); px(-5+w,-3,5,3,'#141518'); px(0-w,-3,5,3,'#141518');
  px(-5,-21,10,11,cm); px(-4,-20,8,7,vest); px(-3,-19,2,3,cd); px(1,-19,2,3,cd); px(-5,-12,10,2,'#1d1f17');
  px(-4,-27,8,7,'#1a1c1e'); px(-5,-28,10,3,'#3f4630'); px(1,-25,3,2,'#d4ff4a'); px(2,-22,3,2,'#2b2e31');
  px(0,-18,6,2,cm); px(2,-19,12,2,'#15171a'); px(4,-17,2,3,'#15171a');
  if(e.flashT>0&&!tint){ ctx.fillStyle='#fff3b0'; ctx.fillRect(14,-20,3,3); }
  tint=null; ctx.restore();
}
function drawTurret(e){
  begin(e,false); tint=e.hitT>0?'#fff':null;
  px(-6,-2,2,2,'#2a2e33'); px(4,-2,2,2,'#2a2e33'); px(-1,-5,2,4,'#3a4046'); px(-5,-3,10,1,'#3a4046');
  if(e.dead){ px(-4,-8,8,3,'#26292c'); px(-1,-10,6,2,'#1a1c1e'); if(Math.random()<0.1) part(e.x+e.w/2,e.y,rnd(-5,5),-25,0.8,'#444',3,-10,2); tint=null; ctx.restore(); return; }
  px(-5,-9,10,5,'#4a5258'); px(-5,-9,10,1,'#6d767c');
  ctx.save(); ctx.translate(0,-7); ctx.rotate(e.ang||Math.PI); px(0,-1,11,2,'#1d2125'); px(8,-2,3,4,'#2a2e33'); if(e.flashT>0&&!tint){ ctx.fillStyle='#fff3b0'; ctx.fillRect(11,-2,3,4); } ctx.restore();
  px(-2,-8,2,2,e.alert&&Math.floor(titleT*8)%2?'#ff3b2e':'#5a1a14');
  tint=null; ctx.restore();
}
function drawFlyer(e){
  begin(e); tint=e.hitT>0?'#fff':null;
  if(e.dead){ if(fade(e,2)){ px(-7,-3,14,3,'#5a2f6e'); px(-3,-4,6,1,'#ff6ad5'); } ctx.globalAlpha=1; tint=null; ctx.restore(); return; }
  const f=Math.round(Math.sin(e.anim*(e.state==='dive'?30:16))*3);
  px(-6,-7,12,5,'#7a3d8f'); px(-5,-8,9,1,'#a35dbd'); px(3,-7,3,3,'#a35dbd'); px(5,-6,2,1,'#ffef5a');
  px(-11,-9+f,6,2,'#5a2f6e'); px(-13,-10+f*1.5,3,2,'#5a2f6e'); px(5,-9-f,0,0,'#000');
  px(-2,-11-f,6,2,'#5a2f6e'); px(-1,-13-f*1.5,4,2,'#5a2f6e');
  px(-9,-4,4,1,'#5a2f6e'); px(-11,-3,2,1,'#ff6ad5');
  tint=null; ctx.restore();
}
function drawGuard(e){
  begin(e); tint=e.hitT>0?'#fff':null;
  if(e.dead){ if(fade(e,4)){ px(-14,-5,26,5,'#5a4a3a'); px(-10,-7,10,2,'#6e4a8a'); px(10,-6,5,4,'#5a4a3a'); } ctx.globalAlpha=1; tint=null; ctx.restore(); return; }
  const w=Math.abs(e.vx)>1?Math.round(Math.sin(e.anim*7)*2):0, pu=e.state==='punch'&&e.t<0.15?6:0;
  px(-6+w,-13,5,11,'#3a2e46'); px(1-w,-13,5,11,'#3a2e46'); px(-7+w,-3,7,3,'#221a2c'); px(0-w,-3,7,3,'#221a2c');
  px(-8,-28,16,15,'#5a4a3a'); px(-7,-27,14,3,'#7a6a52'); px(-5,-23,10,6,'#6e4a8a'); px(-8,-15,16,2,'#3a2e24');
  px(-3,-33,9,6,'#5a4a3a'); px(-3,-34,9,1,'#7a6a52'); px(2,-31,2,1,'#ffef5a'); px(5,-31,1,1,'#ffef5a');
  px(4,-23,10+pu,5,'#3a2e24'); px(13+pu,-22,2,3,e.flashT>0?'#ffffe0':'#e8ff6a');
  tint=null; ctx.restore();
}
function drawZombie(e){
  begin(e); tint=e.hitT>0?'#fff':null;
  if(e.dead){ if(fade(e,4)){ px(-12,-4,24,4,'#c9cfc4'); px(-12,-3,4,2,'#3b4a5a'); px(-6,-2,10,2,'#7a0f0f'); } ctx.globalAlpha=1; tint=null; ctx.restore(); return; }
  const w=Math.abs(e.vx)>1?Math.round(Math.sin(e.anim*6)*2):0, sw=e.state==='swing', up=sw?(e.t>0.2?-8:2):0;
  px(-4+w,-11,3,8,'#3b4a5a'); px(1-w,-11,3,8,'#3b4a5a'); px(-5+w,-3,4,3,'#2a2a2a'); px(1-w,-3,4,3,'#2a2a2a');
  px(-5,-21,10,12,'#c9cfc4'); px(-5,-21,1,12,'#9aa39a'); px(-2,-18,5,4,'#8a1a1a'); px(1,-13,3,3,'#6a1414');
  px(-2,-25,7,5,'#a8b89a'); px(2,-23,2,1,'#2a1a1a');
  px(-4,-30,10,5,'#cdb48c'); px(-3,-31,8,1,'#e0cba5'); px(-5,-27,2,3,'#9b8462'); px(5,-27,2,3,'#9b8462'); px(-2,-26,6,1,'#5a1f1f');
  px(3,-19+up,8,2,'#a8b89a'); px(3,-16+up,8,2,'#c9cfc4'); px(10,-20+up,3,2,'#a8b89a');
  tint=null; ctx.restore();
}
function drawNest(e){
  const cx=Math.round(e.x+e.w/2-cam), by=Math.round(e.y+e.h), s=e.big?1.6:1;
  ctx.save(); tint=e.hitT>0?'#fff':null;
  if(e.dead){ ctx.globalAlpha=Math.max(0.4,1-e.deadT*0.2); ctx.fillStyle='#3a1426'; ctx.beginPath(); ctx.ellipse(cx,by-3,10*s,3*s,0,0,7); ctx.fill(); ctx.restore(); tint=null; return; }
  const pul=1+Math.sin(e.anim*3)*0.06+(e.pop||0)*0.4;
  ctx.fillStyle=tint||'#5a1e3c'; ctx.beginPath(); ctx.ellipse(cx,by-8*s*pul,10*s*pul,8*s*pul,0,0,7); ctx.fill();
  ctx.fillStyle=tint||'#7a2a52'; ctx.beginPath(); ctx.ellipse(cx-2*s,by-10*s*pul,6*s,4*s,0,0,7); ctx.fill();
  ctx.strokeStyle='#ff6ad5'; ctx.globalAlpha=0.7; ctx.lineWidth=1; for(let i=0;i<4;i++){ ctx.beginPath(); ctx.moveTo(cx-8*s+i*5*s,by-2); ctx.quadraticCurveTo(cx-6*s+i*4*s,by-10*s,cx-2*s+i*2*s,by-15*s*pul); ctx.stroke(); } ctx.globalAlpha=1;
  ctx.fillStyle='#ffe0f7'; ctx.fillRect(cx-1,by-Math.round(14*s*pul),2,2);
  ctx.fillStyle='#3a1426'; ctx.fillRect(cx-12*s,by-2,24*s,2);
  tint=null; ctx.restore();
}
function drawTrains(){
  for(const t of tracks){ if(t.warned||trains.some(q=>q.tr===t)){ const on=Math.floor(titleT*6)%2===0; for(const x of [t.x0*T+4,(t.x1+1)*T-8]){ const X=x-cam; if(X<-10||X>W+10) continue; px(X-3,10*T,8,6,'#1a1c1e'); px(X-2,10*T+1,6,4,on?'#ff3b2e':'#5a1a14'); } } }
  for(const t of trains){
    ctx.save(); ctx.beginPath(); ctx.rect(t.tr.x0*T-cam,0,(t.tr.x1-t.tr.x0+1)*T,H); ctx.clip();
    const x=Math.round(t.x-cam), y=13*T, front=t.dir>0?x+TL:x;
    for(let c=0;c<3;c++){ const cx=x+c*38+(t.dir>0?0:2); px(cx,y+2,34,24,c===(t.dir>0?2:0)?'#c9a227':'#7a5a2a'); px(cx,y+2,34,2,'#e0c050'); px(cx+3,y+8,28,8,c===(t.dir>0?2:0)?'#2a3a44':'#5a421e'); px(cx+4,y+26,6,5,'#15171a'); px(cx+24,y+26,6,5,'#15171a'); px(cx+34,y+16,4,2,'#3a3a3a'); }
    px(front+(t.dir>0?-4:0),y+18,4,4,'#fff6c8');
    ctx.restore();
  }
}
function drawSwitch(){ const s=LVL.sw; if(!s) return; const x=s[0]*T-cam, y=s[1]*T; if(x<-30||x>W+30) return; px(x,y-6,16,22,'#3a4046'); px(x+2,y-4,12,7,'#0d1a14'); px(x+3,y-3,10,5,switchOn?'#3dff7a':(Math.floor(titleT*3)%2?'#ff3b2e':'#5a1a14')); px(x+6,y+5,2,8,'#9aa3aa'); px(x+5,switchOn?y+4:y+11,4,3,'#c9473a'); }
function drawScientist(s){ if(s.esc) return drawEscort(s);
  begin(s);
  if(s.state==='dead'){ px(-12,-4,24,4,'#e8eef0'); px(9,-5,4,4,'#e2b48f'); px(-12,-3,4,2,'#3b4a5a'); px(-4,-2,8,2,'#7a0f0f'); ctx.restore(); return; }
  const run=s.state==='run'?Math.round(Math.sin(s.anim)*3):0;
  if(s.state==='cower'){ px(-5,-14,10,11,'#e8eef0'); px(-4,-4,8,4,'#3b4a5a'); px(-3,-19,7,6,'#e2b48f'); px(-3,-20,7,2,'#9aa0a3'); px(-4,-13,9,2,'#e2b48f'); ctx.restore(); return; }
  px(-4+run,-11,3,8,'#3b4a5a'); px(1-run,-11,3,8,'#3b4a5a'); px(-5+run,-3,4,3,'#2a2a2a'); px(1-run,-3,4,3,'#2a2a2a');
  px(-5,-22,10,14,'#e8eef0'); px(-5,-22,1,14,'#b9c4c9'); px(-1,-21,2,6,'#7aa6c9');
  px(-3,-28,7,6,'#e2b48f'); px(-3,-29,7,2,'#9aa0a3'); px(-4,-28,2,4,'#9aa0a3'); px(1,-26,4,1,'#222');
  px(1,-21,3,2,'#e8eef0'); px(4,-25+(s.state==='run'?Math.round(Math.sin(s.anim*1.3)*2):4),2,6,'#e2b48f');
  ctx.restore();
}
function drawPickup(k){
  const x=Math.round(k.x-cam), y=Math.round(k.y+(k.vy===undefined?Math.sin(titleT*3+k.bob)*1.5:0));
  if((ITEMS[k.type]||{}).draw) return ITEMS[k.type].draw(k,x,y);
  if(k.type==='health'){ px(x,y,12,10,'#e9eef0'); px(x,y,12,1,'#ffffff'); px(x,y+9,12,1,'#a7b0b5'); px(x+5,y+2,2,6,'#d22a2a'); px(x+3,y+4,6,2,'#d22a2a'); }
  else if(k.type==='battery'){ px(x+2,y-2,8,12,'#1f3f6b'); px(x+4,y-3,4,1,'#9aa3aa'); px(x+3,y,6,8,'#3c8ce0'); px(x+3,y+5-Math.floor((titleT*4)%4),6,1,'#bfe4ff'); }
  else if(k.type==='ammo'){ px(x,y+2,12,8,'#4d5636'); px(x,y+2,12,1,'#6b7650'); px(x+2,y+4,8,3,'#c9a227'); px(x+3,y+5,6,1,'#7a6418'); }
  else if(k.type==='pistol'){ px(x,y+4,11,3,'#2a2e33'); px(x,y+4,11,1,'#5a616a'); px(x+1,y+6,3,4,'#3a4046'); px(x+9,y+4,2,1,'#8e9aa3'); }
  else if(k.type==='shotgun'){ px(x-4,y+4,18,2,'#2a2e33'); px(x+4,y+6,7,2,'#6b4a2a'); px(x-6,y+5,4,3,'#6b4a2a'); px(x-4,y+4,18,1,'#5a616a'); }
  else if(k.type==='pulse'){ px(x-4,y+3,18,3,'#33413a'); px(x,y+6,5,2,'#33413a'); px(x-1,y+4,10,1,'#5dffa8'); px(x+12,y+4,3,1,'#9affc8'); }
  else if(k.type==='rocket'){ px(x-6,y+3,22,4,'#3d4430'); px(x-6,y+3,22,1,'#5a6348'); px(x+14,y+2,2,6,'#22261c'); px(x+2,y+7,3,3,'#22261c'); }
  else if(k.type==='rockets'){ px(x,y+3,12,7,'#4d5636'); px(x,y+3,12,1,'#6b7650'); for(const o of [2,7]){ px(x+o,y,3,4,'#c9473a'); px(x+o,y-1,3,1,'#e8796c'); } }
  else if(k.type==='grenade'){ for(const o of [0,6]){ px(x+o,y+3,5,6,'#3c4a2a'); px(x+o+1,y+2,3,1,'#9aa3aa'); px(x+o,y+4,5,1,'#55663c'); } }
}
function drawBarrel(b){
  if(b.dead) return; const x=Math.round(b.x-cam), y=Math.round(b.y);
  px(x,y,12,16,'#9c2a1e'); px(x,y,12,1,'#c9473a'); px(x+1,y+3,10,1,'#6a1c14'); px(x+1,y+12,10,1,'#6a1c14'); px(x+2,y,2,16,'#b8392b');
  px(x+3,y+5,6,6,'#c99a1c'); px(x+5,y+6,2,3,'#1c1a14'); px(x+5,y+10,2,1,'#1c1a14');
}
function drawSlime(x0,x1){
  for(let tx=x0;tx<=x1;tx++){ if(tileAt(tx,13)!=='~') continue;
    const x=tx*T-cam; for(let i=0;i<T;i+=2){ const s=Math.round(Math.sin((tx*T+i)*0.15+titleT*3)*1.2+Math.sin((tx*T+i)*0.07-titleT*2)); px(x+i,13*T+2+s,2,30-s,'#2f7a1a'); px(x+i,13*T+1+s,2,2,'#8cff4f'); }
    px(x,13*T+10,T,22,'#245e14');
    if(hash(tx,Math.floor(titleT*2))>0.85&&state==='play') part(tx*T+rnd(T),13*T+3,0,rnd(-30,-10),0.5,'#a6ff6a',1.5,0);
  }
}
function drawElectric(){
  if(!zTiles.length) return; const on=elecOn(), warn=elecWarn();
  if(!on&&!warn) return;
  ctx.save(); ctx.globalCompositeOperation='lighter';
  for(const [tx,ty] of zTiles){ const x=tx*T-cam; if(x<-T||x>W) continue; const y=ty*T;
    if(on){ ctx.strokeStyle='rgba(170,220,255,0.9)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x,y-1); for(let i=3;i<=T;i+=3) ctx.lineTo(x+i,y-1-rnd(0,6)); ctx.stroke(); ctx.fillStyle='rgba(120,190,255,0.25)'; ctx.fillRect(x,y-8,T,8); }
    else if(Math.random()<0.15){ ctx.fillStyle='#bfe8ff'; ctx.fillRect(x+rnd(T),y-1-rnd(3),1,1); }
  }
  ctx.restore();
}
function drawPortal(po){
  if(po.t<0) return; const x=po.x-cam, y=po.y, k=po.t/(po.big?1.6:1), r=(po.big?46:20)*Math.sin(Math.min(1,k)*Math.PI);
  ctx.save(); ctx.globalCompositeOperation='lighter';
  const g=ctx.createRadialGradient(x,y,0,x,y,r+6); g.addColorStop(0,'rgba(230,255,200,0.95)'); g.addColorStop(0.5,'rgba(120,255,80,0.6)'); g.addColorStop(1,'rgba(60,200,40,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,r+6,0,7); ctx.fill();
  ctx.strokeStyle='rgba(200,255,160,0.9)'; ctx.lineWidth=1; for(let i=0;i<4;i++){ const a=rnd(6.28); ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+Math.cos(a)*r*0.6+rnd(-4,4),y+Math.sin(a)*r*0.6); ctx.lineTo(x+Math.cos(a)*r*1.2,y+Math.sin(a)*r*1.2); ctx.stroke(); }
  ctx.restore();
}
function drawExitPortal(){
  const e=exitPortal; if(!e) return; const x=e.x-cam, y=e.y, s=Math.min(1,e.t/0.8), home=!!(LVL.arena&&LVL.arena.home);
  ctx.save(); ctx.globalCompositeOperation='lighter';
  const g=ctx.createRadialGradient(x,y,0,x,y,34*s); g.addColorStop(0,home?'rgba(240,248,255,1)':'rgba(230,255,210,1)'); g.addColorStop(0.4,home?'rgba(140,190,255,0.7)':'rgba(120,255,90,0.7)'); g.addColorStop(1,'rgba(40,80,200,0)');
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,34*s,0,7); ctx.fill();
  ctx.strokeStyle=home?'rgba(200,230,255,0.8)':'rgba(200,255,170,0.8)'; for(let k=0;k<3;k++){ ctx.beginPath(); ctx.ellipse(x,y,(14+k*7)*s,(20+k*6)*s,titleT*(1+k*0.5),0,Math.PI*1.4); ctx.stroke(); }
  ctx.restore();
}
const LC=document.createElement('canvas'); LC.width=240; LC.height=136; const lc=LC.getContext('2d');
function drawLights(){
  const L=[];
  for(const l of lamps){ if(l.x<cam-80||l.x>cam+W+80) continue; let a=0.8; if(l.fl){ a=(Math.sin(titleT*23+l.x)>0.3||Math.random()<0.1)?0.15:0.8; } L.push([l.x,l.y+18,78,a]); }
  const p=player, torch=LVL.dark||amb>0.58; L.push([p.x+p.w/2,p.y+p.h/2,torch?96:96,torch?0.75:0.8]);
  for(const f of flashes) L.push([f.x,f.y,f.r,f.a*(f.life/f.max)]);
  for(let tx=Math.floor(cam/T)-1;tx<=Math.floor((cam+W)/T)+1;tx++) if(tileAt(tx,13)==='~'&&tx%2===0) L.push([tx*T+8,13*T+4,34,0.55]);
  for(const c of crystals){ if(c.x<cam-60||c.x>cam+W+60) continue; L.push([c.x,c.y,c.small?40:56,0.7]); }
  if(elecOn()) for(const [tx,ty] of zTiles){ if(tx%2) continue; const x=tx*T; if(x<cam-40||x>cam+W+40) continue; L.push([x+8,ty*T-4,40,0.6]); }
  for(const po of portals) if(po.t>0) L.push([po.x,po.y,po.big?140:80,0.9]);
  for(const o of orbs) L.push([o.x,o.y,50,0.8]);
  for(const b of ebullets) if(b.orb) L.push([b.x,b.y,30,0.7]);
  for(const e of enemies) if(!e.dead&&e.type==='shocker'&&e.state==='charge') L.push([e.x+e.w/2+e.face*8,e.y+8,46,0.7]);
  if(torch) for(const e of enemies) if(!e.dead&&e.type!=='nest'&&e.x>cam-40&&e.x<cam+W+40) L.push([e.x+e.w/2,e.y+e.h/2,30,0.45]);
  if(boss&&!boss.dead){ const g=BOSSES[boss.type].glow; L.push(g?g(boss):[boss.x+boss.w/2,boss.y+26,70,0.7]); }
  if(exitPortal) L.push([exitPortal.x,exitPortal.y,120,1]);
  for(const t of trains) L.push([t.dir>0?t.x+TL:t.x,13*T+20,90,0.9]);
  for(const b of ebullets) if(b.hornet||b.acid) L.push([b.x,b.y,24,0.6]);
  for(const l of lasers) if(lzState(l)===2&&Math.abs(l.tx*T-cam-W/2)<W) L.push([l.tx*T+8,(l.r0+l.r1)*T/2,70,0.7]);
  if(LVL.liftStyle==='float') for(const l of lifts) L.push([l.x+l.w/2,l.y,40,0.5]);
  for(const e of enemies){ const lt=FOES[e.type].light; if(lt&&!e.dead) lt(e,L); }
  if(boss&&BOSSES[boss.type].lights) BOSSES[boss.type].lights(L);
  for(const r of rockets) L.push([r.x,r.y,40,0.8]);
  for(const m of bmiss) L.push([m.x,m.y,34,0.7]);
  if(LVL.fires) for(const [fx,fy] of LVL.fires) L.push([fx,fy-10,80+Math.sin(titleT*13+fx)*8,0.8]);
  if(LVL.sw) L.push([LVL.sw[0]*T+8,LVL.sw[1]*T,40,0.6]);
  r2Lights(L);
  lc.globalCompositeOperation='source-over'; lc.clearRect(0,0,240,136); lc.fillStyle=`rgba(3,5,9,${torch?Math.min(amb,0.7):Math.min(amb*0.65,0.36)})`; lc.fillRect(0,0,240,136);
  lc.globalCompositeOperation='destination-out';
  for(const [x0,y0,r0,a] of L){ const x=(x0-cam)/2, y=y0/2, r=r0/2; if(x<-r||x>240+r) continue; const g=lc.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,`rgba(0,0,0,${clamp(a,0,1)})`); g.addColorStop(1,'rgba(0,0,0,0)'); lc.fillStyle=g; lc.fillRect(x-r,y-r,r*2,r*2); }
  if(torch&&!p.dead){ const x=(p.x+p.w/2-cam)/2, y=(p.y+(p.crouch?6:8))/2, ang=p.aimUp?(p.face>0?-0.7:Math.PI+0.7):(p.face>0?0:Math.PI), r=145;
    lc.save(); lc.beginPath(); lc.moveTo(x,y); lc.arc(x,y,r,ang-0.55,ang+0.55); lc.closePath(); lc.clip(); const g=lc.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,'rgba(0,0,0,0.95)'); g.addColorStop(0.7,'rgba(0,0,0,0.6)'); g.addColorStop(1,'rgba(0,0,0,0)'); lc.fillStyle=g; lc.fillRect(x-r,y-r,2*r,2*r); lc.restore(); }
  ctx.save(); ctx.imageSmoothingEnabled=true; ctx.drawImage(LC,0,0,W,H); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation='lighter';
  const glow=(x,y,r,c)=>{ const X=x-cam; if(X<-r||X>W+r) return; const g=ctx.createRadialGradient(X,y,0,X,y,r); g.addColorStop(0,c+'0.22)'); g.addColorStop(1,c+'0)'); ctx.fillStyle=g; ctx.fillRect(X-r,y-r,r*2,r*2); };
  for(const f of flashes) if(f.col) glow(f.x,f.y,f.r*0.7,f.col);
  for(let tx=Math.floor(cam/T)-1;tx<=Math.floor((cam+W)/T)+1;tx++) if(tileAt(tx,13)==='~'&&tx%3===0) glow(tx*T+8,13*T,40,'rgba(120,255,60,');
  for(const c of crystals){ const pulse=0.8+Math.sin(titleT*2+c.x)*0.2; glow(c.x,c.y,(c.small?22:34)*pulse,'rgba('+c.rgb+','); }
  for(const o of orbs) glow(o.x,o.y,36,'rgba(140,255,80,');
  if(LVL.fires) for(const [fx,fy] of LVL.fires) glow(fx,fy-12,60,'rgba(255,120,40,');
  for(const t of tracks) if(t.warned){ const a=(Math.sin(titleT*12)+1)/2; for(const x of [t.x0*T+4,(t.x1+1)*T-8]) glow(x,10*T+3,30*a+8,'rgba(255,40,30,'); }
  if(LVL.alarm&&intro.phase>=1){ const a=(Math.sin(titleT*6)+1)/2; for(const b of beacons){ if(b.x<cam-60||b.x>cam+W+60) continue; glow(b.x,b.y+6,46*a+10,'rgba(255,40,30,'); } }
  ctx.restore();
  if(LVL.alarm&&intro.phase>=1) for(const b of beacons){ const X=b.x-cam; if(X<-10||X>W+10) continue; const a=(Math.sin(titleT*6)+1)/2; ctx.fillStyle=`rgba(255,${60+a*80},50,${0.6+a*0.4})`; ctx.fillRect(X-2,b.y-2,4,3); }
}
function renderWorld(){
  ctx.save(); if(FLIP){ ctx.translate(0,H); ctx.scale(1,-1); }
  if(shake>0) ctx.translate(Math.round(rnd(-shake,shake)*0.5),Math.round(rnd(-shake,shake)*0.5));
  const sx=Math.round(cam);
  ctx.imageSmoothingEnabled=false;
  const saveCam=cam; cam=sx;
  if(SKY) drawSky();
  ctx.drawImage(LV,sx*S,0,W*S,H*S,0,0,W,H);
  if(LVL.drawBack) LVL.drawBack(); r2DrawBack();
  for(const k of pickups) if(!k.taken&&k.x>cam-20&&k.x<cam+W+20) drawPickup(k);
  for(const b of barrels) if(b.x>cam-20&&b.x<cam+W+20) drawBarrel(b);
  for(const s of scientists) drawScientist(s);
  for(const e of enemies){ if(e.x<cam-40||e.x>cam+W+40||e.deadT>50) continue; FOES[e.type].draw(e); }
  drawTrains(); drawSwitch(); drawCrushers(); drawConveyors(); drawLifts(); drawLasers(); drawVents();
  if(boss) BOSSES[boss.type].draw();
  drawMissiles();
  for(const r of rockets){ ctx.save(); ctx.translate(Math.round(r.x-cam),Math.round(r.y)); ctx.rotate(Math.atan2(r.vy,r.vx)); px(-6,-1,8,3,'#5a6348'); px(2,-1,3,3,'#c9473a'); px(-9,-1,3,3,'#ffd36b'); ctx.restore(); }
  if(player) drawPlayer(); r2DrawWorld();
  drawSlime(Math.floor(cam/T)-1,Math.floor((cam+W)/T)+1);
  drawElectric();
  drawExitPortal();
  for(const t of tracers){ ctx.strokeStyle=`rgba(${t.col||'255,230,150'},${t.life/0.05*0.8})`; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(t.x0-cam,t.y0); ctx.lineTo(t.x1-cam,t.y1); ctx.stroke(); }
  for(const b of ebullets){ if(b.orb){ const x=b.x-cam; const g=ctx.createRadialGradient(x,b.y,0,x,b.y,b.r+2); const cc=b.ice?['#ffffff','#9ad8ff','rgba(120,200,255,0)']:b.red?['#fff0d8','#ff5a3a','rgba(220,60,20,0)']:b.acid?['#f0ffd8','#7adf2a','rgba(80,200,20,0)']:b.hornet?['#ffffe0','#d8f040','rgba(160,200,20,0)']:['#fff0ff','#c77dff','rgba(150,60,220,0)']; g.addColorStop(0,cc[0]); g.addColorStop(0.5,cc[1]); g.addColorStop(1,cc[2]); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,b.y,b.r+2,0,7); ctx.fill(); } else px(Math.round(b.x-cam)-2,Math.round(b.y),4,1,'#ffe08a'); }
  for(const g of grenades){ px(Math.round(g.x-cam)-2,Math.round(g.y)-2,4,4,'#3c4a2a'); if(Math.floor(g.t*8)%2) px(Math.round(g.x-cam)-1,Math.round(g.y)-3,2,1,'#ff3b2e'); }
  for(const o of orbs){ const x=o.x-cam; const g=ctx.createRadialGradient(x,o.y,0,x,o.y,o.r); g.addColorStop(0,'#f2ffd8'); g.addColorStop(0.5,'#9dff5a'); g.addColorStop(1,'rgba(80,200,40,0.2)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,o.y,o.r,0,7); ctx.fill(); }
  for(const b of bolts){ const a=b.life/b.max; ctx.save(); ctx.globalCompositeOperation='lighter'; for(const [lw,c] of [[3,`rgba(120,255,90,${a*0.5})`],[1,`rgba(235,255,220,${a})`]]){ ctx.strokeStyle=c; ctx.lineWidth=lw; ctx.beginPath(); b.pts.forEach(([x,y],i)=>i?ctx.lineTo(x-cam,y):ctx.moveTo(x-cam,y)); ctx.stroke(); } ctx.restore(); }
  for(const q of particles){ const a=clamp(q.life/q.max,0,1); ctx.globalAlpha=q.kind===2?a*0.5:a; const s=q.kind===2?q.size*(1.6-a):q.size; ctx.fillStyle=q.col; ctx.fillRect(Math.round(q.x-cam-s/2),Math.round(q.y-s/2),Math.max(1,Math.round(s)),Math.max(1,Math.round(s))); }
  ctx.globalAlpha=1;
  for(const po of portals) drawPortal(po);
  drawLights();
  ctx.font='600 7px "IBM Plex Mono",monospace'; ctx.textAlign='center'; ctx.textBaseline='bottom';
  if(!FLIP) for(const b of barks){ const x=b.e.x+b.e.w/2-cam, y=b.e.y-6; const w=ctx.measureText(b.t).width+8; ctx.fillStyle='rgba(8,10,12,0.8)'; ctx.fillRect(Math.round(x-w/2),y-10,Math.round(w),11); ctx.fillStyle='#e8edf0'; ctx.fillText(b.t,x,y); }
  ctx.textAlign='left';
  cam=saveCam;
  ctx.restore(); r2PostFx();
}
function renderSurvOver(){
  overlay(0.88); glitchTitle('КРАЙ НА ОЦЕЛЯВАНЕТО',W/2,70,22);
  centerText('Стигна до сектор '+(survK+1)+' на трудност „'+D.name+'“',96,'600 9px "IBM Plex Mono",monospace','#cfd8dc');
  glitchTitle(String(survScore),W/2,140,34); centerText('ТОЧКИ',156,'600 8px "IBM Plex Mono",monospace','#7f8e97');
  centerText(survNewBest?'НОВ РЕКОРД!':'Рекорд: '+bestTxt(DI),180,'600 10px "IBM Plex Mono",monospace',survNewBest?'#94ff57':'#ffa62b');
  if(winT>1.5&&blink()) centerText('Z — главно меню',240,'600 10px "IBM Plex Mono",monospace','#f3e6cf');
}
function wrap(text,maxW){ const words=text.split(' '), lines=[]; let line=''; for(const w of words){ const t=line?line+' '+w:w; if(ctx.measureText(t).width>maxW&&line){ lines.push(line); line=w; } else line=t; } if(line) lines.push(line); return lines; }
function drawHUD(){ if(!GAME.classic) return drawHudStd();
  const p=player, A='#ffa62b';
  ctx.save(); ctx.shadowColor='rgba(255,140,0,0.55)'; ctx.shadowBlur=6; ctx.textBaseline='alphabetic';
  const hc=p.hp<=25?'#ff4d3a':A;
  ctx.fillStyle=hc; ctx.fillRect(13,250,4,12); ctx.fillRect(9,254,12,4);
  ctx.font='17px '+DFONT(); ctx.fillText(String(Math.ceil(p.hp)),26,263);
  ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillText('ЗДРАВЕ',26,246);
  ctx.fillStyle=A; ctx.beginPath(); ctx.moveTo(76,249); ctx.lineTo(84,251); ctx.lineTo(84,256); ctx.quadraticCurveTo(84,261,80,263); ctx.quadraticCurveTo(76,261,76,256); ctx.closePath(); ctx.globalAlpha=p.armor>0?1:0.35; ctx.fill(); ctx.globalAlpha=1;
  ctx.font='17px '+DFONT(); ctx.fillText(String(Math.ceil(p.armor)),90,263);
  ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillText('БРОНЯ',90,246);
  ctx.textAlign='right';
  ctx.font='600 7px "IBM Plex Mono",monospace'; ctx.fillText(p.reload>0?'ПРЕЗАРЕЖДАНЕ…':NAMES[p.cur],470,244);
  if(p.cur==='grenade'||p.cur==='rocket'){ ctx.font='17px '+DFONT(); ctx.fillText('× '+p.ammo[p.cur].mag,470,263); }
  else if(p.cur!=='wrench'){ const a=p.ammo[p.cur]; ctx.font='11px '+DFONT(); const rs=String(a.res); ctx.fillText(rs,470,263); const rw=ctx.measureText(rs).width; ctx.font='17px '+DFONT(); ctx.fillStyle=a.mag===0?'#ff4d3a':A; ctx.fillText(a.mag+' /',466-rw,263); }
  else { ctx.font='11px '+DFONT(); ctx.fillText('—',470,263); }
  ctx.textAlign='left'; ctx.shadowBlur=0;
  if(bossActive&&boss&&!boss.dead&&boss.state!=='intro'){ const bw=180,bx=(W-bw)/2; ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(bx-1,15,bw+2,6); ctx.fillStyle=BOSSES[boss.type].col; ctx.fillRect(bx,16,bw*Math.max(0,boss.hp)/boss.max,4); ctx.font='600 7px "IBM Plex Mono",monospace'; ctx.textAlign='center'; ctx.fillStyle='#e8ddff'; ctx.fillText(BOSSES[boss.type].name,W/2,12); ctx.textAlign='left'; }
  if(msg){ const a=clamp(Math.min(msg.age*4,(msg.d-msg.age)*2),0,1); ctx.globalAlpha=a; ctx.font='600 9px "IBM Plex Mono",monospace';
    const lines=wrap(msg.t,360), lw=Math.max(...lines.map(l=>ctx.measureText(l).width)), who=msg.who, w=lw+20, h=lines.length*12+6+(who?10:0), y=bossActive?30:20, x=W/2-w/2;
    const wcol=who==='ИНСТРУКТОР'?'#7fd8ff':'#94ff57'; ctx.fillStyle='rgba(6,8,10,0.78)'; ctx.fillRect(x,y,w,h); ctx.fillStyle=who?wcol:A; ctx.fillRect(x,y,2,h);
    let ly=y+11; if(who){ ctx.font='600 7px "IBM Plex Mono",monospace'; ctx.fillStyle=wcol; ctx.fillText('◉ '+who,x+10,ly-1); ly+=10; ctx.font='600 9px "IBM Plex Mono",monospace'; }
    ctx.fillStyle='#f3e6cf'; for(const l of lines){ ctx.fillText(l,x+10,ly); ly+=12; }
    ctx.globalAlpha=1; }
  ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='rgba(200,210,215,0.5)'; ctx.textAlign='right'; ctx.fillText(SURV?('ОЦЕЛЯВАНЕ · СЕКТОР '+(survK+1)+' · '+D.name):LVL.training?('ТРЕНИРОВКА · '+D.name):(chShort(gChOf(LI))+' · ЕП. '+LVL.n+' · '+D.name),472,9); ctx.textAlign='left';
  if(SURV){ ctx.font='600 7px "IBM Plex Mono",monospace'; ctx.fillStyle='#ff6a5a'; ctx.fillText('♥'.repeat(Math.max(0,survLives)),8,10); ctx.fillStyle='#ffa62b'; ctx.fillText('ТОЧКИ '+(survScore+stats.kills*10),8+survLives*9+6,10); ctx.font='600 6px "IBM Plex Mono",monospace'; }
  if(muted){ ctx.fillStyle='#7f8e97'; ctx.fillText('БЕЗ ЗВУК (M)',8,SURV?20:9); }
  if(LVL.training&&TRN){ ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle=TRN.skip>0?'#ffd36b':'rgba(200,210,215,0.5)'; ctx.fillText(TRN.skip>0?'НАТИСНИ ENTER ОТНОВО, ЗА ДА ПРОПУСНЕШ':'ENTER — ПРОПУСНИ КУРСА',8,muted?19:9); }
  ctx.restore();
  if(LVL.training&&TRN&&TRN.hint&&state==='play'&&!player.dead) drawKeyHint(TRN.hint,257);
}
function glitchTitle(txt,x,y,size){
  ctx.font=`${size}px ${DFONT()}`; { const mw=ctx.measureText(txt).width; if(mw>W-28){ size=Math.floor(size*(W-28)/mw); ctx.font=`${size}px ${DFONT()}`; } } ctx.textAlign='center';
  const j=Math.random()<0.08?rnd(-3,3):0;
  ctx.fillStyle=GAME.glitch[0]; ctx.fillText(txt,x-2+j,y);
  ctx.fillStyle=GAME.glitch[1]; ctx.fillText(txt,x+2-j,y+1);
  ctx.fillStyle=GAME.glitch[2]; ctx.fillText(txt,x,y); ctx.textAlign='left';
}
function overlay(a){ ctx.fillStyle=`rgba(4,6,8,${a})`; ctx.fillRect(0,0,W,H); }
function centerText(t,y,font,col){ ctx.font=font; ctx.textAlign='center'; ctx.fillStyle=col; ctx.fillText(t,W/2,y); ctx.textAlign='left'; }
function fmtTime(s){ const m=Math.floor(s/60), r=Math.floor(s%60); return m+':'+String(r).padStart(2,'0'); }
const blink=()=>Math.floor(titleT*2)%2===0;
function drawStats(s,y){
  const acc=s.shots?Math.round(s.hits/s.shots*100):0;
  const lines=[['Време',fmtTime(s.time)],['Убити',String(s.kills)],['Точност',acc+'%'],['Умирания',String(s.deaths)]];
  ctx.font='600 8px "IBM Plex Mono",monospace';
  lines.forEach(([k,v],i)=>{ const x=W/2-200+i*100, yy=y; ctx.textAlign='center'; ctx.fillStyle='#7f8e97'; ctx.fillText(k,x+50,yy); ctx.fillStyle='#ffa62b'; ctx.font='13px '+DFONT(); ctx.fillText(v,x+50,yy+15); ctx.font='600 8px "IBM Plex Mono",monospace'; });
  ctx.textAlign='left';
}
function drawParagraphs(paras,y,reveal){
  ctx.font='600 9px "IBM Plex Mono",monospace'; ctx.textAlign='left'; let left=reveal;
  for(const p of paras){ const lines=wrap(p,380); for(const l of lines){ if(left<=0) return y; const s=l.slice(0,Math.max(0,Math.floor(left))); left-=l.length; ctx.fillStyle='#d9dfe2'; ctx.fillText(s,W/2-190,y); y+=13; } y+=7; }
  return y;
}
const parasLen=ps=>ps.reduce((a,p)=>a+p.length,0);
function menuList(items,sel,y0,gap,fs=12){
  items.forEach((it,i)=>{ const y=y0+i*gap, on=i===sel, bh=Math.min(17,gap);
    if(on){ ctx.fillStyle=ACCA(0.12); ctx.fillRect(W/2-120,y-fs,240,bh); ctx.fillStyle=ACC(); ctx.fillRect(W/2-120,y-fs,2,bh); }
    ctx.font=fs+'px "Russo One",sans-serif'; ctx.textAlign='center'; ctx.fillStyle=it.locked?'#4a555c':on?ACC():'#b9c4ca'; ctx.fillText(it.t,W/2,y); ctx.textAlign='left'; });
}
function render(){
  ctx.setTransform(S,0,0,S,0,0); ctx.imageSmoothingEnabled=false;
  ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);
  if(state==='gintro'){ GAME.introRender(); return; }
  renderWorld();
  if(state==='title'){ renderSplash(); return; }
  if(state==='gmenu'){ renderGMenu(); return; }
  if(state==='svmenu'){ renderSvMenu(); return; }
  if(state==='survOver'){ renderSurvOver(); return; }
  if(state==='diff'){
    overlay(0.8); centerText('ИЗБЕРИ ТРУДНОСТ',58,'16px '+DFONT(),ACC());
    menuList(DIFFS.map(d=>({t:d.name})),menuSel,100,24);
    const d=DIFFS[menuSel]; centerText(d.desc[0],184,'600 8px "IBM Plex Mono",monospace','#cfd8dc'); centerText(d.desc[1],197,'600 8px "IBM Plex Mono",monospace','#cfd8dc');
    if(modeSel===1) centerText('Оцеляване · животи: '+[3,2,1][menuSel]+' · рекорд: '+bestTxt(menuSel),214,'600 8px "IBM Plex Mono",monospace','#94ff57'); if(modeSel===1) svDiffNote(menuSel);
    centerText('↑ ↓ избор · Z потвърди · Esc / X назад',244,'600 7px "IBM Plex Mono",monospace','#7f8e97');
    return;
  }
  if(state==='eps'&&!GAME.classic){ renderEpsStd(); return; }
  if(state==='eps'){   // класическото меню (r1): по една глава на страница
    overlay(0.8); centerText('ИЗБЕРИ ЕПИЗОД',58,'16px '+DFONT(),'#ffa62b');
    const ch=gChOf(menuSel), c=GCH[ch];
    centerText((ch>0?'◀  ':'    ')+chName(ch)+' · '+c.t+(ch<GCH.length-1&&GCH[ch+1].a<gUnl?'  ▶':'    '),82,'11px '+DFONT(),c.col||'#94ff57');
    for(let i=c.a;i<=c.b;i++){ const l=GLV[i], y=108+(i-c.a)*20, on=i===menuSel, lock=i>=gUnl;
      if(on){ ctx.fillStyle='rgba(255,166,43,0.12)'; ctx.fillRect(W/2-130,y-13,260,18); ctx.fillStyle='#ffa62b'; ctx.fillRect(W/2-130,y-13,2,18); }
      ctx.font='12px '+DFONT(); ctx.textAlign='center'; ctx.fillStyle=lock?'#4a555c':on?'#ffa62b':'#b9c4ca';
      ctx.fillText(lock?(l.n+' · заключен'):(l.n+' · '+l.title+(i===c.b||c.star?'  ★':'')),W/2,y); ctx.textAlign='left'; }
    centerText('Трудност: '+D.name,222,'600 8px "IBM Plex Mono",monospace','#cfd8dc');
    centerText('↑ ↓ ← → избор · Z начало · Esc / X назад',244,'600 7px "IBM Plex Mono",monospace','#7f8e97');
    return;
  }
  if(state==='story'){
    overlay(0.88);
    centerText(LVL.training?(LVL.hdrS||'ПОДГОТОВКА · ПРЕДИ СЕКТОР 7'):chName(gChOf(LI))+' · '+GCH[gChOf(LI)].t+'   ·   ЕПИЗОД '+LVL.n,56,'600 9px "IBM Plex Mono",monospace','#94ff57');
    glitchTitle(LVL.title,W/2,86,26);
    const rv=storyT*45; drawParagraphs(LVL.story,118,rv);
    if(rv>=parasLen(LVL.story)&&blink()) centerText('Z — започни',250,'600 9px "IBM Plex Mono",monospace','#f3e6cf');
    return;
  }
  if(dmgFlash>0){ ctx.fillStyle=`rgba(200,20,10,${dmgFlash*0.45})`; ctx.fillRect(0,0,W,H); }
  if(flash>0){ ctx.globalAlpha=Math.min(1,flash); ctx.fillStyle=flashCol; ctx.fillRect(0,0,W,H); ctx.globalAlpha=1; }
  if(player.hp<=25&&!player.dead){ const g=ctx.createRadialGradient(W/2,H/2,H*0.35,W/2,H/2,H*0.85); g.addColorStop(0,'rgba(160,0,0,0)'); g.addColorStop(1,`rgba(160,0,0,${0.25+Math.sin(titleT*5)*0.1})`); ctx.fillStyle=g; ctx.fillRect(0,0,W,H); }
  if(state==='play'||state==='dead'||state==='paused') drawHUD();
  if(state==='dead'){ overlay(Math.min(0.7,deadT*0.8)); ctx.fillStyle=`rgba(120,0,0,${Math.min(0.25,deadT*0.3)})`; ctx.fillRect(0,0,W,H);
    centerText('ЗАГИНА',122,'30px '+DFONT(),'#ff5a45');
    if(deadT>1) centerText(SURV?(survLives>1?'Z — продължи ('+(survLives-1===1?'остава 1 живот':'остават '+(survLives-1)+' живота')+')':'Z — край на оцеляването'):'Z — опитай отново от последната контролна точка',148,'600 10px "IBM Plex Mono",monospace','#f3e6cf'); }
  if(state==='paused'){ overlay(0.6); centerText('ПАУЗА',124,'28px '+DFONT(),ACC()); centerText('Z или P — продължи · Esc — изход в менюто',148,'600 9px "IBM Plex Mono",monospace','#cfd8dc'); audPauseLine(); }
  if(state==='levelEnd'&&SURV){ overlay(Math.min(0.85,endT*0.8)); if(endT>0.5){ centerText((LVL.isBoss?'БОСЪТ Е ПОВАЛЕН · ':'')+'СЕКТОР '+(survK+1)+' ПРЕМИНАТ',60,'600 9px "IBM Plex Mono",monospace','#94ff57'); glitchTitle('ТОЧКИ '+survScore,W/2,100,26); drawStats(stats,150);
      centerText('Следва: сектор '+(survK+2)+' · '+THEME_NAME[svPlan(survK+1).theme]+(svPlan(survK+1).boss?' · БОС':''),204,'600 8px "IBM Plex Mono",monospace','#cfd8dc');
      if(endT>1.2&&blink()) centerText('Z — напред',240,'600 10px "IBM Plex Mono",monospace','#f3e6cf'); } }
  else if(state==='levelEnd'){ overlay(Math.min(0.88,endT*0.8));
    if(endT>0.5){ centerText((LVL.training?'ТРЕНИРОВКАТА Е ЗАВЪРШЕНА':LI===GCH[gChOf(LI)].b?(GCH[gChOf(LI)].done||chName(gChOf(LI))+' ЗАВЪРШЕНА'):'ЕПИЗОД '+LVL.n+' ПРЕМИНАТ'),46,'600 9px "IBM Plex Mono",monospace','#94ff57'); glitchTitle(LVL.title,W/2,74,24);
      const y=drawParagraphs(LVL.end,104,(endT-0.5)*45); drawStats(stats,Math.max(y+8,200));
      if(endT>1.2&&(endT-0.5)*45>=parasLen(LVL.end)&&blink()) centerText(LVL.training?(TRN&&TRN.fromMenu?'Z — към менюто':(LVL.hdrN||'Z — към Сектор 7')):!epFinal(LI)?'Z — към следващия епизод':'Z — продължи',262,'600 9px "IBM Plex Mono",monospace','#f3e6cf'); } }
  if(state==='win') GAME.renderWin();
}

