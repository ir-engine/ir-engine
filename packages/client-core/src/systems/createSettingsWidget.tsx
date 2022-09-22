import { World } from '@xrengine/engine/src/ecs/classes/World'
import { removeComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { VisibleComponent } from '@xrengine/engine/src/scene/components/VisibleComponent'
import { WidgetName, Widgets } from '@xrengine/engine/src/xrui/Widgets'

import SettingsIcon from '@mui/icons-material/Settings'

import { createSettingDetailView } from './ui/SettingDetailView'

export function createSettingsWidget(world: World) {
  const ui = createSettingDetailView()
  removeComponent(ui.entity, VisibleComponent)

  Widgets.registerWidget(world, ui.entity, {
    ui,
    label: WidgetName.SETTINGS,
    icon: SettingsIcon,
    system: () => {}
  })
}
