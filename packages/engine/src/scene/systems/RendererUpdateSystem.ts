import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../components/Object3DComponent'
import { RenderedComponent } from '../components/RenderedComponent'
import { Updatable } from '../interfaces/Updatable'

/**
 * @author Dhara Patel <github.com/frozencrystal>
 */

const renderedQuery = defineQuery([Object3DComponent, RenderedComponent])

export default async function RendererUpdateSystem(world: World): Promise<System> {
  return () => {
    for (const entity of renderedQuery()) {
      const obj = getComponent(entity, Object3DComponent)
      ;(obj.value as unknown as Updatable).update(world.delta)
    }
  }
}
