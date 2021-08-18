import { Group, Mesh, Vector3 } from 'three'
import PhysX from 'three-physx'
import { createMappedComponent } from '@xrengine/engine/src/ecs/functions/EntityFunctions'

export type GolfClubComponentType = {
  canDoChipShots: boolean
  neckObject: Mesh
  handleObject: Mesh
  headGroup: Group
  meshGroup: Group
  raycast: PhysX.RaycastQuery
  raycast1: PhysX.RaycastQuery
  canHitBall: boolean
  hasHitBall: boolean
  velocityPositionsToCalculate: number
  lastPositions: Vector3[]
  velocity: Vector3
  velocityServer: Vector3
  swingVelocity: number
  hidden: boolean
  disabledOpacity: number
}

export const GolfClubComponent = createMappedComponent<GolfClubComponentType>()
