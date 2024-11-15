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

import { VRM, VRMHumanBone, VRMHumanBoneList } from '@pixiv/three-vrm'
import { AnimationClip, AnimationMixer, Matrix4, Vector3 } from 'three'

import { getComponent, getOptionalComponent, hasComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { iterateEntityNode } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { computeTransformMatrix } from '@ir-engine/spatial/src/transform/systems/TransformSystem'

import { AnimationState } from '../AnimationManager'
import { getRootSpeed } from '../animation/AvatarAnimationGraph'
import { preloadedAnimations } from '../animation/Util'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarMovementSettingsState } from '../state/AvatarMovementSettingsState'

declare module '@pixiv/three-vrm/types/VRM' {
  export interface VRM {
    userData: {
      /** @deprecated see https://github.com/ir-engine/ir-engine/issues/7519 */
      retargeted?: boolean
    }
  }
}

const hipsPos = new Vector3(),
  headPos = new Vector3(),
  leftFootPos = new Vector3(),
  leftToesPos = new Vector3(),
  rightFootPos = new Vector3(),
  leftLowerLegPos = new Vector3(),
  leftUpperLegPos = new Vector3(),
  footGap = new Vector3(),
  eyePos = new Vector3()
// box = new Box3()

export const setupAvatarProportions = (entity: Entity, vrm: VRM) => {
  iterateEntityNode(entity, computeTransformMatrix, (e) => hasComponent(e, TransformComponent))

  const worldHeight = Math.abs(TransformComponent.getWorldPosition(entity, new Vector3()).y)
  const rawRig = vrm.humanoid.rawHumanBones
  rawRig.hips.node.updateWorldMatrix(true, true)
  rawRig.hips.node.getWorldPosition(hipsPos)
  rawRig.head.node.getWorldPosition(headPos)
  rawRig.leftFoot.node.getWorldPosition(leftFootPos)
  rawRig.rightFoot.node.getWorldPosition(rightFootPos)
  rawRig.leftToes && rawRig.leftToes.node.getWorldPosition(leftToesPos)
  rawRig.leftLowerLeg.node.getWorldPosition(leftLowerLegPos)
  rawRig.leftUpperLeg.node.getWorldPosition(leftUpperLegPos)
  rawRig.leftEye ? rawRig.leftEye?.node.getWorldPosition(eyePos) : eyePos.copy(headPos).setY(headPos.y + 0.1) // fallback to rough estimation if no eye bone is present

  setComponent(entity, AvatarComponent, {
    avatarHeight: Math.abs(headPos.y) - worldHeight + 0.25,
    torsoLength: Math.abs(headPos.y - hipsPos.y),
    upperLegLength: Math.abs(hipsPos.y - leftLowerLegPos.y),
    lowerLegLength: Math.abs(leftLowerLegPos.y - leftFootPos.y),
    hipsHeight: Math.abs(hipsPos.y) - worldHeight,
    eyeHeight: eyePos.y - worldHeight,
    footHeight: leftFootPos.y - worldHeight,
    footGap: footGap.subVectors(leftFootPos, rightFootPos).length(),
    footAngle: rawRig.leftToes ? Math.atan2(leftFootPos.z - leftToesPos.z, leftFootPos.y - leftToesPos.y) : 0
  })
  //set ik matrices for blending into normalized rig
  const rig = vrm.humanoid.normalizedHumanBones
  rig.hips.node.updateWorldMatrix(false, true)
  const rigComponent = getComponent(entity, AvatarRigComponent)
  //get list of bone names for arms and legs
  const boneNames = VRMHumanBoneList.filter(
    (bone) => bone.includes('Arm') || bone.includes('Leg') || bone.includes('Foot') || bone.includes('Hand')
  )
  for (const bone of boneNames) {
    rigComponent.ikMatrices[bone] = {
      world: new Matrix4().copy(rig[bone]!.node.matrixWorld),
      local: new Matrix4().copy(rig[bone]!.node.matrix)
    }
  }
}

export const setAvatarAnimations = (entity: Entity) => {
  const vrm = getComponent(entity, AvatarRigComponent).vrm
  const manager = getState(AnimationState)
  for (const boneName of VRMHumanBoneList) {
    const bone = vrm.humanoid.getNormalizedBoneNode(boneName)
    if (bone) bone.name = boneName
  }
  setComponent(entity, AnimationComponent, {
    animations: Object.values(manager.loadedAnimations)
      .map((anim) => getComponent(anim, AnimationComponent).animations)
      .flat(),
    mixer: new AnimationMixer(vrm.humanoid.normalizedHumanBonesRoot)
  })
}

const runClipName = 'Run_RootMotion',
  walkClipName = 'Walk_RootMotion'

/**
 * @todo: stop using global state for avatar speed
 * in future this will be derrived from the actual root motion of a
 * given avatar's locomotion animations
 */
export const setAvatarSpeedFromRootMotion = () => {
  const manager = getState(AnimationState)
  const animations = getComponent(
    manager.loadedAnimations[preloadedAnimations.locomotion],
    AnimationComponent
  ).animations
  /**@todo handle avatar animation clips generically */
  const run = AnimationClip.findByName(animations, runClipName)
  const walk = AnimationClip.findByName(animations, walkClipName)
  const movement = getMutableState(AvatarMovementSettingsState)
  if (run) movement.runSpeed.set(getRootSpeed(run))
  if (walk) movement.walkSpeed.set(getRootSpeed(walk))
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
