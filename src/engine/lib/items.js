/* ================= ОБЩИТЕ ПРЕДМЕТИ =================
   Аптечка, батерия (броня), муниции, оръжията и боеприпасите им — като предметите на частите: defItem(id,{take,draw}).
   take(k) → false, ако не е взет (пълно здраве и т.н.); количествата по трудност са в DIFFS. */
defItem('health',{take(k){ const p=player; if(p.hp>=100) return false; const n=D.heal; p.hp=Math.min(100,p.hp+n); SFX.pickup(); showMsg('Аптечка  +'+n,1.4); },
  draw(k,x,y){ px(x,y,12,10,'#e9eef0'); px(x,y,12,1,'#ffffff'); px(x,y+9,12,1,'#a7b0b5'); px(x+5,y+2,2,6,'#d22a2a'); px(x+3,y+4,6,2,'#d22a2a'); }});
defItem('battery',{take(k){ const p=player; if(p.armor>=100) return false; const n=D.bat; p.armor=Math.min(100,p.armor+n); SFX.armor(); showMsg('Броня  +'+n,1.4); },
  draw(k,x,y){ px(x+2,y-2,8,12,'#1f3f6b'); px(x+4,y-3,4,1,'#9aa3aa'); px(x+3,y,6,8,'#3c8ce0'); px(x+3,y+5-Math.floor((titleT*4)%4),6,1,'#bfe4ff'); }});
defItem('ammo',{take(k){ const p=player, m=D.ammo; addAmmo('pistol',Math.ceil(17*m)); if(p.weapons.shotgun) addAmmo('shotgun',Math.ceil(6*m)); if(p.weapons.pulse) addAmmo('pulse',Math.ceil(30*m)); SFX.reload(); showMsg('Муниции',1.2); },
  draw(k,x,y){ px(x,y+2,12,8,'#4d5636'); px(x,y+2,12,1,'#6b7650'); px(x+2,y+4,8,3,'#c9a227'); px(x+3,y+5,6,1,'#7a6418'); }});
defItem('pistol',{take(k){ const p=player; p.weapons.pistol=true; p.ammo.pistol.mag=17; addAmmo('pistol',34); p.cur='pistol'; p.reload=0; SFX.gunGet(); showMsg('Пистолет! Стреляй със Z',2.5); },
  draw(k,x,y){ px(x,y+4,11,3,'#2a2e33'); px(x,y+4,11,1,'#5a616a'); px(x+1,y+6,3,4,'#3a4046'); px(x+9,y+4,2,1,'#8e9aa3'); }});
defItem('shotgun',{take(k){ const p=player; p.weapons.shotgun=true; p.ammo.shotgun.mag=8; addAmmo('shotgun',8); p.cur='shotgun'; p.reload=0; SFX.gunGet(); showMsg('Пушка! Смени оръжието с Q',3); },
  draw(k,x,y){ px(x-4,y+4,18,2,'#2a2e33'); px(x+4,y+6,7,2,'#6b4a2a'); px(x-6,y+5,4,3,'#6b4a2a'); px(x-4,y+4,18,1,'#5a616a'); }});
defItem('pulse',{take(k){ const p=player; p.weapons.pulse=true; p.ammo.pulse.mag=40; addAmmo('pulse',40); p.cur='pulse'; p.reload=0; SFX.gunGet(); showMsg('Импулсна пушка! Задръж Z за непрекъсната стрелба',3); },
  draw(k,x,y){ px(x-4,y+3,18,3,'#33413a'); px(x,y+6,5,2,'#33413a'); px(x-1,y+4,10,1,'#5dffa8'); px(x+12,y+4,3,1,'#9affc8'); }});
defItem('rocket',{take(k){ const p=player; p.weapons.rocket=true; addAmmo('rocket',D.rocketGet); p.cur='rocket'; p.reload=0; SFX.gunGet(); showMsg('Ракетомет! Ракетите пробиват бронята. Избери го с Q или 6',3.5); },
  draw(k,x,y){ px(x-6,y+3,22,4,'#3d4430'); px(x-6,y+3,22,1,'#5a6348'); px(x+14,y+2,2,6,'#22261c'); px(x+2,y+7,3,3,'#22261c'); }});
defItem('rockets',{take(k){ const p=player; if(p.ammo.rocket.mag>=CAP.rocket) return false; p.weapons.rocket=true; const n=D.rocketsGet; addAmmo('rocket',n); SFX.reload(); showMsg('Ракети  +'+n,1.4); },
  draw(k,x,y){ px(x,y+3,12,7,'#4d5636'); px(x,y+3,12,1,'#6b7650'); for(const o of [2,7]){ px(x+o,y,3,4,'#c9473a'); px(x+o,y-1,3,1,'#e8796c'); } }});
defItem('grenade',{take(k){ const p=player; const first=!p.weapons.grenade; p.weapons.grenade=true; const n=D.grenGet; addAmmo('grenade',n); SFX.gunGet(); showMsg(first?'Гранати! Избери ги с Q или 5 и хвърляй със Z':'Гранати  +'+n,first?3.5:1.4); },
  draw(k,x,y){ for(const o of [0,6]){ px(x+o,y+3,5,6,'#3c4a2a'); px(x+o+1,y+2,3,1,'#9aa3aa'); px(x+o,y+4,5,1,'#55663c'); } }});
