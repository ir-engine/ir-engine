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
import { Mesh, Scene, SkinnedMesh } from 'three'

import { getState } from '@etherealengine/hyperflux'

import { VRM } from '@pixiv/three-vrm'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { LoopAnimationComponent } from '../../avatar/components/LoopAnimationComponent'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { SceneState } from '../../ecs/classes/Scene'
import {
  ComponentType,
  componentJsonDefaults,
  defineComponent,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { entityExists, useEntityContext } from '../../ecs/functions/EntityFunctions'
import { BoundingBoxComponent } from '../../interaction/components/BoundingBoxComponents'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { SourceType } from '../../renderer/materials/components/MaterialSource'
import { removeMaterialSource } from '../../renderer/materials/functions/MaterialLibraryFunctions'
import { FrustumCullCameraComponent } from '../../transform/components/DistanceComponents'
import { ObjectLayers } from '../constants/ObjectLayers'
import { addError, removeError } from '../functions/ErrorFunctions'
import { generateMeshBVH } from '../functions/bvhWorkerPool'
import { parseGLTFModel } from '../functions/loadGLTFModel'
import { enableObjectLayer } from '../functions/setObjectLayers'
import iterateObject3D from '../util/iterateObject3D'
import { GroupComponent, addObjectToGroup, removeObjectFromGroup } from './GroupComponent'
import { SceneAssetPendingTagComponent } from './SceneAssetPendingTagComponent'
import { SceneObjectComponent } from './SceneObjectComponent'
import { ShadowComponent } from './ShadowComponent'
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
  name: 'EE_model',
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
    const entityUUID = getComponent(entity, UUIDComponent)
    if (!SceneState.entityHasComponent(entityUUID, LoopAnimationComponent)) {
      SceneState.addComponentsToEntity(entityUUID, [
        {
          name: LoopAnimationComponent.jsonID!,
          props: componentJsonDefaults(LoopAnimationComponent)
        }
      ])
    }

    if (!SceneState.entityHasComponent(entityUUID, ShadowComponent)) {
      SceneState.addComponentsToEntity(entityUUID, [
        {
          name: ShadowComponent.jsonID!,
          props: componentJsonDefaults(ShadowComponent)
        }
      ])
    }

    if (!json) return
    if (typeof json.src === 'string') component.src.set(json.src)
    if (typeof json.generateBVH === 'boolean') component.generateBVH.set(json.generateBVH)
    if (typeof json.avoidCameraOcclusion === 'boolean') component.avoidCameraOcclusion.set(json.avoidCameraOcclusion)

    /**
     * Add SceneAssetPendingTagComponent to tell scene loading system we should wait for this asset to load
     */
    if (!getState(EngineState).sceneLoaded && hasComponent(entity, SceneObjectComponent))
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
  const groupComponent = useOptionalComponent(entity, GroupComponent)
  const variantComponent = useOptionalComponent(entity, VariantComponent)
  const model = modelComponent.value
  const source = model.src

  // update src
  useEffect(() => {
    if (source === model.scene?.userData?.src) return
    try {
      if (model.scene) {
        clearMaterials(model)
      }
      if (!model.src) return
      const uuid = getComponent(entity, UUIDComponent)
      const fileExtension = model.src.split('.').pop()?.toLowerCase()
      //wait for variant component to calculate if present
      if (variantComponent && variantComponent.calculated.value === false) return
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
              // const modelEntities = iterateEntityNode(
              //   entity,
              //   (child) => child,
              //   (child) => child !== entity && hasComponent(child, GLTFLoadedComponent)
              // )
              // for (const modelEntity of modelEntities) {
              //   removeEntity(modelEntity)
              // }
              modelComponent.asset.set(loadedAsset)
              if (fileExtension == 'vrm') (model.asset as any).userData = { flipped: true }
              model.scene && removeObjectFromGroup(entity, model.scene)
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
        .then(() => {
          if (hasComponent(entity, SceneAssetPendingTagComponent))
            removeComponent(entity, SceneAssetPendingTagComponent)
        })
    else if (hasComponent(entity, SceneAssetPendingTagComponent)) removeComponent(entity, SceneAssetPendingTagComponent)

    if (groupComponent?.value?.find((group: any) => group === scene)) return

    const childSpawnedEntities = parseGLTFModel(entity)
    setComponent(entity, BoundingBoxComponent)
  }, [modelComponent.scene])

  // update scene
  useEffect(() => {
    const scene = getComponent(entity, ModelComponent).scene
    if (!scene) return

    let active = true

    const skinnedMeshSearch = iterateObject3D(
      scene,
      (skinnedMesh) => skinnedMesh,
      (ob: SkinnedMesh) => ob.isSkinnedMesh
    )

    if (skinnedMeshSearch[0]) {
      modelComponent.hasSkinnedMesh.set(true)
      modelComponent.generateBVH.set(false)
      for (const skinnedMesh of skinnedMeshSearch) {
        skinnedMesh.frustumCulled = false
      }
      setComponent(entity, FrustumCullCameraComponent)
    }

    if (model.generateBVH) {
      enableObjectLayer(scene, ObjectLayers.Camera, false)
      const bvhDone = [] as Promise<void>[]
      scene.traverse((obj: Mesh) => {
        bvhDone.push(generateMeshBVH(obj))
      })
      // trigger group state invalidation when bvh is done
      Promise.all(bvhDone).then(() => {
        if (!active) return
        const group = getMutableComponent(entity, GroupComponent)
        if (group) group.set([...group.value])
        enableObjectLayer(scene, ObjectLayers.Camera, !model.avoidCameraOcclusion && model.generateBVH)
      })
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
