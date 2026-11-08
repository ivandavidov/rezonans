// Ниво 5 — Пулсарът. Лъч мете екрана на равни интервали (в такт с музиката); на сигурно си само в сянката на скала.
(function () {
'use strict';
const S = (typeof window !== 'undefined' ? window : globalThis).SPACE;
const H = S.H;
// скали: по една-две в редица, на различна височина — винаги има къде да се скриеш
const rocks = (A, W, n, x0) => { const L = []; for (let i = 0; i < n; i++) L.push({ x: (x0 || S.W + 80) + i * 330, y: W.r.range(110, H - 110) }); A.many('skala', L); };
S.defLevel(5, {
  name: 'Пулсарът', bg: 'pulsar', music: 'pulsar', boss: 'boss5', sspd: 1.5, crv: 2, dust: [1.3, 1.5, 2.0],
  brief: 'Пред нас е пулсар — мъртва звезда, която мига равномерно като фар. На всеки няколко секунди лъчът ѝ залива всичко наоколо. Когато засвети, скрий се зад скала: сянката ѝ те пази. Ордата е построила тук машина, която бие в същия ритъм.',
  clearText: 'Пулсарът остана зад нас',
  script: W => [
    [1.0, (A, W) => { A.banner('Пулсар', 'когато засвети, скрий се зад скала'); rocks(A, W, 3, S.W - 200); }],
    [2.0, A => A.pulsar(240)],
    [2.0, A => A.line('iskra', { y: 220, n: 6, amp: 70 })],
    [3.0, (A, W) => { rocks(A, W, 2); A.one('zvezda', { y: 500, tx: 1060 }); }],
    [4.0, A => A.line('kometa', { y: 160, n: 3, gap: 160 })],
    [3.0, (A, W) => { rocks(A, W, 2); A.line('iskra', { y: 520, n: 6, amp: 60 }); }],
    ['clear'],
    [1.0, (A, W) => { A.banner('Комета', 'оставя след себе си бавни изстрели'); rocks(A, W, 2); A.line('kometa', { y: 560, n: 4, gap: 140, vy: -0.3 }); }],
    [4.0, (A, W) => { rocks(A, W, 2); A.one('lachemet', { y: 200, tx: 1080 }); A.one('lachemet', { y: 500, tx: 1100 }); }],
    [4.0, A => { A.one('delitel', { y: 300 }); A.one('delitel', { y: 450, x: S.W + 150 }); }],
    ['clear'],
    ['cp'],
    [1.0, (A, W) => { rocks(A, W, 3); A.one('zvezda', { y: 200, tx: 1000 }); A.one('zvezda', { y: 520, tx: 1100 }); }],
    [4.0, A => { A.one('burevest', { y: -30, side: 1 }); A.line('burevest', { x: S.W - 40, y: H + 30, n: 4, gap: 70, side: -1 }); }],
    [3.0, (A, W) => { rocks(A, W, 2); A.one('nosach', { y: 360 }); }],
    [4.0, A => A.line('kometa', { y: 300, n: 4, gap: 150 })],
    [3.0, (A, W) => { rocks(A, W, 2); A.one('venets', { y: 360, rings: 4 }); }],
    ['clear'],
    ['cp'],
    [1.0, (A, W) => { rocks(A, W, 3); A.line('iskra', { y: 160, n: 7, amp: 60 }); A.line('iskra', { y: 560, n: 7, amp: 60, ph: Math.PI, x: S.W + 120 }); }],
    [4.0, (A, W) => { rocks(A, W, 2); A.one('zvezda', { y: 360, tx: 1050 }); A.one('lachemet', { y: 160, tx: 1100 }); A.one('lachemet', { y: 560, tx: 1100 }); }],
    [4.0, (A, W) => { rocks(A, W, 2); A.line('kometa', { y: 200, n: 3, gap: 150, vy: 0.3 }); A.line('kometa', { y: 520, n: 3, gap: 150, vy: -0.3, x: S.W + 300 }); }],
    [4.0, (A, W) => { rocks(A, W, 2); A.one('delitel', { y: 360 }); A.one('shtit', { y: 200, tx: 1080 }); }],
    ['clear'],
    [0.5, A => A.pulsar(0)],
    [1.5, A => A.warn('Метрономът', 'отмерва ритъма')],
    [3.5, A => A.boss('metronom')],
  ],
});
})();
