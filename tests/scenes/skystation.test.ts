import { Vector3 } from 'three'
import { XREngineBot } from '@xrengine/bot/src/bot'
import { BotHooks } from '@xrengine/engine/src/bot/enums/BotHooks'
import assert from 'assert'

const bot = new XREngineBot({ name: 'bot-1', verbose: true })
const vector3 = new Vector3()

const domain = process.env.APP_HOST
const locationName = 'sky-station'

describe.only('Sky Station Scene Tests', () => {
  before(async () => {
    await bot.launchBrowser()
    await bot.enterLocation(`https://${domain}/location/${locationName}`)
    await bot.awaitHookPromise(BotHooks.LocationLoaded)
    await bot.runHook(BotHooks.InitializeBot)
    await bot.delay(50000)
  })

  after(async () => {
    await bot.delay(1500)
    await bot.quit()
  })

  it('Can spawn in the world', async () =>{
    await bot.delay(1000)
    const pos = await bot.runHook(BotHooks.GetPlayerPosition)
    assert(vector3.copy(pos).length() < 45)
  })

})
