import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'

export class ShadowComponent extends Component<ShadowComponent> {
  castShadow: boolean
  receiveShadow: boolean

  static _schema = {
    castShadow: { type: Types.Boolean, default: true },
    receiveShadow: { type: Types.Boolean, default: true }
  }
}
