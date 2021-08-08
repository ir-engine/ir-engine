import { RaycastQuery } from 'three-physx'
import { createMappedComponent } from '../../../../ecs/functions/EntityFunctions'

type GolfBallComponentType = {
  groundRaycast: RaycastQuery
  wallRaycast: RaycastQuery
}

export const GolfBallComponent = createMappedComponent<GolfBallComponentType>()