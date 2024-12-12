/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { Not } from 'bitecs'
import { useEffect } from 'react'

import { getComponent, removeComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { QueryReactor, defineQuery, useQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { SimulationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { getMutableState, getState, none, useHookstate } from '@ir-engine/hyperflux'
import { NetworkState } from '@ir-engine/network'

import { UUIDComponent, useEntityContext } from '@ir-engine/ecs'
import React from 'react'
import { Vector3 } from 'three'
import { EngineState } from '../../EngineState'
import { InputHeuristicState, IntersectionData } from '../../input/functions/ClientInputHeuristics'
import { SceneComponent } from '../../renderer/components/SceneComponents'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { PhysicsSerialization } from '../PhysicsSerialization'
import { Physics, RaycastArgs } from '../classes/Physics'
import { CollisionComponent } from '../components/CollisionComponent'
import {
  RigidBodyComponent,
  RigidBodyFixedTagComponent,
  RigidBodyKinematicTagComponent
} from '../components/RigidBodyComponent'
import { CollisionGroups } from '../enums/CollisionGroups'
import { getInteractionGroups } from '../functions/getInteractionGroups'
import { ColliderHitEvent, CollisionEvents, SceneQueryType } from '../types/PhysicsTypes'

const nonFixedRigidbodyQuery = defineQuery([RigidBodyComponent, Not(RigidBodyFixedTagComponent)])
const collisionQuery = defineQuery([CollisionComponent])

const kinematicQuery = defineQuery([RigidBodyComponent, RigidBodyKinematicTagComponent, TransformComponent])

const execute = () => {
  const existingColliderHits = [] as Array<{ entity: Entity; collisionEntity: Entity; hit: ColliderHitEvent }>

  for (const collisionEntity of collisionQuery()) {
    const collisionComponent = getComponent(collisionEntity, CollisionComponent)
    for (const [entity, hit] of collisionComponent) {
      if (hit.type !== CollisionEvents.COLLISION_PERSIST && hit.type !== CollisionEvents.TRIGGER_PERSIST) {
        existingColliderHits.push({ entity, collisionEntity, hit })
      }
    }
  }

  const allRigidBodies = nonFixedRigidbodyQuery()
  Physics.updatePreviousRigidbodyPose(allRigidBodies)
  const { simulationTimestep } = getState(ECSState)
  const kinematicEntities = kinematicQuery()
  Physics.simulate(simulationTimestep, kinematicEntities)
  Physics.updateRigidbodyPose(allRigidBodies)

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

  for (const collisionEntity of collisionQuery()) {
    const collisionComponent = getComponent(collisionEntity, CollisionComponent)
    if (!collisionComponent.size) {
      removeComponent(collisionEntity, CollisionComponent)
    }
  }
}

const PhysicsSceneReactor = () => {
  const entity = useEntityContext()
  const uuid = useComponent(entity, UUIDComponent).value
  const scene = useComponent(entity, SceneComponent)

  useEffect(() => {
    if (!scene.active.value) return
    Physics.createWorld(uuid)
    return () => {
      Physics.destroyWorld(uuid)
    }
  }, [uuid, scene.active.value])
  return null
}

const _inputRaycast = {
  type: SceneQueryType.Closest,
  origin: new Vector3(),
  direction: new Vector3(),
  maxDistance: 1000,
  groups: getInteractionGroups(CollisionGroups.Default, CollisionGroups.Default),
  excludeRigidBody: undefined
} as RaycastArgs

const sceneQuery = defineQuery([SceneComponent])

export function spatialInputRaycastHeuristic(
  intersectionData: Set<IntersectionData>,
  position: Vector3,
  direction: Vector3
) {
  const isEditing = getState(EngineState).isEditing
  if (isEditing) return

  _inputRaycast.origin.copy(position)
  _inputRaycast.direction.copy(direction)

  for (const entity of sceneQuery()) {
    const world = Physics.getWorld(entity)
    if (!world) continue

    const hits = Physics.castRay(world, _inputRaycast)
    for (const hit of hits) {
      if (!hit.entity) continue
      intersectionData.add({ entity: hit.entity, distance: hit.distance })
    }
  }
}

const reactor = () => {
  const physicsLoaded = useHookstate(false)
  const physicsLoadPending = useHookstate(false)
  const physicsQuery = useQuery([SceneComponent])

  useEffect(() => {
    getMutableState(InputHeuristicState).merge([
      {
        order: 0,
        heuristic: spatialInputRaycastHeuristic
      }
    ])

    const networkState = getMutableState(NetworkState)

    networkState.networkSchema[PhysicsSerialization.ID].set({
      read: PhysicsSerialization.readRigidBody,
      write: PhysicsSerialization.writeRigidBody
    })

    return () => {
      networkState.networkSchema[PhysicsSerialization.ID].set(none)
    }
  }, [])

  useEffect(() => {
    if (physicsLoaded.value || physicsLoadPending.value) return
    if (physicsQuery.length) {
      physicsLoadPending.set(true)
      Physics.load().then(() => {
        physicsLoaded.set(true)
      })
    }
  }, [physicsQuery])

  if (!physicsLoaded.value) return null

  return (
    <>
      <QueryReactor Components={[SceneComponent]} ChildEntityReactor={PhysicsSceneReactor} />
    </>
  )
}

export const PhysicsSystem = defineSystem({
  uuid: 'ee.engine.PhysicsSystem',
  insert: { with: SimulationSystemGroup },
  execute,
  reactor
})
