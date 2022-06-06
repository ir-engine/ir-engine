import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { ObjectFitFunctions } from '@xrengine/engine/src/xrui/functions/ObjectFitFunctions'

import { MainMenuButtonState } from './state/MainMenuButtonState'
import { createShareLocationDetailView } from './ui/ShareLocationDetailView'

export default async function ShareLocationUISystem(world: World) {
  const ui = createShareLocationDetailView()

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

  return () => {
    const shareLocationXRUI = getComponent(ui.entity, XRUIComponent)

    if (shareLocationXRUI) {
      const rootLayerElement = shareLocationXRUI.container.rootLayer.element
      ObjectFitFunctions.attachObjectToPreferredTransform(
        shareLocationXRUI.container,
        rootLayerElement.clientWidth,
        rootLayerElement.clientHeight,
        0.1
      )
    }
  }
}
