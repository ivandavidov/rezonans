/* ================= ДВИГАТЕЛ · ЧИЙТОВЕ =================
   Отключват се за сесията (нищо не се помни след презареждане) с думата kokoloko — написана на началния екран или в менюто
   (чете се физическият клавиш, затова работи и на българска подредба) — или със 7 докосвания на екрана в менюто. Тогава в
   менюто има ред „ЧИЙТОВЕ“, а в паузата ↓ отваря същия екран. Режимите важат до изключване; действията — веднъж, от паузата.
   Записите: ако в нивото (в оцеляването — в цялата игра) е бил включен режим или е ползвано действие, CHT.used пречи на всеки
   запис освен настройките (store.lock): няма отключен епизод, рекорд, „продължи“, спомени и финали. CHT.used тръгва отначало
   при ниво от менюто или нова игра в оцеляването; продълженията го пазят.
   Частите могат да добавят свои с defCheat(id,{name,desc,kind:'mode'|'num'|'act',set(v),run(),ok(),min,max}). */
const CHT={open:false,on:{},used:false,from:'gmenu',sel:1,top:0,keys:'',taps:[],rep:0}, CHT_LIST=[];
const CHT_ITEM={t:'ЧИЙТОВЕ',k:'cheats',d:'Безсмъртие, летене, муниции, отключени нива… С тях в нивото нищо не се записва.'};
function defCheat(id,o){ if(CHT_LIST.some(c=>c.id===id)) throw new Error('Чийтът „'+id+'“ вече е зададен'); CHT_LIST.push({id,kind:'mode',...o}); }
function chtOn(id){ return CHT.on[id]; }
const chtVal=c=>CHT.on[c.id]||c.min;
const chtAny=()=>CHT_LIST.some(c=>c.kind==='num'?chtVal(c)>c.min:c.kind==='mode'&&CHT.on[c.id]);
function chtStart(carry){ CHT.used=!!(carry&&CHT.used)||chtAny(); }   // ниво от менюто или нова игра — отначало; продължение — пази
const chtTag=()=>CHT.used?' · ЧИЙТ':'';
const chtSector=()=>chtVal(CHT_LIST.find(c=>c.id==='start'))-1;   // оцеляване: откъде започва новата игра
store.lock=k=>CHT.used&&!STORE_KEYS.includes(k);
function chtSet(id,v){ const c=CHT_LIST.find(q=>q.id===id); if(!c||c.kind==='act') return;
  CHT.on[id]=c.kind==='num'?clamp(Math.round(v)||c.min,c.min,c.max):!!v; if(c.set) c.set(CHT.on[id]); if(chtAny()) CHT.used=true; }
function chtDo(id){ const c=CHT_LIST.find(q=>q.id===id&&q.kind==='act'); if(!c||c.ok&&!c.ok()) return false; CHT.used=true; c.run(); return true; }
function chtUnlock(){ if(CHT.open) return; CHT.open=true; SFX.menuOk(); const i=menuItems().indexOf(CHT_ITEM); if(state==='title') toMenu(i); else gSel=i; }
addEventListener('keydown',e=>{ if(e.repeat||!/^Key[A-Z]$/.test(e.code)) return; CHT.keys=(CHT.keys+e.code[3].toLowerCase()).slice(-8);
  if(CHT.keys==='kokoloko'&&(state==='title'||state==='gmenu')) chtUnlock(); });
cv.addEventListener('pointerdown',()=>{ if(state!=='gmenu') return; CHT.taps=CHT.taps.filter(t=>titleT-t<3).concat(titleT); if(CHT.taps.length>=7){ CHT.taps=[]; chtUnlock(); } });

/* ---------- помощници ---------- */
// летене: без гравитация, стрелките — във всички посоки; през стени — и без сблъсъци (в рамките на нивото)
function chtFly(p,dt,dir,U,Dn){ const clip=CHT.on.clip; if(!CHT.on.fly&&!clip) return false;
  p.climb=false; p.aimUp=false; p.onLift=null; const v=clip?200:150; p.vx=dir*v; p.vy=((Dn?1:0)-(U?1:0))*v;
  if(clip){ p.x+=p.vx*dt; p.y+=p.vy*dt; p.onGround=false; } else { moveX(p,p.vx*dt); moveY(p,p.vy*dt); }
  p.x=clamp(p.x,0,COLS*T-p.w); p.y=clamp(p.y,0,ROWS*T-p.h); if(dir||U||Dn) p.anim+=dt*8; return true; }
// след летене през стени героят може да е в стена — до най-близкото свободно място
function chtFree(){ const p=player; if(!p||!rectSolid(p.x,p.y,p.w,p.h)) return; const cx=Math.floor((p.x+p.w/2)/T), cy=Math.floor((p.y+p.h)/T);
  for(let r=1;r<24;r++) for(let dy=-r;dy<=r;dy++) for(let dx=-r;dx<=r;dx++){ if(Math.max(Math.abs(dx),Math.abs(dy))!==r) continue;
    const x=(cx+dx)*T+3, y=(cy+dy)*T-p.h; if(x>=0&&x+p.w<=COLS*T&&y>=0&&y+p.h<=ROWS*T&&!rectSolid(x,y,p.w,p.h)){ p.x=x; p.y=y; p.vx=p.vy=0; return; } } }
