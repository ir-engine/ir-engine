import { Not } from 'bitecs'
import { Quaternion, Vector3 } from 'three'

import { createActionQueue, getState } from '@xrengine/hyperflux'

import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { NetworkObjectDirtyTag } from '../../networking/components/NetworkObjectDirtyTag'
import { NetworkObjectOwnedTag } from '../../networking/components/NetworkObjectOwnedTag'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import {
  ColliderComponent,
  GroupColliderComponent,
  SCENE_COMPONENT_COLLIDER,
  SCENE_COMPONENT_COLLIDER_DEFAULT_VALUES
} from '../../scene/components/ColliderComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { SCENE_COMPONENT_VISIBLE } from '../../scene/components/VisibleComponent'
import {
  deserializeCollider,
  serializeCollider,
  updateCollider,
  updateGroupCollider
} from '../../scene/functions/loaders/ColliderFunctions'
import {
  SCENE_COMPONENT_TRANSFORM,
  SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES,
  TransformComponent
} from '../../transform/components/TransformComponent'
import { Physics } from '../classes/Physics'
import { CollisionComponent } from '../components/CollisionComponent'
import { RigidBodyComponent } from '../components/RigidBodyComponent'
import { VelocityComponent } from '../components/VelocityComponent'
import { ColliderHitEvent, CollisionEvents } from '../types/PhysicsTypes'

// Receptor
export function teleportObjectReceptor(
  action: ReturnType<typeof WorldNetworkAction.teleportObject>,
  world = Engine.instance.currentWorld
) {
  const entity = world.getNetworkObject(action.object.ownerId, action.object.networkId)!
  const body = getComponent(entity, RigidBodyComponent).body
  if (body) {
    body.setTranslation(action.position, true)
    body.setRotation(action.rotation, true)
    body.setLinvel({ x: 0, y: 0, z: 0 }, true)
    body.setAngvel({ x: 0, y: 0, z: 0 }, true)
  }
  const transform = getComponent(entity, TransformComponent)
  transform.position.copy(action.position)
  transform.rotation.copy(action.rotation)
}

const processCollisions = (world: World, drainCollisions, drainContacts, collisionEntities: Entity[]) => {
  const existingColliderHits = [] as Array<{ entity: Entity; collisionEntity: Entity; hit: ColliderHitEvent }>

  for (const collisionEntity of collisionEntities) {
    const collisionComponent = getComponent(collisionEntity, CollisionComponent)
    for (const [entity, hit] of collisionComponent) {
      if (hit.type !== CollisionEvents.COLLISION_PERSIST && hit.type !== CollisionEvents.TRIGGER_PERSIST) {
        existingColliderHits.push({ entity, collisionEntity, hit })
      }
    }
  }

  world.physicsCollisionEventQueue.drainCollisionEvents(drainCollisions)
  world.physicsCollisionEventQueue.drainContactForceEvents(drainContacts)

  for (const { entity, collisionEntity, hit } of existingColliderHits) {
    const collisionComponent = getComponent(collisionEntity, CollisionComponent)
    if (!collisionComponent) continue
    const newHit = collisionComponent.get(entity)!
    if (!newHit) continue
    if (hit.type === CollisionEvents.COLLISION_START && newHit.type === CollisionEvents.COLLISION_START) {
      newHit.type = CollisionEvents.COLLISION_PERSIST
    }
    if (hit.type === CollisionEvents.TRIGGER_START && newHit.type === CollisionEvents.TRIGGER_START) {
      newHit.type = CollisionEvents.TRIGGER_PERSIST
    }
    if (hit.type === CollisionEvents.COLLISION_END && newHit.type === CollisionEvents.COLLISION_END) {
      collisionComponent.delete(entity)
    }
    if (hit.type === CollisionEvents.TRIGGER_END && newHit.type === CollisionEvents.TRIGGER_END) {
      collisionComponent.delete(entity)
    }
  }
}

