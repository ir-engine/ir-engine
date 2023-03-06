import { World } from '@etherealengine/engine/src/ecs/classes/World'
import { removeComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { WidgetName, Widgets } from '@etherealengine/engine/src/xrui/Widgets'

import { createSettingDetailView } from './ui/SettingDetailView'

export function createSettingsWidget(world: World) {
  const ui = createSettingDetailView()
  removeComponent(ui.entity, VisibleComponent)

  Widgets.registerWidget(world, ui.entity, {
    ui,
    label: WidgetName.SETTINGS,
    icon: 'Settings',
    system: () => {}
  })
}
