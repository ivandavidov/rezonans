/* ================= РЕЗОНАНС 3 · ИСТОРИЯ: ИЗБОРЪТ, КРАИЩАТА, ЦВЕТОВЕ ================= */
let ENDING=parseInt(store.get('rz3.ending','0'),10)||0, GRADE3=null, GRAIN=null;
function r3Choose(n){ if(MST.chose) return; MST.chose=1; ENDING=n; store.set('rz3.ending',n); flash=1; flashCol='#ffffff'; shake=10;
  LVL.end=n===1?['Пристъпваш в светлината. Гласът на баща ти е съвсем близо: „Знаех, че ще дойдеш.“','Разломът се затваря зад теб като врата. Над София една по една светват лампите.','Илиева стои сама в празната зала. По-късно ще каже на всички, че си загинал. Няма да е съвсем истина.']
   :['Илиева те избутва назад и влиза в светлината, преди да успееш да я спреш.','„Петдесет години пазих тази тайна. Нека поне веднъж платя аз.“','Разломът се затваря. Над София светват лампите — и някъде дълбоко под Витоша за последен път отеква познат глас: „Благодаря.“'];
  MST.endAt=lvT+0.9; }
function drawIlieva(tx){ const x=Math.round(tx*T-cam), fy=groundY(tx); if(x<-20||x>W+20) return; const b=Math.round(Math.sin(titleT*2)*0.5);
  ctx.fillStyle='#2a2a30'; ctx.fillRect(x-3,fy-10,3,10); ctx.fillRect(x+1,fy-10,3,10); ctx.fillStyle='#e8e8e8'; ctx.fillRect(x-5,fy-22+b,11,13); ctx.fillStyle='#cfcfcf'; ctx.fillRect(x-5,fy-12+b,11,2);
  ctx.fillStyle='#e2b48f'; ctx.fillRect(x-3,fy-28+b,7,6); ctx.fillStyle='#a8a8b0'; ctx.fillRect(x-4,fy-30+b,9,3); ctx.fillRect(x+3,fy-29+b,3,3); ctx.fillStyle='#2a2a2a'; ctx.fillRect(x-1,fy-26+b,1,1); }
