// TODO: Change camera properties to object and use setter that updates camera

export class CameraManager {
  static instance: CameraManager = null
  static camera: any // Reference to the actual camera object
  followTarget: any // Reference to the object that should be followed
  fov: number // Field of view
  aspect: number // Width / height
  near: number // Geometry closer than this gets removed
  far: number // Geometry farther than this gets removed
  layers: number // Bitmask of layers the camera can see, converted to an int
  handleResize: boolean // Should the camera resize if the window does?
  constructor() {
    CameraManager.instance = this
  }
}
