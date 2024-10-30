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

import RAPIER, {
  ActiveCollisionTypes,
  ActiveEvents,
  Collider,
  ColliderDesc,
  EventQueue,
  InteractionGroups,
  KinematicCharacterController,
  QueryFilterFlags,
  Ray,
  RigidBody,
  RigidBodyDesc,
  RigidBodyType,
  ShapeType,
  TempContactForceEvent,
  World
} from '@dimforge/rapier3d-compat'
import {
  Box3,
  BufferAttribute,
  Matrix4,
  OrthographicCamera,
  PerspectiveCamera,
  Quaternion,
  Vector2,
  Vector3
} from 'three'

import {
  getComponent,
  getOptionalComponent,
  hasComponent,
  setComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, EntityUUID, UndefinedEntity } from '@ir-engine/ecs/src/Entity'

import { UUIDComponent } from '@ir-engine/ecs'
import { NO_PROXY, defineState, getMutableState, getState, none, useHookstate } from '@ir-engine/hyperflux'
import { Vector3_Zero } from '../../common/constants/MathConstants'
import { smootheLerpAlpha } from '../../common/functions/MathLerpFunctions'
import { MeshComponent } from '../../renderer/components/MeshComponent'
import { SceneComponent } from '../../renderer/components/SceneComponents'
import { getAncestorWithComponents, useAncestorWithComponents } from '../../transform/components/EntityTree'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { computeTransformMatrix } from '../../transform/systems/TransformSystem'
import { ColliderComponent } from '../components/ColliderComponent'
import { CollisionComponent } from '../components/CollisionComponent'
import { RigidBodyComponent } from '../components/RigidBodyComponent'
import { TriggerComponent } from '../components/TriggerComponent'
import { CollisionGroups } from '../enums/CollisionGroups'
import { getInteractionGroups } from '../functions/getInteractionGroups'
import {
  Body,
  BodyTypes,
  CollisionEvents,
  RapierShapeToString,
  RaycastHit,
  SceneQueryType,
  Shape,
  Shapes
} from '../types/PhysicsTypes'

export type PhysicsWorld = World & {
  id: EntityUUID
  substeps: number
  cameraAttachedRigidbodyEntity: Entity
  Colliders: Map<Entity, Collider>
  Rigidbodies: Map<Entity, RigidBody>
  Controllers: Map<Entity, KinematicCharacterController>
  collisionEventQueue: EventQueue
  drainCollisions: ReturnType<typeof Physics.drainCollisionEventQueue>
  drainContacts: ReturnType<typeof Physics.drainContactEventQueue>
}

declare module '@dimforge/rapier3d-compat' {
  export interface Collider {
    userData: { entity: Entity }
  }
}

async function load() {
  return RAPIER.init()
}

export const RapierWorldState = defineState({
  name: 'ir.spatial.physics.RapierWorldState',
  initial: {} as Record<EntityUUID, PhysicsWorld>
})

function createWorld(id: EntityUUID, args = { gravity: { x: 0.0, y: -9.81, z: 0.0 }, substeps: 1 }) {
  const world = new World(args.gravity) as PhysicsWorld

  world.id = id
  world.substeps = args.substeps
  world.cameraAttachedRigidbodyEntity = UndefinedEntity

  const Colliders = new Map<Entity, Collider>()
  const Rigidbodies = new Map<Entity, RigidBody>()
  const Controllers = new Map<Entity, KinematicCharacterController>()

  world.Colliders = Colliders
  world.Rigidbodies = Rigidbodies
  world.Controllers = Controllers

  world.collisionEventQueue = createCollisionEventQueue()
  world.drainCollisions = Physics.drainCollisionEventQueue(world)
  world.drainContacts = Physics.drainContactEventQueue(world)

  getMutableState(RapierWorldState)[id].set(world)

  return world
}

function destroyWorld(id: EntityUUID) {
  const world = getState(RapierWorldState)[id]
  if (!world) throw new Error('Physics world not found')
  getMutableState(RapierWorldState)[id].set(none)
  world.Colliders.clear()
  world.Rigidbodies.clear()
  world.Controllers.clear()
  world.free()
}

function getWorld(entity: Entity) {
  const sceneEntity = getAncestorWithComponents(entity, [SceneComponent])
  if (!sceneEntity) return
  const sceneUUID = getOptionalComponent(sceneEntity, UUIDComponent)
  if (!sceneUUID) return
  return getState(RapierWorldState)[sceneUUID]
}

