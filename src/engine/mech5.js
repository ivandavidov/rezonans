/* ================= ДВИГАТЕЛ · МЕХАНИКИ V =================
   Курсори (LVL.cursors): мигащи станции в нивото; E до тях изпълнява команда.
     ['POKE', tx,row,{set:[[x0,y0,x1,y1,ch],…], label, msg}]  — пренаписва плочки (еднократно)
     ['PEEK', tx,row,{r:14, msg}]                              — разкрива скритите проходи 'h' наоколо
     ['GOTO', tx,row,{to:[tx,row], label}]                     — телепорт (многократно)
     ['BREAK',tx,row,{r:14, t:4, cd:6}]                        — замразява враговете наоколо (e.stunT)
     ['RUN',  tx,row,{fn, cd}]                                 — действие на конкретното ниво
   row е редът, на който стои играчът (като при spawns). Босовете могат да реагират с onCmd(курсор)
   и да добавят свои курсори с addCursor(...).
   Касета (LVL.tape={x0, speed, delay, label, doneMsg}): нивото се „зарежда“ отляво надясно — колоните зад границата са празни. */
let CURS=[], TAPE=null;
function addCursor(cmd,tx,row,o={}){ const c={cmd,tx,row,o,done:false,cd:0,flash:0}; CURS.push(c); return c; }
function mech5Load(){ CURS=[]; TAPE=null; if(!LVL) return; for(const [cmd,tx,row,o] of (LVL.cursors||[])) addCursor(cmd,tx,row,Object.assign({},o||{}));
  if(LVL.tape) tapeInit(LVL.tape); }
function mech5Respawn(){ for(const c of CURS) c.cd=0; }
function curNear(c){ const p=player; if(!p||p.dead) return false; return Math.abs(p.x+p.w/2-(c.tx*T+8))<15&&Math.abs(p.y+p.h-(c.row+1)*T)<22; }
function mech5Near(){ return CURS.some(c=>!c.done&&c.cd<=0&&curNear(c)); }
function pokeTiles(rects){
  const one=()=>{ for(const [x0,y0,x1,y1,ch] of rects){ for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++) if(map[y]&&x>=0&&x<COLS) map[y][x]=ch; redrawCols(Math.max(0,x0),Math.min(COLS-1,x1)); } };
  if(!ERAD){ one(); return; }
  const saveMap=map, saveLV=LV, th=LVL.theme;
  for(let e=0;e<2;e++){ map=ERAD.maps[e]; LV=ERAD.cv[e]; lx=LV.getContext('2d'); LVL.theme=ERAD.themes[e]; one(); }
  map=saveMap; LV=saveLV; lx=LV.getContext('2d'); LVL.theme=th; }
function cursorBeep(ok){ if(!AC) return; if(ok){ osc({type:'square',f:880,t:0.06,v:0.06}); osc({type:'square',f:1320,t:0.08,v:0.06,when:0.07}); } else osc({type:'square',f:220,t:0.15,v:0.06}); }
function runCursor(c){
  const p=player, o=c.o, cx=c.tx*T+8, fy=(c.row+1)*T; c.flash=1;
  for(let i=0;i<14;i++) part(cx,fy-8,rnd(-60,60),rnd(-90,-10),0.5,o.col||ACC(),1.5,0);
  if(c.cmd==='POKE'){ pokeTiles(o.set||[]); c.done=!o.repeat; shake=3; if(o.set) for(const [x0,y0,x1,y1] of o.set) for(let i=0;i<10;i++) part(rnd(x0*T,(x1+1)*T),rnd(y0*T,(y1+1)*T),rnd(-30,30),rnd(-30,30),0.5,o.col||ACC(),1.5,0); }
  else if(c.cmd==='PEEK'){ const r=(o.r||14)*T; let n=0; for(let tx=Math.max(0,c.tx-(o.r||14));tx<=Math.min(COLS-1,c.tx+(o.r||14));tx++) for(let ty=0;ty<ROWS;ty++) if(map[ty][tx]==='h'&&Math.hypot(tx*T+8-cx,ty*T+8-fy)<r){ HREV[tx+','+ty]=lvT; n++; } c.done=!o.repeat; if(!o.msg) showMsg(n?'Паметта показва скрит проход.':'Тук няма нищо скрито.',2); }
  else if(c.cmd==='GOTO'){ const [tx,row]=o.to; for(let i=0;i<16;i++) part(p.x+5,p.y+13,rnd(-80,80),rnd(-80,80),0.5,o.col||ACC(),2,0); p.x=tx*T+3; p.y=(row+1)*T-p.h-0.01; p.vx=0; p.vy=0; c.cd=0.6; for(let i=0;i<16;i++) part(p.x+5,p.y+13,rnd(-80,80),rnd(-80,80),0.5,o.col||ACC(),2,0); }
  else if(c.cmd==='BREAK'){ const r=(o.r||14)*T; for(const e of enemies){ if(e.dead) continue; if(Math.hypot(e.x+e.w/2-cx,e.y+e.h/2-fy)<r){ e.stunT=Math.max(e.stunT||0,o.t||4); e.alert=true; } } c.cd=o.cd||6; flash=0.3; flashCol=o.col||ACC(); }
  else if(c.cmd==='RUN'){ c.cd=o.cd||1; if(o.once) c.done=true; }
  if(o.fn) o.fn(c);
  if(o.msg) showMsg(o.msg,2);
  if(boss&&!boss.dead&&(BOSSES[boss.type]||{}).onCmd) BOSSES[boss.type].onCmd(c);
  cursorBeep(true);
}
function mech5Update(dt){
  const p=player; if(!p) return;
  for(const c of CURS){ c.cd=Math.max(0,c.cd-dt); c.flash=Math.max(0,c.flash-dt*2); }
  if(pressed.era&&!p.dead){ const c=CURS.find(c=>!c.done&&curNear(c)); if(c){ pressed.era=false; if(c.cd>0){ cursorBeep(false); showMsg('Курсорът още мига… изчакай '+c.cd.toFixed(1)+' s.',1); } else runCursor(c); } }
  if(TAPE) tapeUpdate(dt);
}
/* ---------- касетата ---------- */
function tapeInit(t){ const x0=t.x0||12; TAPE={x:x0,next:x0+1,speed:t.speed||4.5,t:-(t.delay==null?1.2:t.delay),cols:{},done:false,label:t.label||'ЗАРЕЖДАНЕ',doneMsg:t.doneMsg||'ЗАРЕЖДАНЕТО ЗАВЪРШИ.'};
  for(let tx=x0+1;tx<COLS;tx++){ TAPE.cols[tx]=map.map(r=>r[tx]); for(let ty=0;ty<ROWS;ty++) map[ty][tx]='.'; }
  redrawCols(x0+1,COLS-1); }
