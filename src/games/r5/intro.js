/* ================= РЕЗОНАНС 5 · ИНТРО: ПЪТЯТ ЗА АЛЕКСАНДРОВО ================= */
let RI5=null;
const RI5_END=74;
const RI5_EV=[
 [5,()=>showMsg('Иван най-сетне заспа. Колко има още?',0,'РУМЯНА')],
 [10,()=>showMsg('Двайсетина километра. Последното село преди платото.',0,'ДЕЯН')],
 [16,()=>{ RI5.env=0; showMsg('Пликът от Илиева лежи на седалката. Отворен.',4); }],
 [22,()=>showMsg('„Официално сте участъковите лекари на Александрово. Неофициално — записвайте всичко необичайно. Особено сънищата.“',7,'ИЛИЕВА')],
 [32,()=>{ RI5.env=-1; RI5.scene=1; showMsg('Александрово, малко след полунощ. Здравната служба е на главната улица.',4); }],
 [38,()=>{ RI5.walker=0; showMsg('Деян… онзи човек спи. Ходи насън.',0,'РУМЯНА'); }],
 [44,()=>{ RI5.hum=0; shake=4; if(AC){ osc({type:'sine',f:98,t:4,v:0.09}); osc({type:'sine',f:196,t:4,v:0.04,when:0.3}); } }],
 [46,()=>showMsg('Земята бучи. Кучетата в селото млъкват едновременно.',4)],
 [52,()=>showMsg('Иван не плаче. Буден е и гледа към платото.',4)],
 [60,()=>{ RI5.scene=2; }],
 [66,()=>showMsg('Добре дошли в Александрово.',0,'ДЕЯН')],
];
function startR5Intro(fromMenu){
  const stars=[]; for(let i=0;i<90;i++) stars.push([Math.random()*W,Math.random()*120,Math.random()]);
  const trees=[]; for(let i=0;i<30;i++) trees.push([Math.random()*1400,0.6+Math.random()*0.6]);
  RI5={t:0,ev:0,fromMenu,stars,trees,scene:0,env:-1,walker:-1,hum:-1};
  msg=null; particles=[]; shake=0; state='gintro'; mInt=0; bossMusic=false; setMusic({tr:-7,bpm:70,alien:false});
}
function finishR5Intro(){ const fm=RI5&&RI5.fromMenu; RI5=null; msg=null; if(fm) toMenu(0); else startR5Training(false); }
function updR5Intro(dt){
  const r=RI5; if(!r) return;
  if(pressed.esc){ const fm=r.fromMenu; RI5=null; msg=null; toMenu(fm?0:2); return; }
  if(pressed.enter||pressed.pause||pressed.swap){ finishR5Intro(); return; }
  r.t+=dt; const t=r.t; shake=Math.max(0,shake-dt*5);
  while(r.ev<RI5_EV.length&&RI5_EV[r.ev][0]<=t){ RI5_EV[r.ev][1](); r.ev++; }
  if(msg){ msg.age+=dt; if(msg.age>msg.d) msg=null; }
  if(r.env>=0) r.env+=dt; if(r.walker>=0) r.walker+=dt; if(r.hum>=0) r.hum+=dt;
  if(t>=RI5_END) finishR5Intro();
}
function r5Car(x,y,lights){ ctx.fillStyle='#d8d0b0'; ctx.fillRect(x,y-10,44,10); ctx.fillRect(x+8,y-18,26,8); ctx.fillStyle='#2a3a4a'; ctx.fillRect(x+10,y-16,10,6); ctx.fillRect(x+22,y-16,10,6);
  ctx.fillStyle='#14100c'; ctx.beginPath(); ctx.arc(x+10,y,5,0,7); ctx.fill(); ctx.beginPath(); ctx.arc(x+34,y,5,0,7); ctx.fill(); ctx.fillStyle='#8a8a8a'; ctx.fillRect(x+42,y-6,3,3);
  if(lights){ ctx.save(); ctx.globalCompositeOperation='lighter'; const g=ctx.createLinearGradient(x+44,0,x+200,0); g.addColorStop(0,'rgba(255,240,190,0.45)'); g.addColorStop(1,'rgba(255,240,190,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.moveTo(x+44,y-6); ctx.lineTo(x+220,y-30); ctx.lineTo(x+220,y+14); ctx.lineTo(x+44,y-2); ctx.closePath(); ctx.fill(); ctx.restore(); } }
function renderR5Intro(){
  const r=RI5; if(!r){ ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H); return; }
  const t=r.t; ctx.save(); if(shake>0) ctx.translate(Math.round(rnd(-shake,shake)*0.5),Math.round(rnd(-shake,shake)*0.5));
  if(r.scene===0){
    const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#04060e'); g.addColorStop(0.7,'#141a2e'); g.addColorStop(1,'#1e1e28'); ctx.fillStyle=g; ctx.fillRect(-10,-10,W+20,H+20);
    for(const s of r.stars){ ctx.fillStyle=`rgba(255,255,240,${0.3+0.5*s[2]})`; ctx.fillRect(s[0],s[1],1,1); }
    ctx.fillStyle='#10141e'; ctx.beginPath(); ctx.moveTo(0,170); for(let x=0;x<=W;x+=10) ctx.lineTo(x,150-Math.sin((x+t*6)*0.01)*16-Math.sin((x+t*6)*0.031)*6); ctx.lineTo(W,170); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#181c26'; ctx.fillRect(0,170,W,40); ctx.fillStyle='#2a2a30'; ctx.fillRect(0,198,W,30); for(let x=-((t*120)%40);x<W;x+=40) { ctx.fillStyle='#8a8a7a'; ctx.fillRect(x,212,18,2); }
    for(const tr of r.trees){ const x=((tr[0]-t*90)%1400+1400)%1400-200; if(x<-30||x>W+30) continue; ctx.fillStyle='#0c1018'; ctx.fillRect(x,150,3,48*tr[1]); ctx.beginPath(); ctx.ellipse(x+1,160-20*tr[1],9*tr[1],34*tr[1],0,0,7); ctx.fill(); }
    r5Car(150,208,true);
    if(r.env>=0&&r.env<14){ const a=clamp(Math.min(r.env,14-r.env)/0.8,0,1); ctx.globalAlpha=a; ctx.fillStyle='#e0d4b0'; ctx.fillRect(W/2+60,40,120,74); ctx.fillStyle='#c8bc98'; ctx.beginPath(); ctx.moveTo(W/2+60,40); ctx.lineTo(W/2+120,74); ctx.lineTo(W/2+180,40); ctx.closePath(); ctx.fill();
      ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='#5a1a1a'; ctx.fillText('КОМИСИЯ „ИЗВОР“',W/2+68,90); ctx.fillText('СТРОГО СЕКРЕТНО',W/2+68,100); ctx.fillText('с. Александрово, Ловешко',W/2+68,108); ctx.globalAlpha=1; }
  } else if(r.scene===1){
    const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#05070f'); g.addColorStop(1,'#141826'); ctx.fillStyle=g; ctx.fillRect(-10,-10,W+20,H+20);
    for(const s of r.stars){ ctx.fillStyle=`rgba(255,255,240,${0.3+0.5*s[2]})`; ctx.fillRect(s[0],s[1]*0.7,1,1); }
    ctx.fillStyle='#0e1220'; ctx.beginPath(); ctx.moveTo(0,130); for(let x=0;x<=W;x+=12) ctx.lineTo(x,104-Math.sin(x*0.012)*12); ctx.lineTo(W,130); ctx.closePath(); ctx.fill();
    const hum=r.hum>=0?Math.min(1,r.hum/2):0;
    if(hum>0){ ctx.save(); ctx.globalCompositeOperation='lighter'; for(let i=0;i<3;i++){ const k=((r.hum*0.3+i/3)%1); ctx.strokeStyle=`rgba(63,208,160,${(1-k)*0.4*hum})`; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(W-60,108,10+k*260,0,7); ctx.stroke(); } ctx.restore(); ctx.lineWidth=1; }
    const base=200;
    // здравната служба
    ctx.fillStyle='#2a2830'; ctx.fillRect(40,base-56,170,56); ctx.fillStyle='#3a2424'; ctx.beginPath(); ctx.moveTo(32,base-56); ctx.lineTo(125,base-80); ctx.lineTo(218,base-56); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#ffd890'; ctx.fillRect(66,base-40,18,16); ctx.fillStyle='#2a3040'; ctx.fillRect(160,base-40,18,16); ctx.fillStyle='#ffffff'; ctx.fillRect(98,base-52,60,9); ctx.font='600 5px "IBM Plex Mono",monospace'; ctx.fillStyle='#a82a2a'; ctx.fillText('ЗДРАВНА СЛУЖБА',101,base-46);
    ctx.fillStyle='#3a3a3a'; ctx.fillRect(250,base-60,2,60); ctx.fillRect(250,base-60,10,2); ctx.save(); ctx.globalCompositeOperation='lighter'; const lg=ctx.createRadialGradient(258,base-56,2,258,base-56,60); lg.addColorStop(0,'rgba(255,230,160,0.4)'); lg.addColorStop(1,'rgba(255,230,160,0)'); ctx.fillStyle=lg; ctx.fillRect(198,base-116,120,120); ctx.restore();
    ctx.fillStyle='#14161e'; ctx.fillRect(-10,base,W+20,H-base+10);
    r5Car(100,base,false);
    // Румяна с Иван на ръце, Деян
    ctx.fillStyle='#0c0c10'; ctx.fillRect(160,base-26,8,18); ctx.fillRect(161,base-32,6,6); ctx.fillRect(160,base-8,3,8); ctx.fillRect(165,base-8,3,8); ctx.fillStyle='#e8e0f0'; ctx.fillRect(166,base-22,7,5); ctx.fillStyle='#f4d8c0'; ctx.fillRect(170,base-24,3,3);
    ctx.fillStyle='#0c0c10'; ctx.fillRect(180,base-28,9,20); ctx.fillRect(181,base-35,7,7); ctx.fillRect(180,base-8,4,8); ctx.fillRect(185,base-8,4,8);
    if(r.walker>=0){ const wx=W+10-r.walker*14, wy=base; ctx.fillStyle='#d8d0e0'; ctx.fillRect(wx-4,wy-22,8,13); ctx.fillStyle='#e2b48f'; ctx.fillRect(wx-3,wy-28,6,6); ctx.fillRect(wx-10,wy-19,6,2); ctx.fillStyle='#8a8ab0'; ctx.fillRect(wx-3,wy-9,2,9); ctx.fillRect(wx+1,wy-9,2,9); }
  } else {
    const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#3a6ab0'); g.addColorStop(0.6,'#9ac0e0'); g.addColorStop(1,'#f0e4c8'); ctx.fillStyle=g; ctx.fillRect(-10,-10,W+20,H+20);
    ctx.fillStyle='#7a9aa8'; ctx.beginPath(); ctx.moveTo(0,150); for(let x=0;x<=W;x+=12) ctx.lineTo(x,120-Math.sin(x*0.012)*14); ctx.lineTo(W,150); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#4a7a42'; ctx.fillRect(0,150,W,60); ctx.fillStyle='#8a7a5a'; ctx.fillRect(0,196,W,80);
    for(const [x,w] of [[30,70],[130,90],[260,60],[350,100]]){ ctx.fillStyle='#ece4d0'; ctx.fillRect(x,156,w,40); ctx.fillStyle='#a8442a'; ctx.beginPath(); ctx.moveTo(x-6,156); ctx.lineTo(x+w/2,138); ctx.lineTo(x+w+6,156); ctx.closePath(); ctx.fill(); ctx.fillStyle='#ffd890'; ctx.fillRect(x+10,166,10,10); }
    ctx.fillStyle='#ffffff'; ctx.fillRect(140,162,70,10); ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='#a82a2a'; ctx.fillText('ЗДРАВНА СЛУЖБА',143,169);
  }
  ctx.restore();
  const card=(a,b,t0,t1,big)=>{ if(t<t0||t>t1) return; const al=clamp(Math.min(t-t0,t1-t)/0.8,0,1); ctx.globalAlpha=al; centerText(a,232,(big?'700 28px ':'700 15px ')+DFONT(),'#fff4d8'); centerText(b,big?254:248,'600 8px "IBM Plex Mono",monospace',big?ACC():'#e8e0cc'); ctx.globalAlpha=1; };
  card('ПЪТЯТ ЗА АЛЕКСАНДРОВО','13 септември 1983 г. · 23:40 ч. · Ловешко',1.2,7.5);
  card('РЕЗОНАНС 5','И  З  В  О  Р',56,62,true);
  card('АЛЕКСАНДРОВО','14 септември 1983 г. · сутринта',62.5,67);
  ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='rgba(255,244,216,0.55)'; ctx.textAlign='right'; ctx.fillText('Enter / Q — пропусни интрото  ·  Esc — назад',472,9); ctx.textAlign='left';
  drawMsgBox(14);
  r5PostFx();
  if(t<1.4){ ctx.fillStyle=`rgba(0,0,0,${1-t/1.4})`; ctx.fillRect(0,0,W,H); }
  for(const tc of [32,60]) if(t>tc-1.5&&t<tc+1.5){ ctx.fillStyle=`rgba(0,0,0,${1-Math.abs(t-tc)/1.5})`; ctx.fillRect(0,0,W,H); }
  if(t>RI5_END-3.5){ ctx.fillStyle=`rgba(0,0,0,${clamp((t-(RI5_END-3.5))/3,0,1)})`; ctx.fillRect(0,0,W,H); }
}

/* ================= РЕЗОНАНС 5 · ТРЕНИРОВКА ================= */
const TRAIN5={n:0,title:'ГРАЖДАНСКА ЗАЩИТА',cols:200,grav:900,music:{tr:-4,bpm:96},start:4,training:true,exit:196,hero:'r',
 shafts:[[86,3,6,0]],flares:true,sonarZones:[[130,160]],sleepers:[[40,56]],
 hdrS:'ПОДГОТОВКА · ДВОРЪТ НА ЗДРАВНАТА СЛУЖБА', hdrN:'Z — към първата нощ',
 theme:()=>'axvild',sky:SKY5.dawn,
 memory:'(Това е само проба. Истинските страници от дневника са скрити в епизодите на кампанията — по една във всеки.)',
 loadout:{w:['wrench','pistol'],ammo:{pistol:[17,51]},armor:0,cur:'pistol'},
 story:['Седмица преди назначението. Дворът на здравната служба в Александрово, рано сутринта.','Илиева е довела инструктор по „гражданска защита“. Всъщност ще ви учи на съвсем други неща.','(Ако искаш да пропуснеш тренировката, натисни два пъти ENTER.)'],
 end:['Илиева кимва: „Достатъчно. Останалото ще научите сами — за съжаление.“','„И още нещо. Каквото и да видите — детето не бива да остава само през нощта.“'],
 onLoad(){ if(!TRN) TRN={fromMenu:true}; Object.assign(TRN,{hint:null,skip:0}); },
 build(F,C){ LB.frame(F,C,{noCeil:true});
  F(14,14,14,14,'B'); pit5(F,56,58); F(70,13,71,14,'B');
  F(78,2,79,11,'#'); F(80,2,108,3,'#'); F(86,2,88,3,'.'); F(108,4,109,12,'#');
  F(124,13,125,14,'B'); F(140,10,156,12,'#'); F(140,13,156,14,'h'); F(139,10,139,12,'H'); F(166,13,167,14,'B'); },
 deco(){ healthService(1,15*T); axSign(20,7,'1 · ХОРА В ТРАНС'); axSign(62,7,'2 · СИГНАЛНИ РАКЕТИ'); axSign(118,7,'3 · СТЕТОСКОПЪТ'); axSign(170,7,'4 · ДНЕВНИКЪТ'); fence(28,36,15*T); poplar(176*T,15*T,1); },
 spawns:[['target',64,14],['bat',92,8],['bat',98,9],['bat',104,8],['memory',148,14],['health',180,14],['battery',182,14]],
 triggers:[
  {x:3,fn:()=>{ ilv('Добро утро, доктори. Да започнем с основното — после ще ви покажа истинската работа.'); trHint('[←] [→]  движение   ·   [X]  скок   ·   [Z]  стрелба'); }},
  {x:24,fn:()=>{ setCp(24); ilv('Онзи човек е в транс. Не го буди с вик и не го дърпай. Застанете до него и задръжте ↑.'); trHint('[↑]  задръж до човек в транс'); }},
  {x:62,fn:()=>{ setCp(62); ilv('В плевнята са прилепи — като в пещерите, където ще ходите. Не понасят светлина. Ракетата е на E.'); trHint('[E]  сигнална ракета   ·   стойте на светло'); }},
  {x:114,fn:()=>{ setCp(114); ilv('Стетоскопът е настроен на тона. В зоната натиснете E — ще чуете кухите места в стената.'); trHint('[E]  стетоскоп   ·   кухата стена се минава'); }},
  {x:164,fn:()=>{ setCp(164); ilv('Водете дневник. Всяка страница е важна. Вземете тази — пробна е.'); trHint('вземи страницата   ·   [P] / [Esc] пауза   ·   [M] звук'); }},
 ],
 tick(dt){ if(TRN.skip>0) TRN.skip-=dt; },
};
function startR5Training(fromMenu){ TRN={fromMenu}; SURV=false; bossMul=1; ehpMul=1; loadLevel(-1,TRAIN5); state='story'; storyT=0; mInt=0; bossMusic=false; }
