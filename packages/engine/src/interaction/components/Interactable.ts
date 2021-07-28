import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'
import { InteractionData } from '../types/InteractionTypes'

export class Interactable extends Component<Interactable> {
  static _schema = {
    data: { type: Types.Ref }
  }

  public data: InteractionData
}
