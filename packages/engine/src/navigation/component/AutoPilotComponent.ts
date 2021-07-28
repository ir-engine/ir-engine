import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'
import { Entity } from '../../ecs/classes/Entity'
import { Vector3 } from 'three'
import { Vehicle } from 'yuka'

/**
 * @author xiani_zp <github.com/xiani>
 */

export class AutoPilotComponent extends Component<AutoPilotComponent> {
  public navEntity: Entity
  public yukaVehicle: Vehicle

  static _schema = {
    navEntity: { type: Types.Ref, default: null },
    yukaVehicle: { type: Types.Ref, default: null }
  }
}
