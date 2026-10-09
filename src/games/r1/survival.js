/* ================= РЕЗОНАНС 1 · ОЦЕЛЯВАНЕ: ТЕМИ, ПЛАН, АРЕНИ =================
   Общият генератор (engine/survival.js) строи секторите по етикетите на темите; r1 дава и строителя на арените (r1SvArena). */
/* темите на r1 (етикетите водят плана и генератора) */
const SV1={
 lab:{name:'Лаборатории',th:'lab',mus:{tr:0,bpm:108},acid:1,elec:1,laser:1,human:1},
 hall:{name:'Коридори',th:'hall',mus:{tr:2,bpm:112},acid:1,elec:1,vent:1,human:1},
 office:{name:'Администрация',th:'office',mus:{tr:-3,bpm:96},human:1,turret:1},
 depot:{name:'Склад',th:'depot',mus:{tr:0,bpm:118},conv:1,crush:1,human:1},
 waste:{name:'Канали',th:'waste',mus:{tr:-4,bpm:100},acid:1,human:1},
 vih:{name:'Комплексът',th:'vih',mus:{tr:-1,bpm:110},laser:1,elec:1,human:1,turret:1},
 mil:{name:'Военна база',th:'mil',mus:{tr:1,bpm:116},human:1,turret:1,vent:1},
 tunnel:{name:'Тунели',th:'tunnel',mus:{tr:1,bpm:120},track:1,human:1},
 mine:{name:'Шахти',th:'mine',mus:{tr:-6,bpm:104},lift:1,human:1,cave:1},
 bio:{name:'Биолаборатория',th:'bio',mus:{tr:-1,bpm:98},laser:1,acid:1,human:1},
 cool:{name:'Охладителна система',th:'cool',mus:{tr:3,bpm:112},vent:1,elec:1,human:1},
 core:{name:'Хранилище',th:'core',mus:{tr:-2,bpm:100},elec:1,vent:1,laser:1,human:1},
 out:{name:'Каньонът',th:'out',mus:{tr:2,bpm:116},sky:1,human:1,lift:1,turret:1},
 snow:{name:'Заснежен проход',th:'snow',mus:{tr:2,bpm:118},sky:1,human:1,lift:1,turret:1},
 night:{name:'Повърхност',th:'night',mus:{tr:-1,bpm:112},sky:1,human:1,lift:1,turret:1},
 xen:{name:'Острови',th:'xen',mus:{tr:4,bpm:96,alien:true},sky:1,alien:1,lowg:1,lift:1,pad:1},
 hive:{name:'Кошер',th:'hive',mus:{tr:3,bpm:92,alien:true},alien:1,lowg:1,acid:1,pad:1,nest:1,cave:1},
 factory:{name:'Фабрика',th:'factory',mus:{tr:-2,bpm:124,alien:true},alien:1,lowg:1,conv:1,crush:1,pad:1},
 citadel:{name:'Цитадела',th:'citadel',mus:{tr:-5,bpm:116,alien:true},alien:1,lowg:1,crush:1,laser:1,elec:1,pad:1},
 cave:{name:'Пещери',th:'cave',mus:{tr:2,bpm:88,alien:true},alien:1,lowg:1,dark:1,acid:1,nest:1,pad:1,cave:1},
 ice:{name:'Ледени пещери',th:'ice',mus:{tr:3,bpm:92,alien:true},alien:1,dark:1,acid:1,nest:1,pad:1,cave:1},
};
const SV1_EARLY=['lab','hall','office','depot','waste','vih','mil'], SV1_MID=['tunnel','mine','bio','cool','core','out','snow','night'], SV1_LATE=['xen','hive','factory','citadel','cave','ice'];
// каквото старият генератор на r1 предполагаше — сега е в етикетите на темите
const r1Crystal=c=>(x,y,h,py)=>{ if(h>0.35) crystal(x*T+h*8,py,c||(h>0.7?'#ff6ad5':'#59ffd6')); }, r1Console=(x,y,h,py)=>{ if(h>0.72) consoleAt(x*T,py,1+(h>0.86?1:0)); };
const R1_DECO={snow:(x,y,h,py)=>{ if(h>0.3) pine(x*T+8,py,0.6+h*0.5); }, night:(x,y,h,py)=>{ if(h>0.3) bush(x*T,py); }, out:(x,y,h,py)=>{ if(h>0.6) bush(x*T,py); }};
for(const id in SV1){ const t=SV1[id];
  t.foes=t.alien?['crab','crab','shocker','flyer']:['crab','zombie']; t.foesK=t.alien?[[6,'shocker'],[10,'guard'],[16,'guard']]:[[1,'zombie'],[2,'shocker'],[3,'soldier'],[3,'soldier'],[8,'soldier']];
  t.air='flyer'; if(t.cave||t.human) t.tower=1; if(t.sky) t.lift=1; if(t.sky||t.lowg) t.islands=1; if(t.elec) t.zfloor=1;
  if(t.alien||id==='mine'||id==='ice') t.noPipes=1;
  t.deco=t.alien||id==='mine'||id==='ice'?r1Crystal(id==='ice'?'#bfe8ff':id==='mine'?'#7ac8ff':null):R1_DECO[id]||r1Console; }
