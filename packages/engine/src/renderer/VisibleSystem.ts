import { Object3DComponent } from '../scene/components/Object3DComponent'
import { System } from '../ecs/classes/System'
import { getComponent } from '../ecs/functions/EntityFunctions'
import { HighlightComponent } from './components/HighlightComponent'
import { Engine } from '../ecs/classes/Engine'
import { VisibleComponent } from '../scene/components/VisibleComponent'

/** System Class for Highlight system.\
 * This system will highlight the entity with {@link effects/components/HighlightComponent.HighlightComponent | Highlight} Component attached.
 */
export const VisibilitySystem = async (): Promise<System> => {
  /** Executes the system. */
  execute(deltaTime, time): void {
  }
}

VisibilitySystem.queries = {
  visible: {
    components: [Object3DComponent, VisibleComponent],
    listen: {
      added: true
    }
  }
}
