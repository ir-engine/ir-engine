import { setupXR, testWebXR } from '../utils/testWebXR'
import { XREngineBot } from '@xrengine/bot'
import { BotHooks } from '@xrengine/engine/src/bot/enums/BotHooks'

const maxTimeout = 60 * 1000
const bot = new XREngineBot({ name: 'bot-1', headless: true, verbose: true })

const domain = process.env.APP_HOST
// TODO: load GS & client from static world file instead of having to run independently
const locationName = 'test'
console.log('process.env.HEADLESS', process.env.HEADLESS)

describe('WebXR Bot Tests', () => {

  beforeAll(async () => {
    await bot.launchBrowser()
    await bot.enterLocation(`https://${domain}/location/${locationName}`)
    console.log('entered location')
    await bot.awaitHookPromise(BotHooks.LocationLoaded)
    console.log('location loaded')
    await setupXR(bot)
    console.log('xr initalised')
    await bot.runHook(BotHooks.InitializeBot)
    console.log('bot initalised')
  }, maxTimeout)

  afterAll(async () => {
    console.log('Tests finished, bot is now quitting!')
    await bot.delay(1500)
    await bot.quit()
  }, maxTimeout)

  testWebXR(bot)
})