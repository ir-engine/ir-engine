import { World } from '@xrengine/engine/src/ecs/classes/World'
import { removeComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { VisibleComponent } from '@xrengine/engine/src/scene/components/VisibleComponent'
import { WidgetName, Widgets } from '@xrengine/engine/src/xrui/Widgets'

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
