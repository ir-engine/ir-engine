import { ShaderMaterial, Texture, Vector2 } from 'three'

import { MaterialParms } from '../MaterialParms'
import { extractDefaults as format } from '../Utilities'
import { TextureArg } from './DefaultArgs'

export const fragmentShader = `
#define width .005
uniform float iTime;
uniform vec3 iResolution;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;

varying vec2 vUv;
float zoom = .18;


float shape=0.;
vec3 color=vec3(0.),randcol;

void formula(vec2 z, float c) {
	float minit=0.;
	float o,ot2,ot=ot2=1000.;
	for (int i=0; i<9; i++) {
		z=abs(z)/clamp(dot(z,z),.1,.5)-c;
		float l=length(z);
		o=min(max(abs(min(z.x,z.y)),-l+.05),abs(l-.25));
		ot=min(ot,o);
		ot2=min(l*.1,ot2);
		minit=max(minit,float(i)*(1.-abs(sign(ot-o))));
	}
	minit+=1.;
	float w=width*minit*2.;
	float circ=pow(max(0.,w-ot2)/w,6.);
	shape+=max(pow(max(0.,w-ot)/w,.25),circ);
	vec3 col=normalize(.1+texture(iChannel1,vec2(minit*.1)).rgb);
	color+=col*(.4+mod(minit/9.-iTime*10.+ot2*2.,1.)*1.6);
	color+=vec3(1.,.7,.3)*circ*(10.-minit)*3.*smoothstep(0.,.5,.15+texture(iChannel0,vec2(.0,1.)).x-.5);
}


void main()
{
	vec2 fragCoord = vUv;
	vec2 pos = fragCoord.xy / iResolution.xy - .5;
	pos.x*=iResolution.x/iResolution.y;
	vec2 uv=pos;
	float sph = length(uv); sph = sqrt(1. - sph*sph)*1.5; 
	uv=normalize(vec3(uv,sph)).xy;
	float a=iTime+mod(iTime,1.)*.5;
	vec2 luv=uv;
	float b=a*5.48535;
	uv*=mat2(cos(b),sin(b),-sin(b),cos(b));
	uv+=vec2(sin(a),cos(a*.5))*8.;
	uv*=zoom;
	float pix=.5/iResolution.x*zoom/sph;
	float dof=max(1.,(10.-mod(iTime,1.)/.01));
	float c=1.5+mod(floor(iTime),6.)*.125;
	for (int aa=0; aa<36; aa++) {
		vec2 aauv=floor(vec2(float(aa)/6.,mod(float(aa),6.)));
		formula(uv+aauv*pix*dof,c);
	}
	shape/=36.; color/=36.;
	vec3 colo=mix(vec3(.15),color,shape)*(1.-length(pos))*min(1.,abs(.5-mod(iTime+.5,1.))*10.);	
	colo*=vec3(1.2,1.1,1.0);
	gl_FragColor = vec4(colo,1.0);
}`

export const vertexShader = `
    uniform float iTime;

    varying vec2 vUv;

    void main() {
        vUv = uv;
        vec3 offset = normal * sin(iTime * 3.0) * 2.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position + offset, 1);
    }
`

export const DefaultArgs = {
  tiling: { default: [1, 1], type: 'vec2' },
  iResolution: { hide: true, default: [1, 1, 1] },
  iChannel0: TextureArg,
  iChannel1: TextureArg,
  iTime: { hide: true, default: 0 }
}

export default function Circuits(args?: {
  tiling?: Vector2
  iResolution?: number[]
  iChannel0?: Texture
  iChannel1?: Texture
  iTime?: number
}): MaterialParms {
  const defaultArgs = format(DefaultArgs)
  const mat = new ShaderMaterial({
    uniforms: {
      tiling: { value: args?.tiling ?? defaultArgs.tiling },
      iResolution: { value: args?.iResolution ?? defaultArgs.iResolution },
      iChannel0: { value: args?.iChannel0 ?? defaultArgs.iChannel0 },
      iChannel1: { value: args?.iChannel1 ?? defaultArgs.iChannel1 },
      iTime: { value: args?.iTime ?? defaultArgs.iTime }
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
