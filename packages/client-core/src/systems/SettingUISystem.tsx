import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'

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
    el.style.top = MainMenuButtonState.emoteMenuOpen.value ? '0px' : '-100000px'
  })

  return () => {
    const settingXRUI = getComponent(ui.entity, XRUIComponent)
    if (!settingXRUI) return

    settingXRUI.container.scale.setScalar(0.5)
    settingXRUI.container.position.copy(Engine.instance.currentWorld.camera.position)
    //settingXRUI.container.position.y += Engine.scene.position.y
    //settingXRUI.container.position.x += Engine.scene.position.x
    settingXRUI.container.position.z +=
      settingXRUI.container.position.z > Engine.instance.currentWorld.camera.position.z ? -0.4 : 0.4

    settingXRUI.container.rotation.setFromRotationMatrix(Engine.instance.currentWorld.camera.matrix)
  }
}
