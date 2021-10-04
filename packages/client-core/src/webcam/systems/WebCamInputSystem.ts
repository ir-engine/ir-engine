import { System } from '@xrengine/engine/src/ecs/System'
import { World } from '@xrengine/engine/src/ecs/World'
import {
  hasComponent,
  getComponent,
  addComponent,
  defineQuery
} from '@xrengine/engine/src/ecs/ComponentFunctions'
import { isEntityLocalClient } from '@xrengine/engine/src/networking/functions/isEntityLocalClient'
import { sendChatMessage } from '../../social/reducers/chat/service'
import { accessAuthState } from '../../user/reducers/auth/AuthState'
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
  sendChatMessage({
    targetObjectId: user.instanceId,
    targetObjectType: 'instance',
    text: '[emotions]' + text
  })
}