function useWorld(entity: Entity) {
  const sceneEntity = useAncestorWithComponents(entity, [SceneComponent])
  const sceneUUID = useOptionalComponent(sceneEntity, UUIDComponent)?.value
  const worlds = useHookstate(getMutableState(RapierWorldState))
  return sceneUUID ? (worlds[sceneUUID].get(NO_PROXY) as PhysicsWorld) : undefined
}

function smoothKinematicBody(physicsWorld: PhysicsWorld, entity: Entity, dt: number, substep: number) {
  const rigidbodyComponent = getComponent(entity, RigidBodyComponent)
  if (rigidbodyComponent.targetKinematicLerpMultiplier === 0) {
    /** deterministic linear interpolation between substeps */
    rigidbodyComponent.position.lerpVectors(
      rigidbodyComponent.previousPosition,
      rigidbodyComponent.targetKinematicPosition,
      substep
    )
    rigidbodyComponent.rotation
      .copy(rigidbodyComponent.previousRotation)
      .fastSlerp(rigidbodyComponent.targetKinematicRotation, substep)
  } else {
    /** gradual smoothing between substeps */
    const alpha = smootheLerpAlpha(rigidbodyComponent.targetKinematicLerpMultiplier, dt)
    rigidbodyComponent.position.lerp(rigidbodyComponent.targetKinematicPosition, alpha)
    rigidbodyComponent.rotation.fastSlerp(rigidbodyComponent.targetKinematicRotation, alpha)
  }
  Physics.setKinematicRigidbodyPose(physicsWorld, entity, rigidbodyComponent.position, rigidbodyComponent.rotation)
}

function simulate(simulationTimestep: number, kinematicEntities: Entity[]) {
  const physicsWorlds = Object.values(getState(RapierWorldState))

  for (const world of physicsWorlds) {
    const { substeps, drainCollisions, drainContacts, collisionEventQueue } = world

    // step physics world
    const timestep = simulationTimestep / 1000 / substeps
    world.timestep = timestep
    // const smoothnessMultiplier = 50
    // const smoothAlpha = smoothnessMultiplier * timestep
    for (let i = 0; i < substeps; i++) {
      // smooth kinematic pose changes
      const substep = (i + 1) / substeps
      for (const entity of kinematicEntities) {
        if (world.Rigidbodies.has(entity)) smoothKinematicBody(world, entity, timestep, substep)
      }
      world.step(collisionEventQueue)
      collisionEventQueue.drainCollisionEvents(drainCollisions)
      collisionEventQueue.drainContactForceEvents(drainContacts)
    }
  }
}

function createCollisionEventQueue() {
  return new EventQueue(true)
}

const position = new Vector3()
const rotation = new Quaternion()
const scale = new Vector3()
const mat4 = new Matrix4()

function createRigidBody(world: PhysicsWorld, entity: Entity) {
  computeTransformMatrix(entity)
  TransformComponent.getMatrixRelativeToScene(entity, mat4)
  mat4.decompose(position, rotation, scale)

  TransformComponent.dirtyTransforms[entity] = false

  const rigidBody = getComponent(entity, RigidBodyComponent)

  let rigidBodyDesc: RigidBodyDesc = undefined!
  switch (rigidBody.type) {
    case 'fixed':
    default:
      rigidBodyDesc = RigidBodyDesc.fixed()
      break

    case 'dynamic':
      rigidBodyDesc = RigidBodyDesc.dynamic()
      break

    case 'kinematic':
      rigidBodyDesc = RigidBodyDesc.kinematicPositionBased()
      break
  }
  rigidBodyDesc.translation = position
  rigidBodyDesc.rotation = rotation
  rigidBodyDesc.setCanSleep(rigidBody.canSleep)
  rigidBodyDesc.setGravityScale(rigidBody.gravityScale)

  const body = world.createRigidBody(rigidBodyDesc)
  body.setTranslation(position, false)
  body.setRotation(rotation, false)
  body.setLinvel(Vector3_Zero, false)
  body.setAngvel(Vector3_Zero, false)

  rigidBody.previousPosition.copy(position)
  rigidBody.previousRotation.copy(rotation)
  rigidBody.targetKinematicPosition.copy(position)
  rigidBody.targetKinematicRotation.copy(rotation)
  rigidBody.position.copy(position)
  rigidBody.rotation.copy(rotation)
  rigidBody.linearVelocity.copy(Vector3_Zero)
  rigidBody.angularVelocity.copy(Vector3_Zero)

  // set entity in userdata for fast look up when required.
  const rigidBodyUserdata = { entity: entity }
  body.userData = rigidBodyUserdata

  world.Rigidbodies.set(entity, body)
}

