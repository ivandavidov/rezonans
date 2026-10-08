#!/usr/bin/env python3
"""Сборка на поредицата „Резонанс“ в един HTML файл.

  python3 src/build.py                 → docs/index.html (игрите от games/series.json)
  python3 src/build.py r1 r3           → само изброените игри (за проба)
  python3 src/build.py --out x.html …  → друго име на изхода

Изходът е самостоятелен HTML документ (doctype, <head>, <body>) — готов за отваряне
в браузър и за публикуване (напр. GitHub Pages от папка docs/).

Слоеве:
  base/rezonans_v21.html  оригиналният двигател и първата част (не се пипа на ръка)
  ENGINE_HOOKS (по-долу)  точкови куки в оригиналния код — свързват го с двигателя на продълженията
  engine/*.js             общият код: регистър на игрите, меню, механики, плочки, оцеляване
  games/<id>/game.json    манифест: файлове, шрифтове, CSS на играта
  games/<id>/*.js         съдържанието на играта; последният файл вика registerGame({...})

Добавяне на нова част: нова папка games/<id>/ с game.json и game.js (registerGame с order),
после id-то в games/series.json. Махане: изтрий id-то от series.json — нищо друго не се променя.
"""
import json, os, re, sys
from urllib.parse import quote
ROOT=os.path.dirname(os.path.abspath(__file__))
P=lambda *a: os.path.join(ROOT,*a)
args=sys.argv[1:]; out=os.path.join(os.path.dirname(ROOT),'docs','index.html')
if '--out' in args: i=args.index('--out'); out=args[i+1]; del args[i:i+2]
series=args or json.load(open(P('games','series.json')))
games=[(gid,json.load(open(P('games',gid,'game.json'),encoding='utf-8'))) for gid in series]
s=open(P('base','rezonans_v21.html'),encoding='utf-8').read()

def rep(a,b,cnt=1):
    global s
    n=s.count(a)
    if n!=cnt: raise SystemExit(f'hook: count {n}!={cnt} for {a[:90]!r}')
    s=s.replace(a,b)
def cut(a,b_end,new):
    """заменя блока от началото на a до края на първото b_end след него"""
    global s
    i=s.index(a); j=s.index(b_end,i)+len(b_end); s=s[:i]+new+s[j:]

# ---------- HTML / CSS / шрифтове ----------
fams=''.join('&family='+f.replace(' ','+') for _,g in games for f in g.get('fonts',[]))
rep('const dt=Math.min(0.05,(now-last)/1000);','const dt=Math.max(0,Math.min(0.05,(now-last)/1000));')   # първият кадър може да е с отрицателно dt
rep('family=IBM+Plex+Mono:wght@400;600&family=Russo+One&display=swap','family=IBM+Plex+Mono:wght@400;600&family=Russo+One'+fams+'&display=swap')
css='\n'.join(l for _,g in games for l in g.get('css',[]))
rep('@media (pointer:coarse){.touch{display:flex}.keys{display:none}}','body.has-e .acts{grid-template-columns:repeat(5,56px)}\n'+css+'\n@media (pointer:coarse){.touch{display:flex}.keys{display:none}}')
rep('    <span><kbd>P</kbd>пауза</span>\n','    <span><kbd>P</kbd>/<kbd>Esc</kbd>пауза</span>\n    <span id="ekey" style="display:none"><kbd>E</kbd></span>\n')
rep('<button data-k="fire">Z<br>огън</button>','<button data-k="fire">Z<br>огън</button><button data-k="era" id="ebtn" style="display:none">E</button>')
loads=''.join(",document.fonts.load('"+f+"')" for _,g in games for f in g.get('fontLoad',[]))
rep("document.fonts.load('600 10px \"IBM Plex Mono\"')]","document.fonts.load('600 10px \"IBM Plex Mono\"')"+loads+"]")

