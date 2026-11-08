// WebGL2: пакетно рисуване на спрайтове (instancing), сцена в HDR буфер, сияние по веригата на
// намалени буфери, финален пас (ударни вълни, хроматично отместване, тонове, винетка, дитеринг).
(function () {
'use strict';
const S = window.SPACE;
const R = S.R = { waves: [], ca: 0, flash: 0, shake: [0, 0], q: 1, stats: { inst: 0 } };
let gl, progS, progDown, progUp, progFin, progCopy, vaoQ, vaoS, ibuf, idata, icount = 0, tex = null;
const STRIDE = 14, CAP = 40000;
let scene = null, bgRT = null, mips = [], W = 0, H = 0, fmt = null, bgN = 0, bgKey = '';

const VS_Q = `#version 300 es
layout(location=0) in vec2 aC; out vec2 vUV;
void main(){ vUV = aC * 0.5 + 0.5; gl_Position = vec4(aC, 0.0, 1.0); }`;

const VS_S = `#version 300 es
layout(location=0) in vec2 aC;
layout(location=1) in vec4 aP;   // x, y, w, h (единици на полето)
layout(location=2) in vec2 aR;   // ъгъл, добавяне (0 — смес, 1 — светлина)
layout(location=3) in vec4 aUV;
layout(location=4) in vec4 aCol;
uniform vec3 uView; uniform vec2 uRes;
out vec2 vUV; out vec4 vCol; out float vAdd;
void main(){
  float c = cos(aR.x), s = sin(aR.x);
  vec2 q = aC * aP.zw; q = vec2(q.x * c - q.y * s, q.x * s + q.y * c);
  vec2 px = uView.xy + (aP.xy + q) * uView.z;
  gl_Position = vec4(px / uRes * 2.0 - 1.0, 0.0, 1.0); gl_Position.y = -gl_Position.y;
  vUV = mix(aUV.xy, aUV.zw, aC + 0.5); vCol = aCol; vAdd = aR.y;
}`;
const FS_S = `#version 300 es
precision mediump float;
uniform sampler2D uTex; in vec2 vUV; in vec4 vCol; in float vAdd; out vec4 o;
void main(){ vec4 t = texture(uTex, vUV); o = vec4(t.rgb * vCol.rgb * vCol.a, t.a * vCol.a * (1.0 - vAdd)); }`;

const FS_DOWN = `#version 300 es
precision mediump float;
uniform sampler2D uSrc; uniform vec2 uTx; uniform float uPre, uTh; in vec2 vUV; out vec4 o;
vec3 T(vec2 d){ return min(texture(uSrc, vUV + uTx * d).rgb, vec3(30.0)); }
void main(){
  vec3 e = T(vec2(0)), a = T(vec2(-2, 2)), b = T(vec2(0, 2)), c = T(vec2(2, 2)), d = T(vec2(-2, 0)), f = T(vec2(2, 0)),
       g = T(vec2(-2, -2)), h = T(vec2(0, -2)), i = T(vec2(2, -2)), j = T(vec2(-1, 1)), k = T(vec2(1, 1)), l = T(vec2(-1, -1)), m = T(vec2(1, -1));
  vec3 s = e * 0.125 + (a + c + g + i) * 0.03125 + (b + d + f + h) * 0.0625 + (j + k + l + m) * 0.125;
  if (uPre > 0.5) { // мек праг: само яркото (над ~1) свети
    float br = max(s.r, max(s.g, s.b)), kn = 0.45;
    float sf = clamp(br - uTh + kn, 0.0, 2.0 * kn); sf = sf * sf / (4.0 * kn + 1e-4);
    s *= max(sf, br - uTh) / max(br, 1e-4);
  }
  o = vec4(s, 1.0);
}`;
const FS_UP = `#version 300 es
precision mediump float;
uniform sampler2D uSrc; uniform vec2 uTx; uniform float uK; in vec2 vUV; out vec4 o;
vec3 T(vec2 d){ return texture(uSrc, vUV + uTx * d).rgb; }
void main(){
  vec3 s = T(vec2(-1, 1)) + T(vec2(0, 1)) * 2.0 + T(vec2(1, 1)) + T(vec2(-1, 0)) * 2.0 + T(vec2(0)) * 4.0 + T(vec2(1, 0)) * 2.0 + T(vec2(-1, -1)) + T(vec2(0, -1)) * 2.0 + T(vec2(1, -1));
  o = vec4(s / 16.0 * uK, 1.0);
}`;
const FS_FIN = `#version 300 es
precision highp float;
uniform sampler2D uScene, uBloom; uniform vec2 uRes; uniform vec4 uPlay; uniform vec4 uWv[6];
uniform float uCA, uBK, uFlash, uTime, uDim, uGl; in vec2 vUV; out vec4 o;
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
vec3 soft(vec3 x){ return mix(x, 1.0 - 0.2 * exp(-(x - 0.8) * 5.0), step(0.8, x)); }
void main(){
  vec2 uv = vUV, asp = vec2(uRes.x / uRes.y, 1.0);
  float gca = 0.0;
  if (uGl > 0.0) { // глич: ленти по височина се разместват за кратко
    float band = floor(uv.y * 34.0 + floor(uTime * 23.0) * 7.0), hb = hash(vec2(band, floor(uTime * 17.0)));
    float on = step(1.0 - uGl * 0.55, hb);
    uv.x += (hash(vec2(band, 3.1)) - 0.5) * 0.08 * uGl * on; gca = on * uGl * 0.012;
  }
  for (int i = 0; i < 6; i++) { // ударни вълни: пръстен, който бута картината навън
    vec4 w = uWv[i]; if (w.w == 0.0) continue;
    vec2 d = (uv - w.xy) * asp; float r = length(d), x = r - w.z;
    float pr = x * exp(-x * x * 900.0);
    uv -= (d / max(r, 1e-4)) / asp * pr * w.w;
  }
  vec3 c;
  if (uCA + gca > 0.0) { vec2 dd = (uv - 0.5) * uCA + vec2(gca, 0.0); c = vec3(texture(uScene, uv + dd).r, texture(uScene, uv).g, texture(uScene, uv - dd).b); }
  else c = texture(uScene, uv).rgb;
  c += texture(uBloom, uv).rgb * uBK;
  float m = max(c.r, max(c.g, c.b)); c += vec3(max(m - 1.1, 0.0) * 0.22);   // наситеното прелива към бяло
  c += uFlash;
  vec2 p = vUV * uRes; // извън игралното поле — по-тъмно
  float ex = max(max(uPlay.x - p.x, p.x - uPlay.z), max(uPlay.y - p.y, p.y - uPlay.w));
  c *= mix(1.0, uDim, smoothstep(-2.0, 26.0, ex));
  vec2 v = vUV - 0.5; c *= 1.0 - dot(v, v) * 0.42;
  c = soft(max(c, 0.0));
  c += (hash(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) / 255.0;
  o = vec4(c, 1.0);
}`;
const FS_COPY = `#version 300 es
precision mediump float; uniform sampler2D uSrc; in vec2 vUV; out vec4 o; void main(){ o = texture(uSrc, vUV); }`;

function sh(type, src) {
  const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + '\n' + src.split('\n').map((l, i) => (i + 1) + ': ' + l).join('\n'));
  return s;
}
R.prog = function (vs, fs) {
  const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  p.u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i), nm = a.name.replace(/\[0\]$/, ''); p.u[nm] = gl.getUniformLocation(p, a.name); }
  return p;
};
R.progQ = fs => R.prog(VS_Q, fs);

