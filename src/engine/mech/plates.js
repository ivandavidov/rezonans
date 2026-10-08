/* ================= МЕХАНИКА · ПЛОЧИ ПОД НАЛЯГАНЕ =================
   LVL.plates: [{x,y,door}] — вратата е отворена, докато някой (ти или ехото) стои на плочата. */
let PLATES=[];
defMech('plates',{
  load(){ const L=LVL;
  PLATES=(L.plates||[]).map(p=>({...p,on:false,was:false}));
  },
  update(){ const p=player;
  // pressure plates
  const eb=echoNow(), ebox=eb?{x:eb.x,y:eb.y,w:10,h:eb.h}:null;
  for(const pl of PLATES){ const x0=pl.x*T, x1=x0+2*T, fy=pl.y*T, onIt=b=>b&&b.x+b.w>x0+2&&b.x<x1-2&&Math.abs(b.y+b.h-fy)<7;
    pl.on=(!p.dead&&onIt(p))||onIt(ebox);
    if(pl.on&&!pl.was){ setDoor(pl.door,'.'); SFX.door(); pl.was=true; }
    else if(!pl.on&&pl.was){ const [dx,r0,r1]=pl.door, dr={x:dx*T,y:r0*T,w:T,h:(r1-r0+1)*T}; if(!ov(p,dr)&&!(ebox&&ov(ebox,dr))){ setDoor(pl.door,'D'); SFX.door(); pl.was=false; } } }
  },
  drawBack(){
  for(const pl of PLATES){ const x=Math.round(pl.x*T-cam), y=pl.y*T; if(x<-40||x>W+40) continue; px(x+1,y-3,30,3,pl.on?'#ff3b4f':'#5a2a30'); px(x+1,y-4,30,1,pl.on?'#ffd0d6':'#8a4a50'); if(pl.on){ ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.fillStyle='rgba(255,59,79,0.18)'; ctx.fillRect(x,y-14,32,11); ctx.restore(); } }
  } });
