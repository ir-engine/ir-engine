import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import { defineQuery } from '../../ecs/functions/EntityFunctions'
import { NameComponent } from '../components/NameComponent'

/**
 * @author Gheric Speiginer <github.com/speigg>
 */
export default async function NamedEntitiesSystem(world: World): Promise<System> {
  const nameQuery = defineQuery([NameComponent])

  return () => {
    for (const entity of nameQuery.enter()) {
      const { name } = NameComponent.get(entity)
      if (world.namedEntities.has(name)) console.warn(`An Entity with name "${name}" already exists.`)
      world.namedEntities.set(name, entity)
      // console.log(`Added named entity '${name}'`)
    }

    for (const entity of nameQuery.exit(world)) {
      const { name } = NameComponent.get(entity)
      world.namedEntities.delete(name)
    }
  }
}
