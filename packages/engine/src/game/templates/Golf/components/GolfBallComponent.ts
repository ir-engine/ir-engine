import { RaycastQuery } from 'three-physx'
import { createMappedComponent } from '../../../../ecs/functions/EntityFunctions'

export type GolfBallComponentType = {
  groundRaycast: RaycastQuery
  wallRaycast: RaycastQuery
}

export const GolfBallComponent = createMappedComponent<GolfBallComponentType>()
