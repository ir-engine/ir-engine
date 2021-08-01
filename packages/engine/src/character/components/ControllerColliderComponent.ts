import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'
import type { Controller } from 'three-physx'

/**
 * @author Shaw
 */
export class ControllerColliderComponent extends Component<ControllerColliderComponent> {
  controller: Controller

  static _schema = {
    controller: { type: Types.Ref }
  }
}
