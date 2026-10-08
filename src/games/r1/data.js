/* ================= РЕЗОНАНС 1 · ГЛАВИ, ОТКЛЮЧЕНИ ЕПИЗОДИ ================= */
const CHAPTERS=['СЕКТОР 7','ДЪЛБИНИТЕ','ПРОБИВЪТ','ЧУЖДИЯТ СВЯТ','ЗАВРЪЩАНЕТО'];
const chLabel=c=>c===4?'БОНУС ГЛАВА':'ГЛАВА '+ROM[c];
const chOf=i=>Math.floor(i/5);
// отключените епизоди (rz.unlocked; стар запис 20 се чете като 21 — началото на бонус главата)
let unlocked=clamp(parseInt(store.get('rz.unlocked','1'),10)||1,1,25); if(unlocked>=20&&unlocked<21) unlocked=21;
const LEVELS=[];   // levels_c1…c5.js добавят по пет епизода
