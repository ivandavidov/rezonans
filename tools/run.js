/* Проверки на „Резонанс“ без браузър: сглобеният HTML се пуска в Node с минимален заместител на DOM (канвата не рисува).
   Само за разработка, без npm. Секторите не зависят от JS двигателя, затова baseline, placement, reach и acidSim дават
   същите числа като браузърният панел (tools/checks.js); smoke — също.

     node tools/run.js <файл.html> <проверка> [опции като JSON]   проверка от tools/checks.js: baseline, placement, reach, acidSim, smoke
     node tools/run.js <файл.html> suite                          отпечатъците за A/B: baseline, back и stand на всяка част + smoke (по сценарии)
     node tools/run.js <файл.html> storage                        договорът на записите (localStorage): четене и писане по ключове
     node tools/run.js <файл.html> stand ['{"seeds":2}']          опора: декорът „на земята“, огньовете, отдушниците, неподвижните
                                                                  врагове и бъчвите не висят във въздуха (кампаниите и секторите)
     node tools/run.js <файл.html> cheats                         чийтовете: отключване, действието им, нищо не се записва; всички
                                                                  режими и действия във всяка част — без грешки

   Пример:  node tools/run.js docs/index.html baseline '{"game":"r1"}' */
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const [file, cmd = 'suite', optsJson] = process.argv.slice(2);
if (!file) { console.error('употреба: node tools/run.js <файл.html> <проверка|suite|storage|stand|cheats> [опции като JSON]'); process.exit(2); }
const m = fs.readFileSync(file, 'utf8').match(/<script>([\s\S]*)<\/script>/);
if (!m) { console.error('няма <script> в ' + file); process.exit(2); }
const GAME_JS = m[1], CHECKS_JS = fs.readFileSync(path.join(__dirname, 'checks.js'), 'utf8');

function makeStorage(init) { const d = new Map(Object.entries(init || {}));
  return { get length() { return d.size; }, key: i => [...d.keys()][i] ?? null, getItem: k => d.has(k) ? d.get(k) : null,
    setItem: (k, v) => { d.set(k, String(v)); }, removeItem: k => { d.delete(k); }, clear: () => d.clear(), dump: () => Object.fromEntries(d) }; }
// пуска играта в нов контекст: всичко, което не е логика (канва, звук, шрифтове), е празен заместител
function boot(ls, o = {}) {   // o.js — друг изходен код (обвитият за „опора“), o.rec — канвите записват какво се рисува
  const stub = new Proxy(function () {}, { get: (t, k) => k === Symbol.toPrimitive ? () => 0 : k === 'then' ? undefined : stub, apply: () => stub, construct: () => stub, set: () => true });
  const storage = makeStorage(ls), LS = {};
  const document = { getElementById: () => stub, createElement: t => o.rec && t === 'canvas' ? recCanvas(ctx) : stub, querySelectorAll: () => [], body: { classList: { toggle() {} } },
    fonts: { load: () => Promise.resolve() }, addEventListener() {}, hidden: false };
  const ctx = { document, localStorage: storage, performance, setTimeout, clearTimeout, setInterval: () => 0, clearInterval() {}, console,
    requestAnimationFrame: () => 0, addEventListener: (t, f) => (LS[t] = LS[t] || []).push(f) };
  ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(o.js || GAME_JS, ctx, { filename: path.basename(file) });
  vm.runInContext(CHECKS_JS, ctx, { filename: 'checks.js' });
  return { ctx, rz: ctx.__rz, storage, fire: (t, e) => (LS[t] || []).forEach(f => f(e)) };   // fire — събитие към слушателите на window
}
const check = (env, name, opts) => new Promise((res, rej) => {
  const msg = env.ctx.rzChecks.run(name, opts); if (!/^стартирано/.test(msg)) return rej(new Error(msg));
  (function wait() { const r = env.ctx.rzChecks.result; if (r && !r.running) return r.error ? rej(new Error(r.error)) : res(r); setTimeout(wait, 20); })();
});

