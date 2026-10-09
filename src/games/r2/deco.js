/* ================= РЕЗОНАНС 2 · ДЕКОРАЦИИ ================= */
function sub(tx,fy){ const x=tx*T; lx.fillStyle='#c8a032'; lx.beginPath(); lx.ellipse(x+40,fy-22,44,18,0,0,7); lx.fill(); lx.fillStyle='#a07a1e'; lx.fillRect(x+30,fy-50,22,14); lx.fillStyle='#1a3040'; for(let i=0;i<4;i++){ lx.beginPath(); lx.arc(x+14+i*18,fy-22,4,0,7); lx.fill(); } lx.fillStyle='#e8d070'; lx.fillRect(x+34,fy-48,14,2); lx.fillStyle='#5a4a20'; lx.fillRect(x+4,fy-6,72,3); }
function lampPost(tx){ const x=tx*T+7, fy=15*T; R(x,fy-46,2,46,'#2a2a30'); R(x-4,fy-48,10,3,'#2a2a30'); R(x-3,fy-45,8,2,'#ffe0a0'); lightDot(x+1,fy-43,'#ffe0a0'); }
function waterTower(tx,fy){ const x=tx*T; R(x+2,fy-30,2,30,'#3a3430'); R(x+22,fy-30,2,30,'#3a3430'); R(x,fy-52,26,22,'#6a5a48'); R(x,fy-52,26,2,'#8a7a64'); lx.fillStyle='#5a4a3a'; lx.beginPath(); lx.moveTo(x-2,fy-52); lx.lineTo(x+13,fy-62); lx.lineTo(x+28,fy-52); lx.fill(); }
function antenna(tx,fy){ const x=tx*T+6; R(x,fy-26,1,26,'#4a4a50'); R(x-6,fy-22,13,1,'#4a4a50'); R(x-4,fy-16,9,1,'#4a4a50'); R(x,fy-27,1,1,'#ff3b2e'); }
function bubbleSign(tx,ty,t){ drawSign(tx,ty,t,'#bfe8ff','#16303a'); }
function house(t0,t1,top,seed){ const x=t0*T, w=(t1-t0+1)*T, y=top*T, fy=15*T, c=['#6a5a4c','#7a6650','#5a5a62','#7a5a4a'][seed%4];
  R(x,y,w,fy-y,c); R(x,y,w,2,'rgba(255,255,255,0.08)'); lx.fillStyle='#4a2a20'; lx.beginPath(); lx.moveTo(x-6,y); lx.lineTo(x+w/2,y-18); lx.lineTo(x+w+6,y); lx.fill();
  for(let wy=y+8;wy<fy-22;wy+=20) for(let wx=x+8;wx<x+w-12;wx+=22){ R(wx,wy,10,12,'#22222a'); R(wx+1,wy+1,8,10,hash(wx,wy)>0.6?'#e8c070':'#34404c'); R(wx+5,wy+1,1,10,'#22222a'); }
  R(x+w/2-6,fy-20,12,20,'#3a2a20'); R(x+w/2-5,fy-19,10,19,'#4a3626');
  for(let tx=Math.max(0,t0-1);tx<=Math.min(COLS-1,t1+1);tx++) for(let ty=Math.max(0,top-2);ty<15;ty++) if(map[ty][tx]!=='.') drawTile(tx,ty); }
function hut(t0,fy){ const x=t0*T; R(x,fy-46,120,46,'#5a3e2a'); for(let i=0;i<46;i+=6) R(x,fy-46+i,120,1,'#4a3222'); lx.fillStyle='#e8eef4'; lx.beginPath(); lx.moveTo(x-10,fy-46); lx.lineTo(x+60,fy-76); lx.lineTo(x+130,fy-46); lx.fill(); R(x+20,fy-34,16,14,'#22222a'); R(x+21,fy-33,14,12,'#e8c070'); R(x+80,fy-30,14,30,'#3a2a1a'); lightDot(x+28,fy-27,'#ffd890'); }

function column(tx,fy,h,broken){ const x=tx*T+3; R(x,fy-h,10,h,broken?'#8a8478':'#d8c8a0'); R(x,fy-h,2,h,broken?'#a8a294':'#f0e4c0'); R(x+8,fy-h,2,h,broken?'#5a564e':'#a8946a'); if(!broken){ R(x-2,fy-h-4,14,4,'#e8d8b0'); R(x-2,fy-4,14,4,'#c8b890'); } else { R(x,fy-h-2,4,2,'#8a8478'); R(x+6,fy-h-5,4,5,'#8a8478'); } }
function statue(tx,fy,broken){ const x=tx*T; R(x+2,fy-12,12,12,'#a8946a'); if(!broken){ R(x+4,fy-34,8,22,'#c8b890'); R(x+5,fy-42,6,8,'#d8c8a0'); R(x+1,fy-30,3,12,'#c8b890'); R(x+12,fy-30,3,12,'#c8b890'); R(x+12,fy-40,2,20,'#8a7a5a'); } else { R(x+4,fy-20,8,8,'#8a8478'); R(x+5,fy-23,3,3,'#8a8478'); } }
function brazier(tx,fy){ const x=tx*T+4; R(x,fy-14,8,14,'#5a4a3a'); R(x-2,fy-16,12,3,'#8a6a3a'); lightDot(x+4,fy-18,'#ffb050',1); }
function scaffold(t0,t1,top){ for(let tx=t0;tx<=t1;tx+=3) R(tx*T+7,top*T,2,15*T-top*T,'#8a6a3a'); for(let y=top;y<15;y+=3) R(t0*T,y*T+6,(t1-t0+1)*T,2,'#7a5a2a'); }
function slogan(tx,ty,t){ drawSign(tx,ty,t,'#ffffff','#a82a2a'); }
function crystalAt(tx,ty,col){ const x=tx*T+8, y=ty*T+16; lx.fillStyle=col; lx.beginPath(); lx.moveTo(x-4,y); lx.lineTo(x,y-14); lx.lineTo(x+4,y); lx.fill(); lx.fillStyle='rgba(255,255,255,0.4)'; lx.fillRect(x-1,y-11,1,8); lightDot(x,y-6,col,1); }
function srcPillar(tx){ const x=tx*T+4; R(x,2*T,8,13*T,'#101024'); R(x+3,2*T,2,13*T,'#3a3a7a'); }
const SRC_SIGN=(tx,ty,t)=>{ if(!FLIP) drawSign(tx,ty,t,'#dcdcff','#1a1a3a'); };
function sv2Lamp(tx,fy){ const x=tx*T+7; R(x,fy-46,2,46,'#2a2a30'); R(x-4,fy-48,10,3,'#2a2a30'); R(x-3,fy-45,8,2,'#ffe0a0'); lightDot(x+1,fy-43,'#ffe0a0'); }
