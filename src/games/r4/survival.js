/* ================= РЕЗОНАНС 4 · ОЦЕЛЯВАНЕ ================= */
const SV4={
 plcity:{name:'Центърът',th:'plcity',sky:'pldusk',tower:1,lift:'cable',foes:['puppet','puppet','crab','flyer'],mus:MUS4.city,
   deco:(x,y,h,fy)=>{ if(h>0.7) plLamp(x,fy); else if(h>0.45) plTree(x*T+8,fy,0.8); }},
 plteatr:{name:'Театърът',th:'plteatr',foes:['puppet','puppet','puppet','crab'],mus:MUS4.teatr,shift:1,
   deco:(x,y,h,fy)=>{ if(h>0.55) puppetHang(x*T+8,fy-50-h*20); }},
 plpark:{name:'Скобелевият парк',th:'plpark',sky:'pldusk',turret:1,foes:['shade','shade','crab','flyer'],mus:MUS4.park,
   deco:(x,y,h,fy)=>{ if(h>0.72) cannon(x,fy,h>0.86?1:-1); else if(h>0.5) plTree(x*T+8,fy,0.9); else if(h>0.35) gabion(x,fy); }},
 plpano:{name:'Панорамата',th:'plpano',sky:'plpano',still:1,foes:['shade','shade','shade','flyer'],mus:MUS4.pano,
   deco:(x,y,h,fy)=>{ if(h>0.4) paintFig(x*T+8,fy,x); }},
 plrock:{name:'Скалите на Кайлъка',th:'plrock',sky:'plkail',tower:1,lift:'cable',foes:['flyer','crab','drone'],mus:MUS4.kail,
   deco:(x,y,h,fy)=>{ if(h>0.55) plTree(x*T+8,fy,0.8); }},
 plstorg:{name:'Сторгозия',th:'plstorg',thB:'plstorgB',sky:'plkail',skyB:'pldusk',era:1,eraNames:['ДНЕС · РУИНИТЕ','IV в. · СТОРГОЗИЯ'],foes:['crab','flyer','crab'],foesB:['shade','shade','guard'],mus:MUS4.kail,
   deco:(x,y,h,fy)=>{ if(h>0.55) antCol(x,fy,20+h*20,true); }, decoB:(x,y,h,fy)=>{ if(h>0.55) antCol(x,fy,60,false); }},
 plcave:{name:'Пещерите',th:'plkarst',sonar:1,foes:['crab','flyer','zombie'],mus:MUS4.cave,noPipes:1,
   deco:(x,y,h,fy)=>{ if(h>0.5) stalac(x*T+8,fy,6+h*8,true); }},
 plk2:{name:'„Камертон-2“',th:'plk2',freq:1,stealth:1,term:1,alarmFoe:'soldier',foes:['soldier','drone','crab'],mus:MUS4.k2,sign:k2Sign,
   deco:(x,y,h,fy)=>{ if(h>0.72) consoleAt(x*T,fy,1); }},
 plbeyond:{name:'Отвъд',th:'plbeyond',sky:'plbeyond',freq:1,foes:['shade','puppet','drone','guard'],mus:MUS4.beyond,noPipes:1},
};
addUnique(SV_THEMES,SV4,'SV_THEMES'); for(const k in SV4) addUnique(THEME_NAME,{[k]:SV4[k].name},'THEME_NAME');
addUnique(MUT_NAME,{still:'Застинало време',sonar:'Сонарен мрак'},'MUT_NAME');
const SV4_EARLY=['plcity','plteatr','plpark'], SV4_MID=['plpano','plrock','plstorg'], SV4_LATE=['plcave','plk2','plbeyond'];
const SV4_BOSS={puppeteer:[3,'plteatr'],canvas:[7,'plpano'],legion:[11,'plstorg'],silent:[15,'plcave'],conductor:[18,'plbeyond']};
let SV4_PLAN=[], SV4_SEED=-1;
function sv4Plan(k){
  if(SV4_SEED!==survSeed){ SV4_PLAN=[]; SV4_SEED=survSeed; }
  while(SV4_PLAN.length<=k){
    const j=SV4_PLAN.length, r=mkRng(survSeed*149+j*7907+41), pick=a=>a[Math.floor(r()*a.length)];
    if(j%5===4){ const pool=j<10?['puppeteer','canvas','legion']:Object.keys(SV4_BOSS), rb=SV4_PLAN.filter(q=>q.boss).slice(-2).map(q=>q.boss), c=pool.filter(b=>!rb.includes(b)), boss=pick(c.length?c:pool);
      SV4_PLAN.push({theme:SV4_BOSS[boss][1],muts:[],boss}); continue; }
    const pool=j<5?SV4_EARLY:j<10?SV4_EARLY.concat(SV4_MID):SV4_EARLY.concat(SV4_MID,SV4_LATE,SV4_LATE);
    const recent=SV4_PLAN.slice(-3).map(q=>q.theme); let cand=pool.filter(t=>!recent.includes(t)); if(!cand.length) cand=pool;
    const theme=pick(cand), tg=SV4[theme], muts=[], mp=j<2?0:Math.min(0.6,0.15+j*0.03);
    if(r()<mp){ const opts=['swarm','scarce']; if(!tg.still&&j>=3) opts.push('still'); if(!tg.sky&&!tg.era&&!tg.sonar&&!tg.freq&&!tg.stealth) opts.push('sonar'); if(!tg.sky&&!tg.era&&!tg.sonar) opts.push('dark'); muts.push(pick(opts)); }
    SV4_PLAN.push({theme,muts,boss:null});
  }
  return SV4_PLAN[k];
}
