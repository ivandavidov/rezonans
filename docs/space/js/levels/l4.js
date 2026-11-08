// Ниво 4 — Тъмната мъглявина. Гъста мъгла: виждаш около кораба, изстрелите и сигналните ракети осветяват; призраци.
(function () {
'use strict';
const S = (typeof window !== 'undefined' ? window : globalThis).SPACE;
const H = S.H;
S.defLevel(4, {
  name: 'Тъмната мъглявина', bg: 'echo', music: 'echo', boss: 'boss4', sspd: 1.5, crv: 2, fog: true, dust: [0.6, 1.4, 1.1],
  brief: 'Тази мъглявина е толкова гъста, че поглъща светлината. Ще виждаш само около кораба, но всеки твой изстрел осветява пътя, а корабът сам изстрелва сигнални ракети. Някои врагове се крият в мъглата и се показват само за да стрелят.',
  clearText: 'Мъглата се разсея',
  script: W => [
    [1.5, A => A.banner('Мъгла', 'виждаш само около кораба — изстрелите ти осветяват пътя')],
    [1.5, A => A.line('svetulka', { y: 220, n: 7, gap: 46 })],
    [3.0, A => A.line('svetulka', { y: 500, n: 7, gap: 46 })],
    [2.5, A => A.line('iskra', { y: 360, n: 6, amp: 120 })],
    ['clear'],
    [1.0, A => { A.banner('Призрак', 'не се вижда, докато не стреля'); A.one('prizrak', { y: 200 }); A.one('prizrak', { y: 520, x: S.W + 140 }); }],
    [5.0, A => A.one('pipalo', { y: 300 })],
    [3.0, A => A.line('svetulka', { y: 560, n: 6 })],
    [2.5, A => { A.one('delitel', { y: 200 }); A.one('delitel', { y: 480, x: S.W + 140 }); }],
    ['clear'],
    ['cp'],
    [1.0, A => { A.one('pipalo', { y: 180 }); A.one('pipalo', { y: 540, x: S.W + 200 }); }],
    [3.0, A => { A.one('prizrak', { y: 360 }); A.line('svetulka', { y: 120, n: 6 }); }],
    [3.0, A => { A.one('shtit', { y: 260, tx: 1040 }); A.one('shtit', { y: 470, tx: 1100 }); }],
    [3.0, A => A.one('nosach', { y: 360 })],
    [3.0, A => A.line('vihar', { y: 300, n: 3, gap: 120, rad: 70 })],
    ['clear'],
    [1.0, A => { A.one('prizrak', { y: 150 }); A.one('prizrak', { y: 360, x: S.W + 100 }); A.one('prizrak', { y: 570, x: S.W + 200 }); }],
    [4.0, A => A.v('iskra', { y: 360, n: 7, path: 'dive' })],
    [3.0, A => { A.one('venets', { y: 360, rings: 4 }); A.line('svetulka', { y: 600, n: 6 }); }],
    ['clear'],
    ['cp'],
    [1.0, A => { A.one('pipalo', { y: 360 }); A.line('svetulka', { y: 140, n: 7 }); A.line('svetulka', { y: 580, n: 7, x: S.W + 200 }); }],
    [3.5, A => { A.one('kopie', { y: 200, tx: 1060 }); A.one('kopie', { y: 520, tx: 1060 }); A.one('prizrak', { y: 360 }); }],
    [3.0, A => { A.one('delitel', { y: 300 }); A.one('shtit', { y: 500, tx: 1080 }); }],
    [3.0, A => A.one('nosach', { y: 200, spd: 2 })],
    [3.0, A => { A.one('prizrak', { y: 250 }); A.one('prizrak', { y: 470, x: S.W + 120 }); A.one('pipalo', { y: 620, x: S.W + 100 }); }],
    ['clear'],
    [1.5, A => A.warn('Медузата', 'приближава')],
    [3.5, A => A.boss('meduza')],
  ],
});
})();
