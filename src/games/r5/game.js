/* ================= РЕЗОНАНС 5 · ИЗВОР — описание на играта ================= */
const SUIT5={r:{suit:'#3a6a5a',suitD:'#24463c',plate:'#d8d0c0',plateH:'#f0ece0',dark:'#1a1e1c',helm:'#f4f0e6'},
             d:{suit:'#4a5a7a',suitD:'#2e3a52',plate:'#d8d0c0',plateH:'#f0ece0',dark:'#1a1c22',helm:'#f4f0e6'}};
registerGame({
  id:'r5', order:5, title:'РЕЗОНАНС 5', subtitle:'Извор', name:'РЕЗОНАНС 5', key:'rz5',
  blurb:'Петата част — „Резонанс 5: Извор“. Александрово, 1983 г. Двама лекари и една тайна мисия.',
  desc:{intro:'Пътят за Александрово, септември 1983 г. — началото на историята.',
        training:'Дворът на здравната служба: хора в транс, сигнални ракети, стетоскоп и дневник.',
        campaign:'Румяна и Деян. Пет глави, 20 епизода, пет боса — от Александрово до Ловеч.',
        survival:'Безкрайни сектори, генерирани наново при всяко начало.'},
  controls:'← → движение · Z стрелба · X скок · ↑ събуди · E ракета / стетоскоп · P / Esc пауза',
  levels:LEVELS5, chapters:CH5, radioWho:'ИЛИЕВА', sonarName:'СТЕТОСКОП', memLabel:'СТРАНИЦА',
  heroName:h=>h==='d'?'♦ Д-Р ДЕЯН':'♦ Д-Р РУМЯНА',
  intro:startR5Intro, training:startR5Training, introUpd:updR5Intro, introRender:renderR5Intro,
  drawLogo:r5Logo, renderWin:renderWin5, postFx:r5PostFx, epsExtra:r5EpsExtra,
  svSpec:SV5_SPEC, svBoss:SV5_BOSS, svFallback:'axvil',
  flashlight:true,
  accent:'#3fd0a0', accentRgb:'63,208,160', accent2:'#ffcf6a', font:'"Comfortaa","Russo One",sans-serif', textCol:'#e8e0cc', dimCol:'#8a9a8a',
  get suit(){ return SUIT5[(LVL&&LVL.hero)||'r']; },
  glitch:['rgba(255,207,106,0.5)','rgba(63,208,160,0.45)','#fff4d8'], hintCols:['#ffe6b0','#3fd0a0'],
  prog:PROG5, menuMusic:{tr:-5,bpm:80,alien:false}, menuCam:220,
  eKey:'ракета / стетоскоп', eBtn:'E<br>ракета',
  debug:{enterR5:()=>enterGame('r5'),TRAIN5,LEVELS5,startR5Intro,startR5Training,updR5Intro,renderR5Intro,sv5Plan:k=>svPlanBy(SV5_SPEC,k),r5Finale,get SLEEPERS(){return SLEEPERS},get FLARES(){return FLARES},wakeSleeper,throwFlare,isLit,get HREV(){return HREV}},
});
