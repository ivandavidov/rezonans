/* ================= МЕХАНИКА · ПОДВИЖНИ ЗАЛИ И РИТМИЧНИ ПЛАТФОРМИ =================
   LVL.shifters: [{per,off,a,b,beat,duty}] — правоъгълниците a и b се редуват; beat — в такт (rhythmA). */
let SHIFT=[];
function updShifters(){
  const p=player;
  for(const s of SHIFT){ let ph; if(s.beat){ const u=((lvT/s.per)+(s.off||0))%1, d=s.duty||0.75; ph=u<d?0:1; s.left=(ph?1-u:d-u)*s.per; } else { const half=s.per/2; ph=Math.floor((lvT+(s.off||0)*s.per)/half)%2; s.left=half-((lvT+(s.off||0)*s.per)%half); }
    if(ph===s.st) continue;
    const add=ph?s.b:s.a, rem=ph?s.a:s.b;
    if(s.st>=0){ let blk=false; for(const [x0,y0,x1,y1] of add) if(ov(p,{x:x0*T,y:y0*T,w:(x1-x0+1)*T,h:(y1-y0+1)*T})) blk=true; if(blk) continue; }
    s.st=ph; let xa=1e9,xb=-1;
    for(const [x0,y0,x1,y1] of rem){ for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++) map[y][x]='.'; xa=Math.min(xa,x0); xb=Math.max(xb,x1); }
    for(const [x0,y0,x1,y1,c] of add){ for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++) map[y][x]=c||'#'; xa=Math.min(xa,x0); xb=Math.max(xb,x1);
      for(const e of enemies) if(!e.dead&&ov(e,{x:x0*T,y:y0*T,w:(x1-x0+1)*T,h:(y1-y0+1)*T})) hurtEnemy(e,999,0); }
    if(xb>=0) redrawCols(xa,xb);
    if(!s.beat&&Math.abs(xa*T-p.x)<400){ SFX.door(); shake=Math.max(shake,3); }
    else if(s.beat&&Math.abs(xa*T-p.x)<300&&AC&&ph===0) osc({type:'sine',f:220,t:0.08,v:0.05});
  }
}
/* ритмични платформи: появяват се в такт (4 удара на такт) */
const BEAT3=(bpm)=>60/bpm*4;
const rhythmA=(rects,bpm,off)=>({per:BEAT3(bpm),off:off||0,beat:1,a:rects.map(r=>[...r.slice(0,4),'=']),b:[]});
defMech('shifters',{
  load(){ SHIFT=[]; const L=LVL;
  if(L.shifters) SHIFT=L.shifters.map(s=>({...s,st:-1}));
  },
  update(){
  // shifting halls
  updShifters();
  },
  drawWorld(){
  // shifter warnings
  for(const s of SHIFT){ if(s.left>0.9||s.st<0) continue; const add=s.st?s.a:s.b; const a=(Math.sin(titleT*20)+1)/2; ctx.strokeStyle=`rgba(255,90,60,${0.4+a*0.5})`; ctx.lineWidth=1;
    for(const [x0,y0,x1,y1] of add){ ctx.strokeRect(x0*T-cam+0.5,y0*T+0.5,(x1-x0+1)*T-1,(y1-y0+1)*T-1); ctx.fillStyle=`rgba(255,90,60,${0.08+a*0.1})`; ctx.fillRect(x0*T-cam,y0*T,(x1-x0+1)*T,(y1-y0+1)*T); } }
  } });
