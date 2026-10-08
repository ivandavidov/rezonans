/* ================= МЕХАНИКА · ЛОСТОВЕ И ОТВОДНЯВАНЕ =================
   LVL.levers: [{x,y,label,fn}] — ↑ до лоста го дърпа; drainRegion(x0,y0,x1,y1) източва водата в правоъгълника. */
let LEVERS=[], DRAINS=[];
function drainRegion(x0,y0,x1,y1){ DRAINS.push({x0,y0,x1,y1,t:0}); }
function updDrains(dt){ for(const d of DRAINS){ d.t-=dt; if(d.t>0) continue; d.t=0.09; let done=true; for(let y=d.y0;y<=d.y1;y++){ let any=false; for(let x=d.x0;x<=d.x1;x++) if(map[y]&&map[y][x]==='w'){ map[y][x]='.'; any=true; } if(any){ done=false; break; } } if(done) d.done=true; } DRAINS=DRAINS.filter(d=>!d.done); }
defMech('levers',{
  load(){ LEVERS=[]; DRAINS=[]; const L=LVL;
  if(L.levers) LEVERS=L.levers.map(v=>({...v,on:false,near:false}));
  },
  update(dt){ const p=player;
  // levers
  for(const v of LEVERS){ const r={x:v.x*T,y:v.y*T-24,w:16,h:24}; v.near=ov(p,r); if(v.near&&!v.on&&pressed.up&&!p.dead){ v.on=true; SFX.armor(); shake=3; if(v.fn) v.fn(v); } }
  updDrains(dt);
  },
  drawBack(){
  for(const v of LEVERS){ const x=Math.round(v.x*T-cam), y=v.y*T; if(x<-20||x>W+20) continue;
    px(x+3,y-14,10,14,'#3a4248'); px(x+3,y-14,10,1,'#5a646c'); px(x+5,y-12,6,3,v.on?'#3dff7a':(Math.floor(titleT*3)%2?'#ff3b2e':'#5a1a14'));
    ctx.save(); ctx.translate(x+8,y-7); ctx.rotate(v.on?0.7:-0.7); px(-1,-12,2,12,'#9aa2a7'); px(-2,-14,4,3,'#c94a2a'); ctx.restore();
    if(v.near&&!v.on){ ctx.font='600 7px "IBM Plex Mono",monospace'; ctx.textAlign='center'; ctx.fillStyle=ACC(); ctx.fillText('↑ '+(v.label||'дръпни'),x+8,y-30+Math.sin(titleT*5)*1.5); ctx.textAlign='left'; } }
  } });
