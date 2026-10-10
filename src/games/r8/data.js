/* ================= РЕЗОНАНС 8 · ДАННИ: ТЕМИ, НЕБЕ, ПЛОЧКИ, МУЗИКА, ГЛАВИ =================
   Плевен, октомври 2029 г. — сюжетът и епизодите: notes/r8-design.md. Двата слоя на града са двете епохи на двигателя:
   СЕГА (нощният, пренареден град) и СПОМЕН (същите места, каквито Вела ги помни — топли, по здрач).
   amb е тъмнината (0 — ден, над 0,58 — нощ с фенерче). */
const CH_R8=[{t:'ТРОЛЕЙБУСИТЕ',a:0,b:3},{t:'ГАРАТА',a:4,b:7},{t:'УНИВЕРСИТЕТЪТ',a:8,b:11},{t:'МУЗЕЯТ',a:12,b:15},{t:'ПЪТЯТ ДО УЧИЛИЩЕ',a:16,b:19}];
const MUS8={center:{tr:-2,bpm:100},rail:{tr:0,bpm:112},med:{tr:-4,bpm:96},museum:{tr:-6,bpm:92},school:{tr:2,bpm:104},yard:{tr:4,bpm:108},boss:{tr:-7,bpm:126}};
addUnique(TH,{
  r8now:{s:'#3c4560',sh:'#56607a',sd:'#22283a',top:'#8a92a8',amb:0.3,sky:1,r8city:1},
  r8mem:{s:'#9a7656',sh:'#b89470',sd:'#5a4230',top:'#e0c49a',amb:0.2,sky:1,r8city:1,r8mem:1},
  r8rail:{s:'#6a3428',sh:'#8a4a36',sd:'#3a1c16',top:'#9a8a7a',amb:0.3,sky:1,r8city:1,r8brick:1},
  r8sch:{wall:'#3a4048',panel:'#424a52',line:'#262a30',hi:'#525a64',s:'#7a6a50',sh:'#9a8a6a',sd:'#4a3e2e',top:'#a87a4a',amb:0.55,lamps:1,r8sch:1},
  r8schB:{wall:'#c8b88a',panel:'#d4c496',line:'#a8986a',hi:'#e0d0a4',s:'#9a8462',sh:'#b8a07a',sd:'#6a5a42',top:'#c8945a',amb:0.15,lamps:1,r8sch:1,r8mem:1},
  r8yard:{s:'#8a7448',sh:'#a89060',sd:'#5a4a2e',top:'#5a8a3a',amb:0.3,sky:1,r8city:1,r8yardF:1},
  r8yardB:{s:'#c8a868',sh:'#e0c488',sd:'#8a7040',top:'#7ab84a',amb:0.08,sky:1,r8city:1,r8yardF:1,r8mem:1},
  r8mus:{wall:'#3a3024',panel:'#443828',line:'#241c14',hi:'#54442e',s:'#6a5a46',sh:'#8a7a60',sd:'#3e3226',top:'#8a5a32',amb:0.5,lamps:1,r8mus:1},
  r8med:{wall:'#2a3a36',panel:'#31443f',line:'#1c2826',hi:'#3c524c',s:'#5a6660',sh:'#7a8a82',sd:'#3a4440',top:'#a8b4a0',amb:0.5,lamps:1,r8lab:1},
},'TH');
addUnique(SKIES,{
  r8night:{grad:[[0,'#050914'],[0.55,'#101a34'],[1,'#33304c']],stars:true,moon:[388,44,9],
    layers:[{kind:'mount',col:'#0d1122',sp:0.05,base:58,waves:[[2,10,0],[5,5,1],[11,3,2]]},{kind:'city',col:'#080b16',sp:0.24,seed:83}]},
  r8day:{grad:[[0,'#3a8ad8'],[0.6,'#8ac4f0'],[1,'#e8f4ff']],sun:[380,46,12,'#fff8d0'],
    layers:[{kind:'mount',col:'#7a9a6a',sp:0.08,base:52,waves:[[2,10,0],[5,5,1],[11,3,2]]},{kind:'city',col:'#9aa4b0',sp:0.24,seed:83}]},
  r8dusk:{grad:[[0,'#2a1a2e'],[0.5,'#7a4a4a'],[1,'#f0b070']],sun:[110,196,14,'#ffe0b0'],
    layers:[{kind:'mount',col:'#5a3a36',sp:0.05,base:58,waves:[[2,10,0],[5,5,1],[11,3,2]]},{kind:'city',col:'#3a2420',sp:0.24,seed:83}]},
},'SKIES');
// ---------- плочки: улицата (асфалт с бордюр) и фасадите (корниз, прозорци) ----------
const R8_FAC=['#3c4560','#4a4258','#3a4a54','#50485a'], R8_FACM=['#9a7656','#8a6a4e','#a07a58','#7e6450'];
defTile(function(tx,ty,ch,x,y,P,z){
  if(!P.r8city||ch!=='#') return false;
  const m=P.r8mem, top=!isS(tx,ty-1); let s0=ty; while(s0>0&&isS(tx,s0-1)) s0--;   // s0 — горният ред на колоната
  if(P.r8yardF&&s0>=15){ R(x,y,T,T,m?'#8a7a5a':'#3a3428'); if(top){ R(x,y,T,3,P.top); for(let i=0;i<T;i+=3) if(hash(tx*T+i,7)>0.5) R(x+i,y-1,1,1,P.top); R(x,y+3,T,1,P.sd); } else if((tx+ty)%3===0) R(x+4,y+6,6,3,m?'#9a8a6a':'#2e2a20'); return true; }   // дворът: трева и плочки
  if(s0>=15){ R(x,y,T,T,m?'#5a4a3a':'#23262e');   // улицата
    if(top){ R(x,y,T,3,m?'#a08a6a':'#646a7a'); R(x,y+3,T,1,m?'#3a2e22':'#121419'); }
    else if(tx%6===2) R(x+2,y+5,10,1,m?'#c0a070':'#b8a050'); return true; }
  const bl=Math.floor(hash(Math.floor(tx/4),11)*4); R(x,y,T,T,P.r8yardF?P.s:P.r8brick?(bl%2?'#6a3428':'#5e3024'):(m?R8_FACM:R8_FAC)[bl]);
  if(P.r8brick){ R(x,y+4,T,1,P.sd); R(x,y+10,T,1,P.sd); R(x+(ty%2?4:12),y,1,4,P.sd); R(x+(ty%2?12:4),y+5,1,5,P.sd); R(x+(ty%2?4:12),y+11,1,5,P.sd); }
  if(top){ R(x,y,T,3,P.top); R(x,y+3,T,1,P.sd); }
  else if((ty-s0)%3===1&&tx%2===0&&isS(tx,ty+1)&&isS(tx-1,ty)&&isS(tx+1,ty)){ const lit=hash(tx,ty*7)>(m?0.35:0.7);
    R(x+3,y+2,10,11,m?'#4a3424':'#161a26'); R(x+4,y+3,8,9,lit?(m?'#ffe2a0':'#f0c870'):(m?'#6a5a4a':'#1e2840')); R(x+7,y+3,1,9,m?'#4a3424':'#161a26'); R(x+2,y+13,12,1,P.sh); }
  else if(ty>=14&&(ty-s0)>=1) R(x,y+12,T,4,m?'#7a5e44':'#2e3448');   // цокълът
  if(!isS(tx-1,ty)) R(x,y,1,T,P.sh); if(!isS(tx+1,ty)) R(x+15,y,1,T,P.sd); return true;
});
// университетът: под от линолеум, стени — долу зелено, горе бяло; врати, шкафчета, черни дъски
defTile(function(tx,ty,ch,x,y,P,z){
  if(!P.r8lab||ch!=='#') return false; const top=!isS(tx,ty-1);
  R(x,y,T,T,P.s); R(x,y+15,T,1,P.sd); if((tx+ty)%3===0) R(x+3,y+5,10,1,P.sh);
  if(top){ R(x,y,T,4,(tx%2)?'#c8d0c0':'#98a490'); R(x,y+4,T,1,P.sd); }
  if(!isS(tx-1,ty)) R(x,y,1,T,P.sh); if(!isS(tx+1,ty)) R(x+15,y,1,T,P.sd); return true; });
