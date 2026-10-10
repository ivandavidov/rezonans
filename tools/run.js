/* Проверки на „Резонанс“ без браузър: сглобеният HTML се пуска в Node с минимален заместител на DOM (канвата не рисува).
   Само за разработка, без npm. Секторите не зависят от JS двигателя, затова baseline, placement, reach и acidSim дават
   същите числа като браузърният панел (tools/checks.js); smoke — също.

     node tools/run.js <файл.html> <проверка> [опции като JSON]   проверка от tools/checks.js: baseline, placement, reach, acidSim, smoke, back, episodes
     node tools/run.js <файл.html> suite                          отпечатъците за A/B: baseline, back, cheats, stand + smoke (по сценарии)
     node tools/run.js <файл.html> storage                        договорът на записите (localStorage) — tools/cases.js
     node tools/run.js <файл.html> cheats                         чийтовете: отключване, действие, нищо не се записва — tools/cases.js
     node tools/run.js <файл.html> stand ['{"seeds":2}']          опора: нищо „на земята“ не виси във въздуха — tools/stand.js

   Пример:  node tools/run.js docs/index.html baseline '{"game":"r1"}' */
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const [file, cmd = 'suite', optsJson] = process.argv.slice(2);
if (!file) { console.error('употреба: node tools/run.js <файл.html> <проверка|suite|storage|cheats|stand> [опции като JSON]'); process.exit(2); }
const m = fs.readFileSync(file, 'utf8').match(/<script>([\s\S]*)<\/script>/);
if (!m) { console.error('няма <script> в ' + file); process.exit(2); }
const GAME_JS = m[1], CHECKS_JS = fs.readFileSync(path.join(__dirname, 'checks.js'), 'utf8');

function makeStorage(init) { const d = new Map(Object.entries(init || {}));
  return { get length() { return d.size; }, key: i => [...d.keys()][i] ?? null, getItem: k => d.has(k) ? d.get(k) : null,
    setItem: (k, v) => { d.set(k, String(v)); }, removeItem: k => { d.delete(k); }, clear: () => d.clear(), dump: () => Object.fromEntries(d) }; }
// пуска играта в нов контекст: всичко, което не е логика (канва, звук, шрифтове), е празен заместител.
// o.js — друг изходен код (обвитият за опората), o.canvas(window) — канвите, които записват какво се рисува
function boot(ls, o = {}) {
  const stub = new Proxy(function () {}, { get: (t, k) => k === Symbol.toPrimitive ? () => 0 : k === 'then' ? undefined : stub, apply: () => stub, construct: () => stub, set: () => true });
  const storage = makeStorage(ls), LS = {};
  const document = { getElementById: () => stub, createElement: t => o.canvas && t === 'canvas' ? o.canvas(ctx) : stub, querySelectorAll: () => [], body: { classList: { toggle() {} } },
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
const { stand } = require('./stand.js')({ GAME_JS, file, boot }), { storage, cheats } = require('./cases.js')({ boot });

async function suite() {
  const env = boot(), games = env.rz.GAMES.map(g => g.id), out = [];
  for (const g of games) { const r = await check(env, 'baseline', { game: g });
    out.push(`baseline ${g} сектори=${r.сектори} отпечатък=${r.отпечатък} терен=${r.терен} население=${r.население} без връщане=${r['без връщане']}`);
    let b = null; try { b = await check(env, 'back', { games: [g] }); } catch (e) {}   // по-стара сборка (без опциите на svValidate) — „—“
    out.push(b ? `back ${g} нива=${b.нива} препятствия=${b.препятствия} без изход в модела=${b['без изход в модела'].length} недостижими предмети=${b['недостижими предмети'].length} платформи=${b['недостижими платформи'].length}` : `back ${g} —`); }
  for (const g of games) { let e = null; try { e = await check(env, 'episodes', { games: [g], seeds: 5 }); } catch (x) {}   // само части с генерирани епизоди
    if (e && e.нива) out.push(`episodes ${g} нива=${e.нива} резервни=${e['резервен генератор']} без връщане=${e['места без връщане']} без изход=${e['без изход в модела']} недостижими=${e['недостижими предмети']} в стена=${e['в стена/врата']} отпечатък=${e.отпечатък}`); }
  const ch = cheats(); out.push(ch.няма ? 'cheats —' : `cheats ${ch.bad ? 'НЕ' : 'ОК'} ${ch.n - ch.bad}/${ch.n}`);
  const st = stand({ seeds: 2 });   // опора — в свой контекст (обвитият код)
  for (const g of games) out.push(`stand ${g} предмети=${st.части[g].предмети} висящи=${st.части[g].висящи}`);
  const s = await check(boot(), 'smoke', {});   // smoke — в чист контекст
  for (const g of games) { const q = s.части[g]; out.push(`smoke ${g} сценарии=${q.сценарии} грешки=${q.грешки} отпечатък=${q.отпечатък}`); for (const d of q.подробно) out.push('  ' + g + ' ' + d); }
  for (const e of s.грешки) out.push(`грешка ${e.част} · ${e.сценарий}: ${e.грешка}`);
  return out.join('\n');
}

(async () => {
  try {
    const opts = optsJson ? JSON.parse(optsJson) : undefined;
    if (cmd === 'suite') console.log(await suite());
    else if (cmd === 'storage' || cmd === 'cheats') { const r = (cmd === 'storage' ? storage : cheats)(); console.log(r.text); process.exitCode = r.bad ? 1 : 0; }
    else if (cmd === 'stand') { const r = stand(opts); console.log(r.text); process.exitCode = r.висящи ? 1 : 0; }
    else { const r = await check(boot(), cmd, opts); console.log(JSON.stringify(r, null, 1)); }
  } catch (e) { console.error(String(e && e.stack || e)); process.exitCode = 1; }
})();
