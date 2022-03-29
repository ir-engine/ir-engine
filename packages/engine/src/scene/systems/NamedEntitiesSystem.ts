import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { NameComponent } from '../components/NameComponent'
import { Object3DComponent } from '../components/Object3DComponent'

/**
 * @author Gheric Speiginer <github.com/speigg>
 */
export default async function NamedEntitiesSystem(world: World) {
  const nameQuery = defineQuery([NameComponent])

  return () => {
    for (const entity of nameQuery.enter()) {
      const { name } = getComponent(entity, NameComponent)
      if (world.namedEntities.has(name)) console.warn(`An Entity with name "${name}" already exists.`)
      world.namedEntities.set(name, entity)

      const obj3d = getComponent(entity, Object3DComponent)?.value
      if (obj3d) obj3d.name = name
    }
    for (const entity of nameQuery.exit()) {
      const { name } = getComponent(entity, NameComponent, true)
      world.namedEntities.delete(name)
    }
  }
}