async function suite() {
  const env = boot(), games = env.rz.GAMES.map(g => g.id), out = [];
  for (const g of games) { const r = await check(env, 'baseline', { game: g });
    out.push(`baseline ${g} сектори=${r.сектори} отпечатък=${r.отпечатък} терен=${r.терен} население=${r.население} без връщане=${r['без връщане']}`);
    let b = null; try { b = await check(env, 'back', { games: [g] }); } catch (e) {}   // по-стара сборка (без опциите на svValidate) — „—“
    out.push(b ? `back ${g} нива=${b.нива} препятствия=${b.препятствия} без изход в модела=${b['без изход в модела'].length} недостижими предмети=${b['недостижими предмети'].length} платформи=${b['недостижими платформи'].length}` : `back ${g} —`); }
  const ch = cheats(); out.push(ch.нямa ? 'cheats —' : `cheats ${ch.bad ? 'НЕ' : 'ОК'} ${ch.n - ch.bad}/${ch.n}`);
  const st = stand({ seeds: 2 });   // опора — в свой контекст (обвитият код)
  for (const g of games) out.push(`stand ${g} предмети=${st.части[g].предмети} висящи=${st.части[g].висящи}`);
  const s = await check(boot(), 'smoke', {});   // smoke — в чист контекст
  for (const g of games) { const q = s.части[g]; out.push(`smoke ${g} сценарии=${q.сценарии} грешки=${q.грешки} отпечатък=${q.отпечатък}`); for (const d of q.подробно) out.push('  ' + g + ' ' + d); }
  for (const e of s.грешки) out.push(`грешка ${e.част} · ${e.сценарий}: ${e.грешка}`);
  return out.join('\n');
}

/* ---------- опора: нищо „на земята“ не виси във въздуха ----------
   Помощниците за декор, които стоят на земята (параметър fy/floorY, fy=15*T в началото на тялото, crystalAt), се обвиват, а
   канвата записва правоъгълника около всяка нарисувана фигура. Основата — нарисуваното до 3 px над най-ниската точка — трябва
   да е над плочка, на която се стои; над въздух — най-много 4 px. Отделно: огньовете, решетките на отдушниците (ред 15),
   неподвижните врагове и бъчвите. Кампаниите на всяка част + секторите (семена 1…seeds × 1–40, трудност лесно и трудно). */
