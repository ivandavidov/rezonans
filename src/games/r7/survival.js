/* ================= РЕЗОНАНС 7 · ОЦЕЛЯВАНЕ ================= */
const SV7={
 pxboot:{name:'Зеленият екран',th:'pxboot',foes:['bug','bug','blink','errbox'],mus:MUS7.boot,
   deco:(x,y,h,fy)=>{ if(h>0.8) pxFloppy(x,fy); else if(h>0.72) pxPC(x,fy); }},
 pxapple:{name:'Цветната графика',th:'pxappA',thB:'pxappB',era:1,eraNames:['ВИОЛЕТОВО · ЗЕЛЕНО','ОРАНЖЕВО · СИНЬО'],foes:['bug','packet','blink'],foesB:['packet','bug','errbox'],mus:MUS7.apple},
 pxcga:{name:'Периферията',th:'pxcga',foes:['packet','errbox','bug','blink'],mus:MUS7.cga,
   deco:(x,y,h,fy)=>{ if(h>0.7) pxKey(x,fy,'ЯВЕРТЪ'[Math.floor(h*60)%6]); }},
 pxram:{name:'Паметта',th:'pxram',foes:['bug','packet','blink','errbox'],mus:MUS7.ram,
   deco:(x,y,h,fy)=>{ if(h>0.66) pxChip(x,fy,3); }},
 pxweb:{name:'Бъдещето',th:'pxweb',foes:['popup','packet','bug'],mus:MUS7.web},
 pxcloud:{name:'Облакът',th:'pxcloud',sky:'pxcloud',foes:['packet','popup','bug'],mus:MUS7.web},
};
addUnique(SV_THEMES,SV7,'SV_THEMES'); for(const k in SV7) addUnique(THEME_NAME,{[k]:SV7[k].name},'THEME_NAME');
const SV7_EARLY=['pxboot','pxapple','pxcga'], SV7_MID=['pxram','pxcga','pxapple'], SV7_LATE=['pxweb','pxcloud','pxram'];
const SV7_BOSS={syntax:[3,'pxboot'],snake:[7,'pxapple'],dark:[11,'pxcga'],copy:[15,'pxram'],nula:[18,'pxweb']};
let SV7_PLAN=[], SV7_SEED=-1;
function sv7Plan(k){
  if(SV7_SEED!==survSeed){ SV7_PLAN=[]; SV7_SEED=survSeed; }
  while(SV7_PLAN.length<=k){
    const j=SV7_PLAN.length, r=mkRng(survSeed*163+j*7919+67), pick=a=>a[Math.floor(r()*a.length)];
    if(j%5===4){ const pool=j<10?['syntax','snake','dark']:Object.keys(SV7_BOSS), rb=SV7_PLAN.filter(q=>q.boss).slice(-2).map(q=>q.boss), c=pool.filter(b=>!rb.includes(b)), boss=pick(c.length?c:pool);
      SV7_PLAN.push({theme:SV7_BOSS[boss][1],muts:[],boss}); continue; }
    const pool=j<5?SV7_EARLY:j<10?SV7_EARLY.concat(SV7_MID):SV7_EARLY.concat(SV7_MID,SV7_LATE,SV7_LATE);
    const recent=SV7_PLAN.slice(-3).map(q=>q.theme); let cand=pool.filter(t=>!recent.includes(t)); if(!cand.length) cand=pool;
    const theme=pick(cand), tg=SV7[theme], muts=[], mp=j<2?0:Math.min(0.6,0.15+j*0.03);
    if(r()<mp){ const opts=['swarm','scarce']; if(!tg.sky) opts.push('dark'); muts.push(pick(opts)); }
    SV7_PLAN.push({theme,muts,boss:null});
  }
  return SV7_PLAN[k];
}
