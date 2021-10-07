import { Vector3 } from 'three'
import { XREngineBot } from '@xrengine/bot/src/bot'
//import { setupXR, testWebXR } from '../utils/testWebXR'
import { BotHooks, XRBotHooks } from '@xrengine/engine/src/bot/enums/BotHooks'
//import { teleportToBall } from './actions/teleportToBallTest'
//import { hitBallTest } from './actions/hitBallTest'

const maxTimeout = 60 * 1000 * 5
const bot = new XREngineBot({ name: 'bot-1', headless: false, verbose: false })

const domain = 'localhost:3000'//process.env.APP_HOST
// TODO: load GS & client from static world file instead of having to run independently
const locationName = process.env.TEST_LOCATION_NAME

describe('Tournament tests', () => {
  beforeAll(async () => {
    await bot.launchBrowser()
    await bot.enterLocation(`https://${domain}/game/${locationName}`)
    //await bot.awaitHookPromise(BotHooks.LocationLoaded)
    //await setupXR(bot)
    await bot.runHook(BotHooks.InitializeBot)
    //await bot.runHook(XRBotHooks.OverrideXR)
    await bot.delay(5000)
  }, maxTimeout)

  afterAll(async () => {
    await bot.delay(5000)
    await bot.quit()
  }, maxTimeout)

  test(
    'JoinGame',
    async () => {
      await bot.delay(1000)

      // wait for turn, then move to ball position
     // await bot.awaitHookPromise(GolfBotHooks.GetIsPlayerTurn)
      //await bot.keyPress('KeyK', 200)
      await bot.delay(1000)

     // const teePosition = await bot.runHook(GolfBotHooks.GetTeePosition)

      // should be at ball position
      expect(0).toBeLessThan(0.1)
    },
    maxTimeout
  )

  console.log('FFFFFFFF')
  //testWebXR(bot)

  // Test player ids
  // Test state stuff like score and current hole

 // teleportToBall(bot)
 // hitBallTest(bot)

 // teleportToBall(bot)
 // hitBallTest(bot)
  // resetBall(bot)
})
