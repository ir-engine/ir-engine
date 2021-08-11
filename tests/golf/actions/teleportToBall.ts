import { Vector3 } from 'three'
import { GolfBotHooks } from "@xrengine/engine/src/game/templates/Golf/functions/GolfBotHooks"
import { BotHooks } from '@xrengine/engine/src/bot/enums/BotHooks'

const maxTimeout = 60 * 1000
const vector3 = new Vector3()

export const teleportToBall = (bot) => {

  test('Can teleport to ball', async () => {
    await bot.delay(1000)

    // wait for turn, then move to ball position
    await bot.awaitHookPromise(GolfBotHooks.GetIsYourTurn)
    await bot.keyPress('KeyK', 200)
    await bot.delay(1000)

    const ballPosition = await bot.runHook(GolfBotHooks.GetBallPosition)

    // should be at ball position
    expect(
      vector3.copy(await bot.runHook(BotHooks.GetPlayerPosition)).sub(ballPosition).length()
    ).toBeLessThan(0.1)

  }, maxTimeout)

}