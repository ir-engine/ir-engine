import { ShaderMaterial, Texture } from 'three'

import { DudTexture, MaterialParms } from '../MaterialParms'
import { extractDefaults } from '../Utilities'
import { TextureArg, Vec3Arg } from './DefaultArgs'

export const vertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
}
`

const fragmentShader = `
// **************************************************************************
// CONSTANTS

#define PI 3.14159
#define TWO_PI 6.28318

// **************************************************************************
// TWEAK PARAMS for fun

// Increasing number of lights requires more compute power
#define NUM_LIGHTS 3.

// Decreasing min cellsize requires more compute power and you
// will also need to increase the number of march iterations, 
// don't pick a min cell size less than 1. 

#define MIN_CELLSIZE 2.
#define CELLSIZE_RANGE 1.
#define NUM_MARCH_ITERS 32

uniform vec3 iResolution;
uniform sampler2D iChannel0;
uniform float iTime;

varying vec2 vUv;

// **************************************************************************
// GLOBALS

float g_time         = 0.;

vec3  g_camPointAt   = vec3(0.);
vec3  g_camOrigin    = vec3(0.);

mat2  g_rotateVortex = mat2(1.);

// **************************************************************************
// UTILITIES

// Rotate the input point around the y-axis by the angle given as a  cos(angle)
// and sin(angle) argument.  There are many times where  I want to reuse the
// same angle on different points, so why do the  heavy trig twice. Range of
// outputs := ([-1.,-1.,-1.] -> [1.,1.,1.])
vec3 rotateAroundYAxis( vec3 point, float cosangle, float sinangle )
{
    return vec3(point.x * cosangle  + point.z * sinangle,
                point.y,
                point.x * -sinangle + point.z * cosangle);
}

// Returns the vector that is the shortest path from the 3D point to the  line
// that passes through a and b. Also returns the parameter t that represents the
// paramterized position along the line that p is closest to.

// Returned result is:

// result.xyz := vector of the path from p to q where q is defined as the point
// on the line segment that is closest to p.
// result.w   := the t parameter such that a + (b-a) * t = q 

vec4 lineToPointDistance( vec3 a, vec3 b, vec3 p)
{
    
    vec3 ba = b - a;    
    float t = dot(ba, (p - a)) / dot(ba, ba);
    vec4 result = vec4(ba * t + a - p, t);
    return result;
}

// **************************************************************************
// SHADING

vec2 light_swirl( float py, float idx )
{
    float t = smoothstep(50., 0., abs(py));
    float rad = mix(10., 30., t * t);
    float off = TWO_PI * idx/NUM_LIGHTS;
    float rot = .05 + .05 * (smoothstep(0., 1., mod(g_time, 40.)) - smoothstep(20., 21., mod(g_time, 40.)));

    float ang = rot * py - 1. * g_time + off;
    return rad * vec2(sin(ang), cos(ang));
}

float light_offset( float idx )
{
    return mod(.19 * g_time, 1.);
}    

vec3 light_pos( float idx )
{

    float lposy = 80. - 160. * light_offset(idx);
    vec3 warpp = vec3(0., lposy, 0.);
    warpp.xz -= light_swirl(lposy, idx);

    return warpp ;  
}

vec4 light_col( float py )
{
    float pitfade = smoothstep(80., 50., abs(py));
    return pitfade * vec4(.6,.8,1.,1.);
}

float wave_pulses(vec3 pos)
{
    float lookup = mod(.001 * length(pos.xz) - sign(pos.y) * .009*g_time, 1.);
    return texture(iChannel0, vec2(lookup, .5)).g;
}

vec3 shade_surface(vec3 vdir, vec3 pos, vec3 norm, vec2 uv, float alpha)
{
    
    //vec3 basecol = mix(vec3(1., .3, .3),vec3(.3, .8, 1.), s);
    vec3 basecol = mix(vec3(.9, 1., 1.2), vec3(.4, .7, 1.), alpha);

    float wav = wave_pulses( pos );
    vec3 scol = vec3(.3 + .7 * wav);
    scol *= 1. - .5 * length(uv - .5);
    scol += vec3(pow(length(uv - .5), 3.)); 
    scol *= basecol;
    
    // would expect reflect to return a normalized vector if the
    // 2 vectors provided are normalized.  That's not the case at
    // extreme angles, so I have to normalize again.
    vec3 refldir = normalize(reflect(vdir, norm));

    vec3 icol = vec3(0.);
    for (float lidx = 0.; lidx < NUM_LIGHTS; lidx += 1.) 
    {
        vec3 lpos = light_pos(lidx);
        vec3 lcol = light_col(lpos.y).rgb;
        
        vec3 ldir = lpos - pos; float llen = length(ldir); 
        ldir = normalize(ldir);
        float ndl = max(0., dot(ldir, norm));            

        float diff = 600. * ndl * (1./(llen*llen));
        float spec = 5. * (1./llen) * pow(max(0., dot(refldir , ldir)), 5.);

        icol += lcol * (diff + spec);
    }

    icol += vec3(.02); // ambient
    icol += .1 * wav; // glow

    return icol * scol;
}