# ---------- куки в двигателя (SEQ = двигател на продълженията) ----------
rep("  LVL.deco();\n  convTiles=[];","  LVL.deco(); if(SEQ) for(let ty=0;ty<ROWS;ty++) for(let tx=0;tx<COLS;tx++) if('B=-H'.includes(map[ty][tx])) drawTile(tx,ty);\n  convTiles=[];")
rep('U=ctrl&&keys.up, Dn=ctrl&&keys.down','U=ctrl&&(SEQ&&FLIP?keys.down:keys.up), Dn=ctrl&&(SEQ&&FLIP?keys.up:keys.down)')
rep("KeyM:'mute',","KeyM:'mute',KeyN:'music',KeyB:'sfx',KeyE:'era',")
rep("Escape:'pause'","Escape:'esc'")
# звук (engine/audio.js): музиката и ефектите се спират поотделно; M спира всичко, ако нещо свири
rep("function toggleMute(){ muted=!muted; if(master) master.gain.value=muted?0:0.85; }\n","")
rep("master.gain.value=muted?0:0.85;","master.gain.value=0.85;")
rep("sfxBus=AC.createGain(); sfxBus.gain.value=0.9;","sfxBus=AC.createGain(); sfxBus.gain.value=sfxOn?0.9:0;")
rep("musBus=AC.createGain(); musBus.gain.value=0.5;","musBus=AC.createGain(); musBus.gain.value=musOn?0.5:0;")
rep("function mSched(){\n  if(!AC||AC.state!=='running') return;","function mSched(){\n  if(!AC||AC.state!=='running'||!musOn) return;")
rep("if(k==='mute'&&!e.repeat) toggleMute();","if(!e.repeat){ if(k==='mute') toggleMute(); else if(k==='music') toggleMus(); else if(k==='sfx') toggleSfx(); }")
rep("document.querySelectorAll('#touch button').forEach","document.querySelectorAll('#touch button[data-k]').forEach")
rep('<button class="u" data-k="up">▲</button>','<button class="am" id="bmus" data-a="mus" aria-label="музика">♪</button><button class="u" data-k="up">▲</button><button class="as" id="bsfx" data-a="sfx" aria-label="ефекти">FX</button>')
rep('.pad .u{grid-column:2;grid-row:1}','.pad .am,.pad .as{grid-row:1;width:72%;height:72%;align-self:start;font-size:11px;border-style:dashed}.pad .am{grid-column:1;justify-self:start}.pad .as{grid-column:3;justify-self:end}.touch button.off{opacity:.35}\n.pad .u{grid-column:2;grid-row:1}')
# тъч бутони: Esc (пауза в игра, назад в менютата) — малък бутон над действията
rep('<div class="acts">\n      ','<div class="acts">\n      <button class="esc" data-k="esc" aria-label="пауза / назад">Esc · пауза</button>')
rep('.acts button{height:56px;border-radius:50%}','.acts button{height:56px;border-radius:50%;grid-row:2}'
    '.acts .esc{grid-row:1;grid-column:1/-1;justify-self:end;height:30px;padding:0 12px;border-radius:10px;border-style:dashed;font-size:11px}')
# тесен екран: действията на два реда (горе Q C [E], долу X Z), размерът следва ширината — нищо не излиза извън екрана
# хоризонтален тъч екран: стрелките вляво, екранът в средата, бутоните вдясно (две колони: Q C / [E] / X Z)
rep('@media (max-width:420px){.pad{grid-template-columns:repeat(3,44px);grid-template-rows:repeat(2,44px)}.acts{grid-template-columns:repeat(4,46px)}.acts button{height:46px}}',
    '@media (max-width:540px){.touch{--u:min(56px,calc((100vw - 68px)/5))}body.has-e .touch{--u:min(56px,calc((100vw - 76px)/6))}'
    '.pad{grid-template-columns:repeat(3,var(--u));grid-template-rows:repeat(2,var(--u))}.acts,body.has-e .acts{grid-template-columns:repeat(2,var(--u));grid-template-rows:auto repeat(2,var(--u))}body.has-e .acts{grid-template-columns:repeat(3,var(--u))}.acts button{height:var(--u)}'
    '.acts [data-k=swap]{grid-area:2/1}.acts [data-k=crouch]{grid-area:2/2}.acts [data-k=jump]{grid-area:3/1}.acts [data-k=fire]{grid-area:3/2}'
    'body.has-e .acts [data-k=era]{grid-area:2/3}body.has-e .acts [data-k=jump]{grid-area:3/2}body.has-e .acts [data-k=fire]{grid-area:3/3}}\n'
    '@media (pointer:coarse) and (orientation:landscape){.wrap{display:grid;grid-template-columns:auto minmax(0,1fr) auto;grid-template-areas:"pad screen acts";align-items:center;gap:12px;padding:12px;height:100%}'
    '.touch{display:contents;--u:clamp(40px,calc((45vw - 72px)/5),56px)}.screen{grid-area:screen;justify-self:center;width:min(100%,calc((100vh - 24px)*1.7647))}'
    '.pad{grid-area:pad;grid-template-columns:repeat(3,var(--u));grid-template-rows:repeat(2,var(--u))}.pad,.acts{user-select:none;-webkit-user-select:none;touch-action:none}'
    '.acts,body.has-e .acts{grid-area:acts;grid-template-columns:repeat(2,var(--u));grid-template-rows:auto repeat(2,var(--u))}body.has-e .acts{grid-template-rows:auto repeat(3,var(--u))}.acts button{height:var(--u)}'
    '.acts [data-k=swap]{grid-area:2/1}.acts [data-k=crouch]{grid-area:2/2}.acts [data-k=jump]{grid-area:3/1}.acts [data-k=fire]{grid-area:3/2}'
    'body.has-e .acts [data-k=era]{grid-area:3/2}body.has-e .acts [data-k=jump]{grid-area:4/1}body.has-e .acts [data-k=fire]{grid-area:4/2}}')
