/* ================= МЕХАНИКА · СНЯГ =================
   LVL.snow: гъстота (1 — 70 снежинки); поривите на вятъра ги отнасят. */
defMech('snow',{
  load(){ const L=LVL;
  if(L.snow) for(let i=0;i<70*L.snow;i++) MST.snow.push([Math.random()*W,Math.random()*H,0.5+Math.random(),Math.random()]);
  },
  update(dt){
  // snow
  for(const s of MST.snow){ s[1]+=(30+s[2]*30)*dt; s[0]+=(GWIND*0.12+Math.sin(lvT+s[3]*9)*8)*dt; if(s[1]>H){ s[1]=-2; s[0]=Math.random()*W; } if(s[0]<0) s[0]+=W; if(s[0]>W) s[0]-=W; }
  },
  drawWorld(){
  if(MST.snow&&MST.snow.length){ ctx.fillStyle='rgba(240,246,255,0.75)'; for(const s of MST.snow) ctx.fillRect(Math.round(s[0]),Math.round(s[1]),s[2]>1.2?2:1,s[2]>1.2?2:1); }
  } });
