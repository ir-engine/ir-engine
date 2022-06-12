// This file will be renamed to Physics.ts when we are ready to take out physx completely.
import RAPIER, { ColliderDesc, RigidBody, RigidBodyDesc, RigidBodyType, World } from '@dimforge/rapier3d-compat'

import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { RigidBodyComponent } from '../components/RigidBodyComponent'
import { getTagComponentForRigidBody } from '../functions/getTagComponentForRigidBody'

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

function createRigidBody(entity: Entity, world: World, rigidBodyDesc: RigidBodyDesc, colliderDesc: ColliderDesc[]) {
  const rigidBody = world.createRigidBody(rigidBodyDesc)
  colliderDesc.forEach((desc) => world.createCollider(desc, rigidBody))

  addComponent(entity, RigidBodyComponent, rigidBody)

  const rigidBodyTypeComponent = getTagComponentForRigidBody(rigidBody)
  addComponent(entity, rigidBodyTypeComponent, rigidBody)

  return rigidBody
}

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
  addComponent(entity, newRigidBodyComponent, {})
}

export const Physics = {
  load,
  createWorld,
  createRigidBody,
  removeRigidBody,
  changeRigidbodyType
}
