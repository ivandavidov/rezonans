/* ================= ДВИГАТЕЛ · ИНТРО: фракталът „готически арки“ от визуализатора (docs/audio) =================
   При всяко пускане, вместо стария начален екран:
   затъмнен фрактал с надписа (като началото на /audio; 1 s от черно) → клавиш, клик или докосване → картината светва
   и музиката на началния екран влиза за 1 s → след 4 такта музиката минава на „Битка“ и излиза 3D логото (времената са
   като при T във визуализатора); после всичко се повтаря на всеки 16 такта — 4 „Спокойно“, логото, 12 „Битка“ (логото е на
   такт 4, 20, 36 …), всеки път с друг случаен вид:
   материал, появяване и украса (LOOKS) — първото е неон (светещи цветни ръбове), с пресечките (като стар телевизор). Всеки клавиш (без F и M), клик или докосване —
   0,5 s към черно (картина и звук) → менюто и 0,5 s от черно, заедно с музиката.
   Esc в главното меню (няма накъде назад) отваря интрото отначало — като ново пускане: без музика до натискане.
   Шрифтът Unbounded (надписът, логото) идва от r2 (game.json); без него — Russo One.
   Шейдърът е копие от docs/audio/index.html (FRACF[2] + FRAC, сиянието и COMP) — двете копия се поддържат поотделно.
   Без WebGL2, в кадър (визуализаторът зарежда играта в iframe) и в проверките няма интро — остава старият екран.
   Щом състоянието излезе от началния екран по друг път (проверките), интрото се маха веднага. */
