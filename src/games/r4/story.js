/* ================= РЕЗОНАНС 4 · ИСТОРИЯ: ВРАТАТА, КРАИЩАТА, ЕКРАНИ ================= */
let ENDING4=parseInt(store.get('rz4.ending','0'),10)||0, GRADE4=null;
const END4={
 1:{t:'КРАЙ · ЗАТВОРЕНАТА ВРАТА',
    end:['Дърпаш лоста. Вратата се затваря бавно, като клепач.','Гласът на баща ти заглъхва: „Добре… Може би така е по-добре.“','В Плевен часовниците тръгват отново. Ганчева те чака пред Панорамата с два чая.'],
    win:['Вратата е затворена завинаги. Ехото изчезва от света.','Ганчева пише книга за 1877 и 1977 година. Твоето име не се споменава в нея.','Понякога, когато минаваш покрай Панорамата, чуваш тих валс.']},
 2:{t:'КРАЙ · ОТВОРЕНАТА ВРАТА',
    end:['Отваряш вратата. Баща ти излиза — и заедно с него излиза тонът.','По целия свят камбаните забиват сами. Той се усмихва: „Благодаря ти. Сега всички ще чуват.“','Ганчева заключва Панорамата и не я отваря повече.'],
    win:['Баща ти се върна. Светът никога вече няма да е тих.','Всяка нощ в 3:47 часовниците спират за една секунда.','Някои казват, че това е краят. Ти знаеш, че е само началото.']},
 3:{t:'КРАЙ · ОСВОБОДЕНИЯТ',
    end:['Спомените му светят в ръцете ти. Подаваш му ги един по един.','Машината се разпада. Остава само човекът — уморен, побелял, с куфар чертежи.','„Сине“, казва той. И този път гласът е само неговият.'],
    win:['Баща ти се прибра у дома — без машината и без тона.','Ганчева го води в Панорамата. Той стои дълго пред платното и мълчи.','Резонансът свърши. Или поне така изглежда.']}};
function r4Choose(n){ if(MST.chose) return; MST.chose=1; ENDING4=n; store.set('rz4.ending',n); flash=1; flashCol='#ffffff'; shake=10;
  if(AC){ for(let i=0;i<3;i++) osc({type:'sine',f:FQ_HZ[i],t:2.2,v:0.07,when:i*0.25}); }
  LVL.end=END4[n].end; MST.endAt=lvT+1.2; }
function r4DrawDoor(){ const x=Math.round(58*T-cam), y=4*T, h=11*T, op=MST.chose?(ENDING4===1?0:1):0.15+0.05*Math.sin(titleT*2);
  ctx.save(); ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(x,y+h/2,4,x,y+h/2,110); g.addColorStop(0,`rgba(255,255,255,${0.25+op*0.5})`); g.addColorStop(1,'rgba(180,140,255,0)'); ctx.fillStyle=g; ctx.fillRect(x-110,y+h/2-110,220,220); ctx.restore();
  ctx.fillStyle='#8a7aac'; ctx.fillRect(x-22,y-4,44,4); ctx.fillRect(x-22,y,4,h); ctx.fillRect(x+18,y,4,h);
  ctx.fillStyle=`rgba(255,250,240,${0.5+op*0.5})`; ctx.fillRect(x-18,y,36*Math.max(op,0.08),h);
  if(!(MST.chose&&ENDING4===3)){ const bx=x+(MST.chose?30:24), fy=15*T; ctx.fillStyle='#f4f0fa'; ctx.globalAlpha=MST.chose&&ENDING4===1?Math.max(0,1-(lvT-MST.endAt+1.2)):0.85; ctx.fillRect(bx-3,fy-24,7,16); ctx.fillRect(bx-2,fy-30,5,6); ctx.fillRect(bx-3,fy-8,3,8); ctx.fillRect(bx+1,fy-8,3,8); ctx.globalAlpha=1; } }
