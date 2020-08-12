import { Component } from "../../ecs/Component"
import { Types } from "../../ecs/Types"
import { World } from "../../ecs/World"

// World data schema
interface PropTypes {
  world: World
}

export class WorldComponent extends Component<PropTypes> {
  static instance: WorldComponent = null
  world: World
  constructor() {
    super()
    WorldComponent.instance = this
  }
}

WorldComponent.schema = {
  world: { type: Types.Ref, default: null }
}
