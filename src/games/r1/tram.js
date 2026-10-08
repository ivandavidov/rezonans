/* ================= РЕЗОНАНС 1 · ИНТРО: ВЛАКЧЕТО ДО СЕКТОР 7 ================= */
let TR=null;
const TR_FLOOR=200, CAR_L=60, CAR_R=420;
const pa=t=>{ showMsg(t,0,'ВИСОКОГОВОРИТЕЛ'); if(AC){ osc({type:'sine',f:784,t:0.6,v:0.14}); osc({type:'sine',f:622,t:0.8,v:0.14,when:0.32}); } };
const TR_EVENTS=[
  [3,()=>pa('Добро утро и добре дошли в изследователския комплекс „Вихрен“. Влакът пътува до Сектор 7.')],
  [11,()=>pa('Минаваме през Голямата пещера. Подземната ВЕЦ тук захранва целия комплекс.')],
  [18.5,()=>pa('Температурата в комплекса е 18 градуса. Напомняме ви, че в лабораториите не се внасят храна и напитки.')],
  [27.8,()=>pa('Пред вас е кръговият ускорител на „Вихрен“ — гордостта на нашия научен екип. Моля, не докосвайте стъклата.')],
  [40.5,()=>pa('Следва проверка за сигурност. Моля, не мърдайте по време на сканирането.')],
  [45.6,()=>pa('Сканирането приключи. Приятен работен ден!')],
  [48,()=>pa('Хидропонната оранжерия снабдява столовата със свежи зеленчуци. Днес в менюто: таратор и мусака.')],
  [54.5,()=>radio('Добро утро, обажда се д-р Илиева. Днес е големият ден — за първи път пускаме резонатора на пълна мощност.')],
  [62,()=>radio('Задачата ти е проста: облечи защитния костюм и вкарай кристалната проба в лъча. Аз ще следя всичко от контролната зала.')],
  [69,()=>pa('Внимание! В шахта Б-2 започва изпитание на ракетен двигател. Не гледайте директно към пламъка.')],
  [76,()=>pa('Хранилище за аномални образци. Достъп само с пропуск от ниво 4.')],
  [81.5,()=>{ radio('Видя ли образеца в третия резервоар? Казаха ми, че вчера е мърдал. Сигурно им се е сторило заради осветлението.'); sfxAt('crabIdle',{x:240,y:120,w:0}); }],
  [88,()=>pa('Наближаваме Сектор 7. Моля, изчакайте влакът да спре напълно.')],
  [97,()=>{ SFX.door(); }],
  [98,()=>showMsg('Добро утро! Закъсняваш — д-р Илиева вече два пъти пита за теб. Влизай, влизай!',0,'ОХРАНИТЕЛЯТ')],
];
const TSC=[{t:0,f:'tunnel'},{t:9,f:'cavern'},{t:25,f:'tunnel'},{t:27.5,f:'accel'},{t:40,f:'scan'},{t:47,f:'hydro'},{t:66,f:'rocket'},{t:76,f:'spec'},{t:87,f:'arrive'}];