function isSleeping(world: PhysicsWorld, entity: Entity) {
  const rigidBody = world.Rigidbodies.get(entity)
  return !rigidBody || rigidBody.isSleeping()
}

function wakeUp(world: PhysicsWorld, entity: Entity) {
  const rigidBody = world.Rigidbodies.get(entity)
  if (!rigidBody) return
  rigidBody.wakeUp()
}

const setRigidBodyType = (world: PhysicsWorld, entity: Entity, type: Body) => {
  const rigidbody = world.Rigidbodies.get(entity)
  if (!rigidbody) return

  let typeEnum: RigidBodyType = undefined!
  switch (type) {
    case BodyTypes.Fixed:
    default:
      typeEnum = RigidBodyType.Fixed
      break

    case BodyTypes.Dynamic:
      typeEnum = RigidBodyType.Dynamic
      break

    case BodyTypes.Kinematic:
      typeEnum = RigidBodyType.KinematicPositionBased
      break
  }

  rigidbody.setBodyType(typeEnum, false)

  /** @todo turns out this is a react/rapier bug when it comes to changing the rigidbody type. This is the best workaround I could find*/
  rigidbody.setEnabled(false)
  rigidbody.setEnabled(true)
}

function setRigidbodyPose(
  world: PhysicsWorld,
  entity: Entity,
  position: Vector3,
  rotation: Quaternion,
  linearVelocity: Vector3,
  angularVelocity: Vector3
) {
  const rigidBody = world.Rigidbodies.get(entity)
  if (!rigidBody) return
  rigidBody.setTranslation(position, false)
  rigidBody.setRotation(rotation, false)
  rigidBody.setLinvel(linearVelocity, false)
  rigidBody.setAngvel(angularVelocity, false)
}

function setKinematicRigidbodyPose(world: PhysicsWorld, entity: Entity, position: Vector3, rotation: Quaternion) {
  const rigidBody = world.Rigidbodies.get(entity)
  if (!rigidBody) return
  rigidBody.setNextKinematicTranslation(position)
  rigidBody.setNextKinematicRotation(rotation)
}

function enabledCcd(world: PhysicsWorld, entity: Entity, enabled: boolean) {
  const rigidBody = world.Rigidbodies.get(entity)
  if (!rigidBody) return
  rigidBody.enableCcd(enabled)
}

/**
 * @note `lockRotations(entity, true)` is the exact same as `setEnabledRotations(entity, [ true, true, true ])`
 * @warning
 * Does not unlock in current version (0.11.2). Fixed in 0.12
 * https://github.com/dimforge/rapier.js/issues/282#issuecomment-2177426589
 */
function lockRotations(world: PhysicsWorld, entity: Entity, lock: boolean) {
  const rigidBody = world.Rigidbodies.get(entity)
  if (!rigidBody) return
  rigidBody.lockRotations(lock, false)
}

/**
 * @note `setEnabledRotations(entity, [ true, true, true ])` is the exact same as `lockRotations(entity, true)`
 */
function setEnabledRotations(world: PhysicsWorld, entity: Entity, enabledRotations: [boolean, boolean, boolean]) {
  const rigidBody = world.Rigidbodies.get(entity)
  if (!rigidBody) return
  rigidBody.setEnabledRotations(enabledRotations[0], enabledRotations[1], enabledRotations[2], false)
}

function updatePreviousRigidbodyPose(entities: Entity[]) {
  for (const entity of entities) {
    const world = getWorld(entity)
    if (!world) continue
    const body = world.Rigidbodies.get(entity)
    if (!body) continue
    const translation = body.translation() as Vector3
    const rotation = body.rotation() as Quaternion
    RigidBodyComponent.previousPosition.x[entity] = translation.x
    RigidBodyComponent.previousPosition.y[entity] = translation.y
    RigidBodyComponent.previousPosition.z[entity] = translation.z
    RigidBodyComponent.previousRotation.x[entity] = rotation.x
    RigidBodyComponent.previousRotation.y[entity] = rotation.y
    RigidBodyComponent.previousRotation.z[entity] = rotation.z
    RigidBodyComponent.previousRotation.w[entity] = rotation.w
  }
}

