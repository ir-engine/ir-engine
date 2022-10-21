import * as bitECS from 'bitecs'
import { startTransition } from 'react'

import { createReactor, ReactorRoot } from '@xrengine/hyperflux'

import { Engine } from '../classes/Engine'
import { Entity, UndefinedEntity } from '../classes/Entity'
import { EntityRemovedComponent, removeAllComponents, setComponent } from './ComponentFunctions'

export const createEntity = (world = Engine.instance.currentWorld): Entity => {
  let entity = bitECS.addEntity(world)
  if (entity === 0) entity = bitECS.addEntity(world) // always discard entity 0 since we do a lot of `if (entity)` checks
  return entity as Entity
}

export const removeEntity = (entity: Entity, immediately = false, world = Engine.instance.currentWorld) => {
  if (!entityExists(entity, world)) throw new Error(`[removeEntity]: Entity ${entity} does not exist in the world`)

  removeAllComponents(entity, world)

  startTransition(() => {
    setComponent(entity, EntityRemovedComponent, true)
    if (entityReactorRoots.has(entity)) {
      for (const state of entityReactorRoots.get(entity)!) {
        state.set(UndefinedEntity)
      }
    }
  })

  if (immediately) {
    bitECS.removeEntity(world, entity)
  }
}

export const entityExists = (entity: Entity, world = Engine.instance.currentWorld) => {
  return bitECS.entityExists(world, entity)
}

interface EntityReactorRoot extends ReactorRoot {
  entity: Entity
}

/**
 * This state allows entity reactors to be destroyed when their associated entity is destroyed
 */
const entityReactorRoots = new Array<EntityReactorRoot>()

export interface EntityReactorProps {
  root: EntityReactorRoot
}

export const createEntityReactor = (entity: Entity, EntityReactor: React.FC<EntityReactorProps>) => {
  const root = createReactor(() => {
    return <EntityReactor root={root} />
  }) as EntityReactorRoot
  root.entity = entity
  entityReactorRoots.push(root)
}
