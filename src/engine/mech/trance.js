/* ================= МЕХАНИКА · ХОРА В ТРАНС, РАКЕТИ, ШАХТИ, СКРИТИ ПРОХОДИ, ВОДОПАДИ, ПРИЛЕПИ =================
   Хора в транс (LVL.sleepers:[[tx,tx1,опции]]): вървят насън към tx1; задръж ↑ до тях, за да ги събудиш.
     LVL.needHeal — изходът се отваря едва когато всички са будни. Стрелбата минава през тях.
   Сигнални ракети (LVL.flares): E хвърля ракета, която осветява мястото; прилепите бягат от светлина.
   Светлинни шахти (LVL.shafts:[[tx,широчина,период,фаза]]): дневна светлина от отворите в тавана.
   Скрити проходи: плочката 'h' изглежда като стена, но се минава; сонарът/стетоскопът я разкрива.
   Водопади (LVL.falls:[[x0,y0,x1,y1]]): водна завеса, която бута надолу.
   Враг 'bat' (прилеп): лети на рояци в тъмното и бяга от светлина. */
let SLEEPERS=[], FLARES=[], flareCd=0, HREV={}, M3={};
const SLEEP_HEAL=1.5;
function tranceLoad(){
  SLEEPERS=[]; FLARES=[]; flareCd=0; HREV={}; M3={healed:0,lostMsg:0};
  const L=LVL; if(!L) return;
  for(const s of (L.sleepers||[])) addSleeper(s[0],s[1],s[2]||{});
  if(L.falls) L.winds=(L.winds||[]).filter(w=>!w.fall).concat(L.falls.map(f=>Object.assign([f[0],f[1],f[2],f[3],0,f[4]||520],{fall:1})));
}
function tranceRespawn(){ FLARES=[]; for(const s of SLEEPERS) if(!s.ok&&!s.boss){ s.heal=0; } }
function addSleeper(tx,tx1,o={}){
  const x=tx*T+3, s={x,y:o.row!=null?(o.row+1)*T-24:0,w:10,h:24,x0:x,x1:tx1*T+3,dir:tx1>=tx?1:-1,heal:0,ok:false,fall:0,vy:0,anim:Math.random()*9,seed:Math.floor(Math.random()*999),t:0,...o};
  s.y=sleeperFloor(s)-s.h; s.y0=s.y; SLEEPERS.push(s); return s; }
function sleeperFloor(s){ const tx=Math.floor((s.x+s.w/2)/T); let ty=s.y?Math.max(1,Math.floor((s.y+s.h-2)/T)):1;
  while(ty<16&&isS(tx,ty)) ty++; while(ty<16&&!isS(tx,ty)&&tileAt(tx,ty)!=='-') ty++; return ty*T; }
function sleepersLeft(){ return SLEEPERS.filter(s=>!s.ok&&!s.boss).length; }
function tranceExitOk(){ if(LVL.needHeal&&sleepersLeft()>0){ if(!M3.exitMsg||lvT-M3.exitMsg>3){ M3.exitMsg=lvT; showMsg('Не можеш да ги оставиш. Събуди всички хора в транс ('+sleepersLeft()+' остават).',2.5); } return false; } return true; }
function throwFlare(){ const p=player; if(flareCd>0||p.dead) return; flareCd=1.6;
  FLARES.push({x:p.x+p.w/2+p.face*6,y:p.y+8,vx:p.face*170+p.vx*0.3,vy:p.aimUp?-300:-170,t:0,life:8,stuck:false});
  if(AC){ nz({t:0.35,v:0.1,type:'highpass',f:2400}); osc({type:'sine',f:300,f2:900,t:0.25,v:0.05}); } }
function shaftK(s){ return clamp(0.5+0.65*Math.sin(lvT*6.283/(s[2]||9)+(s[3]||0)),0,1); }
function isLit(x,y){
  for(const f of FLARES) if(Math.hypot(f.x-x,f.y-y)<96*Math.min(1,(f.life-f.t)/1.5)) return true;
  if(LVL.shafts) for(const s of LVL.shafts){ if(x>s[0]*T-4&&x<(s[0]+s[1])*T+4&&shaftK(s)>0.35) return true; }
  return false; }
