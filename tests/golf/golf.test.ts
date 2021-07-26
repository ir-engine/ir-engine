import { Vector3, Quaternion } from 'three'
import { XREngineBot } from '@xrengine/bot'
import { setupXR, testWebXR } from '../utils/testWebXR'
import { BotHooks, XRBotHooks } from '@xrengine/engine/src/bot/enums/BotHooks'
import { GolfBotHooks } from '@xrengine/engine/src/bot/enums/GolfBotHooks'
import { eulerToQuaternion } from '@xrengine/engine/src/common/functions/MathRandomFunctions'

const maxTimeout = 60 * 1000
const bot = new XREngineBot({ name: 'bot-1', headless: false, autoLog: false })

const domain = process.env.APP_HOST
// TODO: load GS & client from static world file instead of having to run independently
const locationName = 'golf'

const sqrt2 = Math.sqrt(2)
const spawnPos = new Vector3(-1, 8.5, 15.5)
const vector3 = new Vector3()

describe('Golf tests', () => {

  beforeAll(async () => {
    await bot.launchBrowser()
    await bot.enterLocation(`https://${domain}/golf/${locationName}`)
    await bot.awaitHookPromise(BotHooks.LocationLoaded)
    await setupXR(bot)
    await bot.runHook(BotHooks.InitializeBot)
    await bot.awaitHookPromise(GolfBotHooks.GetIsYourTurn)
    await bot.runHook(XRBotHooks.OverrideXR)
  }, maxTimeout)

  afterAll(async () => {
    await bot.delay(1000)
    await bot.quit()
  }, maxTimeout)

  testWebXR(bot)

  test('Can teleport to ball', async () => {
    // should be at spawn position
    expect(
      vector3.copy(await bot.runHook(BotHooks.GetPlayerPosition)).sub(spawnPos).length()
    ).toBeLessThan(sqrt2 * 2) // sqrt2 * 2 is the size of our spawn area

    // wait for turn, then move to ball position
    await bot.awaitHookPromise(GolfBotHooks.GetIsYourTurn)
    await bot.keyPress('KeyK', 200)
    await bot.delay(1000)

    const teePosition = await bot.runHook(GolfBotHooks.GetTeePosition)

    // should be at ball position
    expect(
      vector3.copy(await bot.runHook(BotHooks.GetPlayerPosition)).sub(teePosition).length()
    ).toBeLessThan(0.1)

  }, maxTimeout)

  test('Can hit ball', async () => {

    await bot.runHook(XRBotHooks.UpdateHead, {
      position: [0, 2, 1],
      rotation: eulerToQuaternion(-1.25, 0, 0).toArray()
    })
    await bot.delay(1000)

    const teePosition = await bot.runHook(GolfBotHooks.GetTeePosition)
    const holePosition = await bot.runHook(GolfBotHooks.GetHolePosition)
    console.log(teePosition.x, teePosition.y, teePosition.z)
    console.log(holePosition.x, holePosition.y, holePosition.z)
    const angle = new Vector3().copy(teePosition).setY(0).normalize().angleTo(new Vector3().copy(holePosition).setY(0).normalize()) + 90
    console.log(angle)
    console.log('====================================')
    await bot.runHook(BotHooks.RotatePlayer, { angle })

    // rotate such that hit direction is in line with the hole

    await bot.awaitHookPromise(GolfBotHooks.GetIsYourTurn)
  
    // ball should be at spawn position
    expect(
      vector3.copy(await bot.runHook(GolfBotHooks.GetBallPosition)).sub(teePosition).length()
    ).toBeLessThan(0.1)
    
    await bot.delay(1000)
    // wait for turn, then move to ball position
    await bot.awaitHookPromise(GolfBotHooks.GetIsYourTurn)
    
    await bot.delay(500)

    // rotate left thumbstick 3 or 4 times to the left

    await bot.runHook(GolfBotHooks.SwingClub)
   
    await bot.delay(3000)
    expect(
      vector3.copy(await bot.runHook(GolfBotHooks.GetBallPosition)).sub(teePosition).length()
    ).toBeGreaterThan(0.5)
    await bot.delay(1000)
  }, maxTimeout)

  // 

})



/**
 * TESTS TO ADD
 * 
 * NETWORKING
 * 
 * can rejoin successfully
 * 
 */