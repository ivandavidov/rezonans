/* ================= РЕЗОНАНС 3 · ДЕКОРАЦИИ ================= */
// decoration helpers
function lampOff(tx,fy){ const x=tx*T+7; R(x,fy-46,2,46,'#1e1e24'); R(x-4,fy-48,10,3,'#1e1e24'); R(x-3,fy-45,8,2,'#3a3a40'); }
function car(tx,fy,col){ const x=tx*T; R(x+2,fy-14,30,9,col); R(x+7,fy-21,18,8,col); R(x+9,fy-19,6,5,'#1a1e26'); R(x+17,fy-19,6,5,'#1a1e26'); R(x+4,fy-5,7,5,'#0e0e10'); R(x+22,fy-5,7,5,'#0e0e10'); R(x+2,fy-16,30,2,'#e8eef4'); R(x+7,fy-23,18,2,'#e8eef4'); }
function metroSign(tx,ty,t){ drawSign(tx,ty,t,'#ffffff','#7a1a26'); }
function trainBody(t0,t1,top){ const x=t0*T, w=(t1-t0+1)*T, y=top*T; R(x,y-2,w,4*T+2,'#3a3e48'); R(x,y-2,w,2,'#6a707c'); R(x,y+T*1.5,w,3,'#c9a21c'); for(let i=8;i<w-16;i+=24){ R(x+i,y+6,14,10,'#14181e'); R(x+i+1,y+7,12,8,'#22303a'); } }
function roman(tx,fy,h,broken){ const x=tx*T+2; R(x,fy-h,12,h,broken?'#8a7a5c':'#c8b48c'); R(x,fy-h,3,h,broken?'#a8987a':'#e0d0a8'); if(!broken){ R(x-2,fy-h-4,16,4,'#d8c8a0'); } R(x-2,fy-4,16,4,'#a8946a'); }
function mosaic(t0,t1,fy){ for(let x=t0*T;x<(t1+1)*T;x+=6) for(let k=0;k<2;k++) R(x,fy-6+k*3,5,2,['#8a3a2a','#c8a040','#3a5a6a','#e0d0a8'][(Math.floor(x/6)+k)%4]); }
function crate77(tx,fy){ const x=tx*T; R(x,fy-14,16,14,'#5a4a2a'); R(x+1,fy-13,14,1,'#7a6a42'); R(x+7,fy-14,2,14,'#3a2e1a'); }
function poster(tx,ty,t){ drawSign(tx,ty,t,'#ffffff','#8a1a1a'); }
