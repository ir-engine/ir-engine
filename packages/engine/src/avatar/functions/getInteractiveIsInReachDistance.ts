import { Vector3 } from 'three'

import { Entity } from '../../ecs/classes/Entity'
import { getHandTarget } from '../components/AvatarIKComponents'

export const interactiveReachDistance = 3

export const getInteractiveIsInReachDistance = (
  entityUser: Entity,
  interactivePosition: Vector3,
  side: XRHandedness
): boolean => {
  const target = getHandTarget(entityUser, side)
  if (!target) return false
  return target.position.distanceTo(interactivePosition) < interactiveReachDistance
}
