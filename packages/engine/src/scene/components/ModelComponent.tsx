/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { UUIDComponent } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  setComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { EntityUUID } from '@ir-engine/ecs/src/Entity'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { NO_PROXY, dispatchAction, getMutableState, getState, none, useHookstate } from '@ir-engine/hyperflux'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'
import { GroupComponent, addObjectToGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { proxifyParentChildRelationships } from '@ir-engine/spatial/src/renderer/functions/proxifyParentChildRelationships'
import {
  EntityTreeComponent,
  iterateEntityNode,
  removeEntityNodeRecursively
} from '@ir-engine/spatial/src/transform/components/EntityTree'
import { VRM } from '@pixiv/three-vrm'
import { useEffect } from 'react'
import { AnimationMixer, Group, Scene } from 'three'
import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { AnimationComponent } from '../../avatar/components/AnimationComponent'
import { GLTFDocumentState, GLTFSnapshotAction } from '../../gltf/GLTFDocumentState'
import { GLTFSnapshotState, GLTFSourceState } from '../../gltf/GLTFState'
import { SceneJsonType, convertSceneJSONToGLTF } from '../../gltf/convertJsonToGLTF'
import { addError, removeError } from '../functions/ErrorFunctions'
import { parseGLTFModel } from '../functions/loadGLTFModel'
import { getModelSceneID } from '../functions/loaders/ModelFunctions'
import { SourceComponent } from './SourceComponent'

/**
 * ModelComponent is an entity/object hierarchy loaded from a resource
 * @deprecated - use GLTFComponent instead
 */
export const ModelComponent = defineComponent({
  name: 'ModelComponent',
  jsonID: 'EE_model_old',

  schema: S.Object({
    src: S.String(''),
    cameraOcclusion: S.Bool(true),
    /** optional, only for bone matchable avatars */
    convertToVRM: S.Bool(false),
    scene: S.NonSerialized(S.Nullable(S.Type<Group>())),
    asset: S.NonSerialized(S.Nullable(S.Type<VRM | GLTF>())),
    dereference: S.NonSerialized(S.Bool(false))
  }),

  errors: ['LOADING_ERROR', 'INVALID_SOURCE'],

  reactor: ModelReactor
})

function ModelReactor() {
  const entity = useEntityContext()
  const modelComponent = useComponent(entity, ModelComponent)
  const gltfDocumentState = useHookstate(getMutableState(GLTFDocumentState))
  const modelSceneID = getModelSceneID(entity)

  const [gltf, error] = [null as null | GLTF, null as null | Error]

  useEffect(() => {
    const occlusion = modelComponent.cameraOcclusion.value
    if (!occlusion) ObjectLayerMaskComponent.disableLayer(entity, ObjectLayers.Camera)
    else ObjectLayerMaskComponent.enableLayer(entity, ObjectLayers.Camera)
  }, [modelComponent.cameraOcclusion])

  useEffect(() => {
    if (modelComponent.src.value) return
    addError(entity, ModelComponent, 'INVALID_SOURCE', 'No source provided')
    return () => {
      removeError(entity, ModelComponent, 'INVALID_SOURCE')
    }
  }, [modelComponent.src])

  useEffect(() => {
    if (!error) return
    console.error(error)
    addError(entity, ModelComponent, 'INVALID_SOURCE', error.message)
    return () => {
      removeError(entity, ModelComponent, 'INVALID_SOURCE')
    }
  }, [error])

  useEffect(() => {
    if (!gltf) {
      if (!hasComponent(entity, GroupComponent)) {
        const obj3d = new Group()
        obj3d.entity = entity
        addObjectToGroup(entity, obj3d)
        proxifyParentChildRelationships(obj3d)
      }
      return
    }

    if (typeof gltf !== 'object') {
      addError(entity, ModelComponent, 'INVALID_SOURCE', 'Invalid URL')
      return
    }

    // const boneMatchedAsset =
    //   gltf instanceof VRM || modelComponent.convertToVRM.value ? (autoconvertMixamoAvatar(gltf) as GLTF) : gltf

    /**if we've loaded or converted to vrm, create animation component whose mixer's root is the normalized rig */
    // if (boneMatchedAsset instanceof VRM)
    //   setComponent(entity, AnimationComponent, {
    //     mixer: new AnimationMixer(boneMatchedAsset.humanoid.normalizedHumanBonesRoot)
    //   })

    modelComponent.asset.set(gltf)
  }, [gltf])

  useEffect(() => {
    const model = modelComponent.get(NO_PROXY)!
    const asset = model.asset as GLTF | VRM | null
    if (!asset) return

    const group = getOptionalComponent(entity, GroupComponent)
    if (!group) return

    removeError(entity, ModelComponent, 'INVALID_SOURCE')
    removeError(entity, ModelComponent, 'LOADING_ERROR')
    const sceneObj = group[0] as Group

    sceneObj.userData.src = model.src
    modelComponent.scene.set(sceneObj)
  }, [modelComponent.asset])

  // update scene
  useEffect(() => {
    const { scene, asset, src } = getComponent(entity, ModelComponent)

    if (!scene || !asset) return

    /**hotfix for gltf animations being stored in the root and not scene property */
    if (!asset.scene.animations.length && !(asset instanceof VRM)) asset.scene.animations = asset.animations

    const loadedJsonHierarchy = parseGLTFModel(entity, asset.scene as Scene)
    const uuid = getModelSceneID(entity)
    const sceneJson: SceneJsonType = {
      entities: loadedJsonHierarchy,
      root: getComponent(entity, UUIDComponent),
      version: 0
    }
    const sceneGLTF = convertSceneJSONToGLTF(sceneJson)
    dispatchAction(
      GLTFSnapshotAction.createSnapshot({
        source: uuid,
        data: sceneGLTF
      })
    )
    getMutableState(GLTFSourceState)[uuid].set(entity)

    const renderer = getOptionalComponent(Engine.instance.viewerEntity, RendererComponent)

    if (renderer)
      renderer.renderer!.compileAsync(scene, getComponent(Engine.instance.viewerEntity, CameraComponent)).catch(() => {
        addError(entity, ModelComponent, 'LOADING_ERROR', 'Error compiling model')
      })

    const gltf = asset as GLTF
    if (gltf.animations?.length) scene.animations = gltf.animations
    if (scene.animations?.length) {
      setComponent(entity, AnimationComponent, {
        mixer: new AnimationMixer(scene),
        animations: scene.animations
      })
    }

    return () => {
      getMutableState(GLTFSourceState)[uuid].set(none)

      // If model hasn't been dereferenced unload and remove children
      if (getState(GLTFSnapshotState)[uuid]) {
        dispatchAction(GLTFSnapshotAction.unload({ source: uuid }))
        for (const childUUID in loadedJsonHierarchy) {
          const entity = UUIDComponent.getEntityByUUID(childUUID as EntityUUID)
          if (entity) {
            removeEntityNodeRecursively(entity)
          }
        }
      }
    }
  }, [modelComponent.scene])

  useEffect(() => {
    if (!modelComponent.scene.value) return
    if (!modelComponent.dereference.value) return
    if (!gltfDocumentState[modelSceneID].value) return
    const modelUUID = getComponent(entity, UUIDComponent)
    const sourceID = getModelSceneID(entity)
    const parentEntity = getComponent(entity, EntityTreeComponent).parentEntity
    if (!parentEntity) return
    const parentUUID = getComponent(parentEntity, UUIDComponent)
    const parentSource = getComponent(parentEntity, SourceComponent)
    iterateEntityNode(entity, (entity) => {
      setComponent(entity, SourceComponent, parentSource)
    })
    GLTFSnapshotState.injectSnapshot(modelUUID, sourceID, parentUUID, parentSource)
  }, [modelComponent.dereference, gltfDocumentState[modelSceneID]])

  return null
}
