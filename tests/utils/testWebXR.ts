import type { XREngineBot } from '@xrengine/bot/src/bot'
import { XRBotHooks } from '@xrengine/engine/src/bot/enums/BotHooks'
import { compareArrays } from '@xrengine/engine/src/common/functions/MathRandomFunctions'

export const setupXR = async (bot: XREngineBot) => {
  await bot.page.addScriptTag({ url: '/scripts/webxr-polyfill.js' })
  await bot.runHook(XRBotHooks.OverrideXR)
  await bot.runHook(XRBotHooks.StartXR)
}

export const testWebXR = (bot: XREngineBot) => {

  test('Web XR works', async () => {
    expect(await bot.runHook(XRBotHooks.XRSupported)).toBe(true)
    expect(await bot.runHook(XRBotHooks.XRInitialized)).toBe(true)
  }, 10 * 1000)

  test('Can detect and move input sources', async () => {

    await bot.delay(2000)
    // Detect default head view transform
    const { 
      headInputValue,
      leftControllerInputValue,
      rightControllerInputValue
    } = await bot.runHook(XRBotHooks.GetXRInputPosition)

    compareArrays(
      [headInputValue.x, headInputValue.y, headInputValue.z],
      [0, 1.6, 0],
      0.01
    )
    compareArrays(
      [headInputValue.qX, headInputValue.qY, headInputValue.qZ, headInputValue.qW],
      [0, 1, 0, 0], // rotated around Y as WebXR is inverted look direction
      0.01
    )
    
    compareArrays(
      [leftControllerInputValue.x, leftControllerInputValue.y, leftControllerInputValue.z],
      [-0.5, 1.5, -1],
      0.01
    )
    compareArrays(
      [leftControllerInputValue.qX, leftControllerInputValue.qY, leftControllerInputValue.qZ, leftControllerInputValue.qW],
      [0, 0, 0, 1],
      0.01
    )
    
    compareArrays(
      [rightControllerInputValue.x, rightControllerInputValue.y, rightControllerInputValue.z],
      [0.5, 1.5, -1],
      0.01
    )
    compareArrays(
      [rightControllerInputValue.qX, rightControllerInputValue.qY, rightControllerInputValue.qZ, rightControllerInputValue.qW],
      [0, 0, 0, 1],
      0.01
    )
  }, 5 * 1000)

}