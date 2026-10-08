/* ================= РЕЗОНАНС 5 · ИСТОРИЯ: ФИНАЛЪТ, ЕКРАНИ, ЦВЕТОВЕ ================= */
let GRADE5=null;
function r5Finale(){ if(MST.fin) return; MST.fin=1; store.set('rz5.done','1'); flash=1; flashCol='#ffffff'; shake=8;
  if(AC){ for(let i=0;i<4;i++) osc({type:'sine',f:880+i*110,f2:660,t:0.6,v:0.06,when:i*0.35}); osc({type:'sine',f:196,t:3,v:0.08,when:1.4}); }
  LVL.end=['Иван е буден. Не плаче — гледа към прозореца, към платото.','После поема дъх и проплаква — високо и чисто, като камбана.','Лампите спират да мигат. Под Деветашкото плато нещо огромно замлъква.'];
  MST.endAt=lvT+2.8; }
function r5DrawCrib(){ const x=Math.round(67*T+7-cam), y=15*T-14; if(x<-40||x>W+40) return; const k=MST.fin?Math.max(0,1-(lvT-(MST.endAt-2.8))/2.5):0.5+0.2*Math.sin(titleT*4.9);
  ctx.save(); ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(x,y,2,x,y,50); g.addColorStop(0,`rgba(255,240,200,${0.5*k+(MST.fin?0.4:0)})`); g.addColorStop(1,'rgba(63,208,160,0)'); ctx.fillStyle=g; ctx.fillRect(x-50,y-50,100,100);
  if(MST.fin){ const r=(lvT-(MST.endAt-2.8))*120; ctx.strokeStyle=`rgba(255,255,255,${Math.max(0,0.8-r/300)})`; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.stroke(); ctx.lineWidth=1; }
  ctx.restore(); }
function renderWin5(){
  overlay(0.9); const t=titleT, all=memCount()>=memTotal();
  ctx.save(); ctx.globalCompositeOperation='lighter'; for(let i=0;i<3;i++){ const k=((t*0.2+i/3)%1); ctx.strokeStyle=`rgba(63,208,160,${(1-k)*0.3})`; ctx.beginPath(); ctx.arc(W/2,90,20+k*240,0,7); ctx.stroke(); } ctx.restore();
  centerText('ИЗВОР',70,'700 30px '+DFONT(),'#fff4d8');
  centerText('КРАЙ НА ПЕТАТА ЧАСТ',96,'600 10px "IBM Plex Mono",monospace',ACC());
  ['„Камертон-3“ замлъкна. Деветашката пещера отново е само пещера.','В доклада си Илиева пише: „Мисията е изпълнена. Детето е добре.“','После добавя ред, който никой няма да прочете повече от четирийсет години: „Детето чува тона.“']
    .forEach((l,i)=>centerText(l,128+i*14,'600 8px "IBM Plex Mono",monospace','#e8e0cc'));
  centerText('„Резонанс 5: Извор“ е преминат на трудност „'+D.name+'“ · страници: '+memCount()+' / '+memTotal(),184,'600 8px "IBM Plex Mono",monospace','#cfd8dc');
  centerText(all?'Последната страница: „Иване, ако някога прочетеш това — ние не бягахме. Ние те пазехме.“':'Събери всички страници от дневника — последната пази още една тайна.',204,'600 7px "IBM Plex Mono",monospace','#ffcf6a');
  if(winT>2&&blink()) centerText('Z — към менюто',236,'600 10px "IBM Plex Mono",monospace','#fff4d8');
}
function r5PostFx(){
  if(!GRADE5){ GRADE5=[0,1,2].map(()=>{ const c=document.createElement('canvas'); c.width=W; c.height=H; const g=c.getContext('2d');
    const v=g.createRadialGradient(W/2,H/2,H*0.34,W/2,H/2,W*0.62); v.addColorStop(0,'rgba(20,14,6,0)'); v.addColorStop(1,'rgba(26,18,8,0.5)'); g.fillStyle=v; g.fillRect(0,0,W,H);
    for(let i=0;i<1200;i++){ g.fillStyle=Math.random()<0.5?`rgba(255,240,210,${Math.random()*0.06})`:`rgba(0,0,0,${Math.random()*0.08})`; g.fillRect(Math.random()*W,Math.random()*H,1,1); }
    if(Math.random()<0.7){ g.fillStyle='rgba(255,250,230,0.06)'; g.fillRect(Math.floor(Math.random()*W),0,1,H); } return c; }); }
  ctx.save(); ctx.globalCompositeOperation='soft-light'; ctx.fillStyle='rgba(220,170,100,0.2)'; ctx.fillRect(0,0,W,H); ctx.restore();
  ctx.drawImage(GRADE5[Math.floor(titleT*12)%3],0,0);
}
function r5EpsExtra(){ centerText('Страници от дневника: '+memCount()+' / '+memTotal(),234,'600 7px "IBM Plex Mono",monospace','#ffcf6a'); }
function r5Logo(){
  const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'rgba(10,14,12,0.6)'); g.addColorStop(1,'rgba(10,14,12,0.94)'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  ctx.save(); ctx.globalCompositeOperation='lighter'; for(let i=0;i<3;i++){ const t=((titleT*0.2+i/3)%1); ctx.strokeStyle=`rgba(63,208,160,${(1-t)*0.32})`; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(W/2,96,20+t*260,0,7); ctx.stroke(); } ctx.restore();
  const j=Math.random()<0.05?rnd(-2,2):0; ctx.textAlign='left'; ctx.font='700 38px '+DFONT(); const tw=ctx.measureText('РЕЗОНАНС').width; ctx.font='700 76px '+DFONT(); const w5=ctx.measureText('5').width; const x0=Math.round(W/2-(tw+12+w5)/2);
  ctx.font='700 38px '+DFONT(); ctx.fillStyle='rgba(63,208,160,0.45)'; ctx.fillText('РЕЗОНАНС',x0+2+j,100); ctx.fillStyle='#fff4d8'; ctx.fillText('РЕЗОНАНС',x0,98);
  ctx.font='700 76px '+DFONT(); const gl=ctx.createLinearGradient(0,40,0,110); gl.addColorStop(0,'#ffcf6a'); gl.addColorStop(1,'#3fd0a0'); ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.fillText('5',x0+tw+14,110); ctx.fillStyle=gl; ctx.fillText('5',x0+tw+12,108); ctx.textAlign='center';
  ctx.font='600 11px "IBM Plex Mono",monospace'; ctx.fillStyle='#ffe6b0'; ctx.fillText('И  З  В  О  Р',W/2,126); ctx.textAlign='left';
}
