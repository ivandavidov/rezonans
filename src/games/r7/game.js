/* ================= РЕЗОНАНС 7 · ПРАВЕЦ — описание на играта ================= */
const SUIT7={suit:'#3a5a9a',suitD:'#24386a',plate:'#d8d0c0',plateH:'#f0ece0',dark:'#1a1c24',helm:'#d8b07a'};
registerGame({
  id:'r7', order:7, title:'РЕЗОНАНС 7', subtitle:'Правец', name:'РЕЗОНАНС 7', key:'rz7',
  blurb:'Седмата част — „Резонанс 7: Правец“. 1987 г. Сервизен техник попада в компютъра на училищния клуб.',
  desc:{intro:'Компютърният клуб, октомври 1987 г. Машините оживяват и казват „здравей“.',
        training:'Диагностика на паметта: Мира те запознава с командите POKE, GOTO, PEEK и BREAK.',
        campaign:'Пешо Байтов и Мира. Пет глави, 20 нива и петима босове — от зеления екран чак до бъдещето.',
        survival:'Безкрайни сектори, подреждани наново при всеки нов опит.'},
  controls:'← → движение · Z стрелба · X скок · ↑ стълби · E команда / палитра · P / Esc пауза',
  levels:LEVELS7, chapters:CH7, radioWho:'МИРА', memLabel:'РЕД', sonarName:'PEEK',
  heroName:()=>'♦ ПЕШО',
  intro:startR7Intro, training:startR7Training, introUpd:updR7Intro, introRender:renderR7Intro,
  drawLogo:r7Logo, renderWin:renderWin7, postFx:r7PostFx, epsExtra:r7EpsExtra,
  svSpec:SV7_SPEC, svBoss:SV7_BOSS, svFallback:'pxboot',
  accent:'#3aff5a', accentRgb:'58,255,90', accent2:'#ffd84a', font:'"Pixelify Sans","Russo One",sans-serif', textCol:'#d8f0d8', dimCol:'#7a9a7a',
  suit:SUIT7,
  glitch:['rgba(58,255,90,0.5)','rgba(255,216,74,0.45)','#e8ffe8'], hintCols:['#d8ffd8','#3aff5a'],
  prog:PROG7, menuMusic:{tr:-5,bpm:112,alien:false}, menuCam:200,
  eKey:'команда / палитра', eBtn:'E<br>команда',
  debug:{enterR7:()=>enterGame('r7'),TRAIN7,LEVELS7,startR7Intro,startR7Training,updR7Intro,renderR7Intro,sv7Plan:k=>svPlanBy(SV7_SPEC,k),r7Finale,get CURS(){return CURS},get TAPE(){return TAPE},runCursor,addCursor},
});
