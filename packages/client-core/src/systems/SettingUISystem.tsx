import { World } from '@xrengine/engine/src/ecs/classes/World'
import { addComponent, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { PersistTagComponent } from '@xrengine/engine/src/scene/components/PersistTagComponent'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { ObjectFitFunctions } from '@xrengine/engine/src/xrui/functions/ObjectFitFunctions'

import { MainMenuButtonState } from './state/MainMenuButtonState'
import { createSettingDetailView } from './ui/SettingDetailView'

export default async function SettingUISystem(world: World) {
  const ui = createSettingDetailView()

  ui.container.then((container) => {
    const el = container.containerElement as HTMLElement
    // In this case, it's necessary to keep the element visible in the DOM,
    // otherwise it will not receive text input; of course, we don't want to
    // actually display the real DOM elmeent since we are rendering it in 3D,
    // so we simply move it out the way
    el.style.visibility = 'visible'
    el.style.top = '-100000px'
    ui.state.settingMenuOpen.set(MainMenuButtonState.settingMenuOpen.value)
  })

  addComponent(ui.entity, PersistTagComponent, {})

  return () => {
    const settingXRUI = getComponent(ui.entity, XRUIComponent)

    if (settingXRUI) {
      const rootLayerElement = settingXRUI.container.rootLayer.element
      ObjectFitFunctions.attachObjectToPreferredTransform(
        settingXRUI.container,
        rootLayerElement.clientWidth,
        rootLayerElement.clientHeight,
        0.1
      )
    }
  }
}
