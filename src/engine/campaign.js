/* ================= ДВИГАТЕЛ: ЕПИЗОДИ, HUD, ОБЩИ ВРАГОВЕ =================
   Главите и отключените епизоди, менюто на епизодите, HUD-ът на продълженията, общите врагове и помощници за босове.
   Механиките (вода, епохи, обръщане, ескорт, гонитби…) са в engine/mech/.
   Тук НЯМА съдържание на конкретна игра — нивата, босовете и текстовете са в games/<id>/. */
let GLV=[], GCH=[], gUnl=1;    // нивата, главите и отключените епизоди на текущата игра
const gChOf=i=>Math.max(0,GCH.findIndex(c=>i>=c.a&&i<=c.b));
const chName=c=>GCH[c].label||'ГЛАВА '+ROM[c], chShort=c=>GCH[c].short||'ГЛ. '+ROM[c];   // надписите на главата (бонус главата на r1 има свои)
const epFinal=i=>i>=GLV.length-1||!!GCH[gChOf(i)].fin&&i===GCH[gChOf(i)].b;   // след епизода идва финалният екран

/* ---------- избор на епизод ---------- */
function epsInput(){
  const ch=gChOf(menuSel), c=GCH[ch];
  if(pressed.up&&menuSel>c.a){ menuSel--; SFX.menu(); }
  if(pressed.down&&menuSel<Math.min(c.b,gUnl-1)){ menuSel++; SFX.menu(); }
  if(pressed.right&&ch<GCH.length-1&&GCH[ch+1].a<gUnl){ menuSel=Math.min(GCH[ch+1].a+(menuSel-c.a),GCH[ch+1].b,gUnl-1); SFX.menu(); }
  if(pressed.left&&ch>0){ menuSel=Math.min(GCH[ch-1].a+(menuSel-c.a),GCH[ch-1].b); SFX.menu(); }
  if(ok()){ SFX.menuOk(); totals={time:0,shots:0,hits:0,kills:0,deaths:0}; if(menuSel===0) GAME.intro(false); else startEpisode(menuSel,false); }
  else if(pressed.jump||pressed.esc){ state='diff'; menuSel=DI; SFX.menu(); }
}