function r3DrawStory(){
  if(LVL.ilieva&&!(MST.chose===1&&ENDING===2)) drawIlieva(LVL.ilieva);
  if(LVL.final){ const x=58*T-cam, g=ctx.createRadialGradient(x,9*T,4,x,9*T,90); ctx.save(); ctx.globalCompositeOperation='lighter'; g.addColorStop(0,'rgba(255,255,255,0.55)'); g.addColorStop(0.4,'rgba(255,80,100,0.25)'); g.addColorStop(1,'rgba(255,40,60,0)'); ctx.fillStyle=g; ctx.fillRect(x-90,9*T-90,180,180); ctx.restore(); }
}
function r3StoryLights(L){ if(LVL.final) L.push([58*T,9*T,120,1]); }
for(const l of LEVELS3) if(l.ilieva||l.final){ l.drawExtra=r3DrawStory; l.lightsExtra=r3StoryLights; }
function r3PostFx(){
  if(!GRADE3){ GRADE3=document.createElement('canvas'); GRADE3.width=W; GRADE3.height=H; const g=GRADE3.getContext('2d');
    const v=g.createRadialGradient(W/2,H/2,H*0.3,W/2,H/2,W*0.62); v.addColorStop(0,'rgba(10,0,2,0)'); v.addColorStop(1,'rgba(14,0,4,0.62)'); g.fillStyle=v; g.fillRect(0,0,W,H);
    GRAIN=[0,1,2].map(()=>{ const c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d'); for(let i=0;i<1600;i++){ const a=Math.random()*0.10; x.fillStyle=Math.random()<0.5?`rgba(255,255,255,${a})`:`rgba(0,0,0,${a*1.5})`; x.fillRect(Math.random()*W,Math.random()*H,1,1); } return c; }); }
  const p=player;
  if(p&&p.headWet){ ctx.fillStyle='rgba(60,10,20,0.3)'; ctx.fillRect(0,0,W,H); }
  ctx.save(); ctx.globalCompositeOperation='soft-light'; ctx.fillStyle='rgba(150,30,45,0.2)'; ctx.fillRect(0,0,W,H); ctx.restore();
  if(ALARM>0&&state==='play'){ const a=(Math.sin(titleT*10)+1)/2; ctx.fillStyle=`rgba(255,0,20,${0.06+a*0.08})`; ctx.fillRect(0,0,W,H); }
  ctx.drawImage(GRADE3,0,0); ctx.drawImage(GRAIN[Math.floor(titleT*24)%3],0,0);
}
function renderWin3(){
  overlay(0.92); const t=titleT;
  ctx.save(); ctx.globalCompositeOperation='lighter'; for(let i=0;i<4;i++){ const k=((t*0.2+i/4)%1); ctx.strokeStyle=`rgba(255,59,79,${(1-k)*0.25})`; ctx.beginPath(); ctx.arc(W/2,90,20+k*240,0,7); ctx.stroke(); } ctx.restore();
  centerText('ЕПИЦЕНТЪР',70,'700 30px '+DFONT(),'#f4f4f6');
  centerText(ENDING===2?'КРАЙ · ИЗКУПЛЕНИЕ':'КРАЙ · ТИШИНАТА НА БАЩАТА',96,'600 10px "IBM Plex Mono",monospace',ACC());
  const lines=ENDING===2?['Илиева остана в разлома. София отново свети.','Понякога, когато градът заспи, по телефона ти звъни непознат номер.','Отсреща е само тишина. И нещо, което прилича на ехо.']:['Остана при баща си, от другата страна на тишината.','Илиева пази тайната ти и всяка година на 14 юни слиза в метрото на „Сердика“.','Казва, че ако се заслушаш, още можеш да чуеш как някой подсвирква.'];
  lines.forEach((l,i)=>centerText(l,132+i*14,'600 8px "IBM Plex Mono",monospace','#e8d0d4'));
  centerText('„Резонанс 3: Епицентър“ е преминат на трудност „'+D.name+'“.',196,'600 8px "IBM Plex Mono",monospace','#cfd8dc');
  if(winT>2&&blink()) centerText('Z — към менюто',236,'600 10px "IBM Plex Mono",monospace','#f4f4f6');
}
function r3Logo(){
  const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'rgba(8,0,3,0.6)'); g.addColorStop(1,'rgba(8,0,3,0.94)'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  ctx.save(); ctx.globalCompositeOperation='lighter'; for(let i=0;i<3;i++){ const t=((titleT*0.25+i/3)%1); ctx.strokeStyle=`rgba(255,59,79,${(1-t)*0.3})`; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(W/2,96,20+t*260,0,7); ctx.stroke(); } ctx.restore();
  if(!MST.tsnow){ MST.tsnow=[]; for(let i=0;i<90;i++) MST.tsnow.push([Math.random()*W,Math.random()*H,Math.random()]); } ctx.fillStyle='rgba(240,246,255,0.6)'; for(const s of MST.tsnow){ s[1]=(s[1]+0.4+s[2]*0.6)%H; ctx.fillRect(Math.round((s[0]+Math.sin(titleT+s[2]*9)*6+W)%W),Math.round(s[1]),1,1); }
  const j=Math.random()<0.05?rnd(-2,2):0; ctx.textAlign='left'; ctx.font='700 40px '+DFONT(); const tw=ctx.measureText('РЕЗОНАНС').width; ctx.font='700 78px '+DFONT(); const w3=ctx.measureText('3').width; const x0=Math.round(W/2-(tw+12+w3)/2);
  ctx.font='700 40px '+DFONT(); ctx.fillStyle='rgba(255,40,60,0.5)'; ctx.fillText('РЕЗОНАНС',x0+2+j,100); ctx.fillStyle='#f4f4f6'; ctx.fillText('РЕЗОНАНС',x0,98);
  ctx.font='700 78px '+DFONT(); ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.fillText('3',x0+tw+14,110); ctx.fillStyle='#ff3b4f'; ctx.fillText('3',x0+tw+12,108); ctx.textAlign='center';
  ctx.font='600 11px "IBM Plex Mono",monospace'; ctx.fillStyle='#ffd0d6'; ctx.fillText('Е  П  И  Ц  Е  Н  Т  Ъ  Р',W/2,126);
}