defBack(function(tx,ty,x,y,z,P){
  if(!P.r8lab) return false;
  R(x,y,T,T,ty>=10?'#2e4a42':'#3c4a46'); if(ty===10) R(x,y,T,2,'#5a7a6a'); if(ty<10&&tx%2===0&&ty%2===0) R(x+1,y+1,14,1,'#46544f');
  const d=tx%19; if(ty>=11&&d>=3&&d<=4){ R(x,y,T,T,'#4a3a2a'); if(d===3) R(x+1,y,1,T,'#2a1e14'); if(d===4&&ty===13) R(x+10,y+6,3,2,'#c8a050'); if(ty===11) R(x,y,T,2,'#2a1e14'); }   // врата
  else if(ty>=11&&ty<=14&&d>=9&&d<=11){ R(x+1,y,14,T,'#5a6a72'); R(x+8,y,1,T,'#3a4650'); if(ty===12) R(x+3,y+4,2,4,'#2a343c'); }   // шкафчета
  else if(ty>=5&&ty<=7&&tx%23>=14&&tx%23<=17){ R(x,y,T,T,'#14201a'); if(ty===5) R(x,y,T,2,'#6a5a3a'); if(ty===7) R(x,y+14,T,2,'#6a5a3a'); if(hash(tx,ty)>0.4) R(x+2,y+4+Math.floor(hash(ty,tx)*6),10,1,'#c8d0c8'); }   // черна дъска
  return true; });
