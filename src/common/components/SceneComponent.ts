import { Scene } from "three"
import { Component } from "../../ecs/Component"
import { Types } from "../../ecs/Types"

// Singleton component to store reference to camera and scene
interface PropTypes {
  scene: Scene
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
