// Враговете на „Шума“ и как се появяват (формации). Логика само — видът им е в js/look.js.
(function () {
'use strict';
const S = (typeof window !== 'undefined' ? window : globalThis).SPACE, M = S.M;

// вражески изстрел: k — вид ('orb' кълбо, 'ndl' игла), c — цвят ('ebul' розов, 'ebul2' кехлибарен)
S.efire = function (W, x, y, a, spd, k, c) {
  spd *= W.diff.bs;
  W.eb.push({ x, y, px: x, py: y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, a, r: k === 'ndl' ? 4 : 6, k: k || 'orb', c: c || 'ebul', t: 0 });
};
S.aimA = (W, x, y) => Math.atan2(W.p.y - y, W.p.x - x);
// стреля само когато е честно: в кадъра, не твърде близо, играчът е жив
S.canFire = (W, e) => W.p.alive && e.x < S.W - 30 && e.x > 40 && e.y > 20 && e.y < S.H - 20 && e.x > W.p.x + 90 && M.d2(e.x, e.y, W.p.x, W.p.y) > 170 * 170;

S.base = base;
function base(W, def, x, y, o) {
  const e = { id: ++W.nid, d: def, x, y, px: x, py: y, vx: 0, vy: 0, hp: def.hp * W.diff.hp, r: def.r, t: 0, g: 0, flash: 0, rot: Math.PI, in: false, dead: false, o };
  e.mhp = e.hp;
  if (def.init) def.init(e, o || {}, W);
  return e;
}

// API на сценария: A.line(...), A.one(...), A.v(...) — всяка формация е група; цялата унищожена → нота
S.spawner = function (W) {
  const add = (type, list, gopt) => {
    const def = S.FOES[type]; if (!def) throw new Error('Няма враг „' + type + '“');
    const gid = def.hazard ? 0 : ++W.gid;
    if (gid) W.groups.set(gid, { n: list.length, killed: 0, gone: 0, note: !(gopt && gopt.note === false) && list.length > 1, x: 0, y: 0 });
    for (const m of list) { const e = base(W, def, m.x, m.y, m); e.g = gid; W.foes.push(e); W.spawned++; if (!def.hazard) W.spawnedF++; }
  };
  return {
    // n в редица отдясно, на интервал gap; o се предава на всеки (path, amp, fq, spd …)
    line(type, o) {
      const n = o.n || 5, gap = o.gap || 46, L = [];
      for (let i = 0; i < n; i++) L.push(Object.assign({}, o, { x: (o.x || S.W + 40) + i * gap, y: o.y, i }));
      add(type, L, o);
    },
    // клин: водачът отпред, другите назад и встрани
    v(type, o) {
      const n = o.n || 5, gap = o.gap || 44, L = [];
      for (let i = 0; i < n; i++) { const k = Math.ceil(i / 2) * (i % 2 ? -1 : 1); L.push(Object.assign({}, o, { x: (o.x || S.W + 40) + Math.abs(k) * gap, y: o.y + k * gap * 0.8, i })); }
      add(type, L, o);
    },
    one(type, o) { add(type, [Object.assign({ x: S.W + 60 }, o)], o); },
    many(type, list, o) { add(type, list, o || {}); },
    banner(t, s) { W.ev.push({ k: 'banner', t, s }); },
    warn(name, sub) { W.ev.push({ k: 'warn', t: name, s: sub }); },
    wind(x, y) { W.windTo.x = x; W.windTo.y = y; W.ev.push({ k: 'wind', x, y }); },
    walls(k) { W.wallTo = k; },
    // пулсар: на Лесно — по-рядко (12 удара) и с по-дълго предупреждение; на Трудно — по-кратко предупреждение
    pulsar(period) { W.pulsar = period ? { t: 0, period: W.dn === 0 ? period * 1.5 : period, tele: [140, 115, 90][W.dn], dur: 14, on: false } : null; },
    // мини-бос: половин здраве, при смърт сценарият продължава
    miniboss(type, o) {
      this.boss(type, o); const e = W.boss; e.mini = true;
      e.hp = e.mhp = e.mhp * 0.35; for (const q of e.parts || []) q.hp = q.mhp = q.mhp * 0.45;
    },
    storm(every) { W.storm = every ? { every, n: 0 } : null; },
    bolt(x) { S.bolt(W, x); },
    // бос: ядрото и частите му (части — в e.parts, добавя ги init на боса)
    boss(type, o) {
      const def = S.FOES[type], e = base(W, def, S.W + 240, S.H / 2, o || {});
      W.foes.push(e); W.boss = e; W.spawned++; W.spawnedF++;
      for (const q of e.parts || []) { W.foes.push(q); if (!q.d.nocount) { W.spawned++; W.spawnedF++; } }
      W.ev.push({ k: 'boss', t: def.name });
    },
  };
};

// ── Искра: малък кристален дротик; лети на рояк по синусоида, гмурка се или прави дъга ──
S.defFoe('iskra', {
  hp: 1, r: 13, score: 100, cr: 1, ch: 0.02, boom: 1,
  init(e, o, W) { e.y0 = o.y; e.spd = o.spd || 4.4; e.amp = o.amp == null ? 70 : o.amp; e.fq = o.fq || 0.011; e.ph = (o.ph || 0) + (o.i || 0) * 0.0; e.path = o.path || 'sine'; e.cool = 40 + W.r.int(0, 120); },
  upd(e, W) {
    if (e.path === 'sine') { e.x -= e.spd; e.y = e.y0 + e.amp * Math.sin(e.x * e.fq + e.ph); }
    else if (e.path === 'dive') { // влиза, насочва се към височината на кораба, после се отклонява
      e.x -= e.spd;
      if (e.x < S.W - 60 && e.x > 380) e.y += M.clamp((W.p.y - e.y) * 0.025, -2.6, 2.6);
    } else if (e.path === 'arc') { // от горе/долу по дъга
      const k = M.clamp(e.t / 150, 0, 1), s = e.o.side || 1;
      e.x -= e.spd * (0.6 + k * 0.6); e.y = e.y0 + s * (Math.sin(k * Math.PI * 0.5) * (e.o.dy || 260));
    }
    const vx = e.x - e.px, vy = e.y - e.py; if (vx || vy) e.rot = Math.atan2(vy, vx);
    if (--e.cool <= 0) {
      e.cool = Math.round((150 + W.r.int(0, 160)) / W.diff.rate);
      if (S.canFire(W, e) && W.r() < 0.5 * W.diff.rate) { S.efire(W, e.x, e.y, S.aimA(W, e.x, e.y), 3.6, 'orb'); W.ev.push({ k: 'efire', x: e.x, y: e.y }); }
    }
  },
});

// ── Копие: влиза, прицелва се по височина (свети), после се хвърля напред ──
S.defFoe('kopie', {
  hp: 5, r: 15, score: 250, cr: 2, ch: 0.05, boom: 2,
  init(e, o) { e.tx = o.tx || 1040; e.st = 0; e.k = 0; },
  upd(e, W) {
    if (e.st === 0) {
      e.x = M.lerp(e.x, e.tx, 0.06); e.y += M.clamp((W.p.y - e.y) * 0.03, -2, 2);
      if (Math.abs(e.x - e.tx) < 6 || e.t > 100) { e.st = 1; e.k = 0; W.ev.push({ k: 'tele', x: e.x, y: e.y }); }
    } else if (e.st === 1) {
      e.k++; e.y += M.clamp((W.p.y - e.y) * 0.06, -3.2, 3.2); e.x += 0.4;
      if (e.k > 38) { e.st = 2; e.vx = -3; W.ev.push({ k: 'dash', x: e.x, y: e.y }); }
    } else { e.vx = Math.max(-16 * W.diff.bs, e.vx - 0.9); e.x += e.vx; }
    e.rot = Math.PI;
  },
});

// ── Венец: шестоъгълна корона; спира, върти се и изстрелва пръстени, после се изтегля ──
S.defFoe('venets', {
  hp: 32, r: 30, score: 900, cr: 6, ch: 0.14, boom: 3, note: true,
  init(e, o) { e.tx = o.tx || 1030; e.ty = o.y; e.st = 0; e.n = 0; e.max = o.rings || 4; e.cool = 50; e.spin = 0; e.leave = o.y < S.H / 2 ? -1 : 1; },
  upd(e, W) {
    e.spin += e.st === 1 ? 0.03 : 0.012;
    if (e.st === 0) { e.x = M.lerp(e.x, e.tx, 0.035); if (Math.abs(e.x - e.tx) < 4) e.st = 1; }
    else if (e.st === 1) {
      e.y = e.ty + Math.sin(e.t * 0.02) * 18;
      if (--e.cool <= 0) {
        e.cool = Math.round(78 / W.diff.rate) + 10;
        const n = W.dn === 0 ? 10 : W.dn === 2 ? 16 : 13, off = (e.n % 2) * Math.PI / n + e.spin;
        for (let i = 0; i < n; i++) S.efire(W, e.x, e.y, off + i * M.TAU / n, 2.9, 'orb', 'ebul');
        if (e.n % 2 && W.dn > 0) for (let j = -1; j <= 1; j++) S.efire(W, e.x, e.y, S.aimA(W, e.x, e.y) + j * 0.16, 4.4, 'ndl', 'ebul2');
        W.ev.push({ k: 'ring', x: e.x, y: e.y });
        if (++e.n >= e.max) { e.st = 2; e.vy = 0; }
      }
    } else { e.vy += 0.08 * e.leave; e.y += e.vy; e.x += 0.6; }
  },
});

// ── Лед: отломък от пръстените; не стреля, големият се пука на три малки ──
S.defFoe('led', {
  hp: 4, r: 24, score: 30, cr: 1, ch: 0.01, boom: 1, hazard: true,
  init(e, o, W) { e.vx = o.vx || -W.r.range(1.2, 2.6); e.vy = o.vy || W.r.range(-0.3, 0.3); e.vr = W.r.range(-0.03, 0.03); e.big = o.big !== false; e.shape = W.r.int(0, 2); e.rot = W.r() * M.TAU; if (!e.big) { e.r = 12; e.hp = e.mhp = 1; } },
  upd(e) { e.x += e.vx; e.y += e.vy; e.rot += e.vr; },
  die(e, W) {
    if (!e.big) return;
    for (let i = 0; i < 3; i++) {
      const a = i * M.TAU / 3 + W.r() * 0.8, m = base(W, S.FOES.led, e.x, e.y, { big: false, vx: e.vx * 0.6 + Math.cos(a) * 1.8, vy: Math.sin(a) * 1.8 });
      m.in = true; W.foes.push(m);
    }
  },
});
// ── Носач: тежък товарен кораб, прекосява екрана; унищожен пуска кристал за оръжие ──
S.defFoe('nosach', {
  hp: 16, r: 30, score: 1500, cr: 6, ch: 0.08, boom: 2,
  init(e, o, W) { e.y0 = o.y; e.spd = o.spd || 1.7; e.cool = 90; e.w0 = W.r.int(0, 3); },
  upd(e, W) {
    e.x -= e.spd; e.y = e.y0 + Math.sin(e.t * 0.02) * 26; e.rot = Math.PI;
    if (--e.cool <= 0) {
      e.cool = Math.round(150 / W.diff.rate);
      if (W.dn > 0 && S.canFire(W, e)) { S.efire(W, e.x - 24, e.y, S.aimA(W, e.x, e.y), 3.4, 'orb', 'ebul2'); W.ev.push({ k: 'efire', x: e.x, y: e.y }); }
    }
  },
  die(e, W) { W.items.push({ k: 'wpn', x: e.x, y: e.y, px: e.x, py: e.y, vx: -1.0, vy: 0, t: 0, w0: e.w0, w: S.WORDER[e.w0] }); W.ev.push({ k: 'drop', x: e.x, y: e.y }); },
});
})();
