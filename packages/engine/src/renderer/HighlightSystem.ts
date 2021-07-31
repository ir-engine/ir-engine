import { Object3DComponent } from '../scene/components/Object3DComponent'
import { System } from '../ecs/classes/System'
import { getComponent } from '../ecs/functions/EntityFunctions'
import { HighlightComponent } from './components/HighlightComponent'
import { Engine } from '../ecs/classes/Engine'

/** System Class for Highlight system.\
 * This system will highlight the entity with {@link effects/components/HighlightComponent.HighlightComponent | Highlight} Component attached.
 */
export class HighlightSystem extends System {
  /** Executes the system. */
  execute(deltaTime, time): void {
    if (!Engine.effectComposer.OutlineEffect) return
    for (const entity of this.queryResults.highlights.added) {
      const highlightedObject = getComponent(entity, Object3DComponent)
      const compHL = getComponent(entity, HighlightComponent)
      if (!compHL) continue
      highlightedObject?.value?.traverse((obj) => {
        if (obj !== undefined) {
          Engine.effectComposer.OutlineEffect.selection.add(obj)
          Engine.effectComposer.OutlineEffect.visibleEdgeColor = compHL.color
          Engine.effectComposer.OutlineEffect.hiddenEdgeColor = compHL.hiddenColor
        }
      })
    }
    for (const entity of this.queryResults.highlights.removed) {
      const highlightedObject = getComponent(entity, Object3DComponent, true)
      highlightedObject?.value?.traverse((obj) => {
        if (obj !== undefined) {
          Engine.effectComposer.OutlineEffect.selection.delete(obj)
        }
      })
    }
  }
}

HighlightSystem.queries = {
  highlights: {
    components: [Object3DComponent, HighlightComponent],
    listen: {
      removed: true,
      added: true
    }
  }
}
