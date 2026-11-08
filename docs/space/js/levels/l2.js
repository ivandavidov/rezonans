// Ниво 2 — Кристалното поле. Кристалите разделят изстрелите на два, но при счупване се пръскат на парчета.
(function () {
'use strict';
const S = (typeof window !== 'undefined' ? window : globalThis).SPACE;
const H = S.H;

function crystals(A, W, n) {
  const L = [];
  for (let i = 0; i < n; i++) L.push({ x: S.W + 60 + i * W.r.range(90, 180), y: W.r.range(70, H - 70) });
  A.many('kristal', L);
}

S.defLevel(2, {
  name: 'Кристалното поле', bg: 'crystal', music: 'crystal', boss: 'boss2', sspd: 1.6, crv: 1, dust: [1.1, 0.75, 1.5],
  brief: 'Където мине, ордата оставя кристали — тук те образуват цяло поле. Ако стреляш през кристал, изстрелът ти се разделя на два, но счупеният кристал се пръска на остри парчета. Някъде в полето те чака Призмата.',
  clearText: 'Полето е чисто',
  script: W => [
    [2.0, A => A.line('iskra', { y: 200, n: 6, amp: 60 })],
    [2.0, (A, W) => { A.banner('Кристали', 'разделят изстрела ти на два, но при счупване се пръскат'); crystals(A, W, 4); }],
    [3.5, A => A.line('iskra', { y: 520, n: 6, amp: 70, ph: Math.PI })],
    [2.5, A => { A.one('delitel', { y: 220 }); A.one('delitel', { y: 500, x: S.W + 140 }); }],
    [3.0, A => A.v('iskra', { y: 360, n: 5, path: 'dive' })],
    ['clear'],
    [0.8, A => { A.banner('Щитоносец', 'щитът е отпред — стреляй отстрани или отзад; Вълната минава през него'); A.one('shtit', { y: 240, tx: 1040 }); A.one('shtit', { y: 480, tx: 1100 }); }],
    [4.0, A => A.line('iskra', { y: 120, n: 5, path: 'arc', side: 1, dy: 380 })],
    [1.2, A => A.line('iskra', { y: 600, n: 5, path: 'arc', side: -1, dy: 380 })],
    ['clear'],
    [1.0, A => { A.banner('Прожектор', 'преди да стреля, показва линия — махни се от нея'); A.one('lachemet', { y: 200, tx: 1060 }); A.one('lachemet', { y: 520, tx: 1100 }); }],
    [3.0, A => A.one('nosach', { y: 360 })],
    [3.0, (A, W) => crystals(A, W, 3)],
    ['clear'],
    ['cp'],
    [1.0, A => { A.banner('Миноносец', 'пуска мини — те избухват, щом се приближиш'); A.one('minyor', { y: 200 }); }],
    [3.0, (A, W) => crystals(A, W, 5)],
    [2.5, A => { A.one('lachemet', { y: 150, tx: 1100 }); A.one('lachemet', { y: 360, tx: 1050 }); A.one('lachemet', { y: 570, tx: 1100 }); }],
    [3.0, A => { A.one('delitel', { y: 180 }); A.one('delitel', { y: 360, x: S.W + 120 }); A.one('delitel', { y: 540, x: S.W + 240 }); }],
    ['clear'],
    [1.0, (A, W) => { A.one('venets', { y: 360, rings: 4 }); crystals(A, W, 3); }],
    [3.0, A => { A.one('shtit', { y: 160, tx: 1080 }); A.one('shtit', { y: 560, tx: 1080 }); }],
    [3.0, A => A.line('iskra', { y: 360, n: 7, amp: 150, fq: 0.009 })],
    [2.5, A => A.one('nosach', { y: 220, spd: 1.9 })],
    ['clear'],
    ['cp'],
    [1.0, A => { A.one('minyor', { y: 150 }); A.one('minyor', { y: 570, spd: 1.7 }); }],
    [2.0, A => A.line('iskra', { y: 360, n: 8, amp: 60, gap: 42 })],
    [3.0, A => { A.one('lachemet', { y: 240, tx: 1080 }); A.one('lachemet', { y: 480, tx: 1080 }); A.one('shtit', { y: 360, tx: 960 }); }],
    [3.0, (A, W) => crystals(A, W, 6)],
    [3.0, A => { A.one('delitel', { y: 250 }); A.one('delitel', { y: 470, x: S.W + 100 }); A.one('kopie', { y: 160, tx: 1080 }); A.one('kopie', { y: 560, tx: 1080 }); }],
    [3.0, A => { A.one('venets', { y: 200, tx: 1000, rings: 3 }); A.one('venets', { y: 520, tx: 1080, rings: 3 }); }],
    ['clear'],
    [1.5, A => A.warn('Призмата')],
    [3.5, A => A.boss('prizma')],
  ],
});
})();
