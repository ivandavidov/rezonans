/* ================= РЕЗОНАНС 8 · ДЕКОР =================
   Каквото стои на земята, е с fy (линията на пода, px); x — левият край на колоната в px. СПОМЕН (mem) — по-старият град:
   газени фенери, повече дървета, без жици. */
function r8Lamp(x,fy,mem){
  if(mem){ R(x+7,fy-44,2,44,'#2a2016'); R(x+5,fy-3,6,3,'#2a2016'); R(x+4,fy-53,8,9,'#2a2016'); R(x+5,fy-52,6,7,'#ffd88a'); R(x+6,fy-55,4,2,'#2a2016'); lightDot(x+8,fy-49,'#ffc870',0); return; }
  R(x+7,fy-52,2,52,'#3a4048'); R(x+5,fy-3,6,3,'#3a4048'); R(x+8,fy-52,10,2,'#3a4048'); R(x+15,fy-50,6,3,'#5a6068'); R(x+16,fy-47,4,1,'#fff0c0'); lightDot(x+18,fy-45,'#ffd8a0',0);
}
function r8Tree(x,fy,mem){
  R(x+7,fy-22,3,22,mem?'#4a3220':'#1c1814');
  lx.fillStyle=mem?'#5a7a3a':'#16241e'; lx.beginPath(); lx.ellipse(x+8,fy-31,14,12,0,0,7); lx.fill();
  lx.fillStyle=mem?'#7a9a4a':'#1e3028'; lx.beginPath(); lx.ellipse(x+5,fy-35,7,6,0,0,7); lx.fill();
}
function r8Bench(x,fy,mem){ const w=mem?'#8a5a32':'#4a3a2c', l='#22262e';
  R(x+1,fy-12,14,2,w); R(x+1,fy-8,14,2,w); R(x+2,fy-6,2,6,l); R(x+12,fy-6,2,6,l); R(x+2,fy-12,1,6,l); R(x+13,fy-12,1,6,l); }
function r8Bin(x,fy){ R(x+5,fy-10,6,10,'#2a3a30'); R(x+4,fy-11,8,2,'#3a4a40'); R(x+6,fy-8,4,1,'#1a2420'); }
function r8Column(x,fy,mem){   // афишна колона
  R(x+3,fy-34,10,34,mem?'#c8b08a':'#5a5a62'); R(x+2,fy-36,12,3,mem?'#6a4a2a':'#3a3a42'); R(x+5,fy-39,6,3,mem?'#6a4a2a':'#3a3a42');
  R(x+4,fy-28,8,9,mem?'#e8d8b0':'#8a6a4a'); R(x+4,fy-17,8,6,mem?'#b85a3a':'#3a4a6a'); R(x+3,fy-2,10,2,mem?'#6a4a2a':'#3a3a42'); }
function r8StreetDeco(x,fy,h,mem){
  if(h>0.8) r8Lamp(x,fy,mem); else if(h>(mem?0.55:0.68)) r8Tree(x,fy,mem); else if(h>0.6) r8Bench(x,fy,mem);
  else if(h>0.52) mem?r8Column(x,fy,true):r8Bin(x,fy); else if(h>0.47) r8Column(x,fy,mem); }
function r8Shelter(x,fy){   // спирката: покрив, стъкло, пейка, табела „Т“
  R(x,fy-40,44,3,'#3a4250'); R(x+2,fy-37,2,37,'#5a6270'); R(x+40,fy-37,2,37,'#5a6270'); R(x+4,fy-36,36,24,'rgba(140,180,220,0.18)');
  R(x+8,fy-12,28,2,'#4a3a2c'); R(x+10,fy-10,2,10,'#22262e'); R(x+32,fy-10,2,10,'#22262e');
  R(x+46,fy-48,2,48,'#3a4048'); R(x+42,fy-58,10,10,'#e8ecf0'); R(x+43,fy-57,8,8,'#2a6ad8'); R(x+46,fy-56,2,6,'#ffffff'); R(x+44,fy-56,6,2,'#ffffff'); }
