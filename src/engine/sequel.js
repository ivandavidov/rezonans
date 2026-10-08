/* ================= ДВИГАТЕЛ НА ПРОДЪЛЖЕНИЯТА (engine ≥ 2) =================
   Общ код за всички части след първата: вода, епохи, обръщане, ескорт, гонитби, HUD, епизоди.
   Тук НЯМА съдържание на конкретна игра — нивата, босовете и текстовете са в games/<id>/. */
let SEQ=false;                 // включен ли е двигателят на продълженията (GAME.engine>=2)
let GLV=[], GCH=[], gUnl=1;    // нивата, главите и отключените епизоди на текущата игра
const gChOf=i=>Math.max(0,GCH.findIndex(c=>i>=c.a&&i<=c.b));
let FLOOD=null, ESC=null, CHASE=null, LEVERS=[], DRAINS=[], GENS=[], ALLIES=[], FLIPS=[], FLIP=false, ERA=0, ERAD=null, SHIFT=[], GWIND=0, flipCd=0, cpFlip=false, cpEra=0, eraCd=0, r2T={}, sunWarned=false, airWarned=false, r2epsSel=0;
const R2_TAKE={}, R2_PDRAW={}, R2UPD={}, R2DRAW={}, R2B={make:{},hurt:{},upd:{},draw:{},intro:{},name:{},col:{}};

/* ---------- избор на епизод ---------- */
function r2EpsInput(){
  const ch=gChOf(menuSel), c=GCH[ch];
  if(pressed.up&&menuSel>c.a){ menuSel--; SFX.menu(); }
  if(pressed.down&&menuSel<Math.min(c.b,gUnl-1)){ menuSel++; SFX.menu(); }
  if(pressed.right&&ch<GCH.length-1&&GCH[ch+1].a<gUnl){ menuSel=Math.min(GCH[ch+1].a+(menuSel-c.a),GCH[ch+1].b,gUnl-1); SFX.menu(); }
  if(pressed.left&&ch>0){ menuSel=Math.min(GCH[ch-1].a+(menuSel-c.a),GCH[ch-1].b); SFX.menu(); }
  if(ok()){ SFX.menuOk(); totals={time:0,shots:0,hits:0,kills:0,deaths:0}; if(menuSel===0) GAME.intro(false); else startEpisode(menuSel,false); }
  else if(pressed.jump||pressed.esc){ state='diff'; menuSel=DI; SFX.menu(); }
}

/* ---------- level load / respawn ---------- */
function r2Load(){
  FLOOD=null; ESC=null; CHASE=null; LEVERS=[]; DRAINS=[]; GENS=[]; ALLIES=[]; FLIPS=[]; FLIP=false; ERA=0; ERAD=null; SHIFT=[]; GWIND=0; flipCd=0; cpFlip=false; cpEra=0; eraCd=0; r2T={}; sunWarned=false; airWarned=false;
  const L=LVL; if(!L) return;
  if(player){ player.air=100; player.swim=false; player.wet=false; player.headWet=false; }
  if(L.flood) FLOOD={y:L.flood.y*T, y0:L.flood.y*T, rate:L.flood.rate, top:L.flood.top*T, on:!L.flood.wait, x0:(L.flood.x0||0)*T, x1:(L.flood.x1||COLS)*T};
  if(L.levers) LEVERS=L.levers.map(v=>({...v,on:false,near:false}));
  if(L.escort){ const tx=L.escort.x; ESC={x:tx*T+3,y:groundY(tx)-24,w:10,h:24,vx:0,vy:0,hp:100,max:100,face:-1,onGround:false,anim:0,state:'idle',esc:true,bt:5,hurtT:0,dropThrough:0}; scientists.push(ESC); }
  if(L.flips) FLIPS=L.flips.map(([tx,ty])=>({x:tx*T+8,y:ty*T+8,t:0,armed:true}));
  if(L.shifters) SHIFT=L.shifters.map(s=>({...s,st:-1}));
  if(L.ghosts) for(let i=0;i<L.ghosts;i++) addGhost(true);
  if(L.buildB) r2BuildEras();
  if(L.gens) GENS=L.gens.map(([tx,row])=>({x:tx*T-6,y:(row+1)*T-22,w:28,h:22,hp:100,max:100,hitT:0}));
  mechLoad();
}
function r2SetCp(){ cpFlip=FLIP; cpEra=ERA; r2T.cpRow=null; }
function setCpR(tx,row){ setCp(tx); r2T.cpRow=row; }
function r2PreRespawn(){ if(FLIPS.length&&FLIP!==cpFlip) flipWorld(true); if(ERAD&&ERA!==cpEra) switchEra(true); }
function r2Respawn(){
  mechRespawn();
  const p=player; p.air=100; p.swim=false; if(r2T.cpRow!=null){ p.y=r2T.cpRow*T-p.h-0.01; p.vy=0; }
  if(FLOOD){ const g=groundY(cp); FLOOD.y=Math.max(FLOOD.y,Math.min(FLOOD.y0,g+3*T)); }
  if(CHASE&&!CHASE.done) CHASE.x=Math.min(CHASE.x,p.x-LVL.chase.lead*T);
  if(ESC){ ESC.hp=ESC.max; ESC.state='follow'; ESC.x=p.x-p.face*16; ESC.y=p.y+p.h-ESC.h; ESC.vx=ESC.vy=0; }
  for(const a of ALLIES){ a.x=p.x; a.y=p.y-30; }
  if(GENS.length&&LVL.arena&&LVL.arena.type==='breach') for(const g of GENS){ g.hp=g.max; }
  GWIND=0;
}
function r2ExitOk(){
  if(!mech3ExitOk()) return false;
  if(ESC&&ESC.state!=='dead'&&Math.abs(ESC.x-player.x)>5*T){ if(!r2T.wait||lvT-r2T.wait>3){ r2T.wait=lvT; showMsg('Изчакай '+LVL.escort.acc+'!',2); } return false; }
  return true;
}

