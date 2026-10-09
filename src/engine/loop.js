/* ================= LOOP ================= */
function clearPressed(){ for(const k in pressed) pressed[k]=false; }
const ok=()=>pressed.fire||pressed.enter;
let last=performance.now(), acc=0;
function frame(now){
  const dt=Math.max(0,Math.min(0.05,(now-last)/1000)); last=now; titleT+=dt;
  if(state==='title'){ cam=(Math.sin(titleT*0.05)*0.5+0.5)*(GAME.menuCam||60); if(ok()){ initAudio(); SFX.menuOk(); toMenu(modeSel+2); } clearPressed(); }
  else if(state==='gintro'){ GAME.introUpd(dt); clearPressed(); }
  else if(state==='gmenu'){ cam=(Math.sin(titleT*0.05)*0.5+0.5)*(GAME.menuCam||60); gmenuInput(); clearPressed(); }
  else if((state==='survOver'||state==='win')&&pressed.esc){ clearPressed(); toTitle(); }
  else if(state==='survOver'){ winT+=dt; if(winT>1.5&&ok()) toTitle(); clearPressed(); }
  else if(state==='svmenu'){ svMenuInput(); clearPressed(); }
  else if(state==='diff'){
    if(pressed.up){ menuSel=(menuSel+2)%3; SFX.menu(); } if(pressed.down){ menuSel=(menuSel+1)%3; SFX.menu(); }
    if(ok()){ DI=menuSel; D=DIFFS[DI]; store.set('rz.diff',DI); SFX.menuOk(); if(modeSel===1) svEnter(); else { state='eps'; menuSel=gUnl-1; } }
    else if(pressed.jump||pressed.esc){ toMenu(modeSel===1?3:2); SFX.menu(); }
    clearPressed();
  }
  else if(state==='eps'){ epsInput(); clearPressed(); }
  else if(state==='story'&&pressed.esc){ clearPressed(); toTitle(); }
  else if(state==='story'){ storyT+=dt; if(ok()){ if(storyT*45<parasLen(LVL.story)) storyT=999; else { state='play'; SFX.menuOk(); } } clearPressed(); }
  else if(state==='play'){
    if(pressed.pause||pressed.esc){ state='paused'; if(AC) AC.suspend(); clearPressed(); }
    else if(LVL.training&&TRN&&pressed.enter){ if(TRN.skip>0){ clearPressed(); SFX.menuOk(); finishTraining(); } else { TRN.skip=2.5; clearPressed(); } }
    else { acc+=chtOn('slow')?dt/2:dt; let n=0; while(acc>=1/60&&n<4&&state==='play'){ update(1/60); clearPressed(); acc-=1/60; n++; } if(n===4) acc=0; }
  }
  else if(state==='dead'&&pressed.esc){ clearPressed(); toTitle(); }
  else if(state==='dead'){ deadT+=dt; acc+=dt; while(acc>=1/60){ update(1/60); acc-=1/60; } if(deadT>1&&ok()){ if(SURV){ survLives--; if(survLives<=0) endSurv(); else respawn(); } else respawn(); } clearPressed(); }
  else if(state==='paused'){ if(pressed.esc||pressed.crouch){ clearPressed(); toTitle(); } else if(pressed.pause||ok()){ state='play'; if(AC) AC.resume(); } else if(pressed.down&&CHT.open) chtOpen('paused'); clearPressed(); }
  else if(state==='cheats'){ chtInput(); clearPressed(); }
  else if(state==='levelEnd'&&pressed.esc){ clearPressed(); toTitle(); }
  else if(state==='levelEnd'){ endT+=dt; acc+=dt; while(acc>=1/60){ for(const q of particles) q.life-=1/60; acc-=1/60; }
    if(ok()){ if((endT-0.5)*45<parasLen(LVL.end)) endT=0.5+parasLen(LVL.end)/45; else if(endT>1.2){ SFX.menuOk(); if(LVL.training) finishTraining(); else if(SURV) startSurv(survK+1,true); else if(!epFinal(LI)) startEpisode(LI+1,true); else { state='win'; winT=0; } } }
    clearPressed(); }
  else if(state==='win'){ winT+=dt; if(winT>2){ const nx=LI<GLV.length-1;   // финал на глава, след която има още (r1: бонус главата) — Z продължава, X излиза
      if(nx&&ok()){ SFX.menuOk(); totals={time:0,shots:0,hits:0,kills:0,deaths:0}; startEpisode(LI+1,false); } else if(ok()||(nx&&pressed.jump)){ SFX.menuOk(); toMenu(2); } } clearPressed(); }
  render(); audDraw();
  requestAnimationFrame(frame);
}
loadLevel(0); totals={time:0,shots:0,hits:0,kills:0,deaths:0};
if(document.fonts&&document.fonts.load){ Promise.all([document.fonts.load('10px "Russo One"'),document.fonts.load('600 10px "IBM Plex Mono"')/*@@FONT_LOADS@@*/]).then(()=>{ prerender(); }).catch(()=>{}); }
document.addEventListener('visibilitychange',()=>{ if(document.hidden&&state==='play'){ state='paused'; if(AC) AC.suspend(); } });
window.__rz={get GAME(){return GAME},GAMES,GHIST,setGame,enterGame,toMenu,menuItems,get gSel(){return gSel},hurtEnemy,get ECHO(){return ECHO},get PLATES(){return PLATES},get LIGHTS(){return LIGHTS},get TERMS(){return TERMS},get ALARM(){return ALARM},get NOISE(){return NOISE},get MST(){return MST},get FLOOD(){return FLOOD},get ESC(){return ESC},get CHASE(){return CHASE},get ERA(){return ERA},get FLIP(){return FLIP},get GENS(){return GENS},get LEVERS(){return LEVERS},get SHIFT(){return SHIFT},get ALLIES(){return ALLIES},switchEra,flipWorld,isWater,get pickups(){return pickups},get scientists(){return scientists},get barks(){return barks},solidAt,startBoss,respawn,get cp(){return cp},hurtBoss,get musOn(){return musOn},get AC(){return AC},get musBus(){return musBus},get sfxBus(){return sfxBus},get sfxOn(){return sfxOn},toggleMute,toggleMus,toggleSfx,svLoad,svSave,svClear,svEnter,svItems,get svSel(){return svSel},get svConf(){return svConf},get DI(){return DI},get survLives(){return survLives},get survSeed(){return survSeed},get keys(){return keys},get pressed(){return pressed},frame,get levels(){return GLV},get unl(){return gUnl},resetClock(){titleT=0;acc=0;},svValidate,elecOn,CHT,chtSet,chtDo,chtUnlock,hurtPlayer,finishTraining,get TRN(){return TRN},get msg(){return msg},get grav(){return G},completeLevel,get bmiss(){return bmiss},get LI(){return LI},startSurv,genLevel,svPlan,get survK(){return survK},get survScore(){return survScore},set survSeed(v){survSeed=v},get LVL(){return LVL},get lifts(){return lifts},get tracks(){return tracks},get trains(){return trains},get gateOpen(){return gateOpen},get rockets(){return rockets},clearPressed,loadLevel,get map(){return map},get LV(){return LV},get player(){return player},get state(){return state},set state(v){state=v},get boss(){return boss},get enemies(){return enemies},get exitPortal(){return exitPortal},get enc(){return enc},update,setDiff(i){DI=i;D=DIFFS[i];},startEpisode,get cam(){return cam},set cam(v){cam=v},render,groundY};
for(const g of GAMES) if(g.debug) Object.defineProperties(window.__rz,Object.getOwnPropertyDescriptors(g.debug));
requestAnimationFrame(frame);
