import { removeComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { WidgetName, Widgets } from '@etherealengine/engine/src/xrui/Widgets'

import { createEmoteDetailView } from './ui/EmoteDetailView'

export function createEmoteWidget() {
  const ui = createEmoteDetailView()
  removeComponent(ui.entity, VisibleComponent)

  Widgets.registerWidget(ui.entity, {
    ui,
    label: WidgetName.EMOTE,
    system: () => {}
  })
}
