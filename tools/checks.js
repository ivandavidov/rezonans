/* Проверки на „Резонанс“ — предпазна мрежа при промени по двигателя, генератора и частите.
   Вървят върху самата сборка (window.__rz); куката на валидатора (window.__svdbg) е винаги в генераторите.

   В браузъра (еталонът за Chrome):
     1. сървър от корена на проекта (python3 -m http.server 8766, или „repo“ от .claude/launch.json) → /docs/index.html
        (за проба с всички части: python3 src/build.py r1 r2 r3 r4 r5 r6 r7 --out docs/_proba.html → /docs/_proba.html)
     2. в конзолата:  await import('/tools/checks.js')
                      rzChecks.run('baseline', {game:'r2'})     // връща веднага; резултатът — в rzChecks.result
   Без браузър (Node, само за разработка):  node tools/run.js docs/index.html baseline '{"game":"r1"}'  · виж tools/run.js
   Пробните файлове в docs/ не се commit-ват.

   Проверки (оцеляването: 20 семена × сектори 1–40, трудност лесно и трудно):
     baseline  — отпечатък на генерирането: семе → тема, ширина, брой врагове/предмети; отделно хеш на терена (картите)
                 и на населението (spawns). Не зависят от JS двигателя (разбъркването е Fisher–Yates с r()) — Node дава същото.
     placement — врагове/предмети в стена или врата; на дъното на яма до киселина (очаквано: 0 / 0)
     reach     — недостижими платформи и предмети по валидатора на генератора (0 / 0). Арените, копирани от кампанията
                 (продълженията), нямат данни от валидатора и се прескачат; предметите под вода — също (стигат се с плуване).
     acidSim   — героят минава през 40 сектора с киселина (r1), враговете се движат; живи врагове в киселина (0)
     smoke     — за всяка част: меню, интро, тренировка, всеки епизод (+ старт на боса), сектори 1 и 5 — с програмиран вход и
                 семенен Math.random. Хваща грешки и дава отпечатък на сценарий („златен образец“): при чисто преструктуриране
                 трябва да остане същият. Записите в localStorage се възстановяват след проверката. Може да се пуска многократно
                 и след игра (нивото е екземпляр); музиката спира за времето на проверката.
     pixels    — само в браузъра: отпечатък на картината за всяка част — менюто, трудността, менюто на епизодите по глави,
                 началото/играта/края на първия и последния епизод от всяка глава, бос, финал, тренировка, интро, оцеляване,
                 пауза, „загина“, пререндерираните нива и сектори 1–8. {ref:'save'} пази еталон в sessionStorage, {ref:'compare'}
                 дава разлики с него. Пробите — от tools/ab.py --pixels (канвите с willReadFrequently: иначе Chrome ги прехвърля
                 на процесора посред проверката и преливките се закръглят с ±1–3). Също на току-що заредена страница. */
const T = 16, z = () => window.__rz;
const tile = (x, y) => { const r = z().map[y]; return r ? r[x] : '#'; };
const pause = () => new Promise(r => { if (typeof MessageChannel !== 'function') return setTimeout(r, 0);   // в скрит раздел setTimeout се буди веднъж в минута, съобщенията — не
  const c = new MessageChannel(); c.port1.onmessage = () => r(); c.port2.postMessage(0); });