function updateRigidbodyPose(entities: Entity[]) {
  for (const entity of entities) {
    const world = getWorld(entity)
    if (!world) continue
    const body = world.Rigidbodies.get(entity)
    if (!body) continue
    const translation = body.translation() as Vector3
    const rotation = body.rotation() as Quaternion
    const linvel = body.linvel() as Vector3
    const angvel = body.angvel() as Vector3
    RigidBodyComponent.position.x[entity] = translation.x
    RigidBodyComponent.position.y[entity] = translation.y
    RigidBodyComponent.position.z[entity] = translation.z
    RigidBodyComponent.rotation.x[entity] = rotation.x
    RigidBodyComponent.rotation.y[entity] = rotation.y
    RigidBodyComponent.rotation.z[entity] = rotation.z
    RigidBodyComponent.rotation.w[entity] = rotation.w
    RigidBodyComponent.linearVelocity.x[entity] = linvel.x
    RigidBodyComponent.linearVelocity.y[entity] = linvel.y
    RigidBodyComponent.linearVelocity.z[entity] = linvel.z
    RigidBodyComponent.angularVelocity.x[entity] = angvel.x
    RigidBodyComponent.angularVelocity.y[entity] = angvel.y
    RigidBodyComponent.angularVelocity.z[entity] = angvel.z
  }
}

function removeRigidbody(world: PhysicsWorld, entity: Entity) {
  const rigidBody = world.Rigidbodies.get(entity)
  if (rigidBody && world.bodies.contains(rigidBody.handle)) {
    world.removeRigidBody(rigidBody)
    world.Rigidbodies.delete(entity)
  }
}

function applyImpulse(world: PhysicsWorld, entity: Entity, impulse: Vector3) {
  const rigidBody = world.Rigidbodies.get(entity)
  if (!rigidBody) return
  rigidBody.applyImpulse(impulse, true)
}

function createColliderDesc(world: PhysicsWorld, entity: Entity, rootEntity: Entity) {
  if (!world.Rigidbodies.has(rootEntity)) return

  const mesh = getOptionalComponent(entity, MeshComponent)

  const colliderComponent = getComponent(entity, ColliderComponent)

  let shape: ShapeType

  switch (colliderComponent.shape) {
    case Shapes.Sphere:
      shape = ShapeType.Ball
      break
    case Shapes.Box: /*fall-through*/
    case Shapes.Plane:
      shape = ShapeType.Cuboid
      break
    case Shapes.Mesh:
      shape = ShapeType.TriMesh
      break
    case Shapes.ConvexHull:
      shape = ShapeType.ConvexPolyhedron
      break
    case Shapes.Capsule:
      shape = ShapeType.Capsule
      break
    case Shapes.Cylinder:
      shape = ShapeType.Cylinder
      break
    default:
      throw new Error('unrecognized collider shape type: ' + colliderComponent.shape)
  }

  const scale = TransformComponent.getSceneScale(entity, new Vector3())

  let colliderDesc: ColliderDesc

  switch (shape) {
    case ShapeType.Cuboid:
      if (colliderComponent.shape === 'plane') colliderDesc = ColliderDesc.cuboid(10000, 0.001, 10000)
      else {
        if (mesh) {
          // if we have a mesh, we want to make sure it uses the geometry itself to calculate the size
          const _buff = mesh.geometry.clone()
          const box = new Box3().setFromBufferAttribute(_buff.attributes.position as BufferAttribute)
          const size = new Vector3()
          box.getSize(size)
          size.multiply(scale).multiplyScalar(0.5)
          colliderDesc = ColliderDesc.cuboid(Math.abs(size.x), Math.abs(size.y), Math.abs(size.z))
        } else {
          colliderDesc = ColliderDesc.cuboid(Math.abs(scale.x * 0.5), Math.abs(scale.y * 0.5), Math.abs(scale.z * 0.5))
        }
      }
      break

    case ShapeType.Ball:
      colliderDesc = ColliderDesc.ball(Math.abs(scale.x))
      break

    case ShapeType.Capsule:
      colliderDesc = ColliderDesc.capsule(Math.abs(scale.y), Math.abs(scale.x))
      break

    case ShapeType.Cylinder:
      colliderDesc = ColliderDesc.cylinder(Math.abs(scale.y), Math.abs(scale.x))
      break

    case ShapeType.ConvexPolyhedron: {
      if (!mesh?.geometry)
        return console.warn('[Physics]: Tried to load convex mesh but did not find a geometry', mesh) as any
      try {
        const _buff = mesh.geometry.clone().scale(scale.x, scale.y, scale.z)
        const vertices = new Float32Array((_buff.attributes.position as BufferAttribute).array)
        const indices = new Uint32Array(_buff.index!.array)
        colliderDesc = ColliderDesc.convexMesh(vertices, indices) as ColliderDesc
      } catch (e) {
        console.log('Failed to construct collider from trimesh geometry', mesh.geometry, e)
        return
      }
      break
    }

    case ShapeType.TriMesh: {
      if (!mesh?.geometry)
        return console.warn('[Physics]: Tried to load tri mesh but did not find a geometry', mesh) as any
      try {
        const _buff = mesh.geometry.clone().scale(Math.abs(scale.x), Math.abs(scale.y), Math.abs(scale.z))
        const vertices = new Float32Array((_buff.attributes.position as BufferAttribute).array)
        const indices = new Uint32Array(_buff.index!.array)
        colliderDesc = ColliderDesc.trimesh(vertices, indices)
      } catch (e) {
        console.log('Failed to construct collider from trimesh geometry', mesh.geometry, e)
        return
      }
      break
    }

    default:
      console.error('unknown shape', colliderComponent)
      return
  }

  const positionRelativeToRoot = new Vector3()
  const quaternionRelativeToRoot = new Quaternion()

  // get matrix relative to root
  if (rootEntity !== entity) {
    const matrixRelativeToRoot = new Matrix4()
    TransformComponent.getMatrixRelativeToEntity(entity, rootEntity, matrixRelativeToRoot)
    matrixRelativeToRoot.decompose(positionRelativeToRoot, quaternionRelativeToRoot, new Vector3())
  }

  const rootWorldScale = TransformComponent.getWorldScale(rootEntity, new Vector3())
  positionRelativeToRoot.multiply(rootWorldScale)

  colliderDesc.setFriction(colliderComponent.friction)
  colliderDesc.setRestitution(colliderComponent.restitution)

  const collisionLayer = colliderComponent.collisionLayer
  const collisionMask = colliderComponent.collisionMask
  colliderDesc.setCollisionGroups(getInteractionGroups(collisionLayer, collisionMask))

  colliderDesc.setTranslation(positionRelativeToRoot.x, positionRelativeToRoot.y, positionRelativeToRoot.z)
  colliderDesc.setRotation(quaternionRelativeToRoot)

  if (hasComponent(entity, TriggerComponent)) {
    colliderDesc.setSensor(true)
    colliderDesc.setCollisionGroups(getInteractionGroups(CollisionGroups.Trigger, collisionMask))
  }

  // TODO expose these
  colliderDesc.setActiveCollisionTypes(ActiveCollisionTypes.ALL)
  colliderDesc.setActiveEvents(ActiveEvents.COLLISION_EVENTS)

  return colliderDesc
}

