import * as bitECS from 'bitecs'
import { Entity } from './Entity'
import { getComponent, hasComponent, removeAllComponents } from './ComponentFunctions'
import { useWorld } from './SystemHooks'
import { NameComponent } from '../scene/components/NameComponent'

/**
* Create an entity.
* @param world - World.
* @return {@link Entity}
* @internal
*/
export const createEntity = (world = useWorld()): Entity => {
  const entity = bitECS.addEntity(world) as Entity
  world.entities.push(entity)
  return entity
}

/**
* Remove an entity from the world.
* If the entity has a component, it checks if the entity is the named entity with the same name.
* If it is, it removes the named entity.
* If the entity has no components, it removes the entity from the world.
* If the entity has components, it removes all components from the entity and removes the entity from the world.
* @param entity - Entity to remove.
 * @param world - World to remove the entity from.
 * @throws {@link MaxListenerExceededException}
* Thrown if the event is already assigned to another listener.
* @internal
*/ export const removeEntity = (entity: Entity, world = useWorld()) => {
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
