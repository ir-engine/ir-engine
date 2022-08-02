import RAPIER, {
  ActiveCollisionTypes,
  ActiveEvents,
  Collider,
  ColliderDesc,
  EventQueue,
  Ray,
  RigidBody,
  RigidBodyDesc,
  RigidBodyType,
  ShapeType,
  World
} from '@dimforge/rapier3d-compat'
import { Mesh, Object3D, Quaternion, Vector3 } from 'three'

import { createVector3Proxy } from '../../common/proxies/three'
import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  ComponentType,
  getComponent,
  hasComponent,
  removeComponent
} from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { RapierCollisionComponent } from '../components/RapierCollisionComponent'
import { RaycastComponent } from '../components/RaycastComponent'
import { RigidBodyComponent } from '../components/RigidBodyComponent'
import { ShapecastComponent } from '../components/ShapeCastComponent'
import { VelocityComponent } from '../components/VelocityComponent'
import { CollisionGroups, DefaultCollisionMask } from '../enums/CollisionGroups'
import { getInteractionGroups } from '../functions/getInteractionGroups'
import { getTagComponentForRigidBody } from '../functions/getTagComponentForRigidBody'
import { ColliderDescOptions, ColliderHitEvent, CollisionEvents } from '../types/PhysicsTypes'

export type PhysicsWorld = World

function load() {
  // eslint-disable-next-line import/no-named-as-default-member
  return RAPIER.init()
}

function createWorld(gravity = { x: 0.0, y: -9.81, z: 0.0 }) {
  const world = new World(gravity)
  return world
}

function createCollisionEventQueue() {
  const collisionEventQueue = new EventQueue(true)
  return collisionEventQueue
}

function createRigidBody(entity: Entity, world: World, rigidBodyDesc: RigidBodyDesc, colliderDesc: ColliderDesc[]) {
  // apply the initial transform if there is one
  if (hasComponent(entity, TransformComponent)) {
    const { position, rotation } = getComponent(entity, TransformComponent)
    rigidBodyDesc.setTranslation(
      position.x + rigidBodyDesc.translation.x,
      position.y + rigidBodyDesc.translation.y,
      position.z + rigidBodyDesc.translation.z
    )
    rigidBodyDesc.setRotation(
      new Quaternion().copy(rotation).multiply(new Quaternion().copy(rigidBodyDesc.rotation as Quaternion))
    )
  }

  const rigidBody = world.createRigidBody(rigidBodyDesc)
  colliderDesc.forEach((desc) => world.createCollider(desc, rigidBody))

  addComponent(entity, RigidBodyComponent, rigidBody)

  const RigidBodyTypeTagComponent = getTagComponentForRigidBody(rigidBody)
  addComponent(entity, RigidBodyTypeTagComponent, true)

  // set entity in userdata for fast look up when required.
  const rigidBodyUserdata = { entity: entity }
  rigidBody.userData = rigidBodyUserdata

  // TODO: Add only when dynamic or kinematic?
  const linearVelocity = createVector3Proxy(VelocityComponent.linear, entity)
  const angularVelocity = createVector3Proxy(VelocityComponent.angular, entity)
  addComponent(entity, VelocityComponent, { linear: linearVelocity, angular: angularVelocity })

  return rigidBody
}

function applyDescToCollider(
  colliderDesc: ColliderDesc,
  shapeOptions: ColliderDescOptions,
  position: Vector3,
  quaternion: Quaternion
) {
  if (typeof shapeOptions.friction !== 'undefined') colliderDesc.setFriction(shapeOptions.friction)
  if (typeof shapeOptions.restitution !== 'undefined') colliderDesc.setRestitution(shapeOptions.restitution)

  const collisionLayer =
    typeof shapeOptions.collisionLayer !== 'undefined' ? Number(shapeOptions.collisionLayer) : CollisionGroups.Default
  const collisionMask =
    typeof shapeOptions.collisionMask !== 'undefined' ? Number(shapeOptions.collisionMask) : DefaultCollisionMask
  colliderDesc.setCollisionGroups(getInteractionGroups(collisionLayer, collisionMask))

  colliderDesc.setTranslation(position.x, position.y, position.z)
  colliderDesc.setRotation(quaternion)

  if (typeof shapeOptions.isTrigger !== 'undefined') colliderDesc.setSensor(shapeOptions.isTrigger)

  shapeOptions.activeCollisionTypes
    ? colliderDesc.setActiveCollisionTypes(shapeOptions.activeCollisionTypes)
    : colliderDesc.setActiveCollisionTypes(ActiveCollisionTypes.ALL)
  colliderDesc.setActiveEvents(ActiveEvents.COLLISION_EVENTS)
}

