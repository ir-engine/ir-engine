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

import { VRMHumanBoneList } from '@pixiv/three-vrm'
import { Matrix4, Vector3 } from 'three'

import { getComponent, hasComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { getState } from '@ir-engine/hyperflux'
import { iterateEntityNode } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { computeTransformMatrix } from '@ir-engine/spatial/src/transform/systems/TransformSystem'

import { AnimationState } from '../AnimationManager'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'

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

export const setupAvatarProportions = (entity: Entity) => {
  iterateEntityNode(entity, computeTransformMatrix, (e) => hasComponent(e, TransformComponent))

  const worldHeight = Math.abs(TransformComponent.getWorldPosition(entity, new Vector3()).y)
  const rig = getComponent(entity, AvatarRigComponent).bonesToEntities
  TransformComponent.getWorldPosition(rig.hips, hipsPos)
  TransformComponent.getWorldPosition(rig.head, headPos)
  TransformComponent.getWorldPosition(rig.leftFoot, leftFootPos)
  TransformComponent.getWorldPosition(rig.rightFoot, rightFootPos)
  rig.leftToes && TransformComponent.getWorldPosition(rig.leftToes, leftToesPos)
  TransformComponent.getWorldPosition(rig.leftLowerLeg, leftLowerLegPos)
  TransformComponent.getWorldPosition(rig.leftUpperLeg, leftUpperLegPos)
  rig.leftEye ? TransformComponent.getWorldPosition(rig.leftEye, eyePos) : eyePos.copy(headPos).setY(headPos.y + 0.1) // fallback to rough estimation if no eye bone is present

  setComponent(entity, AvatarComponent, {
    avatarHeight: Math.abs(headPos.y) - worldHeight + 0.25,
    torsoLength: Math.abs(headPos.y - hipsPos.y),
    upperLegLength: Math.abs(hipsPos.y - leftLowerLegPos.y),
    lowerLegLength: Math.abs(leftLowerLegPos.y - leftFootPos.y),
    hipsHeight: Math.abs(hipsPos.y) - worldHeight,
    eyeHeight: eyePos.y - worldHeight,
    footHeight: leftFootPos.y - worldHeight,
    footGap: footGap.subVectors(leftFootPos, rightFootPos).length(),
    footAngle: rig.leftToes ? Math.atan2(leftFootPos.z - leftToesPos.z, leftFootPos.y - leftToesPos.y) : 0
  })
  /**sets up ik matrices for blending into the normalized rig */
  const rigComponent = getComponent(entity, AvatarRigComponent)
  //get list of bone names for arms and legs
  const boneNames = VRMHumanBoneList.filter(
    (bone) => bone.includes('Arm') || bone.includes('Leg') || bone.includes('Foot') || bone.includes('Hand')
  )
  for (const bone of boneNames) {
    rigComponent.ikMatrices[bone] = {
      world: new Matrix4().copy(getComponent(rig[bone], TransformComponent).matrixWorld),
      local: new Matrix4().copy(getComponent(rig[bone], TransformComponent).matrix)
    }
  }
}

export const getAllLoadedAnimations = () =>
  Object.values(getState(AnimationState).loadedAnimations)
    .map((anim) => getComponent(anim, AnimationComponent).animations)
    .flat()
