import {
  Entity,
  hasComponent,
  removeComponent,
  setComponent,
  UndefinedEntity,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs'
import { Physics } from '@ir-engine/spatial/src/physics/classes/Physics'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import {
  getTreeFromChildToAncestor,
  useAncestorWithComponents,
  useChildrenWithComponents
} from '@ir-engine/spatial/src/transform/components/EntityTree'
import { computeTransformMatrix } from '@ir-engine/spatial/src/transform/systems/TransformSystem'
import { useEffect, useLayoutEffect } from 'react'
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
export function applyCollidersToChildMeshes(entity: Entity) {
  const childMeshEntities = useChildrenWithComponents(entity, [MeshComponent])
  const physicsWorld = Physics.useWorld(entity)
  const rigidbodyEntity = useAncestorWithComponents(entity, [RigidBodyComponent])
  const rigidbodyComponent = useOptionalComponent(rigidbodyEntity, RigidBodyComponent)
  const component = useComponent(entity, GLTFComponent)

  //populate/update collider state
  useLayoutEffect(() => {
    if (!rigidbodyComponent?.initialized?.value || !physicsWorld) return

    const entitiesArray =
      !childMeshEntities.includes(entity) && hasComponent(entity, MeshComponent)
        ? ([...childMeshEntities, entity] as Entity[])
        : childMeshEntities

    forceUpdateMatrices(entity)
    for (const childMeshEntity of entitiesArray) {
      if (component.applyColliders.value) {
        setComponent(childMeshEntity, ColliderComponent, { shape: component.shape.value, matchMesh: true })
        forceUpdateMatrices(childMeshEntity)
      } else {
        removeComponent(childMeshEntity, ColliderComponent)
      }
    }
  }, [physicsWorld, component.shape, !!rigidbodyComponent?.initialized?.value, component.applyColliders])

  useEffect(() => {
    return () => {
      const entities = [...childMeshEntities, entity] as Entity[]
      for (const childMeshEntity of entities) {
        removeComponent(childMeshEntity, ColliderComponent)
      }
    }
  }, [])
}
