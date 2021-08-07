import { Group, Mesh, Vector3 } from 'three'
import { Body, RaycastQuery } from 'three-physx'
import { Component } from '../../../../ecs/classes/Component'
import { Types } from '../../../../ecs/types/Types'

export class GolfClubComponent extends Component<GolfClubComponent> {
  canDoChipShots: boolean
  neckObject: Mesh
  handleObject: Mesh
  headGroup: Group
  meshGroup: Group
  raycast: RaycastQuery
  raycast1: RaycastQuery
  canHitBall: boolean
  hasHitBall: boolean
  velocityPositionsToCalculate = 4
  lastPositions: Vector3[] = []
  velocity: Vector3
  velocityServer: Vector3
  swingVelocity: number
  hidden: boolean = false
  disabledOpacity: number = 0.3

  static _schema = {
    canDoChipShots: { default: false, type: Types.Boolean },
    velocity: { default: new Vector3(), type: Types.Vector3Type },
    velocityServer: { default: new Vector3(), type: Types.Vector3Type },
    disabledOpacity: { default: 0.3, type: Types.Number }
  }
}
