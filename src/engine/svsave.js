/* ================= ДВИГАТЕЛ · ОЦЕЛЯВАНЕ: запазен напредък =================
   За всяка трудност се пази един запис KEY('svSave')+DI — началото на най-далечния достигнат сектор:
   номер, семе (същите сектори), точки и екипировка. Записва се при влизане в сектор, само ако е по-далеч
   от запазения. „Продължи“ тръгва от този сектор с пълни животи; точките и рекордът продължават да растат.
   След избор на трудност (ако има запис или рекорд) се показва менюто ПРОДЪЛЖИ · НОВО НАЧАЛО · ИЗЧИСТИ. */
let svSel=0, svConf=false, svClrT=-9;
const svKey=(i=DI)=>KEY('svSave')+i;
function svLoad(i=DI){ try{ const o=JSON.parse(store.get(svKey(i),'')); return o&&o.k>0?o:null; }catch(e){ return null; } }
function svSave(k){
  const o=svLoad(); if(k<1||(o&&o.k>=k)) return;
  const p=player, a={}; for(const w in p.ammo) a[w]=[p.ammo[w].mag,p.ammo[w].res];
  store.set(svKey(),JSON.stringify({k,seed:survSeed,score:survScore,w:Object.keys(p.weapons).filter(w=>p.weapons[w]),a,ar:p.armor,hp:Math.round(p.hp),cur:p.cur}));
}
function svApply(o){
  const p=player; for(const w of o.w||[]) if(ORDER.includes(w)) p.weapons[w]=true;
  for(const w in o.a||{}) if(p.ammo[w]){ p.ammo[w].mag=Math.max(p.ammo[w].mag,o.a[w][0]|0); p.ammo[w].res=Math.max(p.ammo[w].res,o.a[w][1]|0); }
  p.armor=o.ar|0; p.hp=clamp(o.hp|0,1,100); if(p.weapons[o.cur]) p.cur=o.cur;
}
function svClear(i=DI){ for(const k of [KEY('best')+i,KEY('bestK')+i,svKey(i)]) store.del(k); svClrT=titleT; }
function svItems(){
  if(svConf) return [{t:'НЕ, ЗАПАЗИ ГИ',k:'no'},{t:'ДА, ИЗЧИСТИ',k:'yes'}];
  const o=svLoad(); return (o?[{t:'ПРОДЪЛЖИ · СЕКТОР '+(o.k+1),k:'cont'}]:[]).concat([{t:'НОВО НАЧАЛО',k:'new'},{t:'ИЗЧИСТИ ПРОГРЕСА',k:'clr'}]);
}
/* след избор на трудност: без запис и рекорд — направо в сектор 1 */
function svEnter(){ if(!svLoad()&&!survBest()) return startSurv(chtSector(),false); state='svmenu'; svSel=0; svConf=false; }
function svMenuInput(){
  const it=svItems(), n=it.length;
  if(pressed.up){ svSel=(svSel+n-1)%n; SFX.menu(); } if(pressed.down){ svSel=(svSel+1)%n; SFX.menu(); }
  if(pressed.jump||pressed.esc){ SFX.menu(); if(svConf){ svConf=false; svSel=svItems().length-1; } else { state='diff'; menuSel=DI; } return; }
  if(!ok()) return; SFX.menuOk(); const k=it[svSel].k;
  if(k==='cont') startSurv(svLoad().k,svLoad());
  else if(k==='new') startSurv(chtSector(),false);
  else if(k==='clr'){ svConf=true; svSel=0; }
  else if(k==='no'){ svConf=false; svSel=svItems().length-1; }
  else { svClear(); svConf=false; state='diff'; menuSel=DI; }
}
function renderSvMenu(){
  overlay(0.8); centerText('ОЦЕЛЯВАНЕ · '+D.name,58,'16px '+DFONT(),ACC());
  const it=svItems(), o=svLoad(), f='600 8px "IBM Plex Mono",monospace';
  menuList(it,svSel,100,24);
  const k=it[svSel].k, y=100+it.length*24+12;
  const d=svConf?['Рекордът и запазеният напредък на трудност „'+D.name+'“ ще бъдат изтрити.','Това не може да се отмени.']
    :k==='cont'?['Продължаваш от началото на сектор '+(o.k+1)+' с '+o.score+' точки и екипировката от тогава.','Животи: '+'♥'.repeat([3,2,1][DI])+' (пълни)']
    :k==='new'?['Започваш от сектор 1 с нови сектори.','Запазеният напредък остава, докато не стигнеш по-далеч.']
    :['Изтрива рекорда и запазения напредък на тази трудност.','Следващото оцеляване започва начисто.'];
  centerText(d[0],y,f,'#cfd8dc'); centerText(d[1],y+13,f,'#cfd8dc');
  centerText('Рекорд: '+bestTxt(DI),214,f,GAME.accent2||'#94ff57');
  centerText('↑ ↓ избор · Z потвърди · Esc / X назад',244,'600 7px "IBM Plex Mono",monospace','#7f8e97');
}
/* ред под екрана за трудност */
function svDiffNote(i){
  if(titleT-svClrT<2.5&&i===DI) return centerText('Прогресът е изчистен.',227,'600 8px "IBM Plex Mono",monospace',ACC());
  const o=svLoad(i); if(o) centerText('Запазен напредък: сектор '+(o.k+1)+' · '+o.score+' точки',227,'600 8px "IBM Plex Mono",monospace','#cfd8dc');
}
