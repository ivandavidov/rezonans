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
const SV7_SPEC={salt:[163,7919,67],early:SV7_EARLY,mid:SV7_MID,late:SV7_LATE,recent:3,boss:{map:SV7_BOSS,early:['syntax','snake','dark'],recent:2},
  mut:{base:0.15,max:0.6,opts:(tg,j)=>{ const o=['swarm','scarce']; if(!tg.sky) o.push('dark'); return o; }}};
