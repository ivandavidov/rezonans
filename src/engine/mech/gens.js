/* ================= МЕХАНИКА · ГЕНЕРАТОРИ =================
   LVL.gens: [[tx,row]] — генератори, които враговете (или босът) удрят; възстановяват се бавно. */
let GENS=[];
defMech('gens',{
  load(){ GENS=[]; const L=LVL;
  if(L.gens) GENS=L.gens.map(([tx,row])=>({x:tx*T-6,y:(row+1)*T-22,w:28,h:22,hp:100,max:100,hitT:0}));
  },
  update(dt){
  // generators
  for(const g of GENS){ g.hitT-=dt; if(g.hp>0&&g.hp<g.max&&g.hitT<-2) g.hp=Math.min(g.max,g.hp+dt*2); }
  },
  drawBack(){
  for(const g of GENS){ const x=Math.round(g.x-cam), y=Math.round(g.y); if(x<-40||x>W+40) continue; const dead=g.hp<=0;
    px(x,y+6,28,16,dead?'#2a2a2a':'#3a4a52'); px(x,y+6,28,2,dead?'#3a3a3a':'#6a8a96'); px(x+4,y,20,7,dead?'#222':'#2a363c');
    if(!dead){ const a=(Math.sin(titleT*8+g.x)+1)/2; px(x+6,y+10,16,8,`rgba(80,${180+a*70},255,0.9)`); px(x+6,y+2,16,2,'#bfe8ff'); px(x+2,y-4,24,3,'rgba(0,0,0,0.5)'); px(x+2,y-4,24*g.hp/g.max,3,g.hp<35?'#ff4d3a':'#4fe3d6'); }
    else if(Math.random()<0.2) part(g.x+14,g.y,rnd(-5,5),-25,0.8,'#444',3,-10,2); }
  },
  lights(L){
  for(const g of GENS) if(g.hp>0) L.push([g.x+14,g.y+10,60,0.7]);
  } });
