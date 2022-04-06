import {
  Color,
  Material,
  Mesh,
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
    obj.userData.prevMaterial = obj.material
    // obj.material = new MeshBasicMaterial()
    // MeshBasicMaterial.prototype.copy.call(obj.material, obj.userData.prevMaterial)

    // TODO:
    // https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/UniformsLib.js
    // https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderLib.js
    // https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderChunk.js
    // https://github.com/mrdoob/three.js/blob/master/src/renderers/webgl/WebGLProgram.js

    const prevMaterial = obj.material
    let vertexShader = ShaderLib.standard.vertexShader
    let fragmentShader = ShaderLib.standard.fragmentShader

    // console.error('phong-', ShaderLib.phong)
    // console.error('lambert-', ShaderLib.lambert)
    // console.error('physical-', ShaderLib.standard)

    obj.material = new ShaderMaterial({
      uniforms: UniformsUtils.clone(ShaderLib.standard.uniforms),
      vertexShader,
      fragmentShader,
      lights: true
    })

    let totalUniforms = {
      specularmap: 'specularmap',
      gradientmap: 'gradientmap'
    }
    Object.keys(ShaderLib.standard.uniforms).forEach((key) => {
      totalUniforms[key] = key
    })

    Object.keys(ShaderLib.standard.uniforms).forEach((original) => {
      let key = original
      if (original == 'diffuse') key = 'color'
      if ((prevMaterial as any)[key] !== undefined && (prevMaterial as any)[key] !== null) {
        console.error(key)
        if (key == 'color') {
          //@ts-ignore
          obj.material.uniforms.diffuse = {
            value: (prevMaterial as any)[key]
          }
        } else {
          //@ts-ignore
          obj.material.uniforms[key] = {
            value: (prevMaterial as any)[key]
          }
          if ((prevMaterial as any)[key].isTexture) {
            obj.material[key] = (prevMaterial as any)[key]
          }
        }
      } else if (key == 'envMap') {
        //@ts-ignore
        obj.material.envMap = Engine.scene?.environment
        //@ts-ignore
        obj.material.uniforms.envMap = {
          value: Engine.scene?.environment
        }
        //@ts-ignore
        obj.material.uniforms.envMapIntensity = { value: 1 }
        //@ts-ignore
        obj.material.uniforms.flipEnvMap.value = 1
      }
    })

    obj.material.needsUpdate = true
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
