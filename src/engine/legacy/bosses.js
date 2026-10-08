/* ================= BOSSES ================= */
const makeBoss=()=>({colossus:makeColossus,warden:makeWarden,heli:makeHeli,worm:makeWorm,guardian:makeGuardian,exo:makeExo,tank:makeTank,hunter:makeHunter,queen:makeQueen,titan:makeTitan,...R2B.make})[LVL.arena.type]();
const bossSfx=t=>({warden:'warden',heli:'chop',tank:'engine',titan:'warden',exo:'stomp',hunter:'screech'})[t]||'roar';
const BOSS_INTRO={worm:'Червеят! Стреляй по него, докато е над киселината. Варелите на брега ще помогнат.',guardian:'Пазителят! Щитът му се захранва от трите пилона. Унищожи ги, после стреляй по него.',colossus:'Колосът! Прескачай зелените вълни и взривявай варелите около него.',warden:'Надзирателят! Стреляй в окото и бягай от сферите.',heli:'Боен хеликоптер! Куршумите почти не му вредят — стреляй с ракетомета.',
  exo:'Командирът в бойна броня! Щитът спира куршумите отпред — стреляй в гърба му или докато бронята е прегряла.',
  tank:'Танк! Куршумите не го пробиват — използвай ракети и гранати. Прескачай го и клякай под картечницата.',
  hunter:'Ловецът! Пунктирът показва височината на атаката: ниско — скачай, високо — клекни.',
  queen:'Майката на гнездото! Унищожавай яйцата и стреляй, когато черупката ѝ се отвори.',
  titan:'Полковник Стратев в „Титан“! Стреляй по ракетите му, за да ги сваляш. Пунктирът показва лазера: ниско — скачай, високо — клекни.'};
