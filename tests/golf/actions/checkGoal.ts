import { XREngineBot } from '../../../packages/bot/src/bot'
import { Vector3 } from 'three'
import { GolfBotHooks } from '@xrengine/client/src/pages/golf/functions/GolfBotHooks'
import { eulerToQuaternion } from '../../../packages/engine/src/common/functions/MathRandomFunctions'
import { XRBotHooks } from '../../../packages/engine/src/bot/enums/BotHooks'

const maxTimeout = 60 * 1000
const vector3 = new Vector3()

export const checkGoalOnePlayer = (bot: XREngineBot, testdata) => {
  test(
    'checkGoalOnePlayer',
    async () => {
      await prepareCheck(bot, testdata)
      await tryMoreHit(bot, testdata)
      //TODO: check Ball and Hole positions
      expect(await check(bot, testdata)).toBeGreaterThan(1)
    },
    maxTimeout
  )
}

export const checkGoalTwoPlayers = (bot1: XREngineBot, bot2: XREngineBot, testdata) => {
  test(
    'checkGoalTwoPlayers', //  + bot.name
    async () => {
      await prepareCheck(bot1, testdata)
      await prepareCheck(bot2, testdata)
      let turn = bot1.name
      await tryMoreHitTwoPlayer(bot1, bot2, turn, testdata)
      //TODO: check Ball and Hole positions
      expect(2).toBeGreaterThan(1)
    },
    maxTimeout
  )
}

async function tryMoreHit(bot: XREngineBot, testdata) {
  await teleportToBallOrStepBack(bot, 'KeyK')
  await hitBall(bot)
  await teleportToBallOrStepBack(bot, 'KeyJ')
  // distanceFromLastTeeToNew its simple way to check goal with out hook to deep stuff
  // when you get bot.runHook(GolfBotHooks.GetTeePosition) and prev try result
  // you can understand when tee position change (on golf we change Tee number after goal)
  const distanceFromLastTeeToNew = await check(bot, testdata)
  if (distanceFromLastTeeToNew < 1) {
    await tryMoreHit(bot, testdata)
  }
}

async function tryMoreHitTwoPlayer(bot1: XREngineBot, bot2: XREngineBot, turn, testdata) {
  const bot = turn === bot1.name ? bot1 : bot2
  const pressKeyToStepBack = turn === bot1.name ? 'KeyJ' : 'KeyM'
  await teleportToBallOrStepBack(bot, 'KeyK')
  await hitBall(bot)
  await teleportToBallOrStepBack(bot, pressKeyToStepBack)
  // distanceFromLastTeeToNew its simple way to check goal with out hook to deep stuff
  // when you get bot.runHook(GolfBotHooks.GetTeePosition) and prev try result
  // you can understand when tee position change (on golf we change Tee number after goal)
  const distanceFromLastTeeToNew = await check(bot, testdata)
  const nextTurn = turn === bot1.name ? bot2.name : bot1.name
  if (distanceFromLastTeeToNew < 1) {
    await tryMoreHitTwoPlayer(bot1, bot2, nextTurn, testdata)
  }
}

async function teleportToBallOrStepBack(bot: XREngineBot, keyPress) {
  await bot.delay(100)
  await bot.keyPress(keyPress, 200)
  await bot.delay(300)

  const ballPosition = await bot.runHook(GolfBotHooks.GetBallPosition)

  await bot.runHook(XRBotHooks.UpdateHead, {
    position: [ballPosition.x - 1, 2, ballPosition.z],
    rotation: eulerToQuaternion(-1.25, 0, 0).toArray()
  })
}

async function hitBall(bot: XREngineBot) {
  await bot.keyPress('KeyL', 200)
  await bot.delay(3000)
}

async function prepareCheck(bot: XREngineBot, testdata) {
  const newTeePosition = await bot.runHook(GolfBotHooks.GetTeePosition)
  testdata[bot.name].teeLastPosition.copy(newTeePosition)
}

async function check(bot: XREngineBot, testdata) {
  const newTeePosition = await bot.runHook(GolfBotHooks.GetTeePosition)
  if (vector3.copy(testdata[bot.name].teeLastPosition).sub(newTeePosition).length() < 0.01) {
    testdata[bot.name].teeLastPosition.copy(newTeePosition)
  }
  return vector3.copy(testdata[bot.name].teeLastPosition).sub(newTeePosition).length()
}
