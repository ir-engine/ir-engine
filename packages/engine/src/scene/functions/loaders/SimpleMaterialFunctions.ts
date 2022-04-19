import {
  Color,
  Material,
  Mesh,
  Matrix3,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  ShaderChunk,
  ShaderLib,
  ShaderMaterial,
  UniformsLib,
  UniformsUtils
} from 'three'
import { object } from 'ts-matches'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { beforeMaterialCompile } from '../../classes/BPCEMShader'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { SimpleMaterialTagComponent } from '../../components/SimpleMaterialTagComponent'
import { SceneOptions } from '../../systems/SceneObjectSystem'

// import { extendMaterial, CustomMaterial } from './ExtendMaterial'

export const SCENE_COMPONENT_SIMPLE_MATERIALS = 'simple-materials'

export const deserializeSimpleMaterial: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<{ simpleMaterials: boolean }>
) => {
  if (!json.props.simpleMaterials) return

  addComponent(entity, SimpleMaterialTagComponent, {})
  Engine.simpleMaterials = json.props.simpleMaterials

  if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_SIMPLE_MATERIALS)
}

export const serializeSimpleMaterial: ComponentSerializeFunction = (entity) => {
  if (hasComponent(entity, SimpleMaterialTagComponent)) {
    return {
      name: SCENE_COMPONENT_SIMPLE_MATERIALS,
      props: {
        simpleMaterials: {}
      }
    }
  }
}

