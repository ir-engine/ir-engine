import { Engine } from '../../ecs/Engine'
import { System } from '../../ecs/System'
import { World } from '../../ecs/World'
import { sendXRInputData } from '../functions/xrBotHookFunctions'

export default async function BotHookSystem(world: World): Promise<System> {
  return () => {
    if (Engine.isBot && Boolean(Engine.xrSession)) {
      sendXRInputData()
    }
  }
}
