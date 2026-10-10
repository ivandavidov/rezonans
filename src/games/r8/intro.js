/* ================= РЕЗОНАНС 8 · ИНТРО И ТРЕНИРОВКА =================
   Интрото: нощен Плевен, кулата бие тринадесет пъти, улицата се плъзга встрани. Тренировката — генерирана, както епизодите:
   уроците са готови сцени (r8les_*) по ред, теренът около тях е нов всеки път. */
let RI8=null;
const RI8_END=44;
const RI8_EV=[
 [1,()=>showMsg('Плевен, 3 октомври 2029 г. Дванадесет без една минута до един.',4)],
 [6,()=>showMsg('Вела Танева кара последната си поръчка за деня — плик за улица „Иван Вазов“.',4.5)],
 [12,()=>{ RI8.scene=1; RI8.bell=0; }],
 [31,()=>{ RI8.scene=2; RI8.slide=0; showMsg('С тринадесетия удар земята тихо въздъхва — и улицата пред нея вече е друга.',5); }],
 [38,()=>{ RI8.scene=3; showMsg('На сутринта никой не забелязва нищо. Помни само Вела.',5); }],
];
function startR8Intro(fromMenu){
  RI8={t:0,ev:0,fromMenu,scene:0,bell:-1,strikes:0,slide:-1};
  msg=null; particles=[]; shake=0; state='gintro'; mInt=0; bossMusic=false; setMusic({tr:-4,bpm:84,alien:false});
}
function finishR8Intro(){ const fm=RI8&&RI8.fromMenu; RI8=null; msg=null; if(fm) toMenu(0); else startR8Training(false); }
function updR8Intro(dt){
  const r=RI8; if(!r) return;
  if(pressed.esc){ const fm=r.fromMenu; RI8=null; msg=null; toMenu(fm?0:2); return; }
  if(pressed.enter||pressed.pause||pressed.swap){ finishR8Intro(); return; }
  r.t+=dt; shake=Math.max(0,shake-dt*6);
  while(r.ev<RI8_EV.length&&RI8_EV[r.ev][0]<=r.t){ RI8_EV[r.ev][1](); r.ev++; }
  if(msg){ msg.age+=dt; if(msg.age>msg.d) msg=null; }
  if(r.bell>=0){ r.bell+=dt; const n=Math.min(13,Math.floor(r.bell/1.35)+1);   // ударите: на 1,35 s; тринадесетият — след пауза
    const due=n<13?n:(r.bell>=12*1.35+1.6?13:12);
    while(r.strikes<due){ r.strikes++; shake=r.strikes===13?14:3; if(r.strikes===13){ flash=1; flashCol='#ffffff'; }
      if(AC){ const f=r.strikes===13?392:523; osc({type:'sine',f,t:2.2,v:0.09}); osc({type:'sine',f:f*2.01,t:1.4,v:0.03}); } } }
  if(r.slide>=0) r.slide+=dt;
  if(r.t>=RI8_END) finishR8Intro();
}
function r8IntroCity(t,sl){   // силуетите на града; при пренареждането блоковете се плъзгат встрани
  for(let i=0;i<14;i++){ const w=26+Math.floor(hash(i,3)*30), h=50+Math.floor(hash(3,i)*70), x0=i*36-10, dx=sl>0?Math.sin(i*1.7)*Math.min(1,sl/2)*60*(i%2?1:-1):0, x=x0+dx;
    ctx.fillStyle='#0c1020'; ctx.fillRect(x,H-50-h,w,h);
    for(let wy=H-50-h+6;wy<H-56;wy+=10) for(let wx=x+4;wx<x+w-4;wx+=8) if(hash(wx|0,wy)>0.72){ ctx.fillStyle='#f0c870'; ctx.fillRect(wx,wy,3,4); } } }
