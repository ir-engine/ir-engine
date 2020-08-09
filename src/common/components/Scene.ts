// Singleton component to store reference to camera and scene
import { Component, Types } from "ecsy"

// World data schema
interface PropTypes {
  scene: any
}

export class Scene extends Component<PropTypes> {
  static instance: Scene = null
  scene: any

  constructor() {
    super()
    if (Scene.instance !== null) console.error("Scene singleton has already been set")
    else Scene.instance = this
  }
}

Scene.schema = {
  scene: { type: Types.Ref, default: null }
}
