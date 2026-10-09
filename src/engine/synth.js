/* ================= AUDIO ================= */
let AC=null,master,sfxBus,musBus,noiseBuf,muted=false,mNext=0,mStep=0,mInt=0,bossMusic=false,mTr=0,mBpm=108,mAlien=false,droneOs=[];
function initAudio(){
  if(AC){ if(AC.state==='suspended'&&state!=='paused') AC.resume(); return; }
  try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ AC=null; return; }
  const comp=AC.createDynamicsCompressor(); comp.threshold.value=-12; comp.knee.value=10; comp.ratio.value=5; comp.attack.value=0.003; comp.release.value=0.2;
  master=AC.createGain(); master.gain.value=0.85; master.connect(comp); comp.connect(AC.destination);
  const conv=AC.createConvolver(); conv.buffer=impulse(2.4,2.8); const wet=AC.createGain(); wet.gain.value=0.3; conv.connect(wet); wet.connect(master);
  sfxBus=AC.createGain(); sfxBus.gain.value=sfxOn?0.9:0; sfxBus.connect(master); const s2=AC.createGain(); s2.gain.value=0.22; sfxBus.connect(s2); s2.connect(conv);
  musBus=AC.createGain(); musBus.gain.value=musOn?0.5:0; musBus.connect(master); const m2=AC.createGain(); m2.gain.value=0.35; musBus.connect(m2); m2.connect(conv);
  noiseBuf=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate); const d=noiseBuf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
  startDrone(); mNext=AC.currentTime+0.15; setInterval(mSched,30);
}
function impulse(sec,dec){const n=Math.floor(AC.sampleRate*sec),b=AC.createBuffer(2,n,AC.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,dec);}return b;}
function outFor(pan){ if(!pan||!AC.createStereoPanner) return sfxBus; const p=AC.createStereoPanner(); p.pan.value=pan; p.connect(sfxBus); return p; }
function osc(o){
  if(!AC) return; const t0=o.t0!==undefined?o.t0:AC.currentTime+(o.when||0), dur=o.t||0.1;
  const os=AC.createOscillator(); os.type=o.type||'square'; os.frequency.setValueAtTime(o.f,t0);
  if(o.f2) os.frequency.exponentialRampToValueAtTime(Math.max(5,o.f2),t0+dur);
  const g=AC.createGain(), at=o.at||0.003; g.gain.setValueAtTime(0.0001,t0); g.gain.linearRampToValueAtTime(Math.max(0.0002,o.v||0.2),t0+at); g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  let n=os; if(o.lp||o.bp||o.hp){const fl=AC.createBiquadFilter(); fl.type=o.lp?'lowpass':o.bp?'bandpass':'highpass'; fl.frequency.value=o.lp||o.bp||o.hp; fl.Q.value=o.q||1; os.connect(fl); n=fl;}
  n.connect(g); g.connect(o.out||sfxBus); os.start(t0); os.stop(t0+dur+0.05);
}
function nz(o){
  if(!AC) return; const t0=o.t0!==undefined?o.t0:AC.currentTime+(o.when||0), dur=o.t||0.1;
  const s=AC.createBufferSource(); s.buffer=noiseBuf; s.loop=true;
  const fl=AC.createBiquadFilter(); fl.type=o.type||'lowpass'; fl.frequency.setValueAtTime(o.f||2000,t0); if(o.f2) fl.frequency.exponentialRampToValueAtTime(o.f2,t0+dur); fl.Q.value=o.q||0.8;
  const g=AC.createGain(), at=o.at||0.002; g.gain.setValueAtTime(0.0001,t0); g.gain.linearRampToValueAtTime(Math.max(0.0002,o.v||0.2),t0+at); g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  s.connect(fl); fl.connect(g); g.connect(o.out||sfxBus); s.start(t0,Math.random()*1.5); s.stop(t0+dur+0.05);
}
const SFX={
  pistol(){ nz({t:0.13,v:0.5,type:'bandpass',f:1900,f2:350,q:0.8}); osc({type:'square',f:170,f2:45,t:0.1,v:0.35}); nz({t:0.03,v:0.3,type:'highpass',f:5000}); },
  shotgun(){ nz({t:0.38,v:0.75,f:3800,f2:180}); osc({type:'sawtooth',f:120,f2:32,t:0.22,v:0.5,lp:900}); nz({when:0.38,t:0.05,v:0.28,type:'highpass',f:2500}); nz({when:0.52,t:0.07,v:0.28,type:'bandpass',f:1600,q:3}); },
  pulse(){ osc({type:'square',f:980,f2:260,t:0.07,v:0.16}); osc({type:'sine',f:1960,f2:600,t:0.05,v:0.08}); nz({t:0.03,v:0.1,type:'highpass',f:4500}); },
  throwG(){ nz({t:0.12,v:0.15,type:'bandpass',f:700,f2:1800,q:2}); },
  swing(){ nz({t:0.14,v:0.22,type:'bandpass',f:700,f2:2200,q:2}); },
  clang(){ osc({type:'triangle',f:980,f2:640,t:0.28,v:0.25}); osc({type:'square',f:1480,t:0.07,v:0.08}); },
  empty(){ osc({type:'square',f:1300,t:0.03,v:0.15}); },
  reload(){ nz({t:0.04,v:0.25,type:'highpass',f:3000}); nz({when:0.28,t:0.05,v:0.3,type:'bandpass',f:1500,q:3}); osc({when:0.3,type:'square',f:600,t:0.03,v:0.08}); },
  jump(){ nz({t:0.07,v:0.12,f:700}); },
  land(){ nz({t:0.1,v:0.2,f:420}); osc({type:'sine',f:95,f2:50,t:0.1,v:0.2}); },
  step(){ nz({t:0.035,v:0.07,type:'bandpass',f:2200+Math.random()*900,q:4}); },
  hurt(){ osc({type:'sawtooth',f:230,f2:105,t:0.25,v:0.32,lp:900}); nz({t:0.08,v:0.2,f:1200}); },
  beep(){ osc({type:'square',f:1650,t:0.08,v:0.12}); osc({type:'square',f:1650,t:0.08,v:0.12,when:0.14}); },
  pickup(){ osc({type:'sine',f:880,t:0.12,v:0.25}); osc({type:'sine',f:1320,t:0.22,v:0.25,when:0.09}); },
  armor(){ osc({type:'triangle',f:440,f2:1760,t:0.35,v:0.2}); osc({type:'sine',f:1760,t:0.3,v:0.1,when:0.3}); },
  gunGet(){ nz({t:0.06,v:0.3,type:'highpass',f:2500}); nz({when:0.15,t:0.07,v:0.3,type:'bandpass',f:1500,q:3}); osc({when:0.25,type:'sine',f:660,t:0.2,v:0.2}); osc({when:0.35,type:'sine',f:990,t:0.25,v:0.2}); },
  menu(){ osc({type:'square',f:880,t:0.04,v:0.08}); },
  menuOk(){ osc({type:'square',f:660,t:0.06,v:0.1}); osc({type:'square',f:990,t:0.1,v:0.1,when:0.06}); },
  fall(){ osc({type:'sine',f:700,f2:70,t:0.9,v:0.22}); nz({t:0.8,v:0.12,type:'bandpass',f:1200,f2:300,q:2}); },
  elec(){ osc({type:'sawtooth',f:60,t:0.5,v:0.12,lp:500}); nz({t:0.4,v:0.08,type:'bandpass',f:3200,q:3}); },
  zapS(){ nz({t:0.07,v:0.16,type:'highpass',f:3000}); osc({type:'square',f:rnd(200,900),t:0.05,v:0.08}); },
  laser(a,o){ osc({type:'sawtooth',f:1800,f2:900,t:0.15,v:0.08*a,bp:2000,q:3,out:o}); },
  steam(a,o){ nz({t:1.1,v:0.28*a,type:'highpass',f:2500,at:0.05,out:o}); nz({t:0.9,v:0.12*a,type:'bandpass',f:900,q:1,out:o}); },
  boing(){ osc({type:'sine',f:180,f2:720,t:0.25,v:0.22}); osc({type:'triangle',f:360,f2:1100,t:0.2,v:0.1,when:0.03}); },
  spit(a,o){ nz({t:0.25,v:0.3*a,type:'bandpass',f:900,f2:300,q:2,out:o}); osc({type:'sawtooth',f:200,f2:90,t:0.25,v:0.15*a,lp:800,out:o}); },
  hornet(a,o){ osc({type:'sawtooth',f:900,f2:1400,t:0.12,v:0.1*a,bp:1600,q:4,out:o}); },
  deflect(a,o){ osc({type:'triangle',f:1400,f2:2200,t:0.18,v:0.15*a,out:o}); osc({type:'sine',f:700,t:0.25,v:0.08*a,out:o}); },
  zgroan(a,o){ osc({type:'sawtooth',f:105,f2:78,t:0.8,v:0.16*a,lp:600,out:o}); osc({type:'sawtooth',f:111,f2:74,t:0.8,v:0.12*a,lp:500,out:o}); },
  swingZ(a,o){ nz({t:0.15,v:0.2*a,type:'bandpass',f:600,f2:1500,q:2,out:o}); },
  birth(a,o){ nz({t:0.3,v:0.3*a,type:'bandpass',f:500,f2:200,q:2,out:o}); osc({type:'sine',f:220,f2:70,t:0.3,v:0.2*a,out:o}); },
  horn(){ for(const w of [0,0.7]){ osc({when:w,type:'sawtooth',f:311,t:0.55,v:0.12,lp:1400,at:0.03}); osc({when:w,type:'sawtooth',f:370,t:0.55,v:0.1,lp:1400,at:0.03}); } },
  train(){ nz({t:2.6,v:0.45,f:500,f2:150,at:0.6}); osc({type:'square',f:42,t:2.4,v:0.08,lp:200,at:0.5}); for(let i=0;i<16;i++) nz({when:0.3+i*0.12,t:0.04,v:0.12,type:'bandpass',f:1800,q:3}); },
  rocket(a=1,o){ nz({t:0.6,v:0.35*a,type:'bandpass',f:600,f2:2400,q:1,out:o}); osc({type:'sawtooth',f:90,f2:50,t:0.3,v:0.25*a,lp:600,out:o}); },
  chop(a,o){ nz({t:0.06,v:0.22*a,f:260,out:o}); },
  crabIdle(a,o){ osc({type:'square',f:480+Math.random()*120,f2:720,t:0.12,v:0.06*a,bp:1400,q:3,out:o}); },
  crabLeap(a,o){ osc({type:'sawtooth',f:850,f2:1900,t:0.2,v:0.22*a,bp:1500,q:3,out:o}); nz({t:0.15,v:0.1*a,type:'highpass',f:4000,out:o}); },
  crabDie(a,o){ osc({type:'sawtooth',f:1500,f2:180,t:0.32,v:0.2*a,bp:1200,q:2,out:o}); nz({t:0.2,v:0.25*a,f:900,out:o}); },
  flyer(a,o){ osc({type:'sawtooth',f:1200,f2:2600,t:0.18,v:0.14*a,bp:2000,q:3,out:o}); osc({when:0.15,type:'sawtooth',f:1900,f2:900,t:0.2,v:0.1*a,bp:1600,q:3,out:o}); },
  turret(a,o){ osc({type:'square',f:1400,t:0.06,v:0.1*a,out:o}); osc({type:'square',f:1400,t:0.06,v:0.1*a,when:0.1,out:o}); osc({type:'square',f:1900,t:0.1,v:0.1*a,when:0.2,out:o}); },
  growl(a,o){ osc({type:'sawtooth',f:140,f2:95,t:0.6,v:0.22*a,lp:700,out:o}); osc({type:'sawtooth',f:146,f2:90,t:0.6,v:0.18*a,lp:700,out:o}); },
  charge(a,o){ osc({type:'sine',f:180,f2:1300,t:0.85,v:0.16*a,out:o}); osc({type:'square',f:60,f2:240,t:0.85,v:0.05*a,lp:800,out:o}); nz({t:0.85,v:0.07*a,type:'bandpass',f:2500,f2:7000,q:6,out:o}); },
  zap(a,o){ nz({t:0.32,v:0.55*a,type:'bandpass',f:4200,f2:700,q:1,out:o}); osc({type:'sawtooth',f:1900,f2:70,t:0.3,v:0.3*a,out:o}); for(let i=0;i<4;i++) osc({when:i*0.045,type:'square',f:rnd(300,2400),t:0.03,v:0.12*a,out:o}); },
  alienPain(a,o){ osc({type:'sawtooth',f:320,f2:170,t:0.3,v:0.24*a,lp:1300,out:o}); },
  alienDie(a,o){ osc({type:'sawtooth',f:260,f2:60,t:0.8,v:0.28*a,lp:1100,out:o}); osc({type:'sawtooth',f:270,f2:58,t:0.8,v:0.2*a,lp:1100,out:o}); },
  soldierShot(a,o){ nz({t:0.08,v:0.38*a,type:'bandpass',f:2300,f2:550,q:0.9,out:o}); osc({type:'square',f:210,f2:60,t:0.05,v:0.16*a,out:o}); },
  radio(a,o){ nz({t:0.3,v:0.14*a,type:'bandpass',f:1800,q:7,out:o}); osc({type:'square',f:1250,t:0.05,v:0.1*a,when:0.31,out:o}); osc({type:'sawtooth',f:180,f2:140,t:0.28,v:0.06*a,bp:900,q:4,out:o}); },
  humanDie(a,o){ osc({type:'sawtooth',f:300,f2:120,t:0.5,v:0.22*a,bp:900,q:2,out:o}); },
  scream(a,o){ osc({type:'sawtooth',f:620,f2:950,t:0.25,v:0.18*a,bp:1300,q:2,out:o}); osc({when:0.25,type:'sawtooth',f:950,f2:380,t:0.45,v:0.18*a,bp:1100,q:2,out:o}); },
  bounce(a,o){ osc({type:'triangle',f:1750,t:0.05,v:0.15*a,out:o}); },
  boom(a,o){ nz({t:1.3,v:0.95*a,f:2200,f2:55,q:0.5,out:o}); osc({type:'sine',f:85,f2:24,t:0.9,v:0.65*a,out:o}); nz({t:0.06,v:0.5*a,type:'highpass',f:2000,out:o}); },
  smallBoom(a,o){ nz({t:0.5,v:0.5*a,f:2600,f2:200,out:o}); osc({type:'sine',f:120,f2:40,t:0.35,v:0.35*a,out:o}); },
  portal(a,o){ osc({type:'sine',f:90,f2:2100,t:0.6,v:0.22*a,out:o}); nz({t:0.8,v:0.22*a,type:'bandpass',f:300,f2:5500,q:3,out:o}); osc({type:'triangle',f:2100,f2:140,t:0.5,v:0.14*a,when:0.5,out:o}); },
  door(){ nz({t:0.8,v:0.25,type:'bandpass',f:900,f2:260,q:1}); osc({type:'sawtooth',f:55,t:0.8,v:0.12,lp:220}); osc({type:'square',f:440,t:0.12,v:0.1,when:0.75}); osc({type:'square',f:660,t:0.15,v:0.1,when:0.88}); },
  sizzle(){ nz({t:0.16,v:0.12,type:'highpass',f:3200}); },
  roar(a,o){ osc({type:'sawtooth',f:95,f2:42,t:1.3,v:0.5*a,lp:650,out:o}); osc({type:'sawtooth',f:99,f2:44,t:1.3,v:0.4*a,lp:650,out:o}); nz({t:1.1,v:0.35*a,f:500,out:o}); },
  warden(a,o){ osc({type:'sine',f:58,f2:38,t:1.8,v:0.55*a,out:o}); osc({type:'sawtooth',f:116,f2:72,t:1.5,v:0.3*a,lp:520,out:o}); osc({type:'triangle',f:233,f2:349,t:1.3,v:0.12*a,out:o}); nz({t:1.4,v:0.2*a,type:'bandpass',f:300,f2:1200,q:3,out:o}); },
  stomp(a,o){ osc({type:'sine',f:65,f2:24,t:0.6,v:0.8*a,out:o}); nz({t:0.5,v:0.5*a,f:350,f2:60,out:o}); },
  orb(a,o){ osc({type:'sine',f:320,f2:110,t:0.5,v:0.22*a,out:o}); nz({t:0.5,v:0.12*a,type:'bandpass',f:900,f2:300,q:4,out:o}); },
  cascade(){ nz({t:2.5,v:0.9,f:4000,f2:60,q:0.4}); osc({type:'sine',f:40,f2:20,t:2.5,v:0.7}); osc({type:'sawtooth',f:2400,f2:60,t:1.6,v:0.2,lp:3000}); osc({type:'sine',f:110,f2:3000,t:1.2,v:0.15,when:0.2}); },
  alarm(dur=4){ if(!AC) return; const t0=AC.currentTime+0.05, o=AC.createOscillator(), g=AC.createGain(), lp=AC.createBiquadFilter(); o.type='square'; lp.type='lowpass'; lp.frequency.value=1600;
    for(let i=0;i<dur;i++){ o.frequency.setValueAtTime(520,t0+i); o.frequency.linearRampToValueAtTime(860,t0+i+0.5); o.frequency.linearRampToValueAtTime(520,t0+i+1); }
    g.gain.setValueAtTime(0.0001,t0); g.gain.linearRampToValueAtTime(0.09,t0+0.1); g.gain.setValueAtTime(0.09,t0+dur-0.4); g.gain.linearRampToValueAtTime(0.0001,t0+dur);
    o.connect(lp); lp.connect(g); g.connect(sfxBus); o.start(t0); o.stop(t0+dur+0.1); },
  engine(a,o){ osc({type:'sawtooth',f:46,f2:64,t:1.3,v:0.32*a,lp:320,out:o}); nz({t:1.2,v:0.28*a,f:320,f2:160,out:o}); for(let i=0;i<6;i++) nz({when:i*0.14,t:0.05,v:0.12*a,type:'bandpass',f:900,q:3,out:o}); },
  screech(a,o){ osc({type:'sawtooth',f:1700,f2:3300,t:0.25,v:0.2*a,bp:2400,q:3,out:o}); osc({when:0.2,type:'sawtooth',f:3100,f2:1100,t:0.45,v:0.16*a,bp:2000,q:3,out:o}); nz({t:0.5,v:0.1*a,type:'highpass',f:4000,out:o}); },
  win(){ [50,57,62,65,69,74].forEach((m,i)=>osc({type:'triangle',f:mtof(m+mTr),t:1.8-i*0.15,v:0.12,when:i*0.12})); },
};
function sfxAt(name,e){
  if(!AC||!player) return; const ex=e.x+(e.w||0)/2, d=Math.abs(ex-(player.x+5))+Math.abs((e.y||0)-player.y)*0.5;
  const a=clamp(1-d/560,0,1); if(a<0.04) return; SFX[name](a,outFor(clamp((ex-player.x)/320,-0.8,0.8)));
}
const mtof=m=>440*Math.pow(2,(m-69)/12);
function startDrone(){
  const g=AC.createGain(); g.gain.value=0.1; const lp=AC.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=150; lp.Q.value=4;
  const lfo=AC.createOscillator(); lfo.frequency.value=0.07; const lg=AC.createGain(); lg.gain.value=70; lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
  [36.71,36.95,55].forEach(f=>{const o=AC.createOscillator(); o.type='sawtooth'; o.frequency.value=f*Math.pow(2,mTr/12); o.connect(lp); o.start(); droneOs.push([o,f]);});
  lp.connect(g); g.connect(musBus);
}
function setMusic(m){ mTr=m.tr; mBpm=m.bpm; mAlien=!!m.alien; if(AC) for(const [o,f] of droneOs) o.frequency.setTargetAtTime(f*Math.pow(2,mTr/12),AC.currentTime,0.6); }
const PROG=[{b:38,ch:[62,65,69]},{b:34,ch:[58,62,65]},{b:36,ch:[60,64,67]},{b:33,ch:[57,61,64]}];
const BASSPAT=[0,null,0,12,null,0,7,null,0,null,12,0,null,10,null,7];
function kick(t){ osc({t0:t,type:'sine',f:140,f2:38,t:0.28,v:0.75,out:musBus}); nz({t0:t,t:0.02,v:0.15,type:'highpass',f:3000,out:musBus}); }
function snare(t){ nz({t0:t,t:0.18,v:0.32,type:'bandpass',f:1900,q:0.7,out:musBus}); osc({t0:t,type:'triangle',f:200,f2:150,t:0.09,v:0.18,out:musBus}); }
function hat(t,v){ nz({t0:t,t:0.04,v,type:'highpass',f:7000,out:musBus}); }
function clank(t,v=0.15){ osc({t0:t,type:'square',f:523,t:0.35,v,bp:1400,q:8,out:musBus}); osc({t0:t,type:'square',f:747,t:0.3,v:v*0.8,bp:2100,q:8,out:musBus}); }
function bass(f,t,d,v,cut){ osc({t0:t,type:'sawtooth',f,t:d,v,lp:cut,q:6,out:musBus}); osc({t0:t,type:'square',f:f/2,t:d,v:v*0.4,lp:300,out:musBus}); }
function pad(f,t,d,v){ const g=AC.createGain(); g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(v,t+0.8); g.gain.setValueAtTime(v,t+d-0.6); g.gain.linearRampToValueAtTime(0.0001,t+d+0.4);
  const lp=AC.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=mAlien?1300:850; lp.connect(g); g.connect(musBus);
  [-9,9].forEach(det=>{const o=AC.createOscillator(); o.type=mAlien?'triangle':'sawtooth'; o.frequency.value=f; o.detune.value=det; o.connect(lp); o.start(t); o.stop(t+d+0.5);}); }
