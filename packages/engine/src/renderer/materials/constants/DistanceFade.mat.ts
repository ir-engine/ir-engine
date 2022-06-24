import { Material, MeshMatcapMaterial, MeshStandardMaterial } from 'three'
import { ShaderChunk } from 'three'

import { matchActionOnce } from '../../../networking/functions/matchActionOnce'
import { EngineRenderer } from '../../WebGLRendererSystem'
import { MaterialParms } from '../MaterialParms'
import { extractDefaults as format } from '../Utilities'
import { FloatArg, TextureArg, Vec2Arg } from './DefaultArgs'
import { MatcapArgs } from './Matcap.mat'
import { DefaultArgs as StandardArgs } from './Standard.mat'

export const DefaultArgs = {
  //...MatcapArgs,
  ...StandardArgs,
  map2: TextureArg,
  uvTiling: { ...Vec2Arg, min: 0, max: 100 },
  uvTiling2: { ...Vec2Arg, min: 0, max: 100 },
  fadeMin: { ...FloatArg, default: 10, min: 0, max: 100 },
  fadeMax: { ...FloatArg, default: 30, min: 0, max: 100 }
}

export default function DistanceFade(args?): MaterialParms {
  const formattedArgs = args ? { ...format(DefaultArgs), ...args } : format(DefaultArgs)
  const mat = new MeshStandardMaterial(
    //const mat = new MeshMatcapMaterial (
    formattedArgs
  )
  const modShader = (shader, renderer) => {
    const uniform = (k, attr) => (shader.uniforms[k] = { value: attr })
    uniform('map2', formattedArgs.map2)
    uniform('fadeMin', formattedArgs.fadeMin)
    uniform('fadeMax', formattedArgs.fadeMax)
    uniform('uvTiling', formattedArgs.uvTiling)
    uniform('uvTiling2', formattedArgs.uvTiling2)
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
            uniform float fadeMin;
            uniform float fadeMax;
            
            varying float fadeRatio;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
            mat4 vtxTransform = modelMatrix;
            #ifdef USE_INSTANCING
                vtxTransform = modelMatrix * instanceMatrix;
            #endif
            float camDistance = length(cameraPosition - (vtxTransform * vec4(position, 1.0)).xyz);
            fadeRatio = smoothstep(fadeMin, fadeMax, camDistance);`
      )
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <map_pars_fragment>',
        `#include <map_pars_fragment>
            uniform vec2 uvTiling;
            uniform vec2 uvTiling2;
            uniform sampler2D map2;
            varying float fadeRatio;`
      )
      .replace(
        '#include <map_fragment>',
        ShaderChunk.map_fragment
          .replace(
            '#ifdef USE_MAP',
            `#ifdef USE_MAP
                    vec2 tiledUv = fract(vUv * uvTiling);
                    vec2 tiledUv2 = fract(vUv * uvTiling2);
                    vec4 sampledDiffuseColor2 = texture2D( map2, tiledUv2 );`
          )
          .replace('sampledDiffuseColor = texture2D( map, vUv )', `sampledDiffuseColor = texture2D( map, tiledUv )`)
          .replace(
            '#ifdef DECODE_VIDEO_TEXTURE',
            `#ifdef DECODE_VIDEO_TEXTURE
                    sampledDiffuseColor2 = vec4( mix( pow( sampledDiffuseColor2.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor2.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor2.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor2.w );`
          )
          .replace(
            'diffuseColor *= sampledDiffuseColor;',
            `sampledDiffuseColor = mix(sampledDiffuseColor, sampledDiffuseColor2, fadeRatio);
                diffuseColor *= sampledDiffuseColor;`
          )
      )
  }
  const setOnBeforeCompile = (targMat: Material) => {
    targMat.onBeforeCompile = modShader
    targMat.needsUpdate = true
  }
  setOnBeforeCompile(mat)
  mat.userData['IGNORE_CSM'] = true
  return { material: mat, update: (dt) => {} }
}