R.init = function (canvas) {
  gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: 'high-performance', desynchronized: true });
  if (!gl) return false;
  R.gl = gl;
  const f = gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float');
  fmt = f ? { i: gl.RGBA16F, f: gl.RGBA, t: gl.HALF_FLOAT } : { i: gl.RGBA8, f: gl.RGBA, t: gl.UNSIGNED_BYTE };
  R.hdr = !!f;
  progS = R.prog(VS_S, FS_S); progDown = R.progQ(FS_DOWN); progUp = R.progQ(FS_UP); progFin = R.progQ(FS_FIN); progCopy = R.progQ(FS_COPY);
  // пълноекранен триъгълник-квадрат
  vaoQ = gl.createVertexArray(); gl.bindVertexArray(vaoQ);
  const qb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, qb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  // спрайтове
  vaoS = gl.createVertexArray(); gl.bindVertexArray(vaoS);
  const cb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, cb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  ibuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, ibuf);
  idata = new Float32Array(CAP * STRIDE); gl.bufferData(gl.ARRAY_BUFFER, idata.byteLength, gl.DYNAMIC_DRAW);
  const B = STRIDE * 4; let off = 0;
  for (const [loc, n] of [[1, 4], [2, 2], [3, 4], [4, 4]]) {
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, n, gl.FLOAT, false, B, off); gl.vertexAttribDivisor(loc, 1); off += n * 4;
  }
  gl.bindVertexArray(null);
  gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE);
  return true;
};

function rt(w, h) {
  const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, fmt.i, w, h, 0, fmt.f, fmt.t, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
  return { t, fb, w, h };
}
function free(r) { if (r) { gl.deleteTexture(r.t); gl.deleteFramebuffer(r.fb); } }

