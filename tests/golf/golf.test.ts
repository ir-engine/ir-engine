import { Vector3 } from 'three'
import { XREngineBot } from '@xrengine/bot'
import { setupXR, testWebXR } from '../utils/testWebXR'
import { BotHooks, XRBotHooks } from '@xrengine/engine/src/bot/enums/BotHooks'
import { teleportOnSpawn, teleportToBall } from './actions/teleportToBallTest'
import { checkGoal, headUpdateTest, hitBallTest } from './actions/hitBallTest'
import { resetBall } from './actions/resetBallTest'

const testdata = { 
  'bot-1': { 
    teeLastPosition: new Vector3()
  },
  'bot-2': { 
    teeLastPosition: new Vector3()
  } 
}

const maxTimeout = 60 * 1000
const bot = new XREngineBot({ name: 'bot-1', headless: false, autoLog: false })
const bot2 = new XREngineBot({ name: 'bot-2', headless: false, autoLog: false })

const domain = process.env.APP_HOST
// TODO: load GS & client from static world file instead of having to run independently
const locationName = process.env.TEST_LOCATION_NAME

const vector3 = new Vector3()

describe('Golf tests', () => {
chrome://version/
  beforeAll(async () => {
    await bot.launchBrowser()
    await bot.enterLocation(`https://${domain}/golf/${locationName}`)
    await bot.awaitHookPromise(BotHooks.LocationLoaded)
    await bot.delay(3000)
    await setupXR(bot)
    await bot.runHook(BotHooks.InitializeBot)
    //await bot.runHook(XRBotHooks.OverrideXR)

    await bot2.launchBrowser()
    await bot2.enterLocation(`https://${domain}/golf/${locationName}`)
    await bot2.awaitHookPromise(BotHooks.LocationLoaded)
    await bot2.delay(3000)
    await setupXR(bot2)
    await bot2.runHook(BotHooks.InitializeBot)
    //await bot2.runHook(XRBotHooks.OverrideXR)
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

    // Test player ids
  // Test state stuff like score and current hole

  hitBallTest(bot)
  teleportOnSpawn(bot, 'KeyJ')

  teleportToBall(bot2)
  hitBallTest(bot2)
  teleportOnSpawn(bot2, 'KeyM')


  checkGoal(bot, testdata)
  checkGoal(bot2, testdata)

  for (let count = 0; count < 16; count++) {
    if (count%2) {
      teleportToBall(bot)
      hitBallTest(bot)
      teleportOnSpawn(bot, 'KeyJ')
    } else {

    teleportToBall(bot2)
    hitBallTest(bot2)
    teleportOnSpawn(bot2, 'KeyM')
    }
    
  }
  checkGoal(bot, testdata)
  checkGoal(bot2, testdata)
  // resetBall(bot)
  // resetBall(bot)

})
