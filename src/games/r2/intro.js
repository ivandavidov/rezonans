/* ================= РЕЗОНАНС 2 · ИНТРО: СПУСКАНЕТО ================= */
let RI=null;
const RI_END=86;
const auto=t=>{ showMsg(t,0,'АВТОПИЛОТ'); if(AC){ osc({type:'sine',f:988,t:0.12,v:0.08}); osc({type:'sine',f:1318,t:0.14,v:0.08,when:0.13}); } };
const RI_EV=[
 [6,()=>radio('Чуваш ли ме? Тук е Илиева. Кранът ще те спусне всеки момент. Оттам нататък батискафът се управлява сам.')],
 [14,()=>radio('Станцията мълчи от три дни. Последното ѝ съобщение е само шум… и нещо, което прилича на ехо.')],
 [24.5,()=>radio('Помниш ли резонатора във „Вихрен“? Оказа се, че е имал двойник. Някой го е построил тук, на дъното.')],
 [31,()=>auto('Дълбочина 40 метра. Външна температура 9 градуса.')],
 [36,()=>radio('Виждаш ли медузите? В Черно море обикновено не стават толкова големи…')],
 [43,()=>auto('Внимание: обект вляво. Потънал съд, дължина около 60 метра.')],
 [48,()=>radio('Стар товарен кораб. Не е на картите. Продължавай надолу.')],
 [54,()=>{ auto('Сонарът засича голям подвижен обект. Дълбочина 90 метра.'); RI.ping=0; }],
 [60,()=>radio('Сигурно е делфин. Голям делфин. Не спирай.')],
 [66,()=>auto('Станция „Калиакра“ в обхват. Започва скачване.')],
 [74.5,()=>{ SFX.door(); shake=5; RI.clamp=1; }],
 [76.5,()=>radio('Скачен си. Шлюзът се отваря. Внимавай — и не изключвай радиото.')],
];
function startR2Intro(fromMenu){
  const snow=[]; for(let i=0;i<80;i++) snow.push([Math.random()*W,Math.random()*H,Math.random()<0.2?2:1,Math.random()]);
  const fish=[]; for(let i=0;i<22;i++) fish.push([Math.random()*90,Math.random()*46-23,Math.random()*6]);
  const jel=[]; for(let i=0;i<7;i++) jel.push([40+Math.random()*420,Math.random()*120,Math.random()*6,0.7+Math.random()*0.6]);
  RI={t:0,ev:0,fromMenu,snow,fish,jel,ping:-1,clamp:0,splash:false,lastPing:-9};
  msg=null; particles=[]; shake=0; state='gintro'; mInt=0; bossMusic=false; setMusic({tr:-5,bpm:72,alien:true});
}
function finishR2Intro(){ const fm=RI&&RI.fromMenu; RI=null; msg=null; if(fm) toMenu(0); else startR2Training(false); }
function updR2Intro(dt){
  const r=RI; if(!r) return;
  if(pressed.esc){ const fm=r.fromMenu; RI=null; msg=null; toMenu(fm?0:2); return; }
  if(pressed.enter||pressed.pause||pressed.swap){ finishR2Intro(); return; }
  r.t+=dt; const t=r.t; shake=Math.max(0,shake-dt*20);
  while(r.ev<RI_EV.length&&RI_EV[r.ev][0]<=t){ RI_EV[r.ev][1](); r.ev++; }
  if(msg){ msg.age+=dt; if(msg.age>msg.d) msg=null; }
  if(!r.splash&&t>7.6){ r.splash=true; if(AC){ nz({t:0.9,v:0.3,type:'lowpass',f:1400,f2:200}); } }
  const v=t<9?0:t<70?42:Math.max(0,42*(1-(t-70)/4));
  for(const s of r.snow){ s[1]-=v*dt*(0.6+s[3]*0.8); s[0]+=Math.sin(t*0.7+s[3]*9)*dt*4; if(s[1]<-2){ s[1]=H+2; s[0]=Math.random()*W; } }
  if(r.ping>=0){ r.ping+=dt; if(t-r.lastPing>1.6&&t<62){ r.lastPing=t; if(AC){ osc({type:'sine',f:1480,f2:1400,t:0.5,v:0.09}); osc({type:'sine',f:1480,t:0.3,v:0.03,when:0.45}); } } }
  if(t>=RI_END) finishR2Intro();
}
function riSub(x,y,t,lamp){
  x=Math.round(x); y=Math.round(y);
  if(lamp>0){ ctx.save(); ctx.globalCompositeOperation='lighter'; const g=ctx.createLinearGradient(x+26,y,x+190,y+80); g.addColorStop(0,`rgba(255,240,190,${0.32*lamp})`); g.addColorStop(1,'rgba(255,240,190,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.moveTo(x+28,y+2); ctx.lineTo(x+210,y+40); ctx.lineTo(x+170,y+120); ctx.closePath(); ctx.fill(); ctx.restore(); }
  ctx.fillStyle='#8a6a1a'; ctx.beginPath(); ctx.ellipse(x,y+2,31,13,0,0,7); ctx.fill();
  ctx.fillStyle='#d9a92c'; ctx.beginPath(); ctx.ellipse(x,y,30,12,0,0,7); ctx.fill();
  ctx.fillStyle='#f2c84a'; ctx.fillRect(x-22,y-9,40,2);
  ctx.fillStyle='#b8901f'; ctx.fillRect(x-8,y-19,18,9); ctx.fillStyle='#d9a92c'; ctx.fillRect(x-7,y-20,16,3);
  ctx.fillStyle='#2a3a40'; ctx.fillRect(x+1,y-24,2,5); ctx.fillStyle='#ff4a3a'; if(Math.floor(t*2)%2) ctx.fillRect(x+1,y-25,2,1);
  for(const [dx,big] of [[12,1],[-2,0],[-14,0]]){ ctx.fillStyle='#14202a'; ctx.beginPath(); ctx.arc(x+dx,y,big?6:4,0,7); ctx.fill(); ctx.fillStyle=big?'rgba(255,220,140,0.85)':'rgba(120,200,230,0.5)'; ctx.beginPath(); ctx.arc(x+dx,y,big?4.5:2.8,0,7); ctx.fill(); }
  ctx.fillStyle='#4a4030'; ctx.fillRect(x+24,y+5,10,2); ctx.fillRect(x+33,y+5,2,6);
  ctx.fillStyle='#fff6d0'; ctx.fillRect(x+27,y-2,3,3);
  const pr=Math.sin(t*30)*4; ctx.fillStyle='#5a5040'; ctx.fillRect(x-34,y-1,4,3); ctx.fillStyle='#8a8070'; ctx.fillRect(x-37,y-2-pr*0.5,2,4+pr);
  ctx.fillStyle='#3a3020'; ctx.fillRect(x-18,y+11,36,3);
}
function renderR2Intro(){
  const r=RI; if(!r){ ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H); return; }
  const t=r.t, pan=ss(8,11.5,t), u=ss(8.5,11.5,t), depth=Math.round(Math.pow(clamp((t-9.5)/62,0,1),0.9)*100);
  ctx.save(); if(shake>0) ctx.translate(Math.round(rnd(-shake,shake)*0.5),Math.round(rnd(-shake,shake)*0.5));
  // ---- underwater base
  const dk=depth/100, top=`rgb(${Math.round(lerp(26,2,dk))},${Math.round(lerp(96,14,dk))},${Math.round(lerp(110,22,dk))})`, bot=`rgb(${Math.round(lerp(6,1,dk))},${Math.round(lerp(40,5,dk))},${Math.round(lerp(52,9,dk))})`;
  const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,top); g.addColorStop(1,bot); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  // ---- surface scene (scrolls up out of view)
  if(pan<1){ ctx.save(); ctx.translate(0,-pan*H);
    const sg=ctx.createLinearGradient(0,0,0,150); sg.addColorStop(0,'#05060f'); sg.addColorStop(1,'#1a2440'); ctx.fillStyle=sg; ctx.fillRect(0,0,W,150);
    for(let i=0;i<60;i++){ const sx=(i*97)%W, sy=(i*53)%120; ctx.fillStyle=`rgba(230,240,255,${0.3+((i*7)%5)/10})`; ctx.fillRect(sx,sy,1,1); }
    ctx.fillStyle='#e8eef8'; ctx.beginPath(); ctx.arc(80,40,11,0,7); ctx.fill(); ctx.fillStyle='#1a2440'; ctx.beginPath(); ctx.arc(85,37,10,0,7); ctx.fill();
    ctx.fillStyle='#0a3a48'; ctx.fillRect(0,150,W,H); for(let i=0;i<W;i+=6){ const wy=150+Math.sin(i*0.08+t*1.6)*1.5; ctx.fillStyle='rgba(160,220,240,0.35)'; ctx.fillRect(i,wy,4,1); }
    ctx.fillStyle='rgba(230,240,255,0.18)'; for(let i=0;i<9;i++) ctx.fillRect(60+i*3,152+i*4,30-i*3,1);
    // ship
    ctx.fillStyle='#0c1218'; ctx.beginPath(); ctx.moveTo(250,150); ctx.lineTo(470,150); ctx.lineTo(480,122); ctx.lineTo(240,128); ctx.closePath(); ctx.fill();
    ctx.fillRect(400,96,46,28); ctx.fillRect(420,80,10,18); ctx.fillStyle='#ffd890'; for(let i=0;i<4;i++) ctx.fillRect(404+i*10,104,5,4);
    ctx.fillStyle='#ff3b2e'; if(Math.floor(t*1.5)%2) ctx.fillRect(424,78,2,2);
    ctx.fillStyle='#ccd6dc'; ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillText('АКАДЕМИК',300,142);
    // crane
    ctx.strokeStyle='#1a222a'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(300,126); ctx.lineTo(310,58); ctx.lineTo(332,62); ctx.stroke(); ctx.lineWidth=1;
    ctx.restore(); }
  // ---- sub position
  let sx, sy;
  const hangY=t<4?92:lerp(92,166,ss(4,8,t));
  if(t<8) { sx=330; sy=hangY; }
  else { sx=lerp(330,220,pan); sy=lerp(166-pan*H*0.0,128,pan); }
  if(t>=11.5) { sx=220; sy=128+Math.sin(t*0.9)*2; }
  // station / dock target
  const stY=t<58?999:Math.max(176,330-(t-58)*16);
  if(t>66){ const k=ss(66,74.5,t); sx=lerp(220,250,k); sy=lerp(128+Math.sin(t*0.9)*2,stY-24,k); }
  if(t<8&&pan<1){ ctx.strokeStyle='#2a3238'; ctx.beginPath(); ctx.moveTo(332,62); ctx.lineTo(332,sy-20); ctx.stroke(); }
  // ---- underwater layers
  if(u>0){ ctx.save(); ctx.globalAlpha=u;
    if(depth<45){ ctx.globalCompositeOperation='lighter'; for(let i=0;i<5;i++){ const bx=((i*131+t*6)%(W+200))-100; ctx.fillStyle=`rgba(140,230,240,${0.05*(1-depth/45)})`; ctx.beginPath(); ctx.moveTo(bx,0); ctx.lineTo(bx+40,0); ctx.lineTo(bx+130,H); ctx.lineTo(bx+70,H); ctx.closePath(); ctx.fill(); } ctx.globalCompositeOperation='source-over'; }
    // wreck
    if(t>38&&t<60){ const wy=320-(t-38)*24; ctx.fillStyle='#04121a'; ctx.beginPath(); ctx.moveTo(-20,wy); ctx.lineTo(150,wy+10); ctx.lineTo(176,wy+46); ctx.lineTo(-20,wy+60); ctx.closePath(); ctx.fill();
      ctx.fillRect(40,wy-38,8,40); ctx.fillRect(20,wy-24,48,3); ctx.fillStyle='#3a2418'; for(let i=0;i<6;i++) ctx.fillRect(10+i*24,wy+20,6,5); ctx.fillStyle='rgba(120,60,30,0.6)'; ctx.fillRect(60,wy+8,40,2); }
    // fish school
    if(t>12&&t<26){ const k=(t-12)/14, cx=lerp(-80,W+80,k), cy=96+Math.sin(t*0.8)*16;
      for(const [fx,fy,ph] of r.fish){ const x=cx-fx, y=cy+fy+Math.sin(t*3+ph)*3; ctx.fillStyle='#a8d8e0'; ctx.fillRect(Math.round(x),Math.round(y),5,2); ctx.fillStyle='#6a98a0'; ctx.fillRect(Math.round(x)-2,Math.round(y),2,2); } }
    // jellyfish
    if(t>28&&t<46){ ctx.globalCompositeOperation='lighter'; for(const j of r.jel){ const x=j[0]+Math.sin(t*0.5+j[2])*10, y=H+40-(t-28)*24*j[3]+j[1]-60; if(y<-30||y>H+30) continue; const pu=Math.sin(t*3+j[2]);
        const gg=ctx.createRadialGradient(x,y,0,x,y,16); gg.addColorStop(0,'rgba(255,140,220,0.35)'); gg.addColorStop(1,'rgba(255,140,220,0)'); ctx.fillStyle=gg; ctx.fillRect(x-16,y-16,32,32);
        ctx.fillStyle='rgba(255,170,230,0.7)'; ctx.beginPath(); ctx.ellipse(x,y,7+pu,5,0,Math.PI,0); ctx.fill(); for(let i=0;i<4;i++) ctx.fillRect(Math.round(x-5+i*3),Math.round(y+1),1,5+Math.round(Math.sin(t*4+i)*2)); } ctx.globalCompositeOperation='source-over'; }
    // sonar + the thing in the dark
    if(r.ping>=0&&t<64){ for(let i=0;i<3;i++){ const k=((r.ping*0.6+i/3)%1); ctx.strokeStyle=`rgba(79,227,214,${(1-k)*0.4})`; ctx.beginPath(); ctx.arc(sx,sy,10+k*260,0,7); ctx.stroke(); }
      const a=ss(55,58,t)*(1-ss(61,64,t))*0.55; if(a>0){ ctx.fillStyle=`rgba(0,0,0,${a})`; for(let k=0;k<3;k++){ ctx.beginPath(); const bx=360+k*40, by=H+10; ctx.moveTo(bx,by); for(let s=0;s<=10;s++){ const yy=by-s*16, xx=bx+Math.sin(t*1.3+s*0.6+k)*14*(s/10); ctx.lineTo(xx+6-s*0.4,yy); } for(let s=10;s>=0;s--){ const yy=by-s*16, xx=bx+Math.sin(t*1.3+s*0.6+k)*14*(s/10); ctx.lineTo(xx-6+s*0.4,yy); } ctx.closePath(); ctx.fill(); } }
      if(t<62&&Math.floor(t*2)%2){ ctx.fillStyle='rgba(255,90,80,0.9)'; ctx.fillRect(392,226,3,3); } }
    // station
    if(stY<H+40){ const y=stY; ctx.fillStyle='#0a1a22'; ctx.fillRect(0,y,W,H-y+10); ctx.fillStyle='#14303a'; ctx.fillRect(0,y,W,3);
      ctx.fillStyle='#0e2430'; ctx.fillRect(236,y-14,28,16); ctx.fillStyle='#1e4450'; ctx.fillRect(234,y-16,32,3);
      for(let i=0;i<14;i++){ const px=18+i*34; if(Math.abs(px-250)<26) continue; ctx.fillStyle='#061016'; ctx.beginPath(); ctx.arc(px,y+22,6,0,7); ctx.fill(); ctx.fillStyle=(i*7)%3?'rgba(255,214,140,0.85)':'rgba(120,200,230,0.4)'; ctx.beginPath(); ctx.arc(px,y+22,4,0,7); ctx.fill(); }
      ctx.fillStyle='#4fe3d6'; ctx.font='9px '+DFONT(); ctx.fillText('КАЛИАКРА',20,y+50);
      for(const bx of [10,470]){ if(Math.floor(t*1.4+bx)%2){ ctx.fillStyle='#ff4a3a'; ctx.fillRect(bx-1,y-4,3,3); } }
      if(r.clamp){ ctx.save(); ctx.globalCompositeOperation='lighter'; const ca=Math.max(0,1-(t-74.5)/1.2); ctx.fillStyle=`rgba(180,255,250,${ca*0.6})`; ctx.fillRect(228,y-20,44,8); ctx.restore(); } }
    // marine snow
    for(const s of r.snow){ ctx.fillStyle=`rgba(210,240,240,${0.25+s[3]*0.35})`; ctx.fillRect(Math.round(s[0]),Math.round(s[1]),s[2],s[2]); }
    ctx.restore(); }
  // sub + bubbles
  riSub(sx,sy,t,u*(t<76?1:Math.max(0,1-(t-76)/3)));
  if(u>0.5&&t<74){ for(let i=0;i<3;i++){ const k=((t*0.8+i/3)%1); ctx.fillStyle=`rgba(220,250,255,${(1-k)*0.6})`; ctx.fillRect(Math.round(sx-36-k*10),Math.round(sy-4-k*30),2,2); } }
  ctx.restore();
  // ---- HUD
  if(t>10){ const a=ss(10,12,t)*(1-ss(80,83,t)); ctx.globalAlpha=a; ctx.fillStyle='rgba(4,14,18,0.62)'; ctx.fillRect(W-112,22,106,44); ctx.fillStyle=ACC(); ctx.fillRect(W-8,22,2,44);
    ctx.textAlign='right'; ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='rgba(200,240,240,0.7)'; ctx.fillText('ДЪЛБОЧИНА',W-13,31); ctx.textAlign='left'; ctx.fillText('ВЪНШНА ТЕМП.',W-106,60); ctx.textAlign='right';
    ctx.font='14px '+DFONT(); ctx.fillStyle='#e8fbff'; ctx.fillText(String(depth).padStart(3,'0')+' м',W-13,48); ctx.font='600 7px "IBM Plex Mono",monospace'; ctx.fillStyle='#9fd8d2'; ctx.fillText(Math.round(lerp(22,8,Math.min(1,depth/40)))+' °C',W-13,60); ctx.textAlign='left'; ctx.globalAlpha=1; }
  const card=(a,b,t0,t1)=>{ if(t<t0||t>t1) return; const al=clamp(Math.min(t-t0,t1-t)/0.8,0,1); ctx.globalAlpha=al; centerText(a,232,'13px '+DFONT(),ACC()); centerText(b,248,'600 8px "IBM Plex Mono",monospace','#cfe8e8'); ctx.globalAlpha=1; };
  card('ЧЕРНО МОРЕ','Четиридесет мили източно от нос Калиакра · 23:40 ч.',1.2,7.6);
  card('БАТИСКАФ „АРГО-3“','Пътник: един · Цел: подводна станция „Калиакра“',27,32);
  if(t>17&&t<23.5){ ctx.globalAlpha=clamp(Math.min(t-17,23.5-t)/0.8,0,1); glitchTitle('РЕЗОНАНС 2',W/2,196,30); centerText('О  Т  З  В  У  К',216,'600 10px "IBM Plex Mono",monospace',ACC()); ctx.globalAlpha=1; }
  ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='rgba(200,240,240,0.55)'; ctx.textAlign='right'; ctx.fillText('Enter / Q — пропусни интрото  ·  Esc — назад',472,9); ctx.textAlign='left';
  drawMsgBox(t>10?72:14);
  r2PostFx();
  if(t<1.4){ ctx.fillStyle=`rgba(0,0,0,${1-t/1.4})`; ctx.fillRect(0,0,W,H); }
  if(t>RI_END-3){ ctx.fillStyle=`rgba(0,0,0,${clamp((t-(RI_END-3))/2.5,0,1)})`; ctx.fillRect(0,0,W,H); }
}

