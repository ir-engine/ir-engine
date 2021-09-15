export interface PhysXConfig {
  stepTime?: number
  lengthScale?: number
  start?: boolean
  bounceThresholdVelocity?: number
  verbose?: boolean
  substeps?: number
  gravity?: Vec3
}

export enum SHAPES {
  Sphere,
  Plane,
  Capsule,
  Box,
  ConvexMesh,
  TriangleMesh,
  HeightField
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

export interface TransformType {
  translation?: Vec3Fragment
  rotation?: QuatFragment
  scale?: Vec3Fragment
  linearVelocity?: Vec3Fragment
  angularVelocity?: Vec3Fragment
}

export enum BodyType {
  STATIC,
  DYNAMIC,
  KINEMATIC,
  CONTROLLER
}

export interface ShapeType {
  id?: number
  shape?: SHAPES
  transform?: TransformType
  config?: ShapeConfigType
  _debugNeedsUpdate?: any
  options?: {
    vertices?: number[]
    indices?: number[]
    boxExtents?: Vec3
    radius?: number
    halfHeight?: number
  }
  userData?: any
}

export interface MaterialConfigType {
  staticFriction?: number
  dynamicFriction?: number
  restitution?: number
}

export interface ShapeConfigType {
  restOffset?: number
  contactOffset?: number
  isTrigger?: boolean
  collisionLayer?: number
  collisionMask?: number
  material?: MaterialConfigType
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
  id: number
  transform: TransformType
  updateTransform?: ({ translation, rotation }: { translation?: Vec3Fragment; rotation?: QuatFragment }) => void
  shapes: ShapeType[]
  userData?: any
  [x: string]: any
}

export interface ControllerRigidBody extends RigidBody {
  _debugNeedsUpdate?: any
  _shape: ControllerConfig
  collisions: { down: boolean; sides: boolean; up: boolean }
  delta: { x: number; y: number; z: number }
  velocity: { x: number; y: number; z: number }
}

export interface ControllerConfig {
  id?: number
  userData?: any
  position?: Vec3Fragment
  positionDelta?: Vec3Fragment
  stepOffset?: number
  contactOffset?: number
  slopeLimit?: number
  maxJumpHeight?: number
  invisibleWallHeight?: number
  isCapsule?: boolean
  resize?: number
  material?: MaterialConfigType
  collisionLayer?: number
  collisionMask?: number
  // capsule
  height?: number
  radius?: number
  climbingMode?: PhysX.PxCapsuleClimbingMode
  // box
  halfForwardExtent?: number
  halfHeight?: number
  halfSideExtent?: number
  // api
  delta?: Vec3
  velocity?: Vec3
}

export interface ObstacleType {
  id?: number
  isCapsule?: boolean
}

export enum SceneQueryType {
  // todo
  // Any,
  // Multiple,
  Closest
}
export interface SceneQuery {
  id?: number
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