function r8Tower(x,fy){   // часовниковата кула — Петър е горе, на балкона
  R(x,fy-150,40,150,'#2e3448'); R(x-4,fy-150,48,6,'#3e4660'); R(x+4,fy-176,32,26,'#2a3044');
  lx.fillStyle='#2a3044'; lx.beginPath(); lx.moveTo(x+2,fy-176); lx.lineTo(x+20,fy-200); lx.lineTo(x+38,fy-176); lx.fill();
  lx.fillStyle='#f0e6c8'; lx.beginPath(); lx.arc(x+20,fy-163,10,0,7); lx.fill();
  lx.strokeStyle='#1a1e2a'; lx.lineWidth=2; lx.beginPath(); lx.moveTo(x+20,fy-163); lx.lineTo(x+20,fy-171); lx.moveTo(x+20,fy-163); lx.lineTo(x+23,fy-168); lx.stroke(); lx.lineWidth=1;   // 1:00 — голямата стрелка на 12, малката на 1
  lightDot(x+20,fy-163,'#fff0c0',0);
  R(x-4,fy-112,48,3,'#3e4660'); for(let i=0;i<6;i++) R(x-3+i*8,fy-120,2,8,'#3e4660'); R(x+14,fy-128,4,16,'#ffd27a');   // балконът и Петър
  for(let wy=fy-96;wy<fy-12;wy+=22){ R(x+14,wy,12,14,'#161a26'); R(x+15,wy+1,10,12,hash(x,wy)>0.5?'#f0c870':'#1e2840'); }
  R(x+12,fy-24,16,24,'#1a1e2a'); }
function r8Bus(x,fy){   // празният тролейбус: покривът е площадка (ред над него), отпред светнато табло
  R(x+2,fy-44,108,36,'#b8322a'); R(x+2,fy-44,108,14,'#e8dcc0'); for(let i=0;i<6;i++) R(x+8+i*17,fy-41,13,10,'#1a2a3a');
  R(x+92,fy-41,16,6,'#ffb04a'); R(x+2,fy-20,108,3,'#7a1a14'); R(x+30,fy-30,12,22,'#2a1a18');
  for(const wx of [18,90]){ lx.fillStyle='#14161c'; lx.beginPath(); lx.arc(x+wx,fy-6,7,0,7); lx.fill(); R(x+wx-2,fy-8,4,4,'#5a6068'); }
  R(x+40,fy-58,2,14,'#22262e'); R(x+52,fy-60,2,16,'#22262e'); }
// тролейбусните жици над улицата — рисуват се всеки кадър (в СПОМЕН ги няма: тролеите идват чак през 1985 г.)
function r8Wires(){ if(ERAD&&ERA===1) return; const y0=3*T+6, a=Math.floor(cam/160)*160-160;
  ctx.save(); ctx.strokeStyle='rgba(150,160,190,0.55)'; ctx.lineWidth=1;
  for(const dy of [0,5]){ ctx.beginPath(); for(let x=a;x<cam+W+160;x+=160){ ctx.moveTo(x-cam,y0+dy); ctx.quadraticCurveTo(x+80-cam,y0+dy+7,x+160-cam,y0+dy); } ctx.stroke(); }
  ctx.restore(); }
/* ---------- гарата ---------- */
function r8Signal(x,fy,h){   // светофар до релсите: червено или зелено
  R(x+7,fy-40,2,40,'#2a2e36'); R(x+4,fy-48,8,14,'#14161c'); const red=h>0.5;
  R(x+6,fy-46,4,4,red?'#ff4a3a':'#3a1a16'); R(x+6,fy-40,4,4,red?'#163a20':'#4aff7a'); lightDot(x+8,red?fy-44:fy-38,red?'#ff6a5a':'#6aff9a',1); R(x+5,fy-2,6,2,'#2a2e36'); }
function r8Cart(x,fy){   // багажна количка
  R(x+1,fy-10,14,6,'#5a4a3a'); R(x+1,fy-12,14,2,'#7a6a52'); R(x+2,fy-16,6,4,'#8a6a42'); R(x+9,fy-15,5,3,'#4a5a6a');
  for(const wx of [4,12]){ lx.fillStyle='#14161c'; lx.beginPath(); lx.arc(x+wx,fy-2,2,0,7); lx.fill(); } }
function r8RailDeco(x,fy,h){ if(h>0.8) r8Lamp(x,fy,false); else if(h>0.7) r8Signal(x,fy,hash(x,fy)); else if(h>0.62) r8Bench(x,fy,false); else if(h>0.55) r8Cart(x,fy); }
function r8Wagon(x,fy){   // товарен вагон на релсите — покривът е площадка
  R(x+2,fy-42,104,32,'#2e4a36'); R(x+2,fy-42,104,3,'#4a6a50'); for(let i=0;i<6;i++) R(x+8+i*17,fy-38,2,26,'#22382a');
  R(x+42,fy-36,24,22,'#1a2a20'); R(x+44,fy-34,20,18,'#e8dcc0'); R(x+46,fy-30,16,1,'#b8322a'); R(x+46,fy-26,12,1,'#3a4a6a'); R(x+46,fy-22,14,1,'#3a4a6a');   // чертежът на вратата
  R(x,fy-10,108,3,'#1a1c20'); for(const wx of [14,30,78,94]){ lx.fillStyle='#14161c'; lx.beginPath(); lx.arc(x+wx,fy-5,5,0,7); lx.fill(); } }
