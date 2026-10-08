/* ================= BONUS BOSSES ================= */
// ---- Командирът в бойна броня ----
function makeExo(){ const a=LVL.arena; return {type:'exo',mech:true,x:a.bx*T-12,y:15*T-34,w:24,h:34,hp:540*D.bhp,max:540*D.bhp,face:-1,state:'intro',t:1.6,vx:0,vy:0,hitT:0,phase:1,anim:0,dead:false,deathT:0,boomT:0,contactCd:0,onGround:true,shield:true,gcd:4,flashT:0}; }
function hurtExo(d,blast){
  const b=boss; if(!b||b.dead||b.state==='intro') return;
  const pcx=player.x+player.w/2, bcx=b.x+b.w/2, front=sgn(pcx-bcx)===b.face;
  if(!blast&&b.shield&&front){ sparks(bcx+b.face*12,b.y+rnd(6,28),3,'#ffd36b'); if(Math.random()<0.3) sfxAt('deflect',b); return; }
  b.hp-=d*(blast||front?1:1.5)*(b.state==='cool'?1.4:1); b.hitT=0.08; sparks(bcx+rnd(-8,8),b.y+rnd(6,28),blast?10:3,'#ffd36b'); if(!blast) blood(bcx,b.y+rnd(8,26),false,2);
  if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; showMsg('Бронята прегрява, а командирът побесня!',2.5); }
  if(b.hp<=0) bossDie();
}
function updExo(dt){
  const b=boss,p=player,a=LVL.arena,R_=D.react; b.anim+=dt; b.hitT-=dt; b.contactCd-=dt; b.flashT-=dt;
  const grav=()=>{ b.vy=Math.min(b.vy+G*dt,520); moveY(b,b.vy*dt); };
  if(b.dead){ b.vx=0; grav(); bossDeathFx(b,dt); return; }
  const pcx=p.x+p.w/2, bcx=b.x+b.w/2, dist=Math.abs(pcx-bcx), fast=b.phase===2;
  if(p.dead){ b.vx=0; grav(); return; }
  if(b.state==='walk'||b.state==='intro'||b.state==='aimW'||b.state==='leapW') b.face=sgn(pcx-bcx);
  b.shield=!['aimW','burst','cool','land'].includes(b.state);
  switch(b.state){
    case 'intro': b.t-=dt; if(b.t<=0){ b.state='walk'; b.t=1.2; } break;
    case 'walk': b.vx=dist>80?b.face*(fast?55:40)/Math.sqrt(R_):dist<56?-b.face*45:0; b.t-=dt;
      if(b.t<=0){ b.vx=0; const r=Math.random();
        if(r<0.34){ b.state='aimW'; b.t=0.6*R_; }
        else if(r<0.67&&dist>60){ b.state='dashW'; b.t=0.8*R_; sfxAt('charge',b); }
        else { b.state='leapW'; b.t=0.6*R_; } } break;
    case 'aimW': b.vx=0; b.t-=dt; if(b.t<=0){ b.state='burst'; b.n=(fast?6:4)+(DI===2?2:0)-(DI===0?2:0); b.bt=0; } break;
    case 'burst': b.vx=0; b.bt-=dt;
      if(b.bt<=0){ if(b.n-->0){ b.bt=0.13; const ox=bcx+b.face*14, oy=b.y+12, ang=Math.atan2(p.y+p.h-17-oy,pcx-ox)+rnd(-D.spread,D.spread)*2; ebullets.push({x:ox,y:oy,vx:Math.cos(ang)*330*D.bspd,vy:Math.sin(ang)*330*D.bspd,life:1.5,dmg:7}); sfxAt('soldierShot',b); light(ox,oy,50,0.7,'rgba(255,200,90,'); b.flashT=0.05; }
        else { b.state='walk'; b.t=(fast?1.0:1.5)*R_; } } break;
    case 'dashW': b.vx=0; b.t-=dt; if(Math.random()<0.5) part(b.x+(b.face>0?0:b.w),b.y+b.h-2,-b.face*rnd(30,80),rnd(-40,-10),0.4,'#8a8f94',2,200,2); if(b.t<=0){ b.state='dash'; b.t=1.6; b.dx0=bcx; sfxAt('rocket',b); } break;
    case 'dash': b.vx=b.face*260*Math.sqrt(D.bspd); b.t-=dt; if(Math.random()<0.6) part(bcx-b.face*12,b.y+b.h-12,-b.face*80,rnd(-20,10),0.3,'#ffb53a',2,0,1); break;
    case 'cool': b.vx=0; b.t-=dt; if(Math.random()<0.5) part(b.x+rnd(b.w),b.y+rnd(8),rnd(-10,10),rnd(-50,-25),rnd(0.5,0.9),'#e8f0f4',rnd(2,4),-20,2); if(b.t<=0){ b.state='walk'; b.t=1.0*R_; } break;
    case 'leapW': b.vx=0; b.t-=dt; if(b.t<=0){ const tt=0.75, tx=clamp(pcx-sgn(pcx-bcx)*56,(a.door+2)*T,(a.maxX||COLS-4)*T); b.vx=clamp((tx-bcx)/tt,-260,260); b.vy=-0.5*G*tt; b.state='leap'; b.onGround=false; b.air=0; sfxAt('rocket',b); } break;
    case 'leap': b.air+=dt; if(Math.random()<0.6) part(bcx-b.face*8,b.y+b.h-6,rnd(-10,10),rnd(30,60),0.3,'#ffb53a',2,0,1);
      if(b.onGround&&b.air>0.1){ b.vx=0; b.state='land'; b.t=(DI===0?1.6:DI===2?0.8:1.2); sfxAt('stomp',b); shake=8; for(let i=0;i<14;i++) part(bcx+rnd(-20,20),b.y+b.h,rnd(-100,100),rnd(-80,-10),rnd(0.4,0.8),'#8a8f94',rnd(2,3),300,2);
        if(p.onGround&&Math.abs(pcx-bcx)<70&&Math.abs(p.y+p.h-(b.y+b.h))<20){ hurtPlayer(14,sgn(pcx-bcx)*240); p.vy=-200; } } break;
    case 'land': b.vx=0; b.t-=dt; if(Math.random()<0.3) part(b.x+rnd(b.w),b.y+rnd(10),rnd(-20,20),-30,0.5,'#ffe36b',1,0); if(b.t<=0){ b.state='walk'; b.t=1.0*R_; } break;
  }
  if(fast&&D.gren){ b.gcd-=dt; if(b.gcd<=0&&b.state==='walk'&&dist>100&&dist<300){ throwGrenade(b); b.gcd=rnd(4,6)*D.rate; } }
  b.vy=Math.min(b.vy+G*dt,520); const blocked=moveX(b,b.vx*dt); moveY(b,b.vy*dt);
  if(b.state==='dash'&&(blocked||b.t<=0||(Math.abs(bcx-b.dx0)>120&&sgn(pcx-bcx)!==b.face&&dist>60))){ b.state='cool'; b.t=DI===0?2.4:DI===2?1.3:1.8; b.vx=0; if(blocked){ shake=8; sfxAt('stomp',b); } }
  if(ov(b,p)&&b.contactCd<=0){ hurtPlayer(b.state==='dash'?16:8,sgn(pcx-bcx||1)*260); p.vy=-180; b.contactCd=1.2; }
}
function drawExo(){
  const b=boss; if(b.dead&&b.deathT>2.6) return;
  begin(b); tint=b.hitT>0?'#fff':null; if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1);
  const w=Math.abs(b.vx)>1&&b.onGround?Math.round(Math.sin(b.anim*(b.state==='dash'?18:8))*2):0, cr=(b.state==='leapW'||b.state==='land'||b.state==='dashW')?3:0;
  const m='#5a6048', md='#3c4030', ml='#7a8266', st='#4a5058';
  px(-9+w,-13,6,13,md); px(3-w,-13,6,13,md); px(-10+w,-3,8,3,'#1d2125'); px(2-w,-3,8,3,'#1d2125'); px(-9+w,-12,6,2,st); px(3-w,-12,6,2,st);
  ctx.translate(0,cr);
  px(-11,-30,20,18,m); px(-11,-30,20,2,ml); px(-9,-26,16,8,md); px(-14,-29,4,13,st); px(-16,-26,3,9,'#2a2e33');
  if(b.state==='dash'||b.state==='leap') px(-17,-19,3,4,'#ffb53a');
  px(-5,-37,10,8,st); px(-5,-37,10,1,'#6d757d'); px(0,-34,5,2,b.state==='cool'?'#5a1a14':'#ff3b2e');
  px(4,-26,10,4,md); px(10,-25,9,3,'#1d2125'); if(b.flashT>0&&!tint){ ctx.fillStyle='#fff3b0'; ctx.fillRect(19,-26,3,4); }
  if(b.shield&&!b.dead){ px(13,-35,5,31,'#6a7480'); px(13,-35,5,1,'#a8b2bc'); px(14,-31,3,3,'#c9302a'); px(13,-20,5,1,'#3a4048'); px(17,-35,1,31,'#3a4048'); }
  else px(-13,-33,4,24,'#6a7480');
  tint=null; ctx.globalAlpha=1; ctx.restore();
  if(b.state==='cool'&&!b.dead){ ctx.font='600 7px "IBM Plex Mono",monospace'; ctx.textAlign='center'; ctx.fillStyle='#ffb53a'; ctx.fillText('ПРЕГРЯВА',b.x+b.w/2-cam,b.y-6); ctx.textAlign='left'; }
}
// ---- Танкът ----
function makeTank(){ const a=LVL.arena; return {type:'tank',mech:true,x:a.bx*T-32,y:15*T-34,w:64,h:34,hp:700*D.bhp,max:700*D.bhp,face:-1,state:'intro',t:2,vx:0,vy:0,hitT:0,phase:1,anim:0,dead:false,deathT:0,boomT:0,contactCd:0,marks:[],tread:0,onTopT:0,flashT:0}; }
function hurtTank(d,blast){ const b=boss; if(!b||b.dead||b.state==='intro') return;
  b.hp-=blast?d:d*(DI===0?0.55:DI===2?0.2:0.3); b.hitT=0.06; sparks(b.x+b.w/2+rnd(-24,24),b.y+rnd(4,26),blast?10:2,'#ffd36b');
  if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; showMsg('Танкът е повреден — още малко!',2.5); }
  if(b.hp<=0) bossDie(); }
