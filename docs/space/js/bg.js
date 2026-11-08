// Фоновете на нивата: пълноекранни шейдъри в координатите на полето (продължават и извън него).
// Далечното почти не се движи (звезди, планета), скоростта се усеща от близкия прах (fx.js).
(function () {
'use strict';
const S = window.SPACE, R = S.R;
const BG = S.BG = { defs: {}, progs: {} };

const HEAD = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform vec3 uView; uniform float uTime, uScroll; uniform vec4 uP;
out vec4 o;
float h12(vec2 p){ vec3 q = fract(vec3(p.xyx) * .1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
vec2 h22(vec2 p){ vec3 q = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973)); q += dot(q, q.yzx + 33.33); return fract((q.xx + q.yz) * q.zy); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  return mix(mix(h12(i), h12(i + vec2(1, 0)), u.x), mix(h12(i + vec2(0, 1)), h12(i + 1.), u.x), u.y); }
float fbm(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 5; i++) { s += a * vn(p); p = p * 2.03 + vec2(17.1, 9.2); a *= .5; } return s; }
float fbm3(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 3; i++) { s += a * vn(p); p = p * 2.07 + vec2(5.3, 1.7); a *= .5; } return s; }
// звезди в три слоя; размерът е в пиксели (точкови източници), паралаксът — почти нула
vec3 stars(vec2 w, float dens){
  vec3 c = vec3(0);
  for (int L = 0; L < 3; L++) {
    float fl = float(L), cs = 23. + fl * 19., par = .002 + fl * .003;
    vec2 p = (w + vec2(uScroll * par, 0.)) / cs + fl * 31.7;
    vec2 id = floor(p), f = fract(p); float h = h12(id);
    if (h > dens - fl * .08) continue;
    vec2 sp = .2 + .6 * h22(id + 4.);
    float d = length((f - sp) * cs) * uView.z;
    float b = pow(h12(id + 7.), 7.) * 3. + .12;
    float tw = .78 + .22 * sin(uTime * (.7 + 2.6 * h) + h * 40.);
    vec3 col = mix(vec3(1., .8, .62), vec3(.72, .86, 1.15), h12(id + 3.));
    c += col * b * tw * exp(-d * d / (.55 + b * .9));
  }
  return c;
}
vec2 world(){ vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y); return (px - uView.xy) / uView.z; }
`;

// ── Хелиос: газов гигант долу вляво, пръстени по диагонала, звездата е горе вдясно (извън кадъра) ──
BG.defs.helios = {
  fs: HEAD + `
