import { Vector3 } from 'three'
import { XREngineBot } from '@xrengine/bot/src/bot'
import { BotHooks } from '@xrengine/engine/src/bot/enums/BotHooks'
import assert from 'assert'

const domain = process.env.APP_HOST
const locationName = 'sky-station'

describe('Sky Station Bot Tests', () => {
  const bot = new XREngineBot({ name: 'bot', verbose: true })

  before(async () => {
    await bot.launchBrowser()
    await bot.enterEditor(`https://${domain}/editor/default-project/${locationName}`, `https://${domain}/login`)
    await bot.awaitHookPromise(BotHooks.SceneLoaded)
    await bot.runHook(BotHooks.InitializeBot)
    await bot.delay(1000)
  })

  after(async () => {
    await bot.delay(1500)
    await bot.quit()
  })

  it('Can load sky station scene in editor', async () =>{
    await bot.delay(1000)
    const metadata = await bot.runHook(BotHooks.GetSceneMetadata)
    assert.notEqual(metadata, "")
  })
})

describe('Sky Station Multiple Bot Tests', () => {
  const bots = Array.apply(null, Array(3)).map((_, index) => new XREngineBot({ name: `bot-${index}`, verbose: true }))
  const vector3 = new Vector3()

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

  it('Can spawn multiple bots in sky station world', async () => {
    for (let bot of bots) {
      await bot.delay(1000)
      const pos = await bot.runHook(BotHooks.GetPlayerPosition)
      assert(vector3.copy(pos).length() < 45)
    }
  })
})
