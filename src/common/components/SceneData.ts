// Singleton component to store reference to camera and scene
import { Component, Types } from "ecsy"

// World data schema
interface PropTypes {
  scene: any
  camera: any
}

export default class SceneData extends Component<PropTypes> {
  static instance: SceneData
  scene: any
  camera: any

  constructor() {
    super()
    if (SceneData.instance !== null) console.error("Scene singleton has already been set")
    else SceneData.instance = this
  }
}

SceneData.schema = {
  scene: { type: Types.Ref, default: null },
  camera: { type: Types.Ref, default: null }
}
