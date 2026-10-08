/* ================= РЕЗОНАНС 3 · ТЕМИ, НЕБЕ, НИВА ================= */
addUnique(TH,{
  sofia:{s:'#4a4a54',sh:'#6c6c78',sd:'#2a2a32',top:'#e8eef4',amb:0.62,sky:1,town:1,blackout:1},
  metro:{wall:'#16161a',panel:'#1e1e24',line:'#0c0c10',hi:'#2a2a32',s:'#4a484c',sh:'#6e6a6e',sd:'#262428',amb:0.6,lamps:1,metro:1},
  serdica:{wall:'#241c14',panel:'#2c2318',line:'#16100a',hi:'#3a2e20',s:'#8a7658',sh:'#a89272',sd:'#54442e',amb:0.64,lamps:1,serd:1},
  vitosha:{s:'#5a6470',sh:'#7c8692',sd:'#363c44',top:'#f2f6fa',amb:0.32,sky:1,rock:1},
  base:{wall:'#181c20',panel:'#20262a',line:'#0e1114',hi:'#2c343a',s:'#545e66',sh:'#78848c',sd:'#2c3338',amb:0.56,lamps:1,base:1},
  lab77:{wall:'#261f14',panel:'#30281a',line:'#18120a',hi:'#403422',s:'#7a6a4a',sh:'#9c8a62',sd:'#4a3e2a',amb:0.46,lamps:1,b70:1,lab77:1},
  rift:{wall:'#0c0306',panel:'#130508',line:'#060102',hi:'#220a10',s:'#2a0e14',sh:'#ff3b4f',sd:'#14060a',amb:0.52,rift:1},
  epic:{wall:'#09090b',panel:'#111114',line:'#040405',hi:'#1c1c22',s:'#24242a',sh:'#ffffff',sd:'#121216',amb:0.5,rift:1,core:1},
},'TH');
const SKY3={
  sofia:{grad:[[0,'#04050c'],[0.6,'#121628'],[1,'#2a2438']],
    layers:[{kind:'mount',col:'#1a1c28',sp:0.06,base:118,waves:[[2,34,0],[5,12,1],[11,5,2]],cap:'#c8d0dc',capAt:124},{kind:'city',col:'#0c0d16',sp:0.3,seed:17}]},
  vitosha:{grad:[[0,'#161c28'],[0.6,'#3e4856'],[1,'#7a8694']],
    layers:[{kind:'mount',col:'#2e3644',sp:0.08,base:120,waves:[[2,30,0],[5,14,1],[11,6,2]],cap:'#e8eef4',capAt:128},{kind:'mount',col:'#20262f',sp:0.28,base:70,waves:[[3,18,1],[7,9,0],[15,4,2]],cap:'#cfd8e2',capAt:76}]},
  rift:{grad:[[0,'#080103'],[0.6,'#24070e'],[1,'#4e0e16']],stars:true,
    layers:[{kind:'towers',col:'#18040a',sp:0.12,seed:21},{kind:'towers',col:'#0e0205',sp:0.3,seed:23}]},
};
// tiles for the new themes
addUnique(SKIES,{sofia3:SKY3.sofia,vitosha3:SKY3.vitosha,rift3:SKY3.rift},'SKIES');
// плочки и фон за новите теми
TILE_HOOKS.push(function(tx,ty,ch,x,y,P,z){
  if(ch==='#'&&P.rift){ R(x,y,T,T,P.s); if(hash(tx,ty)>0.7) R(x+2,y+3,T-5,T-6,P.sd);
    const glow=P.core?'#ffffff':'#ff3b4f';
    if(!isS(tx,ty-1)){ R(x,y,T,2,glow); R(x,y+2,T,1,P.core?'#8a8a96':'#7a1a26'); }
    if(!isS(tx-1,ty)) R(x,y,1,T,P.core?'#6a6a76':'#5a141e'); if(!isS(tx+1,ty)) R(x+15,y,1,T,'#050102');
    if(hash(tx*3,ty)>0.86){ R(x+3,y+7,7,1,glow); R(x+9,y+8,1,4,glow); }
    return true; }
  if(ch==='#'&&P.metro){ R(x,y,T,T,P.s); R(x,y,T,1,P.sh); R(x,y+15,T,1,P.sd); if(ty%2===0) R(x,y+8,T,1,'#3a383c'); if(!isS(tx,ty-1)){ R(x,y,T,3,'#8a8682'); R(x,y+3,T,1,'#2a282a'); } return true; }
  if(ch==='#'&&P.serd){ R(x,y,T,T,P.s); R(x+(ty%2?0:8),y,1,T,P.sd); R(x,y+7,T,1,P.sd); R(x,y,T,1,P.sh); if(!isS(tx,ty-1)){ R(x,y,T,3,'#c8b48c'); } if(hash(tx,ty)>0.9) R(x+3,y+3,4,3,'#6a5a40'); return true; }
  if(ch==='#'&&P.base){ R(x,y,T,T,P.s); R(x,y,T,1,P.sh); R(x,y,1,T,P.sh); R(x,y+15,T,1,P.sd); R(x+15,y,1,T,P.sd); if(hash(tx,ty)>0.92){ R(x+4,y+5,8,1,'#c9a21c'); R(x+4,y+7,8,1,'#1a1a1a'); } if(!isS(tx,ty-1)){ R(x,y,T,3,'#8a949c'); for(let i=0;i<T;i+=4) R(x+i,y+3,2,1,'#3a4248'); } return true; }
  return false;
});
BACK_HOOKS.push(function(tx,ty,x,y,z,P){
  if(P.metro){ if(ty>=3&&ty<=12&&ty%3===0) R(x,y+4,T,1,'#2a2a30'); if(tx%9===0&&ty===8) R(x,y,T*3,3,'#7a1a26'); if(tx%23===5&&ty===5){ R(x,y,26,12,'#0a0a0e'); R(x+2,y+2,22,8,'#2a1a1c'); } return true; }
  if(P.serd){ if(tx%7===3&&ty>4){ R(x+4,y,8,T,'#2e2418'); R(x+5,y,1,T,'#3e3222'); } if(ty===13&&tx%5===0) R(x,y+10,T,2,'#3a2e1e'); return true; }
  if(P.base){ if(ty===4&&tx%12===2){ R(x,y,40,6,'#c9a21c'); for(let i=0;i<40;i+=8) R(x+i,y,4,6,'#1a1a1a'); } if(tx%6===0) R(x+7,y,2,T,'#1a2024'); return true; }
  if(P.lab77){ if(ty===5&&tx%14===4){ R(x,y,30,18,'#3a3222'); R(x+2,y+2,26,14,'#1a2a20'); for(let i=0;i<5;i++) R(x+4+i*5,y+6+((tx+i)%3)*2,3,1,'#6aff9a'); } return true; }
  if(P.rift){ if(hash(tx,ty+99)>0.985){ R(x+7,y,1,T,'rgba(255,59,79,0.35)'); R(x+5,y+6,5,1,'rgba(255,59,79,0.25)'); } return true; }
  return false;
});
const LOAD3_1={w:['wrench','pistol','shotgun'],ammo:{pistol:[17,68],shotgun:[8,16]},armor:25,cur:'pistol'};
const LOAD3_2={w:['wrench','pistol','shotgun','grenade','pulse'],ammo:{pistol:[17,68],shotgun:[8,24],grenade:[3,0],pulse:[30,60]},armor:50,cur:'pulse'};
const LOAD3_3={w:['wrench','pistol','shotgun','grenade','pulse','rocket'],ammo:{pistol:[17,85],shotgun:[8,32],grenade:[4,0],pulse:[30,90],rocket:[2,4]},armor:75,cur:'pulse'};
const MUS3={city:{tr:-7,bpm:92},metro:{tr:-5,bpm:104},vit:{tr:-3,bpm:96},base:{tr:-6,bpm:118},s77:{tr:-2,bpm:100},rift:{tr:-8,bpm:96,alien:true},core:{tr:-9,bpm:112,alien:true}};
const CH3=[{t:'ТЪМНИНАТА',a:0,b:3},{t:'ВИТОША',a:4,b:7},{t:'1977',a:8,b:11},{t:'РАЗЛОМЪТ',a:12,b:15},{t:'ЕПИЦЕНТЪР',a:16,b:19}];
const PROG3=[{b:26,ch:[50,53,57]},{b:24,ch:[48,51,55]},{b:22,ch:[46,50,53]},{b:21,ch:[45,48,52]}];
