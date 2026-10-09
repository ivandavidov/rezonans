/* ================= ОБЩИ ТЕМИ И НЕБЕТА НА ПОРЕДИЦАТА =================
   TH — класическите теми (от първата част; ползват ги и продълженията). Частите добавят свои с addUnique(TH,…).
   SKIES — именувани небета (частите добавят свои с addUnique; сектор на оцеляването ги взема по име). */
const TH={
  lab:{wall:'#1f2a31',panel:'#26343c',line:'#141c21',hi:'#34464f',s:'#4a5862',sh:'#6c7c87',sd:'#2a333a',amb:0.38,lamps:1},
  hall:{wall:'#22272a',panel:'#2a3034',line:'#16191c',hi:'#373e43',s:'#4c5256',sh:'#6b7277',sd:'#2a2e31',amb:0.48,lamps:1},
  waste:{wall:'#1b2520',panel:'#222e27',line:'#121a15',hi:'#2e3e34',s:'#4a534c',sh:'#69736b',sd:'#2a302b',amb:0.46,lamps:1},
  mil:{wall:'#29271f',panel:'#312e25',line:'#1b1a15',hi:'#403c31',s:'#57534a',sh:'#77726a',sd:'#33302a',amb:0.44,lamps:1},
  arena:{wall:'#161b1f',panel:'#1c2328',line:'#0e1215',hi:'#27313a',s:'#3d464e',sh:'#58636d',sd:'#232a30',amb:0.5,lamps:1},
  core:{wall:'#1b2528',panel:'#212d32',line:'#13191b',hi:'#2b3d45',s:'#4a575d',sh:'#6d7c85',sd:'#2b3338',amb:0.55,lamps:1},
  out:{s:'#7a5238',sh:'#a5714c',sd:'#4a3022',top:'#c08d5d',amb:0.14,sky:1,rock:1},
  office:{wall:'#2a2620',panel:'#322d26',line:'#1a1714',hi:'#3e382f',s:'#4f4a42',sh:'#6f685d',sd:'#2c2823',amb:0.86,lamps:1},
  tunnel:{wall:'#22201c',panel:'#29261f',line:'#151310',hi:'#35312a',s:'#4e4a42',sh:'#6c675d',sd:'#2d2a25',amb:0.52,lamps:1},
  night:{s:'#51444c',sh:'#73616e',sd:'#2d252a',top:'#7b666e',amb:0.4,sky:1,rock:1},
  hive:{wall:'#2b1a25',panel:'#361e2d',line:'#1e1018',hi:'#4a293d',s:'#693951',sh:'#9a5477',sd:'#3e2131',top:'#aa5c87',moss:'#ff6ad5',amb:0.56,rock:1,alien:1,organic:1,vein:'#4a1a34',dot:'#ff6ad5'},
  depot:{wall:'#262320',panel:'#2e2a25',line:'#171512',hi:'#3a352e',s:'#55504a',sh:'#77706a',sd:'#2f2b27',amb:0.42,lamps:1},
  factory:{wall:'#1e1a16',panel:'#26201a',line:'#120f0c',hi:'#332a20',s:'#4a3f33',sh:'#6a5a48',sd:'#2a231c',amb:0.48,lamps:1},
  citadel:{wall:'#25202e',panel:'#2d263a',line:'#191420',hi:'#3d3352',s:'#4e4366',sh:'#726296',sd:'#2e273f',amb:0.5,lamps:1},
  cave:{wall:'#1d1a28',panel:'#252132',line:'#14131d',hi:'#312b42',s:'#484262',sh:'#716899',sd:'#2b2840',top:'#5f5785',moss:'#59ffd6',amb:0.86,rock:1,alien:1,organic:1,vein:'#22304a',dot:'#59ffd6'},
  mine:{wall:'#272320',panel:'#302b26',line:'#1a1815',hi:'#3f372f',s:'#66594e',sh:'#8f7b66',sd:'#3c342d',top:'#7b6651',amb:0.62,lamps:1,rock:1,mine:1},
  cool:{wall:'#16202a',panel:'#1b2733',line:'#0d141b',hi:'#26384a',s:'#3a4a5a',sh:'#5a7084',sd:'#202a34',amb:0.5,lamps:1},
  bio:{wall:'#18241f',panel:'#1d2b25',line:'#0f1813',hi:'#273a31',s:'#44524a',sh:'#64746a',sd:'#26302a',amb:0.46,lamps:1},
  xen:{s:'#3d2e52',sh:'#5c4878',sd:'#21182e',top:'#6a5590',moss:'#4dffc3',amb:0.32,sky:1,rock:1,alien:1},
  vih:{wall:'#252b30',panel:'#2d353b',line:'#161b1f',hi:'#3b464e',s:'#56616a',sh:'#808c96',sd:'#30383e',amb:0.46,lamps:1},
  snow:{s:'#56606c',sh:'#7d8a98',sd:'#2c333c',top:'#e9f1f7',amb:0.3,sky:1,rock:1,snow:1},
  ice:{wall:'#1a2331',panel:'#1f2b3c',line:'#131a22',hi:'#2a3c4e',s:'#415974',sh:'#709dc8',sd:'#263344',top:'#e8ffff',moss:'#e8f8ff',amb:0.86,rock:1,organic:1,vein:'#1e3a5a',dot:'#8fd0ff',snow:1,ice:1},
};

