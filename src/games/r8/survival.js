/* ================= РЕЗОНАНС 8 · ОЦЕЛЯВАНЕ ================= темите са тези на епизодите (data.js); арените — r8SvArena (bosses.js) */
const SV8_SPEC={salt:[167,7933,71],early:['r8center','r8rail'],mid:['r8med','r8museum'],late:['r8school','r8yard'],recent:2,
  boss:{pool:tg=>['r8trolley','r8switch','r8xray','r8mirror'],recent:2},   // Чертожника — само във финала (изборът на края)
  roles:{perch:['r8sign','drone'],any:'r8spark',hover:'drone',sniper:'soldier',air:'r8pigeon'},
  mut:{base:0.2,max:0.6,opts:tg=>{ const o=['swarm','scarce']; if(!tg.sky) o.push('dark'); if(tg.human) o.push('alarm'); return o; }}};
