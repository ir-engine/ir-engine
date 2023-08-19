import { Engine } from '../../ecs/classes/Engine'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { ikTargets } from '../animation/Util'

export const setIkFootTarget = () => {
  const { localClientEntity, userId } = Engine.instance

  const rightFoot = UUIDComponent.entitiesByUUID[userId + ikTargets.rightFoot]
  const leftFoot = UUIDComponent.entitiesByUUID[userId + ikTargets.leftFoot]
  const playerTransform = getComponent(localClientEntity, TransformComponent)
  if (rightFoot) {
    const ikTransform = getComponent(rightFoot, TransformComponent)
    ikTransform.position.copy(playerTransform.position)
  }
  if (leftFoot) {
    const ikTransform = getComponent(leftFoot, TransformComponent)
    ikTransform.position.copy(playerTransform.position)
  }
}
