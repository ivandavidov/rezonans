// Интерфейсът: HUD (обновява се само при промяна), надписи, екрани и менюта.
// Навигация: клавишите местят фокуса по посоката на екрана (най-близкият елемент натам), мишката и пръстът — директно.
(function () {
'use strict';
const S = window.SPACE, M = S.M;
const U = S.UI = { cur: null, sel: null, onAct: null, onSet: null, onType: null };
const $ = id => document.getElementById(id);
const fmt = n => String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const WCOL = { pulse: '#8fd4ff', fan: '#7dffa8', beam: '#d49aff', wave: '#ffc56b' };
let H = {}, last = {};

U.init = function () {
  H = { hud: $('hud'), hull: $('hHull'), lives: $('hLives'), score: $('hScore'), mult: $('hMult'), wpn: $('hWpn'), cry: $('hCry'), scale: $('hScale'), banner: $('banner'), arc: $('tBombArc'), act: $('tAct'), bomb: $('tBomb'), boss: $('hBoss'), toast: $('toast') };
  H.scale.innerHTML = S.SCALE.map((s, i) => `<div class="slot" data-i="${i}"><span class="nm">${s.name}</span><span class="pp">${'<i></i>'.repeat(s.id === 'res' ? 0 : s.max)}</span></div>`).join('') +
    '<div class="res"><div class="bar"><i></i></div><span class="lb">Удар <kbd>C</kbd></span></div><div class="hint"><kbd>X</kbd> вземи</div>';
  H.slots = [...H.scale.querySelectorAll('.slot')];
  H.res = H.scale.querySelector('.res'); H.resBar = H.res.querySelector('i'); H.hint = H.scale.querySelector('.hint');
  H.bossNm = H.boss.querySelector('.nm'); H.bossI = H.boss.querySelector('i'); H.bossB = H.boss.querySelector('b');
  // делегиране: мишката фокусира, кликът/допирът действа
  document.addEventListener('mouseover', e => { const b = e.target.closest && e.target.closest('.screen:not(.off) .nav'); if (b && b !== U.sel) focus(b); });
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.screen:not(.off) .nav'); if (!b || b.disabled) return;
    focus(b); act(b, 1);
  });
};

function navs() { return U.cur ? [...U.cur.querySelectorAll('.nav')].filter(b => !b.disabled && b.offsetParent) : []; }
function focus(b) {
  if (!b) return;
  if (U.sel && U.sel !== b) U.sel.classList.remove('sel');
  b.classList.add('sel'); U.sel = b;
  try { b.focus({ preventScroll: true }); } catch (e) { b.focus(); }
  b.scrollIntoView && b.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  if (U.onFocus) U.onFocus(b);
}
function act(b, dir) {
  if (b.dataset.k) { if (U.onSet) U.onSet(b.dataset.k, dir, b); return; }
  if (U.onAct) U.onAct(b.dataset.act, b);
}
// пространствена навигация: най-близкият елемент в посоката (основно разстояние + 2,5 × отклонение встрани)
function move(dir) {
  const L = navs(); if (!L.length) return;
  const cur = U.sel && L.includes(U.sel) ? U.sel : null;
  if (!cur) { focus(L[0]); return; }
  const r0 = cur.getBoundingClientRect(), x0 = r0.left + r0.width / 2, y0 = r0.top + r0.height / 2;
  let best = null, bs = 1e9;
  for (const b of L) {
    if (b === cur) continue;
    const r = b.getBoundingClientRect(), dx = r.left + r.width / 2 - x0, dy = r.top + r.height / 2 - y0;
    let main, side;
    if (dir === 'r') { main = dx; side = dy; } else if (dir === 'l') { main = -dx; side = dy; } else if (dir === 'd') { main = dy; side = dx; } else { main = -dy; side = dx; }
    if (main < 6) continue;
    const sc = main + Math.abs(side) * 2.5;
    if (sc < bs) { bs = sc; best = b; }
  }
  if (best) focus(best);
}
// клавиш в меню: true, ако е поет
U.navKey = function (a) {
  if (!U.cur) return false;
  if (a === 'pause') { const bk = U.cur.dataset.back; if (bk && U.onAct) U.onAct(bk === 'back' ? 'back' : bk, null, true); return true; }
  const s = U.sel;
  if ((a === 'l' || a === 'r') && s && s.dataset.k && navs().includes(s)) { if (U.onSet) U.onSet(s.dataset.k, a === 'r' ? 1 : -1, s); return true; }
  if (a === 'u' || a === 'd' || a === 'l' || a === 'r') { move(a); return true; }
  if (a === 'ok' || a === 'fire') { if (s && navs().includes(s)) act(s, 1); return true; }
  return false;
};
U.screen = function (id, focusSel) {
  for (const s of document.querySelectorAll('.screen')) s.classList.toggle('off', s.id !== id);
  U.cur = id ? $(id) : null; if (U.sel) U.sel.classList.remove('sel'); U.sel = null;
  if (U.cur) { const L = navs(); focus((focusSel && U.cur.querySelector(focusSel)) || U.cur.querySelector('.nav.primary:not([disabled])') || L[0]); U.cur.scrollTop = 0; }
};
U.hudOn = on => H.hud.classList.toggle('off', !on);