const tankTop=(b,x)=>(x>b.x+20&&x<b.x+44)?b.y:b.y+12;
function updTank(dt){
  const b=boss,p=player,a=LVL.arena,R_=D.react; b.anim+=dt; b.hitT-=dt; b.contactCd-=dt; b.flashT-=dt;
  if(b.dead){ if(Math.random()<0.5) part(b.x+rnd(b.w),b.y+rnd(10),rnd(-10,10),rnd(-40,-20),rnd(0.8,1.4),'#2a2a2a',rnd(4,7),-15,2); bossDeathFx(b,dt); return; }
  const pcx=p.x+p.w/2, bcx=b.x+b.w/2, minX=a.minX*T, maxX=a.maxX*T, fast=b.phase===2;
  if(fast&&Math.random()<0.3) part(b.x+b.w*0.3,b.y+6,rnd(-10,10),rnd(-30,-10),rnd(0.6,1.2),'#2a2a2a',rnd(3,5),-15,2);
  if(Math.random()<dt*3) part(b.x+(b.face>0?2:b.w-2),b.y+20,-b.face*rnd(10,30),rnd(-20,-5),rnd(0.5,0.9),'#5a5f63',rnd(2,4),-10,2);
  if(!p.dead) switch(b.state){
    case 'intro': b.vx=-40; b.t-=dt; if(b.t<=0){ b.state='drive'; b.t=1.5*R_; } break;
    case 'drive': { if(b.tx===undefined) b.tx=clamp(pcx+(Math.random()<0.5?-1:1)*rnd(70,160),minX+32,maxX-32); const sp=(fast?75:55)/Math.sqrt(R_); b.vx=clamp((b.tx-bcx)*2,-sp,sp); b.face=sgn(pcx-bcx); b.t-=dt;
      if(b.t<=0||Math.abs(b.tx-bcx)<4){ b.tx=undefined; b.vx=0; const r=Math.random();
        if(b.onTopT>0.6){ b.state='buck'; b.t=1.0; }
        else if(r<0.45){ b.state='aim'; b.t=1.0*R_; const n=fast?(DI===0?2:3):(DI===2?2:1); b.marks=[]; for(let i=0;i<n;i++) b.marks.push(clamp(pcx+p.vx*0.5+(i-(n-1)/2)*56,minX+8,maxX-8)); sfxAt('turret',b); }
        else if(r<0.78){ b.state='mgW'; b.t=0.7*R_; }
        else { b.state='ram'; b.t=1.6; sfxAt('engine',b); } } } break;
    case 'aim': b.vx=0; b.t-=dt; if(b.t<=0){ for(const mx of b.marks){ const ox=bcx+b.face*30, oy=b.y+2, tt=1.0; grenades.push({x:ox,y:oy,vx:(mx-ox)/tt,vy:(15*T-4-oy)/tt-0.5*G*tt,t:4,impact:true}); }
        b.marks=[]; sfxAt('boom',b); shake=6; light(bcx+b.face*36,b.y,90,0.9,'rgba(255,180,80,'); for(let i=0;i<8;i++) part(bcx+b.face*36,b.y+2,b.face*rnd(20,80),rnd(-40,10),rnd(0.4,0.8),'#9a9a9a',rnd(3,5),-10,2); b.state='drive'; b.t=(fast?1.2:1.7)*R_; } break;
    case 'mgW': b.vx=0; b.face=sgn(pcx-bcx); b.t-=dt; if(b.t<=0){ b.state='mg'; b.t=DI===0?0.9:DI===2?1.8:1.4; b.gt=0; } break;
    case 'mg': b.vx=0; b.t-=dt; b.gt-=dt; if(b.gt<=0){ b.gt=DI===0?0.16:0.09; const ox=bcx+b.face*34, oy=b.y+18; ebullets.push({x:ox,y:oy,vx:b.face*340*D.bspd,vy:0,life:1.6,dmg:5}); sfxAt('soldierShot',b); light(ox,oy,40,0.6,'rgba(255,200,90,'); b.flashT=0.05; } if(b.t<=0){ b.state='drive'; b.t=1.4*R_; } break;
    case 'ram': b.vx=b.face*(fast?190:150)*Math.sqrt(D.bspd); b.t-=dt; if(b.t<=0||(bcx<minX+34&&b.vx<0)||(bcx>maxX-34&&b.vx>0)){ b.state='drive'; b.t=1.2*R_; b.vx=0; } break;
    case 'buck': b.t-=dt; b.vx=Math.sin(b.t*14)*160; if(b.t<=0){ b.state='drive'; b.t=0.6; } break;
  } else b.vx=0;
  const ox=b.x; b.x=clamp(b.x+b.vx*dt,minX,maxX-b.w); const dx=b.x-ox; b.tread+=dx;
  let on=false;
  if(!p.dead&&p.vy>=0){ const top=tankTop(b,p.x+p.w/2); if(p.x+p.w>b.x+3&&p.x<b.x+b.w-3&&p.y+p.h>=top-3&&p.y+p.h<=top+8){ p.y=top-p.h; p.vy=0; p.onGround=true; moveX(p,dx); on=true; } }
  b.onTopT=on?b.onTopT+dt:0;
  if(on&&b.state==='buck'&&b.t<0.35){ p.vy=-280; p.vx=(Math.random()<0.5?-1:1)*220; p.onGround=false; b.onTopT=0; }
  const body={x:b.x+2,y:b.y+14,w:b.w-4,h:b.h-14};
  if(!on&&!p.dead&&ov(body,p)){ if(Math.abs(b.vx)>5&&b.contactCd<=0){ hurtPlayer(b.state==='ram'?22:12,sgn(pcx-bcx||1)*280); p.vy=-240; b.contactCd=1.0; } else moveX(p,sgn(pcx-bcx||1)*90*dt); }
}
function drawTank(){
  const b=boss; if(b.dead&&b.deathT>2.6) return;
  for(const mx of b.marks||[]){ const X=mx-cam, y=15*T-2; ctx.strokeStyle=Math.floor(titleT*10)%2?'rgba(255,60,40,0.95)':'rgba(255,200,60,0.95)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(X-6,y-3); ctx.lineTo(X+6,y+3); ctx.moveTo(X-6,y+3); ctx.lineTo(X+6,y-3); ctx.stroke(); ctx.beginPath(); ctx.ellipse(X,y,11,3,0,0,7); ctx.stroke(); }
  begin(b); tint=b.hitT>0?'#fff':null; if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1);
  const g='#4a5236', gd='#343a26', gl='#66704a';
  px(-32,-10,64,10,'#1d2125'); px(-30,-9,60,1,'#3a3f45'); const o=Math.floor(((b.tread*b.face)%6+6)%6); for(let i=-30+o;i<30;i+=6) px(i,-3,3,2,'#3a3f45');
  for(const wx of [-24,-12,0,12,24]){ px(wx-3,-8,6,6,'#2a2e33'); px(wx-1,-6,2,2,'#4a5058'); }
  px(-30,-20,60,10,g); px(-30,-20,60,2,gl); px(26,-18,6,8,gd); px(-34,-18,4,6,gd); px(-26,-15,10,3,gd); px(-30,-21,60,1,'#e9f1f7');
  px(28,-17,8,2,'#1d2125'); if(b.flashT>0&&!tint){ ctx.fillStyle='#fff3b0'; ctx.fillRect(36,-18,3,4); }
  px(-12,-32,24,12,g); px(-12,-32,24,2,gl); px(-10,-28,6,4,gd); px(-12,-33,24,1,'#e9f1f7'); px(-5,-35,8,3,gd); px(-3,-36,4,1,'#e9f1f7');
  ctx.save(); ctx.translate(10,-27); ctx.rotate(b.state==='aim'?-0.2:0); px(0,-2,26,4,gd); px(0,-2,26,1,gl); px(24,-3,4,6,'#2a2e33'); ctx.restore();
  tint=null; ctx.globalAlpha=1; ctx.restore();
}
// ---- Ловецът ----
function makeHunter(){ const a=LVL.arena; return {type:'hunter',x:(a.maxX-2)*T,y:-40,w:40,h:20,hp:650*D.bhp,max:650*D.bhp,face:-1,state:'intro',t:2.2,vx:0,vy:0,hitT:0,phase:1,anim:0,dead:false,deathT:0,boomT:0,contactCd:0}; }
function hurtHunter(d,blast){ const b=boss; if(!b||b.dead||b.state==='intro') return;
  b.hp-=d*(b.state==='rest'?1.6:1); b.hitT=0.08; blood(b.x+b.w/2+rnd(-12,12),b.y+rnd(4,16),true,blast?12:3);
  if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; sfxAt('screech',b); showMsg('Ловецът побесня!',2); }
  if(b.hp<=0) bossDie(); }
