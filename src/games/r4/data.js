/* ================= РЕЗОНАНС 4 · ДАННИ: ТЕМИ НА ПЛЕВЕН, НЕБЕ, МУЗИКА, ГЛАВИ ================= */
addUnique(TH,{
  plcity:{s:'#8a7a62',sh:'#b09c7c',sd:'#4e4434',top:'#c8b48c',amb:0.5,sky:1,plcity:1},
  plteatr:{wall:'#2a0e12',panel:'#3a1218',line:'#160608',hi:'#4a1a20',s:'#4a3020',sh:'#7a5432',sd:'#2a1a10',amb:0.52,lamps:1,plteatr:1},
  plpark:{s:'#5a4a32',sh:'#7a6644',sd:'#33291c',top:'#8a7a2a',amb:0.36,sky:1,rock:1,plpark:1},
  plpano:{s:'#7a6040',sh:'#a88a5a',sd:'#4a3826',top:'#b89a5a',amb:0.18,sky:1,rock:1,plpano:1},
  plrock:{s:'#b8b098',sh:'#dcd4bc',sd:'#7a7262',top:'#6a8a3a',amb:0.16,sky:1,rock:1,plrock:1},
  plstorg:{s:'#9a8e78',sh:'#c0b49a',sd:'#5e5646',top:'#7a8a4a',amb:0.2,sky:1,rock:1,plstorg:1},
  plstorgB:{s:'#b0a084',sh:'#d4c4a2',sd:'#6a5e48',top:'#c8b890',amb:0.14,sky:1,plstorg:1,plbrick:1},
  plcave:{wall:'#1e1a14',panel:'#26201a',line:'#120f0b',hi:'#322a20',s:'#6a6250',sh:'#8a8270',sd:'#3a3428',top:'#7a7260',amb:0.66,lamps:1,rock:1,plcave:1},
  plkarst:{wall:'#0c0c0e',panel:'#121214',line:'#060607',hi:'#1a1a1e',s:'#3a3a3e',sh:'#5a5a62',sd:'#1e1e22',top:'#4a4a52',amb:0.97,rock:1,plkarst:1},
  plk2:{wall:'#1e2a24',panel:'#24322a',line:'#121a16',hi:'#2e4036',s:'#5a6a60',sh:'#7a8c80',sd:'#323e36',amb:0.5,lamps:1,plk2:1},
  plbeyond:{s:'#d8d0e4',sh:'#ffffff',sd:'#9a8eb4',top:'#b48cff',amb:0.1,sky:1,plbeyond:1},
},'TH');
const SKY4={
  night:{grad:[[0,'#05060e'],[0.6,'#141a30'],[1,'#3a2e44']],stars:true,moon:[380,40,7],
    layers:[{kind:'mount',col:'#141626',sp:0.05,base:60,waves:[[2,14,0],[5,6,1],[11,3,2]]},{kind:'city',col:'#0b0c16',sp:0.28,seed:41}]},
  dusk:{grad:[[0,'#1a1430'],[0.5,'#6a3a4a'],[0.85,'#d8804a'],[1,'#f0b060']],sun:[90,170,9,'#ffd890'],
    layers:[{kind:'mount',col:'#3a2a30',sp:0.06,base:70,waves:[[2,16,0],[6,6,1],[13,3,2]]},{kind:'mount',col:'#24181e',sp:0.22,base:44,waves:[[3,10,1],[9,5,0],[17,2,2]]}]},
  pano:{grad:[[0,'#c8b890'],[0.45,'#e0c89a'],[0.8,'#b8946a'],[1,'#8a6a4a']],
    layers:[{kind:'mount',col:'#b8a07a',sp:0.04,base:80,waves:[[2,10,0],[4,6,1],[9,3,2]]},{kind:'mount',col:'#9a7a52',sp:0.08,base:52,waves:[[2,12,0],[5,6,1],[12,3,2]]},{kind:'mount',col:'#6a5236',sp:0.26,base:30,waves:[[3,8,1],[8,4,0],[15,2,2]]}]},
  kail:{grad:[[0,'#3a4a66'],[0.6,'#8a9ab4'],[1,'#d8c8a8']],sun:[400,60,8,'#fff0c8'],
    layers:[{kind:'mount',col:'#7a8294',sp:0.06,base:96,waves:[[2,20,0],[5,10,1],[11,4,2]]},{kind:'mount',col:'#9a9484',sp:0.18,base:66,waves:[[3,22,1],[7,10,0],[19,4,2]]},{kind:'mount',col:'#4a5a3a',sp:0.3,base:30,waves:[[4,8,0],[9,4,1],[21,2,2]]}]},
  beyond:{grad:[[0,'#f4f0fa'],[0.6,'#ddd4ec'],[1,'#b8a8d8']],
    layers:[{kind:'towers',col:'rgba(150,120,210,0.25)',sp:0.1,seed:43},{kind:'city',col:'rgba(120,90,190,0.35)',sp:0.25,seed:47}]},
};
addUnique(SKIES,{plnight:SKY4.night,pldusk:SKY4.dusk,plpano:SKY4.pano,plkail:SKY4.kail,plbeyond:SKY4.beyond},'SKIES');
// ---------- плочки ----------
defTile(function(tx,ty,ch,x,y,P,z){
  if(ch==='1'||ch==='2'||ch==='3'){ if(!P.sky) drawBack(tx,ty); return true; }   // тоновите плочки се рисуват всеки кадър (механиката freqsonar)
  if(ch!=='#') return false;
  const top=!isS(tx,ty-1);
  if(P.plcity){ const bl=Math.floor(tx/5), c=hash(bl,3)>0.5?'#a8946e':'#9a8a70';
    R(x,y,T,T,ty>=15?'#5a5248':c); if(ty>=15){ R(x,y,T,1,'#7a7064'); if((tx+ty)%2) R(x+8,y+2,1,6,'#4a443c'); return true; }
    if(top){ R(x,y,T,3,'#e0d4b4'); R(x,y+3,T,1,'#5a4e3c'); R(x,y+4,T,1,'#c0b090'); }
    else if(ty%3===1&&tx%3===1&&isS(tx,ty+1)&&isS(tx-1,ty)&&isS(tx+1,ty)){ R(x+3,y+1,10,12,'#3a3428'); R(x+4,y+2,8,10,hash(tx,ty)>0.6?'#ffd890':'#2a3040'); R(x+7,y+2,1,10,'#3a3428'); R(x+2,y+13,12,2,'#e0d4b4'); }
    if(!isS(tx-1,ty)) R(x,y,1,T,'#d0c4a4'); if(!isS(tx+1,ty)) R(x+15,y,1,T,'#5a4e3c'); return true; }
  if(P.plteatr){ R(x,y,T,T,P.s); for(let i=0;i<T;i+=4) R(x,y+i,T,1,P.sd); R(x+((tx*7)%13),y,1,T,P.sd); if(top){ R(x,y,T,3,'#a87a46'); R(x,y+3,T,1,'#2a1a10'); } return true; }
  if(P.plpano){ R(x,y,T,T,P.s); for(let i=0;i<4;i++){ const a=hash(tx*3+i,ty), b=hash(ty*5+i,tx); R(x+Math.floor(a*10),y+Math.floor(b*13),5,2,i%2?P.sh:P.sd); }
    if(top){ R(x,y,T,3,P.top); for(let i=0;i<T;i+=3) R(x+i,y-1,2,1,'#7a8a4a'); } if(!isS(tx-1,ty)) R(x,y,1,T,P.sh); return true; }
  if(P.plstorg){ const br=P.plbrick; R(x,y,T,T,P.s); R(x,y+7,T,1,P.sd); R(x+(ty%2?0:8),y,1,7,P.sd); R(x+(ty%2?8:0),y+8,1,8,P.sd); R(x,y,T,1,P.sh);
    if(br&&ty%4===2){ R(x,y+2,T,4,'#9a4a32'); R(x,y+4,T,1,'#7a3a26'); }
    if(top){ R(x,y,T,3,br?'#e0d0aa':P.top); if(!br) for(let i=0;i<T;i+=3) if(hash(tx*T+i,ty)>0.6) R(x+i,y-1,1,1,'#9aaa5a'); }
    if(!br&&hash(tx,ty*3)>0.88) R(x+3,y+3,6,4,P.sd); return true; }
  if(P.plk2){ R(x,y,T,T,P.s); R(x,y,T,1,P.sh); R(x,y,1,T,P.sh); R(x,y+15,T,1,P.sd); R(x+15,y,1,T,P.sd); if(hash(tx,ty)>0.9){ R(x+4,y+6,8,4,'#3e4a42'); R(x+5,y+7,2,2,'#c94a2a'); } if(top){ R(x,y,T,3,'#9aa69c'); R(x,y+3,T,1,P.sd); } return true; }
  if(P.plbeyond){ R(x,y,T,T,P.s); R(x,y+15,T,1,P.sd); R(x+15,y,1,T,P.sd); if(hash(tx,ty)>0.8) R(x+5,y+5,4,4,'#ece6f4'); if(top){ R(x,y,T,2,P.top); R(x,y+2,T,1,'#ffffff'); } if(!isS(tx,ty+1)) R(x,y+14,T,2,'#8a7aac'); return true; }
  return false;
});
// ---------- фон (вътрешни теми) ----------
defBack(function(tx,ty,x,y,z,P){
  if(P.plteatr){ R(x,y,T,T,'#2a0a0e'); const f=(tx*T+ty*3)%12; if(f<3) R(x+f,y,2,T,'#3e1016'); if(f>8) R(x+f-8,y,1,T,'#1a0508');
    if(ty===2) R(x,y+4,T,6,'#6a1a20'); if(ty===2&&tx%3===0) R(x+2,y+9,12,4,'#8a2a2a'); if(ty===3&&tx%6===2) R(x+6,y,4,6,'#c8a050'); return true; }
  if(P.plcave){ R(x,y,T,T,P.wall); for(let i=0;i<3;i++){ const a=hash(tx*5+i,ty*7), b=hash(ty*9+i,tx*3); R(x+Math.floor(a*13),y+Math.floor(b*13),3,2,i%2?P.panel:P.hi); }
    if(ty>=12&&tx%6<4){ const cx=x+(tx%6===0?8:tx%6===3?0:4); if(ty===12&&tx%6===1){ lx.fillStyle='#4a2e1a'; lx.beginPath(); lx.ellipse(x+8,y+28,14,20,0,0,7); lx.fill(); lx.fillStyle='#2a1a0e'; for(const o of [-14,-2,10]) lx.fillRect(x+8-14,y+28+o,28,2); } } return true; }
  if(P.plkarst){ R(x,y,T,T,'#08080a'); if(hash(tx,ty)>0.93) R(x+6,y+4,2,6,'#16161a'); return true; }
  if(P.plk2){ R(x,y,T,T,ty>=9?'#3a5a48':'#c8c4a8'); if(ty===9) R(x,y,T,2,'#2a3a30'); if(ty<9&&ty%4===1&&tx%2) R(x,y+6,T,1,'#b0ac90'); if(ty===5&&tx%11===3){ R(x,y,26,16,'#2a2a22'); R(x+2,y+2,22,12,'#c8c09a'); for(let i=0;i<4;i++) R(x+4,y+4+i*2,12+((tx+i)%3)*2,1,'#5a5444'); } return true; }
  return false;
});
const LOAD4_1={w:['wrench','pistol','shotgun'],ammo:{pistol:[17,68],shotgun:[8,16]},armor:25,cur:'pistol'};
const LOAD4_2={w:['wrench','pistol','shotgun','grenade','pulse'],ammo:{pistol:[17,68],shotgun:[8,24],grenade:[3,0],pulse:[30,60]},armor:40,cur:'shotgun'};
const LOAD4_3={w:['wrench','pistol','shotgun','grenade','pulse','rocket'],ammo:{pistol:[17,85],shotgun:[8,32],grenade:[4,0],pulse:[30,90],rocket:[2,4]},armor:50,cur:'pulse'};
const MUS4={city:{tr:-4,bpm:100},teatr:{tr:-6,bpm:88},park:{tr:-2,bpm:96},pano:{tr:-8,bpm:72},kail:{tr:0,bpm:108},cave:{tr:-9,bpm:80},k2:{tr:-5,bpm:116},beyond:{tr:-10,bpm:66,alien:true}};
const CH4=[{t:'ГРАДЪТ',a:0,b:3},{t:'СКОБЕЛЕВИЯТ ПАРК',a:4,b:7},{t:'КАЙЛЪКА',a:8,b:11},{t:'ПОД ПЛЕВЕН',a:12,b:15},{t:'ДИРИГЕНТЪТ',a:16,b:19}];
const PROG4=[{b:29,ch:[53,57,60]},{b:26,ch:[50,53,57]},{b:31,ch:[55,58,62]},{b:24,ch:[48,52,55]}];
