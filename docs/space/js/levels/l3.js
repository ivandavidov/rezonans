// Ниво 3 — Буреносният гигант. В атмосферата на газов гигант: мълнии с предупреждение, ветрове бутат кораба.
(function () {
'use strict';
const S = (typeof window !== 'undefined' ? window : globalThis).SPACE, M = S.M;
const H = S.H;
const birds = (A, side, n, x0) => { const L = []; for (let i = 0; i < n; i++) L.push({ x: (x0 || S.W - 40) + i * 70, y: side > 0 ? -30 : H + 30, side, spd: 6 + i * 0.15 }); A.many('burevest', L); };

S.defLevel(3, {
  name: 'Буреносният гигант', bg: 'storm', music: 'storm', boss: 'boss3', sspd: 2.4, crv: 2, dust: [1.4, 1.0, 0.7],
  brief: 'Ордата се крие в бурите на един газов гигант. Влизаме в атмосферата му: мълниите удрят непрекъснато, а вятърът блъска кораба. Щом видиш светла линия отгоре, махни се — там ще удари мълния. Някъде в облаците се движи нещо огромно.',
  clearText: 'Бурята утихна',
  // буря: мълния близо до кораба на всеки `every` такта
  tick(W) {
    if (!W.storm || W.boss || !W.p.alive || W.end) return;
    if (++W.storm.n % W.storm.every === 0) S.bolt(W, M.clamp(W.p.x + W.r.range(-90, 180), 60, S.W - 60), Math.round(72 / Math.sqrt(W.diff.rate)));
  },
  script: W => [
    [1.5, A => A.banner('Мълнии', 'светлата линия показва къде ще удари')],
    [1.0, A => A.storm(300)],
    [1.5, A => birds(A, 1, 5)],
    [3.0, A => A.line('iskra', { y: 300, n: 6, amp: 90 })],
    [2.5, A => A.line('vihar', { y: 470, n: 3, gap: 120, rad: 60 })],
    [3.0, A => birds(A, -1, 5)],
    ['clear'],
    [0.8, A => { A.banner('Насрещен вятър', 'бута кораба назад'); A.wind(-1.3, 0); }],
    [2.0, A => A.line('iskra', { y: 220, n: 7, amp: 50 })],
    [2.5, A => { A.one('delitel', { y: 240 }); A.one('delitel', { y: 480, x: S.W + 150 }); }],
    [3.0, A => { A.banner('Антена', 'насочва мълнии към теб'); A.one('gromo', { y: 90, tx: 1060 }); }],
    [4.0, A => birds(A, 1, 5)],
    ['clear'],
    [0.5, A => A.wind(0, 0)],
    ['cp'],
    [1.0, A => { A.banner('Низходящ вятър', 'тегли кораба надолу'); A.wind(0, 0.9); }],
    [1.5, A => A.line('vihar', { y: 200, n: 3, gap: 120, rad: 70 })],
    [2.5, A => { A.one('shtit', { y: 300, tx: 1040 }); A.one('shtit', { y: 520, tx: 1100 }); }],
    [3.0, A => birds(A, 1, 6)],
    [2.5, A => { A.one('kopie', { y: 180, tx: 1080 }); A.one('kopie', { y: 360, tx: 1040 }); A.one('kopie', { y: 540, tx: 1080 }); }],
    ['clear'],
    [0.5, A => A.wind(0, 0)],
    [1.0, A => { A.one('gromo', { y: 90, tx: 1000 }); A.one('gromo', { y: H - 90, tx: 1100 }); }],
    [2.5, A => A.one('nosach', { y: 360, spd: 2.2 })],
    [3.0, A => A.line('iskra', { y: 200, n: 7, amp: 70 })],
    [1.0, A => A.line('iskra', { y: 520, n: 7, amp: 70, ph: Math.PI })],
    ['clear'],
    ['cp'],
    [1.0, A => { A.storm(210); A.wind(-0.8, -0.5); A.banner('Сърцето на бурята', 'мълниите зачестяват'); }],
    [1.5, A => { A.one('venets', { y: 360, rings: 4 }); A.line('vihar', { y: 150, n: 2, gap: 140, rad: 60 }); }],
    [3.0, A => { birds(A, 1, 4); birds(A, -1, 4, S.W + 120); }],
    [3.0, A => { A.one('delitel', { y: 200 }); A.one('delitel', { y: 520, x: S.W + 120 }); A.one('gromo', { y: H - 90, tx: 1080 }); }],
    [3.5, A => { A.one('shtit', { y: 360, tx: 1000 }); A.one('lachemet', { y: 160, tx: 1100 }); A.one('lachemet', { y: 560, tx: 1100 }); }],
    [3.0, A => A.v('iskra', { y: 360, n: 7, path: 'dive', spd: 4.6 })],
    ['clear'],
    [0.5, A => { A.wind(0, 0); A.storm(0); }],
    [1.5, A => A.warn('Змеят', 'изплува от облаците')],
    [3.5, A => A.boss('leviatan')],
  ],
});
})();
