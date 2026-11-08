// Ниво 6 — Крепостта на ордата. Коридор със стени, кули по тях, прескачащи врагове; два стари пазача — и Ядрото.
(function () {
'use strict';
const S = (typeof window !== 'undefined' ? window : globalThis).SPACE;
const H = S.H;
const nests = (A, n, x0) => { const L = []; for (let i = 0; i < n; i++) L.push({ x: (x0 || S.W + 40) + i * 210, y: 0, side: i % 2 ? -1 : 1 }); A.many('gnezdo', L); };
S.defLevel(6, {
  name: 'Крепостта на ордата', bg: 'heart', music: 'heart', boss: 'boss6', sspd: 2.0, crv: 3, dust: [1.6, 0.5, 0.6], glitch: true,
  brief: 'Стигнахме до крепостта на ордата — оттук тя гаси звездите. Стените вътре се движат, а пазачите, които вече победи, са построени наново. В центъра е Ядрото. Унищожи го и звездите ще светнат отново.',
  clearText: 'Ордата е победена',
  script: W => [
    [1.0, A => { A.banner('Крепостта на ордата', 'не докосвай стените'); A.walls(0.9); }],
    [2.5, A => nests(A, 4)],
    [3.0, A => A.line('iskra', { y: 360, n: 7, amp: 80 })],
    [3.0, A => { A.banner('Мираж', 'изчезва и се появява другаде — знакът показва къде'); A.one('glitch', { y: 250 }); A.one('glitch', { y: 470, x: S.W + 120 }); }],
    [4.0, A => nests(A, 4)],
    [3.0, A => A.one('venets', { y: 360, rings: 3 })],
    ['clear'],
    [0.5, A => A.walls(0.3)],
    [2.0, A => A.warn('Стражът', 'отново е тук')],
    [3.0, A => A.miniboss('strazh')],
    ['clear'],
    ['cp'],
    [1.0, A => A.walls(1.1)],
    [2.0, A => { nests(A, 5); A.line('kometa', { y: 300, n: 3, gap: 160 }); }],
    [4.0, A => { A.one('prizrak', { y: 250 }); A.one('prizrak', { y: 470, x: S.W + 100 }); }],
    [3.0, A => { A.one('zvezda', { y: 360, tx: 1040 }); nests(A, 3); }],
    [4.0, A => { A.one('glitch', { y: 200 }); A.one('glitch', { y: 520 }); A.one('shtit', { y: 360, tx: 1080 }); }],
    [3.0, A => A.one('nosach', { y: 360, spd: 2.2 })],
    ['clear'],
    [0.5, A => A.walls(0.3)],
    [2.0, A => A.warn('Призмата', 'отново е тук')],
    [3.0, A => A.miniboss('prizma')],
    ['clear'],
    ['cp'],
    [1.0, A => A.walls(1.0)],
    [2.0, A => { nests(A, 6); A.line('iskra', { y: 360, n: 8, amp: 90, gap: 40 }); }],
    [4.0, A => { A.one('venets', { y: 260, tx: 1000, rings: 3 }); A.one('glitch', { y: 480 }); A.line('vihar', { y: 500, n: 2, gap: 140, rad: 50 }); }],
    [4.0, A => { A.line('kometa', { y: 240, n: 3, gap: 150 }); A.line('kometa', { y: 480, n: 3, gap: 150, x: S.W + 250 }); nests(A, 4); }],
    ['clear'],
    [0.5, A => A.walls(0)],
    [2.0, A => A.warn('Ядрото на ордата', 'е пред теб')],
    [3.5, A => A.boss('disonans')],
  ],
});
})();
