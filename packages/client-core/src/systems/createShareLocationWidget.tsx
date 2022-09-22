import { World } from '@xrengine/engine/src/ecs/classes/World'
import { removeComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { VisibleComponent } from '@xrengine/engine/src/scene/components/VisibleComponent'
import { WidgetName, Widgets } from '@xrengine/engine/src/xrui/Widgets'

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
