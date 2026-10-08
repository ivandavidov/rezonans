/* ================= РЕЗОНАНС 5 · ОЦЕЛЯВАНЕ ================= */
const SV5={
 axvil:{name:'Селото',th:'axvil',sky:'axnight',tower:1,sleepers:1,foes:['hound','hound','agent','flyer'],mus:MUS5.vil,
   deco:(x,y,h,fy)=>{ if(h>0.72) axLamp(x,fy); else if(h>0.5) walnut(x*T+8,fy,0.7); }},
 axfield:{name:'Нивите',th:'axfield',sky:'axdawn',lift:'cable',sleepers:1,foes:['drone','hound','agent'],mus:MUS5.field,
   deco:(x,y,h,fy)=>{ if(h>0.7) haystack(x,fy,0.7); else if(h>0.5) poplar(x*T+8,fy,0.8); }},
 axkrush:{name:'Водопадите',th:'axkrush',sky:'axday',water:1,foes:['crab','flyer','drone','agent'],mus:MUS5.krush,
   deco:(x,y,h,fy)=>{ if(h>0.6) walnut(x*T+8,fy,0.7); }},
 axmaara:{name:'Маарата',th:'axmaara',sonar:1,water:1,noPipes:1,foes:['crab','bat','crab'],mus:MUS5.maara,
   deco:(x,y,h,fy)=>{ if(h>0.5) drip(x*T+8,fy,6+h*8,true); }},
 axcave:{name:'Деветашката пещера',th:'axcave',flares:1,noPipes:1,sleepers:1,foes:['bat','bat','crab','agent'],mus:MUS5.cave,
   deco:(x,y,h,fy)=>{ if(h>0.6) drip(x*T+8,fy,5+h*6,true); }},
 axdepot:{name:'Складовете',th:'axdepot',stealth:1,term:1,alarmFoe:'agent',foes:['agent','soldier','drone'],mus:MUS5.k3,sign:k3Sign,
   deco:(x,y,h,fy)=>{ if(h>0.75) consoleAt(x*T,fy,1); }},
 axvar:{name:'Вароша',th:'axvar',sky:'axnight',tower:1,lift:'cable',foes:['agent','hound','drone'],mus:MUS5.lovech,
   deco:(x,y,h,fy)=>{ if(h>0.7) axLamp(x,fy); }},
 axhisar:{name:'Хисаря',th:'axhisar',sky:'axnight',turret:1,foes:['agent','hound','agent','flyer'],mus:MUS5.hisar},
 axk3:{name:'„Камертон-3“',th:'axk3',term:1,laser:1,alarmFoe:'agent',foes:['agent','soldier','drone'],mus:MUS5.k3,sign:k3Sign,
   deco:(x,y,h,fy)=>{ if(h>0.72) consoleAt(x*T,fy,1); }},
};
addUnique(SV_THEMES,SV5,'SV_THEMES'); for(const k in SV5) addUnique(THEME_NAME,{[k]:SV5[k].name},'THEME_NAME');
const SV5_EARLY=['axvil','axfield','axkrush'], SV5_MID=['axmaara','axcave','axvar'], SV5_LATE=['axdepot','axhisar','axk3'];
const SV5_BOSS={combine:[3,'axfield'],cascade:[7,'axkrush'],moth:[11,'axcave'],valchev:[15,'axhisar'],resonator:[18,'axk3']};
let SV5_PLAN=[], SV5_SEED=-1;
function sv5Plan(k){
  if(SV5_SEED!==survSeed){ SV5_PLAN=[]; SV5_SEED=survSeed; }
  while(SV5_PLAN.length<=k){
    const j=SV5_PLAN.length, r=mkRng(survSeed*151+j*7919+59), pick=a=>a[Math.floor(r()*a.length)];
    if(j%5===4){ const pool=j<10?['combine','cascade','moth']:Object.keys(SV5_BOSS), rb=SV5_PLAN.filter(q=>q.boss).slice(-2).map(q=>q.boss), c=pool.filter(b=>!rb.includes(b)), boss=pick(c.length?c:pool);
      SV5_PLAN.push({theme:SV5_BOSS[boss][1],muts:[],boss}); continue; }
    const pool=j<5?SV5_EARLY:j<10?SV5_EARLY.concat(SV5_MID):SV5_EARLY.concat(SV5_MID,SV5_LATE,SV5_LATE);
    const recent=SV5_PLAN.slice(-3).map(q=>q.theme); let cand=pool.filter(t=>!recent.includes(t)); if(!cand.length) cand=pool;
    const theme=pick(cand), tg=SV5[theme], muts=[], mp=j<2?0:Math.min(0.6,0.15+j*0.03);
    if(r()<mp){ const opts=['swarm','scarce']; if(!tg.sky&&!tg.sonar&&!tg.flares&&!tg.stealth) opts.push('bats'); if(!tg.sky&&!tg.sonar&&!tg.flares) opts.push('dark'); muts.push(pick(opts)); }
    SV5_PLAN.push({theme,muts,boss:null});
  }
  return SV5_PLAN[k];
}
