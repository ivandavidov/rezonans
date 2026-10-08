/* ================= РЕЗОНАНС 3 · ОЦЕЛЯВАНЕ ================= */
const SV3={
 sofia:{name:'Изгасналата София',th:'sofia',sky:'sofia3',snow:1,tower:1,lift:'cable',foes:['zombie','crab','flyer','drone'],mus:MUS3.city},
 metro:{name:'Метрото',th:'metro',water:1,foes:['crab','zombie','zombie','drone'],mus:MUS3.metro},
 serdica:{name:'Сердика',th:'serdica',foes:['crab','zombie','shocker'],mus:MUS3.metro},
 vitosha:{name:'Витоша',th:'vitosha',sky:'vitosha3',snow:2,lift:'cable',gusts:1,foes:['soldier','flyer','crab'],mus:MUS3.vit},
 base:{name:'Базата на „Камертон“',th:'base',stealth:1,term:1,turret:1,alarmFoe:'soldier',foes:['soldier','soldier','drone'],mus:MUS3.base},
 lab77:{name:'Лабораторията от 1977',th:'lab77',plate:1,laser:1,alarmFoe:'soldier',foes:['soldier','zombie','zombie'],mus:MUS3.s77},
 rift:{name:'Разломът',th:'rift',rhythm:1,foes:['crab','flyer','zombie','guard'],mus:MUS3.rift},
 epic:{name:'Епицентърът',th:'epic',rhythm:1,term:1,stealth:1,alarmFoe:'soldier',foes:['soldier','drone','guard'],mus:MUS3.core},
};
addUnique(SV_THEMES,SV3,'SV_THEMES'); for(const k in SV3) addUnique(THEME_NAME,{[k]:SV3[k].name},'THEME_NAME');
const SV3_EARLY=['sofia','metro','serdica'], SV3_MID=['vitosha','base','lab77'], SV3_LATE=['rift','epic'];
const SV3_BOSS={wolf:[3,'metro'],beacon:[7,'base'],mirror:[11,'lab77'],stalker:[15,'rift'],fork:[18,'epic']};
let SV3_PLAN=[], SV3_SEED=-1;
function sv3Plan(k){
  if(SV3_SEED!==survSeed){ SV3_PLAN=[]; SV3_SEED=survSeed; }
  while(SV3_PLAN.length<=k){
    const j=SV3_PLAN.length, r=mkRng(survSeed*137+j*7919+33), pick=a=>a[Math.floor(r()*a.length)];
    if(j%5===4){ const pool=j<10?['wolf','beacon','mirror']:Object.keys(SV3_BOSS), rb=SV3_PLAN.filter(q=>q.boss).slice(-2).map(q=>q.boss), c=pool.filter(b=>!rb.includes(b)), boss=pick(c.length?c:pool);
      SV3_PLAN.push({theme:SV3_BOSS[boss][1],muts:[],boss}); continue; }
    const pool=j<5?SV3_EARLY:j<10?SV3_EARLY.concat(SV3_MID):SV3_EARLY.concat(SV3_MID,SV3_LATE,SV3_LATE);
    const recent=SV3_PLAN.slice(-3).map(q=>q.theme); let cand=pool.filter(t=>!recent.includes(t)); if(!cand.length) cand=pool;
    const theme=pick(cand), tg=SV3[theme], muts=[], mp=j<2?0:Math.min(0.6,0.15+j*0.03);
    if(theme==='metro'&&r()<0.6) muts.push('dark');
    else if(r()<mp){ const opts=['swarm','scarce']; if(!tg.sky) opts.push('dark'); muts.push(pick(opts)); }
    SV3_PLAN.push({theme,muts,boss:null});
  }
  return SV3_PLAN[k];
}
