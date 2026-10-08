/* ================= ДВИГАТЕЛ · МЕХАНИКИ =================
   Ехо-двойник (само за игри с GAME.echo), плочи под налягане, прожектори/камери и тревога,
   терминали, шум, пориви на вятъра, сняг, фенерче, влак-гонитба, ритмични платформи.
   Включват се от полета в нивото: plates, lights, terms, gusts, snow, flash, chase.kind='train', shifters[beat]. */
let ECHO={mode:'idle',rec:[],t:0,i:0}, PLATES=[], LIGHTS=[], TERMS=[], ALARM=0, NOISE=[], MST={};
const ECHO_MAX=5;
function mechLoad(){
  ECHO={mode:'idle',rec:[],t:0,i:0}; ALARM=0; NOISE=[]; MST={shots:stats?stats.shots:0,snow:[],alarmN:0};
  const L=LVL; if(!L) return;
  PLATES=(L.plates||[]).map(p=>({...p,on:false,was:false}));
  LIGHTS=(L.lights||[]).map((l,i)=>({...l,a:(l.a0+l.a1)/2,ph:i*1.7,seen:0}));
  TERMS=(L.terms||[]).map(t=>({...t,prog:0,done:false,spawnT:2.5}));
  if(L.snow) for(let i=0;i<70*L.snow;i++) MST.snow.push([Math.random()*W,Math.random()*H,0.5+Math.random(),Math.random()]);
  mech2Load(); mech3Load(); mech4Load(); mech5Load();
}
function mechRespawn(){ mech2Respawn(); mech3Respawn(); mech4Respawn(); mech5Respawn(); ECHO={mode:'idle',rec:[],t:0,i:0}; ALARM=0; NOISE=[]; for(const l of LIGHTS) l.seen=0; for(const t of TERMS) if(!t.done) t.prog=0; if(stats) MST.shots=stats.shots; }
function noise(x,y,src){ NOISE.push({x,y,t:lvT,src}); if(NOISE.length>8) NOISE.shift(); }
function echoNow(){ return ECHO.mode==='play'&&ECHO.rec.length?ECHO.rec[ECHO.i]:null; }
function echoEndRec(){ if(ECHO.rec.length<12){ ECHO={mode:'idle',rec:[],t:0,i:0}; return; } ECHO.mode='play'; ECHO.i=0; if(AC){ osc({type:'sine',f:660,f2:990,t:0.2,v:0.1}); } }
function mechUpdate(dt){
  const p=player;
  // echo
  if(E_ACT==='echo'){
    if(ECHO.mode==='idle'){ ECHO={mode:'rec',rec:[],t:0,i:0,shots:stats.shots}; if(AC){ osc({type:'sine',f:880,t:0.12,v:0.1}); } if(!MST.echoHint&&!LVL.echo){ MST.echoHint=1; } }
    else if(ECHO.mode==='rec') echoEndRec();
    else { ECHO={mode:'idle',rec:[],t:0,i:0}; if(AC) osc({type:'sine',f:440,f2:220,t:0.2,v:0.08}); }
  }
  if(ECHO.mode==='rec'){ ECHO.t+=dt; ECHO.rec.push({x:p.x,y:p.y,h:p.h,face:p.face,crouch:p.crouch,aimUp:p.aimUp,anim:p.anim,onGround:p.onGround,swim:p.swim,climb:p.climb,vx:p.vx,vy:p.vy,cur:p.cur,shot:stats.shots>ECHO.shots}); ECHO.shots=stats.shots; if(ECHO.t>=ECHO_MAX) echoEndRec(); }
  else if(ECHO.mode==='play'){ ECHO.i=(ECHO.i+1)%ECHO.rec.length; const f=ECHO.rec[ECHO.i]; if(f.shot){ noise(f.x+5,f.y+10,'echo'); light(f.x+5+f.face*10,f.y+10,60,0.6,'rgba(255,120,130,'); } }
  // noise from the player's own shots
  if(stats.shots>MST.shots){ noise(p.x+p.w/2,p.y+p.h/2,'player'); } MST.shots=stats.shots;
  // pressure plates
  const eb=echoNow(), ebox=eb?{x:eb.x,y:eb.y,w:10,h:eb.h}:null;
  for(const pl of PLATES){ const x0=pl.x*T, x1=x0+2*T, fy=pl.y*T, onIt=b=>b&&b.x+b.w>x0+2&&b.x<x1-2&&Math.abs(b.y+b.h-fy)<7;
    pl.on=(!p.dead&&onIt(p))||onIt(ebox);
    if(pl.on&&!pl.was){ setDoor(pl.door,'.'); SFX.door(); pl.was=true; }
    else if(!pl.on&&pl.was){ const [dx,r0,r1]=pl.door, dr={x:dx*T,y:r0*T,w:T,h:(r1-r0+1)*T}; if(!ov(p,dr)&&!(ebox&&ov(ebox,dr))){ setDoor(pl.door,'D'); SFX.door(); pl.was=false; } } }
  // searchlights / cameras / eyes
  for(const l of LIGHTS){ const mid=(l.a0+l.a1)/2, amp=(l.a1-l.a0)/2; l.a=mid+amp*Math.sin(lvT*l.spd+l.ph);
    const lx=l.x*T+8, ly=l.y*T+8, cx=p.x+p.w/2, cy=p.y+p.h/2, d=Math.hypot(cx-lx,cy-ly), ang=Math.atan2(cy-ly,cx-lx), half=l.cam?0.17:0.22;
    let diff=Math.abs(((ang-l.a+Math.PI*3)%(Math.PI*2))-Math.PI);
    const seen=!p.dead&&d<l.len*T&&diff<half&&los(lx,ly,cx,cy);
    if(seen){ l.seen+=dt; if(l.seen>0.32) mechAlarm(l); } else l.seen=Math.max(0,l.seen-dt*0.8); }
  if(ALARM>0){ ALARM-=dt; if(Math.random()<dt*1.5&&AC) osc({type:'square',f:Math.floor(lvT*2)%2?660:520,t:0.25,v:0.05}); }
  // terminals
  for(const t of TERMS){ if(t.done) continue; const r={x:t.x*T-6,y:t.y*T-28,w:28,h:28}; t.near=!p.dead&&ov(p,r);
    if(t.near&&keys.up){ t.prog+=dt; t.spawnT-=dt; if(Math.random()<dt*8) sparks(t.x*T+8,t.y*T-18,1,'#ff8a9a');
      if(t.spawnT<=0){ t.spawnT=3.4; mechSpawn(LVL.alarmFoe||'soldier',p.x+(Math.random()<0.5?-1:1)*rnd(6,9)*T); }
      if(t.prog>=t.time){ t.done=true; t.prog=t.time; if(t.fn) t.fn(t); if(AC){ osc({type:'square',f:880,t:0.1,v:0.1}); osc({type:'square',f:1320,t:0.15,v:0.1,when:0.1}); } } }
    else t.prog=Math.max(0,t.prog-dt*0.35); }
  if(MST.endAt&&lvT>=MST.endAt&&state==='play'){ MST.endAt=0; completeLevel(); }
  // gusts
  if(LVL.gusts){ const g=LVL.gusts, tt=lvT%g.per; GWIND=tt>g.per-g.dur?g.force:0; if(tt>g.per-g.dur-1.2&&tt<g.per-g.dur&&!MST.gw){ MST.gw=1; showMsg('Поривът идва!',1.2); } if(tt<1) MST.gw=0; }
  // snow
  for(const s of MST.snow){ s[1]+=(30+s[2]*30)*dt; s[0]+=(GWIND*0.12+Math.sin(lvT+s[3]*9)*8)*dt; if(s[1]>H){ s[1]=-2; s[0]=Math.random()*W; } if(s[0]<0) s[0]+=W; if(s[0]>W) s[0]-=W; }
  mech5Update(dt); mech2Update(dt); mech3Update(dt); mech4Update(dt);
}
function mechSpawn(t,x){ x=clamp(x,3*T,(COLS-3)*T); const tx=Math.floor(x/T); if(!DIMS[t]) return; const fl=!!FOES[t].fly; const e=makeEnemy(t,tx*T+8,fl?groundY(tx)-4*T:groundY(tx)); e.alert=true; e.summoned=true; enemies.push(e); for(let i=0;i<14;i++) part(tx*T+8,(fl?groundY(tx)-4*T:groundY(tx))-12,rnd(-60,60),rnd(-90,10),0.5,'#ff3b4f',2,0); if(AC) SFX.portal&&SFX.portal(0.5); }
function mechAlarm(l){ if(LVL.onAlarm){ LVL.onAlarm(); return; } if(ALARM<=0){ showMsg('ТРЕВОГА! Засякоха те.',2); shake=4; if(MST.alarmN<6){ const p=player; for(const s of [-1,1]){ mechSpawn(LVL.alarmFoe||'soldier',p.x+s*rnd(7,10)*T); MST.alarmN++; } } } ALARM=7; }
/* ---------- drawing ---------- */
function mechDrawBack(){ mech2DrawBack(); mech3DrawBack();
  for(const t of TERMS){ const x=Math.round(t.x*T-cam), y=t.y*T; if(x<-30||x>W+30) continue; px(x-2,y-24,20,24,'#2a2e34'); px(x-2,y-24,20,1,'#4a5058'); px(x,y-21,16,10,t.done?'#1a3a24':'#2a0a10'); px(x+1,y-20,14,8,t.done?'#3dff7a':(Math.floor(titleT*4)%2?'#ff3b4f':'#7a1a26'));
    if(!t.done){ ctx.font='600 5px "IBM Plex Mono",monospace'; ctx.fillStyle='#ffd0d6'; ctx.textAlign='center'; ctx.fillText(t.label||'ТЕРМИНАЛ',x+8,y-28); ctx.textAlign='left'; }
    if(t.prog>0&&!t.done){ px(x-6,y-40,28,4,'rgba(0,0,0,0.6)'); px(x-5,y-39,26*(t.prog/t.time),2,'#ff3b4f'); }
    if(t.near&&!t.done&&Math.floor(titleT*3)%2){ ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='#ffffff'; ctx.textAlign='center'; ctx.fillText('задръж ↑',x+8,y-46); ctx.textAlign='left'; } }
  for(const pl of PLATES){ const x=Math.round(pl.x*T-cam), y=pl.y*T; if(x<-40||x>W+40) continue; px(x+1,y-3,30,3,pl.on?'#ff3b4f':'#5a2a30'); px(x+1,y-4,30,1,pl.on?'#ffd0d6':'#8a4a50'); if(pl.on){ ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.fillStyle='rgba(255,59,79,0.18)'; ctx.fillRect(x,y-14,32,11); ctx.restore(); } }
}
function lightCone(l){ const lx=l.x*T+8-cam, ly=l.y*T+8; if(lx<-260||lx>W+260) return; const half=l.cam?0.17:0.22, len=l.len*T, pts=[[lx,ly]];
  for(let k=0;k<=10;k++){ const a=l.a-half+k*(2*half/10); let r=0; for(;r<len;r+=6){ const xx=l.x*T+8+Math.cos(a)*r, yy=ly+Math.sin(a)*r; if(solidAt(xx,yy)) break; } pts.push([lx+Math.cos(a)*r,ly+Math.sin(a)*r]); }
  const hot=ALARM>0||l.seen>0.05, col=l.eye?(hot?'255,40,60':'255,120,140'):(hot?'255,60,60':l.cam?'255,200,120':'255,240,200');
  ctx.save(); ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(lx,ly,4,lx,ly,len); g.addColorStop(0,`rgba(${col},${hot?0.34:0.24})`); g.addColorStop(1,`rgba(${col},0)`); ctx.fillStyle=g;
  ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]); for(const q of pts) ctx.lineTo(q[0],q[1]); ctx.closePath(); ctx.fill(); ctx.restore();
  if(l.eye){ ctx.fillStyle='#2a0a10'; ctx.beginPath(); ctx.ellipse(lx,ly,9,6,0,0,7); ctx.fill(); ctx.fillStyle=hot?'#ff3b4f':'#ffd0d6'; ctx.beginPath(); ctx.ellipse(lx+Math.cos(l.a)*3,ly+Math.sin(l.a)*2,3,4,0,0,7); ctx.fill(); }
  else { ctx.fillStyle='#2a2e34'; ctx.fillRect(lx-6,ly-8,12,7); ctx.save(); ctx.translate(lx,ly); ctx.rotate(l.a); ctx.fillStyle=l.cam?'#3a3e44':'#4a4e54'; ctx.fillRect(-3,-4,12,8); ctx.fillStyle=hot?'#ff3b4f':(l.cam?'#ff3b4f':'#fff6d0'); ctx.fillRect(8,-3,2,6); ctx.restore(); } }