/* ---------- HUD ---------- */
const hudBar=(x,y,w,v,max,col,bg='rgba(0,0,0,0.55)')=>{ ctx.fillStyle=bg; ctx.fillRect(x-1,y-1,w+2,6); const n=10, cw=(w-(n-1))/n, f=clamp(v/max,0,1)*n; for(let i=0;i<n;i++){ const k=clamp(f-i,0,1); ctx.fillStyle='rgba(255,255,255,0.08)'; ctx.fillRect(x+i*(cw+1),y,cw,4); if(k>0){ ctx.fillStyle=col; ctx.fillRect(x+i*(cw+1),y,cw*k,4); } } };
function drawHudStd(){
  const p=player, A=ACC();
  ctx.save(); ctx.textBaseline='alphabetic';
  // health / armor / air
  ctx.fillStyle='rgba(4,14,18,0.55)'; ctx.fillRect(6,236,118,30); ctx.fillStyle=A; ctx.fillRect(6,236,2,30);
  ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='rgba(200,240,240,0.7)'; ctx.fillText('ЗДРАВЕ',13,244); ctx.fillText('БРОНЯ',13,258);
  ctx.font='10px '+DFONT(); ctx.fillStyle=p.hp<=25?'#ff4d3a':'#e8fbff'; ctx.textAlign='right'; ctx.fillText(String(Math.ceil(p.hp)),118,247); ctx.fillStyle='#bfe8ff'; ctx.fillText(String(Math.ceil(p.armor)),118,261); ctx.textAlign='left';
  hudBar(46,240,52,p.hp,100,p.hp<=25?'#ff4d3a':A); hudBar(46,254,52,p.armor,100,'#5aa8ff');
  if((p.air!==undefined&&p.air<100)||p.headWet){ ctx.fillStyle='rgba(4,14,18,0.55)'; ctx.fillRect(6,222,118,12); ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle=p.air<30?'#ff6a5a':'#bfe8ff'; ctx.fillText('ВЪЗДУХ',13,230); hudBar(46,226,72,p.air,100,p.air<30?'#ff6a5a':'#9fe8ff'); }
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
  if(LVL.sun) chip(MT.flare?'☼ ИЗБЛИК — СТОЙ НА СЯНКА!':MT.warn?'☼ ИДВА ИЗБЛИК…':'☼ слънцето е спокойно',MT.flare||MT.warn?'#ffb04a':'#c8b890');
  if(ESC){ chip(LVL.escort.name.toUpperCase(),'#ffd08a'); hudBar(8,cy-1,60,ESC.hp,ESC.max,'#ffd08a'); cy+=7; }
  if(GENS.length){ GENS.forEach((g,i)=>{ ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='rgba(200,240,240,0.7)'; ctx.fillText('ГЕН. '+(i+1),8,cy+5); hudBar(36,cy+1,40,Math.max(0,g.hp),g.max,g.hp<35?'#ff4d3a':A); cy+=9; }); }
  mechRun('chips',chip);
  if(muted){ ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='#7f8e97'; ctx.fillText('БЕЗ ЗВУК (M)',8,cy+6); }
  // boss bar
  if(bossActive&&boss&&!boss.dead&&boss.state!=='intro'){ const bw=200,bx=(W-bw)/2; ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(bx-1,15,bw+2,6); ctx.fillStyle=(BOSSES[boss.type]||{}).col||A; ctx.fillRect(bx,16,bw*clamp(boss.hp/boss.max,0,1),4);
    ctx.font='600 7px "IBM Plex Mono",monospace'; ctx.textAlign='center'; ctx.fillStyle='#e8fbff'; ctx.fillText((BOSSES[boss.type]||{}).name||'',W/2,12); ctx.textAlign='left'; }
  // message
  if(msg){ const a=clamp(Math.min(msg.age*4,(msg.d-msg.age)*2),0,1); ctx.globalAlpha=a; ctx.font='600 9px "IBM Plex Mono",monospace';
    const lines=wrap(msg.t,360), lw=Math.max(...lines.map(l=>ctx.measureText(l).width)), who=msg.who, w=lw+20, h=lines.length*12+6+(who?10:0), y=bossActive?30:20, x=W/2-w/2;
    const wcol=who==='Д-Р ИЛИЕВА'?'#94ff57':'#7fd8ff'; ctx.fillStyle='rgba(4,14,18,0.82)'; ctx.fillRect(x,y,w,h); ctx.fillStyle=who?wcol:A; ctx.fillRect(x,y,2,h); ctx.fillRect(x+w-2,y,2,h);
    let ly=y+11; if(who){ ctx.font='600 7px "IBM Plex Mono",monospace'; ctx.fillStyle=wcol; ctx.fillText('◉ '+who,x+10,ly-1); ly+=10; ctx.font='600 9px "IBM Plex Mono",monospace'; }
    ctx.fillStyle='#eaf6f6'; for(const l of lines){ ctx.fillText(l,x+10,ly); ly+=12; } ctx.globalAlpha=1; }
  ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='rgba(200,240,240,0.5)'; ctx.textAlign='right'; ctx.fillText(SURV?(GAME.name+' · ОЦЕЛЯВАНЕ · СЕКТОР '+(survK+1)+' · '+D.name):LVL.training?(GAME.name+' · ТРЕНИРОВКА · '+D.name):(GAME.name+' · '+chShort(gChOf(LI))+' · ЕП. '+LVL.n+' · '+D.name),W-6,9); ctx.textAlign='left';
  if(SURV){ ctx.font='600 7px "IBM Plex Mono",monospace'; ctx.textAlign='right'; ctx.fillStyle='#ff6a8a'; ctx.fillText('♥'.repeat(Math.max(0,survLives)),W-6,19); ctx.fillStyle=A; ctx.fillText('ТОЧКИ '+(survScore+stats.kills*10),W-6-survLives*8-6,19); ctx.textAlign='left'; }
  ctx.restore();
}

