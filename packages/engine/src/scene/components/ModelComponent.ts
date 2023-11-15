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
import { Scene, SkinnedMesh } from 'three'

import { getMutableState, getState, none } from '@etherealengine/hyperflux'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { VRM } from '@pixiv/three-vrm'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { SceneState } from '../../ecs/classes/Scene'
import {
  ComponentType,
  defineComponent,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { entityExists, useEntityContext } from '../../ecs/functions/EntityFunctions'
import { iterateEntityNode } from '../../ecs/functions/EntityTree'
import { BoundingBoxComponent } from '../../interaction/components/BoundingBoxComponents'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { SourceType } from '../../renderer/materials/components/MaterialSource'
import { removeMaterialSource } from '../../renderer/materials/functions/MaterialLibraryFunctions'
import { SceneID } from '../../schemas/projects/scene.schema'
import { FrustumCullCameraComponent } from '../../transform/components/DistanceComponents'
import { addError, removeError } from '../functions/ErrorFunctions'
import { parseGLTFModel } from '../functions/loadGLTFModel'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'
import { MeshComponent } from './MeshComponent'
import { SceneAssetPendingTagComponent } from './SceneAssetPendingTagComponent'
import { SceneObjectComponent } from './SceneObjectComponent'
import { UUIDComponent } from './UUIDComponent'
import { VariantComponent } from './VariantComponent'

export type SceneWithEntity = Scene & { entity: Entity }

function clearMaterials(model: ComponentType<typeof ModelComponent>) {
  if (!model.scene) return
  try {
    removeMaterialSource({ type: SourceType.MODEL, path: model.scene.userData.src ?? '' })
  } catch (e) {
    if (e?.name === 'MaterialNotFound') {
      console.warn('could not find material in source ' + model.scene.userData.src)
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
      scene: null as SceneWithEntity | null,
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
    if (!getState(EngineState).sceneLoaded && hasComponent(entity, SceneObjectComponent) && !component.scene.value)
      setComponent(entity, SceneAssetPendingTagComponent)
  },

  onRemove: (entity, component) => {
    if (component.scene.value) {
      if (component.src.value) {
        clearMaterials(component.value)
      }
      removeObjectFromGroup(entity, component.scene.value)
      component.scene.set(null)
    }
  },

  errors: ['LOADING_ERROR', 'INVALID_URL'],

  reactor: ModelReactor
})

function ModelReactor() {
  const entity = useEntityContext()
  const modelComponent = useComponent(entity, ModelComponent)
  const variantComponent = useOptionalComponent(entity, VariantComponent)
  const model = modelComponent.value
  const source = model.src

  // update src
  useEffect(() => {
    if (source === model.scene?.userData?.src) return
    if (variantComponent && !variantComponent.calculated) return
    try {
      if (model.scene) {
        clearMaterials(model)
      }
      if (!model.src) return
      const uuid = getComponent(entity, UUIDComponent)
      const fileExtension = model.src.split('.').pop()?.toLowerCase()
      switch (fileExtension) {
        case 'glb':
        case 'gltf':
        case 'fbx':
        case 'vrm':
        case 'usdz':
          AssetLoader.load(
            model.src,
            {
              ignoreDisposeGeometry: model.generateBVH,
              uuid
            },
            (loadedAsset) => {
              loadedAsset.scene.animations = loadedAsset.animations
              if (!entityExists(entity)) return
              removeError(entity, ModelComponent, 'LOADING_ERROR')
              loadedAsset.scene.userData.src = model.src
              loadedAsset.scene.userData.type === 'glb' && delete loadedAsset.scene.userData.type
              modelComponent.asset.set(loadedAsset)
              if (fileExtension == 'vrm') (model.asset as any).userData = { flipped: true }
              modelComponent.scene.set(loadedAsset.scene)
            },
            (onprogress) => {
              if (!hasComponent(entity, SceneAssetPendingTagComponent)) return
              SceneAssetPendingTagComponent.loadingProgress.merge({
                [entity]: {
                  loadedAmount: onprogress.loaded,
                  totalAmount: onprogress.total
                }
              })
            },
            (err) => {
              console.error(err)
              removeComponent(entity, SceneAssetPendingTagComponent)
            }
          )
          break
        default:
          throw new Error(`Model type '${fileExtension}' not supported`)
      }
    } catch (err) {
      console.error(err)
      addError(entity, ModelComponent, 'LOADING_ERROR', err.message)
    }
  }, [modelComponent.src, variantComponent?.calculated])

  // update scene
  useEffect(() => {
    const scene = getComponent(entity, ModelComponent).scene

    if (!scene) return
    addObjectToGroup(entity, scene)

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

    setComponent(entity, BoundingBoxComponent)

    const loadedJsonHierarchy = parseGLTFModel(entity)
    const uuid = (getComponent(entity, UUIDComponent) + '-' + getComponent(entity, ModelComponent).src) as SceneID
    getMutableState(SceneState).scenes[uuid].set({
      snapshots: [
        {
          data: {
            scene: { entities: loadedJsonHierarchy, root: '' as EntityUUID, version: 0 },
            name: '',
            project: '',
            thumbnailUrl: ''
          },
          selectedEntities: []
        }
      ],
      index: 0
    })
    return () => {
      getMutableState(SceneState).scenes[uuid].set(none)
    }
  }, [modelComponent.scene])

  // update scene
  useEffect(() => {
    const scene = getComponent(entity, ModelComponent).scene
    if (!scene) return

    let active = true

    // check for skinned meshes, and turn off frustum culling for them
    const skinnedMeshSearch = iterateEntityNode(
      scene.entity,
      (childEntity) => getComponent(childEntity, MeshComponent),
      (childEntity) =>
        hasComponent(childEntity, MeshComponent) &&
        (getComponent(childEntity, MeshComponent) as SkinnedMesh).isSkinnedMesh
    )

    if (skinnedMeshSearch[0]) {
      modelComponent.hasSkinnedMesh.set(true)
      modelComponent.generateBVH.set(false)
      for (const skinnedMesh of skinnedMeshSearch) {
        skinnedMesh.frustumCulled = false
      }
      setComponent(entity, FrustumCullCameraComponent)
    }

    return () => {
      active = false
    }
  }, [modelComponent.scene, model.generateBVH])

  useEffect(() => {
    if (!modelComponent.scene.value) return
    if (modelComponent.avoidCameraOcclusion.value) removeComponent(entity, FrustumCullCameraComponent)
    else setComponent(entity, FrustumCullCameraComponent)
  }, [modelComponent.avoidCameraOcclusion, modelComponent.scene])

  return null
}
