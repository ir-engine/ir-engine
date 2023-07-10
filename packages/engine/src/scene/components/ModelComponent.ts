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
import { Mesh, Scene } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { getState, none } from '@etherealengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { EngineState } from '../../ecs/classes/EngineState'
import {
  defineComponent,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { entityExists, removeEntity, useEntityContext } from '../../ecs/functions/EntityFunctions'
import { EntityTreeComponent } from '../../ecs/functions/EntityTree'
import { BoundingBoxComponent } from '../../interaction/components/BoundingBoxComponents'
import { SourceType } from '../../renderer/materials/components/MaterialSource'
import { removeMaterialSource } from '../../renderer/materials/functions/MaterialLibraryFunctions'
import { ObjectLayers } from '../constants/ObjectLayers'
import { generateMeshBVH } from '../functions/bvhWorkerPool'
import { addError, removeError } from '../functions/ErrorFunctions'
import { parseGLTFModel } from '../functions/loadGLTFModel'
import { enableObjectLayer } from '../functions/setObjectLayers'
import { addObjectToGroup, GroupComponent, removeObjectFromGroup } from './GroupComponent'
import { SceneAssetPendingTagComponent } from './SceneAssetPendingTagComponent'
import { SceneObjectComponent } from './SceneObjectComponent'
import { UUIDComponent } from './UUIDComponent'

export const ModelComponent = defineComponent({
  name: 'EE_model',
  jsonID: 'gltf-model',

  onInit: (entity) => {
    return {
      src: '',
      generateBVH: true,
      avoidCameraOcclusion: false,
      scene: null as Scene | null
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
    if (typeof json.src === 'string' && json.src !== component.src.value) component.src.set(json.src)
    if (typeof json.generateBVH === 'boolean' && json.generateBVH !== component.generateBVH.value)
      component.generateBVH.set(json.generateBVH)

    /**
     * Add SceneAssetPendingTagComponent to tell scene loading system we should wait for this asset to load
     */
    if (!getState(EngineState).sceneLoaded && hasComponent(entity, SceneObjectComponent))
      setComponent(entity, SceneAssetPendingTagComponent)
  },

  onRemove: (entity, component) => {
    if (component.scene.value) {
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
  const model = modelComponent.value
  const source = model.src

  // update src
  useEffect(() => {
    if (source === model.scene?.userData?.src) return

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

      const uuid = getComponent(entity, UUIDComponent)
      const fileExtension = model.src.split('.').pop()?.toLowerCase()
      switch (fileExtension) {
        case 'glb':
        case 'gltf':
        case 'fbx':
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
              model.scene && removeObjectFromGroup(entity, model.scene)
              modelComponent.scene.set(loadedAsset.scene)
              if (!hasComponent(entity, SceneAssetPendingTagComponent)) return
              removeComponent(entity, SceneAssetPendingTagComponent)
            },
            (onprogress) => {
              if (!hasComponent(entity, SceneAssetPendingTagComponent)) return
              SceneAssetPendingTagComponent.loadingProgress.merge({
                [entity]: {
                  loadedAmount: onprogress.loaded,
                  totalAmount: onprogress.total
                }
              })
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
  }, [modelComponent.src])

  // update scene
  useEffect(() => {
    const scene = modelComponent.scene.get({ noproxy: true })

    if (!scene) return
    addObjectToGroup(entity, scene)

    if (groupComponent?.value?.find((group: any) => group === scene)) return
    parseGLTFModel(entity)
    // setComponent(entity, BoundingBoxComponent)

    let active = true

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
      removeObjectFromGroup(entity, scene)
      active = false
    }
  }, [modelComponent.scene, model.generateBVH])

  return null
}
