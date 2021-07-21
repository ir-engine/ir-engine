import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'

import type { WebLayer3DContent } from 'ethereal'

export class UIComponent extends Component<UIComponent> {
  layer: WebLayer3DContent
  static _schema = {
    layer: { type: Types.Ref, default: null }
  }
}
