import { Vector3 } from 'three'
import { XREngineBot } from '@xrengine/bot'
import { BotHooks } from '@xrengine/engine/src/bot/enums/BotHooks'

const maxTimeout = 60 * 1000
const bot = new XREngineBot({ name: 'bot-1', verbose: true })
const vector3 = new Vector3()

const domain = process.env.APP_HOST
const locationName = 'test'
const sqrt2 = Math.sqrt(2)

describe('My Bot Tests', () => {

  beforeAll(async () => {
    try {
      await bot.launchBrowser()
      await bot.enterLocation(`https://${domain}/location/${locationName}`)
      await bot.awaitHookPromise(BotHooks.LocationLoaded)
      await bot.runHook(BotHooks.InitializeBot)
    } catch (e) {
      console.error(e)
    }
  }, 2 * maxTimeout)

  afterAll(async () => {
    await bot.delay(1500)
    await bot.quit()
  }, maxTimeout)

  test('Can spawn in the world', async () => {
    await bot.delay(1000)
    expect(
      vector3.copy(await bot.runHook(BotHooks.GetPlayerPosition)).length()
    ).toBeLessThan(sqrt2 * 2) // sqrt2 * 2 is the default size of our spawn area
  })

})