SV1.night.sky='antenna'; SV1.xen.sky='beyond'; SV1.out.sky='canyon'; SV1.snow.sky=['pass','lift'];
addUnique(SV_THEMES,SV1,'SV_THEMES'); for(const k in SV1) addUnique(THEME_NAME,{[k]:SV1[k].name},'THEME_NAME');
defBosses('norm',{worm:1.27,colossus:1,guardian:0.875,warden:0.5,exo:1.3,tank:1,hunter:1.08,queen:0.82,titan:0.44});
function r1BossPool(tg){ const p=['colossus']; if(tg.acid) p.push('worm');
  if(tg.alien){ p.push('guardian','warden'); if(!tg.sky) p.push('queen'); } else { p.push('exo','titan'); if(tg.cave) p.push('queen'); }
  if(tg.sky) p.push('hunter'); if(tg.human) p.push('tank'); return p; }
const SV1_SPEC={exitCol:['#0d1a10','#4bdc6a'],salt:[131,7717,5],early:SV1_EARLY,mid:SV1_MID,late:SV1_LATE,recent:4,boss:{pool:r1BossPool,recent:3},
  mut:{base:0.2,max:0.7,second:0.4,opts:tg=>{ const o=['swarm','scarce']; if(!tg.sky&&!tg.dark) o.push('dark'); if(tg.human) o.push('alarm'); return o; }}};

function r1SvArena(type,d,o){   // арената на сектора с бос (вика я svTry)
  const {fill,colG,ri,r,pick,ch,sky,fixed,k}=o, r0=sky?0:2;
  for(let x=d;x<d+32;x++) colG(x,15);
  fill(d+29,r0,d+29,14,'D');
  const A={type,door:d,r0,r1:14,exitDoor:[d+29,r0,14],msg:'Вратата към следващия сектор е отворена!'};
  // random reachable platforms
  const plats=(xmin,xmax)=>{ let cx=xmin+ri(0,3), y=12, out=[]; while(cx<xmax-3){ const w=ri(3,5); fill(cx,y,cx+w-1,y,'-'); out.push([cx,y,w]); const ny=y===12?pick([9,12]):pick([12,9,(sky?6:9)]); cx+=w+(ny<=y?ri(1,2):ri(2,3))+(ny===12&&y===12?ri(1,3):0); y=ny; } return out; };
  if(type==='worm'){ fill(d+1,13,d+6,14,'#'); fill(d+7,13,d+22,14,'~'); fill(d+23,13,d+28,14,'#');
    const a=ri(8,9), b2=ri(13,14), c=ri(18,19); fill(d+a,10,d+a+2,10,'-'); fill(d+b2,9,d+b2+3,9,'-'); fill(d+c,10,d+c+2,10,'-');
    fixed.push(['barrel',d+3,12],['barrel',d+26,12],['health',d+2,12],['health',d+27,12],['ammo',d+b2+1,8],['grenade',d+a+1,9]); A.pool=[d+7,d+22]; }
  else if(type==='guardian'){ const P=plats(d+2,d+28); const top3=P.slice().sort((a,b)=>a[1]-b[1]).slice(0,3); while(top3.length<3) top3.push(P[top3.length%P.length]);
    A.pylons=top3.map(([x,y,w])=>[x+w/2,y]); A.bx=d+16; fixed.push(['health',d+3,14],['health',d+26,14],['battery',d+14,14],['barrel',d+11,14],['barrel',d+20,14]); }
  else { const P=plats(d+2,type==='queen'?d+21:d+28); P.forEach(([x,y,w],i)=>fixed.push([i%2?'ammo':'health',x+1,y-1]));
    if(type==='colossus'){ A.bx=d+21; A.crab=d+25; for(const b of [5,15,24]) fixed.push(['barrel',d+b,14]); }
    else if(type==='warden'){ A.bx=d+16; A.minX=d+2; A.maxX=d+27; }
    else if(type==='exo'){ A.bx=d+23; A.maxX=d+27; fixed.push(['barrel',d+9,14],['barrel',d+19,14],['grenadeR',d+2,14]); }
    else if(type==='tank'){ A.bx=d+23; A.minX=d+2; A.maxX=d+28; fixed.push(['rocketsR',d+2,14],['rocketsR',d+27,14],['grenadeR',d+14,14]); }
    else if(type==='hunter'){ A.minX=d+2; A.maxX=d+28; }
    else if(type==='queen'){ A.bx=d+25; }
    else if(type==='titan'){ A.bx=d+23; fixed.push(['rocketsR',d+2,14],['rocketsR',d+27,14]); } }
  const top=x=>{ let y=14; while(y>0&&o.g[y][x]!=='.') y--; return y; };
  fixed.push(['health',d+2,top(d+2),'E'],['battery',d+4,top(d+4)]); if(k>=10&&!['tank','titan'].includes(type)) fixed.push(['rocketsR',d+2,top(d+2)],['rocketsR',d+27,top(d+27)]);
  A.trigs=[d-2,d+3];
  return A;
}