function attachCollider(
  world: PhysicsWorld,
  colliderDesc: ColliderDesc,
  rigidBodyEntity: Entity,
  colliderEntity: Entity
) {
  if (world.Colliders.has(colliderEntity)) return
  const rigidBody = world.Rigidbodies.get(rigidBodyEntity) // guaranteed will exist
  if (!rigidBody) return console.error('Rigidbody not found for entity ' + rigidBodyEntity)
  const collider = world.createCollider(colliderDesc, rigidBody)
  collider.userData = { entity: colliderEntity }
  world.Colliders.set(colliderEntity, collider)
  return collider
}

function setColliderPose(world: PhysicsWorld, entity: Entity, position: Vector3, rotation: Quaternion) {
  const collider = world.Colliders.get(entity)
  if (!collider) return
  collider.setTranslationWrtParent(position)
  collider.setRotationWrtParent(rotation)
}

function removeCollider(world: PhysicsWorld, entity: Entity) {
  const collider = world.Colliders.get(entity)
  if (!collider) return
  world.removeCollider(collider, false)
  world.Colliders.delete(entity)
}

function setTrigger(world: PhysicsWorld, entity: Entity, isTrigger: boolean) {
  const collider = world.Colliders.get(entity)
  if (!collider) return
  collider.setSensor(isTrigger)
  const colliderComponent = getComponent(entity, ColliderComponent)
  // if we are a trigger, we need to update the interaction bits of the collision groups to include the trigger group
  const collisionLayer = isTrigger ? CollisionGroups.Trigger : colliderComponent.collisionLayer
  collider.setCollisionGroups(getInteractionGroups(collisionLayer, colliderComponent.collisionMask))
}

function setFriction(world: PhysicsWorld, entity: Entity, friction: number) {
  const collider = world.Colliders.get(entity)
  if (!collider) return
  collider.setFriction(friction)
}

function setRestitution(world: PhysicsWorld, entity: Entity, restitution: number) {
  const collider = world.Colliders.get(entity)
  if (!collider) return
  collider.setRestitution(restitution)
}

function setMass(world: PhysicsWorld, entity: Entity, mass: number) {
  const collider = world.Colliders.get(entity)
  if (!collider) return
  collider.setMass(mass)
}