function updHunter(dt){
  const b=boss,p=player,a=LVL.arena,R_=D.react; b.anim+=dt; b.hitT-=dt; b.contactCd-=dt;
  const minX=a.minX*T, maxX=a.maxX*T, floor=15*T, bcx=b.x+b.w/2, bcy=b.y+b.h/2, pcx=p.x+p.w/2, fast=b.phase===2;
  if(b.dead){ if(!b.down){ b.vy=Math.min((b.vy||0)+600*dt,400); b.y+=b.vy*dt; if(b.y+b.h>=floor){ b.y=floor-b.h; b.down=true; sfxAt('stomp',b); shake=8; } } bossDeathFx(b,dt); return; }
  const fly=(tx,ty,sp)=>{ const k=Math.min(1,dt*3); b.vx+=(clamp((tx-bcx)*2,-sp,sp)-b.vx)*k; b.vy+=(clamp((ty-bcy)*2,-sp,sp)-b.vy)*k; b.x+=b.vx*dt; b.y+=b.vy*dt; };
  if(p.dead){ fly(bcx,40,80); return; }
  switch(b.state){
    case 'intro': fly(clamp(pcx+100,minX,maxX),60,200); b.face=sgn(pcx-bcx); b.t-=dt; if(b.t<=0){ b.state='circle'; b.t=1.6*R_; sfxAt('screech',b); } break;
    case 'circle': fly(clamp(pcx+Math.cos(b.anim*1.3)*120,minX,maxX),55+Math.sin(b.anim*2.1)*20,(fast?190:150)/R_); b.face=sgn(pcx-bcx); b.t-=dt;
      if(b.t<=0){ const r=Math.random(), kids=enemies.filter(e=>e.summoned&&!e.dead).length;
        if(fast&&r<0.25&&kids<(DI===0?1:2)){ b.state='call'; b.t=0.8; sfxAt('screech',b); }
        else if(r<0.65){ b.state='swoopPos'; b.dir=pcx>(minX+maxX)/2?1:-1; b.low=Math.random()<0.5; b.t=2.5; }
        else { b.state='rocksW'; b.t=0.9*R_; } } break;
    case 'swoopPos': { const sx=b.dir>0?minX+b.w/2:maxX-b.w/2, sy=(b.low?floor-b.h/2-1:floor-28); fly(sx,sy,280); b.face=b.dir; b.t-=dt;
      if((Math.abs(sx-bcx)<8&&Math.abs(sy-bcy)<6)||b.t<=0){ b.x=sx-b.w/2; b.y=sy-b.h/2; b.vx=b.vy=0; b.state='swoopW'; b.t=DI===0?1.3:DI===2?0.7:1.0; } } break;
    case 'swoopW': b.vx=0; b.vy=0; b.face=b.dir; b.t-=dt; if(b.t<=0){ b.state='swoop'; sfxAt('screech',b); } break;
    case 'swoop': b.vx=b.dir*(fast?300:250)*Math.sqrt(D.bspd); b.vy=0; b.x+=b.vx*dt;
      if((b.dir>0&&b.x+b.w>maxX)||(b.dir<0&&b.x<minX)){ b.vx=0; if(b.low){ b.state='rest'; b.t=DI===0?2:DI===2?1:1.4; b.y=floor-b.h; } else { b.state='circle'; b.t=1.2*R_; } } break;
    case 'rest': b.vx=0; b.vy=0; b.y=floor-b.h; b.t-=dt; if(Math.random()<0.2) part(b.x+rnd(b.w),b.y,rnd(-10,10),-20,0.5,'#ffe36b',1,0); if(b.t<=0){ b.state='circle'; b.t=1.2*R_; b.vy=-120; } break;
    case 'rocksW': fly(clamp(pcx,minX,maxX),36,160); b.face=sgn(pcx-bcx); b.t-=dt; if(Math.random()<0.5) part(cam+rnd(W),2,rnd(-10,10),rnd(10,30),0.6,'#cfe0ee',1,200);
      if(b.t<=0){ const n=(fast?7:5)+(DI===2?2:0)-(DI===0?2:0); for(let i=0;i<n;i++){ const x=clamp(pcx+(i-(n-1)/2)*34+rnd(-8,8),minX,maxX); ebullets.push({x,y:-10-rnd(0,50),vx:0,vy:20,life:3,dmg:12,r:4,orb:true,grav:true,ice:true}); } sfxAt('stomp',b); shake=5; b.state='circle'; b.t=1.4*R_; } break;
    case 'call': b.t-=dt; fly(bcx,40,60); if(b.t<=0){ const n=DI===0?1:2; for(let i=0;i<n;i++){ const e=makeEnemy('flyer',clamp(pcx+(i?-1:1)*140,minX,maxX),3*T); e.alert=true; e.summoned=true; enemies.push(e); } b.state='circle'; b.t=1.4*R_; } break;
  }
  if(b.state!=='swoop'&&b.state!=='rest'&&b.state!=='swoopW'){ b.x=clamp(b.x,minX-12,maxX+12-b.w); b.y=clamp(b.y,-40,floor-b.h); }
  if(ov(b,p)&&b.contactCd<=0&&b.state!=='rest'){ hurtPlayer(b.state==='swoop'?18:10,sgn(pcx-bcx||1)*220); p.vy=-160; b.contactCd=1.0; }
}
function drawHunter(){
  const b=boss; if(b.dead&&b.deathT>2.6) return;
  const a=LVL.arena;
  if(b.state==='swoopW'){ const y=b.y+b.h/2, x0=a.minX*T-cam, x1=a.maxX*T-cam; ctx.strokeStyle=`rgba(127,216,255,${0.45+Math.sin(titleT*30)*0.3})`; ctx.lineWidth=1; ctx.setLineDash([4,4]); ctx.beginPath(); ctx.moveTo(x0,y); ctx.lineTo(x1,y); ctx.stroke(); ctx.setLineDash([]);
    if(DI<2){ ctx.font='600 7px "IBM Plex Mono",monospace'; ctx.textAlign='center'; ctx.fillStyle='#bfe8ff'; ctx.fillText(b.low?'СКАЧАЙ!':'КЛЕКНИ!',W/2,y-10); ctx.textAlign='left'; } }
  begin(b); tint=b.hitT>0?'#fff':null; if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1);
  const rest=b.state==='rest'||b.down, f=rest?0:Math.sin(b.anim*(b.state==='swoop'?7:12));
  const body='#3a4658', dark='#252e3a', belly='#8a9aac', mem='#4a3a5e', mem2='#2e2440';
  if(rest){ ctx.fillStyle=tint||mem; ctx.beginPath(); ctx.moveTo(-6,-14); ctx.lineTo(-26,-3); ctx.lineTo(-10,-2); ctx.closePath(); ctx.fill(); }
  else { const wy=-12-f*14; ctx.fillStyle=tint||mem2; ctx.beginPath(); ctx.moveTo(-2,-12); ctx.lineTo(-20,wy+4); ctx.lineTo(-12,wy+10); ctx.lineTo(-6,-6); ctx.closePath(); ctx.fill();
    ctx.fillStyle=tint||mem; ctx.beginPath(); ctx.moveTo(4,-12); ctx.lineTo(-24,wy); ctx.lineTo(-30,wy+6); ctx.lineTo(-20,wy+8); ctx.lineTo(-14,wy+5); ctx.lineTo(-4,-6); ctx.closePath(); ctx.fill(); }
  px(-14,-14,26,10,body); px(-12,-6,20,3,belly); px(-20,-11,6,4,dark); px(-25,-10,5,2,dark);
  px(10,-17,10,9,body); px(18,-14,5,4,dark); px(19,-11,4,1,'#e8e0c8'); px(14,-15,3,2,b.state==='swoopW'?'#ffffff':'#7fd8ff');
  px(-4,-4,2,4,dark); px(4,-4,2,4,dark); px(-5,-1,4,1,'#e8e0c8'); px(3,-1,4,1,'#e8e0c8');
  tint=null; ctx.globalAlpha=1; ctx.restore();
}
// ---- Майката ----
function makeQueen(){ const a=LVL.arena; return {type:'queen',x:a.bx*T-30,y:15*T-64,w:60,h:64,hp:850*D.bhp,max:850*D.bhp,face:-1,state:'intro',t:2.2,vx:0,vy:0,hitT:0,phase:1,anim:0,dead:false,deathT:0,boomT:0,contactCd:0,atk:0,spikes:[]}; }
function hurtQueen(d,blast){ const b=boss; if(!b||b.dead||b.state==='intro') return;
  const open=b.state==='open';
  if(!open&&!blast){ sparks(b.x+rnd(10,50),b.y+rnd(10,50),2,'#bfe8ff'); if(Math.random()<0.2) sfxAt('deflect',b); b.hp-=d*0.15; b.hitT=0.04; }
  else { b.hp-=d*(open?1.3:0.5); b.hitT=0.08; blood(b.x+b.w/2+rnd(-14,14),b.y+rnd(16,48),true,blast?12:4); }
  if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; sfxAt('roar',b); showMsg('Майката побесня!',2); }
  if(b.hp<=0) bossDie(); }