function createColliderDesc(mesh: Mesh, colliderDescOptions: ColliderDescOptions): ColliderDesc {
  // Type is required
  if (typeof colliderDescOptions.type === 'undefined') return undefined!

  let shapeType =
    typeof colliderDescOptions.type === 'string' ? ShapeType[colliderDescOptions.type] : colliderDescOptions.type
  //check for old collider types to allow backwards compatibility
  if (typeof shapeType === 'undefined') {
    switch (colliderDescOptions.type as unknown as string) {
      case 'box':
        shapeType = ShapeType['Cuboid']
        break
      case 'trimesh':
        shapeType = ShapeType['TriMesh']
        break
      default:
        console.error('unrecognized collider shape type: ' + colliderDescOptions.type)
    }
  }

  // If custom size has been provided use that else use mesh scale
  const colliderSize = colliderDescOptions.size ? colliderDescOptions.size : mesh.scale

  // Check for case mismatch
  if (
    typeof colliderDescOptions.collisionLayer === 'undefined' &&
    typeof (colliderDescOptions as any).collisionlayer !== 'undefined'
  )
    colliderDescOptions.collisionLayer = (colliderDescOptions as any).collisionlayer
  if (
    typeof colliderDescOptions.collisionMask === 'undefined' &&
    typeof (colliderDescOptions as any).collisionmask !== 'undefined'
  )
    colliderDescOptions.collisionMask = (colliderDescOptions as any).collisionmask

  let colliderDesc: ColliderDesc
  switch (shapeType as ShapeType) {
    case ShapeType.Cuboid:
      colliderDesc = ColliderDesc.cuboid(Math.abs(colliderSize.x), Math.abs(colliderSize.y), Math.abs(colliderSize.z))
      break

    case ShapeType.Ball:
      colliderDesc = ColliderDesc.ball(Math.abs(colliderSize.x))
      break

    case ShapeType.Capsule:
      colliderDesc = ColliderDesc.capsule(Math.abs(colliderSize.y), Math.abs(colliderSize.x))
      break

    case ShapeType.Cylinder:
      colliderDesc = ColliderDesc.cylinder(Math.abs(colliderSize.y), Math.abs(colliderSize.x))
      break

    case ShapeType.ConvexPolyhedron: {
      if (!mesh.geometry)
        return console.warn('[Physics]: Tried to load convex mesh but did not find a geometry', mesh) as any
      const _buff = mesh.geometry
        .clone()
        .scale(Math.abs(colliderSize.x), Math.abs(colliderSize.y), Math.abs(colliderSize.z))
      const vertices = new Float32Array(_buff.attributes.position.array)
      const indices = new Uint32Array(_buff.index!.array)
      colliderDesc = ColliderDesc.convexMesh(vertices, indices) as ColliderDesc
      break
    }

    case ShapeType.TriMesh: {
      if (!mesh.geometry)
        return console.warn('[Physics]: Tried to load tri mesh but did not find a geometry', mesh) as any
      const _buff = mesh.geometry
        .clone()
        .scale(Math.abs(colliderSize.x), Math.abs(colliderSize.y), Math.abs(colliderSize.z))
      const vertices = new Float32Array(_buff.attributes.position.array)
      const indices = new Uint32Array(_buff.index!.array)
      colliderDesc = ColliderDesc.trimesh(vertices, indices)
      break
    }

    default:
      console.error('unknown shape', colliderDescOptions)
      return undefined!
  }

  applyDescToCollider(colliderDesc, colliderDescOptions, mesh.position, mesh.quaternion)

  return colliderDesc
}

