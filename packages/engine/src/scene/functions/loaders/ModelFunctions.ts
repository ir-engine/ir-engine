import { Object3D, Scene, Texture } from 'three'

import { AssetLoader } from '../../../assets/classes/AssetLoader'
import { DependencyTree } from '../../../assets/classes/DependencyTree'
import { GLTF } from '../../../assets/loaders/gltf/GLTFLoader'
import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import {
  addComponent,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '../../../ecs/functions/ComponentFunctions'
import { setBoundingBoxComponent } from '../../../interaction/components/BoundingBoxComponents'
import { GLTFLoadedComponent } from '../../components/GLTFLoadedComponent'
import { addObjectToGroup } from '../../components/GroupComponent'
import { MaterialOverrideComponentType } from '../../components/MaterialOverrideComponent'
import {
  ModelComponent,
  ModelComponentType,
  SCENE_COMPONENT_MODEL_DEFAULT_VALUE
} from '../../components/ModelComponent'
import { SceneAssetPendingTagComponent } from '../../components/SceneAssetPendingTagComponent'
import { ObjectLayers } from '../../constants/ObjectLayers'
import { generateMeshBVH } from '../bvhWorkerPool'
import { addError, removeError } from '../ErrorFunctions'
import { parseGLTFModel } from '../loadGLTFModel'
import { enableObjectLayer } from '../setObjectLayers'
import { initializeOverride } from './MaterialOverrideFunctions'

export const deserializeModel: ComponentDeserializeFunction = (entity: Entity, data: ModelComponentType) => {
  const props = parseModelProperties(data)
  setComponent(entity, ModelComponent, props)

  /**
   * Add SceneAssetPendingTagComponent to tell scene loading system we should wait for this asset to load
   */
  setComponent(entity, SceneAssetPendingTagComponent, true)
}

export const updateModel = async (entity: Entity) => {
  const model = getComponent(entity, ModelComponent)
  /** @todo replace userData usage with something else */
  const sourceChanged = !model.scene || model.scene.userData.src !== model.src
  if (sourceChanged) {
    try {
      const uuid = Engine.instance.currentWorld.entityTree.entityNodeMap.get(entity)!.uuid
      DependencyTree.add(uuid)

      let scene: Scene
      switch (/\.[\d\s\w]+$/.exec(model.src)?.[0]) {
        case '.glb':
        case '.gltf':
          const gltf = (await AssetLoader.loadAsync(model.src, {
            ignoreDisposeGeometry: model.generateBVH,
            uuid
          })) as GLTF
          scene = gltf.scene as Scene
          break
        case '.fbx':
          scene = (await AssetLoader.loadAsync(model.src, { ignoreDisposeGeometry: model.generateBVH, uuid })).scene
          break
        default:
          scene = new Object3D() as Scene
          break
      }
      scene.userData.src = model.src
      model.scene = scene
      addObjectToGroup(entity, scene)
      setBoundingBoxComponent(entity)
      parseGLTFModel(entity)
      if (model.generateBVH) {
        scene.traverse(generateMeshBVH)
      }
      removeError(entity, 'srcError')
    } catch (err) {
      console.error(err)
      addError(entity, 'srcError', err.message)
      return
    }
  }

  const scene = model.scene!
  enableObjectLayer(scene, ObjectLayers.Camera, model.generateBVH)

  if (isClient && model.materialOverrides.length > 0) {
    const overrides = await Promise.all(
      model.materialOverrides.map((override, i) => initializeOverride(entity, override)?.())
    ).then((results) => results.filter((result) => typeof result !== 'undefined') as MaterialOverrideComponentType[])
    model.materialOverrides = overrides
  }

  /**
   * Remove SceneAssetPendingTagComponent to tell scene loading system this asset has completed
   */
  hasComponent(entity, SceneAssetPendingTagComponent) && removeComponent(entity, SceneAssetPendingTagComponent)
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
    src: component.src,
    materialOverrides: overrides,
    generateBVH: component.generateBVH,
    matrixAutoUpdate: component.matrixAutoUpdate,
    isUsingGPUInstancing: component.isUsingGPUInstancing
  }
}

const parseModelProperties = (props): ModelComponentType => {
  return {
    ...SCENE_COMPONENT_MODEL_DEFAULT_VALUE,
    ...props
  }
}