const vec3 LD = normalize(vec3(.72, -.2, .66));   // звездата: вдясно, малко отгоре и към нас — осветява видимата страна на пръстена
const float PHI = -.42, INC = 1.29;
// плътност на пръстена по радиуса (в радиуси на планетата): слаб вътрешен, ярък среден, процеп, външен с тесен процеп
float ring(float x){
  if (x < 1.28 || x > 2.3) return 0.;
  float t = (x - 1.28) / 1.02;
  float d = t < .24 ? mix(.12, .3, t / .24) : t < .58 ? .8 + .1 * sin(t * 40.) : t < .65 ? .04 : .55 - .15 * smoothstep(.75, 1., t);
  d *= 1. - .85 * exp(-pow((t - .86) / .008, 2.));
  d *= .86 + .28 * (vn(vec2(t * 46., 2.)) - .5) + .1 * (vn(vec2(t * 140., 5.)) - .5);
  d *= smoothstep(0., .03, t) * smoothstep(1., .96, t);
  return clamp(d, 0., 1.);
}
void main(){
  vec2 w = world();
  vec3 U = vec3(cos(PHI), sin(PHI), 0.), V0 = vec3(-sin(PHI), cos(PHI), 0.);
  vec3 V = V0 * cos(INC) - vec3(0, 0, sin(INC)), N = cross(U, V);
  // космос: звезди, слаба мъглявина, отблясък от звездата горе вдясно
  // далечна галактическа ивица по диагонала, с тъмни прашни ивици; в нея звездите са по-гъсти
  vec2 gp = w + vec2(uScroll * .003, 0.);
  float gd = dot(gp - vec2(700., 160.), normalize(vec2(.42, 1.))), band = exp(-gd * gd / 52000.);
  float dust = smoothstep(.42, .72, fbm3(gp * .008 + 21.));
  vec3 col = stars(w, .48 + band * .3);
  col += mix(vec3(.07, .06, .13), vec3(.12, .09, .1), fbm3(gp * .003)) * band * (.45 + fbm3(gp * .0045 + 7.) * 1.1) * (1. - .4 * dust);
  float nb = fbm3(w * .0017 + vec2(uScroll * .000004, 0.) + 3.);
  col += vec3(.035, .03, .07) * smoothstep(.42, .85, nb) + vec3(.0, .028, .04) * smoothstep(.5, .9, fbm3(w * .0024 + 9.));
  // малка далечна луна, осветена от същата звезда
  vec2 md = w - vec2(905. - uScroll * .006, 112.); float mr = 30., ml = length(md);
  if (ml < mr + 2.) {
    vec3 mn = vec3(md, sqrt(max(mr * mr - ml * ml, 0.))) / mr;
    float cr = fbm(mn.xy * 2.4 + 4.) * .35 + .72 - .14 * smoothstep(.55, .7, vn(mn.xy * 5.));
    vec3 mc = vec3(.5, .52, .56) * cr * (smoothstep(-.05, .5, dot(mn, LD)) * .9 + .006);
    col = mix(col, mc, smoothstep(mr, mr - 1.2 / uView.z, ml));
  }
  vec2 sun = vec2(1800., 60.); float sd = length(w - sun);
  col += vec3(.55, .42, .3) * (.2 * exp(-sd / 520.) + .06 * exp(-sd / 1500.));
  vec2 d = w - uP.xy; float Rr = uP.z, r = length(d);
  float zR = -(N.x * d.x + N.y * d.y) / N.z; vec3 q = vec3(d, zR);
  float rho = length(vec2(dot(q, U), dot(q, V))) / Rr, dn = ring(rho);
  vec3 rc = vec3(0);
  if (dn > 0.) { // пръстенът: осветен отстрани, сянката на планетата върху него
    float b = dot(q, LD), c2 = dot(q, q) - Rr * Rr, l = sqrt(max(c2 + Rr * Rr - b * b, 0.));
    float sh = b < 0. ? smoothstep(Rr * .985, Rr * 1.03, l) : 1.;
    float lit = (.18 + .82 * abs(dot(N, LD))) * sh + .03;
    float t = (rho - 1.28) / 1.02;
    rc = mix(vec3(.62, .58, .52), vec3(.55, .66, .74), smoothstep(.3, .9, t)) * lit * 1.45;
  }
  float aa = 1.5 / uView.z;
  float pa = smoothstep(Rr, Rr - aa, r);
  if (pa < 1. && dn > 0.) col = mix(col, rc, dn * .8);
  if (pa > 0.) {
    float z = sqrt(max(Rr * Rr - r * r, 0.)); vec3 n = vec3(d, z) / Rr;
    float lam = dot(n, LD);
    float lat = dot(n, N), lon = atan(dot(n, V), dot(n, U));
    vec2 bp = vec2(lon * 1.6 + uTime * .003, lat * 7.);
    float wp = fbm(bp * vec2(1.2, 1.) + vec2(uTime * .0015, 0.));
    float band = lat * 10. + (wp - .5) * 2.2;
    vec3 base = mix(vec3(.07, .22, .32), vec3(.38, .55, .62), .5 + .5 * sin(band));
    base = mix(base, vec3(.58, .52, .4), smoothstep(.55, .95, .5 + .5 * sin(band * .37 + 1.)) * .55);
    base *= .85 + .3 * fbm3(bp * vec2(2.5, 9.) + 11.);
    // сянката на пръстена върху планетата
    vec3 ps = n * Rr; float tt = -dot(ps, N) / dot(LD, N); vec3 qr = ps + LD * tt;
    float rs = tt > 0. ? ring(length(vec2(dot(qr, U), dot(qr, V))) / Rr) : 0.;
    float dif = smoothstep(-.1, .65, lam) * (1. - rs * .72);
    vec3 pc = base * (dif * .8 + .012);
    float rim = pow(1. - n.z, 2.6);
    pc += vec3(.25, .62, .95) * rim * (.06 + .7 * smoothstep(-.25, .6, lam)) * .5;
    pc *= mix(.6, 1., pow(max(n.z, 0.), .35));
    vec3 cc = mix(col, pc, pa);
    if (dn > 0. && zR > z) cc = mix(cc, rc, dn * .85);
    col = cc;
  }
  o = vec4(col, 1.);
}`,
  // средата на планетата (x, y, радиус) — отплава бавно наляво (далечна е)
  P: scroll => [300 - scroll * 0.008, 940, 470, 0],
};

// ── Кристалното поле: виолетова мъглявина с ярък звезден куп горе вдясно; плаващи кристали на две дълбочини ──
BG.defs.crystal = {
  parts: 4,
  fs: HEAD + `
