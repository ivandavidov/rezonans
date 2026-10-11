/* ================= РЕЗОНАНС 6 · ИСТОРИЯ: ФИНАЛЪТ, ЕКРАНИ, ЦВЕТОВЕ ================= */
let GRADE6=null;
function r6Finale(){ if(MST.fin) return; MST.fin=1; MST.finT=lvT; store.set('rz6.done','1'); flash=1; flashCol='#fff4d8'; shake=6;
  if(AC){ [131,196,262,330].forEach((f,i)=>{ osc({type:'sine',f,t:4.5-i*0.6,v:0.07,when:i*0.6}); osc({type:'triangle',f:f*2,t:3-i*0.4,v:0.02,when:i*0.6+0.1}); }); }
  LVL.end=['Запяваш тона. Марина поема след теб, после Никола, накрая и Александър — най-дълбоко и упорито.','Четири гласа се сливат в чист акорд. Наблюдателите се вслушват в тишината. После светлините им бавно чезнат една по една.','Отговорът е ясен: Слушащият не е сам. И няма да тръгне с тях.'];
  MST.endAt=lvT+5; }
// Марина и децата чакат на платото; след финала светят в един акорд
function r6Person(x,fy,o){ const s=o.s||1, h=Math.round(26*s);
  ctx.fillStyle=o.leg; ctx.fillRect(x-3,fy-Math.round(9*s),2,Math.round(9*s)); ctx.fillRect(x+1,fy-Math.round(9*s),2,Math.round(9*s));
  ctx.fillStyle=o.body; ctx.fillRect(x-4,fy-h+Math.round(7*s),8,Math.round(12*s));
  if(o.dress){ ctx.fillRect(x-5,fy-Math.round(11*s),10,4); }
  ctx.fillStyle='#e8c4a0'; ctx.fillRect(x-3,fy-h,6,Math.round(7*s));
  ctx.fillStyle=o.hair; ctx.fillRect(x-3,fy-h-1,6,2); if(o.long){ ctx.fillRect(x-4,fy-h,2,Math.round(10*s)); ctx.fillRect(x+2,fy-h,2,Math.round(10*s)); }
  ctx.fillStyle='#2a1a1a'; ctx.fillRect(x-2+(o.f>0?1:0),fy-h+3,1,1); ctx.fillRect(x+1+(o.f>0?1:0),fy-h+3,1,1); }
function r6DrawFamily(){ const fy=15*T, x0=Math.round(52*T-cam); if(x0<-80||x0>W+80) return; const fin=MST.fin?lvT-MST.finT:-1;
  if(fin>=0){ for(let i=0;i<4;i++){ const k=Math.max(0,fin-i*0.6); if(k<=0) continue; const r=k*70, a=Math.max(0,0.7-k*0.12); ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.strokeStyle=`rgba(${['232,194,90','255,180,200','138,180,255','180,255,200'][i]},${a})`; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x0+8,fy-16,r,0,7); ctx.stroke(); ctx.restore(); ctx.lineWidth=1; } }
  const fam=[[x0,{body:'#7a3a5a',leg:'#2a2030',hair:'#3a2418',long:1,dress:1,f:-1}],[x0+16,{s:0.72,body:'#3a6aa8',leg:'#2a2a3a',hair:'#5a3a22',f:-1}],[x0+28,{s:0.6,body:'#4a8a4a',leg:'#2a2a3a',hair:'#8a5a2a',f:-1}]];
  for(let i=0;i<fam.length;i++){ const [x,o]=fam[i]; const g=fin>=0?Math.min(1,Math.max(0,fin-(i+1)*0.6)):0.15+0.08*Math.sin(titleT*2+i);
    ctx.save(); ctx.globalCompositeOperation='lighter'; const gr=ctx.createRadialGradient(x,fy-12,1,x,fy-12,26); gr.addColorStop(0,`rgba(255,240,200,${0.5*g})`); gr.addColorStop(1,'rgba(232,194,90,0)'); ctx.fillStyle=gr; ctx.fillRect(x-26,fy-38,52,52); ctx.restore();
    r6Person(x,fy,o); }
  // Наблюдателите над платото
  for(let i=0;i<5;i++){ const wx=x0-120+i*60, wy=34+Math.sin(titleT*0.7+i)*6, a=fin<0?0.7:Math.max(0,0.7-(fin-1.5-i*0.4)*0.5); if(a<=0) continue;
    ctx.save(); ctx.globalAlpha=a; ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(wx,wy,1,wx,wy,18); g.addColorStop(0,'rgba(200,220,255,0.9)'); g.addColorStop(1,'rgba(120,150,255,0)'); ctx.fillStyle=g; ctx.fillRect(wx-18,wy-18,36,36); ctx.restore(); } }