function createRigidBodyForObject(
  entity: Entity,
  world: World,
  object: Object3D,
  colliderDescOptionsForRoot: ColliderDescOptions
): RigidBody {
  if (!object) return undefined!
  const colliderDescs = [] as ColliderDesc[]

  // create collider desc using userdata of each child mesh
  object.traverse((mesh: Mesh) => {
    const colliderDesc = createColliderDesc(
      mesh,
      mesh === object ? { ...colliderDescOptionsForRoot, ...mesh.userData } : (mesh.userData as ColliderDescOptions)
    )
    if (colliderDesc) colliderDescs.push(colliderDesc)
  })

  const rigidBodyType =
    typeof colliderDescOptionsForRoot['bodyType'] === 'string'
      ? RigidBodyType[colliderDescOptionsForRoot['bodyType']]
      : colliderDescOptionsForRoot['bodyType']

  let rigidBodyDesc: RigidBodyDesc = undefined!
  switch (rigidBodyType) {
    case RigidBodyType.Dynamic:
    default:
      rigidBodyDesc = RigidBodyDesc.dynamic()
      break

    case RigidBodyType.Fixed:
      rigidBodyDesc = RigidBodyDesc.fixed()
      break

    case RigidBodyType.KinematicPositionBased:
      rigidBodyDesc = RigidBodyDesc.kinematicPositionBased()
      break

    case RigidBodyType.KinematicVelocityBased:
      rigidBodyDesc = RigidBodyDesc.kinematicVelocityBased()
      break
  }

  return createRigidBody(entity, world, rigidBodyDesc, colliderDescs)
}

function createColliderAndAttachToRigidBody(world: World, colliderDesc: ColliderDesc, rigidBody: RigidBody): Collider {
  return world.createCollider(colliderDesc, rigidBody)
}

function removeCollidersFromRigidBody(entity: Entity, world: World) {
  const rigidBody = getComponent(entity, RigidBodyComponent)
  const numColliders = rigidBody.numColliders()
  for (let index = 0; index < numColliders; index++) {
    const collider = rigidBody.collider(0)
    world.removeCollider(collider, true)
  }
}

function removeRigidBody(entity: Entity, world: World, hasBeenRemoved = false) {
  const rigidBody = getComponent(entity, RigidBodyComponent, hasBeenRemoved)
  if (rigidBody && world.bodies.contains(rigidBody.handle)) {
    if (!hasBeenRemoved) {
      const RigidBodyTypeTagComponent = getTagComponentForRigidBody(rigidBody)
      removeComponent(entity, RigidBodyTypeTagComponent)
      removeComponent(entity, RigidBodyComponent)
    }

    world.removeRigidBody(rigidBody)
  }
}

function changeRigidbodyType(entity: Entity, newType: RigidBodyType) {
  const rigidBody = getComponent(entity, RigidBodyComponent)
  const currentRigidBodyTypeTagComponent = getTagComponentForRigidBody(rigidBody)

  removeComponent(entity, currentRigidBodyTypeTagComponent)

  rigidBody.setBodyType(newType)

  const newRigidBodyComponent = getTagComponentForRigidBody(rigidBody)
  addComponent(entity, newRigidBodyComponent, true)
}

function castRay(world: World, raycastQuery: ComponentType<typeof RaycastComponent>) {
  const ray = new Ray(
    { x: raycastQuery.origin.x, y: raycastQuery.origin.y, z: raycastQuery.origin.z },
    { x: raycastQuery.direction.x, y: raycastQuery.direction.y, z: raycastQuery.direction.z }
  )
  const maxToi = raycastQuery.maxDistance
  const solid = true // TODO: Add option for this in RaycastComponent?
  const groups = raycastQuery.flags

  raycastQuery.hits = []
  let hitWithNormal = world.castRayAndGetNormal(ray, maxToi, solid, groups)
  if (hitWithNormal != null) {
    raycastQuery.hits.push({
      distance: hitWithNormal.toi,
      position: ray.pointAt(hitWithNormal.toi),
      normal: hitWithNormal.normal,
      body: hitWithNormal.collider.parent() as RigidBody
    })
  }
}

