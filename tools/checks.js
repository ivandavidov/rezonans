/* Проверки на „Резонанс“ в браузъра — масови сканирания на „Оцеляване“ (r1) и симулация на игра.
   Предпазна мрежа при промени по двигателя/генератора: числата трябва да останат същите (или по-добри).

   1. python3 src/build.py r1 --probe --out docs/_proba.html      (--probe: валидаторът се вижда за `reach`)
      cp tools/checks.js docs/_checks.js
   2. локален сървър (python3 -m http.server 8765 -d docs, или „docs“ от .claude/launch.json) → /_proba.html
   3. в конзолата:  await import('./_checks.js')
                     rzChecks.run('placement', {seeds:20})      // връща веднага; резултатът — в rzChecks.result
   4. накрая изтрий docs/_proba.html и docs/_checks.js (не се commit-ват)

   Проверки (по подразбиране: 20 семена × сектори 1–40, трудност лесно и трудно):
     placement — врагове/предмети в стена или врата; на дъното на яма до киселина (очаквано: 0 / 0)
     reach     — недостижими платформи и предмети на недостижимо място по валидатора на генератора (иска --probe; 0 / 0)
     acidSim   — героят минава през 40 сектора с киселина, враговете се движат; живи врагове в киселина (0)
     baseline  — отпечатък на генерирането: семе → тема, ширина, брой врагове/предмети (за сравнение преди/след)
   Инструментът ползва window.__rz (genLevel, loadLevel, update, map, enemies, pickups, solidAt, groundY …). */
const T = 16, z = () => window.__rz;
const tile = (x, y) => { const r = z().map[y]; return r ? r[x] : '#'; };
const pause = () => new Promise(r => setTimeout(r, 0));
let probe = null; window.__svdbg = (g, V, cols) => { probe = { g: g.map(r => r.slice()), V, cols }; };
const inAcid = e => { for (let y = Math.floor(e.y / T); y <= Math.floor((e.y + e.h - 1) / T); y++) for (let x = Math.floor(e.x / T); x <= Math.floor((e.x + e.w - 1) / T); x++) if (tile(x, y) === '~') return true; return false; };
const pitFloor = (x, feet) => [x - 1, x + 1].some(xx => tile(xx, feet - 1) === '~' || tile(xx, feet - 2) === '~');

async function* sectors({ game = 'r1', seeds = 20, from = 1, ks = 40, dis = [0, 2] } = {}) {
  z().enterGame(game, 2); let n = 0;
  for (const di of dis) { z().setDiff(di);
    for (let s = from; s < from + seeds; s++) for (let k = 0; k < ks; k++) {
      z().survSeed = 10000 + s * 7919; probe = null; const L = z().genLevel(k); const fallback = z().genLevel.att === 99;
      z().loadLevel(-1, L); yield { s, k, di, L, fallback, probe };
      if (++n % 20 === 0) await pause();
    } }
  z().toMenu(2);
}

