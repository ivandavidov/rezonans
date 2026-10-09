/* ================= TRAINING COURSE ================= */
let TRN=null;
const trHint=t=>{ if(TRN) TRN.hint=t; };
function finishTraining(){ const fm=TRN&&TRN.fromMenu; TRN=null; msg=null;
  if(fm) toMenu(1);
  else { totals={time:0,shots:0,hits:0,kills:0,deaths:0}; startEpisode(0,false); } }
function updTarget(e,dt){ e.alert=false; e.anim+=dt; }
function drawTarget(e){
  begin(e,false); tint=e.hitT>0?'#fff':null;
  if(e.dead){ px(-9,-3,18,3,'#c9302a'); px(-6,-3,4,3,'#e9eef0'); px(2,-3,4,3,'#e9eef0'); px(-1,-3,2,3,'#c9302a'); px(-4,-1,8,1,'#3a4046'); tint=null; ctx.restore(); return; }
  if(solidAt(e.x+e.w/2,e.y+e.h+2)){ px(-5,-2,10,2,'#3a4046'); px(-1,-11,2,9,'#5a6168'); }
  else { px(-1,-e.y-e.h+2*T,1,e.y+e.h-2*T-20,'#7d8992'); px(-3,-24,6,2,'#5a6168'); px(-1,-11,2,6,'#5a6168'); }
  const rc=[[7,'#e9eef0'],[5,'#c9302a'],[3,'#e9eef0'],[1.5,'#c9302a']];
  for(const [r,c] of rc){ ctx.fillStyle=tint||c; ctx.beginPath(); ctx.arc(0,-16,r,0,Math.PI*2); ctx.fill(); }
  tint=null; ctx.restore();
}
function drawKeyHint(t,y){
  ctx.save(); ctx.font='600 8px "IBM Plex Mono",monospace'; ctx.textBaseline='middle';
  const parts=t.split(/(\[[^\]]+\])/).filter(Boolean), ws=parts.map(q=>q[0]==='['?ctx.measureText(q.slice(1,-1)).width+8:ctx.measureText(q).width);
  const tot=ws.reduce((a,b)=>a+b,0); let x=Math.round(W/2-tot/2);
  ctx.fillStyle='rgba(6,8,10,0.72)'; ctx.fillRect(x-8,y-9,tot+16,18); ctx.fillStyle=GAME.hintCols[1]; ctx.fillRect(x-8,y-9,2,18);
  parts.forEach((q,i)=>{ if(q[0]==='['){ const w=ws[i]; ctx.fillStyle='#2b3238'; ctx.fillRect(x,y-6,w-2,13); ctx.fillStyle=ACC(); ctx.fillRect(x,y+5,w-2,2); ctx.strokeStyle=ACC(); ctx.lineWidth=1; ctx.strokeRect(x+0.5,y-5.5,w-3,12); ctx.fillStyle=GAME.hintCols[0]; ctx.fillText(q.slice(1,-1),x+3,y+0.5); }
    else { ctx.fillStyle='#e6edf0'; ctx.fillText(q,x,y+0.5); } x+=ws[i]; });
  ctx.restore();
}

// кутията за съобщения (msg): st — видът (MSG_STD — HUD на продълженията, MSG_CLASSIC — HUD на r1, MSG_INTRO — интрата);
// говорещият е с цвета си от GAME.voices, иначе — с цвета на вида; без говорещ чертата е st.none (или акцентът на частта)
const MSG_STD={bg:'rgba(4,14,18,0.82)',text:'#eaf6f6',voice:'#7fd8ff',right:1}, MSG_CLASSIC={bg:'rgba(6,8,10,0.78)',text:'#f3e6cf',voice:'#94ff57'},
  MSG_INTRO={bg:'rgba(6,8,10,0.8)',text:'#f3e6cf',voice:'#7fd8ff',none:'#ffa62b'};
function drawMsgBox(y,st=MSG_INTRO){
  if(!msg) return; const a=clamp(Math.min(msg.age*4,(msg.d-msg.age)*2),0,1); ctx.globalAlpha=a; ctx.font='600 9px "IBM Plex Mono",monospace';
  const lines=wrap(msg.t,360), lw=Math.max(...lines.map(l=>ctx.measureText(l).width)), who=msg.who, w=lw+20, h=lines.length*12+6+(who?10:0), x=W/2-w/2;
  const wc=(GAME.voices||{})[who]||st.voice; ctx.fillStyle=st.bg; ctx.fillRect(x,y,w,h); ctx.fillStyle=who?wc:st.none||ACC(); ctx.fillRect(x,y,2,h); if(st.right) ctx.fillRect(x+w-2,y,2,h);
  let ly=y+11; if(who){ ctx.font='600 7px "IBM Plex Mono",monospace'; ctx.fillStyle=wc; ctx.fillText('◉ '+who,x+10,ly-1); ly+=10; ctx.font='600 9px "IBM Plex Mono",monospace'; }
  ctx.fillStyle=st.text; for(const l of lines){ ctx.fillText(l,x+10,ly); ly+=12; } ctx.globalAlpha=1;
}

