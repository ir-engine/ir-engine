import { World } from '@xrengine/engine/src/ecs/classes/World'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { ObjectFitFunctions } from '@xrengine/engine/src/xrui/functions/ObjectFitFunctions'

import { MainMenuButtonState } from './state/MainMenuButtonState'
import { createEmoteDetailView } from './ui/EmoteDetailView'

export default async function EmoteUISystem(world: World) {
  const ui = createEmoteDetailView()

  ui.container.then((container) => {
    const el = container.containerElement as HTMLElement
    // In this case, it's necessary to keep the element visible in the DOM,
    // otherwise it will not receive text input; of course, we don't want to
    // actually display the real DOM elmeent since we are rendering it in 3D,
    // so we simply move it out the way
    el.style.visibility = 'visible'
    el.style.top = '-100000px'
    ui.state.emoteMenuOpen.set(MainMenuButtonState.emoteMenuOpen.value)
  })

  return () => {
    const emoteXRUI = getComponent(ui.entity, XRUIComponent)

    if (emoteXRUI) {
      const rootLayerElement = emoteXRUI.container.rootLayer.element
      ObjectFitFunctions.attachObjectToPreferredTransform(
        emoteXRUI.container,
        rootLayerElement.clientWidth,
        rootLayerElement.clientHeight,
        0.1
      )
    }
  }
}
