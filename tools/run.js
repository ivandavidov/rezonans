/* Проверки на „Резонанс“ без браузър: сглобеният HTML се пуска в Node с минимален заместител на DOM (канвата не рисува).
   Само за разработка, без npm. Секторите не зависят от JS двигателя, затова baseline, placement, reach и acidSim дават
   същите числа като браузърният панел (tools/checks.js); smoke — също.

     node tools/run.js <файл.html> <проверка> [опции като JSON]   проверка от tools/checks.js: baseline, placement, reach, acidSim, smoke
     node tools/run.js <файл.html> suite                          отпечатъците за A/B: baseline на всяка част + smoke (по сценарии)
     node tools/run.js <файл.html> storage                        договорът на записите (localStorage): четене и писане по ключове

   Пример:  node tools/run.js docs/index.html baseline '{"game":"r1"}' */
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const [file, cmd = 'suite', optsJson] = process.argv.slice(2);
if (!file) { console.error('употреба: node tools/run.js <файл.html> <проверка|suite|storage> [опции като JSON]'); process.exit(2); }
const m = fs.readFileSync(file, 'utf8').match(/<script>([\s\S]*)<\/script>/);
if (!m) { console.error('няма <script> в ' + file); process.exit(2); }
const GAME_JS = m[1], CHECKS_JS = fs.readFileSync(path.join(__dirname, 'checks.js'), 'utf8');

function makeStorage(init) { const d = new Map(Object.entries(init || {}));
  return { get length() { return d.size; }, key: i => [...d.keys()][i] ?? null, getItem: k => d.has(k) ? d.get(k) : null,
    setItem: (k, v) => { d.set(k, String(v)); }, removeItem: k => { d.delete(k); }, clear: () => d.clear(), dump: () => Object.fromEntries(d) }; }
// пуска играта в нов контекст: всичко, което не е логика (канва, звук, шрифтове), е празен заместител
function boot(ls) {
  const stub = new Proxy(function () {}, { get: (t, k) => k === Symbol.toPrimitive ? () => 0 : k === 'then' ? undefined : stub, apply: () => stub, construct: () => stub, set: () => true });
  const storage = makeStorage(ls);
  const document = { getElementById: () => stub, createElement: () => stub, querySelectorAll: () => [], body: { classList: { toggle() {} } },
    fonts: { load: () => Promise.resolve() }, addEventListener() {}, hidden: false };
  const ctx = { document, localStorage: storage, performance, setTimeout, clearTimeout, setInterval: () => 0, clearInterval() {}, console,
    requestAnimationFrame: () => 0, addEventListener() {} };
  ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(GAME_JS, ctx, { filename: path.basename(file) });
  vm.runInContext(CHECKS_JS, ctx, { filename: 'checks.js' });
  return { ctx, rz: ctx.__rz, storage };
}
const check = (env, name, opts) => new Promise((res, rej) => {
  const msg = env.ctx.rzChecks.run(name, opts); if (!/^стартирано/.test(msg)) return rej(new Error(msg));
  (function wait() { const r = env.ctx.rzChecks.result; if (r && !r.running) return r.error ? rej(new Error(r.error)) : res(r); setTimeout(wait, 20); })();
});

async function suite() {
  const env = boot(), games = env.rz.GAMES.map(g => g.id), out = [];
  for (const g of games) { const r = await check(env, 'baseline', { game: g });
    out.push(`baseline ${g} сектори=${r.сектори} отпечатък=${r.отпечатък} терен=${r.терен} население=${r.население}`); }
  const s = await check(boot(), 'smoke', {});   // smoke — в чист контекст
  for (const g of games) { const q = s.части[g]; out.push(`smoke ${g} сценарии=${q.сценарии} грешки=${q.грешки} отпечатък=${q.отпечатък}`); for (const d of q.подробно) out.push('  ' + g + ' ' + d); }
  for (const e of s.грешки) out.push(`грешка ${e.част} · ${e.сценарий}: ${e.грешка}`);
  return out.join('\n');
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
    else { const r = await check(boot(), cmd, optsJson ? JSON.parse(optsJson) : undefined); console.log(JSON.stringify(r, null, 1)); }
  } catch (e) { console.error(String(e && e.stack || e)); process.exitCode = 1; }
})();
