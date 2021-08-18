import { defineQuery, defineSystem, enterQuery, exitQuery, System } from '../../ecs/bitecs'
import { ECSWorld } from '../../ecs/classes/World'
import { NameComponent } from '../components/NameComponent'

/**
 * @author Gheric Speiginer <github.com/speigg>
 */

export const NamedEntitiesSystem = async (): Promise<System> => {
  const nameQuery = defineQuery([NameComponent])
  const nameEnterQuery = enterQuery(nameQuery)
  const nameExitQuery = exitQuery(nameQuery)

  return defineSystem((world: ECSWorld) => {
    for (const entity of nameEnterQuery(world)) {
      const { name } = NameComponent.get(entity)
      if (world.world.namedEntities.has(name)) throw new Error(`An Entity with name "${name}" already exists.`)
      world.world.namedEntities.set(name, entity)
    }

    for (const entity of nameExitQuery(world)) {
      const { name } = NameComponent.get(entity)
      world.world.namedEntities.delete(name)
    }

    return world
  })
}