function drawEcho(){ const f=echoNow(); if(!f) return; const save=player; player=Object.assign({},save,f,{inv:0,hurtT:0,dead:false,flashT:0,swingT:0,reload:0});
  ctx.save(); ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(f.x+5-cam,f.y+13,2,f.x+5-cam,f.y+13,22); g.addColorStop(0,'rgba(255,60,80,0.35)'); g.addColorStop(1,'rgba(255,60,80,0)'); ctx.fillStyle=g; ctx.fillRect(f.x-20-cam,f.y-10,50,46); ctx.restore();
  ctx.save(); ctx.globalAlpha=0.5; drawPlayer(); ctx.restore(); player=save; }
function mechDrawWorld(){
  for(const l of LIGHTS) lightCone(l);
  drawEcho();
  if(ECHO.mode==='rec'&&player&&Math.floor(titleT*4)%2){ ctx.fillStyle='#ff3b4f'; ctx.beginPath(); ctx.arc(player.x+5-cam,player.y-8,2.5,0,7); ctx.fill(); }
  if(LVL.drawExtra) LVL.drawExtra();   // сцени на конкретна игра
  if(MST.snow&&MST.snow.length){ ctx.fillStyle='rgba(240,246,255,0.75)'; for(const s of MST.snow) ctx.fillRect(Math.round(s[0]),Math.round(s[1]),s[2]>1.2?2:1,s[2]>1.2?2:1); }
  mech2DrawWorld(); mech3DrawWorld(); mech4DrawWorld(); mech5DrawWorld();
}
function drawTrainChase(){ const fx=CHASE.x-cam; if(fx<-40) return; const y=9*T, fy=15*T;
  ctx.fillStyle='#2a2e36'; ctx.fillRect(fx-520,y,520,fy-y); ctx.fillStyle='#454b56'; ctx.fillRect(fx-520,y,520,3); ctx.fillStyle='#7a1a26'; ctx.fillRect(fx-520,y+40,520,4);
  for(let i=0;i<10;i++){ ctx.fillStyle='#14181e'; ctx.fillRect(fx-500+i*50,y+12,26,16); }
  ctx.fillStyle='#3a404a'; ctx.beginPath(); ctx.moveTo(fx-16,y); ctx.lineTo(fx+4,y+14); ctx.lineTo(fx+4,fy); ctx.lineTo(fx-16,fy); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.globalCompositeOperation='lighter'; for(const hy of [y+22,y+52]){ const g=ctx.createRadialGradient(fx+4,hy,1,fx+4,hy,70); g.addColorStop(0,'rgba(255,250,220,0.9)'); g.addColorStop(1,'rgba(255,250,220,0)'); ctx.fillStyle=g; ctx.fillRect(fx-60,hy-70,140,140); }
  const g2=ctx.createLinearGradient(fx,0,fx+220,0); g2.addColorStop(0,'rgba(255,246,210,0.22)'); g2.addColorStop(1,'rgba(255,246,210,0)'); ctx.fillStyle=g2; ctx.beginPath(); ctx.moveTo(fx+4,y+20); ctx.lineTo(fx+220,y-10); ctx.lineTo(fx+220,fy); ctx.lineTo(fx+4,y+56); ctx.closePath(); ctx.fill(); ctx.restore();
  if(Math.random()<0.7) part(CHASE.x-rnd(0,300),fy-2,rnd(-120,-20),rnd(-80,-10),rnd(0.2,0.4),'#ffd080',1.5,300);
  if(Math.random()<0.05&&AC) nz({t:0.4,v:0.08,type:'bandpass',f:2400,q:4}); }
