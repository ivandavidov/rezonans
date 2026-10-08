/* ================= МЕХАНИКА · ЕХО-ДВОЙНИК =================
   Само в игри с GAME.echo: E записва до 5 s движение, после двойникът го повтаря (натиска плочи, вдига шум). */
let ECHO={mode:'idle',rec:[],t:0,i:0};
const ECHO_MAX=5;
function echoNow(){ return ECHO.mode==='play'&&ECHO.rec.length?ECHO.rec[ECHO.i]:null; }
function echoEndRec(){ if(ECHO.rec.length<12){ ECHO={mode:'idle',rec:[],t:0,i:0}; return; } ECHO.mode='play'; ECHO.i=0; if(AC){ osc({type:'sine',f:660,f2:990,t:0.2,v:0.1}); } }
function drawEcho(){ const f=echoNow(); if(!f) return; const save=player; player=Object.assign({},save,f,{inv:0,hurtT:0,dead:false,flashT:0,swingT:0,reload:0});
  ctx.save(); ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(f.x+5-cam,f.y+13,2,f.x+5-cam,f.y+13,22); g.addColorStop(0,'rgba(255,60,80,0.35)'); g.addColorStop(1,'rgba(255,60,80,0)'); ctx.fillStyle=g; ctx.fillRect(f.x-20-cam,f.y-10,50,46); ctx.restore();
  ctx.save(); ctx.globalAlpha=0.5; drawPlayer(); ctx.restore(); player=save; }
defMech('echo',{
  load(){ ECHO={mode:'idle',rec:[],t:0,i:0}; },
  respawn(){ ECHO={mode:'idle',rec:[],t:0,i:0}; },
  update(dt){ const p=player;
  // echo
  if(E_ACT==='echo'){
    if(ECHO.mode==='idle'){ ECHO={mode:'rec',rec:[],t:0,i:0,shots:stats.shots}; if(AC){ osc({type:'sine',f:880,t:0.12,v:0.1}); } if(!MST.echoHint&&!LVL.echo){ MST.echoHint=1; } }
    else if(ECHO.mode==='rec') echoEndRec();
    else { ECHO={mode:'idle',rec:[],t:0,i:0}; if(AC) osc({type:'sine',f:440,f2:220,t:0.2,v:0.08}); }
  }
  if(ECHO.mode==='rec'){ ECHO.t+=dt; ECHO.rec.push({x:p.x,y:p.y,h:p.h,face:p.face,crouch:p.crouch,aimUp:p.aimUp,anim:p.anim,onGround:p.onGround,swim:p.swim,climb:p.climb,vx:p.vx,vy:p.vy,cur:p.cur,shot:stats.shots>ECHO.shots}); ECHO.shots=stats.shots; if(ECHO.t>=ECHO_MAX) echoEndRec(); }
  else if(ECHO.mode==='play'){ ECHO.i=(ECHO.i+1)%ECHO.rec.length; const f=ECHO.rec[ECHO.i]; if(f.shot){ noise(f.x+5,f.y+10,'echo'); light(f.x+5+f.face*10,f.y+10,60,0.6,'rgba(255,120,130,'); } }
  },
  drawWorld(){
  drawEcho();
  if(ECHO.mode==='rec'&&player&&Math.floor(titleT*4)%2){ ctx.fillStyle='#ff3b4f'; ctx.beginPath(); ctx.arc(player.x+5-cam,player.y-8,2.5,0,7); ctx.fill(); }
  },
  lights(L){
  const f=echoNow(); if(f) L.push([f.x+5,f.y+13,40,0.5]);
  },
  chips(chip){
  if(LVL.echo||ECHO.mode!=='idle') chip(ECHO.mode==='rec'?'● ЕХО · ЗАПИС '+Math.max(0,ECHO_MAX-ECHO.t).toFixed(1)+' s · E — спри':ECHO.mode==='play'?'◎ ЕХО · ПОВТАРЯ · E — изчисти':'◎ ЕХО · E — запис',ECHO.mode==='rec'?'#ff3b4f':'#ffb0bc');
  } });
