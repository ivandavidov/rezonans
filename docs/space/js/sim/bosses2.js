// Босовете на нива 2 и 3.
(function () {
'use strict';
const S = (typeof window !== 'undefined' ? window : globalThis).SPACE, M = S.M;

// ── Призма (ниво 2): голям кристал; лъч, който се разлага на спектър от три, залпове от върховете;
// под 55 % се разцепва на три по-малки призми, които кръжат около общ център ──
const PORDER = ['spectrum', 'shards', 'spectrum', 'crystals', 'shards'];
S.defFoe('prizma', {
  name: 'Призмата', boss: true, phaseTxt: { 2: 'Призмата се разцепи на три' }, hp: 520, r: 50, score: 40000, cr: 60, ch: 0, boom: 3,
  block: e => e.st === 'enter' || e.split,
  init(e) { e.st = 'enter'; e.tx = 990; e.rot = 0; e.ph = 1; e.atk = null; e.at = 0; e.cd = 90; e.ai = 0; e.ft = 0; e.parts = []; e.split = false; e.left = 0; },
  upd(e, W) {
    const rate = W.diff.rate;
    if (e.st === 'enter') { e.x = M.lerp(e.x, e.tx, 0.022); e.rot += 0.01; if (Math.abs(e.x - e.tx) < 3) { e.st = 'fight'; W.ev.push({ k: 'bossgo', x: e.x, y: e.y }); } return; }
    e.ft++;
    if (e.split) { e.x = e.tx - 40 + Math.sin(e.ft * 0.006) * 70; e.y = S.H / 2 + Math.sin(e.ft * 0.0095) * 140; return; }
    e.y = S.H / 2 + Math.sin(e.ft * 0.007) * 130; e.rot += 0.012;
    if (e.hp < e.mhp * 0.55) return split(e, W);
    if (!e.atk) {
      if (--e.cd > 0) { if (e.cd % Math.round(50 / rate) === 0 && S.canFire(W, e)) S.efire(W, e.x - 40, e.y, S.aimA(W, e.x, e.y), 3.6, 'orb', 'ebul'); return; }
      e.atk = PORDER[e.ai++ % PORDER.length]; e.at = 0;
    }
    const t = ++e.at;
    if (e.atk === 'spectrum') { // лъч, разложен на три цвята: средният към кораба, другите — встрани, с различно закъснение
      if (t === 1) { const a0 = S.aimA(W, e.x, e.y); ['ebul2', 'ebul', 'violet'].forEach((c, k) => S.laser(W, { own: e, x: e.x, y: e.y, a: a0 + (k - 1) * 0.3, tele: Math.round((48 + k * 14) / Math.sqrt(rate)), dur: 46, w: 18, c })); }
      for (const L of W.lz) if (L.own === e) { L.x = e.x - 30; L.y = e.y; }
      if (t > 150) done(e, rate);
    } else if (e.atk === 'shards') { // от трите върха — ветрила от игли
      if (t % 22 === 1 && t < 110) for (let k = 0; k < 3; k++) { const va = e.rot + k * M.TAU / 3, vx = e.x + Math.cos(va) * 50, vy = e.y + Math.sin(va) * 50; for (let j = -2; j <= 2; j++) S.efire(W, vx, vy, va + j * 0.18, 3.2, 'ndl', 'ebul'); }
      if (t % 22 === 1) W.ev.push({ k: 'ring', x: e.x, y: e.y });
      if (t > 130) done(e, rate);
    } else if (e.atk === 'crystals') { // пуска кристали — пречупват изстрелите ти, но се пукат на шрапнели
      if (t === 1) W.A.many('kristal', [{ x: e.x - 60, y: e.y - 120, vx: -1.6, sc: 0.9 }, { x: e.x - 60, y: e.y + 120, vx: -1.6, sc: 0.9 }]);
      if (t > 60) done(e, rate);
    }
  },
  die(e) { for (const q of e.parts) q.dead = true; },
});
function done(e, rate) { e.atk = null; e.cd = Math.round(70 / rate) + 20; }
function split(e, W) {
  e.split = true; e.ph = 2; W.lz = W.lz.filter(L => L.own !== e);
  const each = e.mhp * 0.55 / 3; e.mhp *= 0.45; e.hp = 0; // лентата продължава непрекъснато от 55 %
  for (let k = 0; k < 3; k++) {
    const q = S.base(W, S.FOES.prizmaS, e.x, e.y, {}); q.par = e; q.i = k; q.hp = q.mhp = each; q.ang = e.rot + k * M.TAU / 3; q.cool = 40 + k * 30; q.in = true;
    e.parts.push(q); W.foes.push(q); W.spawned++; W.spawnedF++;
  }
  e.left = 3; W.ev.push({ k: 'split', x: e.x, y: e.y }, { k: 'phase', n: 2, x: e.x, y: e.y });
}
S.defFoe('prizmaS', {
  hp: 60, r: 28, score: 6000, cr: 12, ch: 0.1, boom: 2, part: true,
  upd(e, W) {
    const P = e.par, n = P.left, rate = W.diff.rate * (n === 1 ? 1.5 : n === 2 ? 1.2 : 1);
    e.px = e.x; e.py = e.y;
    e.ang += 0.011 * (4 - n); e.rot = (e.rot || 0) + 0.03;
    const R = n === 1 ? 40 : 160, tx = P.x + Math.cos(e.ang) * R, ty = P.y + Math.sin(e.ang) * R * 0.9;
    e.x = M.lerp(e.x, tx, 0.06); e.y = M.lerp(e.y, ty, 0.06);
    if (--e.cool > 0) return;
    e.cool = Math.round((n === 1 ? 70 : 120) / rate) + W.r.int(0, 30);
    if (n === 1 && W.r() < 0.5) { S.laser(W, { own: e, x: e.x, y: e.y, a: S.aimA(W, e.x, e.y), tele: 50, dur: 40, w: 16, c: 'violet' }); return; }
    const a = S.aimA(W, e.x, e.y), m = n === 1 ? 7 : 3;
    for (let j = 0; j < m; j++) S.efire(W, e.x, e.y, a + (j - (m - 1) / 2) * 0.15, 3.8, 'ndl', 'ebul');
    W.ev.push({ k: 'efire', x: e.x, y: e.y });
  },
  die(e, W) {
    const P = e.par; P.left--;
    if (P.left === 2 || P.left === 1) W.ev.push({ k: 'phase', n: P.left === 1 ? 3 : 2, x: e.x, y: e.y, txt: P.left === 1 ? 'Остана последната' : 'Остават още две' });
    if (P.left === 0) { P.x = P.px = e.x; P.y = P.py = e.y; P.split = false; S.kill(W, P); }
  },
});

// ── Змеят („leviatan“, ниво 3): огромна змия от брони; главата е под щит, докато свети някой от четирите възела ──
const SEGS = 16, SP = 8, NODES = [3, 6, 9, 12];
S.defFoe('leviatan', {
  name: 'Змеят', boss: true, phaseTxt: { 2: 'Главата вече е открита', 3: 'Змеят побесня' }, hp: 430, r: 40, score: 50000, cr: 80, ch: 0, boom: 3,
  block: e => e.st === 'enter' || e.nodes > 0,
  init(e, o, W) {
    e.x = e.px = S.W + 260; e.y = e.py = 160; e.ang = Math.PI; e.spd = 3.3; e.st = 'enter'; e.ph = 1; e.nodes = NODES.length;
    e.wp = { x: 900, y: 300 }; e.hist = []; e.parts = []; e.cd = 140; e.atk = null; e.at = 0; e.ai = 0; e.dive = 0;
    for (let i = 0; i < 400; i++) e.hist.push({ x: e.x + i * 0.5, y: e.y, a: Math.PI });
    // възлите са първи в списъка — изстрелът, който ги улучи, не отскача от бронята под тях
    for (const i of NODES) { const q = S.base(W, S.FOES.levNode, e.x, e.y, {}); q.par = e; q.i = i; e.parts.push(q); }
    for (let i = 0; i < SEGS; i++) { const q = S.base(W, S.FOES.levPlate, e.x, e.y, {}); q.par = e; q.i = i; q.sc = 1 - i * 0.03; q.r *= q.sc; e.parts.push(q); }
    place(e);
  },
  upd(e, W) {
    const rate = W.diff.rate * (e.ph === 3 ? 1.3 : 1);
    // завива плавно към точката; стигне ли я — нова (понякога гмуркане извън екрана)
    const want = Math.atan2(e.wp.y - e.y, e.wp.x - e.x), turn = e.ph === 3 ? 0.05 : 0.04;
    e.ang += M.clamp(M.wrapA(want - e.ang), -turn, turn);
    const br = e.atk === 'breath' && e.at < 60; // докато диша, главата се изправя срещу кораба и забавя — прозорец за удар
    if (br) e.wp = { x: M.clamp(W.p.x + 460, 640, 1180), y: W.p.y };
    const sp = e.spd * (e.ph === 3 ? 1.15 : 1) * (e.st === 'enter' ? 1.2 : 1) * (br ? 0.55 : 1);
    e.x += Math.cos(e.ang) * sp; e.y += Math.sin(e.ang) * sp;
    if (M.d2(e.x, e.y, e.wp.x, e.wp.y) < 70 * 70) {
      if (e.st === 'enter') { e.st = 'fight'; W.ev.push({ k: 'bossgo', x: e.x, y: e.y }); }
      e.dive = e.dive > 0 ? e.dive - 1 : W.r() < 0.18 ? 2 : 0;
      e.wp = e.dive === 2 ? { x: W.r.range(600, 1100), y: W.r() < 0.5 ? -200 : S.H + 200 } : { x: W.r.range(600, 1180), y: W.r.range(90, S.H - 90) };
    }
    e.hist.unshift({ x: e.x, y: e.y, a: e.ang }); if (e.hist.length > SEGS * SP + 4) e.hist.pop();
    place(e);
    if (e.st !== 'fight') return;
    if (e.ph === 1 && e.nodes === 0) { e.ph = 2; e.cd = 60; W.ev.push({ k: 'phase', n: 2, x: e.x, y: e.y }); }
    if (e.ph === 2 && e.hp < e.mhp * 0.4) { e.ph = 3; W.ev.push({ k: 'phase', n: 3, x: e.x, y: e.y }); }
    const vis = e.x > 20 && e.x < S.W - 20 && e.y > 20 && e.y < S.H - 20;
    if (!e.atk) { if (--e.cd > 0) return; e.atk = ['breath', 'scales', 'breath', e.ph === 3 ? 'storm' : 'scales'][e.ai++ % 4]; e.at = 0; }
    const t = ++e.at;
    if (e.atk === 'breath') { // дъх: ветрило по посоката на главата, само ако е в кадъра
      if (vis && t % 12 === 0 && t >= 24 && t <= 72) { for (let j = -3; j <= 3; j++) S.efire(W, e.x, e.y, e.ang + j * 0.14, 3.4, 'orb', 'ebul'); W.ev.push({ k: 'roar', x: e.x, y: e.y }); }
      if (t > 90) idle(e, rate);
    } else if (e.atk === 'scales') { // люспи: всяка видима броня пуска игла настрани
      if (t === 1 || t === 30) { for (const q of e.parts) if (!q.dead && q.d.id === 'levPlate' && q.i % 2 === (t === 1 ? 0 : 1) && q.x > 30 && q.x < S.W - 30 && q.y > 20 && q.y < S.H - 20) { const n = q.ang + Math.PI / 2; S.efire(W, q.x, q.y, n, 2.6, 'ndl', 'ebul'); S.efire(W, q.x, q.y, n + Math.PI, 2.6, 'ndl', 'ebul'); } W.ev.push({ k: 'efire', x: e.x, y: e.y }); }
      if (t > 60) idle(e, rate);
    } else if (e.atk === 'storm') { // фаза 3: вика мълнии над кораба
      if (t % 40 === 1 && t < 120) S.bolt(W, M.clamp(W.p.x + W.r.range(-40, 80), 60, S.W - 60), 60);
      if (t > 130) idle(e, rate);
    }
  },
  die(e) { for (const q of e.parts) q.dead = true; },
});
function idle(e, rate) { e.atk = null; e.cd = Math.round((e.ph === 3 ? 45 : 70) / rate) + 15; }
function place(e) {
  for (const q of e.parts) {
    if (q.dead) continue;
    const h = e.hist[Math.min(e.hist.length - 1, (q.i + 1) * SP)];
    q.px = q.x; q.py = q.y; q.x = h.x; q.y = h.y; q.ang = h.a;
  }
}
// бронята: отбива изстрелите, удря при допир; не се брои за унищожаване
S.defFoe('levPlate', {
  hp: 1e6, r: 22, score: 0, cr: 0, ch: 0, boom: 1, part: true, nocount: true,
  armor: () => 0,
  upd() {},
});
// възел: светеща точка върху бронята; четирите трябва да паднат, за да падне щитът на главата
S.defFoe('levNode', {
  hp: 34, r: 16, score: 4000, cr: 8, ch: 0.12, boom: 2, part: true,
  block: e => e.par.st === 'enter',
  upd() {},
  die(e) { e.par.nodes--; },
});
})();
