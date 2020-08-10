// Singleton component to store reference to camera and scene
import { Types, Component } from "ecsy"

// World data schema
interface PropTypes {
  scene: any
}

export class SceneComponent extends Component<PropTypes> {
  static instance: SceneComponent = null
  scene: any
  constructor() {
    super()
    SceneComponent.instance = this
  }
}

SceneComponent.schema = {
  scene: { type: Types.Ref, default: null }
}