let bT = 0;
U.banner = function (t, s, warn) {
  const b = H.banner; b.querySelector('b').textContent = t; b.querySelector('span').textContent = s || '';
  b.classList.toggle('warn', !!warn);
  b.classList.remove('on'); void b.offsetWidth; b.classList.add('on');
  clearTimeout(bT); bT = setTimeout(() => b.classList.remove('on'), 3200);
};
U.toast = function (t, col) { const el = H.toast; el.textContent = t; el.style.color = col || '#bff8ff'; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); };
U.wcol = w => WCOL[w];
U.pulse = function (i, cls) { const el = H.slots[i]; if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

function set(k, v, fn) { if (last[k] !== v) { last[k] = v; fn(v); } }
U.reset = () => { last = {}; };
U.hud = function (W) {
  const p = W.p;
  set('hull', p.hull + '/' + p.hullMax + '/' + p.shield, () => {
    let h = ''; for (let i = 0; i < p.hullMax; i++) h += `<i class="${i < p.hull ? 'on' : ''}"></i>`;
    for (let i = 0; i < p.shield; i++) h += '<i class="sh"></i>';
    H.hull.innerHTML = h;
  });
  set('lives', Math.max(0, p.lives), v => { H.lives.innerHTML = v > 4 ? '<i></i>×' + v : '<i></i>'.repeat(v); });
  set('score', W.score, v => { H.score.textContent = fmt(v); });
  set('mult', W.mult, v => { H.mult.textContent = v > 1 ? '×' + v : ''; H.mult.classList.toggle('on', v > 1); });
  set('wpn', p.weapon + p.pow, () => { H.wpn.innerHTML = `<b style="color:${WCOL[p.weapon]}">${S.WEAPONS[p.weapon].name}</b><span class="pp">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= p.pow ? 'on' : ''}"></i>`).join('')}</span>`; });
  set('cry', W.crystals, v => { H.cry.innerHTML = '<i></i>' + fmt(v); });
  set('scale', p.cursor + ':' + S.SCALE.map(s => s.lv(p)).join(','), () => {
    S.SCALE.forEach((s, i) => {
      const el = H.slots[i], lv = s.lv(p);
      el.classList.toggle('cur', i === p.cursor); el.classList.toggle('full', lv >= s.max);
      [...el.querySelectorAll('.pp i')].forEach((x, j) => x.classList.toggle('on', j < lv));
    });
    H.hint.classList.toggle('on', p.cursor >= 0);
    H.act.classList.toggle('ready', p.cursor >= 0);
  });
  const c = Math.round(p.charge * 100);
  set('charge', c, v => { H.resBar.style.width = v + '%'; H.res.classList.toggle('full', v >= 100); H.bomb.classList.toggle('ready', v >= 100); H.arc.style.strokeDashoffset = String(276.5 * (1 - v / 100)); });
  const b = S.bossHP(W), bk = b ? Math.round(b[0] / b[1] * 400) : -1;
  set('boss', bk, v => {
    H.boss.classList.toggle('on', v >= 0 && !!W.boss && !W.dying);
    if (v < 0) return;
    H.bossNm.textContent = b[2]; H.bossI.style.width = (v / 4) + '%'; H.bossB.style.width = (v / 4) + '%';
  });
  set('bossOff', !!W.dying, v => { if (v) H.boss.classList.remove('on'); });
};

// ── екраните ──
const TINT = ['rgba(60,190,230,.4)', 'rgba(220,80,220,.4)', 'rgba(255,160,60,.4)', 'rgba(80,220,150,.4)', 'rgba(200,220,255,.45)', 'rgba(255,60,70,.45)'];
U.title = function (sv, next) {
  $('contTxt').textContent = sv.won ? 'Избери ниво' : sv.runs ? 'Продължи · ниво ' + next : 'Играй';
  $('titleCry').innerHTML = sv.crystals ? `· <span class="cicon"></span> ${fmt(sv.crystals)}` : '';
};
U.levels = function (sv, SV) {
  for (const b of $('diffSeg').children) b.classList.toggle('on', +b.dataset.v === sv.diff);
  $('levelCards').innerHTML = S.LEVEL_INFO.map((L, i) => {
    const ready = !!S.LEVELS[L.n], open = ready && L.n <= sv.unlocked, md = SV.medal(L.n), best = SV.bestScore(L.n);
    const sub = !ready ? 'скоро' : !open ? 'отключва се след предишното' : best ? 'рекорд ' + fmt(best) : 'още не е играно';
    return `<button class="nav card${open ? '' : ' locked'}" data-act="level" data-n="${L.n}" style="--tint:${TINT[i]}"${open ? '' : ' aria-disabled="true"'}>
      <span class="no">${L.n}</span><h4>${esc(L.name)}</h4><small>${open ? 'Пазач: ' + esc(L.boss) : '&nbsp;'}</small>
      <div class="row"><span class="md m${md}"></span><span>${sub}</span></div></button>`;
  }).join('');
};

let typer = 0, full = '';
U.brief = function (lv, diffName) {
  $('briefNo').textContent = 'Ниво ' + lv.n + ' от 6'; $('briefName').textContent = lv.name;
  $('briefBoss').textContent = (S.LEVEL_INFO[lv.n - 1] || {}).boss || ''; $('briefDiff').textContent = diffName;
  const el = $('briefText'), box = el.closest('.brief'); full = lv.brief || ''; el.textContent = ''; box.classList.remove('done');
  clearInterval(typer); let i = 0;
  typer = setInterval(() => {
    i += 1; el.textContent = full.slice(0, i);
    if (U.onType && i % 3 === 0 && full[i - 1] !== ' ') U.onType();
    if (i >= full.length) { clearInterval(typer); typer = 0; box.classList.add('done'); }
  }, 26);
};
U.briefSkip = function () { if (!typer) return false; clearInterval(typer); typer = 0; $('briefText').textContent = full; $('briefText').closest('.brief').classList.add('done'); return true; };

U.over = function (W, canCont) {
  $('overTitle').textContent = 'Край на играта';
  const acc = W.shots ? Math.round(W.hits / W.shots * 100) : 0;
  $('overStats').innerHTML = [['Точки', fmt(W.score)], ['Унищожени', W.killsF + ' / ' + W.spawnedF], ['Точност', acc + ' %'], ['Кристали', '+' + fmt(W.crystals)], ['Ноти', W.notes], ['Време', clock(W.t)]]
    .map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('');
  const cb = $('contBtn'); cb.disabled = !canCont; cb.style.display = canCont ? '' : 'none'; cb.classList.toggle('primary', canCont);
  cb.nextElementSibling.classList.toggle('primary', !canCont);
};
const clock = t => { const s = Math.round(t / 60); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

let anim = 0;
U.results = function (W, res, newBest, onMedal, final) {
  const pb = $('results').querySelector('.menu .primary'); pb.dataset.act = final ? 'ending' : 'hangar'; pb.textContent = final ? 'Финал' : 'Хангар';
  $('resTitle').textContent = W.lv.clearText || 'Секторът е чист';
  const md = $('resMedal'); md.className = 'medal'; md.querySelector('span').textContent = '';
  $('resStats').innerHTML = [['Точки', W.score], ['Унищожени', Math.round(res.kp * 100), ' %'], ['Точност', Math.round(res.acc * 100), ' %'], ['Кристали', W.crystals, '', '+'], ['Най-дълга верига', W.maxChain], ['Време', null, clock(W.t)]]
    .map(([k, v, suf, pre]) => `<div><span>${k}</span><b data-v="${v == null ? '' : v}" data-s="${suf || ''}" data-p="${pre || ''}">${v == null ? suf : (pre || '') + '0' + (suf || '')}</b></div>`).join('');
  $('resBonus').innerHTML = res.list.map(([k, v]) => `<div><span>${esc(k)}</span><b>+${fmt(v)}</b></div>`).join('');
  $('resTotal').textContent = fmt(W.score); $('resBest').textContent = '';
  cancelAnimationFrame(anim);
  const t0 = performance.now(), nums = [...$('resStats').querySelectorAll('b[data-v]')].filter(b => b.dataset.v !== ''), bon = [...$('resBonus').children];
  const step = now => {
    const q = M.sat((now - t0) / 1100), e = M.easeOut(q);
    for (const b of nums) b.textContent = b.dataset.p + fmt(+b.dataset.v * e) + b.dataset.s;
    bon.forEach((d, i) => { if (now - t0 > 1200 + i * 320) d.classList.add('on'); });
    const tq = M.sat((now - t0 - 1200 - bon.length * 320) / 900);
    $('resTotal').textContent = fmt(W.score + res.bonus * M.easeOut(tq));
    if (tq >= 1) {
      if (!md.classList.contains('pop') && res.medal) { md.className = 'medal pop m' + res.medal; md.querySelector('span').textContent = S.MEDALS[res.medal]; if (onMedal) onMedal(res.medal); }
      if (newBest) $('resBest').textContent = 'нов рекорд';
      return;
    }
    anim = requestAnimationFrame(step);
  };
  anim = requestAnimationFrame(step);
};

// хангар: подобрения, начално оръжие, преглед на кораба
U.hangar = function (sv, nextTxt, nextOk) {
  $('bank').textContent = fmt(sv.crystals);
  $('ups').innerHTML = S.HANGAR.map(h => {
    const lv = sv.hangar[h.id] || 0, max = lv >= h.max, cost = max ? 0 : h.cost[lv];
    return `<button class="nav up${max ? ' max' : sv.crystals < cost ? ' poor' : ''}" data-act="buy" data-id="${h.id}">
      <h5>${esc(h.name)} <span class="pp">${Array.from({ length: h.max }, (_, i) => `<i class="${i < lv ? 'on' : ''}"></i>`).join('')}</span></h5>
      <small>${esc(h.desc)}</small><span class="cost">${max ? 'макс' : '<span class="cicon"></span>' + fmt(cost)}</span></button>`;
  }).join('');
  $('wSel').innerHTML = S.WORDER.map(w => {
    const own = !!sv.weapons[w], on = sv.weapon === w;
    return `<button class="nav${on ? ' on' : ''}${own ? '' : ' locked'}" data-act="weapon" data-w="${w}" style="color:${WCOL[w]}"><i></i>${S.WEAPONS[w].name}<small>${own ? (on ? 'избрано' : 'избери') : '<span class="cicon"></span>' + S.WEAPON_COST[w]}</small></button>`;
  }).join('');
  const nb = $('nextBtn'); nb.textContent = nextTxt; nb.disabled = !nextOk;
};
U.bankGain = () => { const b = $('bank').parentNode; b.classList.remove('gain'); void b.offsetWidth; b.classList.add('gain'); };
U.no = el => { if (!el) return; el.classList.remove('no2'); void el.offsetWidth; el.classList.add('no2'); };
U.bought = el => { if (!el) return; el.classList.remove('bought'); void el.offsetWidth; el.classList.add('bought'); };

// преглед на кораба в хангара — от атласа, с оцветено сияние
let shipT = 0, tintC = null;
function tinted(sp, col) {
  const A = S.ART.canvas, w = Math.round((sp.u1 - sp.u0) * A.width), h = Math.round((sp.v1 - sp.v0) * A.height);
  if (!tintC) tintC = document.createElement('canvas');
  tintC.width = w; tintC.height = h; const c = tintC.getContext('2d');
  c.globalCompositeOperation = 'source-over'; c.drawImage(A, sp.u0 * A.width, sp.v0 * A.height, w, h, 0, 0, w, h);
  c.globalCompositeOperation = 'source-in'; c.fillStyle = col; c.fillRect(0, 0, w, h);
  return tintC;
}
function blit(c, src, sp, x, y, s, comp, sx, sy, sw, sh) {
  const w = sp.w * s, h = sp.h * s; c.globalCompositeOperation = comp || 'source-over';
  if (sx == null) c.drawImage(src, x - w / 2, y - h / 2, w, h); else c.drawImage(src, sx, sy, sw, sh, x - w / 2, y - h / 2, w, h);
}
U.shipView = function (sv) {
  cancelAnimationFrame(shipT);
  const cv = $('shipCv'), c = cv.getContext('2d'), A = S.ART, sp = A.spr, AC = A.canvas;
  const at = s => [s.u0 * AC.width, s.v0 * AC.height, (s.u1 - s.u0) * AC.width, (s.v1 - s.v0) * AC.height];
  const draw = now => {
    if (!U.cur || U.cur.id !== 'hangar') return;
    const t = now / 1000, W = cv.width, Hh = cv.height, x = W / 2 - 10, y = Hh / 2 + Math.sin(t * 1.6) * 6, s = 2.6, col = WCOL[sv.weapon];
    c.clearRect(0, 0, W, Hh);
    c.globalAlpha = 0.9; blit(c, tinted(sp.flame, '#7fe6ff'), sp.flame, x - 76 * s / 2.6, y, s * (0.9 + Math.sin(t * 30) * 0.06), 'lighter'); c.globalAlpha = 1;
    blit(c, AC, sp.ship, x, y, s, 'source-over', ...at(sp.ship));
    const g = tinted(sp.shipG, '#6ff0ff'); blit(c, g, sp.shipG, x, y, s, 'lighter'); blit(c, g, sp.shipG, x, y, s, 'lighter');
    c.globalAlpha = 0.85 + Math.sin(t * 5) * 0.15; blit(c, tinted(sp.glow, col), sp.glow, x + 30 * s, y, 0.5, 'lighter'); c.globalAlpha = 1;
    if ((sv.hangar.echo || 0) > 0) { const ex = x - 70, ey = y + 46 + Math.sin(t * 1.6 - 0.6) * 6; blit(c, AC, sp.echo, ex, ey, 2, 'source-over', ...at(sp.echo)); blit(c, tinted(sp.echoG, '#6ff0ff'), sp.echoG, ex, ey, 2, 'lighter'); }
    c.globalCompositeOperation = 'source-over';
    shipT = requestAnimationFrame(draw);
  };
  shipT = requestAnimationFrame(draw);
  $('wDesc').textContent = S.WEAPONS[sv.weapon].name + ' — ' + S.WEAPON_DESC[sv.weapon];
};

// настройки
const SET = [
  { k: 'vm', name: 'Музика', vol: true }, { k: 'vs', name: 'Ефекти', vol: true },
  { k: 'shake', name: 'Трус на екрана', opts: [[1, 'пълен'], [0.5, 'намален'], [0, 'изключен']] },
  { k: 'flash', name: 'Светкавици', opts: [[1, 'нормални'], [0.4, 'намалени']] },
  { k: 'hitbox', name: 'Видима точка на удара', opts: [[true, 'да'], [false, 'не']] },
  { k: 'quality', name: 'Качество на картината', opts: [['auto', 'авто'], ['high', 'високо'], ['med', 'средно'], ['low', 'ниско']] },
  { k: 'diff', name: 'Трудност', opts: [[0, 'лесно'], [1, 'нормално'], [2, 'трудно']] },
  { k: 'full', name: 'Цял екран', btn: () => document.fullscreenElement ? 'вкл.' : 'изкл.' },
  { k: 'reset', name: 'Изтрий напредъка', btn: () => U.resetArm ? 'натисни още веднъж' : 'нива, хангар, рекорди', danger: true },
];
U.SET = SET;
U.settings = function (sv) {
  $('setList').innerHTML = SET.map(o => `<button class="nav setrow${o.danger ? ' danger' : ''}" data-k="${o.k}"><span>${o.name}</span><span class="v">${val(o, sv)}</span></button>`).join('');
};
function val(o, sv) {
  if (o.vol) { const n = Math.round(sv[o.k] * 10); return `<span class="vol">${Array.from({ length: 10 }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</span>`; }
  if (o.btn) return o.btn();
  const f = o.opts.find(x => x[0] === sv[o.k]); return f ? f[1] : o.opts[0][1];
}
U.setRow = function (k, sv) { const el = $('setList').querySelector(`[data-k="${k}"] .v`), o = SET.find(x => x.k === k); if (el && o) el.innerHTML = val(o, sv); };
// финалът: текстът се изписва, после надписите се появяват един по един
U.ending = function (sv) {
  const el = $('endText'), txt = 'Ядрото е унищожено и ордата спря. Една по една угасналите звезди отново светват. На станция „Резонанс“ вече се чува само спокойният шум на космоса.';
  el.textContent = ''; clearInterval(typer); let i = 0;
  typer = setInterval(() => { el.textContent = txt.slice(0, ++i); if (U.onType && i % 3 === 0) U.onType(); if (i >= txt.length) { clearInterval(typer); typer = 0; } }, 30);
  const rows = [...$('credits').children]; rows.forEach(r => r.classList.remove('on'));
  rows.forEach((r, k) => setTimeout(() => r.classList.add('on'), 4800 + k * 450));
  let tot = 0, med = 0; for (const L of S.LEVEL_INFO) { tot += S.SAVE.bestScore(L.n); med += S.SAVE.medal(L.n) === 3 ? 1 : 0; }
  $('endStats').innerHTML = [['Сбор от рекордите', fmt(tot)], ['Златни медали', med + ' от 6'], ['Кристали', fmt(sv.crystals)]].map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('');
};
U.fmt = fmt;
})();