/* ================= РЕЗОНАНС 2 · ТРЕНИРОВКА ================= */
const instr2=t=>{ showMsg(t,0,'АВТОМАТИКА'); SFX.radio&&AC&&SFX.radio(0.5,sfxBus); };
const TRAIN2={n:0,title:'КАЛИБРИРАНЕ НА КОСТЮМА',cols:200,grav:900,music:{tr:-4,bpm:96},start:4,training:true,exit:194,liftStyle:'cable',
 hdrS:'ПОДГОТОВКА · ПРЕДИ ПРИСТАНА', hdrN:'Z — към пристана',
 theme:()=>'sea',
 loadout:{w:['wrench','pistol'],ammo:{pistol:[17,34]},armor:0,cur:'pistol'},
 story:['Батискафът се скачва с „Калиакра“, но вътрешният шлюз остава затворен.','На таблото светва надпис: „Нов модел костюм. Изисква се калибриране.“ Автоматиката те насочва към тренировъчния модул.','(Ако искаш да пропуснеш калибрирането, натисни два пъти ENTER.)'],
 end:['Автоматиката мълчи няколко секунди. После вратата към пристана се отваря със съскане.','Д-р Илиева: „Костюмът е готов. Сега внимателно — никой от екипажа все още не отговаря.“'],
 winds:[[99,2,104,14,0,-1300]],
 zgZones:[[121,2,147,14]],
 shifters:[{per:6,off:0,a:[[158,2,158,14]],b:[[163,2,163,14]]}],
 levers:[{x:50,y:9,label:'отвори шлюза',fn:()=>{ setDoor([53,2,8],'.'); drainRegion(54,6,64,8); instr2('Шлюзът е отворен. Водата се оттича.'); if(TRN) TRN.hint=null; }}],
 onLoad(){ if(!TRN) TRN={fromMenu:true}; Object.assign(TRN,{hint:null,dA:false,gotP:false,skip:0}); },
 build(F,C){ LB.frame(F,C);
  F(17,14,17,14,'B'); F(20,13,21,14,'#'); F(22,11,22,14,'#');
  F(23,9,25,14,'#'); F(26,9,43,14,'w'); F(34,2,35,11,'#'); F(44,9,52,14,'#');
  F(53,2,53,8,'D'); F(53,9,65,14,'#'); F(54,2,64,5,'#'); F(54,6,64,8,'w');
  F(92,2,92,14,'D');
  F(106,5,116,14,'#');
  F(128,9,129,14,'#'); F(136,2,137,8,'#'); F(142,10,143,14,'#');
 },
 deco(){
  bubbleSign(3,3,'КАЛИБРИРАНЕ НА КОСТЮМА · ТРЕНИРОВЪЧЕН МОДУЛ');
  pipeH(3*T+4,2,52); pipeH(3*T+4,66,198);
  bubbleSign(14,6,'1 · ДВИЖЕНИЕ'); bubbleSign(27,4,'2 · ПЛУВАНЕ'); bubbleSign(45,4,'3 · ШЛЮЗ'); bubbleSign(70,5,'4 · СТРЕЛБИЩЕ'); bubbleSign(94,4,'5 · ТЕЧЕНИЯ');
  bubbleSign(122,3,'6 · БЕЗТЕГЛОВНОСТ'); bubbleSign(152,4,'7 · ПОДВИЖНИ ПРЕГРАДИ'); bubbleSign(176,5,'ПРИСТАН 1 →');
  consoleAt(6*T,15*T,2); consoleAt(170*T,15*T,3); consoleAt(46*T,9*T,1);
  R(121*T,2*T,27*T,13*T,'rgba(120,200,255,0.07)'); R(121*T,2*T,1,13*T,'#4fe3d6'); R(148*T-1,2*T,1,13*T,'#4fe3d6');
  for(let x=99;x<=104;x++) R(x*T,15*T-3,T,3,'#2a4a52');
  R(186*T,7*T,6*T,8*T,'#0e1a20'); R(186*T+2,7*T+2,6*T-4,8*T-2,'#1a2e36'); R(189*T-1,7*T+2,2,8*T-2,'#0e1a20');
 },
 spawns:[
  ['airR',37,13],
  ['pulse',74,14],['target',80,14],['target',84,14],['target',88,9],['target',90,14],
  ['health',167,14],['battery',169,14],['health',176,14,'E'],
 ],
 triggers:[
  {x:3,fn:()=>{ instr2('Добре дошъл на борда на „Калиакра“. Костюмът ти е нов модел и трябва да бъде калибриран. Следвай указанията.'); trHint('[←] [→]  движение   ·   [X]  скок'); }},
  {x:15,fn:()=>{ setCp(15); trHint('задръж [X] по-дълго — скачаш по-високо'); }},
  {x:24,fn:()=>{ setCp(24); instr2('Тренировъчен басейн. Във водата се движиш със стрелките, а X дава тласък.'); trHint('[←][→][↑][↓] плуване   ·   [X] тласък'); }},
  {x:30,fn:()=>{ instr2('Стената стига под водата — гмурни се отдолу. Следи лентата „Въздух“. Мехурчетата я пълнят.'); trHint('[↓] гмуркане   ·   мехурчета = въздух'); }},
  {x:39,fn:()=>{ trHint('на повърхността [X] те изхвърля от водата'); }},
  {x:45,fn:()=>{ setCp(45); instr2('Шлюзът е затворен, а коридорът зад него е наводнен. Използвай лоста.'); trHint('застани до лоста   ·   [↑]  дърпане'); }},
  {x:68,fn:()=>{ setCp(68); instr2('Стрелбище. Вземи импулсната пушка и свали всички мишени.'); trHint('[Z] стрелба   ·   [↑]+[Z] нагоре'); }},
  {x:95,fn:()=>{ setCp(95); instr2('Вентилационна шахта. Течението ще те издигне — насочвай се със стрелките.'); trHint('влез в течението   ·   [←] [→] насочване'); }},
  {x:108,fn:()=>{ radio('Виждам данните от костюма. Всичко е наред — продължавай.'); trHint('скочи долу и продължи'); }},
  {x:119,fn:()=>{ setCp(119); instr2('Камера за безтегловност. Стрелките те движат, а X дава тласък. Пуснеш ли всичко, постепенно ще спреш.'); trHint('[←][→][↑][↓] движение   ·   [X] тласък'); }},
  {x:150,fn:()=>{ setCp(150); instr2('Подвижни прегради. Червеното очертание показва къде ще се появи стена — не стой там.'); trHint('мини, когато пътят е свободен'); }},
  {x:167,fn:()=>{ setCp(167); instr2('Калибрирането приключи. Пауза — с P или Esc, звук — с M. Пристанът е зад вратата.'); trHint('[P] / [Esc] пауза   ·   [M] звук'); }},
 ],
 tick(dt){
  const p=player, alive=(a,b)=>enemies.some(e=>e.type==='target'&&!e.dead&&e.x>=a*T&&e.x<b*T);
  if(!TRN.gotP&&p.weapons.pulse){ TRN.gotP=true; trHint('[Q] или [1]–[6]  смяна на оръжие'); }
  if(!TRN.dA&&!alive(70,92)){ TRN.dA=true; setDoor([92,2,14],'.'); SFX.door(); instr2('Отлична стрелба. Вратата е отворена.'); }
  if(TRN.skip>0) TRN.skip-=dt;
 },
};
function startR2Training(fromMenu){ TRN={fromMenu}; SURV=false; bossMul=1; ehpMul=1; loadLevel(-1,TRAIN2); state='story'; storyT=0; mInt=0; bossMusic=false; }