vec4 shade_light(vec3 pos, vec2 uv, vec4 l2pres, float idx)
{    
    float lt = light_offset(idx);
    
    vec2 lspace = vec2(length(l2pres.xyz), l2pres.w);
    vec4 rgba = vec4(0.);         
    float lpres = smoothstep(lt-.15, lt, lspace.y) - smoothstep(lt, lt+.04, lspace.y);
    lpres *= smoothstep(-1., 4., lspace.x);
    
    float lposy = 80. - 160. * lt;

    rgba.rgb = 2. * lpres * light_col(lposy).rgb;    
    rgba.rgb *= vec3(1. - length(uv - .5));

    rgba.a = lpres;
    
    return rgba;
}

// **************************************************************************
// MARCHING

// References for DDA marching:
// original tutorial:  http://lodev.org/cgtutor/raycasting.html
// initial shadertoy reference by fb39ca4: https://www.shadertoy.com/view/4dX3zl
// optimization by iq: https://www.shadertoy.com/view/4dfGzs

float vortex_map(vec3 p)
{   
    vec3 ap = abs(p);
    float cellmap = 0.;

    // pits
    float lxz = length(ap.xz);  
    float plxz = pow(lxz, .65);
    
    // make sure for the region of log that's undefined (plxz < 8.),
    // we use a constant. cap the pit.

    float threshold = mix(100., -log( plxz - 8.), step(8., plxz));
    threshold += 3. * (1. - wave_pulses(p));
    cellmap = smoothstep(threshold-1., threshold+2., .25 * (ap.y-12.));
    
    // walls    
    cellmap = max(cellmap, mix(smoothstep(0., 20., lxz - 80. + .05 * ap.y * ap.y), 0., step(lxz,50.)));

    return cellmap;
}


void dda_march( vec3 ro, vec3 rd,
                out vec4 hitrgba)
{
    float cellsize = MIN_CELLSIZE + step(20., iTime) * CELLSIZE_RANGE * (smoothstep(0., 2., mod(iTime, 20.)) - 
                                                                               smoothstep(10., 12., mod(iTime, 20.)));

    vec3 rro = ro; rro.xz *= g_rotateVortex;
    vec3 rrd = rd; rrd.xz *= g_rotateVortex;

    vec3 cellpos = cellsize * floor(rro * (1./cellsize));    
    vec3 rs = sign(rrd);
    vec3 deltaDist = cellsize/rrd; 
    vec3 sideDist = ((cellpos-rro)/cellsize + 0.5 + rs * 0.5) * deltaDist;    
    
    hitrgba = vec4(0.);

    float t = 1e10;

    vec3 murkcol = vec3(0.01, 0.01, 0.015);
    for( int iter=0; iter<NUM_MARCH_ITERS; iter += 1 ) 
    {
        // optimize out of loop if we've already accumulated enough surface info
        if (hitrgba.a > .95) { continue; }

        // increment dda marching mm := march mask
        vec3 mm = step(sideDist.xyz, sideDist.yxy) * step(sideDist.xyz, sideDist.zzx);        
        vec3 norm = -mm * rs;
        cellpos += cellsize * mm * rs;  

        // VORTEX chamber 
        float mapres = vortex_map( cellpos );
                  
        float valpha = smoothstep(0., 1., mapres);

        if (valpha > 0.) {
            // intersect the cube            
            vec3 mini = ((cellpos-rro)/cellsize + 0.5 - 0.5*vec3(rs))*deltaDist;
            t = max ( mini.x, max ( mini.y, mini.z ) );

            vec3 pos = rro + rrd*t;
            vec3 uvw = pos - cellpos;
            vec2 uv = vec2( dot(mm.yzx, uvw), dot(mm.zxy, uvw) )/cellsize;
            vec3 vdir = normalize(pos - rro);
            vec3 surfcol = shade_surface(vdir, cellpos, norm, uv, valpha);
            
            float dfog = .1 + .9 * smoothstep(140., 80., t);            
            float pitmurk = smoothstep(50., 80., abs(pos.y));

            hitrgba.rgb += mix(dfog * surfcol, murkcol, pitmurk) * (1. - hitrgba.a) * valpha;
            hitrgba.a += (1. - hitrgba.a) * valpha;

        }

        // optimize out of loop
        if (hitrgba.a > .95) { continue; }

        // XXX: Frustrating ANGLE lesson.  I had a version with the map
        // function that calculated the cell walls and the lights together
        // then I used a material id to inform the final shading (so I didn't
        // have to duplicate code).  Map returned a vec2 with the alpha of
        // the current cell and the id.  Worked great on Mac, but ANGLE could
        // only spew black, so I had to unroll the code here. 
        // Lesson learned, code duplicated.

        // LIGHTS
        float lightalpha = 0.;
        float lightidx = 0.;
        vec4  lightl2pres = vec4(0.);
        
        for (float lidx = 0.; lidx < NUM_LIGHTS; lidx += 1.)
        {

            vec3 warpcellp = vec3( cellpos );
            warpcellp.xz += light_swirl( cellpos.y, lidx );
            vec4 l2pres = lineToPointDistance(vec3(0., 80., 0.), vec3(0., -80.0, 0.), warpcellp);
            float lalpha = smoothstep(0., 8., 8. - length(l2pres.xyz));

            if (lalpha >= lightalpha)
            {
                lightalpha = lalpha;
                lightidx = lidx;
                lightl2pres = l2pres;
            }
    
        }
        
        if (lightalpha > 0.)
        {
            // intersect the cube        
            vec3 mini = ((cellpos-rro)/cellsize + 0.5 - 0.5*vec3(rs))*deltaDist;
            t = max ( mini.x, max ( mini.y, mini.z ) );
            
            vec3 pos = rro + rrd*t;
            vec3 uvw = pos - cellpos;
            vec2 uv = vec2( dot(mm.yzx, uvw), dot(mm.zxy, uvw) )/cellsize;
    
            float pitmurk = smoothstep(50., 80., abs(pos.y));
            vec4 lcol = shade_light(cellpos, uv, lightl2pres, lightidx);
            hitrgba += mix(lcol, vec4(murkcol, 1.), pitmurk) * (1. - hitrgba.a) * lightalpha;
        }
    
        sideDist += mm * rs * deltaDist;  

    }    

}

