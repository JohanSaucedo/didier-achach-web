import base64, os, shutil

with open(r'C:\Users\jleds\DIDIER ACHACH\img\logo-notext.png', 'rb') as f:
    LOGO_URI = 'data:image/png;base64,' + base64.b64encode(f.read()).decode()

THREE = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js'
OUT   = r'C:\Users\jleds\DIDIER ACHACH'
DESK  = r'C:\Users\jleds\OneDrive\Desktop'

def page(title, label, bg, js):
    return f"""<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><title>{title}</title>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{background:{bg};overflow:hidden;width:100vw;height:100vh}}
canvas{{display:block}}
#lbl{{position:fixed;top:1.2rem;left:1.2rem;font-family:sans-serif;font-size:.7rem;
letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.5);
border:1px solid rgba(255,255,255,.2);padding:.35rem .75rem;border-radius:2px}}
</style></head><body>
<canvas id="c"></canvas>
<div id="lbl">{label}</div>
<script src="{THREE}"></script>
<script>
const LOGO="{LOGO_URI}";
const AR=912/1440;
{js}
</script></body></html>"""

# ── helpers comunes ──────────────────────────────────────────
COMMON_SETUP = """
const canvas=document.getElementById('c');
let W=innerWidth,H=innerHeight;
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setSize(W,H);renderer.setPixelRatio(Math.min(devicePixelRatio,2));
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(45,W/H,0.1,100);
camera.position.z=5;
window.addEventListener('resize',()=>{
  W=innerWidth;H=innerHeight;
  camera.aspect=W/H;camera.updateProjectionMatrix();renderer.setSize(W,H);
});
function makeParticles(n,spread){
  const pos=new Float32Array(n*3),col=new Float32Array(n*3);
  const pal=[[.9,.2,.2],[.96,.87,0],[.29,.62,.18],[.52,.1,.44],[1,.75,.2]];
  for(let i=0;i<n;i++){
    const r=spread+Math.random()*spread*.6,th=Math.random()*Math.PI*2,ph=Math.acos(2*Math.random()-1);
    pos[i*3]=r*Math.sin(ph)*Math.cos(th);pos[i*3+1]=r*Math.sin(ph)*Math.sin(th);pos[i*3+2]=r*Math.cos(ph);
    const c=pal[i%pal.length];col[i*3]=c[0];col[i*3+1]=c[1];col[i*3+2]=c[2];
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  g.setAttribute('color',new THREE.BufferAttribute(col,3));
  const p=new THREE.Points(g,new THREE.PointsMaterial({size:.06,vertexColors:true,transparent:true,opacity:.8}));
  scene.add(p);return p;
}
function loadTex(cb){
  const img=new Image();
  img.onload=()=>{const t=new THREE.Texture(img);t.needsUpdate=true;cb(t);};
  img.src=LOGO;
}
"""

# ════════════════════════════════════════════════════════════
# A — PARALLAX POR CAPAS
# ════════════════════════════════════════════════════════════
JS_A = COMMON_SETUP + """
scene.add(new THREE.AmbientLight(0xffffff,1.1));
const lA=new THREE.PointLight(0xe63535,2.5,12);lA.position.set(-3,2,3);scene.add(lA);
const lB=new THREE.PointLight(0xf5de00,2,12);lB.position.set(3,-2,3);scene.add(lB);

const group=new THREE.Group();scene.add(group);
const layers=[];
const layerCfg=[
  {z:-.5,scale:1.15,opacity:.3,mx:-.18},
  {z:-.18,scale:1.06,opacity:.55,mx:-.08},
  {z:0,scale:1.0,opacity:1.0,mx:0},
  {z:.22,scale:.93,opacity:.3,mx:.1},
  {z:.45,scale:.85,opacity:.12,mx:.2}
];
loadTex(tex=>{
  layerCfg.forEach(cfg=>{
    const m=new THREE.Mesh(
      new THREE.PlaneGeometry(4.4*cfg.scale,4.4*cfg.scale*AR),
      new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.DoubleSide,opacity:cfg.opacity})
    );
    m.position.z=cfg.z;m.userData.mx=cfg.mx;
    group.add(m);layers.push(m);
  });
});
const pts=makeParticles(160,3.2);
let tx=0,ty=0,cx=0,cy=0,t=0;
document.addEventListener('mousemove',e=>{tx=(e.clientX/W-.5);ty=(e.clientY/H-.5);});
(function loop(){requestAnimationFrame(loop);t+=.008;
  cx+=(tx-cx)*.055;cy+=(ty-cy)*.055;
  group.rotation.y=cx*.9;group.rotation.x=-cy*.6;
  layers.forEach(m=>{m.position.x=cx*m.userData.mx*2;m.position.y=-cy*m.userData.mx*2;});
  group.position.y=Math.sin(t*.65)*.12;
  lA.position.x=Math.cos(t*.45)*4;lA.position.y=Math.sin(t*.3)*3;
  lB.position.x=Math.cos(t*.4+Math.PI)*4;
  pts.rotation.y=t*.03;
  renderer.render(scene,camera);
})();
"""

