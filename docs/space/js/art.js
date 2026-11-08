// Процедурните спрайтове: рисуват се с Canvas 2D в един атлас при старта (без картинки — работи и от file://).
// Всеки обект има „тяло“ (тъмно, полупрозрачно, със смес) и „светлина“ (бели линии; оцветяват се при рисуването, > 1 свети).
(function () {
'use strict';
const S = window.SPACE, M = S.M;
const A = S.ART = { spr: {} };
// спрайтовете се събират, после се подреждат по височина (по-малко празно място) и тогава се рисуват;
// големите (над 100 единици) — с 1,6 пиксела на единица вместо 2 (меки са, не губят)
let K = 2, cv, cx;
const SIZE = 2048, PAD = 6, Q = [];
function add(name, w, h, draw) { Q.push({ name, w, h, draw, k: Math.max(w, h) >= 100 ? 1.6 : 2 }); }
function pack() {
  Q.sort((p, q) => q.h * q.k - p.h * p.k);
  let sx = 0, sy = 0, rowH = 0;
  for (const q of Q) {
    const pw = Math.ceil(q.w * q.k) + PAD * 2, ph = Math.ceil(q.h * q.k) + PAD * 2;
    if (sx + pw > SIZE) { sx = 0; sy += rowH; rowH = 0; }
    if (sy + ph > SIZE) throw new Error('Атласът е пълен');
    K = q.k;
    cx.save(); cx.translate(sx + PAD + q.w * K / 2, sy + PAD + q.h * K / 2); cx.scale(K, K);
    cx.beginPath(); cx.rect(-q.w / 2 - 1, -q.h / 2 - 1, q.w + 2, q.h + 2); cx.clip(); cx.beginPath();
    q.draw(cx, q.w, q.h); cx.restore();
    const u0 = (sx + PAD - 0.5) / SIZE, v0 = (sy + PAD - 0.5) / SIZE;
    A.spr[q.name] = { u0, v0, u1: u0 + (q.w * K + 1) / SIZE, v1: v0 + (q.h * K + 1) / SIZE, w: q.w, h: q.h };
    sx += pw; rowH = Math.max(rowH, ph);
  }
  A.used = (sy + rowH) / SIZE; K = 2; Q.length = 0;
}
const poly = (c, P, close) => { c.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) c.lineTo(P[i][0], P[i][1]); if (close !== false) c.closePath(); };
const mirror = P => P.map(([x, y]) => [x, -y]);
function radial(c, r, stops, col) {
  const g = c.createRadialGradient(0, 0, 0, 0, 0, r);
  for (const [o, a] of stops) g.addColorStop(o, `rgba(${col || '255,255,255'},${a})`);
  c.fillStyle = g; c.fillRect(-r, -r, r * 2, r * 2);
}
function body(c, P, top, bot, h) { // тъмно тяло с градиент и фин ръб
  const g = c.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, top); g.addColorStop(1, bot);
  c.beginPath(); for (const p of P) poly(c, p); c.fillStyle = g; c.fill();
}
function lines(c, P, w, blur, alpha) { // бели светещи линии (оцветяват се после)
  c.save(); c.strokeStyle = `rgba(255,255,255,${alpha == null ? 1 : alpha})`; c.lineWidth = w; c.lineJoin = 'round'; c.lineCap = 'round';
  c.shadowColor = 'rgba(255,255,255,0.9)'; c.shadowBlur = blur * K;
  c.beginPath(); for (const p of P) poly(c, p, p.open ? false : true); c.stroke(); c.restore();
}
const open = P => (P.open = true, P);

// ── кораб „Камертон“: тяло, двата зъба на камертона напред, крила назад ──
const HULL = [[-30, 0], [-24, -7], [-8, -9], [6, -6], [13, 0], [6, 6], [-8, 9], [-24, 7]];
const TINE = [[-2, -8], [8, -13.5], [30, -11.5], [34, -9.2], [30, -7], [10, -7]];
const WING = [[-9, -9], [-21, -19.5], [-31, -20], [-25, -7.5]];
function shipBody(c) {
  const ALL = [HULL, TINE, mirror(TINE), WING, mirror(WING)];
  body(c, ALL, '#3d6390', '#0a1322', 40);
  c.save(); c.beginPath(); for (const p of ALL) poly(c, p); c.clip();
  // отблясък отгоре и тъмна долна половина — обем
  let g = c.createLinearGradient(0, -14, 0, 14); g.addColorStop(0, 'rgba(200,235,255,0.28)'); g.addColorStop(0.45, 'rgba(200,235,255,0.02)'); g.addColorStop(0.55, 'rgba(0,0,0,0.15)'); g.addColorStop(1, 'rgba(0,0,0,0.45)');
  c.fillStyle = g; c.fillRect(-40, -25, 80, 50);
  // панели
  c.strokeStyle = 'rgba(0,8,20,0.75)'; c.lineWidth = 0.55; c.beginPath();
  poly(c, [[-24, -5.5], [-6, -6.5], [8, -3.5]], false); poly(c, [[-24, 5.5], [-6, 6.5], [8, 3.5]], false);
  poly(c, [[-17, -8.4], [-17, 8.4]], false); poly(c, [[-9, -9], [-9, 9]], false); poly(c, [[2, -7.8], [2, 7.8]], false);
  poly(c, [[-14, -10.5], [-25, -18.5]], false); poly(c, [[-14, 10.5], [-25, 18.5]], false); c.stroke();
  c.strokeStyle = 'rgba(190,235,255,0.22)'; c.lineWidth = 0.5; c.beginPath(); poly(c, [[-26, -6.2], [-8, -8.3], [5, -5.6]], false); poly(c, [[10, -12.6], [29, -10.8]], false); c.stroke();
  c.restore();
  // кабина
  c.save(); c.beginPath(); c.ellipse(-4, 0, 8.5, 2.9, 0, 0, M.TAU);
  g = c.createLinearGradient(0, -3, 0, 3); g.addColorStop(0, '#d8fbff'); g.addColorStop(0.35, '#58b8e0'); g.addColorStop(1, '#0c2a48');
  c.fillStyle = g; c.fill(); c.strokeStyle = 'rgba(0,10,25,0.8)'; c.lineWidth = 0.6; c.stroke(); c.restore();
  // двигателят отзад
  c.fillStyle = '#05080f'; c.fillRect(-32, -4.6, 5, 9.2);
  c.strokeStyle = 'rgba(120,200,255,0.4)'; c.lineWidth = 0.8; c.beginPath(); for (const p of ALL) poly(c, p); c.stroke();
}
function shipGlow(c) {
  lines(c, [HULL, TINE, mirror(TINE), WING, mirror(WING)], 0.6, 1.5, 0.35);
  lines(c, [open([[10, -7], [30, -7]]), open([[10, 7], [30, 7]])], 1.3, 3, 1);
  lines(c, [open([[-21, -19.5], [-31, -20]]), open([[-21, 19.5], [-31, 20]]), open([[30, -11.5], [34, -9.2]]), open([[30, 11.5], [34, 9.2]])], 1.6, 3, 1);
  lines(c, [open([[-26, -6.5], [-9, -8.6]]), open([[-26, 6.5], [-9, 8.6]])], 0.7, 2, 0.5);
  c.save(); c.translate(-2, -0.8); c.scale(1, 0.35); radial(c, 4.5, [[0, 0.9], [1, 0]]); c.restore();
  c.fillStyle = '#fff'; c.fillRect(-32.5, -3.4, 1.8, 2.6); c.fillRect(-32.5, 0.8, 1.8, 2.6);
}

