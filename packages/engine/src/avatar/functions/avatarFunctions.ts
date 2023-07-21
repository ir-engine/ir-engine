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

import {
  VRM,
  VRMHumanBoneName
  // VRMHumanBoneList, VRMHumanBoneName
} from '@pixiv/three-vrm'
// import * as VRMUtils from '@pixiv/three-vrm'
import { pipe } from 'bitecs'
import { AnimationMixer, Bone, Box3, Group, Object3D, Skeleton, SkinnedMesh, Vector3 } from 'three'

import { dispatchAction, getMutableState, getState } from '@etherealengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
// import { AssetType } from '../../assets/enum/AssetType'
// import { LoopAnimationComponent } from '../../avatar/components/LoopAnimationComponent'
import { isClient } from '../../common/functions/getEnvironment'
import { iOS } from '../../common/functions/isMobile'
import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
// import UpdateableObject3D from '../../scene/classes/UpdateableObject3D'
// import { setCallback } from '../../scene/components/CallbackComponent'
import {
  addObjectToGroup
  // GroupComponent, removeObjectFromGroup
} from '../../scene/components/GroupComponent'
// import { UpdatableCallback, UpdatableComponent } from '../../scene/components/UpdatableComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import iterateObject3D from '../../scene/util/iterateObject3D'
import {
  computeTransformMatrix
  // updateGroupChildren
} from '../../transform/systems/TransformSystem'
import { XRState } from '../../xr/XRState'
// import { applySkeletonPose, isSkeletonInTPose, makeTPose } from '../animation/avatarPose'
// import { retargetSkeleton, syncModelSkeletons } from '../animation/retargetSkeleton'
import { AnimationState } from '../AnimationManager'
// import { retargetSkeleton, syncModelSkeletons } from '../animation/retargetSkeleton'
import {
  // BoneStructure,
  // createSkeletonFromBone,
  findSkinnedMeshes
} from '../AvatarBoneMatching'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarAnimationComponent, AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { AvatarEffectComponent, MaterialMap } from '../components/AvatarEffectComponent'
import { AvatarPendingComponent } from '../components/AvatarPendingComponent'
// import { defaultBonesData } from '../DefaultSkeletonBones'
import { DissolveEffect } from '../DissolveEffect'
// import { SkeletonUtils } from '../SkeletonUtils'
// import { getIdlePose, getWalkForwardPose } from './proceduralIKAnimations'
import { clone, cloneDeep } from 'lodash'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { resizeAvatar } from './resizeAvatar'

const tempVec3ForHeight = new Vector3()
const tempVec3ForCenter = new Vector3()

export const loadAvatarModelAsset = async (avatarURL: string) => {
  const model = await AssetLoader.loadAsync(avatarURL)
  const scene = model.scene || model // FBX files does not have 'scene' property
  if (!scene) return

  const vrm = model instanceof VRM ? model : model.userData.vrm

  // VRMUtils.VRMUtils.removeUnnecessaryJoints(vrm.scene)
  // VRMUtils.VRMUtils.removeUnnecessaryVertices(vrm.scene)

  return vrm as VRM
}

export const loadAvatarForUser = async (
  entity: Entity,
  avatarURL: string,
  loadingEffect = getState(EngineState).avatarLoadingEffect && !getState(XRState).sessionActive && !iOS
) => {
  const avatarPendingComponent = getComponent(entity, AvatarPendingComponent)
  if (hasComponent(entity, AvatarPendingComponent) && avatarPendingComponent.url === avatarURL) return

  if (loadingEffect) {
    if (hasComponent(entity, AvatarControllerComponent)) {
      const avatarControllerComponent = getComponent(entity, AvatarControllerComponent)
      avatarControllerComponent.movementEnabled = false
    }
  }

  setComponent(entity, AvatarPendingComponent, { url: avatarURL })
  const parent = (await loadAvatarModelAsset(avatarURL)) as VRM

  /** hack a cancellable promise - check if the url we start with is the one we end up with */
  if (!hasComponent(entity, AvatarPendingComponent) || avatarPendingComponent?.url !== avatarURL) return

  removeComponent(entity, AvatarPendingComponent)

  if (!parent) return
  setupAvatarForUser(entity, parent)

  if (isClient && loadingEffect) {
    const avatar = getComponent(entity, AvatarComponent)
    const avatarMaterials = setupAvatarMaterials(entity, avatar?.model)
    const effectEntity = createEntity()
    addComponent(effectEntity, AvatarEffectComponent, {
      sourceEntity: entity,
      opacityMultiplier: 1,
      originMaterials: avatarMaterials
    })
  }

  dispatchAction(EngineActions.avatarModelChanged({ entity }))
}

export const setupAvatarForUser = (entity: Entity, model: VRM) => {
  const avatar = getComponent(entity, AvatarComponent)
  // if (avatar.model) removeObjectFromGroup(entity, avatar.model)

  setupAvatarModel(entity)(model)
  addObjectToGroup(entity, model.scene)
  iterateObject3D(model.scene, (obj) => {
    obj && (obj.frustumCulled = false)
  })

  computeTransformMatrix(entity)
  setupAvatarHeight(entity, model.scene)
  createIKAnimator(entity)

  setObjectLayers(model.scene, ObjectLayers.Avatar)
  avatar.model = model.scene
}

export const setupAvatarModel = (entity: Entity) => pipe(rigAvatarModel(entity), animateAvatarModel(entity))

// export const boneMatchAvatarModel = (entity: Entity) => (model: Object3D) => {
//   const assetType = model.scene.userData.type

