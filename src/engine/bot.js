/* ================= ДВИГАТЕЛ · АВТОПИЛОТ =================
   Чийтът „АВТОПИЛОТ“ (bot): героят играе сам — избива враговете, прибира предметите и стига до изхода, като избягва изстрелите
   и капаните. В игра: A — вкл./изкл. (само след отключване на чийтовете); стрелка, Z, X … — поемаш ти (ботът се изключва).
   Ботът натиска същите keys/pressed като клавиатурата преди всяка стъпка на update (loop.js): физиката и оръжията са общите.
     граф    — местата за стоене и скоковете между тях: svValidate (engine/survgen.js) в режим exact върху картата в момента
               (затворените врати — стени); строи се наново, щом картата се смени (MAPV в prerender.js, честотата)
     цел     — най-близкият по пътя враг (място, откъдето изстрелът го улучва) или предмет; накрая изходът / босът
     път     — Дейкстра от мястото под краката; скоковете и паданията — симулация на движението (botStep — формулите на updPlayer)
               с разбег, задържане на скока и насочване към целта; изпълнява се кадър по кадър, при отклонение — наново
     бой     — оръжието по врага и разстоянието, прицел (право, клекнал, нагоре), без изстрел в бъчва до себе си
     защита  — всеки кадър изстрелите, гранатите, ракетите, враговете, босът и капаните се предвиждат BOT_K кадъра напред;
               от няколко маневри (планът, стой, клекни, скочи, бягай…) се избира тази с най-малко щета
   Враг или бос на частта може да подскаже своите опасности: defFoe/defBoss(id,{bot:{threats(e)→[{d, hit(s,t)}], contact:false, vuln(b)}})
   — hit(s,t): удря ли героя s (кутия x,y,w,h, onGround) след t секунди; contact:false — допирът с него не наранява;
   vuln(b) → false: босът сега не поема щета (щит) — не е цел, ботът стреля по друго. */
const BOT_KEYS=['left','right','up','down','fire','jump','crouch','swap','w1','w2','w3','w4','w5','w6','era'];
const BOT_TAKE=new Set(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyZ','KeyX','KeyC','KeyQ','KeyE','Digit1','Digit2','Digit3','Digit4','Digit5','Digit6']);
const BOT_K=45, BOT_RNG={wrench:22,pistol:400,shotgun:170,pulse:360,grenade:0,rocket:460};   // кадри напред за защитата; докъде стреля оръжието
const BOT={g:null,gm:null,gv:'',d:null,pr:null,col:null,src:-1,n:-1,path:[],goal:null,ban:new Map(),bad:new Set(),prog:null,air:null,re:0,
  best:1e9,bestT:0,gref:null,dodge:null,wT:0,fT:0,shot:null,shotHp:0,shotT:0,idleT:0,stuck:0,gave:false,mT:0,lvl:null};
defCheat('bot',{name:'АВТОПИЛОТ',desc:'Героят играе сам: враговете, предметите, изходът. В игра: A вкл./изкл.; стрелка, Z или X — поемаш ти.',set(){ botReset(); }});
function botReset(){ for(const k of BOT_KEYS) keys[k]=false; Object.assign(BOT,{why:BOT.gave?BOT.why:'',g:null,path:[],goal:null,prog:null,air:null,dodge:null,gref:null,best:1e9,bestT:lvT,progT:lvT,sig:-1,gave:false}); BOT.ban.clear(); BOT.bad.clear(); }
const BOT_ST=new Set(['play','paused','dead','story','levelEnd']);
addEventListener('keydown',e=>{ if(e.repeat||e.metaKey||e.ctrlKey||e.altKey) return;
  if(e.code==='KeyA'&&CHT.open&&BOT_ST.has(state)){ chtSet('bot',!CHT.on.bot); showMsg(CHT.on.bot?'Автопилот: вкл. (A — изкл.)':'Автопилот: изкл.',1.6); return; }
  if(CHT.on.bot&&state==='play'&&BOT_TAKE.has(e.code)){ const k=CODES[e.code]; chtSet('bot',false); keys[k]=true; pressed[k]=true; showMsg('Автопилот: изкл. — играеш ти',1.6); } });
document.querySelectorAll('#touch button[data-k]').forEach(b=>b.addEventListener('pointerdown',()=>{ const k=b.dataset.k;
  if(CHT.on.bot&&state==='play'&&BOT_KEYS.includes(k)){ chtSet('bot',false); keys[k]=true; showMsg('Автопилот: изкл. — играеш ти',1.6); } }));

/* ---------- графът ---------- */
// при епохи (ERAD) — два слоя: възелът на слой e е e*N+id, а смяната (E) е ребро към същото място в другия слой (или до
// първото място под него), ако там тялото е свободно
function botGraph(){
  const C=COLS, N=C*ROWS, lifts=(LVL.lifts||[]).map(l=>({x0:l.x0,y0:l.y0,x1:l.x1,y1:l.y1,w:l.w||3}));
  // честотите: плочките '1'–'3' — платформи, на които се стъпва отгоре (стените от тях — проходими); тонът се сменя по пътя (botFreq)
  const fq=c=>c==='1'||c==='2'||c==='3', fm=m=>m.map((r,y)=>r.map((c,x)=>!fq(c)?c:(y>0&&fq(m[y-1][x]))||(y<ROWS-1&&fq(m[y+1][x]))?'.':'-'));
  BOT.simMap=LVL.freq?fm(map):null;
  const prep=m=>m.map(r=>r.map(c=>c==='D'?'#':c==='h'||c==='t'?'.':c));   // тоновите врати 't' — отварят се с E
  const gs=ERAD?ERAD.maps.map(prep):[prep(BOT.simMap||map)];
  const Vs=gs.map(g=>{ const V=svValidate(g,C,g[0].filter(c=>c==='.').length>C/2,G<800,lifts,LVL.start,C-3,{exact:true,all:true,noRoute:true}); V.free=botFree(V,g); return V; });
  BOT.N=N; BOT.gm=ERAD?ERAD.maps[0]:map; BOT.gv=botGv(); BOT.prog=null; BOT.re=0; BOT.tele=new Set();
  for(const [cmd,tx,row,o] of LVL.cursors||[]) if(cmd==='GOTO'&&o&&o.to) Vs.forEach((V,e)=>{ const a=(row+1)*C+tx, b=(o.to[1]+1)*C+o.to[0]; if(V.kind[a]&&V.kind[b]){ (V.adj[a]||(V.adj[a]=[])).push(b); BOT.tele.add((e*N+a)*1e5+e*N+b); } });   // телепорт (курсор GOTO, E)
  if(Vs.length===1){ BOT.g=Vs[0]; BOT.free=Vs[0].free; BOT.wind=Vs[0].wind||null; return; }
  const L=Vs.length, kind=new Int8Array(L*N), virt=new Uint8Array(L*N), free=new Uint8Array(L*N), adj=new Array(L*N), sol=(g,x,y)=>y>=0&&y<ROWS&&'#=BZ><^'.includes(g[y][x]);
  Vs.forEach((V,e)=>{ for(let id=0;id<N;id++){ kind[e*N+id]=V.kind[id]; virt[e*N+id]=V.virt[id]; if(V.free) free[e*N+id]=V.free[id]; if(V.adj[id]) adj[e*N+id]=V.adj[id].map(n=>e*N+n); } });
  for(let e=0;e<L;e++){ const f=1-e, gB=gs[f];
    for(let id=0;id<N;id++){ const a=e*N+id; if(!kind[a]&&!free[a]) continue; const x=id%C, y=id/C|0, body=free[a]?[y]:[y-1,y-2];
      if(body.some(yy=>yy<0||sol(gB,x,yy))) continue;
      let t=-1; if(kind[f*N+id]||free[f*N+id]) t=f*N+id; else for(let ry=body[0]+1;ry<ROWS;ry++){ const c=f*N+ry*C+x; if(kind[c]||free[c]){ t=c; break; } if(sol(gB,x,ry)) break; }
      if(t>=0) (adj[a]||(adj[a]=[])).push(t); } }
  BOT.g={kind,virt,adj}; BOT.free=free.some(v=>v)?free:null; BOT.wind=null; }
const botY=n=>((n%BOT.N)/COLS)|0, botLay=n=>(n/BOT.N)|0, botOff=()=>ERAD?ERA*BOT.N:0;
// вода и безтегловност — свободно движение (като модела на проверката back, tools/checks.js): клетките на тялото, преходите
// между тях, падането до първото място, излизането от повърхността (скок до 3 встрани и 2 нагоре) и влизането (сход, скок)
function botFree(V,g){ const C=COLS, N=C*ROWS, free=new Uint8Array(N), sol=(x,y)=>x<0||x>=C||y<0||(y<ROWS&&'#=BZ><^'.includes(g[y][x])), adj=V.adj;
  const zg=(x,y)=>LVL.zeroG||(LVL.zgZones&&LVL.zgZones.some(([x0,y0,x1,y1])=>x>=x0&&x<=x1&&y>=y0&&y<=y1));
  const wind=new Uint8Array(N); for(const w of LVL.winds||[]) if(w[5]<0) for(let y=Math.max(0,w[1]);y<=Math.min(ROWS-1,w[3]);y++) for(let x=Math.max(0,w[0]);x<=Math.min(C-1,w[2]);x++) if(!sol(x,y)) wind[y*C+x]=1;   // възходящо течение
  for(let y=0;y<ROWS;y++) for(let x=0;x<C;x++) if((g[y][x]==='w'||zg(x,y)||wind[y*C+x])&&!sol(x,y)) free[y*C+x]=1;
  if(!free.some(v=>v)) return null; V.wind=wind.some(v=>v)?wind:null;
  for(let a=0;a<N;a++) if(adj[a]&&V.kind[a]) adj[a]=adj[a].filter(b=>{ const ax=a%C, ay=a/C|0, bx=b%C, by=b/C|0;   // скок или падане през вода — не важи (там се плува)
    for(let x=Math.min(ax,bx);x<=Math.max(ax,bx);x++) for(let y=Math.max(0,Math.min(ay,by)-2);y<Math.max(ay,by);y++) if(free[y*C+x]) return false; return true; });
  const add=(a,b)=>{ (adj[a]||(adj[a]=[])).push(b); };
  const fall=(x,y,from,dr=0)=>{ for(let cx=Math.max(0,x-dr);cx<=Math.min(C-1,x+dr);cx++) for(let ry=y;ry<ROWS;ry++){ const c=ry*C+cx; if(free[c]||(ry>y&&V.kind[c])){ add(from,c); break; } if(sol(cx,ry)) break; } };
  for(let id=0;id<N;id++) if(free[id]){ const x=id%C, y=id/C|0;
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx, ny=y+dy; if(nx<0||nx>=C||ny<0||ny>=ROWS||sol(nx,ny)) continue; if(free[ny*C+nx]) add(id,ny*C+nx); else fall(nx,ny,id,2); }
    const surf=y>0&&!free[id-C]&&!sol(x,y-1), r=surf?3:1;
    for(let tx=Math.max(0,x-r);tx<=Math.min(C-1,x+r);tx++) for(let ty=Math.max(1,y-(surf?2:0));ty<=Math.min(ROWS-1,y+2);ty++){ const s=ty*C+tx; if(!V.kind[s]) continue;
      const near=Math.abs(tx-x)<=1&&(ty-1===y||ty-2===y); if(near||surf) add(id,s); if(near) add(s,id); } }
  for(let s=0;s<N;s++) if(V.kind[s]&&!free[s-C]&&!free[s-2*C]){ const x=s%C, y=s/C|0;   // влизане — от сухо място
    for(const d of [-1,1]) if(x+d>=0&&x+d<C&&!sol(x+d,y-1)) fall(x+d,y-1,s);
    for(let fy=Math.max(0,y-4);fy<y-1;fy++){ if(sol(x,fy)) continue; for(const d of [-1,1]) for(let fx=x+d,k=0;k<3&&fx>=0&&fx<C&&!sol(fx,fy);fx+=d,k++) if(free[fy*C+fx]) add(s,fy*C+fx); } }
  return free; }