// размер на буферите; bq — дял на разделителната способност на сиянието
R.resize = function (w, h, bq) {
  if (w === W && h === H && bq === R.bq) return;
  W = w; H = h; R.bq = bq; R.w = w; R.h = h;
  free(scene); free(bgRT); mips.forEach(free); mips = [];
  scene = rt(w, h); bgRT = null; bgKey = '';
  let mw = Math.max(1, Math.round(w * 0.5 * bq)), mh = Math.max(1, Math.round(h * 0.5 * bq));
  for (let i = 0; i < 6 && mw >= 4 && mh >= 4; i++) { mips.push(rt(mw, mh)); mw = Math.max(1, mw >> 1); mh = Math.max(1, mh >> 1); }
};

R.setAtlas = function (canvas) {
  tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
};

// изглед: отместване и мащаб на игралното поле в пиксели на буфера
R.view = { x: 0, y: 0, s: 1 };
R.setView = function (x, y, s) { R.view.x = x; R.view.y = y; R.view.s = s; };

// спрайт: sp от атласа; sx, sy — мащаб; col = [r,g,b] (може > 1), a — прозрачност; add — 1 за светлина
R.spr = function (sp, x, y, rot, sx, sy, col, a, add) {
  if (icount >= CAP) flush();
  const o = icount++ * STRIDE, d = idata;
  d[o] = x; d[o + 1] = y; d[o + 2] = sp.w * sx; d[o + 3] = sp.h * sy; d[o + 4] = rot; d[o + 5] = add;
  d[o + 6] = sp.u0; d[o + 7] = sp.v0; d[o + 8] = sp.u1; d[o + 9] = sp.v1;
  d[o + 10] = col[0]; d[o + 11] = col[1]; d[o + 12] = col[2]; d[o + 13] = a;
};
// същото, но с цвят по компоненти (за частиците — без масиви)
R.spr4 = function (sp, x, y, rot, w, h, r, g, b, a, add) {
  if (icount >= CAP) flush();
  const o = icount++ * STRIDE, d = idata;
  d[o] = x; d[o + 1] = y; d[o + 2] = w; d[o + 3] = h; d[o + 4] = rot; d[o + 5] = add;
  d[o + 6] = sp.u0; d[o + 7] = sp.v0; d[o + 8] = sp.u1; d[o + 9] = sp.v1;
  d[o + 10] = r; d[o + 11] = g; d[o + 12] = b; d[o + 13] = a;
};

function flush() {
  if (!icount) return;
  gl.useProgram(progS); gl.bindVertexArray(vaoS);
  const tk = R.tgt ? R.tgt.k : 1;
  gl.uniform3f(progS.u.uView, R.view.x * tk, R.view.y * tk, R.view.s * tk); gl.uniform2f(progS.u.uRes, R.tgt ? R.tgt.w : W, R.tgt ? R.tgt.h : H);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(progS.u.uTex, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, ibuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, idata, 0, icount * STRIDE);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, icount);
  R.stats.inst += icount; icount = 0;
}
R.flush = flush;

// фонът е в свой буфер: почти не се мени (далечен е), затова се обновява по една от `parts` ивици на кадър;
// при смяна на изгледа, размера или фона (key) — целият наведнъж
// scale < 1 — фонът се рисува в по-малък буфер и се разтяга (меки фонове, които се движат бързо — облаците)
R.bgPass = function (key, parts, draw, scale) {
  scale = scale || 1;
  const bw = Math.max(1, Math.round(W * scale)), bh = Math.max(1, Math.round(H * scale));
  if (!bgRT || bgRT.w !== bw || bgRT.h !== bh) { free(bgRT); bgRT = rt(bw, bh); bgKey = ''; }
  R.bw = bw; R.bh = bh; R.bs = scale;
  const v = R.view, k = key + ':' + v.x.toFixed(2) + ':' + v.y.toFixed(2) + ':' + v.s.toFixed(4);
  gl.bindFramebuffer(gl.FRAMEBUFFER, bgRT.fb); gl.viewport(0, 0, bw, bh); gl.disable(gl.BLEND);
  if (k !== bgKey || parts <= 1) { bgKey = k; gl.disable(gl.SCISSOR_TEST); }
  else { const i = bgN++ % parts, y0 = Math.floor(bh * i / parts), y1 = Math.floor(bh * (i + 1) / parts); gl.enable(gl.SCISSOR_TEST); gl.scissor(0, y0, bw, y1 - y0); }
  draw();
  flush(); gl.disable(gl.SCISSOR_TEST);
};
// начало на кадъра: фонът се копира в сцената, после се рисува върху нея
R.begin = function () {
  R.stats.inst = 0;
  gl.disable(gl.BLEND); gl.disable(gl.SCISSOR_TEST);
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, bgRT.fb); gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, scene.fb);
  gl.blitFramebuffer(0, 0, bgRT.w, bgRT.h, 0, 0, W, H, gl.COLOR_BUFFER_BIT, bgRT.w === W ? gl.NEAREST : gl.LINEAR);
  gl.bindFramebuffer(gl.FRAMEBUFFER, scene.fb); gl.viewport(0, 0, W, H);
};
// пълноекранен шейдър (фонове); set(prog) задава униформите
// светлинна карта (мъглата на ниво 4): една четвърт от размера; светлините се рисуват като сияния
let lightRT = null;
R.lightBegin = function (amb) {
  flush();
  const lw = Math.max(1, Math.round(W / 4)), lh = Math.max(1, Math.round(H / 4));
  if (!lightRT || lightRT.w !== lw || lightRT.h !== lh) { free(lightRT); lightRT = rt(lw, lh); }
  gl.bindFramebuffer(gl.FRAMEBUFFER, lightRT.fb); gl.viewport(0, 0, lw, lh); gl.disable(gl.SCISSOR_TEST);
  gl.clearColor(amb, amb, amb, 1); gl.clear(gl.COLOR_BUFFER_BIT); gl.clearColor(0, 0, 0, 1);
  R.tgt = { w: lw, h: lh, k: lw / W };
};
R.lightEnd = function () { flush(); R.tgt = null; gl.bindFramebuffer(gl.FRAMEBUFFER, scene.fb); gl.viewport(0, 0, W, H); };
R.lightTex = () => lightRT && lightRT.t;
// пълноекранен пас върху сцената със смесване: 'add' — светлина, иначе — с прозрачност (предумножена)
R.overlay = function (prog, set, add) {
  flush();
  gl.useProgram(prog); gl.bindVertexArray(vaoQ);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, add ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA);
  set(prog, gl);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};
