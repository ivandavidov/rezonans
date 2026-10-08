/* ================= РЕЗОНАНС 7 · ИСТОРИЯ: ФИНАЛЪТ, ЕКРАНИ, ЕКРАННИЯТ ФИЛТЪР ================= */
let CRT7=null;
function r7Finale(){ if(MST.fin) return; MST.fin=1; MST.finT=lvT; store.set('rz7.done','1'); flash=1; flashCol='#8aff9a'; shake=4;
  if(AC){ [523,659,784,1046].forEach((f,i)=>osc({type:'square',f,t:0.18,v:0.05,when:i*0.16})); osc({type:'square',f:1046,f2:2093,t:0.6,v:0.04,when:0.8}); }
  LVL.end=['RUN. Програмата на Мира тръгва ред по ред — всеки ред, който си намерил, светва.','Екранът става цветен. На него пише: „ЖИВА СЪМ. БЛАГОДАРЯ ТИ, ТЕХНИКО.“','Пешо се събужда на пода на клуба с отвертка в ръка. Компютърът е включен и мига. Отдавна не е бил толкова доволен от ремонт.'];
  MST.endAt=lvT+4.5; }
// Мира: мигащ екран-лице, което след RUN става цветно
function r7DrawMira(){ const x=Math.round(57*T-cam), y=10*T; if(x<-60||x>W+60) return; const fin=MST.fin?lvT-MST.finT:-1, bob=Math.round(Math.sin(titleT*2)*2);
  ctx.save(); ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(x,y+bob,2,x,y+bob,40); g.addColorStop(0,fin>=0?'rgba(255,240,180,0.5)':'rgba(120,255,140,0.35)'); g.addColorStop(1,'rgba(120,255,140,0)'); ctx.fillStyle=g; ctx.fillRect(x-40,y-40+bob,80,80); ctx.restore();
  ctx.fillStyle='#c8c0a8'; ctx.fillRect(x-16,y-13+bob,32,26); ctx.fillStyle=fin>=0?'#101830':'#031003'; ctx.fillRect(x-13,y-10+bob,26,18);
  const cols=fin>=0?['#ff5a5a','#ffd84a','#5aff7a','#5ab4ff','#d85aff']:['#8aff9a'];
  ctx.fillStyle=cols[Math.floor(titleT*4)%cols.length]; ctx.fillRect(x-7,y-6+bob,3,3); ctx.fillRect(x+4,y-6+bob,3,3);
  ctx.fillStyle=cols[(Math.floor(titleT*4)+2)%cols.length]; ctx.fillRect(x-7,y+2+bob,14,2); ctx.fillRect(x-9,y+bob,2,2); ctx.fillRect(x+7,y+bob,2,2);
  if(Math.floor(titleT*2)%2) { ctx.fillStyle='#8aff9a'; ctx.fillRect(x+9,y+4+bob,2,3); }
  if(fin>=0) for(let i=0;i<Math.min(19,Math.floor(fin*5));i++){ const a=i/19*6.283+titleT*0.6, r=30+fin*12; ctx.fillStyle=cols[i%cols.length]; ctx.fillRect(Math.round(x+Math.cos(a)*r),Math.round(y+Math.sin(a)*r*0.6+bob),2,2); } }
// събирачът на боклук — бяла, „изтрита“ стена
function r7DrawGC(fx){ if(fx<-40) return; ctx.fillStyle='#f4f4f4'; ctx.fillRect(fx-600,0,600,H);
  for(let y=0;y<H;y+=8){ const w=Math.floor(hash(y,Math.floor(titleT*12))*4)*8; ctx.fillRect(fx,y,w,8); }
  ctx.fillStyle='#c8c8c8'; for(let i=0;i<8;i++){ const y=(i*41+titleT*60)%H; ctx.fillRect(fx-40-((i*29)%60),y,8,8); }
  ctx.font='700 12px "IBM Plex Mono",monospace'; ctx.fillStyle='#5a5a5a'; ctx.fillText('GC ▶',fx-46,H/2); ctx.fillText('FREE',fx-52,H/2+16);
  if(Math.random()<0.7) part(CHASE.x+rnd(-4,8),rnd(H),rnd(40,140),rnd(-40,40),rnd(0.3,0.7),Math.random()<0.6?'#ffffff':'#c8c8c8',rnd(2,4),0); }
