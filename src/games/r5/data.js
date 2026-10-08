/* ================= РЕЗОНАНС 5 · ДАННИ: ТЕМИ, НЕБЕ, МУЗИКА, ГЛАВИ ================= */
addUnique(TH,{
  axvil:{s:'#7a6a50',sh:'#9a8a6a',sd:'#4a3e2e',top:'#6a9a3a',amb:0.62,sky:1,axvil:1},
  axvild:{s:'#8a7a5a',sh:'#aa9a76',sd:'#54462e',top:'#7aaa42',amb:0.14,sky:1,axvil:1},
  axfield:{s:'#6a4e30',sh:'#8a6a42',sd:'#3e2c1a',top:'#d8b44a',amb:0.1,sky:1,axfield:1},
  axkrush:{s:'#c8b88e',sh:'#e6d8b0',sd:'#8a7a56',top:'#6aa83a',amb:0.08,sky:1,rock:1,axkrush:1,wTop:'rgba(60,210,200,0.42)',wDeep:'rgba(30,150,150,0.48)'},
  axmaara:{wall:'#1a1814',panel:'#22201a',line:'#0e0c0a',hi:'#2e2a22',s:'#5a5444',sh:'#7a7462',sd:'#2e2a22',top:'#6a6450',amb:0.9,rock:1,axcave:1,wTop:'rgba(60,200,190,0.4)',wDeep:'rgba(20,110,110,0.5)'},
  axcave:{wall:'#24201a',panel:'#2c2820',line:'#14120e',hi:'#3a342a',s:'#6e6654',sh:'#948a72',sd:'#3a3428',top:'#857c66',amb:0.86,rock:1,axcave:1},
  axriver:{s:'#a8a088',sh:'#c8c0a6',sd:'#6a6450',top:'#5a8a32',amb:0.12,sky:1,rock:1,axkrush:1,wTop:'rgba(70,170,160,0.4)',wDeep:'rgba(30,110,100,0.48)'},
  axdepot:{wall:'#26282a',panel:'#2e3134',line:'#16181a',hi:'#3a3e42',s:'#6a6e70',sh:'#8a9092',sd:'#3a3e40',amb:0.6,lamps:1,axdepot:1},
  axvar:{s:'#8a8070',sh:'#aaa08e',sd:'#54493e',top:'#d8d0c0',amb:0.66,sky:1,axvar:1},
  axbridge:{wall:'#3a2614',panel:'#4a3018',line:'#24160a',hi:'#5a3a1e',s:'#6a4a2a',sh:'#8a6a42',sd:'#3a2614',amb:0.62,lamps:1,axbridge:1},
  axhisar:{s:'#8a8070',sh:'#b0a690',sd:'#544a3c',top:'#6a8a3a',amb:0.6,sky:1,rock:1,axhisar:1},
  axk3:{wall:'#1a2420',panel:'#20302a',line:'#0e1612',hi:'#2a3c34',s:'#4e5e54',sh:'#6e8274',sd:'#2a3630',amb:0.58,lamps:1,axk3:1},
  axnurs:{wall:'#2e2a3a',panel:'#363044',line:'#1a1824',hi:'#443c54',s:'#6a5a48',sh:'#8a7a62',sd:'#3a3026',amb:0.7,lamps:1,axnurs:1},
},'TH');
const SKY5={
  night:{grad:[[0,'#04060e'],[0.6,'#0e1426'],[1,'#1e2638']],stars:true,moon:[96,34,6],
    layers:[{kind:'mount',col:'#141a26',sp:0.05,base:52,waves:[[2,10,0],[5,5,1],[11,2,2]]},{kind:'mount',col:'#0c1018',sp:0.2,base:30,waves:[[3,6,1],[8,3,0],[17,2,2]]}]},
  dawn:{grad:[[0,'#2a3a5a'],[0.5,'#8a8aa8'],[0.85,'#e8b48a'],[1,'#f4d4a0']],sun:[400,190,8,'#ffe0a8'],
    layers:[{kind:'mount',col:'#5a5a6a',sp:0.05,base:64,waves:[[2,12,0],[5,5,1],[11,2,2]]},{kind:'mount',col:'#3a4a3a',sp:0.22,base:36,waves:[[3,8,1],[8,4,0],[17,2,2]]}]},
  day:{grad:[[0,'#3a7ac8'],[0.6,'#8ac0e8'],[1,'#d8ecf4']],sun:[380,46,9,'#fff8d8'],
    layers:[{kind:'mount',col:'#7a9aa8',sp:0.05,base:84,waves:[[2,18,0],[5,8,1],[11,3,2]]},{kind:'mount',col:'#4a7a42',sp:0.2,base:46,waves:[[3,12,1],[7,6,0],[19,3,2]]}]},
  dusk:{grad:[[0,'#1a1a3a'],[0.5,'#6a3a5a'],[0.85,'#e07a4a'],[1,'#f4b46a']],sun:[110,180,10,'#ffd890'],
    layers:[{kind:'mount',col:'#3a2a3a',sp:0.06,base:66,waves:[[2,14,0],[6,6,1],[13,3,2]]},{kind:'city',col:'#1e1622',sp:0.26,seed:53}]},
};
addUnique(SKIES,{axnight:SKY5.night,axdawn:SKY5.dawn,axday:SKY5.day,axdusk:SKY5.dusk},'SKIES');
// ---------- плочки ----------
TILE_HOOKS.push(function(tx,ty,ch,x,y,P,z){
  if(ch!=='#') return false;
  const top=!isS(tx,ty-1);
  if(P.axvil){ if(ty>=15){ R(x,y,T,T,ty>15?'#3a2e20':'#5a4a34'); if(ty===15){ R(x,y,T,3,P.top); for(let i=0;i<T;i+=3) if(hash(tx*T+i,7)>0.5) R(x+i,y-1,1,2,'#8ac04a'); R(x,y+3,T,1,'#3a2e20'); if(hash(tx,ty)>0.8) R(x+5,y+8,3,2,'#7a6a52'); } return true; }
    const wall=hash(Math.floor(tx/4),3)>0.5?'#e8e0cc':'#e0d4b8'; R(x,y,T,T,wall); R(x,y+15,T,1,'#b8ac90');
    if(top){ R(x-1,y-2,T+2,5,'#a8442a'); for(let i=0;i<T;i+=4) R(x+i,y,2,3,'#8a3a22'); R(x,y+3,T,1,'#5a2a1a'); }
    else if(ty%3===1&&tx%3===1&&isS(tx,ty+1)&&isS(tx-1,ty)&&isS(tx+1,ty)){ R(x+3,y+2,10,10,'#6a4a2a'); R(x+4,y+3,8,8,hash(tx,ty)>0.6?'#ffd890':'#2a3040'); R(x+8,y+3,1,8,'#6a4a2a'); R(x+4,y+7,8,1,'#6a4a2a'); }
    if(!isS(tx-1,ty)) R(x,y,1,T,'#f4ece0'); if(!isS(tx+1,ty)) R(x+15,y,1,T,'#a89c80'); if(!isS(tx,ty+1)) R(x,y+14,T,2,'#7a6a52'); return true; }
  if(P.axfield){ R(x,y,T,T,P.s); for(let i=0;i<3;i++) R(x+Math.floor(hash(tx*3+i,ty)*13),y+Math.floor(hash(ty*7+i,tx)*13),3,2,i%2?P.sh:P.sd);
    if(top){ R(x,y,T,3,'#8a6a3a'); for(let i=0;i<T;i+=2) R(x+i,y-3-Math.floor(hash(tx*T+i,ty)*4),1,4+Math.floor(hash(tx*T+i,ty)*4),hash(i,tx)>0.5?'#e8c860':'#c8a040'); } return true; }
  if(P.axkrush){ R(x,y,T,T,P.s); for(let i=0;i<T;i+=4) R(x,y+i+(tx%2),T,1,i%8?P.sd:P.sh); if(hash(tx,ty)>0.85) R(x+3,y+5,5,3,'#a8986e');
    if(top){ R(x,y,T,3,P.top); R(x,y+3,T,1,'#4a7a2a'); for(let i=0;i<T;i+=3) if(hash(tx*T+i,ty)>0.55) R(x+i,y-1,1,2,'#8ac84a'); if(!isS(tx+1,ty)||!isS(tx-1,ty)) R(x+(isS(tx+1,ty)?0:13),y+3,3,6,'rgba(90,220,210,0.5)'); }
    if(!isS(tx,ty+1)){ R(x+4,y+15,2,1,'#e6d8b0'); R(x+11,y+15,1,1,'#e6d8b0'); } return true; }
  if(P.axcave){ R(x,y,T,T,P.s); for(let i=0;i<3;i++){ const a=hash(tx*5+i,ty*3), b=hash(ty*11+i,tx); R(x+Math.floor(a*12),y+Math.floor(b*12),4,3,i%2?P.sh:P.sd); }
    if(top){ R(x,y,T,2,P.top); R(x,y+2,T,1,P.sd); } if(!isS(tx,ty+1)&&hash(tx,ty)>0.5){ R(x+6,y+15,3,1,P.s); R(x+7,y+16,1,2,P.s); } if(!isS(tx-1,ty)) R(x,y,1,T,P.sh); return true; }
  if(P.axdepot){ R(x,y,T,T,P.s); R(x,y,T,1,P.sh); R(x,y+15,T,1,P.sd); if(ty%3===0) R(x,y+8,T,1,'#5a5e60'); if(hash(tx,ty)>0.9) R(x+3,y+4,4,7,'#4a3a2a');
    if(top){ R(x,y,T,3,'#9aa0a2'); if(tx%4<2) R(x,y+3,T,2,'#c9a21c'); else R(x,y+3,T,2,'#1a1a1a'); } return true; }
  if(P.axvar){ if(ty>=15){ R(x,y,T,T,'#4a4038'); if(ty===15){ for(let i=0;i<T;i+=5) R(x+i+(tx%2)*2,y,4,3,hash(tx*T+i,ty)>0.5?'#8a8070':'#6a6058'); R(x,y+3,T,1,'#2a2420'); } return true; }
    const up=ty<=Math.max(2,groundY(tx)/T-4); R(x,y,T,T,up?'#f0ece4':'#9a8e7a'); if(!up){ R(x+((ty%2)?0:8),y,1,8,'#6a604e'); R(x,y+8,T,1,'#6a604e'); }
    else { if(ty%4===1) R(x,y,T,2,'#5a3a1e'); if(tx%3===1&&ty%4===2){ R(x+3,y+1,10,9,'#5a3a1e'); R(x+4,y+2,8,7,hash(tx,ty)>0.5?'#ffd890':'#2a2a30'); } }
    if(top){ R(x-1,y-3,T+2,4,'#7a3a22'); R(x-1,y+1,T+2,2,'#3a2414'); } return true; }
  if(P.axbridge){ R(x,y,T,T,P.s); for(let i=2;i<T;i+=5) R(x,y+i,T,1,P.sd); R(x+(tx%3)*5,y,1,T,P.sd); if(top){ R(x,y,T,2,P.sh); } return true; }
  if(P.axhisar){ R(x,y,T,T,P.s); R(x,y+7,T,1,P.sd); R(x+((ty%2)?3:11),y,1,7,P.sd); R(x+((ty%2)?11:3),y+8,1,8,P.sd); R(x,y,T,1,P.sh); if(hash(tx,ty)>0.86) R(x+4,y+2,5,4,'#a89a80');
    if(top){ if(!isS(tx,ty-1)&&ty<15&&tx%2===0) R(x+2,y-5,12,5,P.s); R(x,y,T,2,ty>=15?P.top:P.sh); } return true; }
  if(P.axk3){ R(x,y,T,T,P.s); R(x,y,T,1,P.sh); R(x,y,1,T,P.sh); R(x,y+15,T,1,P.sd); R(x+15,y,1,T,P.sd); if(hash(tx,ty)>0.9){ R(x+4,y+5,8,5,'#2a3630'); R(x+5,y+6,2,2,'#3aff8a'); } if(top){ R(x,y,T,3,'#8aa294'); R(x,y+3,T,1,P.sd); } return true; }
  if(P.axnurs){ R(x,y,T,T,'#b89a72'); for(let i=0;i<T;i+=4) R(x,y+i,T,1,'#9a7e5a'); if(top){ R(x,y,T,2,'#d8bc90'); } return true; }
  return false;
});
// ---------- фон (вътрешни теми) ----------
BACK_HOOKS.push(function(tx,ty,x,y,z,P){
  if(P.axcave){ R(x,y,T,T,P.wall); for(let i=0;i<3;i++){ const a=hash(tx*5+i,ty*7), b=hash(ty*9+i,tx*3); R(x+Math.floor(a*13),y+Math.floor(b*13),3,2,i%2?P.panel:P.hi); }
    if(ty<6&&hash(tx,ty+40)>0.94) R(x+4,y+4,6,3,'#3a3024'); return true; }
  if(P.axdepot){ R(x,y,T,T,ty<4?'#22252a':'#2c3034'); if(ty===4) R(x,y+6,T,3,'#3a4046'); if(ty===5&&tx%2) R(x+7,y,2,T,'#3a4046');
    if(ty>=7&&ty<=14&&tx%16<10){ const l=tx%16; R(x,y,T,T,'#4a5258'); if(l===0||l===9) R(x+(l?14:0),y,2,T,'#2a3034'); if(ty===7) R(x,y,T,2,'#6a747a'); if(ty===10&&l===4){ lx.font='600 6px "IBM Plex Mono",monospace'; lx.fillStyle='#c9a21c'; lx.fillText('ДР-'+(10+(tx>>4)),x-8,y+8); } } return true; }
  if(P.axbridge){ R(x,y,T,T,ty<4?'#2a1a0e':'#3e2a16'); if(ty===3) R(x,y+10,T,6,'#5a3a1e'); if(ty>=6&&ty<=12&&tx%8<6){ R(x,y,T,T,'#5a4026'); if(ty===7&&tx%8===1){ R(x,y,4*T,10,'#2a2a30'); R(x+2,y+2,4*T-4,6,hash(tx,9)>0.5?'#ffd890':'#8a6a42'); } } if(ty===13) R(x,y+10,T,2,'#24160a'); return true; }
  if(P.axk3){ R(x,y,T,T,ty>=9?'#2e463c':'#9aa494'); if(ty===9) R(x,y,T,2,'#1a2a22'); if(ty<9&&ty%4===1&&tx%2) R(x,y+6,T,1,'#848e80'); if(ty===5&&tx%13===4){ R(x,y,24,16,'#1a2420'); R(x+2,y+2,20,12,'#0a1a10'); for(let i=0;i<4;i++) R(x+4,y+4+i*2,6+((tx+i)%4)*3,1,'#3aff8a'); } return true; }
  if(P.axnurs){ R(x,y,T,T,ty>=10?'#c8b0d0':'#e8d8e8'); if(ty===10) R(x,y,T,2,'#9a7aa8'); if(ty===6&&tx%9===3){ R(x,y,20,16,'#ffffff'); R(x+3,y+4,5,5,'#ff8a4a'); R(x+10,y+8,7,4,'#4a9aff'); R(x+12,y+3,3,3,'#ffd84a'); } if(ty===4&&tx%5===0) R(x+6,y,4,4,'#ffe68a'); return true; }
  return false;
});
const LOAD5_1={w:['wrench','pistol'],ammo:{pistol:[17,68]},armor:0,cur:'pistol'};
const LOAD5_2={w:['wrench','pistol','shotgun'],ammo:{pistol:[17,68],shotgun:[8,24]},armor:25,cur:'shotgun'};
const LOAD5_3={w:['wrench','pistol','shotgun','grenade','pulse'],ammo:{pistol:[17,85],shotgun:[8,32],grenade:[3,0],pulse:[30,60]},armor:40,cur:'pulse'};
const LOAD5_4={w:['wrench','pistol','shotgun','grenade','pulse','rocket'],ammo:{pistol:[17,85],shotgun:[8,32],grenade:[4,0],pulse:[30,90],rocket:[2,4]},armor:50,cur:'pulse'};
const MUS5={vil:{tr:-3,bpm:92},field:{tr:0,bpm:104},krush:{tr:2,bpm:100},maara:{tr:-7,bpm:80},cave:{tr:-8,bpm:84},lovech:{tr:-2,bpm:112},hisar:{tr:-4,bpm:120},k3:{tr:-6,bpm:116},nurs:{tr:-9,bpm:66}};
const CH5=[{t:'АЛЕКСАНДРОВО',a:0,b:3},{t:'КРУШУНА',a:4,b:7},{t:'ДЕВЕТАШКАТА ПЕЩЕРА',a:8,b:11},{t:'ЛОВЕЧ',a:12,b:15},{t:'ИЗВОРЪТ',a:16,b:19}];
const PROG5=[{b:31,ch:[55,59,62]},{b:28,ch:[52,55,59]},{b:33,ch:[57,60,64]},{b:26,ch:[50,54,57]}];
