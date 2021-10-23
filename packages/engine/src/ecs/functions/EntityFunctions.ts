import * as bitECS from 'bitecs'
import { Entity } from '../classes/Entity'
import { getComponent, hasComponent, removeAllComponents } from './ComponentFunctions'
import { useWorld } from './SystemHooks'
import { NameComponent } from '../../scene/components/NameComponent'

export const createEntity = (world = useWorld()): Entity => {
  const entity = bitECS.addEntity(world) as Entity
  world.entities.push(entity)
  return entity
}

export const removeEntity = (entity: Entity, world = useWorld()) => {
  if (hasComponent(entity, NameComponent)) {
    const { name } = getComponent(entity, NameComponent)
    if (entity === world.namedEntities.get(name)) {
      world.namedEntities.delete(name)
    }
  }
  removeAllComponents(entity, world)
  world.entities.splice(world.entities.indexOf(entity), 1)
  bitECS.removeEntity(world, entity)
}