function r8Underpass(x,fy){   // табелата на подлеза — на две колони, на земята
  R(x+2,fy-30,2,30,'#3a4048'); R(x+30,fy-30,2,30,'#3a4048'); R(x,fy-38,34,10,'#2a6ad8'); R(x+1,fy-37,32,8,'#1a4aa8'); }
/* ---------- университетът ---------- */
function r8Bench2(x,fy){   // лабораторна маса с колби
  R(x-4,fy-14,24,3,'#c8d0c8'); R(x-3,fy-11,2,11,'#5a6660'); R(x+15,fy-11,2,11,'#5a6660'); R(x-2,fy-6,20,1,'#5a6660');
  R(x,fy-20,3,6,'#8ad8ff'); R(x+1,fy-22,1,2,'#c8e8f0'); R(x+6,fy-19,5,5,'#9aff8a'); R(x+7,fy-21,3,2,'#c8e8f0'); R(x+13,fy-18,2,4,'#ffb04a'); }
function r8Skeleton(x,fy){   // учебният скелет на стойка
  R(x+7,fy-4,2,4,'#3a4440'); R(x+3,fy-2,10,2,'#3a4440'); R(x+7,fy-40,1,36,'#3a4440');
  R(x+6,fy-38,5,5,'#e8e4d4'); R(x+7,fy-33,3,12,'#d8d4c4'); for(let i=0;i<4;i++) R(x+4,fy-31+i*3,9,1,'#d8d4c4');
  R(x+4,fy-21,9,2,'#d8d4c4'); R(x+5,fy-19,2,14,'#d8d4c4'); R(x+10,fy-19,2,14,'#d8d4c4'); R(x+3,fy-31,1,11,'#d8d4c4'); R(x+13,fy-31,1,11,'#d8d4c4'); }
function r8Cabinet(x,fy){ R(x+1,fy-30,14,30,'#5a6a72'); R(x+2,fy-29,12,12,'#9ac8d8'); R(x+8,fy-29,1,12,'#5a6a72'); R(x+3,fy-24,3,4,'#ffb04a'); R(x+9,fy-26,3,6,'#8aff9a'); R(x+2,fy-15,12,1,'#3a4650'); }
function r8LabDeco(x,fy,h){ if(h>0.84) r8Skeleton(x,fy); else if(h>0.7) r8Bench2(x,fy); else if(h>0.6) r8Cabinet(x,fy); }
function r8Board(x,fy){   // голямата черна дъска на стойки — формулите и картата на Плевен
  R(x+2,fy-60,2,60,'#3a2a1a'); R(x+60,fy-60,2,60,'#3a2a1a'); R(x,fy-64,64,36,'#6a5a3a'); R(x+2,fy-62,60,32,'#14201a');
  lx.fillStyle='#d8e0d8'; lx.font='600 6px "IBM Plex Mono",monospace'; lx.fillText('f = 1/T',x+6,fy-53); lx.fillText('ЗАБРАВА',x+30,fy-36);
  R(x+30,fy-34,28,1,'#d8e0d8'); R(x+30,fy-33,28,1,'#d8e0d8'); R(x+30,fy-32,28,1,'#ff8a6a');
  for(let i=0;i<5;i++) R(x+6+i*4,fy-46+(i%2)*3,3,1,'#d8e0d8'); lx.strokeStyle='#ffb04a'; lx.strokeRect(x+40,fy-58,16,12); }
function r8MemLab(x,fy){   // апаратурата за паметта: шкаф с екрани и падаща крива
  R(x,fy-44,48,44,'#3a4650'); R(x+2,fy-42,44,4,'#5a6a72'); R(x+4,fy-34,40,20,'#0a1410');
  lx.strokeStyle='#8aff8a'; lx.beginPath(); lx.moveTo(x+5,fy-30); for(let i=0;i<38;i+=2) lx.lineTo(x+5+i,fy-30+i*0.35+Math.sin(i)*1.5); lx.stroke();
  lx.strokeStyle='#ffb04a'; lx.beginPath(); lx.moveTo(x+5,fy-26); lx.lineTo(x+43,fy-26); lx.stroke();
  for(let i=0;i<5;i++) R(x+6+i*8,fy-10,4,4,i%2?'#ff4a3a':'#8aff8a'); lightDot(x+24,fy-24,'#8aff8a',1); }
