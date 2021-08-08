import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'

export class VisibleComponent extends Component<VisibleComponent> {
  value: boolean

  static _schema = {
    value: { type: Types.Boolean, default: true }
  }
}
