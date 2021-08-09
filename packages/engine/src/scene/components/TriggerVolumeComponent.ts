import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'

export class TriggerVolumeComponent extends Component<TriggerVolumeComponent> {
  ref: any
  target: any
  onTriggerEnter: any
  onTriggerExit: any
  active: boolean = false
  static _schema = {
    ref: { type: Types.Ref, default: null },
    target: { type: Types.Ref, default: null },
    onTriggerEnter: { type: Types.Ref, default: null },
    onTriggerExit: { type: Types.Ref, default: null },
    active: { type: Types.Boolean, default: false }

  }
}
