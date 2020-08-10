import { Component, Types } from "ecsy"

interface PropTypes {
  camera: any
}

export class CameraComponent extends Component<PropTypes> {
  static instance: CameraComponent = null
  camera: any // Reference to the actual camera object
  followTarget: any // Reference to the object that should be followed
  fov: number // Field of view
  aspect: number // Width / height
  near: number // Geometry closer than this gets removed
  far: number // Geometry farther than this gets removed
  layers: number // Bitmask of layers the camera can see, converted to an int
  handleResize: boolean // Should the camera resize if the window does?
  constructor() {
    super()
    CameraComponent.instance = this
  }
}

CameraComponent.schema = {
  camera: { default: null, type: Types.Ref },
  followTarget: { default: null, type: Types.Ref },
  fov: { default: 45, type: Types.Number },
  aspect: { default: 1, type: Types.Number },
  near: { default: 0.1, type: Types.Number },
  far: { default: 1000, type: Types.Number },
  layers: { default: 0, type: Types.Number },
  handleResize: { default: true, type: Types.Boolean }
}