# ════════════════════════════════════════════════════════════
# B — HOLOGRÁFICO
# ════════════════════════════════════════════════════════════
JS_B = COMMON_SETUP + """
scene.add(new THREE.AmbientLight(0x001133,.8));
const lH=new THREE.PointLight(0x00ccff,3,10);lH.position.set(0,0,3);scene.add(lH);
const lH2=new THREE.PointLight(0x0066ff,2,8);lH2.position.set(-2,2,2);scene.add(lH2);

const vert=`
varying vec2 vUv;
void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}
`;
const frag=`
uniform sampler2D uTex;
uniform float uTime;
varying vec2 vUv;
float rnd(vec2 s){return fract(sin(dot(s,vec2(12.9898,78.233)))*43758.545);}
void main(){
  float ab=.007+.004*sin(uTime*1.8);
  vec4 r=texture2D(uTex,vUv+vec2(ab,0.));
  vec4 g=texture2D(uTex,vUv);
  vec4 b=texture2D(uTex,vUv-vec2(ab,0.));
  float a=g.a;
  vec3 col=vec3(r.r,g.g,b.b);
  float scan=sin(vUv.y*200.+uTime*5.)*.035+.965;
  col*=scan;
  float holoA=(1.-a)*.35*(0.5+0.5*sin(uTime*2.2));
  col+=vec3(0.,.7,1.)*holoA;
  float gline=step(.997,rnd(vec2(floor(vUv.y*50.),floor(uTime*10.))));
  vec2 guv=vUv+vec2(gline*(rnd(vec2(uTime*.1))-.5)*.06,0.);
  vec4 gs=texture2D(uTex,guv);
  col=mix(col,gs.rgb*vec3(0.,1.,1.),gline*.7);
  a=max(a,gs.a*gline*.5);
  float pulse=.82+.18*sin(uTime*2.8);
  float rim=smoothstep(.35,.5,length(vUv-.5));
  col+=vec3(0.,.4,1.)*rim*.3*sin(uTime*3.+vUv.y*8.);
  gl_FragColor=vec4(col,a*pulse);
}
`;
const group=new THREE.Group();scene.add(group);
loadTex(tex=>{
  const uni={uTex:{value:tex},uTime:{value:0}};
  const mat=new THREE.ShaderMaterial({vertexShader:vert,fragmentShader:frag,uniforms:uni,transparent:true,side:THREE.DoubleSide});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(4.4,4.4*AR),mat);
  group.add(mesh);
  // scan overlay ring
  const ring=new THREE.Mesh(new THREE.TorusGeometry(2.8,.006,8,100),new THREE.MeshBasicMaterial({color:0x00ccff,transparent:true,opacity:.3}));
  ring.rotation.x=Math.PI/3;group.add(ring);
  const ring2=new THREE.Mesh(new THREE.TorusGeometry(3.3,.004,8,100),new THREE.MeshBasicMaterial({color:0x0066ff,transparent:true,opacity:.2}));
  ring2.rotation.y=Math.PI/4;group.add(ring2);
  const pts=makeParticles(120,3.5);
  let tx=0,ty=0,cx=0,cy=0,t=0;
  document.addEventListener('mousemove',e=>{tx=(e.clientX/W-.5);ty=(e.clientY/H-.5);});
  (function loop(){requestAnimationFrame(loop);t+=.009;
    uni.uTime.value=t*6;
    cx+=(tx-cx)*.05;cy+=(ty-cy)*.05;
    group.rotation.y=cx*.9;group.rotation.x=-cy*.6;
    group.position.y=Math.sin(t*.7)*.1;
    lH.position.x=Math.cos(t*.5)*3;lH.position.y=Math.sin(t*.4)*2;
    ring.rotation.z=t*.15;ring2.rotation.y=t*.1;
    pts.rotation.y=t*.025;
    renderer.render(scene,camera);
  })();
});
"""

