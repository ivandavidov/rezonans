/* ================= РЕЗОНАНС 2 · ДАННИ: ТЕМИ, НЕБЕ, МУЗИКА, ГЛАВИ ================= */
addUnique(TH,{
  sea:{wall:'#12232a',panel:'#162c34',line:'#0b161b',hi:'#1f3a44',s:'#3b5862',sh:'#5f8390',sd:'#22363e',amb:0.5,lamps:1,sea:1},
  town:{s:'#7d6e60',sh:'#a08f7c',sd:'#4a3f35',top:'#8a3a2a',amb:0.26,sky:1,town:1},
  thrace:{s:'#b89a6a',sh:'#d8bc88',sd:'#7a6040',top:'#e6cf96',amb:0.12,sky:1,rock:1},
  ruinp:{s:'#6e6a62',sh:'#8e8a80',sd:'#3e3c38',top:'#5f8a3e',amb:0.28,sky:1,rock:1},
  build70:{s:'#8c8a84',sh:'#b0aea6',sd:'#5a5852',top:'#c2b28a',amb:0.14,sky:1,b70:1},
  future:{s:'#6a4a3a',sh:'#8a6a52',sd:'#3a2820',top:'#4a8a6a',moss:'#7affd0',amb:0.4,sky:1,rock:1,alien:1},
  dune:{s:'#c8904a',sh:'#e8b070',sd:'#8a5a2a',top:'#f2cc8e',amb:0.05,sky:1,rock:1},
  gear:{wall:'#1e1a14',panel:'#2a2218',line:'#120e0a',hi:'#3a2e1e',s:'#6a5232',sh:'#9a7a4a',sd:'#3a2c18',amb:0.45,lamps:1,gear:1},
  gas:{s:'#6a4a8a',sh:'#8a6aaa',sd:'#3a2a5a',top:'#c89adf',moss:'#ffb0e0',amb:0.15,sky:1,rock:1,alien:1},
  necro:{s:'#3a4048',sh:'#5a6270',sd:'#22262c',top:'#4a5a52',moss:'#7affb0',amb:0.68,sky:1,rock:1,alien:1},
  source:{wall:'#08080e',panel:'#0e0e1a',line:'#05050a',hi:'#1a1a30',s:'#24243c',sh:'#9a9ae0',sd:'#12122a',amb:0.36,src:1},
},'TH');
const SKY2={
  town:{grad:[[0,'#191a3a'],[0.45,'#5a3a5e'],[0.78,'#c8704a'],[1,'#eba864']],sun:[380,210,13,'#ffe0a0'],
    layers:[{kind:'mount',col:'#3a3050',sp:0.08,base:120,waves:[[2,30,0],[5,14,1],[11,6,2]],cap:'#e6ecf4',capAt:128},{kind:'city',col:'#241a26',sp:0.3,seed:3}]},
  thrace:{grad:[[0,'#2a2a5a'],[0.5,'#c87a5a'],[1,'#f3cc92']],sun:[110,200,18,'#fff0c0'],
    layers:[{kind:'mount',col:'#7a5a6a',sp:0.1,base:96,waves:[[2,22,0],[6,9,2],[13,4,1]]},{kind:'mount',col:'#5a3e46',sp:0.3,base:58,waves:[[3,14,1],[7,8,0],[15,3,2]]}]},
  ruinp:{grad:[[0,'#3a4452'],[0.7,'#7a8490'],[1,'#a8aeb4']],
    layers:[{kind:'mount',col:'#4a525a',sp:0.1,base:96,waves:[[2,22,0],[6,9,2],[13,4,1]]},{kind:'mount',col:'#30363c',sp:0.3,base:58,waves:[[3,14,1],[7,8,0],[15,3,2]]}]},
  build70:{grad:[[0,'#5a7a9a'],[0.7,'#b8b8a8'],[1,'#d8c8a0']],sun:[400,60,12,'#fff8e0'],
    layers:[{kind:'mount',col:'#7a8a8a',sp:0.08,base:110,waves:[[2,26,0],[5,12,1],[11,5,2]],cap:'#f0f4f8',capAt:122},{kind:'cranes',col:'#3a3a38',sp:0.3,seed:5}]},
  future:{grad:[[0,'#120606'],[0.55,'#4a1414'],[1,'#a04a2a']],stars:true,
    layers:[{kind:'towers',col:'#2a1414',sp:0.12,seed:7},{kind:'towers',col:'#180a0a',sp:0.3,seed:9}]},
  dune:{grad:[[0,'#2a1236'],[0.4,'#b8583a'],[0.8,'#f2a860'],[1,'#f8d090']],sun:[240,70,26,'#fff6d8'],
    layers:[{kind:'mount',col:'#c87a44',sp:0.12,base:70,waves:[[1,18,0],[3,10,1],[6,4,2]]},{kind:'mount',col:'#a05a30',sp:0.32,base:40,waves:[[2,12,1],[4,8,2],[9,3,0]]}]},
  gas:{grad:[[0,'#0a0420'],[0.5,'#3a1a5a'],[1,'#c86a8a']],stars:true,
    layers:[{kind:'planet',col:'#e89a6a',sp:0.04,seed:2},{kind:'isles',col:'#3a2456',sp:0.18,n:7,y:60,dy:110,w:46,seed:41},{kind:'isles',col:'#24143a',sp:0.36,n:5,y:120,dy:90,w:64,seed:43}]},
  necro:{grad:[[0,'#020806'],[0.6,'#0a1a14'],[1,'#163a2a']],stars:true,moon:[380,46,11],
    layers:[{kind:'towers',col:'#0e1a16',sp:0.1,seed:11},{kind:'towers',col:'#08100c',sp:0.28,seed:13}]},
  deep:{grad:[[0,'#04121c'],[0.6,'#082232'],[1,'#0e3444']],
    layers:[{kind:'kelp',col:'#0a2a2a',sp:0.15,seed:3},{kind:'mount',col:'#061a20',sp:0.3,base:50,waves:[[2,14,1],[5,9,0],[11,4,2]]}]},
};
addUnique(SKIES,SKY2,'SKIES');
const LOAD_C1={w:['wrench','pistol','shotgun'],ammo:{pistol:[17,51],shotgun:[8,16]},armor:30,cur:'shotgun'};
const LOAD_C2={w:['wrench','pistol','shotgun','grenade'],ammo:{pistol:[17,68],shotgun:[8,24],grenade:[3,0]},armor:40,cur:'shotgun'};
const LOAD_C3={w:['wrench','pistol','shotgun','grenade','pulse'],ammo:{pistol:[17,68],shotgun:[8,24],grenade:[3,0],pulse:[40,80]},armor:50,cur:'pulse'};
const LOAD_C4={w:['wrench','pistol','shotgun','grenade','pulse','rocket'],ammo:{pistol:[17,85],shotgun:[8,32],grenade:[4,0],pulse:[40,120],rocket:[3,0]},armor:60,cur:'pulse'};
const MUS={sea:{tr:-4,bpm:96},sea2:{tr:-6,bpm:104},town:{tr:1,bpm:112},snow:{tr:2,bpm:120},time:{tr:-1,bpm:100,alien:true},worlds:{tr:3,bpm:96,alien:true},src:{tr:-5,bpm:108,alien:true}};
const CH_R2=[{t:'ЕХОТО',a:0,b:4},{t:'ГРАДЪТ',a:5,b:8},{t:'ПЛАСТОВЕТЕ',a:9,b:12},{t:'ПОГЪЛНАТИТЕ СВЕТОВЕ',a:13,b:18},{t:'ИЗТОЧНИКЪТ',a:19,b:22}];
const PROG2=[{b:33,ch:[57,60,64]},{b:31,ch:[55,59,62]},{b:29,ch:[53,57,60]},{b:28,ch:[52,56,59]}];