const botGv=()=>MAPV+':'+(LVL.freq?1:0)+':'+(ERAD?1:0);
const botMapOk=()=>BOT.gm===(ERAD?ERAD.maps[0]:map);
// мястото (възел) под краката: плочката, на която стои (центърът или единият край на тялото)
function botNodeOf(s){ const o=botOff(); if(BOT.wind&&!s.onGround){ const id=o+Math.floor((s.y+s.h/2)/T)*COLS+Math.floor((s.x+s.w/2)/T); if(BOT.wind[id]) return id; }
  if(s.swim&&BOT.free) for(const k of [0.5,0.8]){ const id=o+Math.floor((s.y+s.h*k)/T)*COLS+Math.floor((s.x+s.w/2)/T); if(BOT.free[id]) return id; }
  const V=BOT.g, fy=Math.floor((s.y+s.h+1)/T); if(!V||fy<1||fy>=ROWS||Math.abs(fy*T-(s.y+s.h))>2) return -1;
  for(const x of [Math.floor((s.x+s.w/2)/T),Math.floor(s.x/T),Math.floor((s.x+s.w-0.01)/T)]) if(x>=0&&x<COLS&&V.kind[o+fy*COLS+x]) return o+fy*COLS+x; return -1; }
const botAcid=n=>tileAt(n%COLS,botY(n)-1)==='~';
function botCost(a,b){ if(BOT.N&&botLay(a)!==botLay(b)||BOT.tele&&BOT.tele.has(a*1e5+b)) return 3; const C=COLS, ax=a%C, ay=botY(a), bx=b%C, by=botY(b), k=BOT.g.kind[b], dx=Math.abs(ax-bx);
  let c=by===ay&&dx===1?1:dx<=1&&by>ay?1+(by-ay)*0.15:dx===0?2+(ay-by)*0.4:3+dx*0.6+Math.max(0,ay-by)*0.4;
  if(BOT.free&&BOT.free[b]) return 1.6+(BOT.free[a]?0:1); if(BOT.free&&BOT.free[a]) return 2.5;
  if(k===3) c+=botAcid(b)?400:6; else if(k===2) c+=1; return c; }
function botDij(src){ const V=BOT.g, N=V.kind.length, C=COLS;
  if(!BOT.d||BOT.d.length!==N){ BOT.d=new Float64Array(N); BOT.pr=new Int32Array(N); }
  const d=BOT.d, pr=BOT.pr, hk=[0], hv=[src], pen=botPen(); d.fill(1e9); pr.fill(-1); d[src]=0;   // двоична купчина
  while(hv.length){ const k0=hk[0], v=hv[0], lk=hk.pop(), lv=hv.pop();
    if(hv.length){ let i=0; for(;;){ let c=2*i+1; if(c>=hv.length) break; if(c+1<hv.length&&hk[c+1]<hk[c]) c++; if(hk[c]>=lk) break; hk[i]=hk[c]; hv[i]=hv[c]; i=c; } hk[i]=lk; hv[i]=lv; }
    if(k0>d[v]) continue;
    for(const n of V.adj[v]||[]){ if(BOT.bad.has(v*1e5+n)) continue; const nd=k0+botCost(v,n)+(pen[n]||0); if(nd<d[n]){ d[n]=nd; pr[n]=v;
      let i=hv.length; hk.push(nd); hv.push(n); while(i>0){ const q=(i-1)>>1; if(hk[q]<=nd) break; hk[i]=hk[q]; hv[i]=hv[q]; i=q; } hk[i]=nd; hv[i]=n; } } }
  const col=BOT.col&&BOT.col.length===C?BOT.col:(BOT.col=new Float64Array(C)); col.fill(1e9);
  for(let id=0;id<N;id++) if(d[id]<col[id%C]) col[id%C]=d[id];
  BOT.src=src; }
// места до враг (допирът наранява) и до боса — по-скъпи: пътят ги заобикаля, ако може
function botPen(){ const C=COLS, pen={}, p=player; let o=botOff(); const add=(X,r)=>{ const cx=X.x+X.w/2, fy=X.y+X.h, x0=Math.floor((cx-r)/T), x1=Math.floor((cx+r)/T), y0=Math.floor((X.y-r)/T), y1=Math.ceil((fy+r)/T);
    for(let x=Math.max(0,x0);x<=Math.min(C-1,x1);x++) for(let y=Math.max(1,y0);y<=Math.min(ROWS-1,y1);y++){ const dd=Math.hypot(x*T+8-cx,Math.max(0,Math.max(X.y-y*T,y*T-26-fy))); if(dd<r) pen[o+y*C+x]=(pen[o+y*C+x]||0)+30*(1-dd/r); } };
  for(const e of enemies){ if(e.dead||Math.abs(e.x-p.x)>500) continue; const F=FOES[e.type]; if(F.fixed||(F.bot&&F.bot.contact===false)) continue; add(e,40); }
  if(boss&&!boss.dead&&!(BOSSES[boss.type].bot&&BOSSES[boss.type].bot.contact===false)) add(boss,48);
  for(const q of SHIFT) if(q.st>=0&&q.left<2.5) for(const [x0,y0,x1,y1] of q.st?q.b:q.a) for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++) pen[botOff()+y*C+x]=(pen[botOff()+y*C+x]||0)+40;   // изчезва скоро
  if(ERAD){ o=(1-ERA)*BOT.N; for(const e of ERAD.enem[1-ERA]) if(!e.dead&&Math.abs(e.x-p.x)<500&&!FOES[e.type].fixed) add(e,40); }
  return pen; }
// задачите на механиките (лостове, терминали, курсори) и на боса
function botTasks(){ const L=[]; mechRun('bot',L); if(boss&&!boss.dead){ const H=BOSSES[boss.type].bot; if(H&&H.tasks) for(const q of H.tasks(boss)||[]) L.push(q); } return L; }
function botPathTo(t){ const P=[]; for(let v=t;v>=0;v=BOT.pr[v]){ P.push(v); if(v===BOT.src) break; } return P.reverse(); }

/* ---------- движението: симулация (формулите на updPlayer за земя и въздух) ---------- */
function botS0(){ const p=player, j=lifts.indexOf(p.onLift);
  return {swim:p.swim,x:p.x,y:p.y,w:p.w,h:p.h,vx:p.vx,vy:p.vy,onGround:p.onGround,coyote:p.coyote,dropThrough:p.dropThrough,padT:p.padT||0,crouch:p.crouch,climb:p.climb,T:lvT,lift:j,lp:j>=0?[p.onLift.x,p.onLift.y]:null}; }