function mechLights(L){
  for(const l of LIGHTS) L.push([l.x*T+8+Math.cos(l.a)*l.len*T*0.5,l.y*T+8+Math.sin(l.a)*l.len*T*0.5,70,0.5]);
  for(const t of TERMS) L.push([t.x*T+8,t.y*T-16,40,0.6]);
  const f=echoNow(); if(f) L.push([f.x+5,f.y+13,40,0.5]);
  if(LVL.flash&&player&&!player.dead){ const p=player, cx=p.x+p.w/2, cy=p.y+10, d=p.face||1; for(let k=1;k<=6;k++) L.push([cx+d*k*20,cy+(p.aimUp?-k*14:0),18+k*6,0.9-k*0.09]); L.push([cx,cy,34,0.6]); }
  if(LVL.lightsExtra) LVL.lightsExtra(L);
  if(CHASE&&!CHASE.done&&LVL.chase.kind==='train') L.push([CHASE.x+60,12*T,120,1]);
  mech2Lights(L); mech3Lights(L); mech4Lights(L); mech5Lights(L);
}
function mechChips(chip){
  if(LVL.echo||ECHO.mode!=='idle') chip(ECHO.mode==='rec'?'● ЕХО · ЗАПИС '+Math.max(0,ECHO_MAX-ECHO.t).toFixed(1)+' s · E — спри':ECHO.mode==='play'?'◎ ЕХО · ПОВТАРЯ · E — изчисти':'◎ ЕХО · E — запис',ECHO.mode==='rec'?'#ff3b4f':'#ffb0bc');
  if(ALARM>0) chip('⚠ ТРЕВОГА · '+Math.ceil(ALARM)+' s','#ff5a5a');
  if(LVL.gusts) chip(GWIND?'❄ ПОРИВ НА ВЯТЪРА!':'❄ вятър','#cfe0ff');
  mech5Chips(chip); mech2Chips(chip); mech3Chips(chip); mech4Chips(chip);
}
/* ритмични платформи: появяват се в такт (4 удара на такт) */
const BEAT3=(bpm)=>60/bpm*4;
const rhythmA=(rects,bpm,off)=>({per:BEAT3(bpm),off:off||0,beat:1,a:rects.map(r=>[...r.slice(0,4),'=']),b:[]});
