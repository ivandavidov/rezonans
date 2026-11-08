// Напредъкът: шестте нива (имената — и за заключените), хангарът, медалите и бонусите в края на нивото.
// Без DOM — проверява се и в Node.
(function () {
'use strict';
const S = (typeof window !== 'undefined' ? window : globalThis).SPACE;

S.LEVEL_INFO = [
  { n: 1, name: 'Ледените пръстени', boss: 'Стражът' },
  { n: 2, name: 'Кристалното поле', boss: 'Призмата' },
  { n: 3, name: 'Буреносният гигант', boss: 'Змеят' },
  { n: 4, name: 'Тъмната мъглявина', boss: 'Медузата' },
  { n: 5, name: 'Пулсарът', boss: 'Метрономът' },
  { n: 6, name: 'Крепостта на ордата', boss: 'Ядрото' },
];

// постоянните подобрения; cost[i] — цената на ниво i+1
S.HANGAR = [
  { id: 'hull', name: 'Здрав корпус', desc: 'корабът издържа още един удар', max: 2, cost: [150, 400] },
  { id: 'pow', name: 'Начална мощност', desc: 'оръдието започва с едно ниво по-силно', max: 2, cost: [200, 500] },
  { id: 'magnet', name: 'Магнит', desc: 'привлича нотите и кристалите отдалеч', max: 2, cost: [100, 250] },
  { id: 'res', name: 'Резонатор', desc: 'ударът се зарежда с 25 % по-бързо', max: 3, cost: [120, 260, 450] },
  { id: 'echo', name: 'Ехо от старта', desc: 'дрон до кораба още от началото на нивото', max: 1, cost: [600] },
  { id: 'lives', name: 'Резервен кораб', desc: 'по един кораб повече във всяко ниво', max: 2, cost: [300, 700] },
];
S.WEAPON_COST = { pulse: 0, fan: 250, beam: 400, wave: 400 };
S.WEAPON_DESC = {
  pulse: 'бърз изстрел право напред; с мощността стават повече',
  fan: 'изстрели във ветрило — добро срещу много врагове наведнъж',
  beam: 'непрекъснат лъч, минава през всички по пътя си',
  wave: 'вълнообразни изстрели, минават през щитове',
};

// корабът за началото на нивото от записа
S.shipFrom = sv => Object.assign({ weapon: sv.weapon || 'pulse' }, sv.hangar || {});

// бонуси и медал в края; cleared — минато ли е нивото
S.results = function (W, cleared) {
  const kp = W.spawnedF ? W.killsF / W.spawnedF : 0, acc = W.shots ? W.hits / W.shots : 0;
  const b = [];
  if (cleared) {
    b.push(['Унищожени ' + Math.round(kp * 100) + ' %', Math.round(kp * 100) * 150]);
    if (W.p.hits === 0) b.push(['Без нито един удар', 20000]);
    if (W.p.lives > 0) b.push(['Останали кораби × ' + W.p.lives, W.p.lives * 5000]);
  }
  const bonus = b.reduce((s, x) => s + x[1], 0);
  let medal = 0;
  if (cleared) medal = W.cont === 0 && W.deaths === 0 && kp >= 0.85 ? 3 : W.cont === 0 && W.deaths <= 1 && kp >= 0.7 ? 2 : 1;
  return { kp, acc, bonus, list: b, total: W.score + bonus, medal };
};
S.MEDALS = ['', 'бронз', 'сребро', 'злато'];
S.MEDAL_RULES = 'Бронз — нивото е минато. Сребро — без продължение, с най-много един загубен кораб и поне 70 % унищожени врагове. Злато — без загубен кораб и поне 85 % унищожени врагове.';
})();
