import { Vector3 } from 'three'
import { XREngineBot } from '@xrengine/bot'
import { BotHooks } from '@xrengine/engine/src/bot/enums/BotHooks'

const maxTimeout = 60 * 1000
const bot = new XREngineBot({ name: 'bot-1', verbose: true })
const vector3 = new Vector3()

const domain = process.env.APP_HOST
const locationName = 'test'
const sqrt2 = Math.sqrt(2)
console.log('process.env.HEADLESS', process.env.HEADLESS)

describe('My Bot Tests', () => {

  beforeAll(async () => {
    try {
      await bot.launchBrowser()
      await bot.enterLocation(`https://${domain}/location/${locationName}`)
      console.log('entered location')
      await bot.awaitHookPromise(BotHooks.LocationLoaded)
      console.log('location loaded')
      await bot.runHook(BotHooks.InitializeBot)
      console.log('bot initalised')
    } catch (e) {
      console.error(e)
    }
  }, 2 * maxTimeout)

  afterAll(async () => {
    console.log('Tests finished, bot is now quitting!')
    await bot.delay(1500)
    await bot.quit()
  }, maxTimeout)

  test('Can spawn in the world', async () => {
    console.log('Running spawn in world test...')
    await bot.delay(1000)
    expect(
      vector3.copy(await bot.runHook(BotHooks.GetPlayerPosition)).length()
    ).toBeLessThan(sqrt2 * 2) // sqrt2 * 2 is the default size of our spawn area
    console.log('Ran spawn in world test!')
  })

})