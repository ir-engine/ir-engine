import type { Object3D } from 'three';
///<reference path="./PhysX.d.ts"/>

export interface PhysXConfig {
  jsPath: string;
  wasmPath: string;
  tps?: number;
  lengthScale?: number;
  start?: boolean;
}

export enum PhysXModelShapes {
  Sphere,
  Plane,
  Capsule,
  Box,
  ConvexMesh,
  TriangleMesh,
  HeightField,
}
export interface Vec3Fragment {
  x?: number;
  y?: number;
  z?: number;
}
export interface QuatFragment {
  x?: number;
  y?: number;
  z?: number;
  w?: number;
}


export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Quat {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface Transform {
  translation: Vec3;
  rotation: Quat;
  scale: Vec3;
  linearVelocity?: Vec3;
  angularVelocity?: Vec3;
}

export enum PhysXBodyType {
  STATIC,
  DYNAMIC,
  KINEMATIC,
  CONTROLLER,
}

export interface PhysXShapeConfig {
  id: number;
  shape: PhysXModelShapes;
  transform: Transform;
  config: ShapeConfig;
  _debugNeedsUpdate?: any;
  options?: {
    vertices?: number[];
    indices?: number[];
    boxExtents?: Vec3;
    radius?: number;
    halfHeight?: number;
  };
}

export interface MaterialConfig {
  staticFriction?: number;
  dynamicFriction?: number;
  restitution?: number;
}

export interface ShapeConfig {
  id: number;
  contactOffset?: number;
  isTrigger?: boolean;
  collisionLayer?: number;
  collisionMask?: number;
  material?: MaterialConfig;
}

export interface BodyConfig {
  type?: PhysXBodyType;
  mass?: number;
  linearDamping?: number;
  angularDamping?: number;
  linearVelocity?: Vec3;
  angularVelocity?: Vec3;
  transform?: Transform;
  shapes?: ShapeConfig[]; // only use in updates, initial is set from PhysXShapeConfig
}

export interface RigidBodyProxy {
  id: number;
  transform: Transform;
  updateTransform?: ({ translation, rotation }: { translation?: Vec3Fragment, rotation?: QuatFragment }) => void;
  shapes: PhysXShapeConfig[];
  options: BodyConfig;
  controller?: {
    _debugNeedsUpdate?: any;
    config: ControllerConfig;
    collisions: { down: boolean; sides: boolean; up: boolean };
    delta: { x: number; y: number; z: number };
    velocity: { x: number; y: number; z: number };
  };
  addEventListener?: any;
  removeEventListener?: any;
  hasEventListener?: any;
  dispatchEvent?: any;
}

export interface ControllerConfig {
  id?: number;
  body?: any; // internal use
  position?: Vec3Fragment;
  positionDelta?: Vec3Fragment;
  stepOffset?: number;
  contactOffset?: number;
  slopeLimit?: number;
  maxJumpHeight?: number;
  invisibleWallHeight?: number;
  isCapsule?: boolean;
  resize?: number;
  material?: MaterialConfig;
  collisionLayer?: number;
  collisionMask?: number;
  // capsule
  height?: number;
  radius?: number;
  climbingMode?: PhysX.PxCapsuleClimbingMode;
  // box
  halfForwardExtent?: number;
  halfHeight?: number;
  halfSideExtent?: number;
}

export const DefaultControllerConfig: ControllerConfig = {
  height: 1,
  radius: 0.25,
  stepOffset: 0.1,
  contactOffset: 0.01,
  slopeLimit: 1,
  invisibleWallHeight: 1,
};

export interface Object3DBody extends Object3D {
  body: RigidBodyProxy;
}

export enum SceneQueryType {
  // todo
  // Any,
  // Multiple,
  Closest,
}
export interface SceneQuery {
  id?: number;
  type: SceneQueryType;
  flags?: number;
  collisionLayer?: number;
  collisionMask?: number;
  origin?: Vec3;
  direction?: Vec3;
  maxDistance?: number;
  maxHits?: number;
  hits?: RaycastHit[];
}

export interface RaycastHit {
  distance: number;
  position: Vec3;
  normal: Vec3;
}

export enum ControllerEvents {
  CONTROLLER_SHAPE_HIT = 'CONTROLLER_SHAPE_HIT',
  CONTROLLER_CONTROLLER_HIT = 'CONTROLLER_CONTROLLER_HIT',
  CONTROLLER_OBSTACLE_HIT = 'CONTROLLER_OBSTACLE_HIT',
}

export enum CollisionEvents {
  COLLISION_START = 'COLLISION_START',
  COLLISION_PERSIST = 'COLLISION_PERSIST',
  COLLISION_END = 'COLLISION_END',

  TRIGGER_START = 'TRIGGER_START',
  TRIGGER_END = 'TRIGGER_END',
}
