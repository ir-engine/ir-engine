import { entityExists } from 'bitecs'
import { useEffect } from 'react'
import { Object3D, Scene } from 'three'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { DependencyTree } from '../../assets/classes/DependencyTree'
import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { Engine } from '../../ecs/classes/Engine'
import {
  defineComponent,
  getComponent,
  hasComponent,
  removeComponent,
  useComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { EntityReactorProps } from '../../ecs/functions/EntityFunctions'
import { EntityTreeComponent } from '../../ecs/functions/EntityTree'
import { setBoundingBoxComponent } from '../../interaction/components/BoundingBoxComponents'
import { SourceType } from '../../renderer/materials/components/MaterialSource'
import { removeMaterialSource } from '../../renderer/materials/functions/MaterialLibraryFunctions'
import { ObjectLayers } from '../constants/ObjectLayers'
import { generateMeshBVH } from '../functions/bvhWorkerPool'
import { addError, clearErrors, removeError } from '../functions/ErrorFunctions'
import { parseGLTFModel } from '../functions/loadGLTFModel'
import { enableObjectLayer } from '../functions/setObjectLayers'
import { addObjectToGroup, GroupComponent, removeObjectFromGroup } from './GroupComponent'
import { MediaComponent } from './MediaComponent'
import { SceneAssetPendingTagComponent } from './SceneAssetPendingTagComponent'
import { UUIDComponent } from './UUIDComponent'

export const ModelComponent = defineComponent({
  name: 'EE_model',

  onInit: (entity) => {
    return {
      src: '',
      generateBVH: true,
      scene: undefined as undefined | Scene
    }
  },

  toJSON: (entity, component) => {
    return {
      src: component.src.value,
      generateBVH: component.generateBVH.value
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.src === 'string' && json.src !== component.src.value) component.src.set(json.src)
    if (typeof json.generateBVH === 'boolean' && json.generateBVH !== component.generateBVH.value)
      component.generateBVH.set(json.generateBVH)
  },

  onRemove: (entity, component) => {
    if (component.scene.value) {
      removeObjectFromGroup(entity, component.scene.value)
      component.scene.set(undefined)
    }
    removeMaterialSource({ type: SourceType.MODEL, path: component.src.value })
  },

  errors: ['LOADING_ERROR'],

  reactor: ModelReactor
})

function ModelReactor({ root }: EntityReactorProps) {
  const entity = root.entity
  if (!hasComponent(entity, ModelComponent)) throw root.stop()

  const modelComponent = useComponent(entity, ModelComponent)
  const groupComponent = useOptionalComponent(entity, GroupComponent)
  const model = modelComponent.value
  // update src
  useEffect(() => {
    if (model.src === model.scene?.userData?.src) return

    const loadModel = async () => {
      try {
        if (model.scene && model.scene.userData.src && model.scene.userData.src !== model.src) {
          try {
            removeMaterialSource({ type: SourceType.MODEL, path: model.scene.userData.src })
          } catch (e) {
            if (e?.name === 'MaterialNotFound') {
              console.warn('could not find material in source ' + model.scene.userData.src)
            } else {
              throw e
            }
          }
        }
        if (!model.src) return
        if (!hasComponent(entity, EntityTreeComponent)) return

        const uuid = getComponent(entity, UUIDComponent)
        DependencyTree.add(uuid)
        let scene: Scene
        const fileExtension = /\.[\d\s\w]+$/.exec(model.src)?.[0]
        switch (fileExtension) {
          case '.glb':
          case '.gltf':
          case '.fbx':
          case '.usdz':
            const loadedAsset = await AssetLoader.loadAsync(model.src, {
              ignoreDisposeGeometry: model.generateBVH,
              uuid
            })
            scene = loadedAsset.scene
            scene.animations = loadedAsset.animations
            break
          default:
            throw new Error(`Model type '${fileExtension}' not supported`)
        }

        if (!entityExists(Engine.instance.currentWorld, entity)) return
        removeError(entity, ModelComponent, 'LOADING_ERROR')
        scene.userData.src = model.src
        if (scene.userData.type === 'glb') delete scene.userData.type
        modelComponent.scene.set(scene)
      } catch (err) {
        console.error(err)
        addError(entity, ModelComponent, 'LOADING_ERROR', err.message)
      }
    }

    loadModel()
  }, [modelComponent.src])

  // update scene
  useEffect(() => {
    const scene = modelComponent.scene.value
    if (!scene || groupComponent?.value?.find((group: any) => group === scene)) return

    addObjectToGroup(entity, scene)
    parseGLTFModel(entity)

    if (model.generateBVH) {
      scene.traverse(generateMeshBVH)
    }
    setBoundingBoxComponent(entity)
    /** @todo - improve BVH implementation */
    // enableObjectLayer(scene, ObjectLayers.Camera, modelComponent.generateBVH.value)
    removeComponent(entity, SceneAssetPendingTagComponent)

    return () => removeObjectFromGroup(entity, scene)
  }, [modelComponent.scene])

  return null
}

export const SCENE_COMPONENT_MODEL = 'gltf-model'
