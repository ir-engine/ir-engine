import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { RenderedComponent } from '../components/RenderedComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { UpdatableComponent } from '../components/UpdatableComponent'
import { Updatable } from '../interfaces/Updatable'
import { World } from '../../ecs/classes/World'
import { System } from '../../ecs/classes/System'

/**
 * @author Dhara Patel <github.com/frozencrystal>
 */

const renderedQuery = defineQuery([Object3DComponent, RenderedComponent])
const renderedUpdatableQuery = defineQuery([UpdatableComponent, RenderedComponent])

export default async function RendererUpdateSystem(world: World): Promise<System> {
  return () => {
    for (const entity of renderedQuery()) {
      const obj = getComponent(entity, Object3DComponent)
      ;(obj.value as unknown as Updatable).update(world.delta)
    }

    for (const entity of renderedUpdatableQuery()) {
      const updateObj = getComponent(entity, UpdatableComponent)
      ;(updateObj.value as unknown as Updatable).update(world.delta)
    }
  }
}