function renderWin7(){
  overlay(0.92); const t=titleT, all=memCount()>=memTotal();
  ctx.fillStyle='rgba(138,255,154,0.05)'; for(let y=0;y<H;y+=3) ctx.fillRect(0,y,W,1);
  centerText('ПРАВЕЦ',70,'700 30px '+DFONT(),'#8aff9a');
  centerText('КРАЙ НА СЕДМАТА ЧАСТ',96,'600 10px "IBM Plex Mono",monospace','#ffd84a');
  ['В сервизния дневник Пешо пише: „Неизправност: вирус. Отстранена. Причина: неизвестна.“','В клуба децата се чудят защо един от компютрите им казва „добро утро“.','А на дискетата „НЕ ПУСКАЙ“ някой е дописал: „ПУСКАЙ СМЕЛО — М.“']
    .forEach((l,i)=>centerText(l,128+i*14,'600 8px "IBM Plex Mono",monospace','#d8f0d8'));
  centerText('„Резонанс 7: Правец“ е преминат на трудност „'+D.name+'“ · редове: '+memCount()+' / '+memTotal(),184,'600 8px "IBM Plex Mono",monospace','#cfd8dc');
  centerText(all?'Програмата е пълна. Последният ред: 200 END : REM КРАЙ? НЕ. САМО НАЧАЛО.':'Събери всички редове — програмата на Мира още не е пълна.',204,'600 7px "IBM Plex Mono",monospace','#8aff9a');
  if(winT>2&&blink()) centerText('Z — към менюто',236,'600 10px "IBM Plex Mono",monospace','#ffffff');
}
function r7PostFx(fxo){
  if(!CRT7){ CRT7=[0,1].map(k=>{ const c=document.createElement('canvas'); c.width=W; c.height=H; const g=c.getContext('2d');
    g.fillStyle=`rgba(0,0,0,${k?0.08:0.2})`; for(let y=0;y<H;y+=2) g.fillRect(0,y,W,1);
    const v=g.createRadialGradient(W/2,H/2,H*0.4,W/2,H/2,W*0.64); v.addColorStop(0,'rgba(0,0,0,0)'); v.addColorStop(1,`rgba(0,0,0,${k?0.25:0.55})`); g.fillStyle=v; g.fillRect(0,0,W,H); return c; }); }
  const P=(LVL&&LVL.theme&&TH[LVL.theme()])||{}, fx=fxo||P.fx||'green';
  if(fx==='green'&&state!=='gmenu'&&state!=='title'&&!(MST&&MST.fin)){ ctx.save(); ctx.globalCompositeOperation='saturation'; ctx.fillStyle='#808080'; ctx.fillRect(0,0,W,H); ctx.globalCompositeOperation='multiply'; ctx.fillStyle='#6aff82'; ctx.fillRect(0,0,W,H); ctx.globalCompositeOperation='screen'; ctx.fillStyle='rgba(10,40,12,0.5)'; ctx.fillRect(0,0,W,H); ctx.restore(); }
  ctx.drawImage(CRT7[fx==='web'?1:0],0,0);
  if(Math.random()<0.03){ ctx.fillStyle='rgba(255,255,255,0.05)'; ctx.fillRect(0,Math.floor(Math.random()*H),W,2); }
}
function r7EpsExtra(){ centerText('Редове от програмата на Мира: '+memCount()+' / '+memTotal(),234,'600 7px "IBM Plex Mono",monospace','#8aff9a'); }
function r7Logo(){
  ctx.fillStyle='rgba(2,8,3,0.82)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='rgba(138,255,154,0.04)'; for(let y=0;y<H;y+=3) ctx.fillRect(0,y,W,1);
  const j=Math.random()<0.05?rnd(-2,2):0; ctx.textAlign='left'; ctx.font='700 38px '+DFONT(); const tw=ctx.measureText('РЕЗОНАНС').width; ctx.font='700 76px '+DFONT(); const w7=ctx.measureText('7').width; const x0=Math.round(W/2-(tw+12+w7)/2);
  ctx.font='700 38px '+DFONT(); ctx.fillStyle='rgba(58,255,90,0.35)'; ctx.fillText('РЕЗОНАНС',x0+2+j,100); ctx.fillStyle='#d8ffd8'; ctx.fillText('РЕЗОНАНС',x0,98);
  ctx.font='700 76px '+DFONT(); ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.fillText('7',x0+tw+14,110); ctx.fillStyle='#3aff5a'; ctx.fillText('7',x0+tw+12,108);
  ctx.font='600 11px "IBM Plex Mono",monospace'; ctx.textAlign='center'; ctx.fillStyle='#8aff9a'; const s='П  Р  А  В  Е  Ц'; ctx.fillText(s,W/2,126);
  if(Math.floor(titleT*2)%2){ const sw=ctx.measureText(s).width; ctx.fillRect(Math.round(W/2+sw/2+6),117,7,11); } ctx.textAlign='left';
}