function r8IntroTower(cx,base,scale,strikes,t){ const s=scale;
  ctx.fillStyle='#2e3448'; ctx.fillRect(cx-20*s,base-150*s,40*s,150*s); ctx.fillStyle='#3e4660'; ctx.fillRect(cx-24*s,base-150*s,48*s,6*s);
  ctx.fillStyle='#2a3044'; ctx.fillRect(cx-16*s,base-176*s,32*s,26*s); ctx.beginPath(); ctx.moveTo(cx-18*s,base-176*s); ctx.lineTo(cx,base-200*s); ctx.lineTo(cx+18*s,base-176*s); ctx.fill();
  const cy=base-163*s, R_=10*s, g=ctx.createRadialGradient(cx,cy,1,cx,cy,R_*3); g.addColorStop(0,'rgba(255,240,190,0.5)'); g.addColorStop(1,'rgba(255,240,190,0)'); ctx.fillStyle=g; ctx.fillRect(cx-R_*3,cy-R_*3,R_*6,R_*6);
  ctx.fillStyle='#f0e6c8'; ctx.beginPath(); ctx.arc(cx,cy,R_,0,7); ctx.fill();
  const mn=strikes>0?0:-0.1+Math.min(0.1,t*0.01), am=-Math.PI/2+mn, ah=-Math.PI/2+Math.PI*2/12*(strikes>0?1:0.98);
  ctx.strokeStyle='#1a1e2a'; ctx.lineWidth=Math.max(1,s*1.5); ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(am)*R_*0.85,cy+Math.sin(am)*R_*0.85); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(ah)*R_*0.55,cy+Math.sin(ah)*R_*0.55); ctx.stroke(); ctx.lineWidth=1; }
function renderR8Intro(){
  const r=RI8; if(!r){ ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H); return; }
  const t=r.t; ctx.save(); if(shake>0) ctx.translate(Math.round(rnd(-shake,shake)*0.5),Math.round(rnd(-shake,shake)*0.5));
  const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#050914'); g.addColorStop(0.6,'#121c38'); g.addColorStop(1,'#33304c'); ctx.fillStyle=g; ctx.fillRect(-10,-10,W+20,H+20);
  for(let i=0;i<90;i++){ ctx.fillStyle=`rgba(255,255,255,${0.2+hash(i,1)*0.5})`; ctx.fillRect(Math.floor(hash(i,2)*W),Math.floor(hash(i,3)*H*0.6),1,1); }
  ctx.fillStyle='#e6ebf2'; ctx.beginPath(); ctx.arc(404,42,9,0,7); ctx.fill();
  if(r.scene===0||r.scene===2||r.scene===3){
    const sl=r.scene>=2?r.slide:0; r8IntroTower(330,H-50,0.8,r.strikes,t); r8IntroCity(t,sl);
    ctx.fillStyle='#1a1d26'; ctx.fillRect(-10,H-50,W+20,60); ctx.fillStyle='#646a7a'; ctx.fillRect(-10,H-50,W+20,3);
    for(let x=((-t*40)%60+60)%60-60;x<W;x+=60){ ctx.fillStyle='#c8b060'; ctx.fillRect(x,H-28,26,2); }
    ctx.strokeStyle='rgba(150,160,190,0.5)'; ctx.beginPath(); ctx.moveTo(0,64); ctx.quadraticCurveTo(W/2,74,W,64); ctx.stroke();
    // Вела на колелото: кара отляво надясно, при пренареждането спира
    const vx=r.scene===0?-20+t*28:r.scene===2?Math.min(W/2,-20+12*28+(r.slide*20)):W/2, vy=H-50;
    ctx.fillStyle='#14161c'; ctx.beginPath(); ctx.arc(vx-8,vy-6,6,0,7); ctx.arc(vx+10,vy-6,6,0,7); ctx.fill();
    ctx.fillStyle='#3a5a8a'; ctx.fillRect(vx-4,vy-26,10,14); ctx.fillStyle='#e8ecf4'; ctx.fillRect(vx-3,vy-34,8,8); ctx.fillStyle='#ffb04a'; ctx.fillRect(vx-10,vy-22,7,8);
    ctx.strokeStyle='#8a92a8'; ctx.beginPath(); ctx.moveTo(vx-8,vy-6); ctx.lineTo(vx+1,vy-12); ctx.lineTo(vx+10,vy-6); ctx.stroke();
    if(r.scene===3){ ctx.fillStyle=`rgba(0,0,0,${Math.min(0.6,(t-38)*0.2)})`; ctx.fillRect(-10,-10,W+20,H+20); }
  } else {   // кулата отблизо и броят на ударите
    r8IntroTower(W/2,H+40,1.25,r.strikes,t);
    if(r.strikes>0){ const k=r.bell-(r.strikes-1)*1.35, a=Math.max(0,1-k*0.6); ctx.save(); ctx.globalAlpha=Math.max(0.25,a);
      ctx.font='700 40px '+DFONT(); ctx.textAlign='center'; ctx.fillStyle=r.strikes===13?'#ffb04a':'#fff4e0'; ctx.fillText(String(r.strikes),W/2+120,120); ctx.textAlign='left'; ctx.restore();
      ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.strokeStyle=`rgba(255,240,190,${a*0.5})`; for(let i=0;i<3;i++){ ctx.beginPath(); ctx.arc(W/2,H+40-163*1.25,20+k*60+i*14,0,7); ctx.stroke(); } ctx.restore(); }
  }
  ctx.restore();
  if(flash>0){ ctx.globalAlpha=Math.min(1,flash); ctx.fillStyle=flashCol; ctx.fillRect(0,0,W,H); ctx.globalAlpha=1; flash=Math.max(0,flash-0.02); }
  drawMsgBox(20,MSG_STD);
  centerText('Enter — пропусни · Esc — меню',H-8,'600 7px "IBM Plex Mono",monospace','#6a7288');
}