function dartBody(c, P, top, bot, h) { body(c, [P], top, bot, h); c.strokeStyle = 'rgba(255,170,140,0.3)'; c.lineWidth = 0.7; c.beginPath(); poly(c, P); c.stroke(); }

const ISKRA = [[15, 0], [2, -6], [-8, -11.5], [-5, -3], [-12, 0], [-5, 3], [-8, 11.5], [2, 6]];
const KOPIE = [[27, 0], [6, -5], [-10, -5], [-15, -10.5], [-18, -4], [-27, 0], [-18, 4], [-15, 10.5], [-10, 5], [6, 5]];
const hexP = (r, o) => { const P = []; for (let i = 0; i < 6; i++) { const a = (o || 0) + i * Math.PI / 3; P.push([Math.cos(a) * r, Math.sin(a) * r]); } return P; };

function iceShape(seed, r) {
  const g = S.rng(seed), n = 7 + g.int(0, 3), P = [];
  for (let i = 0; i < n; i++) { const a = i / n * M.TAU + g.range(-0.2, 0.2), rr = r * g.range(0.62, 1); P.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
  return P;
}
function ice(c, P, r) {
  const g = c.createLinearGradient(-r, -r, r, r); g.addColorStop(0, 'rgba(210,235,255,0.62)'); g.addColorStop(1, 'rgba(40,70,110,0.75)');
  c.beginPath(); poly(c, P); c.fillStyle = g; c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.22)'; c.lineWidth = 0.7; c.beginPath();
  for (let i = 0; i < P.length; i += 2) { c.moveTo(P[i][0], P[i][1]); c.lineTo(P[(i + 3) % P.length][0] * 0.3, P[(i + 3) % P.length][1] * 0.3); } c.stroke();
}

