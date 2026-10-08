/* ================= PRERENDER ================= */
let LV=document.createElement('canvas');
let lx=LV.getContext('2d');
const R=(x,y,w,h,c)=>{lx.fillStyle=c;lx.fillRect(x,y,w,h);};
let lamps=[], beacons=[], crystals=[], zTiles=[], convTiles=[];
function drawBack(tx,ty){
  const P=TP(tx); if(P.sky) return;
  const x=tx*T,y=ty*T,z=zoneAt(tx);
  if(P.mine){ R(x,y,T,T,P.wall); for(let i=0;i<3;i++){ const a=hash(tx*5+i,ty*7), b=hash(ty*9+i,tx*3); R(x+Math.floor(a*13),y+Math.floor(b*13),3,2,i%2?P.panel:P.hi); }
    if(tx%10===0){ R(x+4,y,7,T,'#3a2a1a'); R(x+4,y,1,T,'#5a4028'); } if(ty===2&&tx%10>=9||ty===2&&tx%10<=1) R(x,y+2,T,6,'#3a2a1a');
    return; }
  if(P.organic){ R(x,y,T,T,P.wall); for(let i=0;i<4;i++){ const a=hash(tx*7+i,ty*5), b=hash(ty*3+i,tx*11); R(x+Math.floor(a*14),y+Math.floor(b*14),2,2,i%2?P.panel:P.hi); }
    if(hash(tx,ty*13)>0.8){ for(let i=0;i<T;i++) R(x+i,y+8+Math.round(Math.sin((tx*T+i)*0.3)*3),1,1,P.vein); }
    if(hash(tx*3,ty)>0.94) R(x+6,y+6,3,3,P.dot);
    return; }
  R(x,y,T,T,P.wall); R(x+(tx%2?0:1),y+(ty%2?0:1),15,15,P.panel);
  if(z==='office'&&ty>=11){ R(x,y,T,T,'#3a2b20'); R(x,y,T,1,ty===11?'#5a4632':'#33261c'); if(tx%3===0) R(x+3,y+3,10,10,'#33261c'); }
  if(z==='office'&&ty===10){ R(x,y+13,T,3,'#5a4632'); }
  if(z==='tunnel'&&tx%6===0){ R(x,y,4,T,'#191713'); R(x+4,y,1,T,P.hi); }
  if(z==='factory'){ if(tx%5===0){ R(x+2,y,5,T,'#15110d'); R(x+3,y,1,T,'#3a2f22'); } if(ty%4===2) R(x,y+6,T,2,'#2e2418'); if(hash(tx,ty)>0.93) R(x+6,y+5,3,3,'#b04aff'); }
  if(z==='cool'&&ty%4===1){ R(x,y+5,T,5,'#22303e'); R(x,y+5,T,1,'#3a5068'); if(tx%6===0) R(x+5,y+3,6,9,'#2a3a4a'); }
  if(z==='bio'&&ty===9){ R(x,y+6,T,3,'#2a6a4a'); }
  if(z==='citadel'){ if(ty%5===0) R(x,y+14,T,1,'#6a5a2a'); if(tx%8===0){ R(x,y,3,T,'#140f1c'); R(x+3,y,1,T,'#4a3a6a'); } if(ty===3&&tx%8===4) R(x+5,y+3,6,6,'#5a2a8a'); }
  if(z==='depot'&&ty>=3&&ty<=12&&tx%7<5){ if(ty%3===0) R(x,y+13,T,2,'#4a3a26'); else if(hash(tx,ty)>0.35){ const c=['#6b4f2c','#5a6a3a','#4a5a6a'][Math.floor(hash(ty,tx)*3)]; R(x+2,y+3,12,10,c); R(x+2,y+3,12,1,'rgba(255,255,255,0.15)'); } }
  if(tx%2===0&&ty%2===0) R(x+1,y+1,14,1,P.hi);
  if(hash(tx,ty)>0.86){ R(x+(tx%2?12:3),y+(ty%2?12:3),1,1,P.line); }
  if(isS(tx,ty+1)&&!isS(tx,ty)){ R(x,y+9,T,7,P.line); R(x,y+9,T,1,P.hi); }
  if(z==='vih'){ if(ty===10){ R(x,y+6,T,3,'#6a2424'); R(x,y+6,T,1,'#8a3a3a'); } if(tx%9===0&&ty>2) R(x+6,y,3,T,'#1c2226'); }
  if(z==='mil'&&ty===8){ R(x,y+5,T,4,'#6b5a24'); for(let i=0;i<T;i+=8) R(x+i,y+5,4,4,'#2a2410'); }
  if(z==='waste'&&ty>=10&&ty<=12){ R(x,y,T,T,'rgba(60,110,40,0.08)'); }
  if(z==='core'&&tx%7===3&&ty>2){ R(x+6,y,4,T,'#0c1d20'); if(ty%3===0) R(x+7,y+6,2,2,'#2a8a7a'); }
  if(SEQ) r2BackDeco(tx,ty,x,y,z,P);
  if(LVL.vent&&tx>=LVL.vent[0]&&tx<=LVL.vent[1]&&ty===14){ R(x,y,T,T,'#14181b'); R(x,y+2,T,1,'#22282c'); R(x,y+13,T,1,'#0c0f11'); if(tx%3===0) R(x+7,y,2,T,'#1b2024'); }
}
function drawTile(tx,ty){
  const ch=map[ty][tx],x=tx*T,y=ty*T,P=TP(tx),z=zoneAt(tx);
  if(SEQ&&r2Tile(tx,ty,ch,x,y,P,z)) return;
  if(ch==='#'&&P.rock){
    R(x,y,T,T,P.s);
    for(let i=0;i<3;i++){ const a=hash(tx*5+i,ty*3), b=hash(ty*7+i,tx); R(x+Math.floor(a*13),y+Math.floor(b*13),2+(i&1),1,P.sd); }
    if(hash(tx,ty*9)>0.7) R(x+Math.floor(hash(tx,ty)*12),y+Math.floor(hash(ty,tx)*12),2,2,P.sh);
    if(!isS(tx-1,ty)) R(x,y,1,T,P.sh); if(!isS(tx+1,ty)) R(x+15,y,1,T,P.sd);
    if(!isS(tx,ty-1)){ R(x,y,T,3,P.top); R(x,y+3,T,1,P.sh);
      if(P.alien){ for(let i=0;i<T;i+=2) if(hash(tx*T+i,ty)>0.55) R(x+i,y-1,1,2,P.moss); }
      else for(let i=0;i<T;i+=3) if(hash(tx*T+i,ty)>0.75) R(x+i,y-1,1,1,P.snow?'#ffffff':'#d9a874'); }
    if(!isS(tx,ty+1)&&ty<ROWS-1){ R(x,y+14,T,2,P.sd);
      if(P.alien||P.ice) for(let i=1;i<T;i+=3){ const l=Math.floor(hash(tx*T+i,ty+5)*10); if(l>3) R(x+i,y+16,1,l,P.ice?'#6a9cc0':'#2c2238'); if(l>7) R(x+i,y+16+l,1,1,P.moss); } }
  } else if(ch==='#'){
    R(x,y,T,T,P.s); R(x,y,T,1,P.sh); R(x,y,1,T,P.sh); R(x,y+15,T,1,P.sd); R(x+15,y,1,T,P.sd);
    const h=hash(tx*3,ty*7); if(h>0.5){R(x+3,y+3,1,1,P.sd);R(x+12,y+3,1,1,P.sd);R(x+3,y+12,1,1,P.sd);R(x+12,y+12,1,1,P.sd);}
    if(h>0.92) R(x+4,y+6,8,4,P.sd);
    if(!isS(tx,ty-1)){ R(x,y,T,3,'#8a9298'); R(x,y+3,T,1,P.sd);
      const haz=(z==='lab'||z==='arena'||'~Z'.includes(tileAt(tx-1,ty-1))||'~Z'.includes(tileAt(tx+1,ty-1))||'~Z'.includes(tileAt(tx+1,ty))||'~Z'.includes(tileAt(tx-1,ty)));
      if(haz){ for(let i=0;i<T;i++){ R(x+i,y+4,1,3,((i+tx*T)>>2)%2?'#c99a1c':'#1c1a14'); } }
    }
    if(!isS(tx,ty+1)&&ty<15){ R(x,y+13,T,3,P.sd); R(x,y+12,T,1,P.sh); }
  } else if(ch==='Z'){
    R(x,y,T,T,'#2e2a24'); R(x,y,T,3,'#b8743a'); R(x,y,T,1,'#e0a060'); R(x,y+3,T,1,'#5a3a1c');
    for(let i=0;i<4;i++) R(x+1+i*4,y+5,2,9,'#6a4320'); for(let i=0;i<4;i++) R(x+1+i*4,y+6,2,1,'#a8703a');
  } else if(ch==='D'){
    if(!P.sky) drawBack(tx,ty);
    if(P.alien){ R(x+3,y,10,T,'rgba(160,60,200,0.55)'); R(x+5,y,6,T,'rgba(220,140,255,0.5)'); R(x+7,y,2,T,'#f0d0ff'); }
    else { R(x+1,y,14,T,'#5d666d'); R(x+1,y,2,T,'#7e888f'); R(x+13,y,2,T,'#3b4247');
      for(let i=0;i<T;i++) R(x+3,y+i,10,1,((i+ty*T)>>2)%2?'#c99a1c':'#2a2618');
      R(x+3,y+6,10,4,'#4a5258'); R(x+7,y,2,T,'#2b3136'); }
  } else {
    drawBack(tx,ty);
    if(ch==='='){ R(x,y,T,T,'#3a4146'); R(x,y,T,2,'#8a9298'); R(x,y+2,T,1,'#22272b'); for(let i=2;i<T;i+=4){R(x+i,y+4,1,10,'#262b2f');} R(x,y+14,T,2,'#2a2f33'); }
    else if(ch==='B'){ R(x,y,T,T,'#6b4f2c'); R(x,y,T,1,'#93714a'); R(x,y,1,T,'#93714a'); R(x+15,y,1,T,'#3e2c17'); R(x,y+15,T,1,'#3e2c17'); R(x+2,y+2,12,12,'#5c4325');
      for(let i=0;i<12;i++){R(x+2+i,y+2+i,1,1,'#7d5d35');R(x+13-i,y+2+i,1,1,'#7d5d35');} R(x+2,y+2,12,1,'#7d5d35'); R(x+2,y+13,12,1,'#7d5d35'); }
    else if(ch==='-'){
      if(P.alien){ R(x,y,T,4,'#5c4878'); R(x,y,T,1,P.moss); R(x+2,y+4,12,2,'#3d2e52'); R(x+5,y+6,6,2,'#2c2238'); }
      else { R(x,y,T,3,'#8a9298'); R(x,y+3,T,1,'#2b3135'); if(tx%2===0) R(x+7,y+4,2,4,'#3a4146'); R(x,y-8,T,1,'#6d767c'); if(tx%2===0) R(x+7,y-8,1,8,'#5a6268'); } }
    else if(ch==='>'||ch==='<'){ R(x,y,T,T,'#2a2a2e'); R(x,y,T,3,'#4a4a50'); R(x,y+3,T,1,'#15151a'); for(let i=0;i<T;i+=8){ R(x+i+2,y+6,4,4,'#3a3a40'); R(x+i+3,y+7,2,2,'#5a5a62'); } R(x,y+14,T,2,'#1a1a1e'); }
    else if(ch==='^'){ R(x,y,T,T,P.s||'#3d2e52'); R(x,y,T,2,P.top||'#6a5590'); lx.fillStyle='#2a8a6a'; lx.fillRect(x+6,y-3,4,4); lx.fillStyle='#4dffc3'; lx.beginPath(); lx.ellipse(x+8,y-4,7,3.5,0,0,7); lx.fill(); lx.fillStyle='#e0fff4'; lx.fillRect(x+5,y-6,6,1); lightDot(x+8,y-4,'#4dffc3'); }
    else if(ch==='H'){ R(x+3,y,2,T,'#9aa2a7'); R(x+11,y,2,T,'#9aa2a7'); R(x+3,y,1,T,'#c3c9cc'); for(let i=2;i<T;i+=5) R(x+3,y+i,10,2,'#7f878c'); }
  }
}
function drawSign(tx,ty,txt,col='#d8dde0',bg='#2b3a44'){
  const x=tx*T+2,y=ty*T+3; lx.font='600 6px "IBM Plex Mono",monospace'; const tw=Math.ceil(lx.measureText(txt).width)+8;
  R(x-1,y-1,tw+2,12,'#0e1214'); R(x,y,tw,10,bg); R(x,y,tw,1,'rgba(255,255,255,0.15)');
  lx.fillStyle=col; lx.textBaseline='middle'; lx.fillText(txt,x+4,y+5.5);
}
function bigText(t,tx,ty){ lx.font='28px '+DFONT(); lx.fillStyle='rgba(255,255,255,0.05)'; lx.textBaseline='top'; lx.fillText(t,tx*T,ty*T); }
function pipeH(y,x0,x1,c='#55606a',cd='#323a41'){ for(let x=x0*T;x<x1*T;x++){ if(solidAt(x,y)||solidAt(x,y+4)) continue; R(x,y,1,5,c); R(x,y,1,1,'#8e9aa3'); R(x,y+4,1,1,cd); if(x%48===0){R(x-1,y-1,3,7,cd);} } }
function pipeV(x,y0,y1,c='#4f5962'){ for(let y=y0;y<y1;y++){ if(solidAt(x,y)) continue; R(x,y,4,1,c); R(x,y,1,1,'#7d8992'); R(x+3,y,1,1,'#2d343a'); if(y%40===0) R(x-1,y,6,2,'#2d343a'); } }
function window_(tx0,ty0,tx1,ty1){
  const x=tx0*T,y=ty0*T,w=(tx1-tx0+1)*T,h=(ty1-ty0+1)*T;
  const g=lx.createLinearGradient(0,y,0,y+h); g.addColorStop(0,'#2b1d3a'); g.addColorStop(0.55,'#a8492b'); g.addColorStop(1,'#e2913a');
  lx.fillStyle=g; lx.fillRect(x,y,w,h);
  lx.fillStyle='#ffd9a0'; lx.beginPath(); lx.arc(x+w*0.72,y+h*0.7,6,0,7); lx.fill();
  lx.fillStyle='#3a1f1d'; lx.beginPath(); lx.moveTo(x,y+h); lx.lineTo(x,y+h*0.62); lx.lineTo(x+w*0.12,y+h*0.6); lx.lineTo(x+w*0.18,y+h*0.45); lx.lineTo(x+w*0.38,y+h*0.45); lx.lineTo(x+w*0.42,y+h*0.62); lx.lineTo(x+w*0.6,y+h*0.66); lx.lineTo(x+w*0.66,y+h*0.52); lx.lineTo(x+w*0.84,y+h*0.52); lx.lineTo(x+w*0.88,y+h*0.7); lx.lineTo(x+w,y+h*0.72); lx.lineTo(x+w,y+h); lx.fill();
  lx.fillStyle='#24120f'; lx.fillRect(x,y+h*0.86,w,h*0.14);
  for(let i=0;i<=tx1-tx0+1;i+=2) R(x+i*T-1,y,2,h,'#3a434a'); R(x-2,y-2,w+4,2,'#4a545b'); R(x-2,y+h,w+4,3,'#4a545b'); R(x-2,y,2,h,'#4a545b'); R(x+w,y,2,h,'#4a545b');
  lx.fillStyle='rgba(180,220,255,0.08)'; lx.fillRect(x,y,w,h);
}
function consoleAt(x,floorY,screens=2){
  R(x,floorY-14,screens*12+4,14,'#39434b'); R(x,floorY-14,screens*12+4,1,'#5b6770'); R(x+2,floorY-12,screens*12,3,'#262d33');
  for(let i=0;i<screens;i++){ const sx=x+2+i*12; R(sx,floorY-28,10,12,'#11171b'); R(sx+1,floorY-27,8,10,'#0d2a1c'); for(let k=0;k<8;k++) R(sx+1+k,floorY-20-Math.round(Math.abs(Math.sin(k*1.3+i+x))*5),1,1,'#62ff8f'); R(sx+4,floorY-16,2,2,'#2d353b'); }
  R(x+3,floorY-9,2,1,'#ff5040'); R(x+7,floorY-9,2,1,'#ffb02e'); R(x+11,floorY-9,2,1,'#62ff8f');
}
function tank(tx){ const x=tx*T,fy=15*T; R(x,fy-36,14,36,'#2b3a40'); R(x+2,fy-34,10,30,'#1b4a3a'); R(x+3,fy-33,2,28,'rgba(255,255,255,0.18)'); lx.fillStyle='#9a7f5c'; lx.beginPath(); lx.arc(x+7,fy-18,4,0,7); lx.fill(); R(x,fy-38,14,3,'#55626a'); }
function growth(x,y,n){ for(let i=0;i<n;i++){ const a=hash(x+i,y)*6.28, r=hash(y,x+i)*14; const gx=x+Math.cos(a)*r, gy=y+Math.sin(a)*r*0.6; lx.fillStyle=i%5===0?'#8dff5a':'#2f4a2a'; lx.beginPath(); lx.arc(gx,gy,i%5===0?1.5:2+hash(i,x)*3,0,7); lx.fill(); } }
function elevator(t0,t1){ const x=t0*T,w=(t1-t0+1)*T; R(x,4*T,w,11*T,'#0d1012'); R(x+10,4*T,1,11*T,'#3a4146'); R(x+w-12,4*T,1,11*T,'#3a4146'); R(x,15*T-3,w,3,'#5d666d'); R(x,4*T,w,3,'#2b3136'); R(x+w/2-3,4*T+6,6,3,'#4bdc6a'); }
const hexRgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)).join(',');
function crystal(x,fy,col){ crystals.push({x,y:fy-8,col,rgb:hexRgb(col)}); const shades=[col,'rgba(255,255,255,0.75)']; for(let i=0;i<4;i++){ const h=8+hash(x+i,fy)*14, w=3+hash(fy,x+i)*3, ox=(i-1.5)*4+hash(i,x)*2, lean=(i-1.5)*2; lx.fillStyle=col; lx.globalAlpha=0.85; lx.beginPath(); lx.moveTo(x+ox-w/2,fy); lx.lineTo(x+ox+lean,fy-h); lx.lineTo(x+ox+w/2,fy); lx.closePath(); lx.fill(); lx.globalAlpha=1; lx.fillStyle=shades[1]; lx.fillRect(Math.round(x+ox+lean*0.6),Math.round(fy-h*0.7),1,Math.round(h*0.4)); } }
function stalk(x,fy){ const h=30+hash(x,fy)*40; for(let i=0;i<h;i++){ const o=Math.round(Math.sin(i*0.12+x)*2); R(x+o,fy-i,2,1,'#4a2f5e'); } R(x-2+Math.round(Math.sin(h*0.12+x)*2),fy-h-5,6,6,'#ff6ad5'); R(x-1+Math.round(Math.sin(h*0.12+x)*2),fy-h-4,2,2,'#ffe0f7'); crystals.push({x,y:fy-h-2,col:'#ff6ad5',small:1,rgb:hexRgb('#ff6ad5')}); }
function reactor(tx){ const x=tx*T,cw=4*T; R(x-cw/2,2*T,cw,5*T,'#1b2329'); R(x-cw/2,2*T,3,5*T,'#2e3a42'); for(let y=2*T+6;y<7*T;y+=10) R(x-cw/2,y,cw,2,'#11171b'); R(x-10,2*T+8,20,4*T,'#0d3a2a'); for(let y=2*T+8;y<6*T+8;y+=4) R(x-8,y,16,1,'#3dff9a'); R(x-cw/2-4,7*T,cw+8,4,'#3d464e'); }
function watchtower(tx){ const x=tx*T,fy=15*T; for(const o of [0,22]) R(x+o,fy-90,3,90,'#2a1a14'); for(let y=fy-80;y<fy;y+=16){ lx.strokeStyle='#2a1a14'; lx.beginPath(); lx.moveTo(x+1,y); lx.lineTo(x+23,y+16); lx.stroke(); } R(x-4,fy-104,33,16,'#3a2418'); R(x-6,fy-106,37,3,'#2a1a14'); R(x,fy-100,25,5,'#1a0e0a'); }
function wreck(tx){ const x=tx*T,fy=15*T; R(x,fy-12,40,9,'#3a2a24'); R(x+8,fy-20,20,8,'#2e221d'); R(x+10,fy-18,7,5,'#1a1210'); R(x+19,fy-18,7,5,'#1a1210'); for(const o of [6,30]){ lx.fillStyle='#151010'; lx.beginPath(); lx.arc(x+o,fy-3,5,0,7); lx.fill(); } }
function bush(x,fy){ lx.fillStyle='#3d2a1a'; for(let i=0;i<5;i++){ lx.beginPath(); lx.arc(x+i*3,fy-3-hash(x,i)*3,3,0,7); lx.fill(); } }
function lightDot(x,y,col,small=1){ crystals.push({x,y,col,small,rgb:hexRgb(col)}); }
function exitSign(tx,ty){ const x=tx*T,y=ty*T; R(x,y,14,7,'#0e1a12'); R(x+1,y+1,12,5,'#2bd45a'); R(x+3,y+2,3,3,'#e8ffe8'); R(x+7,y+3,5,1,'#e8ffe8'); lightDot(x+7,y+3,'#2bd45a'); }
function desk(x,fy){ R(x,fy-13,30,3,'#5a4632'); R(x,fy-13,30,1,'#7a6448'); R(x+2,fy-10,2,10,'#3b2b20'); R(x+26,fy-10,2,10,'#3b2b20'); R(x+18,fy-10,8,8,'#4a3828'); R(x+9,fy-24,12,10,'#1a1f22'); R(x+10,fy-23,10,7,hash(x,fy)>0.5?'#12241c':'#0d1418'); R(x+14,fy-14,2,1,'#1a1f22'); R(x-6,fy-12,6,2,'#2a2a2e'); R(x-5,fy-10,1,10,'#2a2a2e'); R(x-8,fy-20,2,9,'#2a2a2e'); }
function vending(x,fy){ R(x,fy-34,20,34,'#6a1e1e'); R(x,fy-34,20,2,'#8a3a3a'); R(x+2,fy-30,12,20,'#1e2a32'); for(let r=0;r<4;r++) for(let c=0;c<3;c++) R(x+3+c*4,fy-28+r*5,3,3,['#c93','#3a8','#c33','#36c'][(r+c)%4]); R(x+15,fy-26,3,6,'#2a2a2a'); R(x+3,fy-8,12,4,'#111'); lightDot(x+8,fy-20,'#ff5a4a'); }
function cooler(x,fy){ R(x,fy-18,10,18,'#cfd5d8'); R(x+1,fy-30,8,12,'#6ab0e0'); R(x+2,fy-29,2,10,'#9ad0f0'); R(x+3,fy-12,4,2,'#3a6a9a'); }
function plant(x,fy){ R(x,fy-8,8,8,'#6a4a2a'); lx.fillStyle='#2f5a2a'; for(let i=0;i<6;i++){ lx.beginPath(); lx.ellipse(x+4+Math.cos(i)*4,fy-12-Math.sin(i*2)*4,3,5,i,0,7); lx.fill(); } }
function rack(x,fy){ R(x,fy-40,14,40,'#14181b'); R(x,fy-40,14,1,'#2f363c'); for(let y=fy-37;y<fy-3;y+=4){ R(x+2,y,10,3,'#1d2328'); R(x+10,y+1,1,1,hash(x,y)>0.4?'#3dff7a':'#ff4a3a'); } }
function tent(tx){ const x=tx*T,fy=15*T; lx.fillStyle='#3b3f2a'; lx.beginPath(); lx.moveTo(x,fy); lx.lineTo(x+22,fy-26); lx.lineTo(x+44,fy); lx.closePath(); lx.fill(); lx.fillStyle='#2a2d1e'; lx.beginPath(); lx.moveTo(x+16,fy); lx.lineTo(x+22,fy-16); lx.lineTo(x+28,fy); lx.closePath(); lx.fill(); R(x+21,fy-30,2,6,'#22261a'); }
function tower(t0,t1,top){ const x0=t0*T, x1=(t1+1)*T, fy=15*T, ty=top*T; lx.strokeStyle='#4a4f56'; lx.lineWidth=2; lx.beginPath(); lx.moveTo(x0,fy); lx.lineTo(x0+12,ty); lx.moveTo(x1,fy); lx.lineTo(x1-12,ty); lx.stroke(); lx.lineWidth=1; lx.strokeStyle='#3a3f45'; for(let y=fy;y>ty;y-=24){ const k=(fy-y)/(fy-ty), k2=(fy-y+24)/(fy-ty); lx.beginPath(); lx.moveTo(x0+12*k,y); lx.lineTo(x1-12*k2,y-24); lx.moveTo(x1-12*k,y); lx.lineTo(x0+12*k2,y-24); lx.stroke(); }
  const mx=(x0+x1)/2; R(mx-1,0,3,ty,'#5a6068'); for(const y of [12,28,44]) R(mx-8,y,17,2,'#4a5058'); lx.fillStyle='#7a828a'; lx.beginPath(); lx.ellipse(mx-14,ty-26,7,10,0.4,0,7); lx.fill(); lx.fillStyle='#5a6068'; lx.beginPath(); lx.ellipse(mx-13,ty-26,4,7,0.4,0,7); lx.fill(); }