const C = {
  async placement(o) {
    const r = { сектори: 0, 'резервен генератор': 0, врагове: 0, предмети: 0, 'в стена/врата': 0, 'на дъното на яма с киселина': 0, примери: [] };
    for await (const { s, k, di, fallback } of sectors(o)) { r.сектори++; if (fallback) r['резервен генератор']++;
      const bad = (what, kind) => { r[what]++; if (r.примери.length < 10) r.примери.push({ s, k, di, kind }); };
      for (const e of z().enemies) { if (e.type === 'flyer') continue; r.врагове++;
        if (e.type !== 'turret' && e.type !== 'nest' && z().solidAt(e.x + e.w / 2, e.y + e.h / 2)) bad('в стена/врата', e.type);
        if (pitFloor(Math.floor((e.x + e.w / 2) / T), Math.round((e.y + e.h) / T))) bad('на дъното на яма с киселина', e.type); }
      for (const p of z().pickups) { r.предмети++;
        if (z().solidAt(p.x + 6, p.y + 5)) bad('в стена/врата', p.type);
        if (pitFloor(Math.floor((p.x + 6) / T), Math.round((p.y + 10) / T))) bad('на дъното на яма с киселина', p.type); } }
    return r;
  },
  async reach(o) {
    const r = { сектори: 0, платформи: 0, 'недостижими платформи': 0, предмети: 0, 'предмети на недостижимо място': 0, примери: [] };
    for await (const { s, k, di, probe: P } of sectors(o)) {
      if (!P) throw new Error('няма данни от валидатора — сглоби пробата с --probe');
      const { g, V, cols } = P; r.сектори++;
      for (let y = 1; y < 17; y++) { let x = 0; while (x < cols) { if (g[y][x] !== '-') { x++; continue; } const a = x; while (x < cols && g[y][x] === '-') x++;
        r.платформи++; let ok = false, cand = false; for (let xx = a; xx < x; xx++) { const id = y * cols + xx; if (V.kind[id]) cand = true; if (V.R[id]) ok = true; }
        if (cand && !ok) { r['недостижими платформи']++; if (r.примери.length < 10) r.примери.push({ s, k, di, ред: y, от: a, до: x - 1 }); } } }
      for (const p of z().pickups) { r.предмети++; const tx = Math.floor((p.x + 6) / T), f = Math.floor((p.y + 10) / T);
        if (!V.R[f * cols + tx]) { r['предмети на недостижимо място']++; if (r.примери.length < 10) r.примери.push({ s, k, di, предмет: p.type, tx, ред: f }); } } }
    return r;
  },
  async acidSim({ levels = 40, di = 1 } = {}) {
    const r = { сектори: 0, 'живи врагове в киселина': 0, 'загинали в киселина': 0, примери: [] };
    z().enterGame('r1', 2); z().setDiff(di);
    for (let s = 1; s <= 60 && r.сектори < levels; s++) for (let k = 2; k < 30 && r.сектори < levels; k++) {
      z().survSeed = 10000 + s * 7919; const L = z().genLevel(k); if (L.isBoss) continue; z().loadLevel(-1, L);
      const cols = z().map[0].length; let acid = false; for (let x = 0; x < cols; x++) if (tile(x, 14) === '~') { acid = true; break; } if (!acid) continue;
      r.сектори++; z().state = 'play'; const seen = new Set();
      for (let step = 0; step < cols * 2; step++) {          // героят (безсмъртен) върви по 8 px на 3 кадъра
        const p = z().player; p.hp = 999; p.dead = false; p.x = Math.min((cols - 3) * T, step * 8); p.y = z().groundY(Math.floor((p.x + 5) / T)) - p.h;
        for (let i = 0; i < 3; i++) z().update(1 / 60);
        if (step % 20 === 0) for (const e of z().enemies) { if (e.type === 'crab' || e.type === 'flyer' || seen.has(e) || !inAcid(e)) continue;
          seen.add(e); const key = e.dead ? 'загинали в киселина' : 'живи врагове в киселина'; r[key]++; if (r.примери.length < 10) r.примери.push({ s, k, type: e.type, dead: e.dead }); } }
      await pause(); }
    z().toMenu(2); return r;
  },
  async baseline(o) {
    const out = [];
    for await (const { s, k, di, L } of sectors(o)) out.push([s, k, di, L.themeName, L.cols, z().enemies.length, z().pickups.length].join(','));
    let h = 0; for (const c of out.join('\n')) h = (h * 31 + c.charCodeAt(0)) | 0;
    return { сектори: out.length, отпечатък: (h >>> 0).toString(16), първите: out.slice(0, 5) };
  },
};

window.rzChecks = {
  result: null,
  run(name, opts) {
    if (!C[name]) return 'няма такава проверка: ' + Object.keys(C).join(', ');
    this.result = { running: name }; const t0 = performance.now();
    C[name](opts).then(r => { this.result = { ...r, секунди: Math.round((performance.now() - t0) / 1000) }; })
      .catch(e => { this.result = { error: String(e) }; });
    return 'стартирано: ' + name + ' — резултатът ще е в rzChecks.result';
  },
};
