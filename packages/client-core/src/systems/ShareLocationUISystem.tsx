import { World } from '@xrengine/engine/src/ecs/classes/World'
import { addComponent, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { PersistTagComponent } from '@xrengine/engine/src/scene/components/PersistTagComponent'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { ObjectFitFunctions } from '@xrengine/engine/src/xrui/functions/ObjectFitFunctions'

import { MainMenuButtonState } from './state/MainMenuButtonState'
import { createShareLocationDetailView } from './ui/ShareLocationDetailView'

export default async function ShareLocationUISystem(world: World) {
  const ui = createShareLocationDetailView()

  addComponent(ui.entity, PersistTagComponent, {})

  return () => {
    const xrui = getComponent(ui.entity, XRUIComponent)

    if (xrui) {
      ObjectFitFunctions.attachObjectToPreferredTransform(xrui.container)
      ObjectFitFunctions.changeVisibilityOfRootLayer(xrui.container, MainMenuButtonState.shareMenuOpen.value)
    }
  }
}
