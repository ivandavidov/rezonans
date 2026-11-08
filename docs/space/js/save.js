// Записите: един ключ в localStorage, JSON с версия. Всичко е в try/catch — играта върви и без запис
// (частен прозорец, забранено хранилище). Ключът е свой — сайтът е общ с „Резонанс“.
(function () {
'use strict';
const S = window.SPACE;
const KEY = 'rezonans-space.v1';
// „по-малко движение“ в системата → по подразбиране намален трус и намалени светкавици
const RM = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();
const DEF = () => ({
  v: 1, diff: 1, music: true, vm: 0.8, vs: 0.9, shake: RM ? 0.5 : 1, flash: RM ? 0.4 : 1, hitbox: true, quality: 'auto',
  unlocked: 1, best: {}, medals: {}, crystals: 0, hangar: {}, weapons: { pulse: true }, weapon: 'pulse', runs: 0, seenHelp: false,
});
const SV = S.SAVE = { d: DEF() };
SV.load = function () {
  try { const j = JSON.parse(localStorage.getItem(KEY) || 'null'); if (j && j.v === 1) SV.d = Object.assign(DEF(), j); } catch (e) { /* без запис */ }
  return SV.d;
};
SV.save = function () { try { localStorage.setItem(KEY, JSON.stringify(SV.d)); } catch (e) { /* без запис */ } };
SV.set = (k, v) => { SV.d[k] = v; SV.save(); };
SV.key = (lv, diff) => lv + '.' + diff;
// най-добрият медал за нивото при каквато и да е трудност
SV.medal = lv => Math.max(0, ...[0, 1, 2].map(d => SV.d.medals[SV.key(lv, d)] || 0));
SV.bestScore = lv => Math.max(0, ...[0, 1, 2].map(d => SV.d.best[SV.key(lv, d)] || 0));
SV.reset = () => { const keep = { diff: SV.d.diff, music: SV.d.music, vm: SV.d.vm, vs: SV.d.vs, shake: SV.d.shake, flash: SV.d.flash, hitbox: SV.d.hitbox, quality: SV.d.quality }; SV.d = Object.assign(DEF(), keep); SV.save(); };
})();
