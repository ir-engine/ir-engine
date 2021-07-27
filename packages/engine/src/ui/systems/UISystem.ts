import { System } from '../../ecs/classes/System'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType'
import { UIRootComponent } from '../components/UIRootComponent'

export class UISystem extends System {
  updateType = SystemUpdateType.Free

  execute(): void {
    const interactionRays = []
    for (const entity of this.queryResults.ui.all) {
      const layer = getComponent(entity, UIRootComponent).layer
      layer.interactionRays = interactionRays
      layer.update()
    }
  }
}

UISystem.queries = {
  ui: {
    components: [UIRootComponent]
  }
}
