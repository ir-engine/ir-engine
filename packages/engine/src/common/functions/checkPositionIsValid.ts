import { Vector3 } from 'three'

import { useWorld } from '../../ecs/functions/SystemHooks'
import { AvatarCollisionMask, CollisionGroups } from '../../physics/enums/CollisionGroups'
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
  const filterData = new PhysX.PxQueryFilterData()
  onlyAllowPositionOnGround
    ? filterData.setWords(CollisionGroups.Ground, 0)
    : filterData.setWords(AvatarCollisionMask, 0)
  const flags = PhysX.PxQueryFlag.eSTATIC.value | PhysX.PxQueryFlag.eDYNAMIC.value | PhysX.PxQueryFlag.eANY_HIT.value
  filterData.setFlags(flags)

  const world = useWorld()
  const raycastComponentData = {
    filterData,
    type: SceneQueryType.Closest,
    hits: [],
    origin: position,
    direction: raycastDirection,
    maxDistance: 2,
    flags
  }
  world.physics.doRaycast(raycastComponentData)

  let positionValid = false
  let raycastHit = null as any
  if (raycastComponentData.hits.length > 0) {
    raycastHit = raycastComponentData.hits[0] as RaycastHit
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
