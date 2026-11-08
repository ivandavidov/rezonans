// Звукът: собствен синтезатор с WebAudio — без файлове. Шини музика/ефекти, компресор, реверб с
// генериран импулс; музиката е секвенсор с пасажи и слоеве (спокойно → напрегнато), тактът се дава навън.
(function () {
'use strict';
const S = window.SPACE, M = S.M;
const AU = S.AU = { ok: false, music: true, vm: 0.8, vs: 0.9, level: 0, want: 1 };
let ac, master, mus, sfx, rev, noise, delay, last = {}, voices = 0;
const mf = m => 440 * Math.pow(2, (m - 69) / 12);
const rnd = Math.random;

AU.init = function () {
  if (ac) { if (ac.state !== 'running') ac.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  ac = new AC({ latencyHint: 'interactive' });
  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.22;
  master = ac.createGain(); master.gain.value = 0.9; master.connect(comp); comp.connect(ac.destination);
  mus = ac.createGain(); mus.gain.value = AU.music ? AU.vm * 0.55 : 0; mus.connect(master);
  sfx = ac.createGain(); sfx.gain.value = AU.vs; sfx.connect(master);
  // реверб: стерео шум с експоненциално затихване
  rev = ac.createConvolver();
  const len = Math.floor(ac.sampleRate * 2.8), ir = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (rnd() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
  rev.buffer = ir; const rg = ac.createGain(); rg.gain.value = 0.32; rev.connect(rg); rg.connect(master);
  // ехо за арпеджиото
  delay = ac.createDelay(1); delay.delayTime.value = 60 / 112 * 0.75; const fb = ac.createGain(); fb.gain.value = 0.33;
  const dl = ac.createBiquadFilter(); dl.type = 'lowpass'; dl.frequency.value = 2600;
  delay.connect(dl); dl.connect(fb); fb.connect(delay); dl.connect(mus); dl.connect(rev);
  noise = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
  const nd = noise.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = rnd() * 2 - 1;
  AU.ok = true;
};
AU.setMusic = on => { AU.music = on; if (mus) mus.gain.setTargetAtTime(on ? AU.vm * 0.55 : 0, ac.currentTime, 0.2); };
AU.setVol = (vm, vs) => { AU.vm = vm; AU.vs = vs; if (!ac) return; mus.gain.setTargetAtTime(AU.music ? vm * 0.55 : 0, ac.currentTime, 0.1); sfx.gain.setTargetAtTime(vs, ac.currentTime, 0.05); };
// бръмченето на Лъча: постоянен тон, докато лъчът свети
let hum = null;
AU.beam = function (on, x) {
  if (!AU.ok || ac.state !== 'running') return;
  if (on && !hum) {
    const g = ac.createGain(), f = ac.createBiquadFilter(), a = ac.createOscillator(), b = ac.createOscillator(), l = ac.createOscillator(), lg = ac.createGain(), pn = ac.createStereoPanner ? ac.createStereoPanner() : null;
    a.type = 'sawtooth'; b.type = 'square'; a.frequency.value = 110; b.frequency.value = 220.7; f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 3;
    l.frequency.value = 7; lg.gain.value = 300; l.connect(lg); lg.connect(f.frequency);
    a.connect(f); b.connect(f); f.connect(g); g.gain.value = 0.0001; g.gain.setTargetAtTime(0.05, ac.currentTime, 0.03);
    if (pn) { g.connect(pn); pn.connect(sfx); } else g.connect(sfx);
    a.start(); b.start(); l.start(); hum = { g, a, b, l, pn };
  }
  if (hum && on && hum.pn) hum.pn.pan.setTargetAtTime(panX(x), ac.currentTime, 0.05);
  if (!on && hum) { const h = hum; hum = null; h.g.gain.setTargetAtTime(0.0001, ac.currentTime, 0.04); for (const o of [h.a, h.b, h.l]) o.stop(ac.currentTime + 0.25); }
};
AU.suspend = on => { if (!ac) return; if (on) ac.suspend(); else ac.resume(); };

// ── градивни елементи ──
function out(dst, pan, send) {
  let n = dst;
  if (pan && ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = M.clamp(pan, -1, 1); p.connect(dst); n = p; }
  if (send) { const s = ac.createGain(); s.gain.value = send; s.connect(rev); return { n, s }; }
  return { n, s: null };
}
function env(g, t, a, h, d, peak) {
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a);
  if (h) g.gain.setValueAtTime(peak, t + a + h);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + h + d);
}
function osc(type, f0, f1, t, dur, peak, o) {
  o = o || {};
  const s = ac.createOscillator(), g = ac.createGain(); s.type = type;
  s.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) s.frequency.exponentialRampToValueAtTime(f1, t + (o.glide || dur));
  if (o.det) s.detune.value = o.det;
  env(g, t, o.a || 0.004, o.h || 0, dur, peak);
  let n = s; n.connect(g); n = g;
  if (o.lp) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(o.lp, t); if (o.lp1) f.frequency.exponentialRampToValueAtTime(o.lp1, t + dur); f.Q.value = o.q || 0.7; g.connect(f); n = f; }
  const d = out(o.bus || sfx, o.pan, o.send); n.connect(d.n); if (d.s) n.connect(d.s);
  s.start(t); s.stop(t + (o.a || 0.004) + (o.h || 0) + dur + 0.05);
  voices++; s.onended = () => voices--;
  return s;
}
function nz(t, dur, peak, type, f0, f1, o) {
  o = o || {};
  const s = ac.createBufferSource(), g = ac.createGain(), f = ac.createBiquadFilter();
  s.buffer = noise; s.loop = true; f.type = type; f.frequency.setValueAtTime(f0, t); if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur); f.Q.value = o.q || 0.8;
  env(g, t, o.a || 0.003, o.h || 0, dur, peak);
  s.connect(f); f.connect(g);
  const d = out(o.bus || sfx, o.pan, o.send); g.connect(d.n); if (d.s) g.connect(d.s);
  s.start(t, rnd() * 1.5); s.stop(t + (o.a || 0.003) + (o.h || 0) + dur + 0.05);
  voices++; s.onended = () => voices--;
}
function bell(m, t, peak, pan, dur) { // FM камбанка — за нотите от скалата
  const f = mf(m), c = ac.createOscillator(), md = ac.createOscillator(), mg = ac.createGain(), g = ac.createGain();
  c.frequency.value = f; md.frequency.value = f * 3.5; mg.gain.setValueAtTime(f * 2.2, t); mg.gain.exponentialRampToValueAtTime(f * 0.05, t + dur);
  md.connect(mg); mg.connect(c.frequency); c.connect(g); env(g, t, 0.003, 0, dur, peak);
  const d = out(sfx, pan, 0.5); g.connect(d.n); if (d.s) g.connect(d.s);
  c.start(t); md.start(t); c.stop(t + dur + 0.1); md.stop(t + dur + 0.1);
}
const thr = (k, ms) => { const n = performance.now(); if (last[k] && n - last[k] < ms) return false; last[k] = n; return true; };
const panX = x => (x / S.W - 0.5) * 1.4;

