import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type CameraComponentType = {
  /** Reference to the object that should be followed. */
  followTarget: Entity
  /** Field of view. */
  fov: number
  /** Aspect Ration - Width / Height */
  aspect: number
  /** Geometry closer than this gets removed. */
  near: number
  /** Geometry farther than this gets removed. */
  far: number
  /** Bitmask of layers the camera can see, converted to an int. */
  layers: number
  /** Should the camera resize if the window does? */
  handleResize: boolean
  /** Entity object for this component. */
  entity: Entity
}

export const CameraComponent = createMappedComponent<CameraComponentType>()