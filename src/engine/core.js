const W=480,H=272,T=16,ROWS=17,S=2;
let COLS=126, G=900;
const cv=document.getElementById('game'), ctx=cv.getContext('2d');
cv.width=W*S; cv.height=H*S;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const rnd=(a,b)=>b===undefined?Math.random()*a:a+Math.random()*(b-a);
const sgn=v=>v<0?-1:1;
function hash(x,y){let h=(x*374761393+y*668265263)|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967295;}
const angDiff=(a,b)=>{let d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d;};
const ov=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
/* записите (localStorage) — договорът с играчите: ключовете не се преименуват. Общи: rz.diff (трудност), rz.audio (музика и
   ефекти), rz.selftest (самопроверките на Mac/Windows). На частта — KEY(име) = GAME.key+'.'+име (r1: rz, после rz2 …): unlocked,
   mem, best/bestK/svSave + трудността (0–2), ending/done (r3–r7 ги пишат с пълното име). build.py спира при ключ извън списъка. */
const STORE_KEYS=['rz.diff','rz.audio','rz.selftest'], STORE_PART=['unlocked','mem','best','bestK','svSave','ending','done'];
const store={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:v;}catch(e){return d;}},set(k,v){if(store.lock&&store.lock(k))return;try{localStorage.setItem(k,String(v));}catch(e){}},del(k){try{localStorage.removeItem(k);}catch(e){}}};   // lock — от чийтовете

