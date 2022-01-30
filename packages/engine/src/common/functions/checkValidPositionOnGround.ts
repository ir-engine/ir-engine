import { Vector3 } from 'three'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { SceneQueryType } from '../../physics/types/PhysicsTypes'

export default function checkValidPositionOnGround(position: Vector3) {
  const filterData = new PhysX.PxQueryFilterData()
  filterData.setWords(CollisionGroups.Ground, 0)
  const flags = PhysX.PxQueryFlag.eSTATIC.value | PhysX.PxQueryFlag.eDYNAMIC.value | PhysX.PxQueryFlag.eANY_HIT.value
  filterData.setFlags(flags)

  const world = useWorld()
  const raycastComponentData = {
    filterData,
    type: SceneQueryType.Closest,
    hits: [],
    origin: position,
    direction: new Vector3(0, -1, 0),
    maxDistance: 10,
    flags
  }
  world.physics.doRaycast(raycastComponentData)

  if (raycastComponentData.hits.length > 0) {
    return true
  }

  return false
}
