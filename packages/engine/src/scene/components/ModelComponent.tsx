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
import { AnimationMixer, BoxGeometry, CapsuleGeometry, CylinderGeometry, Group, Scene, SphereGeometry } from 'three'

import { NO_PROXY, createState, getMutableState, getState, none, useHookstate } from '@etherealengine/hyperflux'

import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  serializeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { useQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { SceneState } from '@etherealengine/engine/src/scene/Scene'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import { UUIDComponent } from '@etherealengine/spatial/src/common/UUIDComponent'
import { ColliderComponent } from '@etherealengine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@etherealengine/spatial/src/physics/components/RigidBodyComponent'
import { Shape } from '@etherealengine/spatial/src/physics/types/PhysicsTypes'
import { EngineRenderer } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import { GroupComponent, addObjectToGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@etherealengine/spatial/src/renderer/components/MeshComponent'
import { VRM } from '@pixiv/three-vrm'
import React from 'react'
import { AssetType } from '../../assets/enum/AssetType'
import { useGLTF } from '../../assets/functions/resourceHooks'
import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { AnimationComponent } from '../../avatar/components/AnimationComponent'
import { AvatarRigComponent } from '../../avatar/components/AvatarAnimationComponent'
import { autoconvertMixamoAvatar, isAvaturn } from '../../avatar/functions/avatarFunctions'
import { addError, removeError } from '../functions/ErrorFunctions'
import { parseGLTFModel, proxifyParentChildRelationships } from '../functions/loadGLTFModel'
import { getModelSceneID } from '../functions/loaders/ModelFunctions'
import { EnvmapComponent } from './EnvmapComponent'
import { ObjectGridSnapComponent } from './ObjectGridSnapComponent'
import { SceneAssetPendingTagComponent } from './SceneAssetPendingTagComponent'
import { SceneObjectComponent } from './SceneObjectComponent'
import { ShadowComponent } from './ShadowComponent'
import { SourceComponent } from './SourceComponent'

const entitiesInModelHierarchy = {} as Record<Entity, Entity[]>

export const ModelComponent = defineComponent({
  name: 'Model Component',
  jsonID: 'gltf-model',

  onInit: (entity) => {
    return {
      src: '',
      cameraOcclusion: true,
      /** optional, only for bone matchable avatars */
      convertToVRM: false as boolean,
      // internal
      scene: null as Scene | null,
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

    /**
     * Add SceneAssetPendingTagComponent to tell scene loading system we should wait for this asset to load
     */
    if (
      !getState(SceneState).sceneLoaded &&
      hasComponent(entity, SceneObjectComponent) &&
      component.src.value &&
      !component.scene.value
    )
      SceneAssetPendingTagComponent.addResource(entity, component.src.value)
  },

  errors: ['LOADING_ERROR', 'INVALID_SOURCE'],

  reactor: ModelReactor,

  /** Tracks all child entities loaded by this model */
  entitiesInModelHierarchyState: createState(entitiesInModelHierarchy),
  entitiesInModelHierarchy: entitiesInModelHierarchy as Readonly<typeof entitiesInModelHierarchy>
})

function ModelReactor(): JSX.Element {
  const entity = useEntityContext()
  const modelComponent = useComponent(entity, ModelComponent)

  /** @todo this is a hack */
  const override = !isAvaturn(modelComponent.src.value) ? undefined : AssetType.glB
  const [gltf, unload, error, progress] = useGLTF(modelComponent.src.value, entity, {
    forceAssetType: override,
    ignoreDisposeGeometry: modelComponent.cameraOcclusion.value
  })

  useEffect(() => {
    /* unload should only be called when the component is unmounted
      the useGLTF hook will handle unloading if the model source is changed ie. the user changes their avatar model */
    return unload
  }, [])

  useEffect(() => {
    const onprogress = progress.value
    if (!onprogress) return
    if (hasComponent(entity, SceneAssetPendingTagComponent))
      SceneAssetPendingTagComponent.loadingProgress.merge({
        [entity]: {
          loadedAmount: onprogress.loaded,
          totalAmount: onprogress.total
        }
      })
  }, [progress])

  useEffect(() => {
    const err = error.value
    if (!err) return

    console.error(err)
    addError(entity, ModelComponent, 'INVALID_SOURCE', err.message)
    SceneAssetPendingTagComponent.removeResource(entity, modelComponent.src.value)
  }, [error])

  useEffect(() => {
    const loadedAsset = gltf.get(NO_PROXY)
    if (!loadedAsset) return

    if (typeof loadedAsset !== 'object') {
      addError(entity, ModelComponent, 'INVALID_SOURCE', 'Invalid URL')
      return
    }

    const boneMatchedAsset = modelComponent.convertToVRM.value
      ? (autoconvertMixamoAvatar(loadedAsset) as GLTF)
      : loadedAsset

    /**if we've loaded or converted to vrm, create animation component whose mixer's root is the normalized rig */
    if (boneMatchedAsset instanceof VRM)
      setComponent(entity, AnimationComponent, {
        animations: loadedAsset.animations,
        mixer: new AnimationMixer(boneMatchedAsset.humanoid.normalizedHumanBonesRoot)
      })

    if (!hasComponent(entity, GroupComponent)) {
      const obj3d = new Group()
      obj3d.entity = entity
      addObjectToGroup(entity, obj3d)
      proxifyParentChildRelationships(obj3d)
    }

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
    const sceneObj = group[0] as Scene

    sceneObj.userData.src = model.src
    sceneObj.userData.sceneID = getModelSceneID(entity)
    //sceneObj.userData.type === 'glb' && delete asset.scene.userData.type
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
      scenePath: uuid,
      name: '',
      project: '',
      thumbnailUrl: ''
    })

    if (!hasComponent(entity, AvatarRigComponent)) {
      //if this is not an avatar, add bbox snap
      setComponent(entity, ObjectGridSnapComponent)
    }

    if (EngineRenderer.instance)
      EngineRenderer.instance.renderer
        .compileAsync(scene, getComponent(Engine.instance.cameraEntity, CameraComponent), Engine.instance.scene)
        .catch(() => {
          addError(entity, ModelComponent, 'LOADING_ERROR', 'Error compiling model')
        })
        .finally(() => {
          SceneAssetPendingTagComponent.removeResource(entity, src)
        })

    return () => {
      getMutableState(SceneState).scenes[uuid].set(none)
    }
  }, [modelComponent.scene])

  const childQuery = useQuery([SourceComponent])
  useEffect(() => {
    const modelSceneID = getModelSceneID(entity)
    ModelComponent.entitiesInModelHierarchyState[entity].set(
      childQuery.filter((e) => getComponent(e, SourceComponent) === modelSceneID)
    )
  }, [JSON.stringify(childQuery)])

  const childEntities = useHookstate(ModelComponent.entitiesInModelHierarchyState[entity])

  return (
    <>
      {childEntities.value?.map((childEntity: Entity) => (
        <ChildReactor key={childEntity} entity={childEntity} parentEntity={entity} />
      ))}
    </>
  )
}

const ChildReactor = (props: { entity: Entity; parentEntity: Entity }) => {
  const modelComponent = useComponent(props.parentEntity, ModelComponent)
  const isMesh = useOptionalComponent(props.entity, MeshComponent)
  const isModelColliders = useOptionalComponent(props.parentEntity, RigidBodyComponent)

  useEffect(() => {
    SceneAssetPendingTagComponent.removeResource(props.entity, `${props.parentEntity}`)
    SceneAssetPendingTagComponent.removeResource(props.parentEntity, modelComponent.src.value)
  }, [])

  const shadowComponent = useOptionalComponent(props.parentEntity, ShadowComponent)
  useEffect(() => {
    if (!isMesh) return
    if (shadowComponent)
      setComponent(props.entity, ShadowComponent, serializeComponent(props.parentEntity, ShadowComponent))
    else removeComponent(props.entity, ShadowComponent)
  }, [isMesh, shadowComponent?.cast, shadowComponent?.receive])

  const envmapComponent = useOptionalComponent(props.parentEntity, EnvmapComponent)
  useEffect(() => {
    if (!isMesh) return
    if (envmapComponent)
      setComponent(props.entity, EnvmapComponent, serializeComponent(props.parentEntity, EnvmapComponent))
    else removeComponent(props.entity, EnvmapComponent)
  }, [
    isMesh,
    envmapComponent,
    envmapComponent?.envMapIntensity,
    envmapComponent?.envmap,
    envmapComponent?.envMapSourceColor,
    envmapComponent?.envMapSourceURL,
    envmapComponent?.envMapTextureType,
    envmapComponent?.envMapSourceEntityUUID
  ])

  useEffect(() => {
    if (!isModelColliders || !isMesh) return

    const geometry = getComponent(props.entity, MeshComponent).geometry

    const shape = ThreeToPhysics[geometry.type]

    if (!shape) return

    setComponent(props.entity, ColliderComponent, { shape })

    return () => {
      removeComponent(props.entity, ColliderComponent)
    }
  }, [isModelColliders, isMesh])

  return null
}

/** Maps Three.js geometry types to physics shapes */
const ThreeToPhysics = {
  [SphereGeometry.prototype.type]: 'sphere',
  [CapsuleGeometry.prototype.type]: 'capsule',
  [CylinderGeometry.prototype.type]: 'cylinder',
  [BoxGeometry.prototype.type]: 'box'
} as Record<string, Shape>

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

export const useContainsMesh = (entity: Entity) => {
  const meshComponent = useOptionalComponent(entity, MeshComponent)
  const childEntities = useHookstate(ModelComponent.entitiesInModelHierarchyState[entity])
  return !!meshComponent || !!childEntities.value?.find((e: Entity) => getComponent(e, MeshComponent))
}
