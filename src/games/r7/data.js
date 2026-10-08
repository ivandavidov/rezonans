/* ================= РЕЗОНАНС 7 · ДАННИ: ТЕМИ, НЕБЕ, МУЗИКА, ГЛАВИ ================= */
// fx: какъв „екран“ рисува филтърът — green (зелен фосфор), apple, cga, ram, web
addUnique(TH,{
  pxboot:{wall:'#020602',panel:'#031003',line:'#000000',hi:'#0a240a',s:'#16481a',sh:'#5aff7a',sd:'#0a2a0c',top:'#8aff9a',amb:0.12,pxgreen:1,fx:'green'},
  pxappA:{wall:'#000000',panel:'#08040c',line:'#000000',hi:'#140a1c',s:'#9a3ae8',sh:'#2ae84a',sd:'#4a1a78',top:'#ffffff',amb:0.1,pxapple:1,fx:'apple'},
  pxappB:{wall:'#000000',panel:'#0c0804',line:'#000000',hi:'#1c140a',s:'#e8782a',sh:'#2a9ae8',sd:'#7a3a10',top:'#ffffff',amb:0.1,pxapple:1,fx:'apple'},
  pxcga:{wall:'#000000',panel:'#00080a',line:'#000000',hi:'#002a2e',s:'#2ae8e8',sh:'#e82ae8',sd:'#0a6a6a',top:'#ffffff',amb:0.14,pxcga:1,fx:'cga'},
  pxcgaB:{wall:'#000000',panel:'#080400',line:'#000000',hi:'#2a1a00',s:'#2ab82a',sh:'#d83a2a',sd:'#0a5a0a',top:'#d8a82a',amb:0.14,pxcga:1,fx:'cga'},
  pxram:{wall:'#0a2a14',panel:'#0c3218',line:'#06180c',hi:'#14482a',s:'#1a1c22',sh:'#c8a83a',sd:'#0a0c10',top:'#9aa2aa',amb:0.3,pxram:1,fx:'ram',wTop:'rgba(120,200,255,0.45)',wDeep:'rgba(40,90,200,0.55)'},
  pxweb:{wall:'#007878',panel:'#008080',line:'#005a5a',hi:'#1a9a9a',s:'#c0c0c0',sh:'#ffffff',sd:'#808080',top:'#ffffff',amb:0.1,pxweb:1,fx:'web'},
  pxcloud:{s:'#e8eef6',sh:'#ffffff',sd:'#a8b8cc',top:'#ffffff',amb:0.05,sky:1,pxcloud:1,fx:'web'},
},'TH');
const SKY7={
  cloud:{grad:[[0,'#3a7ad8'],[0.6,'#8ac0f0'],[1,'#e8f4ff']],sun:[380,40,12,'#fff8d0'],
    layers:[{kind:'mount',col:'rgba(255,255,255,0.55)',sp:0.05,base:120,waves:[[3,14,0],[7,8,1],[13,4,2]]},{kind:'mount',col:'rgba(255,255,255,0.8)',sp:0.18,base:60,waves:[[4,10,1],[9,6,0],[19,3,2]]}]},
  grid:{grad:[[0,'#000000'],[1,'#03140a']],stars:true,layers:[]},
};
addUnique(SKIES,{pxcloud:SKY7.cloud,pxgrid:SKY7.grid},'SKIES');
// ---------- плочки ----------
defTile(function(tx,ty,ch,x,y,P,z){
  if(ch!=='#') return false;
  const top=!isS(tx,ty-1), lft=!isS(tx-1,ty), rgt=!isS(tx+1,ty), bot=!isS(tx,ty+1);
  if(P.pxgreen){ R(x,y,T,T,P.s); if(hash(tx,ty)>0.55) R(x+3+Math.floor(hash(ty,tx)*6),y+4,4,6,P.sd);
    if(top) R(x,y,T,2,P.top); if(lft) R(x,y,1,T,P.sh); if(rgt) R(x+15,y,1,T,P.sh); if(bot) R(x,y+15,T,1,P.sh); return true; }
  if(P.pxapple){ for(let i=0;i<T;i+=2) R(x+i,y,1,T,(Math.floor(i/2)+tx+ty)%2?P.s:P.sh); R(x,y,T,T,'rgba(0,0,0,0.35)');
    if(top){ R(x,y,T,2,P.top); R(x,y+2,T,1,P.sh); } if(lft) R(x,y,1,T,P.s); if(rgt) R(x+15,y,1,T,P.sh); return true; }
  if(P.pxcga){ R(x,y,T,T,P.sd); for(let yy=0;yy<T;yy+=2) for(let xx=(yy/2)%2;xx<T;xx+=2) R(x+xx,y+yy,1,1,P.s);
    if(top){ R(x,y,T,2,P.top); R(x,y+2,T,1,P.sh); } if(lft||rgt) R(lft?x:x+15,y,1,T,P.sh); return true; }
  if(P.pxram){ R(x,y,T,T,P.s); R(x+1,y+1,T-2,T-2,'#22252c'); if(top){ R(x,y,T,2,P.top); for(let i=2;i<T;i+=4) R(x+i,y-2,2,2,P.sh); } if(bot) for(let i=2;i<T;i+=4) R(x+i,y+15,2,2,P.sh);
    if(hash(tx,ty)>0.8) R(x+5,y+6,6,1,'#5a5e66'); return true; }
  if(P.pxweb){ R(x,y,T,T,P.s); R(x,y,T,1,P.sh); R(x,y,1,T,P.sh); R(x,y+15,T,1,P.sd); R(x+15,y,1,T,P.sd); if(top) R(x,y,T,2,'#ffffff'); return true; }
  if(P.pxcloud){ R(x,y,T,T,P.s); if(top){ lx.fillStyle=P.sh; lx.beginPath(); lx.arc(x+8,y+3,6+hash(tx,3)*3,0,7); lx.fill(); } if(bot) R(x,y+14,T,2,P.sd); return true; }
  return false;
});
defBack(function(tx,ty,x,y,z,P){
  if(P.pxgreen){ R(x,y,T,T,P.wall); if(ty%2===0&&hash(tx,ty)>0.86){ R(x+2,y+5,3,5,P.hi); R(x+7,y+5,3,5,P.hi); } if(ty%4===0) R(x,y+8,T,1,'#041204'); return true; }
  if(P.pxapple){ R(x,y,T,T,P.wall); if(hash(tx,ty)>0.94) R(x+Math.floor(hash(ty,tx)*14),y+6,2,1,hash(tx+1,ty)>0.5?P.s:P.sh); return true; }
  if(P.pxcga){ R(x,y,T,T,P.wall); if((tx+ty)%2===0&&hash(tx,ty)>0.7) R(x+7,y+7,2,2,P.hi); return true; }
  if(P.pxram){ R(x,y,T,T,P.wall); if(ty%3===1) R(x,y+7,T,1,P.hi); if(tx%5===2) R(x+7,y,1,T,P.hi); if(ty%3===1&&tx%5===2) R(x+5,y+5,5,5,'#c8a83a'); if(hash(tx,ty)>0.95){ R(x+2,y+2,12,10,'#14161c'); for(let i=3;i<14;i+=3){ R(x+i,y,1,2,'#9aa2aa'); R(x+i,y+12,1,2,'#9aa2aa'); } } return true; }
  if(P.pxweb){ R(x,y,T,T,P.panel); if(tx%9===2&&ty%5===2){ R(x,y,14,12,'#ffffff'); R(x+1,y+1,12,3,'#000080'); R(x+3,y+6,8,4,'#c0c0c0'); } return true; }
  return false;
});
const LOAD7_1={w:['wrench','pistol','shotgun'],ammo:{pistol:[17,68],shotgun:[8,16]},armor:20,cur:'pistol'};
const LOAD7_2={w:['wrench','pistol','shotgun','grenade','pulse'],ammo:{pistol:[17,68],shotgun:[8,24],grenade:[3,0],pulse:[30,60]},armor:40,cur:'shotgun'};
const LOAD7_3={w:['wrench','pistol','shotgun','grenade','pulse','rocket'],ammo:{pistol:[17,85],shotgun:[8,32],grenade:[4,0],pulse:[30,90],rocket:[2,4]},armor:50,cur:'pulse'};
const MUS7={boot:{tr:-5,bpm:120},apple:{tr:0,bpm:132},cga:{tr:-3,bpm:126},ram:{tr:-7,bpm:112,alien:true},web:{tr:2,bpm:138},boss:{tr:-9,bpm:144,alien:true}};
const CH7=[{t:'ЗАРЕЖДАНЕ',a:0,b:3},{t:'ЦВЕТЪТ',a:4,b:7},{t:'ПЕРИФЕРИЯТА',a:8,b:11},{t:'ПАМЕТТА',a:12,b:15},{t:'БЪДЕЩЕТО',a:16,b:19}];
const PROG7=[{b:33,ch:[57,60,64]},{b:31,ch:[55,59,62]},{b:29,ch:[53,57,60]},{b:31,ch:[55,59,62]}];
