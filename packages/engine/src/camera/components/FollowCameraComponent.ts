import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { RaycastQuery } from '../../physics/physx'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { CameraMode } from '../types/CameraMode'

export type FollowCameraComponentType = {
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
  /** Whether looking over left or right shoulder */
  shoulderSide: boolean
  /** Whether the camera auto-rotates toward the target **Default** value is true. */
  locked: boolean
  /** Camera physics raycast data */
  raycastQuery: RaycastQuery

  collisionMask: CollisionGroups
}

export const FollowCameraDefaultValues: FollowCameraComponentType = {
  mode: CameraMode.ThirdPerson,
  zoomLevel: 3,
  zoomVelocity: { value: 0 },
  distance: 3,
  minDistance: 2,
  maxDistance: 7,
  theta: Math.PI,
  phi: 0,
  shoulderSide: true,
  locked: true,
  raycastQuery: null,
  collisionMask: CollisionGroups.Default
}

export const FollowCameraComponent = createMappedComponent<FollowCameraComponentType>('FollowCameraComponent')
