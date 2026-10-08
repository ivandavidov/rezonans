/* ================= МЕХАНИКА · ЕПОХИ =================
   LVL.buildB/themeB/skyB/decoB/spawnsB — втора епоха на същото ниво; E сменя епохата (ако там няма стена). */
let ERA=0, ERAD=null, cpEra=0, eraCd=0;
/* ---------- eras (time switch) ---------- */
function buildEras(){
  const L=LVL, mapA=map, mB=[]; for(let y=0;y<ROWS;y++) mB.push(new Array(COLS).fill('.'));
  const F=(x0,y0,x1,y1,c)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(x>=0&&x<COLS&&y>=0&&y<ROWS)mB[y][x]=c;};
  L.buildB(F,COLS);
  const cA=LV, dA={lamps,beacons,crystals,zTiles,convTiles}, thA=L.theme, decoA=L.deco, skyA=SKY, skyDefA=L.sky;
  const cB=document.createElement('canvas'); LV=cB; map=mB; L.theme=L.themeB; L.deco=L.decoB||(()=>{});
  prerender(); const dB={lamps,beacons,crystals,zTiles,convTiles};
  let skyB=skyA; if(L.skyB){ L.sky=L.skyB; buildSky(); skyB=SKY; L.sky=skyDefA; SKY=skyA; }
  L.theme=thA; L.deco=decoA; LV=cA; lx=LV.getContext('2d'); map=mapA; lamps=dA.lamps; beacons=dA.beacons; crystals=dA.crystals; zTiles=dA.zTiles; convTiles=dA.convTiles;
  const eB=[]; for(const [t,tx,row,flag] of (L.spawnsB||[])){ if(!allow(flag)) continue; if(DIMS[t]){ const e=makeEnemy(t,tx*T+8,(row+1)*T); e.era=1; if(t==='turret') e.face=-1; eB.push(e); } }
  ERAD={maps:[mapA,mB],cv:[cA,cB],data:[dA,dB],themes:[thA,L.themeB],skies:[skyA,skyB],enem:[enemies,eB]};
}
function switchEra(force){
  if(!ERAD) return false; const p=player, ne=1-ERA, cur=map;
  map=ERAD.maps[ne]; const blocked=rectSolid(p.x,p.y,p.w,p.h); map=cur;
  if(blocked&&!force){ SFX.beep(); if(!MT.eb||lvT-MT.eb>1.5){ MT.eb=lvT; showMsg('Не може — в другата епоха тук има стена.',1.6); } return false; }
  ERAD.enem[ERA]=enemies;
  ERA=ne; map=ERAD.maps[ne]; LV=ERAD.cv[ne]; lx=LV.getContext('2d'); const d=ERAD.data[ne]; lamps=d.lamps; beacons=d.beacons; crystals=d.crystals; zTiles=d.zTiles; convTiles=d.convTiles;
  LVL.theme=ERAD.themes[ne]; SKY=ERAD.skies[ne]; enemies=ERAD.enem[ne];
  if(!force){ flash=0.75; flashCol=ne?'#d8f4ff':'#ffe2b0'; SFX.portal&&SFX.portal(0.7); for(let i=0;i<24;i++){ const a=rnd(6.28); part(p.x+p.w/2,p.y+p.h/2,Math.cos(a)*rnd(40,160),Math.sin(a)*rnd(40,160),0.6,ne?'#bfe8ff':'#ffd08a',2,0,0); } }
  if(blocked){ for(let k=0;k<6&&rectSolid(p.x,p.y,p.w,p.h);k++) p.y-=T; }
  return true;
}
defMech('eras',{
  load(){ ERA=0; ERAD=null; cpEra=0; eraCd=0; const L=LVL;
  if(L.buildB) buildEras();
  },
  update(dt){ const p=player;
  // клавиш E (eAction) — решава се тук, всяко действие се изпълнява на обичайното си място; епохите са първи
  eraCd-=dt; E_ACT=eAction(p); if(E_ACT==='era'&&switchEra()) eraCd=0.45;
  },
  preRespawn(){ if(ERAD&&ERA!==cpEra) switchEra(true); },
  setCp(){ cpEra=ERA; } });