// ── ефектите по събитията на логиката ──
const SCALE_M = [62, 65, 67, 69, 72, 74]; // ре минор: D F G A C D
AU.ev = function (e) {
  if (!AU.ok || ac.state !== 'running' || voices > 70) return;
  const t = ac.currentTime + 0.005, pn = e.x != null ? panX(e.x) : 0;
  switch (e.k) {
    case 'shot':
      if (!thr('shot', 55)) return;
      osc('triangle', 1500 + rnd() * 120, 420, t, 0.07, 0.045, { pan: pn, glide: 0.06 });
      nz(t, 0.025, 0.02, 'highpass', 5000, 0, { pan: pn });
      break;
    case 'hit': if (!thr('hit', 35)) return; if (e.w === 'beam') nz(t, 0.05, 0.03, 'highpass', 4000, 0, { pan: pn }); else nz(t, e.big ? 0.08 : 0.03, e.big ? 0.08 : 0.035, 'bandpass', e.big ? 1800 : 3200, 0, { pan: pn, q: 1.5 }); break;
    case 'deflect': if (!thr('defl', 70)) return; osc('triangle', 2600 + rnd() * 400, 1900, t, 0.06, 0.025, { pan: pn }); break;
    case 'wpn': {
      const base = { pulse: 62, fan: 65, beam: 67, wave: 69 }[e.w] || 62;
      [0, 7, 12, 19].forEach((d, i) => bell(base + 12 + d, t + i * 0.045, 0.08, pn, 1.0));
      nz(t, 0.5, 0.06, 'bandpass', 400, 6000, { q: 1.2, send: 0.5 });
      break;
    }
    case 'cp': [74, 79, 81].forEach((m, i) => bell(m, t + i * 0.1, 0.05, 0, 1.0)); break;
    case 'refr': if (!thr('refr', 60)) return; bell(96 + (rnd() < 0.5 ? 0 : 5), t, 0.025, pn, 0.35); break;
    case 'shatter': for (let i = 0; i < 5; i++) bell(88 + Math.floor(rnd() * 14), t + i * 0.025, 0.04, pn, 0.5); nz(t, 0.35, 0.12, 'highpass', 3500, 0, { pan: pn, send: 0.3 }); break;
    case 'mine': osc('square', 1200, 0, t, 0.05, 0.03, { pan: pn }); nz(t + 0.02, 0.45, 0.2, 'lowpass', 2500, 200, { pan: pn, send: 0.2 }); osc('sine', 120, 40, t + 0.02, 0.3, 0.25, { pan: pn }); break;
    case 'charge': osc('sawtooth', 150, 900, t, 0.5, 0.035, { pan: pn, lp: 2000, q: 6, glide: 0.45 }); break;
    case 'split': for (let i = 0; i < 9; i++) bell(84 + Math.floor(rnd() * 18), t + i * 0.03, 0.05, (rnd() - 0.5), 0.9); nz(t, 0.8, 0.2, 'bandpass', 2400, 400, { send: 0.5 }); osc('sine', 70, 25, t, 0.9, 0.35, { glide: 0.8 }); break;
    case 'roar': if (!thr('roar', 400)) return; osc('sawtooth', 70, 45, t, 0.7, 0.09, { lp: 500, a: 0.08, send: 0.3, pan: pn }); nz(t, 0.7, 0.08, 'lowpass', 700, 200, { pan: pn, a: 0.08 }); break;
    case 'btele': if (!thr('btele', 120)) return; nz(t, 1.0, 0.035, 'bandpass', 3000, 6000, { pan: pn, q: 3, a: 0.6 }); break;
    case 'bolt': nz(t, 0.12, 0.35, 'highpass', 1500, 0, { pan: pn }); nz(t + 0.03, 1.6, 0.3, 'lowpass', 900, 60, { pan: pn * 0.5, send: 0.6 }); osc('sine', 55, 30, t + 0.03, 1.2, 0.3, { glide: 1 }); break;
    case 'wind': nz(t, 1.6, 0.06, 'bandpass', 300, 900, { q: 0.7, a: 0.5, send: 0.3 }); break;
    case 'zap': nz(t, 0.25, 0.08, 'bandpass', 4000, 1500, { pan: pn, q: 4 }); osc('square', 80, 60, t, 0.2, 0.05, { lp: 1500, pan: pn }); break;
    case 'decloak': osc('sine', 300, 900, t, 0.3, 0.03, { pan: pn, glide: 0.25, send: 0.5 }); break;
    case 'gmark': osc('square', 1600, 0, t, 0.04, 0.02, { pan: pn }); osc('square', 1600, 0, t + 0.12, 0.04, 0.02, { pan: pn }); break;
    case 'blink': nz(t, 0.12, 0.08, 'bandpass', 2000, 300, { pan: pn, q: 2 }); break;
    case 'ptele': osc('sine', 220, 880, t, 1.6, 0.05, { glide: 1.6, a: 0.4, send: 0.5 }); nz(t, 1.6, 0.03, 'bandpass', 1500, 5000, { a: 1.2, q: 2 }); break;
    case 'pulse': nz(t, 0.9, 0.3, 'highpass', 600, 0, { send: 0.6 }); osc('sine', 1100, 200, t, 0.6, 0.08, { glide: 0.5, send: 0.5 }); break;
    case 'beat': osc('triangle', e.n % 2 ? 1760 : 1320, 0, t, 0.06, 0.05, { pan: pn }); break;
    case 'ringbreak': for (let i = 0; i < 10; i++) bell(80 + Math.floor(rnd() * 20), t + i * 0.025, 0.05, rnd() - 0.5, 0.8); nz(t, 0.8, 0.2, 'bandpass', 3000, 500, { send: 0.5 }); break;
    case 'minidie': nz(t, 1.6, 0.4, 'lowpass', 4000, 80, { send: 0.6 }); osc('sine', 70, 20, t, 1.4, 0.45, { glide: 1.2 }); break;
    case 'type': if (!thr('type', 40)) return; osc('square', 1700 + rnd() * 500, 0, t, 0.018, 0.01, { lp: 4000 }); break;
    case 'ui': osc('sine', 1300, 0, t, 0.05, 0.025); break;
    case 'buy': [69, 76, 81].forEach((m, i) => bell(m, t + i * 0.05, 0.06, 0, 0.8)); break;
    case 'medal': [62, 66, 69, 74, 78, 81, 86].slice(0, 3 + e.m * 1.5 | 0).forEach((m, i) => bell(m + 12, t + i * 0.08, 0.07, (i % 2 ? 0.3 : -0.3), 1.6)); break;
    case 'warn': for (let i = 0; i < 3; i++) { osc('sawtooth', 440, 0, t + i * 0.7, 0.32, 0.05, { lp: 1800, a: 0.02, send: 0.3 }); osc('sawtooth', 330, 0, t + i * 0.7 + 0.35, 0.32, 0.05, { lp: 1800, a: 0.02, send: 0.3 }); } break;
    case 'bossgo': osc('sine', 60, 30, t, 0.9, 0.4, { glide: 0.8 }); nz(t, 0.8, 0.12, 'lowpass', 900, 80, { send: 0.4 }); break;
    case 'phase':
      nz(t, 1.2, 0.3, 'lowpass', 3000, 100, { send: 0.5 }); osc('sine', 80, 25, t, 1.2, 0.45, { glide: 1 });
      osc('sawtooth', 200, 800, t + 0.2, 0.8, 0.05, { lp: 1600, glide: 0.7, send: 0.4 });
      break;
    case 'ltele': osc('sawtooth', 200, 1600, t, 0.85, 0.04, { pan: pn, lp: 3000, q: 8, glide: 0.8, a: 0.05 }); break;
    case 'lfire': nz(t, 1.1, 0.12, 'bandpass', 1400, 500, { pan: pn, q: 0.8, send: 0.3 }); osc('sawtooth', 70, 60, t, 1.1, 0.08, { lp: 700 }); break;
    case 'bossdie': osc('sine', 120, 20, t, 2.5, 0.35, { glide: 2.2 }); break;
    case 'bossboom':
      nz(t, 3, 0.45, 'lowpass', 5000, 60, { send: 0.7 }); osc('sine', 55, 18, t, 2.6, 0.55, { glide: 2.2 });
      [50, 57, 62, 65, 69, 74].forEach((m, i) => bell(m + 12, t + 0.4 + i * 0.12, 0.05, (i % 2 ? 0.4 : -0.4), 2));
      break;
    case 'boom': {
      const s = e.s;
      if (s === 1 && !thr('b1', 40)) return;
      nz(t, 0.25 + s * 0.22, 0.22 + s * 0.08, 'lowpass', 3200 + s * 600, 160, { pan: pn * 0.7, send: 0.25 });
      osc('sine', 150 - s * 20, 38, t, 0.22 + s * 0.15, 0.32 + s * 0.08, { pan: pn * 0.5, glide: 0.2 + s * 0.1 });
      if (s >= 2) { nz(t + 0.04, 0.5 + s * 0.3, 0.12, 'bandpass', 900, 120, { q: 0.6, send: 0.4 }); osc('sawtooth', 90, 30, t, 0.4 + s * 0.2, 0.08, { lp: 600, lp1: 80 }); }
      if (s === 3) osc('sine', 60, 22, t, 1.2, 0.38, { glide: 1.0 });
      break;
    }
    case 'efire': if (!thr('ef', 70)) return; osc('sine', 720, 320, t, 0.09, 0.04, { pan: pn, glide: 0.08 }); break;
    case 'ring':
      bell(81 + (rnd() < 0.5 ? 0 : 3), t, 0.06, pn, 0.6);
      nz(t, 0.35, 0.05, 'bandpass', 600, 2400, { pan: pn, q: 2 });
      break;
    case 'tele': osc('sawtooth', 300, 1500, t, 0.62, 0.035, { pan: pn, lp: 2400, q: 6, glide: 0.6, a: 0.1 }); break;
    case 'dash': nz(t, 0.45, 0.09, 'bandpass', 2600, 300, { pan: pn, q: 1.2 }); break;
    case 'drop': bell(86, t, 0.035, pn, 0.5); break;
    case 'note': {
      const m = SCALE_M[e.i % 6];
      bell(m + 12, t, 0.12, pn, 1.1); bell(m + 19, t + 0.07, 0.05, pn, 0.8);
      break;
    }
    case 'up': {
      const m = SCALE_M[e.i % 6];
      [0, 4, 7, 12].forEach((d, i) => bell(m + 12 + d, t + i * 0.055, 0.075, pn, 0.9));
      nz(t, 0.4, 0.05, 'bandpass', 500, 5000, { q: 1, send: 0.5 });
      break;
    }
    case 'deny': osc('square', 140, 0, t, 0.06, 0.05, { lp: 900 }); osc('square', 120, 0, t + 0.09, 0.07, 0.05, { lp: 900 }); break;
    case 'cr': if (!thr('cr', 28)) return; osc('sine', 2300 + rnd() * 900, 0, t, 0.05, 0.022, { pan: pn }); break;
    case 'msl': if (!thr('msl', 120)) return; nz(t, 0.18, 0.035, 'bandpass', 700, 2800, { pan: pn, q: 2 }); break;
    case 'phit':
      nz(t, 0.35, 0.3, 'lowpass', 2400, 200, { send: 0.2 });
      osc('square', 110, 55, t, 0.25, 0.12, { lp: 1200, lp1: 200 });
      osc('sine', 880, 0, t + 0.05, 0.08, 0.06); osc('sine', 880, 0, t + 0.2, 0.08, 0.06);
      break;
    case 'shd': bell(93, t, 0.08, pn, 0.5); nz(t, 0.2, 0.08, 'highpass', 2500, 0, { pan: pn }); break;
    case 'pdie':
      nz(t, 1.6, 0.4, 'lowpass', 4000, 90, { send: 0.5 });
      osc('sine', 90, 20, t, 1.6, 0.45, { glide: 1.4 });
      osc('sawtooth', 600, 60, t, 1.1, 0.08, { lp: 1800, lp1: 120, glide: 1 });
      break;
    case 'bomb':
      osc('sine', 75, 24, t, 1.8, 0.5, { glide: 1.6 });
      nz(t, 1.4, 0.25, 'bandpass', 300, 6000, { q: 0.7, send: 0.6, a: 0.02 });
      [50, 57, 62, 69, 74].forEach((m, i) => osc('sawtooth', mf(m), 0, t + i * 0.02, 1.6, 0.03, { lp: 3000, lp1: 400, send: 0.7, a: 0.05 }));
      break;
    case 'spawn': osc('sine', 300, 1200, t, 0.5, 0.06, { glide: 0.45, send: 0.4 }); break;
    case 'banner': [62, 69, 74].forEach((m, i) => bell(m + 12, t + i * 0.12, 0.04, (i - 1) * 0.4, 1.4)); break;
    case 'end':
      if (e.r === 'clear') [62, 65, 69, 74, 77, 81].forEach((m, i) => bell(m + 12, t + i * 0.09, 0.07, (i % 2 ? 0.3 : -0.3), 1.2));
      else [69, 65, 62, 57].forEach((m, i) => osc('triangle', mf(m), 0, t + i * 0.22, 0.5, 0.06, { send: 0.5 }));
      break;
  }
};

