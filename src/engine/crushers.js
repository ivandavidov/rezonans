/* ================= CRUSHERS ================= */
const crPer=()=>D.crush;
function crPos(c){ if(chtOn('traps')) return 0; const per=crPer(), t=((lvT+c.off*per)%per+per)%per; if(t<per-1.2) return 0; if(t<per-0.8) return 0.03+0.02*Math.sin(t*70); if(t<per-0.65) return (t-(per-0.8))/0.15; if(t<per-0.4) return 1; return 1-(t-(per-0.4))/0.4; }
function crRect(c){ const pos=crPos(c), y0=2*T+4, h=22; return {x:c.tx*T,y:y0+pos*(15*T-h-y0),w:c.w*T,h,pos}; }
function updCrushers(dt){
  const p=player;
  for(const c of crushers){
    c.hitCd-=dt; const r=crRect(c);
    if(r.pos>=1&&c.last<1&&Math.abs(c.tx*T-p.x)<420){ sfxAt('stomp',{x:c.tx*T,y:14*T,w:r.w}); shake=Math.max(shake,3); for(let i=0;i<8;i++) part(r.x+rnd(r.w),15*T-2,rnd(-60,60),rnd(-50,-10),0.5,'#6a5a48',rnd(2,3),200,2); }
    c.last=r.pos;
    if(r.pos>0.25){
      if(c.hitCd<=0&&!p.dead&&ov(r,p)){ c.hitCd=1; p.inv=0; hurtPlayer(60,sgn(p.x+p.w/2-(r.x+r.w/2))*320); p.vy=-150; }
      for(const e of enemies) if(!e.dead&&!FOES[e.type].noCrush&&ov(r,e)) hurtEnemy(e,999,0);
    }
  }
}
function drawCrushers(){ for(const c of crushers){ const x=c.tx*T-cam; if(x<-40||x>W+40) continue; const r=crRect(c), mx=x+r.w/2;
  px(mx-3,2*T,6,r.y-2*T,'#4a4f56'); px(mx-3,2*T,2,r.y-2*T,'#6a7078'); px(x-2,2*T,r.w+4,4,'#2a2e33');
  px(x,r.y,r.w,r.h,'#3a3f45'); px(x,r.y,r.w,2,'#7a828a'); for(let i=0;i<r.w;i+=8) px(x+i,r.y+r.h-6,4,6,'#c99a1c'); px(x+2,r.y+4,r.w-4,2,'#2a2e33'); } }
function drawConveyors(){ for(const [tx,ty,d] of convTiles){ const x=tx*T-cam; if(x<-T||x>W) continue; const o=((titleT*60*d)%8+8)%8; for(let i=-8;i<T;i+=8){ const xx=Math.round(x+i+o); if(xx<x||xx>x+T-3) continue; px(xx,ty*T,3,2,'#c99a1c'); } } }