// **************************************************************************
// CAMERA & GLOBALS

void animate_globals()
{
    // remap the mouse click ([-1, 1], [-1/ar, 1/ar])
    vec2 click = vec2(0.5) / iResolution.xx;    
    click = 2.0 * click - 1.0;  
    
    g_time = iTime;

    // camera position
    g_camOrigin = vec3(0., 0., 65.);    
    float rotateYAngle    =  1. * TWO_PI * click.x;
    float cosRotateYAngle = cos(rotateYAngle);
    float sinRotateYAngle = sin(rotateYAngle);

    g_camPointAt   = vec3(0., 15. * sin(.2 * g_time + PI - PI * click.y), 0.);

    // truck the camera towards and away from vortex center
    g_camOrigin.z  -= 55. * (.5 * sin(.1 * g_time + PI) + .5);

    // Rotate the camera around the origin
    g_camOrigin    = rotateAroundYAxis(g_camOrigin, cosRotateYAngle, sinRotateYAngle);
    
    float vt = -.2 * g_time;
    g_rotateVortex = mat2(cos(vt), sin(vt), -sin(vt), cos(vt));
    
}

struct CameraData
{
    vec3 origin;
    vec3 dir;
    vec2 st;
    float vignet;
};

CameraData setup_camera( in vec2 vUv )
{

    // aspect ratio
    float invar = iResolution.y / iResolution.x;
    vec2 st = vUv.xy / iResolution.xy - .5;
    st.y *= invar;

    // calculate the ray origin and ray direction that represents
    // mapping the image plane towards the scene
    vec3 iu = vec3(0., 1., 0.);

    vec3 iz = normalize( g_camPointAt - g_camOrigin );
    vec3 ix = normalize( cross(iz, iu) );
    vec3 iy = cross(ix, iz);

    vec2 uv = st*0.5+0.5;
    float vignet = pow(10.0*uv.x*uv.y*(1.0-uv.x)*(1.0-uv.y),1.8);
    
    vec3 dir = normalize( st.x*ix + st.y*iy + vignet * iz );

    return CameraData(g_camOrigin, dir, st, vignet);

}

// **************************************************************************
// MAIN

void main()
{   
    
    // ----------------------------------
    // Animate globals

    animate_globals();

    // ----------------------------------
    // Setup Camera

    CameraData cam = setup_camera( vUv );

    // ----------------------------------
    // SCENE MARCHING
    vec3 scenecol = vec3(0.);

    vec4 hitrgba;
    dda_march( cam.origin, cam.dir, hitrgba);

    scenecol = hitrgba.rgb * hitrgba.a;
    // ----------------------------------
    // POST PROCESSING    

    // Brighten
    scenecol *= 1.3;
    
    // Gamma correct
    scenecol = pow(scenecol, vec3(0.45));
        
	// increase saturation
	scenecol = mix( scenecol, vec3(dot(scenecol,vec3(0.333))), -.3 );

	
    gl_FragColor.rgb = scenecol;
    gl_FragColor.a = 1.;
}
`

export const DefaultArgs = {
  iTime: { hide: true, default: 0 },
  iResolution: Vec3Arg,
  iChannel0: TextureArg
}

export default function AliasVortex(args?: {
  iTime?: number
  iResolution?: number[]
  iChannel0?: Texture
}): MaterialParms {
  const defaultArgs = extractDefaults(DefaultArgs)
  const mat = new ShaderMaterial({
    uniforms: {
      iChannel0: { value: args?.iChannel0 ?? null },
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
