import { subscribable } from '@hookstate/subscribable'
import { Object3D, Scene, Texture } from 'three'

import { hookstate, StateMethodsDestroy } from '@xrengine/hyperflux/functions/StateFunctions'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { DependencyTree } from '../../assets/classes/DependencyTree'
import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { defineComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { setBoundingBoxComponent } from '../../interaction/components/BoundingBoxComponents'
import { removeMaterialSource } from '../../renderer/materials/functions/Utilities'
import { ObjectLayers } from '../constants/ObjectLayers'
import { generateMeshBVH } from '../functions/bvhWorkerPool'
import { addError, removeError } from '../functions/ErrorFunctions'
import { initializeOverride } from '../functions/loaders/MaterialOverrideFunctions'
import { parseGLTFModel } from '../functions/loadGLTFModel'
import { enableObjectLayer } from '../functions/setObjectLayers'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'
import { MaterialOverrideComponentType } from './MaterialOverrideComponent'
import { SceneAssetPendingTagComponent } from './SceneAssetPendingTagComponent'

export type ModelComponentType = {
  src: string
  materialOverrides: MaterialOverrideComponentType[]
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
        materialOverrides: [] as MaterialOverrideComponentType[],
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
            removeMaterialSource({ type: 'Model', path: model.scene.userData.src })
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
      if (isClient && model.materialOverrides.length > 0) {
        const overrides = await Promise.all(
          model.materialOverrides.map((override, i) => initializeOverride(entity, override)?.())
        ).then(
          (results) => results.filter((result) => typeof result !== 'undefined') as MaterialOverrideComponentType[]
        )
        state.materialOverrides.set(overrides)
      }
      hasComponent(entity, SceneAssetPendingTagComponent) && removeComponent(entity, SceneAssetPendingTagComponent)
    }

    state.src.subscribe(updateSrc)
    return state as typeof state & StateMethodsDestroy
  },

  toJSON: (entity, component) => {
    const model = component.value
    const overrides = model.materialOverrides.map((_override) => {
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
      src: model.src,
      materialOverrides: overrides,
      generateBVH: model.generateBVH,
      matrixAutoUpdate: model.matrixAutoUpdate
    }
  },

  onUpdate: (entity, component, json) => {
    if (typeof json.src === 'string' && json.src !== component.src.value) component.src.set(json.src)
    if (typeof json.generateBVH === 'boolean' && json.generateBVH !== component.generateBVH.value)
      component.generateBVH.set(json.generateBVH)
    if (Array.isArray(json.materialOverrides) && json.materialOverrides !== component.materialOverrides.value)
      component.materialOverrides.set(json.materialOverrides)
    if (typeof json.matrixAutoUpdate === 'boolean' && json.matrixAutoUpdate !== component.matrixAutoUpdate.value)
      component.matrixAutoUpdate.set(json.matrixAutoUpdate)
  },

  onRemove: (entity, component) => {
    if (component.scene.value) {
      removeObjectFromGroup(entity, component.scene.value)
      component.scene.set(undefined)
    }
    removeMaterialSource({ type: 'Model', path: component.src.value })
  }
})

export const SCENE_COMPONENT_MODEL = 'gltf-model'
