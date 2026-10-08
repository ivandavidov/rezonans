/* ================= РЕЗОНАНС 3 · ИНТРО: БЛЕКАУТ ================= */
let RI3=null;
const RI3_END=78;
const news=t=>{ showMsg(t,0,'РАДИО'); };
const RI3_EV=[
 [4,()=>news('Новини в два часа. Сеизмолозите регистрират поредица от слаби трусове под Витоша. Няма данни за пострадали.')],
 [12,()=>news('…Електроразпределителното дружество съобщава за смущения в мрежата в южните квартали. Молим гражданите да не…')],
 [18,()=>{ RI3.pulse=0; shake=10; if(AC){ nz({t:2.2,v:0.35,type:'lowpass',f:160,f2:40}); osc({type:'sine',f:48,f2:30,t:2,v:0.25}); } }],
 [21,()=>news('…[шум]…')],
 [31,()=>{ RI3.ring=1; showMsg('Непознат номер.',2.2,'ТЕЛЕФОН'); }],
 [34,()=>{ RI3.ring=0; radio('Не затваряй. Знам, че обещах да не те търся повече.'); }],
 [41,()=>radio('Това не е авария. Под Витоша има трети резонатор — по-голям от двата, които затворихме.')],
 [49,()=>radio('Ще ти обясня всичко, но не по телефона. Слез в метрото. Чакам те на „Сердика“.')],
 [57,()=>{ showMsg('Отваряш гардероба. Старият костюм те чака, сякаш никога не си го свалял.',5.5); RI3.heli=0; }],
 [66,()=>radio('И още нещо… Внимавай на кого вярваш. Дори на мен.')],
];
function startR3Intro(fromMenu){
  const bld=[]; let x=-10; while(x<W+20){ const w=22+Math.floor(Math.random()*40), h=36+Math.floor(Math.random()*80); const win=[]; for(let yy=8;yy<h-6;yy+=8) for(let xx=4;xx<w-5;xx+=7) win.push([xx,yy,Math.random()<0.55]); bld.push({x,w,h,win,off:18+(W+40-x)/70,shade:Math.random()}); x+=w+2+Math.floor(Math.random()*6); }
  const snow=[]; for(let i=0;i<120;i++) snow.push([Math.random()*W,Math.random()*H,Math.random()]);
  RI3={t:0,ev:0,fromMenu,bld,snow,pulse:-1,ring:0,heli:-1};
  msg=null; particles=[]; shake=0; state='gintro'; mInt=0; bossMusic=false; setMusic({tr:-9,bpm:70,alien:false});
}
function finishR3Intro(){ const fm=RI3&&RI3.fromMenu; RI3=null; msg=null; if(fm) toMenu(0); else startR3Training(false); }
function updR3Intro(dt){
  const r=RI3; if(!r) return;
  if(pressed.esc){ const fm=r.fromMenu; RI3=null; msg=null; toMenu(fm?0:2); return; }
  if(pressed.enter||pressed.pause||pressed.swap){ finishR3Intro(); return; }
  r.t+=dt; const t=r.t; shake=Math.max(0,shake-dt*6);
  while(r.ev<RI3_EV.length&&RI3_EV[r.ev][0]<=t){ RI3_EV[r.ev][1](); r.ev++; }
  if(msg){ msg.age+=dt; if(msg.age>msg.d) msg=null; }
  if(r.pulse>=0) r.pulse+=dt; if(r.heli>=0) r.heli+=dt;
  if(r.ring&&AC&&Math.floor(t*4)!==Math.floor((t-dt)*4)&&Math.floor(t*4)%4<2) osc({type:'sine',f:1100,t:0.12,v:0.07});
  for(const s of r.snow){ s[1]+=(16+s[2]*24)*dt; s[0]+=Math.sin(t*0.6+s[2]*9)*dt*6; if(s[1]>H){ s[1]=-2; s[0]=Math.random()*W; } }
  if(t>=RI3_END) finishR3Intro();
}
function renderR3Intro(){
  const r=RI3; if(!r){ ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H); return; }
  const t=r.t, wx=64, wy=22, ww=352, wh=176, base=wy+wh;
  ctx.save(); if(shake>0) ctx.translate(Math.round(rnd(-shake,shake)*0.4),Math.round(rnd(-shake,shake)*0.4));
  ctx.fillStyle='#0a080c'; ctx.fillRect(-10,-10,W+20,H+20);
  ctx.save(); ctx.beginPath(); ctx.rect(wx,wy,ww,wh); ctx.clip();
  const g=ctx.createLinearGradient(0,wy,0,base); g.addColorStop(0,'#05060e'); g.addColorStop(0.7,'#151a2c'); g.addColorStop(1,'#2e2638'); ctx.fillStyle=g; ctx.fillRect(wx,wy,ww,wh);
  // Vitosha + Kopitoto antenna
  ctx.fillStyle='#161826'; ctx.beginPath(); ctx.moveTo(wx+140,base-40); ctx.lineTo(wx+240,wy+44); ctx.lineTo(wx+290,wy+58); ctx.lineTo(wx+360,base-50); ctx.lineTo(wx+360,base); ctx.lineTo(wx+140,base); ctx.closePath(); ctx.fill();
  ctx.fillStyle='rgba(200,210,225,0.5)'; ctx.beginPath(); ctx.moveTo(wx+222,wy+56); ctx.lineTo(wx+240,wy+44); ctx.lineTo(wx+262,wy+52); ctx.lineTo(wx+246,wy+58); ctx.closePath(); ctx.fill();
  const ax=wx+246, ay=wy+48; ctx.fillStyle='#2a2a34'; ctx.fillRect(ax,ay-16,2,16); if(Math.floor(t*1.5)%2||t>18){ ctx.fillStyle=t>18?'#ff3b4f':'#ff6a5a'; ctx.fillRect(ax-1,ay-18,4,3); }
  // pulse
  if(r.pulse>=0&&r.pulse<6){ ctx.save(); ctx.globalCompositeOperation='lighter'; for(let i=0;i<3;i++){ const k=clamp(r.pulse/3-i*0.18,0,1); if(k<=0) continue; ctx.strokeStyle=`rgba(255,59,79,${(1-k)*0.8})`; ctx.lineWidth=3-i; ctx.beginPath(); ctx.arc(ax,ay,10+k*420,0,7); ctx.stroke(); } ctx.restore(); ctx.lineWidth=1;
    const fl=Math.max(0,1-r.pulse/1.2); if(fl>0){ ctx.fillStyle=`rgba(255,80,100,${fl*0.35})`; ctx.fillRect(wx,wy,ww,wh); } }
  // landmarks: Alexander Nevsky domes + NDK
  ctx.fillStyle='#0c0d16'; ctx.beginPath(); ctx.arc(wx+52,base-58,14,Math.PI,0); ctx.fill(); ctx.fillRect(wx+36,base-58,32,58); ctx.beginPath(); ctx.arc(wx+52,base-74,6,Math.PI,0); ctx.fill(); ctx.fillRect(wx+51,base-86,2,10);
  ctx.fillStyle='#0d0e18'; ctx.beginPath(); ctx.moveTo(wx+150,base); ctx.lineTo(wx+164,base-34); ctx.lineTo(wx+214,base-34); ctx.lineTo(wx+228,base); ctx.closePath(); ctx.fill();
  // blocks with windows
  for(const b of r.bld){ const bx=b.x, by=base-b.h; ctx.fillStyle=b.shade>0.5?'#0e0f19':'#11121c'; ctx.fillRect(bx,by,b.w,b.h); const off=t>b.off;
    for(const [xx,yy,lit] of b.win){ if(lit&&!off) { ctx.fillStyle='rgba(255,214,140,0.85)'; ctx.fillRect(bx+xx,by+yy,3,3); } else if(lit&&off&&t-b.off<0.15){ ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.fillRect(bx+xx,by+yy,3,3); } } }
  for(let i=0;i<14;i++){ const lx2=wx+10+i*26; const off=t>18+(W+40-lx2)/70; if(!off){ ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.fillStyle='rgba(255,200,120,0.35)'; ctx.beginPath(); ctx.arc(lx2,base-6,5,0,7); ctx.fill(); ctx.restore(); } }
  // helicopter searchlights
  if(r.heli>=0){ ctx.save(); ctx.globalCompositeOperation='lighter'; for(let k=0;k<2;k++){ const hx=wx+60+((r.heli*30+k*160)%(ww+120))-60, hy=wy+20+k*14, a=1.4+Math.sin(r.heli*0.8+k*2)*0.35; const g2=ctx.createLinearGradient(hx,hy,hx+Math.cos(a)*160,hy+Math.sin(a)*160); g2.addColorStop(0,'rgba(220,235,255,0.35)'); g2.addColorStop(1,'rgba(220,235,255,0)'); ctx.fillStyle=g2; ctx.beginPath(); ctx.moveTo(hx,hy); ctx.lineTo(hx+Math.cos(a-0.12)*170,hy+Math.sin(a-0.12)*170); ctx.lineTo(hx+Math.cos(a+0.12)*170,hy+Math.sin(a+0.12)*170); ctx.closePath(); ctx.fill(); ctx.fillStyle=Math.floor(titleT*3+k)%2?'#ff3b4f':'#ffffff'; ctx.fillRect(hx-1,hy-1,3,2); } ctx.restore(); }
  for(const s of r.snow){ ctx.fillStyle=`rgba(240,246,255,${0.4+s[2]*0.5})`; ctx.fillRect(Math.round(s[0]),Math.round(s[1]),s[2]>0.7?2:1,s[2]>0.7?2:1); }
  ctx.restore();
  // window frame, sill, room
  ctx.fillStyle='#1c171e'; ctx.fillRect(wx-8,wy-8,ww+16,8); ctx.fillRect(wx-8,base,ww+16,10); ctx.fillRect(wx-8,wy,8,wh); ctx.fillRect(wx+ww,wy,8,wh); ctx.fillRect(wx+ww/2-3,wy,6,wh); ctx.fillRect(wx,wy+wh*0.42,ww,5);
  ctx.fillStyle='#2a222a'; ctx.fillRect(wx-14,base+10,ww+28,6);
  ctx.fillStyle='#120e12'; ctx.fillRect(330,base+16,90,H-base-16); ctx.fillStyle='#1a151a'; ctx.fillRect(326,base+16,98,4);
  const ph=r.ring&&Math.floor(t*8)%2; ctx.fillStyle=ph?'#ffeec0':'#2a2a2e'; ctx.fillRect(390,base+8,16,8); if(ph){ ctx.save(); ctx.globalCompositeOperation='lighter'; const g3=ctx.createRadialGradient(398,base+12,1,398,base+12,30); g3.addColorStop(0,'rgba(255,230,180,0.5)'); g3.addColorStop(1,'rgba(255,230,180,0)'); ctx.fillStyle=g3; ctx.fillRect(368,base-18,60,60); ctx.restore(); }
  ctx.restore();
  const card=(a,b,t0,t1)=>{ if(t<t0||t>t1) return; const al=clamp(Math.min(t-t0,t1-t)/0.8,0,1); ctx.globalAlpha=al; centerText(a,232,'700 15px '+DFONT(),'#f4f4f6'); centerText(b,248,'600 8px "IBM Plex Mono",monospace','#e8c8cc'); ctx.globalAlpha=1; };
  card('СОФИЯ','23 декември · 02:14 ч. · три години след „Отзвук“',1.2,7.5);
  if(t>23&&t<29.5){ ctx.globalAlpha=clamp(Math.min(t-23,29.5-t)/0.8,0,1); centerText('РЕЗОНАНС 3',236,'700 28px '+DFONT(),'#f4f4f6'); centerText('Е  П  И  Ц  Е  Н  Т  Ъ  Р',254,'600 9px "IBM Plex Mono",monospace',ACC()); ctx.globalAlpha=1; }
  ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='rgba(240,220,224,0.55)'; ctx.textAlign='right'; ctx.fillText('Enter / Q — пропусни интрото  ·  Esc — назад',472,9); ctx.textAlign='left';
  drawMsgBox(14);
  r3PostFx();
  if(t<1.4){ ctx.fillStyle=`rgba(0,0,0,${1-t/1.4})`; ctx.fillRect(0,0,W,H); }
  if(t>RI3_END-3.5){ ctx.fillStyle=`rgba(0,0,0,${clamp((t-(RI3_END-3.5))/3,0,1)})`; ctx.fillRect(0,0,W,H); }
}