function rails(t0,t1){ for(let x=t0*T;x<(t1+1)*T;x++){ R(x,15*T-3,1,1,'#9aa0a4'); if(x%8===0) R(x,15*T-2,5,2,'#3a2a1c'); } }
function bones(x,fy){ R(x,fy-3,12,2,'#d8d0bc'); R(x+3,fy-6,2,5,'#d8d0bc'); R(x+8,fy-5,5,4,'#c8c0ac'); R(x+9,fy-4,1,1,'#2a2020'); R(x+11,fy-4,1,1,'#2a2020'); }
function pod(x,y){ lx.fillStyle='#5a1e3c'; lx.beginPath(); lx.ellipse(x,y,6,9,0,0,7); lx.fill(); lx.fillStyle='#ff6ad5'; lx.globalAlpha=0.6; lx.beginPath(); lx.ellipse(x,y+1,3,5,0,0,7); lx.fill(); lx.globalAlpha=1; lightDot(x,y,'#ff6ad5'); }
function pine(x,fy,s=1){ const h=(30+hash(Math.round(x),fy)*22)*s; R(x-1,fy-6,3,6,'#3a2a1a');
  for(let i=0;i<4;i++){ const w=(13-i*3)*s, y=fy-5-i*h/5; lx.fillStyle=i%2?'#1c3528':'#22402f'; lx.beginPath(); lx.moveTo(x-w,y); lx.lineTo(x+w,y); lx.lineTo(x,y-h/3); lx.closePath(); lx.fill(); lx.fillStyle='#e9f1f7'; lx.fillRect(Math.round(x-w*0.7),Math.round(y-1),Math.round(w*1.4),1); lx.fillRect(Math.round(x-1),Math.round(y-h/3),3,2); } }
