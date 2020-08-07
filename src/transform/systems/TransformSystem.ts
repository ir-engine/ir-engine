import { System, Entity, Attributes } from "ecsy"
import TransformParent from "../components/TransformParent"
import Transform from "../components/Transform"
import Behavior from "../../common/interfaces/Behavior"
import { transformBehavior } from "../behaviors/transformBehavior"
import { childTransformBehavior } from "../behaviors/childTransformBehavior"

export default class TransformSystem extends System {
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

  execute(time, delta) {
    // Hierarchy
    this.queries.parent.results?.forEach((entity: Entity) => {
      this.childTransformBehavior(entity, {}, delta)
      // Transform children by parent
    })

    // Transforms
    this.queries.transforms.added?.forEach(t => {
      const transform = t.getComponent(Transform)
      this.transformBehavior(t, { position: transform.position, rotation: transform.rotation }, delta)
    })

    this.queries.transforms.changed?.forEach(t => {
      const transform = t.getComponent(Transform)
      this.transformBehavior(t, { position: transform.position, rotation: transform.rotation }, delta)
    })
  }
}

TransformSystem.queries = {
  parent: {
    components: [TransformParent, Transform],
    listen: {
      added: true
    }
  },
  transforms: {
    components: [Transform],
    listen: {
      added: true,
      changed: true
    }
  }
}
