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

import { FC, useEffect } from 'react'
import { AnimationMixer, Group, Scene } from 'three'

import { NO_PROXY, getState, useHookstate } from '@etherealengine/hyperflux'

import { QueryReactor, UUIDComponent } from '@etherealengine/ecs'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { SceneState } from '@etherealengine/engine/src/scene/SceneState'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import { RendererComponent } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import { GroupComponent, addObjectToGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@etherealengine/spatial/src/renderer/components/MeshComponent'
import {
  EntityTreeComponent,
  removeEntityNodeRecursively
} from '@etherealengine/spatial/src/transform/components/EntityTree'
import { VRM } from '@pixiv/three-vrm'
import { Not } from 'bitecs'
import React from 'react'
import { AssetType } from '../../assets/enum/AssetType'
import { useGLTF } from '../../assets/functions/resourceHooks'
import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { AnimationComponent } from '../../avatar/components/AnimationComponent'
import { autoconvertMixamoAvatar } from '../../avatar/functions/avatarFunctions'
import { addError, removeError } from '../functions/ErrorFunctions'
import { parseGLTFModel, proxifyParentChildRelationships } from '../functions/loadGLTFModel'
import { getModelSceneID, useModelSceneID } from '../functions/loaders/ModelFunctions'
import { SceneAssetPendingTagComponent } from './SceneAssetPendingTagComponent'
import { SourceComponent } from './SourceComponent'

/**
 * ModelComponent is an entity/object hierarchy loaded from a resource
 */
export const ModelComponent = defineComponent({
  name: 'ModelComponent',
  jsonID: 'EE_model',

  onInit: (entity) => {
    return {
      src: '',
      cameraOcclusion: true,
      /** optional, only for bone matchable avatars */
      convertToVRM: false,
      // internal
      assetTypeOverride: null as null | AssetType,
      scene: null as Group | null,
      asset: null as VRM | GLTF | null
    }
  },

  toJSON: (entity, component) => {
    return {
      src: component.src.value,
      cameraOcclusion: component.cameraOcclusion.value,
      convertToVRM: component.convertToVRM.value
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.src === 'string') component.src.set(json.src)
    if (typeof (json as any).avoidCameraOcclusion === 'boolean')
      component.cameraOcclusion.set(!(json as any).avoidCameraOcclusion)
    if (typeof json.cameraOcclusion === 'boolean') component.cameraOcclusion.set(json.cameraOcclusion)
    if (typeof json.convertToVRM === 'boolean') component.convertToVRM.set(json.convertToVRM)
    console.log('json', json)
    /**
     * Add SceneAssetPendingTagComponent to tell scene loading system we should wait for this asset to load
     */
    if (
      !getState(SceneState).sceneLoaded &&
      hasComponent(entity, SourceComponent) &&
      component.src.value &&
      !component.asset.value
    )
      SceneAssetPendingTagComponent.addResource(entity, ModelComponent.jsonID)
  },

  errors: ['LOADING_ERROR', 'INVALID_SOURCE'],

  reactor: ModelReactor
})

function ModelReactor(): JSX.Element {
  const entity = useEntityContext()
  const modelComponent = useComponent(entity, ModelComponent)

  console.log('ModelReactor', entity)
  const [gltf, error, progress] = useGLTF(modelComponent.src.value, entity, {
    forceAssetType: modelComponent.assetTypeOverride.value,
    ignoreDisposeGeometry: modelComponent.cameraOcclusion.value
  })

  useEffect(() => {
    if (!progress) return
    if (hasComponent(entity, SceneAssetPendingTagComponent))
      SceneAssetPendingTagComponent.loadingProgress.merge({
        [entity]: {
          loadedAmount: progress.loaded,
          totalAmount: progress.total
        }
      })
  }, [progress])

  useEffect(() => {
    if (!error) return

    console.error(error)
    addError(entity, ModelComponent, 'INVALID_SOURCE', error.message)
    SceneAssetPendingTagComponent.removeResource(entity, ModelComponent.jsonID)
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

    const boneMatchedAsset =
      gltf instanceof VRM || modelComponent.convertToVRM.value ? (autoconvertMixamoAvatar(gltf) as GLTF) : gltf

    /**if we've loaded or converted to vrm, create animation component whose mixer's root is the normalized rig */
    if (boneMatchedAsset instanceof VRM)
      setComponent(entity, AnimationComponent, {
        animations: gltf.animations,
        mixer: new AnimationMixer(boneMatchedAsset.humanoid.normalizedHumanBonesRoot)
      })

    modelComponent.asset.set(boneMatchedAsset)
  }, [gltf])

  useEffect(() => {
    const model = modelComponent.get(NO_PROXY)!
    const asset = model.asset as GLTF | null
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

    SceneState.loadScene(uuid, {
      scene: {
        entities: loadedJsonHierarchy,
        root: getComponent(entity, UUIDComponent),
        version: 0
      },
      name: '',
      project: '',
      thumbnailUrl: ''
    })

    const renderer = getOptionalComponent(Engine.instance.viewerEntity, RendererComponent)

    if (renderer)
      renderer.renderer
        .compileAsync(scene, getComponent(Engine.instance.viewerEntity, CameraComponent))
        .catch(() => {
          addError(entity, ModelComponent, 'LOADING_ERROR', 'Error compiling model')
        })
        .finally(() => {
          SceneAssetPendingTagComponent.removeResource(entity, ModelComponent.jsonID)
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
      SceneState.unloadScene(uuid, false)
      const children = getComponent(entity, EntityTreeComponent).children
      for (const child of children) {
        removeEntityNodeRecursively(child)
      }
    }
  }, [modelComponent.scene])

  const sceneInstanceID = useModelSceneID(entity)
  const childEntities = useHookstate(SourceComponent.entitiesBySourceState[sceneInstanceID])

  return (
    <>
      {childEntities.value?.map((childEntity: Entity) => (
        <ChildReactor key={childEntity} entity={childEntity} parentEntity={entity} />
      ))}
    </>
  )
}

const ChildReactor = (props: { entity: Entity; parentEntity: Entity }) => {
  useEffect(() => {
    SceneAssetPendingTagComponent.removeResource(props.entity, `${props.parentEntity}`)
    SceneAssetPendingTagComponent.removeResource(props.parentEntity, ModelComponent.jsonID)
  }, [])
  return null
}

/**
 * Returns true if the entity is a mesh not a part of a model, or a model
 * @param entity
 * @returns
 */
export const useMeshOrModel = (entity: Entity) => {
  const meshComponent = useOptionalComponent(entity, MeshComponent)
  const modelComponent = useOptionalComponent(entity, ModelComponent)
  const sourceComponent = useOptionalComponent(entity, SourceComponent)
  const isEntityHierarchyOrMesh = (!sourceComponent && !!meshComponent) || !!modelComponent
  return isEntityHierarchyOrMesh
}

export const MeshOrModelQuery = (props: { ChildReactor: FC<{ entity: Entity; rootEntity: Entity }> }) => {
  const ModelReactor = () => {
    const entity = useEntityContext()
    const sceneInstanceID = useModelSceneID(entity)
    const childEntities = useHookstate(SourceComponent.entitiesBySourceState[sceneInstanceID])
    return (
      <>
        {childEntities.value?.map((childEntity) => (
          <props.ChildReactor entity={childEntity} rootEntity={entity} key={childEntity} />
        ))}
      </>
    )
  }

  const MeshReactor = () => {
    const entity = useEntityContext()
    return <props.ChildReactor entity={entity} rootEntity={entity} key={entity} />
  }

  return (
    <>
      <QueryReactor Components={[ModelComponent]} ChildEntityReactor={ModelReactor} />
      <QueryReactor Components={[Not(SourceComponent), MeshComponent]} ChildEntityReactor={MeshReactor} />
    </>
  )
}