function renderEpsStd(){
  overlay(0.82); centerText('ИЗБЕРИ ЕПИЗОД',50,'15px '+DFONT(),ACC());
  const ch=gChOf(menuSel), c=GCH[ch];
  centerText((ch>0?'◀  ':'    ')+chName(ch)+' · '+c.t+(ch<GCH.length-1&&GCH[ch+1].a<gUnl?'  ▶':'    '),74,'10px '+DFONT(),GAME.accent2);
  for(let i=c.a;i<=c.b;i++){ const l=GLV[i], r=i-c.a, y=96+r*18, on=i===menuSel, lock=i>=gUnl;
    if(on){ ctx.fillStyle=ACCA(0.12); ctx.fillRect(W/2-140,y-12,280,16); ctx.fillStyle=ACC(); ctx.fillRect(W/2-140,y-12,2,16); }
    ctx.font='10px '+DFONT(); ctx.textAlign='center'; ctx.fillStyle=lock?'#3e5558':on?ACC():'#b9cfd2';
    ctx.fillText(lock?(l.n+' · заключен'):(l.n+' · '+l.title+(l.arena?'  ★':'')),W/2,y); ctx.textAlign='left'; }
  centerText('Трудност: '+D.name,224,'600 8px "IBM Plex Mono",monospace','#cfe8e8');
  centerText('↑ ↓ ← → избор · Z начало · Esc / X назад',244,'600 7px "IBM Plex Mono",monospace','#6f9a9c');
  if(GAME.epsExtra) GAME.epsExtra();
}


/* ---------- new enemies ---------- */
defFoes('dims',{fish:[16,8,24],jelly:[12,14,20],imp:[12,12,24],drone:[14,10,36],mite:[8,8,5],tent:[14,60,90]}); defFoes('glow',{jelly:true,drone:true}); defFoes('fly',{drone:true});
function inWaterE(e,x,y){ return isWater(x,y); }
defFoe('fish',{upd:(e,dt)=>{
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
}});
defFoe('fish',{draw:e=>{ begin(e); tint=e.hitT>0?'#fff':null; if(e.dead) ctx.rotate(Math.PI); const t=Math.sin(e.anim)*2;
  px(-8,-7,12,6,'#b8643a'); px(-7,-7,10,1,'#e0905a'); px(-8,-2,12,1,'#7a3a22'); px(4,-6,4,4,'#c8784a'); px(-12,-7+t*0.5,4,6,'#8a4a2a'); px(5,-3,3,1,'#f0f0e0'); px(2,-6,2,2,'#ffef5a'); px(-3,-9,4,2,'#8a4a2a');
  tint=null; if(e.dead) fade(e,0.3); ctx.restore(); }});
defFoe('jelly',{upd:(e,dt)=>{
  if(!isWater(e.x+e.w/2,e.y+e.h/2)){ e.dry=(e.dry||0)+dt; physics(e,dt); if(e.dry>1.5) hurtEnemy(e,999,0,true); return; } e.dry=0;
  const p=player, ex=e.x+e.w/2, ey=e.y+e.h/2, dx=p.x+p.w/2-ex; e.anim+=dt; e.bite-=dt;
  const tvy=Math.sin(e.anim*1.3+e.home)*22, tvx=clamp(dx*0.15,-14,14);
  e.vx+=(tvx-e.vx)*dt; e.vy+=(tvy-e.vy)*dt*2;
  if(!isWater(ex+e.vx*0.5,ey+e.vy*0.5)){ e.vx=-e.vx; e.vy=-e.vy+ (isWater(ex,ey+10)?15:-15); }
  moveX(e,e.vx*dt); const ob=e.y; e.y+=e.vy*dt; if(rectSolid(e.x,e.y,e.w,e.h)){ e.y=ob; e.vy=0; }
  if(!p.dead&&ov(e,p)&&e.bite<=0){ hurtPlayer(11,sgn(-dx||1)*-90); e.bite=1; sparks(ex,ey,8,'#ff9af0'); sfxAt('zapS',e); }
}});
defFoe('jelly',{draw:e=>{ begin(e,false); tint=e.hitT>0?'#fff':null; const t=e.anim; ctx.globalAlpha=e.dead?Math.max(0,1-e.deadT):0.85;
  ctx.fillStyle=tint||'#ff8ad8'; ctx.beginPath(); ctx.ellipse(0,-10,7,5+Math.sin(t*3)*0.8,0,Math.PI,0); ctx.fill(); px(-7,-10,14,2,'#d860b8');
  for(let i=0;i<4;i++) px(-5+i*3,-8,1,5+Math.round(Math.sin(t*4+i)*2),'#ffb8ea'); px(-2,-13,2,2,'#fff0fa'); tint=null; ctx.globalAlpha=1; ctx.restore(); }});
