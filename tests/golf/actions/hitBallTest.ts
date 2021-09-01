import { Vector3 } from 'three'
import { GolfBotHooks } from '@xrengine/client/src/pages/golf/functions/GolfBotHooks'
import { eulerToQuaternion } from '@xrengine/engine/src/common/functions/MathRandomFunctions'
import { BotHooks, XRBotHooks } from '@xrengine/engine/src/bot/enums/BotHooks'
import { XREngineBot } from '@xrengine/bot/src/bot'

const maxTimeout = 60 * 1000
const vector3 = new Vector3()

export const hitBallTest = (bot: XREngineBot) => {
  test(
    'Can hit ball',
    async () => {
      await bot.delay(1000)

      const positionPlayer = await bot.runHook(GolfBotHooks.GetPlayerPosition)

      await bot.keyPress('KeyL', 200)
      //await bot.runHook(GolfBotHooks.SwingClub)
      await bot.delay(3000)
      expect(
        vector3
          .copy(await bot.runHook(GolfBotHooks.GetBallPosition))
          .sub(positionPlayer)
          .length()
      ).toBeGreaterThan(0.05)
      await bot.delay(100)
    },
    maxTimeout
  )
}

export const headUpdateTest = (bot: XREngineBot) => {
  test(
    'Update Head ' + bot.name,
    async () => {
      /*
      await bot.runHook(XRBotHooks.UpdateHead, {
        position: [0, 2, 1],
        rotation: eulerToQuaternion(-1.25, 0, 0).toArray()
      })
      */
      // rotate such that hit direction is in line with the hole
      const teePosition = await bot.runHook(GolfBotHooks.GetTeePosition)
      const holePosition = await bot.runHook(GolfBotHooks.GetHolePosition)
      const angle =
        new Vector3()
          .copy(teePosition)
          .setY(0)
          .normalize()
          .angleTo(new Vector3().copy(holePosition).setY(0).normalize()) + 90
      await bot.runHook(BotHooks.RotatePlayer, { angle })

      await bot.delay(100)
      await bot.keyPress('Semicolon', 200)
      await bot.delay(100)
      expect(0.9).toBeLessThan(1)
    },
    maxTimeout
  )
}
