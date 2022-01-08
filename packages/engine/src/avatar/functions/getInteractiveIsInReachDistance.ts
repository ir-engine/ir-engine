import { Vector3 } from 'three'

import { ParityValue } from '../../common/enums/ParityValue'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { getHandPosition, isInXR } from '../../xr/functions/WebXRFunctions'

export const interactiveReachDistance = 2
export const interactiveReachDistanceVR = 2

export const getInteractiveIsInReachDistance = (
  entityUser: Entity,
  interactivePosition: Vector3,
  side: ParityValue
): boolean => {
  if (isInXR(entityUser)) {
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