function startBoss(){
  const a=LVL.arena; setCp(a.cp!=null?a.cp:a.door+2); bossActive=true;
  if(a.door!=null){ setDoor([a.door,a.r0,a.r1],'D'); SFX.door(); shake=6; }
  boss=makeBoss(); boss.hp*=bossMul; boss.max*=bossMul; if(boss.type==='guardian') spawnPylons();
  if(['colossus','warden','guardian'].includes(a.type)) portals.push({x:boss.x+boss.w/2,y:boss.y+boss.h/2,t:0,spawned:true,type:'boss',big:true});
  SFX.alarm(3); sfxAt(bossSfx(boss.type),boss); bossMusic=true;
  showMsg(BOSS_INTRO[a.type]||R2B.intro[a.type],4.5);
}
function makeColossus(){ const a=LVL.arena; return {type:'colossus',x:a.bx*T-22,y:15*T-64,w:44,h:64,hp:700*D.bhp,max:700*D.bhp,face:-1,state:'intro',t:2.2,vx:0,vy:0,hitT:0,phase:1,contactCd:0,anim:0,dead:false,deathT:0,onGround:true,boomT:0,lift:0}; }
function makeWarden(){ const a=LVL.arena; return {type:'warden',x:a.bx*T-28,y:-60,w:56,h:56,hp:1400*(DI===0?0.32:D.bhp),max:1400*(DI===0?0.32:D.bhp),face:-1,state:'intro',t:2.4,vx:0,vy:0,hitT:0,phase:1,contactCd:0,anim:0,dead:false,deathT:0,boomT:0}; }
function hurtBoss(d,blast){ ({colossus:hurtColossus,heli:hurtHeli,warden:hurtWarden,worm:hurtWorm,guardian:hurtGuardian,exo:hurtExo,tank:hurtTank,hunter:hurtHunter,queen:hurtQueen,titan:hurtTitan,...R2B.hurt})[boss.type](d,blast); }
function hurtColossus(d,blast){
  const b=boss; if(!b||b.dead||b.state==='intro') return;
  b.hp-=d*(b.state==='stun'?2:1.15); b.hitT=0.08; blood(b.x+b.w/2+rnd(-12,12),b.y+rnd(10,40),true,blast?14:3);
  if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; b.state='roar'; b.t=1.4; b.vx=0; sfxAt('roar',b); shake=8; if(DI>0) portalSpawn('crab',LVL.arena.crab*T,15*T,0.4,'boss'); if(DI===2) portalSpawn('crab',(LVL.arena.door+3)*T,15*T,0.7,'boss'); showMsg('Колосът побесня!'); }
  if(b.hp<=0) bossDie();
}
function hurtWarden(d,blast){
  const b=boss; if(!b||b.dead||b.state==='intro') return;
  b.hp-=d*(b.state==='grounded'?2:1); b.hitT=0.08; blood(b.x+b.w/2+rnd(-14,14),b.y+b.h/2+rnd(-14,14),true,blast?12:2);
  if(b.phase===1&&b.hp<b.max*0.6){ b.phase=2; sfxAt('warden',b); shake=8; showMsg('Надзирателят се събуди напълно!'); }
  else if(b.phase===2&&b.hp<b.max*0.25){ b.phase=3; sfxAt('warden',b); shake=10; showMsg('Последни сили — довърши го!'); }
  if(b.hp<=0) bossDie();
}
function bossDie(){ const b=boss; b.hp=0; b.dead=true; b.deathT=0; b.vx=0; b.vy=0; stats.kills++; sfxAt(b.type==='warden'?'warden':(b.type==='heli'||b.mech)?'boom':'roar',b); for(const e of enemies) if(e.summoned&&!e.dead) hurtEnemy(e,999,0); }
function bossDeathFx(b,dt){
  b.deathT+=dt; b.boomT-=dt;
  if(b.boomT<=0&&b.deathT<2.6){ b.boomT=0.22; const ex=b.x+rnd(b.w),ey=b.y+rnd(b.h), mc=b.mech; for(let i=0;i<16;i++){const a=rnd(6.28),s=rnd(30,150);part(ex,ey,Math.cos(a)*s,Math.sin(a)*s,rnd(0.3,0.6),['#fff1a8',mc?'#ff6a1a':'#9dff5a','#ffb53a'][i%3],rnd(2,4),40,1);} sfxAt('boom',b); shake=7; light(ex,ey,120,0.9,mc?'rgba(255,150,40,':'rgba(160,255,90,'); if(mc) for(let i=0;i<4;i++) part(ex,ey,rnd(-20,20),rnd(-50,-20),rnd(0.8,1.4),'#2a2a2a',rnd(4,7),-10,2); else blood(ex,ey,true,10); }
  if(b.deathT>2.6&&!exitPortal&&!b.exitDone){
    const a=LVL.arena; b.exitDone=true; bossMusic=false; bossActive=false; SFX.door();
    if(a.exitDoor) setDoor(a.exitDoor,'.');
    else { exitPortal={x:a.px*T,y:a.py*T,t:0}; sfxAt('portal',{x:a.px*T,y:a.py*T,w:0}); }
    radio(a.msg);
  }
}
function updColossus(dt){
  const b=boss, p=player, R_=D.react; b.anim+=dt; b.hitT-=dt; b.contactCd-=dt;
  const bcx=b.x+b.w/2, pcx=p.x+p.w/2, dist=Math.abs(pcx-bcx);
  if(b.dead){ bossDeathFx(b,dt); return; }
  if(p.dead){ b.vx=0; b.vy=Math.min(b.vy+G*dt,520); moveY(b,b.vy*dt); return; }
  if(b.state!=='charge'&&b.state!=='stun') b.face=sgn(pcx-bcx);
  const fast=b.phase===2;
  switch(b.state){
    case 'intro': b.t-=dt; if(b.t<=0){ b.state='walk'; b.t=1.2; } break;
    case 'walk': b.vx=b.face*(fast?40:28)/Math.sqrt(R_); b.t-=dt; if(b.t<=0){ if(dist<130){ b.state='stompW'; b.t=0.8*R_; } else if(fast&&Math.random()<(DI===2?0.4:0.25)){ b.state='chargeW'; b.t=1.2*R_; sfxAt('roar',b); } else { b.state='waveW'; b.t=0.85*R_; } b.vx=0; } break;
    case 'stompW': b.vx=0; b.lift=Math.min(6,b.lift+dt*20); b.t-=dt; if(b.t<=0){ b.lift=0; sfxAt('stomp',b); shake=12; for(let i=0;i<20;i++) part(bcx+rnd(-40,40),b.y+b.h,rnd(-120,120),rnd(-80,-10),rnd(0.4,0.8),'#6d6a62',rnd(2,4),300,2);
        if(p.onGround&&Math.abs(pcx-bcx)<115){ hurtPlayer(12,sgn(pcx-bcx)*260); p.vy=-220; }
        b.state='walk'; b.t=(fast?1.5:2.0)*R_; } break;
    case 'waveW': b.vx=0; b.t-=dt; if(b.t<=0){ launchOrb(b,(fast?165:135)*D.bspd); if(fast||DI===2) b.extra=0.7*R_; b.state='walk'; b.t=(fast?1.8:2.4)*R_; } break;
    case 'chargeW': b.vx=0; b.t-=dt; if(Math.random()<0.5) part(b.x+(b.face>0?0:b.w),b.y+b.h-2,-b.face*rnd(30,80),rnd(-40,-10),0.4,'#6d6a62',2,200,2); if(b.t<=0){ b.state='charge'; b.t=1.8; } break;
    case 'charge': b.vx=b.face*230*Math.sqrt(D.bspd); b.t-=dt; if(Math.random()<0.6) part(bcx,b.y+b.h-2,-b.face*60,rnd(-50,-10),0.4,'#6d6a62',3,200,2); break;
    case 'stun': b.vx=0; b.t-=dt; if(Math.random()<0.3) part(b.x+rnd(b.w),b.y+rnd(10),rnd(-20,20),-30,0.5,'#ffe36b',1,0); if(b.t<=0){ b.state='walk'; b.t=1; } break;
    case 'roar': b.vx=0; b.t-=dt; if(b.t<=0){ b.state='walk'; b.t=0.8; } break;
  }
  if(b.extra!==undefined){ b.extra-=dt; if(b.extra<=0){ launchOrb(b,150*D.bspd); b.extra=undefined; } }
  b.vy=Math.min(b.vy+G*dt,520); const blocked=moveX(b,b.vx*dt); moveY(b,b.vy*dt);
  if(b.state==='charge'&&(blocked||b.t<=0)){ b.state='stun'; b.t=2.4/Math.sqrt(R_); shake=12; sfxAt('stomp',b); for(let i=0;i<14;i++) part(b.face>0?b.x+b.w:b.x,b.y+rnd(b.h),-b.face*rnd(20,120),rnd(-100,0),0.6,'#7a7f84',2,500,2); }
  if(ov(b,p)&&b.contactCd<=0){ hurtPlayer(b.state==='charge'?15:8,sgn(pcx-bcx)*260); p.vy=-180; b.contactCd=1.3; }
}
function launchOrb(b,sp){ const fy=b.y+b.h; orbs.push({x:b.x+b.w/2+b.face*24,y:fy-8,vx:b.face*sp,r:8,life:6}); sfxAt('orb',b); light(b.x+b.w/2,b.y+28,90,0.9,'rgba(160,255,90,'); }
function updWarden(dt){
  const b=boss, p=player, a=LVL.arena, R_=D.react; b.anim+=dt; b.hitT-=dt; b.contactCd-=dt;
  if(b.dead){ b.vy=Math.min((b.vy||0)+200*dt,120); b.y+=b.vy*dt; bossDeathFx(b,dt); return; }
  const pcx=p.x+p.w/2, pcy=p.y+p.h/2, bcx=b.x+b.w/2, bcy=b.y+b.h/2;
  b.face=sgn(pcx-bcx);
  const spd=(b.phase===1?55:b.phase===2?80:100)/R_;
  const hover=(tx,ty,sp)=>{ const dx=tx-bcx, dy=ty-bcy; b.x+=clamp(dx*2,-sp,sp)*dt; b.y+=clamp(dy*2,-sp,sp)*dt; };
  const minX=a.minX*T, maxX=a.maxX*T, floorY=14*T;
  if(p.dead){ hover(bcx,60,40); return; }
  switch(b.state){
    case 'intro': b.y+=(52-b.y)*dt*1.5; b.t-=dt; if(b.t<=0){ b.state='float'; b.t=1.5*R_; } break;
    case 'float': {
      hover(clamp(pcx+Math.sin(b.anim*0.7)*110,minX,maxX),80+Math.sin(b.anim*1.6)*12,spd);
      b.t-=dt; if(b.t<=0){
        const r=Math.random(), summ=enemies.filter(e=>e.summoned&&!e.dead).length+portals.filter(q=>q.tag==='boss'&&!q.spawned).length;
        if(b.phase>=2&&r<0.35){ b.state='slamW'; b.t=1.0*R_; sfxAt('warden',b); }
        else if(r<0.55&&summ<(DI===2?4:DI===1?3:1)){ b.state='summon'; b.t=0.8; }
        else { b.state='volleyW'; b.t=0.75*R_; sfxAt('charge',b); }
      } } break;
    case 'volleyW': hover(bcx,80,20); b.t-=dt; if(b.t<=0){ volley(b); if(b.phase===3) b.extra=0.45*R_; b.state='float'; b.t=(b.phase===1?1.9:1.4)*R_; } break;
    case 'summon': b.t-=dt; if(b.t<=0){ const n=DI===0?1:2; for(let i=0;i<n;i++){ const fl=Math.random()<0.5, x=clamp(pcx+(i?-1:1)*rnd(80,140),minX,maxX); portalSpawn(fl?'flyer':'crab',x,fl?7*T:floorY,i*0.3,'boss'); } b.state='float'; b.t=1.4*R_; } break;
    case 'slamW': hover(pcx,50,170/R_); b.t-=dt; if(b.t<=0){ b.state='slam'; b.vy=0; } break;
    case 'slam': b.vy+=1500*dt; b.y+=b.vy*dt; if(b.y+b.h>=floorY){ b.y=floorY-b.h; shake=12; sfxAt('stomp',b);
        for(const s of [-1,1]) orbs.push({x:bcx+s*30,y:floorY-8,vx:s*150*D.bspd,r:8,life:5});
        for(let i=0;i<20;i++) part(bcx+rnd(-30,30),floorY,rnd(-120,120),rnd(-120,-20),rnd(0.4,0.8),'#6e5a85',rnd(2,4),300,2);
        if(p.onGround&&Math.abs(pcx-bcx)<70){ hurtPlayer(18,sgn(pcx-bcx)*260); p.vy=-220; }
        b.state='grounded'; b.t=2.0*(DI===0?1.6:DI===2?0.7:1); } break;
    case 'grounded': b.t-=dt; if(Math.random()<0.3) part(b.x+rnd(b.w),b.y+rnd(10),rnd(-20,20),-30,0.5,'#ffe36b',1,0); if(b.t<=0){ b.state='rise'; } break;
    case 'rise': b.y-=110*dt; if(b.y<=50){ b.state='float'; b.t=1.2*R_; } break;
  }
  if(b.extra!==undefined){ b.extra-=dt; if(b.extra<=0){ volley(b,true); b.extra=undefined; } }
  b.x=clamp(b.x,(a.door+1)*T,(a.maxX+2)*T-b.w);
  if(ov(b,p)&&b.contactCd<=0){ hurtPlayer(b.state==='slam'?25:12,sgn(pcx-bcx)*240); p.vy=-180; b.contactCd=1.1; }
}
function makeHeli(){ const a=LVL.arena; return {type:'heli',x:(a.maxX+3)*T,y:30,w:64,h:26,hp:600*D.bhp,max:600*D.bhp,face:-1,state:'intro',t:2.6,vx:0,vy:0,hitT:0,phase:1,anim:0,dead:false,deathT:0,boomT:0,contactCd:0,chop:0,rot:0}; }
function hurtHeli(d,blast){
  const b=boss; if(!b||b.dead||b.state==='intro') return;
  b.hp-=blast?d:d*(DI===0?0.6:DI===2?0.2:0.3); b.hitT=0.06; sparks(b.x+b.w/2+rnd(-20,20),b.y+b.h/2+rnd(-6,6),blast?10:2,'#ffd36b');
  if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; showMsg('Хеликоптерът е повреден — още малко!',2.5); }
  if(b.hp<=0){ bossDie(); b.vx=-b.face*70; b.vy=-20; }
}
function updHeli(dt){
  const b=boss, p=player, a=LVL.arena, R_=D.react; b.anim+=dt; b.hitT-=dt; b.contactCd-=dt;
  b.chop-=dt; if(b.chop<=0&&!b.crashed){ b.chop=0.085; sfxAt('chop',b); }
  if(b.phase===2&&!b.crashed&&Math.random()<0.5) part(b.x+b.w*0.3,b.y+6,rnd(-10,10),rnd(-30,-10),rnd(0.6,1.2),'#2a2a2a',rnd(3,5),-15,2);
  if(b.dead){
    if(!b.crashed){ b.vy=Math.min(b.vy+420*dt,380); b.x+=b.vx*dt; b.y+=b.vy*dt; b.rot+=dt*5; if(Math.random()<0.8) part(b.x+b.w/2,b.y+b.h/2,rnd(-20,20),rnd(-40,-10),rnd(0.6,1.2),'#2a2a2a',rnd(4,7),-10,2);
      if(b.y+b.h>=groundY(clamp(Math.floor((b.x+b.w/2)/T),0,COLS-1))-2||b.y>H){ b.crashed=true; explode(b.x+b.w/2,b.y+b.h/2,90,40,0.6); } }
    if(b.crashed) bossDeathFx(b,dt); return;
  }
  const pcx=p.x+p.w/2, pcy=p.y+p.h/2, bcx=b.x+b.w/2, bcy=b.y+b.h/2;
  b.face=sgn(pcx-bcx);
  const fly=(tx,ty,sp)=>{ const k=Math.min(1,dt*2); b.vx+=(clamp((tx-bcx)*1.5,-sp,sp)-b.vx)*k; b.vy+=(clamp((ty-bcy)*1.5,-sp,sp)-b.vy)*k; b.x+=b.vx*dt; b.y+=b.vy*dt; };
  const minX=a.minX*T, maxX=a.maxX*T, sp=(b.phase===1?110:150)/R_;
  if(p.dead){ fly(bcx,40,60); return; }
  switch(b.state){
    case 'intro': fly(clamp(pcx+130,minX,maxX),60,170); b.t-=dt; if(b.t<=0){ b.state='move'; b.t=1.5*R_; } break;
    case 'move': if(b.tx===undefined||Math.abs(b.tx-bcx)<20) b.tx=clamp(pcx+(Math.random()<0.5?-1:1)*rnd(90,170),minX,maxX); fly(b.tx,62+Math.sin(b.anim)*12,sp); b.t-=dt;
      if(b.t<=0){ const r=Math.random(); b.tx=undefined;
        if(b.phase>=2&&r<0.3){ b.state='rocketW'; b.t=0.9*R_; }
        else if(r<0.62){ b.state='gunW'; b.t=0.85*R_; }
        else { b.state='bomb'; b.t=2.0; b.bt=0.3; b.bdir=sgn(pcx-bcx); } } break;
    case 'gunW': fly(bcx,60,40); b.t-=dt; if(b.t<=0){ b.state='gun'; b.t=DI===2?1.6:DI===0?0.8:1.2; b.gt=0; } break;
    case 'gun': fly(bcx,60,30); b.t-=dt; b.gt-=dt;
      if(b.gt<=0){ b.gt=DI===0?0.15:0.08; const ox=bcx+b.face*24, oy=bcy+8, ang=Math.atan2(p.y+p.h/2-oy,pcx-ox)+rnd(-0.09,0.09)*(DI===2?0.6:1);
        ebullets.push({x:ox,y:oy,vx:Math.cos(ang)*360*D.bspd,vy:Math.sin(ang)*360*D.bspd,life:1.4,dmg:4}); sfxAt('soldierShot',b); light(ox,oy,50,0.7,'rgba(255,200,90,'); }
      if(b.t<=0){ b.state='move'; b.t=(b.phase===1?1.8:1.3)*R_; } break;
    case 'bomb': b.vx=b.bdir*150/Math.sqrt(R_); b.vy+=(50-bcy-b.vy)*dt; b.x+=b.vx*dt; b.y+=b.vy*dt; b.t-=dt; b.bt-=dt;
      if(b.bt<=0){ b.bt=DI===0?0.55:DI===2?0.25:0.35; grenades.push({x:bcx,y:b.y+b.h,vx:b.vx*0.3,vy:40,t:4,impact:true}); }
      if(b.t<=0||bcx<minX-20||bcx>maxX+20){ b.state='move'; b.t=1.5*R_; } break;
    case 'rocketW': fly(bcx,55,40); b.t-=dt; if(b.t<=0){ const n=DI===2?3:2; for(let i=0;i<n;i++){ const ox=bcx, oy=bcy+10, ang=Math.atan2(p.y+p.h/2-oy,pcx-ox)+(i-(n-1)/2)*0.25; ebullets.push({x:ox,y:oy,vx:Math.cos(ang)*150*D.bspd,vy:Math.sin(ang)*150*D.bspd,life:5,dmg:16,r:3,orb:true,red:true}); } sfxAt('rocket',b); b.state='move'; b.t=1.4*R_; } break;
  }
  b.x=clamp(b.x,minX-48,maxX+48-b.w); b.y=clamp(b.y,8,110);
  if(ov(b,p)&&b.contactCd<=0){ hurtPlayer(10,sgn(pcx-bcx)*200); b.contactCd=1; }
}
function makeWorm(){ const a=LVL.arena; const cx=((a.pool[0]+a.pool[1]+1)/2)*T; return {type:'worm',emX:cx,x:cx-13,y:H+60,w:26,h:10,hp:550*D.bhp,max:550*D.bhp,face:-1,state:'intro',t:1.6,rise:0,phase:1,anim:0,dead:false,deathT:0,boomT:0,contactCd:0,hitT:0,vx:0,vy:0}; }
function hurtWorm(d,blast){
  const b=boss; if(!b||b.dead||b.rise<0.3) return;
  b.hp-=d; b.hitT=0.08; blood(b.emX+rnd(-10,10),b.y+rnd(0,30),true,blast?12:3);
  if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; sfxAt('roar',b); showMsg('Червеят побесня!',2); }
  if(b.hp<=0) bossDie();
}
function updWorm(dt){
  const b=boss, p=player, a=LVL.arena, R_=D.react, surf=13*T, HV=104; b.anim+=dt; b.hitT-=dt; b.contactCd-=dt;
  const geom=()=>{ const hh=HV*b.rise; b.x=b.emX-13; if(b.rise<0.05){ b.y=H+60; b.h=10; } else { b.y=surf-hh; b.h=hh+6; } };
  if(b.dead){ b.rise=Math.max(0,b.rise-dt*0.35); b.x=b.emX-13; b.y=surf-HV*Math.max(b.rise,0.3); b.h=HV*Math.max(b.rise,0.3); bossDeathFx(b,dt); return; }
  const pcx=p.x+p.w/2;
  if(p.dead){ b.rise=Math.max(0,b.rise-dt*2); geom(); return; }
  switch(b.state){
    case 'intro': case 'under': b.rise=0; b.t-=dt; if(b.t<=0){ b.emX=clamp(pcx+rnd(-50,50),a.pool[0]*T+14,(a.pool[1]+1)*T-14); b.state='bubble'; b.t=(b.phase===1?1.1:0.8)*R_; } break;
    case 'bubble': b.t-=dt; if(Math.random()<0.7) part(b.emX+rnd(-12,12),surf+2,rnd(-10,10),rnd(-70,-25),0.45,'#a6ff6a',2,0); if(b.t<=0){ b.state='rise'; sfxAt('roar',{x:b.emX,y:surf,w:0}); } break;
    case 'rise': b.rise=Math.min(1,b.rise+dt*3); if(b.rise>=1){ b.state='up'; b.t=b.phase===1?2.8:2.2; b.st=0.45; for(let i=0;i<16;i++) part(b.emX+rnd(-14,14),surf,rnd(-80,80),rnd(-160,-40),0.6,'#8cff4f',2,500); } break;
    case 'up': b.t-=dt; b.st-=dt; b.face=sgn(pcx-b.emX); if(b.st<=0){ wormSpit(b); b.st=(b.phase===1?0.9:0.6)*R_; } if(b.t<=0) b.state='sink'; break;
    case 'sink': b.rise=Math.max(0,b.rise-dt*3); if(b.rise<=0){ b.state='under'; b.t=(b.phase===1?1.4:0.9)*R_; } break;
  }
  geom();
  if(b.rise>0.3&&ov(b,p)&&b.contactCd<=0){ hurtPlayer(15,sgn(pcx-b.emX)*260); p.vy=-200; b.contactCd=1; }
}
function wormSpit(b){
  const p=player, hx=b.emX+b.face*6, hy=b.y+10, n=b.phase===1?(DI===2?2:1):(DI===0?2:3), tt=0.95;
  for(let i=0;i<n;i++){ const tx=p.x+p.w/2+(i-(n-1)/2)*36, ty=p.y+p.h-6; ebullets.push({x:hx,y:hy,vx:(tx-hx)/tt,vy:(ty-hy)/tt-0.5*G*tt,life:3,dmg:12,r:4,orb:true,grav:true,acid:true}); }
  sfxAt('spit',b);
}
function drawWorm(){
  const b=boss; if(b.rise<=0.02||(b.dead&&b.deathT>2.6)) return;
  const cx=Math.round(b.emX-cam), surf=13*T, top=Math.round(b.y);
  ctx.save(); if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1);
  tint=b.hitT>0?'#fff':null;
  for(let y=surf+4,i=0;y>top+14;y-=7,i++){ const k=(surf-y)/104, sw=Math.round(Math.sin(b.anim*3+y*0.05)*4*k); ctx.fillStyle=tint||(i%2?'#4a5a2a':'#5a6a32'); ctx.beginPath(); ctx.ellipse(cx+sw,y,12-k*2,6,0,0,7); ctx.fill(); if(i%3===1){ ctx.fillStyle=tint||'#c94a8a'; ctx.fillRect(cx+sw-6,y-1,2,2); ctx.fillRect(cx+sw+4,y,2,2); } }
  const sw=Math.round(Math.sin(b.anim*3+top*0.05)*4);
  ctx.fillStyle=tint||'#5a6a32'; ctx.beginPath(); ctx.ellipse(cx+sw,top+12,15,13,0,0,7); ctx.fill();
  ctx.fillStyle='#1a0a10'; ctx.beginPath(); ctx.ellipse(cx+sw+b.face*6,top+15,7,6+(b.state==='up'&&b.st<0.25?3:0),0,0,7); ctx.fill();
  ctx.fillStyle='#e8e0c8'; for(let i=-2;i<=2;i++) ctx.fillRect(cx+sw+b.face*6+i*2,top+10,1,3);
  ctx.fillStyle='#ffef5a'; ctx.fillRect(cx+sw-6,top+5,2,2); ctx.fillRect(cx+sw-1,top+3,2,2); ctx.fillRect(cx+sw+4,top+5,2,2);
  tint=null; ctx.restore();
}
function spawnPylons(){ for(const [tx,row] of LVL.arena.pylons){ const e=makeEnemy('pylon',tx*T,row*T); e.tag='pylon'; e.alert=true; enemies.push(e); sparks(tx*T,row*T-12,10,'#8ad8ff'); } }
const pylonsAlive=()=>enemies.some(e=>e.tag==='pylon'&&!e.dead);
function makeGuardian(){ const a=LVL.arena; return {type:'guardian',x:a.bx*T-20,y:15*T-56,w:40,h:56,hp:800*D.bhp,max:800*D.bhp,face:-1,state:'intro',t:2,vx:0,vy:0,hitT:0,phase:1,anim:0,dead:false,deathT:0,boomT:0,contactCd:0,shieldDown:false,shieldT:0,onGround:true}; }
function hurtGuardian(d,blast){
  const b=boss; if(!b||b.dead||b.state==='intro') return;
  if(!b.shieldDown){ sparks(b.x+b.w/2+rnd(-22,22),b.y+rnd(6,46),3,'#8ad8ff'); if(Math.random()<0.25) sfxAt('deflect',b); return; }
  b.hp-=d; b.hitT=0.08; blood(b.x+b.w/2+rnd(-12,12),b.y+rnd(10,40),true,blast?12:3);
  if(b.phase===1&&b.hp<b.max*0.5){ b.phase=2; sfxAt('roar',b); showMsg('Пазителят побесня!',2); if(DI>0) portalSpawn('guard',(LVL.arena.door+4)*T,15*T,0.3,'boss'); }
  if(b.hp<=0) bossDie();
}
function updGuardian(dt){
  const b=boss, p=player, a=LVL.arena, R_=D.react; b.anim+=dt; b.hitT-=dt; b.contactCd-=dt;
  if(b.dead){ bossDeathFx(b,dt); return; }
  if(!b.shieldDown&&b.state!=='intro'&&!pylonsAlive()){ b.shieldDown=true; b.shieldT=DI===0?12:DI===2?6:8; sfxAt('deflect',b); showMsg('Щитът падна! Стреляй!',2); }
  if(b.shieldDown){ b.shieldT-=dt; if(b.shieldT<=0){ b.shieldDown=false; enemies=enemies.filter(e=>e.tag!=='pylon'); spawnPylons(); sfxAt('portal',b); showMsg('Пилоните се възстановиха!',2); } }
  const pcx=p.x+p.w/2, bcx=b.x+b.w/2, fast=b.phase===2;
  if(p.dead){ b.vx=0; return; }
  if(b.state!=='beam'&&b.state!=='beamW') b.face=sgn(pcx-bcx);
  switch(b.state){
    case 'intro': b.t-=dt; if(b.t<=0){ b.state='walk'; b.t=1.5; } break;
    case 'walk': b.vx=Math.abs(pcx-bcx)>60?b.face*(fast?34:24)/Math.sqrt(R_):0; b.t-=dt;
      if(b.t<=0){ b.vx=0; const r=Math.random();
        if(Math.abs(pcx-bcx)<90){ b.state='stompW'; b.t=0.7*R_; }
        else if(r<0.45){ b.state='beamW'; b.t=1.0*R_; b.beamY=clamp(p.y+6,3*T,15*T-6); sfxAt('charge',b); }
        else { b.state='volleyW'; b.t=0.7*R_; sfxAt('charge',b); } } break;
    case 'volleyW': b.vx=0; b.t-=dt; if(b.t<=0){ const n=(fast?7:5)+(DI===2?2:0)-(DI===0?2:0), ox=bcx+b.face*18, oy=b.y+16, base=Math.atan2(p.y+p.h/2-oy,pcx-ox);
        for(let i=0;i<n;i++){ const ang=base+(i-(n-1)/2)*0.18; ebullets.push({x:ox,y:oy,vx:Math.cos(ang)*130*D.bspd,vy:Math.sin(ang)*130*D.bspd,life:5,dmg:10,r:4,orb:true}); }
        sfxAt('orb',b); b.state='walk'; b.t=(fast?1.3:1.9)*R_; } break;
    case 'beamW': b.vx=0; b.t-=dt; if(b.t<=0){ b.state='beam'; b.t=0.35; b.beamHit=false; sfxAt('zap',b); shake=5; } break;
    case 'beam': b.t-=dt; if(!b.beamHit&&!p.dead&&p.y<b.beamY+4&&p.y+p.h>b.beamY-4){ b.beamHit=true; hurtPlayer(25,b.face*200); } if(b.t<=0){ b.state='walk'; b.t=(fast?1.2:1.7)*R_; } break;
    case 'stompW': b.vx=0; b.t-=dt; if(b.t<=0){ sfxAt('stomp',b); shake=10; for(const sd of [-1,1]) orbs.push({x:bcx+sd*24,y:15*T-8,vx:sd*140*D.bspd,r:8,life:5}); if(p.onGround&&Math.abs(pcx-bcx)<80){ hurtPlayer(15,sgn(pcx-bcx)*240); p.vy=-200; } b.state='walk'; b.t=1.5*R_; } break;
  }
  b.vy=Math.min(b.vy+G*dt,520); moveX(b,b.vx*dt); moveY(b,b.vy*dt);
  b.x=clamp(b.x,(a.door+1)*T,(COLS-2)*T-b.w);
  if(ov(b,p)&&b.contactCd<=0){ hurtPlayer(12,sgn(pcx-bcx)*240); p.vy=-180; b.contactCd=1.1; }
}
function drawGuardian(){
  const b=boss; if(b.dead&&b.deathT>2.6) return;
  const a=LVL.arena, x0=(a.door+1)*T-cam, x1=(COLS-2)*T-cam;
  if(b.state==='beamW'){ ctx.strokeStyle=`rgba(255,80,200,${0.4+Math.sin(titleT*30)*0.3})`; ctx.lineWidth=1; ctx.setLineDash([4,4]); ctx.beginPath(); ctx.moveTo(x0,b.beamY); ctx.lineTo(x1,b.beamY); ctx.stroke(); ctx.setLineDash([]); }
  if(b.state==='beam'){ ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.fillStyle='rgba(255,90,220,0.55)'; ctx.fillRect(x0,b.beamY-5,x1-x0,10); ctx.fillStyle='rgba(255,240,255,0.9)'; ctx.fillRect(x0,b.beamY-1,x1-x0,2); ctx.restore(); }
  begin(b); tint=b.hitT>0?'#fff':null;
  if(b.dead) ctx.globalAlpha=1-clamp((b.deathT-1.8)/0.8,0,1);
  const w=Math.abs(b.vx)>1?Math.round(Math.sin(b.anim*6)*2):0;
  px(-14+w,-18,9,18,'#3a2e46'); px(5-w,-18,9,18,'#3a2e46'); px(-16+w,-3,12,3,'#221a2c'); px(4-w,-3,12,3,'#221a2c');
  px(-18,-46,36,29,'#5a4a3a'); px(-16,-44,32,4,'#7a6a52'); px(-18,-30,36,3,'#3a2e24'); px(-12,-40,24,8,'#6e4a8a'); px(-20,-46,6,14,'#4a3c30');
  px(-8,-57,16,11,'#5a4a3a'); px(-8,-58,16,2,'#7a6a52'); px(-4,-53,2,2,'#ffef5a'); px(0,-54,2,2,'#ffef5a'); px(4,-53,2,2,'#ffef5a');
  px(14,-41,17,8,'#3a2e24'); px(28,-39,4,4,b.state==='beamW'||b.state==='volleyW'?'#ff9af0':'#8ad8ff');
  tint=null; ctx.globalAlpha=1; ctx.restore();
  if(!b.shieldDown&&!b.dead&&b.state!=='intro'){ const cx=b.x+b.w/2-cam, cy=b.y+b.h/2; ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.strokeStyle=`rgba(138,216,255,${0.45+Math.sin(titleT*6)*0.15})`; ctx.fillStyle='rgba(120,200,255,0.12)'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.ellipse(cx,cy,30,36,0,0,7); ctx.fill(); ctx.stroke(); ctx.restore(); }
  else if(b.shieldDown&&!b.dead){ ctx.font='600 7px "IBM Plex Mono",monospace'; ctx.textAlign='center'; ctx.fillStyle='#8ad8ff'; ctx.fillText(Math.ceil(b.shieldT)+'',b.x+b.w/2-cam,b.y-8); ctx.textAlign='left'; }
}
function volley(b,offset){
  const p=player, ox=b.x+b.w/2, oy=b.y+b.h/2+6, base=Math.atan2(p.y+p.h/2-oy,p.x+p.w/2-ox);
  const n=[3,5,7][b.phase-1]+(DI===2?2:0)-(DI===0?1:0), spread=0.22, sp=115*D.bspd*(b.phase===3?1.15:1);
  for(let i=0;i<n;i++){ const a=base+(i-(n-1)/2)*spread+(offset?spread/2:0); ebullets.push({x:ox,y:oy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:5,dmg:10,r:4,orb:true}); }
  sfxAt('orb',b); light(ox,oy,100,0.9,'rgba(200,120,255,');
}