export const PhysicsPrefabs = {
  collider: 'collider' as const
}

export default async function PhysicsSystem(world: World) {
  world.sceneComponentRegistry.set(ColliderComponent._name, SCENE_COMPONENT_COLLIDER)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_COLLIDER, {
    defaultData: SCENE_COMPONENT_COLLIDER_DEFAULT_VALUES,
    deserialize: deserializeCollider,
    serialize: serializeCollider
  })

  world.scenePrefabRegistry.set(PhysicsPrefabs.collider, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_COLLIDER, props: SCENE_COMPONENT_COLLIDER_DEFAULT_VALUES }
  ])

  const rigidBodyQuery = defineQuery([RigidBodyComponent])
  const colliderQuery = defineQuery([ColliderComponent])
  const groupColliderQuery = defineQuery([GroupColliderComponent])
  const allRigidBodyQuery = defineQuery([RigidBodyComponent])

  const networkedAvatarBodyQuery = defineQuery([
    RigidBodyComponent,
    NetworkObjectComponent,
    Not(NetworkObjectOwnedTag),
    AvatarComponent
  ])

  const teleportObjectQueue = createActionQueue(WorldNetworkAction.teleportObject.matches)
  const modifyPropertyActionQueue = createActionQueue(EngineActions.sceneObjectUpdate.matches)

  await Physics.load()
  world.physicsWorld = Physics.createWorld()
  world.physicsCollisionEventQueue = Physics.createCollisionEventQueue()
  const drainCollisions = Physics.drainCollisionEventQueue(world.physicsWorld)
  const drainContacts = Physics.drainContactEventQueue(world.physicsWorld)

  const collisionQuery = defineQuery([CollisionComponent])

  return () => {
    for (const action of modifyPropertyActionQueue()) {
      for (const entity of action.entities) {
        if (hasComponent(entity, ColliderComponent)) {
          if (hasComponent(entity, GroupColliderComponent)) {
            /** @todo we currently have no reason to support this, and it breaks live scene updates */
            // updateMeshCollider(entity)
          } else {
            updateCollider(entity)
          }
        }
      }
    }
    for (const action of colliderQuery.enter()) updateCollider(action)
    for (const action of groupColliderQuery.enter()) updateGroupCollider(action)

    for (const action of teleportObjectQueue()) teleportObjectReceptor(action)

    for (const entity of allRigidBodyQuery()) {
      const rigidBody = getComponent(entity, RigidBodyComponent)
      rigidBody.previousPosition.copy(rigidBody.body.translation() as Vector3)
      rigidBody.previousRotation.copy(rigidBody.body.rotation() as Quaternion)
      rigidBody.previousLinearVelocity.copy(rigidBody.body.linvel() as Vector3)
      rigidBody.previousAngularVelocity.copy(rigidBody.body.linvel() as Vector3)
    }

    // reset position and velocity for networked avatars every frame
    // (this needs to be updated each frame, because remote avatars are not locally constrained)
    // e.g., applying physics simulation to remote avatars is tricky, because avatar colliders should always be upright.
    // TODO: look into constraining avatar bodies w/ the actual physics engine
    for (const entity of networkedAvatarBodyQuery()) {
      const { body } = getComponent(entity, RigidBodyComponent)
      const { position, rotation } = getComponent(entity, TransformComponent)
      const { linear, angular } = getComponent(entity, VelocityComponent)
      body.setTranslation(position, true)
      body.setRotation(rotation, true)
      body.setLinvel(linear, true)
      // angular velocity is unneeded for avatars
      // body.setAngvel(angular, true)
    }

    // step physics world
    world.physicsWorld.timestep = getState(EngineState).fixedDeltaSeconds.value
    world.physicsWorld.step(world.physicsCollisionEventQueue)

    processCollisions(world, drainCollisions, drainContacts, collisionQuery())
  }
}
