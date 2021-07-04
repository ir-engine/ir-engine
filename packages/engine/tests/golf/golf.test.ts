// @ts-ignore
import { Quaternion, Vector3 } from 'three';
import XREngineBot from '@xrengine/bot/src/bot';
// import { getXRInputPosition, getIsYourTurn, getPlayerPosition, overrideXR, startXR, updateController, updateHead, xrInitialized, xrSupported } from '../../src/bot/setupBotHooks';

const maxTimeout = 60 * 1000
const headless = true
const bot = new XREngineBot({ name: 'bot-1', headless, autoLog: true })

// TODO: get APP_HOST from dotenv
//const domain = '192.168.0.16:3000'
const domain = 'localhost:3000'
// TODO: load GS & client from static world file instead of having to run independently
const locationName = 'golf'

const sqrt2 = Math.sqrt(2)
const spawnPos = new Vector3(-1, 8.5, 15.5)
const tee0Pos = new Vector3(0.2, 6.7, 10.06)
const vector3 = new Vector3()

const headPosition = new Vector3(0, 1.6, 0)
const headRotation = new Quaternion()
const leftControllerPosition = new Vector3(-0.5, 1.5, -1)
const leftControllerRotation = new Quaternion()
const rightControllerPosition = new Vector3(0.5, 1.5, -1)
const rightControllerRotation = new Quaternion()

let interval;

const sendXRInputData = () => {
  bot.runHook('updateHead', {
    position: headPosition.toArray(),
    quaternion: headRotation.toArray()
  })
  bot.runHook('updateController', {
    objectName: 'leftController',
    position: leftControllerPosition.toArray(),
    quaternion: leftControllerRotation.toArray()
  })
  bot.runHook('updateController', {
    objectName: 'rightController',
    position: rightControllerPosition.toArray(),
    quaternion: rightControllerRotation.toArray()
  })
}

const startSendingXRInputData = () => {
  interval = setInterval(sendXRInputData)
}
const stopSendingXRInputData = () => {
  interval && clearInterval(interval)
}


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
      console.log(arr2[i], val)
      expect(Math.abs(arr2[i] - val)).toBeLessThanOrEqual(tolerance)
    })
  } else {
    arr1.forEach((val, i) => {
      expect(val).toBe(arr2[i])
    })
  }
}

describe('Golf tests', () => {

  beforeAll(async () => {
    await bot.launchBrowser()
    await bot.enterRoom(`https://${domain}/location/${locationName}`)
    await bot.page.addScriptTag({ url: '/scripts/webxr-polyfill.js' })
    await bot.delay(500)
    await bot.awaitHookPromise('getIsYourTurn')
    await bot.runHook('overrideXR')
  }, maxTimeout)

  afterAll(async () => {
    await bot.delay(1000)
    await bot.quit()
  }, maxTimeout)

  test('Web XR works', async () => {
    expect(await bot.runHook('xrSupported')).toBe(true)
    await bot.runHook('startXR')
    expect(await bot.runHook('xrInitialized')).toBe(true)
  }, maxTimeout)


  test('Can detect and move input sources', async () => {

    await bot.delay(1000)
    // Detect default head view transform
    const { 
      headInputValue,
      leftControllerInputValue,
      rightControllerInputValue
    } = await bot.runHook('getXRInputPosition')

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
      vector3.copy(await bot.runHook('getPlayerPosition')).sub(spawnPos).length()
    ).toBeLessThan(sqrt2 * 2)

    // wait for turn, then move to ball position
    await bot.awaitHookPromise('getIsYourTurn')
    await bot.keyPress('KeyK', 200)
    await bot.delay(500)

    // should be at ball position
    expect(
      vector3.copy(await bot.runHook('getPlayerPosition')).sub(tee0Pos).length()
    ).toBeLessThan(sqrt2)
    await bot.delay(2000)

  }, maxTimeout)

  test('Can hit ball', async () => {
    // player should be at ball position
    expect(
      vector3.copy(await bot.runHook('getPlayerPosition')).sub(tee0Pos).length()
    ).toBeLessThan(sqrt2)
  
    // ball should be at spawn position
    expect(
      vector3.copy(await bot.runHook('getBallPosition')).sub(tee0Pos).length()
    ).toBeLessThan(sqrt2)
    
    // wait for turn, then move to ball position
    await bot.awaitHookPromise('getIsYourTurn')
    
    await bot.delay(500)

    
    expect(
      vector3.copy(await bot.runHook('getBallPosition')).sub(tee0Pos).length()
    ).toBeLessThan(sqrt2)//.toBeGreaterThan(sqrt2 * 2)
    await bot.delay(2000)
  }, maxTimeout)

  //

})