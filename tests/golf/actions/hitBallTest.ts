import { Vector3 } from 'three'
import { GolfBotHooks } from '@xrengine/client/src/pages/golf/functions/GolfBotHooks'
import { eulerToQuaternion } from '@xrengine/engine/src/common/functions/MathRandomFunctions'
import { BotHooks, XRBotHooks } from '@xrengine/engine/src/bot/enums/BotHooks'
import { XREngineBot } from '@xrengine/bot/src/bot'

const maxTimeout = 60 * 1000
const vector3 = new Vector3()

export const hitBallTest = (bot: XREngineBot) => {
  test(
    bot.name + ' can hit ball',
    async () => {
      const teePosition = await bot.runHook(GolfBotHooks.GetTeePosition)
      //  await bot.awaitHookPromise(GolfBotHooks.GetIsPlayerTurn)
      await bot.delay(100)

      const positionPlayer = await bot.runHook(GolfBotHooks.GetPlayerPosition)
      // await bot.awaitHookPromise(GolfBotHooks.GetIsBallStopped)
      // ball should be at spawn position
      /*
      expect(
        vector3
          .copy(await bot.runHook(GolfBotHooks.GetBallPosition))
          .sub(positionPlayer)
          .length()
      ).toBeLessThan(0.3)
*/
      await bot.keyPress('KeyL', 300)
      //await bot.runHook(GolfBotHooks.SwingClub)
      await bot.delay(1000)
      //await bot.awaitHookPromise(GolfBotHooks.GetIsBallStopped)
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

export const checkGoal = (bot: XREngineBot, testdata) => {
  test(
    'CheckGoal ' + bot.name,
    async () => {
      const newTeePosition = await bot.runHook(GolfBotHooks.GetTeePosition)
      if (vector3.copy(testdata[bot.name].teeLastPosition).sub(newTeePosition).length() < 0.01) {
        testdata[bot.name].teeLastPosition.copy(newTeePosition)
      } else {
        const positionPlayer = await bot.runHook(GolfBotHooks.GetPlayerPosition)
        //TODO: check Ball and Hole positions
      }
      /*
      const expectScore = 0 + 1;
      const realScore = await bot.runHook(GolfBotHooks.GetPlayerScore)
      console.log('realScore',realScore)
      // rotate such that hit direction is in line with the hole
     // const teePosition = await bot.runHook(GolfBotHooks.GetTeePosition)
      const holePosition = await bot.runHook(GolfBotHooks.GetHolePosition)
      expect(realScore).toBe(expectScore)
*/
      //await bot.delay(1000)

      expect(vector3.copy(testdata[bot.name].teeLastPosition).sub(newTeePosition).length()).toBeGreaterThan(1)
    },
    maxTimeout
  )
}
