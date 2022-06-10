// This file will be renamed to Physics.ts when we are ready to take out physx completely.
import RAPIER, { ColliderDesc, RigidBody, RigidBodyDesc, RigidBodyType, World } from '@dimforge/rapier3d-compat'

import { Entity } from '../../ecs/classes/Entity'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { RigidBodyDynamicComponent } from '../components/RigidBodyDynamicComponent'

export type Rapier = typeof RAPIER
export type PhysicsWorld = World

function load() {
  // eslint-disable-next-line import/no-named-as-default-member
  return RAPIER.init()
}

function createWorld(gravity = { x: 0.0, y: -9.81, z: 0.0 }) {
  const world = new World(gravity)
  return world
}

function createRigidBody(entity: Entity, world: World, rigidBodyDesc: RigidBodyDesc, colliderDesc: ColliderDesc) {
  const rigidBody = world.createRigidBody(rigidBodyDesc)
  const collider = world.createCollider(colliderDesc, rigidBody)

  switch (rigidBody.bodyType()) {
    case RigidBodyType.Dynamic:
      addComponent(entity, RigidBodyDynamicComponent, {
        rigidBody: rigidBody,
        rigidBodyDesc: rigidBodyDesc,
        collider: collider
      })
      break

    case RigidBodyType.Fixed:
      break

    case RigidBodyType.KinematicPositionBased:
      break

    case RigidBodyType.KinematicVelocityBased:
      break
  }

  return rigidBody
}

function removeRigidBody(world: World, rigidBody: RigidBody) {
  world.removeRigidBody(rigidBody)
}

function changeRigidbodyType(rigidBody: RigidBody, newType: RigidBodyType) {
  rigidBody.setBodyType(newType)
}

export const Physics = {
  load,
  createWorld,
  createRigidBody,
  removeRigidBody,
  changeRigidbodyType
}
