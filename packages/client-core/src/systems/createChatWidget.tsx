import { World } from '@xrengine/engine/src/ecs/classes/World'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { XRUIUtils } from '@xrengine/engine/src/xrui/functions/XRUIUtils'
import { WidgetName, Widgets } from '@xrengine/engine/src/xrui/Widgets'

import { createChatDetailView } from './ui/ChatDetailView'

export function createChatWidget(world: World) {
  const ui = createChatDetailView()

  const xrui = getComponent(ui.entity, XRUIComponent)
  XRUIUtils.setUIVisible(xrui.container, false)

  Widgets.registerWidget(world, ui.entity, {
    ui,
    label: WidgetName.CHAT,
    system: () => {}
  })
}
