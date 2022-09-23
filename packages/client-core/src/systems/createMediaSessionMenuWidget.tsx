import { World } from '@xrengine/engine/src/ecs/classes/World'
import { removeComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { VisibleComponent } from '@xrengine/engine/src/scene/components/VisibleComponent'
import { WidgetName, Widgets } from '@xrengine/engine/src/xrui/Widgets'

import { createMediaSessionMenuView } from './ui/MediaSessionMenuView'

export function createMediaSessionMenuWidget(world: World) {
  const ui = createMediaSessionMenuView()
  removeComponent(ui.entity, VisibleComponent)

  Widgets.registerWidget(world, ui.entity, {
    ui,
    label: WidgetName.MEDIA_SESSION,
    system: () => {}
  })
}
