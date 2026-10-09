/* ================= COMBAT ================= */
function die(){ const p=player; p.hp=0; p.dead=true; p.deadT=0; p.crouch=false; stats.deaths++; SFX.beep(); osc({type:'sine',f:1650,t:1.6,v:0.12,when:0.3}); }
function hurtPlayer(d,kx=0,hazard){
  const p=player; if(p.dead||state!=='play'||chtOn('god')) return;
  if(!hazard){ if(p.inv>0) return; p.inv=0.22; }
  d*=hazard?D.haz:D.dmg;
  const ab=Math.min(p.armor,d*0.6); p.armor-=ab; p.hp-=d-ab; p.vx+=kx; p.hurtT=0.15; p.hurtAgo=0;
  dmgFlash=Math.min(0.6,dmgFlash+0.25+d/80); shake=Math.max(shake,d>15?4:2);
  if(!hazard||Math.random()<0.3) SFX.hurt();
  if(p.hp<=0) die();
}
function hurtEnemy(e,d,kx=0,quiet){
  if(e.dead) return; if(e.fq!=null&&LVL.freq&&e.fq!==FREQ){ e.hitT=0.04; sparks(e.x+e.w/2,e.y+e.h/2,2,'#a8a8b8'); return; } e.hp-=chtOn('onehit')?Math.max(d,e.hp+1):d; e.hitT=0.08; if(e.type!=='turret') e.vx+=kx; e.alert=true;
  const cx=e.x+e.w/2, cy=e.y+e.h/2, mech=!!FOES[e.type].mech||!!e.mech, alien=!FOES[e.type].human;
  if(!quiet){ if(mech) sparks(cx,cy,4); else blood(cx,cy,alien,5); }
  if(e.type==='shocker'&&e.state==='charge'&&Math.random()<0.35){ e.state='stagger'; e.t=0.45; }
  if(e.hp<=0){ e.dead=true; e.deadT=0; stats.kills++;
    if(e.type==='target'){ sparks(cx,e.y+7,10,'#fff3b0'); e.vy=-120; if(AC){ osc({type:'square',f:880,t:0.07,v:0.08}); osc({when:0.07,type:'square',f:1320,t:0.12,v:0.08}); } }
    else if(mech){ sparks(cx,cy,14,'#ffb53a'); sfxAt('smallBoom',e); light(cx,cy,80,0.8,'rgba(255,150,40,'); }
    else blood(cx,cy,alien,e.type==='nest'?30:16);
    if(e.type==='zombie'){ sfxAt('zgroan',e); if(Math.random()<(DI===2?0.6:0.3)){ const c=makeEnemy('crab',cx,e.y+10); c.alert=true; c.vy=-150; enemies.push(c); } }
    if(e.type==='guard') sfxAt('alienDie',e);
    if(e.type==='nest'){ sfxAt('birth',e); sfxAt('alienDie',e); shake=Math.max(shake,4); }
    if(e.type==='crab') sfxAt('crabDie',e); else if(e.type==='shocker'||e.type==='flyer') sfxAt('alienDie',e);
    else if(e.type==='soldier'){ sfxAt('humanDie',e); if(Math.random()<D.drop){ const g=player.weapons.grenade&&Math.random()<0.2; pickups.push({type:g?'grenade':'ammo',x:e.x,y:e.y+e.h-10,w:12,h:10,taken:false,bob:0,vy:-80}); } }
  } else if(!quiet&&e.type==='zombie'&&Math.random()<0.3) sfxAt('zgroan',e);
  else if(!quiet&&(e.type==='shocker'||e.type==='soldier')&&Math.random()<0.4) sfxAt(e.type==='shocker'?'alienPain':'humanDie',e);
}
function killSci(s){ if(s.esc){ escHurt(25); return; } if(s.state==='dead') return; s.state='dead'; s.t=0; blood(s.x+5,s.y+8,false,16); sfxAt('scream',s); }
function hitscan(ox,oy,ang,dmg,range,kick){
  const dx=Math.cos(ang), dy=Math.sin(ang);
  const list=enemies.filter(e=>!e.dead), bl=barrels.filter(b=>!b.dead);
  for(let d=0;d<range;d+=3){
    const x=ox+dx*d, y=oy+dy*d;
    if(solidAt(x,y)){ sparks(x-dx*2,y-dy*2,4); return {x,y}; }
    for(const e of list) if(x>=e.x&&x<=e.x+e.w&&y>=e.y&&y<=e.y+e.h){ stats.hits++; hurtEnemy(e,dmg,dx*kick); return {x,y}; }
    for(const b of bl) if(x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h){ stats.hits++; b.hp-=dmg; sparks(x,y,3); if(b.hp<=0&&b.fuse<0) b.fuse=0.05; return {x,y}; }
    for(const m of bmiss) if(!m.dead&&Math.abs(x-m.x)<5&&Math.abs(y-m.y)<5){ stats.hits++; missPop(m); return {x,y}; }
    if(boss&&!boss.dead&&x>=boss.x+4&&x<=boss.x+boss.w-4&&y>=boss.y&&y<=boss.y+boss.h){ stats.hits++; hurtBoss(dmg); return {x,y}; }
  }
  return {x:ox+dx*range,y:oy+dy*range};
}
function autoAim(ox,oy,base,range){
  let best=null,bs=1e9; const list=enemies.filter(e=>!e.dead); if(boss&&!boss.dead) list.push(boss); for(const m of bmiss) if(!m.dead) list.push({x:m.x-3,y:m.y-3,w:6,h:6});
  for(const e of list){ const cx=e.x+e.w/2, cy=e.y+(e===boss?e.h*0.45:e.h/2), dx=cx-ox, dy=cy-oy, dist=Math.hypot(dx,dy); if(dist>range) continue;
    const a=Math.atan2(dy,dx), diff=Math.abs(angDiff(a,base)); if(diff>D.aim) continue; if(!los(ox,oy,cx,cy)) continue;
    const sc=diff*220+dist; if(sc<bs){bs=sc;best=a;} }
  return best===null?base:best;
}
function fire(){
  const p=player, w=p.cur;
  const ox=p.x+p.w/2+p.face*(p.aimUp?5:9), oy=p.y+p.h-(p.crouch?10:18)-(p.aimUp?4:0);
  if(w==='wrench'){
    p.cool=0.42; p.swingT=0.22; SFX.swing();
    const hb={x:p.face>0?p.x+p.w:p.x-20,y:p.y,w:20,h:p.h}; let hit=false;
    for(const e of enemies) if(!e.dead&&ov(hb,e)){ hurtEnemy(e,26,p.face*120); hit=true; }
    for(const b of barrels) if(!b.dead&&ov(hb,b)){ b.hp-=10; if(b.hp<=0&&b.fuse<0) b.fuse=0.1; hit=true; }
    if(boss&&!boss.dead&&ov(hb,boss)){ hurtBoss(26); hit=true; }
    if(hit){ SFX.clang(); shake=Math.max(shake,2); } else if(solidAt(ox+p.face*10,oy)){ SFX.clang(); sparks(ox+p.face*10,oy,4); }
    return;
  }
  const a=p.ammo[w]; if(chtOn('ammo')) a.mag=Math.max(a.mag,1);
  if(a.mag<=0){ if(a.res>0){ startReload(); } else { SFX.empty(); p.cool=0.3; autoSwitch(); } return; }
  if(!chtOn('ammo')) a.mag--;
  if(w==='grenade'){
    p.cool=0.75; SFX.throwG(); p.swingT=0.2;
    const up=p.aimUp; grenades.push({x:p.x+p.w/2+p.face*6,y:p.y+(p.crouch?2:6),vx:p.face*(up?150:230)+p.vx*0.4,vy:up?-330:-190,t:1.6,own:true});
    if(a.mag===0) autoSwitch();
    return;
  }
  if(w==='rocket'){
    p.cool=1.0; p.flashT=0.08; const base=p.aimUp?(p.face>0?-Math.PI/4:-3*Math.PI/4):(p.face>0?0:Math.PI); const ang=autoAim(ox,oy,base,520);
    rockets.push({x:ox+Math.cos(ang)*6,y:oy+Math.sin(ang)*6,vx:Math.cos(ang)*230,vy:Math.sin(ang)*230,life:4}); SFX.rocket(); shake=Math.max(shake,3); p.vx-=p.face*30;
    light(ox,oy,80,0.8,'rgba(255,180,80,'); stats.shots++;
    if(a.mag===0) autoSwitch(); return;
  }
  p.flashT=0.06;
  const base=p.aimUp?(p.face>0?-Math.PI/4:-3*Math.PI/4):(p.face>0?0:Math.PI);
  if(w==='pistol'){
    p.cool=0.24; stats.shots++; const ang=autoAim(ox,oy,base,420)+rnd(-0.02,0.02);
    const e=hitscan(ox,oy,ang,15,420,40); tracers.push({x0:ox,y0:oy,x1:e.x,y1:e.y,life:0.05}); SFX.pistol();
  } else if(w==='pulse'){
    p.cool=0.085; stats.shots++; const ang=autoAim(ox,oy,base,380)+rnd(-0.035,0.035);
    const e=hitscan(ox,oy,ang,8,380,15); tracers.push({x0:ox,y0:oy,x1:e.x,y1:e.y,life:0.06,col:'120,255,170'}); SFX.pulse();
  } else {
    p.cool=0.9; const ang=autoAim(ox,oy,base,240);
    for(let i=0;i<7;i++){ stats.shots++; const e=hitscan(ox,oy,ang+rnd(-0.13,0.13),10,240,30); tracers.push({x0:ox,y0:oy,x1:e.x,y1:e.y,life:0.05}); }
    SFX.shotgun(); shake=Math.max(shake,3); p.vx-=p.face*40;
  }
  if(w!=='pulse') part(p.x+p.w/2,oy,-p.face*rnd(30,60),rnd(-90,-50),0.6,'#d9b44a',1,600);
  light(ox+p.face*6,oy,70,0.8,w==='pulse'?'rgba(120,255,170,':'rgba(255,200,90,');
  for(const e of enemies) if(!e.dead&&Math.abs(e.x-p.x)<320) e.alert=true;
  if(a.mag===0&&a.res>0) startReload();
}
function startReload(){ const p=player, w=p.cur; if(w==='wrench'||w==='grenade'||w==='rocket'||p.reload>0) return; const a=p.ammo[w]; if(a.res<=0||a.mag>=CAP[w]) return; p.reload=w==='pistol'?1.1:w==='pulse'?1.3:1.6; SFX.reload(); }
function finishReload(){ const p=player,w=p.cur; if(w==='wrench'||w==='grenade'||w==='rocket') return; const a=p.ammo[w], n=Math.min(CAP[w]-a.mag,a.res); a.mag+=n; a.res-=n; }
function hasAmmo(w){ return w==='wrench'||(player.weapons[w]&&(chtOn('ammo')||(player.ammo[w].mag+player.ammo[w].res)>0)); }
function autoSwitch(){ for(const w of ['pulse','shotgun','pistol','wrench']) if(player.weapons[w]&&hasAmmo(w)){ if(player.cur!==w){ player.cur=w; player.reload=0; } return; } }
function selectWeapon(w){ const p=player; if(!p.weapons[w]||p.cur===w) return; p.cur=w; p.reload=0; p.cool=0.25; SFX.reload(); if(w!=='wrench'&&w!=='grenade'&&w!=='rocket'&&p.ammo[w].mag===0) startReload(); }

