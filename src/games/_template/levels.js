/* ================= РЕЗОНАНС 9 · НИВА (шаблон) ================= */
const CH_R9=[{t:'НАЧАЛОТО',a:0,b:0}];
const LEVELS_R9=[
{title:'ПЪРВИЯТ ЕПИЗОД',cols:120,grav:900,music:{tr:0,bpm:100},start:4,theme:()=>'lab',exit:115,
 loadout:{w:['wrench','pistol'],ammo:{pistol:[17,51]},armor:0,cur:'pistol'},
 story:['Тук започва новата история.'], end:['Краят на първия епизод.'],
 build(F){ LB.frame(F,120); }, spawns:[['zombie',40,15]], triggers:[]},
];
LEVELS_R9.forEach((l,i)=>{ l.n=i+1; l.spawns=l.spawns||[]; l.triggers=l.triggers||[]; l.deco=l.deco||(()=>{}); l.lifts=l.lifts||[]; l.lasers=l.lasers||[]; l.vents=l.vents||[]; l.crushers=l.crushers||[]; l.tracks=l.tracks||[]; });