rep('    <span><kbd>M</kbd>звук</span>\n','    <span><kbd>M</kbd>звук</span>\n    <span><kbd>N</kbd>музика</span>\n    <span><kbd>B</kbd>ефекти</span>\n')
rep("  render();\n  requestAnimationFrame(frame);","  render(); audDraw();\n  requestAnimationFrame(frame);")
rep("function drawEmitter(){\n  if(LVL.n!==1) return;","function drawEmitter(){\n  if(LVL.n!==1||SEQ) return;")
rep("const LV=document.createElement('canvas');","let LV=document.createElement('canvas');")
rep("LI=i; LVL=obj||LEVELS[i];","LI=i; LVL=obj||(SEQ?GLV:LEVELS)[i];")
rep("  if(LVL.onLoad) LVL.onLoad();\n}","  r2Load(); if(LVL.onLoad) LVL.onLoad();\n}")
rep("  if(LVL.n===1) scientists.push(","  if(LVL.n===1&&!SEQ) scientists.push(")
rep("  if(LVL.n===1){ L.push([121.5*T,","  if(LVL.n===1&&!SEQ){ L.push([121.5*T,")
rep("function setCp(tx){ cp=tx; }","function setCp(tx){ cp=tx; r2SetCp(); }")
rep("  if(C&&!p.crouch&&!p.climb){ p.crouch=true;","  if(C&&!p.crouch&&!p.climb&&!p.swim){ p.crouch=true;")
rep("  if(p.climb){\n    p.aimUp=false; p.vy=U?-90:Dn?90:0;","  if(r2Move(p,dt,dir,U,Dn)){}\n  else if(p.climb){\n    p.aimUp=false; p.vy=U?-90:Dn?90:0;")
rep("    p.vy=Math.min(p.vy+G*dt,520);\n    const wasAir=!p.onGround, vyB=p.vy;","    p.vy=Math.min(p.vy+G*dt,520); r2Wind(p,dt);\n    const wasAir=!p.onGround, vyB=p.vy;")
rep("  if(LVL.tick) LVL.tick(dt);\n  updLifts();","  if(LVL.tick) LVL.tick(dt);\n  updLifts(); r2Update(dt);")
rep("if(LVL.exit&&p.x>LVL.exit*T&&!p.dead) completeLevel();","if(LVL.exit&&p.x>LVL.exit*T&&!p.dead&&r2ExitOk()) completeLevel();")
rep("target:updTarget,","target:updTarget,...R2UPD,")
rep("target:drawTarget})","target:drawTarget,...R2DRAW})")
rep("titan:updTitan})[boss.type](dt);","titan:updTitan,...R2B.upd})[boss.type](edt);")
rep("titan:drawTitan})[boss.type]();","titan:drawTitan,...R2B.draw})[boss.type]();")
rep("titan:makeTitan})[LVL.arena.type]();","titan:makeTitan,...R2B.make})[LVL.arena.type]();")
rep("titan:hurtTitan})[boss.type](d,blast);","titan:hurtTitan,...R2B.hurt})[boss.type](d,blast);")
rep("showMsg(BOSS_INTRO[a.type],4.5);","showMsg(BOSS_INTRO[a.type]||R2B.intro[a.type],4.5);")
rep("function respawn(){\n  const p=player;","function respawn(){\n  r2PreRespawn(); const p=player;")
rep("  cam=clamp(p.x-W/2,0,COLS*T-W); if(bossActive&&LVL.arena.lock!==false) cam=lockCam(); state='play';\n}","  r2Respawn(); cam=clamp(p.x-W/2,0,COLS*T-W); if(bossActive&&LVL.arena.lock!==false) cam=lockCam(); state='play';\n}")
rep("  if(LI+2>unlocked&&LI<LEVELS.length-1){ unlocked=LI+2; store.set('rz.unlocked',unlocked); }","  if(SEQ){ if(LI+2>gUnl&&LI<GLV.length-1){ gUnl=LI+2; store.set(KEY('unlocked'),gUnl); } }\n  else if(LI+2>unlocked&&LI<LEVELS.length-1){ unlocked=LI+2; store.set('rz.unlocked',unlocked); }")
rep("function renderWorld(){\n  ctx.save();\n","function renderWorld(){\n  ctx.save(); if(FLIP){ ctx.translate(0,H); ctx.scale(1,-1); }\n")
rep("  drawEmitter();\n","  drawEmitter(); r2DrawBack();\n")
rep("  if(player) drawPlayer();\n","  if(player) drawPlayer(); r2DrawWorld();\n")
rep("  for(const b of barks){ const x=b.e.x","  if(!FLIP) for(const b of barks){ const x=b.e.x")
rep("  cam=saveCam;\n  ctx.restore();\n}\nfunction renderSurvOver","  cam=saveCam;\n  ctx.restore(); r2PostFx();\n}\nfunction renderSurvOver")
rep("  lc.globalCompositeOperation='source-over'; lc.clearRect(0,0,240,136);","  r2Lights(L);\n  lc.globalCompositeOperation='source-over'; lc.clearRect(0,0,240,136);")
rep("function drawHUD(){\n","function drawHUD(){ if(SEQ) return drawHUD2();\n")
rep("  const x=Math.round(k.x-cam), y=Math.round(k.y+(k.vy===undefined?Math.sin(titleT*3+k.bob)*1.5:0));\n","  const x=Math.round(k.x-cam), y=Math.round(k.y+(k.vy===undefined?Math.sin(titleT*3+k.bob)*1.5:0));\n  if(R2_PDRAW[k.type]) return R2_PDRAW[k.type](k,x,y);\n")
rep("function takePickup(k){\n  const p=player, m=D.ammo;\n","function takePickup(k){\n  const p=player, m=D.ammo;\n  if(R2_TAKE[k.type]){ if(R2_TAKE[k.type](k)===false) return; k.taken=true; if(k.respawn) k.rt=k.respawn; return; }\n")
rep("function updScientist(s,dt){\n","function updScientist(s,dt){ if(s.esc) return updEscort(s,dt);\n")
rep("function drawScientist(s){","function drawScientist(s){ if(s.esc) return drawEscort(s);")
rep("function killSci(s){ if(s.state==='dead') return;","function killSci(s){ if(s.esc){ escHurt(25); return; } if(s.state==='dead') return;")
rep("mech=e.type==='turret'||e.type==='pylon'||e.type==='target'","mech=e.type==='turret'||e.type==='pylon'||e.type==='target'||!!e.mech")
rep("function drawTile(tx,ty){\n  const ch=map[ty][tx],x=tx*T,y=ty*T,P=TP(tx),z=zoneAt(tx);\n","function drawTile(tx,ty){\n  const ch=map[ty][tx],x=tx*T,y=ty*T,P=TP(tx),z=zoneAt(tx);\n  if(SEQ&&r2Tile(tx,ty,ch,x,y,P,z)) return;\n")
rep("  if(LVL.vent&&tx>=LVL.vent[0]&&tx<=LVL.vent[1]&&ty===14){","  if(SEQ) r2BackDeco(tx,ty,x,y,z,P);\n  if(LVL.vent&&tx>=LVL.vent[0]&&tx<=LVL.vent[1]&&ty===14){")
rep("    else for(let k=0;k<L.n;k++){ const cx=hash(k,L.seed)*1024, cy=L.y+hash(L.seed,k)*L.dy, w=18+hash(k,k+L.seed)*L.w;","    else if(r2SkyLayer(L,x)){}\n    else for(let k=0;k<L.n;k++){ const cx=hash(k,L.seed)*1024, cy=L.y+hash(L.seed,k)*L.dy, w=18+hash(k,k+L.seed)*L.w;")
# застинало време: враговете, снарядите и босът ползват edt=dt*timeScale()
rep("function update(dt){\n  const p=player; lvT+=dt;","function update(dt){\n  const p=player; lvT+=dt; const edt=dt*timeScale();")
rep("pylon:(e,dt)=>{e.anim+=dt;}})[e.type](e,dt);","pylon:(e,dt)=>{e.anim+=dt;}})[e.type](e,edt);")
rep("    if(b.grav) b.vy+=G*dt;","    if(b.grav) b.vy+=G*edt;")
rep("    b.x+=b.vx*dt; b.y+=b.vy*dt; b.life-=dt;","    b.x+=b.vx*edt; b.y+=b.vy*edt; b.life-=edt;")
rep("  for(const o of orbs){ o.x+=o.vx*dt; o.life-=dt;","  for(const o of orbs){ o.x+=o.vx*edt; o.life-=edt;")
# вълни: спускат се и паяци/зомбита — само войниците викат по радиото; репликата е на първия войник (не на първия враг)
rep("function spawnWave(list){\n  let i=0;","function spawnWave(list){\n  let i=0, said=false;")
rep("enemies.push(e); sfxAt('radio',e); if(i===0) bark(e,'Ето го!',1.5); }","enemies.push(e);\n      if(type==='soldier'){ sfxAt('radio',e); if(!said){ said=true; const B=LVL.barks||['Ето го!','Огън!','Там е!']; bark(e,B[Math.floor(rnd(B.length))],1.5); } }\n      else { const sn={crab:'crabIdle',zombie:'zgroan',shocker:'growl'}[type]; if(sn) sfxAt(sn,e); } }")
rep("function radio(t){ showMsg(t,0,'Д-Р ИЛИЕВА');","function radio(t){ showMsg(t,0,GAME.radioWho||'Д-Р ИЛИЕВА');")
# тонът: зашеметеният враг замръзва
rep("    e.hitT-=dt; e.flashT=(e.flashT||0)-dt;\n","    e.hitT-=dt; e.flashT=(e.flashT||0)-dt;\n    if(e.stunT>0){ e.stunT-=dt; continue; }\n")
# честоти: снаряд в твоя тон минава през теб
rep("    else if(!p.dead){ const r=b.r||0, nx=clamp(b.x,p.x,p.x+p.w)","    else if(!p.dead&&!(b.fq!=null&&b.fq===FREQ)){ const r=b.r||0, nx=clamp(b.x,p.x,p.x+p.w)")
# честоти: враг в друг тон не поема щети
rep("  if(e.dead) return; e.hp-=d; e.hitT=0.08;","  if(e.dead) return; if(e.fq!=null&&LVL.freq&&e.fq!==FREQ){ e.hitT=0.04; sparks(e.x+e.w/2,e.y+e.h/2,2,'#a8a8b8'); return; } e.hp-=d; e.hitT=0.08;")
# изгледът на играта идва от описанието й (GAME)
rep("const suit='#b5832b', suitD='#7d5a1f', plate='#4a5057', plateH='#6d757d', dark='#1d2125', helm='#c9c3b4';",
    "const {suit,suitD,plate,plateH,dark,helm}=GAME.suit;\n  if(p.swim&&!p.onGround&&!p.dead&&!p.climb){ ctx.translate(0,-12); ctx.rotate(0.9); ctx.translate(0,12); }")
