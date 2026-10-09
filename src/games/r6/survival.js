/* ================= РЕЗОНАНС 6 · ОЦЕЛЯВАНЕ ================= */
const SV6={
 acsof:{name:'Кварталът',th:'acsof',sky:'accity',tower:1,sleepers:1,tone:1,foes:['wisp','crab','watcher','flyer'],mus:MUS6.city,
   deco:(x,y,h,fy)=>{ if(h>0.72) acLamp(x,fy); }},
 acpark:{name:'Южният парк',th:'acpark',sky:'accity',tone:1,foes:['watcher','wisp','crab'],mus:MUS6.city,
   deco:(x,y,h,fy)=>{ if(h>0.6) acTree(x*T+8,fy,0.8); else if(h>0.45) acBench(x,fy); }},
 acdream:{name:'Сънят',th:'acdream',thB:'acdreamB',sky:'acdream',skyB:'acdreamB',era:1,eraNames:['ЯВЕ','СЪН'],foes:['wisp','wisp','flyer'],foesB:['imp','flyer','crab'],mus:MUS6.dream},
 acperp:{name:'Перперикон',th:'acperp',sky:'acrhod',tone:1,foes:['thrax','watcher','flyer'],mus:MUS6.rhod,
   deco:(x,y,h,fy)=>{ if(h>0.7) acMenhir(x,fy,20+h*10); }},
 actatul:{name:'Татул',th:'actatul',sky:'acrdusk',tone:1,foes:['thrax','thrax','wisp','flyer'],mus:MUS6.rhod,
   deco:(x,y,h,fy)=>{ if(h>0.75) acAltar(x,fy); }},
 acyag:{name:'Ягодинската пещера',th:'acyag',flares:1,noPipes:1,foes:['bat','crab','wisp'],mus:MUS6.cave,
   deco:(x,y,h,fy)=>{ if(h>0.5) acStalag(x*T+8,fy,8+h*10); }},
 acgorge:{name:'Триградското ждрело',th:'acgorge',sky:'acrhod',water:1,tone:1,foes:['crab','flyer','thrax'],mus:MUS6.rhod},
 acdevil:{name:'Дяволското гърло',th:'acdevil',sonar:1,water:1,noPipes:1,foes:['crab','bat','wisp'],mus:MUS6.cave,
   deco:(x,y,h,fy)=>{ if(h>0.55) acStalag(x*T+8,fy,6+h*8); }},
 acunder:{name:'Подземното царство',th:'acunder',tone:1,noPipes:1,foes:['thrax','wisp','wisp','watcher'],mus:MUS6.under},
 acbelin:{name:'Белинташ',th:'acbelin',sky:'acstars',tone:1,foes:['watcher','wisp','thrax'],mus:MUS6.belin,
   deco:(x,y,h,fy)=>{ if(h>0.68) acMenhir(x,fy,22+h*10); }},
 acship:{name:'Корабът',th:'acship',term:1,laser:1,alarmFoe:'watcher',tone:1,foes:['watcher','drone','wisp'],mus:MUS6.ship},
};
addUnique(SV_THEMES,SV6,'SV_THEMES'); for(const k in SV6) addUnique(THEME_NAME,{[k]:SV6[k].name},'THEME_NAME');
const SV6_EARLY=['acsof','acpark','acdream'], SV6_MID=['acperp','actatul','acyag','acgorge'], SV6_LATE=['acdevil','acunder','acbelin','acship'];
const SV6_BOSS={shadow:[3,'acsof'],echoes:[7,'acdream'],priest:[11,'actatul'],cerber:[15,'acunder'],firsttone:[18,'acship']};
const SV6_SPEC={salt:[157,7919,61],early:SV6_EARLY,mid:SV6_MID,late:SV6_LATE,recent:3,boss:{map:SV6_BOSS,early:['shadow','echoes','priest'],recent:2},
  mut:{base:0.15,max:0.6,opts:(tg,j)=>{ const o=['swarm','scarce']; if(!tg.sky&&!tg.sonar&&!tg.flares&&!tg.era&&!tg.term) o.push('bats'); if(!tg.sky&&!tg.sonar&&!tg.flares) o.push('dark'); return o; }}};
