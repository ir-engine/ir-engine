import type { XREngineBot } from '@xrengine/bot/src/bot'
import { XRBotHooks } from '@xrengine/engine/src/bot/enums/BotHooks'
import { compareArrays } from '@xrengine/engine/src/common/functions/MathRandomFunctions'
import assert from 'assert'

export const setupXR = async (bot: XREngineBot) => {
  await bot.runHook(XRBotHooks.OverrideXR)
  await bot.runHook(XRBotHooks.StartXR)
}

export const testWebXR = (bot: XREngineBot) => {
  it('Web XR works', async () => {
    assert(await bot.runHook(XRBotHooks.XRSupported))
    assert(await bot.runHook(XRBotHooks.XRInitialized))
  })

  it('Can detect and move input sources', async () => {
    await bot.delay(2000)
    const { headInputValue, leftControllerInputValue, rightControllerInputValue } = await bot.runHook(
      XRBotHooks.GetXRInputPosition
    )
    compareArrays(headInputValue, [0, 1.6, 0, 0, 1, 0, 0], 0.01)
    compareArrays(leftControllerInputValue, [-0.5, 1.5, -1, 0, 0, 0, 1], 0.01)
    compareArrays(rightControllerInputValue, [0.5, 1.5, -1, 0, 0, 0, 1], 0.01)
  })
}
