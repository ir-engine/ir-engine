import { Component } from '../../../../ecs/classes/Component'
import { Types } from '../../../../ecs/types/Types'
/**
 * @author HydraFire <github.com/HydraFire>
 */

export class NewPlayerTagComponent extends Component<NewPlayerTagComponent> {
  gameName: string
  static _schema = {
    gameName: { type: Types.String, default: null }
  }
}