const vec2 TOL = normalize(vec2(.75, -.66));   // посоката към звездния куп горе вдясно
// кристал: удължен шестоъгълник (призма отстрани) — стени, ръбове, вътрешно сияние; връща цвят и покритие
vec4 crys(vec2 p, float h, float w, float pulse, float px){
  vec2 A[6]; A[0] = vec2(0, -h); A[1] = vec2(w, -.42 * h); A[2] = vec2(w, .55 * h); A[3] = vec2(0, h); A[4] = vec2(-w, .55 * h); A[5] = vec2(-w, -.42 * h);
  float d = -1e9;
  for (int i = 0; i < 6; i++) { vec2 a = A[i], b = A[(i + 1) % 6], e = normalize(b - a); d = max(d, dot(p - a, vec2(e.y, -e.x))); }
  float cov = smoothstep(px, -px, d);
  if (cov <= 0.) return vec4(0);
  float fx = p.x / w, sx = fx < 0. ? -1. : 1.;
  vec2 nr = fx < -.34 ? vec2(-1, 0) : fx > .34 ? vec2(1, 0) : vec2(0);
  bool cap = p.y < -.42 * h || p.y > .55 * h;
  if (p.y < -.42 * h) nr = normalize(vec2(sx * .6, -1.)); else if (p.y > .55 * h) nr = normalize(vec2(sx * .6, 1.));
  float lit = dot(nr, nr) < .5 ? .5 : .5 + .5 * dot(nr, TOL);
  vec3 c = mix(vec3(.12, .14, .34), vec3(.62, .68, .98), lit * lit);
  vec2 u = p / vec2(w, h); float core = exp(-dot(u, u) * 2.4);
  c += vec3(.5, .22, .8) * core * (.3 + .25 * pulse);
  float ed = smoothstep(px * 1.6, 0., abs(d));
  if (!cap) ed += .55 * smoothstep(px * 1.3, 0., abs(abs(p.x) - .34 * w));
  ed += .45 * smoothstep(px * 1.3, 0., min(abs(p.y + .42 * h), abs(p.y - .55 * h))) * step(abs(fx), 1.);
  c += vec3(.85, .82, 1.25) * min(ed, 1.) * (.45 + .55 * lit);
  return vec4(c, cov * (.6 + .3 * core));
}
vec3 layer(vec2 w, vec3 col, float par, float cell, float hmin, float hmax, float dim, float seed){
  float x = w.x + uScroll * par, ci = floor(x / cell);
  for (int k = -1; k <= 1; k++) {
    float id = ci + float(k);
    if (h12(vec2(id, seed)) > .78) continue;
    vec2 c = vec2((id + .2 + .6 * h12(vec2(id, seed + 1.))) * cell, mix(60., 660., h12(vec2(id, seed + 2.))));
    float h = mix(hmin, hmax, h12(vec2(id, seed + 3.))), wd = h * mix(.26, .4, h12(vec2(id, seed + 4.)));
    float an = (h12(vec2(id, seed + 5.)) - .5) * 1.3 + sin(uTime * .05 + id) * .02, ca = cos(an), sa = sin(an);
    vec2 p = vec2(x, w.y) - c; p = vec2(ca * p.x + sa * p.y, -sa * p.x + ca * p.y);
    vec4 cr = crys(p, h, wd, .5 + .5 * sin(uTime * .8 + id * 2.3), 1.2 / uView.z);
    col = mix(col, cr.rgb * dim, cr.a);
  }
  return col;
}
void main(){
  vec2 w = world();
  // мъглявина: виолетово с магента и тюркоаз, изкривена (warp) — най-ярко около звездния куп
  vec2 q = w * .0015 + vec2(uScroll * .000005, 0.);
  vec2 wq = vec2(fbm3(q * 1.3 + 2.), fbm3(q * 1.3 + 7.));
  float n = fbm(q + wq * 1.4), m = fbm3(q * 2.2 + wq + 11.);
  vec3 col = vec3(.012, .008, .03);
  col += vec3(.17, .05, .2) * smoothstep(.38, .8, n) + vec3(.03, .1, .13) * smoothstep(.5, .85, m) * (1. - smoothstep(.5, .8, n));
  vec2 cl = vec2(1060., 120.); float cd = length(w - cl);
  col += vec3(.42, .36, .72) * (.32 * exp(-cd / 260.) + .08 * exp(-cd / 900.)) * (.6 + .6 * n);
  col *= 1. - .35 * smoothstep(.55, .75, fbm3(q * 3. + 5.)) * smoothstep(300., 900., cd);   // тъмни прашни ивици
  col += stars(w, .52 + .2 * exp(-cd / 400.));
  col = layer(w, col, .025, 230., 26., 64., .55, 3.);
  col = layer(w, col, .07, 620., 110., 230., .9, 17.);
  o = vec4(col, 1.);
}`,
};

// ── Бурята на Тифон: в атмосферата — слоеве облаци на различна дълбочина, светлина отгоре, далечни светкавици ──
BG.defs.storm = {
  parts: 1, scale: 0.5,   // облаците се движат бързо — рисува се всеки кадър, но на половин разделителна способност
  fs: HEAD + `
