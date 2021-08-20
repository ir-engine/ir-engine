import { Vector3 } from 'three'
import { GolfBotHooks } from '@xrengine/client/src/pages/golf/functions/GolfBotHooks'
import { XREngineBot } from '@xrengine/bot/src/bot'

const maxTimeout = 60 * 1000
const vector3 = new Vector3()

export const resetBall = (bot: XREngineBot) => {
  test(
    'Can reset ball on out of course',
    async () => {
      const teePosition = await bot.runHook(GolfBotHooks.GetTeePosition)

      await bot.delay(1000)
      await bot.awaitHookPromise(GolfBotHooks.GetIsBallStopped)
      await bot.delay(1000)
      await bot.keyPress('KeyB', 200)
      await bot.delay(1000)
      await bot.awaitHookPromise(GolfBotHooks.GetIsBallStopped)
      await bot.delay(1000)

      expect(
        vector3
          .copy(await bot.runHook(GolfBotHooks.GetBallPosition))
          .sub(teePosition)
          .length()
      ).toBeLessThan(0.1)
    },
    maxTimeout
  )
}
