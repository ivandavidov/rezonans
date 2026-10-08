/* ================= РЕЗОНАНС 2 · ОЦЕЛЯВАНЕ (procedural) ================= */
const SV2={
 sea:{name:'Подводна станция',th:'sea',water:1,lever:1,foes:['crab','crab','drone','shocker'],mus:MUS.sea,lift:'cable'},
 town:{name:'Беловир',th:'town',sky:'town',tower:1,lift:'cable',turret:1,foes:['zombie','crab','drone','flyer'],mus:MUS.town},
 dune:{name:'Пясъчният свят',th:'dune',sky:'dune',sun:1,foes:['crab','crab','guard','flyer','imp'],mus:MUS.worlds},
 shrine:{name:'Светилището',th:'ruinp',thB:'thrace',sky:'ruinp',skyB:'thrace',era:1,eraNames:['ДНЕС','ТРАКИЯ · IV в. пр. Хр.'],foes:['crab','zombie','flyer'],foesB:['shocker','guard','flyer'],mus:MUS.time},
 b70:{name:'Строежът',th:'vih',thB:'build70',skyB:'build70',era:1,turret:1,eraNames:['ДНЕС · ИЗОСТАВЕНИЯТ „ВИХРЕН“','1977 · СТРОЕЖЪТ'],foes:['zombie','crab','drone'],foesB:['shocker','flyer','zombie'],mus:MUS.time},
 ruin:{name:'Руините',th:'snow',thB:'future',sky:'pass',skyB:'future',era:1,eraNames:['ДНЕС · СКЛОНЪТ НАД „ВИХРЕН“','2500 г. · РУИНИТЕ'],foes:['crab','flyer','zombie'],foesB:['guard','drone','shocker'],mus:MUS.time},
 gear:{name:'Машинният свят',th:'gear',conv:1,crush:1,lift:'float',foes:['drone','crab','guard'],mus:{tr:-3,bpm:126,alien:true}},
 gas:{name:'Газовият гигант',th:'gas',sky:'gas',wind:1,lift:'float',foes:['flyer','guard','drone'],mus:{tr:4,bpm:96,alien:true}},
 necro:{name:'Мъртвият град',th:'necro',sky:'necro',ghost:1,nest:1,foes:['zombie','crab','flyer','guard'],mus:{tr:-2,bpm:92,alien:true}},
 source:{name:'Източникът',th:'source',shift:1,laser:1,lift:'float',foes:['drone','guard','shocker'],mus:MUS.src},
};
const SV2_EARLY=['sea','town','dune'], SV2_MID=['shrine','b70','gear','gas'], SV2_LATE=['ruin','necro','source'];
const SV2_BOSS={deep:[4,'sea'],breach:[8,'town'],stone:[12,'shrine'],swarm:[15,'gear'],storm:[17,'gas'],maker:[22,'source']};
addUnique(SV_THEMES,SV2,'SV_THEMES'); for(const k in SV2) addUnique(THEME_NAME,{[k]:SV2[k].name},'THEME_NAME');
addUnique(MUT_NAME,{zerog:'Безтегловност'},'MUT_NAME');
defBosses('norm',{deep:1,breach:1,stone:1,swarm:1,storm:1,maker:0.85});

let SV2_PLAN=[], SV2_SEED=-1;
function sv2Plan(k){
  if(SV2_SEED!==survSeed){ SV2_PLAN=[]; SV2_SEED=survSeed; }
  while(SV2_PLAN.length<=k){
    const j=SV2_PLAN.length, r=mkRng(survSeed*131+j*7717+77), pick=a=>a[Math.floor(r()*a.length)];
    if(j%5===4){ const pool=j<10?['deep','breach','stone','swarm']:Object.keys(SV2_BOSS), rb=SV2_PLAN.filter(q=>q.boss).slice(-3).map(q=>q.boss), c=pool.filter(b=>!rb.includes(b)), boss=pick(c.length?c:pool);
      SV2_PLAN.push({theme:SV2_BOSS[boss][1],muts:[],boss}); continue; }
    const pool=j<5?SV2_EARLY:j<10?SV2_EARLY.concat(SV2_MID):SV2_EARLY.concat(SV2_MID,SV2_LATE,SV2_LATE);
    const recent=SV2_PLAN.slice(-3).map(q=>q.theme); let cand=pool.filter(t=>!recent.includes(t)); if(!cand.length) cand=pool;
    const theme=pick(cand), tg=SV2[theme], muts=[], mp=j<2?0:Math.min(0.6,0.15+j*0.03);
    if(theme==='source'&&r()<0.45) muts.push('zerog');
    else if(r()<mp){ const opts=['swarm','scarce']; if(!tg.sky&&!tg.era) opts.push('dark'); muts.push(pick(opts)); }
    SV2_PLAN.push({theme,muts,boss:null});
  }
  return SV2_PLAN[k];
}
