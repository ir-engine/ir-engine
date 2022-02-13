import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { RenderedComponent } from '../components/RenderedComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { Updatable } from '../interfaces/Updatable'
import { World } from '../../ecs/classes/World'

/**
 * @author Dhara Patel <github.com/frozencrystal>
 */

const renderedQuery = defineQuery([Object3DComponent, RenderedComponent])

export default async function RendererUpdateSystem(world: World) {
  return () => {
    for (const entity of renderedQuery()) {
      const obj = getComponent(entity, Object3DComponent)
      ;(obj.value as unknown as Updatable).update(world.delta)
    }
  }
}
