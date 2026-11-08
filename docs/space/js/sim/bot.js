// Автопилот: играе зад началния екран и в проверките (dev/sim.js). Само от състоянието — детерминиран.
(function () {
'use strict';
const S = (typeof window !== 'undefined' ? window : globalThis).SPACE, M = S.M;

// o = {see, k} — по-малък радиус и сила на избягване за проверката „като човек“ (dev/sim.js --human)
S.bot = function (W, o) {
  const p = W.p, inp = { ax: 0, ay: 0, fire: true, act: false, bomb: false }, SEE = o ? o.see : 120, DK = o ? o.k : 1;
  if (!p.alive) return inp;
  let ty = S.H / 2, tx = 220, best = 1e9;
  for (const e of W.foes) if (!e.dead && e.in && !e.d.nocount && !e.cloak && !e.d.rock && !S.blocks(W, e)) { const d = Math.abs(e.x - p.x); if (d < best && e.x > p.x) { best = d; ty = e.y; } }
  for (const it of W.items) if ((it.k === 'note' || it.k === 'wpn') && it.x > p.x - 40) { ty = it.y; tx = M.clamp(it.x, 160, 600); break; }
  let fx = (tx - p.x) * 0.02, fy = (ty - p.y) * 0.03, danger = 0;
  for (const b of W.eb) {
    const dx = p.x - b.x, dy = p.y - b.y, d2 = dx * dx + dy * dy;
    if (d2 < SEE * SEE) { const d = Math.sqrt(d2) || 1, k = (SEE - d) / SEE * DK; fx += dx / d * k * 3; fy += dy / d * k * 3.5; danger += k; }
  }
  for (const e of W.foes) if (!e.dead) {
    const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1;
    if (d < e.r + (e.d.rock ? 28 : 70)) { fx += dx / d * 2; fy += dy / d * 2; }
    if (e.d.id === 'kopie' && e.st >= 1 && Math.abs(dy) < 40 && e.x > p.x) fy += (dy >= 0 ? 1 : -1) * 2.5;
  }
  for (const L of W.lz) { // вражески лъч: бяга встрани от линията му
    const cx = Math.cos(L.a), cy = Math.sin(L.a), dx = p.x - L.x, dy = p.y - L.y, along = dx * cx + dy * cy, perp = -dx * cy + dy * cx;
    if (along > 0 && Math.abs(perp) < L.w / 2 + 60) { const s = perp >= 0 ? 1 : -1; fx += -cy * s * 4; fy += cx * s * 4; }
  }
  if (W.wallK > 0.01) { const t = S.wallTop(p.x, W.scroll, W.wallK), b = S.wallBot(p.x, W.scroll, W.wallK); if (p.y < t + 70) fy += 3; if (p.y > b - 70) fy -= 3; fy += ((t + b) / 2 - p.y) * 0.004; }
  if (W.pulsar) { // пулсар: преди импулса — в сянката на най-близката скала (вместо гонене на цели)
    const P = W.pulsar, ph = P.t % P.period;
    if (ph > P.period - P.tele - 40 || ph < P.dur + 2) {
      let best = null, bd = 1e9;
      for (const e of W.foes) if (!e.dead && e.d.rock && e.x > 160 && e.x < S.W - 60) { const d = M.d2(e.x, e.y, p.x, p.y); if (d < bd) { bd = d; best = e; } }
      if (best) {
        const P0 = S.PULSAR, ax = best.x - P0.x, ay = best.y - P0.y, l = Math.hypot(ax, ay), sx = best.x + ax / l * (best.r + 40) + best.vx * 20, sy = best.y + ay / l * (best.r + 40);
        fx = fx - (tx - p.x) * 0.02 + (sx - p.x) * 0.06; fy = fy - (ty - p.y) * 0.03 + (sy - p.y) * 0.06;
      }
    }
  }
  inp.ax = M.clamp(fx, -1, 1); inp.ay = M.clamp(fy, -1, 1);
  if (p.cursor >= 0) { const sl = S.SCALE[p.cursor]; if (sl.lv(p) < sl.max && (p.cursor === 1 || (p.cursor === 0 && p.spd < 2) || p.cursor >= 2)) inp.act = true; }
  if (danger > 2.2 && p.charge >= 1) inp.bomb = true;
  return inp;
};
})();
