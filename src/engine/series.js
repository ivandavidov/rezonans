/* ================= ПОРЕДИЦАТА: регистър на игрите и общо меню =================
   Всяка част се описва с един обект, подаден на registerGame() (виж games/<id>/game.js):
     id, order, title ('РЕЗОНАНС 2'), subtitle ('Отзвук'), name (за HUD), blurb (описание в чужди менюта)
     key        префикс за записите ('rz2' → 'rz2.unlocked', 'rz2.best0' …)
     levels, chapters             кампанията; главата е {t, a, b} (+ по избор label, short, done, col, star — свои надписи
                                  и вид; fin — след последния ѝ епизод идва финалният екран, а след него следващата глава)
     unlFix(u)  поправка на прочетения брой отключени епизоди (r1: стар запис 20 → 21)
     classic    видът на първата част: нейният HUD и меню на епизодите, плочките B=-H остават под декора
     intro(fromMenu), training(fromMenu)        стартират интрото и тренировката
     introUpd(dt), introRender()                ако интрото е кинематографично (state 'gintro')
     desc:{intro,training,campaign,survival}    текстовете под менюто
     drawLogo()  фон и лого в горната част на менюто (до y≈135)
     renderWin(), postFx()        финалният екран и цветовата обработка
     svSpec     планът на секторите (виж svPlanBy в engine/survival.js)
     svBoss / svArena   арените: копия от кампанията {бос:[епизод,тема]} или строител svArena(тип,x,o) (r1)
     svFallback, bossMulOne     резервната тема на генератора; босовете с еднаква сила в оцеляването
     accent, accentRgb, accent2, font, suit, glitch, hintCols, prog, menuMusic, menuCam, controls
     eKey / eBtn   надпис за клавиш E (легенда / бутон на тъч екран), echo, flashlight
     debug        допълнителни полета за window.__rz (тестове)
   Менюто на всяка игра е еднакво: ИНТРО · ТРЕНИРОВКА · КАМПАНИЯ · ОЦЕЛЯВАНЕ, а отдолу — връзки към
   останалите регистрирани игри. Коя игра е включена в сборката решава games/series.json. */
const GAMES=[], GHIST=[];
let GAME=null, gSel=2;
function registerGame(g){ if(GAMES.some(o=>o.id===g.id||o.order===g.order)) throw new Error('registerGame: „'+g.id+'“ — id или order вече е зает');
  GAMES.push(g); GAMES.sort((a,b)=>a.order-b.order); }
const gameById=id=>GAMES.find(g=>g.id===id||g.order===id);
const ACC=()=>GAME.accent, ACCA=a=>`rgba(${GAME.accentRgb},${a})`, DFONT=()=>GAME.font;
const KEY=k=>GAME.key+'.'+k;
function setGame(id){
  const g=gameById(id)||GAMES[0]; GAME=g;
  for(const o of GAMES) document.body.classList.toggle('g-'+o.id,o===g);
  document.body.classList.toggle('has-e',!!g.eBtn);
  GLV=g.levels; GCH=g.chapters; gUnl=unlRead();
  const ek=document.getElementById('ekey'), eb=document.getElementById('ebtn');
  if(ek){ ek.style.display=g.eKey?'':'none'; ek.innerHTML='<kbd>E</kbd>'+(g.eKey||''); }
  if(eb){ eb.style.display=g.eBtn?'':'none'; eb.innerHTML=g.eBtn||'E'; }
}
// отключените епизоди: записът (r1 — и бонус главата); с чийта „Отключени нива“ — всички, без да се пипа записът
function unlRead(){ let u=clamp(parseInt(store.get(KEY('unlocked'),'1'),10)||1,1,GLV.length); if(GAME.unlFix) u=GAME.unlFix(u); return chtOn('unl')?GLV.length:u; }
/* ---------- менюто ---------- */
const MENU_FIX=[{t:'ИНТРО',k:'intro'},{t:'ТРЕНИРОВКА',k:'training'},{t:'КАМПАНИЯ',k:'campaign'},{t:'ОЦЕЛЯВАНЕ',k:'survival'}];
function menuItems(g=GAME){ return MENU_FIX.concat(CHT.open?[CHT_ITEM]:[],GAMES.filter(o=>o!==g).map(o=>({t:o.order<g.order?'◂  '+o.title:o.title+'  ▸',k:'game',id:o.id}))); }
function toMenu(sel){ SURV=false; bossMul=1; ehpMul=1; TRN=null; msg=null; loadLevel(0); state='gmenu'; gSel=sel==null?2:sel; mInt=0; bossMusic=false; cam=0;
  setMusic(GAME.menuMusic||LVL.music); if(AC&&AC.state==='suspended') AC.resume(); }
