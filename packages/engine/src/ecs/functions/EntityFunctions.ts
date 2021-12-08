import * as bitECS from 'bitecs'
import { Entity } from '../classes/Entity'
import { addComponent, EntityRemovedComponent, removeAllComponents } from './ComponentFunctions'
import { useWorld } from './SystemHooks'

export const createEntity = (world = useWorld()): Entity => {
  return bitECS.addEntity(world) as Entity
}

export const removeEntity = (entity: Entity, world = useWorld()) => {
  removeAllComponents(entity, world)
  addComponent(entity, EntityRemovedComponent, {})
}