/* ---------- water & swimming ---------- */
function isWater(x,y){ const c=tileP(x,y); if(c==='w') return true; if(FLOOD&&y>FLOOD.y&&x>=FLOOD.x0&&x<FLOOD.x1&&!solidAt(x,y)) return true; return false; }
function r2Move(p,dt,dir,U,Dn){
  if(!SEQ) return false;
  if(p.leapT>0){ p.leapT-=dt; p.swim=false; return false; }
  const cx=p.x+p.w/2, wet=isWater(cx,p.y+p.h*0.8), zg=!!LVL.zeroG||inZG(p);
  p.wet=wet; p.headWet=wet&&isWater(cx,p.y+4);
  if((!wet&&!zg)||p.climb){ if(p.swim){ p.swim=false; } return false; }
  if(!p.swim){ p.swim=true; if(p.crouch){ p.crouch=false; p.y-=12; p.h=26; } if(wet&&p.vy>140){ for(let i=0;i<12;i++) part(cx+rnd(-8,8),p.y+p.h*0.5,rnd(-60,60),rnd(-120,-40),0.5,'#bfe8ff',1.5,400); SFX.land(); } }
  const acc=zg?320:560, max=zg?135:100, vmax=zg?135:150, drag=zg?0.55:3.0;
  const ay=(Dn?1:0)-(U?1:0);
  if(dir){ p.vx+=dir*acc*dt; p.face=dir; }
  if(ay) p.vy+=ay*acc*dt;
  else if(wet&&!zg){ const nearSurf=!isWater(cx,p.y-12); if(p.headWet&&nearSurf) p.vy+=(-45-p.vy)*Math.min(1,dt*3); else if(!p.headWet) p.vy*=Math.pow(0.02,dt); else p.vy*=Math.pow(0.15,dt); }
  if(pressed.jump){
    if(wet&&!zg&&!isWater(cx,p.y-8)){ p.vy=JUMP*0.95; p.swim=false; p.leapT=0.45; p.vx+=dir*40; SFX.jump(); for(let i=0;i<8;i++) part(cx+rnd(-6,6),p.y+p.h*0.5,rnd(-50,50),rnd(-100,-30),0.4,'#bfe8ff',1.5,400); }
    else if(zg){ const ix=dir||0, iy=ay||(dir?0:-1); p.vx+=ix*110; p.vy+=iy*110; for(let i=0;i<6;i++) part(cx-ix*6,p.y+p.h/2-iy*6,-ix*80+rnd(-20,20),-iy*80+rnd(-20,20),0.4,'#9fe8ff',1.5,0); SFX.jump(); }
    else { p.vy=Math.min(p.vy,-185); p.anim+=1; }
  }
  if(p.swim){
    p.vx-=p.vx*Math.min(1,drag*dt); p.vy-=p.vy*Math.min(1,(zg?drag:drag*0.6)*dt);
    p.vx=clamp(p.vx,-max,max); p.vy=clamp(p.vy,-vmax*(zg?1:1.4),vmax);
  }
  moveX(p,p.vx*dt); moveY(p,p.vy*dt);
  if(zg){ p.onGround=false; }
  if(Math.abs(p.vx)+Math.abs(p.vy)>20) p.anim+=dt*8;
  p.coyote=0;
  return true;
}
function r2Wind(p,dt){
  if(!SEQ) return;
  if(LVL.winds) for(const w of LVL.winds){ const cx=p.x+p.w/2, cy=p.y+p.h/2; if(cx>w[0]*T&&cx<(w[2]+1)*T&&cy>w[1]*T&&cy<(w[3]+1)*T){ p.vx+=w[4]*dt; p.vy+=w[5]*dt; if(w[5]<0){ p.vy=Math.max(p.vy,-300); p.onGround=false; p.padT=0.2; } } }
  if(GWIND) p.vx+=GWIND*(p.onGround?0.55:1)*dt;
}

/* ---------- eras (time switch) ---------- */
function r2BuildEras(){
  const L=LVL, mapA=map, mB=[]; for(let y=0;y<ROWS;y++) mB.push(new Array(COLS).fill('.'));
  const F=(x0,y0,x1,y1,c)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(x>=0&&x<COLS&&y>=0&&y<ROWS)mB[y][x]=c;};
  L.buildB(F,COLS);
  const cA=LV, dA={lamps,beacons,crystals,zTiles,convTiles}, thA=L.theme, decoA=L.deco, skyA=SKY, skyDefA=L.sky;
  const cB=document.createElement('canvas'); LV=cB; map=mB; L.theme=L.themeB; L.deco=L.decoB||(()=>{});
  prerender(); const dB={lamps,beacons,crystals,zTiles,convTiles};
  let skyB=skyA; if(L.skyB){ L.sky=L.skyB; buildSky(); skyB=SKY; L.sky=skyDefA; SKY=skyA; }
  L.theme=thA; L.deco=decoA; LV=cA; lx=LV.getContext('2d'); map=mapA; lamps=dA.lamps; beacons=dA.beacons; crystals=dA.crystals; zTiles=dA.zTiles; convTiles=dA.convTiles;
  const eB=[]; for(const [t,tx,row,flag] of (L.spawnsB||[])){ if(!allow(flag)) continue; if(DIMS[t]){ const e=makeEnemy(t,tx*T+8,(row+1)*T); e.era=1; if(t==='turret') e.face=-1; eB.push(e); } }
  ERAD={maps:[mapA,mB],cv:[cA,cB],data:[dA,dB],themes:[thA,L.themeB],skies:[skyA,skyB],enem:[enemies,eB]};
}
function switchEra(force){
  if(!ERAD) return false; const p=player, ne=1-ERA, cur=map;
  map=ERAD.maps[ne]; const blocked=rectSolid(p.x,p.y,p.w,p.h); map=cur;
  if(blocked&&!force){ SFX.beep(); if(!r2T.eb||lvT-r2T.eb>1.5){ r2T.eb=lvT; showMsg('Не може — в другата епоха тук има стена.',1.6); } return false; }
  ERAD.enem[ERA]=enemies;
  ERA=ne; map=ERAD.maps[ne]; LV=ERAD.cv[ne]; lx=LV.getContext('2d'); const d=ERAD.data[ne]; lamps=d.lamps; beacons=d.beacons; crystals=d.crystals; zTiles=d.zTiles; convTiles=d.convTiles;
  LVL.theme=ERAD.themes[ne]; SKY=ERAD.skies[ne]; enemies=ERAD.enem[ne];
  if(!force){ flash=0.75; flashCol=ne?'#d8f4ff':'#ffe2b0'; SFX.portal&&SFX.portal(0.7); for(let i=0;i<24;i++){ const a=rnd(6.28); part(p.x+p.w/2,p.y+p.h/2,Math.cos(a)*rnd(40,160),Math.sin(a)*rnd(40,160),0.6,ne?'#bfe8ff':'#ffd08a',2,0,0); } }
  if(blocked){ for(let k=0;k<6&&rectSolid(p.x,p.y,p.w,p.h);k++) p.y-=T; }
  return true;
}

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

/* ---------- ghosts (allies) ---------- */
function addGhost(silent){ const p=player; ALLIES.push({x:p?p.x:0,y:p?p.y-30:0,i:ALLIES.length,cd:1.2+ALLIES.length*0.4,t:rnd(6)}); if(!silent&&p) for(let i=0;i<20;i++) part(p.x+rnd(-20,20),p.y+rnd(-30,10),rnd(-20,20),rnd(-40,-10),0.9,'#bfe8ff',2,-20); }
function updAllies(dt){
  const p=player;
  for(const a of ALLIES){ a.t+=dt; a.cd-=dt;
    const side=a.i%2?1:-1, tx=p.x+p.w/2+side*(22+a.i*10)-p.face*8, ty=p.y-14-(a.i>>1)*10+Math.sin(a.t*2+a.i)*5;
    a.x+=(tx-a.x)*Math.min(1,dt*3); a.y+=(ty-a.y)*Math.min(1,dt*3);
    if(a.cd<=0&&!p.dead){ let best=null,bd=230; for(const e of enemies){ if(e.dead||e.type==='target') continue; const ex=e.x+e.w/2, ey=e.y+e.h/2, d=Math.hypot(ex-a.x,ey-a.y); if(d<bd&&los(a.x,a.y,ex,ey)){ bd=d; best=e; } }
      let bt=null; if(!best&&boss&&!boss.dead&&bossActive){ const bx=boss.x+boss.w/2, by=boss.y+boss.h/2; if(Math.hypot(bx-a.x,by-a.y)<260) bt=[bx,by]; }
      if(best){ hurtEnemy(best,12,0,true); tracers.push({x0:a.x,y0:a.y,x1:best.x+best.w/2,y1:best.y+best.h/2,life:0.08,col:'150,230,255'}); a.cd=1.5*D.rate+rnd(0.4); sparks(best.x+best.w/2,best.y+best.h/2,4,'#bfe8ff'); }
      else if(bt){ hurtBoss(8); tracers.push({x0:a.x,y0:a.y,x1:bt[0],y1:bt[1],life:0.08,col:'150,230,255'}); a.cd=1.8*D.rate; }
      else a.cd=0.3; }
  }
}
function drawAllies(){
  for(const a of ALLIES){ const x=Math.round(a.x-cam), y=Math.round(a.y); if(x<-30||x>W+30) continue;
    ctx.save(); ctx.globalAlpha=0.55+Math.sin(a.t*3)*0.1; ctx.globalCompositeOperation='lighter';
    const g=ctx.createRadialGradient(x,y,0,x,y,16); g.addColorStop(0,'rgba(170,230,255,0.55)'); g.addColorStop(1,'rgba(120,200,255,0)'); ctx.fillStyle=g; ctx.fillRect(x-16,y-16,32,32);
    ctx.fillStyle='#cfefff'; ctx.fillRect(x-3,y-9,6,6); ctx.fillRect(x-4,y-3,8,9); for(let i=0;i<4;i++) ctx.fillRect(x-4+i*2,y+6,1,2+((i+Math.floor(a.t*6))%3));
    ctx.fillStyle='#1a3a5a'; ctx.fillRect(x-2,y-7,1,1); ctx.fillRect(x+1,y-7,1,1); ctx.restore(); }
}

