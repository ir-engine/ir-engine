import { createMappedComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { RaycastComponentType } from '@xrengine/engine/src/physics/components/RaycastComponent'
import { BALL_STATES } from '../prefab/GolfBallPrefab'

export type GolfBallComponentType = {
  number: number
  groundRaycast: RaycastComponentType
  wallRaycast: RaycastComponentType
  state: BALL_STATES
}

export const GolfBallComponent = createMappedComponent<GolfBallComponentType>('GolfBallComponent')
