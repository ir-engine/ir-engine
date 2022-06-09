import { ShaderMaterial, Texture } from 'three'

import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'

import { DudTexture, MaterialParms } from '../MaterialParms'

export const vertexShader = `
varying vec2 vUv;
varying vec3 vN;
varying vec3 vPos;

varying float startDist;

void main() {
    vUv = uv;
    vN = normal;
    vPos = position;
    startDist = length((modelMatrix * vec4(position, 1)).xyz - cameraPosition);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
}
`

export const fragmentShader = `
uniform vec3 iResolution;
uniform float iTime;
uniform float fireMagnitude;
uniform sampler2D fireTexture;
uniform sampler2D baseTexture;

varying vec2 vUv;
varying vec3 vN;
varying vec3 vPos;

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
	
	vec2 uv = (p.xy+vec2(37.0,17.0)*p.z) + f.xy + vUv;
	vec2 rg = texture( fireTexture, (uv+0.5)/256.0, -100.0 ).yx;
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
{	if(d > 3. && d <= 5.)
        return mix(vec4(1., 1., 0.7, 1.), texture(baseTexture, vUv), smoothstep(3.,5., d));    
    if(d <= 2.)
        return mix(vec4(0.3, 0.8, 0.05, 1.), vec4(1., .8, 0., 1.), smoothstep(2., 1., d));
    if(d <= 3.) 
        return mix(vec4(1., .8, 0., 1.), vec4(1., 1., 0.7, 1.), smoothstep(2., 3., d));
    return texture(baseTexture, vUv + vec2(d, sin(d)));
}

// procedural volume
// maps position to color
vec4 volumeFunc(vec3 p)
{
    p.xz = rotate(p.xz, p.y*2.0 + iTime);	// firestorm
	float d = startDist / 10.0 + distanceFunc(p) * fireMagnitude;
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

export const DefaultArgs = {
  iTime: 0.0,
  iResolution: [window.innerWidth * 2, window.innerHeight * 2, 1],
  fireMagnitude: 1.0,
  fireTexture: new Texture(),
  baseTexture: new Texture()
}

export default async function Fireball(args?: {
  iTime?: number
  iResolution?: number[]
  fireMagnitude?: number
  fireTexture?: Texture
  baseTexture?: Texture
}): Promise<MaterialParms> {
  const mat = new ShaderMaterial({
    uniforms: {
      iTime: { value: args?.iTime ?? DefaultArgs.iTime },
      iResolution: { value: args?.iResolution ?? DefaultArgs.iResolution },
      fireTexture: { value: args?.fireTexture ?? new Texture() },
      baseTexture: { value: args?.baseTexture ?? new Texture() }
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
