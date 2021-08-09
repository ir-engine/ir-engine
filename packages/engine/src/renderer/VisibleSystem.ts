import { Object3DComponent } from '../scene/components/Object3DComponent'
import { System } from '../ecs/classes/System'
import { getComponent } from '../ecs/functions/EntityFunctions'
import { HighlightComponent } from './components/HighlightComponent'
import { Engine } from '../ecs/classes/Engine'
import { VisibleComponent } from '../scene/components/VisibleComponent'

/** System Class for Highlight system.\
 * This system will highlight the entity with {@link effects/components/HighlightComponent.HighlightComponent | Highlight} Component attached.
 */
export class VisibilitySystem extends System {
  /** Executes the system. */
  execute(deltaTime, time): void {
    for (const entity of this.queryResults.visible.added) {
      const obj = getComponent(entity, Object3DComponent)
      const visibleComponent = getComponent(entity, VisibleComponent)
      obj.value.visible = visibleComponent.value
    }
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