// асансьорите в момента t от нивото (liftPos чете lvT)
function botLifts(t){ const L0=lvT; lvT=t; const r=lifts.map(liftPos); lvT=L0; return r; }
function botStep(s,q){ const dt=1/60, dir=q.dir||0; s.T+=dt; let LP=null;
  if(lifts.length){ LP=botLifts(s.T); if(s.lift>=0){ const L=LP[s.lift]; moveX(s,L[0]-s.lp[0]); s.y+=L[1]-s.lp[1]; s.lp=L; } }
  if(q.cr&&!s.crouch&&!s.climb){ s.crouch=true; s.y+=12; s.h=14; } else if(!q.cr&&s.crouch&&!rectSolid(s.x,s.y-12,s.w,26)){ s.crouch=false; s.y-=12; s.h=26; }
  if(s.climb){ s.vx=0; s.vy=q.up?-90:q.dn?90:0; moveY(s,s.vy*dt); return; }   // стълбата — грубо
  const slime=rectHas(s.x,s.y+s.h-6,s.w,6,'~'), max=(s.crouch?55:115)*(slime?0.5:1), acc=s.onGround?1500:900;
  if(dir) s.vx+=clamp(dir*max-s.vx,-acc*dt,acc*dt); else { const fr=(s.onGround?1800:350)*dt; s.vx+=clamp(-s.vx,-fr,fr); }
  if(Math.abs(s.vx)>max&&s.onGround) s.vx*=0.9;
  if(q.jp&&(s.onGround||s.coyote>0)){ if(q.dn&&onOneWay(s)) s.dropThrough=0.25; else { s.vy=JUMP*(slime?0.8:1); s.onGround=false; s.coyote=0; } }
  s.padT=Math.max(0,s.padT-dt); if(!(q.jh||q.jp)&&s.vy<-150&&!(s.padT>0)) s.vy+=(-150-s.vy)*0.35;
  s.vy=Math.min(s.vy+G*dt,520); if(LVL.winds||GWIND) windForce(s,dt);   // вятърът — както mechRun('force')
  moveX(s,s.vx*dt); moveY(s,s.vy*dt);
  s.lift=-1; if(LP&&s.vy>=0&&!(s.dropThrough>0)) for(let j=0;j<LP.length;j++){ const [lx,ly]=LP[j], lw=lifts[j].w; if(s.x+s.w>lx+1&&s.x<lx+lw-1&&s.y+s.h>=ly-2&&s.y+s.h<=ly+10){ s.y=ly-s.h; s.vy=0; s.onGround=true; s.lift=j; s.lp=LP[j]; break; } }
  if(s.onGround) s.coyote=0.08; else s.coyote-=dt;
  s.dropThrough=Math.max(0,s.dropThrough-dt);
  const cv=convAt(s); if(cv) moveX(s,cv*60*dt);
  if(s.onGround&&onTile(s,'^')){ s.vy=-Math.sqrt(2*G*175); s.onGround=false; s.padT=0.9; } }
// посока към x (лявият край на тялото) със спиране навреме
function botSteer(s,tx,dz=1.5){ const dx=tx-s.x; if(Math.abs(dx)<dz) return 0; if(Math.sign(s.vx)===Math.sign(dx)&&s.vx*s.vx/(2*(s.onGround?1800:350))>=Math.abs(dx)) return 0; return Math.sign(dx); }
// скок или падане към P[i0] (или по-нататък по пътя): разбег w кадъра в посока d0, скок, задържане h кадъра, насочване от st
function botPlan(P,i0,air){ const m0=map; if(BOT.simMap) map=BOT.simMap; try{ return botPlan0(P,i0,air); } finally { map=m0; } }
function botPlan0(P,i0,air){ const p=player, C=COLS, b=P[i0], tx=(b%C)*T+8-p.w/2, idx=new Map(), tw=Math.sign(tx-p.x)||p.face, S=[[tw,0,0,0]];
  for(let i=i0;i<P.length;i++) idx.set(P[i],i);
  if(!air) for(const w of [0,3,6,10,14,19,25]) for(const h of [24,12,6,18,3]) for(const st of [0,9]) for(const d0 of [tw,0]) S.push([d0,w,h,st]);
  for(const [d0,w,h,st] of S){ const s=botS0(), inp=[], pos=[]; let air=false, ok=-1;
    for(let i=0;i<160;i++){ let q; if(i<w) q={dir:d0}; else if(!h) q={dir:botSteer(s,tx)}; else { const j=i-w; q={dir:j<st?d0:botSteer(s,tx),jp:j===0,jh:j<h}; }
      inp.push([q.dir,!!q.jp,!!q.jh]); botStep(s,q); pos.push(s.x,s.y);
      if(s.y>ROWS*T||rectHas(s.x,s.y+s.h-6,s.w,6,'~')) break;
      if(!s.onGround){ air=true; continue; }
      if(!air){ if(h?i>=w:i>w+50) break; continue; }
      const m=botNodeOf(s); if(m>=0&&idx.has(m)) ok=i; break; }
    if(ok>=0) return {inp:inp.slice(0,ok+1),pos:pos.slice(0,2*ok+2),i:0,tx}; }
  return null; }

/* ---------- целта ---------- */
const botVuln=()=>{ const H=BOSSES[boss.type].bot; return !(H&&H.vuln&&!H.vuln(boss)); };   // бос с щит — не е цел, но спира изстрела
const botFoes=()=>{ const L=enemies.filter(e=>!e.dead&&e.y<ROWS*T&&!(BOT.ban.get(e)>lvT)); if(boss&&!boss.dead&&bossActive&&!(BOT.ban.get(boss)>lvT)&&botVuln()) L.push(boss); return L; };
const botCxy=X=>[X.x+X.w/2,X===boss?X.y+X.h*0.45:X.y+X.h/2];
// местата, откъдето изстрел (право, клекнал или нагоре) улучва X — {n, face, up, cr}
function botSpots(X,R,e){ const m0=map; if(e!=null&&ERAD&&e!==ERA) map=ERAD.maps[e]; try{ const o=e!=null&&ERAD?e*BOT.N:botOff(), S=botSpots0(X,R,o); return S.length?S:botSpots0(X,R,o,true); } finally { map=m0; } }   // няма място отдалеч — и отблизо
function botSpots0(X,R,o,close){ const V=BOT.g, C=COLS, d=BOT.d, [cx,cy]=botCxy(X), ex=Math.floor(cx/T), r=Math.ceil(R/T), out=[], melee=R<40;
  const near=melee||close?0:X===boss?56:(FOES[X.type]||{}).fixed?0:44;
  for(let x=Math.max(1,ex-r);x<=Math.min(C-2,ex+r);x++) for(let y=1;y<ROWS;y++){ const n=o+y*C+x, k=V.kind[n]; if(!k||d[n]>=1e9||(k===3&&botAcid(n))) continue;
    const px=x*T+8, fy=y*T, face=cx>=px?1:-1; if(Math.abs(cx-px)<near&&Math.abs(cy-(fy-13))<44) continue;
    if(!botSeen(X,botCam(px-8+3,face))) continue;   // оттам целта трябва да е в кадъра
    if(melee){ if(Math.abs(cx-px)<X.w/2+20&&cy>fy-30&&cy<fy+4) out.push({n,face,up:0,cr:0}); continue; }
    for(const [up,cr] of k===2?[[0,1]]:[[0,0],[0,1],[1,0]]){ const ox=px+face*(up?5:9), oy=fy-(cr?10:18)-(up?4:0), dx=cx-ox, dy=cy-oy; if(Math.hypot(dx,dy)>R) continue;
      const base=up?(face>0?-Math.PI/4:-3*Math.PI/4):(face>0?0:Math.PI); if(Math.abs(angDiff(Math.atan2(dy,dx),base))>D.aim*0.8||!botRay(ox-3,oy,cx,cy)||!botRay(ox+3,oy,cx,cy)) continue;
      out.push({n,face,up,cr}); break; } }
  return out; }
// видимото: целта е изцяло в кадъра — ботът стреля само по нея (избягва и невидимите); botCam — къде ще е камерата, ако героят
// стои на x с лице face (както в update(): в арената на боса — заключена)
const botSeen=(X,c=cam,m=8)=>X.x>=c+m&&X.x+X.w<=c+W-m&&X.y>=0&&X.y+X.h<=H;   // m — запас: камерата се движи
const botCam=(px,face)=>bossActive&&boss&&LVL.arena.lock!==false?lockCam():clamp(px+5-W/2+face*36,0,COLS*T-W);
// колона x от ред y0 до y1 без твърда плочка (през платформа '-' се скача отдолу)
function botClear(x,y0,y1){ for(let y=Math.max(0,y0);y<=y1;y++) if(isS(x,y)) return false; return true; }
// линията на изстрела — със стъпката на hitscan (3 px), не по-грубата на los
function botRay(ox,oy,cx,cy){ const L=Math.hypot(cx-ox,cy-oy), dx=(cx-ox)/L, dy=(cy-oy)/L; for(let d=0;d<L-3;d+=3) if(solidAt(ox+dx*d,oy+dy*d)) return false; return true; }
const botWant=k=>{ const p=player; if(k.taken||BOT.ban.get(k)>lvT) return false; if(k.type==='air') return p.air<60;
  if(k.respawn) return k.type==='health'?p.hp<50:k.type==='ammo'?botAmmo()<0.3:false;   // появява се отново — само при нужда
  if(k.type==='health') return p.hp<100; if(k.type==='battery') return p.armor<100; if(k.type==='rockets') return p.ammo.rocket.mag<CAP.rocket; return true; };
