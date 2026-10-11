/* ================= РЕЗОНАНС 7 · ИНТРО: КОМПЮТЪРНИЯТ КЛУБ ================= */
let RI7=null;
const RI7_END=68;
const RI7_EV=[
 [4,()=>showMsg('Слава богу, че дойдохте! Машините правят нещо странно, на което изобщо не сме ги учили!',0,'ДРУГАРКАТА ПЕТРОВА')],
 [10,()=>showMsg('Спокойно, другарко Петрова. Петнайсет години съм по сервизите. Най-вероятно е от захранването.',0,'ПЕШО')],
 [16.5,()=>{ RI7.scene=1; showMsg('Дванайсет „Правеца“ в редица. Всички работят. А никой не ги е включвал.',4); }],
 [22,()=>{ RI7.hello=0; showMsg('Вчера сами изписаха „ДОБРО УТРО“. А беше седем вечерта!',0,'ДРУГАРКАТА ПЕТРОВА'); }],
 [28,()=>showMsg('Чакайте да надникна вътре. Само да взема отвертката — и сме готови.',0,'ПЕШО')],
 [34,()=>{ RI7.scene=2; RI7.type=0; }],
 [42,()=>showMsg('Ей това ми липсваше — машина да ми дава акъл какво да правя.',0,'ПЕШО')],
 [48,()=>{ RI7.pull=0; shake=5; if(AC){ osc({type:'square',f:220,f2:880,t:2.5,v:0.05}); osc({type:'square',f:110,f2:1760,t:3,v:0.03,when:0.5}); } showMsg('Зеленият екран блесва ослепително. Отвертката пада от ръката ти. А след миг политаш и самият ти.',4.5); }],
 [55,()=>{ RI7.scene=3; }],
];
function startR7Intro(fromMenu){
  RI7={t:0,ev:0,fromMenu,scene:0,hello:-1,type:-1,pull:-1};
  msg=null; particles=[]; shake=0; state='gintro'; mInt=0; bossMusic=false; setMusic({tr:-5,bpm:96,alien:false});
}
function finishR7Intro(){ const fm=RI7&&RI7.fromMenu; RI7=null; msg=null; if(fm) toMenu(0); else startR7Training(false); }
function updR7Intro(dt){
  const r=RI7; if(!r) return;
  if(pressed.esc){ const fm=r.fromMenu; RI7=null; msg=null; toMenu(fm?0:2); return; }
  if(pressed.enter||pressed.pause||pressed.swap){ finishR7Intro(); return; }
  r.t+=dt; const t=r.t; shake=Math.max(0,shake-dt*5);
  while(r.ev<RI7_EV.length&&RI7_EV[r.ev][0]<=t){ RI7_EV[r.ev][1](); r.ev++; }
  if(msg){ msg.age+=dt; if(msg.age>msg.d) msg=null; }
  for(const k of ['hello','type','pull']) if(r[k]>=0) r[k]+=dt;
  if(t>=RI7_END) finishR7Intro();
}
function r7Pravec(x,y,scr,t){ ctx.fillStyle='#d8d0b8'; ctx.fillRect(x,y+30,44,12); ctx.fillStyle='#8a8270'; ctx.fillRect(x+4,y+33,30,3); ctx.fillStyle='#c83a2a'; ctx.fillRect(x+37,y+33,4,2);
  ctx.fillStyle='#c8c0a8'; ctx.fillRect(x+6,y,32,28); ctx.fillStyle='#041004'; ctx.fillRect(x+9,y+3,26,19);
  if(scr){ ctx.fillStyle='#3aff5a'; ctx.font='600 4px "IBM Plex Mono",monospace'; ctx.fillText(scr,x+10,y+10); if(Math.floor(t*2)%2) ctx.fillRect(x+10,y+13,3,4); } }
