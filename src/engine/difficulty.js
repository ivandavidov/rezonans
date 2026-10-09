/* ================= DIFFICULTY ================= */
const DIFFS=[
  {name:'ЛЕСНО',desc:['Враговете са бавни и почти безобидни.','Здравето ти се възстановява само.'],
   dmg:0.3,haz:0.35,ehp:0.6,bhp:0.45,rate:1.8,bspd:0.7,react:1.5,aim:0.6,heal:50,bat:40,regen:true,burst:2,spread:0.09,gren:false,ammo:2,fall:8,drop:0.9},
  {name:'НОРМАЛНО',desc:['Трудно е, но всичко е по силите ти.','Подходящо, ако играеш за първи път.'],
   dmg:1,haz:1,ehp:1,bhp:1,rate:1,bspd:1,react:1,aim:0.42,heal:25,bat:20,regen:false,burst:3,spread:0.035,gren:true,ammo:1,fall:25,drop:0.7},
  {name:'ТРУДНО',desc:['Повече врагове, и то по-точни и по-бързи.','Всяко попадение боли, а аптечките почти не помагат.'],
   dmg:1.9,haz:1.6,ehp:1.4,bhp:1.6,rate:0.6,bspd:1.35,react:0.65,aim:0.22,heal:15,bat:15,regen:false,burst:4,spread:0.015,gren:true,ammo:0.6,fall:40,drop:0.4},
];
let DI=clamp(parseInt(store.get('rz.diff','1'),10)||0,0,2), D=DIFFS[DI];
const ROM=['I','II','III','IV','V'];
const allow=f=>!f||(f==='E'&&DI===0)||(f==='N'&&DI>0)||(f==='H'&&DI===2);

