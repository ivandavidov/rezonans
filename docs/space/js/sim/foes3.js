// Враговете на нива 4–6. Логика само — видът им е в js/look.js.
(function () {
'use strict';
const S = (typeof window !== 'undefined' ? window : globalThis).SPACE, M = S.M;
const ring = (W, x, y, n, spd, off, k, c) => { for (let i = 0; i < n; i++) S.efire(W, x, y, off + i * M.TAU / n, spd, k || 'orb', c || 'ebul'); };

// ── Призрак (ниво 4): невидим се приближава, проявява се, стреля, изчезва отново ──
S.defFoe('prizrak', {
  hp: 6, r: 18, score: 500, cr: 2, ch: 0.05, boom: 1,
  init(e, o, W) { e.cloak = true; e.st = 0; e.k = 70 + W.r.int(0, 60); e.n = 0; e.vis = 0; e.ox = W.r.range(250, 380); e.oy = W.r.sign() * W.r.range(40, 140); },
  upd(e, W) {
    const p = W.p; e.rot = Math.PI;
    if (e.st === 0) { // невидим: приближава се до точка пред кораба
      const tx = M.clamp(p.x + e.ox, 420, S.W - 60), ty = M.clamp(p.y + e.oy, 50, S.H - 50);
      e.x = M.lerp(e.x, tx, 0.025); e.y = M.lerp(e.y, ty, 0.025);
      if (--e.k <= 0) { e.st = 1; e.k = 24; e.cloak = false; W.ev.push({ k: 'decloak', x: e.x, y: e.y }); }
    } else if (e.st === 1) { // проява: трептене, после залп
      if (--e.k <= 0) {
        if (S.canFire(W, e)) { const a = S.aimA(W, e.x, e.y); for (let j = -1; j <= 1; j++) S.efire(W, e.x, e.y, a + j * 0.14, 3.6, 'orb', 'ebul'); if (W.dn > 0) ring(W, e.x, e.y, 6, 2.2, a, 'orb', 'ebul'); W.ev.push({ k: 'efire', x: e.x, y: e.y }); }
        e.st = 2; e.k = 60;
      }
    } else if (e.st === 2) { if (--e.k <= 0) { e.cloak = true; e.st = ++e.n >= 3 ? 3 : 0; e.k = 90 + W.r.int(0, 50); e.ox = W.r.range(250, 380); e.oy = W.r.sign() * W.r.range(40, 140); } }
    else { e.x -= 4; }
    e.vis = M.approach(e.vis, e.cloak ? 0 : 1, 0.08);
  },
});

// ── Светулка (ниво 4): малка, свети сама — вижда се в мъглата; рояк по примки ──
S.defFoe('svetulka', {
  hp: 1.5, r: 11, score: 120, cr: 1, ch: 0.02, boom: 1, light: 70,
  init(e, o, W) { e.y0 = o.y; e.spd = o.spd || 3.6; e.ph = (o.i || 0) * 0.7; e.cool = 60 + W.r.int(0, 100); },
  upd(e, W) {
    e.x -= e.spd; e.y = e.y0 + Math.sin(e.t * 0.05 + e.ph) * 60 + Math.sin(e.t * 0.017) * 30;
    if (--e.cool <= 0) { e.cool = Math.round((160 + W.r.int(0, 100)) / W.diff.rate); if (S.canFire(W, e) && W.r() < 0.5) S.efire(W, e.x, e.y, S.aimA(W, e.x, e.y), 3.2, 'orb', 'ebul'); }
  },
});

// ── Медузка („pipalo“, ниво 4): бавно се носи и пулсира с електрически пръстен ──
S.defFoe('pipalo', {
  hp: 10, r: 20, score: 600, cr: 3, ch: 0.06, boom: 2, note: true, light: 110,
  init(e, o, W) { e.y0 = o.y; e.spd = o.spd || 1.3; e.cool = 70; e.pulse = 0; },
  upd(e, W) {
    e.x -= e.spd; e.y = e.y0 + Math.sin(e.t * 0.02) * 30; e.pulse = Math.max(0, e.pulse - 0.05);
    if (--e.cool <= 0) { e.cool = Math.round(130 / W.diff.rate); if (e.x < S.W - 40 && e.x > 60) { ring(W, e.x, e.y + 6, W.dn === 0 ? 8 : 12, 2.3, e.t * 0.1, 'orb', 'ebul'); e.pulse = 1; W.ev.push({ k: 'zap', x: e.x, y: e.y }); } }
  },
});

// ── Скала (ниво 5): неразрушима; крие от импулса на пулсара ──
S.defFoe('skala', {
  hp: 1e6, r: 50, score: 0, cr: 0, ch: 0, boom: 2, hazard: true, rock: true, nocount: true,
  armor: () => 0,
  init(e, o, W) { e.r = o.r || W.r.range(42, 66); e.vx = o.vx || -W.r.range(0.9, 1.4); e.vy = o.vy || W.r.range(-0.15, 0.15); e.vr = W.r.range(-0.006, 0.006); e.shape = W.r.int(0, 2); e.rot = W.r() * M.TAU; },
  upd(e) { e.x += e.vx; e.y += e.vy; e.rot += e.vr; },
});

// ── Звездичка (ниво 5): спира и изпраща залпове на равни интервали — в такт ──
S.defFoe('zvezda', {
  hp: 8, r: 18, score: 550, cr: 3, ch: 0.05, boom: 1, note: true,
  init(e, o) { e.tx = o.tx || 1040; e.st = 0; e.n = 0; e.cool = 30; e.spin = 0; },
  upd(e, W) {
    e.spin += 0.06;
    if (e.st === 0) { e.x = M.lerp(e.x, e.tx, 0.05); if (Math.abs(e.x - e.tx) < 4) e.st = 1; }
    else if (e.st === 1) {
      if (--e.cool <= 0) { e.cool = 60; ring(W, e.x, e.y, W.dn === 0 ? 6 : 8, 2.8, e.spin + (e.n % 2) * 0.4, e.n % 2 ? 'ndl' : 'orb', 'ebul'); W.ev.push({ k: 'ring', x: e.x, y: e.y }); if (++e.n >= 5) e.st = 2; }
    } else e.x += 2.5;
  },
});

// ── Комета (ниво 5): бърза, оставя опашка от бавни кълба ──
S.defFoe('kometa', {
  hp: 4, r: 15, score: 350, cr: 2, ch: 0.04, boom: 1,
  init(e, o) { e.vx = -(o.spd || 6.5); e.vy = o.vy || 0; },
  upd(e, W) {
    e.x += e.vx; e.y += e.vy; e.rot = Math.atan2(e.vy, e.vx);
    if (e.t % 9 === 0 && e.x < S.W && e.x > 0) { const a = e.rot + Math.PI + (W.r() - 0.5) * 1.2; S.efire(W, e.x, e.y, a, 0.6, 'orb', 'ebul2'); }
  },
});

// ── Кула („gnezdo“, ниво 6): върху стената на коридора; носи се със стената ──
S.defFoe('gnezdo', {
  hp: 6, r: 17, score: 400, cr: 2, ch: 0.04, boom: 1,
  init(e, o, W) { e.side = o.side || 1; e.cool = 50 + W.r.int(0, 60); e.aim = Math.PI; },
  upd(e, W) {
    e.x -= W.sspd;
    const k = Math.max(W.wallK, 0.35);
    e.y = e.side > 0 ? S.wallTop(e.x, W.scroll, k) + 14 : S.wallBot(e.x, W.scroll, k) - 14;
    e.aim = S.aimA(W, e.x, e.y); e.rot = e.side > 0 ? Math.PI / 2 : -Math.PI / 2;
    if (--e.cool <= 0) { e.cool = Math.round(110 / W.diff.rate); if (S.canFire(W, e)) { S.efire(W, e.x, e.y, e.aim, 3.8, 'ndl', 'ebul'); if (W.dn === 2) S.efire(W, e.x, e.y, e.aim + 0.2, 3.8, 'ndl', 'ebul'); W.ev.push({ k: 'efire', x: e.x, y: e.y }); } }
  },
});

// ── Мираж („glitch“, ниво 6): изчезва и се появява на ново място (първо се вижда знак), стреля, пак прескача ──
S.defFoe('glitch', {
  hp: 6, r: 17, score: 500, cr: 2, ch: 0.05, boom: 1,
  init(e, o, W) { e.k = 40; e.n = 0; e.tx = e.x; e.ty = e.y; e.st = 0; },
  upd(e, W) {
    e.rot = Math.PI;
    if (e.st === 0) { e.x = M.lerp(e.x, e.tx < S.W ? e.tx : 1050, 0.06); if (--e.k <= 0) { e.st = 1; e.k = 34; e.tx = W.r.range(520, 1180); e.ty = W.r.range(80, S.H - 80); W.ev.push({ k: 'gmark', x: e.tx, y: e.ty }); } }
    else if (e.st === 1) { e.cloak = e.k < 10; if (--e.k <= 0) { e.px = e.x = e.tx; e.py = e.y = e.ty; e.cloak = false; W.ev.push({ k: 'blink', x: e.x, y: e.y }); if (S.canFire(W, e)) { const a = S.aimA(W, e.x, e.y); for (let j = -2; j <= 2; j++) S.efire(W, e.x, e.y, a + j * 0.18, 3.4, 'ndl', 'ebul'); } e.st = ++e.n >= 4 ? 2 : 0; e.k = 70; } }
    else { e.x += 3; }
  },
});
})();
