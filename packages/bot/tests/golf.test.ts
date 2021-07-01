import XREngineBot from '../src/bot';
import { engineInitialised, getPlayerPosition } from './engineTestUtils';
// import { evaluate2 as evaluate} from 'puppeteer-evaluate2'

const maxTimeout = 60 * 1000

const bot = new XREngineBot()

const botName = 'bot-1'
const domain = '192.168.0.16:3000'
const locationName = 'golf'


describe('Golf tests', () => {

  beforeAll(async () => {
    await bot.launchBrowser()
    await bot.enterRoom(`https://${domain}/location/${locationName}`, { name: botName })
    // await bot.setFocus('canvas');
    // await bot.clickElementById('canvas', 'engine-renderer-canvas');
  }, maxTimeout)

  afterAll(async () => {
    await bot.delay(3000)
    await bot.quit()
  }, maxTimeout)

  test('Engine initialised', async () => {
    const result = await bot.evaluate(engineInitialised)
    expect(result).toBe(true)
  }, maxTimeout)

  // test('Can hit ball', async () => {
  //   await bot.page.keyboard.press('KeyK');
  //   const result = await evaluate(bot.page, getPlayerPosition)
  //   expect(result).toBe('')
  // }, maxTimeout)

})