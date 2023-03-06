import { removeComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { WidgetName, Widgets } from '@etherealengine/engine/src/xrui/Widgets'

import { createSettingDetailView } from './ui/SettingDetailView'

export function createSettingsWidget() {
  const ui = createSettingDetailView()
  removeComponent(ui.entity, VisibleComponent)

  Widgets.registerWidget(ui.entity, {
    ui,
    label: WidgetName.SETTINGS,
    icon: 'Settings',
    system: () => {}
  })
}
