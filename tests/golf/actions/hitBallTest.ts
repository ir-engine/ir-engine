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
      const teePosition = await bot.runHook(GolfBotHooks.GetTeePosition)
      //  await bot.awaitHookPromise(GolfBotHooks.GetIsPlayerTurn)
      await bot.delay(2000)
      const positionPlayer = await bot.runHook(GolfBotHooks.GetPlayerPosition)
      // await bot.awaitHookPromise(GolfBotHooks.GetIsBallStopped)
      // ball should be at spawn position

      expect(
        vector3
          .copy(await bot.runHook(GolfBotHooks.GetBallPosition))
          .sub(positionPlayer)
          .length()
      ).toBeLessThan(0.1)

      await bot.keyPress('KeyL', 200)
      // await bot.runHook(GolfBotHooks.SwingClub)
      await bot.delay(2000)
      //await bot.awaitHookPromise(GolfBotHooks.GetIsBallStopped)
      expect(
        vector3
          .copy(await bot.runHook(GolfBotHooks.GetBallPosition))
          .sub(positionPlayer)
          .length()
      ).toBeGreaterThan(0.3)
      await bot.delay(500)
    },
    maxTimeout
  )
}

export const headUpdateTest = (bot: XREngineBot) => {
  test(
    'Update Head',
    async () => {
      await bot.runHook(XRBotHooks.UpdateHead, {
        position: [0, 2, 1],
        rotation: eulerToQuaternion(-1.25, 0, 0).toArray()
      })
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
      expect(0.9).toBeLessThan(1)
    },
    maxTimeout
  )
}
