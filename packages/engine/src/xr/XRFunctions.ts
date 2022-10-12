import { Quaternion, Vector3 } from 'three'

import { BoneNames } from '../avatar/AvatarBoneMatching'
import { AvatarRigComponent } from '../avatar/components/AvatarAnimationComponent'
import { ParityValue } from '../common/enums/ParityValue'
import { Entity } from '../ecs/classes/Entity'
import { getComponent } from '../ecs/functions/ComponentFunctions'

const vec3 = new Vector3()
const v3 = new Vector3()
const quat = new Quaternion()

/**
 * Gets the hand position in world space
 * @param entity the player entity
 * @param hand which hand to get
 * @returns {Vector3}
 */

export const getHandPosition = (entity: Entity, hand: ParityValue = ParityValue.NONE): Vector3 => {
  const bone: BoneNames = hand === ParityValue.RIGHT ? 'RightHand' : 'LeftHand'
  const rig = getComponent(entity, AvatarRigComponent)
  rig ? rig.rig[bone].getWorldPosition(vec3) : vec3.set(0, 0, 0)
  return vec3
}

/**
 * Gets the hand rotation in world space
 * @param entity the player entity
 * @param hand which hand to get
 * @returns {Quaternion}
 */

export const getHandRotation = (entity: Entity, hand: ParityValue = ParityValue.NONE): Quaternion => {
  const bone: BoneNames = hand === ParityValue.RIGHT ? 'RightHand' : 'LeftHand'
  const rig = getComponent(entity, AvatarRigComponent)
  rig ? rig.rig[bone].getWorldQuaternion(quat) : quat.identity()
  return quat
}

/**
 * Gets the hand transform in world space
 * @param entity the player entity
 * @param hand which hand to get
 * @returns { position: Vector3, rotation: Quaternion }
 */

export const getHandTransform = (
  entity: Entity,
  hand: ParityValue = ParityValue.NONE
): { position: Vector3; rotation: Quaternion } => {
  const bone: BoneNames = hand === ParityValue.RIGHT ? 'RightHand' : 'LeftHand'
  const rig = getComponent(entity, AvatarRigComponent)
  if (rig) {
    rig.rig[bone].matrixWorld.decompose(vec3, quat, v3) 
  } else {
    vec3.set(0, 0, 0)
    quat.identity()
  }
  return {
    position: vec3,
    rotation: quat
  }
}
