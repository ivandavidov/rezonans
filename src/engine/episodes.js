/* ================= ДВИГАТЕЛ · ГЕНЕРИРАНИ ЕПИЗОДИ =================
   Епизод на кампанията без ръчна карта: в levels на частта записът носи рецептата gen, а нивото се строи от генератора на
   секторите (engine/survival.js · svTry) при всяко зареждане с ново семе. След смърт играчът остава в същото ниво (то не се
   зарежда наново); ново начало на епизода — ново ниво.
   Записът: n, title, story, end, loadout, memory (текстът на спомена — тогава в нивото има спомен) + полетата от EP_COPY;
   gen: {theme       тема от SV_THEMES (етикетите водят сегментите, враговете и декора)
         k           трудност по реда — като номера на сектор в оцеляването (0…)
         len         [от, до] — дължината на пътя в колони (иначе — като в оцеляването)
         muts        мутации (dark, lowg, swarm, scarce, alarm, bats, zerog …)
         boss        бос в края — арената я строи GAME.svArena
         seq         сегменти (или сцени, defPrefab) в началото, по ред — вместо основната механика на темата
         wts         тегла на сегментите {id: тегло}; 0 — без него
         pre         [[дял от пътя, сцена], …] — готови сцени по пътя
         beats       [[дял, кой, текст], …] — кой: 'radio' (GAME.radioWho), 'msg' или име от GAME.voices
         weap        [[оръжие, дял], …] — оръжията по сюжета, на основния път
         zones       [[дял от пътя, тема], …] — темата се сменя по пътя (плочките, сегментите, враговете, декорът); темите — с еднакво небе
         foes        колко врагове да разположи генераторът (иначе — по дължината и трудността; тренировката — малко)
         sign        надписът в началото, music — друга музика}
   Семето: epFix (проверките) или Math.random (в проверките е семенен) — window.__rz.epSeed пази последното. */
let epSeed=0, epFix=null;
const EP_COPY=['n','title','story','end','loadout','memory','barks','alarmFoe','onLoad','tick','drawExtra','lightsExtra'];
const epSeedNew=()=>epFix!=null?epFix:1+Math.floor(Math.random()*999999999);
function epGen(i,seed){
  const R=GLV[i], E=R.gen; epSeed=seed!=null?seed:epSeedNew();
  const L=svGenBy(E.k||0,{theme:E.theme,muts:(E.muts||[]).slice(),boss:E.boss||null,seed:epSeed,ep:E,memory:!!R.memory});
  const fits=s=>!(DIMS[s[0]]&&!FOES[s[0]].fly&&(s[2]+1)*T-DIMS[s[0]][1]<0);   // враг на земята с глава над картата (горе е стена) — не се слага
  L.spawns=L.spawns.filter(fits); if(L.spawnsB) L.spawnsB=L.spawnsB.filter(fits);
  for(const f of EP_COPY) if(R[f]!==undefined) L[f]=R[f];
  if(E.music) L.music=Object.assign({},E.music);
  L.surv=false; L.seed=epSeed; return L;
}
// фонът на менюто — епизод 1; генериран — винаги с едно и също семе (менюто не се мени, проверките са повторими)
const EP_MENU_SEED=1307;
function loadMenuLevel(){ loadLevel(0,GLV[0]&&GLV[0].gen?epGen(0,EP_MENU_SEED):undefined); }
// вика го svTry, след враговете и плячката: оръжията и спомените по сюжета, репликите по пътя
function epPlace(E,o){
  const {r,cols,end,cps,safe,gyEq,path,pathList,spawns,triggers,g}=o, at=f=>Math.round(14+clamp(f,0,1)*Math.max(0,end-20));
  const onPath=f=>{ const tx=at(f); for(const id of pathList){ const x=id%cols, y=(id/cols)|0; if(x>=tx&&safe(x,y)&&g[y][x]!=='Z') return [x,y]; } return null; };
  for(const [w,f] of E.weap||[]){ const q=onPath(f); if(q) spawns.push([w,q[0],q[1]-1]); }
  if(o.memory){   // спомен — извън основния път, във втората половина; по-скоро на високо
    const c=[]; for(let x=Math.floor(end*0.35);x<end-4;x++) for(let y=1;y<ROWS;y++) if(safe(x,y)&&!path[y*cols+x]&&g[y][x]!=='Z') c.push([x,y]);
    const hi=c.filter(([x,y])=>y<gyEq(x)), pool=hi.length?hi:c, q=pool.length?pool[Math.floor(r()*pool.length)]:onPath(0.7);
    if(q) spawns.push(['memory',q[0],q[1]-1]); }
  for(const [f,who,t] of E.beats||[]){ const tx=at(f), cx=cps.find(x=>x>=tx);   // при първата контролна точка след дела f
    triggers.push({x:cx!=null&&cx-tx<12?cx:tx,fn:who==='radio'?()=>radio(t):who==='msg'?()=>showMsg(t,3.5):()=>showMsg(t,0,who)}); }
}