const ST_SKIP = new Set(['paintFig', 'drawTrainChase', 'r6DrawFamily']);   // фигурите в картината на фона; рисуваното в движение
function standJs() {
  const P = {}, js = GAME_JS.replace(/function ([\w$]+)\(([^)]*)\)\s*\{/g, (m, n, ps, off) => {
    const pn = ps.split(',').map(p => p.split('=')[0].trim()), body = GAME_JS.slice(off + m.length, off + m.length + 120);
    if (ST_SKIP.has(n) || !(pn.includes('fy') || pn.includes('floorY') || n === 'crystalAt' || /^[^}]*?\bfy=15\*T\b/.test(body))) return m;
    P[n] = pn; return `function ${n}(...a){ return __st(${JSON.stringify(n)},${n}__o,this,a); }function ${n}__o(${ps}){`; });
  const a = "(()=>{\n'use strict';\n", i = js.indexOf(a) + a.length; if (i < a.length) throw new Error('няма начало на IIFE в ' + file);
  return { P, js: js.slice(0, i) + "const __st=(n,f,th,a)=>{ const L=window.__stLog; if(!L||__st.d) return f.apply(th,a); const r=[]; L.push([n,Array.from(a),map.map(q=>q.join('')),r]);\n" +
    "  window.__stRec=r; __st.d=1; try{ return f.apply(th,a); } finally{ __st.d=0; window.__stRec=null; } };\nwindow.__stEv=s=>eval(s);\n" + js.slice(i) };
}
// канва, която записва правоъгълника около всяка фигура в window.__stRec, докато е зададен
function recCanvas(W) {
  let m = [1, 0, 0, 1, 0, 0], pts = []; const st = [], grad = { addColorStop() {} }, cv = { width: 300, height: 150, style: {}, addEventListener() {}, getContext: () => c };
  const mul = b => { const a = m; m = [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]]; };
  const tp = (x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]], P = (x, y) => { if (W.__stRec) pts.push(tp(x, y)); };
  const put = q => { if (q.length) W.__stRec.push([Math.min(...q.map(p => p[0])), Math.min(...q.map(p => p[1])), Math.max(...q.map(p => p[0])), Math.max(...q.map(p => p[1]))]); };
  const box = (x, y, w, h) => { if (W.__stRec) put([tp(x, y), tp(x + w, y), tp(x, y + h), tp(x + w, y + h)]); };
  const arc = (x, y, rx, ry, rot = 0, a0 = 0, a1 = 7, ccw) => { if (!W.__stRec) return; const F = 2 * Math.PI, d = ccw ? -((((a0 - a1) % F) + F) % F || F) : a1 - a0 >= F ? F : (((a1 - a0) % F) + F) % F;
    for (let i = 0; i <= 24; i++) { const t = a0 + d * i / 24, ex = rx * Math.cos(t), ey = ry * Math.sin(t); P(x + ex * Math.cos(rot) - ey * Math.sin(rot), y + ex * Math.sin(rot) + ey * Math.cos(rot)); } };
  const c = new Proxy({ canvas: cv, save() { st.push(m); }, restore() { if (st.length) m = st.pop(); }, translate(x, y) { mul([1, 0, 0, 1, x, y]); }, scale(x, y) { mul([x, 0, 0, y, 0, 0]); },
    rotate(a) { mul([Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0]); }, transform(...b) { mul(b); }, setTransform(...b) { m = typeof b[0] === 'number' ? b : [1, 0, 0, 1, 0, 0]; },
    resetTransform() { m = [1, 0, 0, 1, 0, 0]; }, fillRect: box, strokeRect: box, beginPath() { pts = []; }, moveTo: P, lineTo: P, rect(x, y, w, h) { P(x, y); P(x + w, y + h); },
    quadraticCurveTo(a, b, x, y) { P(a, b); P(x, y); }, bezierCurveTo(a, b, e, f, x, y) { P(a, b); P(e, f); P(x, y); }, arcTo(a, b, x, y) { P(a, b); P(x, y); },
    arc(x, y, r, a0, a1, ccw) { arc(x, y, r, r, 0, a0, a1, ccw); }, ellipse: arc, fill() { if (W.__stRec) put(pts); }, stroke() { if (W.__stRec) put(pts); },
    drawImage(img, ...a) { if (a.length === 4) box(...a); else if (a.length === 8) box(a[4], a[5], a[6], a[7]); else box(a[0], a[1], img.width || 0, img.height || 0); },
    measureText: () => ({ width: 0 }), createLinearGradient: () => grad, createRadialGradient: () => grad, createPattern: () => grad,
    getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(4 * Math.max(1, w * h)), width: w, height: h }) },
    { get: (t, k) => k in t ? t[k] : typeof k === 'string' && k !== 'then' ? () => {} : undefined, set: (t, k, v) => { t[k] = v; return true; } });
  return cv;
}
function stand({ seeds = 2, games = null } = {}) {
  const { P, js } = standJs(), env = boot(null, { js, rec: true }), rz = env.rz, W = env.ctx, ev = W.__stEv;
  const T = ev('T'), S = ev('S'), FOES = ev('FOES'), SOL = '#=BZ><^D-H123t', out = [], части = {};   // SOL — на какво може да стои нещо
  let q = null;
  const base = (where, what, m, iv, fy) => { const r = Math.floor((fy + 1) / T); let bad = 0, tot = 0; q.предмети++;   // iv — отсечките на основата в px
    for (const [x0, x1] of iv) for (let x = Math.floor(x0); x < Math.ceil(x1); x++) { tot++; if (!SOL.includes((m[r] || '')[Math.floor(x / T)] || '.')) bad++; }
    if (bad > 4 || bad && bad >= tot) { q.висящи++; out.push(`${where} — ${what} (колона ${Math.floor(iv[0][0] / T)}, под ред ${r}): ${bad >= tot ? 'виси' : 'над въздух ' + bad + ' от ' + tot + ' px'}`); } };
  const scan = (where, L, log) => {
    for (const [n, a, m, rec] of log) { const pn = P[n], fy = n === 'crystalAt' ? (a[1] + 1) * T : pn.includes('fy') ? a[pn.indexOf('fy')] : pn.includes('floorY') ? a[pn.indexOf('floorY')] : 15 * T;
      if (typeof fy !== 'number') continue; const sh = rec.map(b => b.map(v => v / S)).filter(b => b[3] <= fy + 4 && b[2] > b[0]); if (!sh.length) continue;
      const bot = Math.max(...sh.map(b => b[3])); if (bot < fy - 6) continue;   // не стига до пода (табела с балонче) — не е „на земята“
      const iv = []; for (const b of sh.filter(b => b[3] >= bot - 3).sort((u, v) => u[0] - v[0])) { const l = iv[iv.length - 1]; if (l && b[0] <= l[1]) l[1] = Math.max(l[1], b[2]); else iv.push([b[0], b[2]]); }
      base(where, n + '(' + a.slice(0, 3).map(v => typeof v === 'number' ? +v.toFixed(1) : JSON.stringify(v)).join(',') + ')', m, iv, fy); }
    const m = rz.map.map(r => r.join(''));
    for (const [fx, fy] of L.fires || []) base(where, 'огън', m, [[fx - 2, fx + 2]], fy);
    for (const v of L.vents || []) base(where, 'отдушник', m, [[v.tx * T, v.tx * T + T]], 15 * T);
    for (const e of rz.enemies) if (FOES[e.type] && FOES[e.type].fixed) base(where, e.type, m, [[e.x, e.x + e.w]], e.y + e.h);
    for (const b of ev('barrels')) base(where, 'бъчва', m, [[b.x, b.x + b.w]], b.y + b.h); };
  for (const g of rz.GAMES.map(x => x.id)) { if (games && !games.includes(g)) continue; rz.enterGame(g, 2); q = части[g] = { предмети: 0, висящи: 0 };
    for (let i = 0; i < rz.levels.length; i++) { W.__stLog = []; rz.loadLevel(i); const log = W.__stLog; W.__stLog = null; scan(g + ':' + (i + 1) + ' ' + rz.LVL.title, rz.LVL, log); }
    for (const di of [0, 2]) { rz.setDiff(di); for (let s = 1; s <= seeds; s++) for (let k = 0; k < 40; k++) { rz.survSeed = 10000 + s * 7919; const L = rz.genLevel(k);
      W.__stLog = []; rz.loadLevel(-1, L); const log = W.__stLog; W.__stLog = null; scan(`${g} сектор ${k + 1} (семе ${s}, ${['лесно', '', 'трудно'][di]}) ${L.themeName}`, L, log); } }
    rz.toMenu(2); }
  const висящи = Object.values(части).reduce((s, c) => s + c.висящи, 0);
  return { части, висящи, text: out.concat(Object.entries(части).map(([g, c]) => `${g}: предмети на земята ${c.предмети}, висящи ${c.висящи}`)).join('\n') };
}

