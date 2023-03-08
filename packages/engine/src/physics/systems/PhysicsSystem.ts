import { Not } from 'bitecs'
import { useEffect } from 'react'
import { Quaternion, Vector3 } from 'three'

import { smootheLerpAlpha } from '@etherealengine/common/src/utils/smootheLerpAlpha'
import { createActionQueue, getMutableState, none, removeActionQueue } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import {
  defineQuery,
  getComponent,
  hasComponent,
  removeQuery,
  useComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { startQueryReactor } from '../../ecs/functions/SystemFunctions'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { NetworkState } from '../../networking/NetworkState'
import {
  ColliderComponent,
  SCENE_COMPONENT_COLLIDER,
  SCENE_COMPONENT_COLLIDER_DEFAULT_VALUES
} from '../../scene/components/ColliderComponent'
import { GLTFLoadedComponent } from '../../scene/components/GLTFLoadedComponent'
import { SCENE_COMPONENT_VISIBLE } from '../../scene/components/VisibleComponent'
import {
  SCENE_COMPONENT_TRANSFORM,
  SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES,
  TransformComponent
} from '../../transform/components/TransformComponent'
import { Physics } from '../classes/Physics'
import { CollisionComponent } from '../components/CollisionComponent'
import {
  RigidBodyComponent,
  RigidBodyFixedTagComponent,
  RigidBodyKinematicPositionBasedTagComponent,
  RigidBodyKinematicVelocityBasedTagComponent
} from '../components/RigidBodyComponent'
import { PhysicsSerialization } from '../PhysicsSerialization'
import { ColliderHitEvent, CollisionEvents } from '../types/PhysicsTypes'

export function teleportObject(entity: Entity, position: Vector3, rotation: Quaternion) {
  const rigidbody = getComponent(entity, RigidBodyComponent)
  const transform = getComponent(entity, TransformComponent)
  transform.position.copy(position)
  transform.rotation.copy(rotation)
  if (rigidbody) {
    rigidbody.position.copy(transform.position)
    rigidbody.rotation.copy(transform.rotation)
    rigidbody.targetKinematicPosition.copy(transform.position)
    rigidbody.targetKinematicRotation.copy(transform.rotation)
    rigidbody.body.setTranslation(rigidbody.position, true)
    rigidbody.body.setRotation(rigidbody.rotation, true)
    rigidbody.body.setLinvel({ x: 0, y: 0, z: 0 }, true)
    rigidbody.body.setAngvel({ x: 0, y: 0, z: 0 }, true)
  }
}

// Receptor
export function teleportObjectReceptor(action: ReturnType<typeof WorldNetworkAction.teleportObject>) {
  const entity = Engine.instance.getNetworkObject(action.object.ownerId, action.object.networkId)!
  teleportObject(entity, action.position, action.rotation)
}

export const PhysicsPrefabs = {
  collider: 'collider' as const
}

export function smoothPositionBasedKinematicBody(entity: Entity, dt: number, substep: number) {
  const rigidbodyComponent = getComponent(entity, RigidBodyComponent)
  if (rigidbodyComponent.targetKinematicLerpMultiplier === 0) {
    /** deterministic linear interpolation between substeps */
    rigidbodyComponent.position.lerpVectors(
      rigidbodyComponent.previousPosition,
      rigidbodyComponent.targetKinematicPosition,
      substep
    )
    rigidbodyComponent.rotation
      .copy(rigidbodyComponent.previousRotation)
      .fastSlerp(rigidbodyComponent.targetKinematicRotation, substep)
  } else {
    /** gradual smoothing between substeps */
    const alpha = smootheLerpAlpha(rigidbodyComponent.targetKinematicLerpMultiplier, dt)
    rigidbodyComponent.position.lerp(rigidbodyComponent.targetKinematicPosition, alpha)
    rigidbodyComponent.rotation.fastSlerp(rigidbodyComponent.targetKinematicRotation, alpha)
  }
  rigidbodyComponent.body.setNextKinematicTranslation(rigidbodyComponent.position)
  rigidbodyComponent.body.setNextKinematicRotation(rigidbodyComponent.rotation)
}

export function smoothVelocityBasedKinematicBody(entity: Entity, dt: number, substep: number) {
  const rigidbodyComponent = getComponent(entity, RigidBodyComponent)
  if (rigidbodyComponent.targetKinematicLerpMultiplier === 0) {
    rigidbodyComponent.position.lerpVectors(
      rigidbodyComponent.previousPosition,
      rigidbodyComponent.targetKinematicPosition,
      substep
    )
    rigidbodyComponent.rotation.slerpQuaternions(
      rigidbodyComponent.previousRotation,
      rigidbodyComponent.targetKinematicRotation,
      substep
    )
  } else {
    const alpha = smootheLerpAlpha(rigidbodyComponent.targetKinematicLerpMultiplier, dt)
    rigidbodyComponent.position.lerp(rigidbodyComponent.targetKinematicPosition, alpha)
    rigidbodyComponent.rotation.slerp(rigidbodyComponent.targetKinematicRotation, alpha)
  }
  /** @todo implement proper velocity based kinematic movement */
  rigidbodyComponent.body.setNextKinematicTranslation(rigidbodyComponent.position)
  rigidbodyComponent.body.setNextKinematicRotation(rigidbodyComponent.rotation)
}

export default async function PhysicsSystem() {
  Engine.instance.sceneComponentRegistry.set(ColliderComponent.name, SCENE_COMPONENT_COLLIDER)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_COLLIDER, {
    defaultData: {}
  })

  Engine.instance.scenePrefabRegistry.set(PhysicsPrefabs.collider, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_COLLIDER, props: SCENE_COMPONENT_COLLIDER_DEFAULT_VALUES }
  ])

  const engineState = getMutableState(EngineState)

  const allRigidBodyQuery = defineQuery([RigidBodyComponent, Not(RigidBodyFixedTagComponent)])
  const collisionQuery = defineQuery([CollisionComponent])

  const kinematicPositionBodyQuery = defineQuery([
    RigidBodyComponent,
    RigidBodyKinematicPositionBasedTagComponent,
    TransformComponent
  ])
  const kinematicVelocityBodyQuery = defineQuery([
    RigidBodyComponent,
    RigidBodyKinematicVelocityBasedTagComponent,
    TransformComponent
  ])

  const teleportObjectQueue = createActionQueue(WorldNetworkAction.teleportObject.matches)
  const modifyPropertyActionQueue = createActionQueue(EngineActions.sceneObjectUpdate.matches)

  await Physics.load()
  Engine.instance.physicsWorld = Physics.createWorld()
  Engine.instance.physicsCollisionEventQueue = Physics.createCollisionEventQueue()
  const drainCollisions = Physics.drainCollisionEventQueue(Engine.instance.physicsWorld)
  const drainContacts = Physics.drainContactEventQueue(Engine.instance.physicsWorld)

  const networkState = getMutableState(NetworkState)

  networkState.networkSchema['ee.core.physics'].set({
    read: PhysicsSerialization.readRigidBody,
    write: PhysicsSerialization.writeRigidBody
  })

  const execute = () => {
    for (const action of teleportObjectQueue()) teleportObjectReceptor(action)

    const allRigidBodies = allRigidBodyQuery()

    for (const entity of allRigidBodies) {
      const rigidBody = getComponent(entity, RigidBodyComponent)
      const body = rigidBody.body
      const translation = body.translation() as Vector3
      const rotation = body.rotation() as Quaternion
      RigidBodyComponent.previousPosition.x[entity] = translation.x
      RigidBodyComponent.previousPosition.y[entity] = translation.y
      RigidBodyComponent.previousPosition.z[entity] = translation.z
      RigidBodyComponent.previousRotation.x[entity] = rotation.x
      RigidBodyComponent.previousRotation.y[entity] = rotation.y
      RigidBodyComponent.previousRotation.z[entity] = rotation.z
      RigidBodyComponent.previousRotation.w[entity] = rotation.w
    }

    const existingColliderHits = [] as Array<{ entity: Entity; collisionEntity: Entity; hit: ColliderHitEvent }>

    for (const collisionEntity of collisionQuery()) {
      const collisionComponent = getComponent(collisionEntity, CollisionComponent)
      for (const [entity, hit] of collisionComponent) {
        if (hit.type !== CollisionEvents.COLLISION_PERSIST && hit.type !== CollisionEvents.TRIGGER_PERSIST) {
          existingColliderHits.push({ entity, collisionEntity, hit })
        }
      }
    }

    // step physics world
    const substeps = engineState.physicsSubsteps.value
    const timestep = engineState.fixedDeltaSeconds.value / substeps
    Engine.instance.physicsWorld.timestep = timestep
    // const smoothnessMultiplier = 50
    // const smoothAlpha = smoothnessMultiplier * timestep
    const kinematicPositionEntities = kinematicPositionBodyQuery()
    const kinematicVelocityEntities = kinematicVelocityBodyQuery()
    for (let i = 0; i < substeps; i++) {
      // smooth kinematic pose changes
      const substep = (i + 1) / substeps
      for (const entity of kinematicPositionEntities) smoothPositionBasedKinematicBody(entity, timestep, substep)
      for (const entity of kinematicVelocityEntities) smoothVelocityBasedKinematicBody(entity, timestep, substep)
      Engine.instance.physicsWorld.step(Engine.instance.physicsCollisionEventQueue)
      Engine.instance.physicsCollisionEventQueue.drainCollisionEvents(drainCollisions)
      Engine.instance.physicsCollisionEventQueue.drainContactForceEvents(drainContacts)
    }

    /** process collisions */
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

    for (const entity of allRigidBodies) {
      const rigidBody = getComponent(entity, RigidBodyComponent)
      const body = rigidBody.body
      const translation = body.translation() as Vector3
      const rotation = body.rotation() as Quaternion
      const linvel = body.linvel() as Vector3
      const angvel = body.angvel() as Vector3
      RigidBodyComponent.position.x[entity] = translation.x
      RigidBodyComponent.position.y[entity] = translation.y
      RigidBodyComponent.position.z[entity] = translation.z
      RigidBodyComponent.rotation.x[entity] = rotation.x
      RigidBodyComponent.rotation.y[entity] = rotation.y
      RigidBodyComponent.rotation.z[entity] = rotation.z
      RigidBodyComponent.rotation.w[entity] = rotation.w
      RigidBodyComponent.linearVelocity.x[entity] = linvel.x
      RigidBodyComponent.linearVelocity.y[entity] = linvel.y
      RigidBodyComponent.linearVelocity.z[entity] = linvel.z
      RigidBodyComponent.angularVelocity.x[entity] = angvel.x
      RigidBodyComponent.angularVelocity.y[entity] = angvel.y
      RigidBodyComponent.angularVelocity.z[entity] = angvel.z
    }
  }

  const cleanup = async () => {
    Engine.instance.sceneComponentRegistry.delete(ColliderComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_COLLIDER)
    Engine.instance.scenePrefabRegistry.delete(PhysicsPrefabs.collider)

    removeQuery(allRigidBodyQuery)
    removeQuery(collisionQuery)

    removeActionQueue(teleportObjectQueue)
    removeActionQueue(modifyPropertyActionQueue)

    Engine.instance.physicsWorld.free()

    networkState.networkSchema['ee.core.physics'].set(none)
  }

  return { execute, cleanup }
}
