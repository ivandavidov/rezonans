/* ================= РЕЗОНАНС 1 · ФИНАЛНИЯТ ЕКРАН (след глава IV и след бонус главата) ================= */
function r1Win(){ overlay(0.9); const bonus=LI===LEVELS.length-1;
  glitchTitle(bonus?'КРАЙ':'ОЦЕЛЯ!',W/2,84,38);
  centerText(bonus?'Мина бонус главата на трудност „'+D.name+'“.':'Мина кампанията на трудност „'+D.name+'“.',110,'600 9px "IBM Plex Mono",monospace','#cfd8dc');
  drawStats(totals,148);
  if(!bonus) centerText('Отключи бонус главата „ЗАВРЪЩАНЕТО“',196,'600 9px "IBM Plex Mono",monospace','#ffd36b');
  else centerText('„Вихрен“ е спасен. Благодарим ти за играта!',196,'600 9px "IBM Plex Mono",monospace','#94ff57');
  if(winT>2&&blink()) centerText(bonus?'Z — към главното меню':'Z — към бонус главата · X — главно меню',238,'600 10px "IBM Plex Mono",monospace','#f3e6cf');
}
