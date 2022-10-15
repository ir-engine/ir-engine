import * as bitECS from 'bitecs'
import { startTransition, useEffect } from 'react'

import { createReactor, createState, State } from '@xrengine/hyperflux'

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
    if (reactorEntityStates.has(entity)) {
      for (const state of reactorEntityStates.get(entity)!) {
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

const reactorEntityStates = new Map<Entity, State<Entity>[]>()

export interface EntityReactorParams {
  entity: Entity
  destroyReactor: () => void
}

export const createEntityReactor = (
  entity: Entity,
  entityReactor: (entityReactorParams: EntityReactorParams) => void
) => {
  const entityState = createState(entity)
  if (!reactorEntityStates.has(entity)) reactorEntityStates.set(entity, [])
  reactorEntityStates.get(entity)!.push(entityState)
  const destroy = createReactor(() => {
    entityReactor({ entity: entityState.value, destroyReactor: destroy })
    useEffect(() => {
      if (!entityState.value) {
        destroy()
      }
    }, [entityState])
  })
  return destroy
}
