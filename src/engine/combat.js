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
  if(e.dead) return; if(e.fq!=null&&LVL.freq&&e.fq!==FREQ){ e.hitT=0.04; sparks(e.x+e.w/2,e.y+e.h/2,2,'#a8a8b8'); return; } e.hp-=chtOn('onehit')?Math.max(d,e.hp+1):d; e.hitT=0.08; const F=FOES[e.type]; if(!F.noKnock) e.vx+=kx; e.alert=true;
  const cx=e.x+e.w/2, cy=e.y+e.h/2, mech=!!F.mech||!!e.mech, alien=!F.human;
  if(!quiet){ if(mech) sparks(cx,cy,4); else blood(cx,cy,alien,5); }
  if(F.hit) F.hit(e);
  if(e.hp<=0){ e.dead=true; e.deadT=0; stats.kills++;   // куките на врага (defFoe): dieFx — вместо общия ефект, die — след него, pain — при удар без смърт
    if(F.dieFx) F.dieFx(e,cx,cy); else if(mech){ sparks(cx,cy,14,'#ffb53a'); sfxAt('smallBoom',e); light(cx,cy,80,0.8,'rgba(255,150,40,'); } else blood(cx,cy,alien,F.gore||16);
    if(F.die) F.die(e,cx,cy);
  } else if(!quiet&&F.pain) F.pain(e);
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
function fire(){   // общото за всички оръжия; изстрелът — в defWeapon (engine/lib/weapons.js)
  const p=player, w=p.cur, G=WEAPONS[w];
  const ox=p.x+p.w/2+p.face*(p.aimUp?5:9), oy=p.y+p.h-(p.crouch?10:18)-(p.aimUp?4:0);
  if(G.kind==='melee'){ G.fire(p,null,ox,oy); return; }
  const a=p.ammo[w]; if(chtOn('ammo')) a.mag=Math.max(a.mag,1);
  if(a.mag<=0){ if(a.res>0){ startReload(); } else { SFX.empty(); p.cool=0.3; autoSwitch(); } return; }
  if(!chtOn('ammo')) a.mag--;
  if(G.kind==='mag'){ G.fire(p,a,ox,oy); return; }
  p.flashT=0.06;
  const base=p.aimUp?(p.face>0?-Math.PI/4:-3*Math.PI/4):(p.face>0?0:Math.PI);
  G.fire(p,a,ox,oy,base);
  if(G.casing!==false) part(p.x+p.w/2,oy,-p.face*rnd(30,60),rnd(-90,-50),0.6,'#d9b44a',1,600);
  light(ox+p.face*6,oy,70,0.8,G.light||'rgba(255,200,90,');
  for(const e of enemies) if(!e.dead&&Math.abs(e.x-p.x)<320) e.alert=true;
  if(a.mag===0&&a.res>0) startReload();
}
function startReload(){ const p=player, w=p.cur; if(WEAPONS[w].kind!=='clip'||p.reload>0) return; const a=p.ammo[w]; if(a.res<=0||a.mag>=CAP[w]) return; p.reload=WEAPONS[w].reload; SFX.reload(); }
function finishReload(){ const p=player,w=p.cur; if(WEAPONS[w].kind!=='clip') return; const a=p.ammo[w], n=Math.min(CAP[w]-a.mag,a.res); a.mag+=n; a.res-=n; }
function hasAmmo(w){ return WEAPONS[w].kind==='melee'||(player.weapons[w]&&(chtOn('ammo')||(player.ammo[w].mag+player.ammo[w].res)>0)); }
function autoSwitch(){ for(const w of ORDER.filter(w=>WEAPONS[w].auto).sort((a,b)=>WEAPONS[b].auto-WEAPONS[a].auto)) if(player.weapons[w]&&hasAmmo(w)){ if(player.cur!==w){ player.cur=w; player.reload=0; } return; } }
function selectWeapon(w){ const p=player; if(!p.weapons[w]||p.cur===w) return; p.cur=w; p.reload=0; p.cool=0.25; SFX.reload(); if(WEAPONS[w].kind==='clip'&&p.ammo[w].mag===0) startReload(); }

