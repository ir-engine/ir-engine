import { ShaderMaterial, Texture } from 'three'

import { MaterialParms } from '../MaterialParms'

export const vertexShader = `
varying vec2 vUv;
varying float startDist;

void main() {
    vUv = uv;
    startDist = length((modelMatrix * vec4(position, 1)).xyz - cameraPosition);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
}
`

export const fragmentShader = `
uniform vec3 iResolution;
uniform float iTime;
uniform sampler2D iChannel0;

varying vec2 vUv;
varying float startDist;

const int _VolumeSteps = 128;
const float _StepSize = 0.02; 
const float _Density = 0.2;

const float _SphereRadius = 1.0;
const float _NoiseFreq = 2.0;
const float _NoiseAmp = 1.0;
const vec3 _NoiseAnim = vec3(0, -1, 0);

// iq's nice integer-less noise function
float noise( in vec3 x )
{
    vec3 p = floor(x);
    vec3 f = fract(x);
	f = f*f*(3.0-2.0*f);
	
	vec2 uv = (p.xy+vec2(37.0,17.0)*p.z) + f.xy;
	vec2 rg = texture( iChannel0, (uv+0.5)/256.0, -100.0 ).yx;
	return mix( rg.x, rg.y, f.z )*2.0-1.0;
}

float fbm( vec3 p )
{
    float f = 0.0;
    float amp = 0.5;
    for(int i=0; i<4; i++)
    {
        //f += abs(noise(p)) * amp;
        f += noise(p) * amp;
        p *= 2.03;
        amp *= 0.5;
	}
    return f;
}

vec2 rotate(vec2 v, float angle)
{
    return v * mat2(cos(angle),sin(angle),-sin(angle),cos(angle));
}

// returns signed distance to surface
float distanceFunc(vec3 p)
{	

	// distance to sphere
    float d = length(p) - _SphereRadius;
	// offset distance with noise
	d += fbm(p*_NoiseFreq + _NoiseAnim*iTime) * _NoiseAmp;
	return d;
}

// shade a point based on distance
vec4 shade(float d)
{	
    if (d >= 0.0 && d < 0.2) return (mix(vec4(3, 3, 3, 1), vec4(1, 1, 0, 1), d / 0.2));
	if (d >= 0.2 && d < 0.4) return (mix(vec4(1, 1, 0, 1), vec4(1, 0, 0, 1), (d - 0.2) / 0.2));
	if (d >= 0.4 && d < 0.6) return (mix(vec4(1, 0, 0, 1), vec4(0, 0, 0, 0), (d - 0.4) / 0.2));    
    if (d >= 0.6 && d < 0.8) return (mix(vec4(0, 0, 0, 0), vec4(0, .5, 1, 0.2), (d - 0.6) / 0.2));
    if (d >= 0.8 && d < 1.0) return (mix(vec4(0, .5, 1, .2), vec4(0, 0, 0, 0), (d - 0.8) / 0.2));            
    return vec4(0.0, 0.0, 0.0, 0.0);
}

// procedural volume
// maps position to color
vec4 volumeFunc(vec3 p)
{
    //p.xz = rotate(p.xz, p.y*2.0 + iTime);	// firestorm
	float d = startDist / 100.0 + distanceFunc(p) / 10.0;
	return shade(d);
}

// ray march volume from front to back
// returns color
vec4 rayMarch(vec3 rayOrigin, vec3 rayStep, out vec3 pos)
{
	vec4 sum = vec4(0, 0, 0, 0);
	pos = rayOrigin;
	for(int i=0; i<_VolumeSteps; i++) {
		vec4 col = volumeFunc(pos);
		col.a *= _Density;
		// pre-multiply alpha
		col.rgb *= col.a;
		sum = sum + col*(1.0 - sum.a);	
		pos += rayStep;
	}
	return sum;
}

void main()
{
    vec2 p = (vUv.xy / iResolution.xy)*2.0-1.0;
    p.x *= iResolution.x/ iResolution.y;
	
    float rotx = iTime;
    float roty = 0.0;

    float zoom = 4.0;

    // camera
    vec3 ro = zoom*normalize(vec3(cos(roty), cos(rotx), sin(roty)));
    vec3 ww = normalize(vec3(0.0,0.0,0.0) - ro);
    vec3 uu = normalize(cross( vec3(0.0,1.0,0.0), ww ));
    vec3 vv = normalize(cross(ww,uu));
    vec3 rd = normalize( p.x*uu + p.y*vv + 1.5*ww );

    ro += rd*2.0;
	
    // volume render
    vec3 hitPos;
    vec4 col = rayMarch(ro, rd*_StepSize, hitPos);

    gl_FragColor = col;
}
`

export default async function Fireball(args?: {
  iTime?: number
  iResolution?: number[]
  iChannel0?: Texture
}): Promise<MaterialParms> {
  const mat = new ShaderMaterial({
    uniforms: {
      iTime: { value: args?.iTime ?? 0.0 },
      iResolution: { value: args?.iResolution ?? [window.innerWidth * 2, window.innerHeight * 2, 1] },
      iChannel0: { value: args?.iChannel0 ?? new Texture() }
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
