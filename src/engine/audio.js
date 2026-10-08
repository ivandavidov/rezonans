/* ================= ДВИГАТЕЛ · ЗВУК: музика и ефекти поотделно =================
   M — целият звук: ако свири каквото и да е, спира всичко; ако всичко е спряно, пуска всичко.
   N — само музиката, B — само ефектите. На тъч екран — бутоните в горните ъгли на кръстачката.
   Изборът е общ за цялата поредица ('rz.audio'); по подразбиране всичко е спряно (M пуска и двете). */
let musOn=false, sfxOn=false, audT=-9;
{ const v=store.get('rz.audio',''); if(/^[01]{2}$/.test(v)){ musOn=v[0]==='1'; sfxOn=v[1]==='1'; } }
function audApply(){
  muted=!musOn&&!sfxOn;
  for(const [id,on] of [['bmus',musOn],['bsfx',sfxOn]]){ const b=document.getElementById(id); if(b) b.classList.toggle('off',!on); }
  if(!AC) return; const t=AC.currentTime;
  musBus.gain.setTargetAtTime(musOn?0.5:0,t,0.05); sfxBus.gain.setTargetAtTime(sfxOn?0.9:0,t,0.03);
}
function audSet(m,s){ musOn=m; sfxOn=s; store.set('rz.audio',(m?'1':'0')+(s?'1':'0')); audT=titleT; audApply(); }
function toggleMute(){ if(musOn||sfxOn) audSet(false,false); else audSet(true,true); }
const toggleMus=()=>audSet(!musOn,sfxOn), toggleSfx=()=>audSet(musOn,!sfxOn);
const audTxt=()=>'музика: '+(musOn?'вкл.':'изкл.')+' (N) · ефекти: '+(sfxOn?'вкл.':'изкл.')+' (B) · всичко (M)';
/* кратко съобщение след превключване — над всички екрани; в игра е долу, за да не закрива радиото */
function audDraw(){
  const a=titleT-audT; if(a<0||a>1.8) return;
  ctx.setTransform(S,0,0,S,0,0); ctx.globalAlpha=Math.min(1,(1.8-a)*3);
  const tx=(musOn?'МУЗИКА ВКЛ.':'МУЗИКА ИЗКЛ.')+'   ·   '+(sfxOn?'ЕФЕКТИ ВКЛ.':'ЕФЕКТИ ИЗКЛ.');
  const y=['play','paused','dead','levelEnd'].includes(state)?H-52:14;
  ctx.font='600 8px "IBM Plex Mono",monospace'; const w=ctx.measureText(tx).width+16;
  ctx.fillStyle='rgba(4,6,8,0.85)'; ctx.fillRect(Math.round(W/2-w/2),y,Math.round(w),15); ctx.fillStyle=ACCA(0.8); ctx.fillRect(Math.round(W/2-w/2),y,2,15);
  centerText(tx,y+10,'600 8px "IBM Plex Mono",monospace','#e8edf0'); ctx.globalAlpha=1;
}
function audPauseLine(){ centerText(audTxt(),166,'600 7px "IBM Plex Mono",monospace','#7f8e97'); }
document.querySelectorAll('#touch button[data-a]').forEach(b=>b.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); initAudio(); b.dataset.a==='mus'?toggleMus():toggleSfx(); }));
audApply();
