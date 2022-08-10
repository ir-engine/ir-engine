import { ShaderMaterial } from 'three'

import { MaterialParms } from '../MaterialParms'
import { FloatArg, Vec3Arg } from './DefaultArgs'

export const vertexShader = `
varying vec2 vUv;
uniform float iTime;
uniform float offsetScale;
uniform float offsetFrequency;
void main() {
    vUv = uv;
    vec3 offset = normalize(normal) * sin(iTime * offsetFrequency) * offsetScale;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position + offset, 1);
}
`
export const fragmentShader = `
#define TAU 6.28318530718
#define MAX_ITER 4
uniform float iTime;
uniform vec3 iResolution;

varying vec2 vUv;


void main() 
{
vec2 fragCoord = vUv;
float time = iTime * .75+23.0;
// uv should be the 0-1 uv of texture...
vec2 uv = fragCoord.xy / iResolution.xy;
uv = fract(uv - vec2(iTime * 0.3, sin(iTime * 0.03)));

vec2 p = mod(uv*TAU, TAU)-250.0;

vec2 i = vec2(p);
float c = 1.0;
float inten = .005;

for (int n = 0; n < MAX_ITER; n++) 
{
    float t = time * (1.0 - (3.5 / float(n+1)));
    i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
    c += 1.0/length(vec2(p.x / (sin(i.x+t)/inten),p.y / (cos(i.y+t)/inten)));
}
c /= float(MAX_ITER);
c = 1.17-pow(c, 1.4);
vec3 color = vec3(pow(abs(c), 8.0));
color = clamp(color + vec3(0.0, 0.35, 0.5), 0.0, 1.0);

gl_FragColor = vec4(color, 1.0);
}`

export const DefaultArgs = {
  iTime: { hide: true, default: 0.0 },
  iResolution: Vec3Arg,
  offsetScale: { ...FloatArg, default: 0.5 },
  offsetFrequency: { ...FloatArg, default: 0.25 }
}

export default function Caustics(args?): MaterialParms {
  let uniforms = args ? { ...DefaultArgs, ...args } : DefaultArgs

  uniforms = Object.fromEntries(Object.entries(uniforms).map(([k, v]) => [k, { value: v }]))
  const mat = new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader
  })

  return {
    material: mat,
    update: (delta) => {
      mat.uniforms.iTime.value += delta
    }
  }
}