export const useSimpleMaterial = (obj: Mesh): void => {
  if (obj.material instanceof MeshStandardMaterial) {
    // if (!obj.material.map) return
    // debugger
    // obj.material.onBeforeCompile = ((shader) => {
    //   console.error(obj.material)
    //   console.error(shader)
    //   debugger
    // })
    // return
    
    try {
      obj.userData.prevMaterial = obj.material
      // obj.material = new MeshBasicMaterial()
      // MeshBasicMaterial.prototype.copy.call(obj.material, obj.userData.prevMaterial)

      // TODO:
      // https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/UniformsLib.js
      // https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderLib.js
      // https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderChunk.js
      // https://github.com/mrdoob/three.js/blob/master/src/renderers/webgl/WebGLProgram.js

      const prevMaterial = obj.material
      let vertexShader = ShaderLib.basic.vertexShader
      let fragmentShader = ShaderLib.basic.fragmentShader

      const lightEnbled = true
      const hasUV = obj.geometry.hasAttribute('uv')
      const hasMap = (<any>obj.material).map !== null
      const hasLightMap = (<any>obj.material).lightMap !== null
      const hasEnvMap = true
      const hasSpecularMap = (<any>obj.material).specularMap !== null
      const hasAoMap = (<any>obj.material).aoMap !== null
      const hasEmissiveMap = (<any>obj.material).emissiveMap !== null
      const hasAlphaMap = (<any>obj.material).alphaMap !== null

      let defines = {}
      if (lightEnbled) {
        defines["USE_LIGHT_ENABLE"] = ''
      }

      if (hasMap) {
        defines["USE_MAP"] = ''
      }
      if (hasUV) {
        defines["USE_UV"] = ''
      }
      
      if (hasLightMap) {
        defines["USE_LIGHTMAP"] = ''
      }

      if (hasEnvMap) {
        defines["USE_ENVMAP"] = ''
      }

      if (hasSpecularMap) {
        defines["USE_SPECULARMAP"] = ''
      }

      if (hasAoMap) {
        defines["USE_AOMAP"] = ''
      }

      if (hasAlphaMap) {
        defines["USE_ALPHAMAP"] = ''
      }

      var uniforms = {
        diffuse: {
          value: (prevMaterial as any).color
        },
        opacity: {
          value: (prevMaterial as any).opacity
        },

        uvTransform: { value: new Matrix3() },
		    uv2Transform: { value: new Matrix3() },

        map: {
          value: (prevMaterial as any).map
        },

        alphaMap: {
          value: (prevMaterial as any).alphaMap
        },

		    alphaTest: {
          value: (prevMaterial as any).alphaTest
        },

        envMap: {
          value: Engine.scene.environment
        },
        
        flipEnvMap: {
          value: 1
        },
        
        aoMap: {
          value: (prevMaterial as any).aoMap
        },

        aoMapIntensity: {
          value: (prevMaterial as any).aoMapIntensity
        },

        bumpMap: {
          value: (prevMaterial as any).bumpMap
        },

        bumpScale: {
          value: (prevMaterial as any).bumpScale
        }
      }

      if (lightEnbled) {
        uniforms = UniformsUtils.merge([UniformsLib.lights, uniforms])
      }

      vertexShader = [
        `#define STANDARD`,
        `varying vec3 vViewPosition;`,
        `#ifdef USE_TRANSMISSION
          varying vec3 vWorldPosition;
        #endif`,
        `#include <common>`,
        `#include <uv_pars_vertex>`,
        `#include <uv2_pars_vertex>`,
        `// #include <displacementmap_pars_vertex>`,
        `#include <color_pars_vertex>`,
        `// #include <fog_pars_vertex>`,
        `#include <normal_pars_vertex>`,
        `// #include <morphtarget_pars_vertex>`,
        `// #include <skinning_pars_vertex>`,
        `#include <shadowmap_pars_vertex> `,                    //lightEnbled
        `// #include <logdepthbuf_pars_vertex>`,
        `// #include <clipping_planes_pars_vertex>`,

        `void main() {`,
        `#include <uv_vertex>`,
        `#include <uv2_vertex>`,
        `#include <color_vertex>`,

        `#include <beginnormal_vertex>`,
        `#include <morphnormal_vertex>`,
        `#include <skinbase_vertex>`,
        `#include <skinnormal_vertex>`,
        `#include <defaultnormal_vertex>`,
        `#include <normal_vertex>`,

        `#include <begin_vertex>`,
        `// #include <morphtarget_vertex>`,
        `// #include <skinning_vertex>`,
        `// #include <displacementmap_vertex>`,
        `#include <project_vertex>`,
        `// #include <logdepthbuf_vertex>`,
        `// #include <clipping_planes_vertex>`,
        `vViewPosition = - mvPosition.xyz;`,

        `#include <worldpos_vertex>`,
        `#include <shadowmap_vertex>`,
        `// #include <fog_vertex>`,
        `#ifdef USE_TRANSMISSION`,
        `vWorldPosition = worldPosition.xyz;`,
        `#endif`,
        `}`
      ].join('\n')

      fragmentShader = [
        `#define STANDARD`,
        `
        #ifdef PHYSICAL
          #define IOR
          #define SPECULAR
        #endif
        `,
        `uniform vec3 diffuse;`,
        `uniform vec3 emissive;`,
        `uniform float roughness;`,
        `uniform float metalness;`,
        `uniform float opacity;`,
        `
        #ifdef IOR
          uniform float ior;
        #endif
        `,
        `
        #ifdef SPECULAR
          uniform float specularIntensity;
          uniform vec3 specularTint;
        
          #ifdef USE_SPECULARINTENSITYMAP
            uniform sampler2D specularIntensityMap;
          #endif
        
          #ifdef USE_SPECULARTINTMAP
            uniform sampler2D specularTintMap;
          #endif
        #endif
        `,
        `
        #ifdef USE_CLEARCOAT
          uniform float clearcoat;
          uniform float clearcoatRoughness;
        #endif
        `,
        `
        #ifdef USE_SHEEN
          uniform vec3 sheenTint;
          uniform float sheenRoughness;
        #endif
        `,
        `varying vec3 vViewPosition;`,
        `#include <common>`,
        `#include <packing>`,
        `// #include <dithering_pars_fragment>`,
        `#include <color_pars_fragment>`,
        `#include <uv_pars_fragment>`,
        `#include <uv2_pars_fragment>`,
        `#include <map_pars_fragment>`,
        `// #include <alphamap_pars_fragment>`,
        `// #include <alphatest_pars_fragment>`,
        `// #include <aomap_pars_fragment>`,
        `// #include <lightmap_pars_fragment>`,
        `// #include <emissivemap_pars_fragment>`,
        `#include <bsdfs>`,                                                //lightEnbled
        `// #include <cube_uv_reflection_fragment>`,
        `// #include <envmap_common_pars_fragment>`,
        `#include <envmap_physical_pars_fragment>`,
        `// #include <fog_pars_fragment>`,
        `#include <lights_pars_begin>`,                                    //lightEnbled
        `#include <normal_pars_fragment>`,                                 //lightEnbled
        `#include <lights_physical_pars_fragment>`,                        //lightEnbled
        `#include <transmission_pars_fragment>`,
        `#include <shadowmap_pars_fragment>`,                              //lightEnbled
        `#include <bumpmap_pars_fragment>`,
        `#include <normalmap_pars_fragment>`,
        `#include <clearcoat_pars_fragment>`,
        `#include <roughnessmap_pars_fragment>`,                            //lightEnbled
        `#include <metalnessmap_pars_fragment>`,                            //lightEnbled
        `//#include <logdepthbuf_pars_fragment>`,
        `//#include <clipping_planes_pars_fragment>`,
        `void main() {`,
        `// #include <clipping_planes_fragment>`,
        `
        vec4 diffuseColor = vec4( diffuse, opacity );
        ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
        vec3 totalEmissiveRadiance = emissive;
        `,
        `// #include <logdepthbuf_fragment>`,
        `#include <map_fragment>`,
        `#include <color_fragment>`,
        `#include <alphamap_fragment>`,
        `#include <alphatest_fragment>`,
        `#include <roughnessmap_fragment>`,
        `#include <metalnessmap_fragment>`,
        `#include <normal_fragment_begin>`,
        `#include <normal_fragment_maps>`,
        `#include <clearcoat_normal_fragment_begin>`,
        `#include <clearcoat_normal_fragment_maps>`,
        `//#include <emissivemap_fragment>`,
        lightEnbled ? `
          // accumulation
          #include <lights_physical_fragment>
          #include <lights_fragment_begin>
          #include <lights_fragment_maps>
          #include <lights_fragment_end>
          // modulation
          #include <aomap_fragment>
          vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
          vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
          #include <transmission_fragment>
          vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
        ` : `
        // accumulation (baked indirect lighting only
          #ifdef USE_LIGHTMAP
          vec4 lightMapTexel= texture2D( lightMap, vUv2 );
          reflectedLight.indirectDiffuse += lightMapTexelToLinear( lightMapTexel ).rgb * lightMapIntensity;
          #else
          reflectedLight.indirectDiffuse += vec3( 1.0 );
          #endif
          // modulation
          #include <aomap_fragment>
          reflectedLight.indirectDiffuse *= diffuseColor.rgb;
          vec3 outgoingLight = reflectedLight.indirectDiffuse;
        `, `
        #ifdef USE_CLEARCOAT
          float dotNVcc = saturate( dot( geometry.clearcoatNormal, geometry.viewDir ) );
          vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
          outgoingLight = outgoingLight * ( 1.0 - clearcoat * Fcc ) + clearcoatSpecular * clearcoat;
        #endif
        `,
        `#include <output_fragment>`,
        `// #include <tonemapping_fragment>`,
        `#include <encodings_fragment>`,
        `// #include <fog_fragment>`,
        `// #include <premultiplied_alpha_fragment>`,
        `// #include <dithering_fragment>`,
        `}`
      ].join('\n')

      // Object.keys(ShaderLib.basic.uniforms).forEach((original) => {
      //   let key = original
      //   if (original == 'diffuse') key = 'color'
      //   if ((prevMaterial as any)[key] !== undefined && (prevMaterial as any)[key] !== null) {
      //     // console.error(key)
      //     if (key == 'color') {
      //       //@ts-ignore
      //       uniforms.diffuse = {
      //         value: (prevMaterial as any)[key]
      //       }
      //     } else {
      //       //@ts-ignore
      //       uniforms[key] = {
      //         value: (prevMaterial as any)[key]
      //       }
      //       if ((prevMaterial as any)[key].isTexture) {
      //         obj.material[key] = true
      //         debugger
      //       }
      //     }
      //   } else if (key == 'envMap') {
      //     // //@ts-ignore
      //     // obj.material.envMap = Engine.scene?.environment
      //     // //@ts-ignore
      //     // obj.material.uniforms.envMap = {
      //     //   value: Engine.scene?.environment
      //     // }
      //     // //@ts-ignore
      //     // obj.material.uniforms.envMapIntensity = { value: 1 }
      //     // //@ts-ignore
      //     // obj.material.uniforms.flipEnvMap.value = 1
      //   }
      // })
      // uniforms = UniformsUtils.merge([UniformsLib.lights, uniforms])
      
      obj.material = new ShaderMaterial({
        defines,
        uniforms: uniforms,
        vertexShader,
        fragmentShader,
        // fog: false,
        lights: lightEnbled,
        transparent: true
      })
      obj.material.needsUpdate = true
    } catch (error) {
      console.error(error)
    }
  }
}

export const useStandardMaterial = (obj: Mesh<any, Material>): void => {
  const material = obj.userData.prevMaterial ?? obj.material

  if (typeof material === 'undefined') return

  // BPCEM
  if (SceneOptions.instance.boxProjection) {
    material.onBeforeCompile = beforeMaterialCompile(
      SceneOptions.instance.bpcemOptions.bakeScale,
      SceneOptions.instance.bpcemOptions.bakePositionOffset
    )
  }

  material.envMapIntensity = SceneOptions.instance.envMapIntensity

  if (obj.userData.prevMaterial) {
    obj.material.dispose()
    obj.material = material
    obj.userData.prevMaterial = undefined
  }

  if (obj.receiveShadow) Engine.csm?.setupMaterial(obj)
}