function botGoal(){ const p=player, V=BOT.g, C=COLS, d=BOT.d, col=BOT.col, cand=[], cm=x=>{ let m=1e9; for(let i=Math.max(0,x-3);i<=Math.min(C-1,x+3);i++) m=Math.min(m,col[i]); return m; };
  if(p.air!=null&&BOT.free){ if(p.headWet&&p.air<45) BOT.airing=true; else if(p.air>=95||!p.swim) BOT.airing=false; }
  if(BOT.airing&&BOT.free){ let m=-1; const N=V.kind.length;   // въздухът свършва — към повърхността
    for(let n=2*C;n<N;n++) if(d[n]<1e9&&(V.kind[n]&&!BOT.free[n-C]&&!BOT.free[n-2*C]||BOT.free[n]&&!BOT.free[n-C]&&!SOLID.has(tileAt(n%C,botY(n)-1))&&tileAt(n%C,botY(n)-1)!=='w')&&(m<0||d[n]<d[m])) m=n; if(m>=0) return {t:'air',n:m}; }
  if(CHASE&&!CHASE.done){ let m=-1; const N=V.kind.length, ex=LVL.chase.end+1;   // гонитба: само напред (враговете — по пътя)
    for(let n=0;n<N;n++) if(V.kind[n]&&d[n]<1e9&&(n%C>=ex?m<0||m%C<ex||d[n]<d[m]:m<0||m%C<ex&&n%C>m%C)) m=n; if(m>=0) return {t:'run',n:m}; }
  const exX=LVL.exit&&LVL.exit<C?Math.floor(LVL.exit):C-3; let open=!!exitPortal; for(let n=0;n<d.length&&!open;n++) if(d[n]<1e9&&n%C>=exX) open=true;
  if(LVL.needHeal&&sleepersLeft()>0) open=false;   // изходът чака да събудиш всички
  const R=botRange()*0.85, foes=botFoes(), ammo=botAmmo(), back=(x,foe)=>(open||!foe)&&x<BOT.maxX-W;   // назад — най-много един екран от най-далечното място (враг — и по-назад, ако изходът е затворен)
  for(const X of foes){ if(X!==boss&&back(X.x+X.w,1)) continue; const [cx]=botCxy(X); cand.push({X,a:cm(Math.floor(cx/T))-(X.alert&&Math.abs(cx-p.x)<300?15:0)}); }
  if(ERAD) for(const X of ERAD.enem[1-ERA]) if(!X.dead&&X.y<ROWS*T&&!(BOT.ban.get(X)>lvT)&&!back(X.x+X.w,1)) cand.push({X,e:1-ERA,a:cm(Math.floor((X.x+X.w/2)/T))+20});   // враговете от другата епоха
  for(const k of pickups) if(botWant(k)&&!back(k.x+k.w)){ const b=(k.type==='health'?(p.hp<35?-60:p.hp<60?-25:0):k.type==='ammo'&&ammo<0.25?-20:0); cand.push({k,a:cm(Math.floor((k.x+6)/T))+b,b}); }
  const tasks=botTasks(); for(const q of tasks) if(!(BOT.ban.get(q.ref)>lvT)&&!(q.x!=null&&back(q.x+8,1))){ if(!q.any) cand.push({q,a:cm(Math.floor(q.x/T))-10}); else {   // где да е: най-близкото място, откъдето може
      if(!(q.key==='era'&&ERAD)) return {t:'task',q,n:BOT.src,v:0};   // тук и сега; смяна на епохата — откъдето може
      const o=botOff(), N=C*ROWS; let m=-1; for(let n=o;n<o+N;n++) if(d[n]<1e9&&V.kind[n]&&(V.adj[n]||[]).some(b=>(b/N|0)!==(n/N|0))&&(m<0||d[n]<d[m])) m=n; if(m>=0) return {t:'task',q,n:m,v:0}; } }
  cand.sort((u,v)=>u.a-v.a);
  let best=null;
  for(const c of cand.slice(0,6)){
    if(c.X){ const S=botSpots(c.X,R,c.e); let m=null; for(const s of S) if(!m||d[s.n]<d[m.n]) m=s; if(!m){ if(c.a<1e8) BOT.ban.set(c.X,lvT+4); continue; }
      const v=d[m.n]+(c.X.alert?-15:0); if(!best||v<best.v) best={t:'foe',X:c.X,n:m.n,s:m,v}; }
    else if(c.q){ const q=c.q, tx=Math.floor(q.x/T), ty=Math.round(q.fy/T); let m=-1;   // задача: да стои там и да натисне клавиша
      for(let o=0;o<V.kind.length;o+=C*ROWS) for(let x=tx-1;x<=tx+1;x++){ const n=o+ty*C+x; if(x<0||x>=C||!V.kind[n]||d[n]>=1e9||Math.abs(x*T+8-q.x)>12) continue; if(m<0||d[n]<d[m]) m=n; }
      if(m<0){ BOT.ban.set(q.ref,lvT+3); continue; } const v=d[m]-10; if(!best||v<best.v) best={t:'task',q,X:null,k:null,n:m,v}; }
    else { const k=c.k, tx=Math.floor((k.x+6)/T); let m=-1, jump=false;
      for(let o=0;o<V.kind.length;o+=C*ROWS) for(let x=tx-1;x<=tx+1;x++) for(let y=1;y<ROWS;y++){ const n=o+y*C+x; if(x<0||x>=C||!V.kind[n]||d[n]>=1e9) continue; const fy=y*T, ov0=fy>k.y+1&&fy-26<k.y+k.h-1&&Math.abs(x*T+8-(k.x+6))<12, jp=!ov0&&fy>k.y&&fy-26-62<k.y+k.h&&Math.abs(x*T+8-(k.x+6))<10&&botClear(x,Math.floor(k.y/T),y-2)&&botClear(Math.floor((k.x+6)/T),Math.floor(k.y/T),y-2);   // скок до предмета — без таван между
        if((ov0||jp)&&(m<0||d[n]+(jp?4:0)<d[m]+(jump?4:0))){ m=n; jump=jp; } }
      if(BOT.free) for(let o=0;o<V.kind.length;o+=C*ROWS) for(let x=tx-1;x<=tx+1;x++) for(let y=Math.floor(k.y/T)-1;y<=Math.floor(k.y/T)+1;y++){ const n=o+y*C+x; if(x<0||x>=C||y<0||y>=ROWS||!BOT.free[n]||d[n]>=1e9) continue; if(Math.abs(x*T+8-(k.x+6))<12&&(m<0||d[n]<d[m])){ m=n; jump=false; } }
      if(m<0){ BOT.ban.set(k,lvT+6); continue; } const v=d[m]+(jump?4:0)+c.b; if(!best||v<best.v) best={t:'item',k,n:m,jump,v}; } }
  if(!best&&boss&&!boss.dead&&bossActive){ let m=null; for(const s of botSpots(boss,R)) if(d[s.n]<1e9&&(!m||d[s.n]<d[m.n])) m=s; if(m) best={t:'foe',X:boss,n:m.n,s:m,v:0}; }   // босът с щит — чакай на място за стрелба
  if(best) return best;
  // изход: портал, колоната на изхода или най-вдясно (там е и арената на боса)
  let m=-1; const N=V.kind.length;
  if(exitPortal){ for(let n=0;n<N;n++) if(V.kind[n]&&d[n]<1e9&&Math.abs((n%C)*T+8-exitPortal.x)<12&&Math.abs(botY(n)*T-13-exitPortal.y)<20&&(m<0||d[n]<d[m])) m=n; if(m>=0) return {t:'portal',n:m}; }
  const ex=LVL.exit&&LVL.exit<C?Math.floor(LVL.exit):-1;
  for(let n=0;n<N;n++) if(V.kind[n]&&d[n]<1e9&&(ex>=0?n%C>=ex&&(m<0||d[n]<d[m]):(m<0||n%C>m%C))) m=n;
  if(m>=0) return {t:'exit',n:m};
  // изходът е зад врата: първо неизпълнените тригери (сражение, което я отваря), после най-вдясно
  for(const tr of triggers.filter(t=>!t.done&&(!t.cond||t.cond())).sort((a,b)=>a.x-b.x)){ for(let n=0;n<N;n++) if(V.kind[n]&&d[n]<1e9&&n%C>tr.x&&(m<0||d[n]<d[m])) m=n; if(m>=0) return {t:'trig',n:m}; }
  for(let n=0;n<N;n++) if(V.kind[n]&&d[n]<1e9&&(m<0||n%C>m%C)) m=n;
  return m>=0?{t:'far',n:m}:null; }

