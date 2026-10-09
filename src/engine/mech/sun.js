/* ================= МЕХАНИКА · СЛЪНЧЕВИ ИЗБЛИЦИ =================
   LVL.sun: {per,dur,warn} — по време на изблик пари, ако не си на сянка. */
let sunWarned=false;
function shaded(p){ const cx=Math.floor((p.x+p.w/2)/T); for(let ty=Math.floor(p.y/T)-1;ty>=0;ty--){ const c=tileAt(cx,ty); if(SOLID.has(c)||c==='-') return true; } return false; }
defMech('sun',{
  chips(chip){ if(LVL.sun) chip(MT.flare?'☼ ИЗБЛИК — СТОЙ НА СЯНКА!':MT.warn?'☼ ИДВА ИЗБЛИК…':'☼ слънцето е спокойно',MT.flare||MT.warn?'#ffb04a':'#c8b890'); },
  load(){ sunWarned=false; },
  update(dt){ const p=player;
  // sun flares
  if(LVL.sun){ const s=LVL.sun, t=lvT%s.per, flare=t>s.per-s.dur, warn=!flare&&t>s.per-s.dur-s.warn; MT.flare=flare; MT.warn=warn;
    if(warn&&!sunWarned){ sunWarned=true; showMsg('Слънчев изблик! Скрий се на сянка!',2.2); }
    if(flare&&!p.dead&&!shaded(p)){ p.sunT=(p.sunT||0)-dt; if(p.sunT<=0){ p.sunT=0.32; hurtPlayer(6,0,true); for(let i=0;i<4;i++) part(p.x+rnd(p.w),p.y+rnd(p.h),rnd(-10,10),rnd(-50,-20),0.5,'#ffb04a',1.5,-20); } } }
  },
  postFx(){
  if(LVL.sun){ if(MT.flare){ ctx.fillStyle='rgba(255,236,190,0.30)'; ctx.fillRect(0,0,W,H); } else if(MT.warn){ const a=(Math.sin(titleT*14)+1)/2; ctx.fillStyle=`rgba(255,150,40,${0.06+a*0.1})`; ctx.fillRect(0,0,W,H); } }
  } });