defFoe('imp',{upd:(e,dt)=>{
  const p=player; e.anim+=dt*10; e.bite-=dt;
  let tg=null, td=1e9; for(const g of GENS){ if(g.hp<=0) continue; const d=Math.abs(g.x+14-(e.x+e.w/2)); if(d<td){ td=d; tg=g; } }
  const pd=Math.abs(p.x-e.x); let tx;
  if(!p.dead&&(pd<70||!tg)) tx=p.x+p.w/2; else if(tg) tx=tg.x+14; else tx=e.x;
  const dx=tx-(e.x+e.w/2); e.face=sgn(dx)||e.face;
  if(e.onGround){ e.vx=Math.abs(dx)>6?sgn(dx)*72*D.bspd:0; if(e.vx&&wallAhead(e,e.face)) e.vy=-300; }
  physics(e,dt);
  if(tg&&ov(e,tg)){ tg.hp-=dt*[5,8,11][DI]; tg.hitT=0.1; if(Math.random()<dt*6) sparks(tg.x+14,tg.y+8,2,'#bfe8ff'); if(tg.hp<=0){ tg.hp=0; sfxAt('boom',tg); explode(tg.x+14,tg.y+10,40,0,0,true); showMsg('Генератор е унищожен!',2); } }
  if(!p.dead&&ov(e,p)&&e.bite<=0){ hurtPlayer(8,e.face*90); e.bite=0.8; }
}});
defFoe('imp',{draw:e=>{ begin(e); tint=e.hitT>0?'#fff':null; const s=Math.sin(e.anim)>0?1:0;
  px(-5,-9,10,7,'#5a2a6a'); px(-4,-10,8,2,'#8a4aa0'); px(-6,-3,3,3-s,'#3a1a4a'); px(3,-3,3,2+s,'#3a1a4a'); px(1,-8,3,2,'#ff6ad5'); px(-6,-12,2,3,'#8a4aa0'); px(4,-12,2,3,'#8a4aa0');
  tint=null; if(e.dead) fade(e,0.2); ctx.restore(); }});
defFoe('drone',{upd:(e,dt)=>{
  const p=player, ex=e.x+e.w/2, ey=e.y+e.h/2, pcx=p.x+p.w/2, pcy=p.y+p.h/2, dx=pcx-ex, dy=pcy-ey, d=Math.hypot(dx,dy)||1; e.mech=true; e.anim+=dt; e.cd-=dt;
  if(!e.alert&&d<240&&los(ex,ey,pcx,pcy)) e.alert=true;
  let hx=e.home, hy=e.y; if(e.alert&&!p.dead){ hx=pcx-sgn(dx||1)*110; hy=pcy-50+Math.sin(e.anim*1.7)*14; }
  e.vx+=(clamp((hx-ex)*1.2,-70,70)-e.vx)*Math.min(1,dt*2); e.vy+=(clamp((hy-ey)*1.2,-60,60)-e.vy)*Math.min(1,dt*2);
  moveX(e,e.vx*dt); moveY(e,e.vy*dt); e.face=sgn(dx)||1;
  if(e.alert&&e.cd<=0&&d<260&&los(ex,ey,pcx,pcy)&&!p.dead){ e.cd=rnd(1.8,2.6)*D.rate; const sp=150*D.bspd; ebullets.push({x:ex,y:ey,vx:dx/d*sp,vy:dy/d*sp,life:3,dmg:9,r:3,orb:true,red:true}); sfxAt('laser',e); }
}});
defFoe('drone',{draw:e=>{ begin(e,false); tint=e.hitT>0?'#fff':null; if(e.dead){ fade(e,0.2); }
  px(-7,-8,14,6,'#3a4248'); px(-7,-8,14,1,'#6d767c'); px(-9,-9,4,1,'#9aa2a7'); px(5,-9,4,1,'#9aa2a7'); px(-2,-6,4,3,e.alert?'#ff3b2e':'#5a1a14'); px(-6,-2,2,2,'#2a2e33'); px(4,-2,2,2,'#2a2e33');
  if(Math.floor(e.anim*20)%2) { px(-9,-10,4,1,'#cfd5d8'); px(5,-10,4,1,'#cfd5d8'); }
  tint=null; ctx.restore(); }});
