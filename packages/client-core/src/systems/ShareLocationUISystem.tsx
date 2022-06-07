import { World } from '@xrengine/engine/src/ecs/classes/World'
import { addComponent, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { PersistTagComponent } from '@xrengine/engine/src/scene/components/PersistTagComponent'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { ObjectFitFunctions } from '@xrengine/engine/src/xrui/functions/ObjectFitFunctions'
import { TransitionFunctions } from '@xrengine/engine/src/xrui/functions/TransitionFunctions'

import { MainMenuButtonState } from './state/MainMenuButtonState'
import { createShareLocationDetailView } from './ui/ShareLocationDetailView'

export default async function ShareLocationUISystem(world: World) {
  const ui = createShareLocationDetailView()
  const transitionPeriodSeconds = 1

  ui.container.then((container) => {
    const el = container.containerElement as HTMLElement
    // In this case, it's necessary to keep the element visible in the DOM,
    // otherwise it will not receive text input; of course, we don't want to
    // actually display the real DOM elmeent since we are rendering it in 3D,
    // so we simply move it out the way
    el.style.visibility = 'visible'
    el.style.top = '-100000px'
    ui.state.shareMenuOpen.set(MainMenuButtonState.shareMenuOpen.value)
  })

  addComponent(ui.entity, PersistTagComponent, {})

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

      TransitionFunctions.changeOpacityOfRootLayer(
        world,
        ui,
        xrui,
        transitionPeriodSeconds,
        MainMenuButtonState.shareMenuOpen.value
      )
    }
  }
}
