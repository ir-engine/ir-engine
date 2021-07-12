import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'
import { UIBaseElement } from '../classes/UIBaseElement'

export class UIPanelComponent extends Component<UIPanelComponent> {
  panel: UIBaseElement
  static _schema = {
    panel: { type: Types.Ref, default: null }
  }
}
