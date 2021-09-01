import { XREngineBot } from '../../../packages/bot/src/bot'
import { Vector3 } from 'three'
import { GolfBotHooks } from '@xrengine/client/src/pages/golf/functions/GolfBotHooks'
import { eulerToQuaternion } from '../../../packages/engine/src/common/functions/MathRandomFunctions'
import { XRBotHooks } from '../../../packages/engine/src/bot/enums/BotHooks'

const maxTimeout = 60 * 1000
const vector3 = new Vector3()

const testData = {
  'bot-1': {
    teeLastPosition: new Vector3()
  },
  'bot-2': {
    teeLastPosition: new Vector3()
  }
}

export const canOnePlayerFinishedFirstHole = (bot: XREngineBot) => {
  test(
    'checkGoalOnePlayer',
    async () => {
      await prepareCheck(bot)
      await tryMoreHit(bot)
      //TODO: check Ball and Hole positions
      expect(await check(bot)).toBeGreaterThan(1)
    },
    maxTimeout
  )
}

export const canTwoPlayerFinishedFirstHole = (bot1: XREngineBot, bot2: XREngineBot) => {
  test(
    'Can Two Player Finished First Hole (playing)',
    async () => {
      await prepareCheck(bot1)
      await prepareCheck(bot2)
      let turn = bot1.name
      await tryMoreHitTwoPlayer(bot1, bot2, turn)
      //TODO: check Ball and Hole positions
      expect(await check(bot1)).toBeGreaterThan(1)
      expect(await check(bot2)).toBeGreaterThan(1)
    },
    maxTimeout * 2 // for this test need more time
  )
}

async function tryMoreHit(bot: XREngineBot) {
  await teleportToBall(bot)
  await hitBall(bot)
  await teleportToBall(bot)
  // distanceFromLastTeeToNew its simple way to check goal with out hook to deep stuff
  // when you get bot.runHook(GolfBotHooks.GetTeePosition) and prev try result
  // you can understand when tee position change (on golf we change Tee number after goal)
  const distanceFromLastTeeToNew = await check(bot)
  if (distanceFromLastTeeToNew < 1) {
    await tryMoreHit(bot)
  }
}

async function tryMoreHitTwoPlayer(bot1: XREngineBot, bot2: XREngineBot, turn) {
  const bot = turn === bot1.name ? bot1 : bot2
  await teleportToBall(bot)
  await hitBall(bot)
  await teleportToBall(bot)
  // distanceFromLastTeeToNew its simple way to check goal with out hook to deep stuff
  // when you get bot.runHook(GolfBotHooks.GetTeePosition) and prev try result
  // you can understand when tee position change (on golf we change Tee number after goal)
  const nextTurn = turn === bot1.name ? bot2.name : bot1.name
  if ((await check(bot1)) < 1 || (await check(bot2)) < 1) {
    await tryMoreHitTwoPlayer(bot1, bot2, nextTurn)
  }
}

async function teleportToBall(bot: XREngineBot) {
  //await bot.delay(100)
  await bot.keyPress('KeyK', 200)
  //await bot.delay(300)
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

async function prepareCheck(bot: XREngineBot) {
  const newTeePosition = await bot.runHook(GolfBotHooks.GetTeePosition)
  testData[bot.name].teeLastPosition.copy(newTeePosition)
}

async function check(bot: XREngineBot) {
  const newTeePosition = await bot.runHook(GolfBotHooks.GetTeePosition)
  if (vector3.copy(testData[bot.name].teeLastPosition).sub(newTeePosition).length() < 0.01) {
    testData[bot.name].teeLastPosition.copy(newTeePosition)
  }
  return vector3.copy(testData[bot.name].teeLastPosition).sub(newTeePosition).length()
}
