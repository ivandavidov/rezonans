/* Опора: нищо „на земята“ не виси във въздуха (node tools/run.js <сборка> stand — само в Node, защото обвива помощниците в
   изходния код). Помощниците за декор, които стоят на земята — с параметър fy/floorY (линията на пода) или с fy=15*T в
   началото на тялото, — се обвиват, а канвата записва правоъгълника около всяка нарисувана фигура. Основата (нарисуваното до
   3 px над най-ниската точка) трябва да е над плочка, на която се стои; над въздух — най-много 4 px. Каквото виси (табели,
   лампи, сталактити) или е в картината на фона, е с y/py и не се проверява. Отделно: огньовете, решетките на отдушниците,
   неподвижните врагове и бъчвите. Кампаниите на всяка част + секторите (семена 1…seeds × 1–40, трудност лесно и трудно). */
'use strict';
module.exports = ({ GAME_JS, file, boot }) => {
  function standJs() {
    const P = {}, js = GAME_JS.replace(/function ([\w$]+)\(([^)]*)\)\s*\{/g, (m, n, ps, off) => {
      const pn = ps.split(',').map(p => p.split('=')[0].trim()), body = GAME_JS.slice(off + m.length, off + m.length + 120);
      if (!(pn.includes('fy') || pn.includes('floorY') || /^[^}]*?\bfy=15\*T\b/.test(body))) return m;
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
    const { P, js } = standJs(), env = boot(null, { js, canvas: recCanvas }), rz = env.rz, W = env.ctx, ev = W.__stEv;
    const T = ev('T'), S = ev('S'), FOES = ev('FOES'), SOL = '#=BZ><^D-H123t', out = [], части = {};   // SOL — на какво може да стои нещо
    let q = null;
    const base = (where, what, m, iv, fy) => { const r = Math.floor((fy + 1) / T); let bad = 0, tot = 0; q.предмети++;   // iv — отсечките на основата в px
      for (const [x0, x1] of iv) for (let x = Math.floor(x0); x < Math.ceil(x1); x++) { tot++; if (!SOL.includes((m[r] || '')[Math.floor(x / T)] || '.')) bad++; }
      if (bad > 4 || bad && bad >= tot) { q.висящи++; out.push(`${where} — ${what} (колона ${Math.floor(iv[0][0] / T)}, под ред ${r}): ${bad >= tot ? 'виси' : 'над въздух ' + bad + ' от ' + tot + ' px'}`); } };
    const scan = (where, L, log) => {
      for (const [n, a, m, rec] of log) { const pn = P[n], fy = pn.includes('fy') ? a[pn.indexOf('fy')] : pn.includes('floorY') ? a[pn.indexOf('floorY')] : 15 * T;
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
      for (let i = 0; i < rz.levels.length; i++) for (let s = 1; s <= (rz.levels[i].gen ? seeds : 1); s++) {   // генериран епизод — по семена
        if (rz.levels[i].gen) rz.epFix = 1000 + s * 7919; W.__stLog = []; rz.loadLevel(i); const log = W.__stLog; W.__stLog = null; scan(g + ':' + (i + 1) + ' ' + rz.LVL.title + (rz.levels[i].gen ? ' (семе ' + rz.epFix + ')' : ''), rz.LVL, log); }
      rz.epFix = null;
      for (const di of [0, 2]) { rz.setDiff(di); for (let s = 1; s <= seeds; s++) for (let k = 0; k < 40; k++) { rz.survSeed = 10000 + s * 7919; const L = rz.genLevel(k);
        W.__stLog = []; rz.loadLevel(-1, L); const log = W.__stLog; W.__stLog = null; scan(`${g} сектор ${k + 1} (семе ${s}, ${['лесно', '', 'трудно'][di]}) ${L.themeName}`, L, log); } }
      rz.toMenu(2); }
    const висящи = Object.values(части).reduce((s, c) => s + c.висящи, 0);
    return { части, висящи, text: out.concat(Object.entries(части).map(([g, c]) => `${g}: предмети на земята ${c.предмети}, висящи ${c.висящи}`)).join('\n') };
  }
  return { stand };
};
