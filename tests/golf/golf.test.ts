import { Vector3 } from 'three'
import { XREngineBot } from '@xrengine/bot'
import { setupXR, testWebXR } from '../utils/testWebXR'
import { BotHooks, XRBotHooks } from '@xrengine/engine/src/bot/enums/BotHooks'
import { GolfBotHooks } from '../../packages/engine/src/game/templates/Golf/functions/GolfBotHooks'
import { eulerToQuaternion } from '@xrengine/engine/src/common/functions/MathRandomFunctions'

const maxTimeout = 60 * 1000
const bot = new XREngineBot({ name: 'bot-1', headless: false, autoLog: false })

const domain = process.env.APP_HOST
// TODO: load GS & client from static world file instead of having to run independently
const locationName = process.env.TEST_LOCATION_NAME

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












  test('Can teleport to Tee', async () => {
    await bot.delay(1000)

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

    // rotate such that hit direction is in line with the hole
    const teePosition = await bot.runHook(GolfBotHooks.GetTeePosition)
    const holePosition = await bot.runHook(GolfBotHooks.GetHolePosition)
    const angle = new Vector3().copy(teePosition).setY(0).normalize().angleTo(new Vector3().copy(holePosition).setY(0).normalize()) + 90
    await bot.runHook(BotHooks.RotatePlayer, { angle })

    await bot.awaitHookPromise(GolfBotHooks.GetIsYourTurn)
    await bot.delay(2000)
    await bot.awaitHookPromise(GolfBotHooks.GetIsBallStopped)
    // ball should be at spawn position
    expect(
      vector3.copy(await bot.runHook(GolfBotHooks.GetBallPosition)).sub(teePosition).length()
    ).toBeLessThan(0.1)
    
    await bot.delay(1000)
    
    await bot.runHook(GolfBotHooks.SwingClub)
    await bot.delay(1000)
    await bot.awaitHookPromise(GolfBotHooks.GetIsBallStopped)
    expect(
      vector3.copy(await bot.runHook(GolfBotHooks.GetBallPosition)).sub(teePosition).length()
    ).toBeGreaterThan(0.5)
    await bot.delay(1000)
  }, maxTimeout)
  // 

  test('ball moved forward, if faild, force server + value, client - value', async () => {
    await bot.delay(1000)
    // rotate such that hit direction is in line with the hole
    const teePosition = await bot.runHook(GolfBotHooks.GetTeePosition)
    expect(
      vector3.copy(await bot.runHook(GolfBotHooks.GetBallPosition)).sub(teePosition).z
    ).toBeLessThan(-0.5)
    await bot.delay(1000)
  }, maxTimeout)




  test('Can reset ball on out of course', async () => {
    const teePosition = await bot.runHook(GolfBotHooks.GetTeePosition)

    await bot.delay(1000)
    await bot.awaitHookPromise(GolfBotHooks.GetIsBallStopped)
    await bot.delay(1000)
    await bot.keyPress('KeyB', 200)
    await bot.delay(1000)
    await bot.awaitHookPromise(GolfBotHooks.GetIsBallStopped)
    await bot.delay(1000)

    expect(
      vector3.copy(await bot.runHook(GolfBotHooks.GetBallPosition)).sub(teePosition).length()
    ).toBeLessThan(0.1)

  }, maxTimeout)


  test('Can get Hit ', async () => {


    await bot.awaitHookPromise(GolfBotHooks.GetIsYourTurn)
    // ball should be at spawn position
    expect(
      vector3.copy(await bot.runHook(BotHooks.GetPlayerPosition)).sub(await bot.runHook(GolfBotHooks.GetBallPosition)).length()
    ).toBeLessThan(0.5)
    await bot.awaitHookPromise(GolfBotHooks.GetIsBallStopped)
    await bot.delay(1000)
    await bot.runHook(GolfBotHooks.SwingClub)
    await bot.delay(1000)
    await bot.awaitHookPromise(GolfBotHooks.GetIsBallStopped)

    expect(
      vector3.copy(await bot.runHook(BotHooks.GetPlayerPosition)).sub(await bot.runHook(GolfBotHooks.GetBallPosition)).length()
    ).toBeGreaterThan(0.5)

    await bot.delay(1000)

  }, maxTimeout)


  test('Can teleport to ball', async () => {
    await bot.delay(1000)

    // wait for turn, then move to ball position
    await bot.awaitHookPromise(GolfBotHooks.GetIsYourTurn)
    await bot.keyPress('KeyK', 200)
    await bot.delay(1000)
    const ballPosition = await bot.runHook(GolfBotHooks.GetBallPosition)
    await bot.runHook(XRBotHooks.UpdateHead, {
      position: [ballPosition.x, 2, 1],
      rotation: eulerToQuaternion(-1.25, 0, 0).toArray()
    })

    // should be at ball position
    expect(
      vector3.copy(await bot.runHook(BotHooks.GetPlayerPosition)).sub(ballPosition).length()
    ).toBeLessThan(0.1)

  }, maxTimeout)


  test('Can get Hit ', async () => {


    await bot.awaitHookPromise(GolfBotHooks.GetIsYourTurn)
    // ball should be at spawn position
    expect(
      vector3.copy(await bot.runHook(BotHooks.GetPlayerPosition)).sub(await bot.runHook(GolfBotHooks.GetBallPosition)).length()
    ).toBeLessThan(0.5)
    
    await bot.delay(1000)
    await bot.runHook(GolfBotHooks.SwingClub)
    await bot.delay(1000)
    await bot.awaitHookPromise(GolfBotHooks.GetIsBallStopped)

    expect(
      vector3.copy(await bot.runHook(BotHooks.GetPlayerPosition)).sub(await bot.runHook(GolfBotHooks.GetBallPosition)).length()
    ).toBeGreaterThan(0.5)

    await bot.delay(1000)

  }, maxTimeout)


  