function updQueen(dt){
  const b=boss,p=player,a=LVL.arena,R_=D.react; b.anim+=dt; b.hitT-=dt; b.contactCd-=dt;
  if(b.dead){ bossDeathFx(b,dt); return; }
  const pcx=p.x+p.w/2, fast=b.phase===2, mx=b.x+6, my=b.y+24, x0=(a.door+1)*T+8, x1=b.x-12;
  for(const s of b.spikes){ s.t-=dt; if(s.t<=0&&!s.up){ s.up=true; s.life=0.5; sfxAt('stomp',{x:s.x,y:15*T,w:0}); for(let i=0;i<8;i++) part(s.x+rnd(-8,8),15*T,rnd(-60,60),rnd(-140,-40),0.5,'#cfe8ff',2,400); }
    if(s.up){ s.life-=dt; if(!s.hit&&!p.dead&&ov({x:s.x-8,y:15*T-38,w:16,h:38},p)){ s.hit=true; hurtPlayer(16,sgn(pcx-s.x||1)*160); p.vy=-220; } } }
  b.spikes=b.spikes.filter(s=>!s.up||s.life>0);
  if(p.dead) return;
  switch(b.state){
    case 'intro': b.t-=dt; if(b.t<=0){ b.state='idle'; b.t=1; } break;
    case 'idle': b.t-=dt; if(b.t<=0){
        if(b.atk>=(fast?3:2)){ b.atk=0; b.state='open'; b.t=DI===0?3.4:DI===2?2.0:2.6; sfxAt('roar',b); showMsg('Черупката се отвори — стреляй!',1.6); break; }
        b.atk++; const r=Math.random(), brood=enemies.filter(e=>e.summoned&&!e.dead).length;
        if(r<0.35&&brood<(DI===0?2:DI===2?5:4)){ b.state='lay'; b.t=0.8*R_; }
        else if(r<0.68){ b.state='spitW'; b.t=0.7*R_; }
        else { b.state='spikeW'; b.t=0.5; } } break;
    case 'lay': b.t-=dt; if(b.t<=0){ const n=fast?(DI===0?2:3):2; for(let i=0;i<n;i++){ const e=makeEnemy('egg',mx,my+10); e.summoned=true; const tx=clamp(pcx+rnd(-80,40),x0,x1), tt=0.9; e.x=mx-e.w/2; e.y=my; e.vx=(tx-mx)/tt; e.vy=(15*T-(my+12))/tt-0.5*G*tt; enemies.push(e); } sfxAt('birth',b); b.state='idle'; b.t=1.0*R_; } break;
    case 'spitW': b.t-=dt; if(b.t<=0){ const n=fast?(DI===0?2:4):(DI===2?3:2), tt=0.95; for(let i=0;i<n;i++){ const tx=pcx+(i-(n-1)/2)*40, ty=p.y+p.h-6; ebullets.push({x:mx,y:my,vx:(tx-mx)/tt,vy:(ty-my)/tt-0.5*G*tt,life:3,dmg:12,r:4,orb:true,grav:true,acid:true}); } sfxAt('spit',b); b.state='idle'; b.t=1.0*R_; } break;
    case 'spikeW': b.t-=dt; if(b.t<=0){ const n=fast?3:(DI===2?2:1); for(let i=0;i<n;i++) b.spikes.push({x:clamp(pcx+(i-(n-1)/2)*46,x0,x1),t:(DI===0?1.1:DI===2?0.6:0.85)+i*0.12,up:false}); b.state='idle'; b.t=1.3*R_; } break;
    case 'open': b.t-=dt; if(b.t<=0){ b.state='idle'; b.t=0.8; sfxAt('growl',b); } break;
  }
  if(ov(b,p)&&b.contactCd<=0){ hurtPlayer(12,-220); p.vy=-180; b.contactCd=1; }
}
function updEgg(e,dt){ e.anim+=dt; physics(e,dt); if(e.onGround){ e.vx=0; if(e.t2===undefined) e.t2=DI===0?6:DI===2?3:4.5; e.t2-=dt;
  if(e.t2<=0){ e.dead=true; e.deadT=0; e.hatched=true; const c=makeEnemy('crab',e.x+e.w/2,e.y+e.h); c.alert=true; c.summoned=true; c.vy=-150; enemies.push(c); sfxAt('birth',e); blood(e.x+5,e.y+6,true,10); } } }