const hstr = t => { let h = 0; for (const c of t) h = (h * 31 + c.charCodeAt(0)) | 0; return (h >>> 0).toString(36); };
const hnum = t => { let h = 0; for (const c of t) h = (h * 31 + c.charCodeAt(0)) | 0; return h >>> 0; };
function mkRng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
let probe = null; window.__svdbg = (g, V, cols) => { probe = { g: g.map(r => r.slice()), V, cols }; };
const inAcid = e => { for (let y = Math.floor(e.y / T); y <= Math.floor((e.y + e.h - 1) / T); y++) for (let x = Math.floor(e.x / T); x <= Math.floor((e.x + e.w - 1) / T); x++) if (tile(x, y) === '~') return true; return false; };
const pitFloor = (x, feet) => [x - 1, x + 1].some(xx => tile(xx, feet - 1) === '~' || tile(xx, feet - 2) === '~');
// записите на играча: проверките, които пипат localStorage, ги възстановяват
const lsSnap = () => { const o = {}; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } } catch (e) {} return o; };
const lsRestore = o => { try { const now = []; for (let i = 0; i < localStorage.length; i++) now.push(localStorage.key(i)); for (const k of now) if (!(k in o)) localStorage.removeItem(k); for (const k in o) localStorage.setItem(k, o[k]); } catch (e) {} };

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

