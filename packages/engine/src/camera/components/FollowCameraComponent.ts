import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { RaycastQuery } from 'three-physx'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'
import { CameraModes } from '../types/CameraModes'

export type FollowCameraComponentType = {
  /** * **Default** value is ```'thirdPerson'```. */
  mode: string
  /** * **Default** value is 3. */
  distance: number
  /** * **Default** value is 2. */
  minDistance: number
  /** * **Default** value is 7. */
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
  /** Camera physics raycast has hit */
  rayHasHit: boolean
  collisionMask: CollisionGroups
}

export const FollowCameraDefaultValues: FollowCameraComponentType = {
  mode: CameraModes.ThirdPerson,
  distance: 3,
  minDistance: 2,
  maxDistance: 7,
  theta: 0,
  phi: 0,
  shoulderSide: true,
  locked: true,
  raycastQuery: null,
  rayHasHit: false,
  collisionMask: CollisionGroups.Default
}

export const FollowCameraComponent = createMappedComponent<FollowCameraComponentType>(
  undefined,
  FollowCameraDefaultValues
)