// на земята в колона tx (или най-близо до нея) — там е и контролната точка
function chtTo(tx){ const p=player, ok=c=>c>1&&c<COLS-2&&groundY(c)<16*T&&!rectSolid(c*T+3,groundY(c)-26,10,26);
  let c=-1; for(let d=0;d<24&&c<0;d++) c=ok(tx+d)?tx+d:ok(tx-d)?tx-d:-1; if(c<0) return;
  if(p.crouch){ p.crouch=false; p.h=26; } p.x=c*T+3; p.y=groundY(c)-p.h; p.vx=p.vy=0; p.climb=false; p.onLift=null; setCp(c); cam=clamp(p.x-W/2,0,COLS*T-W); }
const chtArena=()=>{ const a=LVL.arena; return a.door!=null?a.door:a.x0!=null?a.x0:a.minX!=null?a.minX:COLS; };   // входът на арената

/* ---------- режими ---------- */
defCheat('god',{name:'БЕЗСМЪРТИЕ',desc:'Нищо не те наранява; ямата те връща на контролната точка. Лавината не те стига, спътникът не загива.'});
defCheat('ammo',{name:'БЕЗКРАЙНИ МУНИЦИИ',desc:'Пълнителят не свършва — без презареждане.',set(v){ if(v&&player) for(const w in player.ammo) if(player.weapons[w]) player.ammo[w].mag=CAP[w]; }});
defCheat('fly',{name:'ЛЕТЕНЕ',desc:'Без гравитация: стрелките движат във всички посоки, стените спират.',set(){ if(!CHT.on.clip) chtFree(); }});
defCheat('clip',{name:'ПРЕЗ СТЕНИ',desc:'Летене през стени и врати.',set(){ if(!CHT.on.clip) chtFree(); }});
defCheat('unl',{name:'ОТКЛЮЧЕНИ НИВА',desc:'Всички епизоди са достъпни; истинският напредък не се пипа.',set(){ gUnl=unlRead(); }});
defCheat('inv',{name:'НЕВИДИМОСТ',desc:'Враговете (без босовете), камерите и прожекторите не те забелязват.'});
defCheat('onehit',{name:'ЕДИН УДАР',desc:'Всеки удар убива; босовете поемат десетократна щета.'});
defCheat('light',{name:'СВЕТЛИНА',desc:'Тъмните нива са осветени.'});
defCheat('slow',{name:'БАВНО ВРЕМЕ',desc:'Играта върви два пъти по-бавно.'});
defCheat('secret',{name:'ТАЙНИТЕ ПРОХОДИ',desc:'Скритите проходи се виждат.'});
defCheat('freeze',{name:'ЗАМРАЗЕНИ ВРАГОВЕ',desc:'Враговете, босовете и изстрелите им стоят на място.'});
defCheat('traps',{name:'БЕЗ КАПАНИ',desc:'Лазерите, пресите, парата, токът по пода и влаковете спират.'});
defCheat('start',{kind:'num',name:'НАЧАЛЕН СЕКТОР',desc:'Оцеляване: новата игра започва от този сектор (← → или Z).',min:1,max:99});
/* ---------- действия (само по време на игра) ---------- */
defCheat('end',{kind:'act',name:'КРАЙ НА НИВОТО',desc:'Нивото свършва веднага, като на изхода; в оцеляването — следващият сектор.',run(){ state='play'; completeLevel(); }});
defCheat('boss',{kind:'act',name:'КЪМ БОСА',desc:'Пред входа на арената — влез и битката започва.',ok:()=>!!LVL.arena&&!bossActive&&!(boss&&boss.dead)&&player.x<chtArena()*T,run(){ chtTo(chtArena()-3); }});
defCheat('fwd',{kind:'act',name:'НАПРЕД С ЕДИН ЕКРАН',desc:'Около 30 колони напред, на земята; там е и контролната точка.',ok:()=>!bossActive,run(){ chtTo(Math.min(COLS-3,Math.floor(player.x/T)+30)); }});
defCheat('heal',{kind:'act',name:'ПЪЛНО ЗДРАВЕ И БРОНЯ',desc:'Здраве и броня — по 100.',run(){ player.hp=100; player.armor=100; }});
defCheat('arms',{kind:'act',name:'ВСИЧКИ ОРЪЖИЯ',desc:'Всички оръжия с пълни муниции.',run(){ const p=player; for(const w of ORDER){ p.weapons[w]=true; if(p.ammo[w]){ p.ammo[w].mag=CAP[w]; p.ammo[w].res=RES_MAX[w]; } } }});
defCheat('kill',{kind:'act',name:'УБИЙ ВРАГОВЕТЕ',desc:'Всички врагове в нивото, без боса.',run(){ for(const e of enemies) if(!e.dead){ hurtEnemy(e,e.hp+999,0); if(!e.dead){ e.hp=0; e.dead=true; e.deadT=0; stats.kills++; } } }});
defCheat('life',{kind:'act',name:'+1 ЖИВОТ',desc:'Оцеляване: още един живот.',ok:()=>SURV,run(){ survLives++; }});

