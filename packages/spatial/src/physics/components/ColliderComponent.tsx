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

import {
  defineComponent,
  Entity,
  EntityUUID,
  UndefinedEntity,
  useComponent,
  useEntityContext,
  useOptionalComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { defineState, getMutableState, none, useState } from '@ir-engine/hyperflux'

import { ColliderDesc } from '@dimforge/rapier3d-compat'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { useEffect, useLayoutEffect } from 'react'
import { removeCallback, setCallback } from '../../common/CallbackComponent'
import { MeshComponent } from '../../renderer/components/MeshComponent.ts'
import {
  getTreeFromChildToAncestor,
  useAncestorWithComponents,
  useChildrenWithComponents
} from '../../transform/components/EntityTree'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { computeTransformMatrix } from '../../transform/systems/TransformSystem.ts'
import { Physics } from '../classes/Physics'
import { CollisionGroups, DefaultCollisionMask } from '../enums/CollisionGroups'
import { Shapes, ShapeSchema } from '../types/PhysicsTypes'
import { RigidBodyComponent } from './RigidBodyComponent'
import { TriggerComponent } from './TriggerComponent'

export const NestedCollidersState = defineState({
  name: 'NestedCollidersState',
  initial: () => ({}) as Record<EntityUUID, Record<Entity, ColliderDesc>>
})

export const ColliderComponent = defineComponent({
  name: 'ColliderComponent',
  jsonID: 'EE_collider',

  schema: S.Object({
    shape: ShapeSchema('box'),
    mass: S.Number(1),
    massCenter: S.Vec3(),
    friction: S.Number(0.5),
    restitution: S.Number(0.5),
    collisionLayer: S.Enum(CollisionGroups, CollisionGroups.Default),
    collisionMask: S.Number(DefaultCollisionMask),
    alignToMesh: S.Bool(false),
    applyToChildMeshes: S.Bool(false),

    //shape specific parameters
    centerOffset: S.Vec3({ x: 0, y: 0, z: 0 }),
    boxSize: S.Vec3({ x: 1, y: 1, z: 1 }),
    radius: S.Number(0.5),
    height: S.Number(1)
  }),

  // alignToMesh: (colliderEntity:Entity)=> {
  //   const colliderComponent = useOptionalComponent(colliderEntity, ColliderComponent)
  //   if (!colliderComponent) return
  //   colliderComponent.alignToMesh.set(colliderComponent.alignToMesh.value + 1)
  // },

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, ColliderComponent)
    const transform = useComponent(entity, TransformComponent)
    const rigidbodyEntity = useAncestorWithComponents(entity, [RigidBodyComponent])
    const rigidbodyComponent = useOptionalComponent(rigidbodyEntity, RigidBodyComponent)
    const physicsWorld = Physics.useWorld(entity)
    const triggerComponent = useOptionalComponent(entity, TriggerComponent)
    const hasCollider = useState(false)
    const uuid = useComponent(entity, UUIDComponent)
    const childMeshEntities = useChildrenWithComponents(entity, [MeshComponent])

    const nestedCollidersState = getMutableState(NestedCollidersState)

    useLayoutEffect(() => {
      if (!rigidbodyComponent?.initialized?.value || !physicsWorld) return

      const entitiesArray = component.applyToChildMeshes.value
        ? !childMeshEntities.includes(entity)
          ? ([...childMeshEntities, entity] as Entity[])
          : childMeshEntities
        : [entity]

      if (nestedCollidersState[uuid.value] && nestedCollidersState[uuid.value].keys) {
        //if a collider has been removed, find the leftover colliders from the state and remove them
        if (nestedCollidersState[uuid.value].keys.length >= entitiesArray.length) {
          for (const item of Array.from(nestedCollidersState[uuid.value].keys)) {
            const colliderEntity = parseInt(item) as Entity
            if (!entitiesArray.includes(colliderEntity)) {
              Physics.removeCollider(physicsWorld, colliderEntity)
              nestedCollidersState[uuid.value][colliderEntity].set(none)
            }
          }
          if (nestedCollidersState[uuid.value].keys.length === 0) {
            nestedCollidersState[uuid.value].set(none)
            hasCollider.set(false)
          }
        }
      }

      forceUpdateMatrices(entity)
      for (const childMeshEntity of entitiesArray) {
        // if (
        //   getAncestorWithComponents(childMeshEntity, [ColliderComponent]) !== entity ||
        //   !hasComponent(childMeshEntity, MeshComponent)
        // )
        //   continue

        if (
          nestedCollidersState[uuid.value] &&
          nestedCollidersState[uuid.value][childMeshEntity] &&
          nestedCollidersState[uuid.value][childMeshEntity].value
        )
          continue

        forceUpdateMatrices(childMeshEntity, entity)

        const colliderDesc = Physics.createColliderDesc(physicsWorld, childMeshEntity, rigidbodyEntity, entity)

        if (!colliderDesc) continue

        Physics.attachCollider(physicsWorld, colliderDesc, rigidbodyEntity, childMeshEntity)

        if (!nestedCollidersState[uuid.value].value) {
          nestedCollidersState[uuid.value].set({} as Record<Entity, ColliderDesc>)
        }

        nestedCollidersState[uuid.value][childMeshEntity].set(colliderDesc)
      }
      if (
        nestedCollidersState[uuid.value] &&
        nestedCollidersState[uuid.value].keys &&
        nestedCollidersState[uuid.value].keys.length > 0
      ) {
        hasCollider.set(true)
      }

      return () => {}
    }, [
      physicsWorld,
      component.shape,
      !!rigidbodyComponent?.initialized?.value,
      transform.scale,
      childMeshEntities,
      component.alignToMesh,
      component.centerOffset,
      component.boxSize,
      component.radius,
      component.height,
      component.applyToChildMeshes
    ])

    useEffect(() => {
      if (!rigidbodyComponent?.initialized?.value || !physicsWorld) return
      return () => {
        if (!nestedCollidersState[uuid.value].value) return
        const itemsToClear = nestedCollidersState[uuid.value].keys
        for (const item of Array.from(itemsToClear)) {
          const entityToRemove = parseInt(item) as Entity
          Physics.removeCollider(physicsWorld, entityToRemove)
        }
        nestedCollidersState[uuid.value].set(none)
        hasCollider.set(false)
      }
    }, [])

    useLayoutEffect(() => {
      if (!physicsWorld) return
      Physics.setMass(physicsWorld, entity, component.mass.value)
    }, [physicsWorld, component.mass])

    // useLayoutEffect(() => {
    // @todo
    // }, [physicsWorld, component.massCenter])

    useLayoutEffect(() => {
      if (!physicsWorld) return
      Physics.setFriction(physicsWorld, entity, component.friction.value)
    }, [physicsWorld, component.friction])

    useLayoutEffect(() => {
      if (!physicsWorld) return
      Physics.setRestitution(physicsWorld, entity, component.restitution.value)
    }, [physicsWorld, component.restitution])

    useLayoutEffect(() => {
      if (!physicsWorld) return
      Physics.setCollisionLayer(physicsWorld, entity, component.collisionLayer.value)
    }, [physicsWorld, component.collisionLayer])

    useLayoutEffect(() => {
      if (!physicsWorld) return
      Physics.setCollisionMask(physicsWorld, entity, component.collisionMask.value)
    }, [physicsWorld, component.collisionMask])

    useLayoutEffect(() => {
      if (!physicsWorld || !triggerComponent?.value || !hasCollider.value) return

      Physics.setTrigger(physicsWorld, entity, true)

      return () => {
        Physics.setTrigger(physicsWorld, entity, false)
      }
    }, [physicsWorld, triggerComponent, hasCollider])

    useEffect(() => {
      setCallback(entity, 'Disable Collision', () => {
        if (!physicsWorld) return
        Physics.setCollisionLayer(physicsWorld, entity, CollisionGroups.None)
      })
      setCallback(entity, 'Enable Collision', () => {
        if (!physicsWorld) return
        Physics.setCollisionLayer(physicsWorld, entity, component.collisionLayer.value)
      })
      return () => {
        removeCallback(entity, 'Disable Collision')
        removeCallback(entity, 'Enable Collision')
      }
    }, [])

    return null
  }
})

export const supportedColliderShapes = [
  Shapes.Sphere,
  Shapes.Capsule,
  Shapes.Cylinder,
  Shapes.Box,
  // Shapes.ConvexHull,
  Shapes.Mesh
  // Shapes.Heightfield
]

function forceUpdateMatrices(childEntity: Entity, ancestorEntity: Entity = UndefinedEntity) {
  const entities = [] as Entity[]
  getTreeFromChildToAncestor(childEntity, entities, ancestorEntity)
  if (entities.length === 0) return
  for (let i = entities.length - 1; i >= 0; i--) {
    computeTransformMatrix(entities[i])
  }
}