defFoe('mite',{upd:(e,dt)=>{ e.mech=true; e.anim+=dt; if(e.ctl) return; const p=player, dx=p.x+p.w/2-(e.x+4), dy=p.y+p.h/2-(e.y+4), d=Math.hypot(dx,dy)||1; e.vx+=(dx/d*90-e.vx)*dt*2; e.vy+=(dy/d*90-e.vy)*dt*2; e.x+=e.vx*dt; e.y+=e.vy*dt; e.bite-=dt; if(!p.dead&&ov(e,p)&&e.bite<=0){ hurtPlayer(6,sgn(dx)*60); e.bite=0.8; } }});
defFoe('mite',{draw:e=>{ if(e.dead&&e.deadT>0.4) return; const x=Math.round(e.x-cam), y=Math.round(e.y); ctx.fillStyle=e.hitT>0?'#fff':'#c8a24a'; ctx.fillRect(x+1,y+1,6,6); ctx.fillStyle='#ffef8a'; ctx.fillRect(x+3,y+3,2,2); ctx.fillStyle='#6a5222'; ctx.fillRect(x,y+3,1,2); ctx.fillRect(x+7,y+3,1,2); }});
defFoe('tent',{upd:(e,dt)=>{ e.anim+=dt; }});
defFoe('tent',{draw:e=>{ if(e.dead&&e.deadT>0.8) return; const b=boss; const base=e.baseY, top=e.y, x=e.x+e.w/2-cam; ctx.save(); if(e.dead) ctx.globalAlpha=1-e.deadT/0.8;
  for(let y=base,i=0;y>top;y-=6,i++){ const k=(base-y)/Math.max(1,base-top), sw=Math.sin(e.anim*3+i*0.5)*5*k*(e.slam?0.2:1); ctx.fillStyle=e.hitT>0?'#fff':(i%2?'#3a6a6a':'#4a7a76'); ctx.beginPath(); ctx.ellipse(x+sw,y,7-k*3,4,0,0,7); ctx.fill(); if(i%3===1){ ctx.fillStyle='#c8f0e0'; ctx.fillRect(x+sw-5+k*2,y-1,2,2); } }
  ctx.restore(); }});


/* ---------- общи помощници за босове и сцени ---------- */
const AX=()=>LVL.arena.door*T; // arena left edge (px)
function bossOrb(x,y,vx,vy,o={}){ ebullets.push({x,y,vx,vy,life:o.life||4,dmg:o.dmg||10,r:o.r||4,orb:true,grav:!!o.grav,red:!!o.red,ice:!!o.ice,acid:!!o.acid,hornet:!!o.hornet}); }
const ss=(a,b,t)=>{ const x=clamp((t-a)/(b-a),0,1); return x*x*(3-2*x); };
const lerp=(a,b,k)=>a+(b-a)*k;
function inZG(p){ const z=LVL&&LVL.zgZones; if(!z||!p) return false; const cx=(p.x+p.w/2)/T, cy=(p.y+p.h/2)/T; return z.some(([x0,y0,x1,y1])=>cx>=x0&&cx<=x1+1&&cy>=y0&&cy<=y1+1); }
function setDoorAll(d,ch){ if(!ERAD){ setDoor(d,ch); return; } const [tx,r0,r1]=d; const cur=ERA, saveLV=LV, saveMap=map;
  for(let e=0;e<2;e++){ map=ERAD.maps[e]; for(let ty=r0;ty<=r1;ty++) map[ty][tx]=ch; LV=ERAD.cv[e]; lx=LV.getContext('2d'); const th=LVL.theme; LVL.theme=ERAD.themes[e]; redrawCols(tx,tx); LVL.theme=th; }
  map=saveMap; LV=saveLV; lx=LV.getContext('2d'); }