function drawEgg(e){
  const x=Math.round(e.x+e.w/2-cam), by=Math.round(e.y+e.h);
  if(e.dead){ if(e.deadT>3) return; ctx.globalAlpha=1-clamp(e.deadT-2,0,1); px(x-5,by-3,10,3,'#c8c0d8'); px(x-5,by-6,2,3,'#c8c0d8'); px(x+3,by-5,2,2,'#c8c0d8'); ctx.globalAlpha=1; return; }
  tint=e.hitT>0?'#fff':null; const k=e.t2!==undefined?clamp(1-e.t2/4.5,0,1):0, sh=Math.round(Math.sin(e.anim*(6+k*20))*k*1.5);
  ctx.fillStyle=tint||'#d8d0e8'; ctx.beginPath(); ctx.ellipse(x+sh,by-6,5,6,0,0,7); ctx.fill();
  ctx.fillStyle=tint||`rgba(255,106,213,${0.4+k*0.5})`; ctx.fillRect(x+sh-1,by-10,1,7); ctx.fillRect(x+sh+2,by-9,1,5); ctx.fillRect(x+sh-3,by-8,1,4);
  tint=null;
}
function drawQueen(){
  const b=boss; if(b.dead&&b.deathT>2.6) return;
  for(const s of b.spikes){ const X=s.x-cam, y=15*T;
    if(!s.up){ if(Math.floor(titleT*12)%2){ ctx.strokeStyle='rgba(191,232,255,0.95)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(X-9,y-1); ctx.lineTo(X-4,y-3); ctx.lineTo(X,y-1); ctx.lineTo(X+4,y-4); ctx.lineTo(X+9,y-1); ctx.stroke(); } }
    else { const k=Math.min(1,(0.5-s.life)*8+0.2), h=38*k; ctx.fillStyle='#bfe8ff'; ctx.beginPath(); ctx.moveTo(X-8,y); ctx.lineTo(X-3,y-h*0.7); ctx.lineTo(X,y-h); ctx.lineTo(X+3,y-h*0.6); ctx.lineTo(X+8,y); ctx.closePath(); ctx.fill(); ctx.fillStyle='rgba(255,255,255,0.8)'; ctx.fillRect(X-1,y-h+4,1,h*0.6); } }
  const x=Math.round(b.x-cam), y=Math.round(b.y), open=b.state==='open'?1:0;
  ctx.save(); if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1); tint=b.hitT>0?'#fff':null;
  const sh='#3a2a4a', shl='#5a4470', shd='#22182e';
  for(let i=0;i<3;i++){ const lx_=x+18+i*14, o=Math.round(Math.sin(b.anim*2+i)); px(lx_-6,y+50+o,4,14,shd); px(lx_-10,y+60,6,4,shd); }
  const pul=1+Math.sin(b.anim*(open?8:3))*0.06;
  ctx.fillStyle=tint||(open?'#ff6ad5':'#6a2a5a'); ctx.beginPath(); ctx.ellipse(x+40,y+34,18*pul,20*pul,0,0,7); ctx.fill();
  if(open&&!tint){ ctx.fillStyle='#ffd0f0'; ctx.beginPath(); ctx.ellipse(x+40,y+34,8,10,0,0,7); ctx.fill(); }
  const sf=open*14; ctx.fillStyle=tint||sh; ctx.beginPath(); ctx.ellipse(x+40-sf*0.2,y+18-sf,20,10,-0.2,0,7); ctx.fill(); ctx.beginPath(); ctx.ellipse(x+44+sf*0.3,y+48+sf*0.6,18,8,0.2,0,7); ctx.fill();
  ctx.fillStyle=tint||shl; ctx.beginPath(); ctx.ellipse(x+18,y+32,14,16,0,0,7); ctx.fill();
  ctx.fillStyle=tint||sh; ctx.beginPath(); ctx.ellipse(x+8,y+22,10,9,0,0,7); ctx.fill();
  for(let i=0;i<4;i++) px(x+2+i*5,y+8-(i%2)*4,2,7,shd);
  px(x+2,y+18,2,2,'#bfe8ff'); px(x+6,y+17,2,2,'#bfe8ff'); px(x+10,y+18,2,2,'#bfe8ff');
  ctx.fillStyle='#120818'; ctx.beginPath(); ctx.ellipse(x+5,y+26,4,b.state==='spitW'||b.state==='lay'?4:2,0,0,7); ctx.fill();
  px(x-4,y+34,10,3,shd); px(x-6,y+36,3,6,'#e8e0c8');
  tint=null; ctx.restore();
}
// ---- Титан ----
function makeTitan(){ const a=LVL.arena, hp=1600*(DI===0?0.33:D.bhp); return {type:'titan',mech:true,x:a.bx*T-28,y:15*T-80,w:56,h:80,hp,max:hp,face:-1,state:'intro',t:2.6,vx:0,vy:0,hitT:0,phase:1,anim:0,dead:false,deathT:0,boomT:0,contactCd:0,onGround:true,flashT:0,lift:0}; }
function hurtTitan(d,blast){ const b=boss; if(!b||b.dead||b.state==='intro') return;
  b.hp-=d*(b.phase===3?1.4:1); b.hitT=0.06; sparks(b.x+b.w/2+rnd(-16,16),b.y+rnd(10,50),blast?10:2,'#ffd36b');
  if(b.phase===1&&b.hp<b.max*0.6){ b.phase=2; shake=8; sfxAt('warden',b); showMsg('„Титан“ минава на пълна бойна мощност!',2.5); }
  else if(b.phase===2&&b.hp<b.max*0.3){ b.phase=3; shake=10; sfxAt('boom',b); showMsg('Кабината е пробита — стреляй в нея!',2.5); }
  if(b.hp<=0) bossDie(); }
function updTitan(dt){
  const b=boss,p=player,a=LVL.arena,R_=D.react; b.anim+=dt; b.hitT-=dt; b.contactCd-=dt; b.flashT-=dt;
  if(b.dead){ b.vx=0; bossDeathFx(b,dt); return; }
  const pcx=p.x+p.w/2, bcx=b.x+b.w/2, dist=Math.abs(pcx-bcx), x0=(a.door+1)*T, x1=a.exitDoor[0]*T;
  if(p.dead){ b.vx=0; return; }
  if(b.state==='walk'||b.state==='intro') b.face=sgn(pcx-bcx);
  switch(b.state){
    case 'intro': b.t-=dt; if(b.t<=0){ b.state='walk'; b.t=1.4; } break;
    case 'walk': b.vx=dist>130?b.face*(b.phase>1?36:26)/Math.sqrt(R_):dist<70?-b.face*20:0; b.t-=dt;
      if(b.t<=0){ b.vx=0; const r=Math.random(), kids=enemies.filter(e=>e.summoned&&!e.dead).length;
        if(dist<90&&r<0.5){ b.state='stompW'; b.t=0.7*R_; }
        else if(b.phase>=2&&DI>0&&kids<2&&r<0.22){ b.state='call'; b.t=0.6; }
        else if(r<0.5){ b.state='missileW'; b.t=0.6*R_; }
        else if(b.phase>=2&&r<0.72){ b.state='mgW'; b.t=0.5*R_; }
        else { b.state='laserW'; b.t=DI===0?1.4:DI===2?0.8:1.1; b.low=Math.random()<0.5; b.beamY=b.low?15*T-6:15*T-20; sfxAt('charge',b); } } break;
    case 'missileW': b.vx=0; b.t-=dt; if(b.t<=0){ const n=b.phase+1; for(let i=0;i<n;i++){ const ang=-Math.PI/2+(i-(n-1)/2)*0.5; bmiss.push({x:bcx-b.face*14,y:b.y+4,vx:Math.cos(ang)*120,vy:Math.sin(ang)*120,life:6,t:0}); } sfxAt('rocket',b); light(bcx,b.y,80,0.8,'rgba(255,150,60,'); b.state='walk'; b.t=(b.phase===1?1.8:1.3)*R_; } break;
    case 'laserW': b.vx=0; b.t-=dt; if(b.t<=0){ b.state='laser'; b.t=0.45; b.hit=false; sfxAt('zap',b); shake=5; } break;
    case 'laser': b.vx=0; b.t-=dt; if(!b.hit&&!p.dead&&p.y<b.beamY+4&&p.y+p.h>b.beamY-4){ b.hit=true; hurtPlayer(22,b.face*200); } if(b.t<=0){ if(b.phase>=2&&!b.second&&Math.random()<(DI===0?0.3:0.6)){ b.second=true; b.low=!b.low; b.beamY=b.low?15*T-6:15*T-20; b.state='laserW'; b.t=(DI===0?1.0:DI===2?0.55:0.75); sfxAt('charge',b); } else { b.second=false; b.state='walk'; b.t=(b.phase===3?0.9:1.3)*R_; } } break;
    case 'stompW': b.vx=0; b.t-=dt; b.lift=Math.min(8,b.lift+dt*24); if(b.t<=0){ b.lift=0; sfxAt('stomp',b); shake=12; for(const sd of [-1,1]) orbs.push({x:bcx+sd*30,y:15*T-8,vx:sd*150*D.bspd,r:8,life:5}); if(p.onGround&&dist<80){ hurtPlayer(16,sgn(pcx-bcx||1)*260); p.vy=-220; } b.state='walk'; b.t=1.4*R_; } break;
    case 'call': b.vx=0; b.t-=dt; if(b.t<=0){ for(let i=0;i<(DI===2?2:1);i++){ const e=makeEnemy('soldier',clamp(pcx+(i?-1:1)*rnd(80,130),x0+16,x1-16),4*T+12); e.alert=true; e.summoned=true; e.cd=0.9*D.react; enemies.push(e); bark(e,'Прикриваме ви, полковник!',1.8); } b.state='walk'; b.t=1.2*R_; } break;
    case 'mgW': b.vx=0; b.t-=dt; if(b.t<=0){ b.state='mg'; b.t=DI===0?1.0:DI===2?1.8:1.4; b.gt=0; } break;
    case 'mg': b.vx=0; b.t-=dt; b.gt-=dt; if(b.gt<=0){ b.gt=DI===0?0.15:0.09; const ox=bcx+b.face*40, oy=b.y+38, ang=Math.atan2(p.y+p.h/2-oy,pcx-ox)+rnd(-0.08,0.08); ebullets.push({x:ox,y:oy,vx:Math.cos(ang)*340*D.bspd,vy:Math.sin(ang)*340*D.bspd,life:1.5,dmg:5}); sfxAt('soldierShot',b); b.flashT=0.05; } if(b.t<=0){ b.state='walk'; b.t=1.2*R_; } break;
  }
  b.vy=Math.min(b.vy+G*dt,520); moveX(b,b.vx*dt); moveY(b,b.vy*dt); b.x=clamp(b.x,x0,x1-b.w);
  if(ov(b,p)&&b.contactCd<=0){ hurtPlayer(14,sgn(pcx-bcx||1)*260); p.vy=-200; b.contactCd=1.2; }
}
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
function drawTitan(){
  const b=boss; if(b.dead&&b.deathT>2.6) return;
  const a=LVL.arena, x0=(a.door+1)*T-cam, x1=a.exitDoor[0]*T-cam;
  if(b.state==='laserW'){ ctx.strokeStyle=`rgba(255,70,50,${0.45+Math.sin(titleT*30)*0.3})`; ctx.lineWidth=1; ctx.setLineDash([4,4]); ctx.beginPath(); ctx.moveTo(x0,b.beamY); ctx.lineTo(x1,b.beamY); ctx.stroke(); ctx.setLineDash([]);
    if(DI<2){ ctx.font='600 7px "IBM Plex Mono",monospace'; ctx.textAlign='center'; ctx.fillStyle='#ffb0a0'; ctx.fillText(b.low?'СКАЧАЙ!':'КЛЕКНИ!',W/2,b.beamY-26); ctx.textAlign='left'; } }
  if(b.state==='laser'){ ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.fillStyle='rgba(255,60,40,0.55)'; ctx.fillRect(x0,b.beamY-4,x1-x0,8); ctx.fillStyle='rgba(255,235,220,0.95)'; ctx.fillRect(x0,b.beamY-1,x1-x0,2); ctx.restore(); }
  begin(b); tint=b.hitT>0?'#fff':null; if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1);
  const m='#4a4f56', md='#30343a', ml='#6d757d', acc='#c99a1c';
  const wk=Math.abs(b.vx)>1?Math.round(Math.sin(b.anim*5)*3):0, lift=-Math.round(b.lift||0);
  px(-18+wk,-30,10,18,md); px(8-wk,-30,10,18,md); px(-20+wk,-14,12,10,m); px(8-wk,-14,12,10,m); px(-22+wk,-4,16,4,'#1d2125'); px(6-wk,-4,16,4,'#1d2125'); px(-20+wk,-14,12,1,ml); px(8-wk,-14,12,1,ml);
  ctx.translate(0,lift);
  px(-16,-36,32,8,md);
  px(-24,-68,48,34,m); px(-24,-68,48,2,ml); px(-24,-40,48,4,md); for(let i=0;i<4;i++) px(-20+i*11,-44,6,2,acc);
  const cr=b.phase===3;
  px(-4,-64,22,14,'#1b2a33'); px(-3,-63,20,12,cr?'#2a1a1a':'#2a4a5a'); px(4,-60,6,6,'#e2b48f'); px(4,-61,6,2,'#3a3f2a'); px(8,-58,2,1,'#222');
  if(cr){ ctx.strokeStyle='#d8e0e8'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(-2,-62); ctx.lineTo(6,-56); ctx.lineTo(4,-52); ctx.moveTo(6,-56); ctx.lineTo(14,-60); ctx.stroke(); }
  else px(-3,-63,20,2,'rgba(200,240,255,0.5)');
  px(-26,-80,18,14,md); px(-26,-80,18,2,ml); for(let i=0;i<3;i++) px(-24+i*5,-77,3,3,b.state==='missileW'?'#ff6a3a':'#c9473a');
  px(18,-60,10,22,md); px(22,-44,20,8,m); px(22,-44,20,1,ml); px(40,-43,4,6,'#1d2125'); if(b.flashT>0&&!tint){ ctx.fillStyle='#fff3b0'; ctx.fillRect(44,-43,4,5); }
  px(14,-52,5,4,(b.state==='laserW'||b.state==='laser')?'#ff3b2e':'#5a1a14');
  px(-30,-62,8,20,md);
  tint=null; ctx.globalAlpha=1; ctx.restore();
  if(b.phase===3&&!b.dead&&Math.random()<0.2) sparks(b.x+b.w/2+rnd(-20,20),b.y+rnd(10,40),2,'#ffd36b');
}
function drawMissiles(){ for(const m of bmiss){ ctx.save(); ctx.translate(Math.round(m.x-cam),Math.round(m.y)); ctx.rotate(Math.atan2(m.vy,m.vx)); px(-5,-1,7,3,'#5a5f63'); px(2,-1,3,3,'#c9473a'); px(-8,-1,3,3,Math.random()<0.5?'#ffd36b':'#ff8a3a'); ctx.restore(); } }