const SM_KEYS = ['left', 'right', 'up', 'down', 'fire', 'jump', 'crouch', 'swap', 'era', 'enter', 'esc', 'pause'];
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
    const r = { сектори: 0, платформи: 0, 'недостижими платформи': 0, предмети: 0, 'предмети на недостижимо място': 0, 'предмети под вода': 0, 'арени от кампанията': 0, примери: [] };
    for await (const { s, k, di, probe: P } of sectors(o)) {
      if (!P) { r['арени от кампанията']++; continue; }
      const { g, V, cols } = P; r.сектори++;
      for (let y = 1; y < 17; y++) { let x = 0; while (x < cols) { if (g[y][x] !== '-') { x++; continue; } const a = x; while (x < cols && g[y][x] === '-') x++;
        r.платформи++; let ok = false, cand = false; for (let xx = a; xx < x; xx++) { const id = y * cols + xx; if (V.kind[id]) cand = true; if (V.R[id]) ok = true; }
        if (cand && !ok) { r['недостижими платформи']++; if (r.примери.length < 10) r.примери.push({ s, k, di, ред: y, от: a, до: x - 1 }); } } }
      for (const p of z().pickups) { const tx = Math.floor((p.x + 6) / T), f = Math.floor((p.y + 10) / T);
        if (tile(tx, f - 1) === 'w') { r['предмети под вода']++; continue; }
        r.предмети++;
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
    const out = [], ter = [], pop = [];
    for await (const { s, k, di, L } of sectors(o)) { out.push([s, k, di, L.themeName, L.cols, z().enemies.length, z().pickups.length].join(','));
      ter.push(hstr(z().map.map(r => r.join('')).join('|'))); pop.push(hstr(L.spawns.map(q => q.join(':')).join(';'))); }
    let h = 0; for (const c of out.join('\n')) h = (h * 31 + c.charCodeAt(0)) | 0;
    return { сектори: out.length, отпечатък: (h >>> 0).toString(16), терен: hstr(ter.join(',')), население: hstr(pop.join(',')), първите: out.slice(0, 5) };
  },
  async smoke({ games = null, frames = 900, boss = 300, intro = 480, training = 900, surv = 600, sectors = [0, 4], seed = 1 } = {}) {
    const Z = z(), res = { части: {}, грешки: [] }, saved = lsSnap(), raf = window.requestAnimationFrame, rnd0 = Math.random, di0 = Z.DI;
    let t = -1048576, ty = performance.now(), samples = [];   // синтетичен часовник: точни стъпки по 1/64 s — dt не зависи от предишните сценарии
    window.requestAnimationFrame = () => 0;           // истинският цикъл спира; кадрите се движат от проверката
    const mus0 = Z.musOn; if (mus0) Z.toggleMus();  // музиката тегли Math.random по истинско време (setInterval) — спира за проверката
    await new Promise(r => setTimeout(r, 100));       // висящ кадър на истинския цикъл (в браузъра) минава преди сценариите
    const snap = () => { const p = Z.player, b = Z.boss, E = Z.enemies || [];
      return [Z.state, Z.LI, p ? Math.round(p.x) : -1, p ? Math.round(p.y) : -1, p ? Math.round(p.hp) : -1, p ? Math.round(p.armor || 0) : -1, p ? p.cur : '',
        E.length, E.filter(e => !e.dead).length, (Z.pickups || []).filter(k => k.taken).length, b ? Math.round(b.hp) : -1, Math.round(Z.cam)].join(','); };
    const feed = (mode, i) => { const on = new Set();
      if (mode !== 'none') { on.add(i % 300 >= 200 && i % 300 < 230 ? 'left' : 'right'); if (i % 40 < 6) on.add('jump');
        if (mode === 'play') { if (i % 24 < 12) on.add('fire'); if (i % 90 < 10) on.add('up'); if (i % 150 >= 75 && i % 150 < 78) on.add('era'); } }
      for (const k of SM_KEYS) { const v = on.has(k); if (v && !Z.keys[k]) Z.pressed[k] = true; Z.keys[k] = v; } };
    const run = async (n, mode) => { for (let i = 0; i < n; i++) { feed(mode, i); t += 1000 / 64; Z.frame(t); if (i % 30 === 29) samples.push(snap());
      if (Z.state === 'paused') throw new Error('прекъсната: играта мина на пауза — панелът е загубил фокус или е скрит');   // входът не натиска P/Esc
      if (performance.now() - ty > 150) { await pause(); ty = performance.now(); } } };
    const scen = async (g, name, fn) => { Math.random = mkRng(hnum(g + ':' + name) ^ seed); samples = []; let err = null; Z.resetClock(); t -= 1e5;   // всеки сценарий: първият кадър с dt=0 — от един и същ часовник
      try { await fn(); } catch (e) { err = e && e.stack ? e.stack.split('\n').slice(0, 2).join(' | ') : String(e); res.грешки.push({ част: g, сценарий: name, грешка: err }); }
      for (const k of SM_KEYS) { Z.keys[k] = false; Z.pressed[k] = false; }
      try { Z.toMenu(2); } catch (e) {}
      return name + '=' + (err ? 'ГРЕШКА' : hstr(samples.join(';'))); };
    const boss_ = async () => { if (Z.LVL && Z.LVL.arena && !Z.boss && Z.state === 'play') { Z.startBoss(); await run(boss, 'play'); } };
    try {
      for (const g of games || Z.GAMES.map(q => q.id)) {
        const out = []; Z.setDiff(1); Z.enterGame(g, 2);
        out.push(await scen(g, 'меню', () => run(60, 'none')));
        out.push(await scen(g, 'интро', async () => { Z.GAME.intro(true); await run(intro, 'walk'); }));
        out.push(await scen(g, 'тренировка', async () => { Z.GAME.training(true); await run(training, 'play'); }));
        for (let i = 0; i < Z.levels.length; i++) out.push(await scen(g, 'епизод ' + (i + 1), async () => { Z.startEpisode(i, false); await run(frames, 'play'); await boss_(); }));
        for (const k of sectors) out.push(await scen(g, 'сектор ' + (k + 1), async () => {
          Z.startSurv(k, { k, seed: 17919, score: 0, w: ['wrench', 'pistol'], a: { pistol: [17, 51] }, ar: 0, hp: 100, cur: 'pistol' }); await run(surv, 'play'); await boss_(); }));
        res.части[g] = { сценарии: out.length, грешки: res.грешки.filter(q => q.част === g).length, отпечатък: hstr(out.join('\n')), подробно: out };
      }
    } finally {
      if (mus0 && !Z.musOn) Z.toggleMus();
      Math.random = rnd0; lsRestore(saved); window.requestAnimationFrame = raf;
      try { Z.setDiff(di0); Z.toMenu(2); } catch (e) {}
      if (raf) raf(tt => Z.frame(tt));               // пуска отново истинския цикъл
    }
    return res;
  },
  async pixels({ games = null, levels = true, sectors = 8, keep = [], ref = null } = {}) {   // ref: 'save' — еталон в sessionStorage, 'compare' — разлики с него; keep: кадри → window.rzKeep   // само в браузъра: отпечатък на картината (менюта, екрани, HUD, пререндерирани нива)
    const Z = z(), cv = document.getElementById('game'), cx2 = cv && cv.getContext && cv.getContext('2d');
    if (!cx2 || typeof cx2.getImageData !== 'function' || !(cx2.getImageData(0, 0, 1, 1).data instanceof Uint8ClampedArray)) throw new Error('pixels работи само в браузъра');
    const res = { части: {} }, saved = lsSnap(), raf = window.requestAnimationFrame, rnd0 = Math.random, di0 = Z.DI;
    // без willReadFrequently Chrome прехвърля канвите на процесора посред проверката и преливките се закръглят с ±1–3 → пробата от tools/ab.py --pixels
    if (!(cx2.getContextAttributes && cx2.getContextAttributes().willReadFrequently)) res.предупреждение = 'канвата е без willReadFrequently — пусни пробата от tools/ab.py --pixels';
    let t = -1048576;
    window.requestAnimationFrame = () => 0; await new Promise(r => setTimeout(r, 100));
    if (document.fonts) { await Promise.all([...document.fonts].map(f => f.load().catch(() => {}))); await document.fonts.ready; }   // всички шрифтове — иначе първите кадри са с резервен
    const hcv = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 0;
      for (let i = 0; i < d.length; i += 4) h = (Math.imul(h, 31) + (d[i] | d[i + 1] << 8 | d[i + 2] << 16)) | 0; return (h >>> 0).toString(36); };
    const step = (n, k) => { for (let i = 0; i < n; i++) { if (k && i === 0) { Z.pressed[k] = true; Z.keys[k] = true; } t += 1000 / 64; Z.frame(t); if (k && i === 0) Z.keys[k] = false; } };
    // всеки кадър — от един и същ часовник и семе; картината се взима с titleT=0 (blink() е „включено“)
    const shot = (g, name, fn, lv) => { Math.random = mkRng(hnum(g + ':' + name)); Z.resetClock(); t -= 1e5; let r;
      try { fn(); Z.resetClock(); if (!lv) Z.render(); r = hcv(lv ? Z.LV : cv); if (keep.includes(name)) (window.rzKeep = window.rzKeep || {})[g + ':' + name] = (lv ? Z.LV : cv).toDataURL(); } catch (e) { r = 'ГРЕШКА ' + String(e).slice(0, 90); }
      for (const k of SM_KEYS) { Z.keys[k] = false; Z.pressed[k] = false; } return name + '=' + r; };
    const play = i => { Z.startEpisode(i, false); step(1, 'fire'); step(1, 'fire'); };   // началният екран: първото Z показва целия текст, второто — започва
    try {
      for (const g of games || Z.GAMES.map(q => q.id)) {
        Z.setDiff(1); Z.enterGame(g, 2);
        const out = [], N = Z.levels.length, G = Z.GAME;
        const chs = G.chapters ? G.chapters.map(c => [c.a, c.b]) : Array.from({ length: Math.ceil(N / 5) }, (_, i) => [i * 5, Math.min(N - 1, i * 5 + 4)]);
        out.push(shot(g, 'меню', () => Z.enterGame(g, 2)));
        out.push(shot(g, 'трудност', () => { Z.enterGame(g, 2); step(1, 'fire'); }));
        out.push(shot(g, 'трудност · оцеляване', () => { Z.enterGame(g, 3); step(1, 'fire'); }));
        for (let c = 0; c < chs.length; c++) out.push(shot(g, 'епизоди · глава ' + (c + 1), () => {   // през входа: ← до първата глава, после → по една
          Z.enterGame(g, 2); step(1, 'fire'); step(1, 'fire'); for (let k = 0; k < chs.length; k++) step(1, 'left'); for (let k = 0; k < c; k++) step(1, 'right'); }));
        const eps = [...new Set(chs.flat())];
        for (const i of eps) {
          out.push(shot(g, 'начало · епизод ' + (i + 1), () => { Z.startEpisode(i, false); step(1, 'fire'); }));
          out.push(shot(g, 'игра · епизод ' + (i + 1), () => play(i)));
          out.push(shot(g, 'край · епизод ' + (i + 1), () => { play(i); Z.completeLevel(); step(1, 'fire'); step(80); }));
        }
        for (const [, b] of chs) out.push(shot(g, 'бос · епизод ' + (b + 1), () => { play(b);
          if (Z.LVL.arena) { Z.startBoss(); for (let k = 0; k < 600 && Z.boss && Z.boss.state === 'intro'; k++) step(1); } }));
        for (const [, b] of chs) out.push(shot(g, 'финал · епизод ' + (b + 1), () => { play(b); Z.state = 'win'; step(150); }));
        out.push(shot(g, 'тренировка', () => { Z.GAME.training(true); step(1, 'fire'); step(1, 'fire'); step(30); }));
        out.push(shot(g, 'интро', () => { Z.GAME.intro(true); step(120); }));
        const sv = { k: 0, seed: 17919, score: 0, w: ['wrench', 'pistol'], a: { pistol: [17, 51] }, ar: 0, hp: 100, cur: 'pistol' };
        out.push(shot(g, 'оцеляване', () => { Z.startSurv(0, sv); if (Z.state === 'story') { step(1, 'fire'); step(1, 'fire'); } step(10); }));
        out.push(shot(g, 'оцеляване · край на сектор', () => { Z.startSurv(0, sv); if (Z.state === 'story') { step(1, 'fire'); step(1, 'fire'); } Z.completeLevel(); step(80); }));
        out.push(shot(g, 'пауза', () => { play(0); Z.state = 'paused'; }));
        out.push(shot(g, 'загина', () => { play(0); Z.state = 'dead'; step(100); }));
        if (levels) {
          for (let i = 0; i < N; i++) out.push(shot(g, 'ниво ' + (i + 1), () => Z.loadLevel(i), true));
          for (let k = 0; k < sectors; k++) out.push(shot(g, 'сектор ' + (k + 1), () => { Z.survSeed = 17919; Z.loadLevel(-1, Z.genLevel(k)); }, true));
        }
        res.части[g] = { кадри: out.length, грешки: out.filter(s => s.includes('=ГРЕШКА')).length, отпечатък: hstr(out.join('\n')), подробно: out };
        await pause();
      }
      if (ref === 'save') sessionStorage.setItem('rzPixels', JSON.stringify(Object.fromEntries(Object.entries(res.части).map(([g, v]) => [g, v.подробно]))));
      if (ref === 'compare') { const E = JSON.parse(sessionStorage.getItem('rzPixels') || '{}');
        res.разлики = Object.fromEntries(Object.entries(res.части).map(([g, v]) => { const m = new Map((E[g] || []).map(s => s.split('=')));
          return [g, v.подробно.filter(s => m.get(s.split('=')[0]) !== s.split('=')[1]).map(s => s.split('=')[0] + ': ' + (m.get(s.split('=')[0]) || '—') + ' → ' + s.split('=')[1])]; })); }
    } finally {
      Math.random = rnd0; lsRestore(saved); window.requestAnimationFrame = raf;
      try { Z.setDiff(di0); Z.toMenu(2); } catch (e) {}
      if (raf) raf(tt => Z.frame(tt));
    }
    return res;
  },
};

window.rzChecks = {
  result: null,
  run(name, opts) {
    if (!C[name]) return 'няма такава проверка: ' + Object.keys(C).join(', ');
    this.result = { running: name }; const t0 = performance.now();
    C[name](opts).then(r => { this.result = { ...r, секунди: Math.round((performance.now() - t0) / 1000) }; })
      .catch(e => { this.result = { error: String(e && e.stack || e) }; });
    return 'стартирано: ' + name + ' — резултатът ще е в rzChecks.result';
  },
};
