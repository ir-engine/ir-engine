import { World } from '@xrengine/engine/src/ecs/classes/World'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { ObjectFitFunctions } from '@xrengine/engine/src/xrui/functions/ObjectFitFunctions'
import { WidgetName, Widgets } from '@xrengine/engine/src/xrui/Widgets'

import { createSelectAvatarMenu } from './ui/ProfileDetailView/SelectAvatarMenu'

export function createSelectAvatarWidget(world: World) {
  const ui = createSelectAvatarMenu()

  const xrui = getComponent(ui.entity, XRUIComponent)
  ObjectFitFunctions.setUIVisible(xrui.container, false)

  Widgets.registerWidget(world, ui.entity, {
    ui,
    label: WidgetName.SELECT_AVATAR,
    system: () => {}
  })
}
