import { removeComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { WidgetName, Widgets } from '@etherealengine/engine/src/xrui/Widgets'

import { createSocialsMenuView } from './ui/SocialsMenuView'

export function createSocialsMenuWidget() {
  const ui = createSocialsMenuView()
  removeComponent(ui.entity, VisibleComponent)

  Widgets.registerWidget(ui.entity, {
    ui,
    label: WidgetName.SOCIALS,
    icon: 'Groups',
    system: () => {}
  })
}
