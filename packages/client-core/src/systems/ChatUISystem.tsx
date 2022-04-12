import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { ObjectFitFunctions } from '@xrengine/engine/src/xrui/functions/ObjectFitFunctions'

import { createChatDetailView } from './ui/ChatDetailView'

export default async function ChatUISystem(world: World) {
  const ui = createChatDetailView()
  return () => {
    const chatXRUI = getComponent(ui.entity, XRUIComponent)
    chatXRUI.container.scale.setScalar(0.5)
    chatXRUI.container.position.copy(Engine.camera.position)
    //chatXRUI.container.position.y += Engine.scene.position.y
    //chatXRUI.container.position.x += Engine.scene.position.x
    chatXRUI.container.position.z += chatXRUI.container.position.z > Engine.camera.position.z ? -0.4 : 0.4

    chatXRUI.container.rotation.setFromRotationMatrix(Engine.camera.matrix)
  }
}
