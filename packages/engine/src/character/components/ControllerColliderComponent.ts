import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'
import type { Controller, RaycastQuery } from 'three-physx'

/**
 * @author Shaw
 */
export class ControllerColliderComponent extends Component<ControllerColliderComponent> {
  controller: Controller
  // Ray casting
  raycastQuery: RaycastQuery
  closestHit = null

  mass: number
  // the radius of the main capsule
  capsuleRadius: number
  // the height of the capsule (from center of each dome of the capsule, ie. not inclusive of thedomes)
  capsuleHeight: number
  contactOffset: number
  friction: number
}

ControllerColliderComponent._schema = {
  mass: { type: Types.Number, default: 0 },
  capsuleRadius: { type: Types.Number, default: 0.25 },
  capsuleHeight: { type: Types.Number, default: 1.3 },
  contactOffset: { type: Types.Number, default: 0.01 },
  friction: { type: Types.Number, default: 0.1 }
}