function setMassCenter(world: PhysicsWorld, entity: Entity, massCenter: Vector3) {
  const collider = world.Colliders.get(entity)
  if (!collider) return
  /** @todo */
  // collider.setMassProperties(massCenter, collider.mass())
}

function setCollisionLayer(world: PhysicsWorld, entity: Entity, collisionLayer: InteractionGroups) {
  const collider = world.Colliders.get(entity)
  if (!collider) return
  const colliderComponent = getComponent(entity, ColliderComponent)
  const _collisionLayer = hasComponent(entity, TriggerComponent)
    ? collisionLayer | ~CollisionGroups.Trigger
    : collisionLayer
  collider.setCollisionGroups(getInteractionGroups(_collisionLayer, colliderComponent.collisionMask))
}

function setCollisionMask(world: PhysicsWorld, entity: Entity, collisionMask: InteractionGroups) {
  const collider = world.Colliders.get(entity)
  if (!collider) return
  const colliderComponent = getComponent(entity, ColliderComponent)
  const collisionLayer = hasComponent(entity, TriggerComponent)
    ? colliderComponent.collisionLayer | ~CollisionGroups.Trigger
    : colliderComponent.collisionLayer
  collider.setCollisionGroups(getInteractionGroups(collisionLayer, collisionMask))
}

function getShape(world: PhysicsWorld, entity: Entity): Shape | undefined {
  const collider = world.Colliders.get(entity)
  if (!collider) return
  return RapierShapeToString[collider.shape.type]
}

function removeCollidersFromRigidBody(entity: Entity, world: PhysicsWorld) {
  const rigidBody = world.Rigidbodies.get(entity)
  if (!rigidBody) return
  const numColliders = rigidBody.numColliders()
  for (let index = 0; index < numColliders; index++) {
    const collider = rigidBody.collider(index)
    world.removeCollider(collider, false)
  }
}

function createCharacterController(
  world: PhysicsWorld,
  entity: Entity,
  {
    offset = 0.01,
    maxSlopeClimbAngle = (60 * Math.PI) / 180,
    minSlopeSlideAngle = (30 * Math.PI) / 180,
    autoStep = { maxHeight: 0.5, minWidth: 0.01, stepOverDynamic: true },
    enableSnapToGround = 0.1 as number | false
  }
) {
  const characterController = world.createCharacterController(offset)
  characterController.setMaxSlopeClimbAngle(maxSlopeClimbAngle)
  characterController.setMinSlopeSlideAngle(minSlopeSlideAngle)
  if (autoStep) characterController.enableAutostep(autoStep.maxHeight, autoStep.minWidth, autoStep.stepOverDynamic)
  if (enableSnapToGround) characterController.enableSnapToGround(enableSnapToGround)
  else characterController.disableSnapToGround()
  world.Controllers.set(entity, characterController)
}

function removeCharacterController(world: PhysicsWorld, entity: Entity) {
  const controller = world.Controllers.get(entity)
  if (!controller) return
  world.removeCharacterController(controller)
  world.Controllers.delete(entity)
}

/**
 * @deprecated - will be populated on AvatarControllerComponent
 */
function getControllerOffset(world: PhysicsWorld, entity: Entity) {
  const controller = world.Controllers.get(entity)
  if (!controller) return 0
  return controller.offset()
}

const controllerMoveFilterFlags = QueryFilterFlags.EXCLUDE_SENSORS

function computeColliderMovement(
  world: PhysicsWorld,
  entity: Entity,
  colliderEntity: Entity,
  desiredTranslation: Vector3,
  filterGroups?: InteractionGroups,
  filterPredicate?: (collider: Collider) => boolean
) {
  const controller = world.Controllers.get(entity)
  if (!controller) return
  const collider = world.Colliders.get(colliderEntity)
  if (!collider) return
  controller.computeColliderMovement(
    collider,
    desiredTranslation,
    controllerMoveFilterFlags,
    filterGroups,
    filterPredicate
  )
}

function getComputedMovement(world: PhysicsWorld, entity: Entity, out: Vector3) {
  const controller = world.Controllers.get(entity)
  if (!controller) return out.set(0, 0, 0)
  return out.copy(controller.computedMovement() as Vector3)
}

export type RaycastArgs = {
  type: SceneQueryType
  origin: Vector3
  direction: Vector3
  maxDistance: number
  groups: InteractionGroups
  flags?: QueryFilterFlags
  excludeCollider?: Entity
  excludeRigidBody?: Entity
}

const _worldInverseMatrix = new Matrix4()
const _origin = new Vector3()
const _direction = new Vector3()
const _quaternion = new Quaternion()
const _vector3 = new Vector3()
/**
 * Raycast from a world position and direction
 */
