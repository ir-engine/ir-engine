import assert from 'assert'
import { Quaternion, Vector3 } from 'three'

import type { XREngineBot } from '@xrengine/bot/src/bot'
import { XRBotHooks } from '@xrengine/engine/src/bot/enums/BotHooks'
import { compareArrays } from '@xrengine/engine/src/common/functions/MathRandomFunctions'

export const setupXR = async (bot: XREngineBot) => {
  await bot.runHook(XRBotHooks.OverrideXR)
  await bot.runHook(XRBotHooks.StartXR)
}

const testPoses = [
  [
    [0, 1.6, 0, 0, 1, 0, 0], // head
    [-0.5, 1.5, -1, 0, 0, 0, 1], // left
    [0.5, 1.5, -1, 0, 0, 0, 1] // right
  ],
  [
    [0.1, 1.7, -0.2, -0.5, -0.4, -0.3, 0.2], // head
    [-0.4, 1.45, -0.9, 0.6, 0.5, -0.4, 0.3], // left
    [0.4, 1.3, -0.8, -0.4, -0.3, 0.2, 0.1] // right
  ]
]

export const testWebXR = (bot: XREngineBot) => {
  it('Web XR works', async () => {
    assert(await bot.runHook(XRBotHooks.XRSupported))
    assert(await bot.runHook(XRBotHooks.XRInitialized))
  })

  it('Can detect and move input sources', async () => {
    for (const posesToTest of testPoses) {
      await bot.runHook(XRBotHooks.SetXRInputPosition, {
        head: posesToTest[0],
        left: posesToTest[1],
        right: posesToTest[2]
      })
      await bot.delay(2000)
      const { headInputValue, leftControllerInputValue, rightControllerInputValue } = await bot.runHook(
        XRBotHooks.GetXRInputPosition
      )
      console.log(headInputValue)
      console.log(leftControllerInputValue)
      console.log(rightControllerInputValue)
      compareArrays(headInputValue, posesToTest[0], 0.01)
      compareArrays(leftControllerInputValue, posesToTest[1], 0.01)
      compareArrays(rightControllerInputValue, posesToTest[2], 0.01)
    }
  })
}
