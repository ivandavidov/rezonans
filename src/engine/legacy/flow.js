/* ================= LEVEL FLOW ================= */
function completeLevel(){
  if(state!=='play') return;
  state='levelEnd'; endT=0; mInt=0; bossMusic=false; SFX.win();
  if(SURV){ survScore+=100+stats.kills*10+(LVL.arena?500:0); saveSurv(survScore,survK+1); return; }
  for(const k in totals) totals[k]+=stats[k];
  if(SEQ){ if(LI+2>gUnl&&LI<GLV.length-1){ gUnl=LI+2; store.set(KEY('unlocked'),gUnl); } }
  else if(LI+2>unlocked&&LI<LEVELS.length-1){ unlocked=LI+2; store.set('rz.unlocked',unlocked); }
}
function respawn(){
  r2PreRespawn(); const p=player; p.x=cp*T+3; p.h=26; p.crouch=false; p.y=groundY(cp)-26; p.vx=p.vy=0; p.hp=100; p.dead=false; p.inv=1.5; p.climb=false; p.hurtAgo=9;
  if(p.ammo.pistol.res+p.ammo.pistol.mag<34) p.ammo.pistol.res=34-p.ammo.pistol.mag;
  if(!hasAmmo(p.cur)) autoSwitch();
  ebullets=[];grenades=[];orbs=[];bolts=[];bmiss=[]; for(const e of enemies) if(e.type!=='turret'&&e.type!=='nest'&&e.type!=='pylon') e.alert=false;
  if(enc&&enc.active){
    enemies=enemies.filter(e=>e.tag!=='enc'); portals=portals.filter(q=>q.tag!=='enc');
    if(enc.doorIn) setDoor(enc.doorIn,'.');
    for(const t of triggers) if(t.fn&&t.x*T>p.x&&t.done&&t.x*T-p.x<12*T) t.done=false;
    enc=null;
  }
  if(bossActive&&boss&&!boss.dead){
    enemies=enemies.filter(e=>!e.summoned&&e.tag!=='pylon'); portals=portals.filter(q=>q.tag!=='boss');
    boss=makeBoss(); boss.hp*=bossMul; boss.max*=bossMul; if(boss.type!=='heli') boss.t=1.2; if(boss.type==='guardian') spawnPylons();
    const d=LVL.arena.door!=null?LVL.arena.door:LVL.arena.x0;
    for(const b of barrels) if(b.tx>d){ b.dead=false; b.hp=15; b.fuse=-1; }
    for(const k of pickups) if(k.tx>d) k.taken=false;
    sfxAt(bossSfx(boss.type),boss);
  }
  trains=[]; rockets=[]; _resetHaz(); for(const tr of tracks){ tr.t=Math.max(tr.t,trainWarn()+2); tr.warned=false; }
  r2Respawn(); cam=clamp(p.x-W/2,0,COLS*T-W); if(bossActive&&LVL.arena.lock!==false) cam=lockCam(); state='play';
}
function _resetHaz(){ if(player) player.onLift=null; }
const lockCam=()=>Math.min(LVL.arena.door*T+8,COLS*T-W);

