import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'
import { Entity } from '../../ecs/classes/Entity'
import { ParityValue } from '../../common/enums/ParityValue'

export class InteractedComponent extends Component<InteractedComponent> {
  interactor: Entity
  parity: ParityValue

  static _schema = {
    interactor: { type: Types.Ref },
    parity: { type: Types.Number, default: 0 }
  }
}
