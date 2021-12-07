import { Camera, Object3D } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

/**
 * Rotate the target bone with given camera
 */
export type CameraIKComponentType = {
  boneIndex: number
  camera: Camera | Object3D
  /**
   * Clamp the angle between bone forward vector and camera forward in radians
   * Use 0 to disable
   */
  rotationClamp: number
}

export const CameraIKComponent = createMappedComponent<CameraIKComponentType>('CameraIKComponent')
