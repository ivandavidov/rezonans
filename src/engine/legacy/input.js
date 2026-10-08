/* ================= INPUT ================= */
const keys={}, pressed={};
const CODES={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',KeyZ:'fire',KeyX:'jump',KeyC:'crouch',KeyQ:'swap',Digit1:'w1',Digit2:'w2',Digit3:'w3',Digit4:'w4',Digit5:'w5',Digit6:'w6',KeyM:'mute',KeyN:'music',KeyB:'sfx',KeyE:'era',KeyP:'pause',Escape:'esc',Enter:'enter',Space:'enter'};
addEventListener('keydown',e=>{ const k=CODES[e.code]; if(!k) return; e.preventDefault(); initAudio(); if(!keys[k]) pressed[k]=true; keys[k]=true; if(!e.repeat){ if(k==='mute') toggleMute(); else if(k==='music') toggleMus(); else if(k==='sfx') toggleSfx(); } });
addEventListener('keyup',e=>{ const k=CODES[e.code]; if(!k) return; keys[k]=false; });
addEventListener('blur',()=>{ for(const k in keys) keys[k]=false; if(state==='play'){ state='paused'; if(AC) AC.suspend(); } });
cv.addEventListener('pointerdown',()=>{ initAudio(); cv.focus(); if(state==='title') pressed.enter=true; });
document.querySelectorAll('#touch button[data-k]').forEach(b=>{
  const k=b.dataset.k; const on=e=>{e.preventDefault(); initAudio(); if(!keys[k]) pressed[k]=true; keys[k]=true; b.classList.add('on');};
  const off=e=>{e.preventDefault(); keys[k]=false; b.classList.remove('on');};
  b.addEventListener('pointerdown',on); b.addEventListener('pointerup',off); b.addEventListener('pointercancel',off); b.addEventListener('pointerleave',off);
});