// облачна палуба: горен ръб от няколко мащаба шум (клъбца и ресни); осветена отгоре, тъмна в дълбочина;
// par — паралакс (близкото тече по-бързо), haze — въздушна перспектива към цвета на небето
vec3 SKY(float y){ return mix(mix(vec3(.5, .33, .3), vec3(.4, .24, .19), smoothstep(-80., 380., y)), vec3(.05, .025, .045), smoothstep(380., 780., y)); }
// клъбца: полукръгове с различна височина по клетки — купести облаци; nx — наклонът (за светлината), y — височината
float puff(float x, float s, float seed, out float nx, out float yh){
  float c = floor(x / s), f = fract(x / s) * 2. - 1., h = .4 + .6 * h12(vec2(c, seed));
  yh = sqrt(max(0., 1. - f * f)); nx = f; return yh * h;
}
vec4 deck(vec2 w, float par, float base, float amp, float sc, float seed, vec3 lit, vec3 shade, float haze){
  vec2 p = vec2(w.x + uScroll * par, w.y);
  float x = p.x + 40. * (fbm3(vec2(p.y * .01, seed)) - .5), n1, y1, n2, y2, n3, y3;
  // клъбцата са почти кръгли: височината ~ половин ширина
  float s1 = 200. * sc, s2 = 80. * sc, s3 = 30. * sc;
  float top = base + 60. * sc * (fbm3(vec2(x * .0015 / sc, seed)) - .5) * 2.
            - .5 * s1 * amp * puff(x, s1, seed + 1., n1, y1) - .5 * s2 * puff(x + 37., s2, seed + 2., n2, y2) - .4 * s3 * puff(x + 11., s3, seed + 3., n3, y3);
  float d = w.y - top;
  float n = fbm(p * .01 / sc + vec2(seed * 7., uTime * .01));
  float a = smoothstep(-4., 7., d + (n - .5) * 16. * sc);
  // светлина отгоре-отляво: само близо до върха — клъбцата са заоблени, по-навътре е мека сянка
  float near = exp(-max(d, 0.) / (.45 * s1));
  float sideL = mix(1., 1. - .35 * (n1 * .65 + n2 * .35), near);
  float ao = mix(1., mix(.6, 1., y1 * .6 + y2 * .4), near);
  float l = exp(-max(d - (n - .5) * 34. * sc, 0.) / (52. * sc)) * sideL * ao * (.85 + .3 * n);
  l += .3 * exp(-max(d, 0.) / (5. * sc)) * a;   // сребърен ръб
  vec3 c = mix(shade, lit, clamp(l, 0., 1.2));
  return vec4(mix(c, SKY(w.y), haze), a);
}
void main(){
  vec2 w = world();
  vec3 col = SKY(w.y);
  vec2 sun = vec2(900., -140.); float sd = length((w - sun) * vec2(.8, 1.));
  col += vec3(.9, .55, .3) * (.3 * exp(-sd / 260.) + .12 * exp(-sd / 700.));
  // далечни светкавици вътре в далечните кумулуси
  float fl = 0.;
  for (int k = 0; k < 2; k++) {
    float tt = uTime * .55 + float(k) * .5, c = floor(tt), f = fract(tt);
    float on = step(.62, h12(vec2(c, float(k) + 3.))) * (exp(-f * 14.) + .6 * exp(-abs(f - .09) * 40.));
    vec2 pp = vec2(h12(vec2(c, 9. + float(k))) * 1280., 400. + h12(vec2(c, 5.)) * 120.);
    fl += on * exp(-length((w - pp) * vec2(.6, 1.)) / 170.);
  }
  // тънки перести ивици в откритото небе
  vec2 pw = vec2(w.x * .3 + uScroll * .08, w.y * 1.8); float wn = fbm(pw * .006 + 3.);
  col = mix(col, vec3(.64, .47, .4), smoothstep(.56, .82, wn) * smoothstep(110., 210., w.y) * (1. - smoothstep(320., 420., w.y)) * .32);
  vec4 d0 = deck(w, .05, 410., .9, .8, 1., vec3(.66, .48, .37), vec3(.3, .2, .23), .38);
  col = mix(col, d0.rgb + vec3(.6, .62, .9) * fl, d0.a);
  vec4 d1 = deck(w, .17, 560., .9, 1., 4., vec3(.6, .39, .26), vec3(.15, .085, .1), .16);
  col = mix(col, d1.rgb, d1.a);
  vec4 d2 = deck(w, .5, 690., .9, 1.4, 8., vec3(.46, .27, .17), vec3(.05, .025, .035), 0.);
  col = mix(col, d2.rgb, d2.a);
  // таван: облаци, които висят отгоре — тъмни отдолу, със светли ръбове и пролуки към слънцето
  vec2 pc = vec2(w.x + uScroll * .32, w.y);
  float ct = 80. + 55. * (fbm3(vec2(pc.x * .0028, 21.)) - .5) * 2. + 22. * (fbm3(vec2(pc.x * .011, 24.)) - .5) * 2.;
  float cn = fbm(pc * .008 + vec2(13., uTime * .012));
  float dd = ct - w.y + (cn - .5) * 30.;
  float ca = smoothstep(-5., 9., dd);
  vec3 cc = mix(vec3(.62, .44, .33), vec3(.13, .075, .085), smoothstep(0., 45., dd)) * (.8 + .4 * cn);
  col = mix(col, cc, ca * .97);
  o = vec4(col, 1.);
}`,
};

// ── Мъглявината Ехо: тъмнозелена мъглявина с нишки и далечни стълбове газ (почти всичко се крие в мъглата отгоре) ──
BG.defs.echo = {
  parts: 4,
  fs: HEAD + `
