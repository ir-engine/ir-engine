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

import { defineComponent, useComponent, useEntityContext, useOptionalComponent } from '@ir-engine/ecs'
import { useState } from '@ir-engine/hyperflux'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { useEffect, useLayoutEffect } from 'react'
import { removeCallback, setCallback } from '../../common/CallbackComponent'
import { T } from '../../schema/schemaFunctions'
import { useAncestorWithComponents } from '../../transform/components/EntityTree'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Physics } from '../classes/Physics'
import { CollisionGroups, DefaultCollisionMask } from '../enums/CollisionGroups'
import { ShapeSchema, Shapes } from '../types/PhysicsTypes'
import { RigidBodyComponent } from './RigidBodyComponent'
import { TriggerComponent } from './TriggerComponent'

export const ColliderComponent = defineComponent({
  name: 'ColliderComponent',
  jsonID: 'EE_collider',

  schema: S.Object({
    shape: ShapeSchema('box'),
    mass: S.Number(1),
    massCenter: T.Vec3(),
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

    useLayoutEffect(() => {
      if (!rigidbodyComponent?.initialized?.value || !physicsWorld) return

      const colliderDesc = Physics.createColliderDesc(physicsWorld, entity, rigidbodyEntity)

      if (!colliderDesc) return

      Physics.attachCollider(physicsWorld, colliderDesc, rigidbodyEntity, entity)
      hasCollider.set(true)

      return () => {
        Physics.removeCollider(physicsWorld, entity)
        hasCollider.set(false)
      }
    }, [physicsWorld, component.shape, !!rigidbodyComponent?.initialized?.value, transform.scale])

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
