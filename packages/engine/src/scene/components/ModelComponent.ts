import { useEffect } from 'react'
import { Object3D, Scene } from 'three'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { DependencyTree } from '../../assets/classes/DependencyTree'
import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { Engine } from '../../ecs/classes/Engine'
import { defineComponent, removeComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { EntityReactorProps } from '../../ecs/functions/EntityFunctions'
import { setBoundingBoxComponent } from '../../interaction/components/BoundingBoxComponents'
import { SourceType } from '../../renderer/materials/components/MaterialSource'
import { removeMaterialSource } from '../../renderer/materials/functions/Utilities'
import { ObjectLayers } from '../constants/ObjectLayers'
import { generateMeshBVH } from '../functions/bvhWorkerPool'
import { addError, clearErrors } from '../functions/ErrorFunctions'
import { parseGLTFModel } from '../functions/loadGLTFModel'
import { enableObjectLayer } from '../functions/setObjectLayers'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'
import { MediaComponent } from './MediaComponent'
import { SceneAssetPendingTagComponent } from './SceneAssetPendingTagComponent'

export type ModelComponentType = {
  src: string
  generateBVH: boolean
  matrixAutoUpdate: boolean
  scene?: Scene
}

export const ModelComponent = defineComponent({
  name: 'EE_model',

  onInit: (entity) => {
    return {
      src: '',
      generateBVH: false,
      matrixAutoUpdate: true,
      scene: undefined
    } as ModelComponentType
  },

  toJSON: (entity, component) => {
    const model = component.value
    return {
      src: model.src,
      generateBVH: model.generateBVH,
      matrixAutoUpdate: model.matrixAutoUpdate
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
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
  },

  reactor: ModelReactor
})

function ModelReactor({ root }: EntityReactorProps) {
  const entity = root.entity
  const modelState = useComponent(entity, ModelComponent)

  // update src
  useEffect(() => {
    if (!modelState) return
    const model = modelState.value

    const loadModel = async () => {
      clearErrors(entity, ModelComponent)

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

        if (modelState.scene.value) return // src was changed again ?

        scene.userData.src = model.src
        modelState.scene.set(scene)
        addObjectToGroup(entity, scene)
        setBoundingBoxComponent(entity)
        parseGLTFModel(entity)

        if (model.generateBVH) {
          scene.traverse(generateMeshBVH)
        }
      } catch (err) {
        addError(entity, MediaComponent, 'LOADING_ERROR', err.message)
      }
    }

    loadModel()
  }, [modelState?.src])

  // update scene
  useEffect(() => {
    if (!modelState) return
    const scene = modelState.scene.value
    if (!scene) return

    addObjectToGroup(entity, scene)
    enableObjectLayer(scene, ObjectLayers.Camera, modelState.generateBVH.value)
    removeComponent(entity, SceneAssetPendingTagComponent)

    return () => removeObjectFromGroup(entity, scene)
  }, [modelState?.scene])

  return null
}

export const SCENE_COMPONENT_MODEL = 'gltf-model'
