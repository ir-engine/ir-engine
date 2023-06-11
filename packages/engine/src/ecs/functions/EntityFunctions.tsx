import * as bitECS from 'bitecs'
import React from 'react'

import { Engine } from '../classes/Engine'
import { Entity, UndefinedEntity } from '../classes/Entity'
import { EntityRemovedComponent, removeAllComponents, setComponent } from './ComponentFunctions'

export const createEntity = (): Entity => {
  let entity = bitECS.addEntity(Engine.instance)
  if (entity === 0) entity = bitECS.addEntity(Engine.instance) // always discard entity 0 since we do a lot of `if (entity)` checks
  return entity as Entity
}

export const removeEntity = (entity: Entity, immediately = false) => {
  if (!entity || !entityExists(entity)) throw new Error(`[removeEntity]: Entity ${entity} does not exist in the world`)

  const promise = removeAllComponents(entity)
  setComponent(entity, EntityRemovedComponent, true)

  if (immediately) {
    bitECS.removeEntity(Engine.instance, entity)
  }

  return promise
}

export const entityExists = (entity: Entity) => {
  return bitECS.entityExists(Engine.instance, entity)
}

export const EntityContext = React.createContext(UndefinedEntity)

export const useEntityContext = () => {
  return React.useContext(EntityContext)
}
