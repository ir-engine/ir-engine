import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { RaycastPropsType } from '../../scene/components/CameraPropertiesComponent'
import { CameraMode } from '../types/CameraMode'

export type FollowCameraComponentType = {
  targetEntity: Entity
  /** * **Default** value is ```'thirdPerson'```. */
  mode: CameraMode
  /** Distance to the target  */
  distance: number
  /** Desired zoom level  */
  zoomLevel: number
  /** Used internally */
  zoomVelocity: { value: number }
  /** Minimum distance to target */
  minDistance: number
  /** Maximum distance to target */
  maxDistance: number
  /** Rotation around Y axis */
  theta: number
  /** Rotation around Z axis */
  phi: number
  /** Minimum phi value */
  minPhi: number
  /** Maximum phi value */
  maxPhi: number
  /** Whether looking over left or right shoulder */
  shoulderSide: boolean
  /** Whether the camera auto-rotates toward the target **Default** value is true. */
  locked: boolean
  /** Raycast properties */
  raycastProps: RaycastPropsType
}

export const FollowCameraDefaultValues: FollowCameraComponentType = {
  targetEntity: 0 as Entity,
  mode: CameraMode.ThirdPerson,
  distance: 5,
  zoomLevel: 5,
  zoomVelocity: { value: 0 },
  minDistance: 2,
  maxDistance: 7,
  theta: Math.PI,
  phi: 0,
  minPhi: -70,
  maxPhi: 85,
  shoulderSide: true,
  locked: true,
  raycastProps: {
    enabled: true,
    rayCount: 3,
    rayLength: 15.0,
    rayFrequency: 0.1
  }
}

export const FollowCameraComponent = createMappedComponent<FollowCameraComponentType>('FollowCameraComponent')
