import { World } from '@xrengine/engine/src/ecs/classes/World'
import { addComponent, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { PersistTagComponent } from '@xrengine/engine/src/scene/components/PersistTagComponent'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { ObjectFitFunctions } from '@xrengine/engine/src/xrui/functions/ObjectFitFunctions'
import { Widgets } from '@xrengine/engine/src/xrui/Widgets'

import { Message as MessageIcon } from '@mui/icons-material'

import { MainMenuButtonState } from './state/MainMenuButtonState'
import { createChatDetailView } from './ui/ChatDetailView'

const widgetName = 'Chat'

export default async function ChatUISystem(world: World) {
  const ui = createChatDetailView()

  addComponent(ui.entity, PersistTagComponent, {})

  Widgets.registerWidget(world, ui.entity, {
    ui,
    label: widgetName,
    icon: MessageIcon
  })

  return () => {
    const xrui = getComponent(ui.entity, XRUIComponent)

    if (xrui) {
      ObjectFitFunctions.attachObjectToPreferredTransform(xrui.container)
      ObjectFitFunctions.changeVisibilityOfRootLayer(xrui.container, MainMenuButtonState.chatMenuOpen.value)
    }
  }
}
