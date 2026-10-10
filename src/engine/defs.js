/* ================= РЕГИСТРИ НА СЪДЪРЖАНИЕТО =================
   Двигателят вика съдържанието по тип; частите (и двигателят — за общото) го описват с def*():
     defFoe(id,{dims,upd,draw})   враг или подвижен обект: размери [w,h,hp], обновяване (e,dt), рисуване (e);
                                  флагове: fixed (закотвен: без физика като мъртъв, асансьорите и токът не го пипат, остава нащрек),
                                  noCrush, fly (появява се във въздуха), mech, human, glow (меко сияние); light(e,L) — своя светлина;
                                  noKnock (ударът не го отмества), hp1 (здраве 1 на всяка трудност), noEscBite (не хапе спътника),
                                  chargeLight (свети, докато се засилва), noTorch (без отблясък от фенерчето), gore (колко кръв),
                                  radio / dropSfx (звукът, когато скача в сражение); куки: hit(e) — при удар, pain(e) — при удар без
                                  смърт, dieFx(e,cx,cy) — вместо общия ефект при смърт, die(e,cx,cy) — след него
     defBoss(id,{make,hurt,upd,draw,intro,name,col,sfx,norm,onTone,onCmd})   бос; norm — множител на здравето в оцеляването,
                                  onTone(разстояние) — реакция на тона (механиката tone), onCmd(курсор) — на команда (cursors);
                                  portal (голям портал при появата), dieSfx, keepT (таймерът не се нулира при прераждане),
                                  glow(b) — основната светлина [x,y,r,a], lights(L) — още светлини, onRespawn() — при прераждане в арената
     defItem(id,{take,draw})      предмет: take(k) → false, ако не е взет; draw(k,x,y)
     defWeapon(id,{name,kind,cap,res,reload,auto,fire,sprite,rot,flash,casing,light})   оръжие — виж engine/lib/weapons.js
     defTile(fn), defBack(fn)     собствен вид на плочките / на фона (fn връща true, ако е нарисувала)
     defPrefab(id,{build(S)})     готова сцена в генерирано ниво (engine/episodes.js): S — инструментите на генератора (курсорът
                                  S.b {x,gy}, ground, stepTo, fill, set, colG, fixed, triggers, lifts …, сегментите S.F); координатите — от S.b.x
   defFoes/defBosses(поле,{id:стойност,…}) задават едно поле на няколко наведнъж. Вече зададено поле спира играта с ясна грешка.
   addUnique — за общите речници (TH, SKIES, SV_THEMES, THEME_NAME, MUT_NAME). */
function addUnique(target,obj,what){ for(const k in obj){ if(k in target) throw new Error(what+': ключът „'+k+'“ вече е зает от друга игра'); target[k]=obj[k]; } }
const FOES={}, BOSSES={}, ITEMS={}, WEAPONS={}, DIMS={}, TILE_FX=[], BACK_FX=[], PREFABS={};
function defIn(R,what,id,d){ const o=R[id]||(R[id]={}); for(const k in d){ if(k in o) throw new Error(what+': „'+id+'.'+k+'“ вече е зададено'); o[k]=d[k]; } }
function defFoe(id,d){ defIn(FOES,'defFoe',id,d); if(d.dims) DIMS[id]=d.dims; }
const defBoss=(id,d)=>defIn(BOSSES,'defBoss',id,d), defItem=(id,d)=>defIn(ITEMS,'defItem',id,d), defPrefab=(id,d)=>defIn(PREFABS,'defPrefab',id,d);
// оръжие (engine/lib/weapons.js): редът на регистрация е редът на клавишите 1–6; таблиците NAMES/ORDER/CAP/RES_MAX се пълнят оттук
function defWeapon(id,d){ defIn(WEAPONS,'defWeapon',id,d); if(d.name){ NAMES[id]=d.name; ORDER.push(id); if(d.kind!=='melee'){ CAP[id]=d.cap; RES_MAX[id]=d.res||0; } } }
const defFoes=(f,m)=>{ for(const id in m) defFoe(id,{[f]:m[id]}); }, defBosses=(f,m)=>{ for(const id in m) defBoss(id,{[f]:m[id]}); };
const defTile=fn=>{ TILE_FX.push(fn); }, defBack=fn=>{ BACK_FX.push(fn); };
const bossNorm=t=>(BOSSES[t]&&BOSSES[t].norm)||1;