/* ---------- екранът „ЧИЙТОВЕ“ (от менюто — режимите; от паузата — и действията) ---------- */
function chtRows(){ const R=[{h:'РЕЖИМИ'}]; for(const c of CHT_LIST) if(c.kind!=='act') R.push(c);
  if(CHT.from==='paused'){ R.push({h:'ДЕЙСТВИЯ'}); for(const c of CHT_LIST) if(c.kind==='act'&&(!c.ok||c.ok())) R.push(c); }
  return R; }
function chtOpen(from){ CHT.from=from; CHT.sel=1; CHT.top=0; state='cheats'; }
function chtBack(){ state=CHT.from; if(state==='gmenu') gSel=Math.max(0,menuItems().indexOf(CHT_ITEM)); }
function chtInput(){
  const R=chtRows(), n=R.length; let s=Math.min(CHT.sel,n-1); if(R[s].h) s=1;
  const step=d=>{ do s=(s+d+n)%n; while(R[s].h); SFX.menu(); };
  if(pressed.up) step(-1); if(pressed.down) step(1); CHT.sel=s;
  if(pressed.esc||pressed.jump){ SFX.menu(); chtBack(); return; }
  const c=R[s];
  if(c.kind==='num'){ const d0=(pressed.right?1:0)-(pressed.left?1:0), d=(keys.right?1:0)-(keys.left?1:0);   // задържането превърта
    if(d0){ CHT.rep=titleT+0.4; chtSet(c.id,chtVal(c)+d0); SFX.menu(); } else if(d&&titleT>CHT.rep){ CHT.rep=titleT+0.06; chtSet(c.id,chtVal(c)+d); } }
  if(!ok()) return; SFX.menuOk();
  if(c.kind==='mode') chtSet(c.id,!CHT.on[c.id]);
  else if(c.kind==='num') chtSet(c.id,chtVal(c)>=c.max?c.min:chtVal(c)+1);
  else { state='play'; if(AC) AC.resume(); if(chtDo(c.id)&&state==='play') showMsg('Чийт: '+c.name.toLowerCase(),1.6); }
}
function chtRender(){
  const R=chtRows(), A=ACC(), f='600 8px "IBM Plex Mono",monospace', vis=13, gap=12, y0=64;
  overlay(0.84); centerText('ЧИЙТОВЕ',34,'16px '+DFONT(),A);
  centerText(CHT.used?'Тук има чийтове — нищо не се записва':'Ниво с чийтове не се записва — нито напредък, нито рекорд',47,'600 7px "IBM Plex Mono",monospace',CHT.used?'#ff8a5a':'#7f8e97');
  CHT.top=clamp(CHT.top,Math.max(0,CHT.sel-vis+1),Math.max(0,CHT.sel-1));
  ctx.font=f;
  for(let i=CHT.top;i<Math.min(R.length,CHT.top+vis);i++){ const r=R[i], y=y0+(i-CHT.top)*gap, on=i===CHT.sel;
    ctx.textAlign='left'; if(r.h){ ctx.fillStyle='#5f6e77'; ctx.fillText(r.h,W/2-130,y); continue; }
    if(on){ ctx.fillStyle=ACCA(0.12); ctx.fillRect(W/2-132,y-9,264,12); ctx.fillStyle=A; ctx.fillRect(W/2-132,y-9,2,12); }
    ctx.fillStyle=on?A:'#b9c4ca'; ctx.fillText(r.name,W/2-122,y);
    const set=r.kind==='mode'?!!CHT.on[r.id]:r.kind==='num'&&chtVal(r)>r.min;
    ctx.textAlign='right'; ctx.fillStyle=set?'#94ff57':on?A:'#7f8e97'; ctx.fillText(r.kind==='act'?'▶':r.kind==='num'?'◀ '+chtVal(r)+' ▶':set?'ВКЛ':'изкл',W/2+126,y); }
  ctx.textAlign='left';
  if(CHT.top>0) centerText('▲',y0-11,f,'#5f6e77'); if(CHT.top+vis<R.length) centerText('▼',y0+vis*gap-3,f,'#5f6e77');
  const c=R[CHT.sel]; if(c&&!c.h) centerText(c.desc,226,'600 7px "IBM Plex Mono",monospace','#cfd8dc');
  centerText('↑ ↓ избор · Z вкл./изкл. или изпълни · Esc / X назад',250,'600 7px "IBM Plex Mono",monospace','#7f8e97');
}
