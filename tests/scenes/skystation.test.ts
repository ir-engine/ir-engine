import { Vector3 } from 'three'
import { XREngineBot } from '@xrengine/bot/src/bot'
import { BotHooks } from '@xrengine/engine/src/bot/enums/BotHooks'
import assert from 'assert'

const bots = Array.apply(null, Array(3)).map((_, index) => new XREngineBot({ name: `bot-${index}`, verbose: true }))
const vector3 = new Vector3()

const domain = process.env.APP_HOST
const locationName = 'sky-station'

describe.only('Sky Station Scene Tests', () => {
  before(async () => {
    for (let bot of bots) {
      await bot.launchBrowser()
      await bot.enterLocation(`https://${domain}/location/${locationName}`)
      await bot.awaitHookPromise(BotHooks.LocationLoaded)
      await bot.runHook(BotHooks.InitializeBot)
      await bot.delay(1000)
    }
  })

  after(async () => {
    for (let bot of bots) {
      await bot.delay(1500)
      await bot.quit()
    }
  })

  it('Can spawn multiple bots in the world', async () => {
    for (let bot of bots) {
      await bot.delay(1000)
      const pos = await bot.runHook(BotHooks.GetPlayerPosition)
      assert(vector3.copy(pos).length() < 45)
    }
  })

})