/* ---------- escort ---------- */
function updEscort(s,dt){
  const p=player; s.anim+=dt*10; s.hurtT-=dt; s.bt-=dt;
  if(s.state==='dead'){ s.vx*=0.9; physics(s,dt); return; }
  if(s.state==='idle'){ s.vx=0; physics(s,dt); if(Math.abs(p.x-s.x)<90&&!p.dead){ s.state='follow'; bark(s,LVL.escort.hello,3); } return; }
  const dx=(p.x+p.w/2-p.face*20)-(s.x+s.w/2); let want=Math.abs(dx)>16?sgn(dx):0;
  if(want&&s.onGround){ const fx=want>0?s.x+s.w+3:s.x-3, ftx=Math.floor(fx/T), fty=Math.floor((s.y+s.h+2)/T); let drop=0, haz=false;
    for(let ty=fty;ty<ROWS;ty++){ const c=tileAt(ftx,ty); if(c==='~'||c==='Z'){ haz=true; break; } if(SOLID.has(c)||c==='-'||c==='H') break; drop++; if(ty===ROWS-1) haz=true; }
    if(haz||(drop>3&&p.y+p.h<s.y+s.h+T)) want=0; }
  s.vx=want*(Math.abs(dx)>90?110:88); if(want) s.face=want;
  if(want&&s.onGround&&wallAhead(s,want)) s.vy=-345;
  const ox=s.x; physics(s,dt);
  if(want&&Math.abs(s.x-ox)<0.3) s.stuck=(s.stuck||0)+dt; else s.stuck=0;
  if(s.stuck>2.2&&p.onGround&&!p.dead&&!p.swim){ s.stuck=0; s.x=p.x-p.face*14; s.y=p.y+p.h-s.h; s.vx=s.vy=0; if(rectSolid(s.x,s.y,s.w,s.h)) s.x=p.x; for(let i=0;i<10;i++) part(s.x+5,s.y+rnd(24),rnd(-30,30),rnd(-30,10),0.4,'#e8e0c8',1.5,0); }
  const far=Math.abs(p.x-s.x);
  if((far>12*T||s.y>ROWS*T)&&p.onGround&&!p.dead&&!p.swim&&(Math.abs(s.x+s.w/2-cam-W/2)>W/2+10||s.y>ROWS*T)){ s.x=p.x-p.face*16; s.y=p.y+p.h-s.h; s.vx=0; s.vy=0; if(rectSolid(s.x,s.y,s.w,s.h)) s.x=p.x; }
  if(rectHas(s.x,s.y+s.h-6,s.w,6,'~')) escHurt(dt*30);
  if(s.onGround&&elecOn()&&onTile(s,'Z')) escHurt(dt*40);
  for(const b of ebullets) if(b.life>0&&b.x>s.x&&b.x<s.x+s.w&&b.y>s.y&&b.y<s.y+s.h){ b.life=0; escHurt((b.dmg||7)*0.8); }
  for(const e of enemies){ if(e.dead||e.type==='target'||e.type==='crab') continue; if(ov(e,s)){ e.escBite=(e.escBite||0)-dt; if(e.escBite<=0){ e.escBite=0.9; escHurt(8); } } }
  if(s.bt<=0&&!want&&LVL.escort.lines){ s.bt=rnd(9,15); bark(s,LVL.escort.lines[Math.floor(rnd(LVL.escort.lines.length))],2.6); }
}
function escHurt(d){ const s=ESC; if(!s||s.state==='dead'||player.dead) return; s.hp-=d*[0.45,1,1.35][DI]; s.hurtT=0.15; if(s.hp<=0){ s.hp=0; s.state='dead'; blood(s.x+5,s.y+8,false,16); showMsg(LVL.escort.name+' загина! Опитай отново.',3); die(); } }
function drawEscort(s){
  begin(s); if(s.hurtT>0) tint='#ffffff';
  if(s.state==='dead'){ ctx.rotate(-Math.PI/2); }
  const w=s.onGround&&Math.abs(s.vx)>10?Math.round(Math.sin(s.anim)*2):0;
  px(-4+w,-9,3,9,'#3a3226'); px(1-w,-9,3,9,'#3a3226'); px(-4+w,-1,4,1,'#1a1612'); px(1-w,-1,4,1,'#1a1612');
  px(-5,-19,10,11,'#5a4a3a'); px(-5,-19,10,2,'#6e5c48'); px(-1,-17,2,6,'#3a2e22');
  px(-4,-24,8,6,'#e2b48f'); px(-5,-26,10,3,'#2e2e30'); px(-6,-24,12,1,'#2e2e30'); px(1,-22,2,1,'#3a2a1a'); px(-3,-20,6,1,'#cfcfcf');
  px(5,-14,1,13,'#6a4a2a'); px(4,-15,3,1,'#6a4a2a');
  tint=null; ctx.restore();
}

/* ---------- misc objects ---------- */
function drainRegion(x0,y0,x1,y1){ DRAINS.push({x0,y0,x1,y1,t:0}); }
function updDrains(dt){ for(const d of DRAINS){ d.t-=dt; if(d.t>0) continue; d.t=0.09; let done=true; for(let y=d.y0;y<=d.y1;y++){ let any=false; for(let x=d.x0;x<=d.x1;x++) if(map[y]&&map[y][x]==='w'){ map[y][x]='.'; any=true; } if(any){ done=false; break; } } if(done) d.done=true; } DRAINS=DRAINS.filter(d=>!d.done); }
function updShifters(){
  const p=player;
  for(const s of SHIFT){ let ph; if(s.beat){ const u=((lvT/s.per)+(s.off||0))%1, d=s.duty||0.75; ph=u<d?0:1; s.left=(ph?1-u:d-u)*s.per; } else { const half=s.per/2; ph=Math.floor((lvT+(s.off||0)*s.per)/half)%2; s.left=half-((lvT+(s.off||0)*s.per)%half); }
    if(ph===s.st) continue;
    const add=ph?s.b:s.a, rem=ph?s.a:s.b;
    if(s.st>=0){ let blk=false; for(const [x0,y0,x1,y1] of add) if(ov(p,{x:x0*T,y:y0*T,w:(x1-x0+1)*T,h:(y1-y0+1)*T})) blk=true; if(blk) continue; }
    s.st=ph; let xa=1e9,xb=-1;
    for(const [x0,y0,x1,y1] of rem){ for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++) map[y][x]='.'; xa=Math.min(xa,x0); xb=Math.max(xb,x1); }
    for(const [x0,y0,x1,y1,c] of add){ for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++) map[y][x]=c||'#'; xa=Math.min(xa,x0); xb=Math.max(xb,x1);
      for(const e of enemies) if(!e.dead&&ov(e,{x:x0*T,y:y0*T,w:(x1-x0+1)*T,h:(y1-y0+1)*T})) hurtEnemy(e,999,0); }
    if(xb>=0) redrawCols(xa,xb);
    if(!s.beat&&Math.abs(xa*T-p.x)<400){ SFX.door(); shake=Math.max(shake,3); }
    else if(s.beat&&Math.abs(xa*T-p.x)<300&&AC&&ph===0) osc({type:'sine',f:220,t:0.08,v:0.05});
  }
}