// небета от нивата на r1: „Проходът“ и „Лифтът“ ползва и r2; всички — секторите на r1
const SKIES={pass:{grad:[[0,'#10162a'],[0.45,'#2c3456'],[0.75,'#7a6a8a'],[1,'#d89a86']],sun:[400,206,11,'#ffd9b0'],
   layers:[{kind:'mount',col:'#5a6480',sp:0.12,base:96,cap:'#dfe8f2',capAt:118,waves:[[3,26,0],[7,12,1],[13,5,2]]},{kind:'mount',col:'#2e3448',sp:0.32,base:52,cap:'#c8d4e2',capAt:70,waves:[[2,16,1],[5,10,3],[11,5,0.5]]}]},
  lift:{grad:[[0,'#02040a'],[0.55,'#0b1226'],[1,'#1e2c46']],stars:true,moon:[110,46,8],
   layers:[{kind:'mount',col:'#3a4660',sp:0.12,base:110,cap:'#c8d6e8',capAt:130,waves:[[2,24,0],[5,12,1],[11,5,2]]},{kind:'mount',col:'#141a28',sp:0.3,base:60,cap:'#7a8aa0',capAt:78,waves:[[3,16,1],[7,9,3],[13,4,0.5]]}]},
  canyon:{grad:[[0,'#1f1730'],[0.45,'#6e3440'],[0.75,'#c9703a'],[1,'#e8a25a']],sun:[330,196,15,'#ffe0a0'],
   layers:[{kind:'mount',col:'#4a2a35',sp:0.15,base:74,waves:[[3,18,0],[7,9,1],[13,4,2]]},{kind:'mount',col:'#2b1a20',sp:0.35,base:46,waves:[[2,14,1],[5,10,3],[11,5,0.5]]}]},
  antenna:{grad:[[0,'#03050c'],[0.55,'#0d1530'],[0.85,'#2a1a28'],[1,'#4a2020']],stars:true,moon:[90,48,9],
   layers:[{kind:'mount',col:'#10131f',sp:0.15,base:80,waves:[[2,20,0],[5,9,1],[11,4,2]]},{kind:'mount',col:'#080a12',sp:0.35,base:48,waves:[[3,12,1],[7,8,3],[13,4,0.5]]}]},
  beyond:{grad:[[0,'#07040f'],[0.5,'#1d0d33'],[1,'#0b2a2c']],stars:true,vortex:[330,70],
   layers:[{kind:'isles',col:'#24143f',sp:0.12,n:9,y:50,dy:100,w:46,seed:3},{kind:'isles',col:'#150b26',sp:0.3,n:6,y:120,dy:80,w:66,seed:7}]}};
