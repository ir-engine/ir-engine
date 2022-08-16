import { Object3D, Texture } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { AssetLoader } from '../../../assets/classes/AssetLoader'
import { GLTF } from '../../../assets/loaders/gltf/GLTFLoader'
import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../../ecs/functions/ComponentFunctions'
import {
  setBoundingBoxComponent,
  setBoundingBoxDynamicTag
} from '../../../interaction/components/BoundingBoxComponents'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { MaterialOverrideComponentType } from '../../components/MaterialOverrideComponent'
import { ModelComponent, ModelComponentType } from '../../components/ModelComponent'
import { Object3DComponent, Object3DWithEntity } from '../../components/Object3DComponent'
import { SimpleMaterialTagComponent } from '../../components/SimpleMaterialTagComponent'
import { ObjectLayers } from '../../constants/ObjectLayers'
import { generateMeshBVH } from '../bvhWorkerPool'
import { addError, removeError } from '../ErrorFunctions'
import { parseGLTFModel } from '../loadGLTFModel'
import { enableObjectLayer } from '../setObjectLayers'
import { initializeOverride } from './MaterialOverrideFunctions'

export const SCENE_COMPONENT_MODEL = 'gltf-model'
export const SCENE_COMPONENT_MODEL_DEFAULT_VALUE = {
  src: '',
  materialOverrides: [] as MaterialOverrideComponentType[],
  generateBVH: false,
  matrixAutoUpdate: true,
  useBasicMaterial: false,
  isUsingGPUInstancing: false
} as ModelComponentType

export const deserializeModel: ComponentDeserializeFunction = (
  entity: Entity,
  component: ComponentJson<ModelComponentType>
) => {
  const props = parseModelProperties(component.props)
  const model = addComponent(entity, ModelComponent, props)

  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_MODEL)
  //add material override components
  const modelInitProm = updateModel(entity, props)
  Engine.instance.currentWorld.sceneLoadingPendingAssets.add(modelInitProm)
  modelInitProm.then(async () => {
    if (isClient && model.materialOverrides.length > 0) {
      const overrides = await Promise.all(
        model.materialOverrides.map((override, i) => initializeOverride(entity, override)())
      )
      model.materialOverrides = overrides
    }
  })
}

export const updateModel = async (entity: Entity, properties: ModelComponentType) => {
  let scene: Object3DWithEntity
  if (properties.src) {
    try {
      hasComponent(entity, Object3DComponent) && removeComponent(entity, Object3DComponent)
      switch (/\.[\d\s\w]+$/.exec(properties.src)![0]) {
        case '.glb':
        case '.gltf':
          const gltf = (await AssetLoader.loadAsync(properties.src, {
            ignoreDisposeGeometry: properties.generateBVH
          })) as GLTF
          scene = gltf.scene as any
          break
        case '.fbx':
          scene = (await AssetLoader.loadAsync(properties.src, { ignoreDisposeGeometry: properties.generateBVH })).scene
          break
        default:
          scene = new Object3D() as Object3DWithEntity
          break
      }
      addComponent(entity, Object3DComponent, { value: scene })
      setBoundingBoxComponent(entity)
      parseGLTFModel(entity)
      if (properties.generateBVH) {
        scene.traverse(generateMeshBVH)
      }
      removeError(entity, 'srcError')
    } catch (err) {
      console.error(err)
      addError(entity, 'srcError', err.message)
    }
  }

  const obj3d = getComponent(entity, Object3DComponent)?.value
  if (obj3d) {
    if (typeof properties.generateBVH === 'boolean') {
      enableObjectLayer(obj3d, ObjectLayers.Camera, properties.generateBVH)
    }
  }

  if (typeof properties.useBasicMaterial === 'boolean') {
    const hasTag = hasComponent(entity, SimpleMaterialTagComponent)
    if (properties.useBasicMaterial) {
      if (!hasTag) addComponent(entity, SimpleMaterialTagComponent, true)
    } else {
      if (hasTag) removeComponent(entity, SimpleMaterialTagComponent)
    }
  }
}

export const serializeModel: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, ModelComponent)
  if (!component) return
  const overrides = component.materialOverrides.map((_override) => {
    const override = { ..._override }
    if (override.args) {
      Object.entries(override.args)
        .filter(([k, v]) => (v as Texture)?.isTexture)
        .forEach(([k, v]) => {
          override.args[k] = (v as Texture).source.data?.src ?? ''
        })
    }
    delete override.entity
    delete override.targetEntity
    delete override.uuid
    return override
  })
  return {
    name: SCENE_COMPONENT_MODEL,
    props: {
      src: component.src,
      materialOverrides: overrides,
      generateBVH: component.generateBVH,
      matrixAutoUpdate: component.matrixAutoUpdate,
      useBasicMaterial: component.useBasicMaterial,
      isUsingGPUInstancing: component.isUsingGPUInstancing
    }
  }
}

const parseModelProperties = (props): ModelComponentType => {
  return {
    ...SCENE_COMPONENT_MODEL_DEFAULT_VALUE,
    ...props
  }
}