A.build = function () {
  cv = document.createElement('canvas'); cv.width = cv.height = SIZE; cx = cv.getContext('2d');
  // светлини и частици
  add('glow', 64, 64, c => radial(c, 32, [[0, 1], [0.1, 0.78], [0.25, 0.38], [0.5, 0.11], [0.75, 0.025], [1, 0]]));
  add('dot', 16, 16, c => radial(c, 8, [[0, 1], [0.35, 0.95], [0.6, 0.4], [1, 0]]));
  add('spark', 32, 6, c => { c.scale(1, 0.19); radial(c, 16, [[0, 1], [0.3, 0.8], [0.7, 0.18], [1, 0]]); });
  add('ring', 128, 128, c => { c.save(); c.strokeStyle = '#fff'; c.lineWidth = 2.4; c.shadowColor = '#fff'; c.shadowBlur = 6 * K; c.beginPath(); c.arc(0, 0, 58, 0, M.TAU); c.stroke(); c.restore(); });
  add('flare', 64, 64, c => { radial(c, 10, [[0, 1], [1, 0]]); c.save(); c.scale(1, 0.06); radial(c, 32, [[0, 1], [0.4, 0.35], [1, 0]]); c.restore(); c.save(); c.scale(0.06, 1); radial(c, 32, [[0, 1], [0.4, 0.35], [1, 0]]); c.restore(); });
  add('flame', 40, 16, c => { c.translate(8, 0); c.scale(1, 0.32); const g = c.createRadialGradient(0, 0, 0, 0, 0, 22); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(-6, 0, 24, 20, 0, 0, M.TAU); c.fill(); });
  // играчът
  add('ship', 72, 46, shipBody); add('shipG', 72, 46, shipGlow);
  add('echo', 24, 24, c => { radial(c, 6, [[0, 0.9], [1, 0]]); c.strokeStyle = 'rgba(120,200,255,0.5)'; c.lineWidth = 1.4; c.fillStyle = '#0a1426'; c.beginPath(); c.arc(0, 0, 8, 0, M.TAU); c.fill(); c.stroke(); });
  add('echoG', 24, 24, c => { lines(c, [hexP(9, Math.PI / 6)], 1, 2, 0.9); radial(c, 4, [[0, 1], [1, 0]]); });
  add('pulse', 30, 8, c => { c.scale(1, 0.25); radial(c, 15, [[0, 1], [0.45, 0.9], [0.75, 0.3], [1, 0]]); });
  add('msl', 18, 8, c => { body(c, [[[9, 0], [2, -2.6], [-8, -2.6], [-8, 2.6], [2, 2.6]]], '#3a4a66', '#0c1220', 6); c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 0.8; c.beginPath(); poly(c, [[9, 0], [2, -2.6], [-8, -2.6], [-8, 2.6], [2, 2.6]]); c.stroke(); });
  // врагове
  add('iskra', 36, 28, c => dartBody(c, ISKRA, '#4a1e1e', '#140608', 24));
  add('iskraG', 36, 28, c => { lines(c, [ISKRA], 1, 2.5, 0.8); lines(c, [open([[-4, 0], [10, 0]])], 1.4, 2, 1); radial(c, 3.5, [[0, 1], [1, 0]]); });
  add('kopie', 58, 26, c => dartBody(c, KOPIE, '#46163c', '#12040e', 22));
  add('kopieG', 58, 26, c => { lines(c, [KOPIE], 1, 2.5, 0.75); lines(c, [open([[-16, 0], [22, 0]])], 1.3, 2.5, 1); });
  const HX = hexP(22, Math.PI / 6), HXi = hexP(12, Math.PI / 6), SP = [];
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3, b = a + 0.2, d = a - 0.2; SP.push([[Math.cos(d) * 21, Math.sin(d) * 21], [Math.cos(a) * 37, Math.sin(a) * 37], [Math.cos(b) * 21, Math.sin(b) * 21]]); }
  add('venets', 78, 78, c => { body(c, [HX, ...SP], '#4a3010', '#140a02', 60); c.fillStyle = '#05030a'; c.beginPath(); poly(c, HXi); c.fill(); c.strokeStyle = 'rgba(255,200,120,0.3)'; c.lineWidth = 0.8; c.beginPath(); for (const p of [HX, ...SP]) poly(c, p); c.stroke(); });
  add('venetsG', 78, 78, c => { lines(c, [HX], 1.1, 3, 0.8); lines(c, SP.map(p => open(p)), 1.2, 3, 0.95); lines(c, [HXi], 1, 2, 0.6); });
  add('core', 30, 30, c => radial(c, 15, [[0, 1], [0.25, 0.9], [0.5, 0.35], [1, 0]]));
  for (let i = 0; i < 3; i++) {
    const P = iceShape(11 + i * 7, 25), Q = iceShape(41 + i * 5, 12.5);
    add('led' + i, 56, 56, c => ice(c, P, 25)); add('ledG' + i, 56, 56, c => lines(c, [P], 0.9, 2.5, 0.75));
    add('leds' + i, 30, 30, c => ice(c, Q, 12.5)); add('ledsG' + i, 30, 30, c => lines(c, [Q], 0.8, 2, 0.75));
  }
  // вражески изстрели: тъмен ръб, цветен пръстен, бяло ядро — четими върху всичко
  for (const [nm, col] of [['P', '255,70,170'], ['A', '255,170,50']]) {
    add('orb' + nm, 20, 20, c => {
      c.fillStyle = 'rgba(0,0,0,0.75)'; c.beginPath(); c.arc(0, 0, 9.4, 0, M.TAU); c.fill();
      const g = c.createRadialGradient(0, 0, 0, 0, 0, 8); g.addColorStop(0, '#fff'); g.addColorStop(0.42, '#fff'); g.addColorStop(0.6, `rgb(${col})`); g.addColorStop(1, `rgba(${col},0.85)`);
      c.fillStyle = g; c.beginPath(); c.arc(0, 0, 8, 0, M.TAU); c.fill();
    });
    add('ndl' + nm, 22, 10, c => {
      c.fillStyle = 'rgba(0,0,0,0.75)'; c.beginPath(); c.ellipse(0, 0, 10.5, 4.4, 0, 0, M.TAU); c.fill();
      c.fillStyle = `rgb(${col})`; c.beginPath(); c.ellipse(0, 0, 9, 3.2, 0, 0, M.TAU); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.ellipse(1, 0, 6, 1.6, 0, 0, M.TAU); c.fill();
    });
  }
  // предмети
  add('note', 36, 36, c => {
    c.fillStyle = 'rgba(6,14,24,0.85)'; c.beginPath(); c.arc(0, 0, 15, 0, M.TAU); c.fill();
    c.save(); c.strokeStyle = '#fff'; c.lineWidth = 1.6; c.shadowColor = '#fff'; c.shadowBlur = 3 * K; c.beginPath(); c.arc(0, 0, 15, 0, M.TAU); c.stroke();
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(-3.2, 6, 4.4, 3.1, -0.45, 0, M.TAU); c.fill();
    c.fillRect(0.4, -9, 1.9, 15); c.beginPath(); c.moveTo(2.3, -9); c.quadraticCurveTo(9, -6, 6.5, 0.5); c.quadraticCurveTo(7, -4.5, 2.3, -5); c.fill(); c.restore();
  });
  add('cr', 12, 16, c => { const P = [[0, -7.5], [5, -1], [0, 7.5], [-5, -1]]; c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); poly(c, P); c.fill(); lines(c, [P], 0.9, 1.5, 1); c.fillStyle = '#fff'; c.beginPath(); poly(c, [[0, -7.5], [5, -1], [0, 0]]); c.fill(); });
  for (let i = 0; i < 3; i++) {
    const g = S.rng(90 + i), P = [[g.range(4, 6), g.range(-1, 1)], [g.range(-5, -2), g.range(-4, -2)], [g.range(-5, -2), g.range(2, 4)]];
    add('shard' + i, 14, 10, c => { c.fillStyle = 'rgba(30,14,14,0.92)'; c.beginPath(); poly(c, P); c.fill(); lines(c, [P], 0.7, 1, 0.9); });
  }
  // ── етап 2: оръжия, кристал за оръжие, Носач, Стражът, лъчи ──
  add('bar', 16, 16, c => { const g = c.createLinearGradient(0, -8, 0, 8); for (const [o, a] of [[0, 0], [0.2, 0.08], [0.38, 0.45], [0.5, 1], [0.62, 0.45], [0.8, 0.08], [1, 0]]) g.addColorStop(o, `rgba(255,255,255,${a})`); c.fillStyle = g; c.fillRect(-8, -8, 16, 16); });
  add('dart', 20, 9, c => { const P = [[9, 0], [-3, -3.6], [-8, -3.2], [-5, 0], [-8, 3.2], [-3, 3.6]]; c.save(); c.shadowColor = '#fff'; c.shadowBlur = 3 * K; c.fillStyle = 'rgba(255,255,255,0.95)'; c.beginPath(); poly(c, P); c.fill(); c.restore(); });
  // Вълна: дъга „)“ — звукова вълна; по форма не прилича на вражеските кълба
  add('arcw', 18, 26, c => { c.save(); c.strokeStyle = '#fff'; c.lineCap = 'round'; c.shadowColor = '#fff'; c.shadowBlur = 3 * K;
    c.lineWidth = 2.6; c.beginPath(); c.arc(-9, 0, 13, -0.95, 0.95); c.stroke(); c.globalAlpha = 0.45; c.lineWidth = 1.4; c.beginPath(); c.arc(-14, 0, 13, -0.85, 0.85); c.stroke(); c.restore(); });
  const GEM = [[0, -17], [12, -7], [12, 7], [0, 17], [-12, 7], [-12, -7]];
  add('wcr', 34, 40, c => {
    c.fillStyle = 'rgba(8,12,22,0.86)'; c.beginPath(); poly(c, GEM); c.fill();
    const g = c.createLinearGradient(-12, -17, 12, 17); g.addColorStop(0, 'rgba(255,255,255,0.5)'); g.addColorStop(0.5, 'rgba(255,255,255,0.08)'); g.addColorStop(1, 'rgba(255,255,255,0.3)');
    c.fillStyle = g; c.beginPath(); poly(c, [[0, -17], [12, -7], [0, -2], [-12, -7]]); c.fill();
  });
  add('wcrG', 34, 40, c => { lines(c, [GEM], 1.4, 3, 1); lines(c, [open([[-12, -7], [0, -2], [12, -7]]), open([[0, -2], [0, 17]])], 0.6, 1.5, 0.5); });
  const ico = (name, fn) => add(name, 16, 16, c => { c.save(); c.strokeStyle = '#fff'; c.fillStyle = '#fff'; c.lineWidth = 1.6; c.lineCap = 'round'; c.shadowColor = '#fff'; c.shadowBlur = 2 * K; c.beginPath(); fn(c); c.stroke(); c.restore(); });
  ico('icoPulse', c => { c.moveTo(-6, -3); c.lineTo(-1, -3); c.moveTo(1, -3); c.lineTo(6, -3); c.moveTo(-6, 3); c.lineTo(-1, 3); c.moveTo(1, 3); c.lineTo(6, 3); });
  ico('icoFan', c => { c.moveTo(-6, 0); c.lineTo(6, -5.5); c.moveTo(-6, 0); c.lineTo(6.5, 0); c.moveTo(-6, 0); c.lineTo(6, 5.5); });
  ico('icoBeam', c => { c.lineWidth = 3; c.moveTo(-6.5, 0); c.lineTo(6.5, 0); });
  ico('icoWave', c => { c.moveTo(-7, 0); for (let x = -7; x <= 7; x += 0.5) c.lineTo(x, -Math.sin(x * 0.75) * 4.5); });
  const NOS = [[40, -7], [31, -19], [-24, -21], [-38, -12], [-38, 12], [-24, 21], [31, 19], [40, 7]];
  const POD1 = [[18, -21], [14, -28], [-18, -28], [-22, -21]];
  add('nosach', 88, 62, c => {
    body(c, [NOS, POD1, mirror(POD1)], '#3a2c4a', '#0c0814', 56);
    c.fillStyle = '#04030a'; c.beginPath(); c.arc(4, 0, 11, 0, M.TAU); c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 0.7; c.beginPath(); poly(c, [[-30, -16], [-30, 16]], false); poly(c, [[24, -18], [24, 18]], false); poly(c, [[-16, -21], [-16, 21]], false); c.stroke();
    c.strokeStyle = 'rgba(220,170,255,0.3)'; c.lineWidth = 0.8; c.beginPath(); for (const p of [NOS, POD1, mirror(POD1)]) poly(c, p); c.stroke();
  });
  add('nosachG', 88, 62, c => { lines(c, [NOS], 0.9, 2.5, 0.65); lines(c, [POD1, mirror(POD1)], 0.8, 2, 0.5); c.save(); c.strokeStyle = '#fff'; c.lineWidth = 1.4; c.shadowColor = '#fff'; c.shadowBlur = 3 * K; c.beginPath(); c.arc(4, 0, 11, 0, M.TAU); c.stroke(); c.restore(); c.fillStyle = '#fff'; c.fillRect(-39.5, -9, 2, 5); c.fillRect(-39.5, 4, 2, 5); });
  // Стражът
  const OCT = []; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + Math.PI / 8; OCT.push([Math.cos(a) * 46, Math.sin(a) * 46]); }
  add('bCore', 104, 104, c => {
    body(c, [OCT], '#40506a', '#0a0e18', 92);
    c.fillStyle = '#02030a'; c.beginPath(); c.arc(0, 0, 25, 0, M.TAU); c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.65)'; c.lineWidth = 1; c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; c.moveTo(Math.cos(a) * 28, Math.sin(a) * 28); c.lineTo(Math.cos(a) * 44, Math.sin(a) * 44); } c.stroke();
    c.strokeStyle = 'rgba(190,220,255,0.3)'; c.lineWidth = 1; c.beginPath(); poly(c, OCT); c.stroke();
  });
  add('bCoreG', 104, 104, c => { lines(c, [OCT], 1.1, 3, 0.75); c.save(); c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.shadowColor = '#fff'; c.shadowBlur = 4 * K; c.beginPath(); c.arc(0, 0, 26, 0, M.TAU); c.stroke(); c.lineWidth = 0.8; c.beginPath(); c.arc(0, 0, 36, 0.2, 1.4); c.arc(0, 0, 36, 1.77, 2.97); c.stroke(); c.beginPath(); c.arc(0, 0, 36, 3.34, 4.54); c.stroke(); c.beginPath(); c.arc(0, 0, 36, 4.91, 6.11); c.stroke(); c.restore(); });
  add('bRing', 280, 280, c => {
    for (let i = 0; i < 6; i++) { const a0 = i * Math.PI / 3 + 0.2, a1 = (i + 1) * Math.PI / 3 - 0.2;
      c.beginPath(); c.arc(0, 0, 127, a0, a1); c.arc(0, 0, 117, a1, a0, true); c.closePath(); c.fillStyle = 'rgba(28,36,52,0.95)'; c.fill(); c.strokeStyle = 'rgba(180,210,255,0.28)'; c.lineWidth = 0.8; c.stroke(); }
  });
  add('bRingG', 280, 280, c => { c.save(); c.strokeStyle = '#fff'; c.lineWidth = 0.9; c.shadowColor = '#fff'; c.shadowBlur = 2 * K; for (let i = 0; i < 6; i++) { const a0 = i * Math.PI / 3 + 0.22, a1 = (i + 1) * Math.PI / 3 - 0.22; c.beginPath(); c.arc(0, 0, 122, a0, a1); c.stroke(); } c.restore(); });
  const PODH = hexP(17, 0);
  add('bPod', 44, 44, c => { body(c, [PODH], '#4a3a26', '#120c06', 34); c.fillStyle = '#05030a'; c.beginPath(); c.arc(0, 0, 7, 0, M.TAU); c.fill(); c.strokeStyle = 'rgba(255,200,140,0.3)'; c.lineWidth = 0.8; c.beginPath(); poly(c, PODH); c.stroke(); });
  add('bPodG', 44, 44, c => { lines(c, [PODH], 1, 2.5, 0.8); radial(c, 6, [[0, 1], [0.5, 0.6], [1, 0]]); });
  add('bGun', 34, 10, c => { body(c, [[[16, -2.6], [16, 2.6], [0, 3.6], [0, -3.6]]], '#5a4a36', '#1a1208', 8); c.fillStyle = '#fff'; c.fillRect(14.5, -1.4, 2, 2.8); });
  add('hexShield', 120, 120, c => {
    c.save(); c.beginPath(); c.arc(0, 0, 56, 0, M.TAU); c.clip();
    c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 0.8;
    for (let y = -60; y <= 60; y += 10.4) for (let x = -66; x <= 66; x += 18) { const ox = (Math.round(y / 10.4) % 2) * 9; c.beginPath(); poly(c, hexP(5.6, 0).map(([a, b]) => [a + x + ox, b + y])); c.stroke(); }
    c.restore();
    const g = c.createRadialGradient(0, 0, 30, 0, 0, 58); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.85, 'rgba(255,255,255,0.25)'); g.addColorStop(1, 'rgba(255,255,255,0.9)');
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, 58, 0, M.TAU); c.fill();
  });
  // ── етап 3: нива 2 и 3 ──
  const CRY = (h, w) => [[0, -h], [w, -.42 * h], [w, .55 * h], [0, h], [-w, .55 * h], [-w, -.42 * h]];
  for (let i = 0; i < 3; i++) {
    const h = [24, 20, 27][i], w = [10, 12, 8][i], P = CRY(h, w).map(([x, y]) => [y, x]); // легнал: дългата ос по x
    add('kris' + i, 60, 30, c => {
      const g = c.createLinearGradient(0, -w, 0, w); g.addColorStop(0, 'rgba(235,230,255,0.75)'); g.addColorStop(0.5, 'rgba(170,160,240,0.45)'); g.addColorStop(1, 'rgba(70,60,150,0.7)');
      c.beginPath(); poly(c, P); c.fillStyle = g; c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 0.6; c.beginPath(); poly(c, [[-.42 * h, -w * .34], [.55 * h, -w * .34]], false); poly(c, [[-.42 * h, w * .34], [.55 * h, w * .34]], false); c.stroke();
    });
    add('krisG' + i, 60, 30, c => lines(c, [P], 0.9, 2.5, 0.9));
  }
  const SHT = hexP(17, 0);
  add('shtit', 46, 46, c => { body(c, [SHT], '#40203e', '#12060f', 34); c.fillStyle = '#060208'; c.beginPath(); c.arc(-3, 0, 6, 0, M.TAU); c.fill(); c.strokeStyle = 'rgba(255,160,230,0.3)'; c.lineWidth = 0.8; c.beginPath(); poly(c, SHT); c.stroke(); });
  add('shtitG', 46, 46, c => { lines(c, [SHT], 1, 2.5, 0.8); radial(c, 4, [[0, 1], [1, 0]]); });
  add('shield', 30, 60, c => { c.save(); c.strokeStyle = '#fff'; c.lineCap = 'round'; c.shadowColor = '#fff'; c.shadowBlur = 4 * K; c.lineWidth = 3; c.beginPath(); c.arc(-14, 0, 26, -1.05, 1.05); c.stroke(); c.globalAlpha = 0.25; c.lineWidth = 9; c.beginPath(); c.arc(-16, 0, 26, -1.0, 1.0); c.stroke(); c.restore(); });
  const LCH = [[20, 0], [-12, -14], [-6, 0], [-12, 14]];
  add('lach', 38, 32, c => dartBody(c, LCH, '#4a2414', '#140804', 28));
  add('lachG', 38, 32, c => { lines(c, [LCH], 1, 2.5, 0.85); radial(c, 4, [[0, 1], [1, 0]]); });
  const MNR = [[22, -6], [14, -15], [-16, -15], [-24, -6], [-24, 6], [-16, 15], [14, 15], [22, 6]];
  add('minyor', 50, 36, c => { body(c, [MNR], '#4a3a18', '#141006', 30); c.fillStyle = '#050403'; c.fillRect(-10, -6, 18, 12); c.strokeStyle = 'rgba(255,220,140,0.3)'; c.lineWidth = 0.8; c.beginPath(); poly(c, MNR); c.stroke(); });
  add('minyorG', 50, 36, c => { lines(c, [MNR], 0.9, 2.5, 0.7); lines(c, [[[-10, -6], [8, -6], [8, 6], [-10, 6]]], 0.9, 2, 0.8); });
  add('mina', 28, 28, c => {
    c.fillStyle = '#1a0812'; c.beginPath(); c.arc(0, 0, 7.5, 0, M.TAU); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 1.2; c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; c.moveTo(Math.cos(a) * 7.5, Math.sin(a) * 7.5); c.lineTo(Math.cos(a) * 12.5, Math.sin(a) * 12.5); } c.stroke();
    c.beginPath(); c.arc(0, 0, 7.5, 0, M.TAU); c.stroke();
  });
  add('cell', 56, 56, c => {
    const g = c.createRadialGradient(-6, -6, 2, 0, 0, 25); g.addColorStop(0, 'rgba(120,40,70,0.9)'); g.addColorStop(1, 'rgba(20,4,12,0.92)');
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, 24, 0, M.TAU); c.fill();
  });
  add('cellG', 56, 56, c => { c.save(); c.strokeStyle = '#fff'; c.shadowColor = '#fff'; c.shadowBlur = 3 * K; c.lineWidth = 1.4; c.beginPath(); c.arc(0, 0, 24, 0, M.TAU); c.stroke(); c.lineWidth = 0.9; c.globalAlpha = 0.7; c.beginPath(); c.moveTo(-6, -23); c.bezierCurveTo(4, -8, -4, 8, 6, 23); c.stroke(); c.restore(); radial(c, 6, [[0, 0.9], [1, 0]]); });
  add('vihar', 46, 46, c => {
    c.fillStyle = 'rgba(40,14,6,0.92)'; c.strokeStyle = 'rgba(255,190,140,0.35)'; c.lineWidth = 0.8;
    for (let i = 0; i < 3; i++) { c.save(); c.rotate(i * M.TAU / 3); c.beginPath(); c.moveTo(4, 0); c.quadraticCurveTo(14, -4, 21, 6); c.quadraticCurveTo(12, 3, 2, 6); c.closePath(); c.fill(); c.stroke(); c.restore(); }
    c.beginPath(); c.arc(0, 0, 6, 0, M.TAU); c.fill(); c.stroke();
  });
  add('viharG', 46, 46, c => { c.save(); c.strokeStyle = '#fff'; c.shadowColor = '#fff'; c.shadowBlur = 2.5 * K; c.lineWidth = 1.1; for (let i = 0; i < 3; i++) { c.save(); c.rotate(i * M.TAU / 3); c.beginPath(); c.moveTo(4, 0); c.quadraticCurveTo(14, -4, 21, 6); c.stroke(); c.restore(); } c.restore(); radial(c, 5, [[0, 1], [1, 0]]); });
  add('gromo', 26, 50, c => { body(c, [[[-5, -16], [5, -16], [5, 18], [-5, 18]]], '#3a2a5a', '#0e0818', 36); c.fillStyle = '#0e0818'; c.beginPath(); c.arc(0, -18, 7, 0, M.TAU); c.fill(); });
  add('gromoG', 26, 50, c => { c.save(); c.strokeStyle = '#fff'; c.shadowColor = '#fff'; c.shadowBlur = 3 * K; c.lineWidth = 1.2; for (const y of [-6, 3, 12]) { c.beginPath(); c.ellipse(0, y, 10, 3, 0, 0, M.TAU); c.stroke(); } c.beginPath(); c.arc(0, -18, 7, 0, M.TAU); c.stroke(); c.restore(); });
  const BRD = [[16, 0], [-2, -5], [-14, -17], [-8, -3], [-13, 0], [-8, 3], [-14, 17], [-2, 5]];
  add('burev', 34, 38, c => dartBody(c, BRD, '#4a2010', '#140604', 30));
  add('burevG', 34, 38, c => { lines(c, [BRD], 1, 2.5, 0.85); lines(c, [open([[-6, 0], [12, 0]])], 1.2, 2, 1); });
  // Призма
  const TRI = [0, 1, 2].map(i => [Math.cos(i * M.TAU / 3) * 52, Math.sin(i * M.TAU / 3) * 52]), TRI2 = TRI.map(([x, y]) => [x * .45, y * .45]);
  add('prizma', 112, 112, c => {
    const g = c.createLinearGradient(-40, -40, 40, 40); g.addColorStop(0, 'rgba(230,225,255,0.55)'); g.addColorStop(0.5, 'rgba(120,110,210,0.4)'); g.addColorStop(1, 'rgba(40,30,110,0.75)');
    c.beginPath(); poly(c, TRI); c.fillStyle = g; c.fill();
    c.fillStyle = 'rgba(10,6,30,0.7)'; c.beginPath(); poly(c, TRI2); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.3)'; c.lineWidth = 0.7; c.beginPath(); for (let i = 0; i < 3; i++) { c.moveTo(TRI[i][0], TRI[i][1]); c.lineTo(TRI2[(i + 1) % 3][0], TRI2[(i + 1) % 3][1]); } c.stroke();
  });
  add('prizmaG', 112, 112, c => { lines(c, [TRI], 1.4, 3.5, 1); lines(c, [TRI2], 1, 2, 0.7); });
  // Левиатан: глава, бронирани сегменти
  const HEAD = [[42, 0], [24, -12], [8, -21], [-14, -21], [-26, -10], [-26, 10], [-14, 21], [8, 21], [24, 12]];
  const HORN = [[-12, -20], [-34, -33], [-22, -14]];
  add('levHead', 92, 76, c => {
    body(c, [HEAD, HORN, mirror(HORN)], '#3a2420', '#0e0606', 50);
    c.strokeStyle = 'rgba(0,0,0,0.7)'; c.lineWidth = 0.8; c.beginPath(); poly(c, [[40, 1], [16, 4], [-6, 2]], false); poly(c, [[2, -20], [-4, -8], [-14, -6]], false); poly(c, [[2, 20], [-4, 8], [-14, 6]], false); c.stroke();
    c.strokeStyle = 'rgba(255,170,110,0.3)'; c.lineWidth = 0.8; c.beginPath(); for (const p of [HEAD, HORN, mirror(HORN)]) poly(c, p); c.stroke();
  });
  add('levHeadG', 92, 76, c => { lines(c, [HEAD], 1, 2.5, 0.7); lines(c, [open([[40, 1], [16, 4], [-6, 2]])], 1.1, 2, 0.9); c.fillStyle = '#fff'; for (const s of [-1, 1]) { c.save(); c.translate(14, s * 9); c.scale(1, 0.55); radial(c, 5, [[0, 1], [0.5, 0.9], [1, 0]]); c.restore(); } });
  const PL = [[19, 0], [11, -19], [-11, -19], [-20, 0], [-11, 19], [11, 19]];
  add('levPlate', 48, 48, c => {
    body(c, [PL], '#3a2622', '#0c0606', 40);
    c.fillStyle = 'rgba(0,0,0,0.45)'; c.beginPath(); poly(c, [[-11, -19], [-20, 0], [-11, 19], [-4, 19], [-12, 0], [-4, -19]]); c.fill();
    c.strokeStyle = 'rgba(255,160,100,0.3)'; c.lineWidth = 0.8; c.beginPath(); poly(c, PL); c.stroke();
  });
  add('levPlateG', 48, 48, c => { lines(c, [PL], 0.9, 2.5, 0.6); lines(c, [open([[11, -19], [4, 0], [11, 19]])], 0.9, 2, 0.8); });
  // ── етап 4: нива 4–6 ──
  add('ghost', 44, 40, c => { // призрак: полупрозрачен воал с очи
    const g = c.createRadialGradient(-2, -4, 2, 0, 0, 20); g.addColorStop(0, 'rgba(200,255,240,0.55)'); g.addColorStop(1, 'rgba(20,60,50,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(16, 0); c.quadraticCurveTo(12, -17, -4, -16); c.quadraticCurveTo(-20, -14, -20, 2); c.lineTo(-14, 8); c.lineTo(-18, 14); c.lineTo(-8, 10); c.lineTo(-6, 17); c.lineTo(2, 10); c.quadraticCurveTo(14, 12, 16, 0); c.fill();
  });
  add('ghostG', 44, 40, c => { c.fillStyle = '#fff'; for (const y of [-5, 5]) { c.save(); c.translate(7, y); c.scale(1.3, 0.6); radial(c, 3.5, [[0, 1], [0.6, 0.8], [1, 0]]); c.restore(); } c.save(); c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 0.8; c.shadowColor = '#fff'; c.shadowBlur = 3 * K; c.beginPath(); c.moveTo(16, 0); c.quadraticCurveTo(12, -17, -4, -16); c.quadraticCurveTo(-20, -14, -20, 2); c.stroke(); c.restore(); });
  add('svet', 30, 22, c => { c.fillStyle = 'rgba(255,255,255,0.5)'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(-2, s * 6, 8, 3.2, s * 0.5, 0, M.TAU); c.fill(); } radial(c, 6, [[0, 1], [0.4, 0.9], [1, 0]]); });
  add('jelly', 44, 50, c => {
    const g = c.createLinearGradient(0, -18, 0, 6); g.addColorStop(0, 'rgba(160,255,230,0.6)'); g.addColorStop(1, 'rgba(20,80,70,0.55)');
    c.fillStyle = g; c.beginPath(); c.moveTo(-17, 4); c.quadraticCurveTo(-17, -18, 0, -19); c.quadraticCurveTo(17, -18, 17, 4); c.quadraticCurveTo(0, 0, -17, 4); c.fill();
    c.strokeStyle = 'rgba(200,255,240,0.6)'; c.lineWidth = 1; for (const x of [-9, 0, 9]) { c.beginPath(); c.moveTo(x, 3); c.bezierCurveTo(x + 4, 10, x - 4, 15, x + 2, 23); c.stroke(); }
  });
  add('jellyG', 44, 50, c => { c.save(); c.strokeStyle = '#fff'; c.shadowColor = '#fff'; c.shadowBlur = 3 * K; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-17, 4); c.quadraticCurveTo(-17, -18, 0, -19); c.quadraticCurveTo(17, -18, 17, 4); c.stroke(); c.restore(); radial(c, 7, [[0, 0.9], [1, 0]]); });
  for (let i = 0; i < 3; i++) { // скали: осветени от пулсара отдясно
    const g = S.rng(300 + i * 13), n = 10, P = [];
    for (let k = 0; k < n; k++) { const a = k / n * M.TAU, rr = 50 * g.range(0.72, 1); P.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
    add('rock' + i, 108, 108, c => {
      c.beginPath(); poly(c, P); const gr = c.createLinearGradient(-50, 0, 50, 0); gr.addColorStop(0, '#07080e'); gr.addColorStop(0.6, '#1a2234'); gr.addColorStop(1, '#55688e'); c.fillStyle = gr; c.fill();
      c.save(); c.clip(); for (let k = 0; k < 14; k++) { const x = g.range(-40, 40), y = g.range(-40, 40), r = g.range(3, 9); c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.arc(x, y, r, 0, M.TAU); c.fill(); c.fillStyle = 'rgba(160,190,255,0.12)'; c.beginPath(); c.arc(x + r * 0.35, y, r * 0.75, -1.2, 1.2); c.fill(); } c.restore();
    });
    add('rockG' + i, 108, 108, c => { c.save(); c.beginPath(); poly(c, P); c.clip(); c.strokeStyle = '#fff'; c.lineWidth = 4; c.shadowColor = '#fff'; c.shadowBlur = 4 * K; c.beginPath(); poly(c, P.map(([x, y]) => [x + 2.5, y])); c.stroke(); c.restore(); });
  }
  const STAR = []; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6, r = i % 2 ? 8 : 19; STAR.push([Math.cos(a) * r, Math.sin(a) * r]); }
  add('zvezda', 42, 42, c => { body(c, [STAR], '#3a3060', '#0c0a1c', 40); c.strokeStyle = 'rgba(200,190,255,0.3)'; c.lineWidth = 0.8; c.beginPath(); poly(c, STAR); c.stroke(); });
  add('zvezdaG', 42, 42, c => { lines(c, [STAR], 1, 2.5, 0.85); radial(c, 5, [[0, 1], [1, 0]]); });
  add('kometa', 34, 26, c => { radial(c, 9, [[0, 1], [0.5, 0.8], [1, 0]]); c.fillStyle = '#fff'; c.beginPath(); poly(c, [[10, 0], [2, -6], [-6, -3], [-4, 0], [-6, 3], [2, 6]]); c.fill(); });
  add('gnezdo', 40, 30, c => { body(c, [[[-17, 12], [-12, -2], [-4, -9], [4, -9], [12, -2], [17, 12]]], '#4a1820', '#120408', 24); c.fillStyle = '#050102'; c.beginPath(); c.arc(0, 0, 5, 0, M.TAU); c.fill(); });
  add('gnezdoG', 40, 30, c => { lines(c, [[[-17, 12], [-12, -2], [-4, -9], [4, -9], [12, -2], [17, 12]]], 1, 2.5, 0.8); radial(c, 4, [[0, 1], [1, 0]]); });
  add('cube', 34, 34, c => { const P = [[-12, -12], [12, -12], [12, 12], [-12, 12]]; c.fillStyle = 'rgba(20,4,10,0.9)'; c.beginPath(); poly(c, P); c.fill(); lines(c, [P, open([[-12, 0], [12, 0]]), open([[0, -12], [0, 12]])], 1, 2, 0.85); });
  // Медуза: камбаната
  add('bell', 124, 86, c => {
    const g = c.createLinearGradient(0, -40, 0, 30); g.addColorStop(0, 'rgba(170,255,230,0.55)'); g.addColorStop(0.6, 'rgba(40,140,120,0.45)'); g.addColorStop(1, 'rgba(10,50,45,0.3)');
    c.fillStyle = g; c.beginPath(); c.moveTo(-58, 22); c.bezierCurveTo(-60, -40, 60, -40, 58, 22); c.bezierCurveTo(30, 12, -30, 12, -58, 22); c.fill();
    c.strokeStyle = 'rgba(220,255,245,0.35)'; c.lineWidth = 1; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * 8, -28 + Math.abs(i) * 2); c.quadraticCurveTo(i * 14, -6, i * 17, 16); c.stroke(); }
  });
  add('bellG', 124, 86, c => { c.save(); c.strokeStyle = '#fff'; c.shadowColor = '#fff'; c.shadowBlur = 4 * K; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-58, 22); c.bezierCurveTo(-60, -40, 60, -40, 58, 22); c.stroke(); c.lineWidth = 1; c.beginPath(); c.moveTo(-58, 22); c.bezierCurveTo(-30, 12, 30, 12, 58, 22); c.stroke(); c.restore(); });
  // Метроном: кула с рамо и тежест
  add('metFrame', 90, 120, c => {
    body(c, [[[-30, 56], [-12, -54], [12, -54], [30, 56]]], '#2c3450', '#0a0c18', 110);
    c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 0.8; c.beginPath(); for (let y = -40; y <= 50; y += 10) { const hw = 12 + (y + 54) / 110 * 18; c.moveTo(-hw + 4, y); c.lineTo(-hw + 10, y); c.moveTo(hw - 10, y); c.lineTo(hw - 4, y); } c.stroke();
  });
  add('metFrameG', 90, 120, c => { lines(c, [[[-30, 56], [-12, -54], [12, -54], [30, 56]]], 1, 2.5, 0.75); radial(c, 6, [[0, 1], [1, 0]]); });
  add('bob', 80, 80, c => { const P = hexP(32, Math.PI / 6); body(c, [P], '#3a2a5e', '#0c0818', 64); c.fillStyle = '#040208'; c.beginPath(); c.arc(0, 0, 13, 0, M.TAU); c.fill(); c.strokeStyle = 'rgba(210,190,255,0.3)'; c.lineWidth = 0.8; c.beginPath(); poly(c, P); c.stroke(); });
  add('bobG', 80, 80, c => { lines(c, [hexP(32, Math.PI / 6)], 1.2, 3, 0.85); c.save(); c.strokeStyle = '#fff'; c.lineWidth = 1.2; c.shadowColor = '#fff'; c.shadowBlur = 3 * K; c.beginPath(); c.arc(0, 0, 13, 0, M.TAU); c.stroke(); c.restore(); });
  // Дисонансът: око в ядро
  add('eye', 120, 120, c => {
    const g = c.createRadialGradient(0, 0, 10, 0, 0, 54); g.addColorStop(0, '#2a0610'); g.addColorStop(1, '#060104');
    c.fillStyle = g; c.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * M.TAU, r = i % 2 ? 46 : 54; c[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill();
    c.fillStyle = '#000'; c.beginPath(); c.ellipse(0, 0, 30, 16, 0, 0, M.TAU); c.fill();
  });
  add('eyeG', 120, 120, c => {
    c.save(); c.strokeStyle = '#fff'; c.shadowColor = '#fff'; c.shadowBlur = 3 * K; c.lineWidth = 1.2; c.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * M.TAU, r = i % 2 ? 46 : 54; c[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.stroke();
    c.lineWidth = 1.6; c.beginPath(); c.ellipse(0, 0, 30, 16, 0, 0, M.TAU); c.stroke(); c.restore();
  });
  add('pupil', 30, 30, c => { radial(c, 15, [[0, 1], [0.3, 0.95], [0.6, 0.4], [1, 0]]); c.fillStyle = 'rgba(0,0,0,0.85)'; c.beginPath(); c.ellipse(0, 0, 2.2, 9, 0, 0, M.TAU); c.fill(); });
  pack();
  A.canvas = cv;
  return cv;
};
})();