function barrier(tx){ const x=tx*T,fy=15*T; R(x,fy-13,2,13,'#4a4f56'); R(x+28,fy-13,2,13,'#4a4f56'); for(let i=0;i<30;i+=5) R(x+i,fy-13,5,3,(i/5)%2?'#e8e8e8':'#c9302a'); }
function station(t0,t1,fy,label){ const x=t0*T,w=(t1-t0+1)*T,top=fy-7*T; R(x,top,w,7*T,'#2e343a'); R(x,top,w,2,'#4a5058'); R(x-4,top-5,w+8,5,'#3a4046'); R(x-4,top-6,w+8,2,'#e9f1f7');
  for(let i=8;i<w-14;i+=22){ R(x+i,top+18,12,10,'#e0b860'); R(x+i,top+18,12,1,'#fff0c0'); R(x+i+5,top+18,1,10,'#3a3020'); lightDot(x+i+6,top+23,'#ffd080'); }
  R(x+w/2-10,fy-30,20,30,'#1d2125'); R(x+w/2-10,fy-30,20,1,'#4a5058'); drawSign(t0+1,Math.floor(top/T)+1,label,'#f2e6c8','#3a2b1a'); }
function prerender(){
  LV.width=COLS*T*S; LV.height=ROWS*T*S; lx=LV.getContext('2d'); lx.setTransform(S,0,0,S,0,0); lx.imageSmoothingEnabled=false;
  lx.clearRect(0,0,COLS*T,ROWS*T); crystals=[]; zTiles=[];
  for(let ty=0;ty<ROWS;ty++) for(let tx=0;tx<COLS;tx++) drawTile(tx,ty);
  LVL.deco(); if(SEQ) for(let ty=0;ty<ROWS;ty++) for(let tx=0;tx<COLS;tx++) if('B=-H'.includes(map[ty][tx])) drawTile(tx,ty);
  convTiles=[]; for(let ty=0;ty<ROWS;ty++) for(let tx=0;tx<COLS;tx++){ if(map[ty][tx]==='Z') zTiles.push([tx,ty]); if(CONV[map[ty][tx]]) convTiles.push([tx,ty,CONV[map[ty][tx]]]); }
  lamps=[]; beacons=[];
  for(let tx=2;tx<COLS-2;tx++){
    const P=TP(tx); if(!P.lamps) continue;
    const cy=ceilY(tx); if(cy<=0||cy>=12*T) continue;
    if(tx%9===4){ const broken=LVL.dark&&zoneAt(tx)==='office'&&hash(tx,5)<0.6; R(tx*T+3,cy,10,3,'#2a3035'); R(tx*T+4,cy+3,8,2,broken?'#3a3a36':'#fff3c4'); if(!broken) lamps.push({x:tx*T+8,y:cy+5,fl:LVL.dark?hash(tx,3)<0.7:hash(tx,3)<0.22}); }
    if(LVL.alarm&&tx%23===11){ R(tx*T+5,cy,6,2,'#3a3f44'); beacons.push({x:tx*T+8,y:cy+4}); }
  }
}
function redrawCols(x0,x1){ for(let tx=x0;tx<=x1;tx++){ lx.clearRect(tx*T,0,T,ROWS*T); for(let ty=0;ty<ROWS;ty++) drawTile(tx,ty); } }
function setDoor(d,ch){ const [tx,r0,r1]=d; for(let ty=r0;ty<=r1;ty++) map[ty][tx]=ch; redrawCols(tx,tx); }