rep("const bar=Math.floor(s/16)%4, st=s%16, P=PROG[bar]","const bar=Math.floor(s/16)%4, st=s%16, P=(GAME.prog||PROG)[bar]")
s=re.sub(r"'(\d+)px \"Russo One\",sans-serif'",lambda m:"'"+m.group(1)+"px '+DFONT()",s)
rep('ctx.font=`${size}px "Russo One",sans-serif`;','ctx.font=`${size}px ${DFONT()}`; { const mw=ctx.measureText(txt).width; if(mw>W-28){ size=Math.floor(size*(W-28)/mw); ctx.font=`${size}px ${DFONT()}`; } }')
rep("  ctx.fillStyle='rgba(120,255,90,0.55)'; ctx.fillText(txt,x-2+j,y);\n  ctx.fillStyle='rgba(255,70,50,0.45)'; ctx.fillText(txt,x+2-j,y+1);\n  ctx.fillStyle='#ffa62b';",
    "  ctx.fillStyle=GAME.glitch[0]; ctx.fillText(txt,x-2+j,y);\n  ctx.fillStyle=GAME.glitch[1]; ctx.fillText(txt,x+2-j,y+1);\n  ctx.fillStyle=GAME.glitch[2];")
a=s.index('function menuList(items,sel,y0,gap,fs=12){'); b=s.index('\n}',a)
s=s[:a]+s[a:b].replace("'rgba(255,166,43,0.12)'","ACCA(0.12)").replace("'#ffa62b'","ACC()")+s[b:]
a=s.index('function drawKeyHint(t,y){'); b=s.index('\n}',a)
s=s[:a]+s[a:b].replace("'#ffa62b'","ACC()").replace("'#ffd9a0'","GAME.hintCols[0]").replace("'#7fd8ff'","GAME.hintCols[1]")+s[b:]
for t in ["centerText('ИЗБЕРИ ТРУДНОСТ',58,'16px '+DFONT(),'#ffa62b')","centerText('ПАУЗА',124,'28px '+DFONT(),'#ffa62b')"]:
    rep(t,t.replace("'#ffa62b'","ACC()"))

