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

import { VRM, VRMHumanBone } from '@pixiv/three-vrm'
import { cloneDeep } from 'lodash'
import { AnimationClip, Bone, Box3, Group, Object3D, ShaderMaterial, Skeleton, SkinnedMesh, Vector3 } from 'three'

import { getMutableState, getState } from '@etherealengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { isClient } from '../../common/functions/getEnvironment'
import { iOS } from '../../common/functions/isMobile'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import {
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { addObjectToGroup, removeObjectFromGroup } from '../../scene/components/GroupComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import iterateObject3D from '../../scene/util/iterateObject3D'
import { computeTransformMatrix } from '../../transform/systems/TransformSystem'
import { XRState } from '../../xr/XRState'
import { AnimationState } from '../AnimationManager'
// import { retargetSkeleton, syncModelSkeletons } from '../animation/retargetSkeleton'
import config from '@etherealengine/common/src/config'
import { AssetType } from '../../assets/enum/AssetType'
import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { Engine } from '../../ecs/classes/Engine'
import avatarBoneMatching, { findSkinnedMeshes, getAllBones, recursiveHipsLookup } from '../AvatarBoneMatching'
import { getRootSpeed } from '../animation/AvatarAnimationGraph'
import { emoteAnimations, locomotionAnimation } from '../animation/Util'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarAnimationComponent, AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { AvatarDissolveComponent } from '../components/AvatarDissolveComponent'
import { AvatarEffectComponent, MaterialMap } from '../components/AvatarEffectComponent'
import { AvatarPendingComponent } from '../components/AvatarPendingComponent'
import { AvatarMovementSettingsState } from '../state/AvatarMovementSettingsState'
import { resizeAvatar } from './resizeAvatar'
import { retargetMixamoAnimation } from './retargetMixamoRig'

const tempVec3ForHeight = new Vector3()
const tempVec3ForCenter = new Vector3()

export const getPreloaded = () => {
  return ['sitting']
}

/** Checks if the asset is a VRM. If not, attempt to use
 *  Mixamo based naming schemes to autocreate necessary VRM humanoid objects. */
export const autoconvertMixamoAvatar = (model: any) => {
  const scene = model.scene ?? model // FBX assets do not have 'scene' property
  if (!scene) return null

  const vrm = (model instanceof VRM ? model : model.userData?.vrm ?? avatarBoneMatching(scene)) as any

  if (!vrm.userData) vrm.userData = { flipped: vrm.meta.metaVersion == '1' ? false : true } as any

  return vrm
}

export const isAvaturn = (url: string) => {
  const fileExtensionRegex = /\.[0-9a-z]+$/i
  const avaturnUrl = config.client.avaturnAPI
  if (avaturnUrl && !fileExtensionRegex.test(url)) return url.startsWith(avaturnUrl)
  else return false
}

export const loadAvatarModelAsset = (entity: Entity, avatarURL: string) => {
  //check if the url to the file is an avaturn url to infer the file type

  const override = !isAvaturn(avatarURL) ? undefined : AssetType.glB

  AssetLoader.loadAsync(avatarURL, undefined, undefined, override).then((loadedAsset) => {
    setComponent(entity, AvatarRigComponent, { vrm: loadedAsset })
  })
}

export const loadAvatarForUser = async (
  entity: Entity,
  avatarURL: string,
  loadingEffect = getState(EngineState).avatarLoadingEffect && !getState(XRState).sessionActive && !iOS
) => {
  if (hasComponent(entity, AvatarPendingComponent) && getComponent(entity, AvatarPendingComponent).url === avatarURL)
    throw new Error('Avatar model already loading')

  if (loadingEffect) {
    if (hasComponent(entity, AvatarControllerComponent)) AvatarControllerComponent.captureMovement(entity, entity)
  }

  if (entity === Engine.instance.localClientEntity) getMutableState(EngineState).userReady.set(false)

  setComponent(entity, AvatarPendingComponent, { url: avatarURL })
  //const parent = (await loadAvatarModelAsset(avatarURL)) as VRM

  /** hack a cancellable promise - check if the url we start with is the one we end up with */
  if (!hasComponent(entity, AvatarPendingComponent) || getComponent(entity, AvatarPendingComponent).url !== avatarURL)
    throw new Error('Avatar model changed while loading')

  removeComponent(entity, AvatarPendingComponent)

  if (!parent) throw new Error('Avatar model not found')
  //setupAvatarForUser(entity, parent)

  if (isClient && loadingEffect) {
    const avatar = getComponent(entity, AvatarComponent)
    const [dissolveMaterials, avatarMaterials] = setupAvatarMaterials(entity, avatar?.model)
    const effectEntity = createEntity()
    setComponent(effectEntity, AvatarEffectComponent, {
      sourceEntity: entity,
      opacityMultiplier: 1,
      dissolveMaterials: dissolveMaterials as ShaderMaterial[],
      originMaterials: avatarMaterials as MaterialMap[]
    })
    if (hasComponent(entity, AvatarControllerComponent)) AvatarControllerComponent.releaseMovement(entity, entity)
  }
}

/**Kicks off avatar animation loading and setup. Called after an avatar's model asset is
 * successfully loaded and retargeted.
 */
export const setupAvatarForUser = (entity: Entity, model: VRM) => {
  const avatar = getComponent(entity, AvatarComponent)
  if (avatar && avatar.model) removeObjectFromGroup(entity, avatar.model)

  rigAvatarModel(entity)(model)
  addObjectToGroup(entity, model.scene)
  iterateObject3D(model.scene, (obj) => {
    obj && (obj.frustumCulled = false)
  })

  computeTransformMatrix(entity)
  setupAvatarHeight(entity, model.scene)

  setAvatarAnimations(entity)

  setObjectLayers(model.scene, ObjectLayers.Avatar)
  avatar.model = model.scene
}

export const retargetAvatarAnimations = (entity: Entity) => {
  const rigComponent = getComponent(entity, AvatarRigComponent)
  const manager = getState(AnimationState)

  const animations = getMutableComponent(entity, AnimationComponent).animations

  for (let i = 0; i < animations.length; i++) {
    if (!animations[i].value) continue
    animations[i].set(
      retargetMixamoAnimation(
        animations[i].value,
        manager.loadedAnimations[locomotionAnimation]?.scene!,
        rigComponent.vrm
      )
    )
  }
}

/**Loads the locomotion animations, emotes and optionals*/
export const setAvatarAnimations = (entity: Entity) => {
  const manager = getMutableState(AnimationState)
  if (!manager.loadedAnimations.value[locomotionAnimation]) {
    //preload locomotion animations
    AssetLoader.loadAsync(
      `${config.client.fileServer}/projects/default-project/assets/animations/${locomotionAnimation}.glb`
    ).then((locomotionAsset: GLTF) => {
      manager.loadedAnimations[locomotionAnimation].set(locomotionAsset)
    })
    //preload all emote animation files
    const emoteKeys = Object.keys(emoteAnimations)
    for (let i = 0; i < emoteKeys.length; i++) {
      AssetLoader.loadAsync(
        `${config.client.fileServer}/projects/default-project/assets/animations/emotes/${emoteKeys[i]}.fbx`
      ).then((loadedEmotes) => {
        manager.loadedAnimations[emoteKeys[i]].set(loadedEmotes)
      })
    }
  }
}

export const setSpeedFromRootMotion = (entity: Entity) => {
  const manager = getState(AnimationState)
  const run = manager.loadedAnimations[locomotionAnimation].animations[4] ?? [new AnimationClip()]
  const walk = manager.loadedAnimations[locomotionAnimation].animations[6] ?? [new AnimationClip()]
  const movement = getState(AvatarMovementSettingsState)
  if (run) movement.runSpeed = getRootSpeed(run) * 0.01
  if (walk) movement.walkSpeed = getRootSpeed(walk) * 0.01
}

export const loadAnimationsFromObjectKeys = async (animationNames) => {}

export const rigAvatarModel = (entity: Entity) => (model: VRM) => {
  const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)

  const rig = model.humanoid?.normalizedHumanBones

  const skinnedMeshes = findSkinnedMeshes(model.scene)
  const hips = recursiveHipsLookup(model.scene)

  const targetBones = getAllBones(hips)

  setComponent(entity, AvatarRigComponent, {
    rig,
    localRig: cloneDeep(rig), //cloneDeep(sourceRig),
    targetBones,
    skinnedMeshes
  })

  avatarAnimationComponent.rootYRatio = 1

  return model
}