# ════════════════════════════════════════════════════════════
# C — SHADERS DE ENERGÍA
# ════════════════════════════════════════════════════════════
JS_C = COMMON_SETUP + """
scene.add(new THREE.AmbientLight(0x110500,.9));
const lE1=new THREE.PointLight(0xff3300,3,10);lE1.position.set(-2,2,3);scene.add(lE1);
const lE2=new THREE.PointLight(0xff9900,2.5,10);lE2.position.set(2,-1,3);scene.add(lE2);

const vert=`
varying vec2 vUv;
uniform float uTime;
void main(){
  vUv=uv;
  vec3 p=position;
  p.z+=sin(p.x*4.+uTime*2.)*.03*sin(p.y*3.+uTime*1.5);
  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
}`;
const frag=`
uniform sampler2D uTex;
uniform float uTime;
varying vec2 vUv;
float noise(vec2 p){
  return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);
}
float smoothNoise(vec2 p){
  vec2 i=floor(p);vec2 f=fract(p);
  float a=noise(i),b=noise(i+vec2(1,0)),c=noise(i+vec2(0,1)),d=noise(i+vec2(1,1));
  vec2 u=f*f*(3.-2.*f);
  return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;
}
void main(){
  vec2 uv=vUv;
  float n=smoothNoise(uv*4.+uTime*.4)*.04;
  float n2=smoothNoise(uv*8.-uTime*.3)*.02;
  uv+=vec2(n,n2);
  vec4 tex=texture2D(uTex,uv);
  vec4 texR=texture2D(uTex,uv+vec2(.004,0));
  vec4 texL=texture2D(uTex,uv-vec2(.004,0));
  vec4 texU=texture2D(uTex,uv+vec2(0,.004));
  vec4 texD=texture2D(uTex,uv-vec2(0,.004));
  float edge=(abs(tex.a-texR.a)+abs(tex.a-texL.a)+abs(tex.a-texU.a)+abs(tex.a-texD.a))*6.;
  edge=clamp(edge,0.,1.);
  float pulse=.5+.5*sin(uTime*3.);
  float pulse2=.5+.5*sin(uTime*5.+vUv.x*10.);
  vec3 fire=mix(vec3(1.,.15,0.),vec3(1.,.85,0.),pulse2);
  vec3 col=tex.rgb+fire*edge*(1.2+.8*pulse);
  col+=vec3(1.,.3,0.)*edge*.3*pulse;
  float alpha=max(tex.a,edge*.6);
  gl_FragColor=vec4(col,alpha);
}`;
const group=new THREE.Group();scene.add(group);
loadTex(tex=>{
  const uni={uTex:{value:tex},uTime:{value:0}};
  const mat=new THREE.ShaderMaterial({vertexShader:vert,fragmentShader:frag,uniforms:uni,transparent:true,side:THREE.DoubleSide});
  const geo=new THREE.PlaneGeometry(4.4,4.4*AR,32,32);
  const mesh=new THREE.Mesh(geo,mat);group.add(mesh);
  // glow behind
  const gm=new THREE.Mesh(new THREE.PlaneGeometry(4.9,4.9*AR),
    new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:.08,side:THREE.DoubleSide}));
  gm.position.z=-.2;group.add(gm);
  const pts=makeParticles(200,3);
  let tx=0,ty=0,cx=0,cy=0,t=0;
  document.addEventListener('mousemove',e=>{tx=(e.clientX/W-.5);ty=(e.clientY/H-.5);});
  (function loop(){requestAnimationFrame(loop);t+=.01;
    uni.uTime.value=t*5;
    cx+=(tx-cx)*.05;cy+=(ty-cy)*.05;
    group.rotation.y=cx*.9;group.rotation.x=-cy*.6;
    group.position.y=Math.sin(t*.6)*.1;
    lE1.position.x=Math.cos(t*.5)*3.5;lE1.position.y=Math.sin(t*.4)*2.5;
    lE2.position.x=Math.cos(t*.4+Math.PI)*3.5;
    pts.rotation.y=t*.04;pts.rotation.x=t*.015;
    renderer.render(scene,camera);
  })();
});
"""

