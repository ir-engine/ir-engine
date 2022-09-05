import RAPIER, {
  ActiveCollisionTypes,
  ColliderHandle,
  RigidBodyType,
  ShapeType,
  Vector
} from '@dimforge/rapier3d-compat'
import { Vector3 } from 'three'

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
  /**@deprecated */
  type?: ShapeType
  shapeType?: ShapeType
  bodyType?: RigidBodyType // TODO: This is only required at the root node, should be removed from here?
  size?: Vector3 // For cases where mesh.scale can't provide the actual size of collider.
  isTrigger?: boolean
  removeMesh?: boolean
  friction?: number
  restitution?: number
  collisionLayer?: number
  collisionMask?: number
  activeCollisionTypes?: ActiveCollisionTypes
}
