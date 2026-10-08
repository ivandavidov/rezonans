/* ================= МЕХАНИКИ: РЕГИСТЪР И РЕД НА КУКИТЕ =================
   Всяка механика (engine/mech/*.js) се описва с defMech(id,{куки}); двигателят ги вика на фиксирани места:
     load, respawn, preRespawn, setCp, update(dt), move(p,dt,dir,U,Dn) → true, ако е поела движението, force(p,dt),
     drawBack, drawWorld, lights(L), chips(chip), postFx, exitOk → false, ако изходът е затворен.
   Механиката се включва от данните на нивото; в останалите нива куките ѝ не правят нищо.
   MECH_ORDER — редът на извикване за всяка кука (пази поведението и реда на случайните числа);
   механика, която не е в списъка, се вика след изброените, по реда на регистрация. */
const MECHS={}, MECH_HOOKS='load respawn preRespawn setCp update move force drawBack drawWorld lights chips postFx exitOk'.split(' ');
const MECH_ORDER={
  load:['core','water','levers','escort','flips','shifters','allies','eras','gens','chase','sun','winds','echo','cams','noise','plates','terms','snow','freqsonar','trance','tone','cursors'],
  update:['water','levers','eras','echo','noise','plates','cams','terms','level','gusts','snow','cursors','freqsonar','trance','tone','flips','shifters','chase','sun','winds','allies','gens'],
  drawBack:['freqsonar','trance','terms','plates','levers','gens'],
  drawWorld:['winds','water','flips','shifters','cams','echo','level','snow','freqsonar','trance','tone','cursors','chase','allies'],
  lights:['cams','terms','echo','flash','level','chase','freqsonar','trance','tone','cursors','gens','flips','allies','foes','water'],
  chips:['echo','cams','gusts','cursors','freqsonar','trance','tone'],
  respawn:['freqsonar','trance','tone','cursors','echo','cams','noise','terms','water','checkpoint','chase','escort','allies','arena','winds'],
  preRespawn:['flips','eras'], setCp:['flips','eras','checkpoint'], exitOk:['trance','escort'], move:['water'], force:['winds'], postFx:['water','sun','freqsonar'],
};
let MECH_RUN=null;
function defMech(id,h){ if(MECHS[id]) throw new Error('defMech: „'+id+'“ вече е зададена'); for(const k in h) if(!MECH_HOOKS.includes(k)) throw new Error('defMech: непозната кука „'+id+'.'+k+'“'); MECHS[id]=h; MECH_RUN=null; }
function mechHooks(k){
  if(!MECH_RUN){ MECH_RUN={}; for(const hk of MECH_HOOKS){ const o=MECH_ORDER[hk]||[], ids=o.concat(Object.keys(MECHS).filter(id=>!o.includes(id)));
    MECH_RUN[hk]=ids.filter(id=>MECHS[id]&&MECHS[id][hk]).map(id=>MECHS[id][hk]); } }
  return MECH_RUN[k]; }
function mechRun(k,a,b){ for(const f of mechHooks(k)) f(a,b); }
function mechMove(p,dt,dir,U,Dn){ for(const f of mechHooks('move')) if(f(p,dt,dir,U,Dn)) return true; return false; }
function mechExitOk(){ for(const f of mechHooks('exitOk')) if(f()===false) return false; return true; }
function postFx(){ mechRun('postFx'); if(GAME.postFx) GAME.postFx(); }   // цветовата обработка: механиките, после самата игра

/* ---------- общото: таймери MT, MST, шум, контролна точка с ред, клавиш E ---------- */
let MT={}, MST={}, NOISE=[];   // MT — разни таймери на механиките; MST — изстрели, сняг, тревоги, край по време
defMech('core',{ load(){ MT={}; MST={shots:stats?stats.shots:0,snow:[],alarmN:0}; } });
function setCpR(tx,row){ setCp(tx); MT.cpRow=row; }
defMech('checkpoint',{ setCp(){ MT.cpRow=null; }, respawn(){ const p=player; if(MT.cpRow!=null){ p.y=MT.cpRow*T-p.h-0.01; p.vy=0; } } });
defMech('arena',{ respawn(){ if(LVL.arena&&(BOSSES[LVL.arena.type]||{}).onRespawn) BOSSES[LVL.arena.type].onRespawn(); } });
function noise(x,y,src){ NOISE.push({x,y,t:lvT,src}); if(NOISE.length>8) NOISE.shift(); }
defMech('noise',{ load(){ NOISE=[]; }, respawn(){ NOISE=[]; if(stats) MST.shots=stats.shots; },
  update(){ const p=player;
  // noise from the player's own shots
  if(stats.shots>MST.shots){ noise(p.x+p.w/2,p.y+p.h/2,'player'); } MST.shots=stats.shots;
  } });
defMech('level',{   // куките на самото ниво: край по време (MST.endAt), сцени и светлини
  update(){
  if(MST.endAt&&lvT>=MST.endAt&&state==='play'){ MST.endAt=0; completeLevel(); }
  },
  drawWorld(){
  if(LVL.drawExtra) LVL.drawExtra();   // сцени на конкретна игра
  },
  lights(L){
  if(LVL.lightsExtra) LVL.lightsExtra(L);
  } });
defMech('foes',{ lights(L){
  for(const e of enemies) if(!e.dead&&FOES[e.type].glow) L.push([e.x+e.w/2,e.y+e.h/2,40,0.6]);
} });
function mechSpawn(t,x){ x=clamp(x,3*T,(COLS-3)*T); const tx=Math.floor(x/T); if(!DIMS[t]) return; const fl=!!FOES[t].fly; const e=makeEnemy(t,tx*T+8,fl?groundY(tx)-4*T:groundY(tx)); e.alert=true; e.summoned=true; enemies.push(e); for(let i=0;i<14;i++) part(tx*T+8,(fl?groundY(tx)-4*T:groundY(tx))-12,rnd(-60,60),rnd(-90,10),0.5,'#ff3b4f',2,0); if(AC) SFX.portal&&SFX.portal(0.5); }
function mechAlarm(l){ if(LVL.onAlarm){ LVL.onAlarm(); return; } if(ALARM<=0){ showMsg('ТРЕВОГА! Засякоха те.',2); shake=4; if(MST.alarmN<6){ const p=player; for(const s of [-1,1]){ mechSpawn(LVL.alarmFoe||'soldier',p.x+s*rnd(7,10)*T); MST.alarmN++; } } } ALARM=7; }
/* ---------- клавиш E: едно действие на кадър ----------
   Решава се в eras.update (преди всички механики, които го ползват). Приоритет: курсор до играча → епохи (в ниво с епохи E е само за тях) → ехо (GAME.echo) → сонар → тон-честота → ракета → тон. */
let E_ACT=null;
function eAction(p){
  if(!pressed.era||p.dead) return null;
  if(CURS.some(c=>!c.done&&curNear(c))) return 'cursor';
  if(ERAD) return eraCd<=0?'era':null;
  if(GAME.echo) return 'echo';
  const tx=(p.x+p.w/2)/T; if(LVL.sonar||LVL.sonarZones&&LVL.sonarZones.some(z=>tx>=z[0]&&tx<=z[1])) return 'sonar';
  return LVL.freq?'freq':LVL.flares?'flare':LVL.tone?'tone':null;
}
