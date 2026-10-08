/* ================= ДВИГАТЕЛ · ПЛОЧКИ, НЕБЕ, ФОН =================
   Игрите добавят свои стилове чрез defTile / defBack (engine/defs.js). */
function skyLayerExt(L,x){
  const H_=H;
  if(L.kind==='city'){ for(let i=0;i<1024;){ const w=18+Math.floor(hash(i,L.seed)*26), h=26+Math.floor(hash(L.seed,i)*40); x.fillStyle=L.col; x.fillRect(i,H_-h,w,h); x.beginPath(); x.moveTo(i-2,H_-h); x.lineTo(i+w/2,H_-h-10); x.lineTo(i+w+2,H_-h); x.fill(); for(let wy=H_-h+6;wy<H_-6;wy+=8) for(let wx=i+3;wx<i+w-3;wx+=6) if(hash(wx,wy)>0.6){ x.fillStyle=hash(wy,wx)>0.5?'rgba(255,210,120,0.75)':'rgba(255,180,90,0.45)'; x.fillRect(wx,wy,2,3); } i+=w+2+Math.floor(hash(i+1,L.seed)*6); } return true; }
  if(L.kind==='towers'){ x.fillStyle=L.col; for(let i=0;i<1024;){ const w=14+Math.floor(hash(i,L.seed)*24), h=70+Math.floor(hash(L.seed,i)*110); x.fillRect(i,H_-h,w,h); const cut=Math.floor(hash(i,7)*12); x.clearRect(i+w-cut,H_-h,cut,cut*1.2); for(let k=0;k<4;k++) if(hash(i+k,L.seed+3)>0.5) x.fillRect(i-3,H_-h+10+k*20,3,2); i+=w+8+Math.floor(hash(i+2,L.seed)*30); } return true; }
  if(L.kind==='cranes'){ x.fillStyle=L.col; for(let i=40;i<1024;i+=260+Math.floor(hash(i,L.seed)*80)){ const h=120+Math.floor(hash(L.seed,i)*40); x.fillRect(i,H_-h,4,h); for(let y=H_-h;y<H_;y+=8){ x.fillRect(i-2,y,8,1); } x.fillRect(i-50,H_-h,130,3); x.fillRect(i+70,H_-h,2,40); x.fillRect(i-48,H_-h+3,10,8); } return true; }
  if(L.kind==='planet'){ const cx=600, cy=H_+220, r=330; for(let k=0;k<12;k++){ x.fillStyle=k%2?'#c86a7a':'#e8a26a'; x.globalAlpha=0.55; x.beginPath(); x.ellipse(cx,cy,r-k*4,r-k*4,0,Math.PI,0); x.fill(); } x.globalAlpha=0.25; x.fillStyle='#fff0d0'; x.beginPath(); x.ellipse(cx,cy,r+20,40,-0.15,Math.PI,0); x.lineWidth=2; x.strokeStyle='#ffe0c0'; x.stroke(); x.globalAlpha=1; return true; }
  if(L.kind==='kelp'){ x.fillStyle=L.col; for(let i=0;i<1024;i+=8+Math.floor(hash(i,L.seed)*14)){ const h=40+hash(L.seed,i)*120; for(let y=0;y<h;y+=3) x.fillRect(i+Math.round(Math.sin(y*0.07+i)*4),H_-y,2,3); } return true; }
  return false;
}
function tileExt(tx,ty,ch,x,y,P,z){
  for(const h of TILE_FX) if(h(tx,ty,ch,x,y,P,z)) return true;
  if(ch!=='#') return false;
  if(P.town){ const top=!isS(tx,ty-1), bld=hash(Math.floor(tx/3),7);
    R(x,y,T,T,ty>=15?'#4a4440':(bld>0.5?'#8a7a68':'#9a8070')); if(ty>=15){ R(x,y,T,2,'#6a625a'); for(let i=0;i<T;i+=4) R(x+i,y+2,1,T-2,'#3a3430'); return true; }
    if(top){ R(x,y,T,4,P.top); R(x,y,T,1,'#b05a40'); R(x,y+4,T,1,'#3a2a20'); }
    else if(ty%3===1&&tx%2===0&&isS(tx,ty+1)&&isS(tx-1,ty)&&isS(tx+1,ty)){ R(x+3,y+2,10,10,'#2a2a34'); R(x+4,y+3,8,8,hash(tx,ty)>0.55?'#e8c070':'#3a4a5a'); R(x+7,y+3,1,8,'#2a2a34'); R(x+4,y+7,8,1,'#2a2a34'); }
    else { R(x,y+15,T,1,'rgba(0,0,0,0.12)'); }
    if(!isS(tx-1,ty)) R(x,y,1,T,'#b0a090'); if(!isS(tx+1,ty)) R(x+15,y,1,T,'#4a3e34'); return true; }
  if(P.src){ R(x,y,T,T,'#0c0c18'); if(!isS(tx,ty-1)) R(x,y,T,1,'#c8c8ff'); if(!isS(tx,ty+1)) R(x,y+15,T,1,'#7a7ab8'); if(!isS(tx-1,ty)) R(x,y,1,T,'#9a9ae0'); if(!isS(tx+1,ty)) R(x+15,y,1,T,'#5a5a9a'); if(hash(tx,ty)>0.8) R(x+6,y+6,3,3,'#2a2a50'); return true; }
  if(P.gear){ R(x,y,T,T,P.s); R(x,y,T,1,P.sh); R(x,y,1,T,P.sh); R(x,y+15,T,1,P.sd); R(x+15,y,1,T,P.sd); R(x+2,y+2,1,1,'#c8a060'); R(x+13,y+2,1,1,'#c8a060'); R(x+2,y+13,1,1,'#c8a060'); R(x+13,y+13,1,1,'#c8a060'); if(!isS(tx,ty-1)){ R(x,y,T,3,'#b8904a'); for(let i=0;i<T;i+=4) R(x+i,y+3,2,1,'#5a4220'); } return true; }
  if(P.b70){ R(x,y,T,T,P.s); R(x,y,T,1,P.sh); R(x,y+15,T,1,P.sd); if(ty%2===0) R(x,y+8,T,1,'#7a7872'); if(hash(tx,ty)>0.85) R(x+4,y+4,2,6,'#6a6862'); if(!isS(tx,ty-1)){ R(x,y,T,3,'#a8a49a'); R(x,y+3,T,1,P.sd); } return true; }
  return false;
}
function backExt(tx,ty,x,y,z,P){
  for(const h of BACK_FX) if(h(tx,ty,x,y,z,P)) return;
  if(P.sea){ if(tx%11===5&&ty===5){ R(x-2,y-2,20,20,'#2a3e46'); lx.fillStyle='#061822'; lx.beginPath(); lx.arc(x+8,y+8,8,0,7); lx.fill(); lx.fillStyle='rgba(80,180,220,0.35)'; lx.beginPath(); lx.arc(x+8,y+8,6,0,7); lx.fill(); lx.fillStyle='rgba(200,240,255,0.5)'; lx.fillRect(x+4,y+4,2,2); }
    if(ty===3&&tx%6===0) R(x,y+6,T,3,'#1a2e36'); if(tx%17===8&&ty>3) R(x+6,y,3,T,'#0f1c22'); }
  if(P.gear){ if(hash(tx,ty)>0.9){ lx.strokeStyle='#3a2e1e'; lx.lineWidth=2; lx.beginPath(); lx.arc(x+8,y+8,7,0,7); lx.stroke(); } if(ty%5===2) R(x,y+6,T,2,'#2e2416'); }
  if(P.src){ R(x,y,T,T,'#0a0a16'); if(tx%4===0) R(x,y,1,T,'#16163a'); if(ty%4===0) R(x,y,T,1,'#16163a');
    const bm=tx%13; if(bm>=5&&bm<=7) R(x,y,T,T,`rgba(140,140,255,${bm===6?0.07:0.04})`);
    if(hash(tx,ty)>0.975){ lx.fillStyle='#c8c8ff'; lx.beginPath(); lx.moveTo(x+8,y+3); lx.lineTo(x+12,y+8); lx.lineTo(x+8,y+13); lx.lineTo(x+4,y+8); lx.fill(); lx.fillStyle='#ffffff'; lx.fillRect(x+7,y+6,1,3); lightDot(x+8,y+8,'#b8b8ff',1); }
    else if(hash(tx,ty)>0.94) R(x+7,y+7,2,2,'#5a5aa0'); }
}
const LB={
  frame(F,C,o={}){ if(!o.noCeil) F(0,0,C-1,1,'#'); if(!o.noFloor) F(0,15,C-1,16,'#'); F(0,0,1,16,'#'); F(C-2,0,C-1,16,'#'); },
};
