import { removeComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { WidgetName, Widgets } from '@etherealengine/engine/src/xrui/Widgets'

import { createAdminControlsMenuView } from './ui/AdminControlsMenuView'

export function createAdminControlsMenuWidget() {
  const ui = createAdminControlsMenuView()
  removeComponent(ui.entity, VisibleComponent)

  Widgets.registerWidget(ui.entity, {
    ui,
    label: WidgetName.ADMIN_CONTROLS,
    system: () => {}
  })
}
