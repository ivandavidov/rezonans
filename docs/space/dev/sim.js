// Проверка на логиката без браузър: автопилот минава всяко ниво при всяка трудност.
//   node dev/sim.js            — всички нива × трудности, две пускания (детерминизъм)
//   node dev/sim.js 1 2        — само ниво 1, трудност 2 (0 лесно, 1 нормално, 2 трудно)
// Зарежда същите файлове като index.html, но само логиката (js/core.js, js/sim/, js/levels/).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const files = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]).filter(f => /^js\/(core\.js|sim\/|levels\/)/.test(f));

function load() {
  const ctx = vm.createContext({ console, Math, Object, Array, Map, Set, Error, JSON, Number, String, Symbol });
  ctx.globalThis = ctx;
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
  return ctx.SPACE;
}

function run(level, diff, seed) {
  const S = load();
  const W = S.newWorld({ level, diff, seed });
  let maxF = 0, maxEB = 0, maxPB = 0, ex = null;
  const ev = {}, at = {};
  try {
    for (let i = 0; i < 60 * 60 * 8 && !(W.end && W.endT <= 0); i++) {
      S.step(W, S.bot(W));
      for (const e of W.ev) { ev[e.k] = (ev[e.k] || 0) + 1; if (at[e.k] == null) at[e.k] = W.t; }
      W.ev.length = 0;
      maxF = Math.max(maxF, W.foes.length); maxEB = Math.max(maxEB, W.eb.length); maxPB = Math.max(maxPB, W.pb.length);
    }
  } catch (e) { ex = e; }
  return { W, S, maxF, maxEB, maxPB, ex, ev, at };
}

// --human: „като човек“ — решава на всеки 8 такта, вижда изстрелите от 80 вместо 120, с малко шум;
// корабът е с подобренията от хангара, които играч би имал до това ниво; по 6 семена на ниво и трудност
if (process.argv.includes('--human')) {
  const HG = { 1: {}, 2: { hull: 1 }, 3: { hull: 1, magnet: 1, res: 1 }, 4: { hull: 1, magnet: 1, res: 1, pow: 1 }, 5: { hull: 2, magnet: 1, res: 2, pow: 1, lives: 1 }, 6: { hull: 2, magnet: 2, res: 2, pow: 1, lives: 1, echo: 1 } };
  const S0 = load(), lvls = Object.keys(S0.LEVELS).map(Number);
  console.log('ниво трудн.  минати   загубени кораби (ср.)  удари (ср.)  край на играта  продълж. нужни  време (ср.)');
  for (const lv of lvls) for (const d of [0, 1, 2]) {
    let clr = 0, deaths = 0, hits = 0, over = 0, secs = 0, N = 6;
    for (let sd = 1; sd <= N; sd++) {
      const S = load(), W = S.newWorld({ level: lv, diff: d, seed: sd * 7919, ship: HG[lv] }), rr = S.rng(sd * 31);
      let last = null;
      for (let i = 0; i < 60 * 60 * 9 && !(W.end && W.endT <= 0); i++) {
        if (i % 8 === 0 || !last) { last = S.bot(W, { see: 80, k: 0.75 }); last.ax = M2(last.ax + (rr() - 0.5) * 0.5); last.ay = M2(last.ay + (rr() - 0.5) * 0.5); }
        else last = Object.assign({}, last, { act: false, bomb: false });
        S.step(W, last); W.ev.length = 0;
      }
      if (W.end === 'clear') clr++; else over++;
      deaths += W.deaths; hits += W.p.hits; secs += W.t / 60;
    }
    console.log(`${String(lv).padStart(4)} ${String(d).padStart(5)}   ${clr}/${N}      ${(deaths / N).toFixed(1).padStart(8)}              ${(hits / N).toFixed(1).padStart(6)}         ${String(over).padStart(4)}                         ${(secs / N).toFixed(0).padStart(6)}s`);
  }
  process.exit(0);
}
function M2(v) { return v < -1 ? -1 : v > 1 ? 1 : v; }

const args = process.argv.slice(2).map(Number);
const S0 = load();
const levels = args.length ? [args[0]] : Object.keys(S0.LEVELS).map(Number);
const diffs = args.length > 1 ? [args[1]] : [0, 1, 2];
let bad = 0;
console.log('ниво трудн.  край   време   бос(от/битка)  точки    убити/появили  кристали ноти оръж. удари живот  макс(в/вк/ик)  отпечатък');
for (const lv of levels) for (const d of diffs) {
  const a = run(lv, d, 12345), b = run(lv, d, 12345), W = a.W;
  const fa = a.S.fingerprint(a.W), fb = b.S.fingerprint(b.W);
  const det = fa === fb;
  if (a.ex || !det || W.end !== 'clear') bad++;
  const sec = (W.t / 60).toFixed(1).padStart(6);
  const bs = a.at.boss != null ? `${(a.at.boss / 60).toFixed(0)}s/${(((a.at.bossdie || W.t) - a.at.boss) / 60).toFixed(0)}s` : '—';
  console.log(`${String(lv).padStart(4)} ${String(d).padStart(5)}  ${String(W.end).padEnd(5)} ${sec}s  ${bs.padStart(12)}  ${String(W.score).padStart(8)}  ${String(W.kills).padStart(6)}/${String(W.spawned).padEnd(6)}  ${String(W.crystals).padStart(8)} ${String(W.notes).padStart(4)} ${String(a.ev.wpn || 0).padStart(5)} ${String(W.p.hits).padStart(5)} ${String(W.p.lives).padStart(5)}  ${a.maxF}/${a.maxEB}/${a.maxPB}`.padEnd(128) + `  ${fa}${det ? '' : ' ≠ ' + fb}`);
  if (a.ex) console.log('   ИЗКЛЮЧЕНИЕ:', a.ex.stack.split('\n').slice(0, 3).join(' | '));
}
console.log(bad ? `\n✗ ${bad} проблема` : '\n✓ всички нива минават, 0 изключения, детерминизмът е запазен');
process.exit(bad ? 1 : 0);
