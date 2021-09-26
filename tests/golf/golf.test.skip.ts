import { Vector3 } from 'three'
import { XREngineBot } from '@xrengine/bot/src/bot'
import { setupXR, testWebXR } from '../utils/testWebXR'
import { BotHooks, XRBotHooks } from '@xrengine/engine/src/bot/enums/BotHooks'
import { teleportToBall } from './actions/teleportToBallTest'
import { hitBallTest } from './actions/hitBallTest'

const bot = new XREngineBot({ name: 'bot-1', headless: true, verbose: false })

const domain = process.env.APP_HOST
// TODO: load GS & client from static world file instead of having to run independently
const locationName = process.env.TEST_LOCATION_NAME

describe.skip('Golf tests', () => {
  before(async () => {
    await bot.launchBrowser()
    await bot.enterLocation(`https://${domain}/golf/${locationName}`)
    await bot.awaitHookPromise(BotHooks.LocationLoaded)
    await setupXR(bot)
    await bot.runHook(BotHooks.InitializeBot)
    await bot.runHook(XRBotHooks.OverrideXR)
  })

  after(async () => {
    await bot.delay(1000)
    await bot.quit()
  })

  testWebXR(bot)

  // Test player ids
  // Test state stuff like score and current hole

  teleportToBall(bot)
  hitBallTest(bot)

  teleportToBall(bot)
  hitBallTest(bot)
  // resetBall(bot)
})