/* ---------- музеят ---------- */
function r8Vitrine(x,fy,h){   // витрина с експонат
  R(x-2,fy-12,20,12,'#4a3a2a'); R(x-1,fy-11,18,1,'#6a5840'); R(x-2,fy-34,20,22,'rgba(160,200,220,0.22)'); R(x-2,fy-34,20,1,'#c8e0f0'); R(x-2,fy-34,1,22,'#a8c8d8'); R(x+17,fy-34,1,22,'#a8c8d8');
  if(h>0.5){ R(x+5,fy-24,6,10,'#a87a3a'); R(x+6,fy-26,4,2,'#c89a4a'); } else { R(x+2,fy-18,12,4,'#8a8a92'); R(x+3,fy-22,3,4,'#6a6a72'); } }
function r8Bust(x,fy){ R(x+3,fy-20,10,20,'#8a8478'); R(x+2,fy-22,12,2,'#a8a294'); R(x+5,fy-32,6,8,'#b8b2a4'); R(x+4,fy-26,8,4,'#a8a294'); R(x+6,fy-30,1,1,'#5a5448'); R(x+9,fy-30,1,1,'#5a5448'); }
function r8Rope(x,fy){ for(const sx of [0,14]){ R(x+sx,fy-16,2,16,'#c8a050'); R(x+sx-1,fy-2,4,2,'#8a6a32'); }
  lx.strokeStyle='#8a1a2a'; lx.lineWidth=2; lx.beginPath(); lx.moveTo(x+1,fy-14); lx.quadraticCurveTo(x+8,fy-8,x+15,fy-14); lx.stroke(); lx.lineWidth=1; }
function r8MuseumDeco(x,fy,h){ if(h>0.8) r8Vitrine(x,fy,hash(x,fy)); else if(h>0.7) r8Bust(x,fy); else if(h>0.6) r8Rope(x,fy); }
function r8Maket(x,fy){   // макетът на Плевен на голяма маса
  R(x,fy-18,80,4,'#6a4a2a'); R(x+2,fy-14,3,14,'#4a3220'); R(x+75,fy-14,3,14,'#4a3220'); R(x+2,fy-20,76,2,'#4a6a3a');
  for(let i=0;i<12;i++){ const hx=x+4+i*6, hh=3+Math.floor(hash(i,7)*6); R(hx,fy-20-hh,5,hh,i===4||i===8?'#ffb04a':'#c8b89a'); R(hx,fy-20-hh,5,1,'#8a3a2a'); }
  R(x+40,fy-34,3,14,'#c8b89a'); R(x+39,fy-36,5,2,'#8a3a2a'); }
/* ---------- училището и дворът ---------- */
function r8Desk(x,fy,mem){ const w=mem?'#a87a4a':'#5a4630';   // чин с две столчета
  R(x-2,fy-14,20,3,w); R(x-1,fy-11,2,11,'#3a3a42'); R(x+15,fy-11,2,11,'#3a3a42'); R(x,fy-6,4,1,'#3a3a42'); R(x+12,fy-6,4,1,'#3a3a42');
  if(mem){ R(x+2,fy-17,6,3,'#e8e0d0'); R(x+10,fy-16,4,2,'#c84a3a'); } }
function r8Globe(x,fy,mem){ R(x+7,fy-10,2,10,'#3a3a42'); R(x+4,fy-2,8,2,'#3a3a42'); lx.fillStyle=mem?'#4a8ad8':'#1e3a5a'; lx.beginPath(); lx.arc(x+8,fy-16,6,0,7); lx.fill();
  R(x+5,fy-18,4,3,mem?'#6ab84a':'#24402a'); R(x+9,fy-14,3,2,mem?'#6ab84a':'#24402a'); }