function bell(f,t){ osc({t0:t,type:'sine',f,t:1.6,v:0.06,out:musBus}); osc({t0:t,type:'sine',f:f*2.76,t:0.6,v:0.02,out:musBus}); }
function arp(f,t,d){ osc({t0:t,type:mAlien?'triangle':'square',f,t:d,v:mAlien?0.06:0.045,lp:2200,out:musBus}); }
function mSched(){
  if(!AC||AC.state!=='running'||!musOn) return;
  if(mNext<AC.currentTime) mNext=AC.currentTime+0.05;
  while(mNext<AC.currentTime+0.15){ const spb=60/(bossMusic?132:mBpm)/4; mPlay(mStep,mNext,spb); mNext+=spb; mStep=(mStep+1)%64; }
}
function mPlay(s,t,spb){
  const bar=Math.floor(s/16)%4, st=s%16, P=(GAME.prog||PROG)[bar], I=mInt, tr=mTr;
  if(st===0) for(const n of P.ch) pad(mtof(n+tr),t,spb*16,I>0?0.035:0.045);
  const off=BASSPAT[st];
  if(I===0){ if(st%8===0) bass(mtof(P.b+tr),t,spb*6,0.16,480); }
  else if(off!==null) bass(mtof(P.b+tr+off),t,spb*1.8,0.24,I>1?1700:1100);
  if(I>=1){
    if(I>1?st%4===0:(st===0||st===7||st===10)) kick(t);
    if(st===4||st===12) snare(t);
    if(st%2===0) hat(t,st%4===2?0.06:0.035);
    if(I>1&&st%2===1) hat(t,0.025);
    if(st===14&&bar%2===1&&!mAlien) clank(t);
    if((bar>=2||mAlien)&&st%2===0) arp(mtof(P.ch[(st/2)%3]+12+tr),t,spb*1.5);
  } else {
    if(st===0&&bar===0&&!mAlien) clank(t,0.1);
    if(st%4===0&&Math.random()<(mAlien?0.4:0.16)) bell(mtof([74,77,81,72,69][Math.floor(Math.random()*5)]+tr),t);
    if(mAlien&&st%4===2&&Math.random()<0.3) arp(mtof(P.ch[Math.floor(Math.random()*3)]+24+tr),t,spb*3);
  }
}

