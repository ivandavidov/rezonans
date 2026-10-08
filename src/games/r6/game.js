/* ================= РЕЗОНАНС 6 · АКОРД — описание на играта ================= */
const SUIT6={i:{suit:'#3a3a5a',suitD:'#24243c',plate:'#d8d0c0',plateH:'#f0ece0',dark:'#1a1a22',helm:'#e8c25a'},
             m:{suit:'#7a3a5a',suitD:'#4e243a',plate:'#e8d8c8',plateH:'#fff0e0',dark:'#1e1418',helm:'#f0e0b0'}};
registerGame({
  id:'r6', order:6, title:'РЕЗОНАНС 6', subtitle:'Акорд', name:'РЕЗОНАНС 6', key:'rz6',
  blurb:'Шестата част — „Резонанс 6: Акорд“. София, 2026 г. Тонът от детството ти се връща — и този път го чуват и децата.',
  desc:{intro:'София, 3:47 през нощта. Тонът не спира, когато отвориш очи.',
        training:'Сън-урок: Марина те учи да будиш хората, да пееш тона и да събираш нотите.',
        campaign:'Иван, Марина, Никола и Александър. Пет глави, 20 епизода, пет боса — от София до Белинташ.',
        survival:'Безкрайни сектори, генерирани наново при всяко начало.'},
  controls:'← → движение · Z стрелба · X скок · ↑ събуди · E тон / сън · P / Esc пауза',
  levels:LEVELS6, chapters:CH6, radioWho:'МАРИНА', memLabel:'НОТА', sonarName:'СЛУХ',
  heroName:h=>h==='m'?'♦ МАРИНА':'♦ ИВАН',
  intro:startR6Intro, training:startR6Training, introUpd:updR6Intro, introRender:renderR6Intro,
  drawLogo:r6Logo, renderWin:renderWin6, postFx:r6PostFx, epsExtra:r6EpsExtra,
  svPlan:sv6Plan, svBoss:SV6_BOSS, svFallback:'acsof',
  flashlight:true,
  accent:'#e8c25a', accentRgb:'232,194,90', accent2:'#b8a0ff', font:'"Philosopher","Russo One",sans-serif', textCol:'#efe6d0', dimCol:'#9a92a8',
  get suit(){ return SUIT6[(LVL&&LVL.hero)||'i']; },
  glitch:['rgba(184,160,255,0.5)','rgba(232,194,90,0.45)','#fff4d8'], hintCols:['#fff0c8','#e8c25a'],
  prog:PROG6, menuMusic:{tr:-7,bpm:72,alien:true}, menuCam:240,
  eKey:'тон / сън', eBtn:'E<br>тон',
  debug:{enterR6:()=>enterGame('r6'),TRAIN6,LEVELS6,startR6Intro,startR6Training,updR6Intro,renderR6Intro,sv6Plan,r6Finale,tonePulse,get TDOORS(){return TDOORS},get tdoorT(){return tdoorT},get SLEEPERS(){return SLEEPERS},wakeSleeper},
});
