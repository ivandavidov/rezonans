// Как изглежда светът: рисува играча, враговете, изстрелите и предметите от състоянието на логиката.
// a — интерполация между последните два такта (гладко и на 120 Hz); k — такта от предния кадър.
(function () {
'use strict';
const S = window.SPACE, M = S.M, R = S.R, F = S.FX;
const L = S.LOOK = {};
const C = S.C, WHITE = [1, 1, 1];
const mul = (c, k) => [c[0] * k, c[1] * k, c[2] * k];
const ix = (e, a) => e.px + (e.x - e.px) * a, iy = (e, a) => e.py + (e.y - e.py) * a;
const WC = { pulse: C.pulse, fan: C.fan, beam: C.beam, wave: C.wave };
const ICO = { pulse: 'icoPulse', fan: 'icoFan', beam: 'icoBeam', wave: 'icoWave' };
const LZC = { ebul: C.ebul, ebul2: C.ebul2, violet: [1.8, 0.6, 2.8], bolt: [1.6, 1.8, 2.8] };
L.wc = w => WC[w];
L.hitbox = true;
// хоризонтална/наклонена светлинна линия с дължина len от (x, y) под ъгъл a: външно сияние, цвят, бяла сърцевина
function beamLine(A, x, y, a, len, w, col, k, fl, hot) {
  const cx = x + Math.cos(a) * len / 2, cy = y + Math.sin(a) * len / 2, sx = len / 16, h = hot || 1;
  R.spr(A.bar, cx, cy, a, sx, w * 2.2 / 16, col, 0.16 * k, 1);
  R.spr(A.bar, cx, cy, a, sx, w * 1.0 / 16, mul(col, 0.9 * h), 0.8 * k * fl, 1);
  R.spr(A.bar, cx, cy, a, sx, w * 0.32 / 16, mul([1.6, 1.6, 1.8], h), k * fl, 1);
}

function foe(e, a, t, k, A) {
  const x = ix(e, a), y = iy(e, a), d = e.d.id, fl = e.flash / 5;
  if (d === 'iskra') {
    R.spr(A.glow, x - Math.cos(e.rot) * 12, y - Math.sin(e.rot) * 12, 0, 0.32, 0.32, C.foe, 0.5, 1);
    R.spr(A.iskra, x, y, e.rot, 1, 1, WHITE, 1, 0);
    R.spr(A.iskraG, x, y, e.rot, 1, 1, mul(C.foe, 1 + fl * 2), 1, 1);
    if (fl) R.spr(A.iskra, x, y, e.rot, 1, 1, mul(WHITE, 2.5 * fl), 1, 1);
  } else if (d === 'kopie') {
    let g = 1;
    if (e.st === 1) { // прицелване: светва и показва линията на удара
      const q = e.k / 38; g = 1 + q * 1.8 + Math.sin(t * 40) * 0.3 * q;
      R.spr(A.spark, x - 600, y, 0, 1200 / 32, 0.5 + q * 0.6, C.foe2, 0.1 + q * 0.22, 1);
    } else if (e.st === 2 && Math.random() < k) F.trail(x + 18, y + (Math.random() - 0.5) * 6, 2, 0, C.foe2, 22, 18, 0.5);
    R.spr(A.glow, x + 24, y, 0, 0.4, 0.3, C.foe2, 0.45 * g, 1);
    R.spr(A.kopie, x, y, e.rot, 1, 1, WHITE, 1, 0);
    R.spr(A.kopieG, x, y, e.rot, 1, 1, mul(C.foe2, g + fl * 2), 1, 1);
    if (fl) R.spr(A.kopie, x, y, e.rot, 1, 1, mul(WHITE, 2.5 * fl), 1, 1);
  } else if (d === 'venets') {
    const ch = e.st === 1 ? M.sat(1 - e.cool / 40) : 0, sp = e.spin;
    R.spr(A.glow, x, y, 0, 1.6, 1.6, C.foe3, 0.12 + ch * 0.2, 1);
    R.spr(A.venets, x, y, sp, 1, 1, WHITE, 1, 0);
    R.spr(A.venetsG, x, y, sp, 1, 1, mul(C.foe3, 1 + fl * 2 + ch * 0.6), 1, 1);
    R.spr(A.core, x, y, 0, 0.75 + ch * 0.5, 0.75 + ch * 0.5, mul(C.foe3, 1.2 + ch * 1.5 + Math.sin(t * 6) * 0.15), 1, 1);
    if (fl) R.spr(A.venets, x, y, sp, 1, 1, mul(WHITE, 2 * fl), 1, 1);
  } else if (d === 'nosach') {
    const w = S.WORDER[(e.w0 + Math.floor(t * 0.8)) % 4], wc = WC[w];
    R.spr(A.glow, x + 4, y, 0, 0.7, 0.7, wc, 0.35, 1);
    R.spr(A.nosach, x, y, e.rot, 1, 1, WHITE, 1, 0);
    R.spr(A.glow, x - 4, y, 0, 0.45, 0.45, wc, 0.6, 1);
    R.spr(A.cr, x - 4, y, t * 2, 1.2, 1.2, mul(wc, 0.55), 1, 1);
    R.spr(A.nosachG, x, y, e.rot, 1, 1, mul([1.6, 1.0, 2.4], 1 + fl * 2), 1, 1);
    R.spr(A.glow, x + 40, y - 6, 0, 0.18, 0.18, [2.4, 1.4, 2.6], 0.8, 1); R.spr(A.glow, x + 40, y + 6, 0, 0.18, 0.18, [2.4, 1.4, 2.6], 0.8, 1);
    if (fl) R.spr(A.nosach, x, y, e.rot, 1, 1, mul(WHITE, 2 * fl), 1, 1);
  } else if (d === 'strazh') {
    const ph = e.ph, ec = ph === 3 ? [2.8, 0.5, 0.35] : ph === 2 ? [2.8, 1.1, 0.35] : C.foe3;
    if (ph === 1) { R.spr(A.bRing, x, y, e.rot, 1, 1, WHITE, 1, 0); R.spr(A.bRingG, x, y, e.rot, 1, 1, mul(C.foe3, 0.8), 1, 1); }
    R.spr(A.glow, x, y, 0, 2.4, 2.4, ec, 0.1 + (ph > 1 ? 0.08 : 0), 1);
    R.spr(A.bCore, x, y, e.rot * -0.5, 1, 1, WHITE, 1, 0);
    R.spr(A.bCoreG, x, y, e.rot * -0.5, 1, 1, mul(ec, 0.9 + fl * 2), 1, 1);
    const eye = 1.1 + Math.sin(t * (ph === 3 ? 9 : 4)) * 0.15 + (e.atk === 'laser' ? 0.4 : 0);
    R.spr(A.core, x, y, 0, eye * 1.3, eye * 1.3, mul(ec, 1.05), 0.9, 1);
    R.spr(A.core, x, y, 0, eye * 0.42, eye * 0.42, [1.9, 1.8, 1.7], 1, 1);
    if (fl) R.spr(A.bCore, x, y, e.rot * -0.5, 1, 1, mul(WHITE, 2 * fl), 1, 1);
    if (S.blocks(L.W, e)) { const pu = 1 + Math.sin(t * 3) * 0.02; R.spr(A.hexShield, x, y, t * 0.2, 0.92 * pu, 0.92 * pu, [0.5, 1.4, 2.2], 0.45 + Math.sin(t * 5) * 0.08, 1); }
  } else if (d === 'strazhPod') {
    const P = e.par, en = P.st === 'enter';
    R.spr(A.bPod, x, y, e.ang, 1, 1, WHITE, 1, 0);
    R.spr(A.bGun, x + Math.cos(e.aim || Math.PI) * 10, y + Math.sin(e.aim || Math.PI) * 10, e.aim || Math.PI, 1, 1, WHITE, 1, 0);
    R.spr(A.bPodG, x, y, e.ang, 1, 1, mul(C.foe3, 1 + fl * 2 + (e.cool < 20 && !en ? 0.8 : 0)), 1, 1);
    if (fl) R.spr(A.bPod, x, y, e.ang, 1, 1, mul(WHITE, 2 * fl), 1, 1);
  } else if (d === 'kristal') {
    const g = A['krisG' + e.shape], sp = A['kris' + e.shape], sc = e.sc * 1.25, o = 1.4;
    R.spr(A.glow, x, y, 0, 1.1 * sc, 1.1 * sc, [1.2, 1.0, 2.2], 0.14, 1);
    R.spr(sp, x, y, e.rot, sc, sc, WHITE, 1, 0);
    R.spr(g, x - o, y, e.rot, sc, sc, [2.2, 0.45, 0.8], 0.75 + fl, 1); // призматичен ръб: три разместени цвята
    R.spr(g, x, y + o * 0.6, e.rot, sc, sc, [0.45, 2.0, 0.9], 0.6 + fl, 1);
    R.spr(g, x + o, y, e.rot, sc, sc, [0.7, 0.8, 2.6], 0.75 + fl, 1);
  } else if (d === 'shtit') {
    R.spr(A.glow, x, y, 0, 0.6, 0.6, C.foe2, 0.3, 1);
    R.spr(A.shtit, x, y, e.rot, 1, 1, WHITE, 1, 0);
    R.spr(A.shtitG, x, y, e.rot, 1, 1, mul(C.foe2, 1 + fl * 2), 1, 1);
    R.spr(A.shield, x - 24, y, Math.PI, 1, 1, [1.5, 1.1, 2.6], 0.85 + Math.sin(t * 6) * 0.1, 1);
    if (fl) R.spr(A.shtit, x, y, e.rot, 1, 1, mul(WHITE, 2 * fl), 1, 1);
  } else if (d === 'lachemet') {
    const ch = e.st === 1 && e.k < 30 ? 1 - e.k / 30 : e.st === 2 ? 1 : 0;
    R.spr(A.glow, x - 18, y, 0, 0.3 + ch * 0.4, 0.3 + ch * 0.4, C.ebul, 0.4 + ch * 0.4, 1);
    R.spr(A.lach, x, y, e.rot, 1, 1, WHITE, 1, 0);
    R.spr(A.lachG, x, y, e.rot, 1, 1, mul(C.foe, 1 + fl * 2 + ch * 0.6), 1, 1);
    if (fl) R.spr(A.lach, x, y, e.rot, 1, 1, mul(WHITE, 2 * fl), 1, 1);
  } else if (d === 'minyor') {
    R.spr(A.minyor, x, y, e.rot, 1, 1, WHITE, 1, 0);
    R.spr(A.minyorG, x, y, e.rot, 1, 1, mul(C.foe3, 1 + fl * 2), 1, 1);
    R.spr(A.glow, x + 24, y - 6, 0, 0.16, 0.16, C.foe3, 0.9, 1); R.spr(A.glow, x + 24, y + 6, 0, 0.16, 0.16, C.foe3, 0.9, 1);
    if (fl) R.spr(A.minyor, x, y, e.rot, 1, 1, mul(WHITE, 2 * fl), 1, 1);
  } else if (d === 'mina') {
    const armed = e.t >= 40, bl = armed && Math.floor(t * (e.fuse ? 16 : 2.5)) % 2 === 0;
    R.spr(A.mina, x, y, e.rot, 1, 1, armed ? [2.2, 0.6, 1.2] : [1.1, 0.6, 0.9], 1, 0);
    if (bl) R.spr(A.glow, x, y, 0, e.fuse ? 0.9 : 0.5, e.fuse ? 0.9 : 0.5, C.ebul, 0.8, 1);
    if (e.fuse) R.spr(A.ring, x, y, 0, 0.3 + (26 - e.fuse) * 0.04, 0.3 + (26 - e.fuse) * 0.04, C.ebul, 0.5, 1);
  } else if (d === 'delitel') {
    const sc = e.r / 24, pu = 1 + Math.sin(t * 5 + e.id) * 0.04;
    R.spr(A.glow, x, y, 0, 0.9 * sc, 0.9 * sc, [2.6, 0.55, 1.0], 0.25, 1);
    R.spr(A.cell, x, y, e.rot, sc * pu, sc * pu, WHITE, 1, 0);
    R.spr(A.cellG, x, y, e.rot, sc * pu, sc * pu, mul([2.6, 0.55, 1.0], 1 + fl * 2), 1, 1);
  } else if (d === 'vihar') {
    R.spr(A.glow, x, y, 0, 0.7, 0.7, C.foe, 0.25, 1);
    R.spr(A.vihar, x, y, e.spin, 1, 1, WHITE, 1, 0);
    R.spr(A.viharG, x, y, e.spin, 1, 1, mul(C.foe, 1 + fl * 2), 1, 1);
  } else if (d === 'gromo') {
    const ch = e.st === 1 ? M.sat(e.k / 60) * (e.k <= 62 ? 1 : 0.3) : 0, VC = [1.6, 0.9, 2.8];
    R.spr(A.glow, x, y - 18, 0, 0.5 + ch, 0.5 + ch, VC, 0.3 + ch * 0.5, 1);
    R.spr(A.gromo, x, y, 0, 1, 1, WHITE, 1, 0);
    R.spr(A.gromoG, x, y, 0, 1, 1, mul(VC, 1 + fl * 2 + ch), 1, 1);
    if (ch > 0.3 && Math.random() < k * ch) F.sparkle(x, y - 18, VC, 2, 4);
  } else if (d === 'burevest') {
    R.spr(A.burev, x, y, e.rot, 1, 1, WHITE, 1, 0);
    R.spr(A.burevG, x, y, e.rot, 1, 1, mul([2.7, 1.0, 0.35], 1 + fl * 2), 1, 1);
    if (Math.random() < k * 0.6) F.trail(x - Math.cos(e.rot) * 12, y - Math.sin(e.rot) * 12, 0, 0, [2.2, 0.8, 0.3], 10, 14, 0.4);
  } else if (d === 'prizma' || d === 'prizmaS') {
    if (e.split) { R.spr(A.glow, x, y, 0, 1.6, 1.6, [1.4, 1.0, 2.4], 0.12, 1); }
    else {
      const sc = d === 'prizma' ? 1 : 0.55, o = 1.6 * sc, g = A.prizmaG, rr = e.rot;
      R.spr(A.glow, x, y, 0, 2.2 * sc, 2.2 * sc, [1.4, 1.0, 2.4], 0.16, 1);
      R.spr(A.prizma, x, y, rr, sc, sc, WHITE, 1, 0);
      R.spr(g, x - o, y, rr, sc, sc, [2.4, 0.5, 0.9], 0.8 + fl, 1);
      R.spr(g, x, y + o * 0.6, rr, sc, sc, [0.5, 2.1, 1.0], 0.65 + fl, 1);
      R.spr(g, x + o, y, rr, sc, sc, [0.8, 0.9, 2.8], 0.8 + fl, 1);
      R.spr(A.core, x, y, 0, 0.8 * sc, 0.8 * sc, [1.3, 1.0, 1.9], 0.6 + Math.sin(t * 4) * 0.15, 1);
    }
  } else if (d === 'prizrak') {
    const v = e.vis, sh = e.st === 1 ? 0.5 + 0.5 * Math.sin(t * 40) : 1;
    if (v < 0.05) { R.spr(A.ghostG, x, y, Math.PI, 1, 1, [0.4, 1.2, 1.0], 0.05 + 0.04 * Math.sin(t * 7), 1); return; }
    R.spr(A.glow, x, y, 0, 0.7, 0.7, [0.5, 2.0, 1.6], 0.25 * v, 1);
    R.spr(A.ghost, x, y, Math.PI, 1, 1, [0.7, 1.4, 1.2], v * sh, 1);
    R.spr(A.ghostG, x, y, Math.PI, 1, 1, mul([1.0, 2.6, 2.0], 1 + fl * 2), v * sh, 1);
  } else if (d === 'svetulka') {
    const fw = 0.8 + 0.2 * Math.sin(t * 30 + e.id);
    R.spr(A.glow, x, y, 0, 0.9, 0.9, [1.6, 2.6, 0.8], 0.45, 1);
    R.spr(A.svet, x, y, Math.PI, 1, fw, mul([1.8, 2.6, 0.9], 1 + fl), 1, 1);
  } else if (d === 'pipalo') {
    const pu = 1 + e.pulse * 0.12;
    R.spr(A.glow, x, y, 0, 1.2 * pu, 1.2 * pu, [0.6, 2.2, 1.8], 0.25 + e.pulse * 0.4, 1);
    R.spr(A.jelly, x, y + 6, 0, pu, 1 / pu, WHITE, 1, 0);
    R.spr(A.jellyG, x, y + 6, 0, pu, 1 / pu, mul([0.9, 2.6, 2.1], 1 + fl * 2 + e.pulse), 1, 1);
  } else if (d === 'skala') {
    const sc = e.r / 50;
    R.spr(A['rock' + e.shape], x, y, 0, sc, sc, WHITE, 1, 0);
    R.spr(A['rockG' + e.shape], x, y, 0, sc, sc, [0.6, 0.8, 1.6], 0.6, 1);
  } else if (d === 'zvezda') {
    R.spr(A.glow, x, y, 0, 0.8, 0.8, [1.6, 1.2, 2.8], 0.3, 1);
    R.spr(A.zvezda, x, y, e.spin, 1, 1, WHITE, 1, 0);
    R.spr(A.zvezdaG, x, y, e.spin, 1, 1, mul([1.6, 1.2, 2.8], 1 + fl * 2 + (e.cool < 12 ? 0.8 : 0)), 1, 1);
  } else if (d === 'kometa') {
    if (Math.random() < k) F.trail(x - Math.cos(e.rot) * 8, y - Math.sin(e.rot) * 8, -e.vx * 0.1, 0, [2.2, 1.6, 0.6], 18, 22, 0.5);
    R.spr(A.glow, x, y, 0, 0.6, 0.6, [2.6, 1.8, 0.7], 0.5, 1);
    R.spr(A.kometa, x, y, e.rot, 1, 1, mul([2.6, 2.0, 1.0], 1 + fl), 1, 1);
  } else if (d === 'gnezdo') {
    R.spr(A.gnezdo, x, y, e.side > 0 ? Math.PI : 0, 1, 1, WHITE, 1, 0);
    R.spr(A.bGun, x + Math.cos(e.aim) * 9, y + Math.sin(e.aim) * 9, e.aim, 0.8, 0.8, WHITE, 1, 0);
    R.spr(A.gnezdoG, x, y, e.side > 0 ? Math.PI : 0, 1, 1, mul([2.6, 0.4, 0.6], 1 + fl * 2 + (e.cool < 15 ? 0.7 : 0)), 1, 1);
  } else if (d === 'glitch') {
    if (e.cloak) return;
    const j = Math.random() < 0.3 ? (Math.random() - 0.5) * 6 : 0;
    R.spr(A.cube, x - 2 + j, y, t * 1.5, 1, 1, [2.6, 0.2, 0.4], 0.7, 1);
    R.spr(A.cube, x + 2 - j, y, t * 1.5, 1, 1, [0.2, 1.4, 2.6], 0.7, 1);
    R.spr(A.cube, x, y, t * 1.5, 1, 1, mul([2.0, 1.8, 2.0], 1 + fl), 1, 1);
  } else if (d === 'meduza') {
    for (const T of e.tent) { // пипалата: светещи сегменти
      let px = null, py = null;
      for (let j = 0; j < T.pts.length; j++) {
        const P = T.pts[j], qx = P.px + (P.x - P.px) * a, qy = P.py + (P.y - P.py) * a;
        if (px != null) { const dx = qx - px, dy = qy - py, l = Math.hypot(dx, dy); R.spr(A.bar, (px + qx) / 2, (py + qy) / 2, Math.atan2(dy, dx), l / 16 + 0.2, (6 - j * 0.4) / 16, [0.6, 2.2, 1.8], 0.8, 1); }
        px = qx; py = qy;
      }
      R.spr(A.glow, px, py, 0, 0.35, 0.35, [0.8, 2.6, 2.0], 0.8, 1);
    }
    const op = e.open, cl = 1 - op * 0.12;
    R.spr(A.glow, x, y, 0, 3, 2.4, [0.5, 1.8, 1.5], 0.18, 1);
    R.spr(A.core, x, y + 4, 0, 1.2 + op * 0.6, 1.2 + op * 0.6, mul([1.4, 2.8, 2.2], 0.5 + op), 0.4 + op * 0.6, 1);
    R.spr(A.bell, x, y, 0, 1 + op * 0.08, cl, WHITE, 1, 0);
    R.spr(A.bellG, x, y, 0, 1 + op * 0.08, cl, mul([0.9, 2.6, 2.1], 0.8 + fl * 2 + op * 0.3), 1, 1);
    if (S.blocks(L.W, e)) R.spr(A.hexShield, x, y + 2, 0, 1.0, 0.75, [0.6, 2.0, 1.6], 0.22, 1);
  } else if (d === 'metronom') {
    const px = e.pvx, py = e.pvy, dx = x - px, dy = y - py, l = Math.hypot(dx, dy);
    R.spr(A.metFrame, px, py + 60, 0, 1, 1, WHITE, 1, 0);
    R.spr(A.metFrameG, px, py + 60, 0, 1, 1, [1.6, 1.0, 2.6], 0.8, 1);
    R.spr(A.bar, (px + x) / 2, (py + y) / 2, Math.atan2(dy, dx), l / 16, 6 / 16, [1.6, 1.0, 2.6], 0.9, 1);
    R.spr(A.bar, (px + x) / 2, (py + y) / 2, Math.atan2(dy, dx), l / 16, 1.6 / 16, [2.4, 2.2, 2.8], 1, 1);
    const bt = 3600 / e.bpm, ph = (e.bp % 1), hit = Math.max(0, 1 - ph * 4);
    R.spr(A.glow, x, y, 0, 1.6 + hit, 1.6 + hit, [1.6, 1.0, 2.8], 0.25 + hit * 0.5, 1);
    R.spr(A.bob, x, y, e.th, 1, 1, WHITE, 1, 0);
    R.spr(A.bobG, x, y, e.th, 1, 1, mul([1.6, 1.0, 2.8], 1 + fl * 2 + hit), 1, 1);
    R.spr(A.core, x, y, 0, 0.8 + hit * 0.5, 0.8 + hit * 0.5, [2.2, 1.6, 2.8], 0.9, 1);
  } else if (d === 'disonans') {
    const ph = e.ph, ec = ph === 3 ? [2.9, 0.3, 0.4] : ph === 2 ? [2.8, 0.4, 1.0] : [2.6, 0.5, 1.4];
    R.spr(A.glow, x, y, 0, 4, 4, ec, 0.1 + ph * 0.04, 1);
    if (ph === 1) for (const Rg of e.rings) { // пръстените щит: дъги между пролуките
      const seg = M.TAU / Rg.gaps;
      for (let g = 0; g < Rg.gaps; g++) for (let a0 = Rg.gw; a0 < seg - 0.02; a0 += 0.09) {
        const an = Rg.rot + g * seg + a0 + 0.045, cx = x + Math.cos(an) * Rg.r, cy = y + Math.sin(an) * Rg.r;
        R.spr(A.bar, cx, cy, an + Math.PI / 2, Rg.r * 0.095 / 16, 7 / 16, ec, 0.9, 1);
        R.spr(A.bar, cx, cy, an + Math.PI / 2, Rg.r * 0.095 / 16, 2 / 16, [2.6, 2.4, 2.6], 0.9, 1);
      }
    }
    const j = ph >= 2 && Math.random() < 0.15 ? (Math.random() - 0.5) * 8 : 0;
    R.spr(A.eye, x + j, y, e.ft * 0.004, 1, 1, WHITE, 1, 0);
    R.spr(A.eyeG, x + j, y, e.ft * 0.004, 1, 1, mul(ec, 0.9 + fl * 2), 1, 1);
    const pa = S.aimA(L.W, x, y);
    R.spr(A.pupil, x + Math.cos(pa) * 10, y + Math.sin(pa) * 5, 0, 1, 1, mul(ec, 1.1), 1, 1);
  } else if (d === 'led') {
    const b = e.big ? '' : 's', s = e.shape;
    R.spr(A['led' + b + s], x, y, e.rot, 1, 1, WHITE, 1, 0);
    R.spr(A['led' + b + 'G' + s], x, y, e.rot, 1, 1, [0.8 + fl * 2, 1.1 + fl * 2, 1.5 + fl * 2], 0.8, 1);
  }
}

// мъгла (ниво 4): светлинна карта от кораба, изстрелите, ракетите, експлозиите и светещите врагове
L.flares = []; L.flashes = [];
L.flare = (x, y) => L.flares.push({ x, y, vx: 6, vy: (Math.random() - 0.5) * 1.5, l: 300 });
L.flash = (x, y, r) => L.flashes.push({ x, y, r, l: 34 });
function fogPass(W, a, t, A) {
  const p = W.p, g = A.glow;
  R.lightBegin(0.04);
  const lit = (x, y, r, i) => R.spr4(g, x, y, 0, r, r, i, i, i, 1, 1);
  if (p.alive) { lit(ix(p, a), iy(p, a), 900, 1.7); lit(ix(p, a) + 160, iy(p, a), 500, 0.5); }
  for (const b of W.pb) lit(ix(b, a), iy(b, a), b.k === 'msl' ? 260 : 170, 0.55);
  for (const B of p.beams) for (let x = B.x; x < (B.end || S.W); x += 90) lit(x, B.y, 220, 0.5);
  for (const e of W.foes) if (!e.dead && !e.cloak) lit(ix(e, a), iy(e, a), e.d.light ? e.d.light * 2.2 : 110, e.d.light ? 1.1 : 0.32);
  for (const it of W.items) lit(ix(it, a), iy(it, a), it.k === 'cr' ? 70 : 280, 0.8);
  for (const b of W.eb) lit(ix(b, a), iy(b, a), 90, 0.4);
  for (const f of L.flares) { lit(f.x, f.y, 760 * Math.min(1, f.l / 60), 1.4); R.spr(A.flare, f.x, f.y, 0, 0.8, 0.8, [2.6, 2.8, 2.2], 1, 1); }
  for (const f of L.flashes) lit(f.x, f.y, f.r * (f.l / 34), 1.5 * f.l / 34);
  R.lightEnd();
  S.BG.drawFog(t, W.scroll, 0.95);
  for (const f of L.flares) { R.spr(A.glow, f.x, f.y, 0, 0.9, 0.9, [2.2, 2.8, 2.0], 0.9, 1); R.spr(A.flare, f.x, f.y, t * 2, 1.2, 1.2, [2.6, 2.8, 2.4], 1, 1); }
}
L.tick = function (k) {
  for (const f of L.flares) { f.x += f.vx * k; f.y += f.vy * k; f.vx *= Math.pow(0.97, k); f.l -= k; }
  L.flares = L.flares.filter(f => f.l > 0);
  for (const f of L.flashes) f.l -= k;
  L.flashes = L.flashes.filter(f => f.l > 0);
};
// импулсът на пулсара: предупреждение (сенките се очертават) и самият удар
function floodPass(W, t) {
  const P = W.pulsar, ph = P.t % P.period, tw = P.period - P.tele;
  const pre = ph >= tw ? (ph - tw) / P.tele : 0, after = ph >= P.dur && ph < P.dur + 40 ? 1 - (ph - P.dur) / 40 : 0;
  const I = P.on ? 0.95 : after * 0.35;
  if (I <= 0 && pre <= 0) return;
  const rocks = W.foes.filter(e => !e.dead && e.d.rock).map(e => [e.x, e.y, e.r]);
  S.BG.drawFlood(I, pre * (0.6 + 0.4 * Math.sin(t * (6 + pre * 20))) * 0.8, rocks, S.PULSAR);
}
const LEV = { leviatan: 1, levPlate: 1, levNode: 1 }, EMB = [2.8, 1.0, 0.3];
function lev(e, a, t, A) {
  const ps = e.parts.filter(q => q.d.id === 'levPlate' && !q.dead).sort((p, q) => q.i - p.i);
  for (const q of ps) { const x = ix(q, a), y = iy(q, a), fl = q.flash / 5; R.spr(A.levPlate, x, y, q.ang, q.sc, q.sc, WHITE, 1, 0); R.spr(A.levPlateG, x, y, q.ang, q.sc, q.sc, mul(EMB, 0.8 + fl), 1, 1); }
  for (const q of e.parts) if (q.d.id === 'levNode' && !q.dead) {
    const x = ix(q, a), y = iy(q, a), fl = q.flash / 5, pu = 1 + Math.sin(t * 6 + q.i) * 0.12;
    R.spr(A.glow, x, y, 0, 0.8 * pu, 0.8 * pu, [2.8, 0.6, 1.8], 0.45, 1);
    R.spr(A.core, x, y, 0, 1.0 * pu, 1.0 * pu, mul([2.8, 0.7, 1.9], 1 + fl), 1, 1);
    R.spr(A.ring, x, y, t * 2, 0.22, 0.22, [2.8, 0.8, 2.0], 0.8, 1);
  }
  const x = ix(e, a), y = iy(e, a), fl = e.flash / 5, br = e.atk === 'breath' && e.at < 80;
  if (br) R.spr(A.glow, x + Math.cos(e.ang) * 40, y + Math.sin(e.ang) * 40, 0, 1.1, 1.1, C.ebul, 0.6, 1);
  R.spr(A.levHead, x, y, e.ang, 1, 1, WHITE, 1, 0);
  R.spr(A.levHeadG, x, y, e.ang, 1, 1, mul(e.ph === 3 ? [2.8, 0.5, 0.3] : EMB, 1 + fl * 2), 1, 1);
  if (fl) R.spr(A.levHead, x, y, e.ang, 1, 1, mul(WHITE, 2 * fl), 1, 1);
  if (S.blocks(L.W, e)) R.spr(A.hexShield, x, y, t * 0.3, 0.8, 0.8, [2.2, 0.9, 0.4], 0.35 + Math.sin(t * 5) * 0.06, 1);
}
// мълния: начупена линия, която се пренарежда на всеки 3 такта; клони встрани
function bolt(L, A, t) {
  const g = S.rng((L.seed || 1) * 31 + Math.floor(L.t / 3)), n = 14, y0 = L.y, y1 = L.y + L.len, q = M.sat((L.tele + L.dur - L.t) / 10), BC = [1.6, 1.8, 2.8];
  let px = L.x, py = y0;
  const seg = (x0, ya, x1, yb, w, al) => { const dx = x1 - x0, dy = yb - ya, len = Math.hypot(dx, dy), an = Math.atan2(dy, dx), cx = (x0 + x1) / 2, cy = (ya + yb) / 2;
    R.spr(A.bar, cx, cy, an, len / 16 + 0.3, w * 2.6 / 16, BC, 0.35 * al, 1); R.spr(A.bar, cx, cy, an, len / 16 + 0.3, w * 0.5 / 16, [2.4, 2.5, 2.8], al, 1); };
  for (let i = 1; i <= n; i++) {
    const ny = y0 + (y1 - y0) * i / n, nx = L.x + (i < n ? g.range(-24, 24) : 0);
    seg(px, py, nx, ny, L.w * 0.5, q);
    if (g() < 0.22) { const bx = nx + g.sign() * g.range(30, 70), by = ny + g.range(20, 60); seg(nx, ny, bx, by, L.w * 0.25, q * 0.7); }
    px = nx; py = ny;
  }
}

function player(W, p, a, t, k, A) {
  if (!p.alive) return;
  const x = ix(p, a), y = iy(p, a);
  const blink = p.inv > 0 && p.enter <= 0 ? (Math.floor(t * 18) % 2 ? 0.35 : 1) : 1;
  const sy = 1 - Math.abs(p.bank) * 0.2, rot = p.bank * 0.1;
  // двигател: пламък и следа
  const thr = M.clamp(1 + (p.x - p.px) * 0.12, 0.6, 1.8), fk = 0.85 + Math.random() * 0.3;
  R.spr(A.flame, x - 46 * thr * 0.5 - 20, y, 0, thr * fk * 1.1, 0.8, mul(C.player, 1.4), 0.9 * blink, 1);
  R.spr(A.glow, x - 32, y, 0, 0.5, 0.36, mul(C.player, 1.3), 0.7 * blink, 1);
  if (Math.random() < k) F.flame(x - 34, y + (Math.random() - 0.5) * 3, -2.5 - Math.random(), (Math.random() - 0.5) * 0.4, mul(C.player, 0.9), 22, 16, 0.32);
  R.spr(A.ship, x, y, rot, 1, sy, WHITE, blink, 0);
  R.spr(A.shipG, x, y, rot, 1, sy, mul(C.player, 1.25), blink, 1);
  // излъчвателят между зъбите на камертона
  const firing = p.beams.length > 0 || p.cd > S.WEAPONS[p.weapon].cd - 3;
  R.spr(A.glow, x + 30, y + rot * 30, 0, firing ? 0.55 : 0.3, firing ? 0.55 : 0.3, mul(WC[p.weapon], firing ? 1.4 : 0.8), 0.9 * blink, 1);
  if (p.shield > 0) {
    const q = p.shield / 3, pu = 1 + Math.sin(t * 5) * 0.03;
    R.spr(A.ring, x - 2, y, 0, 0.78 * pu, 0.62 * pu, mul(C.player, 0.7 + q * 0.6), 0.55 + q * 0.3, 1);
    R.spr(A.glow, x - 2, y, 0, 1.5, 1.2, C.player, 0.07 + q * 0.06, 1);
  }
  for (let i = 0; i < p.echo; i++) {
    const h = S.echoPos(p, i);
    R.spr(A.glow, h.x, h.y, 0, 0.6, 0.6, C.player, 0.35, 1);
    R.spr(A.echo, h.x, h.y, 0, 1, 1, WHITE, 1, 0);
    R.spr(A.echoG, h.x, h.y, t * 3 + i, 1, 1, mul(C.player, 1.3), 1, 1);
  }
}

L.draw = function (W, a, t, k) {
  const A = S.ART.spr, p = W.p; L.W = W;
  F.drawDust(false, t);
  R.clip(true);
  F.drawLo();
  for (const it of W.items) {
    const x = ix(it, a), y = iy(it, a);
    if (it.k === 'cr') { R.spr(A.glow, x, y, 0, 0.3, 0.3, C.crystal, 0.5, 1); R.spr(A.cr, x, y, t * 4 + it.sp * 6, 1, 1, mul(C.crystal, 0.9), 1, 1); }
    else if (it.k === 'wpn') {
      const wc = WC[it.w], pu = 1 + Math.sin(t * 6) * 0.05, ch = (it.t % 150) / 150;
      R.spr(A.glow, x, y, 0, 1.4, 1.4, wc, 0.3, 1);
      R.spr(A.ring, x, y, t * 0.8, 0.5 * pu, 0.5 * pu, wc, 0.55, 1);
      R.spr(A.wcr, x, y, Math.sin(t * 2) * 0.15, pu, pu, WHITE, 1, 0);
      R.spr(A.wcrG, x, y, Math.sin(t * 2) * 0.15, pu, pu, mul(wc, 1.1 + (ch > 0.85 ? Math.sin(t * 40) * 0.5 : 0)), 1, 1);
      R.spr(A[ICO[it.w]], x, y, 0, 1, 1, [2.4, 2.4, 2.6], 1, 1);
    }
    else if (it.k === 'note') {
      const pu = 1 + Math.sin(t * 7 + it.t * 0.02) * 0.06;
      R.spr(A.glow, x, y, 0, 1.3, 1.3, C.note, 0.22, 1);
      R.spr(A.ring, x, y, 0, 0.42 * pu, 0.42 * pu, C.note, 0.5 + 0.3 * Math.sin(t * 9), 1);
      R.spr(A.note, x, y, Math.sin(t * 3) * 0.15, pu, pu, mul(C.note, 0.85), 1, 0);
    }
  }
  for (const e of W.foes) if (!LEV[e.d.id]) foe(e, a, t, k, A);
  if (W.boss && W.boss.d.id === 'leviatan' && !W.boss.dead) lev(W.boss, a, t, A);
  for (const b of W.pb) {
    const x = ix(b, a), y = iy(b, a);
    if (b.k === 'pulse') {
      const w = b.dmg < 1 ? 0.75 : 1;
      R.spr(A.pulse, x, y, b.a, 1.15 * w, 1.4 * w, mul(C.pulse, 0.9), 1, 1);
      R.spr(A.pulse, x + 2, y, b.a, 0.6 * w, 0.5 * w, [2.4, 2.6, 2.8], 1, 1);
    } else if (b.k === 'fan') {
      const w = b.dmg < 0.7 ? 0.75 : 1;
      R.spr(A.glow, x - 4, y, 0, 0.35 * w, 0.2 * w, C.fan, 0.5, 1);
      R.spr(A.dart, x, y, b.a, w, w, mul(C.fan, 1.1), 1, 1);
    } else if (b.k === 'wave') {
      const w = b.dmg < 1 ? 0.75 : 1;
      const ang = Math.atan2(b.y - b.py, b.x - b.px);
      R.spr(A.glow, x - 4, y, 0, 0.5 * w, 0.5 * w, C.wave, 0.3, 1);
      R.spr(A.arcw, x, y, ang, w, w, mul(C.wave, 0.85), 1, 1);
      if (Math.random() < k * 0.5) F.trail(x - 6, y, -1, 0, mul(C.wave, 0.6), 7 * w, 12, 0.35);
    } else if (b.k === 'msl') {
      const ang = Math.atan2(b.vy, b.vx);
      if (Math.random() < k) F.trail(x - Math.cos(ang) * 8, y - Math.sin(ang) * 8, 0, 0, [1.4, 1.1, 0.8], 10, 24, 0.35);
      R.spr(A.glow, x - Math.cos(ang) * 9, y - Math.sin(ang) * 9, 0, 0.3, 0.3, [2.6, 1.6, 0.8], 0.8, 1);
      R.spr(A.msl, x, y, ang, 1, 1, [1.3, 1.5, 1.8], 1, 0);
    }
  }
  for (const B of p.beams) { // Лъч: непрекъсната линия до първата преграда
    const fl = 0.85 + Math.sin(t * 50) * 0.08 + Math.random() * 0.07, len = Math.max(0, (B.end || S.W + 60) - B.x);
    beamLine(A, B.x, B.y, 0, len, B.w, C.beam, 1, fl, 0.8);
    R.spr(A.flare, B.x, B.y, 0, 0.6, 0.4, C.beam, 0.8, 1);
    if (B.end < S.W) R.spr(A.glow, B.end, B.y, 0, 0.6, 0.6, C.beam, 0.8, 1);
  }
  player(W, p, a, t, k, A);
  if (L.hitbox && p.alive && p.enter <= 0) { const x = ix(p, a), y = iy(p, a); R.spr(A.dot, x, y, 0, 0.9, 0.9, [2.2, 2.4, 2.6], 1, 1); R.spr(A.ring, x, y, 0, 0.11, 0.11, C.player, 0.9, 1); }
  for (const Lz of W.lz) {
    const lc = LZC[Lz.c] || C.ebul;
    if (Lz.t <= Lz.tele) { // предупреждение: тънка пулсираща линия
      const q = Lz.t / Lz.tele;
      if (Lz.kind === 'bolt') { beamLine(A, Lz.x, 0, Math.PI / 2, S.H, 2 + q * 3, lc, 0.18 + q * 0.4 + Math.sin(t * 34) * 0.1, 0.5); R.spr(A.glow, Lz.x, 4, 0, 1 + q * 1.5, 0.5 + q * 0.6, lc, 0.3 + q * 0.4, 1); continue; }
      beamLine(A, Lz.x, Lz.y, Lz.a, Lz.len, 3 + q * 3, lc, 0.25 + q * 0.5 + Math.sin(t * 30) * 0.12, 0.6);
      R.spr(A.glow, Lz.x, Lz.y, 0, 0.6 + q, 0.6 + q, lc, 0.5, 1);
    } else if (Lz.kind === 'bolt') bolt(Lz, A, t);
    else {
      const q = M.sat((Lz.tele + Lz.dur - Lz.t) / 12), fl = 0.85 + Math.random() * 0.15;
      beamLine(A, Lz.x, Lz.y, Lz.a, Lz.len, Lz.w * (0.6 + 0.4 * q), lc, q, fl, 1.4);
      R.spr(A.flare, Lz.x, Lz.y, 0, 1.6, 1.6, mul(lc, 1.3), q, 1);
    }
  }
  if (W.bomb) {
    const B = W.bomb, s = B.r * 2 / 116;
    R.spr(A.ring, B.x, B.y, 0, s, s, mul(C.player, 1.6), M.sat(1.4 - B.r / 1200), 1);
    R.spr(A.ring, B.x, B.y, 0, s * 0.94, s * 0.94, [2, 2, 2.4], M.sat(1 - B.r / 1300) * 0.7, 1);
    R.spr(A.glow, B.x, B.y, 0, s * 1.6, s * 1.6, C.player, M.sat(0.25 - B.r / 4000), 1);
  }
  F.drawHi();
  if (W.lv.fog) fogPass(W, a, t, A);
  if (W.pulsar) floodPass(W, t);
  for (const b of W.eb) { // вражеските изстрели — най-отгоре и най-четими
    const x = ix(b, a), y = iy(b, a), pk = b.c === 'ebul';
    const col = pk ? C.ebul : C.ebul2;
    R.spr(A.glow, x, y, 0, b.k === 'ndl' ? 0.5 : 0.62, b.k === 'ndl' ? 0.32 : 0.62, col, 0.4, 1);
    if (b.k === 'ndl') R.spr(pk ? A.ndlP : A.ndlA, x, y, b.a, 1, 1, [1.25, 1.25, 1.25], 1, 0);
    else R.spr(pk ? A.orbP : A.orbA, x, y, 0, 1, 1, [1.3, 1.3, 1.3], 1, 0);
  }
  R.clip(false);
  F.drawDust(true, t);
};
})();
