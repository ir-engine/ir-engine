import { System } from '@xrengine/engine/src/ecs/classes/System'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import {
  hasComponent,
  getComponent,
  addComponent,
  defineQuery
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { isEntityLocalClient } from '@xrengine/engine/src/networking/functions/isEntityLocalClient'
import { ChatService } from '../../social/state/ChatService'
import { accessAuthState } from '../../user/state/AuthService'
import { WebCamInputComponent } from '@xrengine/engine/src/input/components/WebCamInputComponent'

export default async function WebCamInputSystem(world: World): Promise<System> {
  const webcamInputQuery = defineQuery([WebCamInputComponent])

  return () => {
    for (const eid of webcamInputQuery(world)) {
      if (isEntityLocalClient(eid)) {
        const { emotions } = getComponent(eid, WebCamInputComponent)

        if (emotions.length > 0) {
          for (let i = 0; i < emotions.length; i++) {
            sendProximityChatMessage(emotions[i])
          }

          getComponent(eid, WebCamInputComponent).emotions = []
        }
      }
    }
  }
}

function sendProximityChatMessage(text) {
  const user = accessAuthState().user.value
  ChatService.sendChatMessage({
    targetObjectId: user.instanceId,
    targetObjectType: 'instance',
    text: '[emotions]' + text
  })
}