/* ---------- бой ---------- */
const botHas=w=>player.weapons[w]&&WEAPONS[w]&&(WEAPONS[w].kind==='melee'||hasAmmo(w));
function botAmmo(){ const p=player; let a=0; for(const w of ['pistol','pulse','shotgun']) if(p.weapons[w]) a+=(p.ammo[w].mag+p.ammo[w].res)/(CAP[w]+RES_MAX[w]); return a; }
function botRange(){ let r=0; for(const w of ['pistol','pulse','shotgun','rocket']) if(botHas(w)) r=Math.max(r,BOT_RNG[w]); return r||BOT_RNG.wrench; }
function botWeap(X,dist){ const big=X&&(X===boss||X.hp>=150), has=botHas; if(!X) dist=200;
  if(big&&has('rocket')&&dist>110&&dist<440) return 'rocket';
  if(X&&dist<130&&has('shotgun')) return 'shotgun';
  for(const w of ['pulse','pistol','shotgun']) if(has(w)&&dist<BOT_RNG[w]) return w;
  if(has('rocket')&&dist>110) return 'rocket';
  return has('pistol')?'pistol':'wrench'; }
// кого улучва изстрел оттук в посока face (up — нагоре, cr — клекнал): като autoAim + hitscan, без последици
function botTrace(face,up,cr){ const t=botTrace0(face,up,cr); return t&&botSeen(t.w?t:{x:t.x-3,y:t.y-3,w:6,h:6})?t:null; }   // само по видимото
function botTrace0(face,up,cr){ const p=player, w=p.cur, G0=WEAPONS[w], feet=p.y+p.h;
  if(G0.kind==='melee'){ const hb={x:face>0?p.x+p.w:p.x-20,y:feet-26,w:20,h:26}; for(const e of enemies) if(!e.dead&&ov(hb,e)) return e; return boss&&!boss.dead&&ov(hb,boss)?boss:null; }
  if(w==='grenade') return null;
  const R=BOT_RNG[w]||400, ox=p.x+p.w/2+face*(up?5:9), oy=feet-(cr?10:18)-(up?4:0), base=up?(face>0?-Math.PI/4:-3*Math.PI/4):(face>0?0:Math.PI);
  const a=autoAim(ox,oy,base,R), dx=Math.cos(a), dy=Math.sin(a), L=enemies.filter(e=>!e.dead&&Math.abs(e.x-ox)<R+20), B=barrels.filter(b=>!b.dead&&Math.abs(b.x-ox)<R+20);
  for(let d=0;d<R;d+=3){ const x=ox+dx*d, y=oy+dy*d; if(solidAt(x,y)) return null;
    for(const e of L) if(x>=e.x&&x<=e.x+e.w&&y>=e.y&&y<=e.y+e.h) return e.fq!=null&&LVL.freq&&e.fq!==FREQ?null:e;
    for(const b of B) if(x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h) return d<100?null:b;
    for(const m of bmiss) if(!m.dead&&Math.abs(x-m.x)<5&&Math.abs(y-m.y)<5) return m;
    if(boss&&!boss.dead&&x>=boss.x+4&&x<=boss.x+boss.w-4&&y>=boss.y&&y<=boss.y+boss.h) return botVuln()?boss:null; }
  return null; }
const botLadder=()=>{ const p=player; return ladderAt(p.x+p.w/2,p.y+p.h-2); };
// оръжие и стрелба; при враг на мушка героят спира (ако може — клекнал) и стреля
function botFight(mv){ const p=player; if(p.climb) return mv;
  const G0=BOT.goal, X=G0&&G0.t==='foe'?G0.X:null, dist=X?Math.hypot(botCxy(X)[0]-p.x-5,botCxy(X)[1]-p.y-13):999;
  BOT.wT-=1/60;
  if(BOT.wT<=0&&!BOT.prog){ let near=X, nd=dist; for(const e of botFoes()){ const dd=Math.hypot(e.x+e.w/2-p.x-5,e.y+e.h/2-p.y-13); if(e.alert&&dd<nd){ near=e; nd=dd; } }
    const w=botWeap(near,nd); if(w!==p.cur&&p.weapons[w]&&(p.reload<=0||nd<200)){ mv.wk='w'+(ORDER.indexOf(w)+1); BOT.wT=0.8; } }
  if(p.cur==='grenade'||(BOT.prog&&(p.cur==='shotgun'||p.cur==='rocket'))) return mv;   // отката разваля скока
  const up=!!mv.up&&!botLadder(), hostile=t=>t&&t!=='barrel'&&!barrels.includes(t);
  let t=botTrace(p.face,up,p.crouch);
  if(hostile(t)){ mv.fire=true; botShotT(t); }
  if(p.swim){ if(!hostile(t)&&!(BOT.goal&&BOT.goal.t==='air')&&hostile(botTrace(-p.face,0,0))) mv.dir=-p.face; return mv; }   // във водата — само обръщане
  if(BOT.prog||!p.onGround||CHASE&&!CHASE.done) return mv;   // в гонитба не спира
  // друга стойка или посока: спира и стреля
  const opts=[[p.face,0,1],[p.face,0,0],[p.face,1,0],[-p.face,0,1],[-p.face,0,0],[-p.face,1,0]];
  for(const [f,u,c] of opts){ if(u&&botLadder()) continue;
    const tt=f===p.face&&!!u===up&&!!c===p.crouch?t:botTrace(f,u,c); if(!hostile(tt)) continue;
    const imp=tt.alert||tt===boss||tt===X||Math.abs(tt.x-p.x)<260; if(!imp) continue;
    if(BOT.ban.get(tt)>lvT) continue;
    return {dir:f!==p.face?f:0,up:u,cr:c,fire:f===p.face&&!!u===up&&!!c===p.crouch,wk:mv.wk,pol:()=>({dir:0,cr:c,up:u})}; }
  return mv; }
// стрелба по t: ако здравето му не пада 5 s — не се улучва (честота, неуязвимост): настрана за малко
function botShotT(t){ if(t!==BOT.shot){ BOT.shot=t; BOT.shotHp=t.hp; BOT.shotT=lvT; return; } if(t.hp<BOT.shotHp-0.5){ BOT.shotHp=t.hp; BOT.shotT=lvT; BOT.progT=lvT; } else if(lvT-BOT.shotT>5){ BOT.ban.set(t,lvT+(t===boss?2:8)); BOT.shot=null; } }

/* ---------- изпълнение на пътя ---------- */
const BOT_0={dir:0};
function botWalk(tx,cr){ const p=player; return {dir:botSteer(p,tx,2),cr,pol:(i,s)=>({dir:botSteer(s,tx,2),cr})}; }
function botMove(n){ const p=player, V=BOT.g, C=COLS, P=BOT.path;
  if(BOT.prog){ const g=BOT.prog, i=g.i;
    if(i>0&&(Math.abs(p.x-g.pos[2*i-2])>1.5||Math.abs(p.y-g.pos[2*i-1])>1.5)){ BOT.air=g.tx; BOT.prog=null; }
    else if(i<g.inp.length){ g.i++; const [dir,jp,jh]=g.inp[i]; return {dir,jp,jh,pol:(k,s)=>{ const q=g.inp[i+k]; return q?{dir:q[0],jp:q[1],jh:q[2]}:{dir:botSteer(s,g.tx)}; }}; }
    else BOT.prog=null; }
  if(p.climb){ const b=P[1]; return b!=null&&botY(b)*T<p.y+p.h-1?{up:1}:{dn:1}; }
  if(BOT.wind&&(n>=0&&BOT.wind[n]||P.length>1&&P[0]===n&&BOT.wind[P[1]])){ let j=Math.max(0,P.indexOf(n))+1; while(j<P.length-1&&BOT.wind[P[j]]) j++; j=Math.min(j,P.length-1);   // течението: към първото място след него
    const tx=(P[j]%C)*T+8-p.w/2; return {dir:Math.abs(tx-p.x)>3?Math.sign(tx-p.x):0,jh:!p.onGround}; }
  if(BOT.free&&(p.swim||P.length>1&&P[0]===n&&BOT.free[P[1]])) return botSwim(n);
  if(p.onLift){ const l=p.onLift, b=P[1];   // на асансьора: в средата, докато стигне следващото място
    if(n<0||P[0]!==n||b==null||V.virt[b]&&!(botY(b)===botY(n)&&Math.abs(b%C-n%C)===1)) return botWalk(l.x+l.w/2-p.w/2); }
  const pad=n>=0&&p.padT>0.8;   // батутът: тъкмо отскочил — като от земята (насочване във въздуха към следващото място)
  if(!p.onGround&&!pad){ if(P.length>1&&lvT-(BOT.airT||0)>0.15){ BOT.airT=lvT; const g=botPlan(P,1,true); if(g){ BOT.prog=g; g.i=1; const [dir,jp,jh]=g.inp[0]; return {dir,jp,jh}; } }
    const tx=BOT.air; return tx==null?BOT_0:{dir:botSteer(p,tx),jh:p.vy<0,pol:(i,s)=>({dir:botSteer(s,tx)})}; }
  BOT.air=null;
  if(n<0||!P.length||P[0]!==n) return BOT_0;
  if(P.length<2) return botArrive();
  if(BOT.N&&botLay(P[0])!==botLay(P[1])) return {era:1};   // смяна на епохата
  if(LVL.tone&&SOLID.has('t')){ const ax=P[0]%C, ay=botY(P[0]), bx=P[1]%C, by=botY(P[1]);   // тонова врата по пътя — тон (E) и чакай
    for(let x=Math.min(ax,bx);x<=Math.max(ax,bx);x++) for(let y=Math.max(0,Math.min(ay,by)-2);y<Math.max(ay,by);y++) if(map[y][x]==='t') return {era:1}; }
  if(BOT.tele.has(P[0]*1e5+P[1])){ const tx=(P[0]%C)*T+8-p.w/2; return Math.abs(p.x-tx)>2?botWalk(tx):{era:1}; }   // телепорт
  const a=P[0], b=P[1], ax=a%C, ay=botY(a), bx=b%C, by=botY(b);
  if(V.virt[b]&&!V.virt[a]){ const l=lifts.find(l=>Math.abs(l.y-by*T)<1.5&&bx*T>=l.x-1&&bx*T<l.x+l.w-1); if(!l) return BOT_0; }   // асансьорът още не е тук
  if(V.virt[a]&&V.virt[b]&&!(by===ay&&Math.abs(bx-ax)===1)) return p.onLift?botWalk(p.onLift.x+p.onLift.w/2-p.w/2):BOT_0;
  if(by===ay&&Math.abs(bx-ax)===1){ let j=1, cr=V.kind[a]===2||V.kind[b]===2;
    while(j+1<P.length){ const q=P[j+1]; if(botY(q)===ay&&Math.abs(q%C-P[j]%C)===1&&!V.virt[q]){ j++; if(V.kind[q]===2) cr=true; } else break; }
    const t=P[j]; return botWalk(j===P.length-1?botGoalX(t):(t%C)*T+8-p.w/2,cr); }
  const lx=ax*T+8-p.w/2;
  if(bx===ax&&by<ay&&tileAt(ax,ay-1)==='H') return Math.abs(p.x-lx)>3?botWalk(lx):{up:1};   // стълба нагоре
  if(bx===ax&&by>ay&&(tileAt(ax,ay)==='-'||tileAt(ax,ay)==='H')) return Math.abs(p.x-lx)>2?botWalk(lx):tileAt(ax,ay)==='H'?{dn:1}:{dn:1,jp:1,jh:1};   // надолу
  const g=botPlan(P,1); if(g){ BOT.prog=g; g.i=1; const [dir,jp,jh]=g.inp[0]; return {dir,jp,jh,pol:(k,s)=>{ const q=g.inp[k]; return q?{dir:q[0],jp:q[1],jh:q[2]}:{dir:botSteer(s,g.tx)}; }}; }
  BOT.bad.add(a*1e5+b); BOT.re=0; return BOT_0; }
