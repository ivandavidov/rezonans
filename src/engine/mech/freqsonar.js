/* ================= МЕХАНИКА · ЧЕСТОТИ, СОНАР, ЗАСТИНАЛО ВРЕМЕ, СПОМЕНИ =================
   Честоти (LVL.freq): плочките '1','2','3' са твърди само в активния тон; E сменя тона.
     Враг с e.fq е уязвим само в своя тон (LVL.fqFoes раздава тонове на враговете в нивото).
   Сонар (LVL.sonar): E изпраща импулс, който за миг осветява стените — и вдига шум.
   Застинало време (LVL.still или LVL.stillZones:[[tx0,tx1]]): враговете и снарядите се движат
     само докато се движиш ти (механиката задава foeTime на двигателя).
   Спомени: пикап 'memory' — по един в епизод, пазят се под KEY('mem'); текстът е в LVL.memory. */
const FQ_COL=['#ff6a8a','#5ad2ff','#ffd04a'], FQ_DARK=['#5a1a2a','#123a4a','#4a3a10'], FQ_RGB=['255,106,138','90,210,255','255,208,74'], FQ_NAME=['ДО','МИ','СОЛ'], FQ_HZ=[523,659,784];
let FREQ=0, FQT=[], SONAR=[], sonarCd=0, STILL={k:1,on:false}, fqBlockT=0;
function fqApply(){ for(const c of '123') SOLID.delete(c); SOLID.add(String(FREQ+1)); }
fqApply();
function fqsLoad(){
  const L=LVL; FREQ=L&&L.freqStart||0; fqApply(); FQT=[]; SONAR=[]; sonarCd=0; STILL={k:1,on:false}; foeTime=1; fqBlockT=0;
  if(!L) return;
  if(L.freq) for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++){ const c=map[y][x]; if(c==='1'||c==='2'||c==='3') FQT.push([x,y,+c-1]); }
  if(L.fqFoes) for(const e of enemies) if(e.fq==null&&!e.tag) e.fq=Math.floor(e.x/T/6)%(L.freqN||3);
}
function fqsRespawn(){ SONAR=[]; STILL.k=1; foeTime=1; }
function freqNext(){
  const p=player, n=LVL.freqN||3, nf=(FREQ+1)%n;
  for(const [x,y,f] of FQT) if(f===nf&&ov(p,{x:x*T,y:y*T,w:T,h:T})){ fqBlockT=0.6; if(AC) osc({type:'square',f:140,t:0.12,v:0.06}); return; }
  FREQ=nf; fqApply();
  for(const [x,y,f] of FQT) if(f===nf) for(const e of enemies) if(!e.dead&&!e.mech&&ov(e,{x:x*T,y:y*T,w:T,h:T})) hurtEnemy(e,999,0);
  if(AC){ osc({type:'sine',f:FQ_HZ[nf],t:0.35,v:0.11}); osc({type:'triangle',f:FQ_HZ[nf]*2,t:0.18,v:0.04}); }
  for(let i=0;i<16;i++){ const a=i/16*6.283; part(p.x+p.w/2+Math.cos(a)*6,p.y+12+Math.sin(a)*6,Math.cos(a)*90,Math.sin(a)*90,0.35,FQ_COL[nf],1.5,0); }
}
function sonarPing(){
  if(sonarCd>0) return; const p=player, x=p.x+p.w/2, y=p.y+p.h/2; sonarCd=1.1; SONAR.push({x,y,t:0}); noise(x,y,'sonar');
  for(const e of enemies) if(!e.dead&&Math.hypot(e.x-x,e.y-y)<13*T) e.alert=true;
  if(AC){ osc({type:'sine',f:1800,f2:600,t:0.5,v:0.09}); osc({type:'sine',f:900,f2:300,t:0.7,v:0.05,when:0.12}); }
}
function fqsUpdate(dt){
  const p=player; if(!p) return;
  const tx0=(p.x+p.w/2)/T; STILL.son=!!LVL.sonar||!!(LVL.sonarZones&&LVL.sonarZones.some(z=>tx0>=z[0]&&tx0<=z[1]));
  if(E_ACT==='sonar') sonarPing(); else if(E_ACT==='freq') freqNext();
  sonarCd=Math.max(0,sonarCd-dt); fqBlockT=Math.max(0,fqBlockT-dt);
  for(const s of SONAR) s.t+=dt; SONAR=SONAR.filter(s=>s.t<1.6);
  const tx=(p.x+p.w/2)/T; STILL.on=!p.dead&&(!!LVL.still||!!(LVL.stillZones&&LVL.stillZones.some(z=>tx>=z[0]&&tx<=z[1])));
  const tgt=STILL.on?clamp(Math.abs(p.vx)/150+Math.abs(p.vy)/420+(p.cool>0?0.3:0)+(p.climb&&(keys.up||keys.down)?0.5:0),0.03,1):1;
  STILL.k+=(tgt-STILL.k)*Math.min(1,dt*(tgt>STILL.k?14:7)); foeTime=STILL.k;
}
function fqsDrawBack(){
  if(!FQT.length) return; const a=(Math.sin(titleT*4)+1)/2;
  for(const [x,y,f] of FQT){ const sx=x*T-cam; if(sx<-T||sx>W) continue; const sy=y*T;
    if(f===FREQ){ ctx.fillStyle=FQ_DARK[f]; ctx.fillRect(sx,sy,T,T); ctx.fillStyle=FQ_COL[f]; ctx.fillRect(sx,sy,T,2); ctx.fillRect(sx,sy,1,T); ctx.fillStyle=`rgba(${FQ_RGB[f]},0.35)`; ctx.fillRect(sx+3,sy+5,10,1); ctx.fillRect(sx+3,sy+9,10,1); ctx.fillRect(sx+3,sy+13,10,1); }
    else { ctx.strokeStyle=`rgba(${FQ_RGB[f]},${0.22+a*0.12})`; ctx.setLineDash([2,2]); ctx.strokeRect(sx+0.5,sy+0.5,T-1,T-1); ctx.setLineDash([]); ctx.fillStyle=`rgba(${FQ_RGB[f]},0.05)`; ctx.fillRect(sx,sy,T,T); } }
}
function fqsDrawWorld(){
  const p=player;
  for(const s of SONAR){ const r=s.t*300, al=Math.max(0,1-s.t/1.3); if(al<=0) continue; ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.strokeStyle=`rgba(140,220,255,${al*0.8})`; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(s.x-cam,s.y,r,0,7); ctx.stroke(); ctx.strokeStyle=`rgba(140,220,255,${al*0.3})`; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(s.x-cam,s.y,r*0.8,0,7); ctx.stroke(); ctx.restore(); }
  for(const b of ebullets){ if(b.fq==null) continue; const x=b.x-cam; ctx.strokeStyle=FQ_COL[b.fq]; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x,b.y,(b.r||4)+1.5,0,7); ctx.stroke(); ctx.lineWidth=1; if(b.fq===FREQ){ ctx.fillStyle=`rgba(${FQ_RGB[b.fq]},0.35)`; ctx.beginPath(); ctx.arc(x,b.y,(b.r||4)+3,0,7); ctx.fill(); } }
  if(LVL.freq){ for(const e of enemies){ if(e.dead||e.fq==null) continue; const x=Math.round(e.x+e.w/2-cam), y=Math.round(e.y-6), on=e.fq===FREQ; ctx.fillStyle=FQ_COL[e.fq]; ctx.globalAlpha=on?1:0.45; ctx.beginPath(); ctx.moveTo(x,y-3); ctx.lineTo(x+3,y); ctx.lineTo(x,y+3); ctx.lineTo(x-3,y); ctx.closePath(); ctx.fill(); ctx.globalAlpha=1; }
    if(p&&!p.dead){ const x=Math.round(p.x+p.w/2-cam), y=Math.round(p.y-5); ctx.fillStyle=fqBlockT>0&&Math.floor(titleT*12)%2?'#ffffff':FQ_COL[FREQ]; ctx.fillRect(x-2,y-2,4,4); } }
}
function fqsLights(L){
  for(const s of SONAR){ const r=s.t*300, al=Math.max(0,1-s.t/1.3); if(al<=0) continue; for(let i=0;i<28;i++){ const a=i/28*6.283; L.push([s.x+Math.cos(a)*r,s.y+Math.sin(a)*r,44,al*0.95]); } L.push([s.x,s.y,Math.min(r,120),al*0.4]); }
  if(FQT.length&&player){ let n=0; for(const [x,y,f] of FQT){ if(f!==FREQ||Math.abs(x*T-player.x)>260||(x+y)%3) continue; L.push([x*T+8,y*T+8,26,0.35]); if(++n>40) break; } }
  if(STILL.son&&player&&!player.dead) L.push([player.x+player.w/2,player.y+12,30,0.45]);
}
function fqsChips(chip){
  if(LVL.freq&&!STILL.son) chip('♪ ТОН '+FQ_NAME[FREQ]+(fqBlockT>0?' · БЛОКИРАНО':' · E — смени'),FQ_COL[FREQ]);
  if(STILL.son) { const sn=GAME.sonarName||'СОНАР'; chip(sonarCd>0?'◉ '+sn+' · презарежда':'◉ '+sn+' · E — импулс','#8adcff'); }
  if(STILL.on) chip('⧗ ЗАСТИНАЛО ВРЕМЕ · движи се, за да тече','#e8d8b0');
}
function fqsPostFx(){
  if(STILL.k<0.97&&state==='play'){ const a=(1-STILL.k); ctx.save(); ctx.globalCompositeOperation='saturation'; ctx.fillStyle=`rgba(128,128,128,${a*0.7})`; ctx.fillRect(0,0,W,H); ctx.globalCompositeOperation='soft-light'; ctx.fillStyle=`rgba(230,200,140,${a*0.35})`; ctx.fillRect(0,0,W,H); ctx.restore(); }
}
/* ---------- спомени ---------- */
const memList=()=>store.get(KEY('mem'),'').split(',').filter(Boolean).map(Number);
const memHas=i=>memList().includes(i);
const memCount=()=>memList().filter(i=>GLV[i]&&GLV[i].memory).length;
const memTotal=()=>GLV.filter(l=>l.memory).length;
defItem('memory',{take:k=>{ if(!LVL.memory) return false;
  if(!SURV&&LI>=0&&!memHas(LI)) store.set(KEY('mem'),memList().concat(LI).join(','));
  SFX.pickup(); if(AC){ osc({type:'sine',f:784,t:0.6,v:0.07}); osc({type:'sine',f:1046,t:0.8,v:0.05,when:0.2}); }
  for(let i=0;i<18;i++) part(k.x+6,k.y+5,rnd(-50,50),rnd(-80,-10),0.9,'#ffe6a0',1.5,-20);
  showMsg(LVL.memory,7,(GAME.memLabel||'СПОМЕН')+' '+memCount()+' / '+memTotal()); }});
defItem('memory',{draw:(k,x,y)=>{ const had=!SURV&&memHas(LI), a=titleT*2+k.bob;
  ctx.save(); ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(x+6,y+4,1,x+6,y+4,16); g.addColorStop(0,`rgba(255,220,140,${had?0.25:0.6})`); g.addColorStop(1,'rgba(255,220,140,0)'); ctx.fillStyle=g; ctx.fillRect(x-10,y-12,32,32); ctx.restore();
  ctx.globalAlpha=had?0.45:1; ctx.fillStyle='#f4ead2'; ctx.fillRect(x+1,y-2,10,12); ctx.fillStyle='#8a7a5a'; ctx.fillRect(x+2,y-1,8,7); ctx.fillStyle='#c8b48a'; ctx.fillRect(x+4,y+1,3,3); ctx.fillStyle='#ffe6a0'; ctx.fillRect(x+5+Math.round(Math.sin(a)*4),y-5,1,1); ctx.globalAlpha=1; }});
defMech('freqsonar',{load:fqsLoad,respawn:fqsRespawn,update:fqsUpdate,drawBack:fqsDrawBack,drawWorld:fqsDrawWorld,lights:fqsLights,chips:fqsChips,postFx:fqsPostFx});
