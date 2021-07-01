import { Vector3 } from 'three';
import XREngineBot from '../src/bot';
import { engineInitialised, getPlayerPosition } from './engineTestUtils';
// import { evaluate2 as evaluate} from 'puppeteer-evaluate2'

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
    await bot.enterRoom(`https://${domain}/location/${locationName}`, { name: botName })
    await bot.setFocus('canvas');
    await bot.clickElementById('canvas', 'engine-renderer-canvas');
  }, maxTimeout)

  afterAll(async () => {
    await bot.delay(3000)
    await bot.quit()
  }, maxTimeout)

  test('Engine initialised', async () => {
    const result = await bot.evaluate(engineInitialised)
    expect(result).toBe(true)
  }, maxTimeout)

  test('Can teleport to ball', async () => {
    const pos1 = await bot.evaluate(getPlayerPosition)
    expect(vec3.set(pos1.x, pos1.y, pos1.z).sub(spawnPos).length()).toBeLessThan(sqrt2 * 2)
    await bot.delay(10000)
    // TODO: detect game has started
    await bot.keyPress('KeyK', 1000)
    await bot.delay(2000)
    const pos2 = await bot.evaluate(getPlayerPosition)
    expect(vec3.set(pos2.x, pos2.y, pos2.z).sub(tee0Pos).length()).toBeLessThan(sqrt2 * 2)
  }, maxTimeout)

})