void main(){
  vec2 w = world();
  vec2 q = w * .0018 + vec2(uScroll * .00001, 0.);
  vec2 wq = vec2(fbm3(q * 1.4 + 4.), fbm3(q * 1.4 + 9.));
  float n = fbm(q + wq * 1.6), f = fbm(q * 3.1 + wq * 2.2 + 17.);
  vec3 col = vec3(.008, .02, .018);
  col += vec3(.03, .12, .09) * smoothstep(.35, .85, n) + vec3(.05, .16, .13) * smoothstep(.62, .9, f) * smoothstep(.4, .7, n);
  // стълбове газ на хоризонта, осветени отгоре
  float px = w.x + uScroll * .04, pil = smoothstep(.55, .9, fbm3(vec2(px * .004, 3.))) * smoothstep(720., 260., w.y + 200. * (fbm3(vec2(px * .006, w.y * .002)) - .5));
  col += vec3(.06, .2, .15) * pil * (.6 + .6 * f);
  col += stars(w, .3) * .7;
  o = vec4(col, 1.);
}`,
};

// ── Пулсарът: синьо-бяла мъглявина от свръхнова (нишки), пулсарът е вдясно извън кадъра — виждат се короната и лъчите му ──
BG.defs.pulsar = {
  parts: 4,
  fs: HEAD + `
