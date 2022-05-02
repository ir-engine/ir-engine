import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { sendXRInputData } from '../functions/xrBotHookFunctions'

export default async function BotHookSystem(world: World) {
  return () => {
    if (Engine.instance.isBot && Boolean(EngineRenderer.instance.xrSession)) {
      sendXRInputData()
    }
  }
}
