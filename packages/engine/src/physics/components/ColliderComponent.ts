import type { Body } from 'three-physx'
import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export class ColliderComponent extends Component<ColliderComponent> {
  body: Body
}

ColliderComponent._schema = {
  body: { type: Types.Ref, default: null }
}
