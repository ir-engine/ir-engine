import { System, Entity, Attributes, World } from "ecsy"
import TransformParent from "../components/TransformParent"
import TransformComponent from "../components/TransformComponent"
import Behavior from "../../common/interfaces/Behavior"

export default class TransformSystem extends System {
  transformationBehavior: Behavior
  childTransformationBehavior: Behavior
  constructor(world: World, attributes: Attributes) {
    super(world, attributes)
    // if (attributes.transformationBehavior) {
    //   this.transformationBehavior = attributes.transformationBehavior
    // }
    // if (attributes.childTransformationBehavior) {
    //   this.childTransformationBehavior = attributes.childTransformationBehavior
    // }
  }

  execute() {
    return console.log("Transform system is ignored for now")
    // Hierarchy
    this.queries.parent.results?.forEach((entity: Entity) => {
      this.childTransformationBehavior(entity)
      // Transform children by parent
    })

    // Transforms
    this.queries.transforms.added?.forEach(t => {
      const transform = t.getComponent(TransformComponent)
      this.transformationBehavior(t, { position: transform.position, rotation: transform.rotation })
    })

    this.queries.transforms.changed?.forEach(t => {
      const transform = t.getComponent(TransformComponent)
      this.transformationBehavior(t, { position: transform.position, rotation: transform.rotation })
    })
  }
}

TransformSystem.queries = {
  parent: {
    components: [TransformParent, TransformComponent],
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
