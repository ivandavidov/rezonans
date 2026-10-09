/* ================= МЕХАНИКА · ЕСКОРТ =================
   LVL.escort: {x, name, acc, hello, lines, …} — спътник, когото трябва да преведеш до изхода. */
let ESC=null;
/* ---------- escort ---------- */
function updEscort(s,dt){
  const p=player; s.anim+=dt*10; s.hurtT-=dt; s.bt-=dt;
  if(s.state==='dead'){ s.vx*=0.9; physics(s,dt); return; }
  if(s.state==='idle'){ s.vx=0; physics(s,dt); if(Math.abs(p.x-s.x)<90&&!p.dead){ s.state='follow'; bark(s,LVL.escort.hello,3); } return; }
  const dx=(p.x+p.w/2-p.face*20)-(s.x+s.w/2); let want=Math.abs(dx)>16?sgn(dx):0;
  if(want&&s.onGround){ const fx=want>0?s.x+s.w+3:s.x-3, ftx=Math.floor(fx/T), fty=Math.floor((s.y+s.h+2)/T); let drop=0, haz=false;
    for(let ty=fty;ty<ROWS;ty++){ const c=tileAt(ftx,ty); if(c==='~'||c==='Z'){ haz=true; break; } if(SOLID.has(c)||c==='-'||c==='H') break; drop++; if(ty===ROWS-1) haz=true; }
    if(haz||(drop>3&&p.y+p.h<s.y+s.h+T)) want=0; }
  s.vx=want*(Math.abs(dx)>90?110:88); if(want) s.face=want;
  if(want&&s.onGround&&wallAhead(s,want)) s.vy=-345;
  const ox=s.x; physics(s,dt);
  if(want&&Math.abs(s.x-ox)<0.3) s.stuck=(s.stuck||0)+dt; else s.stuck=0;
  if(s.stuck>2.2&&p.onGround&&!p.dead&&!p.swim){ s.stuck=0; s.x=p.x-p.face*14; s.y=p.y+p.h-s.h; s.vx=s.vy=0; if(rectSolid(s.x,s.y,s.w,s.h)) s.x=p.x; for(let i=0;i<10;i++) part(s.x+5,s.y+rnd(24),rnd(-30,30),rnd(-30,10),0.4,'#e8e0c8',1.5,0); }
  const far=Math.abs(p.x-s.x);
  if((far>12*T||s.y>ROWS*T)&&p.onGround&&!p.dead&&!p.swim&&(Math.abs(s.x+s.w/2-cam-W/2)>W/2+10||s.y>ROWS*T)){ s.x=p.x-p.face*16; s.y=p.y+p.h-s.h; s.vx=0; s.vy=0; if(rectSolid(s.x,s.y,s.w,s.h)) s.x=p.x; }
  if(rectHas(s.x,s.y+s.h-6,s.w,6,'~')) escHurt(dt*30);
  if(s.onGround&&elecOn()&&onTile(s,'Z')) escHurt(dt*40);
  for(const b of ebullets) if(b.life>0&&b.x>s.x&&b.x<s.x+s.w&&b.y>s.y&&b.y<s.y+s.h){ b.life=0; escHurt((b.dmg||7)*0.8); }
  for(const e of enemies){ if(e.dead||e.type==='target'||e.type==='crab') continue; if(ov(e,s)){ e.escBite=(e.escBite||0)-dt; if(e.escBite<=0){ e.escBite=0.9; escHurt(8); } } }
  if(s.bt<=0&&!want&&LVL.escort.lines){ s.bt=rnd(9,15); bark(s,LVL.escort.lines[Math.floor(rnd(LVL.escort.lines.length))],2.6); }
}
function escHurt(d){ const s=ESC; if(!s||s.state==='dead'||player.dead||chtOn('god')) return; s.hp-=d*[0.45,1,1.35][DI]; s.hurtT=0.15; if(s.hp<=0){ s.hp=0; s.state='dead'; blood(s.x+5,s.y+8,false,16); showMsg(LVL.escort.name+' загина! Опитай отново.',3); die(); } }
function drawEscort(s){
  begin(s); if(s.hurtT>0) tint='#ffffff';
  if(s.state==='dead'){ ctx.rotate(-Math.PI/2); }
  const w=s.onGround&&Math.abs(s.vx)>10?Math.round(Math.sin(s.anim)*2):0;
  px(-4+w,-9,3,9,'#3a3226'); px(1-w,-9,3,9,'#3a3226'); px(-4+w,-1,4,1,'#1a1612'); px(1-w,-1,4,1,'#1a1612');
  px(-5,-19,10,11,'#5a4a3a'); px(-5,-19,10,2,'#6e5c48'); px(-1,-17,2,6,'#3a2e22');
  px(-4,-24,8,6,'#e2b48f'); px(-5,-26,10,3,'#2e2e30'); px(-6,-24,12,1,'#2e2e30'); px(1,-22,2,1,'#3a2a1a'); px(-3,-20,6,1,'#cfcfcf');
  px(5,-14,1,13,'#6a4a2a'); px(4,-15,3,1,'#6a4a2a');
  tint=null; ctx.restore();
}

defMech('escort',{
  load(){ ESC=null; const L=LVL;
  if(L.escort){ const tx=L.escort.x; ESC={x:tx*T+3,y:groundY(tx)-24,w:10,h:24,vx:0,vy:0,hp:100,max:100,face:-1,onGround:false,anim:0,state:'idle',esc:true,bt:5,hurtT:0,dropThrough:0}; scientists.push(ESC); }
  },
  respawn(){ const p=player;
  if(ESC){ ESC.hp=ESC.max; ESC.state='follow'; ESC.x=p.x-p.face*16; ESC.y=p.y+p.h-ESC.h; ESC.vx=ESC.vy=0; }
  },
  exitOk(){
  if(ESC&&ESC.state!=='dead'&&Math.abs(ESC.x-player.x)>5*T){ if(!MT.wait||lvT-MT.wait>3){ MT.wait=lvT; showMsg('Изчакай '+LVL.escort.acc+'!',2); } return false; }
  return true;
  } });
