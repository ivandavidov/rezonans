/* ================= DIFFICULTY =================
   Всичко, което зависи от трудността, е тук (лесно · нормално · трудно): щети, врагове, периоди на капаните, влаковете,
   въздухът под вода, животите в оцеляването, колко муниции дава един предмет и т.н. Кодът чете D.<поле>. */
const DIFFS=[
  {name:'ЛЕСНО',desc:['Враговете са бавни и почти безобидни.','Здравето ти се възстановява само.'],
   dmg:0.3,haz:0.35,ehp:0.6,bhp:0.45,rate:1.8,bspd:0.7,react:1.5,aim:0.6,heal:50,bat:40,regen:true,burst:2,spread:0.09,gren:false,ammo:2,fall:8,drop:0.9,
   lives:3,carryHp:100,svHeal:50,crush:3.8,laser:3.6,vent:3.8,elecCyc:3.8,elecOn:1.0,trainSpd:300,trainPer:10,trainWarn:3.2,chase:0.82,flood:0.7,air:22,escDmg:0.45,burn:5,mTurn:1.1,mSpd:115,hTurn:0.9,volley:-1,crabSpawn:0.3,sight:1,walk:20,nestCap:0,sleepSp:11,rocketGet:4,rocketsGet:3,grenGet:3},
  {name:'НОРМАЛНО',desc:['Трудно е, но всичко е по силите ти.','Подходящо, ако играеш за първи път.'],
   dmg:1,haz:1,ehp:1,bhp:1,rate:1,bspd:1,react:1,aim:0.42,heal:25,bat:20,regen:false,burst:3,spread:0.035,gren:true,ammo:1,fall:25,drop:0.7,
   lives:2,carryHp:60,svHeal:25,crush:3.2,laser:3.0,vent:3.2,elecCyc:3.4,elecOn:1.3,trainSpd:360,trainPer:8,trainWarn:2.6,chase:1,flood:1,air:15,escDmg:1,burn:8,mTurn:1.6,mSpd:155,hTurn:1.5,volley:0,crabSpawn:0.3,sight:1,walk:28,nestCap:0,sleepSp:14,rocketGet:3,rocketsGet:2,grenGet:2},
  {name:'ТРУДНО',desc:['Повече врагове, и то по-точни и по-бързи.','Всяко попадение боли, а аптечките почти не помагат.'],
   dmg:1.9,haz:1.6,ehp:1.4,bhp:1.6,rate:0.6,bspd:1.35,react:0.65,aim:0.22,heal:15,bat:15,regen:false,burst:4,spread:0.015,gren:true,ammo:0.6,fall:40,drop:0.4,
   lives:1,carryHp:60,svHeal:25,crush:2.6,laser:2.6,vent:2.6,elecCyc:3.0,elecOn:1.6,trainSpd:430,trainPer:6,trainWarn:2,chase:1.12,flood:1.25,air:11,escDmg:1.35,burn:11,mTurn:2.2,mSpd:180,hTurn:2.2,volley:2,crabSpawn:0.6,sight:1.25,walk:36,nestCap:1,sleepSp:17,rocketGet:3,rocketsGet:2,grenGet:2},
];
let DI=clamp(parseInt(store.get('rz.diff','1'),10)||0,0,2), D=DIFFS[DI];
const ROM=['I','II','III','IV','V'];
const allow=f=>!f||(f==='E'&&DI===0)||(f==='N'&&DI>0)||(f==='H'&&DI===2);

