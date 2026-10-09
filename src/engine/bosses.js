/* ================= BOSSES ================= */
const makeBoss=()=>BOSSES[LVL.arena.type].make();
const bossSfx=t=>(BOSSES[t]||{}).sfx||'roar';
function startBoss(){
  const a=LVL.arena; setCp(a.cp!=null?a.cp:a.door+2); bossActive=true;
  if(a.door!=null){ setDoor([a.door,a.r0,a.r1],'D'); SFX.door(); shake=6; }
  boss=makeBoss(); boss.hp*=bossMul; boss.max*=bossMul;
  if(BOSSES[a.type].portal) portals.push({x:boss.x+boss.w/2,y:boss.y+boss.h/2,t:0,spawned:true,type:'boss',big:true});
  SFX.alarm(3); sfxAt(bossSfx(boss.type),boss); bossMusic=true;
  showMsg(BOSSES[a.type].intro,4.5);
}
function hurtBoss(d,blast){ BOSSES[boss.type].hurt(chtOn('onehit')?d*10:d,blast); }
function bossDie(){ const b=boss; b.hp=0; b.dead=true; b.deathT=0; b.vx=0; b.vy=0; stats.kills++; sfxAt(BOSSES[b.type].dieSfx||(b.mech?'boom':'roar'),b); for(const e of enemies) if(e.summoned&&!e.dead) hurtEnemy(e,999,0); }
function bossDeathFx(b,dt){
  b.deathT+=dt; b.boomT-=dt;
  if(b.boomT<=0&&b.deathT<2.6){ b.boomT=0.22; const ex=b.x+rnd(b.w),ey=b.y+rnd(b.h), mc=b.mech; for(let i=0;i<16;i++){const a=rnd(6.28),s=rnd(30,150);part(ex,ey,Math.cos(a)*s,Math.sin(a)*s,rnd(0.3,0.6),['#fff1a8',mc?'#ff6a1a':'#9dff5a','#ffb53a'][i%3],rnd(2,4),40,1);} sfxAt('boom',b); shake=7; light(ex,ey,120,0.9,mc?'rgba(255,150,40,':'rgba(160,255,90,'); if(mc) for(let i=0;i<4;i++) part(ex,ey,rnd(-20,20),rnd(-50,-20),rnd(0.8,1.4),'#2a2a2a',rnd(4,7),-10,2); else blood(ex,ey,true,10); }
  if(b.deathT>2.6&&!exitPortal&&!b.exitDone){
    const a=LVL.arena; b.exitDone=true; bossMusic=false; bossActive=false; SFX.door();
    if(a.exitDoor) setDoor(a.exitDoor,'.');
    else { exitPortal={x:a.px*T,y:a.py*T,t:0}; sfxAt('portal',{x:a.px*T,y:a.py*T,w:0}); }
    radio(a.msg);
  }
}
function volley(b,offset){
  const p=player, ox=b.x+b.w/2, oy=b.y+b.h/2+6, base=Math.atan2(p.y+p.h/2-oy,p.x+p.w/2-ox);
  const n=[3,5,7][b.phase-1]+D.volley, spread=0.22, sp=115*D.bspd*(b.phase===3?1.15:1);
  for(let i=0;i<n;i++){ const a=base+(i-(n-1)/2)*spread+(offset?spread/2:0); ebullets.push({x:ox,y:oy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:5,dmg:10,r:4,orb:true}); }
  sfxAt('orb',b); light(ox,oy,100,0.9,'rgba(200,120,255,');
}