function renderWin4(){
  overlay(0.9); const t=titleT, e=END4[ENDING4]||END4[1];
  ctx.save(); ctx.globalCompositeOperation='lighter'; for(let i=0;i<3;i++){ const k=((t*0.2+i/3)%1); ctx.strokeStyle=`rgba(${FQ_RGB[i]},${(1-k)*0.3})`; ctx.beginPath(); ctx.arc(W/2,90,20+k*240,0,7); ctx.stroke(); } ctx.restore();
  centerText('ОТВЪД',70,'700 30px '+DFONT(),'#f4f0fa');
  centerText(e.t,96,'600 10px "IBM Plex Mono",monospace',ACC());
  e.win.forEach((l,i)=>centerText(l,132+i*14,'600 8px "IBM Plex Mono",monospace','#e4dcf0'));
  centerText('„Резонанс 4: Отвъд“ е преминат на трудност „'+D.name+'“ · спомени: '+memCount()+' / '+memTotal(),196,'600 8px "IBM Plex Mono",monospace','#cfd8dc');
  if(ENDING4!==3&&memCount()<memTotal()) centerText('Има и трети край. Събери всички спомени на баща си.',210,'600 7px "IBM Plex Mono",monospace','#ffe6a0');
  if(winT>2&&blink()) centerText('Z — към менюто',236,'600 10px "IBM Plex Mono",monospace','#f4f0fa');
}
function r4PostFx(){
  if(!GRADE4){ GRADE4=document.createElement('canvas'); GRADE4.width=W; GRADE4.height=H; const g=GRADE4.getContext('2d');
    const v=g.createRadialGradient(W/2,H/2,H*0.32,W/2,H/2,W*0.62); v.addColorStop(0,'rgba(20,10,30,0)'); v.addColorStop(1,'rgba(24,12,36,0.5)'); g.fillStyle=v; g.fillRect(0,0,W,H);
    for(let i=0;i<900;i++){ g.fillStyle=`rgba(255,240,210,${Math.random()*0.05})`; g.fillRect(Math.random()*W,Math.random()*H,1,1); } }
  ctx.save(); ctx.globalCompositeOperation='soft-light'; ctx.fillStyle='rgba(200,160,110,0.18)'; ctx.fillRect(0,0,W,H); ctx.restore();
  ctx.drawImage(GRADE4,0,0);
}
function r4EpsExtra(){ centerText('Спомени на баща ти: '+memCount()+' / '+memTotal(),234,'600 7px "IBM Plex Mono",monospace','#ffe6a0'); }
function r4Logo(){
  const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'rgba(14,8,22,0.6)'); g.addColorStop(1,'rgba(14,8,22,0.94)'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  ctx.save(); ctx.globalCompositeOperation='lighter'; for(let i=0;i<3;i++){ const t=((titleT*0.22+i/3)%1); ctx.strokeStyle=`rgba(${FQ_RGB[i]},${(1-t)*0.35})`; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(W/2,96,20+t*260,0,7); ctx.stroke(); } ctx.restore();
  const j=Math.random()<0.05?rnd(-2,2):0; ctx.textAlign='left'; ctx.font='700 38px '+DFONT(); const tw=ctx.measureText('РЕЗОНАНС').width; ctx.font='700 76px '+DFONT(); const w4=ctx.measureText('4').width; const x0=Math.round(W/2-(tw+12+w4)/2);
  ctx.font='700 38px '+DFONT(); ctx.fillStyle='rgba(180,140,255,0.5)'; ctx.fillText('РЕЗОНАНС',x0+2+j,100); ctx.fillStyle='#f4f0fa'; ctx.fillText('РЕЗОНАНС',x0,98);
  ctx.font='700 76px '+DFONT(); const gl=ctx.createLinearGradient(0,40,0,110); gl.addColorStop(0,'#ffe6a0'); gl.addColorStop(1,'#b48cff'); ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.fillText('4',x0+tw+14,110); ctx.fillStyle=gl; ctx.fillText('4',x0+tw+12,108); ctx.textAlign='center';
  ctx.font='600 11px "IBM Plex Mono",monospace'; ctx.fillStyle='#e4d4ff'; ctx.fillText('О  Т  В  Ъ  Д',W/2,126); ctx.textAlign='left';
}