# ---------- екрани ----------
rep("  if(state==='tram'&&TR){ renderTram(); return; }","  if(state==='gintro'){ GAME.introRender(); return; }\n  if(state==='tram'&&TR){ renderTram(); return; }")
cut("  if(state==='title'){\n    overlay(0.62);","    return;\n  }\n","  if(state==='title'){ renderSplash(); return; }\n  if(state==='gmenu'){ renderGMenu(); return; }\n")
cut("  if(state==='mode'){\n    overlay(0.8);","    return;\n  }\n","")
rep("  if(state==='eps'){\n    overlay(0.8); centerText('ИЗБЕРИ ЕПИЗОД'","  if(state==='eps'&&SEQ){ renderEps2(); return; }\n  if(state==='eps'){\n    overlay(0.8); centerText('ИЗБЕРИ ЕПИЗОД'")
rep("centerText(LVL.training?'ПОДГОТОВКА · ПРЕДИ СЕКТОР 7':","centerText(SEQ&&!LVL.training?('ГЛАВА '+ROM[gChOf(LI)]+' · '+GCH[gChOf(LI)].t+'   ·   ЕПИЗОД '+LVL.n):LVL.training?(LVL.hdrS||'ПОДГОТОВКА · ПРЕДИ СЕКТОР 7'):")
rep("centerText((LVL.training?'ТРЕНИРОВКАТА Е ЗАВЪРШЕНА':","centerText((SEQ&&!LVL.training?(LI===GCH[gChOf(LI)].b?'ГЛАВА '+ROM[gChOf(LI)]+' ЗАВЪРШЕНА':'ЕПИЗОД '+LVL.n+' ПРЕМИНАТ'):LVL.training?'ТРЕНИРОВКАТА Е ЗАВЪРШЕНА':")
rep("centerText(LVL.training?(TRN&&TRN.fromMenu?'Z — към менюто':'Z — към Сектор 7'):","centerText(SEQ&&!LVL.training?(LI<GLV.length-1?'Z — към следващия епизод':'Z — продължи'):LVL.training?(TRN&&TRN.fromMenu?'Z — към менюто':(LVL.hdrN||'Z — към Сектор 7')):")
rep("  if(state==='win'){ overlay(0.9); const bonus=LI===24;","  if(state==='win'&&SEQ){ GAME.renderWin(); }\n  else if(state==='win'){ overlay(0.9); const bonus=LI===24;")
rep("Z или P — продължи · C — главно меню',148,'600 9px \"IBM Plex Mono\",monospace','#cfd8dc');","Z или P — продължи · Esc — изход в менюто',148,'600 9px \"IBM Plex Mono\",monospace','#cfd8dc'); audPauseLine();")
rep("'Esc / Enter / Q — пропусни интрото'","'Enter / Q — пропусни интрото  ·  Esc — назад'")
s=s.replace('Z потвърди · X назад','Z потвърди · Esc / X назад').replace('Z начало · X назад','Z начало · Esc / X назад')