function tapeUpdate(dt){ const tp=TAPE; if(tp.done) return; tp.t+=dt;
  for(const e of enemies) if(!e.dead&&e.x>tp.x*T-4) e.stunT=Math.max(e.stunT||0,0.05);   // незаредените врагове чакат
  if(tp.t<0) return;
  tp.x+=tp.speed*dt; let c0=tp.next;
  while(tp.next<=Math.min(COLS-1,Math.floor(tp.x))){ const col=tp.cols[tp.next]; if(col) for(let ty=0;ty<ROWS;ty++) map[ty][tp.next]=col[ty]; tp.next++; }
  if(tp.next>c0) redrawCols(c0,tp.next-1);
  if(tp.next>=COLS){ tp.done=true; showMsg(tp.doneMsg,1.5); }
  if(AC&&Math.random()<dt*14) osc({type:'square',f:Math.random()<0.5?1200:2400,t:0.03,v:0.015}); }
/* ---------- рисуване ---------- */
function mech5DrawWorld(){
  for(const c of CURS){ const x=Math.round(c.tx*T+8-cam), fy=(c.row+1)*T; if(x<-40||x>W+40) continue; const col=c.o.col||ACC(), on=!c.done&&c.cd<=0, blink=Math.floor(titleT*2.5)%2;
    ctx.fillStyle='#14161c'; ctx.fillRect(x-7,fy-18,14,18); ctx.fillStyle='#2a2e38'; ctx.fillRect(x-7,fy-18,14,1);
    ctx.fillStyle=c.done?'#3a3e46':on?(blink?col:'#0a0c10'):'#5a4a2a'; ctx.fillRect(x-4,fy-15,8,10);
    if(c.flash>0){ ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=c.flash; ctx.fillStyle=col; ctx.fillRect(x-12,fy-24,24,24); ctx.restore(); }
    ctx.font='600 6px "IBM Plex Mono",monospace'; ctx.textAlign='center'; ctx.fillStyle=c.done?'#6a6e76':col; ctx.fillText(c.done?'OK':(c.o.label||c.cmd),x,fy-22);
    if(on&&curNear(c)&&blink){ ctx.fillStyle='#ffffff'; ctx.fillText('E — '+c.cmd,x,fy-31); } ctx.textAlign='left'; }
  if(TAPE&&!TAPE.done){ const x0=Math.max(0,Math.round(TAPE.x*T-cam)); if(x0<W){ const cols=['#d84a4a','#4ad8d8','#d8d84a','#4a4ad8','#d84ad8','#4ad84a'];
    for(let y=0;y<ROWS*T;y+=4){ const k=Math.floor(y/4+titleT*30)%cols.length; ctx.fillStyle=cols[(k+Math.floor(hash(y,Math.floor(titleT*20))*2))%cols.length]; ctx.fillRect(x0,y,W-x0,4); }
    ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.fillRect(x0,0,W-x0,ROWS*T); ctx.fillStyle='#ffffff'; ctx.fillRect(x0,0,2,ROWS*T); } }
}
function mech5Lights(L){ for(const c of CURS) if(!c.done) L.push([c.tx*T+8,(c.row+1)*T-10,26,0.5]); if(TAPE&&!TAPE.done) L.push([TAPE.x*T,8*T,90,0.6]); }
function mech5Chips(chip){ if(TAPE&&!TAPE.done) chip('▶ '+TAPE.label+' · '+Math.min(99,Math.floor(TAPE.x/COLS*100))+'%','#ffd84a');
  const c=CURS.find(c=>!c.done&&curNear(c)); if(c) chip('▌ '+c.cmd+(c.cd>0?' · '+c.cd.toFixed(1)+' s':' · E — изпълни'),'#9aff8a'); }
