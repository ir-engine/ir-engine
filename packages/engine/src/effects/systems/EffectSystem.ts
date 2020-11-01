import { Object3DComponent } from '../../common/components/Object3DComponent'
import { HighlightComponent } from '../components/HighlightComponent'
import { System, SystemAttributes } from '../../ecs/classes/System'
import { registerComponent } from '../../ecs/functions/ComponentFunctions'
import {
  getComponent,
  addComponent,
  removeComponent
} from '../../ecs/functions/EntityFunctions'
import { RendererComponent } from '../../renderer/components/RendererComponent'
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType'

export class HighlightSystem extends System {
  updateType = SystemUpdateType.Fixed;

  constructor(attributes?: SystemAttributes) {
    super(attributes)
  }
  canExecute(delta: number): boolean {
    return super.canExecute(delta) && !!RendererComponent?.instance?.composer
  }

  execute(deltaTime, time): void {
    for (const entity of this.queryResults.hightlights.added) {
      const hightlightedObject = getComponent(entity, Object3DComponent).value
      hightlightedObject.traverse(obj => {
        if (obj !== undefined) {
          RendererComponent.instance.composer.outlineEffect?.selection.add(obj)
        }
      })
    }
    for (const entity of this.queryResults.hightlights.removed) {
      const hightlightedObject = getComponent(entity, Object3DComponent).value
      hightlightedObject.traverse(obj => {
        if (obj !== undefined) {
          RendererComponent.instance.composer.outlineEffect?.selection.delete(
            obj
          )
        }
      })
    }
  }
}
HighlightSystem.queries = {
  hightlights: {
    components: [Object3DComponent, HighlightComponent],
    listen: {
      removed: true,
      added: true
    }
  }
}
