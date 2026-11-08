// Входът: клавиатура (по физически клавиш — работи и на кирилица) и тъч → действия за един такт.
// Тъч: корабът следва пръста с отместване (не стои под него), стрелбата е сама.
(function () {
'use strict';
const S = window.SPACE;
const I = S.IN = { mode: 'keys', down: new Set(), hit: new Set(), tdx: 0, tdy: 0, drag: null, onKey: null };
const MAP = {
  ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r', ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd',
  Space: 'fire', KeyZ: 'fire', KeyJ: 'fire', KeyX: 'act', ShiftLeft: 'act', ShiftRight: 'act', KeyK: 'act', KeyC: 'bomb', KeyL: 'bomb',
  Escape: 'pause', KeyP: 'pause', Enter: 'ok', NumpadEnter: 'ok', KeyF: 'full', KeyM: 'music', Backquote: 'stats',
};
const STOP = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space']);

addEventListener('keydown', e => {
  const a = MAP[e.code]; if (!a) return;
  if (STOP.has(e.code)) e.preventDefault();
  if (I.mode !== 'keys') { I.mode = 'keys'; document.body.classList.remove('touch'); }
  if (!e.repeat) { I.hit.add(a); if (I.onKey) I.onKey(a, e); }
  I.down.add(a);
});
addEventListener('keyup', e => { const a = MAP[e.code]; if (a) I.down.delete(a); });
addEventListener('blur', () => I.down.clear());

// тъч върху игралното поле: първият пръст управлява
I.bindTouch = function (el, scale, active) {
  const toTouch = () => { if (I.mode !== 'touch') { I.mode = 'touch'; document.body.classList.add('touch'); } };
  el.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse') return;
    toTouch();
    if (I.drag != null || !active() || (e.target.closest && e.target.closest('.tbtn, .screen, button'))) return;
    I.drag = e.pointerId; I.lx = e.clientX; I.ly = e.clientY;
    e.preventDefault();
  }, { passive: false });
  el.addEventListener('pointermove', e => {
    if (e.pointerId !== I.drag) return;
    const s = scale() * 0.82; // малко по-бързо от пръста — по-малко местене
    I.tdx += (e.clientX - I.lx) / s; I.tdy += (e.clientY - I.ly) / s; I.lx = e.clientX; I.ly = e.clientY;
    e.preventDefault();
  }, { passive: false });
  const up = e => { if (e.pointerId === I.drag) I.drag = null; };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
};
I.touchBtn = function (el, act) {
  el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); I.hit.add(act); el.classList.add('on'); if (I.onKey) I.onKey(act, e); }, { passive: false });
  const off = () => el.classList.remove('on');
  el.addEventListener('pointerup', off); el.addEventListener('pointercancel', off); el.addEventListener('pointerleave', off);
};

// входът за един такт; ръбовете (натиснато сега) и тъч отместването се изразходват
I.sample = function () {
  const d = I.down, h = I.hit;
  const o = {
    ax: (d.has('r') ? 1 : 0) - (d.has('l') ? 1 : 0), ay: (d.has('d') ? 1 : 0) - (d.has('u') ? 1 : 0),
    fire: I.mode === 'touch' || d.has('fire'), act: h.has('act'), bomb: h.has('bomb'), tdx: 0, tdy: 0,
  };
  // бързото плъзгане не се губи: над 40 единици на такт остатъкът минава в следващите тактове
  o.tdx = Math.max(-40, Math.min(40, I.tdx)); o.tdy = Math.max(-40, Math.min(40, I.tdy)); I.tdx -= o.tdx; I.tdy -= o.tdy;
  h.delete('act'); h.delete('bomb');
  return o;
};
I.clear = () => { I.hit.clear(); I.tdx = I.tdy = 0; };
})();
