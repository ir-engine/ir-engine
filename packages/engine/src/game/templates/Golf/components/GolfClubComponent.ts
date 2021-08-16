import { Group, Mesh, Vector3 } from 'three'
import { RaycastQuery } from 'three-physx'
import { createMappedComponent } from '../../../../ecs/functions/EntityFunctions'

export type GolfClubComponentType = {
  canDoChipShots: boolean
  neckObject: Mesh
  handleObject: Mesh
  headGroup: Group
  meshGroup: Group
  raycast: RaycastQuery
  raycast1: RaycastQuery
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
