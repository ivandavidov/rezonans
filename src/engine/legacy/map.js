/* ================= MAP ================= */
let map, LVL=null, LI=0;
const SOLID=new Set(['#','=','B','D','Z','>','<','^']);
const CONV={'>':1,'<':-1};
function tileAt(tx,ty){ if(tx<0||tx>=COLS||ty<0) return '#'; if(ty>=ROWS) return '.'; return map[ty][tx]; }
const isS=(tx,ty)=>SOLID.has(tileAt(tx,ty));
const solidAt=(x,y)=>isS(Math.floor(x/T),Math.floor(y/T));
const tileP=(x,y)=>tileAt(Math.floor(x/T),Math.floor(y/T));
function rectSolid(x,y,w,h){const x0=Math.floor(x/T),x1=Math.floor((x+w-0.01)/T),y0=Math.floor(y/T),y1=Math.floor((y+h-0.01)/T);for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++)if(isS(tx,ty))return true;return false;}
function rectHas(x,y,w,h,ch){const x0=Math.floor(x/T),x1=Math.floor((x+w-0.01)/T),y0=Math.floor(y/T),y1=Math.floor((y+h-0.01)/T);for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++)if(tileAt(tx,ty)===ch)return true;return false;}
function onTile(e,ch){ const ty=Math.floor((e.y+e.h+1)/T); for(let tx=Math.floor(e.x/T);tx<=Math.floor((e.x+e.w-0.01)/T);tx++) if(tileAt(tx,ty)===ch) return true; return false; }
function moveX(e,dx){ e.x+=dx; if(rectSolid(e.x,e.y,e.w,e.h)){ if(dx>0) e.x=Math.floor((e.x+e.w)/T)*T-e.w-0.01; else e.x=Math.floor(e.x/T)*T+T+0.01; e.vx=0; return true; } return false; }
function moveY(e,dy){
  const ob=e.y+e.h; e.y+=dy; e.onGround=false;
  if(rectSolid(e.x,e.y,e.w,e.h)){ if(dy>0){ e.y=Math.floor((e.y+e.h)/T)*T-e.h-0.01; e.onGround=true; } else e.y=Math.floor(e.y/T)*T+T+0.01; e.vy=0; return true; }
  if(dy>0&&!(e.dropThrough>0)){
    const nb=e.y+e.h, ty=Math.floor(nb/T), top=ty*T;
    if(ob<=top+0.6&&nb>=top){
      const x0=Math.floor(e.x/T),x1=Math.floor((e.x+e.w-0.01)/T);
      for(let tx=x0;tx<=x1;tx++){ const c=tileAt(tx,ty); if(c==='-'||(c==='H'&&tileAt(tx,ty-1)!=='H')){ e.y=top-e.h-0.01; e.vy=0; e.onGround=true; return true; } }
    }
  }
  return false;
}
function los(x0,y0,x1,y1){const d=Math.hypot(x1-x0,y1-y0),n=Math.ceil(d/6);for(let i=1;i<n;i++){const t=i/n;if(solidAt(x0+(x1-x0)*t,y0+(y1-y0)*t))return false;}return true;}
function groundY(tx){let ty=1;while(ty<16&&isS(tx,ty))ty++;while(ty<16&&!isS(tx,ty)&&tileAt(tx,ty)!=='-')ty++;return ty*T;}
function ceilY(tx){let ty=0;while(ty<16&&isS(tx,ty))ty++;return ty*T;}
const zoneAt=tx=>LVL.theme(clamp(tx,0,COLS-1));
const TP=tx=>TH[zoneAt(tx)];