void main(){
  vec2 w = world();
  vec2 P = vec2(1750., 330.);
  vec3 col = vec3(.008, .01, .03);
  // нишките на остатъка от свръхнова: тънки извити линии около пулсара
  vec2 d = w - P; float r = length(d), a = atan(d.y, d.x);
  float fil = fbm(vec2(a * 3.2, r * .004) + vec2(0., fbm3(vec2(a * 2., r * .002)) * 2.));
  col += vec3(.1, .16, .4) * pow(smoothstep(.45, .8, fil), 2.) * smoothstep(1900., 500., r);
  col += vec3(.18, .08, .3) * smoothstep(.6, .85, fbm3(w * .002 + 5.)) * .6;
  col += stars(w, .55);
  // корона и бавно въртящи се лъчи (украса — импулсът е отделен слой)
  col += vec3(.5, .7, 1.2) * (.5 * exp(-r / 160.) + .18 * exp(-r / 600.));
  float beam = pow(max(cos(a * 2. - uTime * 1.5708), 0.), 60.) * smoothstep(2200., 400., r);
  col += vec3(.25, .4, .8) * beam * .5;
  o = vec4(col, 1.);
}`,
};

// ── Сърцето на Шума: червено-черна вътрешност; далечна стена с жилки, колони на средна дълбочина, стените на коридора отпред ──
BG.defs.heart = {
  parts: 1, scale: 0.75,  // стените текат бързо — всеки кадър
  fs: HEAD + `