// във водата (и в безтегловност): към центъра на следващата клетка; на повърхността — скок към брега
function botSwim(n){ const p=player, C=COLS, P=BOT.path, F=BOT.free, cx=p.x+p.w/2, cy=p.y+p.h/2;
  let i=P.indexOf(n); if(i<0) i=0; const b=P[Math.min(i+1,P.length-1)]; if(b==null) return BOT_0;
  const bx=b%C, by=botY(b), g=BOT.goal;
  if(F[b]||!p.swim){ let tx=bx*T+8, ty=by*T+8; if(b===P[P.length-1]&&g&&g.t==='item'){ tx=g.k.x+6; ty=g.k.y+5; }
    for(const x of [bx,Math.floor(cx/T)]){ let r=by; while(r>=0&&!isS(x,r)) r--; let f=by; while(f<ROWS&&!isS(x,f)) f++; ty=clamp(ty,(r+1)*T+14,f*T-14); }   // тялото (26 px) да се побере
    if(!p.swim) return Math.abs(tx-cx)>3?botWalk(tx-p.w/2):(ty<p.y?{jp:1,jh:1}:{dn:1});
    return {dir:Math.abs(tx-cx)>3?Math.sign(tx-cx):0,up:ty<cy-3,dn:ty>cy+3}; }
  const tx=bx*T+8, top=by*T, surf=!isWater(cx,p.y-8);   // мястото на брега
  if(surf&&Math.abs(tx-cx)<3.5*T&&top<=p.y+p.h+4){ BOT.air=tx-p.w/2; return {dir:Math.sign(tx-cx),jp:1,jh:1}; }
  return {dir:Math.abs(tx-cx)>3?Math.sign(tx-cx):0,up:top<p.y+p.h-2,dn:top>p.y+p.h+2}; }
// на крайното място: точният x за целта
function botGoalX(n){ const p=player, g=BOT.goal, x=(n%COLS)*T+8-p.w/2; if(!g) return x;
  if(g.t==='item') return clamp(g.k.x+6-p.w/2,x-6,x+6); if(g.t==='portal') return clamp(exitPortal.x-p.w/2,x-6,x+6); return x; }
function botArrive(){ const p=player, g=BOT.goal; if(!g) return BOT_0;
  if(g.t==='foe'){ const s=g.s, tx=(g.n%COLS)*T+8-p.w/2; if(Math.abs(p.x-tx)>2.5) return botWalk(tx,s.cr); return {dir:s.face!==p.face?s.face:0,up:s.up,cr:s.cr,pol:()=>({dir:0,cr:s.cr})}; }
  if(g.t==='item'){ const tx=g.k.x+6-p.w/2; if(g.jump&&Math.abs(p.x-tx)<3){ if(p.onGround){ const k=g.k; k.botJ=(k.botJ||0)+1; if(k.botJ>2){ BOT.ban.set(k,lvT+30); BOT.re=0; return BOT_0; } }   // два неуспешни скока — стига
      return {jp:1,jh:1,pol:(i,s)=>({jp:i===0,jh:i<24,dir:botSteer(s,tx)})}; } return botWalk(tx); }
  if(g.t==='task'&&g.q.any) return g.q.key==='up'?{up:1}:{era:1};
  if(g.t==='task'){ const q=g.q, tx=q.x-p.w/2; if(Math.abs(p.x-tx)>2.5) return botWalk(tx); if(q.key==='rec') return {era:ECHO.mode!=='rec'||ECHO.t>0.35};   // ехо: изчисти, запиши миг стоене, пусни
    return q.key==='up'?{up:q.hold?1:!keys.up}:{era:1}; }
  if(g.t==='portal'){ const tx=exitPortal.x-p.w/2; return Math.abs(p.x-tx)<3&&exitPortal.y<p.y?{jp:1,jh:1}:botWalk(tx); }
  return {dir:LVL.exit&&LVL.exit*T<p.x?0:1}; }

// честотите: тонът на платформата под краката (не я сменяй), на следващото място и стените по пътя; врагът — в своя тон
function botFreq(mv){ if(!LVL.freq||ERAD||!BOT.g) return mv; const p=player, n=LVL.freqN||3, C=COLS, P=BOT.path, dig=(x,y)=>{ const c=tileAt(x,y); return c==='1'||c==='2'||c==='3'?+c-1:-1; };
  const fy=Math.floor((p.y+p.h+1)/T), x0=Math.floor(p.x/T), x1=Math.floor((p.x+p.w-0.01)/T); let need=-1, on=false;
  if(p.onGround) for(let x=x0;x<=x1;x++){ const d=dig(x,fy); if(d>=0){ need=d; on=true; } }
  if(!on){ const b=P.length>1?P[1]:P[0]; if(b!=null){ const d=dig(b%C,botY(b)); if(d>=0) need=d; } }
  if(need<0){ const dir=mv.dir||(p.vx>20?1:p.vx<-20?-1:0); if(dir){ const wx=Math.floor((dir>0?p.x+p.w+3:p.x-3)/T); for(let y=Math.floor(p.y/T);y<=Math.floor((p.y+p.h-1)/T);y++) if(dig(wx,y)===FREQ) need=(FREQ+1)%n; } }
  const g=BOT.goal; if(need<0&&g&&g.t==='foe'&&g.X.fq!=null&&P.length<=1) need=g.X.fq;
  if(need>=0&&need!==FREQ&&!on) mv.era=1;
  return mv; }
/* ---------- защита: прогноза на опасностите и избор на маневра ---------- */
function botThreats(){ const L=[], p=player, Fz=chtOn('freeze');
  if(!Fz){ for(const b of ebullets){ if(b.fq!=null&&b.fq===FREQ) continue; L.push({k:0,x:b.x,y:b.y,vx:b.vx,vy:b.vy,g:!!b.grav,h:!!b.hornet,r:b.r||0,d:b.dmg||7,life:b.life}); }
    for(const o of orbs) L.push({k:1,x:o.x,y:o.y,vx:o.vx,r:o.r,d:12,life:o.life});
    for(const m of bmiss) if(!m.dead) L.push({k:3,x:m.x,y:m.y,vx:m.vx,vy:m.vy,t:m.t,life:m.life,d:15}); }
  for(const g of grenades) L.push({k:2,x:g.x,y:g.y,vx:g.vx,vy:g.vy,t:g.t,imp:!!g.impact,R:g.impact?56:66,d:g.impact?55:g.own?100:70});
  for(const b of barrels) if(!b.dead&&b.fuse>=0) L.push({k:4,x:b.x+6,y:b.y+8,t:b.fuse,R:74,d:90});
  for(const e of enemies){ if(e.dead||Math.abs(e.x-p.x)>300||Math.abs(e.y-p.y)>240) continue; const F=FOES[e.type], H=F.bot;
    if(H&&H.threats&&!Fz) for(const o of H.threats(e)||[]) L.push({k:9,...o});
    if(F.fixed||(H&&H.contact===false)||Fz||e.stunT>0) continue;
    L.push({k:6,x:e.x-3,y:e.y,w:e.w+6,h:e.h,vx:e.vx,vy:e.vy,g:!F.fly&&!e.onGround,d:10}); }
  if(boss&&!boss.dead&&!Fz){ const H=BOSSES[boss.type].bot; if(H&&H.threats) for(const o of H.threats(boss)||[]) L.push({k:9,...o});
    if(!(H&&H.contact===false)) L.push({k:6,x:boss.x+4,y:boss.y+4,w:boss.w-8,h:boss.h-8,vx:boss.vx||0,vy:boss.vy||0,g:false,d:20}); }
  for(const t of trains) L.push({k:7,x:t.x,dir:t.dir,sp:trainSpd()*(t.tr.fast?1.2:1),tr:t.tr,d:55});
  for(const tr of tracks) if(tr.t<1&&!chtOn('traps')&&player.x>(tr.x0-16)*T&&player.x<(tr.x1+16)*T) L.push({k:7,x:tr.dir>0?tr.x0*T-TL:(tr.x1+1)*T,dir:tr.dir,sp:trainSpd()*(tr.fast?1.2:1),tr,t0:tr.t,d:55});
  return L; }
