import { Vector3 } from 'three'
import { XREngineBot } from '@xrengine/bot'
import { BotHooks } from '@xrengine/engine/src/bot/enums/BotHooks'

const maxTimeout = 60 * 1000
const bot = new XREngineBot({ name: 'bot-1', headless: true, autoLog: false })
const vector3 = new Vector3()

const domain = process.env.APP_HOST
const locationName = 'test'
const sqrt2 = Math.sqrt(2)

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
  }, 10 * maxTimeout)

  afterAll(async () => {
    try {
      console.log('Tests finished, bot is now quitting!')
      await bot.delay(1500)
      await bot.quit()
    } catch (e) {
      console.error(e)
    }
  }, maxTimeout)

  test('Can spawn in the world', async () => {
    try {
      console.log('Running spawn in world test...')
      await bot.delay(1000)
      expect(
        vector3.copy(await bot.runHook(BotHooks.GetPlayerPosition)).length()
      ).toBeLessThan(sqrt2 * 2) // sqrt2 * 2 is the default size of our spawn area
      console.log('Ran spawn in world test!')
    } catch (e) {
      console.error(e)
    }
  })

})