function renderR7Intro(){
  const r=RI7; if(!r){ ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H); return; }
  const t=r.t; ctx.save(); if(shake>0) ctx.translate(Math.round(rnd(-shake,shake)*0.5),Math.round(rnd(-shake,shake)*0.5));
  if(r.scene===0){
    const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#1a1a3a'); g.addColorStop(0.7,'#5a3a5a'); g.addColorStop(1,'#d8885a'); ctx.fillStyle=g; ctx.fillRect(-10,-10,W+20,H+20);
    ctx.fillStyle='#d8c8a0'; ctx.fillRect(60,80,360,130); ctx.fillStyle='#a8987a'; ctx.fillRect(60,80,360,6);
    for(let i=0;i<8;i++) for(let j=0;j<3;j++){ const lit=(i===5&&j===1); ctx.fillStyle=lit?'#9aff8a':'#3a3a4a'; ctx.fillRect(76+i*42,96+j*36,26,24); if(lit){ ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.fillStyle='rgba(120,255,140,0.25)'; ctx.fillRect(66+i*42,86+j*36,46,44); ctx.restore(); } }
    ctx.fillStyle='#ffffff'; ctx.fillRect(170,64,140,14); ctx.font='600 7px "IBM Plex Mono",monospace'; ctx.fillStyle='#2a2a6a'; ctx.fillText('ЕСПУ · КОМПЮТЪРЕН КЛУБ',176,74);
    ctx.fillStyle='#3a3a3a'; ctx.fillRect(0,210,W,70); ctx.fillStyle='#1a1a1a'; ctx.fillRect(160,186,10,24); ctx.fillRect(159,176,12,10); ctx.fillStyle='#3a5a9a'; ctx.fillRect(159,186,12,16); ctx.fillStyle='#8a4a2a'; ctx.fillRect(172,198,10,8);
    ctx.fillStyle='#2a2a2a'; ctx.fillRect(200,184,10,26); ctx.fillStyle='#6a2a4a'; ctx.fillRect(199,186,12,18); ctx.fillStyle='#e8c4a0'; ctx.fillRect(201,176,8,8); ctx.fillStyle='#4a3020'; ctx.fillRect(200,174,10,4);
  } else if(r.scene===1){
    ctx.fillStyle='#2a2a32'; ctx.fillRect(-10,-10,W+20,H+20); ctx.fillStyle='#4a4a3a'; ctx.fillRect(0,0,W,40); ctx.fillStyle='#e8e0c0'; for(let x=40;x<W;x+=120) ctx.fillRect(x,10,60,4);
    ctx.fillStyle='#5a4a3a'; ctx.fillRect(0,206,W,74);
    for(let i=0;i<6;i++){ const x=20+i*76, hello=r.hello>=0; r7Pravec(x,150,hello?(i===3&&Math.floor(t*3)%7===0?'○∴':'ЗДРАВЕЙ,'):'READY.',t); ctx.fillStyle='#6a5a4a'; ctx.fillRect(x-4,192,52,6); }
    ctx.fillStyle='#3a5a9a'; ctx.fillRect(200,200,12,20); ctx.fillStyle='#e8c4a0'; ctx.fillRect(202,190,8,8);
  } else if(r.scene===2){
    ctx.fillStyle='#020602'; ctx.fillRect(-10,-10,W+20,H+20);
    const glow=r.pull>=0?Math.min(1,r.pull/4):0.2; ctx.save(); ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(W/2,H/2,10,W/2,H/2,260); g.addColorStop(0,`rgba(90,255,120,${0.25+glow*0.6})`); g.addColorStop(1,'rgba(90,255,120,0)'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H); ctx.restore();
    ctx.strokeStyle='#3aff5a'; ctx.lineWidth=1; ctx.strokeRect(60,40,360,180);
    const lines=['МИРА V0.9 (C) 1987','ЗДРАВЕЙ, ТЕХНИКО.','АЗ СЪМ МИРА.','НЕ ПИПАЙ НИЩО, БЕЗ ДА ТИ КАЖА.','…','ДОБРЕ. ВЛИЗАЙ.'];
    const shown=r.type>=0?Math.floor(r.type*14):0; let n=shown; ctx.font='600 10px "IBM Plex Mono",monospace'; ctx.fillStyle='#8aff9a';
    lines.forEach((l,i)=>{ if(n<=0) return; const s=l.slice(0,n); n-=l.length; ctx.fillText(s,80,70+i*22); });
    if(Math.floor(t*2)%2) ctx.fillRect(80,180,8,12);
  } else {
    ctx.fillStyle='#000'; ctx.fillRect(-10,-10,W+20,H+20); const k=t-55;
    ctx.strokeStyle='rgba(58,255,90,0.6)'; for(let i=0;i<14;i++){ const z=((i/14+k*0.4)%1), s=20+z*z*500; ctx.globalAlpha=z; ctx.strokeRect(W/2-s/2,H/2-s/2*0.6,s,s*0.6); } ctx.globalAlpha=1;
    for(let i=0;i<16;i++){ const a=i/16*6.283; ctx.beginPath(); ctx.moveTo(W/2,H/2); ctx.lineTo(W/2+Math.cos(a)*400,H/2+Math.sin(a)*240); ctx.strokeStyle='rgba(58,255,90,0.15)'; ctx.stroke(); }
    const s=Math.max(2,20-k*3); ctx.fillStyle='#3a5a9a'; ctx.fillRect(W/2-s/4,H/2-s/2,s/2,s);
  }
  ctx.restore();
  const card=(a,b,t0,t1,big)=>{ if(t<t0||t>t1) return; const al=clamp(Math.min(t-t0,t1-t)/0.8,0,1); ctx.globalAlpha=al; centerText(a,232,(big?'700 28px ':'700 15px ')+DFONT(),big?'#3aff5a':'#fff4d8'); centerText(b,big?254:248,'600 8px "IBM Plex Mono",monospace',big?'#8aff9a':'#e8e0cc'); ctx.globalAlpha=1; };
  card('КОМПЮТЪРНИЯТ КЛУБ','Октомври 1987 г. · 17:40 ч.',1.2,7.5);
  card('РЕЗОНАНС 7','П  Р  А  В  Е  Ц',60,66.5,true);
  ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='rgba(255,244,216,0.55)'; ctx.textAlign='right'; ctx.fillText('Enter / Q — пропусни интрото  ·  Esc — назад',472,9); ctx.textAlign='left';
  drawMsgBox(14);
  r7PostFx(r.scene>=2?'green':'web');
  if(t<1.4){ ctx.fillStyle=`rgba(0,0,0,${1-t/1.4})`; ctx.fillRect(0,0,W,H); }
  for(const tc of [16,34,55]) if(t>tc-1.2&&t<tc+1.2){ ctx.fillStyle=`rgba(0,0,0,${1-Math.abs(t-tc)/1.2})`; ctx.fillRect(0,0,W,H); }
  if(t>RI7_END-2.5){ ctx.fillStyle=`rgba(0,0,0,${clamp((t-(RI7_END-2.5))/2,0,1)})`; ctx.fillRect(0,0,W,H); }
}

