// This file will be renamed to Physics.ts when we are ready to take out physx completely.
import RAPIER, { ColliderDesc, RigidBody, RigidBodyDesc, RigidBodyType, World } from '@dimforge/rapier3d-compat'

import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { RigidBodyComponent } from '../components/RigidBodyComponent'
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

  addComponent(entity, RigidBodyComponent, { rigidBody: rigidBody })

  const rigidBodyTypeComponent = getComponentTypeForRigidBody(rigidBody)
  addComponent(entity, rigidBodyTypeComponent, {
    rigidBody: rigidBody,
    rigidBodyDesc: rigidBodyDesc,
    collider: collider
  })

  return rigidBody
}

function removeRigidBody(entity: Entity, world: World) {
  const rigidBody = getComponent(entity, RigidBodyComponent).rigidBody
  const rigidBodyTypeComponent = getComponentTypeForRigidBody(rigidBody)
  removeComponent(entity, rigidBodyTypeComponent)
  removeComponent(entity, RigidBodyComponent)

  world.removeRigidBody(rigidBody)
}

function changeRigidbodyType(entity: Entity, newType: RigidBodyType) {
  const rigidBody = getComponent(entity, RigidBodyComponent).rigidBody
  const currentRigidBodyTypeComponent = getComponentTypeForRigidBody(rigidBody)
  let rigidBodyTypeComponent = getComponent(entity, currentRigidBodyTypeComponent)

  const collider = rigidBodyTypeComponent.collider
  const rigidBodyDesc = rigidBodyTypeComponent.rigidBodyDesc

  removeComponent(entity, currentRigidBodyTypeComponent)

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