function castShape(world: World, shapecastQuery: ComponentType<typeof ShapecastComponent>) {
  const maxToi = shapecastQuery.maxDistance
  const groups = shapecastQuery.collisionGroups
  const collider = shapecastQuery.collider

  shapecastQuery.hits = []
  let hitWithNormal = world.castShape(
    collider.translation(),
    collider.rotation(),
    shapecastQuery.direction,
    collider.shape,
    maxToi,
    groups
  )
  if (hitWithNormal != null) {
    shapecastQuery.hits.push({
      distance: hitWithNormal.toi,
      position: hitWithNormal.witness1,
      normal: hitWithNormal.normal1,
      collider: hitWithNormal.collider,
      body: hitWithNormal.collider.parent() as RigidBody
    })
  }
}

function drainCollisionEventQueue(world: World, collisionEventQueue: EventQueue) {
  collisionEventQueue.drainCollisionEvents(function (handle1: number, handle2: number, started: boolean) {
    const isTriggerEvent = world.getCollider(handle1).isSensor() || world.getCollider(handle2).isSensor()
    let collisionEventType: CollisionEvents
    if (started) {
      if (isTriggerEvent) collisionEventType = CollisionEvents.TRIGGER_START
      else collisionEventType = CollisionEvents.COLLISION_START
    } else {
      if (isTriggerEvent) collisionEventType = CollisionEvents.TRIGGER_END
      else collisionEventType = CollisionEvents.COLLISION_END
    }

    const collider1 = world.getCollider(handle1)
    const collider2 = world.getCollider(handle2)
    const rigidBody1 = collider1.parent()
    const rigidBody2 = collider2.parent()
    const entity1 = (rigidBody1?.userData as any)['entity']
    const entity2 = (rigidBody2?.userData as any)['entity']

    const collisionComponent1 = getComponent(entity1, RapierCollisionComponent)
    const collisionComponent2 = getComponent(entity2, RapierCollisionComponent)

    let collisionMap1: Map<Entity, ColliderHitEvent>
    let collisionMap2: Map<Entity, ColliderHitEvent>
    if (started) {
      // If component already exists on entity, add the new collision event to it
      if (collisionComponent1) {
        collisionMap1 = collisionComponent1.collisions
      }
      // else add the component to entity & then add the new collision event to it
      else {
        collisionMap1 = new Map<Entity, ColliderHitEvent>()
        addComponent(entity1, RapierCollisionComponent, { collisions: collisionMap1 })
      }

      collisionMap1.set(entity2, {
        type: collisionEventType,
        bodySelf: rigidBody1 as RigidBody,
        bodyOther: rigidBody2 as RigidBody,
        shapeSelf: collider1 as Collider,
        shapeOther: collider2 as Collider,
        contacts: undefined
      })

      // If component already exists on entity, add the new collision event to it
      if (collisionComponent2) {
        collisionMap2 = collisionComponent2.collisions
      }
      // else add the component to entity & then add the new collision event to it
      else {
        collisionMap2 = new Map<Entity, ColliderHitEvent>()
        addComponent(entity2, RapierCollisionComponent, { collisions: collisionMap2 })
      }

      collisionMap2.set(entity1, {
        type: collisionEventType,
        bodySelf: rigidBody2 as RigidBody,
        bodyOther: rigidBody1 as RigidBody,
        shapeSelf: collider2 as Collider,
        shapeOther: collider1 as Collider,
        contacts: undefined
      })
    } else {
      if (collisionComponent1) {
        collisionMap1 = collisionComponent1.collisions
        collisionMap1.delete(entity2)
        if (collisionMap1.size === 0) removeComponent(entity1, RapierCollisionComponent)
      }

      if (collisionComponent2) {
        collisionMap2 = collisionComponent2.collisions
        collisionMap2.delete(entity1)
        if (collisionMap2.size === 0) removeComponent(entity2, RapierCollisionComponent)
      }
    }
  })
}

export const Physics = {
  load,
  createWorld,
  createRigidBody,
  createColliderDesc,
  applyDescToCollider,
  createRigidBodyForObject,
  createColliderAndAttachToRigidBody,
  removeCollidersFromRigidBody,
  removeRigidBody,
  changeRigidbodyType,
  castRay,
  castShape,
  createCollisionEventQueue,
  drainCollisionEventQueue
}