# ---------- навигация: всички менюта минават през toMenu() ----------
a=s.index('function toTitle(){'); b=s.index('\n',a)
s=s[:a]+"function toTitle(){ const ms=SURV?3:(LVL&&LVL.training)?1:2; if(SURV&&(state==='play'||state==='paused'||state==='dead')) saveSurv(survScore+stats.kills*10,survK+1); toMenu(ms); }"+s[b:]
rep("if(fm){ loadLevel(0); state='mode'; menuSel=3; }","if(fm) toMenu(0);")
rep("if(fm){ loadLevel(0); state='mode'; menuSel=2; }","if(fm) toMenu(1);")
rep("  if(pressed.pause||pressed.enter||pressed.swap){ finishTram(); return; }","  if(pressed.esc){ const fm=TR.fromMenu; TR=null; msg=null; toMenu(fm?0:2); return; }\n  if(pressed.pause||pressed.enter||pressed.swap){ finishTram(); return; }")
rep("  if(state==='title'){ cam=(Math.sin(titleT*0.05)*0.5+0.5)*60; if(ok()){ initAudio(); SFX.menuOk(); state='mode'; menuSel=modeSel; } clearPressed(); }\n  else if(state==='tram'){ if(TR) updTram(dt); clearPressed(); }",
    "  if(state==='title'){ cam=(Math.sin(titleT*0.05)*0.5+0.5)*(GAME.menuCam||60); if(ok()){ initAudio(); SFX.menuOk(); toMenu(modeSel+2); } clearPressed(); }\n  else if(state==='tram'){ if(TR) updTram(dt); clearPressed(); }\n  else if(state==='gintro'){ GAME.introUpd(dt); clearPressed(); }\n  else if(state==='gmenu'){ cam=(Math.sin(titleT*0.05)*0.5+0.5)*(GAME.menuCam||60); gmenuInput(); clearPressed(); }")
cut("  else if(state==='mode'){\n","    clearPressed();\n  }\n","")
rep("  else if(state==='survOver'){","  else if((state==='survOver'||state==='win')&&pressed.esc){ clearPressed(); toTitle(); }\n  else if(state==='survOver'){")
rep("if(modeSel===1) startSurv(0,false); else { state='eps'; menuSel=unlocked-1; } }","if(modeSel===1) svEnter(); else if(SEQ){ state='eps'; menuSel=gUnl-1; } else { state='eps'; menuSel=unlocked-1; } }")
rep("    else if(pressed.jump){ state='mode'; menuSel=modeSel; SFX.menu(); }","    else if(pressed.jump||pressed.esc){ toMenu(modeSel===1?3:2); SFX.menu(); }")
rep("  else if(state==='eps'){\n    { const ch=chOf(menuSel)","  else if(state==='eps'&&SEQ){ r2EpsInput(); clearPressed(); }\n  else if(state==='eps'){\n    { const ch=chOf(menuSel)")
rep("    else if(pressed.jump){ state='diff'; menuSel=DI; SFX.menu(); }","    else if(pressed.jump||pressed.esc){ state='diff'; menuSel=DI; SFX.menu(); }")
rep("else if(SURV) startSurv(survK+1,true); else if(LI<LEVELS.length-1&&LI!==19)","else if(SURV) startSurv(survK+1,true); else if(SEQ){ if(LI<GLV.length-1) startEpisode(LI+1,true); else { state='win'; winT=0; } } else if(LI<LEVELS.length-1&&LI!==19)")
rep("  else if(state==='win'){ winT+=dt; if(winT>2){ if(LI===19&&ok())","  else if(state==='win'&&SEQ){ winT+=dt; if(winT>2&&ok()){ SFX.menuOk(); toMenu(2); } clearPressed(); }\n  else if(state==='win'){ winT+=dt; if(winT>2){ if(LI===19&&ok())")
rep("    if(pressed.pause){ state='paused'; if(AC) AC.suspend(); clearPressed(); }","    if(pressed.pause||pressed.esc){ state='paused'; if(AC) AC.suspend(); clearPressed(); }")
rep("  else if(state==='paused'){ if(pressed.pause||ok()){ state='play'; if(AC) AC.resume(); } else if(pressed.crouch){ toTitle(); } clearPressed(); }","  else if(state==='paused'){ if(pressed.esc||pressed.crouch){ clearPressed(); toTitle(); } else if(pressed.pause||ok()){ state='play'; if(AC) AC.resume(); } clearPressed(); }")
rep("  else if(state==='dead'){ deadT+=dt;","  else if(state==='dead'&&pressed.esc){ clearPressed(); toTitle(); }\n  else if(state==='dead'){ deadT+=dt;")
rep("  else if(state==='story'){ storyT+=dt;","  else if(state==='story'&&pressed.esc){ clearPressed(); toTitle(); }\n  else if(state==='story'){ storyT+=dt;")
rep("  else if(state==='levelEnd'){ endT+=dt;","  else if(state==='levelEnd'&&pressed.esc){ clearPressed(); toTitle(); }\n  else if(state==='levelEnd'){ endT+=dt;")