function renderWin6(){
  overlay(0.9); const t=titleT, all=memCount()>=memTotal();
  ctx.save(); ctx.globalCompositeOperation='lighter'; for(let i=0;i<4;i++){ const k=((t*0.18+i/4)%1); ctx.strokeStyle=`rgba(${['232,194,90','255,180,200','138,180,255','180,255,200'][i]},${(1-k)*0.3})`; ctx.beginPath(); ctx.arc(W/2,90,20+k*240,0,7); ctx.stroke(); } ctx.restore();
  centerText('АКОРД',70,'700 30px '+DFONT(),'#fff4d8');
  centerText('КРАЙ НА ШЕСТАТА ЧАСТ',96,'600 10px "IBM Plex Mono",monospace',ACC());
  ['Наблюдателите се оттеглиха. Корабът под Белинташ отново притихна като обикновена скала.','Румяна и Деян чакат в колата в подножието. За първи път от четирийсет години насам не крият нищо.','Тази нощ спиш дълбоко, без кошмари. Само на сутринта Александър си тананика — тихо, чисто и в тон.']
    .forEach((l,i)=>centerText(l,128+i*14,'600 8px "IBM Plex Mono",monospace','#efe6d0'));
  centerText('„Резонанс 6: Акорд“ е преминат на трудност „'+D.name+'“ · ноти: '+memCount()+' / '+memTotal(),184,'600 8px "IBM Plex Mono",monospace','#cfd8dc');
  centerText(all?'Последната нота от Марина: „Бях изпратена да те пазя. Останах, защото те обикнах.“':'Събери всички ноти — последната крие още една тайна.',204,'600 7px "IBM Plex Mono",monospace','#e8c25a');
  if(winT>2&&blink()) centerText('Z — към менюто',236,'600 10px "IBM Plex Mono",monospace','#fff4d8');
}
function r6PostFx(){
  if(!GRADE6){ GRADE6=[0,1,2].map(()=>{ const c=document.createElement('canvas'); c.width=W; c.height=H; const g=c.getContext('2d');
    const v=g.createRadialGradient(W/2,H/2,H*0.36,W/2,H/2,W*0.62); v.addColorStop(0,'rgba(14,8,24,0)'); v.addColorStop(1,'rgba(14,8,24,0.5)'); g.fillStyle=v; g.fillRect(0,0,W,H);
    for(let i=0;i<900;i++){ g.fillStyle=Math.random()<0.5?`rgba(255,240,210,${Math.random()*0.05})`:`rgba(0,0,0,${Math.random()*0.07})`; g.fillRect(Math.random()*W,Math.random()*H,1,1); } return c; }); }
  ctx.save(); ctx.globalCompositeOperation='soft-light'; ctx.fillStyle='rgba(200,170,255,0.16)'; ctx.fillRect(0,0,W,H); ctx.restore();
  ctx.drawImage(GRADE6[Math.floor(titleT*12)%3],0,0);
}
function r6EpsExtra(){ centerText('Ноти: '+memCount()+' / '+memTotal(),234,'600 7px "IBM Plex Mono",monospace','#e8c25a'); }
function r6Logo(){
  const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'rgba(12,8,22,0.6)'); g.addColorStop(1,'rgba(12,8,22,0.94)'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  ctx.save(); ctx.globalCompositeOperation='lighter'; for(let i=0;i<4;i++){ const t=((titleT*0.18+i/4)%1); ctx.strokeStyle=`rgba(${['232,194,90','255,180,200','138,180,255','180,255,200'][i]},${(1-t)*0.3})`; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(W/2,96,20+t*260,0,7); ctx.stroke(); } ctx.restore();
  const j=Math.random()<0.05?rnd(-2,2):0; ctx.textAlign='left'; ctx.font='700 38px '+DFONT(); const tw=ctx.measureText('РЕЗОНАНС').width; ctx.font='700 76px '+DFONT(); const w6=ctx.measureText('6').width; const x0=Math.round(W/2-(tw+12+w6)/2);
  ctx.font='700 38px '+DFONT(); ctx.fillStyle='rgba(184,160,255,0.45)'; ctx.fillText('РЕЗОНАНС',x0+2+j,100); ctx.fillStyle='#fff4d8'; ctx.fillText('РЕЗОНАНС',x0,98);
  ctx.font='700 76px '+DFONT(); const gl=ctx.createLinearGradient(0,40,0,110); gl.addColorStop(0,'#fff0b8'); gl.addColorStop(1,'#e8c25a'); ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.fillText('6',x0+tw+14,110); ctx.fillStyle=gl; ctx.fillText('6',x0+tw+12,108); ctx.textAlign='center';
  ctx.font='600 11px "IBM Plex Mono",monospace'; ctx.fillStyle='#f0e0b0'; ctx.fillText('А  К  О  Р  Д',W/2,126); ctx.textAlign='left';
}
