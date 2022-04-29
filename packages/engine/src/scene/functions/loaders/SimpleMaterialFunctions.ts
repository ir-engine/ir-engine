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
import { EngineRenderer } from '../../../renderer/WebGLRendererSystem'
import { beforeMaterialCompile } from '../../classes/BPCEMShader'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { SimpleMaterialTagComponent } from '../../components/SimpleMaterialTagComponent'
import { SceneOptions } from '../../systems/SceneObjectSystem'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'

export const SCENE_COMPONENT_SIMPLE_MATERIALS = 'simple-materials'

export const deserializeSimpleMaterial: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<{ simpleMaterials: boolean }>
) => {
  if (!json.props.simpleMaterials) return

  addComponent(entity, SimpleMaterialTagComponent, {})
  Engine.instance.simpleMaterials = json.props.simpleMaterials

  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_SIMPLE_MATERIALS)
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
  
  const isStandardMaterial = obj.material instanceof MeshStandardMaterial
  const isBasicMaterial = obj.material instanceof MeshBasicMaterial

  //@ts-ignore
  if (!obj.material || !obj.material.color || isBasicMaterial) return
  //@ts-ignore
  if (obj.entity && hasComponent(entity, XRUIComponent)) return
  
  try {
    obj.userData.prevMaterial = obj.material

    // TODO:
    // https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/UniformsLib.js
    // https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderLib.js
    // https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderChunk.js
    // https://github.com/mrdoob/three.js/blob/master/src/renderers/webgl/WebGLProgram.js

    const prevMaterial = obj.material
    // const lightEnabled = !isBasicMaterial
    const lightEnabled = true
    const fogEnabled = false
    const hasUV = obj.geometry.hasAttribute('uv')
    const hasMap = (<any>obj.material).map != null
    const hasEnvMap = isStandardMaterial
    const hasLightMap = (<any>obj.material).lightMap != null
    const hasAoMap = (<any>obj.material).aoMap != null
    const hasEmissiveMap = (<any>obj.material).emissiveMap != null
    const hasBumpMap = (<any>obj.material).bumpMap != null
    const hasSpecularMap  = (<any>obj.material).specularMap != null
    const hasRoughnessMap  = (<any>obj.material).roughnessMap != null
    const hasMetalnessMap   = (<any>obj.material).metalnessMap != null
    const hasAlphaMap = (<any>obj.material).alphaMap != null

    let defines = {}
    if (lightEnabled) {
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

    if (hasEmissiveMap) {
      defines["USE_EMISSIVEMAP"] = ''
    }

    if (hasBumpMap) {
      defines["USE_BUMPMAP"] = ''
    }

    if (hasRoughnessMap) {
      defines["USE_ROUGHNESSMAP"] = ''
    }

    if (hasMetalnessMap) {
      defines["USE_METALNESSMAP"] = ''
    }

    var uniforms = {
      diffuse: {
        value: prevMaterial.color
      },
      opacity: {
        value: (prevMaterial.opacity
      },
      uvTransform: { value: new Matrix3() },
      uv2Transform: { value: new Matrix3() },
      alphaTest: {
        value: prevMaterial.alphaTest
      }
    }
    
    // var uniforms = {}
    Object.keys(ShaderLib.standard.uniforms).forEach((original) => {
      let key = original
      if (original == 'diffuse') key = 'color'
      if (prevMaterial[key] !== undefined && prevMaterial[key] !== null) {
        // console.error(key)
        if (key == 'color') {
          //@ts-ignore
          uniforms.diffuse = {
            value: prevMaterial[key]
          }
        } else {
          //@ts-ignore
          uniforms[key] = {
            value: prevMaterial[key]
          }
        }
      }
    })

    if (lightEnabled) {
      uniforms = UniformsUtils.merge([UniformsLib.lights, uniforms])
    }

    const vertexShader = [
      `varying vec3 vViewPosition;`,
      `#ifdef USE_TRANSMISSION
        varying vec3 vWorldPosition;
      #endif`,
      `#include <common>`,
      hasUV ? `#include <uv_pars_vertex>` : '',
      (hasLightMap || hasAoMap) ? `#include <uv2_pars_vertex>` : '',
      // `#include <displacementmap_pars_vertex>`,
      `#include <color_pars_vertex>`,
      fogEnabled ? `#include <fog_pars_vertex>` : ``,
      `#include <normal_pars_vertex>`,
      // `#include <morphtarget_pars_vertex>`,
      // `#include <skinning_pars_vertex>`,
      lightEnabled ? `#include <shadowmap_pars_vertex> ` : '',                    //lightEnabled
      //`#include <logdepthbuf_pars_vertex>`,
      //`#include <clipping_planes_pars_vertex>`,

      `void main() {`,
      hasUV ? `#include <uv_vertex>` : '',
      (hasLightMap || hasAoMap) ? `#include <uv2_vertex>` : '',
      `#include <color_vertex>`,
      `#include <beginnormal_vertex>
      #include <morphnormal_vertex>
      #include <skinbase_vertex>
      #include <skinnormal_vertex>
      #include <defaultnormal_vertex>
      #include <normal_vertex>`,
      `#include <begin_vertex>`,
      //`#include <morphtarget_vertex>`,
      //`#include <skinning_vertex>`,
      //`#include <displacementmap_vertex>`,
      `#include <project_vertex>`,
      // `#include <logdepthbuf_vertex>`,
      // `#include <clipping_planes_vertex>`,
      `vViewPosition = - mvPosition.xyz;`,

      `#include <worldpos_vertex>`,
      lightEnabled ? `#include <shadowmap_vertex>` : '',
      fogEnabled ? `#include <fog_vertex>` : ``,
      `#ifdef USE_TRANSMISSION`,
      `vWorldPosition = worldPosition.xyz;`,
      `#endif`,
      `}`
    ].join('\n')

    const fragmentShader = [
      // `
      // #ifdef PHYSICAL
      //   #define IOR
      //   #define SPECULAR
      // #endif
      // `,
      `uniform vec3 diffuse;`,
      `uniform vec3 emissive;`,
      `uniform float roughness;`,
      `uniform float metalness;`,
      `uniform float opacity;`,
      // `
      // #ifdef IOR
      //   uniform float ior;
      // #endif
      // `,
      // `
      // #ifdef SPECULAR
      //   uniform float specularIntensity;
      //   uniform vec3 specularTint;
      
      //   #ifdef USE_SPECULARINTENSITYMAP
      //     uniform sampler2D specularIntensityMap;
      //   #endif
      
      //   #ifdef USE_SPECULARTINTMAP
      //     uniform sampler2D specularTintMap;
      //   #endif
      // #endif
      // `,
      // `
      // #ifdef USE_CLEARCOAT
      //   uniform float clearcoat;
      //   uniform float clearcoatRoughness;
      // #endif
      // `,
      // `
      // #ifdef USE_SHEEN
      //   uniform vec3 sheenTint;
      //   uniform float sheenRoughness;
      // #endif
      // `,
      `varying vec3 vViewPosition;`,
      `#include <common>`,
      `#include <packing>`,
      //`#include <dithering_pars_fragment>`,
      `#include <color_pars_fragment>`,
      hasUV ? `#include <uv_pars_fragment>` : ``,
      (hasLightMap || hasAoMap) ? `#include <uv2_pars_fragment>` : ``,
      hasMap ? `#include <map_pars_fragment>` : ``,
      hasAlphaMap ? `#include <alphamap_pars_fragment>` : ``,
      `#include <alphatest_pars_fragment>`,
      hasAoMap ? `#include <aomap_pars_fragment>` : ``,
      hasLightMap ? `#include <lightmap_pars_fragment>` : ``,
      hasEmissiveMap ? `#include <emissivemap_pars_fragment>` : ``,
      lightEnabled ? `#include <bsdfs>` : ``,                             //lightEnabled
      hasEnvMap ? `#include <cube_uv_reflection_fragment>` : ``,
      hasEnvMap ? `#include <envmap_common_pars_fragment>` : ``,
      hasEnvMap ?  `#include <envmap_physical_pars_fragment>` : ``,
      fogEnabled ? `#include <fog_pars_fragment>` : ``,
      hasSpecularMap ? `#include <specularmap_pars_fragment>` : ``,
      lightEnabled ? `#include <lights_pars_begin>` : ``,                 //lightEnabled
      lightEnabled ? `#include <normal_pars_fragment>` : ``,              //lightEnabled
      lightEnabled ? `#include <lights_physical_pars_fragment>` : ``,     //lightEnabled
      `#include <transmission_pars_fragment>`,
      lightEnabled ? `#include <shadowmap_pars_fragment>` : ``,           //lightEnabled
      hasBumpMap ? `#include <bumpmap_pars_fragment>` : ``,
      `#include <normalmap_pars_fragment>`,
      //`#include <clearcoat_pars_fragment>`,
      lightEnabled ? `#include <roughnessmap_pars_fragment>` : ``,     //lightEnabled
      lightEnabled ?`#include <metalnessmap_pars_fragment>` : ``,      //lightEnabled
      //`#include <logdepthbuf_pars_fragment>`,
      //`#include <clipping_planes_pars_fragment>`,
      `void main() {`,
      //`#include <clipping_planes_fragment>`,
      `
      vec4 diffuseColor = vec4( diffuse, opacity );
      ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
      vec3 totalEmissiveRadiance = emissive;
      `,
      //`#include <logdepthbuf_fragment>`,
      hasMap ? `#include <map_fragment>` : ``,
      `#include <color_fragment>`,
      hasAlphaMap ? `#include <alphamap_fragment>` : ``,
      `#include <alphatest_fragment>`,
      hasSpecularMap ? `#include <specularmap_fragment>` : ``,
      lightEnabled ? `#include <roughnessmap_fragment>` : ``,
      lightEnabled ? `#include <metalnessmap_fragment>` : ``,
      lightEnabled ? `#include <normal_fragment_begin>` : ``,
      lightEnabled ? `#include <normal_fragment_maps>` : ``,
      //`#include <clearcoat_normal_fragment_begin>`,
      //`#include <clearcoat_normal_fragment_maps>`,
      hasEmissiveMap ? `#include <emissivemap_fragment>` : ``,
      lightEnabled ? `
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
      `,
      // `
      // #ifdef USE_CLEARCOAT
      //   float dotNVcc = saturate( dot( geometry.clearcoatNormal, geometry.viewDir ) );
      //   vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
      //   outgoingLight = outgoingLight * ( 1.0 - clearcoat * Fcc ) + clearcoatSpecular * clearcoat;
      // #endif
      // `,
      `#include <output_fragment>`,
      //`#include <tonemapping_fragment>`,
      `#include <encodings_fragment>`,
      fogEnabled ? `#include <fog_fragment>` : ``,
      //`#include <premultiplied_alpha_fragment>`,
      //`#include <dithering_fragment>`,
      `}`
    ].join('\n')
    
    obj.material = new ShaderMaterial({
      defines,
      uniforms: uniforms,
      vertexShader,
      fragmentShader,
      fog: fogEnabled,
      lights: lightEnabled,
      transparent: true
    })

    Object.keys(uniforms).forEach((key) => {
      if (uniforms[key].value?.isTexture) {
        obj.material[key] = true
      }
    })

    if (hasEnvMap) {
      //@ts-ignore
      obj.material.envMap = Engine.scene?.environment
      //@ts-ignore
      obj.material.uniforms.envMap = {
        value: Engine.scene?.environment
      }
      //@ts-ignore
      obj.material.uniforms.envMapIntensity = { value: 1 }
      //@ts-ignore
      obj.material.uniforms.flipEnvMap = { value: 1 }
    }
    obj.material.needsUpdate = true
  } catch (error) {
    console.error(error)
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

  if (obj.receiveShadow) EngineRenderer.instance.csm?.setupMaterial(obj)
}
