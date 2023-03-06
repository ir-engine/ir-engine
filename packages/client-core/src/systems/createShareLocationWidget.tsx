import { World } from '@etherealengine/engine/src/ecs/classes/World'
import { removeComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { WidgetName, Widgets } from '@etherealengine/engine/src/xrui/Widgets'

import { createShareLocationDetailView } from './ui/ShareLocationDetailView'

export function createShareLocationWidget(world: World) {
  const ui = createShareLocationDetailView()
  removeComponent(ui.entity, VisibleComponent)
  Widgets.registerWidget(world, ui.entity, {
    ui,
    label: WidgetName.SHARE_LOCATION,
    system: () => {}
  })
}