# ════════════════════════════════════════════════════════════
# D — REFLEJO EN AGUA
# ════════════════════════════════════════════════════════════
JS_D = COMMON_SETUP + """
scene.add(new THREE.AmbientLight(0x112233,.8));
const lW1=new THREE.PointLight(0x4499ff,2.5,12);lW1.position.set(-2,3,3);scene.add(lW1);
const lW2=new THREE.PointLight(0x88ddff,1.5,10);lW2.position.set(2,-1,2);scene.add(lW2);
const lW3=new THREE.PointLight(0xffffff,1,8);lW3.position.set(0,4,3);scene.add(lW3);

const waterVert=`
varying vec2 vUv;
varying vec3 vPos;
void main(){vUv=uv;vPos=position.xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const waterFrag=`
uniform sampler2D uReflection;
uniform float uTime;
varying vec2 vUv;
void main(){
  vec2 uv=vUv;
  float wave1=sin(uv.x*8.+uTime*1.8)*.012;
  float wave2=cos(uv.y*6.+uTime*1.4)*.01;
  float wave3=sin((uv.x+uv.y)*10.+uTime*2.2)*.008;
  uv.x+=wave1+wave3;uv.y+=wave2;
  vec2 reflUV=vec2(uv.x,1.-uv.y);
  reflUV.x+=wave1*.5;reflUV.y+=wave2*.5;
  vec4 refl=texture2D(uReflection,reflUV);
  float depth=uv.y;
  vec3 waterCol=vec3(.04,.12,.22);
  float spec=pow(max(0.,sin(uv.x*15.+uTime*3.)),12.)*.15;
  spec+=pow(max(0.,cos(uv.y*10.-uTime*2.)),10.)*.1;
  vec3 col=mix(waterCol,refl.rgb*.7,refl.a*.45*depth);
  col+=vec3(.3,.6,1.)*spec;
  float alpha=.75+depth*.2;
  gl_FragColor=vec4(col,alpha);
}`;
const group=new THREE.Group();scene.add(group);
loadTex(tex=>{
  // Logo flotando arriba
  const logoMat=new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.DoubleSide});
  const logo=new THREE.Mesh(new THREE.PlaneGeometry(4.2,4.2*AR),logoMat);
  logo.position.y=.5;group.add(logo);
  // Agua
  const wUni={uReflection:{value:tex},uTime:{value:0}};
  const water=new THREE.Mesh(
    new THREE.PlaneGeometry(7,3.5,1,1),
    new THREE.ShaderMaterial({vertexShader:waterVert,fragmentShader:waterFrag,uniforms:wUni,transparent:true,side:THREE.DoubleSide})
  );
  water.rotation.x=-Math.PI*.35;water.position.y=-1.6;water.position.z=-.5;group.add(water);
  // Reflection blurred copy
  const reflMat=new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.DoubleSide,opacity:.18});
  const refl=new THREE.Mesh(new THREE.PlaneGeometry(4.2,4.2*AR),reflMat);
  refl.position.y=-1.1;refl.scale.y=-1;refl.rotation.x=-.18;group.add(refl);
  const pts=makeParticles(100,4);
  let tx=0,ty=0,cx=0,cy=0,t=0;
  document.addEventListener('mousemove',e=>{tx=(e.clientX/W-.5);ty=(e.clientY/H-.5);});
  (function loop(){requestAnimationFrame(loop);t+=.008;
    wUni.uTime.value=t*5;
    cx+=(tx-cx)*.04;cy+=(ty-cy)*.04;
    group.rotation.y=cx*.5;group.rotation.x=-cy*.25;
    logo.position.y=.5+Math.sin(t*.7)*.08;
    refl.position.y=-1.1-Math.sin(t*.7)*.08;
    lW1.position.x=Math.cos(t*.4)*4;
    pts.rotation.y=t*.02;
    renderer.render(scene,camera);
  })();
});
"""