function enterGame(id,sel){ setGame(id); toMenu(sel); }
function followLink(id){ const i=GHIST.indexOf(id); if(i>=0) GHIST.length=i; else GHIST.push(GAME.id); enterGame(id,2); }
function menuBack(){ if(!GHIST.length){ state='title'; return; } const from=GAME.id; setGame(GHIST.pop()); toMenu(Math.max(0,menuItems().findIndex(m=>m.id===from))); }
function gmenuInput(){
  const it=menuItems(), n=it.length;
  if(pressed.up){ gSel=(gSel+n-1)%n; SFX.menu(); } if(pressed.down){ gSel=(gSel+1)%n; SFX.menu(); }
  if(pressed.esc||pressed.jump){ SFX.menu(); menuBack(); return; }
  if(!ok()) return; SFX.menuOk(); const m=it[gSel];
  if(m.k==='game') followLink(m.id);
  else if(m.k==='intro') GAME.intro(true);
  else if(m.k==='training') GAME.training(true);
  else if(m.k==='cheats') chtOpen('gmenu');
  else { modeSel=m.k==='survival'?1:0; state='diff'; menuSel=DI; }
}
function renderGMenu(){
  const g=GAME, it=menuItems(g), n=it.length;
  g.drawLogo(); ctx.textAlign='left';
  const y0=n>7?140:146, gap=Math.max(8,Math.min(13,Math.floor((214-y0)/(n-1)))), fs=gap>=11?10:9, split=it.filter(m=>m.k!=='game').length;   // всичко се събира над описанието, колкото и части да има
  menuList(it.slice(0,split),gSel<split?gSel:-1,y0,gap,fs);
  const y1=y0+split*gap+4; menuList(it.slice(split),gSel-split,y1,gap,fs);
  const yEnd=y1+(n-split-1)*gap, m=it[gSel], d=m.d||(m.k==='game'?gameById(m.id).blurb:g.desc[m.k]);
  centerText(d,yEnd+14,'600 7px "IBM Plex Mono",monospace',g.textCol||'#cfd8dc');
  if(m.k==='survival') centerText('Рекорди: '+DIFFS.map((q,i)=>q.name.toLowerCase()+' '+survBest(i)).join(' · '),yEnd+24,'600 7px "IBM Plex Mono",monospace',g.accent2);
  centerText('↑ ↓ избор · Z потвърди · Esc / X назад',H-19,'600 7px "IBM Plex Mono",monospace',g.dimCol||'#7f8e97');
  centerText(g.controls,H-8,'600 7px "IBM Plex Mono",monospace',g.dimCol||'#7f8e97');
}
function renderSplash(){
  overlay(0.62); glitchTitle('РЕЗОНАНС',W/2,96,46);
  if(blink()) centerText('Натисни Z или кликни, за да започнеш',166,'600 10px "IBM Plex Mono",monospace','#f3e6cf');
  centerText('← → движение · Z стрелба · X скок · C клякане · Q оръжие',224,'600 7px "IBM Plex Mono",monospace','#7f8e97');
  centerText('M звук · N музика · B ефекти · P / Esc пауза',238,'600 7px "IBM Plex Mono",monospace','#7f8e97');
}
