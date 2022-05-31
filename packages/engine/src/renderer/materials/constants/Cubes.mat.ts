import { ShaderMaterial } from 'three'

import { MaterialParms } from '../MaterialParms'

const vertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
}
`

const fragmentShader = `
uniform vec3 iResolution;
uniform float iTime;
varying vec2 vUv;
float PI = acos(-1.);
mat2 rot(float r){
vec2 s = vec2(cos(r),sin(r));
return mat2(s.x,s.y,-s.y,s.x);
}
float cube(vec3 p,vec3 s){
vec3 q = abs(p);
vec3 m = max(s-q,0.);
return length(max(q-s,0.))-min(min(m.x,m.y),m.z);
}

vec4 map( in vec3 p )
{
float d = cube(p,vec3(1.0));
vec3 col = vec3(0);
float s = 1.0;
float ite = 4.0;
for( int m=0; m<4; m++ )
{
  vec3 a = mod( p*s, 2.0 )-1.0;
  s *= 3.0;
  vec3 r = abs(1.1 - 3.0*abs(a));

  float da = max(r.x,r.y);
  float db = max(r.y,r.z);
  float dc = max(r.z,r.x);
  float k = 2.0*pow(abs(sin(0.5*iTime)),0.2);
   if(r.x<r.y)col.z+=1.2*abs((float(m)-k))/ite;
    if(r.y>r.z)col.y+=1.*abs((float(m)-k))/ite,col.z += 0.2*abs((float(m)-k))/ite;
    if(r.x>r.z)col.x+=1.2*abs((float(m)-k))/ite;
  float c = (min(da,min(db,dc))-1.0)/s;

  d = max(d,c);
}

return vec4(col,d);
}
#define BOXITER 4.

float cnbox(vec3 ps,float t, float k){
ps.xy *= rot(0.25*3.14);
ps.xz *= rot(0.25*3.14);
ps.xy *= rot(1.*t*3.14);
ps.xz *= rot(1.*t*3.14);
float sc = 0.45;
ps = abs(ps);
vec3 pk = ps;
if(k>1.){
    for(int i = 0;i<int(BOXITER)+1;i++){
        if(float(i)<floor(k)-1.){
        ps = abs(ps)-sc/pow(2.,4.+float(i));
        }else if(BOXITER>k){
         ps = mix(ps,abs(ps)-sc/pow(2.,4.+float(i)),clamp(k-1.-float(i),0.0,1.0));
         break;
        }else{
             ps = mix(ps,pk,clamp(k-1.-float(i),0.0,1.0));
        }
    }
}
float sac = pow(2.2,k-1.);
if(BOXITER<k)
sac = mix(sac,1.0,pow(k-BOXITER,0.4));
float d1 = cube(ps,sc*0.5*vec3(0.2,0.2,0.2)/sac);
return d1;
}
float ease_in_out_cubic(float x) {
return x < 0.5 ? 4. * x * x * x : 1. - pow(-2. * x + 2., 3.) / 2.;
}

vec4 dist(vec3 p){
vec3 p1 = p;
float k = 2.;
float ksstx = clamp(3.*(fract(0.1*iTime)-2./3.),0.0,1.0);
float kssty = clamp(3.*(fract(0.1*iTime)-1./3.),0.0,1.0);
float ksstz = clamp(3.*fract(0.1*iTime),0.0,1.0);
p.x += 4.*ease_in_out_cubic(ksstx);
p.y += 4.*ease_in_out_cubic(kssty);
p.z += 4.*ease_in_out_cubic(ksstz);
p = mod(p,k)-0.5*k;
//p.xy *= rot(0.25*3.14);
//p.xz *= rot(0.25*3.14);
vec4 sd = map(p);
float d= sd.w;
vec3 col = 0.4*sd.xyz;
col *= exp(-2.5*d)*2.6;
vec3 ps = p1-vec3(1.);
float ktx = 0.3;
float kt = fract(iTime*ktx);
float d1 = cnbox(ps,ease_in_out_cubic(kt),1.+mod(ease_in_out_cubic(kt)+floor(iTime*ktx),BOXITER));
return vec4(col,min(d,d1));
}

vec3 gn(vec3 p){
vec2 e = vec2(0.001,0.);
return normalize(vec3(dist(p+e.xyy).w-dist(p-e.xyy).w,
dist(p+e.yxy).w-dist(p-e.yxy).w,
dist(p+e.yyx).w-dist(p-e.yyx).w

));

}
//https://www.shadertoy.com/view/lsKSWR
float vig(vec2 uv)
{
float time = iTime;
uv *=  1.0 - uv.yx;
float vig = uv.x*uv.y;
vig = pow(vig, 0.45);
return vig;
}



void main()
{
vec2 fragCoord = vUv;
vec2 uv = fragCoord/iResolution.xy;
vec2 p = (uv-0.5)*2.;
p.y *= iResolution.y/iResolution.x;

float rsa =0.2;
float time = iTime+17.5;
float rkt = time*0.3;
vec3 dmo = vec3(1.)+vec3(0,0,0);
vec3 ro = vec3(rsa*cos(rkt),0.*sin(time*0.2),rsa*sin(rkt))+dmo;
vec3 ta = vec3(0)+dmo;
vec3 cdir = normalize(ta-ro);
vec3 side = cross(cdir,vec3(0,1,0));
vec3 up = cross(side,cdir);
vec3 rd = normalize(p.x*side+p.y*up+1.2*cdir);
// rd.xz *= rot(time*0.13+1.);
float d,t= 0.;
vec3 ac = vec3(0.);
vec3 ac2 = vec3(0.);
float frag = 0.;
float ep = 0.00001;
vec3 as =ro + 0.0*(p.x*side+p.y*up); 
for(int i =0;i<75;i++){
    vec4 rsd = dist(as+rd*t);
    d = max(rsd.w,0.000);
    t += d;
    ac += rsd.xyz;
    if(d<ep) break;
}
vec3 sp = as + rd*t;
vec3 normal = gn(sp);
rd = reflect(rd,normal);

vec3 col  =0.013*ac;
ac *= 0.;
t = 0.1;
for(int i =0;i<75;i++){
    vec4 rsd = dist(sp+rd*t);
    d = max(rsd.w,0.000);
    t += d;
    ac += rsd.xyz;
    if(d<ep) break;
}
col += 0.013*ac;

  sp = as + rd*t;
normal = gn(sp);
rd = reflect(rd,normal);

ac *= 0.;
t = 0.1;
for(int i =0;i<75;i++){
    vec4 rsd = dist(sp+rd*t);
    d = max(rsd.w,0.000);
    t += d;
    ac += rsd.xyz;
    if(d<ep) break;
}
col += 0.013*ac;
//col = pow(col,vec3(0.8));
    gl_FragColor = vec4(col, 1.0 );

}`

export default async function Cubes(args?: { iTime?: number; iResolution?: number[] }): Promise<MaterialParms> {
  const mat = new ShaderMaterial({
    uniforms: {
      iTime: { value: args?.iTime ?? 0.0 },
      iResolution: { value: args?.iResolution ?? [window.innerWidth * 2, window.innerHeight * 2, 1] }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
  })

  return {
    material: mat,
    update: (delta) => {
      mat.uniforms.iTime.value += delta
    }
  }
}
