import { Vector3 } from 'three';
import XREngineBot from '../src/bot';
import { getIsYourTurn, getPlayerPosition, overrideXR, startXR, xrInitialized, xrSupported } from './engineTestUtils';

const maxTimeout = 60 * 1000
const headless = true
const bot = new XREngineBot({ name: 'bot-1', headless })

// TODO: get APP_HOST from dotenv
const domain = '192.168.0.16:3000'
// TODO: load GS & client from static world file instead of having to run independently
const locationName = 'golf'

const sqrt2 = Math.sqrt(2)
const spawnPos = new Vector3(-1, 8.5, 15.5)
const tee0Pos = new Vector3(0.2, 6.7, 10.06)
const vec3 = new Vector3()

describe('Golf tests', () => {

  beforeAll(async () => {
    await bot.launchBrowser()
    await bot.enterRoom(`https://${domain}/location/${locationName}`)
    await bot.page.addScriptTag({ url: '/scripts/webxr-polyfill.js' })
    await bot.evaluate(overrideXR)
  }, maxTimeout)

  afterAll(async () => {
    await bot.delay(1000)
    await bot.quit()
  }, maxTimeout)

  test('Web XR works', async () => {
    expect(await bot.evaluate(xrSupported)).toBe(true)
    await bot.evaluate(startXR)
    expect(await bot.evaluate(xrInitialized)).toBe(true)
  }, maxTimeout)

  test('Can teleport to ball', async () => {
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
    ).toBeLessThan(sqrt2)

    // await bot.awaitPromise(getIsYourTurn)
  }, maxTimeout)

})