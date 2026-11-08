// Ефектите: частици (два слоя — под и над корабите), прах на три дълбочини, трус, ударни вълни,
// светкавици. Чисто визуални — Math.random е позволен (логиката не зависи от тях).
(function () {
'use strict';
const S = window.SPACE, M = S.M, R = S.R;
const F = S.FX = { trauma: 0, shakeK: 1, flashK: 1, waves: [], slow: 0, stop: 0 };
const rnd = Math.random, rr = (a, b) => a + (b - a) * rnd();

// система от частици с типизирани масиви
function Sys(cap) {
  const f = n => new Float32Array(cap);
  const s = { n: 0, cap, x: f(), y: f(), vx: f(), vy: f(), l: f(), m: f(), w0: f(), w1: f(), hr: f(), r: f(), g: f(), b: f(), a: f(), dr: f(), rot: f(), vr: f(), add: f(), st: f(), gr: f(), sp: new Uint8Array(cap) };
  return s;
}
const lo = Sys(12000), hi = Sys(12000);
let SPR = [];
F.init = () => { const A = S.ART.spr; SPR = [A.glow, A.dot, A.spark, A.ring, A.flare, A.shard0, A.shard1, A.shard2, A.flame, A.cr]; };
const GLOW = 0, DOT = 1, SPARK = 2, RING = 3, FLARE = 4, SHARD = 5, FLAME = 8;

// o: {sp, x, y, vx, vy, l (такта), w0, w1, hr (височина/ширина), c:[r,g,b], a, dr (съпротивление), rot, vr, add, st (по скоростта), gr}
function emit(s, sp, x, y, vx, vy, l, w0, w1, c, a, dr, add, st, rot, vr, hr) {
  if (s.n >= s.cap) return;
  const i = s.n++;
  s.sp[i] = sp; s.x[i] = x; s.y[i] = y; s.vx[i] = vx; s.vy[i] = vy; s.l[i] = l; s.m[i] = l; s.w0[i] = w0; s.w1[i] = w1;
  s.r[i] = c[0]; s.g[i] = c[1]; s.b[i] = c[2]; s.a[i] = a; s.dr[i] = dr; s.add[i] = add; s.st[i] = st || 0; s.rot[i] = rot || 0; s.vr[i] = vr || 0; s.hr[i] = hr || 1; s.gr[i] = 0;
}
function upd(s, k) {
  let j = 0;
  for (let i = 0; i < s.n; i++) {
    s.l[i] -= k; if (s.l[i] <= 0) continue;
    const d = Math.pow(s.dr[i], k);
    s.vx[i] *= d; s.vy[i] *= d; s.x[i] += s.vx[i] * k; s.y[i] += s.vy[i] * k; s.rot[i] += s.vr[i] * k;
    if (j !== i) for (const key of ['x', 'y', 'vx', 'vy', 'l', 'm', 'w0', 'w1', 'hr', 'r', 'g', 'b', 'a', 'dr', 'rot', 'vr', 'add', 'st', 'gr', 'sp']) s[key][j] = s[key][i];
    j++;
  }
  s.n = j;
}
function draw(s) {
  for (let i = 0; i < s.n; i++) {
    const t = 1 - s.l[i] / s.m[i], sz = s.w0[i] + (s.w1[i] - s.w0[i]) * t, sp = SPR[s.sp[i]];
    const fade = (1 - t) * (1 - t * 0.35), a = s.a[i] * fade;
    if (s.st[i]) { // искра: по посоката на движение, дължината расте със скоростта
      const v = Math.hypot(s.vx[i], s.vy[i]);
      R.spr4(sp, s.x[i], s.y[i], Math.atan2(s.vy[i], s.vx[i]), sz + v * s.st[i], sz * 0.22, s.r[i], s.g[i], s.b[i], a, s.add[i]);
    } else R.spr4(sp, s.x[i], s.y[i], s.rot[i], sz, sz * s.hr[i], s.r[i], s.g[i], s.b[i], a, s.add[i]);
  }
}

// ── прах: три дълбочини, лети наляво; най-близкият е размит и минава над корабите ──
const DUST = [];
F.dust = function (n, col) {
  DUST.length = 0;
  for (let i = 0; i < n; i++) { const z = Math.pow(rnd(), 2.2) * 1.7 + 0.25; DUST.push({ x: rr(-400, S.W + 400), y: rr(-120, S.H + 120), z, s: rr(0.6, 1.4), c: col, p: rnd() * 6 }); }
  DUST.sort((a, b) => a.z - b.z);
};
function dustUpd(k, sspd) {
  for (const d of DUST) { d.x -= (sspd * d.z * d.z * 1.4 - F.wind.x * 2.2 * d.z) * k; d.y += F.wind.y * 2.2 * d.z * k; if (d.x < -420) { d.x += S.W + 840; d.y = rr(-120, S.H + 120); } if (d.y > S.H + 130) d.y -= S.H + 250; if (d.y < -130) d.y += S.H + 250; }
}
function dustDraw(front, t) {
  const A = S.ART.spr;
  for (const d of DUST) {
    if ((d.z > 1.35) !== front) continue;
    const c = d.c, tw = 0.8 + 0.2 * Math.sin(t * 2 + d.p);
    if (d.z < 0.7) R.spr4(A.dot, d.x, d.y, 0, 2.2 * d.s * d.z + 1, 2.2 * d.s * d.z + 1, c[0], c[1], c[2], 0.5 * d.z * tw, 1);
    else if (d.z < 1.35) R.spr4(A.spark, d.x, d.y, 0, 5 + d.z * 9, 2.4 * d.s * d.z, c[0], c[1], c[2], 0.38 * tw, 1);
    else R.spr4(A.glow, d.x, d.y, 0, 9 * d.s * d.z, 4 * d.s * d.z, c[0], c[1], c[2], 0.13, 1);
  }
}

// ── рецепти ──
const COL = {
  iskra: [2.4, 0.7, 0.3], kopie: [2.3, 0.45, 1.6], venets: [2.7, 1.5, 0.35], led: [1.2, 1.6, 2.2], player: [0.6, 1.6, 2.8],
  nosach: [2.0, 1.1, 2.6], strazh: [2.8, 1.3, 0.4], strazhPod: [2.8, 1.5, 0.5],
  kristal: [1.6, 1.5, 2.8], shtit: [2.3, 0.45, 1.6], lachemet: [2.6, 0.9, 0.3], minyor: [2.7, 1.5, 0.35], mina: [2.8, 0.5, 1.3], delitel: [2.6, 0.55, 1.0],
  prizrak: [1.0, 2.6, 2.0], svetulka: [1.8, 2.6, 0.9], pipalo: [0.9, 2.6, 2.1], zvezda: [1.6, 1.2, 2.8], kometa: [2.6, 1.8, 0.7], gnezdo: [2.6, 0.4, 0.6], glitch: [2.6, 0.6, 1.4],
  meduza: [0.9, 2.6, 2.1], metronom: [1.6, 1.0, 2.8], disonans: [2.8, 0.5, 1.2], skala: [0.8, 1.0, 1.6],
  vihar: [2.6, 1.0, 0.35], gromo: [1.6, 0.9, 2.8], burevest: [2.7, 1.0, 0.35], prizma: [1.8, 1.4, 2.8], prizmaS: [1.8, 1.4, 2.8], leviatan: [2.8, 1.0, 0.3], levNode: [2.8, 0.6, 1.8],
};
F.col = id => COL[id] || [2.4, 0.7, 0.3];
F.boom = function (x, y, s, c, vx, vy) {
  vx = vx || 0; vy = vy || 0;
  const k = s === 3 ? 2.1 : s === 2 ? 1.4 : 1, hot = [c[0] * 1.2 + 1.1, c[1] * 1.2 + 1.1, c[2] * 1.2 + 1.1];
  emit(hi, GLOW, x, y, vx * 0.2, vy * 0.2, 10 + 4 * s, 100 * k, 36 * k, hot, 1, 0.9, 1);
  emit(hi, FLARE, x, y, 0, 0, 12 + 4 * s, 150 * k, 30 * k, [c[0] + 0.6, c[1] + 0.6, c[2] + 0.6], 0.9, 1, 1, 0, rnd() * 0.5 - 0.25);
  for (let i = 0; i < 5 + s * 4; i++) { const a = rnd() * M.TAU, v = rr(0.4, 2.2) * k; emit(lo, GLOW, x + rr(-8, 8) * k, y + rr(-8, 8) * k, Math.cos(a) * v + vx * 0.3, Math.sin(a) * v + vy * 0.3, rr(24, 44) * k, rr(26, 44) * k, rr(64, 100) * k, c, rr(0.4, 0.7), 0.95, 1); }
  for (let i = 0; i < 16 + s * 12; i++) { const a = rnd() * M.TAU, v = rr(3.5, 14) * (0.7 + k * 0.3); emit(hi, SPARK, x, y, Math.cos(a) * v + vx * 0.4, Math.sin(a) * v + vy * 0.4, rr(16, 38), rr(5, 9), 2, [c[0] + 1, c[1] + 1, c[2] + 1], 1, 0.9, 1, 1.5); }
  for (let i = 0; i < 4 + s * 3; i++) { const a = rnd() * M.TAU, v = rr(1.5, 6) * k; emit(hi, SHARD + (i % 3), x, y, Math.cos(a) * v + vx * 0.5, Math.sin(a) * v + vy * 0.5, rr(40, 80), rr(9, 15) * (s === 1 ? 0.85 : 1.25), rr(5, 9), [c[0] * 0.9, c[1] * 0.9, c[2] * 0.9], 1, 0.965, 0, 0, rnd() * 6, rr(-0.25, 0.25), 0.72); }
  emit(hi, RING, x, y, 0, 0, 16 + 3 * s, 20, 150 * k, [c[0] + 0.6, c[1] + 0.6, c[2] + 0.6], 0.7, 1, 1);
  emit(hi, RING, x, y, 0, 0, 30 + 6 * s, 10, 90 * k, c, 0.35, 1, 1);
  for (let i = 0; i < 8 * s; i++) { const a = rnd() * M.TAU, v = rr(0.4, 2.6) * k; emit(lo, DOT, x, y, Math.cos(a) * v + vx * 0.2, Math.sin(a) * v + vy * 0.2, rr(50, 120), rr(2.5, 4.5), 1, [c[0] + 0.4, c[1] + 0.4, c[2] + 0.4], 0.9, 0.975, 1); }
  F.wave(x, y, s === 3 ? 0.05 : s === 2 ? 0.028 : 0.012, s === 3 ? 9 : 7, s === 1 ? 26 : 50);
  F.shake(s === 3 ? 0.5 : s === 2 ? 0.24 : 0.1);
};
F.hit = function (x, y, c, big) {
  for (let i = 0; i < (big ? 9 : 4); i++) { const a = M.PI + rr(-1.1, 1.1), v = rr(3, 9); emit(hi, SPARK, x, y, Math.cos(a) * v, Math.sin(a) * v, rr(8, 16), 4, 1.5, c, 1, 0.86, 1, 1.1); }
  emit(hi, GLOW, x, y, 0, 0, 7, big ? 34 : 18, 8, c, 0.8, 1, 1);
};
F.pop = function (x, y) { emit(hi, GLOW, x, y, 0, 0, 14, 16, 4, [2.4, 1, 2], 0.7, 1, 1); for (let i = 0; i < 3; i++) { const a = rnd() * M.TAU; emit(hi, SPARK, x, y, Math.cos(a) * 4, Math.sin(a) * 4, 12, 4, 1, [2.6, 1.2, 2.2], 1, 0.88, 1, 1); } };
F.ring = (x, y, c, w0, w1, l, a) => emit(hi, RING, x, y, 0, 0, l, w0, w1, c, a, 1, 1);
F.glow = (x, y, c, w0, w1, l, a, layer) => emit(layer === 0 ? lo : hi, GLOW, x, y, 0, 0, l, w0, w1, c, a, 1, 1);
F.flare = (x, y, c, w0, w1, l, a) => emit(hi, FLARE, x, y, 0, 0, l, w0, w1, c, a, 1, 1);
F.trail = (x, y, vx, vy, c, w, l, a) => emit(lo, GLOW, x, y, vx, vy, l, w, w * 0.3, c, a, 0.94, 1);
F.flame = (x, y, vx, vy, c, w, l, a) => emit(lo, FLAME, x, y, vx, vy, l, w, w * 0.4, c, a, 0.9, 1, 0, 0, 0, 0.4);
F.sparkle = function (x, y, c, n, v) { for (let i = 0; i < n; i++) { const a = rnd() * M.TAU, s = rr(1, v || 5); emit(hi, SPARK, x, y, Math.cos(a) * s, Math.sin(a) * s, rr(14, 30), 4, 1, c, 1, 0.9, 1, 1.2); } };
F.cryPick = (x, y) => emit(hi, GLOW, x, y, 0, 0, 10, 16, 4, S.C.crystal, 0.8, 1, 1);

// ударна вълна (изкривяване на картината), k — сила; sp — скорост в единици/такт
F.wave = function (x, y, k, sp, life) { F.waves.push({ x, y, r: 0, k, k0: k, sp: sp || 8, l: life || 60, m: life || 60 }); if (F.waves.length > 6) F.waves.shift(); };
F.shake = t => { F.trauma = Math.min(1, F.trauma + t); };

F.clear = () => { lo.n = 0; hi.n = 0; F.waves.length = 0; F.trauma = 0; };
// k — такта (1 = 1/60 s) за кадъра; sspd — скоростта на фона
F.wind = { x: 0, y: 0 };
F.update = function (k, sspd, t) {
  upd(lo, k); upd(hi, k); dustUpd(k, sspd);
  F.trauma = Math.max(0, F.trauma - 0.028 * k);
  for (const w of F.waves) { w.r += w.sp * k; w.l -= k; w.k = w.k0 * Math.max(0, w.l / w.m); }
  F.waves = F.waves.filter(w => w.l > 0);
  const sh = F.trauma * F.trauma * 18 * F.shakeK;
  R.shake[0] = sh * (Math.sin(t * 61.3) * 0.6 + Math.sin(t * 37.1) * 0.4); R.shake[1] = sh * (Math.sin(t * 53.7 + 1) * 0.6 + Math.sin(t * 29.3) * 0.4);
  R.flash = Math.max(0, R.flash - 0.035 * k); R.ca = Math.max(0, R.ca - 0.0012 * k);
};
F.drawDust = dustDraw;
F.drawLo = () => draw(lo);
F.drawHi = () => draw(hi);
F.count = () => lo.n + hi.n;
})();
