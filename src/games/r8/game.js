/* ================= РЕЗОНАНС 8 · ПРЕНАРЕЖДАНЕ =================
   Плевен, октомври 2029 г. Всички епизоди се генерират наново при всяко начало (engine/episodes.js); сюжетът — notes/r8-design.md. */
function r8Logo(){
  overlay(0.72); const cx=W/2, cy=78, t=titleT;
  ctx.save(); ctx.globalAlpha=0.35; ctx.strokeStyle=ACC(); ctx.lineWidth=1; ctx.beginPath(); ctx.arc(cx,cy,52,0,7); ctx.stroke();
  for(let i=0;i<13;i++){ const a=i/13*Math.PI*2-Math.PI/2, r0=i===0?42:46; ctx.beginPath(); ctx.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0); ctx.lineTo(cx+Math.cos(a)*51,cy+Math.sin(a)*51); ctx.stroke(); }   // тринадесет деления
  const ah=-Math.PI/2+Math.PI*2/12, am=-Math.PI/2+Math.sin(t*0.4)*0.04; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(ah)*26,cy+Math.sin(ah)*26); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(am)*40,cy+Math.sin(am)*40); ctx.stroke(); ctx.restore();
  glitchTitle('РЕЗОНАНС 8',cx,98,40);
  centerText('П  Р  Е  Н  А  Р  Е  Ж  Д  А  Н  Е',126,'600 11px "IBM Plex Mono",monospace',GAME.accent2);
}
function r8Win(){ const e=parseInt(store.get('rz8.ending','0'),10)||0, E=R8_END[e]||R8_END[1], all=memCount()>=memTotal(), t=titleT;
  overlay(0.9); ctx.save(); ctx.strokeStyle=ACCA(0.25); for(let i=0;i<13;i++){ const a=i/13*Math.PI*2+t*0.05; ctx.beginPath(); ctx.moveTo(W/2+Math.cos(a)*60,84+Math.sin(a)*60); ctx.lineTo(W/2+Math.cos(a)*70,84+Math.sin(a)*70); ctx.stroke(); } ctx.restore();
  centerText('ПРЕНАРЕЖДАНЕ',70,'700 30px '+DFONT(),'#fff4e0'); centerText(E.t,96,'600 10px "IBM Plex Mono",monospace',ACC());
  E.win.concat(e===2?[all?'В джоба ѝ шумоли стара пощенска картичка. Не помни откъде е.':'Камбаната на кулата бие точно един път.']:[]).forEach((l,i)=>centerText(l,128+i*14,'600 8px "IBM Plex Mono",monospace','#e8e0cc'));
  centerText('„Резонанс 8: Пренареждане“ е преминат на трудност „'+D.name+'“ · картички: '+memCount()+' / '+memTotal(),196,'600 8px "IBM Plex Mono",monospace','#cfd8dc');
  if(!all) centerText('Събери всичките 20 картички — има и трети край.',210,'600 7px "IBM Plex Mono",monospace',GAME.accent2);
  if(winT>2&&blink()) centerText('Z — към менюто',236,'600 10px "IBM Plex Mono",monospace','#fff4e0'); }
registerGame({
  id:'r8', order:8, title:'РЕЗОНАНС 8', subtitle:'Пренареждане', name:'РЕЗОНАНС 8', key:'rz8',
  radioWho:'ПЕТЪР', voices:{'ПЕТЪР':'#ffd27a','Д-Р ГАНЧЕВА':'#b48cff','ШЕФЪТ':'#9ad8e8'}, memLabel:'КАРТИЧКА', eraHint:'E — СЕГА / СПОМЕН', eraGhost:true,
  blurb:'Осмата част — „Резонанс 8: Пренареждане“. Плевен, 2029 г.',
  desc:{intro:'Нощен Плевен: часовниковата кула бие тринадесет пъти.', training:'Първият курс на Вела — уроци в постоянно променящия се град.',
        campaign:'Пет глави, 20 епизода — различен маршрут при всяко изиграване.', survival:'Безкрайни сектори из пренаредения Плевен.'},
  controls:'← → движение · Z стрелба · X скок · C клякане · E спомен · P / Esc пауза',
  levels:LEVELS_R8, chapters:CH_R8,
  intro:startR8Intro, training:startR8Training, introUpd:updR8Intro, introRender:renderR8Intro,
  drawLogo:r8Logo, renderWin:r8Win,
  svSpec:SV8_SPEC, svArena:r8SvArena, svFallback:'r8center',
  accent:'#ffb04a', accentRgb:'255,176,74', accent2:'#8ad8ff', font:'"Jura","Russo One",sans-serif',
  suit:{suit:'#3a5a8a',suitD:'#24385a',plate:'#2a3040',plateH:'#4a5468',dark:'#10141c',helm:'#e8ecf4'},
  glitch:['rgba(255,176,74,0.55)','rgba(138,216,255,0.45)','#fff4e0'], hintCols:['#ffe2b8','#8ad8ff'],
  menuMusic:{tr:-4,bpm:92,alien:false}, menuCam:120,
});
