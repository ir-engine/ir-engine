import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'
import { Entity } from '../../ecs/classes/Entity'
import { Vector3 } from 'three'

/**
 * @author xiani_zp <github.com/xiani>
 */

export class AutoPilotRequestComponent extends Component<AutoPilotRequestComponent> {
  public navEntity: Entity
  public point: Vector3

  static _schema = {
    navEntity: { type: Types.Ref, default: null },
    point: { type: Types.Ref, default: null }
  }
}
