/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { useEffect } from 'react'
import { Object3D, Scene } from 'three'

import { NO_PROXY, getMutableState, getState, none } from '@etherealengine/hyperflux'

import { VRM } from '@pixiv/three-vrm'
import { Not } from 'bitecs'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { SkinnedMeshComponent } from '../../avatar/components/SkinnedMeshComponent'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { SceneState } from '../../ecs/classes/Scene'
import {
  defineComponent,
  getComponent,
  hasComponent,
  removeComponent,
  serializeComponent,
  setComponent,
  useComponent,
  useOptionalComponent,
  useQuery
} from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { SourceType } from '../../renderer/materials/components/MaterialSource'
import { removeMaterialSource } from '../../renderer/materials/functions/MaterialLibraryFunctions'
import { FrustumCullCameraComponent } from '../../transform/components/DistanceComponents'
import { addError, removeError } from '../functions/ErrorFunctions'
import { generateMeshBVH } from '../functions/bvhWorkerPool'
import { parseGLTFModel } from '../functions/loadGLTFModel'
import { getModelSceneID } from '../functions/loaders/ModelFunctions'
import { EnvmapComponent } from './EnvmapComponent'
import { MeshComponent } from './MeshComponent'
import { SceneAssetPendingTagComponent } from './SceneAssetPendingTagComponent'
import { SceneObjectComponent } from './SceneObjectComponent'
import { ShadowComponent } from './ShadowComponent'
import { SourceComponent } from './SourceComponent'
import { UUIDComponent } from './UUIDComponent'

function clearMaterials(src: string) {
  try {
    removeMaterialSource({ type: SourceType.MODEL, path: src ?? '' })
  } catch (e) {
    if (e?.name === 'MaterialNotFound') {
      console.warn('could not find material in source ' + src)
    } else {
      throw e
    }
  }
}

export const ModelComponent = defineComponent({
  name: 'Model Component',
  jsonID: 'gltf-model',

  onInit: (entity) => {
    return {
      src: '',
      generateBVH: true,
      avoidCameraOcclusion: false,
      // internal
      scene: null as Scene | null,
      asset: null as VRM | GLTF | null,
      hasSkinnedMesh: false
    }
  },

  toJSON: (entity, component) => {
    return {
      src: component.src.value,
      generateBVH: component.generateBVH.value,
      avoidCameraOcclusion: component.avoidCameraOcclusion.value
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.src === 'string') component.src.set(json.src)
    if (typeof json.generateBVH === 'boolean') component.generateBVH.set(json.generateBVH)
    if (typeof json.avoidCameraOcclusion === 'boolean') component.avoidCameraOcclusion.set(json.avoidCameraOcclusion)

    /**
     * Add SceneAssetPendingTagComponent to tell scene loading system we should wait for this asset to load
     */
    if (
      !getState(EngineState).sceneLoaded &&
      hasComponent(entity, SceneObjectComponent) &&
      component.src.value &&
      !component.scene.value
    )
      setComponent(entity, SceneAssetPendingTagComponent)
  },

  errors: ['LOADING_ERROR', 'INVALID_SOURCE'],

  reactor: ModelReactor
})

