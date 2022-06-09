// This file will be renamed to Physics.ts when we are ready to take out physx completely.
import RAPIER, { RigidBodyDesc, World } from '@dimforge/rapier3d-compat'

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

function addBody(world: World, rigidBodyDesc: RigidBodyDesc) {
  const rigidBody = world.createRigidBody(rigidBodyDesc)
  return rigidBody
}

export const Physics = {
  load,
  createWorld,
  addBody
}
