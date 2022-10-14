import { Vector3 } from 'three'

import { ParityValue } from '../../common/enums/ParityValue'
import { Entity } from '../../ecs/classes/Entity'
import { getHandTarget } from '../components/AvatarIKComponents'

export const interactiveReachDistance = 3
const vec3 = new Vector3()

export const getInteractiveIsInReachDistance = (
  entityUser: Entity,
  interactivePosition: Vector3,
  side: ParityValue
): boolean => {
  const target = getHandTarget(entityUser, side)
  if (!target) return false
  return target.getWorldPosition(vec3).distanceTo(interactivePosition) < interactiveReachDistance
}
