import { removeComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { WidgetName, Widgets } from '@etherealengine/engine/src/xrui/Widgets'

import { createProfileDetailView } from './ui/ProfileDetailView'

export function createProfileWidget() {
  const ui = createProfileDetailView()
  removeComponent(ui.entity, VisibleComponent)
  Widgets.registerWidget(ui.entity, {
    ui,
    label: WidgetName.PROFILE,
    icon: 'Person',
    system: () => {}
  })
}
