/* ================= РЕЗОНАНС (първата част) =================
   Кампанията (levels_c1…c5.js), босовете, тренировката, влакчето, финалният екран; оцеляването — теми, план и арени.
   classic — нейният HUD и меню на епизодите (виж engine/series.js). */
function r1Logo(){
  overlay(0.72); glitchTitle('РЕЗОНАНС',W/2,98,46);
  centerText('С  Е  К  Т  О  Р     7',126,'600 11px "IBM Plex Mono",monospace',ACC());
}
registerGame({
  id:'r1', order:1, title:'РЕЗОНАНС 1', subtitle:'Сектор 7', name:'РЕЗОНАНС', key:'rz', classic:true,
  radioWho:'Д-Р ИЛИЕВА', voices:{'Д-Р ИЛИЕВА':'#94ff57','ИНСТРУКТОР':'#7fd8ff'},
  blurb:'Първата част — „Резонанс“. Аварията в Сектор 7 на подземния комплекс „Вихрен“.',
  desc:{intro:'Пътуването с подземната мотриса до Сектор 7 — началото на аварията.',
        training:'Инструктаж за безопасност — основи на управлението и оцеляването.',
        campaign:'Четири глави, бонус глава и 25 епизода през подземния комплекс.',
        survival:'Безкрайна поредица от сектори с нарастваща трудност. Колко ще издържиш?'},
  controls:'← → движение · Z стрелба · X скок · C клякане · Q оръжие · P / Esc пауза',
  intro:startTram, training:startTraining, introUpd:dt=>{ if(TR) updTram(dt); }, introRender:renderTram, drawLogo:r1Logo,
  levels:LEVELS, chapters:CH_R1, unlFix:u=>u===20?21:u,   // стар запис 20 (отпреди бонус главата) се чете като 21
  renderWin:r1Win, svSpec:SV1_SPEC, svArena:r1SvArena, svFallback:'hall',
  accent:'#ffa62b', accentRgb:'255,166,43', accent2:'#94ff57', font:'"Russo One",sans-serif', textCol:'#cfd8dc', dimCol:'#7f8e97',
  suit:{suit:'#b5832b',suitD:'#7d5a1f',plate:'#4a5057',plateH:'#6d757d',dark:'#1d2125',helm:'#c9c3b4'},
  glitch:['rgba(120,255,90,0.55)','rgba(255,70,50,0.45)','#ffa62b'], hintCols:['#ffd9a0','#7fd8ff'],
  prog:PROG, menuCam:60,
  debug:{enterR1:()=>enterGame('r1'), TRAIN_LVL, startTraining, startTram, updTram, get TR(){return TR}, get unlocked(){return gUnl}},
});
