import { removeComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { WidgetName, Widgets } from '@etherealengine/engine/src/xrui/Widgets'

import { createChatDetailView } from './ui/ChatDetailView'

export function createChatWidget() {
  const ui = createChatDetailView()

  removeComponent(ui.entity, VisibleComponent)

  Widgets.registerWidget(ui.entity, {
    ui,
    label: WidgetName.CHAT,
    system: () => {}
  })
}
