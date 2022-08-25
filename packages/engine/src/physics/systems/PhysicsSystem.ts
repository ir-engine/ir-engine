import { Not } from 'bitecs'
import { Quaternion, Vector3 } from 'three'

import { createActionQueue, getState } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { NetworkObjectOwnedTag } from '../../networking/components/NetworkObjectOwnedTag'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import {
  ColliderComponent,
  SCENE_COMPONENT_COLLIDER,
  SCENE_COMPONENT_COLLIDER_DEFAULT_VALUES
} from '../../scene/components/ColliderComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { SCENE_COMPONENT_VISIBLE } from '../../scene/components/VisibleComponent'
import {
  deserializeCollider,
  serializeCollider,
  updateCollider,
  updateMeshCollider
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
}

const processCollisions = (world: World, drainCollisions, collisionEntities: Entity[]) => {
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
  collider: 'Collider' as const
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
  const colliderQuery = defineQuery([ColliderComponent, Not(Object3DComponent)])
  const meshColliderQuery = defineQuery([ColliderComponent, Object3DComponent])
  const ownedRigidBodyQuery = defineQuery([RigidBodyComponent, NetworkObjectOwnedTag])
  const notOwnedRigidBodyQuery = defineQuery([RigidBodyComponent, Not(NetworkObjectOwnedTag)])

  const teleportObjectQueue = createActionQueue(WorldNetworkAction.teleportObject.matches)
  const modifyPropertyActionQueue = createActionQueue(EngineActions.sceneObjectUpdate.matches)

  await Physics.load()
  world.physicsWorld = Physics.createWorld()
  world.physicsCollisionEventQueue = Physics.createCollisionEventQueue()
  const drainCollisions = Physics.drainCollisionEventQueue(world.physicsWorld)

  const collisionQuery = defineQuery([CollisionComponent])

  return () => {
    for (const action of modifyPropertyActionQueue()) {
      for (const entity of action.entities) {
        if (hasComponent(entity, ColliderComponent) && !hasComponent(entity, Object3DComponent)) updateCollider(entity)
        /** @todo this updateMeshCollider is only ever used from loaded models, so we don't need to  */
        // if (hasComponent(entity, ColliderComponent) && hasComponent(entity, Object3DComponent)) updateMeshCollider(entity)
      }
    }
    for (const action of colliderQuery.enter()) updateCollider(action)
    for (const action of meshColliderQuery.enter()) updateMeshCollider(action)

    for (const action of teleportObjectQueue()) teleportObjectReceptor(action)

    for (const entity of rigidBodyQuery.exit()) {
      Physics.removeRigidBody(entity, world.physicsWorld, true)
    }

    for (const entity of ownedRigidBodyQuery()) {
      const rigidBody = getComponent(entity, RigidBodyComponent)
      rigidBody.previousPosition.copy(rigidBody.body.translation() as Vector3)
      rigidBody.previousRotation.copy(rigidBody.body.rotation() as Quaternion)
      rigidBody.previousLinearVelocity.copy(rigidBody.body.linvel() as Vector3)
      rigidBody.previousAngularVelocity.copy(rigidBody.body.linvel() as Vector3)
    }

    // reset position and velocity for network objects every frame
    // (this needs to be updated each frame, because remote objects are not locally constrained)
    // e.g., applying physics simulation to remote avatars is tricky, because avatar colliders should always be upright.
    // TODO: it should be safe to skip this for objects unconstrained remote physics objects,
    // we just need a way to identify them (Not(AvatarComponenent) may be enough for now...)
    for (const entity of notOwnedRigidBodyQuery()) {
      const { body } = getComponent(entity, RigidBodyComponent)
      const { position, rotation } = getComponent(entity, TransformComponent)
      const { linear, angular } = getComponent(entity, VelocityComponent)
      body.setTranslation(position, true)
      body.setRotation(rotation, true)
      body.setLinvel(linear, true)
      body.setAngvel(angular, true)
      world.dirtyTransforms.add(entity)
    }

    // step physics world
    world.physicsWorld.timestep = getState(EngineState).fixedDeltaSeconds.value
    world.physicsWorld.step(world.physicsCollisionEventQueue)

    processCollisions(world, drainCollisions, collisionQuery())
  }
}
