/* ================= GAME STATE ================= */
const JUMP=-345;
let state='title', menuSel=0, storyT=0, endT=0, winT=0, deadT=0, titleT=0;
let lifts=[], lasers=[], vents=[], tracks=[], trains=[], rockets=[], crushers=[], gateOpen=false, switchOn=false;
let player, enemies, barrels, pickups, scientists, ebullets, grenades, orbs, bolts, tracers, particles, portals, flashes, barks, triggers;
let bmiss=[];
let boss=null, bossActive=false, exitPortal=null, enc=null, cam=0, shake=0, flash=0, flashCol='#fff', dmgFlash=0, msg=null, cp=5, intro, stats, totals, lvT=0, combatHold=0, amb=0.45, lowBeep=0, elecWas=false;
const NAMES={wrench:'ГАЕЧЕН КЛЮЧ',pistol:'ПИСТОЛЕТ',shotgun:'ПУШКА',pulse:'ИМПУЛСНА ПУШКА',grenade:'ГРАНАТИ',rocket:'РАКЕТОМЕТ'};
const ORDER=['wrench','pistol','shotgun','pulse','grenade','rocket'];
const CAP={pistol:17,shotgun:8,pulse:40,grenade:10,rocket:6}, RES_MAX={pistol:150,shotgun:48,pulse:200,grenade:0,rocket:0};
function showMsg(t,d=3.6,who){ msg={t,d:Math.max(d,1.2+t.length*0.055),age:0,who}; }
function radio(t){ showMsg(t,0,GAME.radioWho||'Д-Р ИЛИЕВА'); SFX.radio&&AC&&SFX.radio(0.8,sfxBus); }
function bark(e,t,d=2){ barks.push({e,t,d}); }
function setCp(tx){ cp=tx; mechRun('setCp'); }
function makeEnemy(type,cx,feet){
  const d=DIMS[type];
  return {type,x:cx-d[0]/2,y:feet-d[1],w:d[0],h:d[1],hp:d[2]*D.ehp*ehpMul,vx:0,vy:0,face:-1,state:'idle',t:rnd(0.6,1.4),cd:rnd(0.6,1.4),gcd:rnd(2.5,4),burst:0,bt:0,alert:false,onGround:false,hitT:0,anim:rnd(10),dead:false,home:cx,bite:0,lastSeen:9,summoned:false,side:Math.random()<0.5?1:-1,elecT:0};
}
function makePlayer(lo){
  const p={x:LVL.start*T+3,y:0,w:10,h:26,vx:0,vy:0,face:1,onGround:false,crouch:false,climb:false,hp:100,armor:lo.armor||0,
    weapons:{wrench:true},cur:lo.cur,ammo:{pistol:{mag:0,res:0},shotgun:{mag:0,res:0},pulse:{mag:0,res:0},grenade:{mag:0,res:0},rocket:{mag:0,res:0}},
    cool:0,reload:0,inv:0,anim:0,step:0,flashT:0,swingT:0,dead:false,deadT:0,dropThrough:0,coyote:0,slimeT:0,elecT:0,aimUp:false,hurtT:0,hurtAgo:9};
  p.y=groundY(LVL.start)-p.h;
  for(const w of lo.w) p.weapons[w]=true;
  for(const k in lo.ammo){ p.ammo[k].mag=lo.ammo[k][0]; p.ammo[k].res=lo.ammo[k][1]; }
  return p;
}
function loadLevel(i,obj){
  LI=i; LVL=Object.create(obj||GLV[i]); COLS=LVL.cols; G=LVL.grav;   // екземпляр: записите по време на игра (епоха, флагове на босовете, финал) не пипат описанието
  map=[]; for(let y=0;y<ROWS;y++) map.push(new Array(COLS).fill('.'));
  const F=(x0,y0,x1,y1,c)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(x>=0&&x<COLS&&y>=0&&y<ROWS)map[y][x]=c;};
  LVL.build(F,COLS); prerender(); buildSky();
  player=makePlayer(LVL.loadout);
  enemies=[];barrels=[];pickups=[];scientists=[];ebullets=[];grenades=[];orbs=[];bolts=[];tracers=[];particles=[];portals=[];flashes=[];barks=[];bmiss=[];
  for(const [t,tx,row,flag] of LVL.spawns){
    if(!allow(flag)) continue;
    const cx=tx*T+8, feet=(row+1)*T;
    if(t==='nestG'||t==='nestBig'){ const e=makeEnemy('nest',cx,feet); e.tag='gate'; if(t==='nestBig'){ e.big=true; e.w=32; e.h=26; e.x=cx-16; e.y=feet-26; e.hp=260*D.ehp; } enemies.push(e); }
    else if(DIMS[t]){ const e=makeEnemy(t,cx,feet); if(t==='turret') e.face=-1; if(t==='target') e.hp=1; enemies.push(e); }
    else if(t==='barrel') barrels.push({x:cx-6,y:feet-16,w:12,h:16,hp:15,dead:false,fuse:-1,tx});
    else if(t.endsWith('R')) pickups.push({type:t.slice(0,-1),x:cx-6,y:feet-10,w:12,h:10,taken:false,bob:rnd(6),tx,respawn:12});
    else pickups.push({type:t,x:cx-6,y:feet-10,w:12,h:10,taken:false,bob:rnd(6),tx});
  }
  triggers=LVL.triggers.map(t=>({x:t.x,fn:t.fn,cond:t.cond,done:false}));
  tracks=(LVL.tracks||[]).map(t=>({...t,t:t.off,warned:false})); crushers=(LVL.crushers||[]).map(c=>({w:2,...c,hitCd:0,last:0})); trains=[];
  lifts=(LVL.lifts||[]).map(l=>({...l,x:l.x0*T,y:l.y0*T,w:(l.w||3)*T,dx:0,dy:0})); lasers=(LVL.lasers||[]).map(l=>({...l,hitCd:0,was:false})); vents=(LVL.vents||[]).map(v=>({...v,hitCd:0,was:false})); rockets=[]; gateOpen=false; switchOn=false;
  boss=null; bossActive=false; bossMusic=false; exitPortal=null; enc=null; cp=LVL.start; cam=0; shake=0; flash=0; dmgFlash=0; msg=null; combatHold=0; lvT=0;
  intro=LVL.intro?{t:0,phase:0,lock:0}:{t:0,phase:2,lock:0};
  stats={time:0,shots:0,hits:0,kills:0,deaths:0};
  amb=TP(LVL.start).amb;
  setMusic(LVL.music);
  mechRun('load'); if(LVL.onLoad) LVL.onLoad();
}
function startEpisode(i,carry){
  const prev=carry?player:null; SURV=false; bossMul=1; ehpMul=1;
  loadLevel(i);
  if(prev&&!prev.dead){
    const p=player;
    for(const w of ORDER) if(prev.weapons[w]) p.weapons[w]=true;
    for(const k in p.ammo){ p.ammo[k].mag=Math.max(p.ammo[k].mag,prev.ammo[k].mag); p.ammo[k].res=Math.max(p.ammo[k].res,prev.ammo[k].res); }
    p.armor=Math.max(p.armor,prev.armor); p.hp=Math.max(prev.hp,DI===0?100:60);
    if(p.weapons[prev.cur]) p.cur=prev.cur;
  }
  if(i===0) totals={time:0,shots:0,hits:0,kills:0,deaths:0};
  state='story'; storyT=0; mInt=0;
}
function toTitle(){ const ms=SURV?3:(LVL&&LVL.training)?1:2; if(SURV&&(state==='play'||state==='paused'||state==='dead')) saveSurv(survScore+stats.kills*10,survK+1); toMenu(ms); }
function portalSpawn(type,x,feet,delay=0,tag){ portals.push({x,y:feet-18,t:-delay,spawned:false,type,feet,tag}); }
function startEncounter(spec){
  enc={...spec,wave:-1,delay:0.4,active:true};
  if(spec.doorIn){ setDoor(spec.doorIn,'D'); SFX.door(); shake=4; }
  if(spec.msg) showMsg(spec.msg,2.5);
}
function spawnWave(list){
  let i=0, said=false;
  for(const [type,tx,via,flag,row] of list){
    if(!allow(flag)) continue;
    if(via==='drop'){ const e=makeEnemy(type,tx*T+8,4*T+12); e.alert=true; e.tag='enc'; e.cd=0.9*D.react; enemies.push(e);
      if(type==='soldier'){ sfxAt('radio',e); if(!said){ said=true; const B=LVL.barks||['Ето го!','Огън!','Там е!']; bark(e,B[Math.floor(rnd(B.length))],1.5); } }
      else { const sn={crab:'crabIdle',zombie:'zgroan',shocker:'growl'}[type]; if(sn) sfxAt(sn,e); } }
    else portalSpawn(type,tx*T+8,row!=null?(row+1)*T:groundY(tx),i*0.3,'enc');
    i++;
  }
}
function updEncounter(dt){
  if(!enc||!enc.active) return;
  const alive=enemies.some(e=>e.tag==='enc'&&!e.dead)||portals.some(p=>p.tag==='enc'&&!p.spawned);
  if(alive) return;
  enc.delay-=dt; if(enc.delay>0) return;
  enc.wave++;
  if(enc.wave<enc.waves.length){ spawnWave(enc.waves[enc.wave]); enc.delay=1.2; }
  else { enc.active=false; if(enc.doorOut){ setDoor(enc.doorOut,'.'); SFX.door(); } if(enc.doorIn) setDoor(enc.doorIn,'.'); if(enc.done) enc.done(); }
}

