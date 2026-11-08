// Босовете. Ядрото мести частите си (e.parts) и решава атаките; частите стрелят сами.
(function () {
'use strict';
const S = (typeof window !== 'undefined' ? window : globalThis).SPACE, M = S.M;

// ── Стражът (ниво 1): пръстен-станция с шест кули около ядро със щит ──
// фаза 1: кулите стрелят, пръстенът се върти и изпраща залпове; ядрото е под щит, докато има кули
// фаза 2: открито ядро — спирала, лъчи, ветрило от игли, рояк; фаза 3 (под 40 %) — по-бързо и по-гъсто
const RING = 122;
function posPods(e) {
  for (const q of e.parts) {
    if (q.dead) continue;
    const a = e.rot + q.i * M.TAU / 6;
    q.px = q.x; q.py = q.y; q.x = e.x + Math.cos(a) * RING; q.y = e.y + Math.sin(a) * RING; q.ang = a;
  }
}
const ORDER = ['spiral', 'laser', 'fan', 'spiral', 'swarm', 'laser', 'fan'];

S.defFoe('strazh', {
  name: 'Стражът', boss: true, phaseTxt: { 2: 'Стражът остана без щит', 3: 'Стражът прегрява' }, hp: 420, r: 44, score: 30000, cr: 50, ch: 0, boom: 3,
  block: e => e.st === 'enter' || e.pods > 0,
  init(e, o, W) {
    e.st = 'enter'; e.tx = 960; e.rot = 0; e.vr = 0.007; e.pods = 6; e.ph = 1; e.ft = 0;
    e.atk = null; e.at = 0; e.cd = 120; e.vol = 200; e.ai = 0; e.ang = 0; e.dir = 1;
    e.parts = [];
    for (let i = 0; i < 6; i++) { const q = S.base(W, S.FOES.strazhPod, e.x, e.y, {}); q.par = e; q.i = i; q.cool = 70 + i * 22; e.parts.push(q); }
    posPods(e);
  },
  upd(e, W) {
    const rate = W.diff.rate * (e.ph === 3 ? 1.35 : 1);
    if (e.st === 'enter') {
      e.x = M.lerp(e.x, e.tx, 0.022);
      if (Math.abs(e.x - e.tx) < 3) { e.st = 'fight'; W.ev.push({ k: 'bossgo', x: e.x, y: e.y }); }
    } else {
      e.ft++;
      e.y = S.H / 2 + Math.sin(e.ft * 0.006) * (e.ph === 1 ? 120 : 90);
      e.x = e.tx + Math.sin(e.ft * 0.004) * 40;
    }
    e.rot += e.vr; posPods(e);
    if (e.st !== 'fight') return;
    if (e.ph === 1) {
      if (--e.vol <= 0) { // залп: всяка кула пуска дъга навън
        e.vol = Math.round(250 / rate); e.vr = 0.007 + 0.0025 * (6 - e.pods); // пръстенът се върти все в една посока — всяка кула минава отпред
        for (const q of e.parts) if (!q.dead) for (let j = -2; j <= 2; j++) S.efire(W, q.x, q.y, q.ang + j * 0.22, 2.7, 'orb', 'ebul');
        W.ev.push({ k: 'ring', x: e.x, y: e.y });
      }
      return;
    }
    if (e.ph === 2 && e.hp < e.mhp * 0.4) { e.ph = 3; e.atk = null; e.cd = 60; W.lz.length = 0; W.ev.push({ k: 'phase', n: 3, x: e.x, y: e.y }); }
    if (!e.atk) {
      if (--e.cd > 0) {
        if (e.cd % Math.round(45 / rate) === 0 && S.canFire(W, e)) S.efire(W, e.x - 30, e.y, S.aimA(W, e.x, e.y), 3.6, 'orb', 'ebul2');
        return;
      }
      e.atk = ORDER[e.ai++ % ORDER.length]; e.at = 0; e.dir = -e.dir;
    }
    const a = e.atk, t = ++e.at;
    if (a === 'spiral') {
      const arms = e.ph === 3 ? 4 : 3, every = e.ph === 3 ? 4 : 5;
      if (t % every === 0) { for (let k = 0; k < arms; k++) S.efire(W, e.x, e.y, e.ang + k * M.TAU / arms, 2.9, 'orb', 'ebul'); e.ang += 0.17 * e.dir; }
      if (t % 30 === 0) W.ev.push({ k: 'efire', x: e.x, y: e.y });
      if (t > 200) done(e, rate);
    } else if (a === 'laser') {
      if (t === 1) {
        const a0 = S.aimA(W, e.x, e.y), n = e.ph === 3 ? 3 : 1;
        for (let k = 0; k < n; k++) S.laser(W, { own: e, x: e.x, y: e.y, a: a0 + (k - (n - 1) / 2) * 0.38, tele: Math.round(58 / Math.sqrt(W.diff.rate)), dur: 70, w: 22 });
      }
      for (const L of W.lz) if (L.own === e) { L.x = e.x - 20; L.y = e.y; }
      if (t > 150) done(e, rate);
    } else if (a === 'fan') {
      if (t % 34 === 1 && t < 110) { const a0 = S.aimA(W, e.x, e.y), n = W.dn === 0 ? 5 : 7; for (let k = 0; k < n; k++) S.efire(W, e.x - 30, e.y, a0 + (k - (n - 1) / 2) * 0.16, 4.2, 'ndl', 'ebul2'); W.ev.push({ k: 'efire', x: e.x, y: e.y }); }
      if (t > 130) done(e, rate);
    } else if (a === 'swarm') {
      if (t === 1) { W.A.line('iskra', { x: S.W + 40, y: 110, n: 5, amp: 40 }); W.A.line('iskra', { x: S.W + 40, y: S.H - 110, n: 5, amp: 40, ph: Math.PI }); }
      if (t > 90) done(e, rate);
    }
  },
  die(e, W) { for (const q of e.parts) if (!q.dead) q.dead = true; },
});
function done(e, rate) { e.atk = null; e.cd = Math.round((e.ph === 3 ? 50 : 75) / rate) + 20; }

S.defFoe('strazhPod', {
  hp: 48, r: 19, score: 2500, cr: 5, ch: 0.12, boom: 2, part: true,
  block: e => e.par.st === 'enter',
  upd(e, W) {
    const P = e.par; e.aim = S.aimA(W, e.x, e.y);
    if (P.st !== 'fight' || --e.cool > 0) return;
    e.cool = Math.round((115 + W.r.int(0, 70)) / W.diff.rate);
    if (!W.p.alive || e.x < W.p.x + 60) return;
    const n = P.pods <= 3 && W.dn > 0 ? 3 : 1;
    for (let j = 0; j < n; j++) S.efire(W, e.x, e.y, e.aim + (j - (n - 1) / 2) * 0.15, 4.0, 'ndl', 'ebul2');
    W.ev.push({ k: 'efire', x: e.x, y: e.y });
  },
  die(e, W) {
    const P = e.par; P.pods--;
    if (P.pods === 0) { P.ph = 2; P.cd = 90; P.vr *= 0.4; W.ev.push({ k: 'phase', n: 2, x: P.x, y: P.y }); }
  },
});
})();
