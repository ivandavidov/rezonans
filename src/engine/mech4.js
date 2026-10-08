/* ================= ДВИГАТЕЛ · МЕХАНИКИ IV =================
   Тонът (LVL.tone): E изпява тон — вълна, която зашеметява враговете наоколо (e.stunT)
     и отваря тоновите врати (плочка 't') за няколко секунди. Босовете могат да реагират чрез R2B_TONE[тип](разстояние).
   Зашеметен враг замръзва на място (виж куката в build.py). */
let TONEP=[], toneCd=0, TDOORS=[], tdoorT=0;
const R2B_TONE={};
SOLID.add('t');
function mech4Load(){ TONEP=[]; toneCd=0; tdoorT=0; TDOORS=[]; SOLID.add('t'); if(!LVL) return;
  for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++) if(map[y][x]==='t') TDOORS.push([x,y]); }
function mech4Respawn(){ TONEP=[]; tdoorT=0; SOLID.add('t'); }
function tonePulse(){
  const p=player; if(toneCd>0||p.dead) return; toneCd=1.3; const x=p.x+p.w/2, y=p.y+p.h/2; TONEP.push({x,y,t:0});
  if(AC){ osc({type:'sine',f:440,t:0.9,v:0.08}); osc({type:'sine',f:554,t:0.9,v:0.05,when:0.08}); osc({type:'sine',f:659,t:0.9,v:0.05,when:0.16}); }
  noise(x,y,'tone');
  for(const e of enemies){ if(e.dead||e.mech||e.tag) continue; const d=Math.hypot(e.x+e.w/2-x,e.y+e.h/2-y); if(d<150){ e.stunT=Math.max(e.stunT||0,e.para?3.2:2); e.alert=true; } }
  if(boss&&!boss.dead&&R2B_TONE[boss.type]) R2B_TONE[boss.type](Math.hypot(boss.x+boss.w/2-x,boss.y+boss.h/2-y));
  if(TDOORS.some(([tx,ty])=>Math.hypot(tx*T+8-x,ty*T+8-y)<170)){ tdoorT=3.6; SOLID.delete('t'); if(AC) osc({type:'triangle',f:880,t:0.4,v:0.05,when:0.2}); }
}
function mech4Update(dt){
  const p=player; if(!p) return;
  toneCd=Math.max(0,toneCd-dt);
  if(LVL.tone&&!GAME.echo&&pressed.era&&!ERAD&&!p.dead&&!STILL.son&&!LVL.freq&&!LVL.flares) tonePulse();
  for(const t of TONEP) t.t+=dt; TONEP=TONEP.filter(t=>t.t<1.2);
  if(tdoorT>0){ tdoorT-=dt; if(tdoorT<=0){ const inside=TDOORS.some(([tx,ty])=>ov(p,{x:tx*T,y:ty*T,w:T,h:T})); if(inside) tdoorT=0.2; else SOLID.add('t'); } }
}
function mech4DrawWorld(){
  // тоновите врати
  if(TDOORS.length){ const open=!SOLID.has('t'), a=(Math.sin(titleT*5)+1)/2;
    for(const [tx,ty] of TDOORS){ const x=tx*T-cam, y=ty*T; if(x<-T||x>W) continue;
      if(!open){ ctx.fillStyle='#2a2440'; ctx.fillRect(x,y,T,T); ctx.fillStyle=`rgba(232,194,90,${0.45+a*0.35})`; ctx.fillRect(x+7,y+2,2,12); ctx.fillRect(x+4,y+5,8,1); ctx.fillRect(x+4,y+10,8,1); ctx.fillStyle='#4a3e6a'; ctx.fillRect(x,y,T,1); ctx.fillRect(x,y+15,T,1); }
      else { ctx.strokeStyle=`rgba(232,194,90,${0.25+0.5*Math.min(1,tdoorT/1.2)})`; ctx.setLineDash([2,2]); ctx.strokeRect(x+0.5,y+0.5,T-1,T-1); ctx.setLineDash([]); } } }
  // вълните
  for(const t of TONEP){ const r=t.t*190, al=Math.max(0,1-t.t/1.1); ctx.save(); ctx.globalCompositeOperation='lighter'; for(let i=0;i<3;i++){ ctx.strokeStyle=`rgba(${['232,194,90','180,150,255','255,240,200'][i]},${al*0.6})`; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(t.x-cam,t.y,Math.max(1,r-i*10),0,7); ctx.stroke(); } ctx.restore(); ctx.lineWidth=1; }
  // зашеметени врагове
  for(const e of enemies){ if(e.dead||!(e.stunT>0)) continue; const x=e.x+e.w/2-cam, y=e.y-6; for(let i=0;i<3;i++){ const a=titleT*5+i*2.1; ctx.fillStyle='#e8c25a'; ctx.fillRect(Math.round(x+Math.cos(a)*7),Math.round(y+Math.sin(a)*2),2,2); } }
}
function mech4Lights(L){ for(const t of TONEP){ const r=t.t*190, al=Math.max(0,1-t.t/1.1); for(let i=0;i<20;i++){ const a=i/20*6.283; L.push([t.x+Math.cos(a)*r,t.y+Math.sin(a)*r,36,al*0.8]); } }
  if(TDOORS.length&&player){ let n=0; for(const [tx,ty] of TDOORS){ if(Math.abs(tx*T-player.x)>260||(tx+ty)%2) continue; L.push([tx*T+8,ty*T+8,20,0.3]); if(++n>30) break; } } }
function mech4Chips(chip){ if(LVL.tone) chip(toneCd>0?'♫ ТОН · '+toneCd.toFixed(1)+' s':'♫ ТОН · E — изпей','#e8c25a'); }
TILE_HOOKS.push(function(tx,ty,ch){ if(ch==='t'){ drawBack(tx,ty); return true; } return false; });