float wt(float x, float sc, float k){ return k * (62. + 38. * sin((x + sc) * .0042) + 22. * sin((x + sc) * .0113 + 1.3)); }
float wb(float x, float sc, float k){ return 720. - k * (62. + 38. * sin((x + sc) * .0037 + 2.1) + 22. * sin((x + sc) * .0127 + .4)); }
void main(){
  vec2 w = world();
  vec3 col = vec3(.02, .004, .008);
  // далечна стена: схема от светещи жилки, пулсира
  vec2 g = vec2(w.x + uScroll * .25, w.y) * .012;
  vec2 c = floor(g), f = fract(g);
  float h = h12(c), line = 0.;
  line += smoothstep(.06, 0., abs(f.y - .5)) * step(.55, h);
  line += smoothstep(.06, 0., abs(f.x - .5)) * step(h, .3);
  float pulse = .5 + .5 * sin(uTime * 2.2 - (w.x + uScroll * .25) * .004);
  col += vec3(.35, .03, .06) * line * (.25 + .5 * pulse) * (.5 + .5 * fbm3(g * .3));
  col += vec3(.12, .01, .03) * smoothstep(.5, .9, fbm(w * .003 + vec2(uScroll * .0005, 0.)));
  // колони на средна дълбочина
  float cx = w.x + uScroll * .6, ci = floor(cx / 260.), cf = cx - ci * 260.;
  if (h12(vec2(ci, 7.)) > .4) { float cw = 40. + 30. * h12(vec2(ci, 8.)), cc = 130.; float dcol = abs(cf - cc) - cw;
    if (dcol < 0.) { float sh = .5 + .5 * cos((cf - cc) / cw * 1.57); col = mix(col, vec3(.06, .015, .02) * (.4 + sh) + vec3(.4, .03, .06) * smoothstep(-2., 0., dcol) * .6, .9); } }
  // стените на коридора — същата формула като в логиката
  float k = uP.x, t = wt(w.x, uScroll, k), b = wb(w.x, uScroll, k), px = 1.4 / uView.z;
  if (k > .01) {
    float dt = w.y - t, db = b - w.y;
    if (dt < 0. || db < 0.) {
      float dd = dt < 0. ? -dt : -db;
      vec2 gp = vec2(w.x + uScroll, w.y) * .05; float rv = step(.92, h12(floor(gp)));
      vec3 wc = vec3(.07, .02, .025) * (.7 + .5 * fbm3(gp * .3)) * (1. - .5 * smoothstep(0., 90., dd)) + vec3(.5, .05, .08) * rv * .4;
      col = wc;
    }
    float edge = min(abs(dt), abs(db));
    col += vec3(1.2, .12, .2) * smoothstep(3. * px, 0., edge) + vec3(.5, .04, .08) * exp(-edge / 10.) * .5;
  }
  o = vec4(col, 1.);
}`,
  P: () => [BG.wallK || 0, 0, 0, 0],
};

// ── мъглата (ниво 4): гъсто зелено отвсякъде, освен където свети светлинната карта; петната дишат ──
const FOG = `#version 300 es
precision highp float;
uniform sampler2D uL; uniform vec2 uRes; uniform vec3 uView; uniform float uTime, uScroll, uDens; in vec2 vUV; out vec4 o;
float h12(vec2 p){ vec3 q = fract(vec3(p.xyx) * .1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f); return mix(mix(h12(i), h12(i + vec2(1, 0)), u.x), mix(h12(i + vec2(0, 1)), h12(i + 1.), u.x), u.y); }
float fbm3(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 3; i++) { s += a * vn(p); p = p * 2.07 + vec2(5.3, 1.7); a *= .5; } return s; }
void main(){
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y), w = (px - uView.xy) / uView.z;
  float L = texture(uL, vUV).r;
  float n = fbm3(w * .0035 + vec2(uScroll * .0006 + uTime * .015, uTime * .008)), n2 = fbm3(w * .01 - vec2(uTime * .03, 0.));
  float dens = uDens * clamp(.7 + .38 * n + .12 * n2, 0., 1.);
  float a = clamp(dens * (1. - smoothstep(.05, 1., L)), 0., 1.);
  // далечната мъгла е почти черна; около светлините мъглата сама свети (разсейване)
  vec3 fc = vec3(.004, .014, .011) * (.6 + .8 * n) + vec3(.004, .012, .01) * n2;
  float sc = smoothstep(0., 1.2, L) * .75;
  o = vec4(fc * a + vec3(.07, .26, .2) * sc * dens * (.55 + .5 * n), a);
}`;
// импулсът на пулсара (ниво 5): светлина от пулсара навсякъде, освен в сенките зад скалите — точно както в логиката
const FLOOD = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform vec3 uView; uniform float uI, uPre; uniform vec4 uRock[10]; uniform vec2 uP; in vec2 vUV; out vec4 o;
float seg(vec2 p, vec2 a, vec2 b){ vec2 v = b - a, w = p - a; float t = clamp(dot(w, v) / dot(v, v), 0., 1.); vec2 d = a + v * t - p; return dot(d, d); }
void main(){
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y), w = (px - uView.xy) / uView.z;
  float sh = 0.;
  for (int i = 0; i < 10; i++) { vec4 r = uRock[i]; if (r.z <= 0.) continue; if (r.x > w.x && seg(r.xy, uP, w) < r.z * r.z * 1.1) sh = 1.; }
  float fall = .45 + .55 * smoothstep(-300., 1400., w.x);
  vec3 c = vec3(.55, .75, 1.3) * fall * (1. - sh) * uI;
  c += vec3(.0, .0, .0);
  float edge = 0.; // при предупреждението сенките се очертават
  o = vec4(c + vec3(.05, .08, .16) * uPre * (1. - sh) * fall, 0.);
}`;
BG.fog = null; BG.flood = null;

