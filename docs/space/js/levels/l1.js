// Ниво 1 — Ледените пръстени. Газов гигант с пръстени, ледени отломки; учи скалата.
(function () {
'use strict';
const S = (typeof window !== 'undefined' ? window : globalThis).SPACE;
const H = S.H;

// ледени отломки: n на брой, разпръснати по височина, на интервал
function ice(A, W, n, big) {
  const L = [];
  for (let i = 0; i < n; i++) L.push({ x: S.W + 60 + i * W.r.range(60, 150), y: W.r.range(60, H - 60), big: big !== false && W.r() < 0.7 });
  A.many('led', L);
}

S.defLevel(1, {
  name: 'Ледените пръстени', clearText: 'Орбитата е чиста', bg: 'helios', music: 'helios', boss: 'boss1', sspd: 1.5, crv: 1,
  brief: 'Непозната орда от кристални машини гаси звездите една след друга. Първата угасна тук, над газов гигант с ледени пръстени. Между отломките вече кръжат разузнавачите на ордата. Прочисти орбитата.',
  script: W => [
    // ── 1: първите вълни и първите ноти ──
    [2.5, A => A.line('iskra', { y: 210, n: 6, amp: 60 })],
    [3.2, A => A.line('iskra', { y: 510, n: 6, amp: 60, ph: Math.PI })],
    [3.0, (A, W) => ice(A, W, 4)],
    [2.0, A => A.line('iskra', { y: 360, n: 7, amp: 140, fq: 0.009 })],
    ['clear'],
    [0.8, A => A.banner('Всяка нота мести курсора по скалата', 'с X, Shift или бутона „Вземи“ вземаш маркираното')],
    [0.5, A => A.v('iskra', { y: 260, n: 5, path: 'dive', spd: 4 })],
    [2.6, A => A.v('iskra', { y: 470, n: 5, path: 'dive', spd: 4 })],
    [3.0, A => { A.one('kopie', { y: 240, tx: 1060 }); A.one('kopie', { y: 480, tx: 1100 }); }],
    [3.5, A => A.line('iskra', { y: 120, n: 5, path: 'arc', side: 1, dy: 380, spd: 4.2 })],
    [1.2, A => A.line('iskra', { y: 600, n: 5, path: 'arc', side: -1, dy: 380, spd: 4.2 })],
    ['clear'],
    [1.0, A => { A.banner('Носач', 'свали го и ще пусне кристал с оръжие'); A.one('nosach', { y: 300 }); }],
    [3.0, A => A.line('iskra', { y: 560, n: 6, amp: 50 })],
    [4.0, A => A.v('iskra', { y: 160, n: 5, path: 'dive' })],
    ['clear'],
    ['cp'],
    // ── 2: Венецът и леденото поле ──
    [1.0, (A, W) => { A.one('venets', { y: 360, rings: 4 }); ice(A, W, 3); }],
    [4.5, A => A.line('iskra', { y: 140, n: 6, amp: 40 })],
    [2.5, A => A.line('iskra', { y: 580, n: 6, amp: 40, ph: 1.5 })],
    ['clear'],
    [0.5, A => A.banner('Ледено поле', 'големите отломки се разпадат на три')],
    [1.0, (A, W) => ice(A, W, 7)],
    [2.5, A => A.line('iskra', { y: 300, n: 6, amp: 110 })],
    [2.0, (A, W) => ice(A, W, 7)],
    [2.0, A => { A.one('kopie', { y: 200, tx: 1000 }); A.one('kopie', { y: 360, tx: 1080 }); A.one('kopie', { y: 520, tx: 1000 }); }],
    [3.0, (A, W) => ice(A, W, 8)],
    [2.0, A => A.v('iskra', { y: 360, n: 7, path: 'dive', spd: 4.4 })],
    [2.5, A => A.one('nosach', { y: 470, spd: 1.9 })],
    [2.0, (A, W) => ice(A, W, 5)],
    ['clear'],
    [1.0, A => { A.one('venets', { y: 200, tx: 1000, rings: 3 }); A.one('venets', { y: 520, tx: 1080, rings: 3 }); }],
    [3.0, A => A.line('iskra', { y: 360, n: 6, amp: 160, fq: 0.008 })],
    [3.5, A => { A.one('kopie', { y: 160, tx: 1100 }); A.one('kopie', { y: 560, tx: 1100 }); }],
    ['clear'],
    ['cp'],
    // ── 3: всичко заедно, после пазачът ──
    [1.0, A => A.line('iskra', { y: 200, n: 8, amp: 70, gap: 40 })],
    [0.6, A => A.line('iskra', { y: 520, n: 8, amp: 70, gap: 40, ph: Math.PI })],
    [2.5, A => A.one('venets', { y: 360, tx: 1060, rings: 5 })],
    [2.0, A => A.v('iskra', { y: 160, n: 5, path: 'dive' })],
    [2.0, A => A.v('iskra', { y: 560, n: 5, path: 'dive' })],
    [2.5, A => { A.one('kopie', { y: 260, tx: 1000 }); A.one('kopie', { y: 460, tx: 1000 }); }],
    [2.0, A => A.one('nosach', { y: 220, spd: 2 })],
    [2.0, A => A.line('iskra', { y: 120, n: 5, path: 'arc', side: 1, dy: 420, spd: 4.4 })],
    [1.0, A => A.line('iskra', { y: 600, n: 5, path: 'arc', side: -1, dy: 420, spd: 4.4 })],
    [2.5, (A, W) => ice(A, W, 6)],
    [2.0, A => { A.one('venets', { y: 180, tx: 1080, rings: 3 }); A.one('kopie', { y: 540, tx: 1000 }); }],
    ['clear'],
    [1.5, A => A.warn('Стражът')],
    [3.5, A => A.boss('strazh')],
  ],
});
})();