# ---------- оцеляване ----------
rep("function svPlan(k){\n","function svPlan(k){ if(SEQ) return GAME.svPlan(k);\n")
rep("function genLevel(k){\n","function genLevel(k){ if(SEQ) return svGen(k);\n")
rep("if(LVL.arena) bossMul*=BOSS_NORM[LVL.arena.type]||1;","if(LVL.arena) bossMul*=BOSS_NORM[LVL.arena.type]||1; if(SEQ&&LVL.arena&&(GAME.bossMulOne||[]).includes(LVL.arena.type)) bossMul=1;")
# генератор на сектори (r1): нищо не се поставя в колона със затворена врата (засада, гнездо, арена),
# а общите аптечка/батерия/ракети на арената стоят върху терена (при червея има первази на редове 13–14)
rep("safe=(x,y)=>{ const id=y*cols+x; return kind[id]===1&&!V.virt[id]&&R[id]&&Q[id]; };","safe=(x,y)=>{ const id=y*cols+x; return kind[id]===1&&!V.virt[id]&&R[id]&&Q[id]&&!(y>0&&g[y-1][x]==='D'); };")
rep("  fixed.push(['health',d+2,14,'E'],['battery',d+4,14]); if(k>=10&&!['tank','titan'].includes(type)) fixed.push(['rocketsR',d+2,14],['rocketsR',d+27,14]);",
    "  const top=x=>{ let y=14; while(y>0&&o.g[y][x]!=='.') y--; return y; };\n  fixed.push(['health',d+2,top(d+2),'E'],['battery',d+4,top(d+4)]); if(k>=10&&!['tank','titan'].includes(type)) fixed.push(['rocketsR',d+2,top(d+2)],['rocketsR',d+27,top(d+27)]);")
rep("const survBest=(i=DI)=>parseInt(store.get('rz.best'+i,'0'),10)||0;","const survBest=(i=DI)=>parseInt(store.get(KEY('best')+i,'0'),10)||0;")
rep("const survBestK=(i=DI)=>parseInt(store.get('rz.bestK'+i,'0'),10)||0;","const survBestK=(i=DI)=>parseInt(store.get(KEY('bestK')+i,'0'),10)||0;")
rep("store.set('rz.best'+DI,score); store.set('rz.bestK'+DI,sector);","store.set(KEY('best')+DI,score); store.set(KEY('bestK')+DI,sector);")
# запазен напредък (engine/svsave.js): startSurv(k,запис) продължава от запис, всеки нов сектор се записва
rep("set(k,v){try{localStorage.setItem(k,String(v));}catch(e){}}};","set(k,v){try{localStorage.setItem(k,String(v));}catch(e){}},del(k){try{localStorage.removeItem(k);}catch(e){}}};")
rep("function startSurv(k,carry){\n  const prev=carry?player:null;","function startSurv(k,carry){\n  const sv=carry&&carry!==true?carry:null; if(sv) carry=false; const prev=carry?player:null;")
rep("survNewBest=false; survStartBest=survBest(); }","survNewBest=false; survStartBest=survBest(); if(sv){ survSeed=sv.seed; survScore=sv.score|0; } }")
rep("  state='play'; mInt=0; storyT=0;\n  showMsg('СЕКТОР '","  if(sv) svApply(sv); svSave(k);\n  state='play'; mInt=0; storyT=0;\n  showMsg('СЕКТОР '")
rep("  if(state==='survOver'){ renderSurvOver(); return; }","  if(state==='svmenu'){ renderSvMenu(); return; }\n  if(state==='survOver'){ renderSurvOver(); return; }")
rep("  else if(state==='diff'){\n","  else if(state==='svmenu'){ svMenuInput(); clearPressed(); }\n  else if(state==='diff'){\n")
rep("' · рекорд: '+bestTxt(menuSel),214,'600 8px \"IBM Plex Mono\",monospace','#94ff57');","' · рекорд: '+bestTxt(menuSel),214,'600 8px \"IBM Plex Mono\",monospace','#94ff57'); if(modeSel===1) svDiffNote(menuSel);")