function castRay(world: PhysicsWorld, raycastQuery: RaycastArgs, filterPredicate?: (collider: Collider) => boolean) {
  const worldEntity = UUIDComponent.getEntityByUUID(world.id)
  const worldTransform = getComponent(worldEntity, TransformComponent)
  _worldInverseMatrix.copy(worldTransform.matrixWorld).invert()

  const ray = new Ray(
    _origin.copy(raycastQuery.origin).applyMatrix4(_worldInverseMatrix),
    _direction
      .copy(raycastQuery.direction)
      .applyQuaternion(_quaternion.copy(worldTransform.rotation).invert())
      .multiply(_vector3.set(1 / worldTransform.scale.x, 1 / worldTransform.scale.y, 1 / worldTransform.scale.z))
  )
  const maxToi = raycastQuery.maxDistance
  const solid = true // TODO: Add option for this in args
  const groups = raycastQuery.groups
  const flags = raycastQuery.flags

  const excludeCollider = raycastQuery.excludeCollider && world.Colliders.get(raycastQuery.excludeCollider)
  const excludeRigidBody = raycastQuery.excludeRigidBody && world.Rigidbodies.get(raycastQuery.excludeRigidBody)

  const hits = [] as RaycastHit[]
  const hitWithNormal = world.castRayAndGetNormal(
    ray,
    maxToi,
    solid,
    flags,
    groups,
    excludeCollider,
    excludeRigidBody,
    filterPredicate
  )
  if (hitWithNormal?.collider) {
    const body = hitWithNormal.collider.parent() as RigidBody
    if (!body) {
      //console.warn('No rigid body found for collider', hitWithNormal.collider)
    } else
      hits.push({
        collider: hitWithNormal.collider,
        distance: hitWithNormal.toi,
        position: ray.pointAt(hitWithNormal.toi),
        normal: hitWithNormal.normal,
        body,
        entity: (body.userData as any)['entity']
      })
  }

  return hits
}

const _perspectiveCamera = new PerspectiveCamera()
const _orthographicCamera = new OrthographicCamera()

function castRayFromCamera(
  world: PhysicsWorld,
  camera: PerspectiveCamera | OrthographicCamera,
  coords: Vector2,
  raycastQuery: RaycastArgs,
  filterPredicate?: (collider: Collider) => boolean
) {
  const worldEntity = UUIDComponent.getEntityByUUID(world.id)
  const worldTransform = getComponent(worldEntity, TransformComponent)

  if ((camera as PerspectiveCamera).isPerspectiveCamera) {
    _perspectiveCamera.copy(camera as PerspectiveCamera)
    _perspectiveCamera.updateProjectionMatrix()
    _perspectiveCamera.matrixWorld.copy(worldTransform.matrixWorld).invert().multiply(camera.matrixWorld)
    raycastQuery.origin.setFromMatrixPosition(_perspectiveCamera.matrixWorld)
    raycastQuery.direction
      .set(coords.x, coords.y, 0.5)
      .unproject(_perspectiveCamera)
      .sub(raycastQuery.origin)
      .normalize()
  } else if ((camera as OrthographicCamera).isOrthographicCamera) {
    _orthographicCamera.copy(camera as OrthographicCamera)
    _orthographicCamera.updateProjectionMatrix()
    _orthographicCamera.matrixWorld.copy(worldTransform.matrixWorld).invert().multiply(camera.matrixWorld)
    raycastQuery.origin
      .set(coords.x, coords.y, (camera.near + camera.far) / (camera.near - camera.far))
      .unproject(_orthographicCamera)
    raycastQuery.direction.set(0, 0, -1).transformDirection(_orthographicCamera.matrixWorld)
  }
  return Physics.castRay(world, raycastQuery, filterPredicate)
}

export type ShapecastArgs = {
  type: SceneQueryType
  hits: RaycastHit[]
  collider: Collider
  direction: Vector3
  maxDistance: number
  collisionGroups: InteractionGroups
}

function castShape(world: PhysicsWorld, shapecastQuery: ShapecastArgs) {
  const maxToi = shapecastQuery.maxDistance
  const groups = shapecastQuery.collisionGroups
  const collider = shapecastQuery.collider

  shapecastQuery.hits = []
  const hitWithNormal = world.castShape(
    collider.translation(),
    collider.rotation(),
    shapecastQuery.direction,
    collider.shape,
    maxToi,
    true,
    groups
  )
  if (hitWithNormal != null) {
    shapecastQuery.hits.push({
      distance: hitWithNormal.toi,
      position: hitWithNormal.witness1,
      normal: hitWithNormal.normal1,
      collider: hitWithNormal.collider,
      body: hitWithNormal.collider.parent() as RigidBody,
      entity: (hitWithNormal.collider.parent()?.userData as any)['entity'] ?? UndefinedEntity
    })
  }
}

