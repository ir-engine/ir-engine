// @ts-ignore
import { Euler, MathUtils, Quaternion, Vector3 } from 'three';
import XREngineBot from '../../../bot/src/bot';
import { BotHooksTags } from '../../src/bot/setupBotHooks';

const maxTimeout = 60 * 1000
const headless = false
const bot = new XREngineBot({ name: 'bot-1', headless, autoLog: true })

const domain = process.env.APP_HOST
// TODO: load GS & client from static world file instead of having to run independently
const locationName = 'golf'

const sqrt2 = Math.sqrt(2)
const spawnPos = new Vector3(-1, 8.5, 15.5)
const tee0Pos = new Vector3(0.2, 6.7, 10.06)
const vector3 = new Vector3()

const randomVector3 = (scale = 1) => {
  return new Vector3(
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2,
  ).normalize().multiplyScalar(scale)

}
const randomQuat = () => {  
  return new Quaternion().setFromUnitVectors(
    new Vector3(), 
    randomVector3()
  )
}
const compareArrays = (arr1, arr2, tolerance) => {
  if(tolerance) {
    arr1.forEach((val, i) => {
      expect(Math.abs(arr2[i] - val)).toBeLessThanOrEqual(tolerance)
    })
  } else {
    arr1.forEach((val, i) => {
      expect(val).toBe(arr2[i])
    })
  }
}

const eulerToQuaternion = (x, y, z, order = 'XYZ') => {
  return new Quaternion().setFromEuler(new Euler(x, y, z, order))
}


describe('Golf tests', () => {

  beforeAll(async () => {
    await bot.launchBrowser()
    await bot.enterRoom(`https://${domain}/location/${locationName}`)
    await bot.page.addScriptTag({ url: '/scripts/webxr-polyfill.js' })
    await bot.delay(500)
    await bot.runHook(BotHooksTags.initializeBot)
    await bot.awaitHookPromise(BotHooksTags.getIsYourTurn)
    await bot.runHook(BotHooksTags.overrideXR)
  }, maxTimeout)

  afterAll(async () => {
    await bot.delay(10000)
    await bot.quit()
  }, maxTimeout)

  test('Web XR works', async () => {
    expect(await bot.runHook(BotHooksTags.xrSupported)).toBe(true)
    await bot.runHook(BotHooksTags.startXR)
    expect(await bot.runHook(BotHooksTags.xrInitialized)).toBe(true)
  }, maxTimeout)


  test('Can detect and move input sources', async () => {

    await bot.delay(1000)
    // Detect default head view transform
    const { 
      headInputValue,
      leftControllerInputValue,
      rightControllerInputValue
    } = await bot.runHook(BotHooksTags.getXRInputPosition)

    compareArrays(
      [headInputValue.x, headInputValue.y, headInputValue.z],
      [0, 0.7, 0],
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
  }, maxTimeout)


  test('Can teleport to ball', async () => {
    // should be at spawn position
    expect(
      vector3.copy(await bot.runHook(BotHooksTags.getPlayerPosition)).sub(spawnPos).length()
    ).toBeLessThan(sqrt2 * 2) // sqrt2 * 2 is the size of our spawn area

    // wait for turn, then move to ball position
    await bot.awaitHookPromise(BotHooksTags.getIsYourTurn)
    await bot.keyPress('KeyK', 200)
    await bot.delay(500)

    // should be at ball position
    expect(
      vector3.copy(await bot.runHook(BotHooksTags.getPlayerPosition)).sub(tee0Pos).length()
    ).toBeLessThan(0.1)

  }, maxTimeout)

  test('Can hit ball', async () => {

    await bot.runHook(BotHooksTags.updateHead, {
      position: [0, 2, 1],
      rotation: eulerToQuaternion(-1.25, 0, 0).toArray()
    })

    console.log('ball position', await bot.runHook(BotHooksTags.getBallPosition))
    console.log('tee position', tee0Pos)
  
    // ball should be at spawn position
    expect(
      vector3.copy(await bot.runHook(BotHooksTags.getBallPosition)).sub(tee0Pos).length()
    ).toBeLessThan(0.1)
    
    await bot.delay(1000)
    // wait for turn, then move to ball position
    await bot.awaitHookPromise(BotHooksTags.getIsYourTurn)
    
    await bot.delay(500)

    // rotate left thumbstick 3 or 4 times to the left

    await bot.runHook(BotHooksTags.swingClub)
   
    await bot.delay(2000)
    expect(
      vector3.copy(await bot.runHook(BotHooksTags.getBallPosition)).sub(tee0Pos).length()
    ).toBeGreaterThan(0.5)
    await bot.delay(5000)
  }, maxTimeout)

  //

})
