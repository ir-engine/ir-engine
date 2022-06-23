import { ShaderMaterial, Texture } from 'three'

import { MaterialParms } from '../MaterialParms'
import { extractDefaults as format } from '../Utilities'
import { Vec3Arg } from './DefaultArgs'

export const vertexShader = `
    varying vec2 vUv;

    void main() {
        vUv = uv;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
    }
`

export const fragmentShader = `
uniform float iTime;
uniform vec3 iResolution;
varying vec2 vUv;
void main()
{
    vec2 fragCoord = vUv;
	vec2 uv = (fragCoord.xy / iResolution.xy) - .5;
	float t = iTime * .1 + ((.25 + .05 * sin(iTime * .1))/(length(uv.xy) + .07)) * 2.2;
	float si = sin(t);
	float co = cos(t);
	mat2 ma = mat2(co, si, -si, co);

	float v1, v2, v3;
	v1 = v2 = v3 = 0.0;
	
	float s = 0.0;
	for (int i = 0; i < 90; i++)
	{
		vec3 p = s * vec3(uv, 0.0);
		p.xy *= ma;
		p += vec3(.22, .3, s - 1.5 - sin(iTime * .13) * .1);
		for (int i = 0; i < 8; i++)	p = abs(p) / dot(p,p) - 0.659;
		v1 += dot(p,p) * .0015 * (1.8 + sin(length(uv.xy * 13.0) + .5  - iTime * .2));
		v2 += dot(p,p) * .0013 * (1.5 + sin(length(uv.xy * 14.5) + 1.2 - iTime * .3));
		v3 += length(p.xy*10.) * .0003;
		s  += .035;
	}
	
	float len = length(uv);
	v1 *= smoothstep(.7, .0, len);
	v2 *= smoothstep(.5, .0, len);
	v3 *= smoothstep(.9, .0, len);
	
	vec3 col = vec3( v3 * (1.5 + sin(iTime * .2) * .4),
					(v1 + v3) * .3,
					 v2) + smoothstep(0.2, .0, len) * .85 + smoothstep(.0, .6, v3) * .3;

	gl_FragColor=vec4(min(pow(abs(col), vec3(1.2)), 1.0), 1.0);
}`

export const DefaultArgs = {
  iTime: { hide: true, default: 0.0 },
  iResolution: Vec3Arg
}

export default function Galaxy(args?: { iTime?: number; iResolution?: number[] }): MaterialParms {
  const defaultArgs = format(DefaultArgs)
  const mat = new ShaderMaterial({
    uniforms: {
      iTime: { value: args?.iTime ?? defaultArgs.iTime },
      iResolution: { value: args?.iResolution ?? defaultArgs.iResolution }
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