function tranceUpdate(dt){
  const p=player; if(!p) return;
  flareCd=Math.max(0,flareCd-dt);
  if(E_ACT==='flare') throwFlare();
  // ракети
  for(const f of FLARES){ f.t+=dt; if(!f.stuck){ f.vy+=G*0.8*dt; const nx=f.x+f.vx*dt, ny=f.y+f.vy*dt; if(solidAt(nx,ny)){ if(solidAt(f.x,ny)){ f.vy=0; f.vx*=0.4; if(Math.abs(f.vx)<20) f.stuck=true; } else f.vx=-f.vx*0.3; } else { f.x=nx; f.y=ny; } }
    if(Math.random()<dt*30) part(f.x,f.y,rnd(-30,30),rnd(-60,-10),0.4,Math.random()<0.5?'#ff6a4a':'#fff0c0',1.5,60); }
  FLARES=FLARES.filter(f=>f.t<f.life&&f.y<H+40);
  // скрити проходи — разкриват се от вълната на сонара/стетоскопа
  for(const s of SONAR){ const r=s.t*300, c0=Math.floor((s.x-r-20)/T), c1=Math.floor((s.x+r+20)/T);
    for(let tx=Math.max(0,c0);tx<=Math.min(COLS-1,c1);tx++) for(let ty=0;ty<ROWS;ty++) if(map[ty][tx]==='h'){ const d=Math.hypot(tx*T+8-s.x,ty*T+8-s.y); if(d<r+10&&!HREV[tx+','+ty]){ HREV[tx+','+ty]=lvT; if(!M3.hmsg){ M3.hmsg=1; showMsg('Стената звучи кухо — зад нея има проход.',2.5); } } } }
  // хора в транс
  const sp=D.sleepSp;
  for(const s of SLEEPERS){ s.anim+=dt;
    if(s.ok){ s.t+=dt; continue; }
    if(s.fall>0){ if(!s.fadeOnly){ s.vy+=G*dt; s.y+=s.vy*dt; } s.fall-=dt; if(s.fall<=0){ if(s.onLost) s.onLost(s); if(s.gone){ s.dead=true; continue; } s.x=s.x0; s.y=s.y0; s.vy=0; s.heal=0; s.fadeOnly=false; if(!M3.lostMsg||lvT-M3.lostMsg>6){ M3.lostMsg=lvT; showMsg('Човекът се събуди за миг, обърка се и пак тръгна отначало.',2.4); } } continue; }
    const near=!p.dead&&Math.abs((p.x+p.w/2)-(s.x+s.w/2))<16&&Math.abs((p.y+p.h)-(s.y+s.h))<20;
    if(near&&keys.up){ s.heal+=dt; if(Math.random()<dt*14) part(s.x+s.w/2+rnd(-6,6),s.y+rnd(0,12),rnd(-20,20),rnd(-50,-10),0.6,'#ffe6a0',1.5,-30);
      if(s.heal>=SLEEP_HEAL) wakeSleeper(s); continue; }
    s.heal=Math.max(0,s.heal-dt*0.6);
    if(s.wait>0){ s.wait-=dt; continue; }
    const nx=s.x+s.dir*sp*(s.speed||1)*dt, fx=s.dir>0?nx+s.w:nx, ftx=Math.floor(fx/T), fyr=Math.floor((s.y+s.h-2)/T);
    if(isS(ftx,fyr)&&!isS(ftx,fyr-1)&&!isS(ftx,fyr-2)) { s.x=nx; s.y-=T; }   // стъпало нагоре
    else if(!isS(ftx,fyr)) s.x=nx;
    const fl=sleeperFloor(s); if(fl>s.y+s.h+2*T||fl>=16*T){ s.fall=1.4; s.vy=-40; } else s.y=fl-s.h;
    if((s.dir>0&&s.x>=s.x1)||(s.dir<0&&s.x<=s.x1)){ if(s.reach) s.reach(s); else { const tx1=Math.floor((s.x+s.w/2+s.dir*T)/T), solidAhead=isS(tx1,Math.floor((s.y+s.h)/T)); s.fall=1.4; s.vy=solidAhead?0:-60; s.fadeOnly=solidAhead; } }
  }
  SLEEPERS=SLEEPERS.filter(s=>!s.dead);
}
function wakeSleeper(s){ s.ok=true; s.t=0; M3.healed++; SFX.pickup(); if(AC){ osc({type:'sine',f:523,t:0.3,v:0.07}); osc({type:'sine',f:784,t:0.4,v:0.06,when:0.15}); }
  for(let i=0;i<14;i++) part(s.x+s.w/2,s.y+8,rnd(-60,60),rnd(-90,-20),0.8,'#ffe6a0',1.5,-30);
  const lines=LVL.wakeLines||['Къде съм?…','Сънувах, че някой ме вика от пещерата.','Докторе? Какво правя навън по пижама?','Чувах музика. Като камбана под земята.','Благодаря ти… Главата ми бучи.'];
  if(!s.boss) showMsg(s.line||lines[(s.seed+M3.healed)%lines.length],2.6,'ПАЦИЕНТ');
  if(!s.boss&&M3.healed%2===1) pickups.push({type:'health',x:s.x,y:s.y+s.h-10,w:12,h:10,taken:false,bob:0,vy:-80});
  if(s.fn) s.fn(s); if(LVL.onHeal) LVL.onHeal(s);
  if(LVL.needHeal&&!sleepersLeft()) showMsg('Всички са будни. Пътят напред е свободен.',2.5);
}
function tranceDrawBack(){
  if(!LVL.shafts) return;
  ctx.save(); ctx.globalCompositeOperation='lighter';
  for(const s of LVL.shafts){ const k=shaftK(s), x0=s[0]*T-cam, w=s[1]*T; if(x0>W+80||x0+w<-80) continue;
    const g=ctx.createLinearGradient(0,0,0,15*T); g.addColorStop(0,`rgba(255,246,214,${0.32*k})`); g.addColorStop(1,`rgba(255,240,200,${0.06*k})`); ctx.fillStyle=g;
    ctx.beginPath(); ctx.moveTo(x0+4,0); ctx.lineTo(x0+w-4,0); ctx.lineTo(x0+w+18,15*T); ctx.lineTo(x0-18,15*T); ctx.closePath(); ctx.fill();
    ctx.fillStyle=`rgba(255,250,230,${0.5*k})`; for(let i=0;i<8;i++){ const yy=(titleT*12+i*37+s[0]*13)%(15*T), xx=x0+((i*29+s[0]*7)%Math.max(4,w)); ctx.fillRect(xx,yy,1,1); } }
  ctx.restore();
}
function drawSleeper(s){ const x=Math.round(s.x+s.w/2-cam), y=Math.round(s.y+s.h); if(x<-20||x>W+20) return;
  const c=[['#e8e0f0','#8a8ab0'],['#f0e0c8','#b08a5a'],['#d8ecdc','#6a9a7a'],['#f4d8d8','#b06a6a']][s.seed%4], sw=s.ok?0:Math.sin(s.anim*3)*1.2, b=s.ok?0:Math.round(Math.sin(s.anim*6)*0.6);
  ctx.save(); if(s.fall>0){ ctx.globalAlpha=Math.max(0,s.fall/1.4); }
  ctx.fillStyle=c[1]; ctx.fillRect(x-3,y-9,3,9); ctx.fillRect(x+1,y-9,3,9);
  ctx.fillStyle=c[0]; ctx.fillRect(x-4,y-20+b,9,12); for(let i=0;i<3;i++){ ctx.fillStyle=c[1]; ctx.fillRect(x-4,y-18+i*4+b,9,1); }
  ctx.fillStyle='#e2b48f'; ctx.fillRect(x-3,y-26+b,7,6); ctx.fillStyle=['#3a2a1a','#8a8a8a','#c8a050','#1a1a1a'][s.seed%4]; ctx.fillRect(x-3,y-27+b,7,2);
  if(!s.ok){ ctx.fillStyle='#e2b48f'; ctx.fillRect(x+(s.dir>0?4:-9),y-18+sw,6,2); ctx.fillStyle='#3a2a1a'; ctx.fillRect(x-1,y-23+b,2,1); ctx.fillRect(x+2,y-23+b,2,1); }
  else { ctx.fillStyle='#2a1a10'; ctx.fillRect(x-1,y-24,1,1); ctx.fillRect(x+2,y-24,1,1); ctx.fillStyle='#e2b48f'; ctx.fillRect(x+4,y-22-Math.abs(Math.sin(s.t*6))*3*(s.t<2?1:0),2,5); }
  ctx.restore();
  if(!s.ok&&s.fall<=0){ if(Math.floor(titleT*1.5+s.seed)%3===0){ ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='rgba(220,230,255,0.75)'; ctx.fillText('z',x+5,y-30-((titleT*8)%6)); }
    if(s.heal>0){ ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(x-12,y-36,24,4); ctx.fillStyle='#ffe6a0'; ctx.fillRect(x-11,y-35,22*(s.heal/SLEEP_HEAL),2); }
    const p=player; if(p&&!p.dead&&Math.abs((p.x+p.w/2)-(s.x+s.w/2))<16&&Math.abs((p.y+p.h)-(s.y+s.h))<20&&s.heal<=0&&Math.floor(titleT*3)%2){ ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='#ffffff'; ctx.textAlign='center'; ctx.fillText('задръж ↑',x,y-40); ctx.textAlign='left'; } }
}
function tranceDrawWorld(){
  for(const s of SLEEPERS) drawSleeper(s);
  // скрити стени
  const c0=Math.max(0,Math.floor(cam/T)), c1=Math.min(COLS-1,c0+31);
  for(let tx=c0;tx<=c1;tx++) for(let ty=0;ty<ROWS;ty++){ if(map[ty][tx]!=='h') continue; const P=TP(tx), x=tx*T-cam, y=ty*T, rv=HREV[tx+','+ty]||(chtOn('secret')?-9:0);
    const a=rv?Math.max(0.18,1-(lvT-rv)*1.5):1; ctx.globalAlpha=a; ctx.fillStyle=P.s||'#5a5a5a'; ctx.fillRect(x,y,T,T); ctx.fillStyle=P.sd||'#333'; ctx.fillRect(x,y+15,T,1); ctx.fillRect(x+15,y,1,T); ctx.fillStyle=P.sh||'#888'; ctx.fillRect(x,y,T,1); ctx.globalAlpha=1;
    if(rv){ ctx.strokeStyle='rgba(140,220,255,0.6)'; ctx.setLineDash([2,2]); ctx.strokeRect(x+0.5,y+0.5,T-1,T-1); ctx.setLineDash([]); } }
  // ракети
  for(const f of FLARES){ const x=f.x-cam, fl=0.7+Math.random()*0.3; ctx.save(); ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(x,f.y,1,x,f.y,40); g.addColorStop(0,`rgba(255,120,90,${0.6*fl})`); g.addColorStop(1,'rgba(255,80,40,0)'); ctx.fillStyle=g; ctx.fillRect(x-40,f.y-40,80,80); ctx.restore();
    ctx.fillStyle='#fff0c0'; ctx.fillRect(Math.round(x)-1,Math.round(f.y)-1,3,3); }
  // водопади
  if(LVL.falls){ ctx.save(); for(const f of LVL.falls){ const x0=f[0]*T-cam, x1=(f[2]+1)*T-cam, y0=f[1]*T, y1=(f[3]+1)*T; if(x1<-10||x0>W+10) continue;
    ctx.fillStyle='rgba(170,240,230,0.28)'; ctx.fillRect(x0,y0,x1-x0,y1-y0); ctx.fillStyle='rgba(235,255,250,0.5)';
    for(let i=0;i<(x1-x0)/3;i++){ const sx=x0+i*3+(i%2), len=10+(i*7)%14, sy=y0+((titleT*220+i*41)%(y1-y0+len))-len; ctx.fillRect(sx,Math.max(y0,sy),1,Math.min(len,y1-Math.max(y0,sy))); }
    for(let i=0;i<4;i++) if(Math.random()<0.3) part(rnd(x0,x1)+cam,y1-2,rnd(-40,40),rnd(-80,-20),0.4,'#e8fffa',1.5,200); } ctx.restore(); }
}
function tranceLights(L){
  for(const f of FLARES){ const k=Math.min(1,(f.life-f.t)/1.5); L.push([f.x,f.y,110*k,1]); }
  if(LVL.shafts) for(const s of LVL.shafts){ const k=shaftK(s); if(k<0.05) continue; for(let y=1;y<15;y+=3) L.push([(s[0]+s[1]/2)*T,y*T,(s[1]*8+30+y*2),0.9*k]); }
  for(const s of SLEEPERS) if(!s.ok) L.push([s.x+5,s.y+8,26,0.3]);
}
function tranceChips(chip){
  if(LVL.hero&&GAME.heroName) chip(GAME.heroName(LVL.hero),GAME.accent2||'#ffe6a0');
  const n=SLEEPERS.filter(s=>!s.boss).length; if(n) chip('♥ БУДНИ '+SLEEPERS.filter(s=>s.ok&&!s.boss).length+' / '+n+(sleepersLeft()?' · задръж ↑ до човек в транс':''),'#ffe6a0');
  if(LVL.flares) chip(flareCd>0?'✸ РАКЕТА · '+flareCd.toFixed(1)+' s':'✸ РАКЕТА · E — хвърли','#ff9a7a');
}
// плочката 'h' се рисува като фон — истинската „стена“ се рисува отгоре, докато не я разкриеш
defTile(function(tx,ty,ch){ if(ch==='h'){ drawBack(tx,ty); return true; } return false; });