// траекториите, които не зависят от героя (изстрели без насочване, гранати, бъчви, враговете, влаковете) — веднъж за кадъра
function botTraj(th){ const dt=1/60, ef=dt*foeTime;
  for(const o of th){ if(o.k===3||o.k===9||(o.k===0&&o.h)) continue; const P=o.P=new Float32Array(BOT_K*2); o.end=BOT_K; let x=o.x, y=o.y, vx=o.vx, vy=o.vy||0, t=o.t, life=o.life;
    for(let i=0;i<BOT_K;i++){
      if(o.k<=1){ if(o.g) vy+=G*ef; x+=vx*ef; y+=vy*ef; life-=ef; if(life<=0||solidAt(x,y)){ o.end=i; break; } }
      else if(o.k===2){ vy+=G*dt; const nx=x+vx*dt; if(solidAt(nx,y)) vx*=-0.45; else x=nx; const ny=y+vy*dt; if(solidAt(x,ny)){ if(o.imp) t=0; vy*=-0.4; vx*=0.7; } else y=ny; t-=dt; if(t<=0){ o.end=i; o.ex=x; o.ey=y; break; } }
      else if(o.k===4){ t-=dt; if(t<=0){ o.end=i; o.ex=x; o.ey=y; break; } }
      else if(o.k===6){ if(o.g) vy=Math.min(vy+G*ef,520); x+=vx*ef; y+=vy*ef; if(o.g&&rectSolid(x+3,y,o.w-6,o.h)){ y-=vy*ef; vy=0; } }
      else if(o.k===7){ const tt=(i+1)*dt; if(o.t0!=null&&tt<o.t0){ x=y=-1; } else { const xx=o.x+o.dir*o.sp*(tt-(o.t0||0)); x=Math.max(xx,o.tr.x0*T); y=Math.min(xx+TL,(o.tr.x1+1)*T); } }
      P[2*i]=x; P[2*i+1]=y; } } }
// щетата по героя за BOT_K кадъра при поведение pol(i,s) → вход
function botRisk(pol,th){ const m0=map; if(BOT.simMap) map=BOT.simMap; try{ return botRisk0(pol,th); } finally { map=m0; } }
function botRisk0(pol,th){ BOT.endX=null; const s=botS0(), dt=1/60, ef=dt*foeTime, L0=lvT, H=th.filter(o=>!o.P).map(o=>({...o})), dead=new Uint8Array(th.length); let dmg=0, cont=0, shf=0;
  const box=(x,y,w,h)=>s.x<x+w&&s.x+s.w>x&&s.y<y+h&&s.y+s.h>y, haz=lasers.length||vents.length||crushers.length||zTiles.length;
  try{
  for(let i=0;i<BOT_K;i++){ botStep(s,pol(i,s)); const t=(i+1)*dt, wt=1-i/(BOT_K*2), cx=s.x+s.w/2, cy=s.y+s.h/2;
    if(s.y>ROWS*T) return dmg+1000;
    if(BOT.free&&isWater(s.x+s.w/2,s.y+s.h*0.8)) break;   // във водата се плува — симулацията спира
    for(let j=0;j<th.length;j++){ const o=th[j], P=o.P; if(!P||dead[j]) continue; let hit=false;
      if(i>=o.end){ dead[j]=1; if(i===o.end&&o.ex!=null){ const dd=Math.hypot(cx-o.ex,cy-o.ey); if(dd<o.R+6) dmg+=(o.d*(1-dd/(o.R+6))+12)*wt; } continue; }
      const x=P[2*i], y=P[2*i+1];
      if(o.k<=1){ const nx=clamp(x,s.x,s.x+s.w), ny=clamp(y,s.y,s.y+s.h); hit=Math.hypot(nx-x,ny-y)<=o.r+2; }
      else if(o.k===6) hit=box(x,y,o.w,o.h);
      else if(o.k===7) hit=y>x&&box(x,13*T+2,y-x,2*T-2);
      if(hit){ dmg+=o.d*wt; dead[j]=1; } }
    for(const o of H){ if(o.dead) continue; let hit=false;
      if(o.k===0){ const sp=Math.hypot(o.vx,o.vy), cur=Math.atan2(o.vy,o.vx), tg=Math.atan2(cy-o.y,cx-o.x), na=cur+clamp(angDiff(tg,cur),-D.hTurn*dt,D.hTurn*dt); o.vx=Math.cos(na)*sp; o.vy=Math.sin(na)*sp;   // насочващ се
        if(o.g) o.vy+=G*ef; o.x+=o.vx*ef; o.y+=o.vy*ef; o.life-=ef; if(o.life<=0||solidAt(o.x,o.y)){ o.dead=1; continue; }
        const nx=clamp(o.x,s.x,s.x+s.w), ny=clamp(o.y,s.y,s.y+s.h); hit=Math.hypot(nx-o.x,ny-o.y)<=o.r+2; }
      else if(o.k===3){ o.t+=ef; o.life-=ef; const sp=Math.hypot(o.vx,o.vy); if(o.t>0.5){ const cur=Math.atan2(o.vy,o.vx), na=cur+clamp(angDiff(Math.atan2(cy-o.y,cx-o.x),cur),-D.mTurn*ef,D.mTurn*ef), ns=Math.min(D.mSpd,sp+60*ef); o.vx=Math.cos(na)*ns; o.vy=Math.sin(na)*ns; }
        o.x+=o.vx*ef; o.y+=o.vy*ef; if(o.life<=0||(o.t>0.3&&solidAt(o.x,o.y))){ o.dead=1; continue; } hit=o.x>s.x-5&&o.x<s.x+s.w+5&&o.y>s.y-5&&o.y<s.y+s.h+5; }
      else if(o.k===9) hit=o.hit(s,t);
      if(hit){ dmg+=o.d*wt; o.dead=1; } }
    if(haz){ lvT=L0+t;   // капаните — по формулите им, с времето на нивото след t
      for(const l of lasers) if(!l.botH&&lzState(l)===2&&box(l.tx*T+5,l.r0*T,6,(l.r1-l.r0+1)*T)){ dmg+=20*wt; l.botH=1; }
      for(const v of vents) if(vtState(v)===2&&box(v.tx*T+1,15*T-75,14,75)) cont+=8/15;
      for(const c of crushers){ const r=crRect(c); if(!c.botH&&r.pos>0.2&&box(r.x-1,r.y-2,r.w+2,r.h+2)){ dmg+=60*wt; c.botH=1; } }
      if(s.onGround&&elecOn()&&onTile(s,'Z')) cont+=8/12;
      lvT=L0; }
    if(rectHas(s.x,s.y+s.h-6,s.w,6,'~')) cont+=9/15*3;
    if(!shf&&SHIFT.length&&s.onGround&&botShiftGone(s,t)){ shf=1; dmg+=300*wt; } }
  } finally { lvT=L0; for(const l of lasers) l.botH=0; for(const c of crushers) c.botH=0; }
  for(let i=BOT_K;i<BOT_K+90&&!s.onGround&&!s.climb&&!(BOT.free&&isWater(s.x+s.w/2,s.y+s.h*0.8));i++){ botStep(s,pol(i,s)); if(s.y>ROWS*T) return dmg+500; }   // във въздуха: докъде пада
  BOT.endX=s.x; return dmg+cont*D.haz; }
// подвижните зали (SHIFT): след s.left секунди сегашните им правоъгълници изчезват — стои ли s на такъв след t
const botInR=(R,x,y)=>R.some(([x0,y0,x1,y1])=>x>=x0&&x<=x1&&y>=y0&&y<=y1);
function botShiftGone(s,t){ const fy=Math.floor((s.y+s.h+1)/T), x0=Math.floor(s.x/T), x1=Math.floor((s.x+s.w-0.01)/T);
  for(const q of SHIFT){ if(q.st<0||!(q.left<t)) continue; const R=q.st?q.b:q.a; let all=true; for(let x=x0;x<=x1;x++) if(SOLID.has(tileAt(x,fy))&&!botInR(R,x,fy)) all=false; if(all&&botInR(R,x0,fy)||all&&botInR(R,x1,fy)) return true; }
  return false; }
