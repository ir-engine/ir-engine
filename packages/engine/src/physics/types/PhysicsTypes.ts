import RAPIER, { ActiveCollisionTypes, ColliderHandle, RigidBodyType, ShapeType } from '@dimforge/rapier3d-compat'

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
export interface SceneQuery {
  type: SceneQueryType
  flags?: number
  collisionMask?: number
  origin?: Vec3
  direction?: Vec3
  maxDistance?: number
  maxHits?: number
  hits?: RaycastHit[]
}

export interface RaycastHit {
  distance: number
  position: Vec3
  normal: Vec3
  body?: RAPIER.RigidBody
  collider?: RAPIER.Collider
}

// TODO: Remove this
export enum ControllerEvents {
  CONTROLLER_SHAPE_HIT = 'CONTROLLER_SHAPE_HIT',
  CONTROLLER_CONTROLLER_HIT = 'CONTROLLER_CONTROLLER_HIT',
  CONTROLLER_OBSTACLE_HIT = 'CONTROLLER_OBSTACLE_HIT'
}

export enum CollisionEvents {
  COLLISION_START = 'COLLISION_START',
  COLLISION_PERSIST = 'COLLISION_PERSIST',
  COLLISION_END = 'COLLISION_END',
  TRIGGER_START = 'TRIGGER_START',
  TRIGGER_PERSIST = 'TRIGGER_PERSIST',
  TRIGGER_END = 'TRIGGER_END'
}

type ContactData = {
  points: Vec3
  normal: Vec3
  impulse: number
}

export type ColliderHitEvent = {
  type: CollisionEvents // TODO: Do we need this anymore if we the CollisionComponent is only going to be present during the lifespan of collision. Should only be used to differentiate between collsion & trigger. remove start,end states.
  bodySelf: RAPIER.RigidBody
  bodyOther: RAPIER.RigidBody
  shapeSelf: RAPIER.Collider
  shapeOther: RAPIER.Collider
  contacts: ContactData[] | undefined // TODO: Figure out how to populate this using Rapier
}

export type ColliderDescOptions = {
  type: ShapeType
  bodyType?: RigidBodyType // TODO: This is only required at the root node, should be removed from here?
  size?: Vec3 // For cases where mesh.scale can't provide the actual size of collider.
  isTrigger?: boolean
  friction?: number
  restitution?: number
  collisionLayer?: number
  collisionMask?: number
  activeCollisionTypes?: ActiveCollisionTypes
}