/* ---------- per-frame update ---------- */
function r2Update(dt){
  if(!SEQ) return;
  const p=player;
  // air
  if(!p.dead){
    if(p.headWet){ p.air-=dt*100/[22,15,11][DI]; if(p.air<30&&!airWarned){ airWarned=true; showMsg('Въздухът свършва — изплувай или намери мехурчета!',2.5); }
      if(p.air<=0){ p.air=0; p.drownT=(p.drownT||0)-dt; if(p.drownT<=0){ p.drownT=0.6; hurtPlayer(7,0,true); } }
      if(Math.random()<dt*2.5) part(p.x+p.w/2+p.face*4,p.y+6,rnd(-6,6),rnd(-40,-25),1.2,'#cfefff',1.5,-10); }
    else { if(p.air<100) p.air=Math.min(100,p.air+dt*60); if(p.air>60) airWarned=false; }
  }
  // flood
  if(FLOOD&&FLOOD.on){ const far=FLOOD.y-(p.y+p.h)>8*T; FLOOD.y=Math.max(FLOOD.top,FLOOD.y-FLOOD.rate*[0.7,1,1.25][DI]*(far?1.8:1)*dt); if(Math.random()<dt*0.5) sfxAt('steam',{x:p.x,y:FLOOD.y,w:0}); }
  if(FLOOD&&FLOOD.drain){ FLOOD.y=Math.min(FLOOD.y0,FLOOD.y+70*dt); if(FLOOD.y>=FLOOD.y0) FLOOD.drain=false; }
  if(LVL.flood&&LVL.flood.wait&&FLOOD&&!FLOOD.on&&!FLOOD.drain&&FLOOD.y>=FLOOD.y0&&p.x>LVL.flood.wait*T&&!r2T.floodDone){ FLOOD.on=true; r2T.floodDone=true; shake=8; showMsg(LVL.flood.msg||'Водата нахлува!',2.5); }
  // levers
  for(const v of LEVERS){ const r={x:v.x*T,y:v.y*T-24,w:16,h:24}; v.near=ov(p,r); if(v.near&&!v.on&&pressed.up&&!p.dead){ v.on=true; SFX.armor(); shake=3; if(v.fn) v.fn(v); } }
  updDrains(dt);
  // eras
  eraCd-=dt; if(pressed.era&&ERAD&&!p.dead&&eraCd<=0&&!mech5Near()){ if(switchEra()) eraCd=0.45; }
  mechUpdate(dt);
  // flips
  flipCd-=dt;
  for(const f of FLIPS){ f.t+=dt; const d=Math.hypot(p.x+p.w/2-f.x,p.y+p.h/2-f.y); if(d>26) f.armed=true; if(d<14&&f.armed&&flipCd<=0&&!p.dead){ f.armed=false; flipCd=0.6; flipWorld(); for(const g of FLIPS) if(Math.hypot(p.x+p.w/2-g.x,p.y+p.h/2-g.y)<26) g.armed=false; } }
  // shifting halls
  updShifters();
  // chase
  const C=LVL.chase;
  if(C&&!CHASE&&p.x>C.start*T){ CHASE={x:p.x-C.lead*T,done:false}; shake=10; showMsg(C.msg||'Лавина! Бягай!',2.5); SFX.cascade&&SFX.cascade(); }
  if(CHASE&&!CHASE.done){ CHASE.x+=C.speed*[0.82,1,1.12][DI]*dt; if(p.x-CHASE.x>C.lead*T+6*T) CHASE.x=p.x-(C.lead+6)*T;
    shake=Math.max(shake,clamp(6-(p.x-CHASE.x)/(3*T),0,5));
    if(!p.dead&&p.x<CHASE.x+4){ die(); showMsg(C.die||'Лавината те затрупа!',2.5); }
    for(const e of enemies) if(!e.dead&&e.x<CHASE.x) hurtEnemy(e,999,0,true);
    if(p.x>C.end*T){ CHASE.done=true; shake=12; showMsg(C.safe||'Спаси се!',2); } }
  // sun flares
  if(LVL.sun){ const s=LVL.sun, t=lvT%s.per, flare=t>s.per-s.dur, warn=!flare&&t>s.per-s.dur-s.warn; r2T.flare=flare; r2T.warn=warn;
    if(warn&&!sunWarned){ sunWarned=true; showMsg('Слънчев изблик! Скрий се на сянка!',2.2); }
    if(flare&&!p.dead&&!shaded(p)){ p.sunT=(p.sunT||0)-dt; if(p.sunT<=0){ p.sunT=0.32; hurtPlayer(6,0,true); for(let i=0;i<4;i++) part(p.x+rnd(p.w),p.y+rnd(p.h),rnd(-10,10),rnd(-50,-20),0.5,'#ffb04a',1.5,-20); } } }
  // wind particles
  if(LVL.winds) for(const w of LVL.winds){ const x0=w[0]*T, x1=(w[2]+1)*T; if(x1<cam-20||x0>cam+W+20) continue; if(Math.random()<dt*((x1-x0)/T)*(w[3]-w[1]+1)*0.35){ const px_=rnd(x0,x1), py=rnd(w[1]*T,(w[3]+1)*T); part(px_,py,w[4]*0.25,w[5]*0.25,rnd(0.5,0.9),'rgba(220,240,255,0.7)',1,0,0); } }
  if(GWIND&&Math.random()<dt*30) part(cam+(GWIND>0?-4:W+4),rnd(20,H-40),GWIND*0.5,rnd(-10,10),rnd(1,1.6),'rgba(220,240,255,0.6)',1,0,0);
  updAllies(dt);
  // generators
  for(const g of GENS){ g.hitT-=dt; if(g.hp>0&&g.hp<g.max&&g.hitT<-2) g.hp=Math.min(g.max,g.hp+dt*2); }
}
function shaded(p){ const cx=Math.floor((p.x+p.w/2)/T); for(let ty=Math.floor(p.y/T)-1;ty>=0;ty--){ const c=tileAt(cx,ty); if(SOLID.has(c)||c==='-') return true; } return false; }

