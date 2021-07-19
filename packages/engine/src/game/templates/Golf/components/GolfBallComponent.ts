import { RaycastQuery } from 'three-physx'
import { Component } from '../../../../ecs/classes/Component'

export class GolfBallComponent extends Component<GolfBallComponent> {
  groundRaycast: RaycastQuery
  wallRaycast: RaycastQuery
}