const INTRO=(()=>{
  const box=document.getElementById('intro'),off=()=>{ try{ box.remove(); }catch(e){} return null; };
  if(typeof WebGL2RenderingContext==='undefined'||window.parent!==window||!box||!box.querySelector) return off();
  const cv2=box.querySelector('canvas'),cov=box.querySelector('.cov'),osdEl=box.querySelector('.osd');
  const gl=cv2.getContext('webgl2',{antialias:false,alpha:false,depth:false,stencil:false,premultipliedAlpha:false,powerPreference:'high-performance'});
  if(!gl) return off();
  const HF=!!gl.getExtension('EXT_color_buffer_float'),TF=HF?[gl.RGBA16F,gl.RGBA,gl.HALF_FLOAT]:[gl.RGBA8,gl.RGBA,gl.UNSIGNED_BYTE];
  const ease=x=>x*x*(3-2*x),sm=(c,v,ta,tr,dt)=>c+(v-c)*(1-Math.exp(-dt/(v>c?ta:tr)));

  /* ---------- GL ---------- */
  function mkTex(w,h,f,data){ const t=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,t);
    for(const [k,v] of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D,k,v);
    gl.texImage2D(gl.TEXTURE_2D,0,f[0],w,h,0,f[1],f[2],data||null); return t; }
  function rt(w,h){ const t=mkTex(w,h,TF),f=gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER,f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0); return {t,f,w,h,tx:[1/w,1/h],del(){ gl.deleteTexture(t); gl.deleteFramebuffer(f); }}; }
  function shd(type,src){ const s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)&&!gl.isContextLost()) throw Error('интро, шейдър: '+gl.getShaderInfoLog(s)); return s; }
  const VSQ=`#version 300 es
out vec2 uv;void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));uv=p;gl_Position=vec4(p*2.-1.,0.,1.);}`;
  function prog(fs){ const p=gl.createProgram(); gl.attachShader(p,shd(gl.VERTEX_SHADER,VSQ)); gl.attachShader(p,shd(gl.FRAGMENT_SHADER,HEAD+fs)); gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS)&&!gl.isContextLost()) throw Error('интро, връзка: '+gl.getProgramInfoLog(p)); return {p,loc:{}}; }
  const G={};
  function run(pr,U,dst){ const w=dst?dst.w:cv2.width,h=dst?dst.h:cv2.height; let unit=0;
    gl.bindFramebuffer(gl.FRAMEBUFFER,dst?dst.f:null); gl.viewport(0,0,w,h); gl.useProgram(pr.p); G.uAsp=w/h;
    for(const k in Object.assign({},G,U)){ const v=k in U?U[k]:G[k]; let l=pr.loc[k]; if(l===undefined) l=pr.loc[k]=gl.getUniformLocation(pr.p,k); if(l===null) continue;
      if(v instanceof WebGLTexture){ gl.activeTexture(gl.TEXTURE0+unit); gl.bindTexture(gl.TEXTURE_2D,v); gl.uniform1i(l,unit++); }
      else if(typeof v==='number') gl.uniform1f(l,v); else if(v.length===2) gl.uniform2f(l,v[0],v[1]); else if(v.length===3) gl.uniform3f(l,v[0],v[1],v[2]); else gl.uniform4f(l,v[0],v[1],v[2],v[3]); }
    gl.drawArrays(gl.TRIANGLES,0,3); }

  /* ---------- шейдъри (от docs/audio/index.html) ---------- */
  const HEAD=`#version 300 es
precision highp float;precision highp int;precision highp sampler2D;
#define TAU 6.28318531
uniform float uT,uBassA,uTrebA,uBeatHi,uAsp;
in vec2 uv;out vec4 o;
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,s,-s,c);}
float h21(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float h31(vec3 p){p=fract(p*.1031);p+=dot(p,p.zyx+31.32);return fract((p.x+p.y)*p.z);}
vec3 pal(float t){return .5+.5*cos(TAU*(t+vec3(0.,.33,.67)));}
`;
  // готически арки (FRACF[2]) в шаблона FRAC; отгоре — логото: обемни букви на разстояние 1 пред камерата, със светлината на фрактала
  const FRAC=`uniform float uTc;uniform vec4 uQ;uniform sampler2D uSdf;uniform float uLA,uLS,uLY,uLP;
uniform float uLM,uLX,uLH,uLF,uLD,uLG,uLW,uLt,uLB;uniform vec3 uLO;   // вид на логото (вж. LOOKS): материал, украса, отместване на цвета, полет по букви, разпадане, пресечки, сияние, време, удар; отместване
#define CY 3.3
#define CZ 5.
#define CW 2.3
#define GL 1.
#define GK 30.
float mapA(vec3 p,out vec4 tr){float sc=1.,K=1.25+.08*uQ.z;tr=vec4(1000.);   // готически арки: сгъването на Аполониевия, накрая — цилиндри вместо плочи
  for(int i=0;i<8;i++){p=-1.+2.*fract(.5*p+.5);float r2=dot(p,p);tr=min(tr,vec4(abs(p.x),abs(length(p.xz)-.45),abs(p.z),r2));float k=K/r2;p*=k;sc*=k;}
  return .25*(length(p.xz)-.45)/sc;}
float mapD(vec3 p){float sc=1.,K=1.25+.08*uQ.z;   // същото разстояние без капаните (те трябват само в крайната точка)
  for(int i=0;i<8;i++){p=-1.+2.*fract(.5*p+.5);float r2=dot(p,p);float k=K/r2;p*=k;sc*=k;}
  return .25*(length(p.xz)-.45)/sc;}
void cam(float tm,out vec3 ro,out vec3 ta,out float rl){
  ro=vec3(2.8*cos(.1+.33*tm),.4+.3*cos(.37*tm),2.8*cos(.5+.35*tm));ta=vec3(1.9*cos(1.2+.41*tm),.4+.1*cos(.27*tm),1.9*cos(2.+.38*tm));rl=.2*cos(.1*tm);}
vec3 sky(vec3 d){vec3 c=vec3(0.);
  for(int i=0;i<3;i++){float S=130.+float(i)*70.;vec3 q=d*S,i0=floor(q);
    for(int z=-1;z<=1;z++)for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec3 id=i0+vec3(x,y,z);
      if(abs(length(id+.5)-S)>.5)continue;float h=h31(id+float(i)*13.);if(h<.973)continue;
      vec3 s=normalize(id+.5+(vec3(h31(id+1.7),h31(id+5.3),h31(id+9.1))-.5)*.6)*S;
      c+=mix(vec3(.8,.88,1.),pal(h*7.+uT*.02),.35)*smoothstep(.36,0.,length(q-s))*(.5+.5*sin(uT*(1.+h*3.)+h*50.))*(.9+.5*uTrebA);}}
  return c;}
// логото: 2D разстояние от текстурата (в ширини на надписа), изтеглено в дълбочина и със заоблени ръбове
float lg2(vec2 q){vec2 hs=vec2(.675,.16875)*uLS,b=abs(q)-hs;float e=length(max(b,0.));
  float d=texture(uSdf,clamp(q/(2.*hs)+.5,0.,1.)).r*1.35*uLS;return e>0.?sqrt(e*e+d*d):d;}   // извън кутията: долна граница (ъгълът при ръба е ≥ 90°)
float lgZ(float x){if(uLF<=0.)return 0.;float xn=clamp(x/(1.35*uLS)+.5,0.,1.),k=clamp(fract(uLF)*1.8-xn*.8,0.,1.);k=k*k*(3.-2.*k);   // полет по букви: отляво надясно
  return uLF<1.?3.*(1.-k):3.*k;}   // долитат от дълбочината / отлитат натам
float lgD(vec3 q){q.z-=lgZ(q.x);float r=.008*uLS,h=.05*uLS;vec2 w=vec2(lg2(q.xy)+r,abs(q.z)-h+r);return min(max(w.x,w.y),0.)+length(max(w,0.))-r;}
void main(){
  vec2 sp=(uv-.5)*vec2(uAsp,1.)*2.;float tm=uTc;
  vec3 ro,ta;float rl;cam(tm,ro,ta,rl);vec3 cw=normalize(ta-ro),cp=vec3(sin(rl),cos(rl),0.),cu=normalize(cross(cw,cp)),cv=cross(cu,cw);
  vec3 rd=normalize(sp.x*cu+sp.y*cv+2.*cw);
  vec4 tr;float t=.01,h=1.;
  for(int i=0;i<300;i++){h=mapD(ro+rd*t);if(h<.0004*t||t>20.)break;t+=h*1.5;}
  mapA(ro+rd*t,tr);
  vec3 col=pal(.62+uT*.01)*.02;
  if(t<20.){vec3 p=ro+rd*t;vec2 e=vec2(1.,-1.)*.0005*t;
    vec3 n=normalize(e.xyy*mapD(p+e.xyy)+e.yyx*mapD(p+e.yyx)+e.yxy*mapD(p+e.yxy)+e.xxx*mapD(p+e.xxx));
    float oc=0.,w=1.;for(int k=0;k<5;k++){float hh=.02+.06*float(k);oc+=(hh-4.*mapD(p+n*hh))*w;w*=.7;}
    float key=clamp(dot(vec3(.577,.577,-.577),n),0.,1.),bac=clamp(.2+.8*dot(vec3(-.707,0.,.707),n),0.,1.),amb=.7+.3*n.y,
      ao=pow(clamp(tr.w*CW,0.,1.),1.2)*clamp(1.-oc*1.5,0.,1.);
    vec3 br=(vec3(.25)*amb+vec3(1.)*key*(.9+.15*uBassA)+vec3(.25)*bac)*ao;
    vec3 c=vec3(1.);c=mix(c,pal(.08+uT*.012),clamp(CY*tr.y,0.,1.));c=mix(c,pal(.55+uT*.017),pow(clamp(1.-CZ*tr.z,0.,1.),8.));
    col=mix(col,sqrt(max(c*br,0.)),exp(-.1*t));
    col+=GL*pal(uT*.03+tr.w*3.)*exp(-tr.w*GK)*(.4+.8*uTrebA+.8*uBeatHi)*exp(-.2*t);}
  if(t>14.)col+=sky(rd)*smoothstep(14.,20.,t);
  if(uLA>0.){   // логото — винаги отпред; въртенето му (uLY, uLP) показва дълбочината, светлината е тази на фрактала
    float cy=cos(uLY),sy=sin(uLY),cq=cos(uLP),sq=sin(uLP);mat3 R=mat3(cy,0.,-sy,0.,1.,0.,sy,0.,cy)*mat3(1.,0.,0.,0.,cq,sq,0.,-sq,cq);
    vec2 sl=sp;if(uLG>0.){float bn=floor(sp.y*22.),fr=floor(uT*18.);sl.x+=uLG*.09*(h21(vec2(bn,fr))-.5)*step(.5,h21(vec2(bn*1.7,fr+3.)));}   // пресечки: ленти, отместени встрани
    vec3 o2=R*(vec3(0.,0.,-1.)-uLO),d2=R*normalize(vec3(sl,2.));
    vec2 pp=(o2+d2*(-o2.z/d2.z)).xy;float g=max(lg2(pp),0.),nz=1.;bool hit=false;
    col*=1.-.6*uLA*uLW*exp(-g*22./uLS);   // мека сянка зад буквите — да се четат и върху светлата дантела
    vec3 hb=vec3(.675*uLS+.03,.16875*uLS+.03,.05*uLS+.01+(uLF>0.?3.2:0.)),t1=(-hb-o2)/d2,t2=(hb-o2)/d2,tn=min(t1,t2),tf=max(t1,t2);
    float a=max(max(tn.x,tn.y),tn.z),b=min(min(tf.x,tf.y),tf.z);
    if(a<b&&b>0.){float s=max(a,0.);vec3 q;
      for(int i=0;i<160;i++){q=o2+d2*s;float d=lgD(q);if(d<.0002){hit=true;break;}s+=d*(uLF>0.?.35:1.);if(s>b)break;}   // при полета разстоянието е по-грубо — по-къси стъпки
      if(hit&&uLD>0.){nz=h31(floor(q*60./uLS))-uLD;if(nz<0.)hit=false;}   // разпадане на кубчета (като пикселите на играта)
      if(hit){vec2 e=vec2(.0005*uLS,0.);
        vec3 nl=normalize(vec3(lgD(q+e.xyy)-lgD(q-e.xyy),lgD(q+e.yxy)-lgD(q-e.yxy),lgD(q+e.yyx)-lgD(q-e.yyx))),nc=transpose(R)*nl,n=normalize(nc.x*cu+nc.y*cv+nc.z*cw);
        float side=1.-smoothstep(.45,.9,abs(nl.z)),x=q.x/uLS;   // лицата — бели като стените, ръбовете и стените на буквите — във втория цвят на мрежата
        vec3 c=mix(vec3(1.),pal(.55+uT*.017),side*.85);c=mix(c,pal(.08+uT*.012+x*.25),.22*(1.-side));
        // светлината на фрактала (в света — сменя се, докато камерата се върти) + една спрямо камерата, отгоре вляво: ръбовете винаги се виждат
        vec3 Lc=normalize(vec3(-.45,.6,-.65));float key=clamp(dot(vec3(.577,.577,-.577),n),0.,1.),kc=clamp(dot(Lc,nc),0.,1.),bac=clamp(.2+.8*dot(vec3(-.707,0.,.707),n),0.,1.),amb=.7+.3*n.y;
        vec3 br=vec3(.25)*amb+vec3(.6)*key*(.9+.15*uBassA)+vec3(.65)*kc+vec3(.2)*bac,lc=sqrt(max(c*br,0.));
        lc+=pal(uT*.03+x*.6)*pow(1.-clamp(-dot(rd,n),0.,1.),3.)*(.45+.5*uTrebA+.5*uBeatHi);
        float spc=pow(clamp(dot(reflect(normalize(vec3(sl,2.)),nc),Lc),0.,1.),30.),fr=pow(1.-clamp(-dot(rd,n),0.,1.),3.);
        lc+=vec3(.7)*spc;
        if(uLM>.5){   // другите материали (повторенията)
          if(uLM<1.5){vec3 r=reflect(rd,n);lc=mix(vec3(.06,.05,.09),pal(.55+uT*.017+uLH+r.y*.25),.55+.45*r.y)*(.6+.5*kc)+vec3(.9)*pow(max(r.y,0.),8.)+vec3(1.2)*spc+pal(uT*.03+uLH+x*.6)*fr*.6;}   // хром: отразява небе в цветовете на мрежата
          else if(uLM<2.5){vec4 tq;mapA(q*4.+vec3(3.1,1.7,.4),tq);   // от същата дантела: лицата — с капаните на фрактала
            vec3 c2=mix(vec3(1.),pal(.08+uT*.012+uLH),clamp(CY*tq.y,0.,1.));c2=mix(c2,pal(.55+uT*.017+uLH),pow(clamp(1.-CZ*tq.z,0.,1.),8.));
            lc=sqrt(max(c2*br*pow(clamp(tq.w*CW,0.,1.),.6),0.))+GL*pal(uT*.03+tq.w*3.+uLH)*exp(-tq.w*GK)*(.6+.6*uTrebA)+vec3(.5)*spc;}
          else if(uLM<3.5)lc=mix(col,pal(uLH+fr*1.6+dot(nc,vec3(.3,.6,0.))+uT*.02)*1.15,.35+.5*fr)+vec3(1.)*spc;   // преливащо стъкло: тънък слой, отзад — фракталът
          else if(uLM<4.5)lc=vec3(.02)+pal(uLH+x*.5+uT*.03)*(side*1.6+.12)*(1.+1.2*uBeatHi)+vec3(.4)*spc;   // неон: тъмни лица, светещи ръбове
          else{vec3 m=.45+.55*pal(uLH);lc=m*(sqrt(max(br,0.))*.75+spc*1.6)+m*fr*.5;}}   // цветен метал
        if(uLX>1.5&&uLX<2.5)lc+=vec3(1.)*exp(-abs(x+.03*q.y/uLS-(-1.3+2.6*fract(uLt/1.7)))*18.)*.9;   // светла ивица, която минава по буквите
        if(uLG>0.&&h21(vec2(floor(uT*18.),3.))>.7)lc=lc.brg;   // пресечките сменят и цветовете за миг
        if(uLD>0.)lc+=pal(uLH+uT*.05)*smoothstep(.12,0.,nz)*2.;   // ръбът на разпадането свети
        col=mix(col,lc,uLA);}}
    float gm=(.4+.8*uTrebA+.8*uBeatHi)*(uLX>3.5?1.+2.5*uLB:1.)*uLW;
    if(!hit)col+=GL*pal(uT*.03+uLH+pp.x/uLS*.6)*exp(-g*70./uLS)*.3*gm*uLA;   // сияние около буквите (като мрежата на фрактала)
    if(uLX>2.5&&uLX<3.5)for(int j=1;j<=3;j++){float zj=float(j)*.2*uLS;vec2 pj=(o2+d2*((zj-o2.z)/d2.z)).xy;   // ехо: сияния назад в дълбочината
      col+=pal(uT*.03+uLH+float(j)*.12)*exp(-abs(lg2(pj))*160./uLS)*.6*pow(.65,float(j))*uLA*uLW;}}   // очертания на буквите
  o=vec4(col,1.);}`;
  const BPRE=`uniform sampler2D uSrc;uniform vec2 uTx;uniform float uThr;
void main(){vec3 c=(texture(uSrc,uv+uTx*vec2(-.5,-.5)).rgb+texture(uSrc,uv+uTx*vec2(.5,-.5)).rgb+texture(uSrc,uv+uTx*vec2(-.5,.5)).rgb+texture(uSrc,uv+uTx*vec2(.5,.5)).rgb)*.25;
  float l=max(c.r,max(c.g,c.b));o=vec4(c*smoothstep(uThr,uThr+.8,l),1.);}`;
  const BDOWN=`uniform sampler2D uSrc;uniform vec2 uTx;
void main(){vec3 s=texture(uSrc,uv).rgb*4.+texture(uSrc,uv+uTx*vec2(-1,-1)).rgb+texture(uSrc,uv+uTx*vec2(1,-1)).rgb+texture(uSrc,uv+uTx*vec2(-1,1)).rgb+texture(uSrc,uv+uTx*vec2(1,1)).rgb;o=vec4(s/8.,1.);}`;
  const BUP=`uniform sampler2D uSrc,uAdd;uniform vec2 uTx;
void main(){vec3 s=texture(uSrc,uv+uTx*vec2(-2,0)).rgb+texture(uSrc,uv+uTx*vec2(2,0)).rgb+texture(uSrc,uv+uTx*vec2(0,-2)).rgb+texture(uSrc,uv+uTx*vec2(0,2)).rgb
  +2.*(texture(uSrc,uv+uTx*vec2(-1,-1)).rgb+texture(uSrc,uv+uTx*vec2(1,-1)).rgb+texture(uSrc,uv+uTx*vec2(-1,1)).rgb+texture(uSrc,uv+uTx*vec2(1,1)).rgb);
  o=vec4(s/12.+texture(uAdd,uv).rgb,1.);}`;
  // крайният образ (COMP без калейдоскопа и ехото): сияние, хроматична аберация, тонове, винетка, зърно; uFade — към черно
  const COMP=`uniform sampler2D uFB,uBl;uniform float uFade,uBloom,uCA,uVig,uExpo,uGrain;
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
vec2 mir(vec2 u){return 1.-abs(1.-mod(u,2.));}
void main(){
  vec2 d=uv-.5,su=mir(d+.5);float ca=uCA*.02*length(d);
  vec3 c=vec3(texture(uFB,mir(.5+d*(1.+ca))).r,texture(uFB,su).g,texture(uFB,mir(.5+d*(1.-ca))).b);
  c+=texture(uBl,su).rgb*uBloom;c*=uExpo;c=aces(c);
  c*=1.-uVig*dot(d,d)*2.;c+=(h21(gl_FragCoord.xy+fract(uT*7.)*311.)-.5)*uGrain;
  o=vec4(c*uFade,1.);}`;
  let P;
  try{ P={frac:prog(FRAC),bpre:prog(BPRE),bdown:prog(BDOWN),bup:prog(BUP),comp:prog(COMP)}; }catch(e){ console.error(e); return off(); }

  /* ---------- логото: „РЕЗОНАНС“ (Unbounded, като T във визуализатора) → знаково разстояние (точно, по Felzenszwalb) ---------- */
  const LW=1024,LH=256,SDF=mkTex(LW,LH,[gl.R16F,gl.RED,gl.FLOAT]);
  function edt(f,w,h){ const n=Math.max(w,h),d=new Float64Array(n),v=new Int32Array(n),z=new Float64Array(n+1),g=new Float64Array(n);
    const pass=(len,get,set)=>{ for(let i=0;i<len;i++) g[i]=get(i); let k=0; v[0]=0; z[0]=-1e20; z[1]=1e20;
      for(let q=1;q<len;q++){ let s; do{ const r=v[k]; s=((g[q]+q*q)-(g[r]+r*r))/(2*q-2*r); }while(s<=z[k]&&--k>=0); k++; v[k]=q; z[k]=s; z[k+1]=1e20; }
      k=0; for(let q=0;q<len;q++){ while(z[k+1]<q) k++; d[q]=(q-v[k])*(q-v[k])+g[v[k]]; } for(let i=0;i<len;i++) set(i,d[i]); };
    for(let x=0;x<w;x++) pass(h,y=>f[y*w+x],(y,val)=>f[y*w+x]=val);
    for(let y=0;y<h;y++) pass(w,x=>f[y*w+x],(x,val)=>f[y*w+x]=val); }
  function mkLogo(){ const c=document.createElement('canvas'); c.width=LW; c.height=LH; const x=c.getContext('2d',{willReadFrequently:true});
    x.font='500 132px Unbounded, "Russo One", sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillStyle='#fff'; x.fillText('РЕЗОНАНС',LW/2,134);
    const a=x.getImageData(0,0,LW,LH).data,N=LW*LH,fo=new Float64Array(N),fi=new Float64Array(N),out=new Float32Array(N);
    for(let i=0;i<N;i++){ const ins=a[i*4+3]>=128; fo[i]=ins?0:1e20; fi[i]=ins?1e20:0; }
    edt(fo,LW,LH); edt(fi,LW,LH);
    for(let y=0;y<LH;y++) for(let i=0;i<LW;i++){ const j=y*LW+i,al=a[j*4+3]/255;   // ред 0 на текстурата е долу; ръбът е между центровете, полупрозрачните точки — по покритието
      out[(LH-1-y)*LW+i]=(al>0&&al<1?.5-al:al>=.5?.5-Math.sqrt(fi[j]):Math.sqrt(fo[j])-.5)/LW; }
    gl.bindTexture(gl.TEXTURE_2D,SDF); gl.texImage2D(gl.TEXTURE_2D,0,gl.R16F,LW,LH,0,gl.RED,gl.FLOAT,out); }
  mkLogo(); if(document.fonts&&document.fonts.load) document.fonts.load('500 132px Unbounded').then(()=>{ if(!gl.isContextLost()) mkLogo(); },()=>{});

  /* ---------- размер и качество — като „авто“ (Q) във визуализатора ----------
     При задъхване: по-ниска разделителна способност до 60% по страна → 30 к/с → до 42% → 20 к/с; връщането — по обратния път.
     Кадрите са равна част от опресняването на екрана, с таван 60. Ако по-малко точки не помагат (процесорът, таван от браузъра) —
     разделителната способност се връща и падат кадрите. Колко струва кадърът при свалени кадри: времето на видеокартата, ако е
     правдоподобно (в Chrome на Mac не е), иначе проба за 1,5 s на пълни кадри; след неуспешна — двойно по-късно, след 3 — край. */
  let iw=0,ih=0,FB=null,BL=[],BU=[],qMul=1,adT=0,adN=0,adGood=0,adCool=0,adSkip=1,adNo=0,adQs=1,adRes=0,adResW=0,qNg=0,
    vI=1/60,fDiv=1,rawL=0,cal=12,calA=[],lastR=0,prT=12,prI=12,prF=0,prOn=0;
  function alloc(){ const dpr=Math.min(devicePixelRatio||1,2),W=innerWidth,H=innerHeight;
    const cw=Math.round(W*Math.min(dpr,1.5)),ch=Math.round(H*Math.min(dpr,1.5)); if(cv2.width!==cw||cv2.height!==ch){ cv2.width=cw; cv2.height=ch; }
    const s=Math.min(dpr,Math.sqrt((matchMedia('(pointer:coarse)').matches?1e6:2.1e6)/(W*H)))*qMul,nw=Math.max(64,Math.round(W*s)),nh=Math.max(64,Math.round(H*s));
    if(nw===iw&&nh===ih) return; iw=nw; ih=nh;
    for(const r of [FB,...BL,...BU]) if(r) r.del(); FB=rt(iw,ih); BL=[]; BU=[];
    for(let i=0,w=iw>>1,h=ih>>1;i<6&&w>2&&h>2;i++,w>>=1,h>>=1){ BL.push(rt(w,h)); BU.push(rt(w,h)); } }
  const frB=()=>Math.max(1,Math.round(1/60/vI)),frT=()=>frB()*fDiv*vI;   // делител до 60 к/с; времето на кадъра
  function snapHz(x){ let b=60; for(const r of [240,165,144,120,100,90,75,60,50,48,30,24]) if(Math.abs(1/r-x)<Math.abs(1/b-x)) b=r; return 1/b; }
  function qCal(){ cal=12; calA=[]; }   // ново измерване на опресняването на екрана (12 кадъра без рисуване)
  function fpGate(now){ const ri=(now-rawL)/1000; rawL=now;   // пропуснат кадър? (по-малко кадри; измерване на опресняването)
    if(cal>0){ if(ri>0&&ri<.1) calA.push(ri); if(--cal===0){ calA.sort((a,b)=>a-b); vI=snapHz(calA[calA.length>>1]||1/60); adSkip=1; } last=now; return true; }
    const n=frB()*fDiv; if(n>1&&(now-lastR)/1000<(n-.5)*vI) return true; lastR=now; return false; }
  const TQ=gl.getExtension('EXT_disjoint_timer_query_webgl2'); let tqP=[],tqA=0,tqN=0,tqOn=false,tqBad=0;   // времето на видеокартата
  function tqBegin(){ if(!TQ||tqP.length>5) return; const q=gl.createQuery(); gl.beginQuery(TQ.TIME_ELAPSED_EXT,q); tqP.push(q); tqOn=true; }
  function tqEnd(){ if(tqOn){ gl.endQuery(TQ.TIME_ELAPSED_EXT); tqOn=false; }
    while(tqP.length&&gl.getQueryParameter(tqP[0],gl.QUERY_RESULT_AVAILABLE)){ const q=tqP.shift(); if(!gl.getParameter(TQ.GPU_DISJOINT_EXT)){ tqA+=gl.getQueryParameter(q,gl.QUERY_RESULT)/1e9; tqN++; } gl.deleteQuery(q); } }
  function qSet(q,f,res){ if(q!==qMul){ qMul=q; alloc(); } fDiv=f; adT=adN=0; adCool=2; adGood=0; adRes=res||0; adResW=2; }
  function qDown(avg){ if(!qNg){ if(!adNo) adQs=qMul;
      if(fDiv===1&&qMul>.601) return qSet(Math.max(.6,qMul*.85),1,avg);
      if(fDiv===2&&qMul>.421) return qSet(Math.max(.42,qMul*.85),2,avg); }
    if(fDiv<3) qSet(qMul,fDiv+1); }
  function qUp(C){ let q=qMul,f=fDiv;   // по-нагоре, ако ще се побере с 20% резерв (C — колко струва кадърът сега)
    if(!qNg){ if(f===3) f=2; else if(f===2&&qMul<.599) q=Math.min(.6,qMul*1.1); else f=1; } else f=Math.max(1,f-1);
    if((q!==qMul||f!==fDiv)&&C*(q/qMul)**2<=.8*frB()*f*vI){ qSet(q,f); if(f===1&&q>=.6) qNg=0; return true; } return false; }
  function adapt(dt){
    if(adSkip||document.hidden){ adT=adN=0; tqA=tqN=0; adSkip=0; return; }
    adT+=dt; adN++; adCool-=dt; prT-=dt; if(adT<1.5) return;
    const avg=adT/adN; let gpu=tqN>4&&!qNg?tqA/tqN:0; adT=adN=0; tqA=tqN=0; if(gpu>1.1*avg) tqBad=1; if(tqBad) gpu=0;   // таймерът показва повече от кадъра — не му се вярва
    if(prOn){ const f=prOn; prOn=0; fDiv=f; adCool=2;   // проба на пълни кадри; неуспешна — следващата след двойно време, след 3 поредни — край
      if(qUp(avg<1.05*frB()*vI?0:avg)){ prF=0; prI=12; } else { prF++; prI*=2; } prT=prI; return; }
    if(adRes&&--adResW>0) return;   // ефектът от по-малко точки — едва във втория прозорец
    if(adRes){ const r=avg/adRes; adRes=0; if(r<.9) adNo=0; else if(r>.97&&++adNo>=2){ qNg=1; adNo=0; qSet(adQs,fDiv); return; } }   // с 28% по-малко точки — не по-евтино: пречката е другаде
    const tI=frT();
    if(avg>(fDiv===1?1.4:1.15)*tI&&adCool<=0) return qDown(avg);
    if(fDiv===1){ if(avg<1.05*tI&&(!gpu||gpu*1.21<=.85*tI)){ if(++adGood>=4&&qMul<1) qSet(Math.min(1,qMul*1.1),1); } else adGood=0; return; }
    if(adCool<=0){ if(gpu) qUp(gpu); else if(prT<=0&&prF<3){ prOn=fDiv; fDiv=1; adT=adN=0; } } }
  function onResize(){ alloc(); qCal(); }
  function onVis(){ if(document.visibilityState==='visible') qCal(); }
  function free(){ for(const r of [FB,...BL,...BU]) if(r) r.del(); FB=null; BL=[]; BU=[]; iw=ih=0; }

  /* ---------- звук: анализ като във визуализатора (ленти, удари, „скорост на музиката“) ---------- */
  const A={bassA:1,midA:1,trebA:1,beatLo:0,beatHi:0,vol:0,spd:.45},
    U={an:null,fq:new Float32Array(1024),td:new Float32Array(2048),V:new Float32Array(512),Vp:new Float32Array(512),map:null,ref:-40,pk:.15,L:[0,0,0],age:0,pLo:0,pHi:0};
  const mkDet=()=>({h:new Float32Array(48),i:0,n:0,last:-9}),dLo=mkDet(),dHi=mkDet();
  function det(d,x,now,gap,minAbs){ const h=d.h,N=Math.min(d.n,h.length); let m=0,s=0;
    for(let i=0;i<N;i++) m+=h[i]; m/=Math.max(1,N); for(let i=0;i<N;i++) s+=(h[i]-m)**2; s=Math.sqrt(s/Math.max(1,N));
    h[d.i]=x; d.i=(d.i+1)%h.length; d.n++;
    if(N>12&&x>m+1.4*s+minAbs&&now-d.last>gap){ d.last=now; return Math.min(1,.35+(x-m)/(5*s+minAbs*4+1e-6)); } return 0; }
  function listen(){ if(U.an||!AC||!musOut) return; U.an=AC.createAnalyser(); U.an.fftSize=2048; U.an.smoothingTimeConstant=.55; U.an.minDecibels=-110; U.an.maxDecibels=-10; musOut.connect(U.an); }
  function audio(dt,now){ U.pLo*=Math.exp(-dt/.3); U.pHi*=Math.exp(-dt/.3);
    if(U.an){ const an=U.an,fq=U.fq,bin=AC.sampleRate/2048; an.getFloatFrequencyData(fq); an.getFloatTimeDomainData(U.td);
      if(!U.map){ U.map=[]; const K=Math.pow(14000/30,1/512); for(let j=0;j<512;j++) U.map.push([30*Math.pow(K,j)/bin,30*Math.pow(K,j+1)/bin]); }
      const band=(f0,f1)=>{ let s=0,n=0; for(let i=Math.max(1,Math.floor(f0/bin));i<=Math.ceil(f1/bin)&&i<1024;i++){ s+=Math.pow(10,fq[i]/10); n++; } return s/Math.max(1,n); };
      const E=[band(25,180),band(180,2000),band(2000,10000)],nm=['bassA','midA','trebA']; U.age+=dt; const tl=Math.min(5,.25+U.age*.5);
      for(let k=0;k<3;k++){ const L=U.L[k]=U.L[k]?U.L[k]+(E[k]-U.L[k])*(1-Math.exp(-dt/tl)):E[k]; A[nm[k]]=sm(A[nm[k]],Math.min(2.5,Math.sqrt((E[k]+1e-11)/(L+1e-11))),.3,1,dt); }
      let mx=-200; const V=U.V,Vp=U.Vp;
      for(let j=0;j<512;j++){ const [b0,b1]=U.map[j]; let db;
        if(b1-b0<1){ const x=Math.min(1022,(b0+b1)/2),i=Math.floor(x),f=x-i; db=fq[i]*(1-f)+fq[i+1]*f; }
        else{ db=-200; for(let i=Math.floor(b0);i<=Math.min(1023,Math.ceil(b1));i++) db=Math.max(db,fq[i]); }
        V[j]=db; if(db>mx) mx=db; }
      U.ref=mx>U.ref?U.ref+(mx-U.ref)*(1-Math.exp(-dt/.5)):Math.max(mx,U.ref-3*dt);
      let fl=0,fh=0; for(let j=0;j<512;j++){ const v=Math.pow(Math.min(1,Math.max(0,(V[j]-(U.ref-62))/62)),1.4),df=v-Vp[j]; if(df>0){ if(j<160) fl+=df; else if(j>=290&&j<470) fh+=df; } Vp[j]=v; }
      const sl=det(dLo,fl,now,.22,.6),sh=det(dHi,fh,now,.15,.5); if(sl) U.pLo=Math.max(U.pLo,sl); if(sh) U.pHi=Math.max(U.pHi,sh);
      let pk=0,rms=0; for(let k=0;k<1024;k+=2){ const x=U.td[k]; rms+=x*x; pk=Math.max(pk,Math.abs(x)); }
      U.pk=Math.max(.004,pk>U.pk?U.pk+(pk-U.pk)*(1-Math.exp(-dt/.35)):U.pk*Math.exp(-dt/3)); A.vol=sm(A.vol,Math.min(1,Math.sqrt(rms/512)*.5/U.pk*2.5),.25,.8,dt); }
    else{ for(const k of ['bassA','midA','trebA']) A[k]=sm(A[k],1,.5,.5,dt); A.vol=sm(A.vol,0,.5,.5,dt); }
    A.beatLo=sm(A.beatLo,U.pLo,.2,.7,dt); A.beatHi=sm(A.beatHi,U.pHi,.2,.7,dt);
    const en=Math.min(2,Math.max(0,(A.bassA-1)*.8+(A.midA-1)*.5+A.vol*.9+A.beatLo*.6+A.beatHi*.3)); A.spd=sm(A.spd,.35+.37*Math.min(en,1.5),1.2,2,dt); }

  /* ---------- вид на логото ---------- */
  // първото (такт 4) — неон (тъмни лица, светещи цветни ръбове), винаги с пресечките (мига и се разкъсва на ленти, като стар телевизор); повторенията (на всеки 16 такта) — случаен материал, появяване и украса, без да повтарят предишните
  // материали: 0 бяло (не се избира), 1 хром, 2 от дантелата на фрактала, 3 преливащо стъкло, 4 неон, 5 цветен метал
  // появяване: 0 плавно, 1 обръщане от ръб, 2 букви от дълбочината, 3 завъртане, 4 падане с отскок, 5 отдалеч и покрай камерата, 6 разпадане на кубчета
  // украса: 0 —, 1 пресечки, 2 светла ивица, 3 ехо в дълбочината, 4 пулс по ударите
  const look0=()=>({m:4,e:0,x:1,hue:Math.random(),s:1,seed:Math.random()*100}),TTL={in:.7,hold:2.3,out:1.6},END=TTL.in+TTL.hold+TTL.out;
  const pickN=(n,from,not)=>{ let v; do v=from+Math.floor(Math.random()*(n-from)); while(v===not&&n-from>1); return v; };
  const newLook=p=>({m:pickN(6,1,p.m),e:pickN(7,0,p.e),x:pickN(5,0,p.x),hue:Math.random(),s:Math.random()<.5?-1:1,seed:Math.random()*100});
  const clamp01=x=>Math.min(1,Math.max(0,x)),bounce=x=>{ const n=7.5625,d=2.75; return x<1/d?n*x*x:x<2/d?n*(x-=1.5/d)*x+.75:x<2.5/d?n*(x-=2.25/d)*x+.9375:n*(x-=2.625/d)*x+.984375; };
  function lookPar(L,lt){   // → униформите на логото в момент lt (s) от появата му
    const s=L.s,inK=ease(clamp01(lt/1.1)),outK=ease(clamp01((lt-(END-1.3))/1.3)),hj=n=>{ const v=Math.sin(n*127.1+L.seed*311.7)*43758.5453; return v-Math.floor(v); };
    let la=Math.min(1,lt/TTL.in)*Math.min(1,Math.max(0,(END-lt)/TTL.out)),S=.82+lt*.05,yaw=s*(.4-.13*lt),pit=.08*Math.sin(lt*.9)-.03,O=[0,0,0],F=0,D=0,W=1;
    if(L.e===1){ yaw=s*1.5*(1-inK)-s*1.5*outK; la=Math.min(1,lt/.4)*Math.min(1,Math.max(0,(END-lt)/.5)); S=.9; }
    else if(L.e===2){ F=lt<1.4?Math.max(1e-3,lt/1.4)*.999:lt>END-1.4?1+Math.min(.999,(lt-(END-1.4))/1.4):0; la=Math.min(1,lt/.3)*Math.min(1,Math.max(0,(END-lt)/.3));
      W=lt<1.4?ease(clamp01((lt-1)/.4)):1-ease(clamp01((lt-(END-1.4))/.3)); yaw=s*.15*Math.sin(lt*.7); S=.85; }
    else if(L.e===3){ yaw=s*(Math.PI*2*(1-ease(clamp01(lt/2.6)))+.2); la=Math.min(1,lt/.5)*Math.min(1,Math.max(0,(END-lt)/TTL.out)); S=.86; }
    else if(L.e===4){ O[1]=.7*(1-bounce(clamp01(lt/1.2)))-.9*outK*outK; la=Math.min(1,lt/.25)*Math.min(1,Math.max(0,(END-lt)/1)); yaw=s*.2*Math.sin(lt*.8); S=.86; }
    else if(L.e===5){ const k=clamp01(lt/1.6),ok=clamp01((lt-(END-1.1))/1.1); O[2]=6*Math.pow(1-k,3)-.55*ease(ok); la=Math.min(1,lt/.6)*(1-ok); yaw=s*.25*Math.sin(lt*.6); S=.86; }
    else if(L.e===6){ D=lt<1.4?1-lt/1.4:lt>END-1.6?(lt-(END-1.6))/1.6:0; la=Math.min(1,lt/.15)*Math.min(1,Math.max(0,(END-lt)/.15)); yaw=s*(.3-.1*lt); }
    const G=L.x===1&&hj(Math.floor(lt*7))>.6?(.5+.5*hj(Math.floor(lt*7)+.5))*la:0,B=L.x===4?A.beatHi:0;
    return {uLA:la,uLS:S*(1+.07*B)*Math.min(1,iw/ih/1.25),uLY:yaw,uLP:pit,uLO:O,uLM:L.m,uLX:L.x,uLH:L.hue,uLF:F,uLD:D,uLG:G,uLW:W,uLt:lt,uLB:B}; }

  /* ---------- ход ---------- */
  let V,ph='done',T=0,tc=0,t0=0,tOut=0,tB=Infinity,tBT=Infinity,barD=2,tL=-1,lk=0,look=null,raf=0,last=0,idleT=0,osdT=0,swAt=-1,tLac=-1,dead=false,swl=[];
  const master0=.85, acNow=()=>AC?AC.currentTime:0;
  function ramp(v,d){ if(!AC||!master) return; const t=AC.currentTime,g=master.gain; g.cancelScheduledValues(t); g.setValueAtTime(g.value,t); g.linearRampToValueAtTime(v,t+d); }
  // отначало — при зареждане и с Esc от главното меню: случайни гама, място по пътя и фаза на „дишането“ (K); музиката — заглушена до натискане
  function open(){ if(dead) return false; if(ph!=='done') return true;
    V={h:Math.random(),c:Math.random()*60,q:Math.random()*370}; ph='cover'; T=0; tc=V.c; tB=tBT=Infinity; tL=-1; lk=0; look=null; swAt=-1; swl=[]; last=performance.now(); idleT=0;
    state='title'; mCue=null; mInt=0; bossMusic=false; ramp(0,.12); if(AC) mNext=AC.currentTime+1e6;
    qMul=1; fDiv=1; qNg=0; adNo=0; adRes=0; prOn=0; prT=prI=12; prF=0; qCal(); alloc();   // музиката спира (нищо ново не се насрочва) до натискане
    box.classList.remove('off','gone','idle'); cov.classList.remove('on'); setTimeout(()=>{ if(ph==='cover') cov.classList.add('on'); },30);
    addEventListener('keydown',onKey,true); addEventListener('resize',onResize); document.addEventListener('visibilitychange',onVis); raf=requestAnimationFrame(frame); return true; }
  function start(){ if(ph!=='cover') return; ph='run'; t0=T; cov.classList.remove('on');
    if(store.get('rz.audio','')==='') audSet(true,true);   // никога не е избирал — интрото е с музика (като M); иначе — неговият избор
    initAudio(); const spb=60/mBpm/4; barD=16*spb; tBT=T+.05+64*spb;
    if(AC){ const t=AC.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(0,t); master.gain.linearRampToValueAtTime(master0,t+1);
      musRestart(); mInt=0; bossMusic=false; const s0=mNext; tB=s0+64*spb;
      mCue=x=>{ const b=Math.floor((x-s0)/barD+1e-4),v=b%16<4?0:1; if(v!==mInt){ mInt=v; if(swl.length<20) swl.push([+(x-s0).toFixed(3),v]); } if(b===4&&swAt<0) swAt=x; }; listen(); } }   // кръг от 16 такта: 4 „Спокойно“, 12 „Битка“ — точно на такта   // 4 такта „Спокойно“, после „Битка“ — точно на такта
  function skip(){ if(ph!=='run') return; ph='out'; tOut=T; mCue=null; ramp(0,.5); }
  function toMenuNow(){ ph='menu'; initAudio(); toMenu(modeSel+2); musRestart(); ramp(master0,.5);   // като Z на стария начален екран; музиката на менюто — отначало
    box.classList.add('gone'); setTimeout(finish,550); }
  function finish(){ if(ph==='done') return; const was=ph; ph='done'; cancelAnimationFrame(raf); mCue=null;
    if(was!=='menu'&&AC&&master){ const g=master.gain; g.cancelScheduledValues(AC.currentTime); g.setValueAtTime(master0,AC.currentTime); }
    removeEventListener('keydown',onKey,true); removeEventListener('resize',onResize); document.removeEventListener('visibilitychange',onVis);
    if(U.an){ try{ musOut.disconnect(U.an); }catch(e){} U.an=null; }
    if(AC&&mNext>AC.currentTime+60) mNext=AC.currentTime+.05;   // спряната в началния екран музика продължава
    free(); box.classList.add('off'); if(typeof cv.focus==='function') cv.focus(); }
  function osd(s){ osdEl.textContent=s; osdEl.classList.add('on'); clearTimeout(osdT); osdT=setTimeout(()=>osdEl.classList.remove('on'),1500); }
  function onKey(e){ if(ph==='menu'||ph==='done') return;
    if(e.code==='KeyF') return;                                     // цял екран — на играта (input.js)
    e.stopImmediatePropagation(); if(e.metaKey||e.ctrlKey||e.altKey) return;   // съчетанията — на браузъра, но не и на играта
    e.preventDefault(); if(e.repeat||/^(Shift|Control|Alt|Meta|CapsLock)$/.test(e.key)) return;
    if(e.code==='KeyM'){ toggleMute(); osd(musOn||sfxOn?'звук вкл.':'звук изкл.'); return; }
    if(ph==='cover') start(); else skip(); }
  box.addEventListener('click',e=>{ e.preventDefault(); if(ph==='cover') start(); else if(ph!=='done') skip(); });   // click: на iPhone звукът тръгва само от него
  box.addEventListener('mousemove',()=>{ box.classList.remove('idle'); idleT=T; });
  cv2.addEventListener('webglcontextlost',()=>{ dead=true; if(ph!=='done'&&ph!=='menu') finish(); });   // без картина — старият начален екран
  if(matchMedia('(pointer:coarse)').matches) box.querySelector('.kh').textContent='или докосни екрана';

  function frame(now){ raf=requestAnimationFrame(frame);
    if(state!=='title'&&ph!=='menu'){ finish(); return; }   // извън началния екран по друг път (проверките) — интрото изчезва
    if(fpGate(now)) return; tqBegin();
    const rdt=Math.min(.5,Math.max(.001,(now-last)/1000)),dt=Math.min(.05,rdt); last=now; T+=dt;   // rdt — истинското време (за качеството), dt — за анимацията
    audio(dt,T); tc+=dt*(.035+.11*A.spd);
    if(ph==='run'&&T-idleT>3) box.classList.add('idle');
    let fade=ph==='cover'?Math.min(1,T):1,expo=.55;
    if(ph!=='cover'){ expo=.55+.45*ease(Math.min(1,(T-t0)/1));
      const nowB=AC?acNow():T,b0=AC?tB:tBT;   // логото: такт 4, после на всеки 16 (20, 36 …) — там, където влиза „Битка“
      if(!AC) mInt=Math.floor((T-tBT)/barD+4)%16<4?0:1;
      if(nowB>=b0+lk*16*barD){ while(nowB>=b0+(lk+1)*16*barD) lk++; tL=T-(nowB-(b0+lk*16*barD)); if(!lk) tLac=acNow(); look=lk?newLook(look):look0(); lk++; }
      if(ph==='out'){ fade=Math.max(0,1-(T-tOut)/.5); if(fade<=0) toMenuNow(); } }
    if(ph==='menu') fade=0;
    const lt=V.hold!=null?V.hold:tL<0?-1:T-tL,tq=T+V.q,LP=lt<0||lt>END?{uLA:0}:lookPar(V.look||look,lt);
    Object.assign(G,{uT:T,uBassA:A.bassA,uTrebA:A.trebA,uBeatHi:A.beatHi});
    run(P.frac,Object.assign({uT:T+V.h*100,uTc:tc,uQ:[Math.sin(tq*.031),Math.sin(tq*.023+1),Math.sin(tq*.017+2),Math.sin(tq*.027+3)],uSdf:SDF},LP),FB);
    run(P.bpre,{uSrc:FB.t,uTx:FB.tx,uThr:.55},BL[0]);
    for(let i=1;i<BL.length;i++) run(P.bdown,{uSrc:BL[i-1].t,uTx:BL[i-1].tx},BL[i]);
    let src=BL[BL.length-1]; for(let i=BL.length-2;i>=0;i--){ run(P.bup,{uSrc:src.t,uTx:src.tx,uAdd:BL[i].t},BU[i]); src=BU[i]; }
    run(P.comp,{uFB:FB.t,uBl:src.t,uFade:fade,uBloom:.15*.3,uCA:.1*(1+.5*Math.max(A.beatLo,A.beatHi*.7)),uVig:.35,uExpo:1.3*expo,uGrain:.03},null);
    tqEnd(); adapt(rdt); }
  open();
  return {open,get ph(){ return ph; },get T(){ return T; },start,skip,finish,dbg:o=>{ if(o.tL!=null) tL=o.tL; if(o.tc!=null) tc=o.tc; if(o.q!=null) V.q=o.q; if(o.h!=null) V.h=o.h;
    if('hold' in o) V.hold=o.hold; if('look' in o) V.look=o.look;
    return {T,tL,tc,V,qMul,fDiv,vI,qNg,prF,prI,prOn,tqBad,iw,ih,t0,tB,swAt,swl,barD,tLac,lk,look,mInt,mStep,ac:acNow(),gain:master?master.gain.value:null,musOn}; }};
})();