/* ---------- тренировката: първият курс на Вела ---------- */
const r8Les=(id,txt,seg)=>defPrefab(id,{build(S){ S.ground(2); S.triggers.push({x:S.b.x,fn:()=>showMsg(txt,0,'ШЕФЪТ')}); if(seg) seg(S); }});
r8Les('r8les_move','Ето ти радиостанцията. ← → — караш напред и назад. Градът нощем е друг — научи го наизуст.',S=>S.ground(8));
r8Les('r8les_jump','X — скок. Задръж го за по-висок. Пропастите на строежите не прощават.',S=>S.F.gaps());
r8Les('r8les_crawl','C — клякане. Под ниските тръби се минава приклекнал.',S=>S.F.crawl());
r8Les('r8les_ladder','↑ — по стълбата нагоре. Покривите са най-краткият път.',S=>S.F.tower());
r8Les('r8les_shoot','Z — стрелба. Мишените са от охраната на фирмата — свали ги. ↑ + Z стреля нагоре.',S=>{ const {b,ground,fixed}=S; ground(2); const x0=b.x; ground(12); for(const dx of [3,7,10]) fixed.push(['target',x0+dx,b.gy-1]); });
r8Les('r8les_era','E — СПОМЕН. Нощем пътят понякога го няма. Спомни си го — и ще се появи.',S=>S.F.eraWall());
r8Les('r8les_weapon','Q или 1–6 — смяна на оръжието. Ето ти и нещо по-сериозно от пистолета.',S=>{ const {b,ground,fixed}=S; ground(2); fixed.push(['shotgun',b.x+2,b.gy-1]); ground(8); });
const R8_TRAIN={theme:'r8center',k:0,len:[8,12],foes:2,sign:'ПЪРВИЯТ КУРС',
  seq:['r8les_move','r8les_jump','r8les_crawl','r8les_ladder','r8les_shoot','r8les_era','r8les_weapon']};
function r8TrainLevel(){
  const L=svGenBy(0,{theme:R8_TRAIN.theme,muts:[],boss:null,seed:epSeedNew(),ep:R8_TRAIN});
  return Object.assign(L,{n:0,title:'ПЪРВИЯТ КУРС',training:true,surv:false,hdrS:'ПОДГОТОВКА · ПЪРВИЯТ КУРС',hdrN:'Z — към първия епизод',
    loadout:LOAD8,drawExtra:r8Wires,
    story:['Плевен, септември 2029 г. Първата нощна смяна на Вела Танева в куриерската фирма.',
      'Шефът ѝ дава радиостанция и плик: „Нощем градът е друг. Научи го наизуст — пътят е всеки път малко по-различен.“'],
    end:['Пликът е доставен. Вела вече знае пътя.','Поне докато кулата не удари тринадесет.']});
}
function startR8Training(fromMenu){ TRN={fromMenu}; SURV=false; bossMul=1; ehpMul=1; loadLevel(-1,r8TrainLevel()); state='story'; storyT=0; mInt=0; bossMusic=false; }
