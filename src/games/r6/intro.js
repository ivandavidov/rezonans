/* ================= РЕЗОНАНС 6 · ИНТРО: 3:47 ================= */
let RI6=null;
const RI6_END=76;
const RI6_EV=[
 [4,()=>showMsg('Пак този тон. Откакто се помня — всяка нощ, все същият.',0,'ИВАН')],
 [10,()=>showMsg('Казвал съм на мама и татко стотици пъти. И двамата са лекари — и двамата сменят темата.',0,'ИВАН')],
 [17,()=>{ RI6.scene=1; showMsg('Вратата на детската стая е открехната. Вътре свети нощната лампа.',4); }],
 [22,()=>showMsg('Тате… и ние го чуваме.',0,'НИКОЛА')],
 [27,()=>showMsg('Звучи като някой, който пее под земята. Ниско. Като теб.',0,'АЛЕКСАНДЪР')],
 [33,()=>{ RI6.scene=2; RI6.glyph=0; showMsg('Марина е на балкона. Говори тихо, на език, който никога не си я чувал да използва.',4.5); }],
 [39,()=>showMsg('…Да. Събуди се напълно. Децата също. Пазителките трябва да дойдат преди Наблюдателите.',0,'МАРИНА')],
 [46,()=>showMsg('Марина? С кого говориш?',0,'ИВАН')],
 [51,()=>showMsg('Иване… Срещата ни не беше случайна. Но всичко след нея беше истинско. Кълна ти се.',0,'МАРИНА')],
 [58,()=>{ RI6.hum=0; shake=5; if(AC){ osc({type:'sine',f:110,t:4,v:0.09}); osc({type:'sine',f:165,t:4,v:0.05,when:0.3}); osc({type:'sine',f:220,t:4,v:0.03,when:0.6}); } }],
 [60,()=>showMsg('Уличните лампи премигват. Долу хората излизат от входовете — по пижами, със затворени очи.',4.5)],
 [66,()=>{ RI6.scene=3; }],
];
function startR6Intro(fromMenu){
  const stars=[]; for(let i=0;i<90;i++) stars.push([Math.random()*W,Math.random()*120,Math.random()]);
  const blocks=[]; for(let i=0;i<18;i++) blocks.push([i*30+Math.random()*10-20,40+Math.random()*70,22+Math.random()*16,Math.random()]);
  RI6={t:0,ev:0,fromMenu,stars,blocks,scene:0,glyph:-1,hum:-1};
  msg=null; particles=[]; shake=0; state='gintro'; mInt=0; bossMusic=false; setMusic({tr:-9,bpm:64,alien:true});
}
function finishR6Intro(){ const fm=RI6&&RI6.fromMenu; RI6=null; msg=null; if(fm) toMenu(0); else startR6Training(false); }
function updR6Intro(dt){
  const r=RI6; if(!r) return;
  if(pressed.esc){ const fm=r.fromMenu; RI6=null; msg=null; toMenu(fm?0:2); return; }
  if(pressed.enter||pressed.pause||pressed.swap){ finishR6Intro(); return; }
  r.t+=dt; const t=r.t; shake=Math.max(0,shake-dt*5);
  while(r.ev<RI6_EV.length&&RI6_EV[r.ev][0]<=t){ RI6_EV[r.ev][1](); r.ev++; }
  if(msg){ msg.age+=dt; if(msg.age>msg.d) msg=null; }
  if(r.glyph>=0) r.glyph+=dt; if(r.hum>=0) r.hum+=dt;
  if(t>=RI6_END) finishR6Intro();
}
function r6Rings(x,y,k,col,n=3){ ctx.save(); ctx.globalCompositeOperation='lighter'; for(let i=0;i<n;i++){ const q=((RI6.t*0.3+i/n)%1); ctx.strokeStyle=`rgba(${col},${(1-q)*0.4*k})`; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x,y,8+q*240,0,7); ctx.stroke(); } ctx.restore(); ctx.lineWidth=1; }
function r6City(r,base,lit,sc=1){ for(const b of r.blocks){ const h=Math.round((b[1]+30)*sc); ctx.fillStyle='#0c0e18'; ctx.fillRect(b[0],base-h,b[2],h); for(let y=base-h+6;y<base-6;y+=8) for(let x=b[0]+3;x<b[0]+b[2]-4;x+=6) if(hash(x,y)>0.66){ const fl=lit<1&&hash(x,y+Math.floor(RI6.t*8))>0.6; ctx.fillStyle=fl?'#2a2e3a':hash(x+1,y)>0.5?'#ffd890':'#8ac0ff'; ctx.fillRect(x,y,3,4); } } }
function renderR6Intro(){
  const r=RI6; if(!r){ ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H); return; }
  const t=r.t; ctx.save(); if(shake>0) ctx.translate(Math.round(rnd(-shake,shake)*0.5),Math.round(rnd(-shake,shake)*0.5));
  if(r.scene===0){
    // спалнята: прозорец към града, часовник 3:47
    ctx.fillStyle='#0a0a12'; ctx.fillRect(-10,-10,W+20,H+20);
    ctx.save(); ctx.beginPath(); ctx.rect(150,40,180,110); ctx.clip(); const g=ctx.createLinearGradient(0,40,0,150); g.addColorStop(0,'#04050c'); g.addColorStop(1,'#1e2236'); ctx.fillStyle=g; ctx.fillRect(150,40,180,110);
      for(const s of r.stars){ ctx.fillStyle=`rgba(255,255,240,${0.3+0.5*s[2]})`; ctx.fillRect(150+s[0]*0.38,40+s[1]*0.4,1,1); } r6City(r,150,1); ctx.restore();
    ctx.fillStyle='#2a2430'; ctx.fillRect(146,36,188,4); ctx.fillRect(146,150,188,4); ctx.fillRect(146,36,4,118); ctx.fillRect(330,36,4,118); ctx.fillRect(238,36,4,118);
    ctx.fillStyle='#1a1620'; ctx.fillRect(60,170,260,30); ctx.fillStyle='#d8d0e0'; ctx.fillRect(64,164,70,10); ctx.fillStyle='#3a3050'; ctx.fillRect(130,168,190,8);
    // Иван седи в леглото
    ctx.fillStyle='#2a2a40'; ctx.fillRect(100,146,14,24); ctx.fillStyle='#3a2a20'; ctx.fillRect(101,134,12,4); ctx.fillStyle='#e8c4a0'; ctx.fillRect(102,137,10,9);
    ctx.fillStyle='#120e14'; ctx.fillRect(360,160,40,40); ctx.font='700 14px "IBM Plex Mono",monospace'; ctx.fillStyle=Math.floor(t*2)%2?'#ff4a3a':'#c83a2a'; ctx.fillText('3:47',362,178);
    r6Rings(107,150,Math.min(1,t/3),'232,194,90');
  } else if(r.scene===1){
    // детската стая
    ctx.fillStyle='#14121e'; ctx.fillRect(-10,-10,W+20,H+20); ctx.fillStyle='#1a1828'; ctx.fillRect(0,0,W,180);
    for(let i=0;i<40;i++){ const a=t*0.2+i*0.7; const x=W/2+Math.cos(a+i)*(60+i*5), y=90+Math.sin(a*1.3+i)*(30+i*1.6); ctx.fillStyle=`rgba(255,230,160,${0.25+0.2*Math.sin(t*2+i)})`; ctx.fillRect(Math.round(x),Math.round(y),2,2); }
    ctx.fillStyle='#e8c25a'; ctx.beginPath(); ctx.arc(W/2,170,6,0,7); ctx.fill(); ctx.fillStyle='#3a3020'; ctx.fillRect(W/2-6,174,12,6);
    for(const [bx,kx,s,col,hair] of [[80,120,0.85,'#3a6aa8','#5a3a22'],[300,340,0.72,'#4a8a4a','#8a5a2a']]){ ctx.fillStyle='#2a2440'; ctx.fillRect(bx,176,100,20); ctx.fillStyle='#4a4470'; ctx.fillRect(bx,170,100,8); ctx.fillStyle='#d8d0e0'; ctx.fillRect(bx+4,166,24,8);
      ctx.fillStyle=col; ctx.fillRect(kx-6,176-Math.round(22*s),12,Math.round(16*s)); ctx.fillStyle='#e8c4a0'; ctx.fillRect(kx-4,176-Math.round(30*s),8,8); ctx.fillStyle=hair; ctx.fillRect(kx-4,176-Math.round(31*s),8,3); }
    r6Rings(W/2,220,1,'232,194,90',2);
  } else if(r.scene===2){
    // балконът
    const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#04050c'); g.addColorStop(0.6,'#121a30'); g.addColorStop(1,'#2a2840'); ctx.fillStyle=g; ctx.fillRect(-10,-10,W+20,H+20);
    for(const s of r.stars){ ctx.fillStyle=`rgba(255,255,240,${0.3+0.5*s[2]})`; ctx.fillRect(s[0],s[1],1,1); }
    ctx.fillStyle='#d8d8c8'; ctx.beginPath(); ctx.arc(400,36,7,0,7); ctx.fill();
    const hum=r.hum>=0?Math.min(1,r.hum/2):0; r6City(r,160,1-hum,0.6); ctx.fillStyle='#0a0c14'; ctx.fillRect(0,160,W,40);
    if(hum>0) r6Rings(W/2,240,hum,'232,194,90');
    ctx.fillStyle='#1a1a22'; ctx.fillRect(0,200,W,80); ctx.fillStyle='#3a3a44'; ctx.fillRect(0,196,W,4); for(let x=0;x<W;x+=12) ctx.fillRect(x,176,2,22); ctx.fillRect(0,174,W,3);
    // Марина с телефон, около нея — знаци
    const mx=300; ctx.fillStyle='#3a2238'; ctx.fillRect(mx-5,170,10,26); ctx.fillStyle='#e8c4a0'; ctx.fillRect(mx-4,160,8,10); ctx.fillStyle='#3a2418'; ctx.fillRect(mx-4,158,8,3); ctx.fillRect(mx-6,159,2,15); ctx.fillRect(mx+4,159,2,15);
    ctx.fillStyle='#8ab4ff'; ctx.fillRect(mx+5,164,3,5); ctx.save(); ctx.globalCompositeOperation='lighter'; const pg=ctx.createRadialGradient(mx+6,166,1,mx+6,166,18); pg.addColorStop(0,'rgba(138,180,255,0.5)'); pg.addColorStop(1,'rgba(138,180,255,0)'); ctx.fillStyle=pg; ctx.fillRect(mx-12,148,36,36); ctx.restore();
    if(r.glyph>=0){ const a=Math.min(1,r.glyph/3)*0.6; ctx.strokeStyle=`rgba(232,194,90,${a})`; for(let i=0;i<6;i++){ const an=r.t*0.4+i*1.047, gx=mx+Math.cos(an)*30, gy=170+Math.sin(an)*18; ctx.beginPath(); ctx.arc(gx,gy,4,0,7); ctx.moveTo(gx-4,gy); ctx.lineTo(gx+4,gy); ctx.stroke(); } }
    // Иван на вратата
    ctx.fillStyle='#120e14'; ctx.fillRect(80,120,40,80); ctx.fillStyle='#ffd890'; ctx.fillRect(84,124,32,72); ctx.fillStyle='#0c0a12'; ctx.fillRect(94,160,12,36); ctx.fillRect(95,148,10,12);
  } else {
    ctx.fillStyle='#04050c'; ctx.fillRect(-10,-10,W+20,H+20); for(const s of r.stars){ ctx.fillStyle=`rgba(255,255,240,${0.3+0.5*s[2]})`; ctx.fillRect(s[0],s[1]*1.5,1,1); }
    r6Rings(W/2,110,1,'232,194,90',4);
  }
  ctx.restore();
  const card=(a,b,t0,t1,big)=>{ if(t<t0||t>t1) return; const al=clamp(Math.min(t-t0,t1-t)/0.8,0,1); ctx.globalAlpha=al; centerText(a,232,(big?'700 28px ':'700 15px ')+DFONT(),'#fff4d8'); centerText(b,big?254:248,'600 8px "IBM Plex Mono",monospace',big?ACC():'#e8e0cc'); ctx.globalAlpha=1; };
  card('СОФИЯ','Октомври 2026 г. · 3:47 ч.',1.2,7.5);
  card('РЕЗОНАНС 6','А  К  О  Р  Д',66,73,true);
  ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='rgba(255,244,216,0.55)'; ctx.textAlign='right'; ctx.fillText('Enter / Q — пропусни интрото  ·  Esc — назад',472,9); ctx.textAlign='left';
  drawMsgBox(14);
  r6PostFx();
  if(t<1.4){ ctx.fillStyle=`rgba(0,0,0,${1-t/1.4})`; ctx.fillRect(0,0,W,H); }
  for(const tc of [17,33,66]) if(t>tc-1.5&&t<tc+1.5){ ctx.fillStyle=`rgba(0,0,0,${1-Math.abs(t-tc)/1.5})`; ctx.fillRect(0,0,W,H); }
  if(t>RI6_END-3){ ctx.fillStyle=`rgba(0,0,0,${clamp((t-(RI6_END-3))/2.5,0,1)})`; ctx.fillRect(0,0,W,H); }
}