// ── музиката: секвенсор по шестнайсетинки с изпреварване ──
const TR = {
  helios: {
    bpm: 112,
    // акорди по тактове (MIDI), 2 пасажа по 4 такта
    A: [[50, 53, 57, 62], [46, 50, 53, 58], [43, 50, 55, 58], [45, 49, 52, 57]],
    B: [[50, 53, 57, 62], [48, 52, 55, 60], [46, 50, 53, 58], [45, 49, 52, 57]],
    bass: [0, 0, 12, 0, 0, 12, 0, 7, 0, 0, 12, 0, 0, 10, 12, 7],
    arp: [0, 1, 2, 3, 2, 1, 3, 2],
    kick: [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0], snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1], hat: [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
    lead: [[0, 74, 3], [4, 72, 2], [6, 69, 2], [8, 72, 4], [12, 69, 2], [14, 67, 2], [16, 65, 6], [24, 67, 2], [26, 69, 6], [32, 74, 3], [36, 76, 2], [38, 77, 2], [40, 76, 4], [44, 74, 2], [46, 72, 2], [48, 69, 8], [56, 73, 8]],
  },
};
TR.boss1 = { // Стражът: по-бързо, фригийско, бас на шестнайсетинки
  bpm: 132,
  A: [[50, 53, 57, 62], [51, 55, 58, 63], [50, 53, 57, 62], [48, 52, 55, 60]],
  B: [[46, 50, 53, 58], [48, 51, 55, 60], [50, 53, 57, 62], [49, 52, 55, 61]],
  bass: [0, 0, 12, 0, 0, 0, 12, 0, 0, 0, 12, 0, 1, 0, 12, 7],
  arp: [0, 2, 1, 3, 2, 1, 3, 0],
  kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0], snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], hat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  lead: [[0, 74, 2], [2, 75, 2], [4, 74, 4], [8, 70, 2], [10, 69, 2], [12, 67, 4], [16, 69, 6], [22, 70, 2], [24, 69, 8], [32, 74, 2], [34, 77, 2], [36, 75, 4], [40, 74, 4], [44, 70, 4], [48, 73, 6], [54, 74, 2], [56, 76, 8]],
};
TR.crystal = { // ниво 2: ми минор, камбанки и меко арпеджио
  bpm: 116,
  A: [[52, 55, 59, 64], [48, 52, 55, 60], [50, 54, 57, 62], [47, 50, 54, 59]],
  B: [[52, 55, 59, 64], [45, 48, 52, 57], [48, 52, 55, 60], [47, 51, 54, 59]],
  bass: [0, null, 12, 0, null, 0, 12, null, 0, null, 12, 0, null, 7, 12, null],
  arp: [0, 2, 3, 1, 2, 3, 1, 0],
  kick: [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0], snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], hat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0],
  lead: [[0, 76, 2], [2, 79, 2], [4, 83, 4], [8, 81, 2], [10, 79, 2], [12, 76, 4], [16, 74, 6], [22, 76, 2], [24, 72, 8], [32, 76, 2], [34, 79, 2], [36, 84, 4], [40, 83, 4], [44, 79, 4], [48, 78, 8], [56, 75, 8]],
};
TR.storm = { // ниво 3: до минор, тежък бас и барабани
  bpm: 128,
  A: [[48, 51, 55, 60], [44, 48, 51, 56], [46, 50, 53, 58], [43, 47, 50, 55]],
  B: [[48, 51, 55, 60], [41, 44, 48, 53], [44, 48, 51, 56], [43, 47, 50, 55]],
  bass: [0, 0, 12, 0, 0, 12, 0, 0, 0, 0, 12, 0, 0, 12, 10, 7],
  arp: [0, 1, 2, 3, 2, 1, 0, 1],
  kick: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0], snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1], hat: [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
  lead: [[0, 72, 3], [3, 75, 3], [6, 79, 2], [8, 77, 4], [12, 75, 4], [16, 72, 6], [22, 70, 2], [24, 67, 8], [32, 72, 3], [35, 75, 3], [38, 80, 2], [40, 79, 4], [44, 77, 4], [48, 75, 6], [54, 74, 2], [56, 71, 8]],
};
TR.boss2 = Object.assign({}, TR.boss1, { bpm: 136, // Призмата: ми, остро
  A: [[52, 55, 59, 64], [53, 57, 60, 65], [52, 55, 59, 64], [50, 53, 57, 62]],
  B: [[48, 52, 55, 60], [50, 53, 57, 62], [52, 55, 59, 64], [51, 54, 58, 63]],
  lead: [[0, 76, 2], [2, 77, 2], [4, 76, 4], [8, 72, 2], [10, 71, 2], [12, 69, 4], [16, 71, 6], [22, 72, 2], [24, 71, 8], [32, 76, 2], [34, 79, 2], [36, 77, 4], [40, 76, 4], [44, 72, 4], [48, 75, 6], [54, 76, 2], [56, 78, 8]] });