R.full = function (prog, set) {
  flush();
  gl.useProgram(prog); gl.bindVertexArray(vaoQ); set(prog, gl);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};
R.clip = function (on) {
  flush();
  if (!on) { gl.disable(gl.SCISSOR_TEST); return; }
  const v = R.view, x0 = Math.floor(v.x), y0 = Math.floor(v.y), x1 = Math.ceil(v.x + S.W * v.s), y1 = Math.ceil(v.y + S.H * v.s);
  gl.enable(gl.SCISSOR_TEST); gl.scissor(x0, H - y1, x1 - x0, y1 - y0);
};

function pass(prog, dst, src, set) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, dst ? dst.fb : null); gl.viewport(0, 0, dst ? dst.w : W, dst ? dst.h : H);
  gl.useProgram(prog); gl.bindVertexArray(vaoQ);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, src.t); gl.uniform1i(prog.u.uSrc, 0);
  if (set) set(prog);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

// край на кадъра: сияние и финален пас към екрана; o = {bloom, time, play:[x0,y0,x1,y1] px, dim}
R.end = function (o) {
  flush();
  gl.disable(gl.SCISSOR_TEST); gl.disable(gl.BLEND);
  let src = scene;
  for (let i = 0; i < mips.length; i++) {
    const s = src;
    pass(progDown, mips[i], s, p => { gl.uniform2f(p.u.uTx, 1 / s.w, 1 / s.h); gl.uniform1f(p.u.uPre, i === 0 ? 1 : 0); gl.uniform1f(p.u.uTh, R.hdr ? 1.0 : 0.72); });
    src = mips[i];
  }
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
  for (let i = mips.length - 1; i > 0; i--) {
    const s = mips[i];
    pass(progUp, mips[i - 1], s, p => { gl.uniform2f(p.u.uTx, 1 / s.w, 1 / s.h); gl.uniform1f(p.u.uK, 1.0); });
  }
  gl.disable(gl.BLEND);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H);
  gl.useProgram(progFin); gl.bindVertexArray(vaoQ);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, scene.t); gl.uniform1i(progFin.u.uScene, 0);
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, mips[0].t); gl.uniform1i(progFin.u.uBloom, 1);
  gl.uniform2f(progFin.u.uRes, W, H);
  const p = o.play; gl.uniform4f(progFin.u.uPlay, p[0], p[1], p[2], p[3]);
  gl.uniform1f(progFin.u.uCA, R.ca); gl.uniform1f(progFin.u.uBK, o.bloom); gl.uniform1f(progFin.u.uFlash, R.flash);
  gl.uniform1f(progFin.u.uTime, o.time); gl.uniform1f(progFin.u.uDim, o.dim); gl.uniform1f(progFin.u.uGl, R.glitch || 0);
  const wv = new Float32Array(24);
  R.waves.slice(0, 6).forEach((w, i) => { wv[i * 4] = w.x; wv[i * 4 + 1] = w.y; wv[i * 4 + 2] = w.r; wv[i * 4 + 3] = w.k; });
  gl.uniform4fv(progFin.u.uWv, wv);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.activeTexture(gl.TEXTURE0);
};
})();
