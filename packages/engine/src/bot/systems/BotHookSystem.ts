import { isDev } from '@xrengine/common/src/utils/isDev'

import { AvatarInputSchema } from '../../avatar/AvatarInputSchema'
import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'
import { sendXRInputData, simulateXR } from '../functions/xrBotHookFunctions'

export default async function BotHookSystem(world: World) {
  if (isDev) {
    const setupBotKey = 'setupBotKey'
    AvatarInputSchema.inputMap.set('Semicolon', setupBotKey)
    AvatarInputSchema.behaviorMap.set(setupBotKey, () => {
      if (!Engine.xrSession) simulateXR()
    })
  }

  return () => {
    if (Engine.isBot && Boolean(Engine.xrSession)) {
      sendXRInputData()
    }
  }
}
