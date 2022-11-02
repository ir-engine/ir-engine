import { entityExists } from 'bitecs'
import { useEffect } from 'react'
import { Object3D, Scene } from 'three'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { DependencyTree } from '../../assets/classes/DependencyTree'
import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { Engine } from '../../ecs/classes/Engine'
import {
  defineComponent,
  hasComponent,
  removeComponent,
  useComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { EntityReactorProps } from '../../ecs/functions/EntityFunctions'
import { setBoundingBoxComponent } from '../../interaction/components/BoundingBoxComponents'
import { SourceType } from '../../renderer/materials/components/MaterialSource'
import { removeMaterialSource } from '../../renderer/materials/functions/Utilities'
import { ObjectLayers } from '../constants/ObjectLayers'
import { generateMeshBVH } from '../functions/bvhWorkerPool'
import { addError, clearErrors, removeError } from '../functions/ErrorFunctions'
import { parseGLTFModel } from '../functions/loadGLTFModel'
import { enableObjectLayer } from '../functions/setObjectLayers'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'
import { MediaComponent } from './MediaComponent'
import { SceneAssetPendingTagComponent } from './SceneAssetPendingTagComponent'

export const ModelComponent = defineComponent({
  name: 'EE_model',

  onInit: (entity) => {
    return {
      src: '',
      generateBVH: false,
      matrixAutoUpdate: true,
      scene: undefined as undefined | Scene
    }
  },

  toJSON: (entity, component) => {
    return {
      src: component.src.value,
      generateBVH: component.generateBVH.value,
      matrixAutoUpdate: component.matrixAutoUpdate.value
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

  errors: ['LOADING_ERROR'],

  reactor: ModelReactor
})

function ModelReactor({ root }: EntityReactorProps) {
  const entity = root.entity
  const modelComponent = useOptionalComponent(entity, ModelComponent)

  // update src
  useEffect(() => {
    if (!modelComponent) return
    const model = modelComponent.value
    if (model.src === model.scene?.userData?.src) return

    const loadModel = async () => {
      try {
        if (model.scene && model.scene.userData.src !== model.src) {
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

        if (!entityExists(Engine.instance.currentWorld, entity)) return

        removeError(entity, ModelComponent, 'LOADING_ERROR')
        scene.userData.src = model.src
        modelComponent.scene.set(scene)
        addObjectToGroup(entity, scene)
        setBoundingBoxComponent(entity)
        parseGLTFModel(entity)

        if (model.generateBVH) {
          scene.traverse(generateMeshBVH)
        }
      } catch (err) {
        addError(entity, ModelComponent, 'LOADING_ERROR', err.message)
      }
    }

    loadModel()
  }, [modelComponent?.src])

  // update scene
  useEffect(() => {
    if (!modelComponent) return
    const scene = modelComponent.scene.value
    if (!scene) return

    addObjectToGroup(entity, scene)
    enableObjectLayer(scene, ObjectLayers.Camera, modelComponent.generateBVH.value)
    removeComponent(entity, SceneAssetPendingTagComponent)

    return () => removeObjectFromGroup(entity, scene)
  }, [modelComponent?.scene])

  return null
}

export const SCENE_COMPONENT_MODEL = 'gltf-model'