const T_STOP=96, T_ARR=87, ARR_LEN=140*(T_STOP-T_ARR)/2;
function startTram(fromMenu){
  TR={t:0,S:0,v:0,sc:0,scS:0,ev:0,door:0,fromMenu,end:0,clack:0,scanWarned:false};
  player={x:230,y:TR_FLOOR-26,w:10,h:26,vx:0,vy:0,face:1,onGround:true,crouch:false,climb:false,anim:0,step:0,inv:0,dead:false,deadT:0,hurtT:0,flashT:0,swingT:0,aimUp:false,cur:'none',ammo:{rocket:{mag:0}},hp:100,armor:0,hurtAgo:9};
  cam=0; msg=null; particles=[]; flashes=[]; state='gintro'; mInt=0; bossMusic=false; setMusic({tr:0,bpm:96,alien:false});
}
function finishTram(){
  const fm=TR&&TR.fromMenu; TR=null; msg=null;
  if(fm) toMenu(0);
  else startTraining(false);
}
function updTram(dt){
  const r=TR, p=player; r.t+=dt; const t=r.t; shake=Math.max(0,shake-dt*25);
  if(pressed.esc){ const fm=TR.fromMenu; TR=null; msg=null; toMenu(fm?0:2); return; }
  if(pressed.pause||pressed.enter||pressed.swap){ finishTram(); return; }
  let tv=t<4?35*t:t<T_ARR?((t>=40.5&&t<46.5)?70:140):Math.max(0,140*(1-(t-T_ARR)/(T_STOP-T_ARR)));
  if(t<T_ARR) r.v+=(tv-r.v)*Math.min(1,dt*(t<4?20:1.5)); else r.v=tv;
  r.S+=r.v*dt;
  let sc=0; for(let i=0;i<TSC.length;i++) if(t>=TSC[i].t) sc=i;
  if(sc!==r.sc){ r.sc=sc; r.scS=r.S; }
  while(r.ev<TR_EVENTS.length&&TR_EVENTS[r.ev][0]<=t){ TR_EVENTS[r.ev][1](); r.ev++; }
  r.clack+=r.v*dt; if(r.clack>118){ r.clack=0; if(AC){ nz({t:0.05,v:0.16,type:'bandpass',f:1500,q:2}); nz({when:0.1,t:0.05,v:0.13,type:'bandpass',f:1300,q:2}); osc({type:'sine',f:70,f2:50,t:0.12,v:0.12}); } }
  if(t>=T_STOP+1) r.door=Math.min(1,r.door+dt*1.2);
  // player inside the car
  const L=keys.left, Rr=keys.right, C=keys.crouch, dir=(Rr?1:0)-(L?1:0);
  if(C&&!p.crouch&&p.onGround){ p.crouch=true; p.y+=12; p.h=14; } else if(!C&&p.crouch){ p.crouch=false; p.y-=12; p.h=26; }
  if(dir) p.face=dir; p.aimUp=!!keys.up;
  const max=p.crouch?55:115; p.vx+=clamp(dir*max-p.vx,-1500*dt,1500*dt);
  if(pressed.jump&&p.onGround&&!p.crouch){ p.vy=-300; p.onGround=false; SFX.jump(); }
  if(!keys.jump&&p.vy<-150) p.vy+=(-150-p.vy)*0.35;
  p.vy=Math.min(p.vy+900*dt,520); p.x+=p.vx*dt; p.y+=p.vy*dt;
  const floor=TR_FLOOR; if(p.y+p.h>=floor){ if(!p.onGround&&p.vy>200) SFX.land(); p.y=floor-p.h; p.vy=0; p.onGround=true; }
  if(p.y<112){ p.y=112; p.vy=Math.max(0,p.vy); }
  const maxX=r.door>=0.9?474:CAR_R-18; if(p.x<CAR_L+10){ p.x=CAR_L+10; p.vx=0; } if(p.x>maxX){ p.x=maxX; p.vx=0; }
  if(p.onGround&&Math.abs(p.vx)>20){ p.anim+=Math.abs(p.vx)*dt*0.16; p.step+=Math.abs(p.vx)*dt; if(p.step>22){ p.step=0; SFX.step(); } }
  if(t>42.5&&t<45.3&&!r.scanWarned&&(Math.abs(p.vx)>30||!p.onGround)){ r.scanWarned=true; pa('Моля, не мърдайте по време на сканирането!'); }
  if(r.door>=0.9&&p.x>446&&!r.end) r.end=0.001;
  if(r.end>0){ r.end+=dt; if(r.end>1.1){ finishTram(); return; } }
  if(msg){ msg.age+=dt; if(msg.age>msg.d) msg=null; }
  for(const q of particles){ q.life-=dt; q.vy+=q.g*dt; q.x+=q.vx*dt; q.y+=q.vy*dt; } particles=particles.filter(q=>q.life>0);
}
// ---- scene painters ----
const RR=(x,y,w,h,c)=>{ ctx.fillStyle=c; ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); };
const wrapX=(x,per)=>((x%per)+per)%per;
function glowAt(x,y,r,col,a){ const g=ctx.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,`rgba(${col},${a})`); g.addColorStop(1,`rgba(${col},0)`); ctx.fillStyle=g; ctx.fillRect(x-r,y-r,2*r,2*r); }
function person(x,fy,col,t,wave){ const a=wave?Math.round(Math.sin(t*8)*2):0; RR(x,fy-8,3,8,col); RR(x,fy-11,3,3,'#e2b48f'); if(wave) RR(x+3,fy-13+a,1,5,'#e2b48f'); }
function tsTunnel(lx,t){
  RR(0,0,W,H,'#07090b'); RR(0,30,W,16,'#0e1216'); RR(0,46,W,2,'#1a2026'); RR(0,170,W,44,'#0b0e11');
  for(let i=0;i<4;i++) RR(0,60+i*4,W,1,'#151a1f');
  for(let k=0;k<5;k++){ const x=wrapX(k*150-lx,750)-100; RR(x,40,12,3,'#fff3c4'); ctx.save(); ctx.globalCompositeOperation='lighter'; glowAt(x+6,44,60,'255,230,170',0.25); ctx.restore(); RR(x-30,0,6,40,'#0d1013'); }
}
function tsCavern(lx,t){
  const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#0c1219'); g.addColorStop(1,'#1c2631'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#141b23'; for(let x=-20;x<W+20;x+=6){ const wx=x+lx*0.12, h=18+Math.abs(Math.sin(wx*0.031))*22+Math.sin(wx*0.11)*6; ctx.fillRect(x,0,6,h); }
  ctx.fillStyle='#18212b'; for(let x=0;x<W;x+=4){ const wx=x+lx*0.18, h=120+Math.sin(wx*0.013)*30+Math.sin(wx*0.05)*10; ctx.fillRect(x,H-h,4,h); }
  // dam with waterfall and turbines
  const dx=520-lx*0.3;
  if(dx>-320&&dx<W+20){ RR(dx,52,280,150,'#3a4248'); RR(dx,52,280,4,'#5a646c'); for(let i=0;i<7;i++) RR(dx+10+i*40,56,8,146,'#323a40');
    for(let i=0;i<6;i++) RR(dx+28+i*44,70,5,3,'#ffd36b');
    const wf=dx+120; for(let i=0;i<40;i++){ const y=(t*120+i*13)%140; RR(wf+((i*7)%40),62+y,2,8,i%3?'#9ad8ff':'#e8f6ff'); } RR(wf,60,40,4,'#c8ecff');
    for(let k=0;k<3;k++){ const cx=dx+50+k*90, cy=176; ctx.strokeStyle='#7a848c'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(cx,cy,12,0,7); ctx.stroke(); for(let a=0;a<4;a++){ const an=t*4+a*Math.PI/2; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(an)*11,cy+Math.sin(an)*11); ctx.stroke(); } }
    ctx.font='600 7px "IBM Plex Mono",monospace'; ctx.fillStyle='#c9d2d8'; ctx.fillText('ВЕЦ „ВИХРЕН“ · 48 МВт',dx+80,48); }
  // crane with container
  const cx=840-lx*0.6;
  if(cx>-200&&cx<W+200){ RR(cx,10,8,190,'#c99a1c'); RR(cx-90,10,160,6,'#c99a1c'); for(let i=0;i<16;i++) RR(cx-88+i*10,11,1,4,'#6a5010'); const hx=cx-60+Math.sin(t*0.4)*30, len=50+Math.sin(t*0.7)*25; RR(hx,16,1,len,'#2a2e33'); RR(hx-16,16+len,32,20,'#3a6a8a'); RR(hx-16,16+len,32,2,'#5a8aaa'); ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='#d8e0e8'; ctx.fillText('В-7',hx-6,30+len); }
  // catwalk with workers
  const kx=1200-lx*0.6;
  if(kx>-300&&kx<W+20){ RR(kx,80,260,3,'#5a646c'); RR(kx,72,260,1,'#5a646c'); for(let i=0;i<260;i+=20) RR(kx+i,72,1,8,'#5a646c'); person(kx+40,80,'#c99a1c',t,true); person(kx+70,80,'#e8eef0',t,false); person(kx+160,80,'#c99a1c',t+1,false); person(kx+200,80,'#3a6a8a',t,true); }
  for(let k=0;k<12;k++){ const x=wrapX(k*97-lx*0.25,1100)-100, y=40+((k*53)%70); RR(x,y,2,2,k%3?'#ffd36b':'#9ad8ff'); }
}
function tsAccel(lx,t){
  RR(0,0,W,H,'#0a0f17'); for(let y=0;y<H;y+=24) RR(0,y,W,1,'#111824');
  const cx=420-lx*0.25, cy=150;
  ctx.lineWidth=16; ctx.strokeStyle='#2a3442'; ctx.beginPath(); ctx.ellipse(cx,cy,320,92,0,0,7); ctx.stroke();
  ctx.lineWidth=2; ctx.strokeStyle='#4a5a6e'; ctx.beginPath(); ctx.ellipse(cx,cy,320,92,0,0,7); ctx.stroke();
  for(let k=0;k<24;k++){ const a=k/24*Math.PI*2, x=cx+Math.cos(a)*320, y=cy+Math.sin(a)*92; RR(x-6,y-9,12,18,k%2?'#3a6a9a':'#c9473a'); RR(x-6,y-9,12,2,'#8ab0d8'); }
  ctx.save(); ctx.globalCompositeOperation='lighter'; for(let k=0;k<3;k++){ const a=t*2.2+k*2.1; const x=cx+Math.cos(a)*320, y=cy+Math.sin(a)*92; glowAt(x,y,26,'120,200,255',0.9); RR(x-2,y-2,4,4,'#e8f6ff'); } ctx.restore();
  ctx.font='600 7px "IBM Plex Mono",monospace'; ctx.fillStyle='#8ab0d8'; ctx.fillText('КРЪГОВ УСКОРИТЕЛ „ВИХРЕН“ · ДЪЛЖИНА 4,2 КМ',cx-110,40);
  const rx=wrapX(t*40,560)-40; RR(0,24,W,3,'#3a4046'); RR(rx,27,20,6,'#4a5058'); RR(rx+8,33,2,14,'#2a2e33'); RR(rx+2,47,14,16,'#c9a227'); RR(rx+2,47,14,2,'#e0c050');
  for(let k=0;k<4;k++){ const x=wrapX(80+k*220-lx*0.6,880)-100; RR(x,140,40,14,'#39434b'); RR(x+4,126,14,12,'#11171b'); RR(x+5,127,12,10,'#0d2a1c'); RR(x+22,126,14,12,'#11171b'); RR(x+23,127,12,10,'#1a2a4a'); for(let i=0;i<10;i++) RR(x+6+i,136-Math.round(Math.abs(Math.sin(i+t*3+k))*7),1,1,'#62ff8f'); person(x+46,154,'#e8eef0',t,false); }
}
function tsScan(lx,t){
  tsTunnel(lx,t);
  for(let x=0;x<W;x+=8) RR(x,58,8,6,(Math.floor((x+lx)/8)%2)?'#c99a1c':'#1c1a14');
  const bx=760-lx;
  if(bx>-140&&bx<W+20){ RR(bx,60,120,110,'#2e353b'); RR(bx,60,120,4,'#5a646c'); RR(bx+14,80,60,40,'#0e1a22'); RR(bx+15,81,58,38,'#1a3a4a'); person(bx+40,118,'#1f3a6a',t,false); RR(bx+90,74,8,8,Math.floor(t*4)%2?'#ff3b2e':'#5a1a14'); ctx.font='600 7px "IBM Plex Mono",monospace'; ctx.fillStyle='#f2e6c8'; ctx.fillText('КОНТРОЛЕН ПУНКТ 3',bx+10,74); }
  if(t>42.5&&t<45.3){ const k=(t-42.5)/2.8, x=CAR_L+k*(CAR_R-CAR_L); RR(x-14,96,4,124,'#3a4046'); RR(x+10,96,4,124,'#3a4046');
    ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.fillStyle='rgba(255,40,40,0.35)'; ctx.fillRect(x-3,100,6,116); ctx.fillStyle='rgba(255,220,220,0.95)'; ctx.fillRect(x-1,100,2,116); glowAt(x,150,50,'255,60,60',0.4); ctx.restore(); }
}
function tsHydro(lx,t){
  const base=x=>480+x-lx*0.6;
  RR(0,0,W,H,'#120b16');
  const hEnd=base(1100);
  if(hEnd>0){ ctx.save(); ctx.beginPath(); ctx.rect(0,0,Math.min(W,hEnd),H); ctx.clip();
    RR(0,0,W,H,'#170c1c');
    for(const ty of [40,96,150]){ RR(0,ty,W,3,'#4a3a52'); ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.fillStyle='rgba(255,90,210,0.18)'; ctx.fillRect(0,ty-30,W,30); ctx.restore(); RR(0,ty-32,W,2,'#ff7ae0');
      for(let x=-((lx*0.6)%14);x<W;x+=14){ const h=6+Math.abs(Math.sin((x+lx*0.6)*0.3+ty))*8; ctx.fillStyle=(Math.floor((x+lx*0.6)/14)%3)?'#3a8a3a':'#5ab04a'; ctx.beginPath(); ctx.ellipse(x+7,ty-h/2,6,h/2,0,0,7); ctx.fill(); if(((x+lx*0.6)|0)%42<14) RR(x+5,ty-h-2,3,3,'#e04a3a'); } }
    ctx.font='600 7px "IBM Plex Mono",monospace'; ctx.fillStyle='#ffb0f0'; ctx.fillText('ХИДРОПОННА ОРАНЖЕРИЯ',base(200),20);
    ctx.restore(); }
  if(hEnd<W){ const x0=Math.max(0,hEnd); RR(x0,0,W-x0,H,'#1b2228');
    for(let k=0;k<6;k++){ const wx=base(1160+k*170); if(wx<-170||wx>W) continue;
      RR(wx,30,150,140,'#2a3238'); RR(wx+6,36,138,90,'#e8d8a8'); RR(wx+6,36,138,90,'rgba(30,40,50,0.55)'); RR(wx+6,80,138,2,'#5a4632');
      if(k===2){ ctx.font='600 8px "IBM Plex Mono",monospace'; ctx.fillStyle='#f2e6c8'; ctx.fillText('СТОЛОВА',wx+50,28); for(let i=0;i<3;i++){ RR(wx+16+i*44,108,30,3,'#7a6448'); person(wx+18+i*44,110,'#e8eef0',t+i,false); person(wx+38+i*44,110,'#c99a1c',t,false); } }
      else { RR(wx+20,64,30,3,'#5a4632'); RR(wx+28,52,12,10,'#1a1f22'); RR(wx+29,53,10,7,'#12241c'); person(wx+50,80,'#e8eef0',t,false); RR(wx+90,60,4,20,'#2f5a2a'); RR(wx+104,56,26,24,'#9aa3aa'); RR(wx+106,58,22,14,'#2a4a5a'); if(k%2) person(wx+70+Math.sin(t+k)*20,120,'#3b4a5a',t,false); }
      ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='#9aa3aa'; if(k!==2) ctx.fillText(['ОТДЕЛ ЛОГИСТИКА','СЧЕТОВОДСТВО','','ЛАБ. ОПТИКА','ЛАБ. КРИОГЕНИКА','ПЛАНИРАНЕ'][k],wx+8,30+10); }
  }
}
function tsRocket(lx,t){
  const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#0c0f13'); g.addColorStop(1,'#221d18'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  for(let x=-((lx*0.2)%40);x<W;x+=40) RR(x,0,2,H,'#151a1f');
  const rx=600-lx*0.35, fire=t>70.5&&t<75;
  if(rx>-120&&rx<W+80){
    for(let y=0;y<220;y+=16){ RR(rx+56,y,2,16,'#5a646c'); RR(rx+90,y,2,16,'#5a646c'); ctx.strokeStyle='#4a5058'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(rx+56,y); ctx.lineTo(rx+92,y+16); ctx.stroke(); }
    for(const y of [40,100,160]) RR(rx+40,y,18,3,'#5a646c');
    RR(rx,-10,40,226,'#d8dcd8'); RR(rx,-10,6,226,'#b8bcb8'); RR(rx+34,-10,6,226,'#9aa0a4');
    for(const y of [20,90,170]) RR(rx,y,40,8,'#c9302a');
    ctx.save(); ctx.translate(rx+24,40); ctx.rotate(Math.PI/2); ctx.font='12px '+DFONT(); ctx.fillStyle='#2a2e33'; ctx.fillText('ВИХРЕН-1',0,0); ctx.restore();
    RR(rx-12,190,14,26,'#9aa0a4'); RR(rx+38,190,14,26,'#9aa0a4');
    if(fire){ shake=Math.max(shake,3); for(let i=0;i<6;i++) part(rx+20+rnd(-10,10),222,rnd(-30,30),rnd(60,140),rnd(0.3,0.6),['#fff1a8','#ffb53a','#ff6a1a'][i%3],rnd(3,6),0,1);
      for(let i=0;i<3;i++) part(rx+20+rnd(-60,60),230,rnd(-80,80),rnd(-60,-20),rnd(1,2),'#5a5550',rnd(8,14),-10,2); }
    else if(Math.random()<0.3) part(rx+20+rnd(-30,30),220,rnd(-20,20),rnd(-30,-10),rnd(1,2),'#8a8a88',rnd(5,9),-5,2);
  }
  ctx.font='600 7px "IBM Plex Mono",monospace'; ctx.fillStyle='#c99a1c'; ctx.fillText('ШАХТА Б-2 · ИЗПИТАТЕЛЕН СТЕНД',Math.max(8,rx-170),30);
  if(fire){ ctx.save(); ctx.globalCompositeOperation='lighter'; glowAt(rx+20,230,180,'255,150,60',0.6); ctx.restore(); }
}
function tsSpec(lx,t){
  RR(0,0,W,H,'#050d0a'); for(let y=10;y<H;y+=30) RR(0,y,W,1,'#0c1a14');
  for(let k=0;k<7;k++){ const x=480+k*150-lx*0.6; if(x<-60||x>W+20) continue; const special=k===3;
    RR(x-4,14,46,10,'#3a4046'); RR(x-4,160,46,12,'#3a4046');
    const g=ctx.createLinearGradient(x,0,x+38,0); g.addColorStop(0,'rgba(60,160,90,0.55)'); g.addColorStop(0.5,'rgba(120,230,150,0.35)'); g.addColorStop(1,'rgba(40,120,70,0.6)'); ctx.fillStyle=g; ctx.fillRect(x,24,38,136);
    for(let i=0;i<5;i++){ const by=160-((t*30+i*29+k*13)%136); RR(x+6+((i*11+k*5)%26),by,2,2,'#c8ffd8'); }
    if(special){ const tw=t>81&&t<83?Math.round(Math.sin(t*60)*2):0; ctx.save(); ctx.translate(x+19+tw,110); ctx.scale(2.2,2.2);
      RR(-6,-6,12,4,'#9b8462'); RR(-5,-8,10,2,'#cdb48c'); RR(-3,-9,6,1,'#cdb48c'); RR(-4,-2,8,1,'#5a1f1f'); RR(-7,-2,2,2,'#6f5b44'); RR(5,-2,2,2,'#6f5b44'); ctx.restore();
      RR(x-6,176,52,9,'#5a1a14'); ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='#ffd0c8'; ctx.fillText('Х-3 · НЕ ЧУКАЙ ПО СТЪКЛОТО',x-4,183); RR(x+16,4,6,6,Math.floor(t*3)%2?'#ff3b2e':'#5a1a14'); }
    else { ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='#9ad8a8'; ctx.fillText('Х-'+(k<3?k+1:k+1),x+12,182); if(k%2) { RR(x+12,90,14,8,'#3a5a3a'); RR(x+15,86,8,4,'#4a6a4a'); } }
    ctx.save(); ctx.globalCompositeOperation='lighter'; glowAt(x+19,90,50,'90,255,140',0.15); ctx.restore(); }
  ctx.font='600 7px "IBM Plex Mono",monospace'; ctx.fillStyle='#ff8a7a'; ctx.fillText('ХРАНИЛИЩЕ ЗА АНОМАЛНИ ОБРАЗЦИ · НИВО 4',Math.max(10,300-lx*0.6),10);
}
function tsArrive(t){
  const tau=clamp(t-T_ARR,0,T_STOP-T_ARR), lx=140*tau-70*tau*tau/(T_STOP-T_ARR), off=ARR_LEN-lx, px0=CAR_R+off;
  tsTunnel(lx,t);
  const wx=px0-560; RR(Math.max(0,wx),0,W,H,'#262c31');
  for(let x=wx;x<W;x+=16) for(let y=0;y<200;y+=16) if(x>-16) RR(x,y,15,15,(((x-wx)/16+y/16)|0)%2?'#2c3338':'#30373d');
  if(wx<W){ RR(wx+190,62,190,22,'#c9302a'); ctx.font='14px '+DFONT(); ctx.fillStyle='#f2f2f2'; ctx.fillText('СЕКТОР 7',wx+200,79); ctx.font='600 7px "IBM Plex Mono",monospace'; ctx.fillText('ИЗПИТАТЕЛНИ ЗАЛИ',wx+300,77);
    const ck=wx+420; ctx.fillStyle='#e8eef0'; ctx.beginPath(); ctx.arc(ck,72,11,0,7); ctx.fill(); ctx.strokeStyle='#2a2e33'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(ck,72); ctx.lineTo(ck,64); ctx.moveTo(ck,72); ctx.lineTo(ck+6,72); ctx.stroke();
    RR(wx+400,60,40,56,'#1f3a4a'); RR(wx+402,62,36,52,'#3a6a8a'); ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='#e8eef0'; ctx.fillText('„ВИХРЕН“',wx+406,80); ctx.fillText('НАУКА ЗА',wx+405,92); ctx.fillText('БЪДЕЩЕТО',wx+405,100); }
  RR(px0,TR_FLOOR,W,H-TR_FLOOR,'#3a4046'); RR(px0,TR_FLOOR,W,3,'#8a9298'); for(let x=px0;x<W;x+=8) RR(x,TR_FLOOR+3,4,3,'#c99a1c');
  const dx=px0+34; RR(dx,96,46,104,'#1a1f22'); RR(dx+3,99,40,101,'#3a4046'); RR(dx+20,99,2,101,'#1a1f22'); RR(dx+8,108,30,8,'#2bd45a'); ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='#0e1a12'; ctx.fillText('ИЗХОД',dx+12,114);
  // guard
  const gx=px0+18; RR(gx-4,TR_FLOOR-11,3,8,'#1f2a44'); RR(gx+1,TR_FLOOR-11,3,8,'#1f2a44'); RR(gx-5,TR_FLOOR-3,5,3,'#141518'); RR(gx,TR_FLOOR-3,5,3,'#141518');
  RR(gx-5,TR_FLOOR-21,10,11,'#2a4a7a'); RR(gx-4,TR_FLOOR-20,8,2,'#3a5a8a'); RR(gx-3,TR_FLOOR-27,7,6,'#e2b48f'); RR(gx-4,TR_FLOOR-29,9,3,'#1f2a44'); RR(gx-5,TR_FLOOR-27,2,1,'#1f2a44'); RR(gx-3,TR_FLOOR-24,1,1,'#222');
  if(t>T_STOP+1.5&&Math.floor(t*2)%2) RR(gx-6,TR_FLOOR-17,3,6,'#e2b48f'); else RR(gx-6,TR_FLOOR-19,3,8,'#2a4a7a');
}
function drawCar(t,moving){
  const cy=moving?Math.round(Math.sin(t*11)*0.7):0, y0=96+cy, fl=TR_FLOOR+cy, r=TR;
  // back wall with windows
  RR(CAR_L,y0+14,CAR_R-CAR_L,6,'#59636a'); RR(CAR_L,y0+72,CAR_R-CAR_L,fl-(y0+72),'#4e575d'); RR(CAR_L,y0+72,CAR_R-CAR_L,2,'#6d777e');
  for(let x=CAR_L;x<=CAR_R;x+=60) RR(x,y0+14,8,60,'#59636a');
  ctx.fillStyle='rgba(170,210,235,0.07)'; ctx.fillRect(CAR_L,y0+20,CAR_R-CAR_L,52);
  for(let x=CAR_L+14;x<CAR_R;x+=60){ ctx.fillStyle='rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.moveTo(x+8,y0+20); ctx.lineTo(x+18,y0+20); ctx.lineTo(x+4,y0+72); ctx.lineTo(x-6,y0+72); ctx.fill(); }
  // interior: rail, straps, benches, display, poster
  RR(CAR_L,y0+24,CAR_R-CAR_L,2,'#9aa2a7'); for(let x=CAR_L+30;x<CAR_R;x+=34){ const sw=moving?Math.round(Math.sin(t*3+x)*1.5):0; RR(x+sw,y0+26,1,8,'#3a3f45'); RR(x-2+sw,y0+34,5,4,'#c9c3b4'); }
  for(const [a,b] of [[CAR_L+12,CAR_L+110],[CAR_R-120,CAR_R-14]]){ RR(a,fl-14,b-a,4,'#7a3a2a'); RR(a,fl-14,b-a,1,'#9a5a3a'); RR(a+4,fl-10,3,10,'#2a2e33'); RR(b-7,fl-10,3,10,'#2a2e33'); }
  RR(190,y0+4,100,9,'#0d1012'); ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='#ff8a3a'; const msgs=['СЛЕДВАЩА СПИРКА: СЕКТОР 7','ЛИНИЯ 2 · „ВИХРЕН“','НЕ СЕ ПОДАВАЙТЕ НАВЪН']; ctx.fillText(msgs[Math.floor(t/4)%3],194,y0+11);
  RR(CAR_L+130,fl-46,26,30,'#c9a227'); RR(CAR_L+132,fl-44,22,26,'#2a3a44'); ctx.fillStyle='#e8eef0'; ctx.font='600 5px "IBM Plex Mono",monospace'; ctx.fillText('ПАЗИ',CAR_L+136,fl-34); ctx.fillText('КОСТЮМА!',CAR_L+133,fl-27);
  // ceiling lights
  RR(CAR_L,y0,CAR_R-CAR_L,14,'#3a4046'); RR(CAR_L,y0,CAR_R-CAR_L,2,'#6d757d'); for(let x=CAR_L+40;x<CAR_R-20;x+=90){ const on=!(TSC[r.sc].f==='tunnel'&&Math.sin(t*37+x)>0.97); RR(x,y0+13,30,3,on?'#fff3c4':'#5a5a50'); }
}
function drawCarFront(t,moving){
  const cy=moving?Math.round(Math.sin(t*11)*0.7):0, fl=TR_FLOOR+cy, y0=96+cy, r=TR;
  RR(CAR_L-6,y0-6,CAR_R-CAR_L+12,8,'#2e343a'); RR(CAR_L-6,y0-6,CAR_R-CAR_L+12,2,'#5a646c');
  RR(CAR_L-6,fl,CAR_R-CAR_L+12,14,'#4a5058'); RR(CAR_L-6,fl,CAR_R-CAR_L+12,2,'#8a9298'); RR(CAR_L-6,fl+6,CAR_R-CAR_L+12,3,'#c99a1c');
  RR(CAR_L-6,y0,8,fl-y0,'#3a4046'); RR(CAR_L-6,y0,2,fl-y0,'#5a646c');
  const dh=Math.round((fl-y0)*(1-r.door)); RR(CAR_R-2,y0,8,dh,'#3a4046'); RR(CAR_R-2,y0,2,dh,'#5a646c'); if(dh>30) RR(CAR_R,y0+30,4,10,'#2bd45a');
  for(const wx of [CAR_L+30,CAR_L+90,CAR_R-90,CAR_R-30]){ ctx.fillStyle='#15181b'; ctx.beginPath(); ctx.arc(wx,fl+18,7,0,7); ctx.fill(); ctx.strokeStyle='#5a646c'; ctx.lineWidth=1; const a=-r.S/7; ctx.beginPath(); ctx.moveTo(wx,fl+18); ctx.lineTo(wx+Math.cos(a)*6,fl+18+Math.sin(a)*6); ctx.stroke(); }
}
function drawTrack(S){ RR(0,TR_FLOOR+20,W,H-TR_FLOOR-20,'#0c0e10'); RR(0,TR_FLOOR+24,W,2,'#9aa0a4'); for(let x=-wrapX(S,24);x<W;x+=24) RR(x,TR_FLOOR+26,12,4,'#3a2a1c'); }
function renderTram(){
  const r=TR, t=r.t, sc=TSC[r.sc].f, lx=r.S-r.scS, moving=r.v>2;
  ctx.save(); if(shake>0) ctx.translate(Math.round(rnd(-shake,shake)*0.5),Math.round(rnd(-shake,shake)*0.5));
  ({tunnel:tsTunnel,cavern:tsCavern,accel:tsAccel,scan:tsScan,hydro:tsHydro,rocket:tsRocket,spec:tsSpec})[sc]?({tunnel:tsTunnel,cavern:tsCavern,accel:tsAccel,scan:tsScan,hydro:tsHydro,rocket:tsRocket,spec:tsSpec})[sc](lx,t):tsArrive(t);
  if(sc!=='arrive') drawTrack(r.S); else { const tau=clamp(t-T_ARR,0,T_STOP-T_ARR); drawTrack(140*tau-70*tau*tau/(T_STOP-T_ARR)); }
  for(let i=1;i<TSC.length;i++){ const d=Math.abs(t-TSC[i].t); if(d<0.9){ ctx.fillStyle=`rgba(4,5,7,${(1-d/0.9)*0.92})`; ctx.fillRect(0,0,W,H); } }
  for(const q of particles){ const a=clamp(q.life/q.max,0,1); ctx.globalAlpha=q.kind===2?a*0.5:a; const s=q.kind===2?q.size*(1.6-a):q.size; ctx.fillStyle=q.col; ctx.fillRect(Math.round(q.x-s/2),Math.round(q.y-s/2),Math.max(1,Math.round(s)),Math.max(1,Math.round(s))); } ctx.globalAlpha=1;
  drawCar(t,moving);
  const p=player, cy=moving?Math.round(Math.sin(t*11)*0.7):0; p.y+=cy; drawPlayer(); p.y-=cy;
  drawCarFront(t,moving);
  if(sc!=='arrive'||t<T_STOP-1){ ctx.fillStyle='rgba(6,8,10,0.92)'; for(let k=0;k<3;k++){ const x=wrapX(k*233-r.S*1.7,700)-60; ctx.fillRect(x,0,16,H); ctx.fillStyle='rgba(20,24,28,0.92)'; ctx.fillRect(x+2,0,2,H); ctx.fillStyle='rgba(6,8,10,0.92)'; } }
  ctx.restore();
  // overlays
  const card=(a,b,t0,t1)=>{ if(t<t0||t>t1) return; const al=clamp(Math.min(t-t0,t1-t)/0.8,0,1); ctx.globalAlpha=al; centerText(a,240,'14px '+DFONT(),'#ffa62b'); centerText(b,254,'600 8px "IBM Plex Mono",monospace','#cfd8dc'); ctx.globalAlpha=1; };
  card('ИЗСЛЕДОВАТЕЛСКИ КОМПЛЕКС „ВИХРЕН“','Пирин · 1 200 метра под земята',1.2,7.5);
  card('ЛИНИЯ 2 · ВЪТРЕШЕН ТРАНСПОРТ','Пътник: техник по поддръжката, допуск ниво 3',20.5,25.5);
  if(t>35.2&&t<40.2){ ctx.globalAlpha=clamp(Math.min(t-35.2,40.2-t)/0.8,0,1); glitchTitle('РЕЗОНАНС',W/2,70,34); ctx.globalAlpha=1; }
  if(t<16&&t>8){ ctx.globalAlpha=clamp(Math.min(t-8,16-t),0,1)*0.85; centerText('← → разходи се из вагона · X скок · C клякане',248,'600 7px "IBM Plex Mono",monospace','#cfd8dc'); ctx.globalAlpha=1; }
  if(r.door>=0.9&&!r.end&&blink()) centerText('→ Излез от вагона',266,'600 8px "IBM Plex Mono",monospace','#94ff57');
  ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='rgba(200,210,215,0.55)'; ctx.textAlign='right'; ctx.fillText('Enter / Q — пропусни интрото  ·  Esc — назад',472,9); ctx.textAlign='left';
  drawMsgBox(r.door>0?18:14);
  if(t<1.4){ ctx.fillStyle=`rgba(0,0,0,${1-t/1.4})`; ctx.fillRect(0,0,W,H); }
  if(r.end>0){ ctx.fillStyle=`rgba(0,0,0,${Math.min(1,r.end)})`; ctx.fillRect(0,0,W,H); }
}
