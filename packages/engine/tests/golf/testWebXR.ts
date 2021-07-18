
import type XREngineBot from '../../../bot/src/bot'
import { XRBotHooks } from '../../src/bot/enums/BotHooks'
import { compareArrays } from '../utils/MathTestUtils'

export const testWebXR = (bot: XREngineBot) => {

  test('Web XR works', async () => {
    await bot.delay(1000)
    expect(await bot.runHook(XRBotHooks.XRSupported)).toBe(true)
    await bot.runHook(XRBotHooks.StartXR)
    expect(await bot.runHook(XRBotHooks.XRInitialized)).toBe(true)
  }, 5 * 1000)


  test('Can detect and move input sources', async () => {

    await bot.delay(1000)
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