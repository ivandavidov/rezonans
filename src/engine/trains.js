/* ================= TRAINS & ROCKETS ================= */
const TL=7*T;
const trainSpd=()=>DI===0?300:DI===2?430:360, trainPer=()=>DI===0?10:DI===2?6:8, trainWarn=()=>DI===0?3.2:DI===2?2:2.6;
function updTrains(dt){
  const p=player;
  for(const tr of tracks){
    const near=p.x>(tr.x0-16)*T&&p.x<(tr.x1+16)*T;
    if(chtOn('traps')){ tr.warned=false; continue; }   // чийт: влакът не тръгва
    tr.t-=dt;
    if(tr.t<trainWarn()&&!tr.warned&&near){ tr.warned=true; SFX.horn(); }
    if(tr.t<=0){ if(near) trains.push({tr,dir:tr.dir,x:tr.dir>0?tr.x0*T-TL:(tr.x1+1)*T,hitP:false}); tr.t=trainPer()*(tr.fast?0.8:1); tr.warned=false; }
  }
  for(const t of trains){
    t.x+=t.dir*trainSpd()*(t.tr.fast?1.2:1)*dt;
    const x0=Math.max(t.x,t.tr.x0*T), x1=Math.min(t.x+TL,(t.tr.x1+1)*T), r={x:x0,y:13*T+2,w:x1-x0,h:2*T-2};
    if(r.w>0){
      if(!t.hitP&&!p.dead&&ov(r,p)){ t.hitP=true; p.inv=0; hurtPlayer(55,t.dir*380); p.vy=-300; shake=10; }
      for(const e of enemies) if(!e.dead&&e.type!=='flyer'&&e.type!=='turret'&&e.type!=='nest'&&ov(r,e)) hurtEnemy(e,999,t.dir*300);
      for(const b of barrels) if(!b.dead&&b.fuse<0&&ov(r,b)) b.fuse=0.02;
    }
    if(!t.snd&&Math.abs(t.x-p.x)<700){ t.snd=true; SFX.train(); }
    t.done=t.dir>0?t.x>(t.tr.x1+1)*T:t.x+TL<t.tr.x0*T;
  }
  trains=trains.filter(t=>!t.done);
}
function updRockets(dt){
  for(const r of rockets){
    const sp=Math.hypot(r.vx,r.vy), ns=Math.min(520,sp+700*dt); r.vx*=ns/sp; r.vy*=ns/sp; r.x+=r.vx*dt; r.y+=r.vy*dt; r.life-=dt;
    part(r.x-r.vx*0.02,r.y-r.vy*0.02,rnd(-10,10),rnd(-10,10),rnd(0.3,0.6),'#8a8a8a',rnd(2,3),-10,2);
    if(Math.random()<0.7) part(r.x,r.y,rnd(-20,20),rnd(-20,20),0.12,'#ffb53a',2,0,1);
    let hit=solidAt(r.x,r.y)||r.life<=0;
    if(!hit) for(const e of enemies) if(!e.dead&&r.x>=e.x&&r.x<=e.x+e.w&&r.y>=e.y&&r.y<=e.y+e.h){ hit=true; break; }
    if(!hit) for(const b of barrels) if(!b.dead&&r.x>=b.x&&r.x<=b.x+b.w&&r.y>=b.y&&r.y<=b.y+b.h){ hit=true; break; }
    if(!hit&&boss&&!boss.dead&&r.x>=boss.x&&r.x<=boss.x+boss.w&&r.y>=boss.y&&r.y<=boss.y+boss.h) hit=true;
    if(hit){ r.dead=true; stats.hits++; explode(r.x-r.vx*0.01,r.y-r.vy*0.01,72,120,0.5); }
  }
  rockets=rockets.filter(r=>!r.dead);
}