function r8Pot(x,fy,mem){ R(x+5,fy-8,6,8,'#a85a3a'); R(x+4,fy-9,8,2,'#c86a4a'); lx.fillStyle=mem?'#5aa83a':'#24402a'; lx.beginPath(); lx.ellipse(x+8,fy-14,6,6,0,0,7); lx.fill(); }
function r8SchoolDeco(x,fy,h,mem){ if(h>0.72) r8Desk(x,fy,mem); else if(h>0.62) r8Globe(x,fy,mem); else if(h>0.54) r8Pot(x,fy,mem); }
function r8BookBench(x,fy,mem){   // пейка — разтворена книга
  R(x-2,fy-8,2,8,'#5a4630'); R(x+16,fy-8,2,8,'#5a4630');
  lx.fillStyle=mem?'#f4ecd4':'#a8a090'; lx.beginPath(); lx.moveTo(x-4,fy-10); lx.lineTo(x+8,fy-7); lx.lineTo(x+20,fy-10); lx.lineTo(x+20,fy-6); lx.lineTo(x+8,fy-3); lx.lineTo(x-4,fy-6); lx.fill();
  R(x+7,fy-8,2,5,mem?'#c84a3a':'#6a2a22'); for(let i=0;i<3;i++){ R(x-1+i*2,fy-8+i,4,1,'#8a8070'); R(x+11+i*2,fy-7-i,4,1,'#8a8070'); } }
function r8Cage(x,fy,mem){   // зоокътът: клетка със заек
  R(x-4,fy-2,26,2,'#5a4630'); R(x-4,fy-24,26,2,'#5a4630'); for(let i=0;i<7;i++) R(x-4+i*4,fy-22,1,20,'#8a8478');
  R(x+3,fy-8,8,6,mem?'#f0ece4':'#a8a49a'); R(x+9,fy-11,4,4,mem?'#f0ece4':'#a8a49a'); R(x+10,fy-15,1,4,mem?'#f0ece4':'#a8a49a'); R(x+12,fy-15,1,4,mem?'#f0ece4':'#a8a49a'); R(x+12,fy-10,1,1,'#c84a5a'); }
function r8WaterWall(x,fy,mem){   // водната стена — тече нагоре при всеки удар
  R(x-4,fy-30,24,30,'#5a6a72'); R(x-2,fy-28,20,26,mem?'#7ac8f0':'#2a5a7a'); for(let i=0;i<5;i++) R(x-1+i*4,fy-27,1,24,mem?'#c8ecff':'#5a9ac8'); R(x-6,fy-4,28,4,'#4a5a62'); }
function r8Hoop(x,fy){ R(x+7,fy-48,2,48,'#3a3a42'); R(x+2,fy-52,14,10,'#e8e8e8'); R(x+5,fy-48,8,5,'#c84a3a'); R(x+9,fy-42,8,2,'#ff8a3a'); R(x+5,fy-2,6,2,'#3a3a42'); }
function r8YardDeco(x,fy,h,mem){ if(h>0.84) r8Tree(x,fy,mem); else if(h>0.74) r8BookBench(x,fy,mem); else if(h>0.66) r8Cage(x,fy,mem); else if(h>0.6) r8Hoop(x,fy); else if(h>0.55) r8Lamp(x,fy,mem); }
// финалът: бюстът на Ботев и малкото дървено оръдие в двора (рисуват се всеки кадър, в арената)
function r8Final(){ const a=LVL.arena; if(!a) return; const gy=15*T, m=ERAD&&ERA===1;
  const bx=Math.round((a.door+22)*T-cam); ctx.fillStyle='#6a6458'; ctx.fillRect(bx,gy-24,16,24); ctx.fillStyle='#8a8478'; ctx.fillRect(bx-2,gy-26,20,3);
  ctx.fillStyle=m?'#4a6a5a':'#3a4a42'; ctx.fillRect(bx+2,gy-36,12,10); ctx.fillRect(bx+4,gy-44,8,9); ctx.fillStyle=m?'#5a7a6a':'#4a5a52'; ctx.fillRect(bx+3,gy-46,10,3);
  if(m){ ctx.fillStyle='#c84a3a'; ctx.fillRect(bx+1,gy-26,3,3); ctx.fillStyle='#ffd27a'; ctx.fillRect(bx+12,gy-27,3,3); }
  const cx=Math.round((a.door+3)*T-cam);   // оръдието: в СЕГА — играчка от дърво, в СПОМЕН — истинско
  ctx.fillStyle=m?'#3a3a42':'#8a5a32'; ctx.fillRect(cx-2,gy-15,24,7); ctx.fillStyle=m?'#22222a':'#6a4224'; ctx.fillRect(cx+18,gy-16,5,9);
  ctx.fillStyle=m?'#4a3a2a':'#a87a4a'; for(const wx of [2,14]){ ctx.beginPath(); ctx.arc(cx+wx,gy-6,6,0,7); ctx.fill(); } ctx.fillStyle='#2a1e14'; for(const wx of [2,14]) ctx.fillRect(cx+wx-1,gy-7,2,2); }