/* ---------- drawing ---------- */
function r2DrawBack(){
  if(!SEQ) return;
  mechDrawBack();
  for(const v of LEVERS){ const x=Math.round(v.x*T-cam), y=v.y*T; if(x<-20||x>W+20) continue;
    px(x+3,y-14,10,14,'#3a4248'); px(x+3,y-14,10,1,'#5a646c'); px(x+5,y-12,6,3,v.on?'#3dff7a':(Math.floor(titleT*3)%2?'#ff3b2e':'#5a1a14'));
    ctx.save(); ctx.translate(x+8,y-7); ctx.rotate(v.on?0.7:-0.7); px(-1,-12,2,12,'#9aa2a7'); px(-2,-14,4,3,'#c94a2a'); ctx.restore();
    if(v.near&&!v.on){ ctx.font='600 7px "IBM Plex Mono",monospace'; ctx.textAlign='center'; ctx.fillStyle=ACC(); ctx.fillText('↑ '+(v.label||'дръпни'),x+8,y-30+Math.sin(titleT*5)*1.5); ctx.textAlign='left'; } }
  for(const g of GENS){ const x=Math.round(g.x-cam), y=Math.round(g.y); if(x<-40||x>W+40) continue; const dead=g.hp<=0;
    px(x,y+6,28,16,dead?'#2a2a2a':'#3a4a52'); px(x,y+6,28,2,dead?'#3a3a3a':'#6a8a96'); px(x+4,y,20,7,dead?'#222':'#2a363c');
    if(!dead){ const a=(Math.sin(titleT*8+g.x)+1)/2; px(x+6,y+10,16,8,`rgba(80,${180+a*70},255,0.9)`); px(x+6,y+2,16,2,'#bfe8ff'); px(x+2,y-4,24,3,'rgba(0,0,0,0.5)'); px(x+2,y-4,24*g.hp/g.max,3,g.hp<35?'#ff4d3a':'#4fe3d6'); }
    else if(Math.random()<0.2) part(g.x+14,g.y,rnd(-5,5),-25,0.8,'#444',3,-10,2); }
}
function r2DrawWorld(){
  if(!SEQ) return;
  if(LVL.winds){ ctx.save(); ctx.globalCompositeOperation='lighter'; for(const w of LVL.winds){ if(w[5]>=0) continue; const x0=w[0]*T-cam, x1=(w[2]+1)*T-cam, y0=w[1]*T, y1=(w[3]+1)*T; if(x1<-10||x0>W+10) continue;
    const g=ctx.createLinearGradient(0,y1,0,y0); g.addColorStop(0,'rgba(150,230,255,0.10)'); g.addColorStop(1,'rgba(150,230,255,0.02)'); ctx.fillStyle=g; ctx.fillRect(x0,y0,x1-x0,y1-y0);
    ctx.fillStyle='rgba(200,245,255,0.18)'; for(let i=0;i<Math.max(2,(x1-x0)/12);i++){ const sx=x0+((i*37)%Math.max(1,x1-x0-2)), len=14+(i%3)*6, sy=y1-((titleT*160+i*53)%(y1-y0+len)); ctx.fillRect(Math.round(sx),Math.round(sy),1,len); } } ctx.restore(); }
  // water overlay
  const c0=Math.max(0,Math.floor(cam/T)-1), c1=Math.min(COLS-1,Math.floor((cam+W)/T)+1);
  ctx.save();
  for(let tx=c0;tx<=c1;tx++) for(let ty=0;ty<ROWS;ty++){ if(map[ty][tx]!=='w') continue; const x=tx*T-cam, y=ty*T, top=ty===0||map[ty-1][tx]!=='w';
    { const P=TP(tx); ctx.fillStyle=top?(P.wTop||'rgba(40,150,200,0.38)'):(P.wDeep||'rgba(20,90,150,0.42)'); } ctx.fillRect(x,y,T,T);
    if(top){ const wv=Math.sin(titleT*3+tx*0.9)*1.5; ctx.fillStyle='rgba(190,240,255,0.55)'; ctx.fillRect(x,y+2+wv,T,1); } }
  if(FLOOD){ const y=FLOOD.y, x0=Math.max(FLOOD.x0-cam,0), x1=Math.min(FLOOD.x1-cam,W); if(y<H){ ctx.fillStyle='rgba(20,100,160,0.42)'; ctx.fillRect(x0,y,x1-x0,H-y); ctx.fillStyle='rgba(190,240,255,0.6)'; for(let x=Math.floor(x0);x<x1;x+=2) ctx.fillRect(x,Math.round(y+Math.sin(titleT*3+(x+cam)*0.12)*1.5),2,1); } }
  ctx.restore();
  // flip orbs
  for(const f of FLIPS){ const x=f.x-cam; if(x<-30||x>W+30) continue; const r=7+Math.sin(f.t*4)*1.5; const g=ctx.createRadialGradient(x,f.y,0,x,f.y,r*2.4); g.addColorStop(0,f.armed?'rgba(230,210,255,0.95)':'rgba(140,120,170,0.6)'); g.addColorStop(0.4,f.armed?'rgba(170,110,255,0.6)':'rgba(90,70,120,0.4)'); g.addColorStop(1,'rgba(120,60,220,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,f.y,r*2.4,0,7); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.8)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x,f.y-5); ctx.lineTo(x-3,f.y-2); ctx.moveTo(x,f.y-5); ctx.lineTo(x+3,f.y-2); ctx.moveTo(x,f.y+5); ctx.lineTo(x-3,f.y+2); ctx.moveTo(x,f.y+5); ctx.lineTo(x+3,f.y+2); ctx.moveTo(x,f.y-5); ctx.lineTo(x,f.y+5); ctx.stroke(); }
  // shifter warnings
  for(const s of SHIFT){ if(s.left>0.9||s.st<0) continue; const add=s.st?s.a:s.b; const a=(Math.sin(titleT*20)+1)/2; ctx.strokeStyle=`rgba(255,90,60,${0.4+a*0.5})`; ctx.lineWidth=1;
    for(const [x0,y0,x1,y1] of add){ ctx.strokeRect(x0*T-cam+0.5,y0*T+0.5,(x1-x0+1)*T-1,(y1-y0+1)*T-1); ctx.fillStyle=`rgba(255,90,60,${0.08+a*0.1})`; ctx.fillRect(x0*T-cam,y0*T,(x1-x0+1)*T,(y1-y0+1)*T); } }
  // chase wall
  mechDrawWorld();
  if(CHASE&&!CHASE.done&&LVL.chase.kind==='train') drawTrainChase();
  else if(CHASE&&!CHASE.done&&LVL.chase.draw) LVL.chase.draw(CHASE.x-cam);   // собствен вид на гонитбата (напр. Р7)
  else if(CHASE&&!CHASE.done){ const fx=CHASE.x-cam; if(fx>-40){ ctx.fillStyle='#e8f0f6'; ctx.beginPath(); ctx.moveTo(fx-600,0); for(let y=0;y<=H;y+=8) ctx.lineTo(fx+Math.sin(y*0.09+titleT*7)*7+Math.sin(y*0.031+titleT*3)*10,y); ctx.lineTo(fx-600,H); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#bfd0dc'; for(let i=0;i<10;i++){ const y=(i*37+titleT*90)%H; ctx.fillRect(fx-30-((i*53)%80),y,10+(i%3)*6,6); }
      if(Math.random()<0.8) part(CHASE.x+rnd(-4,10),rnd(H),rnd(40,160),rnd(-60,30),rnd(0.4,0.9),Math.random()<0.6?'#ffffff':'#cfdde8',rnd(2,4),200); } }
  drawAllies();
}
function r2Lights(L){
  if(!SEQ) return;
  mechLights(L);
  for(const g of GENS) if(g.hp>0) L.push([g.x+14,g.y+10,60,0.7]);
  for(const f of FLIPS) L.push([f.x,f.y,60,0.8]);
  for(const a of ALLIES) L.push([a.x,a.y,56,0.7]);
  for(const e of enemies) if(!e.dead&&(e.type==='jelly'||e.type==='drone')) L.push([e.x+e.w/2,e.y+e.h/2,40,0.6]);
  if(FLOOD&&FLOOD.y<H) L.push([player.x,FLOOD.y,60,0.3]);
}
function r2PostFx(){
  if(!SEQ) return;
  const p=player;
  if(p&&p.headWet){ ctx.fillStyle='rgba(10,70,110,0.28)'; ctx.fillRect(0,0,W,H); }
  if(LVL.sun){ if(r2T.flare){ ctx.fillStyle='rgba(255,236,190,0.30)'; ctx.fillRect(0,0,W,H); } else if(r2T.warn){ const a=(Math.sin(titleT*14)+1)/2; ctx.fillStyle=`rgba(255,150,40,${0.06+a*0.1})`; ctx.fillRect(0,0,W,H); } }
  mech2PostFx();
  if(GAME.postFx) GAME.postFx();   // цветова обработка на конкретната игра
}

/* ---------- HUD ---------- */
const R2BAR=(x,y,w,v,max,col,bg='rgba(0,0,0,0.55)')=>{ ctx.fillStyle=bg; ctx.fillRect(x-1,y-1,w+2,6); const n=10, cw=(w-(n-1))/n, f=clamp(v/max,0,1)*n; for(let i=0;i<n;i++){ const k=clamp(f-i,0,1); ctx.fillStyle='rgba(255,255,255,0.08)'; ctx.fillRect(x+i*(cw+1),y,cw,4); if(k>0){ ctx.fillStyle=col; ctx.fillRect(x+i*(cw+1),y,cw*k,4); } } };
function drawHUD2(){
  const p=player, A=ACC();
  ctx.save(); ctx.textBaseline='alphabetic';
  // health / armor / air
  ctx.fillStyle='rgba(4,14,18,0.55)'; ctx.fillRect(6,236,118,30); ctx.fillStyle=A; ctx.fillRect(6,236,2,30);
  ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='rgba(200,240,240,0.7)'; ctx.fillText('ЗДРАВЕ',13,244); ctx.fillText('БРОНЯ',13,258);
  ctx.font='10px '+DFONT(); ctx.fillStyle=p.hp<=25?'#ff4d3a':'#e8fbff'; ctx.textAlign='right'; ctx.fillText(String(Math.ceil(p.hp)),118,247); ctx.fillStyle='#bfe8ff'; ctx.fillText(String(Math.ceil(p.armor)),118,261); ctx.textAlign='left';
  R2BAR(46,240,52,p.hp,100,p.hp<=25?'#ff4d3a':A); R2BAR(46,254,52,p.armor,100,'#5aa8ff');
  if((p.air!==undefined&&p.air<100)||p.headWet){ ctx.fillStyle='rgba(4,14,18,0.55)'; ctx.fillRect(6,222,118,12); ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle=p.air<30?'#ff6a5a':'#bfe8ff'; ctx.fillText('ВЪЗДУХ',13,230); R2BAR(46,226,72,p.air,100,p.air<30?'#ff6a5a':'#9fe8ff'); }
  // weapon
  ctx.fillStyle='rgba(4,14,18,0.55)'; ctx.fillRect(W-112,236,106,30); ctx.fillStyle=A; ctx.fillRect(W-8,236,2,30);
  ctx.textAlign='right'; ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='rgba(200,240,240,0.7)'; ctx.fillText(p.reload>0?'ПРЕЗАРЕЖДАНЕ…':NAMES[p.cur],W-13,244);
  ctx.font='12px '+DFONT(); ctx.fillStyle='#e8fbff';
  if(p.cur==='grenade'||p.cur==='rocket') ctx.fillText('× '+p.ammo[p.cur].mag,W-13,261);
  else if(p.cur!=='wrench'){ const a=p.ammo[p.cur]; ctx.font='8px '+DFONT(); ctx.fillStyle='#7fb8bc'; const rs=String(a.res); ctx.fillText(rs,W-13,261); const rw=ctx.measureText(rs).width; ctx.font='12px '+DFONT(); ctx.fillStyle=a.mag===0?'#ff4d3a':'#e8fbff'; ctx.fillText(a.mag+' /',W-16-rw,261); }
  else ctx.fillText('—',W-13,261);
  ctx.textAlign='left';
  // status chips (top-left)
  let cy=8; const chip=(t,col)=>{ ctx.font='600 6px "IBM Plex Mono",monospace'; const w=ctx.measureText(t).width+10; ctx.fillStyle='rgba(4,14,18,0.6)'; ctx.fillRect(6,cy,w,10); ctx.fillStyle=col; ctx.fillRect(6,cy,2,10); ctx.fillText(t,11,cy+7); cy+=12; };
  if(ERAD) chip('◷ '+LVL.eraNames[ERA]+'   ·   E — смени епохата','#ffd08a');
  if(FLIPS.length) chip(FLIP?'⇅ ГРАВИТАЦИЯТА Е ОБЪРНАТА':'⇅ НОРМАЛНА ГРАВИТАЦИЯ','#d8c4ff');
  if(LVL.zeroG||inZG(p)) chip('◌ БЕЗТЕГЛОВНОСТ · X — тласък','#9fe8ff');
  if(LVL.sun) chip(r2T.flare?'☼ ИЗБЛИК — СТОЙ НА СЯНКА!':r2T.warn?'☼ ИДВА ИЗБЛИК…':'☼ слънцето е спокойно',r2T.flare||r2T.warn?'#ffb04a':'#c8b890');
  if(ESC){ chip(LVL.escort.name.toUpperCase(),'#ffd08a'); R2BAR(8,cy-1,60,ESC.hp,ESC.max,'#ffd08a'); cy+=7; }
  if(GENS.length){ GENS.forEach((g,i)=>{ ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='rgba(200,240,240,0.7)'; ctx.fillText('ГЕН. '+(i+1),8,cy+5); R2BAR(36,cy+1,40,Math.max(0,g.hp),g.max,g.hp<35?'#ff4d3a':A); cy+=9; }); }
  mechChips(chip);
  if(muted){ ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='#7f8e97'; ctx.fillText('БЕЗ ЗВУК (M)',8,cy+6); }
  // boss bar
  if(bossActive&&boss&&!boss.dead&&boss.state!=='intro'){ const bw=200,bx=(W-bw)/2; ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(bx-1,15,bw+2,6); ctx.fillStyle=R2B.col[boss.type]||A; ctx.fillRect(bx,16,bw*clamp(boss.hp/boss.max,0,1),4);
    ctx.font='600 7px "IBM Plex Mono",monospace'; ctx.textAlign='center'; ctx.fillStyle='#e8fbff'; ctx.fillText(R2B.name[boss.type]||'',W/2,12); ctx.textAlign='left'; }
  // message
  if(msg){ const a=clamp(Math.min(msg.age*4,(msg.d-msg.age)*2),0,1); ctx.globalAlpha=a; ctx.font='600 9px "IBM Plex Mono",monospace';
    const lines=wrap(msg.t,360), lw=Math.max(...lines.map(l=>ctx.measureText(l).width)), who=msg.who, w=lw+20, h=lines.length*12+6+(who?10:0), y=bossActive?30:20, x=W/2-w/2;
    const wcol=who==='Д-Р ИЛИЕВА'?'#94ff57':'#7fd8ff'; ctx.fillStyle='rgba(4,14,18,0.82)'; ctx.fillRect(x,y,w,h); ctx.fillStyle=who?wcol:A; ctx.fillRect(x,y,2,h); ctx.fillRect(x+w-2,y,2,h);
    let ly=y+11; if(who){ ctx.font='600 7px "IBM Plex Mono",monospace'; ctx.fillStyle=wcol; ctx.fillText('◉ '+who,x+10,ly-1); ly+=10; ctx.font='600 9px "IBM Plex Mono",monospace'; }
    ctx.fillStyle='#eaf6f6'; for(const l of lines){ ctx.fillText(l,x+10,ly); ly+=12; } ctx.globalAlpha=1; }
  ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='rgba(200,240,240,0.5)'; ctx.textAlign='right'; ctx.fillText(SURV?(GAME.name+' · ОЦЕЛЯВАНЕ · СЕКТОР '+(survK+1)+' · '+D.name):LVL.training?(GAME.name+' · ТРЕНИРОВКА · '+D.name):(GAME.name+' · ГЛ. '+ROM[gChOf(LI)]+' · ЕП. '+LVL.n+' · '+D.name),W-6,9); ctx.textAlign='left';
  if(SURV){ ctx.font='600 7px "IBM Plex Mono",monospace'; ctx.textAlign='right'; ctx.fillStyle='#ff6a8a'; ctx.fillText('♥'.repeat(Math.max(0,survLives)),W-6,19); ctx.fillStyle=A; ctx.fillText('ТОЧКИ '+(survScore+stats.kills*10),W-6-survLives*8-6,19); ctx.textAlign='left'; }
  ctx.restore();
}

function renderEps2(){
  overlay(0.82); centerText('ИЗБЕРИ ЕПИЗОД',50,'15px '+DFONT(),ACC());
  const ch=gChOf(menuSel), c=GCH[ch];
  centerText((ch>0?'◀  ':'    ')+'ГЛАВА '+ROM[ch]+' · '+c.t+(ch<GCH.length-1&&GCH[ch+1].a<gUnl?'  ▶':'    '),74,'10px '+DFONT(),GAME.accent2);
  for(let i=c.a;i<=c.b;i++){ const l=GLV[i], r=i-c.a, y=96+r*18, on=i===menuSel, lock=i>=gUnl;
    if(on){ ctx.fillStyle=ACCA(0.12); ctx.fillRect(W/2-140,y-12,280,16); ctx.fillStyle=ACC(); ctx.fillRect(W/2-140,y-12,2,16); }
    ctx.font='10px '+DFONT(); ctx.textAlign='center'; ctx.fillStyle=lock?'#3e5558':on?ACC():'#b9cfd2';
    ctx.fillText(lock?(l.n+' · заключен'):(l.n+' · '+l.title+(l.arena?'  ★':'')),W/2,y); ctx.textAlign='left'; }
  centerText('Трудност: '+D.name,224,'600 8px "IBM Plex Mono",monospace','#cfe8e8');
  centerText('↑ ↓ ← → избор · Z начало · Esc / X назад',244,'600 7px "IBM Plex Mono",monospace','#6f9a9c');
  if(GAME.epsExtra) GAME.epsExtra();
}

/* ---------- pickups ---------- */
R2_TAKE.air=k=>{ const p=player; if(p.air>=99) return false; p.air=Math.min(100,p.air+45); SFX.pickup(); for(let i=0;i<10;i++) part(k.x+6,k.y+5,rnd(-30,30),rnd(-60,-10),0.6,'#cfefff',1.5,-20); };
R2_PDRAW.air=(k,x,y)=>{ const a=titleT*3+k.bob; for(let i=0;i<3;i++){ const bx=x+6+Math.sin(a+i*2)*3, by=y+8-((titleT*14+i*6)%14); ctx.strokeStyle='rgba(220,250,255,0.85)'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(bx,by,2+i*0.6,0,7); ctx.stroke(); } ctx.fillStyle='rgba(160,230,255,0.25)'; ctx.beginPath(); ctx.arc(x+6,y+4,7,0,7); ctx.fill(); };

/* ---------- new enemies ---------- */
Object.assign(DIMS,{fish:[16,8,24],jelly:[12,14,20],imp:[12,12,24],drone:[14,10,36],mite:[8,8,5],tent:[14,60,90]});
function inWaterE(e,x,y){ return isWater(x,y); }
R2UPD.fish=(e,dt)=>{
  if(!isWater(e.x+e.w/2,e.y+e.h/2)){ e.dry=(e.dry||0)+dt; physics(e,dt); if(e.dry>1.5) hurtEnemy(e,999,0,true); return; } e.dry=0;
  const p=player, ex=e.x+e.w/2, ey=e.y+e.h/2, pcx=p.x+p.w/2, pcy=p.y+p.h/2, dx=pcx-ex, dy=pcy-ey, d=Math.hypot(dx,dy)||1;
  e.anim+=dt*8; e.bite-=dt;
  if(!e.alert&&d<200&&p.wet) e.alert=true;
  let tvx, tvy;
  if(e.alert&&p.wet&&!p.dead){ const sp=78*D.bspd; tvx=dx/d*sp; tvy=dy/d*sp; }
  else { tvx=e.side*30; tvy=Math.sin(e.anim*0.4)*12; }
  e.vx+=(tvx-e.vx)*Math.min(1,dt*2.5); e.vy+=(tvy-e.vy)*Math.min(1,dt*2.5);
  const nx=ex+e.vx*dt*4, ny=ey+e.vy*dt*4;
  if(!inWaterE(e,nx,ey)){ e.vx=-e.vx*0.5; e.side=-e.side; } if(!inWaterE(e,ex,ny)){ e.vy=-Math.abs(e.vy)*0.3+(isWater(ex,ey+8)?20:-20); }
  moveX(e,e.vx*dt); const ob=e.y; e.y+=e.vy*dt; if(rectSolid(e.x,e.y,e.w,e.h)){ e.y=ob; e.vy=0; }
  if(Math.abs(e.vx)>2) e.face=sgn(e.vx);
  if(!p.dead&&ov(e,p)&&e.bite<=0){ hurtPlayer(9,sgn(dx)*80); e.bite=0.9; }
};
R2DRAW.fish=e=>{ begin(e); tint=e.hitT>0?'#fff':null; if(e.dead) ctx.rotate(Math.PI); const t=Math.sin(e.anim)*2;
  px(-8,-7,12,6,'#b8643a'); px(-7,-7,10,1,'#e0905a'); px(-8,-2,12,1,'#7a3a22'); px(4,-6,4,4,'#c8784a'); px(-12,-7+t*0.5,4,6,'#8a4a2a'); px(5,-3,3,1,'#f0f0e0'); px(2,-6,2,2,'#ffef5a'); px(-3,-9,4,2,'#8a4a2a');
  tint=null; if(e.dead) fade(e,0.3); ctx.restore(); };
R2UPD.jelly=(e,dt)=>{
  if(!isWater(e.x+e.w/2,e.y+e.h/2)){ e.dry=(e.dry||0)+dt; physics(e,dt); if(e.dry>1.5) hurtEnemy(e,999,0,true); return; } e.dry=0;
  const p=player, ex=e.x+e.w/2, ey=e.y+e.h/2, dx=p.x+p.w/2-ex; e.anim+=dt; e.bite-=dt;
  const tvy=Math.sin(e.anim*1.3+e.home)*22, tvx=clamp(dx*0.15,-14,14);
  e.vx+=(tvx-e.vx)*dt; e.vy+=(tvy-e.vy)*dt*2;
  if(!isWater(ex+e.vx*0.5,ey+e.vy*0.5)){ e.vx=-e.vx; e.vy=-e.vy+ (isWater(ex,ey+10)?15:-15); }
  moveX(e,e.vx*dt); const ob=e.y; e.y+=e.vy*dt; if(rectSolid(e.x,e.y,e.w,e.h)){ e.y=ob; e.vy=0; }
  if(!p.dead&&ov(e,p)&&e.bite<=0){ hurtPlayer(11,sgn(-dx||1)*-90); e.bite=1; sparks(ex,ey,8,'#ff9af0'); sfxAt('zapS',e); }
};
R2DRAW.jelly=e=>{ begin(e,false); tint=e.hitT>0?'#fff':null; const t=e.anim; ctx.globalAlpha=e.dead?Math.max(0,1-e.deadT):0.85;
  ctx.fillStyle=tint||'#ff8ad8'; ctx.beginPath(); ctx.ellipse(0,-10,7,5+Math.sin(t*3)*0.8,0,Math.PI,0); ctx.fill(); px(-7,-10,14,2,'#d860b8');
  for(let i=0;i<4;i++) px(-5+i*3,-8,1,5+Math.round(Math.sin(t*4+i)*2),'#ffb8ea'); px(-2,-13,2,2,'#fff0fa'); tint=null; ctx.globalAlpha=1; ctx.restore(); };
R2UPD.imp=(e,dt)=>{
  const p=player; e.anim+=dt*10; e.bite-=dt;
  let tg=null, td=1e9; for(const g of GENS){ if(g.hp<=0) continue; const d=Math.abs(g.x+14-(e.x+e.w/2)); if(d<td){ td=d; tg=g; } }
  const pd=Math.abs(p.x-e.x); let tx;
  if(!p.dead&&(pd<70||!tg)) tx=p.x+p.w/2; else if(tg) tx=tg.x+14; else tx=e.x;
  const dx=tx-(e.x+e.w/2); e.face=sgn(dx)||e.face;
  if(e.onGround){ e.vx=Math.abs(dx)>6?sgn(dx)*72*D.bspd:0; if(e.vx&&wallAhead(e,e.face)) e.vy=-300; }
  physics(e,dt);
  if(tg&&ov(e,tg)){ tg.hp-=dt*[5,8,11][DI]; tg.hitT=0.1; if(Math.random()<dt*6) sparks(tg.x+14,tg.y+8,2,'#bfe8ff'); if(tg.hp<=0){ tg.hp=0; sfxAt('boom',tg); explode(tg.x+14,tg.y+10,40,0,0,true); showMsg('Генератор е унищожен!',2); } }
  if(!p.dead&&ov(e,p)&&e.bite<=0){ hurtPlayer(8,e.face*90); e.bite=0.8; }
};
R2DRAW.imp=e=>{ begin(e); tint=e.hitT>0?'#fff':null; const s=Math.sin(e.anim)>0?1:0;
  px(-5,-9,10,7,'#5a2a6a'); px(-4,-10,8,2,'#8a4aa0'); px(-6,-3,3,3-s,'#3a1a4a'); px(3,-3,3,2+s,'#3a1a4a'); px(1,-8,3,2,'#ff6ad5'); px(-6,-12,2,3,'#8a4aa0'); px(4,-12,2,3,'#8a4aa0');
  tint=null; if(e.dead) fade(e,0.2); ctx.restore(); };
R2UPD.drone=(e,dt)=>{
  const p=player, ex=e.x+e.w/2, ey=e.y+e.h/2, pcx=p.x+p.w/2, pcy=p.y+p.h/2, dx=pcx-ex, dy=pcy-ey, d=Math.hypot(dx,dy)||1; e.mech=true; e.anim+=dt; e.cd-=dt;
  if(!e.alert&&d<240&&los(ex,ey,pcx,pcy)) e.alert=true;
  let hx=e.home, hy=e.y; if(e.alert&&!p.dead){ hx=pcx-sgn(dx||1)*110; hy=pcy-50+Math.sin(e.anim*1.7)*14; }
  e.vx+=(clamp((hx-ex)*1.2,-70,70)-e.vx)*Math.min(1,dt*2); e.vy+=(clamp((hy-ey)*1.2,-60,60)-e.vy)*Math.min(1,dt*2);
  moveX(e,e.vx*dt); moveY(e,e.vy*dt); e.face=sgn(dx)||1;
  if(e.alert&&e.cd<=0&&d<260&&los(ex,ey,pcx,pcy)&&!p.dead){ e.cd=rnd(1.8,2.6)*D.rate; const sp=150*D.bspd; ebullets.push({x:ex,y:ey,vx:dx/d*sp,vy:dy/d*sp,life:3,dmg:9,r:3,orb:true,red:true}); sfxAt('laser',e); }
};
R2DRAW.drone=e=>{ begin(e,false); tint=e.hitT>0?'#fff':null; if(e.dead){ fade(e,0.2); }
  px(-7,-8,14,6,'#3a4248'); px(-7,-8,14,1,'#6d767c'); px(-9,-9,4,1,'#9aa2a7'); px(5,-9,4,1,'#9aa2a7'); px(-2,-6,4,3,e.alert?'#ff3b2e':'#5a1a14'); px(-6,-2,2,2,'#2a2e33'); px(4,-2,2,2,'#2a2e33');
  if(Math.floor(e.anim*20)%2) { px(-9,-10,4,1,'#cfd5d8'); px(5,-10,4,1,'#cfd5d8'); }
  tint=null; ctx.restore(); };
R2UPD.mite=(e,dt)=>{ e.mech=true; e.anim+=dt; if(e.ctl) return; const p=player, dx=p.x+p.w/2-(e.x+4), dy=p.y+p.h/2-(e.y+4), d=Math.hypot(dx,dy)||1; e.vx+=(dx/d*90-e.vx)*dt*2; e.vy+=(dy/d*90-e.vy)*dt*2; e.x+=e.vx*dt; e.y+=e.vy*dt; e.bite-=dt; if(!p.dead&&ov(e,p)&&e.bite<=0){ hurtPlayer(6,sgn(dx)*60); e.bite=0.8; } };
R2DRAW.mite=e=>{ if(e.dead&&e.deadT>0.4) return; const x=Math.round(e.x-cam), y=Math.round(e.y); ctx.fillStyle=e.hitT>0?'#fff':'#c8a24a'; ctx.fillRect(x+1,y+1,6,6); ctx.fillStyle='#ffef8a'; ctx.fillRect(x+3,y+3,2,2); ctx.fillStyle='#6a5222'; ctx.fillRect(x,y+3,1,2); ctx.fillRect(x+7,y+3,1,2); };
R2UPD.tent=(e,dt)=>{ e.anim+=dt; };
R2DRAW.tent=e=>{ if(e.dead&&e.deadT>0.8) return; const b=boss; const base=e.baseY, top=e.y, x=e.x+e.w/2-cam; ctx.save(); if(e.dead) ctx.globalAlpha=1-e.deadT/0.8;
  for(let y=base,i=0;y>top;y-=6,i++){ const k=(base-y)/Math.max(1,base-top), sw=Math.sin(e.anim*3+i*0.5)*5*k*(e.slam?0.2:1); ctx.fillStyle=e.hitT>0?'#fff':(i%2?'#3a6a6a':'#4a7a76'); ctx.beginPath(); ctx.ellipse(x+sw,y,7-k*3,4,0,0,7); ctx.fill(); if(i%3===1){ ctx.fillStyle='#c8f0e0'; ctx.fillRect(x+sw-5+k*2,y-1,2,2); } }
  ctx.restore(); };


/* ---------- общи помощници за босове и сцени ---------- */
const AX=()=>LVL.arena.door*T; // arena left edge (px)
function bossOrb(x,y,vx,vy,o={}){ ebullets.push({x,y,vx,vy,life:o.life||4,dmg:o.dmg||10,r:o.r||4,orb:true,grav:!!o.grav,red:!!o.red,ice:!!o.ice,acid:!!o.acid,hornet:!!o.hornet}); }
const ss=(a,b,t)=>{ const x=clamp((t-a)/(b-a),0,1); return x*x*(3-2*x); };
const lerp=(a,b,k)=>a+(b-a)*k;
function inZG(p){ const z=LVL&&LVL.zgZones; if(!z||!p) return false; const cx=(p.x+p.w/2)/T, cy=(p.y+p.h/2)/T; return z.some(([x0,y0,x1,y1])=>cx>=x0&&cx<=x1+1&&cy>=y0&&cy<=y1+1); }
function setDoorAll(d,ch){ if(!ERAD){ setDoor(d,ch); return; } const [tx,r0,r1]=d; const cur=ERA, saveLV=LV, saveMap=map;
  for(let e=0;e<2;e++){ map=ERAD.maps[e]; for(let ty=r0;ty<=r1;ty++) map[ty][tx]=ch; LV=ERAD.cv[e]; lx=LV.getContext('2d'); const th=LVL.theme; LVL.theme=ERAD.themes[e]; redrawCols(tx,tx); LVL.theme=th; }
  map=saveMap; LV=saveLV; lx=LV.getContext('2d'); }
