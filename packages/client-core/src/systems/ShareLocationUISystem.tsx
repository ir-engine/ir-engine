import { World } from '@xrengine/engine/src/ecs/classes/World'
import { addComponent, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { PersistTagComponent } from '@xrengine/engine/src/scene/components/PersistTagComponent'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { ObjectFitFunctions } from '@xrengine/engine/src/xrui/functions/ObjectFitFunctions'
import { Widgets } from '@xrengine/engine/src/xrui/Widgets'

import LinkIcon from '@mui/icons-material/Link'

import { MainMenuButtonState } from './state/MainMenuButtonState'
import { createShareLocationDetailView } from './ui/ShareLocationDetailView'

const widgetName = 'Share'

export default async function ShareLocationUISystem(world: World) {
  const ui = createShareLocationDetailView()

  addComponent(ui.entity, PersistTagComponent, {})

  Widgets.registerWidget(world, ui.entity, {
    ui,
    label: widgetName,
    icon: LinkIcon
  })

  return () => {
    const xrui = getComponent(ui.entity, XRUIComponent)

    if (xrui) {
      ObjectFitFunctions.attachObjectToPreferredTransform(xrui.container)
      ObjectFitFunctions.changeVisibilityOfRootLayer(xrui.container, MainMenuButtonState.shareMenuOpen.value)
    }
  }
}