TR.boss3 = Object.assign({}, TR.boss1, { bpm: 124, // Левиатан: до, бавно и тежко
  A: [[48, 51, 55, 60], [49, 53, 56, 61], [48, 51, 55, 60], [46, 50, 53, 58]],
  B: [[44, 48, 51, 56], [46, 49, 53, 58], [48, 51, 55, 60], [47, 50, 53, 59]],
  bass: [0, 0, 0, 12, 0, 0, 1, 0, 0, 0, 0, 12, 0, 1, 0, 0],
  kick: [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0],
  lead: [[0, 72, 4], [4, 73, 4], [8, 72, 4], [12, 68, 4], [16, 67, 8], [24, 68, 8], [32, 72, 4], [36, 75, 4], [40, 73, 4], [44, 72, 4], [48, 71, 8], [56, 67, 8]] });
TR.echo = { // ниво 4: ла минор, бавно, просторно — почти без барабани
  bpm: 96,
  A: [[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59], [40, 47, 52, 55]],
  B: [[45, 52, 57, 60], [48, 55, 60, 64], [41, 48, 53, 57], [44, 47, 52, 56]],
  bass: [0, null, null, null, 12, null, null, null, 0, null, null, 7, null, null, 12, null],
  arp: [0, 2, 1, 3, 2, 3, 1, 2],
  kick: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0], snare: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], hat: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  lead: [[0, 69, 6], [6, 72, 2], [8, 76, 8], [16, 74, 4], [20, 72, 4], [24, 71, 8], [32, 69, 6], [38, 72, 2], [40, 79, 8], [48, 77, 4], [52, 76, 4], [56, 74, 8]],
};
TR.pulsar = { // ниво 5: 120 удара — импулсът на пулсара е на всеки 8 удара
  bpm: 120,
  A: [[47, 54, 59, 62], [43, 50, 55, 59], [45, 52, 57, 60], [42, 49, 54, 57]],
  B: [[47, 54, 59, 62], [40, 47, 52, 55], [43, 50, 55, 59], [42, 46, 49, 54]],
  bass: [0, 0, 12, 0, 0, 0, 12, 0, 0, 0, 12, 0, 0, 0, 12, 7],
  arp: [0, 1, 2, 3, 0, 1, 2, 3],
  kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], hat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
  lead: [[0, 71, 4], [4, 74, 4], [8, 78, 4], [12, 76, 4], [16, 74, 8], [24, 71, 8], [32, 71, 4], [36, 74, 4], [40, 79, 4], [44, 78, 4], [48, 76, 8], [56, 73, 8]],
};
TR.heart = { // ниво 6: 140 удара, фа минор, тежко
  bpm: 140,
  A: [[41, 44, 48, 53], [42, 46, 49, 54], [41, 44, 48, 53], [39, 43, 46, 51]],
  B: [[37, 41, 44, 49], [39, 43, 46, 51], [41, 44, 48, 53], [40, 43, 47, 52]],
  bass: [0, 0, 12, 0, 0, 12, 0, 1, 0, 0, 12, 0, 1, 0, 12, 0],
  arp: [0, 3, 1, 2, 0, 3, 2, 1],
  kick: [1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0], snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1], hat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  lead: [[0, 77, 2], [2, 78, 2], [4, 77, 4], [8, 72, 4], [12, 73, 4], [16, 72, 8], [24, 68, 8], [32, 77, 2], [34, 80, 2], [36, 78, 4], [40, 77, 4], [44, 73, 4], [48, 76, 8], [56, 77, 8]],
};
TR.boss4 = Object.assign({}, TR.boss1, { bpm: 110, A: TR.echo.A, B: TR.echo.B, lead: TR.echo.lead });
TR.boss5 = Object.assign({}, TR.boss1, { bpm: 120, A: TR.pulsar.A, B: TR.pulsar.B, kick: TR.pulsar.kick });
TR.boss6 = Object.assign({}, TR.boss1, { bpm: 144, A: TR.heart.A, B: TR.heart.B, lead: TR.heart.lead, bass: TR.heart.bass });
TR.menu = { // началният екран: само пасаж и арпеджио
  bpm: 84,
  A: [[50, 57, 62, 65], [46, 53, 58, 62], [43, 50, 55, 58], [45, 52, 57, 61]],
  B: [[50, 57, 62, 65], [48, 55, 60, 64], [46, 53, 58, 62], [45, 52, 57, 61]],
  bass: [0, null, null, null, null, null, null, null, 0, null, null, null, null, null, null, null], arp: [0, 1, 2, 3, 2, 1, 3, 2],
  kick: [], snare: [], hat: [], lead: [],
};
let seq = null;
AU.play = function (id, lvl) {
  if (!AU.ok) return;
  const tr = TR[id]; if (!tr) return;
  if (seq && seq.id === id) return;
  if (lvl != null) AU.level = AU.want = lvl;
  delay.delayTime.setValueAtTime(60 / tr.bpm * 0.75, ac.currentTime);
  seq = { tr, id, step: 0, t: ac.currentTime + 0.12, sp: 60 / tr.bpm / 4, bar: 0 };
  if (!AU.timer) AU.timer = setInterval(tick, 25);
};
AU.stop = () => { seq = null; };
// ново темпо без прекъсване (Метроном): тактовете продължават от същото място
AU.tempo = function (bpm) { if (!seq || !AU.ok) return; seq.sp = 60 / bpm / 4; delay.delayTime.setTargetAtTime(60 / bpm * 0.75, ac.currentTime, 0.1); };
AU.beat = () => seq && ac ? (seq.step - (seq.t - ac.currentTime) / seq.sp) / 4 : 0;
AU.intensity = v => { AU.want = v; };

