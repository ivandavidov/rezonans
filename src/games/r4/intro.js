/* ================= РЕЗОНАНС 4 · ИНТРО: ПАНОРАМАТА ================= */
let RI4=null;
const RI4_END=80;
const ganN=t=>showMsg(t,0,'Д-Р ГАНЧЕВА');
const RI4_EV=[
 [5,()=>ganN('Петнайсет години съм уредничка на Панорамата. Нощем тук е толкова тихо, че чуваш как съхне боята.')],
 [13,()=>{ RI4.pulse=0; shake=6; ganN('Тази нощ часовникът над входа спря в 3:47. А платното… започна да диша.'); if(AC){ osc({type:'sine',f:523,t:3,v:0.05}); osc({type:'sine',f:659,t:3,v:0.04,when:0.4}); osc({type:'sine',f:784,t:3,v:0.03,when:0.8}); } }],
 [22,()=>ganN('Фигурите на платното се движат. Само когато не ги гледам.')],
 [30,()=>{ RI4.folder=0; ganN('В архива пазим папка от 1977 г. с печат на „Камертон-2“. Вътре има само един телефонен номер.'); }],
 [38,()=>{ RI4.ring=1; showMsg('Набираш…',2.2,'ТЕЛЕФОН'); }],
 [42,()=>{ RI4.ring=0; showMsg('…',2,'ТЕЛЕФОН'); }],
 [45.5,()=>showMsg('„Идвам.“',2.5,'ГЛАС')],
 [58,()=>showMsg('Призори пред Панорамата от мъглата излиза фигура. Не се вижда откъде е дошла — от гарата или от другаде.',6)],
 [66,()=>ganN('Ти ли си синът му?')],
 [71,()=>showMsg('Каквото е останало от него — да.',4,'ТИ')],
];
function startR4Intro(fromMenu){
  const fig=[]; for(let i=0;i<70;i++) fig.push([Math.random()*1200,0.5+Math.random()*0.5,Math.random()*6]);
  const smoke=[]; for(let i=0;i<24;i++) smoke.push([Math.random()*1200,40+Math.random()*60,14+Math.random()*24]);
  const fog=[]; for(let i=0;i<40;i++) fog.push([Math.random()*W,150+Math.random()*90,30+Math.random()*60,Math.random()]);
  RI4={t:0,ev:0,fromMenu,fig,smoke,fog,pulse:-1,ring:0,folder:-1};
  msg=null; particles=[]; shake=0; state='gintro'; mInt=0; bossMusic=false; setMusic({tr:-9,bpm:66,alien:false});
}
function finishR4Intro(){ const fm=RI4&&RI4.fromMenu; RI4=null; msg=null; if(fm) toMenu(0); else startR4Training(false); }
function updR4Intro(dt){
  const r=RI4; if(!r) return;
  if(pressed.esc){ const fm=r.fromMenu; RI4=null; msg=null; toMenu(fm?0:2); return; }
  if(pressed.enter||pressed.pause||pressed.swap){ finishR4Intro(); return; }
  r.t+=dt; const t=r.t; shake=Math.max(0,shake-dt*6);
  while(r.ev<RI4_EV.length&&RI4_EV[r.ev][0]<=t){ RI4_EV[r.ev][1](); r.ev++; }
  if(msg){ msg.age+=dt; if(msg.age>msg.d) msg=null; }
  if(r.pulse>=0) r.pulse+=dt; if(r.folder>=0) r.folder+=dt;
  if(r.ring&&AC&&Math.floor(t*3)!==Math.floor((t-dt)*3)&&Math.floor(t*3)%3<2) osc({type:'sine',f:440,t:0.25,v:0.06});
  for(const f of r.fog){ f[0]+=(6+f[3]*10)*dt; if(f[0]>W+60) f[0]=-60; }
  if(t>=RI4_END) finishR4Intro();
}
function renderR4Intro(){
  const r=RI4; if(!r){ ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H); return; }
  const t=r.t; ctx.save(); if(shake>0) ctx.translate(Math.round(rnd(-shake,shake)*0.4),Math.round(rnd(-shake,shake)*0.4));
  if(t<52){
    // вътре в ротондата: кръговото платно
    ctx.fillStyle='#0a080a'; ctx.fillRect(-10,-10,W+20,H+20);
    const top=34, bot=176, rot=t*6, breath=r.pulse>=0?Math.sin(r.pulse*1.3)*2:0;
    const g=ctx.createLinearGradient(0,top,0,bot); g.addColorStop(0,'#3a3022'); g.addColorStop(0.45,'#6a5634'); g.addColorStop(0.75,'#5a4426'); g.addColorStop(1,'#2a2014'); ctx.fillStyle=g; ctx.fillRect(0,top,W,bot-top);
    ctx.fillStyle='#4a3a26'; ctx.beginPath(); ctx.moveTo(0,bot); for(let x=0;x<=W;x+=8){ const wx=x+rot; ctx.lineTo(x,128+Math.sin(wx*0.012)*14+Math.sin(wx*0.031)*6+breath); } ctx.lineTo(W,bot); ctx.closePath(); ctx.fill();
    for(const s of r.smoke){ const sx=((s[0]-rot*1.0)%1200+1200)%1200-360; if(sx<-60||sx>W+60) continue; ctx.fillStyle='rgba(210,196,170,0.22)'; ctx.beginPath(); ctx.arc(sx,s[1]+breath,s[2],0,7); ctx.fill(); }
    const mv=r.pulse>=0?Math.min(1,r.pulse/6):0;
    for(const f of r.fig){ const fx=((f[0]-rot)%1200+1200)%1200-360; if(fx<-10||fx>W+10) continue; const fy=134+Math.sin((f[0]+rot)*0.012)*12, h=10*f[1]+2, sh=Math.sin(t*1.5+f[2])*1.5*mv;
      ctx.fillStyle=`rgba(40,30,20,${0.6+0.3*f[1]})`; ctx.fillRect(fx-1+sh,fy-h,3,h); ctx.fillRect(fx-1+sh,fy-h-3,3,3); }
    ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.fillRect(0,top,W,6); ctx.fillRect(0,bot-6,W,6);
    // площадката и Ганчева
    ctx.fillStyle='#14100c'; ctx.fillRect(0,bot,W,H-bot); ctx.fillStyle='#2a221a'; ctx.fillRect(0,bot,W,3); for(let x=12;x<W;x+=26) ctx.fillRect(x,bot-18,2,18); ctx.fillRect(0,bot-18,W,2);
    const gx=W/2-40, gy=bot; ctx.fillStyle='#0c0a08'; ctx.fillRect(gx-4,gy-30,9,22); ctx.fillRect(gx-3,gy-37,7,7); ctx.fillRect(gx-4,gy-8,4,8); ctx.fillRect(gx+1,gy-8,4,8);
    ctx.save(); ctx.globalCompositeOperation='lighter'; const lg=ctx.createLinearGradient(gx,gy-24,gx+150,gy-60); lg.addColorStop(0,'rgba(255,236,190,0.35)'); lg.addColorStop(1,'rgba(255,236,190,0)'); ctx.fillStyle=lg; ctx.beginPath(); ctx.moveTo(gx+5,gy-24); ctx.lineTo(gx+170,gy-90); ctx.lineTo(gx+170,gy-20); ctx.closePath(); ctx.fill(); ctx.restore();
    // часовникът
    const cx=W-56, cy=20; ctx.fillStyle='#e8e0c8'; ctx.beginPath(); ctx.arc(cx,cy,11,0,7); ctx.fill(); ctx.strokeStyle='#2a2216'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(cx,cy); const stop=t>13; const ma=stop?(47/60)*6.283:t*0.8, ha=stop?(3.78/12)*6.283:t*0.1; ctx.lineTo(cx+Math.sin(ma)*8,cy-Math.cos(ma)*8); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.sin(ha)*5,cy-Math.cos(ha)*5); ctx.stroke(); ctx.lineWidth=1;
    if(r.pulse>=0&&r.pulse<5){ ctx.save(); ctx.globalCompositeOperation='lighter'; for(let i=0;i<3;i++){ const k=clamp(r.pulse/3-i*0.2,0,1); if(k<=0) continue; ctx.strokeStyle=`rgba(${FQ_RGB[i]},${(1-k)*0.7})`; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(W/2,110,10+k*300,0,7); ctx.stroke(); } ctx.restore(); ctx.lineWidth=1; }
    if(r.folder>=0&&r.folder<8){ const a=clamp(Math.min(r.folder,8-r.folder)/0.8,0,1); ctx.globalAlpha=a; ctx.fillStyle='#c8b48a'; ctx.fillRect(W/2+70,58,96,64); ctx.fillStyle='#a89468'; ctx.fillRect(W/2+70,58,96,8); ctx.fillStyle='#7a1a1a'; ctx.beginPath(); ctx.arc(W/2+142,100,10,0,7); ctx.fill();
      ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='#3a2a1a'; ctx.fillText('„КАМЕРТОН-2“ · 1977',W/2+76,78); ctx.fillText('СТРОГО СЕКРЕТНО',W/2+76,88); ctx.fillText('тел. ……',W/2+76,112); ctx.globalAlpha=1; }
    if(r.ring&&Math.floor(t*6)%2){ ctx.fillStyle='#ffe6a0'; ctx.fillRect(gx+6,gy-32,3,4); }
  } else {
    // призори пред ротондата
    const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#2a2440'); g.addColorStop(0.5,'#8a6a7a'); g.addColorStop(0.8,'#e0a070'); g.addColorStop(1,'#f0c890'); ctx.fillStyle=g; ctx.fillRect(-10,-10,W+20,H+20);
    const base=200, cx=W/2+40; ctx.fillStyle='#2a2430'; ctx.fillRect(cx-90,base-70,180,70); ctx.fillRect(cx-96,base-76,192,6); ctx.beginPath(); ctx.ellipse(cx,base-76,86,34,0,Math.PI,0); ctx.fill(); ctx.fillRect(cx-5,base-116,10,7); for(let i=0;i<9;i++){ ctx.fillStyle='#3a3440'; ctx.fillRect(cx-82+i*20,base-62,6,56); }
    ctx.fillStyle='#ffd890'; ctx.fillRect(cx-10,base-30,20,30);
    ctx.fillStyle='#1a1620'; ctx.fillRect(-10,base,W+20,H-base+10); for(const x of [40,90,380,430]){ ctx.fillStyle='#1e1a22'; ctx.beginPath(); ctx.arc(x,base-36,22,0,7); ctx.fill(); ctx.fillRect(x-2,base-20,4,20); }
    const gx2=cx-30; ctx.fillStyle='#0e0c12'; ctx.fillRect(gx2-4,base-30,9,22); ctx.fillRect(gx2-3,base-37,7,7); ctx.fillRect(gx2-4,base-8,4,8); ctx.fillRect(gx2+1,base-8,4,8);
    const fp=clamp((t-58)/12,0,1), fx=W+20-fp*(W+20-(cx+40)), fa=clamp((t-58)/3,0,1)*0.95, step=Math.sin(t*6)*(fp<1?2:0);
    ctx.globalAlpha=fa; ctx.fillStyle='#08070a'; ctx.fillRect(fx-5,base-32,11,24); ctx.fillRect(fx-4,base-40,9,8); ctx.fillRect(fx-5,base-8,4+step,8); ctx.fillRect(fx+1,base-8,4-step,8); ctx.fillStyle='#b48cff'; ctx.fillRect(fx-2,base-37,5,2); ctx.globalAlpha=1;
    for(const f of r.fog){ ctx.fillStyle=`rgba(240,226,220,${0.12+f[3]*0.12})`; ctx.beginPath(); ctx.ellipse(f[0],f[1],f[2],f[2]*0.3,0,0,7); ctx.fill(); }
  }
  ctx.restore();
  const card=(a,b,t0,t1,big)=>{ if(t<t0||t>t1) return; const al=clamp(Math.min(t-t0,t1-t)/0.8,0,1); ctx.globalAlpha=al; centerText(a,232,(big?'700 28px ':'700 15px ')+DFONT(),'#f4f0fa'); centerText(b,big?254:248,'600 8px "IBM Plex Mono",monospace',big?ACC():'#e4d4ff'); ctx.globalAlpha=1; };
  card('ПЛЕВЕН','13 срещу 14 юни 2027 г. · 03:41 ч. · Панорамата „Плевенска епопея 1877“',1.2,7.5);
  card('РЕЗОНАНС 4','О  Т  В  Ъ  Д',49,56,true);
  card('ПЛЕВЕН','14 юни 2027 г. · 05:52 ч.',53.5,58);
  ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='rgba(240,230,250,0.55)'; ctx.textAlign='right'; ctx.fillText('Enter / Q — пропусни интрото  ·  Esc — назад',472,9); ctx.textAlign='left';
  drawMsgBox(14);
  r4PostFx();
  if(t<1.4){ ctx.fillStyle=`rgba(0,0,0,${1-t/1.4})`; ctx.fillRect(0,0,W,H); }
  if(t>50.5&&t<53.5){ ctx.fillStyle=`rgba(0,0,0,${1-Math.abs(t-52)/1.5})`; ctx.fillRect(0,0,W,H); }
  if(t>RI4_END-3.5){ ctx.fillStyle=`rgba(0,0,0,${clamp((t-(RI4_END-3.5))/3,0,1)})`; ctx.fillRect(0,0,W,H); }
}

