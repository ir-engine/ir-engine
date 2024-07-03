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

import { getComponent, removeComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { defineQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { SimulationSystemGroup } from '@etherealengine/ecs/src/SystemGroups'
import { getMutableState, getState, none } from '@etherealengine/hyperflux'
import { NetworkState } from '@etherealengine/network'
import { smootheLerpAlpha } from '../../common/functions/MathLerpFunctions'

import { TransformComponent } from '../../transform/components/TransformComponent'
import { Physics } from '../classes/Physics'
import { CollisionComponent } from '../components/CollisionComponent'
import {
  RigidBodyComponent,
  RigidBodyFixedTagComponent,
  RigidBodyKinematicTagComponent
} from '../components/RigidBodyComponent'
import { PhysicsSerialization } from '../PhysicsSerialization'
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
const collisionQuery = defineQuery([CollisionComponent])

const kinematicQuery = defineQuery([RigidBodyComponent, RigidBodyKinematicTagComponent, TransformComponent])

const execute = () => {
  const { physicsWorld, physicsCollisionEventQueue, drainCollisions, drainContacts } = getState(PhysicsState)
  if (!physicsWorld) return

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
      /** @ts-ignore  @todo Remove ts-ignore. Hookstate interprets the closure type weirdly */
      physicsState.drainCollisions.set((val) => Physics.drainCollisionEventQueue(physicsWorld))
      /** @ts-ignore  @todo Remove ts-ignore. Hookstate interprets the closure type weirdly */
      physicsState.drainContacts.set((val) => Physics.drainContactEventQueue(physicsWorld))
    })

    return () => {
      const physicsWorld = getMutableState(PhysicsState).physicsWorld
      try {
        physicsWorld.value?.free()
      } catch (e) {
        console.error(e)
      }
      physicsWorld.set(null!)

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
