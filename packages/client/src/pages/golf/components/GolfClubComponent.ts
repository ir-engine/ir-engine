import { Group, Mesh, Vector3 } from 'three'
import { createMappedComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { RaycastComponentType } from '@xrengine/engine/src/physics/components/RaycastComponent'

export type GolfClubComponentType = {
  canDoChipShots: boolean
  neckObject: Mesh
  handleObject: Mesh
  headGroup: Group
  meshGroup: Group
  raycast: RaycastComponentType
  raycast1: RaycastComponentType
  canHitBall: boolean
  hasHitBall: boolean
  velocityPositionsToCalculate: number
  lastPositions: Vector3[]
  velocity: Vector3
  velocityServer: Vector3
  swingVelocity: number
  hidden: boolean
  disabledOpacity: number
  number: number
}

export const GolfClubComponent = createMappedComponent<GolfClubComponentType>('GolfClubComponent')
