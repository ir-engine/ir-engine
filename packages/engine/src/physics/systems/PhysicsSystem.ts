import { Not } from 'bitecs'
import { Quaternion, Vector3 } from 'three'

import { createActionQueue } from '@xrengine/hyperflux'

import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { NetworkObjectDirtyTag } from '../../networking/components/NetworkObjectDirtyTag'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Physics } from '../classes/Physics'
import { RaycastComponent } from '../components/RaycastComponent'
import { RigidBodyComponent } from '../components/RigidBodyComponent'
import { RigidBodyDynamicTagComponent } from '../components/RigidBodyDynamicTagComponent'
import { VelocityComponent } from '../components/VelocityComponent'

// Receptor
export function teleportObjectReceptor(
  action: ReturnType<typeof WorldNetworkAction.teleportObject>,
  world = Engine.instance.currentWorld
) {
  const [x, y, z] = action.pose
  const entity = world.getNetworkObject(action.object.ownerId, action.object.networkId)!
  const controllerComponent = getComponent(entity, AvatarControllerComponent)
  if (controllerComponent) {
    const velocity = getComponent(entity, VelocityComponent)
    const avatar = getComponent(entity, AvatarComponent)
    controllerComponent.controller.setTranslation({ x, y: y + avatar.avatarHalfHeight, z }, true)
    velocity.linear.setScalar(0)
    velocity.angular.setScalar(0)
  }
}

const processRaycasts = (world: World, entity: Entity) => {
  Physics.castRay(world.physicsWorld, getComponent(entity, RaycastComponent))
}

// Set network state to physics body pose for objects not owned by this user.
const updateDirtyDynamicBodiesFromNetwork = (world: World, entity: Entity) => {
  const network = getComponent(entity, NetworkObjectComponent)

  // Ignore if we own this object or no new network state has been received for this object
  // (i.e. packet loss and/or state not sent out from server because no change in state since last frame)
  if (network.ownerId === Engine.instance.userId) {
    // console.log('ignoring state for:', nameComponent)
    return
  }

  const body = getComponent(entity, RigidBodyComponent)
  const { position, rotation } = getComponent(entity, TransformComponent)
  const { linear, angular } = getComponent(entity, VelocityComponent)

  body.setTranslation(position, true)
  body.setRotation(rotation, true)
  body.setLinvel(linear, true)
  body.setAngvel(angular, true)

  removeComponent(entity, NetworkObjectDirtyTag)
}

const updateTransformFromBody = (world: World, entity: Entity) => {
  const body = getComponent(entity, RigidBodyComponent)
  const { position, rotation } = getComponent(entity, TransformComponent)
  const { linear, angular } = getComponent(entity, VelocityComponent)

  position.copy(body.translation() as Vector3)
  rotation.copy(body.rotation() as Quaternion)

  linear.copy(body.linvel() as Vector3)
  angular.copy(body.angvel() as Vector3)
}

const processCollisions = (world: World) => {
  Physics.drainCollisionEventQueue(world.physicsWorld, world.physicsCollisionEventQueue)
  return world
}

export default async function PhysicsSystem(world: World) {
  const raycastQuery = defineQuery([RaycastComponent])

  const networkRigidBodyDirtyQuery = defineQuery([
    NetworkObjectComponent,
    RigidBodyComponent,
    NetworkObjectDirtyTag,
    RigidBodyDynamicTagComponent
  ])

  const rigidBodyQuery = defineQuery([Not(NetworkObjectComponent), RigidBodyComponent, RigidBodyDynamicTagComponent])

  const teleportObjectQueue = createActionQueue(WorldNetworkAction.teleportObject.matches)

  await Physics.load()
  world.physicsWorld = Physics.createWorld()
  world.physicsCollisionEventQueue = Physics.createCollisionEventQueue()

  return () => {
    for (const action of teleportObjectQueue()) teleportObjectReceptor(action)

    for (const entity of rigidBodyQuery.exit()) {
      Physics.removeRigidBody(entity, world.physicsWorld)
    }

    for (const entity of raycastQuery()) processRaycasts(world, entity)
    for (const entity of networkRigidBodyDirtyQuery()) updateDirtyDynamicBodiesFromNetwork(world, entity)

    if (!Engine.instance.isEditor) {
      for (const entity of rigidBodyQuery()) updateTransformFromBody(world, entity)
    }

    processCollisions(world)

    // step physics world
    world.physicsWorld.step(world.physicsCollisionEventQueue)
  }
}
