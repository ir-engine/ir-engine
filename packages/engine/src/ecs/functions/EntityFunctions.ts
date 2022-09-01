import * as bitECS from 'bitecs'

import { Engine } from '../classes/Engine'
import { Entity } from '../classes/Entity'
import { addComponent, EntityRemovedComponent, removeAllComponents } from './ComponentFunctions'

export const createEntity = (world = Engine.instance.currentWorld): Entity => {
  return bitECS.addEntity(world) as Entity
}

export const removeEntity = (entity: Entity, immediately = false, world = Engine.instance.currentWorld) => {
  removeAllComponents(entity, world)

  if (immediately) bitECS.removeEntity(world, entity)
  else addComponent(entity, EntityRemovedComponent, {})
}

export const entityExists = (entity: Entity, world = Engine.instance.currentWorld) => {
  return bitECS.entityExists(world, entity)
}
