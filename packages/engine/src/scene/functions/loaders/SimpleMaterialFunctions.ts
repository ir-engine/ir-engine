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
  UniformsUtils,
  TextureLoader
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
import { object } from 'ts-matches'
import { fragmentShader } from 'src/particles/functions/particleHelpers'

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
  //@ts-ignore
  if (!obj.geometry || !obj.material || !obj.material.color) return
  const vertexNonUVShader = `
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `
  const vertexUVShader = [
    'varying vec2 vUv;',
    '#include <skinning_pars_vertex>',
    'void main() {',
    '#include <skinbase_vertex>',
    '#include <begin_vertex>',
    '#include <skinning_vertex>',
    '#include <project_vertex>',
    'vUv = uv;',
    '}'
  ].join('\n')

  const fragmentColorShader = [
    'uniform vec3 color;',
    'void main() {',
    '	gl_FragColor = vec4(color.r, color.g, color.b, 1.0);',
    '}'
  ].join('\n')

  const fragmentTextureShader = [
    'varying vec2 vUv;',
    'uniform sampler2D origin_texture;',
    'void main() {',
    '	gl_FragColor = texture2D(origin_texture, vUv);',
    '}'
  ].join('\n')

  const hasUV = obj.geometry.hasAttribute('uv')
  const hasTexture = (<any>obj.material).map !== null

  const mat = new ShaderMaterial({
    uniforms: {
      color: {
        value: (<any>obj.material).color
      },
      origin_texture: {
        value: (<any>obj.material).map
      },
    },
    vertexShader: hasUV ? vertexUVShader : vertexNonUVShader,
    fragmentShader: hasTexture ? fragmentTextureShader : fragmentColorShader 
  })

  obj.userData.prevMaterial = obj.material
  obj.material = mat
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
