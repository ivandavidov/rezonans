/* ================= SKY ================= */
let SKY=null;
function buildSky(){
  SKY=null; const s=LVL.sky; if(!s) return;
  const base=document.createElement('canvas'); base.width=W; base.height=H; const b=base.getContext('2d');
  const g=b.createLinearGradient(0,0,0,H); s.grad.forEach(([o,c])=>g.addColorStop(o,c)); b.fillStyle=g; b.fillRect(0,0,W,H);
  if(s.stars) for(let i=0;i<140;i++){ b.fillStyle=`rgba(255,255,255,${0.15+hash(i,1)*0.6})`; b.fillRect(Math.floor(hash(i,2)*W),Math.floor(hash(i,3)*H*0.7),1,1); }
  if(s.sun){ const [x,y,r,c]=s.sun; const sg=b.createRadialGradient(x,y,0,x,y,r*5); sg.addColorStop(0,'rgba(255,220,150,0.5)'); sg.addColorStop(1,'rgba(255,160,80,0)'); b.fillStyle=sg; b.fillRect(x-r*5,y-r*5,r*10,r*10); b.fillStyle=c; b.beginPath(); b.arc(x,y,r,0,7); b.fill(); }
  if(s.moon){ const [x,y,r]=s.moon; const mg=b.createRadialGradient(x,y,0,x,y,r*4); mg.addColorStop(0,'rgba(220,230,255,0.35)'); mg.addColorStop(1,'rgba(220,230,255,0)'); b.fillStyle=mg; b.fillRect(x-r*4,y-r*4,r*8,r*8); b.fillStyle='#e6ebf2'; b.beginPath(); b.arc(x,y,r,0,7); b.fill(); b.fillStyle='#c8ced8'; b.beginPath(); b.arc(x-3,y-2,2,0,7); b.arc(x+3,y+3,1.5,0,7); b.fill(); }
  if(s.vortex){ const [x,y]=s.vortex; const vg=b.createRadialGradient(x,y,0,x,y,90); vg.addColorStop(0,'rgba(220,255,230,0.9)'); vg.addColorStop(0.15,'rgba(110,255,190,0.5)'); vg.addColorStop(0.5,'rgba(150,60,220,0.25)'); vg.addColorStop(1,'rgba(40,10,60,0)'); b.fillStyle=vg; b.fillRect(x-90,y-90,180,180);
    b.lineWidth=1; for(let k=0;k<7;k++){ b.strokeStyle=`rgba(${k%2?'180,120,255':'120,255,200'},${0.35-k*0.04})`; b.beginPath(); b.ellipse(x,y,14+k*11,5+k*4,-0.25,0,Math.PI*2); b.stroke(); } }
  const layers=[];
  for(const L of s.layers){ const c=document.createElement('canvas'); c.width=1024; c.height=H; const x=c.getContext('2d'); x.fillStyle=L.col;
    if(L.kind==='mount'){ for(let i=0;i<1024;i++){ let h=L.base; for(const [k,a,ph] of L.waves) h+=Math.sin(i/1024*Math.PI*2*k+ph)*a; x.fillRect(i,Math.floor(H-h),1,Math.ceil(h)); if(L.cap&&h>L.capAt){ x.fillStyle=L.cap; x.fillRect(i,Math.floor(H-h),1,Math.min(Math.ceil(h-L.capAt),9)); x.fillStyle=L.col; } } }
    else if(L.kind==='wrecks') for(let k=0;k<L.n;k++){ const cx=hash(k,L.seed)*1024, cy=L.y+hash(L.seed,k)*L.dy, w=40+hash(k,k+L.seed)*L.w, ang=(hash(k+3,L.seed)-0.5)*0.8;
      for(const dx of [-1024,0,1024]){ x.save(); x.translate(cx+dx,cy); x.rotate(ang); x.fillStyle=L.col; x.beginPath(); x.moveTo(-w/2,0); x.lineTo(-w/2+8,-w*0.18); x.lineTo(w/2-6,-w*0.14); x.lineTo(w/2,0); x.lineTo(w/2-10,w*0.12); x.lineTo(-w/2+12,w*0.1); x.closePath(); x.fill();
        x.fillRect(-w*0.15,-w*0.3,w*0.08,w*0.2); x.fillStyle='rgba(255,200,120,0.6)'; for(let i=0;i<5;i++) if(hash(k*7+i,L.seed)>0.4) x.fillRect(-w/2+10+i*w/6,-2,2,2); x.restore(); } }
    else if(r2SkyLayer(L,x)){}
    else for(let k=0;k<L.n;k++){ const cx=hash(k,L.seed)*1024, cy=L.y+hash(L.seed,k)*L.dy, w=18+hash(k,k+L.seed)*L.w;
      for(const dx of [-1024,0,1024]){ x.beginPath(); x.ellipse(cx+dx,cy,w,w*0.2,0,0,7); x.fill(); x.beginPath(); x.moveTo(cx+dx-w*0.85,cy); x.lineTo(cx+dx+w*0.85,cy); x.lineTo(cx+dx+w*0.15,cy+w*0.75); x.closePath(); x.fill(); } }
    layers.push({c,sp:L.sp}); }
  SKY={base,layers};
}
function drawSky(){ ctx.drawImage(SKY.base,0,0); for(const L of SKY.layers){ const off=((cam*L.sp)%1024+1024)%1024; ctx.drawImage(L.c,-off,0); ctx.drawImage(L.c,1024-off,0); } }

