import { World } from '@xrengine/engine/src/ecs/classes/World'
import { addComponent, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { PersistTagComponent } from '@xrengine/engine/src/scene/components/PersistTagComponent'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { ObjectFitFunctions } from '@xrengine/engine/src/xrui/functions/ObjectFitFunctions'

import { MainMenuButtonState } from './state/MainMenuButtonState'
import { createChatDetailView } from './ui/ChatDetailView'

export default async function ChatUISystem(world: World) {
  const ui = createChatDetailView()

  addComponent(ui.entity, PersistTagComponent, {})

  ui.state.chatMenuOpen.set(MainMenuButtonState.chatMenuOpen.value)

  return () => {
    const xrui = getComponent(ui.entity, XRUIComponent)

    if (xrui) {
      const rootLayerElement = xrui.container.rootLayer.element
      ObjectFitFunctions.attachObjectToPreferredTransform(
        xrui.container,
        rootLayerElement.clientWidth,
        rootLayerElement.clientHeight,
        0.1
      )

      ObjectFitFunctions.changeVisibilityOfRootLayer(xrui.container, MainMenuButtonState.chatMenuOpen.value)
    }
  }
}
