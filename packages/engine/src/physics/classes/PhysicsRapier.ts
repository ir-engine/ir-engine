// This file will be renamed to Physics.ts when we are ready to take out physx completely.
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

import { mergeBufferGeometries } from '../../common/classes/BufferGeometryUtils'
import { createVector3Proxy } from '../../common/proxies/three'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, ComponentType, getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { RapierCollisionComponent } from '../components/RapierCollisionComponent'
import { RaycastComponent } from '../components/RaycastComponent'
import { RigidBodyComponent } from '../components/RigidBodyComponent'
import { VelocityComponent } from '../components/VelocityComponent'
import { CollisionGroups, DefaultCollisionMask } from '../enums/CollisionGroups'
import { getInteractionGroups } from '../functions/getInteractionGroups'
import { getTagComponentForRigidBody } from '../functions/getTagComponentForRigidBody'
import { ColliderDescOptions, ColliderHitEvent, CollisionEvents } from '../types/PhysicsTypes'

export type PhysicsWorld = World

const tempQuat = new Quaternion()
const tempVector3 = new Vector3()

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

function createColliderDesc(mesh: Mesh, colliderDescOptions: ColliderDescOptions): ColliderDesc {
  // Type is required
  const shapeOptions = colliderDescOptions
  if (shapeOptions.type && typeof shapeOptions.type === 'number') {
    const meshScale = mesh.getWorldScale(tempVector3)
    // If custom size has been provided use that else use mesh world scale.
    const colliderSize = shapeOptions.size ? shapeOptions.size : meshScale

    // Check for case mismatch
    if (
      typeof shapeOptions.collisionLayer === 'undefined' &&
      typeof (shapeOptions as any).collisionlayer !== 'undefined'
    )
      shapeOptions.collisionLayer = (shapeOptions as any).collisionlayer
    if (typeof shapeOptions.collisionMask === 'undefined' && typeof (shapeOptions as any).collisionmask !== 'undefined')
      shapeOptions.collisionMask = (shapeOptions as any).collisionmask

    let colliderDesc: ColliderDesc
    let geometry, vertices, indices
    switch (shapeOptions.type as ShapeType) {
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

      case ShapeType.ConvexPolyhedron:
        geometry = mergeBufferGeometries([mesh.geometry]) // TODO: is this needed?
        vertices = new Float32Array(geometry!.attributes.position.array)
        indices = new Uint32Array(geometry!.index!.array)
        colliderDesc = ColliderDesc.convexMesh(vertices, indices) as ColliderDesc
        break

      case ShapeType.TriMesh:
        geometry = mergeBufferGeometries([mesh.geometry]) // TODO: is this needed?
        vertices = new Float32Array(geometry!.attributes.position.array)
        indices = new Uint32Array(geometry!.index!.array)
        colliderDesc = ColliderDesc.trimesh(vertices, indices)
        break

      default:
        console.error('unknown shape', shapeOptions)
        return undefined!
    }
    shapeOptions.friction ? colliderDesc.setFriction(shapeOptions.friction) : 0
    shapeOptions.restitution ? colliderDesc.setRestitution(shapeOptions.restitution) : 0

    const collisionLayer = shapeOptions.collisionLayer ? shapeOptions.collisionLayer : CollisionGroups.Default
    const collisionMask = shapeOptions.collisionMask ? shapeOptions.collisionMask : DefaultCollisionMask
    colliderDesc.setCollisionGroups(getInteractionGroups(collisionLayer, collisionMask))

    colliderDesc.setTranslation(mesh.position.x, mesh.position.y, mesh.position.z)
    colliderDesc.setRotation(mesh.quaternion)

    shapeOptions.isTrigger ? colliderDesc.setSensor(shapeOptions.isTrigger) : 0
    shapeOptions.activeCollisionTypes
      ? colliderDesc.setActiveCollisionTypes(shapeOptions.activeCollisionTypes)
      : colliderDesc.setActiveCollisionTypes(ActiveCollisionTypes.ALL)
    colliderDesc.setActiveEvents(ActiveEvents.COLLISION_EVENTS)

    return colliderDesc
  }

  return undefined!
}

function createRigidBodyForObject(
  entity: Entity,
  world: World,
  object: Object3D,
  colliderDescOptionsForRoot: ColliderDescOptions
): RigidBody {
  if (!object) return undefined!

  const colliderDescs = [] as ColliderDesc[]
  if ((object as Mesh).isMesh) {
    const colliderDescForRoot = createColliderDesc(object as Mesh, colliderDescOptionsForRoot)
    if (colliderDescForRoot) colliderDescs.push(colliderDescForRoot)
  }

  if ('bodyType' in colliderDescOptionsForRoot) {
    const rigidBodyType = colliderDescOptionsForRoot['bodyType']

    object.traverse((mesh: Mesh) => {
      const colliderDesc = createColliderDesc(mesh, mesh.userData as ColliderDescOptions)
      if (colliderDesc) colliderDescs.push(colliderDesc)
    })

    let rigidBodyDesc
    switch (rigidBodyType) {
      case RigidBodyType.Dynamic:
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
  } else {
    return undefined!
  }
}

function removeCollidersFromRigidBody(entity: Entity, world: World) {
  const rigidBody = getComponent(entity, RigidBodyComponent)
  for (let index = 0; index < rigidBody.numColliders(); index++) {
    const collider = rigidBody.collider(index)
    world.removeCollider(collider, true)
  }
}

function resizeColliders(entity: Entity, colliderDescs: ColliderDesc[], world: World) {
  const rigidBody = getComponent(entity, RigidBodyComponent)
  removeCollidersFromRigidBody(entity, world)
  colliderDescs.forEach((desc) => world.createCollider(desc, rigidBody))
}

function removeRigidBody(entity: Entity, world: World) {
  const rigidBody = getComponent(entity, RigidBodyComponent)
  if (rigidBody && world.bodies.contains(rigidBody.handle)) {
    const RigidBodyTypeTagComponent = getTagComponentForRigidBody(rigidBody)
    removeComponent(entity, RigidBodyTypeTagComponent)
    removeComponent(entity, RigidBodyComponent)

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

    console.log(collider1, collider2, started)
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
  createRigidBodyForObject,
  resizeColliders,
  removeRigidBody,
  changeRigidbodyType,
  castRay,
  createCollisionEventQueue,
  drainCollisionEventQueue
}
