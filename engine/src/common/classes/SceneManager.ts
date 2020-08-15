import { Scene } from "three"
import { Component } from "../../ecs/classes/Component"
import { Types } from "../../ecs/types/Types"

// Singleton component to store reference to camera and scene
interface PropTypes {
  scene: Scene
}

export class SceneManager extends Component<PropTypes> {
  static instance: SceneManager = null
  scene: any
  constructor() {
    super()
    SceneManager.instance = this
  }
}

SceneManager.schema = {
  scene: { type: Types.Ref, default: null }
}
