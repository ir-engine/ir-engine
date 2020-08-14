import { Component } from "../../ecs/Component"
import { Types } from "../../ecs/Types"
import { World } from "../../ecs/World"

// World data schema
interface PropTypes {
  world: World
}

export class World extends Component<PropTypes> {
  static instance: World = null
  world: World
  constructor() {
    super()
    World.instance = this
  }
}

World.schema = {
  world: { type: Types.Ref, default: null }
}
