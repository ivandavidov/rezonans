// Старт, състояния и цикълът: логика на фиксирана стъпка 60 Hz, рисуване с интерполация при всеки кадър.
(function () {
'use strict';
const S = window.SPACE, M = S.M, R = S.R, F = S.FX, U = S.UI, I = S.IN, AU = S.AU, SV = S.SAVE;
const cv = document.getElementById('cv'), play = document.getElementById('play');
const G = S.G = { state: 'boot', W: null, acc: 0, t: 0, stop: 0, slow: 0, slowT: 0, q: 1, css: { s: 1, x: 0, y: 0 }, fps: { n: 0, t: 0, v: 0, ms: [] } };
let level = 1;

// attract — автопилотът играе зад менютата; from — продължение от контролна точка
function newWorld(attract, from) {
  const seed = attract ? 777 : G.seed != null ? G.seed : (Math.random() * 4294967296) >>> 0;
  G.W = S.newWorld({ level: attract ? 1 : level, diff: attract ? 1 : SV.d.diff, seed, ship: attract ? {} : S.shipFrom(SV.d), from });
  G.attract = attract;
  F.clear(); F.dust(150, G.W.lv.dust || [0.75, 0.95, 1.25]); U.reset();
}

// ── размер: платното на цял екран, полето 16:9 в средата; HUD-ът е върху полето ──
function layout() {
  const cw = innerWidth, ch = innerHeight;
  const Q = QL[G.qi || 0], dpr = Math.min(devicePixelRatio || 1, 2) * Q.d;
  const w = Math.max(320, Math.round(cw * dpr)), h = Math.max(180, Math.round(ch * dpr));
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  R.resize(w, h, Q.b);
  const s = Math.min(cw / S.W, ch / S.H), x = (cw - S.W * s) / 2, y = (ch - S.H * s) / 2;
  G.css = { s, x, y, k: w / cw };
  play.style.cssText = `left:${x}px;top:${y}px;width:${S.W * s}px;height:${S.H * s}px;--u:${s}`;
}
addEventListener('resize', layout);

// ── реакции на събитията от логиката (ефекти, звук, HUD) ──
const HITC = { pulse: S.C.pulse, fan: S.C.fan, wave: S.C.wave, beam: S.C.beam, msl: [2.6, 1.5, 0.7] };
function react(W, e) {
  if (!G.attract) AU.ev(e);
  const p = W.p, fx = !G.attract || e.k === 'boom' || e.k === 'hit';
  if (!fx) return;
  switch (e.k) {
    case 'boom': F.boom(e.x, e.y, e.s, F.col(e.id), e.vx, e.vy); if (e.s === 3) G.stop = Math.max(G.stop, 3); if (W.lv.fog) S.LOOK.flash(e.x, e.y, 260 + e.s * 160); break;
    case 'hit': F.hit(e.x, e.y, HITC[e.w] || S.C.pulse, e.big); break;
    case 'deflect': F.hit(e.x, e.y, [2, 2.2, 2.6], false); break;
    case 'pop': F.pop(e.x, e.y); break;
    case 'note': F.ring(e.x, e.y, S.C.note, 20, 90, 22, 0.8); F.sparkle(e.x, e.y, S.C.note, 10, 6); U.pulse(e.i, 'got'); break;
    case 'up': F.ring(p.x, p.y, S.C.note, 30, 200, 30, 0.7); F.flare(p.x, p.y, S.C.note, 90, 30, 24, 0.9); U.pulse(e.i, 'took'); break;
    case 'deny': if (p.cursor >= 0) U.pulse(p.cursor, 'no'); break;
    case 'cr': F.cryPick(p.x, p.y); break;
    case 'wpn': { const c = S.LOOK.wc(e.w); F.ring(e.x, e.y, c, 30, 220, 32, 0.8); F.flare(e.x, e.y, c, 120, 30, 26, 1); F.sparkle(e.x, e.y, c, 18, 8); U.toast(e.same ? S.WEAPONS[e.w].name + ': +1 мощност' : S.WEAPONS[e.w].name, U.wcol(e.w)); break; }
    case 'phit': F.shake(0.5); R.ca = 0.014; G.stop = 4; F.sparkle(e.x, e.y, [2.6, 1.6, 1], 16, 8); vib(45); break;
    case 'shd': F.ring(e.x, e.y, S.C.player, 40, 110, 18, 0.9); F.shake(0.15); vib(20); break;
    case 'pdie': F.boom(e.x, e.y, 3, F.col('player'), 0, 0); F.wave(e.x, e.y, 0.07, 10, 70); R.ca = 0.03; G.slow = 0.3; G.slowT = 0.9; vib(160); break;
    case 'bomb': R.flash = 0.3 * F.flashK; F.wave(e.x, e.y, 0.08, 24, 75); F.shake(0.7); R.ca = 0.02; vib(90); break;
    case 'spawn': F.ring(190, e.y, S.C.player, 20, 140, 26, 0.6); break;
    case 'ring': F.ring(e.x, e.y, S.C.foe3, 30, 80, 14, 0.6); break;
    case 'banner': U.banner(e.t, e.s); break;
    case 'cp': U.toast('Контролна точка', '#bff8ff'); break;
    case 'warn': U.banner('Внимание', e.t + ' ' + (e.s || 'приближава'), true); AU.intensity(0.3); break;
    case 'boss': if (W.boss && W.boss.mini) AU.intensity(2.4); else AU.play(W.lv.boss || W.lv.music, 2.4); break;
    case 'bossgo': F.shake(0.4); F.ring(e.x, e.y, S.C.foe3, 60, 320, 30, 0.6); break;
    case 'phase': F.ring(e.x, e.y, [2.8, 1.4, 0.5], 60, 420, 34, 0.9); F.wave(e.x, e.y, 0.05, 12, 60); F.shake(0.6); R.flash = 0.12 * F.flashK; F.sparkle(e.x, e.y, [2.8, 1.6, 0.6], 40, 12); { const b = W.boss, tx = e.txt || (b && b.d.phaseTxt && b.d.phaseTxt[e.n]); if (tx) U.toast(tx, '#ffc08a'); } break;
    case 'lfire': F.flare(e.x, e.y, S.C.ebul, 160, 40, 20, 1); F.shake(0.18); break;
    case 'zap': F.ring(e.x, e.y, [0.8, 2.6, 2.0], 30, 220, 26, 0.7); break;
    case 'decloak': F.ring(e.x, e.y, [1.0, 2.6, 2.0], 50, 14, 20, 0.6); break;
    case 'gmark': F.ring(e.x, e.y, [2.6, 0.4, 1.0], 60, 20, 34, 0.7); F.flare(e.x, e.y, [2.6, 0.5, 1.2], 70, 20, 34, 0.7); break;
    case 'blink': F.sparkle(e.x, e.y, [2.6, 0.6, 1.4], 14, 7); G.gl = Math.max(G.gl, 0.35); break;
    case 'pulse': R.flash = Math.max(R.flash, 0.08 * F.flashK); F.shake(0.25); break;
    case 'beat': F.ring(e.x, e.y, [1.6, 1.0, 2.8], 30, 110, 14, 0.5); break;
    case 'tempo': AU.tempo(e.bpm); U.toast('Темпо ' + e.bpm, '#d9c4ff'); break;
    case 'ringbreak': F.sparkle(e.x, e.y, [2.6, 0.6, 1.4], 60, 14); F.ring(e.x, e.y, [2.6, 0.6, 1.4], 80, 300, 30, 0.8); G.gl = 0.6; break;
    case 'minidie': R.flash = 0.3 * F.flashK; F.boom(e.x, e.y, 3, [2.8, 1.2, 0.6], 0, 0); F.wave(e.x, e.y, 0.08, 14, 70); G.slow = 0.4; G.slowT = 0.8; U.toast(e.t ? e.t + ' падна' : 'Пазачът падна', '#ffc08a'); break;
    case 'refr': F.sparkle(e.x, e.y, [1.8, 1.6, 2.8], 3, 4); break;
    case 'shatter': F.ring(e.x, e.y, [1.6, 1.5, 2.8], 20, 120, 18, 0.7); F.sparkle(e.x, e.y, [1.8, 1.7, 2.8], 22, 9); F.shake(0.15); break;
    case 'mine': F.ring(e.x, e.y, S.C.ebul, 20, 150, 20, 0.8); F.shake(0.2); break;
    case 'charge': F.flare(e.x, e.y - 18, [1.6, 0.9, 2.8], 90, 20, 16, 0.9); break;
    case 'split': R.flash = 0.25 * F.flashK; F.ring(e.x, e.y, [1.8, 1.5, 2.8], 40, 380, 30, 0.9); F.sparkle(e.x, e.y, [1.8, 1.6, 2.8], 50, 12); F.shake(0.6); break;
    case 'roar': F.shake(0.12); break;
    case 'bolt': R.flash = Math.max(R.flash, 0.13 * F.flashK); F.shake(0.3); F.glow(e.x, S.H - 10, [1.6, 1.8, 2.8], 160, 40, 20, 0.8); F.sparkle(e.x, S.H - 20, [1.8, 2.0, 2.8], 14, 9); vib(30); break;
    case 'bossdie': R.flash = 0.18 * F.flashK; G.slow = 0.35; G.slowT = 1.3; F.shake(0.6); break;
    case 'bossboom': R.flash = 0.55 * F.flashK; F.wave(e.x, e.y, 0.1, 16, 90); F.shake(1); R.ca = 0.03; vib(200); break;
  }
}
const vib = ms => { const ua = navigator.userActivation; if (I.mode === 'touch' && navigator.vibrate && (!ua || ua.hasBeenActive)) try { navigator.vibrate(ms); } catch (e) { } };

const IDLE = { ax: 0, ay: 0, fire: false, act: false, bomb: false };
function tick() {
  const W = G.W;
  const inp = G.attract ? S.bot(W) : G.state === 'play' ? I.sample() : IDLE;
  S.step(W, inp);
  for (const e of W.ev) react(W, e);
  W.ev.length = 0;
  if (G.attract) { if (W.end || W.t > 60 * 100) newWorld(true); return; }
  if (G.state !== 'play') return;
  if (W.lv.fog && W.p.alive && W.t % 270 === 90) S.LOOK.flare(W.p.x + 24, W.p.y);
  if (!W.boss && !W.lz.length) AU.intensity(W.foes.some(e => e.d.id === 'venets' || e.d.id === 'nosach') ? 2 : W.foes.length > 3 ? 1.2 : 1);
  if (W.end && W.endT <= 0) { if (W.end === 'over') gameOver(); else cleared(); }
}

// ── цикълът ──
let lastT = 0;
function frame(now) {
  requestAnimationFrame(frame);
  if (G.freeze) { if (G.hold && G.W) render(1, 0); return; }
  let dt = Math.min(0.1, (now - (lastT || now)) / 1000); lastT = now;
  stats(dt);
  if (!G.W) return;
  let ts = 1;
  if (G.slowT > 0) { G.slowT -= dt; ts = G.slowT > 0 ? G.slow : 1; }
  const run = G.state !== 'pause';
  if (run) {
    if (G.stop > 0) G.stop -= dt * 60;
    else { G.acc += dt * ts; let n = 0; while (G.acc >= S.DT && n++ < 6) { G.acc -= S.DT; tick(); } if (n >= 6) G.acc = 0; }
  }
  const k = run ? dt * 60 * ts * (G.stop > 0 ? 0.15 : 1) : 0;
  G.t += run ? dt * ts : 0;
  render(G.stop > 0 ? 1 : G.acc / S.DT, k);
  if (!G.attract && G.state === 'play') U.hud(G.W);
  AU.beam(G.state === 'play' && G.W.p.beams.length > 0, G.W.p.x);
}

function render(a, k) {
  const W = G.W, sh = R.shake;
  let s = G.css.s * G.css.k, vx = G.css.x * G.css.k, vy = G.css.y * G.css.k;
  if (G.zoom) { s *= G.zoom.k; vx = R.w / 2 - G.zoom.x * s; vy = R.h / 2 - G.zoom.y * s; } // за проверки: увеличен изглед
  F.wind = W.wind; F.update(k, W.sspd, G.t); S.LOOK.tick(k); S.BG.wallK = W.wallK;
  G.gl = Math.max(0, (G.gl || 0) - 0.03 * k);
  if (W.lv.glitch && k > 0 && Math.random() < 0.003 * k) G.gl = Math.max(G.gl, 0.25);
  R.glitch = F.flashK < 1 ? G.gl * 0.4 : (W.boss && W.boss.d.id === 'disonans' && W.boss.ph === 3 ? Math.max(G.gl, 0.1) : G.gl);
  R.setView(vx, vy, s); // фонът не се тресе — далечен е
  const bo = S.BG.opts(W.lv.bg);
  R.bgPass(W.lv.bg, G.hold ? 1 : bo.parts || 4, () => S.BG.draw(W.lv.bg, G.t, W.scroll - W.sspd * (1 - a)), bo.scale);
  R.setView(vx + sh[0] * s, vy + sh[1] * s, s);
  R.begin();
  S.LOOK.hitbox = !G.attract && SV.d.hitbox;
  S.LOOK.draw(W, a, G.t, k);
  // ударните вълни: от координати на полето към uv на буфера (y отдолу нагоре)
  R.waves = F.waves.map(w => ({ x: (R.view.x + w.x * s) / R.w, y: 1 - (R.view.y + w.y * s) / R.h, r: w.r * s / R.h, k: w.k }));
  const x0 = vx, y0 = vy, x1 = vx + S.W * s, y1 = vy + S.H * s;
  R.end({ bloom: 1.25, time: G.t, play: [x0, R.h - y1, x1, R.h - y0], dim: 0.5 });
}

// брояч на кадрите (клавиш `) и автоматично качество: при бавни кадри сваля разделителната способност
const fpsEl = document.createElement('div'); fpsEl.id = 'fps'; document.body.appendChild(fpsEl);
let slowS = 0;
function stats(dt) {
  const f = G.fps; f.n++; f.t += dt; f.ms.push(dt * 1000);
  if (f.t >= 1) {
    const ms = f.ms.sort((a, b) => a - b), avg = ms.reduce((a, b) => a + b, 0) / ms.length, p99 = ms[Math.floor(ms.length * 0.99)] || avg;
    f.v = f.n; f.avg = avg; f.p99 = p99;
    if (fpsEl.classList.contains('on')) fpsEl.textContent = `${f.n} fps · ${avg.toFixed(1)} ms · p99 ${p99.toFixed(1)} · ${R.stats.inst} спр. · ${F.count()} част. · ${R.w}×${R.h}${R.hdr ? ' HDR' : ''} · качество ${G.qi}`;
    // авто: три поредни бавни секунди (под ~50 кадъра) → едно стъпало надолу; нагоре не се връща (без люлеене)
    if (SV.d.quality === 'auto' && !document.hidden && !G.freeze && avg > 20 && G.qi < QL.length - 1 && G.state !== 'pause') { if (++slowS >= 3) { G.qi++; slowS = 0; layout(); } } else slowS = 0;
    f.n = 0; f.t = 0; f.ms = [];
  }
}

// ── менюта, екрани, клавиши ──
const $ = id => document.getElementById(id);
const setState = st => { G.state = st; document.body.classList.toggle('playing', st === 'play'); };
const exists = n => !!S.LEVELS[n];
const contLevel = () => { let n = Math.min(SV.d.unlocked, 6); while (n > 1 && !exists(n)) n--; return n; };
function menuMusic() { if (AU.ok) AU.play('menu', 0); }
function go(id, ret, focusSel) { if (ret) G.ret = ret; U.screen(id, focusSel); }

function toTitle() {
  AU.beam(false); setState('menu'); if (!G.attract) newWorld(true); U.hudOn(false);
  U.title(SV.d, contLevel()); go('title'); AU.suspend(false); menuMusic();
}
function brief(n, ret) {
  level = n; const lv = S.LEVELS[n];
  $('brief').dataset.ret = ret || 'title';
  U.brief(lv, S.DIFF[SV.d.diff].name); go('brief');
}
function start(from) {
  AU.init(); AU.setMusic(SV.d.music); AU.setVol(SV.d.vm, SV.d.vs);
  newWorld(false, from); setState('play'); G.acc = 0; U.screen(null); U.hudOn(true); I.clear(); lastT = 0;
  AU.play(G.W.lv.music, 1);
}
function pause(on) {
  if (on && G.state === 'play') { setState('pause'); go('pause'); AU.beam(false); AU.suspend(true); }
  else if (!on && G.state === 'pause') { setState('play'); U.screen(null); AU.suspend(false); I.clear(); lastT = 0; }
}
function bank(W) { SV.d.crystals += W.crystals; SV.d.runs++; }
function gameOver() {
  const W = G.W; setState('over'); AU.beam(false); bank(W); SV.save();
  U.over(W, !!W.cp); go('over'); U.hudOn(false); menuMusic();
}
function cleared() {
  const W = G.W, res = S.results(W, true), key = SV.key(level, SV.d.diff), d = SV.d;
  const newBest = res.total > (d.best[key] || 0);
  if (newBest) d.best[key] = res.total;
  d.medals[key] = Math.max(d.medals[key] || 0, res.medal);
  d.unlocked = Math.max(d.unlocked, level + 1);
  bank(W); SV.save();
  setState('results'); AU.beam(false); U.hudOn(false); go('results');
  if (level === 6) { d.won = true; SV.save(); }
  U.results(W, res, newBest, m => AU.ev({ k: 'medal', m }), level === 6);
  menuMusic();
}
function ending() {
  setState('menu'); U.ending(SV.d); go('ending'); menuMusic();
}
function hangar(next) {
  G.next = next || contLevel();
  const ok = exists(G.next);
  U.hangar(SV.d, ok ? 'Към ниво ' + G.next + ' →' : 'Всички нива са минати', ok);
  go('hangar', null, G.hfocus); G.hfocus = null; U.shipView(SV.d);
}

U.onAct = function (a, el, viaKey) {
  if (a !== 'back' && el) AU.ev({ k: 'ui' });
  switch (a) {
    case 'continue': if (SV.d.won) { U.levels(SV.d, SV); go('levels', null, '.card:not(.locked)'); } else brief(contLevel(), 'title'); break;
    case 'levels': U.levels(SV.d, SV); go('levels', null, '.card:not(.locked)'); break;
    case 'level': { const n = +el.dataset.n; if (exists(n) && n <= SV.d.unlocked) brief(n, 'levels'); else { U.no(el); AU.ev({ k: 'deny' }); } break; }
    case 'diff': SV.set('diff', +el.dataset.v); U.levels(SV.d, SV); U.screen('levels', `#diffSeg [data-v="${SV.d.diff}"]`); break;
    case 'go': start(); break;
    case 'hangar': hangar(G.state === 'results' ? level + 1 : null); break;
    case 'settings': G.setRet = U.cur ? U.cur.id : 'title'; U.resetArm = false; U.settings(SV.d); go('settings'); break;
    case 'howto': G.helpRet = U.cur ? U.cur.id : 'title'; go('howto'); break;
    case 'resume': pause(false); break;
    case 'restart': start(); break;
    case 'cont': start(G.W.cp); break;
    case 'quit': toTitle(); break;
    case 'next': if (exists(G.next)) brief(G.next, 'hangar'); break;
    case 'buy': buy(el); break;
    case 'weapon': weapon(el); break;
    case 'title': toTitle(); break;
    case 'ending': ending(); break;
    case 'brief': brief(level, 'title'); break;
    case 'levelsBack': U.levels(SV.d, SV); go('levels'); break;
    case 'back': {
      const id = U.cur && U.cur.id;
      if (id === 'settings' || id === 'howto') { const r = id === 'settings' ? G.setRet : G.helpRet; if (r === 'pause') go('pause', null, '[data-act="settings"]'); else if (r === 'title' || !r) { U.title(SV.d, contLevel()); go('title'); } else go(r); }
      else if (id === 'brief') { const r = $('brief').dataset.ret; if (r === 'levels') { U.levels(SV.d, SV); go('levels', null, `.card[data-n="${level}"]`); } else if (r === 'hangar') hangar(G.next); else toTitle(); }
      else toTitle();
      break;
    }
  }
};
function buy(el) {
  const h = S.HANGAR.find(x => x.id === el.dataset.id), lv = SV.d.hangar[h.id] || 0;
  if (lv >= h.max || SV.d.crystals < h.cost[lv]) { U.no(el); AU.ev({ k: 'deny' }); return; }
  SV.d.crystals -= h.cost[lv]; SV.d.hangar[h.id] = lv + 1; SV.save(); AU.ev({ k: 'buy' });
  const sel = `[data-id="${h.id}"]`; G.hfocus = sel; hangar(G.next); U.bought(document.querySelector(sel)); U.bankGain();
}
function weapon(el) {
  const w = el.dataset.w;
  if (!SV.d.weapons[w]) {
    if (SV.d.crystals < S.WEAPON_COST[w]) { U.no(el); AU.ev({ k: 'deny' }); return; }
    SV.d.crystals -= S.WEAPON_COST[w]; SV.d.weapons[w] = true; AU.ev({ k: 'buy' });
  }
  SV.d.weapon = w; SV.save(); G.hfocus = `[data-w="${w}"]`; hangar(G.next);
}
// настройки: dir = ±1 (стрелки) или 1 (Enter/клик — напред с превъртане)
U.onSet = function (k, dir) {
  const d = SV.d, o = U.SET.find(x => x.k === k);
  if (o.vol) { let v = Math.round(d[k] * 10) + dir; if (v > 10) v = 0; if (v < 0) v = 0; d[k] = v / 10; AU.setVol(d.vm, d.vs); if (k === 'vs') AU.ev({ k: 'note', i: 3 }); }
  else if (k === 'full') { fullscreen(); setTimeout(() => U.setRow('full', d), 300); return; }
  else if (k === 'reset') { if (U.resetArm) { SV.reset(); U.resetArm = false; U.settings(SV.d); U.screen('settings', '[data-k="reset"]'); applySettings(); return; } U.resetArm = true; }
  else { const i = o.opts.findIndex(x => x[0] === d[k]), n = o.opts.length; d[k] = o.opts[((i < 0 ? 0 : i) + dir + n) % n][0]; }
  SV.save(); applySettings(); U.setRow(k, d); AU.ev({ k: 'ui' });
};
// стълбата на качеството: d — дял от плътността на пикселите, b — дял от разделителната способност на сиянието
const QL = [{ d: 1, b: 1 }, { d: 1, b: 0.6 }, { d: 0.8, b: 0.6 }, { d: 0.65, b: 0.5 }], QI = { high: 0, med: 2, low: 3 };
function applySettings() {
  const d = SV.d; F.shakeK = d.shake; F.flashK = d.flash; AU.music = d.music;
  if (d.quality !== G.ql) { G.qi = QI[d.quality] || 0; G.ql = d.quality; layout(); }
}
U.onType = () => AU.ev({ k: 'type' });
I.onKey = function (a) {
  if (!AU.ok) { AU.init(); AU.setVol(SV.d.vm, SV.d.vs); AU.setMusic(SV.d.music); if (G.state === 'menu') menuMusic(); }
  if (a === 'full') { fullscreen(); return; }
  if (a === 'stats') { fpsEl.classList.toggle('on'); return; }
  if (a === 'music') { SV.set('music', !SV.d.music); AU.setMusic(SV.d.music); U.toast(SV.d.music ? 'Музика: вкл.' : 'Музика: изкл.'); return; }
  if (G.state === 'play') { if (a === 'pause') pause(true); return; }
  if (G.state === 'pause' && a === 'pause' && U.cur && U.cur.id === 'pause') { pause(false); return; }
  if (U.cur && U.cur.id === 'brief' && (a === 'ok' || a === 'fire') && U.briefSkip()) return;
  U.navKey(a);
};
function fullscreen() {
  const d = document;
  const ok = r => { if (r && r.catch) r.catch(() => {}); }; // браузърът може да откаже (без жест, iPhone) — не е грешка
  try { if (d.fullscreenElement || d.webkitFullscreenElement) ok((d.exitFullscreen || d.webkitExitFullscreen).call(d)); else { const e = d.documentElement, f = e.requestFullscreen || e.webkitRequestFullscreen; if (f) ok(f.call(e, { navigationUI: 'hide' })); } } catch (e) { }
}
document.addEventListener('visibilitychange', () => { if (G.freeze) return; if (document.hidden) { pause(true); AU.suspend(true); } else if (G.state !== 'pause') AU.suspend(false); });

// ── старт ──
function boot() {
  SV.load(); AU.music = SV.d.music;
  if (!R.init(cv)) { U.init(); U.screen('nogl'); return; }
  S.R.setAtlas(S.ART.build()); F.init(); S.BG.init(); U.init();
  G.ql = SV.d.quality; G.qi = QI[SV.d.quality] || 0; applySettings();
  I.bindTouch(document, () => G.css.s, () => G.state === 'play');
  I.touchBtn($('tAct'), 'act'); I.touchBtn($('tBomb'), 'bomb');
  $('tPause').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); pause(true); });
  layout(); toTitle(); shot();
  // първото докосване/клик: звукът тръгва (изискване на браузърите); на телефон — и цял екран (Android)
  addEventListener('pointerdown', e => {
    if (!AU.ok) { AU.init(); AU.setVol(SV.d.vm, SV.d.vs); AU.setMusic(SV.d.music); if (G.state === 'menu') menuMusic(); }
    if (e.pointerType === 'touch' && !document.fullscreenElement && matchMedia('(pointer:coarse)').matches) fullscreen();
  }, { once: true });
  // iOS: звукът понякога се отключва само при touchend
  addEventListener('touchend', () => { AU.init(); if (G.state === 'menu') menuMusic(); }, { once: true, passive: true });
  requestAnimationFrame(frame);
  G.bootMs = Math.round(performance.now());
}
const fontsReady = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]) : Promise.resolve();
fontsReady.then(boot);
window.__space = G;
// за проверки от конзолата: n такта логика с рисуване на всеки (и при скрит раздел)
G.adv = function (n, quick) { for (let i = 0; i < n; i++) { tick(); G.t += S.DT; if (!quick || i >= n - 40) render(1, 1); else { F.update(1, G.W.sspd, G.t); S.LOOK.tick(1); } } return { t: G.W.t, foes: G.W.foes.length, eb: G.W.eb.length, fx: F.count() }; };
// снимки без ръце: index.html#t=900 (фон на началния екран) или #t=900&hud (игра с автопилот и HUD) — после спира
function shot() {
  const m = location.hash.match(/t=(\d+)/); if (!m) return;
  G.freeze = G.hold = true;
  const sc = location.hash.match(/scr=(\w+)/), sd = location.hash.match(/seed=(\d+)/);
  if (sd) G.seed = +sd[1];
  const lm = location.hash.match(/lvl=(\d+)/); if (lm) level = +lm[1];
  if (/hud/.test(location.hash)) { start(); AU.stop(); AU.suspend(true); I.sample = () => S.bot(G.W); } else if (!sc) U.screen(null);
  G.adv(+m[1], true); U.hud(G.W);
  if (sc) U.onAct(sc[1], document.querySelector(`[data-act="${sc[1]}"]`));
}
G.start = start;
})();