// училището отвътре: паркет, стени — долу синьо-сиво, горе бяло; прозорци (нощ / ден в СПОМЕН), черни дъски, закачалки
defTile(function(tx,ty,ch,x,y,P,z){
  if(!P.r8sch||ch!=='#') return false; const top=!isS(tx,ty-1);
  R(x,y,T,T,P.s); R(x,y+15,T,1,P.sd); if(ty%2===0) R(x,y+7,T,1,P.sd);
  if(top){ R(x,y,T,4,P.top); for(let i=0;i<T;i+=4) R(x+i,y,1,4,P.sd); R(x,y+4,T,1,P.sd); }
  if(!isS(tx-1,ty)) R(x,y,1,T,P.sh); if(!isS(tx+1,ty)) R(x+15,y,1,T,P.sd); return true; });
defBack(function(tx,ty,x,y,z,P){
  if(!P.r8sch) return false; const m=P.r8mem;
  R(x,y,T,T,ty>=10?(m?'#7a9ab0':'#2e3a48'):(m?'#e8dcb8':'#3e444c')); if(ty===10) R(x,y,T,2,m?'#5a7a90':'#4a5a6a');
  const k=tx%14;
  if(ty>=4&&ty<=8&&k>=2&&k<=5){ R(x,y,T,T,m?'#8ad0f8':'#141c2c'); if(k===2||k===5) R(x+(k===2?0:14),y,2,T,m?'#e8dcb8':'#3e444c'); if(ty===4) R(x,y,T,2,m?'#e8dcb8':'#3e444c'); if(ty===6) R(x,y+7,T,2,m?'#f4ecd4':'#2e3440');
    if(!m&&hash(tx,ty)>0.85) R(x+6,y+5,1,1,'#ffffff'); }   // прозорец
  else if(ty>=5&&ty<=7&&k>=8&&k<=12){ R(x,y,T,T,'#1e3226'); if(ty===7) R(x,y+13,T,3,'#8a6a42'); if(hash(tx,ty*3)>0.45) R(x+2,y+4+Math.floor(hash(ty,tx)*6),11,1,'#d8e0d8');
    if(m&&k===10&&ty===6){ R(x+3,y+3,10,7,'#ffd27a'); } }   // дъска (в СПОМЕН — рисунка)
  else if(ty===11&&k===0){ R(x+3,y+4,10,2,'#8a6a42'); R(x+4,y+6,2,4,'#c8c8c8'); R(x+10,y+6,2,4,'#c8c8c8'); if(m) R(x+3,y+8,5,6,'#c84a3a'); }   // закачалки
  return true; });
// музеят — бившата казарма: паркет, каменни стени, сводести прозорци, пиластри, картини
defTile(function(tx,ty,ch,x,y,P,z){
  if(!P.r8mus||ch!=='#') return false; const top=!isS(tx,ty-1);
  R(x,y,T,T,P.s); R(x,y+7,T,1,P.sd); R(x+(ty%2?0:8),y,1,7,P.sd); R(x+(ty%2?8:0),y+8,1,8,P.sd);
  if(top){ R(x,y,T,4,P.top); for(let i=0;i<T;i+=4) R(x+i,y,1,4,'#6a4224'); R(x,y+4,T,1,P.sd); }
  if(!isS(tx-1,ty)) R(x,y,1,T,P.sh); if(!isS(tx+1,ty)) R(x+15,y,1,T,P.sd); return true; });
defBack(function(tx,ty,x,y,z,P){
  if(!P.r8mus) return false;
  R(x,y,T,T,ty>=11?'#4a3a2a':'#5a4a36'); if(ty===11) R(x,y,T,2,'#7a6448'); if(ty>=12&&tx%2===0) R(x+7,y,1,T,'#3e3022');
  const k=tx%12;
  if(k===0){ R(x+3,y,10,T,'#6a5840'); R(x+3,y,1,T,'#7e6a4e'); }   // пиластър
  else if(ty>=4&&ty<=8&&k>=4&&k<=7){ const top=ty===4; R(x,y,T,T,top?'#5a4a36':'#1a2030'); if(top){ lx.fillStyle='#1a2030'; lx.beginPath(); lx.arc(k===4?x+16:k===7?x:x+8,y+16,k===4||k===7?14:14,Math.PI,0); lx.fill(); }
    if(!top&&(k===5||k===6)) R(x+(k===5?15:0),y,1,T,'#5a4a36'); if(ty===8) R(x,y+12,T,4,'#6a5840'); }   // сводест прозорец
  else if(ty>=5&&ty<=7&&(k===9||k===10)&&hash(Math.floor(tx/12),3)>0.4){ R(x,y,T,T,'#8a6a32'); R(x+(k===9?2:0),y+(ty===5?2:0),k===9?14:14,ty===7?14:16,'#3a4a5a'); if(ty===6) R(x+(k===9?6:0),y+4,10,6,'#8a7a5a'); }   // картина
  return true; });
