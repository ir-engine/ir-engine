import { System } from '../../ecs/classes/System'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { UIRootComponent } from '../components/UIRootComponent'

export class UISystem extends System {
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
