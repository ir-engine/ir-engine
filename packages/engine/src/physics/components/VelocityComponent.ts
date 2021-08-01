import { Vector3 } from 'three'
import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export class VelocityComponent extends Component<VelocityComponent> {
  velocity: Vector3
  static _schema = {
    velocity: { type: Types.Vector3Type, default: new Vector3() }
  }
}
