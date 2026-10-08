/* ================= РЕЗОНАНС 6 · ДАННИ: ТЕМИ, НЕБЕ, МУЗИКА, ГЛАВИ ================= */
addUnique(TH,{
  acsof:{s:'#6a6e76',sh:'#8a8e96',sd:'#3e4248',top:'#9aa0a8',amb:0.6,sky:1,acsof:1},
  acpark:{s:'#4a4034',sh:'#6a5c48',sd:'#2a241c',top:'#3e6a32',amb:0.62,sky:1,rock:1,acnat:1},
  acdream:{s:'#7a6aa8',sh:'#a898d8',sd:'#4a3e78',top:'#f0d8ff',amb:0.2,sky:1,acdream:1},
  acdreamB:{s:'#a882c8',sh:'#d8b8f0',sd:'#6a4a90',top:'#ffe6a0',amb:0.06,sky:1,acdream:1,acglow:1},
  achome:{wall:'#3a2e26',panel:'#46382e',line:'#241a14',hi:'#54443a',s:'#8a6a4a',sh:'#aa8a62',sd:'#5a4430',amb:0.4,lamps:1,achome:1},
  acperp:{s:'#a86a4a',sh:'#c88a62',sd:'#6a3e2a',top:'#8a9a4a',amb:0.1,sky:1,rock:1,acnat:1,acred:1},
  actatul:{s:'#9a8a72',sh:'#bcae92',sd:'#5e5444',top:'#7a8a3a',amb:0.3,sky:1,rock:1,acnat:1},
  acyag:{wall:'#1e1a1a',panel:'#262020',line:'#100c0c',hi:'#342a28',s:'#7a6a5a',sh:'#9a8a78',sd:'#3e342c',top:'#a89680',amb:0.9,rock:1,acnat:1,accave:1},
  acgorge:{s:'#7a7a74',sh:'#9a9a92',sd:'#46463e',top:'#4a7a32',amb:0.34,sky:1,rock:1,acnat:1,wTop:'rgba(90,170,200,0.42)',wDeep:'rgba(40,100,140,0.5)'},
  acdevil:{wall:'#141618',panel:'#1a1c20',line:'#0a0c0e',hi:'#24282c',s:'#4a4e52',sh:'#6a7076',sd:'#26282c',top:'#5a6268',amb:0.86,rock:1,acnat:1,accave:1,wTop:'rgba(80,150,190,0.42)',wDeep:'rgba(30,80,120,0.5)'},
  acunder:{wall:'#0a0812',panel:'#100c1a',line:'#050408',hi:'#1a1428',s:'#2a2238',sh:'#e8c25a',sd:'#14101c',top:'#e8c25a',amb:0.8,acunder:1},
  acunderB:{wall:'#140a10',panel:'#1c0e16',line:'#08040a',hi:'#2a1420',s:'#3a2430',sh:'#ff8a6a',sd:'#1c1018',top:'#ff8a6a',amb:0.7,acunder:1},
  acbelin:{s:'#5a5248',sh:'#7a7062',sd:'#34302a',top:'#6a7a3a',amb:0.62,sky:1,rock:1,acnat:1},
  acship:{wall:'#0c0e18',panel:'#121628',line:'#06070c',hi:'#1c2240',s:'#2a3050',sh:'#8ab4ff',sd:'#141830',amb:0.66,acship:1},
},'TH');
const SKY6={
  city:{grad:[[0,'#04050c'],[0.6,'#121a30'],[1,'#2a2840']],stars:true,moon:[400,36,7],
    layers:[{kind:'city',col:'#141622',sp:0.12,seed:61},{kind:'city',col:'#0a0b12',sp:0.3,seed:67}]},
  dream:{grad:[[0,'#2a1a4a'],[0.5,'#7a5aa8'],[1,'#f0c8e8']],stars:true,
    layers:[{kind:'mount',col:'rgba(120,90,180,0.5)',sp:0.06,base:70,waves:[[2,16,0],[5,7,1],[11,3,2]]},{kind:'towers',col:'rgba(200,170,240,0.35)',sp:0.2,seed:71}]},
  dreamB:{grad:[[0,'#ffe6c8'],[0.5,'#f4c8e8'],[1,'#c8b8ff']],sun:[240,60,14,'#fff4d8'],
    layers:[{kind:'mount',col:'rgba(255,220,240,0.6)',sp:0.06,base:70,waves:[[2,16,0],[5,7,1],[11,3,2]]}]},
  rhod:{grad:[[0,'#2a4a7a'],[0.6,'#8aaad0'],[1,'#e8d8b8']],sun:[90,50,9,'#fff4d0'],
    layers:[{kind:'mount',col:'#5a6a7a',sp:0.05,base:96,waves:[[2,22,0],[5,10,1],[11,4,2]]},{kind:'mount',col:'#3a5a3a',sp:0.2,base:60,waves:[[3,16,1],[7,7,0],[19,3,2]]}]},
  rdusk:{grad:[[0,'#1a1430'],[0.5,'#7a3a4a'],[0.85,'#e8884a'],[1,'#f4c070']],sun:[380,176,10,'#ffd890'],
    layers:[{kind:'mount',col:'#3a2a3a',sp:0.06,base:84,waves:[[2,20,0],[6,8,1],[13,3,2]]},{kind:'mount',col:'#24181e',sp:0.24,base:50,waves:[[3,12,1],[9,5,0],[17,2,2]]}]},
  stars:{grad:[[0,'#02030a'],[0.6,'#0a0e24'],[1,'#1a1838']],stars:true,moon:[120,40,5],
    layers:[{kind:'mount',col:'#0e1220',sp:0.05,base:70,waves:[[2,18,0],[5,8,1],[11,3,2]]},{kind:'mount',col:'#080a14',sp:0.22,base:40,waves:[[3,10,1],[8,5,0],[17,2,2]]}]},
};
addUnique(SKIES,{accity:SKY6.city,acdream:SKY6.dream,acdreamB:SKY6.dreamB,acrhod:SKY6.rhod,acrdusk:SKY6.rdusk,acstars:SKY6.stars},'SKIES');
// ---------- плочки ----------
defTile(function(tx,ty,ch,x,y,P,z){
  if(ch!=='#') return false;
  const top=!isS(tx,ty-1);
  if(P.acsof){ if(ty>=15){ R(x,y,T,T,'#2e3036'); if(ty===15){ R(x,y,T,2,'#5a5e66'); if(tx%4===0) R(x+2,y+6,10,1,'#e8e0a0'); } return true; }
    R(x,y,T,T,P.s); R(x,y+15,T,1,P.sd); if((tx+ty)%2===0) R(x,y,1,T,P.sd);
    if(!top&&ty%2===1&&isS(tx,ty+1)&&isS(tx-1,ty)&&isS(tx+1,ty)){ R(x+3,y+3,10,9,'#1e2028'); R(x+4,y+4,8,7,hash(tx,ty)>0.62?'#ffd890':hash(tx,ty)>0.5?'#8ac0ff':'#2a2e3a'); R(x+3,y+12,10,1,'#9aa0a8'); }
    if(top){ R(x,y,T,3,P.top); R(x,y+3,T,1,P.sd); if(tx%7===3) R(x+6,y-6,2,6,'#4a4e56'); } return true; }
  if(P.acdream){ R(x,y,T,T,P.s); R(x,y+15,T,1,P.sd); if(hash(tx,ty)>0.8) R(x+4,y+5,4,4,P.sh); if(top){ R(x,y,T,2,P.top); R(x,y+2,T,1,P.sh); } if(!isS(tx,ty+1)) for(let i=0;i<T;i+=4) R(x+i+1,y+15,2,2+((tx+i)%3),P.sh); return true; }
  if(P.achome){ R(x,y,T,T,'#7a5a3e'); for(let i=0;i<T;i+=4) R(x+(ty%2?i:i+2),y,1,T,'#5a4430'); if(top) R(x,y,T,2,'#9a7a52'); return true; }
  if(P.acnat){ R(x,y,T,T,P.s); for(let i=0;i<3;i++){ const a=hash(tx*5+i,ty*3), b=hash(ty*11+i,tx); R(x+Math.floor(a*12),y+Math.floor(b*12),4,3,i%2?P.sh:P.sd); }
    if(P.acred&&ty%3===0) R(x,y+5,T,1,P.sd);
    if(top){ if(P.accave){ R(x,y,T,2,P.top); R(x,y+2,T,1,P.sd); } else { R(x,y,T,3,P.top); R(x,y+3,T,1,'#2e4a22'); for(let i=0;i<T;i+=3) if(hash(tx*T+i,ty)>0.55) R(x+i,y-1,1,2,'#7aa84a'); } }
    if(!isS(tx-1,ty)) R(x,y,1,T,P.sh); if(P.accave&&!isS(tx,ty+1)&&hash(tx,ty)>0.5){ R(x+6,y+15,3,1,P.s); R(x+7,y+16,1,2,P.s); } return true; }
  if(P.acunder){ R(x,y,T,T,P.s); R(x,y+15,T,1,P.sd); if(hash(tx,ty)>0.86){ R(x+3,y+7,7,1,P.sh); R(x+9,y+8,1,3,P.sh); } if(top){ R(x,y,T,2,P.top); R(x,y+2,T,1,P.sd); } if(!isS(tx-1,ty)) R(x,y,1,T,P.sd); return true; }
  if(P.acship){ R(x,y,T,T,P.s); R(x,y,T,1,'#3a4270'); R(x+15,y,1,T,'#141830'); if((tx*7+ty*3)%11===0){ R(x+4,y+4,8,2,'#8ab4ff'); R(x+7,y+6,2,6,'#8ab4ff'); } if(top){ R(x,y,T,2,'#8ab4ff'); R(x,y+2,T,1,'#2a3460'); } return true; }
  return false;
});
defBack(function(tx,ty,x,y,z,P){
  if(P.achome){ R(x,y,T,T,ty>=10?'#5a4a5a':'#c8b89a'); if(ty===10) R(x,y,T,2,'#3a2e3a'); if(ty<10&&ty%3===0&&tx%2) R(x,y+8,T,1,'#b8a888');
    if(ty===5&&tx%12===3){ R(x,y,22,16,'#5a3a1e'); R(x+2,y+2,18,12,'#e8d8b8'); R(x+5,y+5,4,4,'#c86a4a'); R(x+12,y+4,5,6,'#4a8aca'); } if(ty===4&&tx%12===9){ R(x,y,14,18,'#2a2a3a'); R(x+2,y+2,10,14,'#0a1a3a'); } return true; }
  if(P.accave){ R(x,y,T,T,P.wall); for(let i=0;i<3;i++){ const a=hash(tx*5+i,ty*7), b=hash(ty*9+i,tx*3); R(x+Math.floor(a*13),y+Math.floor(b*13),3,2,i%2?P.panel:P.hi); } return true; }
  if(P.acunder){ R(x,y,T,T,P.wall); if(hash(tx,ty)>0.97){ R(x+7,y+7,2,2,P.sh); } if(ty%5===2&&tx%9===4) R(x,y+7,T*2,1,P.hi); return true; }
  if(P.acship){ R(x,y,T,T,'#080a14'); if(tx%6===0) R(x+7,y,2,T,'#10142a'); if(ty%4===1) R(x,y+7,T,1,'#10142a'); if((tx+ty*5)%23===0){ R(x+4,y+4,8,8,'#1a2650'); R(x+6,y+6,4,4,'#8ab4ff'); } return true; }
  return false;
});
const LOAD6_1={w:['wrench','pistol','shotgun'],ammo:{pistol:[17,68],shotgun:[8,16]},armor:20,cur:'pistol'};
const LOAD6_2={w:['wrench','pistol','shotgun','grenade','pulse'],ammo:{pistol:[17,68],shotgun:[8,24],grenade:[3,0],pulse:[30,60]},armor:40,cur:'shotgun'};
const LOAD6_3={w:['wrench','pistol','shotgun','grenade','pulse','rocket'],ammo:{pistol:[17,85],shotgun:[8,32],grenade:[4,0],pulse:[30,90],rocket:[2,4]},armor:50,cur:'pulse'};
const MUS6={city:{tr:-5,bpm:96},dream:{tr:-9,bpm:72,alien:true},home:{tr:-7,bpm:76},rhod:{tr:-2,bpm:104},cave:{tr:-8,bpm:84},under:{tr:-11,bpm:70,alien:true},belin:{tr:-6,bpm:88,alien:true},ship:{tr:-4,bpm:118,alien:true}};
const CH6=[{t:'СОФИЯ',a:0,b:3},{t:'СЪНЯТ',a:4,b:7},{t:'ПАЗИТЕЛКАТА',a:8,b:11},{t:'ДЯВОЛСКОТО ГЪРЛО',a:12,b:15},{t:'АКОРДЪТ',a:16,b:19}];
const PROG6=[{b:28,ch:[52,55,59]},{b:31,ch:[55,59,62]},{b:26,ch:[50,53,57]},{b:33,ch:[57,61,64]}];
