import { Attributes, Entity, System } from "ecsy"
import { Behavior } from "../../common/interfaces/Behavior"
import { childTransformBehavior } from "../behaviors/childTransformBehavior"
import { transformBehavior } from "../behaviors/transformBehavior"
import { TransformComponent } from "../components/TransformComponent"
import { TransformParentComponent } from "../components/TransformParentComponent"

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
    this.queries.parent.results?.forEach((entity: Entity) => {
      this.childTransformBehavior(entity, {}, delta)
      // Transform children by parent
    })

    // Transforms
    this.queries.transforms.added?.forEach(t => {
      const transform = t.getComponent(TransformComponent)
      this.transformBehavior(t, { position: transform.position, rotation: transform.rotation }, delta)
    })

    this.queries.transforms.changed?.forEach(t => {
      const transform = t.getComponent(TransformComponent)
      this.transformBehavior(t, { position: transform.position, rotation: transform.rotation }, delta)
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
