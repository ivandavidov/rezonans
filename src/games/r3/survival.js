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
const SV3_SPEC={salt:[137,7919,33],early:SV3_EARLY,mid:SV3_MID,late:SV3_LATE,recent:3,boss:{map:SV3_BOSS,early:['wolf','beacon','mirror'],recent:2},
  mut:{base:0.15,max:0.6,special:(th,r)=>th==='metro'&&r()<0.6?'dark':null,opts:(tg,j)=>{ const o=['swarm','scarce']; if(!tg.sky) o.push('dark'); return o; }}};