// има ли наблизо капан или киселина (иначе без изстрели няма какво да се предвижда)
function botHazNear(){ const p=player, cx=Math.floor((p.x+5)/T), near=x=>Math.abs(x-p.x)<360;
  if(SHIFT.length||lasers.some(l=>near(l.tx*T))||vents.some(v=>near(v.tx*T))||crushers.some(c=>near(c.tx*T))||zTiles.some(([x])=>Math.abs(x-cx)<20)||trains.length||tracks.some(tr=>tr.t<1)) return true;
  for(let x=cx-8;x<=cx+8;x++) for(let y=0;y<ROWS;y++) if(tileAt(x,y)==='~') return true; return false; }
function botDodge(mv){ const p=player; if(p.climb||p.dead||p.swim) return mv;   // плуването симулацията не го знае
  const th=botThreats(); if(!th.length&&!botHazNear()){ BOT.dodge=null; return mv; }
  botTraj(th); const plan=mv.pol||(()=>({dir:mv.dir,cr:mv.cr,jh:mv.jh})), r0=botRisk((i,s)=>i===0?mv:plan(i,s),th);
  if(r0<0.5){ BOT.dodge=null; return mv; }
  const C=[];
  if(BOT.dodge){ const d=BOT.dodge; C.push([d.f,d.i]); }
  if(p.onGround) for(const f of [()=>({dir:0}),()=>({dir:0,cr:1}),i=>({jp:i===0,jh:i<20}),i=>({dir:-1,jp:i===0,jh:i<20}),i=>({dir:1,jp:i===0,jh:i<20}),()=>({dir:-1}),()=>({dir:1}),
    ()=>({dir:-1,cr:1}),()=>({dir:1,cr:1}),i=>({jp:i===0,jh:i<5}),i=>({jp:i===10,jh:i>=10&&i<30}),i=>({jp:i===22,jh:i>=22&&i<42}),i=>({dir:-1,jp:i===0,jh:i<6}),i=>({dir:1,jp:i===0,jh:i<6}),
    i=>({dir:i<12?-1:0}),i=>({dir:i<12?1:0})]) C.push([f,0]);
  else for(const d of [-1,0,1]){ C.push([()=>({dir:d,jh:1}),0]); C.push([()=>({dir:d}),0]); }
  let best=null, bv=r0-0.5;
  const x0=p.x, pd=BOT.path.length>1?Math.sign((BOT.path[BOT.path.length-1]%COLS)*T-x0):0;   // назад (срещу пътя) — само ако спестява явно повече
  for(const [f,i0] of C){ let v=botRisk((i,s)=>f(i+i0,s),th); if(pd&&BOT.endX!=null&&Math.sign(BOT.endX-x0)===-pd&&Math.abs(BOT.endX-x0)>8) v+=6; if(v<bv){ bv=v; best=[f,i0]; } }
  if(!best){ BOT.dodge=null; return mv; }
  const [f,i0]=best; BOT.dodge={f,i:i0+1}; if(BOT.prog){ BOT.air=BOT.prog.tx; BOT.prog=null; }
  const q=f(i0,botS0()); return {...q,fire:mv.fire,wk:mv.wk,up:mv.up&&!q.dn}; }

/* ---------- кадърът ---------- */
function botKeys(q){ const set=(k,v)=>{ v=!!v; if(v&&!keys[k]) pressed[k]=true; keys[k]=v; };
  set('left',q.dir<0); set('right',q.dir>0); set(FLIP?'down':'up',q.up); set(FLIP?'up':'down',q.dn); set('crouch',q.cr); set('fire',q.fire);
  keys.jump=!!(q.jh||q.jp); if(q.jp) pressed.jump=true; if(q.wk) pressed[q.wk]=true; set('era',q.era&&!keys.era); }
function botTick(){ const p=player; if(!p||!LVL) return;
  if(p.dead&&!BOT.wasDead){ let e0=null, dd=1e9; for(const e of enemies) if(!e.dead){ const d=Math.hypot(e.x-p.x,e.y-p.y); if(d<dd){ dd=d; e0=e; } }   // за проверката: къде и до какво загина
    (BOT.dlog=BOT.dlog||[]).push([Math.floor(p.x/T),Math.floor(p.y/T),e0?e0.type+'@'+Math.round(dd):'',boss&&!boss.dead?boss.type+':'+boss.state:'',ebullets.length?'изстр.'+ebullets.length:'',p.y>ROWS*T-30?'яма':''].filter(Boolean).join(' ')); }
  BOT.wasDead=p.dead; BOT.maxX=Math.max(BOT.maxX||0,p.x);
  if(p.dead||intro.lock>0){ botKeys(BOT_0); BOT.prog=null; BOT.dodge=null; return; }
  if(BOT.lvl!==LVL){ BOT.lvl=LVL; BOT.dlog=[]; BOT.airing=false; BOT.maxX=player.x; BOT.why=''; BOT.progT=lvT;BOT.nT=lvT; BOT.sig=-1; BOT.ban.clear(); BOT.bad.clear(); BOT.g=null; BOT.goal=null; BOT.bestT=lvT; BOT.idleT=0; BOT.stuck=0; BOT.gave=false; }
  if(!BOT.g||!botMapOk()||BOT.gv!==botGv()) botGraph();
  let n=botNodeOf(p); if(n>=0){ BOT.n=n; BOT.nT=lvT; }
  else if(!BOT.prog&&lvT-(BOT.nT||0)>1.5&&(p.onGround||p.swim)){ const o=botOff(), cx=Math.floor((p.x+p.w/2)/T), cy=Math.floor((p.y+p.h)/T);   // дълго без място — най-близкото
    for(let r=0;r<3&&n<0;r++) for(let y=cy-r;y<=cy+r&&n<0;y++) for(let x=cx-r;x<=cx+r;x++){ const id=o+y*COLS+x; if(y>0&&y<ROWS&&x>=0&&x<COLS&&(BOT.g.kind[id]||BOT.free&&BOT.free[id])){ n=id; break; } } }
  if(n>=0&&!BOT.prog){ if(--BOT.re<=0){ BOT.re=12; botDij(n); BOT.goal=botGoal(); BOT.path=BOT.goal?botPathTo(BOT.goal.n):[n]; botProgress(); }
    else { const i=BOT.path.indexOf(n); if(i>0) BOT.path=BOT.path.slice(i); else if(i<0) BOT.re=0; } }
  let mv=botMove(n); mv=botFight({...mv}); mv=botFreq(mv); mv=botDodge(mv);
  botKeys(mv); }
// напредък към целта: без напредък 6 s — целта настрана; 25 s без нищо — „тук поемаш ти“
function botProgress(){ const g=BOT.goal, ref=g&&(g.X||g.k||(g.q&&g.q.ref)||g.t), c=g?BOT.d[g.n]:1e9, sig=stats.kills*1e4+pickups.filter(k=>k.taken).length*100-botTasks().length;
  if(sig!==BOT.sig){ BOT.sig=sig; BOT.progT=lvT; }   // напредък: убит враг, взет предмет, щета по целта, по-близо до изхода
  if(ref!==BOT.gref){ BOT.gref=ref; BOT.best=c; BOT.bestT=lvT; }
  else if(c<BOT.best-0.5||(g&&g.t==='foe'&&BOT.shot===g.X&&lvT-BOT.shotT<1)){ BOT.best=c; BOT.bestT=lvT; if(g&&!g.X&&!g.k) BOT.progT=lvT; }
  if(g&&(g.X||g.k||g.q)&&(lvT-BOT.bestT>(g.q&&g.q.hold?15:6)||lvT-BOT.progT>(g.q&&g.q.hold?20:12))){ BOT.ban.set(ref,lvT+20); BOT.gref=null; BOT.stuck++; BOT.progT=Math.max(BOT.progT,lvT-7); }
  else if(lvT-BOT.progT>40&&!BOT.gave){ const p=player; BOT.gave=true; BOT.stuck++; BOT.why=[Math.floor((p.x+5)/T),Math.round((p.y+p.h)/T),g?g.t:'—',g&&g.n>=0?(g.n%COLS)+','+botY(g.n):'',p.swim?'плува':p.climb?'стълба':p.onGround?'':'въздух'].join(' ');
    showMsg('Автопилот: тук поемаш ти',3); chtSet('bot',false); } }
// извън играта: ботът сам минава началния текст, „загина“ и края на нивото
function botMeta(dt){
  const z=()=>{ pressed.fire=true; };
  if(state==='story'&&storyT>0.5&&storyT*45>=parasLen(LVL.story)+45) z();
  else if(state==='dead'&&deadT>1.3) z();
  else if(state==='levelEnd'&&endT>1.3&&(endT-0.5)*45>=parasLen(LVL.end)+45) z(); }
function botHud(){ if(!CHT.on.bot) return; ctx.save(); ctx.font='600 7px "IBM Plex Mono",monospace'; ctx.textAlign='right'; ctx.fillStyle='rgba(4,14,18,0.6)'; ctx.fillRect(W-86,17,82,11);   // под реда с името на нивото
  ctx.fillStyle=ACC(); ctx.fillText('АВТОПИЛОТ · A',W-8,25); ctx.restore(); }
