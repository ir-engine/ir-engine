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
  hasComponent,
  useComponent,
  useEntityContext,
  useOptionalComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { defineState, getMutableState, useState } from '@ir-engine/hyperflux'

import { ColliderDesc } from '@dimforge/rapier3d-compat'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { useEffect, useLayoutEffect } from 'react'
import { removeCallback, setCallback } from '../../common/CallbackComponent'
import { MeshComponent } from '../../renderer/components/MeshComponent.ts'
import { useAncestorWithComponents, useChildrenWithComponents } from '../../transform/components/EntityTree'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Physics } from '../classes/Physics'
import { CollisionGroups, DefaultCollisionMask } from '../enums/CollisionGroups'
import { Shapes, ShapeSchema } from '../types/PhysicsTypes'
import { RigidBodyComponent } from './RigidBodyComponent'
import { TriggerComponent } from './TriggerComponent'

export const NestedCollidersState = defineState({
  name: 'NestedCollidersState',
  initial: () => ({}) as Record<EntityUUID, { entity: Entity; colliderDesc: ColliderDesc }[]>
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
    collisionMask: S.Number(DefaultCollisionMask)
  }),

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

      for (const childMeshEntity of [...childMeshEntities, entity] as Entity[]) {
        if (hasComponent(childMeshEntity, ColliderComponent)) continue

        const colliderDesc = Physics.createColliderDesc(physicsWorld, childMeshEntity, rigidbodyEntity, entity)

        if (!colliderDesc) continue

        Physics.attachCollider(physicsWorld, colliderDesc, rigidbodyEntity, childMeshEntity)

        if (!nestedCollidersState[uuid.value].value) {
          nestedCollidersState[uuid.value].set([])
        }

        nestedCollidersState[uuid.value].set([
          ...Array.from(nestedCollidersState[uuid.value].value),
          { entity: childMeshEntity, colliderDesc: colliderDesc }
        ])
      }
      if (nestedCollidersState[uuid.value] && nestedCollidersState[uuid.value].length > 0) {
        hasCollider.set(true)
      }

      return () => {
        if (!nestedCollidersState[uuid.value].value) return
        const itemsToClear = nestedCollidersState[uuid.value].value
        for (const item of Array.from(itemsToClear)) {
          Physics.removeCollider(physicsWorld, item.entity)
        }
        hasCollider.set(false)
      }
    }, [physicsWorld, component.shape, !!rigidbodyComponent?.initialized?.value, transform.scale, childMeshEntities])

    // useLayoutEffect(() => {
    //   if (!rigidbodyComponent?.initialized?.value || !physicsWorld) return
    //
    //   const colliderDesc = Physics.createColliderDesc(physicsWorld, entity, rigidbodyEntity)
    //
    //   if (!colliderDesc) return
    //
    //   Physics.attachCollider(physicsWorld, colliderDesc, rigidbodyEntity, entity)
    //   hasCollider.set(true)
    //
    //   return () => {
    //     Physics.removeCollider(physicsWorld, entity)
    //     hasCollider.set(false)
    //   }
    // }, [physicsWorld, component.shape, !!rigidbodyComponent?.initialized?.value, transform.scale, childMeshEntities])

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