/* ================= РЕЗОНАНС 4 · ТРЕНИРОВКА ================= */
const TRAIN4={n:0,title:'ЛЕТНИЯТ ТЕАТЪР',cols:200,grav:900,music:{tr:-6,bpm:96},start:4,training:true,exit:196,freq:true,stillZones:[[24,52]],sonarZones:[[60,96]],
 hdrS:'ПОДГОТОВКА · ПРЕДИ ПЛОЩАДА', hdrN:'Z — към центъра на града',
 theme:()=>'plcave',
 memory:'(Това е само проба. Истинските спомени на баща ти са скрити в епизодите на кампанията — по един във всеки.)',
 loadout:{w:['wrench','pistol'],ammo:{pistol:[17,51]},armor:0,cur:'pistol'},
 story:['Ганчева те води под сцената на Летния театър в Кайлъка. Тук, в старите гримьорни, „Камертон“ е изпитвал прототипите си.','Тя е свързала макетите на модулите от архива към костюма ти. Час упражнения, преди да тръгнеш към града.','(Ако искаш да пропуснеш тренировката, натисни два пъти ENTER.)'],
 end:['Ганчева кимва: „Баща ти щеше да се гордее.“ После се поправя: „Щеше да се притеснява. Но и да се гордее.“','Навън мъглата още не се е вдигнала. До площада има десет минути пеша.'],
 onLoad(){ if(!TRN) TRN={fromMenu:true}; Object.assign(TRN,{hint:null,skip:0}); },
 build(F,C){ LB.frame(F,C);
  F(14,14,14,14,'B'); F(30,13,31,14,'B'); F(40,13,41,14,'B');
  F(66,12,72,14,'#'); F(65,12,65,14,'H'); F(80,13,81,14,'B');
  F(108,2,108,14,'2'); pit(F,116,124); F(116,15,124,15,'3'); F(130,2,130,14,'3');
  F(138,12,142,12,'1'); F(146,10,150,10,'2'); F(154,12,158,12,'3'); pit(F,138,158); F(164,2,164,14,'1'); },
 deco(){ plSign(3,4,'ЛЕТЕН ТЕАТЪР · ПОД СЦЕНАТА'); plSign(22,4,'1 · ЗАСТИНАЛО ВРЕМЕ'); plSign(58,4,'2 · СОНАР'); plSign(102,4,'3 · ТОНОВЕ'); plSign(170,4,'4 · СПОМЕНИ'); consoleAt(6*T,15*T,2); consoleAt(184*T,15*T,3); wineBarrels(88,15*T,2); },
 spawns:[['turret',50,14],['target',74,11],['target',86,14],['target',94,14],['memory',176,14],['health',178,14],['battery',180,14]],
 triggers:[
  {x:3,fn:()=>{ gan('Добре дошъл в гримьорните. Тук баща ти е изпитвал модулите. Основното го знаеш — да видим новото.'); trHint('[←] [→]  движение   ·   [X]  скок   ·   [Z]  стрелба'); }},
  {x:18,fn:()=>{ setCp(18); gan('Зоната пред теб е застинала. Куршумите на онази турела се движат само когато се движиш ти. Спреш ли — спират и те.'); trHint('спри, огледай се   ·   мини между куршумите'); }},
  {x:56,fn:()=>{ setCp(56); gan('Сонарът. Натисни E — импулсът показва стените в тъмното. Но и враговете го чуват.'); trHint('[E]  сонарен импулс'); }},
  {x:98,fn:()=>{ setCp(98); gan('Тоновете: ДО, МИ, СОЛ. Цветните стени и мостове са твърди само в твоя тон. E сменя тона — дори във въздуха.'); trHint('[E]  смени тона   ·   стената в твоя цвят е твърда'); }},
  {x:134,fn:()=>{ setCp(134); trHint('скачай и сменяй тона във въздуха'); }},
  {x:168,fn:()=>{ setCp(168); gan('Спомени. Във всеки епизод е скрит по един — снимка, бележка, глас. Събери ги всичките. Ще разбереш защо.'); trHint('събери спомена   ·   [P] / [Esc] пауза   ·   [M] звук'); }},
 ],
 tick(dt){ if(TRN.skip>0) TRN.skip-=dt; },
};
function startR4Training(fromMenu){ TRN={fromMenu}; SURV=false; bossMul=1; ehpMul=1; loadLevel(-1,TRAIN4); state='story'; storyT=0; mInt=0; bossMusic=false; }
