// This file will be renamed to Physics.ts when we are ready to take out physx completely.
import RAPIER, { ColliderDesc, RigidBody, RigidBodyDesc, RigidBodyType, World } from '@dimforge/rapier3d-compat'

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

function createRigidBody(world: World, rigidBodyDesc: RigidBodyDesc) {
  const rigidBody = world.createRigidBody(rigidBodyDesc)
  return rigidBody
}

function removeRigidBody(world: World, rigidBody: RigidBody) {
  world.removeRigidBody(rigidBody)
}

function changeRigidbodyType(rigidBody: RigidBody, newType: RigidBodyType) {
  rigidBody.setBodyType(newType)
}

function createCollider(world: World, rigidBody: RigidBody, colliderDesc: ColliderDesc) {
  const collider = world.createCollider(colliderDesc, rigidBody)
  return collider
}

export const Physics = {
  load,
  createWorld,
  createRigidBody,
  removeRigidBody,
  changeRigidbodyType,
  createCollider
}
