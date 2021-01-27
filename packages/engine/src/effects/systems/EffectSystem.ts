import { Object3DComponent } from '../../common/components/Object3DComponent'
import { System, SystemAttributes } from '../../ecs/classes/System'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType'
import { RendererComponent } from '../../renderer/components/RendererComponent'
import { HighlightComponent } from '../components/HighlightComponent'

/** System Class for Highlight system.\
 * This system will highlight the entity with {@link effects/components/HighlightComponent.HighlightComponent | Highlight} Component attached.
 */
export class HighlightSystem extends System {
  /** Update type of the system. **Default** value is 
   * {@link ecs/functions/SystemUpdateType.SystemUpdateType.Fixed | Fixed} type.
   */
  updateType = SystemUpdateType.Fixed;

  /** Constructs Highlight system. */
  constructor(attributes?: SystemAttributes) {
    super(attributes);
  }

  /** Executes the system. */
  execute(deltaTime, time): void {
    for (const entity of this.queryResults.highlights.added) {
      const highlightedObject = getComponent(entity, Object3DComponent).value;
      highlightedObject.traverse(obj => {
        if (obj !== undefined) {
          RendererComponent.instance.composer.outlineEffect?.selection.add(obj);
        }
      });
    }
    for (const entity of this.queryResults.highlights.removed) {
      const highlightedObject = getComponent(entity, Object3DComponent).value;
      highlightedObject.traverse(obj => {
        if (obj !== undefined) {
          RendererComponent.instance.composer.outlineEffect?.selection.delete(obj);
        }
      });
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
};