/* ================= РЕЗОНАНС 6 · ТРЕНИРОВКА ================= */
const TRAIN6={n:0,title:'УРОКЪТ НА ПАЗИТЕЛКАТА',cols:200,grav:900,music:MUS6.dream,start:4,training:true,exit:196,hero:'i',
 tone:true,sleepers:[[34,48]],
 hdrS:'ПОДГОТОВКА · СЪН-УРОК', hdrN:'Z — към първата нощ',
 theme:()=>'acdream',sky:SKY6.dream,
 memory:'(Това е само проба. Истинските ноти са скрити в епизодите на кампанията — по една във всеки.)',
 loadout:{w:['wrench','pistol'],ammo:{pistol:[17,51]},armor:0,cur:'pistol'},
 story:['Седмица по-рано. Сънуваш поле от лилава трева под небе без луна. Марина е там — и не се учудва, че те вижда.','„Ако някога чуеш тона и наяве, Иване — ето какво трябва да знаеш.“','(Ако искаш да пропуснеш тренировката, натисни два пъти ENTER.)'],
 end:['Марина те хваща за ръката: „Запомни. Ти не си оръжие. Ти си глас.“','Събуждаш се. Тя спи до теб — или се прави, че спи.'],
 onLoad(){ if(!TRN) TRN={fromMenu:true}; Object.assign(TRN,{hint:null,skip:0}); },
 build(F,C){ LB.frame(F,C,{noCeil:true});
  F(14,14,14,14,'B'); F(22,13,23,14,'B'); pit6(F,56,58); F(66,13,67,14,'B');
  F(84,0,84,14,'t'); F(120,12,126,14,'#'); F(119,12,119,14,'H'); F(140,0,140,14,'t'); F(168,13,169,14,'B'); },
 deco(){ acSign(28,7,'1 · ХОРА В ТРАНС'); acSign(72,7,'2 · ТОНЪТ'); acSign(110,7,'3 · ЗАШЕМЕТИ'); acSign(160,7,'4 · НОТИТЕ'); for(const x of [8,50,104,150,186]) acMenhir(x,15*T,24); },
 spawns:[['wisp',100,10],['wisp',108,8],['wisp',130,9],['memory',176,14],['health',184,14]],
 triggers:[
  {x:3,fn:()=>{ mar('Тук всичко е както наяве — само по-тихо. Да започнем.'); trHint('[←] [→]  движение   ·   [X]  скок   ·   [Z]  стрелба'); }},
  {x:26,fn:()=>{ setCp(26); mar('Хората, които тонът хваща, вървят насън. Не ги дърпай. Застани до тях и задръж ↑.'); trHint('[↑]  задръж до човек в транс'); }},
  {x:70,fn:()=>{ setCp(70); mar('Това е тонова врата. Не се отваря с ръце. Изпей тона — натисни E.'); trHint('[E]  изпей тона — отваря тоновите врати за няколко секунди'); }},
  {x:92,fn:()=>{ setCp(92); mar('Светлинките са ехо от чужди сънища. Тонът ги зашеметява — после ги довърши.'); trHint('[E]  тонът зашеметява враговете наоколо   ·   [Z]  стреляй'); }},
  {x:150,fn:()=>{ setCp(150); mar('Във всеки епизод има по една нота. Събери ги — заедно разказват истината. Вземи тази, пробна е.'); trHint('вземи нотата   ·   в някои сънища E сменя сън и яве   ·   [P] / [Esc] пауза'); }},
 ],
 tick(dt){ if(TRN.skip>0) TRN.skip-=dt; },
};
function startR6Training(fromMenu){ TRN={fromMenu}; SURV=false; bossMul=1; ehpMul=1; loadLevel(-1,TRAIN6); state='story'; storyT=0; mInt=0; bossMusic=false; }
