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

import {
  Entity,
  UndefinedEntity,
  defineComponent,
  getComponent,
  hasComponent,
  useComponent,
  useEntityContext
} from '@etherealengine/ecs'
import { getState, useHookstate } from '@etherealengine/hyperflux'
import React, { useEffect } from 'react'
import { Vector3 } from 'three'
import { EntityTreeComponent, traverseEntityNodeParent } from '../../transform/components/EntityTree'
import { Physics } from '../classes/Physics'
import { CollisionGroups, DefaultCollisionMask } from '../enums/CollisionGroups'
import { PhysicsState } from '../state/PhysicsState'
import { Shape, Shapes } from '../types/PhysicsTypes'
import { RigidBodyComponent } from './RigidBodyComponent'

export const ColliderComponent = defineComponent({
  name: 'ColliderComponent',
  jsonID: 'EE_collider',

  onInit(entity) {
    return {
      shape: 'box' as Shape,
      mass: 1,
      massCenter: new Vector3(),
      friction: 0.5,
      restitution: 0.5,
      collisionLayer: CollisionGroups.Default,
      collisionMask: DefaultCollisionMask
    }
  },

  onSet(entity, component, json) {
    if (!json) return

    if (typeof json.shape === 'number') component.shape.set(json.shape)
    if (typeof json.mass === 'number') component.mass.set(json.mass)
    if (typeof json.massCenter === 'object')
      component.massCenter.set(new Vector3(json.massCenter.x, json.massCenter.y, json.massCenter.z))
    if (typeof json.friction === 'number') component.friction.set(json.friction)
    if (typeof json.restitution === 'number') component.restitution.set(json.restitution)
    if (typeof json.collisionLayer === 'number') component.collisionLayer.set(json.collisionLayer)
    if (typeof json.collisionMask === 'number') component.collisionMask.set(json.collisionMask)
  },

  toJSON(entity, component) {
    return {
      shape: component.shape.value,
      mass: component.mass.value,
      massCenter: component.massCenter.value,
      friction: component.friction.value,
      restitution: component.restitution.value,
      collisionLayer: component.collisionLayer.value,
      collisionMask: component.collisionMask.value
    }
  },

  reactor: ColliderComponentReactor
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

function ColliderComponentReactor() {
  const entity = useEntityContext()
  /** @todo we may need to use a useHierarchyComponent sort of thing here */
  const entityTreeComponent = useComponent(entity, EntityTreeComponent)
  const rigidbodyEntity = useHookstate(UndefinedEntity)

  useEffect(() => {
    let parentRigidbodyEntity = UndefinedEntity
    traverseEntityNodeParent(entity, (parentEntity) => {
      if (hasComponent(parentEntity, RigidBodyComponent)) {
        parentRigidbodyEntity = parentEntity
      }
    })
    rigidbodyEntity.set(parentRigidbodyEntity)
  }, [entityTreeComponent.parentEntity])

  return rigidbodyEntity.value ? (
    <ColliderComponentRigidbodyReactor
      entity={entity}
      rigidbodyEntity={rigidbodyEntity.value}
      key={rigidbodyEntity.value}
    />
  ) : null
}

function ColliderComponentRigidbodyReactor(props: { entity: Entity; rigidbodyEntity: Entity }) {
  const rigidbodyComponent = useComponent(props.rigidbodyEntity, RigidBodyComponent)

  useEffect(() => {
    if (!rigidbodyComponent.body.value) return

    const colliderDesc = Physics.createColliderDesc(
      props.entity,
      props.rigidbodyEntity,
      getComponent(props.entity, ColliderComponent)
    )
    const rigidbody = rigidbodyComponent.body.value

    const physicsWorld = getState(PhysicsState).physicsWorld
    physicsWorld.createCollider(colliderDesc, rigidbody)

    return () => {
      physicsWorld.removeCollider(colliderDesc, false)
    }
  }, [rigidbodyComponent])

  return null
}
