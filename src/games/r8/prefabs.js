/* ================= РЕЗОНАНС 8 · ГОТОВИ СЦЕНИ (defPrefab) =================
   Сцената се вмъква в генерираното ниво като сегмент; координатите — от S.b.x (курсорът), подът — S.b.gy. Подът в сцената е
   равен, затова декорът ѝ стои цял на земята; спирката и тролейбусът са на улицата (ред 15). */
const r8Flat=(S,lo,hi)=>{ if(S.b.gy<lo||S.b.gy>hi) S.stepTo(clamp(S.b.gy,lo,hi)); S.ground(2); };
defPrefab('r8stop',{build(S){   // „Спирката, която я нямаше“
  r8Flat(S,15,15); const {b,ground,noSpawn,decos,decosB,triggers}=S, x0=b.x, gy=b.gy; ground(10); for(let x=x0;x<x0+10;x++) noSpawn.add(x);
  decos.push(()=>r8Shelter((x0+3)*T,gy*T)); decosB.push(()=>r8Lamp((x0+5)*T,gy*T,true));
  triggers.push({x:x0+2,fn:()=>radio('На тази спирка вчера имаше аптека. Сега я няма — а хората чакат тролея, все едно нищо не е станало.')}); }});
defPrefab('r8balcony',{build(S){   // часовниковата кула и Петър на балкона
  r8Flat(S,11,14); const {b,ground,noSpawn,decos,decosB,triggers}=S, x0=b.x, gy=b.gy; ground(12); for(let x=x0;x<x0+12;x++) noSpawn.add(x);
  decos.push(()=>r8Tower((x0+4)*T,gy*T)); decosB.push(()=>r8Tower((x0+4)*T,gy*T));
  triggers.push({x:x0+1,fn:()=>radio('Виждаш ли кулата? Горе на балкона съм — махам ти с фенерчето. Часовникът е спрял на 1:00 и не иска да тръгне.')}); }});
defPrefab('r8bus',{build(S){   // празният тролейбус — покривът е площадка
  r8Flat(S,15,15); const {b,ground,fill,noSpawn,decos,triggers}=S, x0=b.x, gy=b.gy; ground(12); for(let x=x0;x<x0+12;x++) noSpawn.add(x);
  fill(x0+3,gy-3,x0+8,gy-3,'-'); decos.push(()=>r8Bus((x0+2)*T,gy*T));
  triggers.push({x:x0+2,fn:()=>showMsg('Тролейбусът е празен. Таблото показва маршрут, който не съществува: „ДЕПОТО — КУЛАТА — ДЕПОТО“.',4)}); }});
defPrefab('r8underpass',{build(S){   // подлезът — там беше Вела при първия удар; стълби от двете страни
  r8Flat(S,11,12); const {b,ground,fill,colG,noSpawn,decos,triggers}=S, x0=b.x, gy=b.gy; ground(3);
  const p0=b.x; for(let i=0;i<7;i++){ colG(b.x,gy+3); noSpawn.add(b.x); b.x++; } fill(p0,gy,p0,gy+2,'H'); fill(b.x-1,gy,b.x-1,gy+2,'H'); ground(3);
  decos.push(()=>{ r8Underpass(x0*T-4,gy*T); drawSign(x0,gy-3,'ПОДЛЕЗ'); });
  triggers.push({x:p0+2,fn:()=>showMsg('Тук беше Вела, когато кулата удари за първи път. Под земята тонът не стига — затова тя помни.',4)}); }});
defPrefab('r8wagon',{build(S){   // вагонът с чертежите
  r8Flat(S,15,15); const {b,ground,fill,noSpawn,decos,triggers}=S, x0=b.x, gy=b.gy; ground(10); for(let x=x0;x<x0+10;x++) noSpawn.add(x);
  fill(x0+1,gy-3,x0+6,gy-3,'-'); decos.push(()=>{ rails(x0,x0+9); r8Wagon(x0*T,gy*T); });
  triggers.push({x:x0+1,fn:()=>showMsg('Вагон, пълен с чертежи на Плевен. С червен молив са отбелязани улици, които още не съществуват.',4)}); }});
defPrefab('r8board',{build(S){   // черната дъска в аудиторията
  r8Flat(S,12,14); const {b,ground,noSpawn,decos,triggers}=S, x0=b.x, gy=b.gy; ground(8); for(let x=x0;x<x0+8;x++) noSpawn.add(x);
  decos.push(()=>r8Board((x0+2)*T,gy*T));
  triggers.push({x:x0+2,fn:()=>showMsg('На черната дъска: формули, карта на Плевен и думата „ЗАБРАВА“, подчертана три пъти.',4)}); }});
defPrefab('r8memlab',{build(S){   // апаратурата за паметта
  r8Flat(S,12,14); const {b,ground,noSpawn,decos,triggers}=S, x0=b.x, gy=b.gy; ground(8); for(let x=x0;x<x0+8;x++) noSpawn.add(x);
  decos.push(()=>r8MemLab((x0+2)*T,gy*T));
  triggers.push({x:x0+2,fn:()=>showMsg('На екрана — крива, която пада всяка нощ в един часа. До нея някой е написал: „Двама не се подчиняват.“',4.5)}); }});
defPrefab('r8maket',{build(S){   // макетът на града в голямата зала
  r8Flat(S,12,14); const {b,ground,noSpawn,decos,triggers}=S, x0=b.x, gy=b.gy; ground(9); for(let x=x0;x<x0+9;x++) noSpawn.add(x);
  decos.push(()=>r8Maket((x0+2)*T,gy*T));
  triggers.push({x:x0+2,fn:()=>showMsg('Макетът показва утрешната карта. Улиците между двете училища са начертани с червено — и около тях няма нищо.',4.5)}); }});
defPrefab('r8classroom',{build(S){   // класната стая на Вела — името ѝ на чина
  r8Flat(S,12,14); const {b,ground,noSpawn,decos,decosB,triggers}=S, x0=b.x, gy=b.gy; ground(10); for(let x=x0;x<x0+10;x++) noSpawn.add(x);
  for(const L of [decos,decosB]){ const m=L===decosB; L.push(()=>{ for(const dx of [1,4,7]) r8Desk((x0+dx)*T,gy*T,m); r8Globe((x0+9)*T,gy*T,m); }); }
  triggers.push({x:x0+4,fn:()=>showMsg('На един от чиновете някой е издълбал: „ВЕЛА Т., 5 „Б““. А до него, съвсем избледняло: „АСЕН Д.“',4.5)}); }});
defPrefab('r8zoo',{build(S){   // зоокътът — животните са будни и гледат натам, накъдето е пътят
  r8Flat(S,12,15); const {b,ground,noSpawn,decos,decosB,triggers}=S, x0=b.x, gy=b.gy; ground(10); for(let x=x0;x<x0+10;x++) noSpawn.add(x);
  for(const L of [decos,decosB]){ const m=L===decosB; L.push(()=>{ r8Cage((x0+2)*T,gy*T,m); r8Cage((x0+5)*T,gy*T,m); r8WaterWall((x0+8)*T,gy*T,m); }); }
  triggers.push({x:x0+2,fn:()=>showMsg('Животните от зоокъта са будни. Зайците гледат в една посока — натам, накъдето е пътят.',4)}); }});
