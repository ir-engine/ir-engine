import { Behavior } from "../../common/interfaces/Behavior"
import { Attributes, System, registerComponent } from "../../ecs"
import { childTransformBehavior } from "../behaviors/childTransformBehavior"
import { transformBehavior } from "../behaviors/transformBehavior"
import { TransformComponent } from "../components/TransformComponent"
import { TransformParentComponent } from "../components/TransformParentComponent"

export class TransformSystem extends System {
  transformBehavior: Behavior
  childTransformBehavior: Behavior
  init(attributes: Attributes) {
    registerComponent(TransformComponent)
    registerComponent(TransformParentComponent)
    if (attributes && attributes.transformBehavior) {
      this.transformBehavior = attributes.transformBehavior
    } else {
      this.transformBehavior = transformBehavior
    }
    if (attributes && attributes.childTransformBehavior) {
      this.childTransformBehavior = attributes.childTransformBehavior
    } else {
      this.childTransformBehavior = childTransformBehavior
    }
  }

  execute(delta, time) {
    // Hierarchy
    // this.queries.parent.results?.forEach((entity: Entity) => {
    //   this.childTransformBehavior(entity, {}, delta)
    //   // Transform children by parent
    // })

    this.queries.transforms.results?.forEach(t => {
      this.transformBehavior(t, {}, delta)
    })
  }
}

TransformSystem.queries = {
  parent: {
    components: [TransformParentComponent, TransformComponent],
    listen: {
      added: true
    }
  },
  transforms: {
    components: [TransformComponent],
    listen: {
      added: true,
      changed: true
    }
  }
}