function pad(ch, t, dur, k) {
  for (const m of ch) for (const det of [-9, 8]) osc('sawtooth', mf(m), 0, t, dur * 0.5, 0.012 * k, { bus: mus, det, a: 0.5, h: dur * 0.4, lp: 1100, lp1: 600, send: 0.6, pan: det < 0 ? -0.3 : 0.3 });
}
function tick() {
  if (!seq || !AU.ok) return;
  const tr = seq.tr;
  AU.level += (AU.want - AU.level) * 0.03;
  const lv = AU.level;
  while (seq.t < ac.currentTime + 0.14) {
    const st = seq.step % 16, bar = Math.floor(seq.step / 16) % 8, sec = bar < 4 ? tr.A : tr.B, ch = sec[bar % 4], t = seq.t;
    if (st === 0) pad(ch, t, seq.sp * 16, 1);
    // арпеджио с ехо
    if (st % 2 === 0 || lv > 1.5) {
      const m = ch[tr.arp[(st >> (lv > 1.5 ? 0 : 1)) % 8]] + 12;
      osc('square', mf(m), 0, t, 0.16, 0.018, { bus: mus, lp: 2600, lp1: 700, pan: st % 4 ? 0.35 : -0.35, send: 0.2 });
      osc('square', mf(m), 0, t, 0.16, 0.012, { bus: delay, lp: 2200, lp1: 600 });
    }
    if (lv > 0.5) {
      const b = tr.bass[st]; if (b != null && (st % 2 === 0 || b)) osc('sawtooth', mf(ch[0] - 12 + b), 0, t, seq.sp * 1.6, 0.06, { bus: mus, lp: 900, lp1: 160, q: 3 });
      if (tr.kick[st]) { osc('sine', 150, 42, t, 0.3, 0.32, { bus: mus, glide: 0.12 }); }
      if (tr.hat[st]) nz(t, st % 4 === 2 ? 0.07 : 0.03, 0.025, 'highpass', 8000, 0, { bus: mus, pan: 0.25 });
    }
    if (lv > 1.4) {
      if (tr.snare[st]) { nz(t, 0.16, 0.12, 'bandpass', 1900, 900, { bus: mus, send: 0.3 }); osc('triangle', 190, 140, t, 0.1, 0.06, { bus: mus }); }
      const pos = (bar % 4) * 16 + st;
      if (bar >= 4) for (const [s0, m, l] of tr.lead) if (s0 === pos) osc('sawtooth', mf(m), 0, t, seq.sp * l, 0.022, { bus: mus, a: 0.04, h: seq.sp * l * 0.5, lp: 2200, lp1: 1200, send: 0.5, det: 4 });
    }
    seq.step++; seq.t += seq.sp;
  }
}
})();