/* ================= РЕЗОНАНС 3 · ТРЕНИРОВКА ================= */
const sarg=t=>{ showMsg(t,0,'СЕРЖАНТ НИКОЛОВА'); SFX.radio&&AC&&SFX.radio(0.5,sfxBus); };
const TRAIN3={n:0,title:'ПОЛИГОНЪТ',cols:200,grav:900,music:{tr:-6,bpm:100},start:4,training:true,exit:196,alarmFoe:'target',
 hdrS:'ПОДГОТОВКА · ПРЕДИ „СЕРДИКА“', hdrN:'Z — към града',
 theme:()=>'base',
 loadout:{w:['wrench','pistol'],ammo:{pistol:[17,51]},armor:0,cur:'pistol'},
 story:['Илиева ти е уредила достъп до полигона на специалните части в Горубляне. До сутринта остава час.','Сержант Николова ще ти покаже новите модули на костюма.','(Ако искаш да пропуснеш тренировката, натисни два пъти ENTER.)'],
 end:['Николова кимва: „Става. Дано не ти потрябва.“','Навън още вали сняг. До „Сердика“ има двайсет минути пеша — ако улиците още съществуват.'],
 lights:[{x:32,y:2,a0:1.05,a1:2.09,spd:0.9,len:13},{x:48,y:2,a0:1.0,a1:2.14,spd:1.1,len:13,cam:1}],
 terms:[{x:78,y:15,time:4,label:'ВРАТА',fn:()=>{ setDoor([86,2,14],'.'); SFX.door(); sarg('Добре. Терминалите в „Камертон“ ще са по-бавни — и ще те търсят.'); trHint('продължи напред'); }}],
 plates:[{x:100,y:15,door:[110,2,14]}],
 shifters:[rhythmA([[130,11,132,11],[138,11,140,11],[146,11,148,11]],100,0),rhythmA([[134,11,136,11],[142,11,144,11]],100,0.5)],
 onAlarm(){ const p=player; sarg('Засечен си. Обратно в сянката — и опитай пак.'); p.x=24*T+3; p.y=groundY(24)-p.h; p.vx=p.vy=0; ALARM=0; for(const l of LIGHTS) l.seen=0; },
 onLoad(){ if(!TRN) TRN={fromMenu:true}; Object.assign(TRN,{hint:null,skip:0}); },
 build(F,C){ LB.frame(F,C);
  F(14,14,14,14,'B'); F(17,13,18,14,'#');
  F(28,13,29,14,'B'); F(38,13,39,14,'B'); F(44,13,45,14,'B'); F(54,13,55,14,'B');
  F(86,2,86,14,'D'); F(110,2,110,14,'D');
  F(120,13,121,14,'#'); F(122,11,127,14,'#'); F(127,11,127,14,'H'); F(122,11,126,14,'#'); F(151,11,160,14,'#'); },
 deco(){ drawSign(3,4,'ПОЛИГОН „ГОРУБЛЯНЕ“','#ffffff','#7a1a26'); drawSign(24,4,'1 · СТЕЛТ'); drawSign(64,4,'2 · ТЕРМИНАЛИ'); drawSign(92,4,'3 · ЕХО'); drawSign(122,4,'4 · РИТЪМ'); drawSign(170,5,'ИЗХОД →',undefined,'#7a1a26'); consoleAt(6*T,15*T,2); consoleAt(184*T,15*T,3); },
 spawns:[['health',176,14],['battery',178,14]],
 triggers:[
  {x:3,fn:()=>{ sarg('Николова. Илиева каза, че си бил в „Вихрен“ и на „Калиакра“. Значи основното го знаеш. Да видим новото.'); trHint('[←] [→]  движение   ·   [X]  скок   ·   [Z]  стрелба'); }},
  {x:22,fn:()=>{ setCp(22); sarg('Прожектор и камера. Ако лъчът те хване, вдигат тревога. Крий се зад сандъците и минавай, когато светлината се отмести.'); trHint('избягвай светлината   ·   [C] клякане зад прикритие'); }},
  {x:62,fn:()=>{ setCp(62); sarg('Терминал. Застани до него и задръж ↑. Докато разбиваш, ще изскачат мишени — свали ги.'); trHint('застани до терминала   ·   задръж [↑]'); }},
  {x:90,fn:()=>{ setCp(90); sarg('Ехо-модулът. Натисни E — костюмът записва движенията ти. Натисни пак — ехото ги повтаря. Остави го на плочата.'); trHint('[E] запис   ·   [E] повтори   ·   [E] изчисти'); }},
  {x:112,fn:()=>{ setCp(112); trHint('ехото пази плочата, докато ти минаваш'); }},
  {x:116,fn:()=>{ sarg('Мостовете пулсират в такт с музиката. Скачай, когато се появят. Ако паднеш — стълбата е отляво.'); trHint('слушай ритъма   ·   скачай, когато мостът се появи'); }},
  {x:162,fn:()=>{ setCp(162); sarg('Това е всичко. Пауза — с P или Esc, звук — с M. Успех там долу.'); trHint('[P] / [Esc] пауза   ·   [M] звук'); }},
 ],
 tick(dt){ if(TRN.skip>0) TRN.skip-=dt; },
};
function startR3Training(fromMenu){ TRN={fromMenu}; SURV=false; bossMul=1; ehpMul=1; loadLevel(-1,TRAIN3); state='story'; storyT=0; mInt=0; bossMusic=false; }
