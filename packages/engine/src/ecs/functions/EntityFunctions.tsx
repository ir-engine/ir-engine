import * as bitECS from 'bitecs'

import { ReactorRoot } from '@etherealengine/hyperflux'

import { Engine } from '../classes/Engine'
import { Entity } from '../classes/Entity'
import { EntityRemovedComponent, removeAllComponents, setComponent } from './ComponentFunctions'

export const createEntity = (): Entity => {
  let entity = bitECS.addEntity(Engine.instance)
  if (entity === 0) entity = bitECS.addEntity(Engine.instance) // always discard entity 0 since we do a lot of `if (entity)` checks
  return entity as Entity
}

export const removeEntity = (entity: Entity, immediately = false) => {
  if (!entity || !entityExists(entity)) throw new Error(`[removeEntity]: Entity ${entity} does not exist in the world`)

  removeAllComponents(entity)
  setComponent(entity, EntityRemovedComponent, true)

  if (immediately) {
    bitECS.removeEntity(Engine.instance, entity)
  }
}

export const entityExists = (entity: Entity) => {
  return bitECS.entityExists(Engine.instance, entity)
}

export interface EntityReactorRoot extends ReactorRoot {
  entity: Entity
}

export interface EntityReactorProps {
  root: EntityReactorRoot
}
