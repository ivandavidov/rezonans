// Резонанс в космоса — общото: пространството от имена, размери, математика, семенен генератор.
// Зарежда се и в браузъра, и в Node (dev/sim.js) — тук няма DOM.
(function () {
'use strict';
const G = typeof window !== 'undefined' ? window : globalThis;
const S = G.SPACE = G.SPACE || {};

S.W = 1280; S.H = 720;          // логическото игрално поле (16:9)
S.HZ = 60; S.DT = 1 / 60;        // логиката е на фиксирана стъпка

const M = S.M = {
  PI: Math.PI, TAU: Math.PI * 2,
  clamp: (v, a, b) => v < a ? a : v > b ? b : v,
  lerp: (a, b, t) => a + (b - a) * t,
  smooth: t => t * t * (3 - 2 * t),
  sat: v => v < 0 ? 0 : v > 1 ? 1 : v,
  len: (x, y) => Math.sqrt(x * x + y * y),
  d2: (ax, ay, bx, by) => (ax - bx) * (ax - bx) + (ay - by) * (ay - by),
  ang: (x, y) => Math.atan2(y, x),
  wrapA: a => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; },
  approach: (v, t, s) => v < t ? Math.min(v + s, t) : Math.max(v - s, t),
  easeOut: t => 1 - (1 - t) * (1 - t) * (1 - t),
  easeIn: t => t * t * t,
  // разстояние² от точка до отсечка (за бързите изстрели — без „прескачане“)
  segD2(px, py, ax, ay, bx, by) {
    const vx = bx - ax, vy = by - ay, l = vx * vx + vy * vy;
    let t = l ? ((px - ax) * vx + (py - ay) * vy) / l : 0; t = t < 0 ? 0 : t > 1 ? 1 : t;
    const dx = ax + vx * t - px, dy = ay + vy * t - py; return dx * dx + dy * dy;
  },
};

// mulberry32 — един и същ ред числа при едно и също семе (на това стъпват проверките)
S.rng = function (seed) {
  let s = seed >>> 0;
  const f = () => {
    s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  f.range = (a, b) => a + (b - a) * f();
  f.int = (a, b) => a + Math.floor(f() * (b - a + 1));
  f.pick = a => a[Math.floor(f() * a.length)];
  f.sign = () => f() < 0.5 ? -1 : 1;
  f.state = () => s >>> 0;
  return f;
};

// FNV-1a върху числа — отпечатък на състоянието
S.hash = function (nums) {
  let h = 0x811c9dc5;
  for (const n of nums) { const v = Math.round(n * 1000) | 0; for (let i = 0; i < 4; i++) { h ^= (v >>> (i * 8)) & 255; h = Math.imul(h, 16777619); } }
  return (h >>> 0).toString(16).padStart(8, '0');
};

// цветове: [r,g,b] в линейна скала; > 1 свети (сиянието хваща над 1)
S.C = {
  player: [0.35, 0.95, 1.6], pulse: [0.55, 1.4, 2.6], fan: [0.5, 2.2, 0.9], beam: [1.6, 0.7, 2.6], wave: [2.6, 1.5, 0.4],
  foe: [2.4, 0.55, 0.25], foe2: [2.2, 0.35, 1.3], foe3: [2.6, 1.2, 0.3],
  ebul: [2.8, 0.45, 1.25], ebul2: [2.8, 1.35, 0.35], note: [1.0, 2.2, 2.6], crystal: [1.1, 1.8, 2.8], gold: [2.8, 2.0, 0.7], white: [2.5, 2.5, 2.5],
};
})();