/* ---------- договорът на записите: какво чете и пише играта; трябва да остане същото след всяка стъпка ---------- */
const SV7 = JSON.stringify({ k: 7, seed: 12345, score: 900, w: ['wrench', 'pistol', 'shotgun'], a: { pistol: [17, 40], shotgun: [8, 10] }, ar: 30, hp: 80, cur: 'shotgun' });
const press = (rz, k, t) => { rz.pressed[k] = true; rz.keys[k] = true; rz.frame(t); rz.keys[k] = false; };
const CASES = [
  { име: 'нов играч', ls: {}, f: rz => ({ DI: rz.DI, unl: rz.unl, musOn: rz.musOn, sfxOn: rz.sfxOn }), очаквано: { DI: 1, unl: 1, musOn: false, sfxOn: false } },
  { име: 'стари записи на r1', ls: { 'rz.diff': '2', 'rz.unlocked': '20', 'rz.audio': '10' }, f: rz => ({ DI: rz.DI, unl: rz.unl, musOn: rz.musOn, sfxOn: rz.sfxOn }),
    очаквано: { DI: 2, unl: 21, musOn: true, sfxOn: false } },
  { име: 'стойности извън обхвата', ls: { 'rz.diff': '7', 'rz.unlocked': '99' }, f: rz => ({ DI: rz.DI, unl: rz.unl }), очаквано: { DI: 2, unl: 25 } },
  { име: 'повредени стойности', ls: { 'rz.diff': 'x', 'rz.unlocked': 'abc', 'rz.audio': '2' }, f: rz => ({ DI: rz.DI, unl: rz.unl, musOn: rz.musOn, sfxOn: rz.sfxOn }),
    очаквано: { DI: 0, unl: 1, musOn: false, sfxOn: false } },
  { име: 'звук M/N/B', ls: {}, f: (rz, ls) => { const o = []; rz.toggleMus(); o.push(ls.getItem('rz.audio')); rz.toggleSfx(); o.push(ls.getItem('rz.audio')); rz.toggleMute(); o.push(ls.getItem('rz.audio')); rz.toggleMute(); o.push(ls.getItem('rz.audio')); return o; },
    очаквано: ['10', '11', '00', '11'] },
  { име: 'край на епизод в r1', ls: { 'rz.unlocked': '2' }, f: (rz, ls) => { rz.startEpisode(2, false); rz.state = 'play'; rz.completeLevel(); return { key: ls.getItem('rz.unlocked'), unl: rz.unl }; },
    очаквано: { key: '4', unl: 4 } },
  { име: 'продължи в оцеляване (r1)', ls: { 'rz.svSave0': SV7 }, f: (rz, ls) => { rz.setDiff(0); const o = rz.svLoad(0); rz.startSurv(o.k, o); const p = rz.player;
      return { survK: rz.survK, survSeed: rz.survSeed, survScore: rz.survScore, hp: p.hp, armor: p.armor, cur: p.cur, shotgun: !!p.weapons.shotgun, запис: ls.getItem('rz.svSave0') === SV7 }; },
    очаквано: { survK: 7, survSeed: 12345, survScore: 900, hp: 80, armor: 30, cur: 'shotgun', shotgun: true, запис: true } },
  { име: 'рекорд и запис при изход от оцеляване (r1)', ls: {}, f: (rz, ls) => { rz.setDiff(1); rz.startSurv(3, { k: 3, seed: 1, score: 500, w: ['wrench', 'pistol'], a: {}, ar: 0, hp: 100, cur: 'pistol' });
      const sv = JSON.parse(ls.getItem('rz.svSave1') || 'null'); rz.state = 'paused'; press(rz, 'esc', 1000);
      return { best: ls.getItem('rz.best1'), bestK: ls.getItem('rz.bestK1'), sv: sv && [sv.k, sv.seed, sv.score, sv.hp, sv.cur] }; },
    очаквано: { best: '500', bestK: '4', sv: [3, 1, 500, 100, 'pistol'] } },
  { име: 'изчисти прогреса', ls: { 'rz.best1': '500', 'rz.bestK1': '4', 'rz.svSave1': '{"k":3,"seed":1,"score":500}', 'rz.best0': '70' },
    f: (rz, ls) => { rz.setDiff(1); rz.svClear(1); return ls.dump(); }, очаквано: { 'rz.best0': '70' } },
  { име: 'r2: отключени епизоди', нужни: ['r2'], ls: { 'rz2.unlocked': '5' }, f: rz => { rz.enterGame('r2'); const a = rz.unl; return { a, DI: rz.DI }; }, очаквано: { a: 5, DI: 1 } },
  { име: 'r2: отключени извън обхвата', нужни: ['r2'], ls: { 'rz2.unlocked': '999' }, f: rz => { rz.enterGame('r2'); return { unl: rz.unl, n: rz.levels.length }; }, очаквано: { unl: 23, n: 23 } },
  { име: 'r2: край на епизод', нужни: ['r2'], ls: {}, f: (rz, ls) => { rz.enterGame('r2'); rz.startEpisode(3, false); rz.state = 'play'; rz.completeLevel(); return { key: ls.getItem('rz2.unlocked'), r1: ls.getItem('rz.unlocked') }; },
    очаквано: { key: '5', r1: null } },
  { име: 'r2: запазен напредък в оцеляване', нужни: ['r2'], ls: { 'rz2.svSave1': SV7 }, f: rz => { rz.enterGame('r2'); rz.setDiff(1); const o = rz.svLoad(1); return { k: o && o.k, game: rz.GAME.id }; },
    очаквано: { k: 7, game: 'r2' } },
  { име: 'r3/r4: избраните краища', нужни: ['r3', 'r4'], ls: { 'rz3.ending': '2', 'rz4.ending': '3' }, f: rz => ({ r3: rz.ENDING, r4: rz.ENDING4 }), очаквано: { r3: 2, r4: 3 } },
];
/* ---------- чийтовете: отключване, действие, нищо не се записва ---------- */
const frames = (rz, n, keys = {}) => { for (const k in keys) rz.keys[k] = keys[k]; for (let i = 0; i < n; i++) rz.frame(frames.t += 1000 / 60); for (const k in keys) rz.keys[k] = false; };
frames.t = 1000;
const CHEAT_CASES = [
  { име: 'думата kokoloko отключва реда в менюто', f: (rz, ls, env) => { const n = rz.menuItems().length;
      for (const c of 'kokoloko') env.fire('keydown', { code: 'Key' + c.toUpperCase(), repeat: false, preventDefault() {} });
      return { open: rz.CHT.open, state: rz.state, ред: rz.menuItems()[rz.gSel].t, нови: rz.menuItems().length - n }; },
    очаквано: { open: true, state: 'gmenu', ред: 'ЧИЙТОВЕ', нови: 1 } },
  { име: 'екранът: от менюто, от паузата (↓) и действие', f: (rz, ls, env) => { const st = []; rz.chtUnlock(); rz.toMenu(rz.menuItems().findIndex(m => m.k === 'cheats'));
      press(rz, 'fire', frames.t += 20); st.push(rz.state); rz.render(); press(rz, 'fire', frames.t += 20); st.push(!!rz.CHT.on.god); press(rz, 'esc', frames.t += 20); st.push(rz.state);
      rz.startEpisode(2, false); rz.state = 'paused'; rz.render(); press(rz, 'down', frames.t += 20); st.push(rz.state); rz.render();
      press(rz, 'esc', frames.t += 20); st.push(rz.state); press(rz, 'down', frames.t += 20); press(rz, 'up', frames.t += 20); press(rz, 'fire', frames.t += 20);   // последният ред — „Убий враговете“
      st.push(rz.state, rz.enemies.every(e => e.dead)); return st; },
    очаквано: ['cheats', true, 'gmenu', 'cheats', 'paused', 'play', true] },
  { име: 'безсмъртие и безкрайни муниции', f: rz => { rz.startEpisode(2, false); rz.state = 'play'; const p = rz.player; p.weapons.pistol = true; p.cur = 'pistol';
      rz.chtSet('god', 1); rz.chtSet('ammo', 1); rz.hurtPlayer(60); const hp = p.hp; p.y = 17 * 16 + 40; frames(rz, 2); const fall = p.hp;
      const m = p.ammo.pistol.mag; frames(rz, 120, { fire: true }); return { hp, fall, пълнител: p.ammo.pistol.mag === m && m === 17 }; },
    очаквано: { hp: 100, fall: 100, пълнител: true } },
  { име: 'край на нивото — без запис на напредъка', ls: { 'rz.unlocked': '2' }, f: (rz, ls) => { rz.startEpisode(2, false); rz.state = 'play'; rz.chtDo('end');
      return { state: rz.state, key: ls.getItem('rz.unlocked'), unl: rz.unl }; }, очаквано: { state: 'levelEnd', key: '2', unl: 2 } },
  { име: 'чийт само в менюто не пречи на записа', ls: { 'rz.unlocked': '2' }, f: (rz, ls) => { rz.chtSet('god', 1); rz.chtSet('god', 0); rz.startEpisode(2, false); rz.state = 'play'; rz.completeLevel();
      return ls.getItem('rz.unlocked'); }, очаквано: '4' },
  { име: 'отключени нива — записът не се пипа', ls: { 'rz.unlocked': '2' }, f: (rz, ls) => { rz.chtSet('unl', 1); const с = rz.unl; rz.chtSet('unl', 0);
      return { с, без: rz.unl, key: ls.getItem('rz.unlocked') }; }, очаквано: { с: 25, без: 2, key: '2' } },
  { име: 'оцеляване — без рекорд и без „продължи“', f: (rz, ls) => { rz.setDiff(1); rz.chtSet('god', 1);
      rz.startSurv(3, { k: 3, seed: 1, score: 500, w: ['wrench', 'pistol'], a: {}, ar: 0, hp: 100, cur: 'pistol' }); rz.chtSet('god', 0); rz.startSurv(4, true);
      rz.state = 'paused'; press(rz, 'esc', frames.t += 20); rz.toggleMus(); return { best: ls.getItem('rz.best1'), sv: ls.getItem('rz.svSave1'), звук: ls.getItem('rz.audio') }; },
    очаквано: { best: null, sv: null, звук: '10' } },
  { име: 'начален сектор в оцеляването', f: rz => { rz.setDiff(1); rz.chtSet('start', 6); rz.svEnter(); return { survK: rz.survK, used: rz.CHT.used }; }, очаквано: { survK: 5, used: true } },
  { име: 'всички режими и действия във всяка част — без грешки', f: rz => { const err = [], modes = ['god', 'ammo', 'fly', 'clip', 'inv', 'onehit', 'light', 'slow', 'secret', 'freeze', 'traps', 'unl'];
      for (const g of rz.GAMES) { rz.enterGame(g.id);
        for (const i of [1, rz.levels.length - 1]) try { rz.startEpisode(i, false); rz.state = 'play'; for (const m of modes) rz.chtSet(m, 1);
          frames(rz, 120, { right: true, fire: true, up: true }); rz.render();
          for (const a of ['heal', 'arms', 'kill', 'fwd', 'boss', 'life', 'end']) { if (rz.state !== 'play') break; rz.chtDo(a); frames(rz, 20, { right: true }); }
          for (const m of modes) rz.chtSet(m, 0); frames(rz, 10); rz.render();
        } catch (e) { err.push(g.id + ':' + (i + 1) + ' ' + String(e && e.message || e).slice(0, 90)); }
        rz.toMenu(2); }
      return err; }, очаквано: [] },
];
function cheats() {
  const out = []; let bad = 0; if (!boot().rz.chtSet) return { нямa: true, text: 'няма чийтове в сборката', bad: 0, n: 0 };
  for (const c of CHEAT_CASES) { let got; try { const env = boot(c.ls); got = c.f(env.rz, env.storage, env); } catch (e) { got = 'грешка: ' + String(e && e.stack || e).split('\n')[0]; }
    const ok = JSON.stringify(got) === JSON.stringify(c.очаквано); if (!ok) bad++;
    out.push(`${ok ? 'ОК ' : 'НЕ '} ${c.име}` + (ok ? '' : `\n      очаквано: ${JSON.stringify(c.очаквано)}\n      получено: ${JSON.stringify(got)}`)); }
  out.push(bad ? `${bad} несъответствия` : 'чийтовете работят и нищо не записват');
  return { text: out.join('\n'), bad, n: CHEAT_CASES.length };
}
function storage() {
  const out = []; let bad = 0; const have = boot().rz.GAMES.map(g => g.id);
  for (const c of CASES) {
    if (c.нужни && !c.нужни.every(id => have.includes(id))) { out.push(`—   ${c.име} (няма ${c.нужни.join('/')} в сборката)`); continue; }
    let got; try { const env = boot(c.ls); got = c.f(env.rz, env.storage); } catch (e) { got = 'грешка: ' + String(e && e.stack || e).split('\n')[0]; }
    const ok = JSON.stringify(got) === JSON.stringify(c.очаквано); if (!ok) bad++;
    out.push(`${ok ? 'ОК ' : 'НЕ '} ${c.име}` + (ok ? '' : `\n      очаквано: ${JSON.stringify(c.очаквано)}\n      получено: ${JSON.stringify(got)}`));
  }
  out.push(bad ? `${bad} несъответствия` : 'договорът на записите е спазен');
  return { text: out.join('\n'), bad };
}

(async () => {
  try {
    if (cmd === 'suite') console.log(await suite());
    else if (cmd === 'storage') { const r = storage(); console.log(r.text); process.exitCode = r.bad ? 1 : 0; }
    else if (cmd === 'cheats') { const r = cheats(); console.log(r.text); process.exitCode = r.bad ? 1 : 0; }
    else if (cmd === 'stand') { const r = stand(optsJson ? JSON.parse(optsJson) : undefined); console.log(r.text); process.exitCode = r.висящи ? 1 : 0; }
    else { const r = await check(boot(), cmd, optsJson ? JSON.parse(optsJson) : undefined); console.log(JSON.stringify(r, null, 1)); }
  } catch (e) { console.error(String(e && e.stack || e)); process.exitCode = 1; }
})();
