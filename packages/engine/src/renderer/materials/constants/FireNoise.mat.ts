import { ShaderMaterial } from 'three'

import { extractDefaults } from '../Utilities'
import { Vec3Arg } from './DefaultArgs'

const fragmentShader = `
//http://mrl.nyu.edu/~perlin/flownoise-talk/#17
uniform float iTime;

varying vec2 vUv;

vec4 dnoise(vec3 p);

vec4 quat_rotation( float half_angr, vec3 unitVec );

vec2 screen_uv;
vec4 quat;

float Checker2(vec2 uv)
{
	float s = sin(uv.x)*cos(uv.y);
	//s = s*s*s*s*s;
	return s;
}

vec4 FlowNoise(vec3 uvw, vec2 uv)
{
	vec4 n = vec4(0.);

	float f = 1.;
	float a = 1.;
			
	float lac = 2.13;
	
#if 0	
	for (int i=0; i<5; i++)
	{	
		//offsetting swirl angle relative to position seems to flow along the gradient
		float ang = iTime*.4;//+uv.y*0.5;
		
		ang *= Checker2(uvw.xy*0.0125);
		
		vec3 ax = normalize(vec3(1,1,1)); 
//		vec3 ax = texture(iChannel0,vec2(float(i)*0.1,0.)).xyz*2.-1.;
		quat = quat_rotation( ang*2.*f, normalize(ax) );

		float e = 0.1;//*f;
		
		//advect by going back in domain along noise gradient
		vec4 dn = dnoise(uvw);
		uvw -= 0.01*dn.xyz;
		
		n += abs(a*dn);
		uvw *= lac;
		f *= lac;
		a *= (1./lac);
	}
#else
	vec3 ax = normalize(vec3(1,1,1)); 
	float e = 0.1;//*f;
	float ang;
	vec4 dn;
		ang = iTime*.4+uv.y*0.5;
		quat = quat_rotation( ang*2.*f, normalize(ax) );
		dn = dnoise(uvw);
		uvw -= 0.01*dn.xyz;
		n += abs(a*dn);
		uvw *= lac;
		f *= lac;
		a *= (1./lac);
	
		ang = iTime*.4+uv.y*0.5;
		quat = quat_rotation( ang*2.*f, normalize(ax) );
		dn = dnoise(uvw);
		uvw -= 0.01*dn.xyz;
		n += abs(a*dn);
		uvw *= lac;
		f *= lac;
		a *= (1./lac);

		ang = iTime*.4+uv.y*0.5;
		quat = quat_rotation( ang*2.*f, normalize(ax) );
		dn = dnoise(uvw);
		uvw -= 0.01*dn.xyz;
		n += abs(a*dn);
		uvw *= lac;
		f *= lac;
		a *= (1./lac);

		ang = iTime*.4+uv.y*0.5;
		quat = quat_rotation( ang*2.*f, normalize(ax) );
		dn = dnoise(uvw);
		uvw -= 0.01*dn.xyz;
		n += abs(a*dn);
		uvw *= lac;
		f *= lac;
		a *= (1./lac);

		ang = iTime*.4+uv.y*0.5;
		quat = quat_rotation( ang*2.*f, normalize(ax) );
		dn = dnoise(uvw);
		uvw -= 0.01*dn.xyz;
		n += abs(a*dn);
		uvw *= lac;
		f *= lac;
		a *= (1./lac);
	
#endif
	
	return n;
}
	
vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

//thanks iq..
// Smooth HSV to RGB conversion 
vec3 hsv2rgb_smooth( in vec3 c )
{
    vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );

	rgb = rgb*rgb*(3.0-2.0*rgb); // cubic smoothing	

	return c.z * mix( vec3(1.0), rgb, c.y);
}

vec3 hsv2rgb_trigonometric( in vec3 c )
{
    vec3 rgb = 0.5 + 0.5*cos((c.x*6.0+vec3(0.0,4.0,2.0))*3.14159/3.0);

	return c.z * mix( vec3(1.0), rgb, c.y);
}

vec3 FlameColour(float f)
{
	return hsv2rgb_smooth(vec3((f-(2.25/6.))*(1.25/6.),f*1.25+.2,f*.95));
}

void main()
{
	vec2 uv = vUv;
	screen_uv = uv;
	
	float t = iTime*0.8;
	vec3 uvw = vec3(uv*1.15+vec2(0.,t),t*0.5);


	vec4 d = FlowNoise(uvw,uv);
	float de = d.w;
	de = length(d.xyz)*.15+.2-d.w*.2;
	vec3 n = FlameColour(de);

	
	gl_FragColor = vec4(vec3(n),1.0);
}

vec4 quat_rotation( float half_angr, vec3 unitVec )
{
    float s, c;
    s = sin( half_angr );
    c = cos( half_angr );
    return vec4( unitVec*s, c );
}

vec3 quat_times_vec(vec4 q, vec3 v)
{
	//http://molecularmusings.wordpress.com/2013/05/24/a-faster-quaternion-vector-multiplication/
	vec3 t = 2. * cross(q.xyz, v);
	return v + q.w * t + cross(q.xyz, t);
}

/* Created by Nikita Miropolskiy, nikat/2013
 * This work is licensed under a 
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License
 * http://creativecommons.org/licenses/by-nc-sa/3.0/
 *  - You must attribute the work in the source code 
 *    (link to https://www.shadertoy.com/view/XsX3zB).
 *  - You may not use this work for commercial purposes.
 *  - You may distribute a derivative work only under the same license.
 */

/* discontinuous pseudorandom uniformly distributed in [-0.5, +0.5]^3 */
vec3 random3(vec3 c) 
{
	float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
	vec3 r;
	r.z = fract(512.0*j);
	j *= .125;
	r.x = fract(512.0*j);
	j *= .125;
	r.y = fract(512.0*j);
	r = r-0.5;

	
	//rotate for extra flow!
	r=quat_times_vec(quat,r);
	
	return r;
}

/* skew constants for 3d simplex functions */
const float F3 =  0.3333333;
const float G3 =  0.1666667;

vec4 dnoise(vec3 p) 
{
	 /* 1. find current tetrahedron T and its four vertices */
	 /* s, s+i1, s+i2, s+1.0 - absolute skewed (integer) coordinates of T vertices */
	 /* x, x1, x2, x3 - unskewed coordinates of p relative to each of T vertices*/
	 
	 vec3 s = floor(p + (p.x+p.y+p.z)*F3);
	 vec3 x = p - s + (s.x+s.y+s.z)*G3;
	 
	 vec3 e = step(vec3(0.0), x - x.yzx);
	 vec3 i1 = e*(1.0 - e.zxy);
	 vec3 i2 = 1.0 - e.zxy*(1.0 - e);
	 	
	 vec3 x1 = x - i1 + G3;
	 vec3 x2 = x - i2 + 2.0*G3;
	 vec3 x3 = x - 1.0 + 3.0*G3;
	 		 
	 /* calculate surflet weights */
	 vec4 w;
	 w.x = dot(x, x);
	 w.y = dot(x1, x1);
	 w.z = dot(x2, x2);
	 w.w = dot(x3, x3);
	 
	 /* w fades from 0.6 at the center of the surflet to 0.0 at the margin */
	 w = max(0.6 - w, 0.0);		//aka t0,t1,t2,t3
	 vec4 w2 = w*w;				//aka t20,t21,t22,t23
	 vec4 w4 = w2*w2;			//aka t40,t41,t42,t43
	 
	 /* 2. find four surflets and store them in d */
	 vec3 g0 = random3(s);
	 vec3 g1 = random3(s + i1);
	 vec3 g2 = random3(s + i2);
	 vec3 g3 = random3(s + 1.0);
	 
	 vec4 d;
	 /* calculate surflet components */
	 d.x = dot(g0, x);		//aka graddotp3( gx0, gy0, gz0, x0, y0, z0 )
	 d.y = dot(g1, x1);
	 d.z = dot(g2, x2);
	 d.w = dot(g3, x3);
	 
	 //derivatives as per
	 //http://webstaff.itn.liu.se/~stegu/aqsis/flownoisedemo/srdnoise23.c
	 vec4 w3 = w*w2;
	 vec4 temp = w3*d;
	 vec3 dnoise = temp[0]*x;
	     dnoise += temp[1]*x1;
	     dnoise += temp[2]*x2;
		 dnoise += temp[3]*x3;
		 dnoise *= -8.;
		 dnoise += w4[0]*g0+w4[1]*g1+w4[2]*g2+w4[3]*g3;
		 dnoise *= 52.; //???
		 
	 d *= w4;	//aka n0,n1,n2,n3
	 
	float n = (d.x+d.y+d.z+d.w)*52.;
	
	return vec4(dnoise,n);
}

//http://www.csee.umbc.edu/~olano/s2002c36/ch02.pdf
// t = 0.6 - (u^2+v^2+w^2)
// if (t>0) 8 t^4 else 0
`
const vertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
}
`

export const DefaultArgs = {
  iTime: { hide: true, default: 0.0 },
  iResolution: Vec3Arg
}

export default function FireNoise(args?) {
  const defaultArgs = extractDefaults(DefaultArgs)
  const mat = new ShaderMaterial({
    uniforms: args ? { ...defaultArgs, ...args } : defaultArgs,
    vertexShader,
    fragmentShader
  })

  return {
    material: mat,
    update: (delta) => (mat.uniforms.iTime.value += delta)
  }
}