function ModelReactor() {
  const entity = useEntityContext()
  const modelComponent = useComponent(entity, ModelComponent)
  const uuid = useComponent(entity, UUIDComponent)

  useEffect(() => {
    let aborted = false

    const model = modelComponent.value
    if (!model.src) {
      const dudScene = new Scene() as Scene & Object3D
      dudScene.entity = entity
      Object.assign(dudScene, {
        isProxified: true
      })
      modelComponent.scene.set(dudScene)
      modelComponent.asset.set(null)
      return
    }

    AssetLoader.load(
      modelComponent.src.value,
      {
        ignoreDisposeGeometry: modelComponent.generateBVH.value,
        uuid: uuid.value
      },
      (loadedAsset) => {
        if (aborted) return
        if (typeof loadedAsset !== 'object') {
          addError(entity, ModelComponent, 'INVALID_SOURCE', 'Invalid URL')
          return
        }
        modelComponent.asset.set(loadedAsset)
      },
      (onprogress) => {
        if (aborted) return
        SceneAssetPendingTagComponent.loadingProgress.merge({
          [entity]: {
            loadedAmount: onprogress.loaded,
            totalAmount: onprogress.total
          }
        })
      },
      (err: Error) => {
        if (aborted) return
        console.error(err)
        addError(entity, ModelComponent, 'INVALID_SOURCE', err.message)
        removeComponent(entity, SceneAssetPendingTagComponent)
      }
    )
    return () => {
      aborted = true
    }
  }, [modelComponent.src])

  useEffect(() => {
    const model = modelComponent.get(NO_PROXY)!
    const asset = model.asset as GLTF | null
    if (!asset) return
    removeError(entity, ModelComponent, 'INVALID_SOURCE')
    removeError(entity, ModelComponent, 'LOADING_ERROR')
    const fileExtension = model.src.split('.').pop()?.toLowerCase()
    asset.scene.animations = asset.animations
    asset.scene.userData.src = model.src
    asset.scene.userData.sceneID = getModelSceneID(entity)
    asset.scene.userData.type === 'glb' && delete asset.scene.userData.type
    if (asset instanceof VRM) asset.humanoid.autoUpdateHumanBones = false
    if (fileExtension == 'vrm') (model.asset as any).userData = { flipped: true }
    modelComponent.scene.set(asset.scene as any)
  }, [modelComponent.asset])

  // update scene
  useEffect(() => {
    const scene = getComponent(entity, ModelComponent).scene
    if (!scene) return

    if (EngineRenderer.instance)
      EngineRenderer.instance.renderer
        .compileAsync(scene, getComponent(Engine.instance.cameraEntity, CameraComponent), Engine.instance.scene)
        .catch(() => {
          addError(entity, ModelComponent, 'LOADING_ERROR', 'Error compiling model')
        })
        .finally(() => {
          removeComponent(entity, SceneAssetPendingTagComponent)
        })
    else removeComponent(entity, SceneAssetPendingTagComponent)

    const loadedJsonHierarchy = parseGLTFModel(entity)
    const uuid = getModelSceneID(entity)
    SceneState.loadScene(uuid, {
      scene: {
        entities: loadedJsonHierarchy,
        root: getComponent(entity, UUIDComponent),
        version: 0
      },
      scenePath: uuid,
      name: '',
      project: '',
      thumbnailUrl: ''
    })
    const src = modelComponent.src.value
    return () => {
      clearMaterials(src)
      getMutableState(SceneState).scenes[uuid].set(none)
    }
  }, [modelComponent.scene])

  const childNonSkinnedMeshQuery = useQuery([SourceComponent, MeshComponent, Not(SkinnedMeshComponent)])
  useEffect(() => {
    const modelSceneID = getModelSceneID(entity)
    for (const childEntity of childNonSkinnedMeshQuery) {
      if (getComponent(childEntity, SourceComponent) !== modelSceneID) continue
      if (modelComponent.generateBVH.value) generateMeshBVH(getComponent(childEntity, MeshComponent))
    }
  }, [childNonSkinnedMeshQuery, modelComponent.generateBVH])

  const childMeshQuery = useQuery([SourceComponent, MeshComponent])
  const shadowComponent = useOptionalComponent(entity, ShadowComponent)
  useEffect(() => {
    const modelSceneID = getModelSceneID(entity)
    for (const childEntity of childMeshQuery) {
      if (getComponent(childEntity, SourceComponent) !== modelSceneID) continue
      if (shadowComponent) setComponent(childEntity, ShadowComponent, serializeComponent(entity, ShadowComponent))
      else removeComponent(childEntity, ShadowComponent)
    }
  }, [childMeshQuery, shadowComponent])

  const envmapComponent = useOptionalComponent(entity, EnvmapComponent)
  useEffect(() => {
    const modelSceneID = getModelSceneID(entity)
    for (const childEntity of childMeshQuery) {
      if (getComponent(childEntity, SourceComponent) !== modelSceneID) continue
      if (envmapComponent) setComponent(childEntity, EnvmapComponent, serializeComponent(entity, EnvmapComponent))
      else removeComponent(childEntity, EnvmapComponent)
    }
  }, [childMeshQuery, envmapComponent])

  useEffect(() => {
    if (!modelComponent.scene.value) return
    if (modelComponent.avoidCameraOcclusion.value) removeComponent(entity, FrustumCullCameraComponent)
    else setComponent(entity, FrustumCullCameraComponent)
  }, [modelComponent.avoidCameraOcclusion, modelComponent.scene])

  return null
}
