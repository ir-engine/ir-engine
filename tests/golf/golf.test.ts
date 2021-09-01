import { XREngineBot } from '@xrengine/bot/src/bot'
import { setupXR, testWebXR } from '../utils/testWebXR'
import { BotHooks, XRBotHooks } from '@xrengine/engine/src/bot/enums/BotHooks'
import { teleportToBall } from './actions/teleportToBallTest'
import { headUpdateTest, hitBallTest } from './actions/hitBallTest'
import { canOnePlayerFinishedFirstHole, canTwoPlayerFinishedFirstHole } from './actions/multiPlayerPlayingTest'
import { resetBall } from './actions/resetBallTest'

const maxTimeout = 60 * 1000
const bot = new XREngineBot({ name: 'bot-1', headless: false, verbose: false })
const bot2 = new XREngineBot({ name: 'bot-2', headless: false, verbose: false })

const domain = process.env.APP_HOST
// TODO: load GS & client from static world file instead of having to run independently
const locationName = process.env.TEST_LOCATION_NAME

describe.skip('Golf tests', () => {
  //version/
  chrome: beforeAll(async () => {
    await bot.launchBrowser()
    await bot.enterLocation(`https://${domain}/golf/${locationName}`)
    await bot.awaitHookPromise(BotHooks.LocationLoaded)
    await bot.delay(3000)
    await setupXR(bot)
    await bot.runHook(BotHooks.InitializeBot)
    await bot.runHook(XRBotHooks.OverrideXR)

    await bot2.launchBrowser()
    await bot2.enterLocation(`https://${domain}/golf/${locationName}`)
    await bot2.awaitHookPromise(BotHooks.LocationLoaded)
    await bot2.delay(3000)
    await setupXR(bot2)
    await bot2.runHook(BotHooks.InitializeBot)
    await bot2.runHook(XRBotHooks.OverrideXR)
  }, maxTimeout)

  afterAll(async () => {
    await bot.delay(1000)
    await bot.quit()

    await bot2.delay(1000)
    await bot2.quit()
  }, maxTimeout)

  headUpdateTest(bot)
  testWebXR(bot)
  teleportToBall(bot)
  //simulateXR()
  headUpdateTest(bot2)
  testWebXR(bot2)

  hitBallTest(bot)
  // resetBall(bot) // Out fo course
  // Test player ids
  // Test state stuff like score and current hole
/*
- add following tests:
  - multiple players
  - multiple hits
  - multiple holes
  - ball out of bounds
  - player disconnect and reconnect
  */
  //canOnePlayerFinishedFirstHole(bot)
  canTwoPlayerFinishedFirstHole(bot, bot2)
  

})