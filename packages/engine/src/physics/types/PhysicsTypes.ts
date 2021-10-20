export type ColliderTypes = 'box' | 'ground' | 'sphere' | 'capsule' | 'cylinder' | 'convex' | 'trimesh'

export interface PhysXConfig {
  stepTime?: number
  lengthScale?: number
  start?: boolean
  bounceThresholdVelocity?: number
  verbose?: boolean
  substeps?: number
  gravity?: Vec3
}

export interface Vec3Fragment {
  x?: number
  y?: number
  z?: number
}
export interface QuatFragment {
  x?: number
  y?: number
  z?: number
  w?: number
}

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

export enum BodyType {
  STATIC,
  DYNAMIC,
  KINEMATIC,
  CONTROLLER
}

export interface ShapeOptions {
  userData?: any
  restOffset?: number
  contactOffset?: number
  isTrigger?: boolean
  collisionLayer?: number
  collisionMask?: number
}

export interface BodyConfig {
  type?: BodyType
  mass?: number
  useCCD?: boolean
  linearDamping?: number
  angularDamping?: number
  linearVelocity?: Vec3
  angularVelocity?: Vec3
}

export interface RigidBody extends BodyConfig {
  transform: PhysX.PxTransformLike
  shapes: PhysX.PxShape[]
  userData?: any
}

export interface ControllerRigidBody extends RigidBody {
  _debugNeedsUpdate?: any
  _shape: ControllerConfig
  collisions: { down: boolean; sides: boolean; up: boolean }
  delta: { x: number; y: number; z: number }
  velocity: { x: number; y: number; z: number }
}

export interface ControllerConfig {
  isCapsule: boolean
  position: Vec3Fragment
  material: PhysX.PxMaterial
  userData?: any
  stepOffset?: number
  contactOffset?: number
  slopeLimit?: number
  maxJumpHeight?: number
  invisibleWallHeight?: number
}

export interface CapsuleControllerConfig extends ControllerConfig {
  height: number
  radius: number
  climbingMode?: PhysX.PxCapsuleClimbingMode
}

export interface BoxControllerConfig extends ControllerConfig {
  halfForwardExtent: number
  halfHeight: number
  halfSideExtent: number
}

export interface ObstacleConfig {
  isCapsule: boolean
  halfExtents: Vec3
  halfHeight: number
  radius: number
}

export interface ObstacleType {
  isCapsule?: boolean
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
  body?: RigidBody
  _bodyID: number // internal
}

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

export type ControllerHitEvent = {
  type: ControllerEvents
  shape: PhysX.PxShape
  body: RigidBody
  position: Vec3
  normal: Vec3
  length: number
}

export type ControllerObstacleHitEvent = {
  type: ControllerEvents
  obstacle: ObstacleType
  position: Vec3
  normal: Vec3
  length: number
}

type ContactData = {
  points: Vec3
  normal: Vec3
  impulse: number
}

export type ColliderHitEvent = {
  type: CollisionEvents
  bodySelf: PhysX.PxRigidActor
  bodyOther: PhysX.PxRigidActor
  shapeSelf: PhysX.PxShape
  shapeOther: PhysX.PxShape
  contacts: ContactData[]
}
