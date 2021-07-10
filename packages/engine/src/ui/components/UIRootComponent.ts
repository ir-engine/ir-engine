import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'

import type { WebLayer3D } from 'ethereal'

export class UIRootComponent extends Component<UIRootComponent> {
  layer: WebLayer3D
  static _schema = {
    layer: { type: Types.Ref, default: null }
  }
}
