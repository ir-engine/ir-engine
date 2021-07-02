import { Vector3 } from 'three';
import XREngineBot from '../src/bot';
import { getIsYourTurn, getPlayerPosition, overrideXR, xrInitialized, xrSupported } from './engineTestUtils';

const maxTimeout = 60 * 1000

const bot = new XREngineBot()

const botName = 'bot-1'
const domain = '192.168.0.16:3000'
const locationName = 'golf'

const sqrt2 = Math.sqrt(2)
const spawnPos = new Vector3(-1, 8.5, 15.5)
const tee0Pos = new Vector3(0.2, 6.7, 10.06)
const vec3 = new Vector3()

describe('Golf tests', () => {

  beforeAll(async () => {
    await bot.launchBrowser()
    await bot.enterRoom(`https://${domain}/location/${locationName}`)
    console.log(await bot.page.addScriptTag({ url: '/scripts/webxr-polyfill.js' }))
    // await bot.delay(2000)
    await bot.evaluate(overrideXR)
    // await bot.delay(2000)
  }, maxTimeout)

  afterAll(async () => {
    await bot.delay(1000)
    await bot.quit()
  }, maxTimeout)

  test('Web XR works', async () => {
    expect(await bot.evaluate(xrSupported)).toBe(true)
    await bot.clickElementById('button', 'UserXR')
    // await bot.delay(1000)
    expect(await bot.evaluate(xrInitialized)).toBe(true)
  }, maxTimeout)

  test.skip('Can teleport to ball', async () => {
    // should be at spawn position
    expect(
      vec3.copy(await bot.evaluate(getPlayerPosition)).sub(spawnPos).length()
    ).toBeLessThan(sqrt2 * 2)

    // wait for turn, then move to ball position
    await bot.awaitPromise(getIsYourTurn)
    await bot.keyPress('KeyK', 200)
    await bot.delay(500)

    // should be at ball position
    expect(
      vec3.copy(await bot.evaluate(getPlayerPosition)).sub(tee0Pos).length()
    ).toBeLessThan(sqrt2 * 2)

    // await bot.awaitPromise(getIsYourTurn)
  }, maxTimeout)

})