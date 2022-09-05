import { Vector3 } from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { Physics } from '../../physics/classes/Physics'
import { AvatarCollisionMask, CollisionGroups } from '../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../physics/functions/getInteractionGroups'
import { RaycastHit, SceneQueryType } from '../../physics/types/PhysicsTypes'

/**
 * Checks if given position is a valid position to move avatar too.
 * @param position
 * @param onlyAllowPositionOnGround, if set will only consider the given position as valid if it falls on the ground
 * @returns {
 * positionValid, the given position is a valid position
 * raycastHit, the raycastHit result of the physics raycast
 * }
 */
export default function checkPositionIsValid(
  position: Vector3,
  onlyAllowPositionOnGround = true,
  raycastDirection = new Vector3(0, -1, 0)
) {
  const collisionLayer = onlyAllowPositionOnGround ? CollisionGroups.Ground : AvatarCollisionMask
  const interactionGroups = getInteractionGroups(CollisionGroups.Avatars, collisionLayer)

  const raycastComponentData = {
    type: SceneQueryType.Closest,
    origin: position,
    direction: raycastDirection,
    maxDistance: 2,
    groups: interactionGroups
  }
  const hits = Physics.castRay(Engine.instance.currentWorld.physicsWorld, raycastComponentData)

  let positionValid = false
  let raycastHit = null as any
  if (hits.length > 0) {
    raycastHit = hits[0] as RaycastHit
    if (onlyAllowPositionOnGround) {
      positionValid = true
    } else {
      if (raycastHit.normal.y > 0.9) positionValid = true
    }
  }

  return {
    positionValid: positionValid,
    raycastHit: raycastHit
  }
}
