import { World } from '@etherealengine/engine/src/ecs/classes/World'
import { removeComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { WidgetName, Widgets } from '@etherealengine/engine/src/xrui/Widgets'

import { createReadyPlayerMenu } from './ui/ProfileDetailView/ReadyPlayerMenu'

export function createReadyPlayerWidget(world: World) {
  const ui = createReadyPlayerMenu()
  removeComponent(ui.entity, VisibleComponent)
  Widgets.registerWidget(world, ui.entity, {
    ui,
    label: WidgetName.READY_PLAYER,
    system: () => {}
  })
}