# ════════════════════════════════════════════════════════════
# E — PARTÍCULAS QUE FORMAN EL LOGO
# ════════════════════════════════════════════════════════════
JS_E = """
const canvas=document.getElementById('c');
let W=innerWidth,H=innerHeight;
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setSize(W,H);renderer.setPixelRatio(Math.min(devicePixelRatio,2));
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(45,W/H,0.1,100);
camera.position.z=6;
scene.add(new THREE.AmbientLight(0xffffff,.5));
window.addEventListener('resize',()=>{W=innerWidth;H=innerHeight;camera.aspect=W/H;camera.updateProjectionMatrix();renderer.setSize(W,H);});

let particles, positions, targets, colors, velocities, assembled=false, assembling=false;

function explode(){
  assembled=false;assembling=false;
  const N=positions.length/3;
  for(let i=0;i<N;i++){
    velocities[i*3]=(Math.random()-.5)*0.35;
    velocities[i*3+1]=(Math.random()-.5)*0.35;
    velocities[i*3+2]=(Math.random()-.5)*0.25;
  }
  setTimeout(()=>{assembling=true;},1200);
}
document.addEventListener('click',()=>{if(assembled)explode();});

const img=new Image();
img.onload=()=>{
  const OW=140,OH=Math.round(140*AR);
  const oc=document.createElement('canvas');oc.width=OW;oc.height=OH;
  const ctx=oc.getContext('2d');ctx.drawImage(img,0,0,OW,OH);
  const px=ctx.getImageData(0,0,OW,OH).data;
  const pts=[];
  for(let y=0;y<OH;y++){for(let x=0;x<OW;x++){
    const i=(y*OW+x)*4;
    if(px[i+3]>45)pts.push({
      tx:(x/OW-.5)*5.2,ty:-(y/OH-.5)*3.3,tz:0,
      r:px[i]/255,g:px[i+1]/255,b:px[i+2]/255
    });
  }}
  const N=pts.length;
  positions=new Float32Array(N*3);
  targets=new Float32Array(N*3);
  colors=new Float32Array(N*3);
  velocities=new Float32Array(N*3);
  for(let i=0;i<N;i++){
    const r=4+Math.random()*6,th=Math.random()*Math.PI*2,ph=Math.acos(2*Math.random()-1);
    positions[i*3]=r*Math.sin(ph)*Math.cos(th);
    positions[i*3+1]=r*Math.sin(ph)*Math.sin(th);
    positions[i*3+2]=r*Math.cos(ph);
    targets[i*3]=pts[i].tx;targets[i*3+1]=pts[i].ty;targets[i*3+2]=pts[i].tz;
    colors[i*3]=pts[i].r;colors[i*3+1]=pts[i].g;colors[i*3+2]=pts[i].b;
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geo.setAttribute('color',new THREE.BufferAttribute(colors,3));
  particles=new THREE.Points(geo,new THREE.PointsMaterial({size:.055,vertexColors:true,transparent:true,opacity:.95}));
  scene.add(particles);
  setTimeout(()=>{assembling=true;},300);
  let tx=0,ty=0,cx=0,cy=0,t=0,hint=true;
  document.addEventListener('mousemove',e=>{tx=(e.clientX/W-.5)*.8;ty=(e.clientY/H-.5)*.5;});
  (function loop(){requestAnimationFrame(loop);t+=.012;
    cx+=(tx-cx)*.04;cy+=(ty-cy)*.04;
    const pos=particles.geometry.attributes.position.array;
    const N2=pos.length/3;let done=0;
    for(let i=0;i<N2;i++){
      if(assembling){
        pos[i*3]+=(targets[i*3]-pos[i*3])*.055;
        pos[i*3+1]+=(targets[i*3+1]-pos[i*3+1])*.055;
        pos[i*3+2]+=(targets[i*3+2]-pos[i*3+2])*.055;
        const dx=Math.abs(pos[i*3]-targets[i*3]);
        if(dx<.02)done++;
      } else {
        pos[i*3]+=velocities[i*3];pos[i*3+1]+=velocities[i*3+1];pos[i*3+2]+=velocities[i*3+2];
        velocities[i*3]*=.97;velocities[i*3+1]*=.97;velocities[i*3+2]*=.97;
      }
    }
    if(done>N2*.96&&assembling&&!assembled){assembled=true;assembling=false;}
    particles.geometry.attributes.position.needsUpdate=true;
    if(assembled){
      particles.position.y=Math.sin(t*.6)*.1;
      particles.rotation.y=cx*.7;particles.rotation.x=-cy*.4;
    } else {
      particles.rotation.y+=.003;
    }
    renderer.render(scene,camera);
  })();
};
img.src=LOGO;
"""

# ════════════════════════════════════════════════════════════
# Generar archivos
# ════════════════════════════════════════════════════════════
files = {
  'logo3d-A-parallax.html':    page('Opción A — Parallax','A · Parallax por capas','#060606',JS_A),
  'logo3d-B-holografico.html': page('Opción B — Holográfico','B · Holográfico','#000819',JS_B),
  'logo3d-C-energia.html':     page('Opción C — Energía','C · Shaders de energía','#0a0200',JS_C),
  'logo3d-D-agua.html':        page('Opción D — Agua','D · Reflejo en agua','#010a12',JS_D),
  'logo3d-E-particulas.html':  page('Opción E — Partículas','E · Partículas (click para explotar)','#060606',JS_E),
}

for name, content in files.items():
    for d in [OUT, DESK]:
        path = os.path.join(d, name)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
    print(f'OK  {name}')

print('\nTodos los archivos generados.')
