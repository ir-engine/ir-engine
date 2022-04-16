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

      // const vertexNonUVShader = `
      //   void main() {
      //     gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      //   }
      // `
      // const vertexUVShader = [
      //   'varying vec2 vUv;',
      //   '#include <skinning_pars_vertex>',
      //   'void main() {',
      //   '#include <skinbase_vertex>',
      //   '#include <begin_vertex>',
      //   '#include <skinning_vertex>',
      //   '#include <project_vertex>',
      //   'vUv = uv;',
      //   '}'
      // ].join('\n')

      // const fragmentColorShader = [
      //   'uniform vec3 color;',
      //   'void main() {',
      //   '	gl_FragColor = vec4(color.r, color.g, color.b, 1.0);',
      //   '}'
      // ].join('\n')

      // const fragmentTextureShader = [
      //   'varying vec2 vUv;',
      //   'uniform sampler2D map;',
      //   'void main() {',
      //   '	gl_FragColor = texture2D(map, vUv);',
      //   '}'
      // ].join('\n')

      // const vertexShader = `
      //   #include <common>
      //   #include <uv_pars_vertex>
      //   #include <uv2_pars_vertex>
      //   #include <envmap_pars_vertex>
      //   #include <color_pars_vertex>
      //   #include <fog_pars_vertex>
      //   #include <morphtarget_pars_vertex>
      //   #include <skinning_pars_vertex>
      //   #include <logdepthbuf_pars_vertex>
      //   #include <clipping_planes_pars_vertex>
      //   void main() {
      //     #include <uv_vertex>
      //     #include <uv2_vertex>
      //     #include <color_vertex>
      //     #include <morphcolor_vertex>
      //     #if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
      //       #include <beginnormal_vertex>
      //       #include <morphnormal_vertex>
      //       #include <skinbase_vertex>
      //       #include <skinnormal_vertex>
      //       #include <defaultnormal_vertex>
      //     #endif
      //     #include <begin_vertex>
      //     #include <morphtarget_vertex>
      //     #include <skinning_vertex>
      //     #include <project_vertex>
      //     #include <logdepthbuf_vertex>
      //     #include <clipping_planes_vertex>
      //     #include <worldpos_vertex>
      //     #include <envmap_vertex>
      //     #include <fog_vertex>
      //   }
      // `
      // const fragment = `
      //   uniform vec3 diffuse;
      //   uniform float opacity;
      //   #ifndef FLAT_SHADED
      //     varying vec3 vNormal;
      //   #endif
      //   #include <common>
      //   #include <dithering_pars_fragment>
      //   #include <color_pars_fragment>
      //   #include <uv_pars_fragment>
      //   #include <uv2_pars_fragment>
      //   #include <map_pars_fragment>
      //   #include <alphamap_pars_fragment>
      //   #include <alphatest_pars_fragment>
      //   #include <aomap_pars_fragment>
      //   #include <lightmap_pars_fragment>
      //   #include <envmap_common_pars_fragment>
      //   #include <envmap_pars_fragment>
      //   #include <cube_uv_reflection_fragment>
      //   #include <fog_pars_fragment>
      //   #include <specularmap_pars_fragment>
      //   #include <logdepthbuf_pars_fragment>
      //   #include <clipping_planes_pars_fragment>
      //   void main() {
      //     #include <clipping_planes_fragment>
      //     vec4 diffuseColor = vec4( diffuse, opacity );
      //     #include <logdepthbuf_fragment>
      //     #include <map_fragment>
      //     #include <color_fragment>
      //     #include <alphamap_fragment>
      //     #include <alphatest_fragment>
      //     #include <specularmap_fragment>
      //     ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
      //     #ifdef USE_LIGHTMAP
      //       vec4 lightMapTexel = texture2D( lightMap, vUv2 );
      //       reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
      //     #else
      //       reflectedLight.indirectDiffuse += vec3( 1.0 );
      //     #endif
      //     #include <aomap_fragment>
      //     reflectedLight.indirectDiffuse *= diffuseColor.rgb;
      //     vec3 outgoingLight = reflectedLight.indirectDiffuse;
      //     #include <envmap_fragment>
      //     #include <output_fragment>
      //     #include <tonemapping_fragment>
      //     #include <encodings_fragment>
      //     #include <fog_fragment>
      //     #include <premultiplied_alpha_fragment>
      //     #include <dithering_fragment>
      //   }
      // `

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
        }
      }

      const hasUV = obj.geometry.hasAttribute('uv')
      const hasMap = (<any>obj.material).map !== null
      const hasLightMap = (<any>obj.material).lightMap !== null
      const hasEnvMap = true
      const hasSpecularMap = (<any>obj.material).specularMap !== null
      const hasAoMap = (<any>obj.material).aoMap !== null
      const hasEmissiveMap = (<any>obj.material).emissiveMap !== null
      const hasAlphaMap = (<any>obj.material).alphaMap !== null

      let defines = {}
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

      vertexShader = `
        #include <common>
        #include <uv_pars_vertex>                                         //hasUV
        #include <envmap_pars_vertex>                                     //hasEnvMap
        void main() {
          #include <uv_vertex>                                            //hasUV
          #include <color_vertex>                                         
          #if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )          //hasEnvMap
            #include <beginnormal_vertex>
            #include <morphnormal_vertex>
            #include <skinbase_vertex>
            #include <skinnormal_vertex>
            #include <defaultnormal_vertex>
          #endif
          #include <begin_vertex>
          #include <project_vertex>
          #include <worldpos_vertex>
          #include <envmap_vertex>                                        //hasEnvMap               
        }
      `

      fragmentShader = `
        uniform vec3 diffuse;
        uniform float opacity;
        #ifndef FLAT_SHADED
          varying vec3 vNormal;
        #endif
        #include <common>
        #include <color_pars_fragment>
        #include <uv_pars_fragment>                                       //hasUV
        #include <map_pars_fragment>                                      //hasMap
        #include <alphamap_pars_fragment>                                 //hasAlphaMap
        #include <alphatest_pars_fragment>
        #include <aomap_pars_fragment>                                    //hasAoMap
        #include <envmap_common_pars_fragment>                            //hasEnvMap
        #include <envmap_pars_fragment>                                   //hasEnvMap
        #include <specularmap_pars_fragment>                              //hasSpecularMap
        void main() {
          vec4 diffuseColor = vec4( diffuse, opacity );
          #include <map_fragment>                                         //hasMap
          #include <color_fragment>
          #include <alphamap_fragment>                                    //hasAlphaMap
	        #include <alphatest_fragment>
          #include <specularmap_fragment>                                 //hasSpecularMap
          ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
          #ifdef USE_LIGHTMAP
            vec4 lightMapTexel = texture2D( lightMap, vUv2 );
            reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
          #else
            reflectedLight.indirectDiffuse += vec3( 1.0 );
          #endif
          #include <aomap_fragment>                                       //hasAoMap
          reflectedLight.indirectDiffuse *= diffuseColor.rgb;
          vec3 outgoingLight = reflectedLight.indirectDiffuse;
          #include <output_fragment>
          #include <envmap_fragment>                                      //hasEnvMap
          #include <encodings_fragment>
        }
      `

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
        lights: false,
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