export const setupAvatarMaterials = (entity, root) => {
  const materialList: Array<MaterialMap> = []
  const dissolveMatList: Array<ShaderMaterial> = []
  setObjectLayers(root, ObjectLayers.Avatar)

  root.traverse((object) => {
    if (object.isBone) object.visible = false
    if (object.material && object.material.clone) {
      const material = object.material
      materialList.push({
        id: object.uuid,
        material: material
      })
      object.material = AvatarDissolveComponent.createDissolveMaterial(object)
      dissolveMatList.push(object.material)
    }
  })

  return [dissolveMatList, materialList]
}

export const setupAvatarHeight = (entity: Entity, model: Object3D) => {
  const box = new Box3()
  box.expandByObject(model).getSize(tempVec3ForHeight)
  box.getCenter(tempVec3ForCenter)
  resizeAvatar(entity, tempVec3ForHeight.y, tempVec3ForCenter)
}

/**
 * Creates an empty skinned mesh using list of bones to build skeleton structure
 * @returns SkinnedMesh
 */
export function makeSkinnedMeshFromBoneData(bonesData) {
  const bones: Bone[] = []
  bonesData.forEach((data) => {
    const bone = new Bone()
    bone.name = data.name
    bone.position.fromArray(data.position)
    bone.quaternion.fromArray(data.quaternion)
    bone.scale.setScalar(1)
    bones.push(bone)
  })

  bonesData.forEach((data, index) => {
    if (data.parentIndex > -1) {
      bones[data.parentIndex].add(bones[index])
    }
  })

  // we assume that root bone is the first one
  const hipBone = bones[0] as Bone & { entity: Entity }
  hipBone.updateWorldMatrix(false, true)

  const group = new Group()
  group.name = 'skinned-mesh-group'
  const skinnedMesh = new SkinnedMesh()
  const skeleton = new Skeleton(bones)
  skinnedMesh.bind(skeleton)
  group.add(skinnedMesh)
  group.add(hipBone)

  return group
}

export const getAvatarBoneWorldPosition = (entity: Entity, boneName: string, position: Vector3): boolean => {
  const avatarRigComponent = getOptionalComponent(entity, AvatarRigComponent)
  if (!avatarRigComponent || !avatarRigComponent.rig) return false
  const bone = avatarRigComponent.rig[boneName] as VRMHumanBone
  if (!bone) return false
  const el = bone.node.matrixWorld.elements
  position.set(el[12], el[13], el[14])
  return true
}
