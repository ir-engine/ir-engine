import { World } from '@xrengine/engine/src/ecs/classes/World'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { XRUIUtils } from '@xrengine/engine/src/xrui/functions/XRUIUtils'
import { WidgetName, Widgets } from '@xrengine/engine/src/xrui/Widgets'

import { createReadyPlayerMenu } from './ui/ProfileDetailView/ReadyPlayerMenu'

export function createReadyPlayerWidget(world: World) {
  const ui = createReadyPlayerMenu()

  const xrui = getComponent(ui.entity, XRUIComponent)
  XRUIUtils.setUIVisible(xrui.container, false)

  Widgets.registerWidget(world, ui.entity, {
    ui,
    label: WidgetName.READY_PLAYER,
    system: () => {}
  })
}
