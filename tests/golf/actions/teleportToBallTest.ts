import { Vector3 } from 'three'
import { GolfBotHooks } from '@xrengine/client/src/pages/golf/functions/GolfBotHooks'
import { BotHooks, XRBotHooks } from '@xrengine/engine/src/bot/enums/BotHooks'
import { XREngineBot } from '@xrengine/bot/src/bot'
import { eulerToQuaternion } from '../../../packages/engine/src/common/functions/MathRandomFunctions'

const maxTimeout = 60 * 1000
const vector3 = new Vector3()

export const teleportToBall = (bot: XREngineBot) => {
  test(
    'Can teleport to ball',
    async () => {
      await bot.delay(100)
      await bot.keyPress('KeyK', 200)
      await bot.delay(300)

      const ballPosition = await bot.runHook(GolfBotHooks.GetBallPosition)

      await bot.runHook(XRBotHooks.UpdateHead, {
        position: [ballPosition.x - 1, 2, ballPosition.z],
        rotation: eulerToQuaternion(-1.25, 0, 0).toArray()
      })
      // should be at ball position
      expect(
        vector3
          .copy(await bot.runHook(BotHooks.GetPlayerPosition))
          .sub(ballPosition)
          .length()
      ).toBeLessThan(0.2)
    },
    maxTimeout
  )
}

export const teleportOnSpawn = (bot: XREngineBot, keyPress) => {
  test(
    'teleport to spawn',
    async () => {
      await bot.delay(100)
      // wait for turn, then move to ball position
      await bot.keyPress(keyPress, 200)
      await bot.delay(300)
      const playerPosition = await bot.runHook(GolfBotHooks.GetPlayerPosition)

      const spawnPosition = new Vector3(playerPosition.x - 2, playerPosition.y, playerPosition.z)
      // should be at ball position
      /*
      expect(
        vector3
          .copy(playerPosition)
          .sub(spawnPosition)
          .length()
      ).toBeLessThan(1)
        */
    },
    maxTimeout
  )
}
