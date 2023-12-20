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

import { VRM, VRM1Meta, VRMHumanBone, VRMHumanoid } from '@pixiv/three-vrm'
import { AnimationClip, AnimationMixer, Box3, Object3D, Vector3 } from 'three'

import { getMutableState, getState } from '@etherealengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { Entity } from '../../ecs/classes/Entity'
import {
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { computeTransformMatrix } from '../../transform/systems/TransformSystem'
import { AnimationState } from '../AnimationManager'
// import { retargetSkeleton, syncModelSkeletons } from '../animation/retargetSkeleton'
import config from '@etherealengine/common/src/config'
import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { isClient } from '../../common/functions/getEnvironment'
import { iOS } from '../../common/functions/isMobile'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { ModelComponent } from '../../scene/components/ModelComponent'
import { XRState } from '../../xr/XRState'
import avatarBoneMatching, { findSkinnedMeshes, getAllBones, recursiveHipsLookup } from '../AvatarBoneMatching'
import { getRootSpeed } from '../animation/AvatarAnimationGraph'
import { locomotionAnimation } from '../animation/Util'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarAnimationComponent, AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { AvatarDissolveComponent } from '../components/AvatarDissolveComponent'
import { AvatarPendingComponent } from '../components/AvatarPendingComponent'
import { AvatarMovementSettingsState } from '../state/AvatarMovementSettingsState'
import { resizeAvatar } from './resizeAvatar'
import { retargetMixamoAnimation } from './retargetMixamoRig'

const tempVec3ForHeight = new Vector3()
const tempVec3ForCenter = new Vector3()

declare module '@pixiv/three-vrm/types/VRM' {
  export interface VRM {
    userData: {
      useAPose?: boolean
      retargeted?: boolean
    }
  }
}

export const getPreloaded = () => {
  return ['sitting']
}

/** Checks if the asset is a VRM. If not, attempt to use
 *  Mixamo based naming schemes to autocreate necessary VRM humanoid objects. */
export const autoconvertMixamoAvatar = (model: GLTF | VRM) => {
  const scene = model.scene ?? model // FBX assets do not have 'scene' property
  if (!scene) return null!

  const isVRM = model instanceof VRM

  if (isVRM && model.meta.metaVersion === '1') {
    if (!model.userData) model.userData = {}
    return model
  }

  if (isVRM && model.meta.metaVersion === '0') {
    const bones = model.humanoid.rawHumanBones
    model.humanoid.normalizedHumanBonesRoot.removeFromParent()
    bones.hips.node.rotateY(Math.PI)
    const humanoid = new VRMHumanoid(bones)
    model.scene.add(humanoid.normalizedHumanBonesRoot)
    const vrm = new VRM({
      humanoid,
      scene: model.scene,
      meta: { name: model.scene.children[0].name } as VRM1Meta
    })
    if (!vrm.userData) vrm.userData = {}
    return vrm
  }

  return avatarBoneMatching(model)
}

export const isAvaturn = (url: string) => {
  const fileExtensionRegex = /\.[0-9a-z]+$/i
  const avaturnUrl = config.client.avaturnAPI
  if (avaturnUrl && !fileExtensionRegex.test(url)) return url.startsWith(avaturnUrl)
  return false
}

/**tries to load avatar model asset if an avatar is not already pending */
export const loadAvatarModelAsset = (entity: Entity, avatarURL: string) => {
  if (!avatarURL) return
  //check if the url to the file is an avaturn url to infer the file type
  const pendingComponent = getOptionalComponent(entity, AvatarPendingComponent)
  if (pendingComponent && pendingComponent.url === avatarURL) return

  setComponent(entity, AvatarPendingComponent, { url: avatarURL })
  if (hasComponent(entity, AvatarControllerComponent)) AvatarControllerComponent.captureMovement(entity, entity)

  setComponent(entity, ModelComponent, { src: avatarURL, cameraOcclusion: false })
}

export const unloadAvatarForUser = async (entity: Entity, avatarURL: string) => {
  setComponent(entity, ModelComponent, { src: '' })
}

/**Kicks off avatar animation loading and setup. Called after an avatar's model asset is
 * successfully loaded.
 */
export const setupAvatarForUser = (entity: Entity, model: VRM) => {
  rigAvatarModel(entity)(model)
  setupAvatarHeight(entity, model.scene)

  computeTransformMatrix(entity)

  const animationState = getState(AnimationState)
  //set global states if they are not already set
  if (!animationState.loadedAnimations[locomotionAnimation]) loadLocomotionAnimations()

  setObjectLayers(model.scene, ObjectLayers.Avatar)

  const loadingEffect = getState(EngineState).avatarLoadingEffect && !getState(XRState).sessionActive && !iOS

  removeComponent(entity, AvatarPendingComponent)

  if (hasComponent(entity, AvatarControllerComponent)) AvatarControllerComponent.releaseMovement(entity, entity)

  if (isClient && loadingEffect) {
    const avatarHeight = getComponent(entity, AvatarComponent).avatarHeight
    setComponent(entity, AvatarDissolveComponent, {
      height: avatarHeight
    })
  }

  if (entity === Engine.instance.localClientEntity) getMutableState(EngineState).userReady.set(true)
}

export const retargetAvatarAnimations = (entity: Entity) => {
  const rigComponent = getComponent(entity, AvatarRigComponent)
  const manager = getState(AnimationState)
  const animations = [] as AnimationClip[]
  for (const key in manager.loadedAnimations) {
    for (const animation of manager.loadedAnimations[key].animations)
      animations.push(retargetMixamoAnimation(animation, manager.loadedAnimations[key].scene, rigComponent.vrm))
  }
  setComponent(entity, AnimationComponent, {
    animations: animations,
    mixer: new AnimationMixer(rigComponent.normalizedRig.hips.node)
  })
}

export const loadLocomotionAnimations = () => {
  const manager = getMutableState(AnimationState)

  //preload locomotion animations
  AssetLoader.loadAsync(
    `${config.client.fileServer}/projects/default-project/assets/animations/${locomotionAnimation}.glb`
  ).then((locomotionAsset: GLTF) => {
    manager.loadedAnimations[locomotionAnimation].set(locomotionAsset)
    //update avatar speed from root motion
    // todo: refactor this for direct translation from root motion
    setAvatarSpeedFromRootMotion()
  })
}

export const loadAnimationArray = (animations: string[], subDir: string) => {
  const manager = getMutableState(AnimationState)

  for (let i = 0; i < animations.length; i++) {
    AssetLoader.loadAsync(
      `${config.client.fileServer}/projects/default-project/assets/animations/${subDir}/${animations[i]}.fbx`
    ).then((loadedEmotes: GLTF) => {
      manager.loadedAnimations[animations[i]].set(loadedEmotes)
      //fbx files need animations reassignment to maintain consistency with GLTF
      loadedEmotes.animations = loadedEmotes.scene.animations
      loadedEmotes.animations[0].name = animations[i]
    })
  }
}

/**todo: stop using global state for avatar speed
 * in future this will be derrived from the actual root motion of a
 * given avatar's locomotion animations
 */
export const setAvatarSpeedFromRootMotion = () => {
  const manager = getState(AnimationState)
  const run = manager.loadedAnimations[locomotionAnimation].animations[4] ?? [new AnimationClip()]
  const walk = manager.loadedAnimations[locomotionAnimation].animations[6] ?? [new AnimationClip()]
  const movement = getMutableState(AvatarMovementSettingsState)
  if (run) movement.runSpeed.set(getRootSpeed(run) * 0.01)
  if (walk) movement.walkSpeed.set(getRootSpeed(walk) * 0.01)
}

export const rigAvatarModel = (entity: Entity) => (model: VRM) => {
  const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)

  const skinnedMeshes = findSkinnedMeshes(model.scene)
  const hips = recursiveHipsLookup(model.scene)

  const targetBones = getAllBones(hips)

  setComponent(entity, AvatarRigComponent, {
    normalizedRig: model.humanoid.normalizedHumanBones,
    rawRig: model.humanoid.rawHumanBones,
    targetBones,
    skinnedMeshes
  })

  avatarAnimationComponent.rootYRatio = 1

  return model
}

export const setupAvatarHeight = (entity: Entity, model: Object3D) => {
  const box = new Box3()
  box.expandByObject(model).getSize(tempVec3ForHeight)
  box.getCenter(tempVec3ForCenter)
  resizeAvatar(entity, tempVec3ForHeight.y, tempVec3ForCenter)
}

export const getAvatarBoneWorldPosition = (entity: Entity, boneName: string, position: Vector3): boolean => {
  const avatarRigComponent = getOptionalComponent(entity, AvatarRigComponent)
  if (!avatarRigComponent || !avatarRigComponent.normalizedRig) return false
  const bone = avatarRigComponent.normalizedRig[boneName] as VRMHumanBone
  if (!bone) return false
  const el = bone.node.matrixWorld.elements
  position.set(el[12], el[13], el[14])
  return true
}
