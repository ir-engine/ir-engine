import { Vector3 } from 'three'

import { useWorld } from '../../ecs/functions/SystemHooks'
import { CollisionGroups, DefaultCollisionMask } from '../../physics/enums/CollisionGroups'
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
export default function checkValidPosition(position: Vector3, onlyAllowPositionOnGround = true, raycastDirection = new Vector3(0, -1, 0)) {
  const filterData = new PhysX.PxQueryFilterData()
  onlyAllowPositionOnGround ? filterData.setWords(CollisionGroups.Ground, 0) : filterData.setWords(DefaultCollisionMask, 0)
  const flags = PhysX.PxQueryFlag.eSTATIC.value | PhysX.PxQueryFlag.eDYNAMIC.value | PhysX.PxQueryFlag.eANY_HIT.value
  filterData.setFlags(flags)

  const world = useWorld()
  const raycastComponentData = {
    filterData,
    type: SceneQueryType.Closest,
    hits: [],
    origin: position,
    direction: raycastDirection,
    maxDistance: 10,
    flags
  }
  world.physics.doRaycast(raycastComponentData)

  let positionValid = false
  let raycastHit = null as any
  if (raycastComponentData.hits.length > 0) {
    if (onlyAllowPositionOnGround) {
      positionValid = true
    }
    else {
      raycastHit = raycastComponentData.hits[0] as RaycastHit
      if (raycastHit.normal.y > 0.90) positionValid = true
    }
  }

  return {
    validPosition: positionValid, 
    raycastHit: raycastHit
  }
}
