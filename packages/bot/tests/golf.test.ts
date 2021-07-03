import { Quaternion, Vector3 } from 'three';
import XREngineBot from '@xrengine/bot/src/bot';
import { getHeadInputPosition, getIsYourTurn, getPlayerPosition, overrideXR, startXR, updateHead, xrInitialized, xrSupported } from './engineTestUtils';

const maxTimeout = 60 * 1000
const headless = false
const bot = new XREngineBot({ name: 'bot-1', headless })

// TODO: get APP_HOST from dotenv
const domain = '192.168.0.16:3000'
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
const compareVec3 = (vec1, vec2, tolerance) => {
  if(tolerance) {
    expect(Math.abs(vec2.x - vec1.x)).toBeLessThanOrEqual(tolerance)
    expect(Math.abs(vec2.y - vec1.y)).toBeLessThanOrEqual(tolerance)
    expect(Math.abs(vec2.z - vec1.z)).toBeLessThanOrEqual(tolerance)
  } else {
    expect(vec1.x).toBe(vec2.x)
    expect(vec1.y).toBe(vec2.y)
    expect(vec1.z).toBe(vec2.z)
  }
}

describe('Golf tests', () => {

  beforeAll(async () => {
    await bot.launchBrowser()
    await bot.enterRoom(`https://${domain}/location/${locationName}`)
    await bot.page.addScriptTag({ url: '/scripts/webxr-polyfill.js' })
    await bot.evaluate(overrideXR)
  }, maxTimeout)

  afterAll(async () => {
    await bot.delay(10000)
    await bot.quit()
  }, maxTimeout)

  test('Web XR works', async () => {
    expect(await bot.evaluate(xrSupported)).toBe(true)
    await bot.evaluate(startXR)
    expect(await bot.evaluate(xrInitialized)).toBe(true)
  }, maxTimeout)


  test('Can detect and move input sources', async () => {

    await bot.delay(1000)
    await bot.evaluate(updateHead, {
      position: [0, 1.6, 0],
      quaternion: [0, 0, 0, 1]
    })
    await bot.delay(1000)
    // Detect default head view transform
    const headInputValue = await bot.evaluate(getHeadInputPosition)
    console.log(headInputValue)
    compareVec3(
      new Vector3(headInputValue.x, headInputValue.y, headInputValue.z),
      new Vector3(0, 1.6, 0),
      0.01
    )

    
    // get head pos
    
    // set left controller pos
    // get left controller pos

    // set right controller pos
    // get right controller pos
  }, maxTimeout)


  // test.skip('Can teleport to ball', async () => {
  //   // should be at spawn position
  //   expect(
  //     vector3.copy(await bot.evaluate(getPlayerPosition)).sub(spawnPos).length()
  //   ).toBeLessThan(sqrt2 * 2)

  //   // wait for turn, then move to ball position
  //   await bot.awaitPromise(getIsYourTurn)
  //   await bot.keyPress('KeyK', 200)
  //   await bot.delay(500)

  //   // should be at ball position
  //   expect(
  //     vector3.copy(await bot.evaluate(getPlayerPosition)).sub(tee0Pos).length()
  //   ).toBeLessThan(sqrt2)
  //   await bot.delay(2000)

  // }, maxTimeout)

  //

})