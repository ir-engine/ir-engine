import { setupXR, testWebXR } from '../utils/testWebXR'
import { XREngineBot } from '@xrengine/bot'
import { BotHooks } from '@xrengine/engine/src/bot/enums/BotHooks'

const maxTimeout = 60 * 1000
const bot = new XREngineBot({ name: 'bot-1', headless: true, autoLog: false })

const domain = process.env.APP_HOST
// TODO: load GS & client from static world file instead of having to run independently
const locationName = 'test'

describe('WebXR Bot Tests', () => {

  beforeAll(async () => {
    await bot.launchBrowser()
    await bot.enterLocation(`https://${domain}/location/${locationName}`)
    await bot.awaitHookPromise(BotHooks.LocationLoaded)
    await setupXR(bot)
    await bot.runHook(BotHooks.InitializeBot)
  }, maxTimeout)

  afterAll(async () => {
    await bot.delay(1000)
    await bot.quit()
  }, maxTimeout)

  testWebXR(bot)
})