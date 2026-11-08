// Логиката на света: играч, изстрели, скала, предмети, сблъсъци, сценарий на нивото.
// Без DOM и без Math.random — само W.r (семенен), за да е детерминирано (dev/sim.js).
// Навън говори само със събития в W.ev ({k:'boom', x, y, …}) — от тях живеят звукът и ефектите.
(function () {
'use strict';
const S = (typeof window !== 'undefined' ? window : globalThis).SPACE, M = S.M;

S.FOES = {}; S.LEVELS = {};
S.defFoe = (id, d) => { if (S.FOES[id]) throw new Error('Врагът „' + id + '“ вече е зададен'); d.id = id; S.FOES[id] = d; return d; };
S.defLevel = (n, d) => { if (S.LEVELS[n]) throw new Error('Ниво ' + n + ' вече е зададено'); d.n = n; S.LEVELS[n] = d; return d; };

S.DIFF = [
  { id: 0, name: 'Лесно', hp: 0.8, bs: 0.82, rate: 0.55, lives: 4 },
  { id: 1, name: 'Нормално', hp: 1, bs: 1, rate: 1, lives: 3 },
  { id: 2, name: 'Трудно', hp: 1.3, bs: 1.15, rate: 1.5, lives: 2 },
];

// Скалата: всяка нота мести курсора с едно поле; „вземи“ прилага маркираното поле.
S.SCALE = [
  { id: 'spd', name: 'Скорост', max: 4, lv: p => p.spd, take: p => { p.spd++; } },
  { id: 'gun', name: 'Оръдие', max: 5, lv: p => p.pow, take: p => { p.pow++; } },
  { id: 'msl', name: 'Ракети', max: 3, lv: p => p.msl, take: p => { p.msl++; } },
  { id: 'echo', name: 'Ехо', max: 2, lv: p => p.echo, take: p => { p.echo++; } },
  { id: 'shd', name: 'Щит', max: 3, lv: p => p.shield, take: p => { p.shield = 3; } },
  { id: 'res', name: 'Резонанс', max: 1, lv: p => p.charge >= 1 ? 1 : 0, take: p => { p.charge = 1; } },
];

// стените на коридора (ниво 6): горен и долен ръб при екранно x; k — колко са навлезли (0 — няма стени)
S.wallTop = (x, sc, k) => k * (62 + 38 * Math.sin((x + sc) * 0.0042) + 22 * Math.sin((x + sc) * 0.0113 + 1.3));
S.wallBot = (x, sc, k) => S.H - k * (62 + 38 * Math.sin((x + sc) * 0.0037 + 2.1) + 22 * Math.sin((x + sc) * 0.0127 + 0.4));
S.WORDER = ['pulse', 'fan', 'beam', 'wave'];
S.WEAPONS = {
  // Импулс: бърз прав изстрел; с мощността стават повече и леко ветрилообразни
  pulse: {
    name: 'Импулс', cd: 5,
    fire(W, x, y, pow, k) {
      const L = [[0, 0]];
      if (pow === 2) L.splice(0, 1, [0, -7], [0, 7]);
      else if (pow === 3) L.push([-0.07, -4], [0.07, 4]);
      else if (pow === 4) L.splice(0, 1, [0, -7], [0, 7], [-0.1, -6], [0.1, 6]);
      else if (pow >= 5) L.push([0, -11], [0, 11], [-0.13, -7], [0.13, 7]);
      for (const [a, dy] of L) shoot(W, x, y + dy, a, 22, k, 'pulse', 1);
    },
  },
  // Ветрило: разпръснат изстрел — за рояците
  fan: {
    name: 'Ветрило', cd: 7,
    fire(W, x, y, pow, k) {
      const n = [3, 5, 5, 7, 9][pow - 1], sp = [0.18, 0.34, 0.3, 0.46, 0.6][pow - 1];
      for (let i = 0; i < n; i++) shoot(W, x, y, -sp + 2 * sp * i / (n - 1), pow >= 3 ? 19 : 17, k, 'fan', 0.8);
    },
  },
  // Лъч: непрекъснат, пробива всички в линията (щетите са на такт — stepBeam)
  beam: { name: 'Лъч', beam: true, cd: 0, dmg: pow => 0.2 + 0.07 * (pow - 1), w: pow => 6 + pow * 2 },
  // Вълна: двойки кълба по синусоида; минават през щитове, от мощност 4 — и през един враг
  wave: {
    name: 'Вълна', cd: 9,
    fire(W, x, y, pow, k) {
      const pairs = pow >= 5 ? 3 : pow >= 3 ? 2 : 1;
      for (let j = 0; j < pairs; j++) for (const ph of [0, Math.PI]) {
        const amp = (pow === 2 ? 34 : 26) + j * 30;
        W.pb.push({ x, y, px: x, py: y, vx: 13, vy: 0, a: 0, k: 'wave', y0: y, amp, ph: ph + j * 0.9, dmg: 1.3 * k, r: 7, t: 0, pierce: pow >= 4 ? 1 : 0, main: k === 1, hit: null });
        if (k === 1) W.shots++;
      }
    },
  },
};

function shoot(W, x, y, a, spd, k, kind, dmg) {
  W.pb.push({ x, y, px: x - Math.cos(a) * spd, py: y - Math.sin(a) * spd, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, a, k: kind, dmg: dmg * k, r: 4, t: 0, main: k === 1 });
  if (k === 1) W.shots++;
}

S.newPlayer = function (W, ship) {
  const p = {
    x: -60, y: S.H / 2, px: -60, py: S.H / 2, vx: 0, vy: 0, bank: 0, r: 4.5,
    hullMax: 3 + (ship.hull || 0), hull: 0, shield: 0, lives: W.diff.lives + (ship.lives || 0), inv: 0,
    spd: 0, pow: 1 + (ship.pow || 0), msl: 0, echo: ship.echo || 0, charge: 0, chargeK: 1 + (ship.res || 0) * 0.25,
    weapon: ship.weapon || 'pulse', cd: 0, mcd: 0, mside: 1, cursor: -1, alive: true, dead: 0, enter: 50,
    hist: [], magnet: 110 + (ship.magnet || 0) * 50, hits: 0, beams: [],
  };
  p.hull = p.hullMax;
  for (let i = 0; i < 40; i++) p.hist.push({ x: p.x, y: p.y });
  return p;
};

// o = {level, diff, seed, ship (от хангара), from (контролна точка — продължение след край)}
S.newWorld = function (o) {
  const lv = S.LEVELS[o.level || 1];
  if (!lv) throw new Error('Няма ниво ' + o.level);
  const W = {
    t: 0, seed: o.seed >>> 0, r: S.rng(o.seed >>> 0), dn: o.diff == null ? 1 : o.diff, lv, n: lv.n,
    ev: [], foes: [], pb: [], eb: [], lz: [], items: [], groups: new Map(), gid: 0, nid: 0,
    score: 0, chain: 0, chainT: 0, mult: 1, kills: 0, spawned: 0, killsF: 0, spawnedF: 0, shots: 0, hits: 0, crystals: 0, notes: 0, popped: 0,
    deaths: 0, cont: 0, cp: null, boss: null, dying: null, maxChain: 0, wind: { x: 0, y: 0 }, windTo: { x: 0, y: 0 }, storm: null,
    wallK: 0, wallTo: 0, pulsar: null,
    scroll: 0, sspd: lv.sspd || 1.4, bomb: null, bid: 0, sched: null, si: 0, waitT: 0, end: null, endT: 0,
  };
  W.diff = S.DIFF[W.dn];
  W.p = S.newPlayer(W, o.ship || {});
  W.A = S.spawner(W);
  W.sched = lv.script(W);
  const f = o.from;
  if (f) { // продължение: сценарият от точката, точките и подобренията от тогава
    W.si = f.si; W.cont = f.cont + 1; W.cp = f;
    for (const k of ['score', 'kills', 'spawned', 'killsF', 'spawnedF', 'shots', 'hits', 'notes', 'deaths', 't', 'scroll']) W[k] = f[k]; // кристалите — само от този опит (вече са в хангара)
    Object.assign(W.p, f.p); W.ev.push({ k: 'banner', t: 'Продължаваш', s: 'от контролната точка' });
  } else W.ev.push({ k: 'banner', t: lv.name, s: 'Ниво ' + lv.n });
  return W;
};

// един такт логика; inp = {ax, ay, fire, act, bomb, tdx, tdy}
S.step = function (W, inp) {
  W.t++; W.scroll += W.sspd;
  const p = W.p;
  W.wind.x = M.approach(W.wind.x, W.windTo.x, 0.02); W.wind.y = M.approach(W.wind.y, W.windTo.y, 0.02);
  W.wallK = M.approach(W.wallK, W.wallTo, 0.004);
  if (W.pulsar) stepPulsar(W);
  if (W.lv.tick) W.lv.tick(W);
  stepPlayer(W, p, inp);
  for (const e of W.foes) if (!e.dead) {
    if (!e.d.part) { e.px = e.x; e.py = e.y; } // частите на боса ги мести ядрото
    e.t++; if (e.flash > 0) e.flash--;
    e.d.upd(e, W);
    const inside = e.x > -40 && e.x < S.W + 40 && e.y > -40 && e.y < S.H + 40;
    if (inside) e.in = true;
    else if (!e.d.boss && !e.d.part && ((e.in && (e.x < -140 || e.x > S.W + 260 || e.y < -180 || e.y > S.H + 180)) || e.t > 3600)) gone(W, e);
  }
  stepBeam(W, p);
  stepShots(W);
  stepFoeShots(W, p);
  if (W.lz.length) stepLasers(W, p);
  if (p.alive) for (const e of W.foes) { // скалите са твърди: избутват кораба, без щета
    if (e.dead || !e.d.rock) continue;
    const rr = e.r * 0.86 + 12, dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1;
    if (d < rr) { p.x = e.x + dx / d * rr; p.y = e.y + dy / d * rr; p.x = M.clamp(p.x, 30, S.W - 40); p.y = M.clamp(p.y, 26, S.H - 22); }
  }
  if (p.alive && p.inv <= 0) for (const e of W.foes) {
    if (e.dead || e.d.ghost || e.cloak || e.d.rock) continue;
    const rr = e.r * 0.78 + 9;
    if (M.d2(e.x, e.y, p.x, p.y) < rr * rr) { hurtPlayer(W, p); S.hurt(W, e, 6, true); break; }
  }
  stepItems(W, p);
  if (W.bomb) stepBomb(W);
  if (W.dying) stepDying(W);
  if (W.chainT > 0 && --W.chainT === 0) { W.chain = 0; W.mult = 1; }
  W.foes = W.foes.filter(e => !e.dead);
  stepScript(W);
  if (W.end && W.endT > 0) W.endT--;
};

function stepPlayer(W, p, inp) {
  p.px = p.x; p.py = p.y;
  if (p.inv > 0) p.inv--;
  if (!p.alive) {
    if (--p.dead <= 0) {
      if (p.lives < 0) { if (!W.end) { W.end = 'over'; W.endT = 120; W.ev.push({ k: 'end', r: 'over' }); } return; }
      p.alive = true; p.x = p.px = -60; p.y = p.py = S.H / 2; p.enter = 45; p.inv = 170; p.hull = p.hullMax;
      for (const h of p.hist) { h.x = p.x; h.y = p.y; }
      W.ev.push({ k: 'spawn', x: p.x, y: p.y });
    }
    return;
  }
  const sp = 5.2 + p.spd * 0.85;
  if (p.enter > 0) { // влиза отляво сам
    p.enter--; p.x = M.lerp(p.x, 190, 0.09); p.vx = p.x - p.px; p.vy = 0;
  } else if (inp.tdx || inp.tdy) { // тъч: следва пръста 1:1
    const lim = 46;
    p.x += M.clamp(inp.tdx, -lim, lim); p.y += M.clamp(inp.tdy, -lim, lim);
    p.vx = p.x - p.px; p.vy = p.y - p.py;
  } else {
    let ax = inp.ax || 0, ay = inp.ay || 0; const l = Math.hypot(ax, ay); if (l > 1) { ax /= l; ay /= l; }
    p.vx = M.lerp(p.vx, ax * sp, 0.38); p.vy = M.lerp(p.vy, ay * sp, 0.38);
    p.x += p.vx; p.y += p.vy;
  }
  if (p.enter <= 0) { p.x += W.wind.x; p.y += W.wind.y; }
  p.x = M.clamp(p.x, p.enter > 0 ? -80 : 30, S.W - 40); p.y = M.clamp(p.y, 26, S.H - 22);
  if (W.wallK > 0.01) { // стена: удар и отскок навътре
    const t = S.wallTop(p.x, W.scroll, W.wallK), b = S.wallBot(p.x, W.scroll, W.wallK);
    if (p.y < t + 16) { p.y = t + 30; hurtPlayer(W, p); } else if (p.y > b - 16) { p.y = b - 30; hurtPlayer(W, p); }
  }
  p.bank = M.lerp(p.bank, M.clamp(p.vy / sp, -1, 1), 0.2);
  const last = p.hist[p.hist.length - 1];
  if (M.d2(last.x, last.y, p.x, p.y) > 2) { p.hist.push({ x: p.x, y: p.y }); if (p.hist.length > 40) p.hist.shift(); }
  // стрелба
  if (p.cd > 0) p.cd--;
  if (p.mcd > 0) p.mcd--;
  const wpn = S.WEAPONS[p.weapon];
  p.beams.length = 0;
  if (inp.fire && p.enter <= 0) {
    if (wpn.beam) {
      p.beams.push({ x: p.x + 30, y: p.y, w: wpn.w(p.pow), dmg: wpn.dmg(p.pow), main: true });
      for (let i = 0; i < p.echo; i++) { const h = S.echoPos(p, i); p.beams.push({ x: h.x + 12, y: h.y, w: wpn.w(Math.min(p.pow, 2)) * 0.6, dmg: wpn.dmg(Math.min(p.pow, 2)) * 0.5 }); }
      if (W.t % 5 === 0) { W.shots++; p.bshot = true; }
    } else if (p.cd <= 0) {
      p.cd = wpn.cd; wpn.fire(W, p.x + 26, p.y, p.pow, 1);
      for (let i = 0; i < p.echo; i++) { const h = S.echoPos(p, i); wpn.fire(W, h.x + 12, h.y, Math.min(p.pow, 2), 0.6); }
      W.ev.push({ k: 'shot', x: p.x, y: p.y, w: p.weapon });
    }
    if (p.msl > 0 && p.mcd <= 0) {
      p.mcd = p.msl >= 3 ? 30 : 44;
      const n = p.msl >= 2 ? 2 : 1;
      for (let i = 0; i < n; i++) {
        const s = n === 2 ? (i ? 1 : -1) : (p.mside = -p.mside);
        W.pb.push({ x: p.x - 4, y: p.y + s * 10, px: p.x - 4, py: p.y + s * 10, vx: 1.5, vy: s * 3.2, a: s * 1.1, k: 'msl', dmg: 3, r: 5, t: 0, sp: 3 });
      }
      W.ev.push({ k: 'msl', x: p.x, y: p.y });
    }
  }
  if (inp.act && p.cursor >= 0) {
    const sl = S.SCALE[p.cursor];
    if (sl.lv(p) >= sl.max) W.ev.push({ k: 'deny', x: p.x, y: p.y });
    else { sl.take(p); W.ev.push({ k: 'up', i: p.cursor, x: p.x, y: p.y }); p.cursor = -1; }
  }
  if (inp.bomb) {
    if (p.charge >= 1 && !W.bomb) {
      p.charge = 0; W.bomb = { x: p.x, y: p.y, r: 0, id: ++W.bid };
      W.ev.push({ k: 'bomb', x: p.x, y: p.y });
    } else if (!W.bomb) W.ev.push({ k: 'deny', x: p.x, y: p.y });
  }
}

S.echoPos = (p, i) => p.hist[Math.max(0, p.hist.length - 1 - 13 * (i + 1))];

function hurtPlayer(W, p) {
  if (!p.alive || p.inv > 0 || p.enter > 0) return;
  W.chain = 0; W.mult = 1; W.chainT = 0; p.hits++;
  if (p.shield > 0) { p.shield--; p.inv = 50; W.ev.push({ k: 'shd', x: p.x, y: p.y }); return; }
  p.hull--;
  if (p.hull > 0) { p.inv = 100; W.ev.push({ k: 'phit', x: p.x, y: p.y }); return; }
  p.alive = false; p.dead = 110; p.lives--; W.deaths++; p.pow = Math.max(1, p.pow - 1); p.shield = 0; p.echo = 0; p.cursor = -1;
  W.ev.push({ k: 'pdie', x: p.x, y: p.y });
}
S.hurtPlayer = hurtPlayer;

function stepShots(W) {
  const foes = W.foes;
  for (const b of W.pb) {
    b.px = b.x; b.py = b.y; b.t++;
    if (b.k === 'msl') { // самонасочваща: търси най-близката цел пред себе си, завива плавно
      if (!b.tg || b.tg.dead) {
        let best = null, bd = 1e12;
        for (const e of foes) if (!e.dead && e.in && !e.d.ghost && !e.cloak && !e.d.nocount && !e.d.rock && e.x > b.x - 60 && !S.blocks(W, e)) { const d = M.d2(e.x, e.y, b.x, b.y); if (d < bd) { bd = d; best = e; } }
        b.tg = best;
      }
      b.sp = Math.min(12, b.sp + 0.35);
      const want = b.tg ? Math.atan2(b.tg.y - b.y, b.tg.x - b.x) : 0;
      b.a += M.clamp(M.wrapA(want - b.a), -0.1, 0.1);
      b.vx = M.lerp(b.vx, Math.cos(b.a) * b.sp, 0.2); b.vy = M.lerp(b.vy, Math.sin(b.a) * b.sp, 0.2);
      b.x += b.vx; b.y += b.vy;
    } else if (b.k === 'wave') { // синусоида около линията на изстрела; амплитудата расте в началото
      b.x += b.vx; b.y = b.y0 + b.amp * Math.min(1, b.t / 10) * Math.sin(b.t * 0.13 + b.ph);
    } else { b.x += b.vx; b.y += b.vy; }
    if (b.x > S.W + 40 || b.x < -40 || b.y < -40 || b.y > S.H + 40 || b.t > 200) { b.dead = true; continue; }
    if (W.wallK > 0.01 && (b.y < S.wallTop(b.x, W.scroll, W.wallK) || b.y > S.wallBot(b.x, W.scroll, W.wallK))) { b.dead = true; W.ev.push({ k: 'deflect', x: b.x, y: b.y, w: b.k }); continue; }
    for (const e of foes) {
      if (e.dead || e.d.ghost || e.cloak || (b.hit && b.hit.includes(e.id))) continue;
      const rr = e.r + b.r;
      if (M.segD2(e.x, e.y, b.px, b.py, b.x, b.y) < rr * rr) {
        if (b.main && !b.counted) { W.hits++; b.counted = true; }
        const ok = S.hurt(W, e, b.dmg, false, b.k === 'wave', b);
        W.ev.push({ k: ok ? 'hit' : 'deflect', x: b.x, y: b.y, w: b.k, big: b.k === 'msl' });
        if (e.d.refract && !b.ref && (b.k === 'pulse' || b.k === 'fan')) { // кристалът пречупва изстрела на два
          const sp = Math.hypot(b.vx, b.vy), x0 = e.x + e.r * 0.8;
          for (const da of [-0.36, 0.36]) { const a = b.a + da; W.pb.push({ x: x0, y: b.y, px: x0, py: b.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, a, k: b.k, dmg: b.dmg * 0.6, r: 4, t: 0, ref: true }); }
          W.ev.push({ k: 'refr', x: x0, y: b.y });
        }
        if (ok && b.pierce > 0) { b.pierce--; (b.hit = b.hit || []).push(e.id); continue; }
        b.dead = true; break;
      }
    }
  }
  W.pb = W.pb.filter(b => !b.dead);
}

// лъчът: удря всички в линията до първия, който го спира (щит на боса)
function stepBeam(W, p) {
  let any = false;
  for (const B of p.beams) {
    let end = S.W + 60;
    for (const e of W.foes) if (!e.dead && !e.d.ghost && !e.cloak && e.x + e.r > B.x && Math.abs(e.y - B.y) < e.r + B.w / 2 && (S.blocks(W, e) || e.d.rock)) end = Math.min(end, e.x - e.r * 0.7);
    B.end = end; B.hits = 0;
    for (const e of W.foes) {
      if (e.dead || e.d.ghost || e.cloak || e.x + e.r < B.x || e.x - e.r > end || Math.abs(e.y - B.y) > e.r + B.w / 2) continue;
      if (S.hurt(W, e, B.dmg, false, false, { x: B.x, y: B.y, beam: true })) { B.hits++; any = any || !!B.main; if ((W.t + e.id) % 6 === 0) W.ev.push({ k: 'hit', x: Math.max(B.x, e.x - e.r * 0.7), y: B.y, w: 'beam' }); }
    }
    if (end < S.W && W.t % 4 === 0) W.ev.push({ k: 'deflect', x: end, y: B.y, w: 'beam' });
  }
  if (any) p.bhit = true;
  if (W.t % 5 === 4) { if (p.bshot && p.bhit) W.hits++; p.bshot = p.bhit = false; }
}

// пулсарът (ниво 5): на всеки period такта — импулс през целия екран; само в сянката на скала си на сигурно
S.PULSAR = { x: 1750, y: 330 };
S.shaded = (W, x, y) => { const P = S.PULSAR; for (const e of W.foes) if (!e.dead && e.d.rock && e.x > x && M.segD2(e.x, e.y, P.x, P.y, x, y) < e.r * e.r * 1.1) return true; return false; };
function stepPulsar(W) {
  const P = W.pulsar, ph = ++P.t % P.period;
  if (ph === P.period - P.tele) W.ev.push({ k: 'ptele' });
  P.on = ph < P.dur && P.t > P.dur;
  if (ph === 0 && P.t > 0) W.ev.push({ k: 'pulse' });
  if (!P.on) return;
  const p = W.p;
  if (p.alive && p.inv <= 0 && p.enter <= 0 && !S.shaded(W, p.x, p.y)) hurtPlayer(W, p);
  for (const e of W.foes) if (!e.dead && !e.d.rock && !e.d.boss && !e.d.part && e.in && !S.shaded(W, e.x, e.y)) S.hurt(W, e, 0.7, true);
}

// вражески лъчи: първо предупреждение (линия), после изгарят; собственикът ги мести (x, y, a)
function stepLasers(W, p) {
  for (const L of W.lz) {
    L.t++;
    if (L.own && L.own.dead) L.dead = true;
    if (L.t > L.tele + L.dur) L.dead = true;
    if (L.t === L.tele + 1) W.ev.push({ k: L.kind === 'bolt' ? 'bolt' : 'lfire', x: L.kind === 'bolt' ? L.x : L.x, y: L.kind === 'bolt' ? S.H / 2 : L.y });
    if (L.dead || L.t <= L.tele) continue;
    const ex = L.x + Math.cos(L.a) * L.len, ey = L.y + Math.sin(L.a) * L.len, rr = L.w / 2 + p.r;
    if (L.kind === 'bolt') for (const e of W.foes) if (!e.dead && !e.d.boss && !e.d.part && M.segD2(e.x, e.y, L.x, L.y, ex, ey) < (L.w / 2 + e.r) * (L.w / 2 + e.r)) S.hurt(W, e, 0.8, true);
    if (!p.alive || p.inv > 0 || p.enter > 0) continue;
    if (M.segD2(p.x, p.y, L.x, L.y, ex, ey) < rr * rr) hurtPlayer(W, p);
  }
  W.lz = W.lz.filter(L => !L.dead);
}
S.laser = (W, o) => { const L = Object.assign({ t: 0, tele: 50, dur: 90, w: 24, len: 1600, a: Math.PI, c: 'ebul', kind: 'beam' }, o); W.lz.push(L); W.ev.push({ k: L.kind === 'bolt' ? 'btele' : 'ltele', x: L.x, y: L.y }); return L; };
// мълния: вертикален удар от небето в колоната x
S.bolt = (W, x, tele) => S.laser(W, { x, y: -40, a: Math.PI / 2, len: S.H + 80, w: 30, tele: tele || 70, dur: 16, kind: 'bolt', c: 'bolt', seed: W.r.int(0, 9999) });

function stepFoeShots(W, p) {
  const hit = p.alive && p.inv <= 0 && p.enter <= 0;
  for (const b of W.eb) {
    b.px = b.x; b.py = b.y; b.t++;
    if (b.acc) { b.vx *= b.acc; b.vy *= b.acc; }
    b.x += b.vx; b.y += b.vy;
    if (b.x < -30 || b.x > S.W + 60 || b.y < -30 || b.y > S.H + 30) { b.dead = true; continue; }
    if (W.wallK > 0.01 && (b.y < S.wallTop(b.x, W.scroll, W.wallK) || b.y > S.wallBot(b.x, W.scroll, W.wallK))) { b.dead = true; continue; }
    if (hit) { const rr = b.r + p.r; if (M.d2(b.x, b.y, p.x, p.y) < rr * rr) { b.dead = true; hurtPlayer(W, p); } }
  }
  W.eb = W.eb.filter(b => !b.dead);
}

function stepItems(W, p) {
  for (const it of W.items) {
    it.px = it.x; it.py = it.y; it.t++;
    const dx = p.x - it.x, dy = p.y - it.y, d = Math.hypot(dx, dy) || 1;
    if (it.k === 'cr') { // кристал: изхвърча, после сам лети към кораба
      if (it.t < 26 || !p.alive) { it.vx *= 0.9; it.vy *= 0.9; if (!p.alive) it.vx -= 0.05; }
      else { const s = Math.min(19, (it.t - 26) * 0.7 + 2); it.vx = M.lerp(it.vx, dx / d * s, 0.25); it.vy = M.lerp(it.vy, dy / d * s, 0.25); }
      it.x += it.vx; it.y += it.vy;
      if (p.alive && d < 26) { it.dead = true; W.crystals += it.v; W.ev.push({ k: 'cr', x: it.x, y: it.y }); }
    } else if (it.k === 'wpn') { // кристал за оръжие: сменя вида си на всеки 2,5 s — хващаш, когато показва желаното
      it.w = S.WORDER[(it.w0 + Math.floor(it.t / 150)) % 4];
      if (p.alive && d < p.magnet * 0.8) { const s = 1.5 + (1 - d / p.magnet) * 7; it.x += dx / d * s; it.y += dy / d * s; }
      else { it.x += it.vx; it.y += Math.sin(it.t * 0.05) * 0.7; }
      if (p.alive && d < 36) {
        it.dead = true;
        if (p.weapon === it.w) { if (p.pow < 5) p.pow++; else W.score += 2000 * W.mult; W.ev.push({ k: 'wpn', w: it.w, same: true, x: it.x, y: it.y }); }
        else { p.weapon = it.w; p.cd = 0; W.ev.push({ k: 'wpn', w: it.w, x: it.x, y: it.y }); }
      }
    } else if (it.k === 'note') { // нота: плава наляво; магнитът я притегля
      if (p.alive && d < p.magnet) { const s = 2 + (1 - d / p.magnet) * 9; it.x += dx / d * s; it.y += dy / d * s; }
      else { it.x += it.vx; it.y += Math.sin(it.t * 0.06) * 0.6; }
      if (p.alive && d < 34) {
        it.dead = true; W.notes++; p.cursor = (p.cursor + 1) % S.SCALE.length;
        W.score += 500 * W.mult; W.ev.push({ k: 'note', x: it.x, y: it.y, i: p.cursor });
      }
    }
    if (it.x < -40 || it.x > S.W + 80 || it.y < -60 || it.y > S.H + 60) it.dead = true;
  }
  W.items = W.items.filter(it => !it.dead);
}

function stepBomb(W) {
  const B = W.bomb; B.r += 24;
  for (const e of W.foes) if (!e.dead && e.bomb !== B.id && M.d2(e.x, e.y, B.x, B.y) < (B.r + e.r) * (B.r + e.r)) { e.bomb = B.id; S.hurt(W, e, 30); }
  const r2 = B.r * B.r;
  for (const b of W.eb) if (M.d2(b.x, b.y, B.x, B.y) < r2) { b.dead = true; W.popped++; W.score += 10; W.ev.push({ k: 'pop', x: b.x, y: b.y }); }
  W.eb = W.eb.filter(b => !b.dead);
  if (B.r > 1700) W.bomb = null;
}

// щит: врагът не поема нищо (лъчът спира в него, изстрелите отскачат)
S.blocks = (W, e) => !!(e.d.block && e.d.block(e, W));
// щети по враг; body — удар с корпуса, pierce — минава през броня (Вълна); връща false, ако е отскочило
S.hurt = function (W, e, dmg, body, pierce, src) {
  if (e.dead) return false;
  if (S.blocks(W, e)) return false;
  if (e.d.armor && !body && !pierce) { const k = e.d.armor(e, W, src); if (k <= 0) return false; dmg *= k; }
  e.hp -= dmg; e.flash = 5;
  if (e.hp <= 0) kill(W, e);
  return true;
};

S.kill = (W, e) => kill(W, e);
function kill(W, e) {
  e.dead = true; const d = e.d;
  if (e.nosc) { W.ev.push({ k: 'boom', x: e.x, y: e.y, s: d.boom || 1, id: d.id, vx: 0, vy: 0 }); return; } // взривила се сама (мина) — без точки
  W.kills++; if (!d.hazard) W.killsF++;
  W.chain++; W.chainT = 100; W.mult = Math.min(8, 1 + Math.floor(W.chain / 6)); W.maxChain = Math.max(W.maxChain, W.chain);
  W.score += (d.scoreOf ? d.scoreOf(e) : d.score) * W.mult;
  const p = W.p; if (p.alive) p.charge = Math.min(1, p.charge + (d.ch || 0) * p.chargeK);
  const n = d.cr || 0, v = W.lv.crv || 1;
  for (let i = 0; i < n; i++) { const a = W.r() * M.TAU, s = W.r.range(2, 6) * (d.boss ? 2 : 1); W.items.push({ k: 'cr', x: e.x, y: e.y, px: e.x, py: e.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: 0, v, sp: W.r() }); }
  W.ev.push({ k: 'boom', x: e.x, y: e.y, s: d.boom || 1, id: d.id, vx: e.x - e.px, vy: e.y - e.py });
  if (d.die) d.die(e, W);
  if (d.note) dropNote(W, e.x, e.y);
  if (d.boss && e.mini) { // мини-бос: само голям взрив, сценарият продължава
    for (const q of e.parts || []) q.dead = true;
    W.boss = null; W.ev.push({ k: 'minidie', x: e.x, y: e.y, t: d.name });
  } else if (d.boss) { // краят на боса: верига от взривове, изстрелите му стават точки
    W.dying = { x: e.x, y: e.y, t: 0, id: d.id };
    for (const b of W.eb) { W.popped++; W.score += 10; W.ev.push({ k: 'pop', x: b.x, y: b.y }); }
    W.eb.length = 0; W.lz.length = 0;
    W.ev.push({ k: 'bossdie', x: e.x, y: e.y });
  }
  const g = e.g && W.groups.get(e.g);
  if (g) { g.killed++; g.x = e.x; g.y = e.y; groupCheck(W, e.g, g); }
}

function stepDying(W) {
  const D = W.dying; D.t++;
  if (D.t % 7 === 0 && D.t < 130) W.ev.push({ k: 'boom', x: D.x + W.r.range(-100, 100), y: D.y + W.r.range(-90, 90), s: 2, id: D.id });
  if (D.t === 140) W.ev.push({ k: 'boom', x: D.x, y: D.y, s: 3, id: D.id }, { k: 'bossboom', x: D.x, y: D.y });
  if (D.t >= 250) { W.dying = null; W.end = 'clear'; W.endT = 30; W.ev.push({ k: 'end', r: 'clear' }); }
}

function gone(W, e) {
  e.dead = true;
  const g = e.g && W.groups.get(e.g);
  if (g) { g.gone++; groupCheck(W, e.g, g); }
}

function groupCheck(W, id, g) {
  if (g.killed + g.gone < g.n) return;
  W.groups.delete(id);
  if (g.killed === g.n && g.note) dropNote(W, M.clamp(g.x, 60, S.W - 60), M.clamp(g.y, 60, S.H - 60));
}

function dropNote(W, x, y) {
  W.items.push({ k: 'note', x, y, px: x, py: y, vx: -1.2, vy: 0, t: 0 });
  W.ev.push({ k: 'drop', x, y });
}

// сценарий: [[забавяне в секунди | 'clear' | 'cp', fn], …] — забавянето е преди стъпката;
// 'clear' чака да няма врагове, 'cp' — контролна точка; докато бос е на сцената, сценарият чака
function stepScript(W) {
  if (W.end || W.dying || W.boss) return;
  const clear = W.foes.every(e => e.d.hazard);
  const st = W.sched[W.si];
  if (!st) { if (clear) { W.end = 'clear'; W.endT = 150; W.ev.push({ k: 'end', r: 'clear' }); } return; }
  if (st[0] === 'cp') { W.si++; checkpoint(W); return; }
  W.waitT++;
  if (st[0] === 'clear' ? !(clear || W.waitT > 60 * 30) : W.waitT < st[0] * 60) return;
  W.waitT = 0; W.si++;
  if (st[1]) st[1](W.A, W);
}

function checkpoint(W) {
  const p = W.p, c = { si: W.si, cont: W.cont, p: { spd: p.spd, pow: p.pow, msl: p.msl, echo: p.echo, weapon: p.weapon, shield: p.shield, charge: p.charge } };
  for (const k of ['score', 'kills', 'spawned', 'killsF', 'spawnedF', 'shots', 'hits', 'crystals', 'notes', 'deaths', 't', 'scroll']) c[k] = W[k];
  W.cp = c; W.ev.push({ k: 'cp' });
}

// отпечатък на състоянието (dev/sim.js): еднакво семе + еднакъв вход → еднакъв отпечатък
S.fingerprint = W => S.hash([W.t, W.score, W.kills, W.crystals, W.notes, W.p.x, W.p.y, W.p.hull, W.p.lives, W.p.pow, W.foes.length, W.eb.length, W.lz.length, W.r.state()]);

// здравето на боса заедно с частите му: [сега, общо, име, фаза]
S.bossHP = W => {
  const b = W.boss; if (!b) return null;
  let h = Math.max(0, b.hp), m = b.mhp;
  for (const q of b.parts || []) { if (q.d.nocount) continue; m += q.mhp; if (!q.dead) h += Math.max(0, q.hp); }
  return [b.dead ? 0 : h, m, b.d.name, b.ph || 1];
};
})();
