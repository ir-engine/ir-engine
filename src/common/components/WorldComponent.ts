// Singleton component to store reference to camera and scene
import { Types, World, Component } from "ecsy"

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
