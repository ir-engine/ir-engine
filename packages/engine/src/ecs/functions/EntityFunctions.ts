import * as bitECS from 'bitecs'

import { Engine } from '../classes/Engine'
import { Entity } from '../classes/Entity'
import { addComponent, EntityRemovedComponent, removeAllComponents } from './ComponentFunctions'

export const createEntity = (world = Engine.instance.currentWorld): Entity => {
  return bitECS.addEntity(world) as Entity
}

export const removeEntity = (entity: Entity, immediately = false, world = Engine.instance.currentWorld) => {
  if (!entityExists(entity, world)) throw new Error(`[removeEntity]: Entity ${entity} does not exist in the world`)

  if (immediately) {
    bitECS.removeEntity(world, entity)
  } else {
    removeAllComponents(entity, world)
    addComponent(entity, EntityRemovedComponent, null)
  }
}

export const entityExists = (entity: Entity, world = Engine.instance.currentWorld) => {
  return bitECS.entityExists(world, entity)
}