const drainCollisionEventQueue =
  (physicsWorld: PhysicsWorld) => (handle1: number, handle2: number, started: boolean) => {
    const collider1 = physicsWorld.getCollider(handle1)
    const collider2 = physicsWorld.getCollider(handle2)
    if (!collider1 || !collider2) return

    const isTriggerEvent = collider1.isSensor() || collider2.isSensor()
    const rigidBody1 = collider1.parent()
    const rigidBody2 = collider2.parent()
    const entity1 = (rigidBody1?.userData as any)['entity']
    const entity2 = (rigidBody2?.userData as any)['entity']

    setComponent(entity1, CollisionComponent)
    setComponent(entity2, CollisionComponent)

    const collisionComponent1 = getComponent(entity1, CollisionComponent)
    const collisionComponent2 = getComponent(entity2, CollisionComponent)

    if (started) {
      const type = isTriggerEvent ? CollisionEvents.TRIGGER_START : CollisionEvents.COLLISION_START
      collisionComponent1?.set(entity2, {
        type,
        bodySelf: rigidBody1 as RigidBody,
        bodyOther: rigidBody2 as RigidBody,
        shapeSelf: collider1 as Collider,
        shapeOther: collider2 as Collider,
        maxForceDirection: null,
        totalForce: null
      })
      collisionComponent2?.set(entity1, {
        type,
        bodySelf: rigidBody2 as RigidBody,
        bodyOther: rigidBody1 as RigidBody,
        shapeSelf: collider2 as Collider,
        shapeOther: collider1 as Collider,
        maxForceDirection: null,
        totalForce: null
      })
    } else {
      const type = isTriggerEvent ? CollisionEvents.TRIGGER_END : CollisionEvents.COLLISION_END
      if (collisionComponent1?.has(entity2)) collisionComponent1.get(entity2)!.type = type
      if (collisionComponent2?.has(entity1)) collisionComponent2.get(entity1)!.type = type
    }
  }

const drainContactEventQueue = (physicsWorld: PhysicsWorld) => (event: TempContactForceEvent) => {
  const collider1 = physicsWorld.getCollider(event.collider1())
  const collider2 = physicsWorld.getCollider(event.collider2())

  const rigidBody1 = collider1.parent()
  const rigidBody2 = collider2.parent()
  const entity1 = (rigidBody1?.userData as any)['entity']
  const entity2 = (rigidBody2?.userData as any)['entity']

  const collisionComponent1 = getOptionalComponent(entity1, CollisionComponent)
  const collisionComponent2 = getOptionalComponent(entity2, CollisionComponent)

  const collision1 = collisionComponent1?.get(entity2)
  const collision2 = collisionComponent2?.get(entity1)

  const maxForceDirection = event.maxForceDirection()
  const totalForce = event.totalForce()

  if (collision1) {
    collision1.maxForceDirection = maxForceDirection
    collision1.totalForce = totalForce
  }

  if (collision2) {
    collision2.maxForceDirection = maxForceDirection
    collision2.totalForce = totalForce
  }
}

export const Physics = {
  load,
  createWorld,
  destroyWorld,
  getWorld,
  useWorld,
  smoothKinematicBody,
  simulate,
  /** world.Rigidbodies */
  createRigidBody,
  removeRigidbody,
  isSleeping,
  wakeUp,
  setRigidBodyType,
  setRigidbodyPose,
  enabledCcd,
  lockRotations,
  setEnabledRotations,
  updatePreviousRigidbodyPose,
  updateRigidbodyPose,
  setKinematicRigidbodyPose,
  applyImpulse,
  /** Colliders */
  createColliderDesc,
  attachCollider,
  setColliderPose,
  setTrigger,
  setFriction,
  setRestitution,
  setMass,
  setMassCenter,
  setCollisionLayer,
  setCollisionMask,
  getShape,
  removeCollider,
  removeCollidersFromRigidBody,
  /** Charcter Controller */
  createCharacterController,
  removeCharacterController,
  computeColliderMovement,
  getComputedMovement,
  getControllerOffset,
  /** Raycasts */
  castRay,
  castRayFromCamera,
  castShape,
  /** Collisions */
  createCollisionEventQueue,
  drainCollisionEventQueue,
  drainContactEventQueue
}

globalThis.Physics = Physics
