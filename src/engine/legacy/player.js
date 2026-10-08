/* ================= PLAYER ================= */
const ladderAt=(x,y)=>tileP(x,y)==='H';
function onOneWay(e){ const ty=Math.floor((e.y+e.h+1)/T); for(let tx=Math.floor(e.x/T);tx<=Math.floor((e.x+e.w-0.01)/T);tx++){ const c=tileAt(tx,ty); if(c==='-'||c==='H') return true; } return false; }
const elecOn=()=>{ const cyc=DI===0?3.8:DI===2?3.0:3.4, on=DI===0?1.0:DI===2?1.6:1.3; return (lvT%cyc)<on; };
const elecWarn=()=>{ const cyc=DI===0?3.8:DI===2?3.0:3.4; return (lvT%cyc)>cyc-0.6; };
function updPlayer(dt){
  const p=player;
  p.cool-=dt; p.flashT-=dt; p.swingT-=dt; p.inv-=dt; p.hurtT-=dt; p.hurtAgo+=dt;
  if(p.dead){ p.deadT+=dt; p.vx*=0.9; p.vy=Math.min(p.vy+G*dt,520); moveX(p,p.vx*dt); moveY(p,p.vy*dt); return; }
  if(p.y>ROWS*T+30){
    SFX.fall(); p.hp-=D.fall; dmgFlash=0.6; p.hurtAgo=0;
    if(p.hp<=0) die();
    else { p.x=cp*T+3; if(p.crouch){ p.crouch=false; p.h=26; } p.y=groundY(cp)-p.h; p.vx=p.vy=0; p.inv=1.2; p.climb=false; }
    return;
  }
  const ctrl=intro.lock<=0;
  const L=ctrl&&keys.left, Rr=ctrl&&keys.right, U=ctrl&&(SEQ&&FLIP?keys.down:keys.up), Dn=ctrl&&(SEQ&&FLIP?keys.up:keys.down), C=ctrl&&keys.crouch;
  const dir=(Rr?1:0)-(L?1:0);
  if(C&&!p.crouch&&!p.climb&&!p.swim){ p.crouch=true; p.y+=12; p.h=14; }
  else if(!C&&p.crouch&&!rectSolid(p.x,p.y-12,p.w,26)){ p.crouch=false; p.y-=12; p.h=26; }
  if(dir) p.face=dir;
  p.aimUp=!!U&&!p.climb;
  const inSlime=rectHas(p.x,p.y+p.h-6,p.w,6,'~');
  const cx=p.x+p.w/2, bot=p.y+p.h;
  if(!p.climb&&!p.crouch&&((U&&ladderAt(cx,bot-2))||(Dn&&ladderAt(cx,bot+3)&&p.onGround))){ p.climb=true; p.x=Math.floor(cx/T)*T+T/2-p.w/2; p.vx=0; p.vy=0; }
  if(r2Move(p,dt,dir,U,Dn)){}
  else if(p.climb){
    p.aimUp=false; p.vy=U?-90:Dn?90:0; p.vx=0; p.dropThrough=Dn?0.1:0;
    const ltx=Math.floor((p.x+p.w/2)/T); let tty=Math.floor((p.y+p.h-1)/T); while(tty>0&&tileAt(ltx,tty-1)==='H') tty--; const topY=tty*T;
    moveY(p,p.vy*dt); if(p.vy) p.anim+=dt*10;
    if((U||dir)&&p.y+p.h<=topY+(dir?16:2)){ p.y=topY-p.h-0.01; p.climb=false; p.vy=0; p.onGround=true; p.coyote=0.1; p.dropThrough=0; }
    else if(!ladderAt(p.x+p.w/2,p.y+p.h-0.5)&&!ladderAt(p.x+p.w/2,p.y+p.h/2)){ p.climb=false; p.vy=0; }
    else if(Dn&&p.onGround) p.climb=false;
    if(p.climb&&pressed.jump){ p.climb=false; p.vy=-230; p.vx=dir*115; }
  } else {
    const max=(p.crouch?55:115)*(inSlime?0.5:1), acc=p.onGround?1500:900;
    if(dir) p.vx+=clamp(dir*max-p.vx,-acc*dt,acc*dt); else { const fr=(p.onGround?1800:350)*dt; p.vx+=clamp(-p.vx,-fr,fr); }
    if(Math.abs(p.vx)>max&&p.onGround) p.vx*=0.9;
    if(pressed.jump&&ctrl&&(p.onGround||p.coyote>0)){
      if(Dn&&onOneWay(p)) p.dropThrough=0.25;
      else { p.vy=JUMP*(inSlime?0.8:1); p.onGround=false; p.coyote=0; SFX.jump(); }
    }
    p.padT=Math.max(0,(p.padT||0)-dt);
    if(!keys.jump&&p.vy<-150&&!(p.padT>0)) p.vy+=(-150-p.vy)*0.35;
    p.vy=Math.min(p.vy+G*dt,520); r2Wind(p,dt);
    const wasAir=!p.onGround, vyB=p.vy;
    moveX(p,p.vx*dt); moveY(p,p.vy*dt);
    p.onLift=null; if(p.vy>=0&&!(p.dropThrough>0)) for(const l of lifts){ if(p.x+p.w>l.x+1&&p.x<l.x+l.w-1&&p.y+p.h>=l.y-2&&p.y+p.h<=l.y+10){ p.y=l.y-p.h; p.vy=0; p.onGround=true; p.onLift=l; break; } }
    if(p.onGround){ p.coyote=0.08; if(wasAir&&vyB>260) SFX.land(); } else p.coyote-=dt;
    if(p.onGround&&Math.abs(p.vx)>20){ p.anim+=Math.abs(p.vx)*dt*0.16; p.step+=Math.abs(p.vx)*dt; if(p.step>(p.crouch?28:22)){ p.step=0; SFX.step(); } }
  }
  p.dropThrough=Math.max(0,p.dropThrough-dt);
  if(!p.climb){ const cv=convAt(p); if(cv) moveX(p,cv*60*dt);
    if(p.onGround&&onTile(p,'^')){ p.vy=-Math.sqrt(2*G*175); p.onGround=false; p.padT=0.9; SFX.boing(); for(let i=0;i<10;i++) part(p.x+p.w/2,p.y+p.h,rnd(-60,60),rnd(-40,10),0.4,'#4dffc3',1.5,200); } }
  if(inSlime){ p.slimeT-=dt; if(p.slimeT<=0){ p.slimeT=0.25; hurtPlayer(9,0,true); SFX.sizzle(); } if(Math.random()<0.4) part(p.x+rnd(p.w),p.y+p.h-4,rnd(-10,10),rnd(-50,-20),0.4,'#8cff4f',1.5,80); }
  if(p.onGround&&elecOn()&&onTile(p,'Z')){ p.elecT-=dt; if(p.elecT<=0){ p.elecT=0.2; hurtPlayer(8,0,true); SFX.zapS(); sparks(p.x+p.w/2,p.y+p.h,5,'#bfe8ff'); } }
  if(D.regen&&p.hurtAgo>3&&p.hp<60) p.hp=Math.min(60,p.hp+10*dt);
  if(p.reload>0){ p.reload-=dt; if(p.reload<=0) finishReload(); }
  if(ctrl&&keys.fire&&p.cool<=0&&p.reload<=0&&!p.climb) fire();
  if(pressed.swap){ const order=ORDER.filter(w=>p.weapons[w]&&hasAmmo(w)); if(order.length) selectWeapon(order[(order.indexOf(p.cur)+1)%order.length]); }
  ['w1','w2','w3','w4','w5','w6'].forEach((k,i)=>{ if(pressed[k]) selectWeapon(ORDER[i]); });
  for(const k of pickups) if(!k.taken&&ov(p,k)) takePickup(k);
  if(p.hp<=25){ lowBeep-=dt; if(lowBeep<=0){ lowBeep=2.2; SFX.beep(); } }
}
function addAmmo(w,n){ const a=player.ammo[w]; if(w==='grenade'||w==='rocket') a.mag=Math.min(CAP[w],a.mag+n); else a.res=Math.min(RES_MAX[w],a.res+n); }
function takePickup(k){
  const p=player, m=D.ammo;
  if(R2_TAKE[k.type]){ if(R2_TAKE[k.type](k)===false) return; k.taken=true; if(k.respawn) k.rt=k.respawn; return; }
  if(k.type==='health'){ if(p.hp>=100) return; const n=D.heal; p.hp=Math.min(100,p.hp+n); SFX.pickup(); showMsg('Аптечка  +'+n,1.4); }
  else if(k.type==='battery'){ if(p.armor>=100) return; const n=D.bat; p.armor=Math.min(100,p.armor+n); SFX.armor(); showMsg('Броня  +'+n,1.4); }
  else if(k.type==='ammo'){ addAmmo('pistol',Math.ceil(17*m)); if(p.weapons.shotgun) addAmmo('shotgun',Math.ceil(6*m)); if(p.weapons.pulse) addAmmo('pulse',Math.ceil(30*m)); SFX.reload(); showMsg('Муниции',1.2); }
  else if(k.type==='pistol'){ p.weapons.pistol=true; p.ammo.pistol.mag=17; addAmmo('pistol',34); p.cur='pistol'; p.reload=0; SFX.gunGet(); showMsg('Пистолет! Стреляй със Z',2.5); }
  else if(k.type==='shotgun'){ p.weapons.shotgun=true; p.ammo.shotgun.mag=8; addAmmo('shotgun',8); p.cur='shotgun'; p.reload=0; SFX.gunGet(); showMsg('Пушка! Смени оръжието с Q',3); }
  else if(k.type==='pulse'){ p.weapons.pulse=true; p.ammo.pulse.mag=40; addAmmo('pulse',40); p.cur='pulse'; p.reload=0; SFX.gunGet(); showMsg('Импулсна пушка! Задръж Z за непрекъсната стрелба',3); }
  else if(k.type==='rocket'){ p.weapons.rocket=true; addAmmo('rocket',DI===0?4:3); p.cur='rocket'; p.reload=0; SFX.gunGet(); showMsg('Ракетомет! Ракетите пробиват бронята. Избери го с Q или 6',3.5); }
  else if(k.type==='rockets'){ if(p.ammo.rocket.mag>=CAP.rocket) return; p.weapons.rocket=true; const n=DI===0?3:2; addAmmo('rocket',n); SFX.reload(); showMsg('Ракети  +'+n,1.4); }
  else if(k.type==='grenade'){ const first=!p.weapons.grenade; p.weapons.grenade=true; const n=DI===0?3:2; addAmmo('grenade',n); SFX.gunGet(); showMsg(first?'Гранати! Избери ги с Q или 5 и хвърляй със Z':'Гранати  +'+n,first?3.5:1.4); }
  k.taken=true; if(k.respawn) k.rt=k.respawn;
}

