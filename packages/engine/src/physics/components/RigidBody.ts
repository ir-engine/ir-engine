import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export class RigidBodyComponent extends Component<RigidBodyComponent> {
  isKinematic = 0
}

RigidBodyComponent._schema = {
  isKinematic: { type: Types.Number, default: 0 }
}