//   const groupComponent = getOptionalComponent(entity, GroupComponent)

//   if (assetType == AssetType.FBX) {
//     // TODO: Should probably be applied to vertexes in the modeling tool
//     model.children[0].scale.setScalar(0.01)
//     if (groupComponent) for (const obj of groupComponent) obj.userData.scale = 0.01
//   } else if (assetType == AssetType.VRM) {
//     if (model && (model as UpdateableObject3D).update) {
//       addComponent(entity, UpdatableComponent, true)
//       setCallback(entity, UpdatableCallback, (delta: number) => {
//         ;(model as UpdateableObject3D).update(delta)
//       })
//     }
//   }

//   return model
// }

export const createIKAnimator = async (entity: Entity) => {
  const rigComponent = getComponent(entity, AvatarRigComponent)
  const animations = await getAnimations()

  //Using set component here allows us to react to animations
  setComponent(entity, AnimationComponent, {
    animations: clone(animations),
    mixer: new AnimationMixer(rigComponent.targets)
  })
}

export const getAnimations = async () => {
  const manager = getMutableState(AnimationState)
  if (!manager.targetsAnimation.value) {
    const asset = await AssetLoader.loadAsync('/vrm_mocap_targets.glb')
    const glb = asset as GLTF
    manager.targetsAnimation.set(glb.animations)
  }
  return manager.targetsAnimation.value!
}

export const rigAvatarModel = (entity: Entity) => (model: VRM) => {
  const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
  removeComponent(entity, AvatarRigComponent)

  const rig = model.humanoid?.humanBones

  const skinnedMeshes = findSkinnedMeshes(model.scene)

  setComponent(entity, AvatarRigComponent, {
    rig,
    bindRig: cloneDeep(rig),
    skinnedMeshes,
    vrm: model
  })

  centerAvatar(entity)

  const rigComponent = getComponent(entity, AvatarRigComponent)
  rigComponent.targets.name = 'IKTargets'

  for (const [key, value] of Object.entries(rigComponent.ikTargetsMap)) {
    value.name = key
    rigComponent.targets.add(value)
  }

  avatarAnimationComponent.rootYRatio = 1

  return model
}

const offset = new Vector3()
const foot = new Vector3()
export const centerAvatar = (entity: Entity) => {
  //use right foot and left foot rig nodes to calculate the center of the avatar
  const rigComponent = getComponent(entity, AvatarRigComponent)
  rigComponent.bindRig.hips.node.getWorldPosition(offset).multiplyScalar(2)
  offset.y = -rigComponent.bindRig.rightFoot.node.getWorldPosition(foot).y * 2
  rigComponent.vrm.humanoid.normalizedHumanBonesRoot.position.add(offset)
}

export const animateAvatarModel = (entity: Entity) => (model: VRM) => {
  const animationComponent = getComponent(entity, AnimationComponent)
  const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
  const controllerComponent = getOptionalComponent(entity, AvatarControllerComponent)

  animationComponent.mixer?.stopAllAction()
  // Mixer has some issues when binding with the target skeleton
  // We have to bind the mixer with original skeleton and copy resulting bone transforms after update

  //const sourceSkeleton = getComponent(entity, AvatarRigComponent).bindRig
  // debugger
  //animationComponent.mixer = new AnimationMixer(AnimationManager.instance._animatedScene.children[0].children[0])
  //animationComponent.animations = AnimationManager.instance._animations
  //animationComponent.mixer.clipAction(animationComponent.animations[0]).play()

  /* if (avatarAnimationComponent)
    avatarAnimationComponent.animationGraph = createAvatarAnimationGraph(
      entity,
      animationComponent.mixer,
      avatarAnimationComponent.locomotion,
      controllerComponent ?? {}
    )
*/
  // advance animation for a frame to eliminate potential t-pose
  animationComponent.mixer.update(1 / 60)
}

export const setupAvatarMaterials = (entity, root) => {
  const materialList: Array<MaterialMap> = []
  setObjectLayers(root, ObjectLayers.Avatar)

  root.traverse((object) => {
    if (object.isBone) object.visible = false
    if (object.material && object.material.clone) {
      const material = object.material
      materialList.push({
        id: object.uuid,
        material: material
      })
      object.material = DissolveEffect.createDissolveMaterial(object)
    }
  })

  return materialList
}

export const setupAvatarHeight = (entity: Entity, model: Object3D) => {
  const box = new Box3()
  box.expandByObject(model).getSize(tempVec3ForHeight)
  box.getCenter(tempVec3ForCenter)
  resizeAvatar(entity, tempVec3ForHeight.y, tempVec3ForCenter)
}

/**
 * Creates an empty skinned mesh with the default skeleton attached.
 * The skeleton created is compatible with default animation tracks
 * @returns SkinnedMesh
 */
// export function makeDefaultSkinnedMesh() {
//   return makeSkinnedMeshFromBoneData(defaultBonesData)
// }

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
  const hipBone = bones[0]
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

export const getAvatarBoneWorldPosition = (entity: Entity, boneName: VRMHumanBoneName, position: Vector3): boolean => {
  const avatarRigComponent = getOptionalComponent(entity, AvatarRigComponent)
  if (!avatarRigComponent) return false
  const bone = avatarRigComponent?.vrm?.humanoid?.getRawBone(boneName)
  if (!bone) return false
  const el = bone?.node?.matrixWorld?.elements
  position.set(el[12], el[13], el[14])
  return true
}