# ---------- тестов достъп ----------
a=s.index('window.__rz={'); b=s.index('\n',a)
s=s[:a]+"window.__rz={get SEQ(){return SEQ},get R2(){return SEQ},get R3(){return GAME.id==='r3'},get GAME(){return GAME},GAMES,GHIST,setGame,enterGame,toMenu,menuItems,get gSel(){return gSel},get r2Sel(){return gSel},r2ToTitle:()=>toMenu(2),leaveR2:()=>enterGame(GAMES[0].id),get LEVELS2(){return GLV},hurtEnemy,get ECHO(){return ECHO},get PLATES(){return PLATES},get LIGHTS(){return LIGHTS},get TERMS(){return TERMS},get ALARM(){return ALARM},get NOISE(){return NOISE},get MST(){return MST},get FLOOD(){return FLOOD},get ESC(){return ESC},get CHASE(){return CHASE},get ERA(){return ERA},get FLIP(){return FLIP},get GENS(){return GENS},get LEVERS(){return LEVERS},get SHIFT(){return SHIFT},get ALLIES(){return ALLIES},switchEra,flipWorld,isWater,get pickups(){return pickups},get scientists(){return scientists},get barks(){return barks},solidAt,startBoss,respawn,get cp(){return cp},hurtBoss,get musOn(){return musOn},get AC(){return AC},get musBus(){return musBus},get sfxBus(){return sfxBus},get sfxOn(){return sfxOn},toggleMute,toggleMus,toggleSfx,svLoad,svSave,svClear,svEnter,svItems,get svSel(){return svSel},get svConf(){return svConf},get DI(){return DI},get survLives(){return survLives},get survSeed(){return survSeed},"+s[a+len('window.__rz={'):b]+"\nfor(const g of GAMES) if(g.debug) Object.defineProperties(window.__rz,Object.getOwnPropertyDescriptors(g.debug));"+s[b:]

# ---------- код: двигател + игрите от поредицата ----------
def rd(*p): return open(P(*p),encoding='utf-8').read()
code=['/* ================= ДВИГАТЕЛ ================= */']+[rd('engine',f) for f in ['series.js','sequel.js','world.js','mech.js','mech2.js','mech3.js','mech4.js','mech5.js','survival.js','svsave.js','audio.js']]
for gid,g in games:
    code.append(f'/* ================= ИГРА: {gid} ================= */')
    code+= [rd('games',gid,f) for f in g['files']]
code.append("if(!GAMES.length) throw new Error('Няма регистрирани игри'); setGame(GAMES[0].id);")
# Р1 „Лифтът“: сандъците и площадката бяха скрити зад горната станция (невидими препятствия) — изнесени вдясно от нея
rep("F(126,13,127,14,'B'); F(132,12,135,12,'-');","F(142,13,143,14,'B');")
rep("['ammo',133,11],['health',138,14]","['ammo',133,14],['health',138,14]")
rep("/* ================= LOOP","\n".join(code)+"\n/* ================= LOOP")

allcode='\n'.join(code)
left=[w for w in ['R3','R2','r2title',"state='mode'","'r2intro'",'LEVELS2','unlocked2','MO'] if re.search(r'(?<![\w])'+re.escape(w)+r'(?![\w])',allcode)]
if left: raise SystemExit('остатъци от старата архитектура: '+', '.join(left))
# всяко глобално име трябва да е уникално — иначе една игра тихо подменя функция на друга
import collections
tops=collections.Counter(a or b for a,b in re.findall(r'^(?:function\s+(\w+)|(?:const|let)\s+(\w+)\s*=)',s,re.M))
dup=[k for k,v in tops.items() if v>1]
if dup: raise SystemExit('дублирани глобални имена: '+', '.join(dup))

# ---------- изход: пълноценен HTML документ ----------
# base е фрагмент (title, шрифтове, style, после разметка и script) — style отива в <head>, останалото в <body>
i=s.index('</style>')+len('</style>')
head,body=s[:i].strip(),s[i:].strip()
icon=('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#080b0d"/>'
      '<path d="M3 16h5l3-9 5 18 4-14 3 5h6" fill="none" stroke="#ffa62b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>')
doc=f'''<!doctype html>
<html lang="bg">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="Резонанс — поредица ретро екшън игри, които се играят направо в браузъра.">
<meta name="theme-color" content="#080b0d">
<link rel="icon" href="data:image/svg+xml,{quote(icon)}">
{head}
<style>html,body{{margin:0}}</style>
</head>
<body>
{body}
</body>
</html>
'''
os.makedirs(os.path.dirname(os.path.abspath(out)),exist_ok=True)
open(out,'w',encoding='utf-8').write(doc)
print('built', out, len(doc), 'games:', ', '.join(g for g,_ in games))