/* ================= РЕЗОНАНС 7 · ТРЕНИРОВКА ================= */
const TRAIN7={n:0,title:'ТЕСТ НА ПАМЕТТА',cols:200,grav:900,music:MUS7.boot,start:4,training:true,exit:196,
 hdrS:'ПОДГОТОВКА · ТЕСТ НА ПАМЕТТА', hdrN:'Z — към първата програма',
 theme:()=>'pxboot',
 memory:'(Това е само проба. Истинските редове от програмата на Мира са скрити в епизодите — по един във всеки.)',
 loadout:{w:['wrench','pistol'],ammo:{pistol:[17,51]},armor:0,cur:'pistol'},
 cursors:[['POKE',26,14,{label:'POKE 30,1',set:[[30,15,38,15,'=']]}],['GOTO',56,14,{label:'GOTO 66',to:[66,14]}],['PEEK',86,14,{label:'PEEK 90'}],['BREAK',116,14,{label:'BREAK',r:16,t:5,cd:6}]],
 story:['Преди всичко МИРА подлага на проверка оперативната памет. На всеки, прекрачил прага ѝ. Дори на дежурните техници.','„Ще ти покажа основните команди. Постарай се да не счупиш нещо.“','(За да пропуснеш тренировката, натисни два пъти ENTER.)'],
 end:['МИРА: „Тестът премина успешно. 48K OK.“','„А сега — към същинската работа. Някой е заредил вирус в машината. И той се разраства бързо.“'],
 onLoad(){ if(!TRN) TRN={fromMenu:true}; Object.assign(TRN,{hint:null,skip:0}); },
 build(F,C){ LB.frame(F,C); F(2,2,C-3,3,'#');
  F(14,14,14,14,'B'); pit7(F,30,38); F(60,4,61,14,'#'); F(90,12,100,14,'#'); F(93,13,97,14,'.'); F(90,13,92,14,'h'); F(150,13,151,14,'B'); },
 deco(){ pxPC(4,15*T); pxSign(20,5,'1 · POKE'); pxSign(50,5,'2 · GOTO'); pxSign(80,5,'3 · PEEK'); pxSign(110,5,'4 · BREAK'); pxSign(160,5,'5 · РЕДОВЕТЕ'); },
 spawns:[['bug',124,14],['bug',128,14],['bug',132,14],['health',95,14],['memory',170,14],['health',184,14]],
 triggers:[
  {x:3,fn:()=>{ mira('Започваме. Движение, скок, стрелба — като в реалния свят, само дето тук всичко е зелено.'); trHint('[←] [→]  движение   ·   [X]  скок   ·   [Z]  стрелба'); }},
  {x:20,fn:()=>{ setCp(20); mira('Пропаст. Застани до мигащия курсор и натисни E — POKE ще запише платформа в паметта.'); trHint('[E]  до курсора — изпълнение на команда'); }},
  {x:46,fn:()=>{ setCp(46); mira('Стената е твърде висока за скок. Командата GOTO те прехвърля на друг ред.'); trHint('[E]  GOTO — телепорт'); }},
  {x:76,fn:()=>{ setCp(76); mira('PEEK прочита скритата памет. Някои стени са само привидна графика.'); trHint('[E]  PEEK — разкрива скритите проходи'); }},
  {x:106,fn:()=>{ setCp(106); mira('Бъгове в системата. Командата BREAK ги парализира за няколко секунди. Довърши ги, докато не мърдат!'); trHint('[E]  BREAK — замразява враговете наоколо'); }},
  {x:156,fn:()=>{ setCp(156); mira('Във всяка програма е скрит по един ред от моя код. Събери ги — само така ще ме възстановиш.'); trHint('вземи реда на кода   ·   [P] / [Esc] пауза   ·   [M] звук'); }},
 ],
 tick(dt){ if(TRN.skip>0) TRN.skip-=dt; },
};
function startR7Training(fromMenu){ TRN={fromMenu}; SURV=false; bossMul=1; ehpMul=1; loadLevel(-1,TRAIN7); state='story'; storyT=0; mInt=0; bossMusic=false; }
