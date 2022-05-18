import { isDev } from '@xrengine/common/src/utils/isDev'

import { AvatarInputSchema } from '../../avatar/AvatarInputSchema'
import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { BotHookFunctions } from '../functions/botHookFunctions'
import { sendXRInputData, simulateXR } from '../functions/xrBotHookFunctions'

export default async function BotHookSystem(world: World) {
  globalThis.botHooks = BotHookFunctions

  if (isDev) {
    const setupBotKey = 'setupBotKey'
    AvatarInputSchema.inputMap.set('Semicolon', setupBotKey)
    AvatarInputSchema.behaviorMap.set(setupBotKey, () => {
      if (!EngineRenderer.instance.xrSession) simulateXR()
    })
  }

  return () => {
    if (Engine.instance.isBot && Boolean(EngineRenderer.instance.xrSession)) {
      sendXRInputData()
    }
  }
}
