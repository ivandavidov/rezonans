/* ================= МЕХАНИКА · ТЕРМИНАЛИ =================
   LVL.terms: [{x,y,time,label,fn}] — задръж ↑, докато лентата се напълни; междувременно идват врагове. */
let TERMS=[];
defMech('terms',{
  load(){ const L=LVL;
  TERMS=(L.terms||[]).map(t=>({...t,prog:0,done:false,spawnT:2.5}));
  },
  respawn(){ for(const t of TERMS) if(!t.done) t.prog=0; },
  update(dt){ const p=player;
  // terminals
  for(const t of TERMS){ if(t.done) continue; const r={x:t.x*T-6,y:t.y*T-28,w:28,h:28}; t.near=!p.dead&&ov(p,r);
    if(t.near&&keys.up){ t.prog+=dt; t.spawnT-=dt; if(Math.random()<dt*8) sparks(t.x*T+8,t.y*T-18,1,'#ff8a9a');
      if(t.spawnT<=0){ t.spawnT=3.4; mechSpawn(LVL.alarmFoe||'soldier',p.x+(Math.random()<0.5?-1:1)*rnd(6,9)*T); }
      if(t.prog>=t.time){ t.done=true; t.prog=t.time; if(t.fn) t.fn(t); if(AC){ osc({type:'square',f:880,t:0.1,v:0.1}); osc({type:'square',f:1320,t:0.15,v:0.1,when:0.1}); } } }
    else t.prog=Math.max(0,t.prog-dt*0.35); }
  },
  drawBack(){
  for(const t of TERMS){ const x=Math.round(t.x*T-cam), y=t.y*T; if(x<-30||x>W+30) continue; px(x-2,y-24,20,24,'#2a2e34'); px(x-2,y-24,20,1,'#4a5058'); px(x,y-21,16,10,t.done?'#1a3a24':'#2a0a10'); px(x+1,y-20,14,8,t.done?'#3dff7a':(Math.floor(titleT*4)%2?'#ff3b4f':'#7a1a26'));
    if(!t.done){ ctx.font='600 5px "IBM Plex Mono",monospace'; ctx.fillStyle='#ffd0d6'; ctx.textAlign='center'; ctx.fillText(t.label||'ТЕРМИНАЛ',x+8,y-28); ctx.textAlign='left'; }
    if(t.prog>0&&!t.done){ px(x-6,y-40,28,4,'rgba(0,0,0,0.6)'); px(x-5,y-39,26*(t.prog/t.time),2,'#ff3b4f'); }
    if(t.near&&!t.done&&Math.floor(titleT*3)%2){ ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.fillStyle='#ffffff'; ctx.textAlign='center'; ctx.fillText('задръж ↑',x+8,y-46); ctx.textAlign='left'; } }
  },
  lights(L){
  for(const t of TERMS) L.push([t.x*T+8,t.y*T-16,40,0.6]);
  } });