/* ---------- прилеп ---------- */
defFoes('dims',{bat:[10,8,18]});
defFoe('bat',{upd:(e,dt)=>{ const ex=e.x+e.w/2, ey=e.y+e.h/2, p=player;
  if(e.scared>0||isLit(ex,ey)){ if(!(e.scared>0)) e.scared=0.9; e.scared-=dt; e.anim+=dt*2; let fx=0,fy=-1; for(const f of FLARES){ const d=Math.hypot(ex-f.x,ey-f.y)||1; if(d<160){ fx+=(ex-f.x)/d; fy+=(ey-f.y)/d; } }
    const n=Math.hypot(fx,fy)||1; e.vx+=(fx/n*150-e.vx)*Math.min(1,dt*5); e.vy+=(fy/n*150-e.vy)*Math.min(1,dt*5); moveX(e,e.vx*dt); moveY(e,e.vy*dt); e.alert=true; return; }
  updFlyer(e,dt); e.anim+=dt*2;
  if(p&&!p.dead&&isLit(p.x+p.w/2,p.y+p.h/2)&&e.state==='dive'){ e.state='retreat'; e.t=0.5; } }});
defFoe('bat',{draw:e=>{ if(e.dead&&e.deadT>0.6) return; const x=Math.round(e.x+e.w/2-cam), y=Math.round(e.y+e.h/2), f=Math.sin(e.anim*18);
  ctx.fillStyle=e.hitT>0?'#fff':e.dead?'#5a4a4a':'#2a2024'; ctx.fillRect(x-2,y-2,4,4);
  ctx.beginPath(); ctx.moveTo(x-1,y-1); ctx.lineTo(x-8,y-3-f*4); ctx.lineTo(x-5,y+1); ctx.lineTo(x-1,y+1); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x+1,y-1); ctx.lineTo(x+8,y-3-f*4); ctx.lineTo(x+5,y+1); ctx.lineTo(x+1,y+1); ctx.closePath(); ctx.fill();
  if(!e.dead){ ctx.fillStyle='#ff5a4a'; ctx.fillRect(x-1,y-1,1,1); ctx.fillRect(x+1,y-1,1,1); } }});
defMech('trance',{load:tranceLoad,respawn:tranceRespawn,exitOk:tranceExitOk,update:tranceUpdate,drawBack:tranceDrawBack,drawWorld:tranceDrawWorld,lights:tranceLights,chips:tranceChips});
