import { World } from '@xrengine/engine/src/ecs/classes/World'
import { removeComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { VisibleComponent } from '@xrengine/engine/src/scene/components/VisibleComponent'
import { WidgetName, Widgets } from '@xrengine/engine/src/xrui/Widgets'

import { createSelectAvatarMenu } from './ui/ProfileDetailView/SelectAvatarMenu'

export function createSelectAvatarWidget(world: World) {
  const ui = createSelectAvatarMenu()
  removeComponent(ui.entity, VisibleComponent)

  Widgets.registerWidget(world, ui.entity, {
    ui,
    label: WidgetName.SELECT_AVATAR,
    system: () => {}
  })
}