BG.init = function () {
  for (const id in BG.defs) BG.progs[id] = R.progQ(BG.defs[id].fs);
  BG.fog = R.progQ(FOG); BG.flood = R.progQ(FLOOD);
};
// мъглата върху сцената: светлинната карта вече е нарисувана (R.lightBegin/End)
BG.drawFog = function (time, scroll, dens) {
  R.overlay(BG.fog, (p, gl) => {
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, R.lightTex()); gl.uniform1i(p.u.uL, 0);
    gl.uniform2f(p.u.uRes, R.w, R.h); gl.uniform3f(p.u.uView, R.view.x, R.view.y, R.view.s);
    gl.uniform1f(p.u.uTime, time); gl.uniform1f(p.u.uScroll, scroll); gl.uniform1f(p.u.uDens, dens);
  }, false);
};
// светлината на пулсара със сенките; rocks = [[x, y, r], …]
BG.drawFlood = function (I, pre, rocks, P) {
  const a = new Float32Array(40);
  rocks.slice(0, 10).forEach((r, i) => { a[i * 4] = r[0]; a[i * 4 + 1] = r[1]; a[i * 4 + 2] = r[2]; });
  R.overlay(BG.flood, (p, gl) => {
    gl.uniform2f(p.u.uRes, R.w, R.h); gl.uniform3f(p.u.uView, R.view.x, R.view.y, R.view.s);
    gl.uniform1f(p.u.uI, I); gl.uniform1f(p.u.uPre, pre); gl.uniform4fv(p.u.uRock, a); gl.uniform2f(p.u.uP, P.x, P.y);
  }, true);
};
// рисува се в буфера на фона (R.bgPass): размерът и изгледът са умножени по неговия мащаб
BG.draw = function (id, time, scroll) {
  const d = BG.defs[id], P = d.P ? d.P(scroll) : [0, 0, 0, 0], k = R.bs || 1;
  R.full(BG.progs[id], (p, gl) => {
    gl.uniform2f(p.u.uRes, R.bw, R.bh); gl.uniform3f(p.u.uView, R.view.x * k, R.view.y * k, R.view.s * k);
    gl.uniform1f(p.u.uTime, time); gl.uniform1f(p.u.uScroll, scroll); gl.uniform4f(p.u.uP, P[0], P[1], P[2], P[3]);
  });
};
BG.opts = id => BG.defs[id];
})();
