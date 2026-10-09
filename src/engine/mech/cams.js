/* ================= МЕХАНИКА · ПРОЖЕКТОРИ, КАМЕРИ, ОЧИ; ТРЕВОГА; ФЕНЕРЧЕ =================
   LVL.lights: [{x,y,a0,a1,spd,len,cam,eye}] — засекат ли те, вдигат тревога (LVL.onAlarm или подкрепления от LVL.alarmFoe).
   LVL.flash — фенерче в ръката на героя. */
let LIGHTS=[], ALARM=0;
function lightCone(l){ const lx=l.x*T+8-cam, ly=l.y*T+8; if(lx<-260||lx>W+260) return; const half=l.cam?0.17:0.22, len=l.len*T, pts=[[lx,ly]];
  for(let k=0;k<=10;k++){ const a=l.a-half+k*(2*half/10); let r=0; for(;r<len;r+=6){ const xx=l.x*T+8+Math.cos(a)*r, yy=ly+Math.sin(a)*r; if(solidAt(xx,yy)) break; } pts.push([lx+Math.cos(a)*r,ly+Math.sin(a)*r]); }
  const hot=ALARM>0||l.seen>0.05, col=l.eye?(hot?'255,40,60':'255,120,140'):(hot?'255,60,60':l.cam?'255,200,120':'255,240,200');
  ctx.save(); ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(lx,ly,4,lx,ly,len); g.addColorStop(0,`rgba(${col},${hot?0.34:0.24})`); g.addColorStop(1,`rgba(${col},0)`); ctx.fillStyle=g;
  ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]); for(const q of pts) ctx.lineTo(q[0],q[1]); ctx.closePath(); ctx.fill(); ctx.restore();
  if(l.eye){ ctx.fillStyle='#2a0a10'; ctx.beginPath(); ctx.ellipse(lx,ly,9,6,0,0,7); ctx.fill(); ctx.fillStyle=hot?'#ff3b4f':'#ffd0d6'; ctx.beginPath(); ctx.ellipse(lx+Math.cos(l.a)*3,ly+Math.sin(l.a)*2,3,4,0,0,7); ctx.fill(); }
  else { ctx.fillStyle='#2a2e34'; ctx.fillRect(lx-6,ly-8,12,7); ctx.save(); ctx.translate(lx,ly); ctx.rotate(l.a); ctx.fillStyle=l.cam?'#3a3e44':'#4a4e54'; ctx.fillRect(-3,-4,12,8); ctx.fillStyle=hot?'#ff3b4f':(l.cam?'#ff3b4f':'#fff6d0'); ctx.fillRect(8,-3,2,6); ctx.restore(); } }
defMech('cams',{
  load(){ ALARM=0; const L=LVL;
  LIGHTS=(L.lights||[]).map((l,i)=>({...l,a:(l.a0+l.a1)/2,ph:i*1.7,seen:0}));
  },
  respawn(){ ALARM=0; for(const l of LIGHTS) l.seen=0; },
  update(dt){ const p=player;
  // searchlights / cameras / eyes
  for(const l of LIGHTS){ const mid=(l.a0+l.a1)/2, amp=(l.a1-l.a0)/2; l.a=mid+amp*Math.sin(lvT*l.spd+l.ph);
    const lx=l.x*T+8, ly=l.y*T+8, cx=p.x+p.w/2, cy=p.y+p.h/2, d=Math.hypot(cx-lx,cy-ly), ang=Math.atan2(cy-ly,cx-lx), half=l.cam?0.17:0.22;
    let diff=Math.abs(((ang-l.a+Math.PI*3)%(Math.PI*2))-Math.PI);
    const seen=!p.dead&&!chtOn('inv')&&d<l.len*T&&diff<half&&los(lx,ly,cx,cy);
    if(seen){ l.seen+=dt; if(l.seen>0.32) mechAlarm(l); } else l.seen=Math.max(0,l.seen-dt*0.8); }
  if(ALARM>0){ ALARM-=dt; if(Math.random()<dt*1.5&&AC) osc({type:'square',f:Math.floor(lvT*2)%2?660:520,t:0.25,v:0.05}); }
  },
  drawWorld(){
  for(const l of LIGHTS) lightCone(l);
  },
  lights(L){
  for(const l of LIGHTS) L.push([l.x*T+8+Math.cos(l.a)*l.len*T*0.5,l.y*T+8+Math.sin(l.a)*l.len*T*0.5,70,0.5]);
  },
  chips(chip){
  if(ALARM>0) chip('⚠ ТРЕВОГА · '+Math.ceil(ALARM)+' s','#ff5a5a');
  } });
defMech('flash',{ lights(L){
  if(LVL.flash&&player&&!player.dead){ const p=player, cx=p.x+p.w/2, cy=p.y+10, d=p.face||1; for(let k=1;k<=6;k++) L.push([cx+d*k*20,cy+(p.aimUp?-k*14:0),18+k*6,0.9-k*0.09]); L.push([cx,cy,34,0.6]); }
} });
