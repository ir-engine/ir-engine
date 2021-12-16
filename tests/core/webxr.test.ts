import { setupXR, testWebXR } from '../utils/testWebXR'
import { XREngineBot } from 'xrengine-bot/src/bot'
import { BotHooks } from '@xrengine/engine/src/bot/enums/BotHooks'

const bot = new XREngineBot({ name: 'bot-1', verbose: true })

const domain = process.env.APP_HOST
// TODO: load GS & client from static world file instead of having to run independently
const locationName = 'test'
console.log('process.env.HEADLESS', process.env.HEADLESS)

describe('WebXR Bot Tests', () => {

  before(async () => {
    await bot.launchBrowser()
    await bot.enterLocation(`https://${domain}/location/${locationName}`)
    await bot.awaitHookPromise(BotHooks.LocationLoaded)
    await setupXR(bot)
    await bot.runHook(BotHooks.InitializeBot)
  })

  after(async () => {
    await bot.delay(1500)
    await bot.quit()
  })

  testWebXR(bot)
})