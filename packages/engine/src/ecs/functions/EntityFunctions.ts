import * as bitECS from 'bitecs'
import { Entity } from '../classes/Entity'
import { addComponent, EntityRemovedComponent, removeAllComponents } from './ComponentFunctions'
import { useWorld } from './SystemHooks'

export const createEntity = (world = useWorld()): Entity => {
  return bitECS.addEntity(world) as Entity
}

export const removeEntity = (entity: Entity, immediately = false, world = useWorld()) => {
  removeAllComponents(entity, world)

  if (immediately) bitECS.removeEntity(world, entity)
  else addComponent(entity, EntityRemovedComponent, {})
}
