import PhysX from 'three-physx'
import { createMappedComponent } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { BALL_STATES } from '../prefab/GolfBallPrefab'

export type GolfBallComponentType = {
  groundRaycast: PhysX.RaycastQuery
  wallRaycast: PhysX.RaycastQuery
  state: BALL_STATES
}

export const GolfBallComponent = createMappedComponent<GolfBallComponentType>()
