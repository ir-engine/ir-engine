/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import RAPIER, { ActiveCollisionTypes, RigidBodyType, ShapeType, Vector } from '@dimforge/rapier3d-compat'
import { BoxGeometry, CapsuleGeometry, CylinderGeometry, SphereGeometry, Vector3 } from 'three'

import { Entity } from '@ir-engine/ecs/src/Entity'

import { CollisionGroups } from '../enums/CollisionGroups'

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

/** @deprecated */
export type ColliderDescOptions = {
  shapeType?: ShapeType
  bodyType?: RigidBodyType // TODO: This is only required at the root node, should be removed from here?
  isTrigger?: boolean
  friction?: number
  restitution?: number
  collisionLayer?: number
  collisionMask?: number
  activeCollisionTypes?: ActiveCollisionTypes
}

export const BodyTypes = {
  Fixed: 'fixed' as const,
  Dynamic: 'dynamic' as const,
  Kinematic: 'kinematic' as const
}

export type Body = (typeof BodyTypes)[keyof typeof BodyTypes]

export const Shapes = {
  Sphere: 'sphere' as const,
  Capsule: 'capsule' as const,
  Cylinder: 'cylinder' as const,
  Box: 'box' as const,
  Plane: 'plane' as const,
  ConvexHull: 'convex_hull' as const,
  Mesh: 'mesh' as const,
  Heightfield: 'heightfield' as const
}

export const RapierShapeToString = {
  [ShapeType.Ball]: 'sphere' as const,
  [ShapeType.Cuboid]: 'box' as const,
  [ShapeType.Capsule]: 'capsule' as const,
  // [ShapeType.Segment]:
  // [ShapeType.Polyline]:
  // [ShapeType.Triangle]:
  [ShapeType.TriMesh]: 'mesh' as const,
  [ShapeType.HeightField]: 'heightfield' as const,
  [ShapeType.ConvexPolyhedron]: 'convex_hull' as const,
  [ShapeType.Cylinder]: 'cylinder' as const
  // [ShapeType.Cone]:
  // [ShapeType.RoundCuboid]:
  // [ShapeType.RoundTriangle]:
  // [ShapeType.RoundCylinder]:
  // [ShapeType.RoundCone]:
  // [ShapeType.RoundConvexPolyhedron]:
  // [ShapeType.HalfSpace]:
}

export type Shape = (typeof Shapes)[keyof typeof Shapes]

export type ColliderOptions = {
  shape: Shape
  mass: number
  massCenter: Vector3
  friction: number
  restitution: number
  collisionLayer: CollisionGroups
  collisionMask: CollisionGroups
}

export const OldShapeTypes = {
  Cuboid: 'box',
  Ball: 'sphere',
  Cylinder: 'cylinder',
  Capsule: 'capsule',
  TriMesh: 'mesh',
  box: 'box',
  ball: 'sphere',
  cylinder: 'cylinder',
  capsule: 'capsule',
  trimesh: 'mesh',
  [1]: 'box',
  [0]: 'sphere',
  [10]: 'cylinder',
  [2]: 'capsule',
  [6]: 'mesh'
}

/** Maps Three.js geometry types to physics shapes */
export const ThreeToPhysics = {
  [SphereGeometry.prototype.type]: 'sphere',
  [CapsuleGeometry.prototype.type]: 'capsule',
  [CylinderGeometry.prototype.type]: 'cylinder',
  [BoxGeometry.prototype.type]: 'box'
} as Record<string, Shape>
