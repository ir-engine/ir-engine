import { Vector3 } from 'three'
import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'
import { CollisionGroups, DefaultCollisionMask } from '../../physics/enums/CollisionGroups'
import { RaycastQuery } from 'three-physx'
import { CameraModes } from '../types/CameraModes'

/** The component is added to any entity and hangs the camera watching it. */
export class FollowCameraComponent extends Component<FollowCameraComponent> {
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
  rayHasHit = false
  collisionMask: CollisionGroups
}

FollowCameraComponent._schema = {
  mode: { type: Types.String, default: CameraModes.ShoulderCam },
  distance: { type: Types.Number, default: 3 },
  minDistance: { type: Types.Number, default: 1 },
  maxDistance: { type: Types.Number, default: 10 },
  theta: { type: Types.Number, default: 0 },
  phi: { type: Types.Number, default: 0 },
  shoulderSide: { type: Types.Boolean, default: true },
  locked: { type: Types.Boolean, default: true },
  raycastQuery: { type: Types.Ref, default: null },
  rayHasHit: { type: Types.Boolean, default: false },
  collisionMask: { type: Types.Number, default: DefaultCollisionMask }
}
