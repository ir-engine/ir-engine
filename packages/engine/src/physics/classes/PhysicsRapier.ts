// This file will be renamed to Physics.ts when we are ready to take out physx completely.
import RAPIER, {
  Collider,
  ColliderDesc,
  EventQueue,
  Ray,
  RigidBody,
  RigidBodyDesc,
  RigidBodyType,
  World
} from '@dimforge/rapier3d-compat'

import { Entity } from '../../ecs/classes/Entity'
import { addComponent, ComponentType, getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { RapierCollisionComponent } from '../components/RapierCollisionComponent'
import { RaycastComponent } from '../components/RaycastComponent'
import { RigidBodyComponent } from '../components/RigidBodyComponent'
import { getTagComponentForRigidBody } from '../functions/getTagComponentForRigidBody'
import { ColliderHitEvent, CollisionEvents } from '../types/PhysicsTypes'

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
  const rigidBody = world.createRigidBody(rigidBodyDesc)
  colliderDesc.forEach((desc) => world.createCollider(desc, rigidBody))

  addComponent(entity, RigidBodyComponent, rigidBody)

  const RigidBodyTypeTagComponent = getTagComponentForRigidBody(rigidBody)
  addComponent(entity, RigidBodyTypeTagComponent, true)

  // set entity in userdata for fast look up when required.
  const rigidBodyUserdata = { entity: entity }
  rigidBody.userData = rigidBodyUserdata

  return rigidBody
}

// TODO: Do we need dedicated functions for creating these type of colliders?
// function createTrimesh() {}
// function convexMesh() {}

function removeRigidBody(entity: Entity, world: World) {
  const rigidBody = getComponent(entity, RigidBodyComponent)
  const RigidBodyTypeTagComponent = getTagComponentForRigidBody(rigidBody)
  removeComponent(entity, RigidBodyTypeTagComponent)
  removeComponent(entity, RigidBodyComponent)

  world.removeRigidBody(rigidBody)
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
  removeRigidBody,
  changeRigidbodyType,
  castRay,
  createCollisionEventQueue,
  drainCollisionEventQueue
}
