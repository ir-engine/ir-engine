// This file will be renamed to Physics.ts when we are ready to take out physx completely.
import RAPIER, { ColliderDesc, RigidBody, RigidBodyDesc, RigidBodyType, World } from '@dimforge/rapier3d-compat'

import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { getComponentTypeForRigidBody } from '../functions/getComponentTypeForRigidBody'

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

  const rigidBodyComponent = getComponentTypeForRigidBody(rigidBody)
  addComponent(entity, rigidBodyComponent, {
    rigidBody: rigidBody,
    rigidBodyDesc: rigidBodyDesc,
    collider: collider
  })

  return rigidBody
}

function removeRigidBody(entity: Entity, world: World, rigidBody: RigidBody) {
  const rigidBodyComponent = getComponentTypeForRigidBody(rigidBody)
  removeComponent(entity, rigidBodyComponent)

  world.removeRigidBody(rigidBody)
}

function changeRigidbodyType(entity: Entity, rigidBody: RigidBody, newType: RigidBodyType) {
  const currentRigidBodyComponent = getComponentTypeForRigidBody(rigidBody)
  let rigidBodyComponent = getComponent(entity, currentRigidBodyComponent)

  const collider = rigidBodyComponent.collider
  const rigidBodyDesc = rigidBodyComponent.rigidBodyDesc

  removeComponent(entity, currentRigidBodyComponent)

  rigidBody.setBodyType(newType)

  const newRigidBodyComponent = getComponentTypeForRigidBody(rigidBody)
  addComponent(entity, newRigidBodyComponent, {
    rigidBody: rigidBody,
    rigidBodyDesc: rigidBodyDesc,
    collider: collider
  })
}

export const Physics = {
  load,
  createWorld,
  createRigidBody,
  removeRigidBody,
  changeRigidbodyType
}
