// This file will be renamed to Physics.ts when we are ready to take out physx completely.
import RAPIER, { ColliderDesc, Ray, RigidBody, RigidBodyDesc, RigidBodyType, World } from '@dimforge/rapier3d-compat'

import { Entity } from '../../ecs/classes/Entity'
import { addComponent, ComponentType, getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { RaycastComponent } from '../components/RaycastComponent'
import { RigidBodyComponent } from '../components/RigidBodyComponent'
import { getTagComponentForRigidBody } from '../functions/getTagComponentForRigidBody'

export type PhysicsWorld = World

function load() {
  // eslint-disable-next-line import/no-named-as-default-member
  return RAPIER.init()
}

function createWorld(gravity = { x: 0.0, y: -9.81, z: 0.0 }) {
  const world = new World(gravity)
  return world
}

function createRigidBody(entity: Entity, world: World, rigidBodyDesc: RigidBodyDesc, colliderDesc: ColliderDesc[]) {
  const rigidBody = world.createRigidBody(rigidBodyDesc)
  colliderDesc.forEach((desc) => world.createCollider(desc, rigidBody))

  addComponent(entity, RigidBodyComponent, rigidBody)

  const RigidBodyTypeTagComponent = getTagComponentForRigidBody(rigidBody)
  addComponent(entity, RigidBodyTypeTagComponent, true)

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

export const Physics = {
  load,
  createWorld,
  createRigidBody,
  removeRigidBody,
  changeRigidbodyType,
  castRay
}
