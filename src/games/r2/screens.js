/* ================= РЕЗОНАНС 2 · ЕКРАНИ: ЛОГО, ФИНАЛ, ЦВЕТОВЕ ================= */
function r2Logo(){
  const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'rgba(2,10,16,0.55)'); g.addColorStop(1,'rgba(2,10,16,0.92)'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  // sonar rings (echo)
  ctx.save(); ctx.globalCompositeOperation='lighter';
  for(let i=0;i<4;i++){ const t=((titleT*0.35+i/4)%1), r=20+t*220; ctx.strokeStyle=`rgba(79,227,214,${(1-t)*0.35})`; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(W/2,104,r,0,7); ctx.stroke(); }
  ctx.restore();
  const j=Math.random()<0.06?rnd(-2,2):0;
  ctx.textAlign='left'; let fs=34; ctx.font=fs+'px '+DFONT(); let tw=ctx.measureText('РЕЗОНАНС').width; if(tw>300){ fs=Math.floor(fs*300/tw); ctx.font=fs+'px '+DFONT(); tw=ctx.measureText('РЕЗОНАНС').width; }
  ctx.font='64px '+DFONT(); const w2=ctx.measureText('2').width; const x0=Math.round(W/2-(tw+14+w2)/2); ctx.font=fs+'px '+DFONT();
  ctx.fillStyle='rgba(255,80,200,0.45)'; ctx.fillText('РЕЗОНАНС',x0+2+j,98+1); ctx.fillStyle='rgba(80,200,255,0.55)'; ctx.fillText('РЕЗОНАНС',x0-2-j,98); ctx.fillStyle='#e8fbff'; ctx.fillText('РЕЗОНАНС',x0,98);
  ctx.font='64px '+DFONT(); const gl=ctx.createLinearGradient(0,50,0,110); gl.addColorStop(0,'#9ffcf2'); gl.addColorStop(1,'#2bb3c0'); ctx.fillStyle='rgba(255,80,200,0.5)'; ctx.fillText('2',x0+tw+14+2,108); ctx.fillStyle=gl; ctx.fillText('2',x0+tw+14,106); ctx.textAlign='center';
  ctx.font='600 11px "IBM Plex Mono",monospace'; ctx.fillStyle=ACC(); ctx.fillText('О  Т  З  В  У  К',W/2,126);
}
function renderWin2(){
  overlay(0.9); const t=titleT;
  ctx.save(); ctx.globalCompositeOperation='lighter'; for(let i=0;i<5;i++){ const k=((t*0.3+i/5)%1); ctx.strokeStyle=`rgba(79,227,214,${(1-k)*0.3})`; ctx.beginPath(); ctx.arc(W/2,84,20+k*240,0,7); ctx.stroke(); } ctx.restore();
  glitchTitle('ТИШИНА',W/2,84,34);
  centerText('„Резонанс 2: Отзвук“ е преминат на трудност „'+D.name+'“.',110,'600 9px "IBM Plex Mono",monospace','#cfe8e8');
  drawStats(totals,148);
  centerText('Източникът мълчи. Отзвукът най-после заглъхна.',196,'600 9px "IBM Plex Mono",monospace','#ff8ad8');
  if(winT>2&&blink()) centerText('Z — към менюто',238,'600 10px "IBM Plex Mono",monospace','#eaf6f6');
}
let GRADE=null;
function r2Grade(){
  if(!GRADE){ GRADE=document.createElement('canvas'); GRADE.width=W; GRADE.height=H; const g=GRADE.getContext('2d');
    for(let y=0;y<H;y+=2){ g.fillStyle='rgba(0,0,0,0.10)'; g.fillRect(0,y,W,1); }
    const v=g.createRadialGradient(W/2,H/2,H*0.35,W/2,H/2,W*0.62); v.addColorStop(0,'rgba(0,10,20,0)'); v.addColorStop(1,'rgba(0,12,24,0.55)'); g.fillStyle=v; g.fillRect(0,0,W,H); }
  ctx.save(); ctx.globalCompositeOperation='soft-light'; ctx.fillStyle='rgba(40,150,170,0.22)'; ctx.fillRect(0,0,W,H); ctx.restore();
  ctx.drawImage(GRADE,0,0);
}
