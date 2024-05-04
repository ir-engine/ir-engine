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

import { smootheLerpAlpha } from '@etherealengine/common/src/utils/smootheLerpAlpha'
import { getMutableState, getState, none } from '@etherealengine/hyperflux'

import { getComponent, hasComponent, removeComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { defineQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { SimulationSystemGroup } from '@etherealengine/ecs/src/SystemGroups'
import { NetworkState } from '@etherealengine/network'
import { findAncestorWithComponent, iterateEntityNode } from '../../transform/components/EntityTree'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { PhysicsSerialization } from '../PhysicsSerialization'
import { Physics, PhysicsWorld } from '../classes/Physics'
import { ColliderComponent } from '../components/ColliderComponent'
import { CollisionComponent } from '../components/CollisionComponent'
import {
  RigidBodyComponent,
  RigidBodyFixedTagComponent,
  RigidBodyKinematicTagComponent
} from '../components/RigidBodyComponent'
import { TriggerComponent } from '../components/TriggerComponent'
import { PhysicsState } from '../state/PhysicsState'
import { ColliderHitEvent, CollisionEvents } from '../types/PhysicsTypes'

export function smoothKinematicBody(entity: Entity, dt: number, substep: number) {
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
  Physics.setKinematicRigidbodyPose(entity, rigidbodyComponent.position, rigidbodyComponent.rotation)
}

const nonFixedRigidbodyQuery = defineQuery([RigidBodyComponent, Not(RigidBodyFixedTagComponent)])
const rigidbodyQuery = defineQuery([RigidBodyComponent])
const colliderQuery = defineQuery([ColliderComponent])
const triggerQuery = defineQuery([ColliderComponent, TriggerComponent])
const collisionQuery = defineQuery([CollisionComponent])

const kinematicQuery = defineQuery([RigidBodyComponent, RigidBodyKinematicTagComponent, TransformComponent])

let drainCollisions: ReturnType<typeof Physics.drainCollisionEventQueue>
let drainContacts: ReturnType<typeof Physics.drainContactEventQueue>

export const handlePhysicsEnterExitQueries = (physicsWorld: PhysicsWorld) => {
  const handledColliders = new Set<Entity>()
  for (const entity of rigidbodyQuery.enter()) {
    Physics.createRigidBody(entity, physicsWorld)
    // ensure all colliders are attached to rigidbodies
    iterateEntityNode(
      entity,
      (child) => {
        const colliderDesc = Physics.createColliderDesc(child, entity)
        Physics.attachCollider(physicsWorld, colliderDesc, entity)
        handledColliders.add(child)
      },
      (entity) => hasComponent(entity, ColliderComponent)
    )
  }
  for (const entity of rigidbodyQuery.exit()) {
    Physics.removeRigidbody(entity, physicsWorld)
  }
  for (const entity of colliderQuery.enter()) {
    if (handledColliders.has(entity)) continue
    const ancestor = findAncestorWithComponent(entity, RigidBodyComponent)
    if (ancestor) {
      const colliderDesc = Physics.createColliderDesc(entity, ancestor)
      Physics.attachCollider(physicsWorld, colliderDesc, ancestor)
    } // else case covered in above rigidbody queries
  }
  for (const entity of colliderQuery.exit()) {
    Physics.removeCollider(physicsWorld, entity)
  }
  for (const entity of triggerQuery.enter()) {
    Physics.setTrigger(entity, true)
  }
  for (const entity of triggerQuery.exit()) {
    Physics.setTrigger(entity, false)
  }
}

const execute = () => {
  const { physicsWorld, physicsCollisionEventQueue } = getState(PhysicsState)
  if (!physicsWorld) return

  handlePhysicsEnterExitQueries(physicsWorld)

  const allRigidBodies = nonFixedRigidbodyQuery()

  Physics.updatePreviousRigidbodyPose(allRigidBodies)

  const existingColliderHits = [] as Array<{ entity: Entity; collisionEntity: Entity; hit: ColliderHitEvent }>

  for (const collisionEntity of collisionQuery()) {
    const collisionComponent = getComponent(collisionEntity, CollisionComponent)
    for (const [entity, hit] of collisionComponent) {
      if (hit.type !== CollisionEvents.COLLISION_PERSIST && hit.type !== CollisionEvents.TRIGGER_PERSIST) {
        existingColliderHits.push({ entity, collisionEntity, hit })
      }
    }
  }

  const { physicsSubsteps } = getState(PhysicsState)
  const { simulationTimestep } = getState(ECSState)

  // step physics world
  const timestep = simulationTimestep / 1000 / physicsSubsteps
  physicsWorld.timestep = timestep
  // const smoothnessMultiplier = 50
  // const smoothAlpha = smoothnessMultiplier * timestep
  const kinematicEntities = kinematicQuery()
  for (let i = 0; i < physicsSubsteps; i++) {
    // smooth kinematic pose changes
    const substep = (i + 1) / physicsSubsteps
    for (const entity of kinematicEntities) smoothKinematicBody(entity, timestep, substep)
    physicsWorld.step(physicsCollisionEventQueue)
    physicsCollisionEventQueue.drainCollisionEvents(drainCollisions)
    physicsCollisionEventQueue.drainContactForceEvents(drainContacts)
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

  Physics.updateRigidbodyPose(allRigidBodies)

  for (const collisionEntity of collisionQuery()) {
    const collisionComponent = getComponent(collisionEntity, CollisionComponent)
    if (!collisionComponent.size) {
      removeComponent(collisionEntity, CollisionComponent)
    }
  }
}

const reactor = () => {
  useEffect(() => {
    const networkState = getMutableState(NetworkState)
    const physicsState = getMutableState(PhysicsState)

    networkState.networkSchema[PhysicsSerialization.ID].set({
      read: PhysicsSerialization.readRigidBody,
      write: PhysicsSerialization.writeRigidBody
    })

    Physics.load().then(() => {
      const physicsWorld = Physics.createWorld()
      physicsState.physicsWorld.set(physicsWorld)
      physicsState.physicsCollisionEventQueue.set(Physics.createCollisionEventQueue())
      drainCollisions = Physics.drainCollisionEventQueue(physicsWorld)
      drainContacts = Physics.drainContactEventQueue(physicsWorld)
    })

    return () => {
      const physicsWorld = getMutableState(PhysicsState).physicsWorld
      physicsWorld.value?.free()
      physicsWorld.set(null!)
      drainCollisions = null!
      drainContacts = null!

      networkState.networkSchema[PhysicsSerialization.ID].set(none)
    }
  }, [])
  return null
}

export const PhysicsSystem = defineSystem({
  uuid: 'ee.engine.PhysicsSystem',
  insert: { with: SimulationSystemGroup },
  execute,
  reactor
})
