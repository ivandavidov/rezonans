/* Договорите, които играта трябва да спазва след всяка промяна (node tools/run.js <сборка> storage | cheats):
   storage — какво чете и пише в localStorage (записите на играчите); cheats — отключването, действието на чийтовете и че с
   тях нищо не се записва. Всеки случай пуска играта в чист контекст (с даден localStorage) и сравнява с очакваното. */
'use strict';
module.exports = ({ boot }) => {
  const press = (rz, k, t) => { rz.pressed[k] = true; rz.keys[k] = true; rz.frame(t); rz.keys[k] = false; };
  const frames = (rz, n, keys = {}) => { for (const k in keys) rz.keys[k] = keys[k]; for (let i = 0; i < n; i++) rz.frame(frames.t += 1000 / 60); for (const k in keys) rz.keys[k] = false; };
  frames.t = 1000;
  const SV7 = JSON.stringify({ k: 7, seed: 12345, score: 900, w: ['wrench', 'pistol', 'shotgun'], a: { pistol: [17, 40], shotgun: [8, 10] }, ar: 30, hp: 80, cur: 'shotgun' });

  /* ---------- записите ---------- */
  const STORAGE = [
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

  /* ---------- чийтовете ---------- */
  const CHEATS = [
    { име: 'думата kokoloko отключва реда в менюто', f: (rz, ls, env) => { const n = rz.menuItems().length;
        for (const c of 'kokoloko') env.fire('keydown', { code: 'Key' + c.toUpperCase(), repeat: false, preventDefault() {} });
        return { open: rz.CHT.open, state: rz.state, ред: rz.menuItems()[rz.gSel].t, нови: rz.menuItems().length - n }; },
      очаквано: { open: true, state: 'gmenu', ред: 'ЧИЙТОВЕ', нови: 1 } },
    { име: 'екранът: от менюто, от паузата (↓) и действие', f: rz => { const st = []; rz.chtUnlock(); rz.toMenu(rz.menuItems().findIndex(m => m.k === 'cheats'));
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

  // всеки случай — в чист контекст; липсващите части (нужни) се прескачат
  function run(list, done) {
    const out = []; let bad = 0; const have = boot().rz.GAMES.map(g => g.id);
    for (const c of list) {
      if (c.нужни && !c.нужни.every(id => have.includes(id))) { out.push(`—   ${c.име} (няма ${c.нужни.join('/')} в сборката)`); continue; }
      let got; try { const env = boot(c.ls); got = c.f(env.rz, env.storage, env); } catch (e) { got = 'грешка: ' + String(e && e.stack || e).split('\n')[0]; }
      const ok = JSON.stringify(got) === JSON.stringify(c.очаквано); if (!ok) bad++;
      out.push(`${ok ? 'ОК ' : 'НЕ '} ${c.име}` + (ok ? '' : `\n      очаквано: ${JSON.stringify(c.очаквано)}\n      получено: ${JSON.stringify(got)}`));
    }
    out.push(bad ? `${bad} несъответствия` : done);
    return { text: out.join('\n'), bad, n: list.length };
  }
  return {
    storage: () => run(STORAGE, 'договорът на записите е спазен'),
    cheats: () => boot().rz.chtSet ? run(CHEATS, 'чийтовете работят и нищо не записват') : { няма: true, text: 'няма чийтове в сборката', bad: 0, n: 0 },
  };
};
