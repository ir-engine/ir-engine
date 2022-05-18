import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'
import { sendXRInputData } from '../functions/xrBotHookFunctions'

export default async function BotHookSystem(world: World) {
  return () => {
    if (Engine.isBot && Boolean(Engine.xrSession)) {
      sendXRInputData()
    }
  }
}
