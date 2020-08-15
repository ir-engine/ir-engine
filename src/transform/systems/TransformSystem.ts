import { Behavior } from "../../common/interfaces/Behavior"
import { childTransformBehavior } from "../behaviors/childTransformBehavior"
import { transformBehavior } from "../behaviors/transformBehavior"
import { TransformComponent } from "../components/TransformComponent"
import { TransformParentComponent } from "../components/TransformParentComponent"
import { System, Attributes } from "../../ecs/classes/System"
import { registerComponent } from "../../ecs/functions/ComponentFunctions"

export class TransformSystem extends System {
  transformBehavior: Behavior
  childTransformBehavior: Behavior
  init(attributes: Attributes) {
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

    this.queryResults.transforms.all?.forEach(t => {
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
