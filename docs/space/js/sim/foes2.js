// Враговете на нива 2 и 3. Логика само — видът им е в js/look.js.
(function () {
'use strict';
const S = (typeof window !== 'undefined' ? window : globalThis).SPACE, M = S.M;
const ring = (W, x, y, n, spd, off, k, c) => { for (let i = 0; i < n; i++) S.efire(W, x, y, off + i * M.TAU / n, spd, k || 'orb', c || 'ebul'); };

// ── Кристал (ниво 2): плаващ резонансен кристал; пречупва Импулса и Ветрилото на два, счупен — пръска шрапнели ──
S.defFoe('kristal', {
  hp: 10, r: 26, score: 120, cr: 2, ch: 0.02, boom: 2, hazard: true, refract: true,
  init(e, o, W) { e.vx = o.vx || -W.r.range(1.0, 1.8); e.vy = o.vy || W.r.range(-0.25, 0.25); e.vr = W.r.range(-0.012, 0.012); e.shape = W.r.int(0, 2); e.rot = W.r() * M.TAU; e.sc = o.sc || W.r.range(0.85, 1.25); e.r *= e.sc; e.hp = e.mhp = e.hp * e.sc; },
  upd(e) { e.x += e.vx; e.y += e.vy; e.rot += e.vr; },
  die(e, W) { ring(W, e.x, e.y, W.dn === 0 ? 6 : 8, 2.4, e.rot, 'ndl', 'ebul'); W.ev.push({ k: 'shatter', x: e.x, y: e.y }); },
});

// ── Щитоносец: щит отпред (към кораба); уязвим отгоре, отдолу, отзад — за Вълната и ракетите щитът не пречи ──
S.defFoe('shtit', {
  hp: 14, r: 21, score: 650, cr: 3, ch: 0.06, boom: 2, note: true,
  armor(e, W, src) { return src && !src.beam && src.x < e.x - e.r * 0.3 && Math.abs(src.y - e.y) < e.r * 0.95 ? 0 : 1; },
  init(e, o) { e.tx = o.tx || 1020; e.cool = 70; e.life = 0; },
  upd(e, W) {
    e.life++;
    if (e.life < 560) { e.x = M.lerp(e.x, e.tx, 0.03); e.y += M.clamp((W.p.y - e.y) * 0.012, -1.1, 1.1); }
    else e.x -= 2.2;
    e.rot = Math.PI;
    if (--e.cool <= 0) {
      e.cool = Math.round(120 / W.diff.rate);
      if (S.canFire(W, e)) { const a = S.aimA(W, e.x, e.y); for (let j = -1; j <= 1; j++) S.efire(W, e.x - 18, e.y, a + j * 0.13, 3.8, 'orb', 'ebul'); W.ev.push({ k: 'efire', x: e.x, y: e.y }); }
    }
  },
});

// ── Прожектор („lachemet“): малък триъгълник; спира и изстрелва къс лъч напред (с предупреждение), после се изтегля ──
S.defFoe('lachemet', {
  hp: 6, r: 16, score: 400, cr: 2, ch: 0.04, boom: 1,
  init(e, o) { e.tx = o.tx || 1080; e.st = 0; e.n = 0; e.k = 0; e.leave = o.y < S.H / 2 ? -1 : 1; },
  upd(e, W) {
    e.rot = Math.PI;
    if (e.st === 0) { e.x = M.lerp(e.x, e.tx, 0.05); if (Math.abs(e.x - e.tx) < 4) { e.st = 1; e.k = 30; } }
    else if (e.st === 1) {
      e.y += M.clamp((W.p.y - e.y) * 0.02, -1.2, 1.2);
      if (--e.k <= 0) { e.L = S.laser(W, { own: e, x: e.x - 18, y: e.y, a: Math.PI, tele: Math.round(55 / Math.sqrt(W.diff.rate)), dur: 40, w: 14 }); e.st = 2; }
    } else if (e.st === 2) {
      if (e.L) { e.L.x = e.x - 18; e.L.y = e.y; }
      if (!e.L || e.L.dead) { e.L = null; if (++e.n >= 2) e.st = 3; else { e.st = 1; e.k = 50; } }
    } else { e.vy = (e.vy || 0) + 0.12 * e.leave; e.y += e.vy; e.x += 0.5; }
  },
});

// ── Миноносец („minyor“): бавно прекосява и пуска мини ──
S.defFoe('minyor', {
  hp: 8, r: 19, score: 500, cr: 3, ch: 0.05, boom: 2, note: true,
  init(e, o) { e.y0 = o.y; e.spd = o.spd || 1.5; e.cool = 50; },
  upd(e, W) {
    e.x -= e.spd; e.y = e.y0 + Math.sin(e.t * 0.025) * 40; e.rot = Math.PI;
    if (--e.cool <= 0 && e.x < S.W - 40 && e.x > 80) { e.cool = Math.round(75 / Math.sqrt(W.diff.rate)); W.A.many('mina', [{ x: e.x + 12, y: e.y }]); W.ev.push({ k: 'drop', x: e.x, y: e.y }); }
  },
});
// мина: стои (носи се с фона), след 40 такта е заредена; близо до кораба или след време — пръстен от изстрели
S.defFoe('mina', {
  hp: 2, r: 11, score: 60, cr: 0, ch: 0.01, boom: 1, hazard: true,
  init(e, o, W) { e.vx = -W.lv.sspd * 0.8; e.fuse = 0; },
  upd(e, W) {
    e.x += e.vx; e.rot += 0.04;
    if (e.t < 40) return;
    const p = W.p;
    if (!e.fuse && p.alive && M.d2(e.x, e.y, p.x, p.y) < 95 * 95) e.fuse = 26;
    if (!e.fuse && e.t > 480) e.fuse = 26;
    if (e.fuse && --e.fuse === 0) { ring(W, e.x, e.y, W.dn === 0 ? 8 : W.dn === 2 ? 14 : 11, 2.5, e.rot, 'orb', 'ebul'); e.nosc = true; W.ev.push({ k: 'mine', x: e.x, y: e.y }); S.kill(W, e); }
  },
});

// ── Клетка („delitel“): отскача от краищата; убита — дели се на две по-малки (три размера) ──
const DSZ = [0, { r: 10, hp: 1.5, score: 80 }, { r: 16, hp: 4, score: 160 }, { r: 24, hp: 9, score: 300 }];
S.defFoe('delitel', {
  hp: 9, r: 24, score: 300, cr: 1, ch: 0.02, boom: 1,
  init(e, o, W) { e.tier = o.tier || 3; const z = DSZ[e.tier]; e.r = z.r; e.hp = e.mhp = z.hp * W.diff.hp; e.vx = o.vx || -2.2; e.vy = o.vy || (W.r.sign() * W.r.range(0.8, 1.6)); e.vr = W.r.range(-0.05, 0.05); },
  upd(e, W) {
    e.x += e.vx; e.y += e.vy; e.rot += e.vr;
    if (e.y < e.r + 10 && e.vy < 0 || e.y > S.H - e.r - 10 && e.vy > 0) e.vy = -e.vy;
  },
  die(e, W) {
    if (e.tier <= 1) return;
    for (const s of [-1, 1]) {
      const m = S.base(W, S.FOES.delitel, e.x, e.y, { tier: e.tier - 1, vx: e.vx * 1.1 + 0.4 * s, vy: s * W.r.range(1.4, 2.4) });
      m.in = true; W.foes.push(m); W.spawned++; W.spawnedF++;
    }
  },
});
S.FOES.delitel.scoreOf = e => DSZ[e.tier].score;

// ── Вихрушка (ниво 3): върти се в примки и пръска на четири посоки ──
S.defFoe('vihar', {
  hp: 7, r: 18, score: 450, cr: 2, ch: 0.04, boom: 1,
  init(e, o, W) { e.cx = e.x; e.cy = o.y; e.ang = o.ph || 0; e.rad = o.rad || 70; e.spd = o.spd || 2.1; e.cool = 60 + (o.i || 0) * 20; e.spin = 0; },
  upd(e, W) {
    e.cx -= e.spd; e.ang += 0.045; e.spin += 0.2;
    e.x = e.cx + Math.cos(e.ang) * e.rad; e.y = e.cy + Math.sin(e.ang) * e.rad;
    if (--e.cool <= 0) { e.cool = Math.round(100 / W.diff.rate); if (S.canFire(W, e)) { ring(W, e.x, e.y, 4, 3, e.spin, 'orb', 'ebul'); W.ev.push({ k: 'efire', x: e.x, y: e.y }); } }
  },
});

// ── Антена („gromo“, ниво 3): виси горе/долу, зарежда и насочва мълния към кораба ──
S.defFoe('gromo', {
  hp: 12, r: 18, score: 700, cr: 4, ch: 0.07, boom: 2, note: true,
  init(e, o) { e.tx = o.tx || 1000; e.ty = o.y; e.st = 0; e.k = 0; e.n = 0; },
  upd(e, W) {
    e.rot = 0;
    if (e.st === 0) { e.x = M.lerp(e.x, e.tx, 0.04); if (Math.abs(e.x - e.tx) < 5) { e.st = 1; e.k = 0; } }
    else if (e.st === 1) {
      e.k++; e.y = e.ty + Math.sin(e.t * 0.05) * 8;
      if (e.k === 60) { S.bolt(W, M.clamp(W.p.x + W.r.range(-30, 60), 60, S.W - 60), Math.round(70 / Math.sqrt(W.diff.rate))); W.ev.push({ k: 'charge', x: e.x, y: e.y }); }
      if (e.k >= 120) { e.k = 0; if (++e.n >= 3) e.st = 2; }
    } else e.x += 3;
  },
});

// ── Буревестник (ниво 3): бърз, гмурка се по дъга от ъгъла към кораба и излиза вляво ──
S.defFoe('burevest', {
  hp: 2.5, r: 15, score: 220, cr: 1, ch: 0.025, boom: 1,
  init(e, o, W) { e.side = o.side || 1; e.vx = -(o.spd || 6); e.vy = e.side * 4.5; e.shot = false; },
  upd(e, W) {
    e.vy += -e.side * 0.11 + M.clamp((W.p.y - e.y) * 0.0012, -0.08, 0.08);
    e.x += e.vx; e.y += e.vy;
    e.rot = Math.atan2(e.vy, e.vx);
    if (!e.shot && e.x < S.W * 0.62 && S.canFire(W, e)) { e.shot = true; if (W.r() < 0.6 * W.diff.rate) { S.efire(W, e.x, e.y, S.aimA(W, e.x, e.y), 4, 'ndl', 'ebul'); W.ev.push({ k: 'efire', x: e.x, y: e.y }); } }
  },
});
})();
