/* ================= РЕЗОНАНС 9 — описание на играта (шаблон) ================= */
function r9Logo(){ overlay(0.75); glitchTitle('РЕЗОНАНС 9',W/2,98,40); centerText('П  О  Д  З  А  Г  Л  А  В  И  Е',126,'600 11px "IBM Plex Mono",monospace',ACC()); }
function r9Win(){ overlay(0.9); centerText('КРАЙ',90,'30px '+DFONT(),ACC()); drawStats(totals,148); if(winT>2&&blink()) centerText('Z — към менюто',238,'600 10px "IBM Plex Mono",monospace','#eeeeee'); }
/* оцеляване: темите — с етикети (виж engine/survival.js · svTry), планът — svPlanBy(SV8_SPEC); без boss — без сектори с бос */
const SV8={r9a:{name:'Първият свят',th:'lab',mus:{tr:0,bpm:100},foes:['zombie','crab']}};
addUnique(SV_THEMES,SV8,'SV_THEMES'); for(const k in SV8) addUnique(THEME_NAME,{[k]:SV8[k].name},'THEME_NAME');
const SV8_SPEC={salt:[139,7927,8],early:['r9a'],mid:[],late:[],recent:1,mut:{base:0.2,max:0.6,opts:()=>['swarm','scarce']}};
registerGame({
  id:'r9', order:9, title:'РЕЗОНАНС 9', subtitle:'Подзаглавие', name:'РЕЗОНАНС 9', key:'rz9',
  blurb:'Новата част — кратко описание за менютата на другите части.',
  desc:{intro:'…', training:'…', campaign:'…', survival:'Безкрайни сектори, генерирани наново при всяко начало.'},
  controls:'← → движение · Z стрелба · X скок · P / Esc пауза',
  levels:LEVELS_R9, chapters:CH_R9,
  intro:fm=>startEpisode(0,false),   // или кинематографично интро с introUpd/introRender
  training:fm=>startEpisode(0,false),
  drawLogo:r9Logo, renderWin:r9Win,
  svSpec:SV8_SPEC, svFallback:'r9a',
  accent:'#9fff6a', accentRgb:'159,255,106', accent2:'#ffe26a', font:'"Russo One",sans-serif',
  suit:{suit:'#4a7a2a',suitD:'#2e4e1a',plate:'#2e3a2a',plateH:'#4e604a',dark:'#141a12',helm:'#e4ecd8'},
  glitch:['rgba(80,200,255,0.55)','rgba(255,80,200,0.45)','#f0fff0'], hintCols:['#e8ffd8','#9fff6a'],
  menuMusic:{tr:-2,bpm:96,alien:false}, menuCam:120,
});
