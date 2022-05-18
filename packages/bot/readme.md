# Bot API - WORK IN PROGRESS

Previously used agones for running inside an XREngine cluster - this is considered deprecated in favour of simplicitly.

### Example

```ts
import { Vector3 } from 'three'
import { XREngineBot } from '@xrengine/bot/src/bot'
import { BotHooks } from '@xrengine/engine/src/bot/enums/BotHooks'

const maxTimeout = 10 * 1000
const bot = new XREngineBot({ name: 'bot-1', headless: false, verbose: false })
const vector3 = new Vector3()

const domain = process.env.APP_HOST
const locationName = 'test'
const sqrt2 = Math.sqrt(2)

describe('My Bot Tests', () => {

  beforeAll(async () => {
    await bot.launchBrowser()
    await bot.enterLocation(`https://${domain}/location/${locationName}`)
    await bot.delay(1000)
    await bot.runHook(BotHooks.InitializeBot)
  }, maxTimeout)

  afterAll(async () => {
    await bot.delay(1000)
    await bot.quit()
  }, maxTimeout)

  test('Can spawn in the world', async () => {
    expect(
      vector3.copy(await bot.runHook(BotHooks.GetPlayerPosition)).length()
    ).toBeLessThan(sqrt2 * 2) // sqrt2 * 2 is the default size of our spawn area
  })

})

```