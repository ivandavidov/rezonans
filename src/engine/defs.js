/* ================= РЕГИСТРИ НА СЪДЪРЖАНИЕТО =================
   Двигателят вика съдържанието по тип; частите (и двигателят — за общото) го описват с def*():
     defFoe(id,{dims,upd,draw})   враг или подвижен обект: размери [w,h,hp], обновяване (e,dt), рисуване (e);
                                  флагове: fixed (закотвен: без физика като мъртъв, асансьорите и токът не го пипат, остава нащрек),
                                  noCrush, fly (появява се във въздуха), mech, human, glow (меко сияние); light(e,L) — своя светлина
     defBoss(id,{make,hurt,upd,draw,intro,name,col,sfx,norm,onTone,onCmd})   бос; norm — множител на здравето в оцеляването,
                                  onTone(разстояние) — реакция на тона (mech4), onCmd(курсор) — на команда (mech5);
                                  portal (голям портал при появата), dieSfx, keepT (таймерът не се нулира при прераждане),
                                  glow(b) — основната светлина [x,y,r,a], lights(L) — още светлини, onRespawn() — при прераждане в арената
     defItem(id,{take,draw})      предмет: take(k) → false, ако не е взет; draw(k,x,y)
     defTile(fn), defBack(fn)     собствен вид на плочките / на фона (fn връща true, ако е нарисувала)
   defFoes/defBosses(поле,{id:стойност,…}) задават едно поле на няколко наведнъж. Вече зададено поле спира играта с ясна грешка.
   addUnique — за общите речници (TH, SKIES, SV_THEMES, THEME_NAME, MUT_NAME). */
function addUnique(target,obj,what){ for(const k in obj){ if(k in target) throw new Error(what+': ключът „'+k+'“ вече е зает от друга игра'); target[k]=obj[k]; } }
const FOES={}, BOSSES={}, ITEMS={}, DIMS={}, TILE_FX=[], BACK_FX=[];
function defIn(R,what,id,d){ const o=R[id]||(R[id]={}); for(const k in d){ if(k in o) throw new Error(what+': „'+id+'.'+k+'“ вече е зададено'); o[k]=d[k]; } }
function defFoe(id,d){ defIn(FOES,'defFoe',id,d); if(d.dims) DIMS[id]=d.dims; }
const defBoss=(id,d)=>defIn(BOSSES,'defBoss',id,d), defItem=(id,d)=>defIn(ITEMS,'defItem',id,d);
const defFoes=(f,m)=>{ for(const id in m) defFoe(id,{[f]:m[id]}); }, defBosses=(f,m)=>{ for(const id in m) defBoss(id,{[f]:m[id]}); };
const defTile=fn=>{ TILE_FX.push(fn); }, defBack=fn=>{ BACK_FX.push(fn); };
const bossNorm=t=>(BOSSES[t]&&BOSSES[t].norm)||1;
