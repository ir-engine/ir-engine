import { subscribable } from '@hookstate/subscribable'
import { Object3D, Scene } from 'three'

import { hookstate, StateMethodsDestroy } from '@xrengine/hyperflux/functions/StateFunctions'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { DependencyTree } from '../../assets/classes/DependencyTree'
import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { Engine } from '../../ecs/classes/Engine'
import { defineComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { setBoundingBoxComponent } from '../../interaction/components/BoundingBoxComponents'
import { SourceType } from '../../renderer/materials/components/MaterialSource'
import { removeMaterialSource } from '../../renderer/materials/functions/Utilities'
import { ObjectLayers } from '../constants/ObjectLayers'
import { generateMeshBVH } from '../functions/bvhWorkerPool'
import { addError, removeError } from '../functions/ErrorFunctions'
import { parseGLTFModel } from '../functions/loadGLTFModel'
import { enableObjectLayer } from '../functions/setObjectLayers'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'
import { SceneAssetPendingTagComponent } from './SceneAssetPendingTagComponent'

export type ModelComponentType = {
  src: string
  generateBVH: boolean
  matrixAutoUpdate: boolean
  curScr?: string
  scene?: Scene
}

export const ModelComponent = defineComponent({
  name: 'EE_model',
  onAdd: (entity) => {
    const state = hookstate(
      {
        src: '',
        generateBVH: false,
        matrixAutoUpdate: true
      } as ModelComponentType,
      subscribable()
    )

    const updateSrc = async () => {
      const model = state.value
      const sourceChanged = !model.scene || model.scene.userData.src !== model.src
      if (sourceChanged) {
        try {
          if (model.scene && model.scene.userData.src !== model.src) {
            removeMaterialSource({ type: SourceType.MODEL, path: model.scene.userData.src })
          }
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
            case '.usdz':
              scene = (await AssetLoader.loadAsync(model.src, { ignoreDisposeGeometry: model.generateBVH, uuid })).scene
              break
            default:
              scene = new Object3D() as Scene
              break
          }
          scene.userData.src = model.src
          if (state.scene.value) removeObjectFromGroup(entity, state.scene.value)
          state.scene.set(scene)
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

      hasComponent(entity, SceneAssetPendingTagComponent) && removeComponent(entity, SceneAssetPendingTagComponent)
    }

    state.src.subscribe(updateSrc)
    return state as typeof state & StateMethodsDestroy
  },

  toJSON: (entity, component) => {
    const model = component.value
    return {
      src: model.src,
      generateBVH: model.generateBVH,
      matrixAutoUpdate: model.matrixAutoUpdate
    }
  },

  onUpdate: (entity, component, json) => {
    if (typeof json.src === 'string' && json.src !== component.src.value) component.src.set(json.src)
    if (typeof json.generateBVH === 'boolean' && json.generateBVH !== component.generateBVH.value)
      component.generateBVH.set(json.generateBVH)
    if (typeof json.matrixAutoUpdate === 'boolean' && json.matrixAutoUpdate !== component.matrixAutoUpdate.value)
      component.matrixAutoUpdate.set(json.matrixAutoUpdate)
  },

  onRemove: (entity, component) => {
    if (component.scene.value) {
      removeObjectFromGroup(entity, component.scene.value)
      component.scene.set(undefined)
    }
    removeMaterialSource({ type: SourceType.MODEL, path: component.src.value })
  }
})

export const SCENE_COMPONENT_MODEL = 'gltf-model'
