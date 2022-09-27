import { Vector3 } from 'three'

import { ParityValue } from '../../common/enums/ParityValue'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRInputSourceComponent } from '../../xr/XRComponents'
import { getHandPosition } from '../../xr/XRFunctions'

export const interactiveReachDistance = 3
export const interactiveReachDistanceVR = 2

export const getInteractiveIsInReachDistance = (
  entityUser: Entity,
  interactivePosition: Vector3,
  side: ParityValue
): boolean => {
  if (hasComponent(entityUser, XRInputSourceComponent)) {
    if (side === ParityValue.LEFT) {
      const leftHandPosition = getHandPosition(entityUser, ParityValue.LEFT)
      if (leftHandPosition) {
        return leftHandPosition.distanceTo(interactivePosition) < interactiveReachDistanceVR
      }
    } else {
      const rightHandPosition = getHandPosition(entityUser, ParityValue.RIGHT)
      if (rightHandPosition) {
        return rightHandPosition.distanceTo(interactivePosition) < interactiveReachDistanceVR
      }
    }
  } else {
    const userPosition = getComponent(entityUser, TransformComponent).position
    if (userPosition.distanceTo(interactivePosition) < interactiveReachDistance) {
      return true
    }
  }
  return false
}
