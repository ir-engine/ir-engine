import { RaycastQuery } from '@xrengine/engine/src/physics/classes/Physics'
import { createMappedComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { BALL_STATES } from '../prefab/GolfBallPrefab'

export type GolfBallComponentType = {
  number: number
  groundRaycast: RaycastQuery
  wallRaycast: RaycastQuery
  state: BALL_STATES
}

export const GolfBallComponent = createMappedComponent<GolfBallComponentType>('GolfBallComponent')
