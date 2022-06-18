import { World } from '@xrengine/engine/src/ecs/classes/World'
import { addComponent, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { PersistTagComponent } from '@xrengine/engine/src/scene/components/PersistTagComponent'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { ObjectFitFunctions } from '@xrengine/engine/src/xrui/functions/ObjectFitFunctions'
import { Widgets } from '@xrengine/engine/src/xrui/Widgets'

import SettingsIcon from '@mui/icons-material/Settings'

import { MainMenuButtonState } from './state/MainMenuButtonState'
import { createSettingDetailView } from './ui/SettingDetailView'

const widgetName = 'Settings'

export default async function SettingUISystem(world: World) {
  const ui = createSettingDetailView()

  addComponent(ui.entity, PersistTagComponent, {})

  Widgets.registerWidget(world, ui.entity, {
    ui,
    label: widgetName,
    icon: SettingsIcon
  })

  return () => {
    const xrui = getComponent(ui.entity, XRUIComponent)

    if (xrui) {
      ObjectFitFunctions.attachObjectToPreferredTransform(xrui.container)
      ObjectFitFunctions.changeVisibilityOfRootLayer(xrui.container, MainMenuButtonState.settingMenuOpen.value)
    }
  }
}
