import { _Entity, ComponentConstructor } from "ecsy";
import { TransformComponent } from "../../transform/components/TransformComponent";

/**
 * GameObjects are the fundamental objects in Armada that represent characters,
 * props and scenery. They do not accomplish much in themselves but they act as
 * containers for Components.     
 * A GameObject always has a Transform component attached (to represent position
 * and orientation) and it is not possible to remove this.
 */
export class GameObject extends _Entity {
  constructor() {
    super()
    this.addComponent(TransformComponent)
  }

  removeComponent(component: ComponentConstructor<any>, forceImmediate?: boolean): this {
    if (component !== TransformComponent) {
      super.removeComponent(component, forceImmediate)
    }
    return this
  }
}