// темите на r8 — епизодите и оцеляването ги ползват еднакво
const SV8={
 r8center:{name:'Центърът',th:'r8now',thB:'r8mem',sky:'r8night',skyB:'r8dusk',era:1,eraNames:['СЕГА','СПОМЕН'],mus:MUS8.center,
   eraTip:'Тук стените идват и си отиват: където СЕГА има стена, в СПОМЕН може да има проход — и обратно. E сменя слоя.',
   bridgeTip:'Пътят го има само в единия слой — СЕГА или СПОМЕН. Сменяй с E.',
   elec:1,zfloor:1,tower:1,lift:1,foes:['r8spark','r8spark','r8walker','r8pigeon'],foesK:[[2,'r8sign'],[2,'drone']],air:'r8pigeon',noGuard:1,noPipes:1,
   deco:(x,y,h,fy)=>r8StreetDeco(x*T,fy,h,false), decoB:(x,y,h,fy)=>r8StreetDeco(x*T,fy,h,true)},
 r8rail:{name:'Гарата',th:'r8rail',sky:'r8night',mus:MUS8.rail,human:1,track:1,conv:1,stealth:1,tower:1,lift:1,noPipes:1,noGuard:1,
   foes:['soldier','r8walker','r8spark','r8sign'],foesK:[[5,'soldier'],[6,'drone']],air:null,alarmFoe:'soldier',deco:(x,y,h,fy)=>r8RailDeco(x*T,fy,h)},
 r8med:{name:'Университетът',th:'r8med',mus:MUS8.med,acid:1,laser:1,vent:1,term:1,tower:1,noGuard:1,noPipes:1,
   foes:['r8walker','shocker','r8spark','drone'],foesK:[[9,'soldier']],air:null,deco:(x,y,h,fy)=>r8LabDeco(x*T,fy,h)},
 r8museum:{name:'Музеят',th:'r8mus',mus:MUS8.museum,stealth:1,shift:1,water:1,lever:1,tower:1,noGuard:1,noPipes:1,alarmFoe:'soldier',
   foes:['soldier','r8walker','r8walker','drone'],foesK:[[13,'soldier']],air:null,deco:(x,y,h,fy)=>r8MuseumDeco(x*T,fy,h)},
 r8school:{name:'Училището',th:'r8sch',thB:'r8schB',era:1,eraNames:['СЕГА','СПОМЕН'],mus:MUS8.school,term:1,tower:1,noGuard:1,noPipes:1,
   eraTip:'Тук стените идват и си отиват: където СЕГА има стена, в СПОМЕН може да има проход — и обратно. E сменя слоя.',
   bridgeTip:'Пътят го има само в единия слой — СЕГА или СПОМЕН. Сменяй с E.',
   foes:['r8walker','r8walker','r8spark','drone'],foesK:[[17,'soldier']],air:null,deco:(x,y,h,fy)=>r8SchoolDeco(x*T,fy,h,false),decoB:(x,y,h,fy)=>r8SchoolDeco(x*T,fy,h,true)},
 r8yard:{name:'Дворът',th:'r8yard',thB:'r8yardB',sky:'r8night',skyB:'r8day',era:1,eraNames:['СЕГА','СПОМЕН'],mus:MUS8.yard,human:1,water:1,wind:1,tower:1,noGuard:1,noPipes:1,
   eraTip:'В СПОМЕН дворът е огрян от слънце — и пътят е друг. E сменя слоя.',
   foes:['r8spark','r8walker','r8pigeon','drone'],foesK:[[18,'soldier']],air:'r8pigeon',deco:(x,y,h,fy)=>r8YardDeco(x*T,fy,h,false),decoB:(x,y,h,fy)=>r8YardDeco(x*T,fy,h,true)},
};
addUnique(SV_THEMES,SV8,'SV_THEMES'); for(const k in SV8) addUnique(THEME_NAME,{[k]:SV8[k].name},'THEME_NAME');
