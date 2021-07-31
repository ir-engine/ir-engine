import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'
import { Vector2 } from 'three'

/**
 * @author Josh Field <github.com/HexaField>
 */

export class AutoPilotClickRequestComponent extends Component<AutoPilotClickRequestComponent> {
  public coords: Vector2

  static _schema = {
    coords: { type: Types.Ref, default: null }
  }
}
