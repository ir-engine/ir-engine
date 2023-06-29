/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import RAPIER, {
  ActiveCollisionTypes,
  ColliderHandle,
  RigidBodyType,
  ShapeType,
  Vector
} from '@dimforge/rapier3d-compat'
import { Vector3 } from 'three'

import { Entity } from '../../ecs/classes/Entity'

export interface Vec3 {
  x: number
  y: number
  z: number
}

export interface Quat {
  x: number
  y: number
  z: number
  w: number
}

export enum SceneQueryType {
  // todo
  // Any,
  // Multiple,
  Closest
}

export interface RaycastHit {
  distance: number
  position: Vector
  normal: Vector
  body: RAPIER.RigidBody
  collider: RAPIER.Collider
  entity: Entity
}

export enum CollisionEvents {
  COLLISION_START = 'COLLISION_START',
  COLLISION_PERSIST = 'COLLISION_PERSIST',
  COLLISION_END = 'COLLISION_END',
  TRIGGER_START = 'TRIGGER_START',
  TRIGGER_PERSIST = 'TRIGGER_PERSIST',
  TRIGGER_END = 'TRIGGER_END'
}

export type ColliderHitEvent = {
  type: CollisionEvents
  bodySelf: RAPIER.RigidBody
  bodyOther: RAPIER.RigidBody
  shapeSelf: RAPIER.Collider
  shapeOther: RAPIER.Collider
  maxForceDirection: null | Vector
  totalForce: null | Vector
}

export type ColliderDescOptions = {
  shapeType?: ShapeType
  bodyType?: RigidBodyType // TODO: This is only required at the root node, should be removed from here?
  isTrigger?: boolean
  removeMesh?: boolean
  friction?: number
  restitution?: number
  collisionLayer?: number
  collisionMask?: number
  activeCollisionTypes?: ActiveCollisionTypes
}