/*

  
  test('Can teleport to ball', async () => {
    await bot.delay(1000)

    // wait for turn, then move to ball position
    await bot.awaitHookPromise(GolfBotHooks.GetIsYourTurn)
    await bot.keyPress('KeyK', 200)
    await bot.delay(1000)
    const ballPosition = await bot.runHook(GolfBotHooks.GetBallPosition)
    await bot.runHook(XRBotHooks.UpdateHead, {
      position: [ballPosition.x, 2, 1],
      rotation: eulerToQuaternion(-1.25, 0, 0).toArray()
    })

    // should be at ball position
    expect(
      vector3.copy(await bot.runHook(BotHooks.GetPlayerPosition)).sub(ballPosition).length()
    ).toBeLessThan(0.1)

  }, maxTimeout)





  test('Can get Hit and get Goal', async () => {


    await bot.awaitHookPromise(GolfBotHooks.GetIsYourTurn)
    // ball should be at spawn position
    expect(
      vector3.copy(await bot.runHook(BotHooks.GetPlayerPosition)).sub(await bot.runHook(GolfBotHooks.GetBallPosition)).length()
    ).toBeLessThan(0.5)
    
    await bot.delay(1000)
    await bot.runHook(GolfBotHooks.SwingClub)
    await bot.delay(1000)
    
    expect(
      vector3.copy(await bot.runHook(BotHooks.GetPlayerPosition)).sub(await bot.runHook(GolfBotHooks.GetBallPosition)).length()
    ).toBeGreaterThan(0.1)

    await bot.delay(1000)

  }, maxTimeout)





  test('teleport to 2-st hole after Goal', async () => {

    await bot.delay(1000)
    await bot.awaitHookPromise(GolfBotHooks.GetIsBallStopped)

    expect(
      vector3.copy(await bot.runHook(BotHooks.GetPlayerPosition)).sub(await bot.runHook(GolfBotHooks.GetTeePosition)).length()
    ).toBeLessThan(0.5)
  }, maxTimeout)

  */
})



/**
 * TESTS TO ADD
 * 
 * NETWORKING
 * 
 * can rejoin successfully
 * 
 */