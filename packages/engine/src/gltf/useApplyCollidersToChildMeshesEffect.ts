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
  Entity,
  entityExists,
  getTreeFromChildToAncestor,
  hasComponent,
  removeComponent,
  setComponent,
  UndefinedEntity,
  useAncestorWithComponents,
  useChildrenWithComponents,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs'
import { Physics } from '@ir-engine/spatial/src/physics/classes/Physics'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { computeTransformMatrix } from '@ir-engine/spatial/src/transform/systems/TransformSystem'
import { useLayoutEffect } from 'react'
import { SourceComponent } from '../scene/components/SourceComponent'
import { GLTFComponent } from './GLTFComponent'

function forceUpdateMatrices(childEntity: Entity, ancestorEntity: Entity = UndefinedEntity) {
  const entities = [] as Entity[]
  getTreeFromChildToAncestor(childEntity, entities, ancestorEntity)
  if (entities.length === 0) return
  for (let i = entities.length - 1; i >= 0; i--) {
    computeTransformMatrix(entities[i])
  }
}

/**
 * Applies colliders to entity and all child entites with MeshComponent
 * @param entity
 */
export function useApplyCollidersToChildMeshesEffect(entity: Entity) {
  const childMeshEntities = useChildrenWithComponents(entity, [MeshComponent])
  const physicsWorld = Physics.useWorld(entity)
  const rigidbodyEntity = useAncestorWithComponents(entity, [RigidBodyComponent])
  const rigidbodyComponent = useOptionalComponent(rigidbodyEntity, RigidBodyComponent)
  const component = useComponent(entity, GLTFComponent)

  useLayoutEffect(() => {
    if (!rigidbodyComponent?.initialized?.value || !physicsWorld || !physicsWorld.Rigidbodies.has(rigidbodyEntity))
      return
    forceUpdateMatrices(entity)

    if (!component.applyColliders.value) return

    const children = [...childMeshEntities]
    if (hasComponent(entity, MeshComponent)) children.push(entity)

    const added = [] as Entity[]
    for (const child of children) {
      // Don't add colliders to meshes with colliders baked in or helper meshes
      if (entityExists(child) && !hasComponent(child, ColliderComponent) && hasComponent(child, SourceComponent)) {
        setComponent(child, ColliderComponent, { shape: component.shape.value, matchMesh: true })
        forceUpdateMatrices(child)
        added.push(child)
      }
    }

    return () => {
      for (const entity of added) {
        if (entityExists(entity)) removeComponent(entity, ColliderComponent)
      }
    }
  }, [
    entity,
    physicsWorld,
    component.shape,
    !!rigidbodyComponent?.initialized?.value,
    component.applyColliders.value,
    // Work around, remove JSON.stringify after useChildrenWithComponents has been updated to return a reactive array again
    JSON.stringify(childMeshEntities)
  ])
}
