import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'

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
  })

  return () => {
    const emoteXRUI = getComponent(ui.entity, XRUIComponent)
    if (!emoteXRUI) return

    emoteXRUI.container.scale.setScalar(0.5)
    emoteXRUI.container.position.copy(Engine.instance.currentWorld.camera.position)
    //emoteXRUI.container.position.y += Engine.scene.position.y
    //emoteXRUI.container.position.x += Engine.scene.position.x
    emoteXRUI.container.position.z +=
      emoteXRUI.container.position.z > Engine.instance.currentWorld.camera.position.z ? -0.4 : 0.4

    emoteXRUI.container.rotation.setFromRotationMatrix(Engine.instance.currentWorld.camera.matrix)
  }
}
