/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Not } from 'bitecs'
import { useEffect } from 'react'
import { Quaternion, Vector3 } from 'three'

import { smootheLerpAlpha } from '@etherealengine/common/src/utils/smootheLerpAlpha'
import { getMutableState, getState, none } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { NetworkState } from '../../networking/NetworkState'
import { TriggerSystem } from '../../scene/systems/TriggerSystem'
import { TransformComponent } from '../../transform/components/TransformComponent'
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

let drainCollisions: ReturnType<typeof Physics.drainCollisionEventQueue>
let drainContacts: ReturnType<typeof Physics.drainContactEventQueue>

const execute = () => {
  if (!Engine.instance.physicsWorld) return
  if (!getState(EngineState).sceneLoaded) return

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

  const engineState = getState(EngineState)

  // step physics world
  const substeps = engineState.physicsSubsteps
  const timestep = engineState.simulationTimestep / 1000 / substeps
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

const reactor = () => {
  useEffect(() => {
    const networkState = getMutableState(NetworkState)

    networkState.networkSchema[PhysicsSerialization.ID].set({
      read: PhysicsSerialization.readRigidBody,
      write: PhysicsSerialization.writeRigidBody
    })

    Physics.load().then(() => {
      Engine.instance.physicsWorld = Physics.createWorld()
      Engine.instance.physicsCollisionEventQueue = Physics.createCollisionEventQueue()
      drainCollisions = Physics.drainCollisionEventQueue(Engine.instance.physicsWorld)
      drainContacts = Physics.drainContactEventQueue(Engine.instance.physicsWorld)
    })

    return () => {
      Engine.instance.physicsWorld.free()
      Engine.instance.physicsWorld = null!
      drainCollisions = null!
      drainContacts = null!

      networkState.networkSchema[PhysicsSerialization.ID].set(none)
    }
  }, [])
  return null
}

export const PhysicsSystem = defineSystem({
  uuid: 'ee.engine.PhysicsSystem',
  execute,
  reactor,
  subSystems: [TriggerSystem]
})
