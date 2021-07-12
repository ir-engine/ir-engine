import { Object3DComponent } from '../scene/components/Object3DComponent'
import { System, SystemAttributes } from '../ecs/classes/System'
import { getComponent } from '../ecs/functions/EntityFunctions'
import { SystemUpdateType } from '../ecs/functions/SystemUpdateType'
import { WebGLRendererSystem } from './WebGLRendererSystem'
import { HighlightComponent } from './components/HighlightComponent'

/** System Class for Highlight system.\
 * This system will highlight the entity with {@link effects/components/HighlightComponent.HighlightComponent | Highlight} Component attached.
 */
export class HighlightSystem extends System {
  /** Update type of the system. **Default** value is
   * {@link ecs/functions/SystemUpdateType.SystemUpdateType.Fixed | Fixed} type.
   */
  updateType = SystemUpdateType.Free

  /** Constructs Highlight system. */
  constructor(attributes: SystemAttributes = {}) {
    super(attributes)
  }

  /** Executes the system. */
  execute(deltaTime, time): void {
    if (!WebGLRendererSystem.instance.composer.OutlineEffect) return
    for (const entity of this.queryResults.highlights.added) {
      const highlightedObject = getComponent(entity, Object3DComponent)
      const compHL = getComponent(entity, HighlightComponent)
      if (!compHL) return
      highlightedObject?.value?.traverse((obj) => {
        if (obj !== undefined) {
          WebGLRendererSystem.instance.composer.OutlineEffect.selection.add(obj)
          WebGLRendererSystem.instance.composer.OutlineEffect.visibleEdgeColor = compHL.color
          WebGLRendererSystem.instance.composer.OutlineEffect.hiddenEdgeColor = compHL.hiddenColor
        }
      })
    }
    for (const entity of this.queryResults.highlights.removed) {
      const highlightedObject = getComponent(entity, Object3DComponent, true)
      highlightedObject?.value?.traverse((obj) => {
        if (obj !== undefined) {
          WebGLRendererSystem.instance.composer.OutlineEffect.selection.delete(obj)
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
