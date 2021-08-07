import { Component } from '../../ecs/classes/Component'
import { Entity } from '../../ecs/classes/Entity'
import { Types } from '../../ecs/types/Types'

export class Interactor extends Component<Interactor> {
  public focusedInteractive: Entity
  public subFocusedArray: any[]

  static _schema = {
    subFocusedArray: { type: Types.Array, default: [] }
  }
}
