import { Vector3 } from 'three'
import { XREngineBot } from '@xrengine/bot'
import { setupXR, testWebXR } from '../utils/testWebXR'
import { BotHooks, XRBotHooks } from '@xrengine/engine/src/bot/enums/BotHooks'
import { teleportToBall } from './actions/teleportToBallTest'
import { hitBallTest } from './actions/hitBallTest'
import { resetBall } from './actions/resetBallTest'

const maxTimeout = 60 * 1000
const bot = new XREngineBot({ name: 'bot-1', headless: false, autoLog: false })

const domain = process.env.APP_HOST
// TODO: load GS & client from static world file instead of having to run independently
const locationName = process.env.TEST_LOCATION_NAME

const vector3 = new Vector3()

describe.skip('Golf tests', () => {

  beforeAll(async () => {
    await bot.launchBrowser()
    await bot.enterLocation(`https://${domain}/golf/${locationName}`)
    await bot.awaitHookPromise(BotHooks.LocationLoaded)
    await setupXR(bot)
    await bot.runHook(BotHooks.InitializeBot)
    await bot.runHook(XRBotHooks.OverrideXR)
  }, maxTimeout)

  afterAll(async () => {
    await bot.delay(1000)
    await bot.quit()
  }, maxTimeout)

  testWebXR(bot)

  // Test player ids
  // Test state stuff like score and current hole

  teleportToBall(bot)
  hitBallTest(bot)

  teleportToBall(bot)
  hitBallTest(bot)
  // resetBall(bot)

})
