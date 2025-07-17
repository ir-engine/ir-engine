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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { defineComponent, useComponent, useEntityContext, useHasComponent, useOptionalComponent } from '@ir-engine/ecs'

import { useAncestorWithComponents } from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import React, { useEffect, useLayoutEffect } from 'react'
import { removeCallback, setCallback } from '../../common/CallbackComponent'
import { Vector3_One } from '../../common/constants/MathConstants'
import { T } from '../../schema/schemaFunctions'
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
    mass: S.Number({ default: 1 }),
    massCenter: T.Vec3(),
    friction: S.Number({ default: 0.5 }),
    restitution: S.Number({ default: 0.5 }),
    collisionLayer: S.Enum(CollisionGroups, {
      $comment:
        "A bitmask, ie. an integer whose binary digits, in order of least to most significance, represent the following values: 'Default', 'Avatars', 'Ground', 'Trigger'",
      default: CollisionGroups.Default
    }),
    collisionMask: S.Number({ default: DefaultCollisionMask }),
    hasCollider: S.Bool({ default: false, serialized: false }),
    //shape specific parameters
    matchMesh: S.Bool({ default: true }),
    centerOffset: T.Vec3(),
    boxSize: T.Vec3(Vector3_One),
    radius: S.Number({ default: 1 }),
    height: S.Number({ default: 2 })
  }),

  reactor: () => {
    return <ColliderReactor />
  }
})

const ColliderReactor = function () {
  const entity = useEntityContext()
  const component = useComponent(entity, ColliderComponent)
  const transform = useComponent(entity, TransformComponent)
  const rigidbodyEntity = useAncestorWithComponents(entity, [RigidBodyComponent])
  const rigidbodyComponent = useOptionalComponent(rigidbodyEntity, RigidBodyComponent)
  const physicsWorld = Physics.useWorld(entity)
  const triggerComponent = useHasComponent(entity, TriggerComponent)

  useLayoutEffect(() => {
    if (!rigidbodyComponent?.initialized || !physicsWorld) return

    const colliderDesc = Physics.createColliderDesc(physicsWorld, entity, rigidbodyEntity)

    if (!colliderDesc) return

    Physics.attachCollider(physicsWorld, colliderDesc, rigidbodyEntity, entity)
    component.hasCollider = true

    return () => {
      if (!physicsWorld) return
      Physics.removeCollider(physicsWorld, entity)
    }
  }, [
    physicsWorld,
    component.shape,
    !!rigidbodyComponent?.initialized,
    transform.scale,
    component.centerOffset,
    component.boxSize,
    component.radius,
    component.height
  ])

  useLayoutEffect(() => {
    if (!physicsWorld) return
    Physics.setMass(physicsWorld, entity, component.mass)
  }, [physicsWorld, component.mass])

  // useLayoutEffect(() => {
  // @todo
  // }, [physicsWorld, component.massCenter])

  useLayoutEffect(() => {
    if (!physicsWorld) return
    Physics.setFriction(physicsWorld, entity, component.friction)
  }, [physicsWorld, component.friction])

  useLayoutEffect(() => {
    if (!physicsWorld) return
    Physics.setRestitution(physicsWorld, entity, component.restitution)
  }, [physicsWorld, component.restitution])

  useLayoutEffect(() => {
    if (!physicsWorld) return
    Physics.setCollisionLayer(physicsWorld, entity, component.collisionLayer)
  }, [physicsWorld, component.collisionLayer])

  useLayoutEffect(() => {
    if (!physicsWorld) return
    Physics.setCollisionMask(physicsWorld, entity, component.collisionMask)
  }, [physicsWorld, component.collisionMask])

  useLayoutEffect(() => {
    if (!physicsWorld || !triggerComponent || !component.hasCollider) return

    Physics.setTrigger(physicsWorld, entity, true)

    return () => {
      Physics.setTrigger(physicsWorld, entity, false)
    }
  }, [physicsWorld, triggerComponent, component.hasCollider])

  useEffect(() => {
    if (!physicsWorld) return

    setCallback(entity, 'Disable Collision', () => {
      if (!physicsWorld) return
      Physics.setCollisionLayer(physicsWorld, entity, CollisionGroups.None)
    })
    setCallback(entity, 'Enable Collision', () => {
      if (!physicsWorld) return
      Physics.setCollisionLayer(physicsWorld, entity, component.collisionLayer)
    })
    return () => {
      removeCallback(entity, 'Disable Collision')
      removeCallback(entity, 'Enable Collision')
    }
  }, [physicsWorld])

  return null
}

export const supportedColliderShapes = [
  Shapes.Sphere,
  Shapes.Capsule,
  Shapes.Cylinder,
  Shapes.Box,
  // Shapes.ConvexHull,
  Shapes.Mesh
  // Shapes.Heightfield
]
