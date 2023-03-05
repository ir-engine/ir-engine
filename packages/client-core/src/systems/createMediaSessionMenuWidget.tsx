import { World } from '@etherealengine/engine/src/ecs/classes/World'
import { removeComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { WidgetName, Widgets } from '@etherealengine/engine/src/xrui/Widgets'

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
