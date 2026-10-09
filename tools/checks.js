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
     back      — обратна проходимост на нивата от кампаниите: от всяко място, до което се стига, има път обратно до началото.
                 Брои препятствията — откъде се влиза в област без връщане (x,ред↓колко плочки пада). Моделът е валидаторът
                 на генератора в режим exact (скоковете точно по замерите в движка): вратите — отворени, вода и възходящи
                 течения — свободно движение, епохи и подвижни зали — два слоя. Не се броят арената на боса (от вратата ѝ
                 нататък), гонитбите (L.chase) и нивата с L.noBack. Отделно: недостижими предмети (по всички трудности;
                 очаквано 0) и висящи платформи, до които не се стига (за преглед: навесите в r2:14, постовете на пазачите в r3).
                 Секторите на оцеляването — в baseline („без връщане“).
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
/* ---------- back: обратна проходимост на нивата от кампаниите ---------- */
// Картата за модела: вратите — отворени (назад се минава, след като са отворени), скритите проходи и тоновите врати — минават
// се, честотните плочки — като '-'. Скоковете — svValidate в режим exact; вода, стълби и възходящи течения — свободно движение.
const BK_SOL = '#=BZ><^';
const bkPrep = (map, L) => map.map(r => r.map(c => c === 'h' || c === 'D' || (c === 't' && L.tone) ? '.' : c === '1' || c === '2' || c === '3' ? '-' : c));
function bkLayer(g, L, cols, rows, exitX) {
  const lifts = (L.lifts || []).map(l => ({ x0: l.x0, y0: l.y0, x1: l.x1, y1: l.y1, w: l.w || 3 }));
  const sky = g[0].filter(c => c === '.').length > cols / 2;   // отворено небе — като темите със sky в генератора
  const V = z().svValidate(g, cols, sky, (L.grav || 900) < 800, lifts, L.start, exitX, { exact: true, all: true });
  const N = cols * rows, adj = Array.from(V.adj, a => a ? a.slice() : []), free = new Uint8Array(N);
  const sol = (x, y) => x < 0 || x >= cols || y < 0 || (y < rows && BK_SOL.includes(g[y][x]));
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (g[y][x] === 'w' || g[y][x] === 'H') free[y * cols + x] = 1;   // стълбата се хваща и отстрани, и в падане
  for (const w of L.winds || []) if (w[5] < 0) for (let y = Math.max(0, w[1]); y <= Math.min(rows - 1, w[3]); y++) for (let x = Math.max(0, w[0]); x <= Math.min(cols - 1, w[2]); x++) if (!sol(x, y)) free[y * cols + x] = 1;
  if (L.zeroG || L.zgZones) for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++)   // безтегловност — също свободно движение
    if (!sol(x, y) && (L.zeroG || L.zgZones.some(([x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1))) free[y * cols + x] = 1;
  const fall = (x, y, from, drift = 0) => { for (let cx = Math.max(0, x - drift); cx <= Math.min(cols - 1, x + drift); cx++)   // падане (с отнасяне встрани до drift колони)
    for (let ry = y; ry < rows; ry++) { const c = ry * cols + cx; if (free[c] || (ry > y && V.kind[c])) { adj[from].push(c); break; } if (sol(cx, ry)) break; } };
  for (let id = 0; id < N; id++) if (free[id]) { const x = id % cols, y = (id / cols) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || nx >= cols || ny < 0 || ny >= rows || sol(nx, ny)) continue;
      if (free[ny * cols + nx]) adj[id].push(ny * cols + nx); else fall(nx, ny, id, 2); }   // излизане през всеки ръб — до първото място отдолу
    const surf = y > 0 && !free[id - cols] && !sol(x, y - 1), r = surf ? 3 : 1;   // брегът — до водата; от повърхността — скок до 3 нагоре и встрани
    for (let tx = Math.max(0, x - r); tx <= Math.min(cols - 1, x + r); tx++) for (let ty = Math.max(1, y - (surf ? 2 : 0)); ty <= Math.min(rows - 1, y + 2); ty++) {
      const s = ty * cols + tx; if (!V.kind[s]) continue; const near = Math.abs(tx - x) <= 1 && (ty - 1 === y || ty - 2 === y);
      if (near || surf) adj[id].push(s); if (near) adj[s].push(id); } }
  if (free.some(v => v)) for (let s = 0; s < N; s++) if (V.kind[s]) { const x = s % cols, y = (s / cols) | 0;   // влизане: сход в съседната колона или скок до 3 встрани и 4 нагоре
    for (const d of [-1, 1]) if (x + d >= 0 && x + d < cols && !sol(x + d, y - 1)) fall(x + d, y - 1, s);
    for (let fy = Math.max(0, y - 4); fy < y - 1; fy++) { if (sol(x, fy)) continue; for (const d of [-1, 1]) for (let fx = x + d, k = 0; k < 3 && fx >= 0 && fx < cols && !sol(fx, fy); fx += d, k++) if (free[fy * cols + fx]) adj[s].push(fy * cols + fx); } }
  return { V, adj, free };
}
// едно ниво: откъде се влиза в област без връщане до началото. Картата — пълната (L.build; касетата я пълни постепенно), с
// приложените POKE от курсорите (назад се минава, след като са изпълнени); GOTO — връзка. Слоеве с преминаване между тях: епохите,
// подвижните зали (положения a и b); обърнатият свят — само през сферите (L.flips). Честотите — един слой (виж долу).
function bkLevel(L, rows, dbg) {
  const cols = L.cols, a = L.arena, N = cols * rows;
  const lim = a ? (a.door != null ? a.door : a.x0 != null ? a.x0 : a.minX != null ? a.minX : cols) : cols, exitX = Math.min(lim, L.exit && L.exit < cols ? Math.floor(L.exit) : cols - 3);
  const fill = m => (x0, y0, x1, y1, c) => { for (let y = Math.max(0, y0); y <= Math.min(rows - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(cols - 1, x1); x++) m[y][x] = c; };
  const pokes = (L.cursors || []).filter(c => c[0] === 'POKE').flatMap(c => (c[3] && c[3].set) || []);
  const mk = build => { const m = []; for (let y = 0; y < rows; y++) m.push(new Array(cols).fill('.')); build(fill(m), cols); for (const s of pokes) fill(m)(...s); return m; };
  const base = mk(L.build); let maps = [base], flip = false;
  if (L.buildB) maps.push(mk(L.buildB));
  else if (L.shifters && L.shifters.length) { const sh = side => { const m = base.map(r => r.slice()); for (const s of L.shifters) { for (const [x0, y0, x1, y1] of side ? s.a : s.b) fill(m)(x0, y0, x1, y1, '.');
      for (const [x0, y0, x1, y1, c] of side ? s.b : s.a) fill(m)(x0, y0, x1, y1, c || '#'); } return m; }; maps = [sh(0), sh(1)]; }
  else if (L.freq) { const fq = c => c === '1' || c === '2' || c === '3';   // честотите се сменят и във въздуха: платформите — '-', стените (колони) — проходими
    maps = [base.map((r, y) => r.map((c, x) => !fq(c) ? c : (y > 0 && fq(base[y - 1][x])) || (y < rows - 1 && fq(base[y + 1][x])) ? '.' : '-'))]; }
  else if (L.flips && L.flips.length) { maps.push(base.slice().reverse()); flip = true; }
  maps = maps.map(m => bkPrep(m, L));
  const Ls = maps.map(g => bkLayer(g, L, cols, rows, exitX)), NN = N * Ls.length, adj = [];
  Ls.forEach((ly, e) => { for (let id = 0; id < N; id++) adj[e * N + id] = ly.adj[id].map(n => e * N + n); });
  const land = (e, x, y0) => { for (let ry = Math.max(0, y0); ry < rows; ry++) { const id = ry * cols + x; if (Ls[e].V.kind[id] || Ls[e].free[id]) return id; if (BK_SOL.includes(maps[e][ry][x])) return -1; } return -1; };
  if (flip) for (const [tx, ty] of L.flips) for (let e = 0; e < 2; e++) {   // сферата: светът се обръща, героят пада в другия слой
    const sy = e ? rows - 1 - ty : ty, t = land(1 - e, tx, e ? ty + 2 : rows - ty + 1); if (t < 0) continue;
    for (let x = Math.max(0, tx - 1); x <= Math.min(cols - 1, tx + 1); x++) for (let y = sy + 1; y <= Math.min(rows - 1, sy + 4); y++) if (Ls[e].V.kind[y * cols + x]) adj[e * N + y * cols + x].push((1 - e) * N + t); }
  else for (let e = 0; e < Ls.length; e++) for (let f = 0; f < Ls.length; f++) if (f !== e) { const A = Ls[e], gB = maps[f];   // преминаване: тялото е свободно в другия слой
    for (let id = 0; id < N; id++) { if (!A.V.kind[id] && !A.free[id]) continue; const x = id % cols, y = (id / cols) | 0;
      if ((A.free[id] ? [y] : [y - 1, y - 2]).some(yy => yy < 0 || BK_SOL.includes(gB[yy][x]))) continue;
      const t = A.free[id] && Ls[f].free[id] ? id : land(f, x, A.free[id] ? y + 1 : y); if (t >= 0) adj[e * N + id].push(f * N + t); } }
  for (const [cmd, tx, row, o] of L.cursors || []) if (cmd === 'GOTO' && o && o.to) for (let e = 0; e < Ls.length; e++) adj[e * N + (row + 1) * cols + tx].push(e * N + (o.to[1] + 1) * cols + o.to[0]);
  const sid = Ls[0].V.sid, spot = id => Ls[(id / N) | 0].V.kind[id % N] && (id % N) % cols < lim;
  const R = new Uint8Array(NN), q = [sid]; R[sid] = 1; for (let h = 0; h < q.length; h++) for (const n of adj[q[h]]) if (!R[n]) { R[n] = 1; q.push(n); }
  // силно свързаните области на достижимото (Тарян, без рекурсия): вътре се ходи напред-назад; всяка друга област е препятствие
  const comp = new Int32Array(NN).fill(-1), low = new Int32Array(NN), idx = new Int32Array(NN).fill(-1), on = new Uint8Array(NN), st = []; let ix = 0, nc = 0;
  for (let s0 = 0; s0 < NN; s0++) { if (!R[s0] || idx[s0] >= 0) continue; const cs = [[s0, 0]]; idx[s0] = low[s0] = ix++; st.push(s0); on[s0] = 1;
    while (cs.length) { const fr = cs[cs.length - 1], v = fr[0];
      if (fr[1] < adj[v].length) { const w = adj[v][fr[1]++]; if (!R[w]) continue; if (idx[w] < 0) { idx[w] = low[w] = ix++; st.push(w); on[w] = 1; cs.push([w, 0]); } else if (on[w]) low[v] = Math.min(low[v], idx[w]); }
      else { cs.pop(); if (cs.length) { const u = cs[cs.length - 1][0]; low[u] = Math.min(low[u], low[v]); }
        if (low[v] === idx[v]) { let w; do { w = st.pop(); on[w] = 0; comp[w] = nc; } while (w !== v); nc++; } } } }
  const size = new Int32Array(nc); for (let id = 0; id < NN; id++) if (comp[id] >= 0 && spot(id)) size[comp[id]]++;
  const ent = new Map();
  for (let id = 0; id < NN; id++) if (R[id]) for (const n of adj[id]) { const cv = comp[n]; if (cv === comp[id] || cv === comp[sid] || !size[cv] || !spot(n)) continue;
    const c = id % N, x = c % cols, y = (c / cols) | 0, o = ent.get(cv); if (!o || x < o.x) ent.set(cv, { x, y, пада: (((n % N) / cols) | 0) - y }); }
  let exit = false; for (let id = 0; id < NN; id++) if (R[id] && spot(id) && (id % N) % cols >= exitX - 1) exit = true;
  if (dbg) return { R, comp, sid, N, maps, Ls, adj };   // за разглеждане на картата
  return { exit, препятствия: [...ent.values()].sort((p, q) => p.x - q.x), R, N, maps, Ls, flip, lim };
}
// предмети, до които не се стига (стоиш до тях, скачаш до 5 реда нагоре или изскачаш от вода/стълба/течение до 4), и висящи
// платформи (място за стоене с въздух отдолу), до които не се стига — до арената; в обърнатия свят редовете са огледални
function bkSpots(L, a, items) {
  const { R, N, maps, Ls, flip, lim } = a, cols = L.cols, rows = maps[0].length, out = { предмети: [], платформи: [] };
  const rowIn = (e, y) => flip && e === 1 ? rows - 1 - y : y;
  for (const k of items) { const tx = Math.floor((k.x + 6) / T), row = Math.round((k.y + k.h) / T) - 1; if (tx >= lim) continue; let ok = false;
    for (let e = 0; e < Ls.length && !ok; e++) { const ly = Ls[e], r0 = rowIn(e, row);
      for (let sx = Math.max(0, tx - 1); sx <= Math.min(cols - 1, tx + 1) && !ok; sx++) for (let sy = r0 + 1; sy <= Math.min(rows - 1, r0 + 5) && !ok; sy++) if (ly.V.kind[sy * cols + sx] && R[e * N + sy * cols + sx]) ok = true;
      for (let fx = Math.max(0, tx - 2); fx <= Math.min(cols - 1, tx + 2) && !ok; fx++) for (let fy = Math.max(0, r0); fy <= Math.min(rows - 1, r0 + 4) && !ok; fy++) if (ly.free[fy * cols + fx] && R[e * N + fy * cols + fx]) ok = true; }
    if (!ok) out.предмети.push(k.type + ' x' + tx + ',' + row); }
  const plat = (x, y) => { let any = false; for (let e = 0; e < Ls.length; e++) { const ry = rowIn(e, y), c = ry * cols + x, below = ry + 1;
    if (R[e * N + c]) return 0; if (Ls[e].V.kind[c] && below >= 0 && below < rows && !BK_SOL.includes(maps[e][below][x]) && maps[e][below][x] !== 'D') any = true; } return any ? 1 : 0; };
  for (let y = 1; y < rows; y++) for (let x = 0; x < lim; x++) { if (!plat(x, y)) continue; const x0 = x; while (x + 1 < lim && plat(x + 1, y)) x++; if (x > x0) out.платформи.push('x' + x0 + '–' + x + ',' + y); }
  return out;
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
  async back({ games = null } = {}) {
    const r = { нива: 0, 'нива с препятствия': 0, препятствия: 0, 'без изход в модела': [], изключени: [], подробно: [], 'недостижими предмети': [], 'недостижими платформи': [] }, di0 = z().DI;
    for (const g of games || z().GAMES.map(q => q.id)) { z().enterGame(g, 2); const lv = z().levels;
      for (let i = 0; i < lv.length; i++) { const name = g + ':' + (i + 1), items = [], seen = new Set();
        for (const di of [0, 1, 2]) { z().setDiff(di); z().loadLevel(i); for (const k of z().pickups) { const key = k.type + k.x + ',' + k.y; if (!seen.has(key)) { seen.add(key); items.push(k); } } }   // предметите по всички трудности
        const L = z().LVL, a = bkLevel(L, z().map.length), sp = bkSpots(L, a, items);
        if (sp.предмети.length) r['недостижими предмети'].push(name + ' ' + L.title + ': ' + sp.предмети.join(' '));
        if (sp.платформи.length) r['недостижими платформи'].push(name + ' ' + L.title + ': ' + sp.платформи.join(' '));
        if (L.chase || L.noBack) { r.изключени.push(name); continue; }
        r.нива++; if (!a.exit) r['без изход в модела'].push(name);
        if (a.препятствия.length) { r['нива с препятствия']++; r.препятствия += a.препятствия.length;
          r.подробно.push(name + ' ' + L.title + ': ' + a.препятствия.map(p => 'x' + p.x + ',' + p.y + (p.пада > 0 ? '↓' + p.пада : '')).join(' ')); }
        if (i % 4 === 3) await pause(); }
      z().toMenu(2); }
    z().setDiff(di0); return r;
  },
  async baseline(o) {
    const out = [], ter = [], pop = []; let noBack = 0, haveB = true;
    for await (const { s, k, di, L, probe: P } of sectors(o)) { out.push([s, k, di, L.themeName, L.cols, z().enemies.length, z().pickups.length].join(','));
      ter.push(hstr(z().map.map(r => r.join('')).join('|'))); pop.push(hstr(L.spawns.map(q => q.join(':')).join(';')));
      if (!P || !P.V) continue; if (!P.V.B) { haveB = false; continue; }   // сектор без връщане: място, до което може да се стигне, без път до началото (без арената)
      const V = P.V, cols = P.cols, lim = L.arena ? L.arena.door : cols; for (let id = 0; id < V.kind.length; id++) if (V.RO[id] && V.kind[id] && !V.B[id] && id % cols < lim) { noBack++; break; } }
    let h = 0; for (const c of out.join('\n')) h = (h * 31 + c.charCodeAt(0)) | 0;
    return { сектори: out.length, отпечатък: (h >>> 0).toString(16), терен: hstr(ter.join(',')), население: hstr(pop.join(',')), 'без връщане': haveB ? noBack : '—', първите: out.slice(0, 5) };
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
