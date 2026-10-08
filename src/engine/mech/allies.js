/* ================= МЕХАНИКА · ДУХОВЕ-СЪЮЗНИЦИ =================
   LVL.ghosts: брой; addGhost() добавя още — летят до играча и стрелят по враговете. */
let ALLIES=[];
/* ---------- ghosts (allies) ---------- */
function addGhost(silent){ const p=player; ALLIES.push({x:p?p.x:0,y:p?p.y-30:0,i:ALLIES.length,cd:1.2+ALLIES.length*0.4,t:rnd(6)}); if(!silent&&p) for(let i=0;i<20;i++) part(p.x+rnd(-20,20),p.y+rnd(-30,10),rnd(-20,20),rnd(-40,-10),0.9,'#bfe8ff',2,-20); }
function updAllies(dt){
  const p=player;
  for(const a of ALLIES){ a.t+=dt; a.cd-=dt;
    const side=a.i%2?1:-1, tx=p.x+p.w/2+side*(22+a.i*10)-p.face*8, ty=p.y-14-(a.i>>1)*10+Math.sin(a.t*2+a.i)*5;
    a.x+=(tx-a.x)*Math.min(1,dt*3); a.y+=(ty-a.y)*Math.min(1,dt*3);
    if(a.cd<=0&&!p.dead){ let best=null,bd=230; for(const e of enemies){ if(e.dead||e.type==='target') continue; const ex=e.x+e.w/2, ey=e.y+e.h/2, d=Math.hypot(ex-a.x,ey-a.y); if(d<bd&&los(a.x,a.y,ex,ey)){ bd=d; best=e; } }
      let bt=null; if(!best&&boss&&!boss.dead&&bossActive){ const bx=boss.x+boss.w/2, by=boss.y+boss.h/2; if(Math.hypot(bx-a.x,by-a.y)<260) bt=[bx,by]; }
      if(best){ hurtEnemy(best,12,0,true); tracers.push({x0:a.x,y0:a.y,x1:best.x+best.w/2,y1:best.y+best.h/2,life:0.08,col:'150,230,255'}); a.cd=1.5*D.rate+rnd(0.4); sparks(best.x+best.w/2,best.y+best.h/2,4,'#bfe8ff'); }
      else if(bt){ hurtBoss(8); tracers.push({x0:a.x,y0:a.y,x1:bt[0],y1:bt[1],life:0.08,col:'150,230,255'}); a.cd=1.8*D.rate; }
      else a.cd=0.3; }
  }
}
function drawAllies(){
  for(const a of ALLIES){ const x=Math.round(a.x-cam), y=Math.round(a.y); if(x<-30||x>W+30) continue;
    ctx.save(); ctx.globalAlpha=0.55+Math.sin(a.t*3)*0.1; ctx.globalCompositeOperation='lighter';
    const g=ctx.createRadialGradient(x,y,0,x,y,16); g.addColorStop(0,'rgba(170,230,255,0.55)'); g.addColorStop(1,'rgba(120,200,255,0)'); ctx.fillStyle=g; ctx.fillRect(x-16,y-16,32,32);
    ctx.fillStyle='#cfefff'; ctx.fillRect(x-3,y-9,6,6); ctx.fillRect(x-4,y-3,8,9); for(let i=0;i<4;i++) ctx.fillRect(x-4+i*2,y+6,1,2+((i+Math.floor(a.t*6))%3));
    ctx.fillStyle='#1a3a5a'; ctx.fillRect(x-2,y-7,1,1); ctx.fillRect(x+1,y-7,1,1); ctx.restore(); }
}

defMech('allies',{
  load(){ ALLIES=[]; const L=LVL;
  if(L.ghosts) for(let i=0;i<L.ghosts;i++) addGhost(true);
  },
  update(dt){ updAllies(dt); },
  drawWorld(){ drawAllies(); },
  lights(L){
  for(const a of ALLIES) L.push([a.x,a.y,56,0.7]);
  },
  respawn(){ const p=player;
  for(const a of ALLIES){ a.x=p.x; a.y=p.y-30; }
  } });
