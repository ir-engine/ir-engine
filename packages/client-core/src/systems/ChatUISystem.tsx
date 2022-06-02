import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'

import { MainMenuButtonState } from './state/MainMenuButtonState'
import { createChatDetailView } from './ui/ChatDetailView'

export default async function ChatUISystem(world: World) {
  const ui = createChatDetailView()

  ui.container.then((container) => {
    const el = container.containerElement as HTMLElement
    // In this case, it's necessary to keep the element visible in the DOM,
    // otherwise it will not receive text input; of course, we don't want to
    // actually display the real DOM elmeent since we are rendering it in 3D,
    // so we simply move it out the way
    el.style.visibility = 'visible'
    el.style.top = MainMenuButtonState.chatWindowOpen.value ? '0px' : '-100000px'
  })

  return () => {
    const chatXRUI = getComponent(ui.entity, XRUIComponent)
    if (!chatXRUI) return

    chatXRUI.container.scale.setScalar(0.5)
    chatXRUI.container.position.copy(Engine.instance.currentWorld.camera.position)
    chatXRUI.container.position.y += Engine.instance.currentWorld.scene.position.y
    chatXRUI.container.position.x += Engine.instance.currentWorld.scene.position.x
    chatXRUI.container.position.z +=
      chatXRUI.container.position.z > Engine.instance.currentWorld.camera.position.z ? -0.4 : 0.4

    chatXRUI.container.rotation.setFromRotationMatrix(Engine.instance.currentWorld.camera.matrix)
  }
}
