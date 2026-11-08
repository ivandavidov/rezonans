// Босовете на нива 4–6: Медузата, Метрономът, Ядрото („disonans“).
(function () {
'use strict';
const S = (typeof window !== 'undefined' ? window : globalThis).SPACE, M = S.M;
const ring = (W, x, y, n, spd, off, k, c) => { for (let i = 0; i < n; i++) S.efire(W, x, y, off + i * M.TAU / n, spd, k || 'orb', c || 'ebul'); };

// ── Медуза (ниво 4): камбаната се свива (щит) и разтваря (уязвима) с електрически пръстен;
// шест пипала висят и се люшкат, две от тях посягат към кораба; допирът с пипало наранява ──
const TN = 6, TJ = 10, TS = 15;
S.defFoe('meduza', {
  name: 'Медузата', boss: true, phaseTxt: { 2: 'Медузата е ранена', 3: 'Медузата побесня' }, hp: 520, r: 44, score: 60000, cr: 90, ch: 0, boom: 3, light: 420,
  block: e => e.st === 'enter' || e.closed,
  init(e) {
    e.st = 'enter'; e.tx = 960; e.ft = 0; e.closed = true; e.open = 0; e.ph = 1; e.atk = null; e.at = 0; e.cd = 100; e.ai = 0;
    e.tent = [];
    for (let i = 0; i < TN; i++) { const pts = []; for (let j = 0; j < TJ; j++) pts.push({ x: e.x + (i - 2.5) * 13, y: e.y + 26 + j * TS }); e.tent.push({ pts, g: 0, grab: 0, tx: 0, ty: 0 }); }
  },
  upd(e, W) {
    const rate = W.diff.rate * (e.ph === 3 ? 1.3 : 1), p = W.p;
    if (e.st === 'enter') { e.x = M.lerp(e.x, e.tx, 0.022); if (Math.abs(e.x - e.tx) < 3) { e.st = 'fight'; W.ev.push({ k: 'bossgo', x: e.x, y: e.y }); } }
    else { e.ft++; e.y = S.H * 0.42 + Math.sin(e.ft * 0.006) * 110; e.x = e.tx + Math.sin(e.ft * 0.0045) * 60; }
    if (e.ph === 1 && e.hp < e.mhp * 0.6) { e.ph = 2; W.ev.push({ k: 'phase', n: 2, x: e.x, y: e.y }); }
    if (e.ph === 2 && e.hp < e.mhp * 0.3) { e.ph = 3; W.ev.push({ k: 'phase', n: 3, x: e.x, y: e.y }); }
    // камбаната: 30 % свита, 70 % разтворена; при разтваряне — електрически пръстен
    const per = e.ph === 3 ? 115 : 150, cyc = e.ft % per, was = e.closed;
    e.closed = e.st !== 'fight' || cyc < per * 0.3;
    e.open = M.approach(e.open, e.closed ? 0 : 1, 0.07);
    if (was && !e.closed) { ring(W, e.x, e.y + 10, W.dn === 0 ? 10 : W.dn === 2 ? 18 : 14, 2.4, e.ft * 0.05, 'orb', 'ebul'); W.ev.push({ k: 'zap', x: e.x, y: e.y }); }
    // пипалата: висят и се люшкат; хванатите посягат към кораба (най-много на 430)
    for (let i = 0; i < TN; i++) {
      const T = e.tent[i], rx = e.x + (i - 2.5) * 13, ry = e.y + 24;
      if (T.grab > 0) { T.grab--; T.tx = M.lerp(T.tx, p.x, 0.04); T.ty = M.lerp(T.ty, p.y, 0.04); }
      T.g = M.approach(T.g, T.grab > 0 ? 1 : 0, 0.03);
      let dx = T.tx - rx, dy = T.ty - ry; const dl = Math.hypot(dx, dy) || 1, reach = Math.min(dl, 430); dx = dx / dl * reach; dy = dy / dl * reach;
      for (let j = 0; j < TJ; j++) {
        const q = j / (TJ - 1), P = T.pts[j];
        const hx = rx + Math.sin(e.t * 0.04 + i * 0.9 + j * 0.35) * j * 2.4 + (i - 2.5) * j * 1.5, hy = ry + j * TS;
        const gx = rx + dx * q, gy = ry + dy * q, w = T.g * Math.pow(q, 0.7);
        P.px = P.x; P.py = P.y;
        P.x = M.lerp(P.x, M.lerp(hx, gx, w), 0.3); P.y = M.lerp(P.y, M.lerp(hy, gy, w), 0.3);
        if (j >= 3 && p.alive && M.d2(P.x, P.y, p.x, p.y) < (9 + p.r) * (9 + p.r)) S.hurtPlayer(W, p);
      }
    }
    if (e.st !== 'fight') return;
    if (!e.atk) { if (--e.cd > 0) return; e.atk = ['grab', 'spit', e.ph >= 2 ? 'swarm' : 'grab', e.ph === 3 ? 'arcs' : 'spit'][e.ai++ % 4]; e.at = 0; }
    const t = ++e.at;
    if (e.atk === 'grab') { // две пипала посягат
      if (t === 1) { const a = e.ai % 3, b = 5 - a; for (const i of [a, b]) { const T = e.tent[i]; T.grab = 120; T.tx = T.pts[TJ - 1].x; T.ty = T.pts[TJ - 1].y; } W.ev.push({ k: 'roar', x: e.x, y: e.y }); }
      if (e.ph >= 2 && t % 30 === 15) for (const T of e.tent) if (T.grab > 0) { const P = T.pts[TJ - 1]; S.efire(W, P.x, P.y, S.aimA(W, P.x, P.y), 3.4, 'orb', 'ebul'); }
      if (t > 130) idle(e, rate);
    } else if (e.atk === 'spit') { // ветрило от камбаната, само когато е разтворена
      if (!e.closed && t % 18 === 0 && t <= 72 && S.canFire(W, e)) { const a = S.aimA(W, e.x, e.y); for (let j = -2; j <= 2; j++) S.efire(W, e.x - 20, e.y, a + j * 0.13, 3.6, 'ndl', 'ebul'); W.ev.push({ k: 'efire', x: e.x, y: e.y }); }
      if (t > 90) idle(e, rate);
    } else if (e.atk === 'swarm') {
      if (t === 1) W.A.line('svetulka', { x: S.W + 30, y: W.r.range(120, S.H - 120), n: 6, gap: 50 });
      if (t > 50) idle(e, rate);
    } else if (e.atk === 'arcs') { // фаза 3: лъчи от върховете на пипалата
      if (t === 1) for (const i of [1, 4]) { const P = e.tent[i].pts[TJ - 1]; S.laser(W, { own: e, x: P.x, y: P.y, a: S.aimA(W, P.x, P.y), tele: 55, dur: 45, w: 16, c: 'violet', ti: i }); }
      for (const L of W.lz) if (L.own === e && L.ti != null) { const P = e.tent[L.ti].pts[TJ - 1]; L.x = P.x; L.y = P.y; }
      if (t > 110) idle(e, rate);
    }
  },
});
function idle(e, rate) { e.atk = null; e.cd = Math.round(60 / rate) + 20; }

// ── Метроном (ниво 5): махало над кораба; всеки удар на такта — залп; темпото расте с фазите ──
// целта е тежестта на махалото (самият бос); рамката и рамото са само картина
S.defFoe('metronom', {
  name: 'Метрономът', boss: true, phaseTxt: {}, hp: 470, r: 36, score: 70000, cr: 100, ch: 0, boom: 3,
  block: e => e.st === 'enter',
  init(e) { e.st = 'enter'; e.pvx = S.W + 260; e.pvy = 70; e.tx = 1010; e.arm = 330; e.amp = 0.5; e.bpm = 120; e.bp = 0; e.beat = 0; e.ph = 1; e.th = 0; place(e); },
  upd(e, W) {
    if (e.st === 'enter') { e.pvx = M.lerp(e.pvx, e.tx, 0.025); if (Math.abs(e.pvx - e.tx) < 3) { e.st = 'fight'; W.ev.push({ k: 'bossgo', x: e.x, y: e.y }, { k: 'tempo', bpm: e.bpm }); } place(e); return; }
    if (e.ph === 1 && e.hp < e.mhp * 0.6) { e.ph = 2; e.bpm = 140; e.amp = 0.66; W.ev.push({ k: 'phase', n: 2, x: e.x, y: e.y }, { k: 'tempo', bpm: e.bpm }); }
    if (e.ph === 2 && e.hp < e.mhp * 0.3) { e.ph = 3; e.bpm = 160; e.amp = 0.8; W.ev.push({ k: 'phase', n: 3, x: e.x, y: e.y }, { k: 'tempo', bpm: e.bpm }); }
    e.bp += e.bpm / 3600; place(e);
    const b = Math.floor(e.bp);
    if (b > e.beat) { e.beat = b; onBeat(e, W, b); }
  },
});
function place(e) { e.th = e.amp * Math.sin(Math.PI * e.bp); e.x = e.pvx + Math.sin(e.th) * e.arm; e.y = e.pvy + Math.cos(e.th) * e.arm; }
function onBeat(e, W, b) {
  const k = b % 8, bt = Math.round(3600 / e.bpm), sp = 2.4 + e.ph * 0.35;
  W.ev.push({ k: 'beat', x: e.x, y: e.y, n: k });
  if (k % 2 === 0) ring(W, e.x, e.y, (W.dn === 0 ? 7 : W.dn === 2 ? 12 : 10) + e.ph * 2, sp, b * 0.21, 'orb', 'ebul');
  else { const a = S.aimA(W, e.x, e.y); for (let j = -1; j <= 1; j++) S.efire(W, e.x, e.y, a + j * 0.16, sp + 1.4, 'ndl', 'ebul2'); }
  if (k === 3 || (e.ph === 3 && k === 7)) S.laser(W, { own: e, x: e.pvx, y: e.pvy, a: Math.atan2(W.p.y - e.pvy, W.p.x - e.pvx), tele: bt * 2, dur: bt, w: 20, c: 'violet' });
}

// ── Ядрото („disonans“, ниво 6, финал): око в ядро с два въртящи се пръстена щит (изстрелите минават само през пролуките);
// фаза 2 — пръстените се пукат, решетка от лъчи и прескачане; фаза 3 — завеси от изстрели с пролука и спирала ──
S.defFoe('disonans', {
  name: 'Ядрото', boss: true, phaseTxt: { 2: 'Пръстените се разпаднаха', 3: 'Ядрото се разпада' }, hp: 950, r: 52, score: 150000, cr: 160, ch: 0, boom: 3, light: 440,
  block: e => e.st === 'enter',
  armor(e, W, src) {
    if (e.ph !== 1 || !src || src.beam) return e.ph === 1 && src && src.beam ? 0.35 : 1;
    const a = Math.atan2(src.y - e.y, src.x - e.x);
    for (const R of e.rings) { const seg = M.TAU / R.gaps, rel = ((a - R.rot) % seg + seg) % seg; if (rel > R.gw) return 0; }
    return 1;
  },
  init(e) {
    e.st = 'enter'; e.tx = 980; e.ft = 0; e.ph = 1; e.atk = null; e.at = 0; e.cd = 110; e.ai = 0; e.a1 = 0; e.a2 = 0; e.gap = S.H / 2; e.anchor = 0;
    e.rings = [{ r: 86, rot: 0, spd: 0.013, gaps: 3, gw: 1.45 }, { r: 116, rot: 1, spd: -0.009, gaps: 4, gw: 1.15 }]; // открити ~69 % и ~73 %
  },
  upd(e, W) {
    const rate = W.diff.rate;
    if (e.st === 'enter') { e.x = M.lerp(e.x, e.tx, 0.02); if (Math.abs(e.x - e.tx) < 3) { e.st = 'fight'; W.ev.push({ k: 'bossgo', x: e.x, y: e.y }); } return; }
    e.ft++;
    for (const R of e.rings) R.rot += R.spd * (e.ph === 1 ? 1 : 0);
    if (e.ph === 1 && e.hp < e.mhp * 0.8) { e.ph = 2; e.atk = null; e.cd = 70; W.lz = W.lz.filter(L => L.own !== e); W.ev.push({ k: 'phase', n: 2, x: e.x, y: e.y }, { k: 'ringbreak', x: e.x, y: e.y }); }
    if (e.ph === 2 && e.hp < e.mhp * 0.38) { e.ph = 3; e.atk = null; e.cd = 70; W.lz = W.lz.filter(L => L.own !== e); W.ev.push({ k: 'phase', n: 3, x: e.x, y: e.y }); }
    if (e.ph !== 2) { e.x = M.lerp(e.x, e.tx + Math.sin(e.ft * 0.005) * 50, 0.05); e.y = M.lerp(e.y, S.H / 2 + Math.sin(e.ft * 0.007) * (e.ph === 3 ? 60 : 120), 0.05); }
    if (!e.atk) { if (--e.cd > 0) return; const L = e.ph === 1 ? ['inter', 'burst', 'inter', 'burst'] : e.ph === 2 ? ['jump', 'grid', 'jump', 'swarm', 'grid'] : ['curtain', 'spiral', 'curtain', 'burst']; e.atk = L[e.ai++ % L.length]; e.at = 0; }
    const t = ++e.at;
    if (e.atk === 'inter') { // две спирали в различно темпо — интерференция
      if (t % 6 === 0) { for (let k = 0; k < 3; k++) { S.efire(W, e.x, e.y, e.a1 + k * M.TAU / 3, 2.6, 'orb', 'ebul'); S.efire(W, e.x, e.y, e.a2 + k * M.TAU / 3, 2.2, 'ndl', 'ebul2'); } e.a1 += 0.12; e.a2 -= 0.075; }
      if (t > 200) idle2(e, rate, 50);
    } else if (e.atk === 'burst') {
      if (t % 26 === 1 && t < 110) { const a = S.aimA(W, e.x, e.y), n = W.dn === 0 ? 5 : 9; for (let j = 0; j < n; j++) S.efire(W, e.x - 30, e.y, a + (j - (n - 1) / 2) * 0.12, 4, 'ndl', 'ebul'); W.ev.push({ k: 'efire', x: e.x, y: e.y }); }
      if (t > 130) idle2(e, rate, 45);
    } else if (e.atk === 'jump') { // прескача (белег, после е там) и пуска пръстен
      if (t === 1) { e.anchor = (e.anchor + 1 + W.r.int(0, 1)) % 3; e.jx = [980, 860, 1080][e.anchor]; e.jy = [S.H / 2, 170, S.H - 170][e.anchor]; W.ev.push({ k: 'gmark', x: e.jx, y: e.jy }); }
      if (t === 40) { e.px = e.x = e.jx; e.py = e.y = e.jy; W.ev.push({ k: 'blink', x: e.x, y: e.y }); ring(W, e.x, e.y, W.dn === 0 ? 12 : 18, 2.6, t * 0.3, 'orb', 'ebul'); }
      if (t > 70) idle2(e, rate, 30);
    } else if (e.atk === 'grid') { // решетка: три хоризонтални и два вертикални лъча
      if (t === 1) { const off = W.r.range(-60, 60); for (const y of [150, 360, 570]) S.laser(W, { own: e, x: S.W + 40, y: y + off, a: Math.PI, tele: 60, dur: 50, w: 18, c: 'ebul' }); }
      if (t === 70) for (const x of [W.r.range(250, 450), W.r.range(600, 800)]) S.laser(W, { own: e, x, y: -20, a: Math.PI / 2, tele: 60, dur: 50, w: 18, c: 'violet' });
      if (t > 190) idle2(e, rate, 40);
    } else if (e.atk === 'swarm') {
      if (t === 1) { W.A.one('glitch', { x: S.W + 40, y: 160 }); W.A.one('glitch', { x: S.W + 40, y: S.H - 160 }); }
      if (t > 40) idle2(e, rate, 30);
    } else if (e.atk === 'curtain') { // завеса: колони от изстрели с пролука, която се вие
      if (t % 16 === 0) { e.gap = S.H / 2 + Math.sin(t * 0.035) * 200; for (let y = 30; y < S.H; y += 46) if (Math.abs(y - e.gap) > (W.dn === 0 ? 110 : 85)) S.efire(W, e.x - 40, y, Math.PI, 2.6, 'orb', y % 92 < 46 ? 'ebul' : 'ebul2'); }
      if (t > 220) idle2(e, rate, 50);
    } else if (e.atk === 'spiral') {
      if (t % 5 === 0) { for (let k = 0; k < 4; k++) S.efire(W, e.x, e.y, e.a1 + k * M.TAU / 4, 2.4, 'orb', 'ebul'); e.a1 += 0.15; }
      if (t > 160) idle2(e, rate, 40);
    }
  },
});
function idle2(e, rate, n) { e.atk = null; e.cd = Math.round(n / rate) + 15; }
})();
