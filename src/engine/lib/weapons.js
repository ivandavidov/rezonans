/* ================= ОРЪЖИЯТА =================
   defWeapon(id,{…}) — редът на регистрация е редът на клавишите 1–6 (ORDER). Полета:
     name; kind — 'melee' (без муниции), 'mag' (само пълнител, без резерв и презареждане: гранати, ракети), 'clip' (пълнител + резерв);
     cap / res — пълнителят и най-големият резерв; reload — секунди презареждане (clip); auto — предпочитание при автоматична смяна,
     когато муницията свърши (по-голямото — първо; без auto — не се избира само);
     fire(p,a,ox,oy,base) — изстрелът (общото — в fire(), engine/combat.js: муниции, проблясък, гилза, светлина, тревога, презареждане;
     melee и mag вършат всичко сами); casing:false — без гилза; light — цветът на светлината при изстрел;
     sprite(p) — оръжието в ръката, rot(p) — свой ъгъл (иначе — нагоре при прицел), flash — [дължина, цвят, цвят2] на проблясъка.
   Нови муниции за оръжието → предмет с defItem (виж engine/lib/items.js). */
defWeapon('wrench',{name:'ГАЕЧЕН КЛЮЧ',kind:'melee',auto:1,
  fire(p,a,ox,oy){ p.cool=0.42; p.swingT=0.22; SFX.swing();
    const hb={x:p.face>0?p.x+p.w:p.x-20,y:p.y,w:20,h:p.h}; let hit=false;
    for(const e of enemies) if(!e.dead&&ov(hb,e)){ hurtEnemy(e,26,p.face*120); hit=true; }
    for(const b of barrels) if(!b.dead&&ov(hb,b)){ b.hp-=10; if(b.hp<=0&&b.fuse<0) b.fuse=0.1; hit=true; }
    if(boss&&!boss.dead&&ov(hb,boss)){ hurtBoss(26); hit=true; }
    if(hit){ SFX.clang(); shake=Math.max(shake,2); } else if(solidAt(ox+p.face*10,oy)){ SFX.clang(); sparks(ox+p.face*10,oy,4); } },
  rot:p=>{ const s=p.swingT>0?(1-p.swingT/0.22):0; return p.swingT>0?-1.4+s*2.2:-0.5; },
  sprite(){ px(4,-1,9,2,'#9aa3aa'); px(12,-3,3,2,'#9aa3aa'); px(12,1,3,2,'#9aa3aa'); px(4,-1,9,1,'#c6ccd0'); }});
defWeapon('pistol',{name:'ПИСТОЛЕТ',kind:'clip',cap:17,res:150,reload:1.1,auto:2,
  fire(p,a,ox,oy,base){ p.cool=0.24; stats.shots++; const ang=autoAim(ox,oy,base,420)+rnd(-0.02,0.02);
    const e=hitscan(ox,oy,ang,15,420,40); tracers.push({x0:ox,y0:oy,x1:e.x,y1:e.y,life:0.05}); SFX.pistol(); },
  sprite(){ px(4,-2,6,2,'#2a2e33'); px(4,0,2,2,'#2a2e33'); px(5,-2,4,1,'#4b525a'); }});
defWeapon('shotgun',{name:'ПУШКА',kind:'clip',cap:8,res:48,reload:1.6,auto:3,flash:[14],
  fire(p,a,ox,oy,base){ p.cool=0.9; const ang=autoAim(ox,oy,base,240);
    for(let i=0;i<7;i++){ stats.shots++; const e=hitscan(ox,oy,ang+rnd(-0.13,0.13),10,240,30); tracers.push({x0:ox,y0:oy,x1:e.x,y1:e.y,life:0.05}); }
    SFX.shotgun(); shake=Math.max(shake,3); p.vx-=p.face*40; },
  sprite(){ px(0,-2,13,2,'#2a2e33'); px(5,0,6,1,'#6b4a2a'); px(-3,0,4,2,'#6b4a2a'); }});
defWeapon('pulse',{name:'ИМПУЛСНА ПУШКА',kind:'clip',cap:40,res:200,reload:1.3,auto:4,casing:false,light:'rgba(120,255,170,',flash:[15,'#d8ffe8','#5dffa8'],
  fire(p,a,ox,oy,base){ p.cool=0.085; stats.shots++; const ang=autoAim(ox,oy,base,380)+rnd(-0.035,0.035);
    const e=hitscan(ox,oy,ang,8,380,15); tracers.push({x0:ox,y0:oy,x1:e.x,y1:e.y,life:0.06,col:'120,255,170'}); SFX.pulse(); },
  sprite(){ px(-2,-3,14,3,'#33413a'); px(2,0,5,2,'#33413a'); px(4,-2,6,1,'#5dffa8'); px(11,-2,3,1,'#9affc8'); }});
defWeapon('grenade',{name:'ГРАНАТИ',kind:'mag',cap:10,
  fire(p,a){ p.cool=0.75; SFX.throwG(); p.swingT=0.2;
    const up=p.aimUp; grenades.push({x:p.x+p.w/2+p.face*6,y:p.y+(p.crouch?2:6),vx:p.face*(up?150:230)+p.vx*0.4,vy:up?-330:-190,t:1.6,own:true});
    if(a.mag===0) autoSwitch(); },
  rot:p=>p.swingT>0?-1.2+(1-p.swingT/0.2)*1.6:-0.2,
  sprite(){ px(4,-3,4,4,'#3c4a2a'); px(5,-4,2,1,'#9aa3aa'); }});
defWeapon('rocket',{name:'РАКЕТОМЕТ',kind:'mag',cap:6,
  fire(p,a,ox,oy){ p.cool=1.0; p.flashT=0.08; const base=p.aimUp?(p.face>0?-Math.PI/4:-3*Math.PI/4):(p.face>0?0:Math.PI); const ang=autoAim(ox,oy,base,520);
    rockets.push({x:ox+Math.cos(ang)*6,y:oy+Math.sin(ang)*6,vx:Math.cos(ang)*230,vy:Math.sin(ang)*230,life:4}); SFX.rocket(); shake=Math.max(shake,3); p.vx-=p.face*30;
    light(ox,oy,80,0.8,'rgba(255,180,80,'); stats.shots++;
    if(a.mag===0) autoSwitch(); },
  sprite(p){ px(-6,-4,20,4,'#3d4430'); px(-6,-4,20,1,'#5a6348'); px(13,-5,2,6,'#22261c'); px(2,0,3,3,'#22261c'); if(p.ammo.rocket.mag>0) px(14,-3,2,2,'#c9473a'); }});
