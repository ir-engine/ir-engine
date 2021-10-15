import { XREngineBot } from '@xrengine/bot/src/bot'
import { BotHooks, BasketballHooks } from '@xrengine/engine/src/bot/enums/BotHooks'

const maxTimeout = 60 * 1000
const bot = new XREngineBot({ name: 'bot-1', headless: true, verbose: false })
const bot2 = new XREngineBot({ name: 'bot-2', headless: true, verbose: false })
const bot3 = new XREngineBot({ name: 'bot-3', headless: true, verbose: false })
const bot4 = new XREngineBot({ name: 'bot-4', headless: true, verbose: false })

const domain = 'localhost:3000'//process.env.APP_HOST
// TODO: load GS & client from static world file instead of having to run independently
const locationName = 'test'//process.env.TEST_LOCATION_NAME

describe('Tournament tests', () => {
  beforeAll(async () => {
    await bot.launchBrowser()
    await bot.enterLocation(`https://${domain}/tournament/${locationName}`)
    //await bot.awaitHookPromise(BotHooks.LocationLoaded)
    await bot.runHook(BotHooks.InitializeBot)

    await bot2.launchBrowser()
    await bot2.enterLocation(`https://${domain}/tournament/${locationName}`)
    //await bot.awaitHookPromise(BotHooks.LocationLoaded)
    await bot2.runHook(BotHooks.InitializeBot)

    await bot3.launchBrowser()
    await bot3.enterLocation(`https://${domain}/tournament/${locationName}`)
    //await bot.awaitHookPromise(BotHooks.LocationLoaded)
    await bot3.runHook(BotHooks.InitializeBot)

    await bot4.launchBrowser()
    await bot4.enterLocation(`https://${domain}/tournament/${locationName}`)
    //await bot.awaitHookPromise(BotHooks.LocationLoaded)
    await bot4.runHook(BotHooks.InitializeBot)
  }, maxTimeout)

  afterAll(async () => {
    await bot.delay(1000)
    await bot.quit()

    await bot2.delay(1000)
    await bot2.quit()

    await bot3.delay(1000)
    await bot3.quit()

    await bot4.delay(1000)
    await bot4.quit()
  }, maxTimeout)

  test(
    'JoinGame',
    async () => {
      await bot.delay(3000)
  //    await bot2.delay(3000)
   //   await bot3.delay(3000)
     // await bot4.delay(3000)

      const gameStateBot = await bot.runHook(BasketballHooks.UseTournamentState)
  //    const gameStateBot2 = await bot2.runHook(BasketballHooks.UseTournamentState)
   //   const gameStateBot3 = await bot3.runHook(BasketballHooks.UseTournamentState)
   //   const gameStateBot4 = await bot4.runHook(BasketballHooks.UseTournamentState)

      console.log(gameStateBot.players.length)
    //  console.log(gameStateBot2.players.length)
   //   console.log(gameStateBot3.players.length)
   //   console.log(gameStateBot4.players.length)

      expect(gameStateBot.players.length).toBe(4)
    //  expect(gameStateBot2.players.length).toBe(4)
   //   expect(gameStateBot3.players.length).toBe(4)
   //   expect(gameStateBot4.players.length).toBe(4)
    },
    maxTimeout
  )
  /*
  test(
    'FirstTournamentRound',
    async () => {
      await bot.delay(1000)
      await bot2.delay(1000)
      //await bot3.delay(1000)
      //await bot4.delay(1000)
      const gameStateBot = await bot.runHook(BasketballHooks.UseTournamentState)
  
      expect(gameStateBot.players).toBe('--- Final Results ---')
     // expect(gameStateBot.tournamentStage).toBe('--- Final Results ---')
      // wait for turn, then move to ball position
     // const gameState = await bot.awaitHookPromise(BasketballHooks.UseTournamentState)
      //await bot.keyPress('KeyK', 200)
      await bot.delay(12000)
      

      await bot2.delay(12000)
      const gameStateBot2 = await bot2.runHook(BasketballHooks.UseTournamentState)
      
      console.log(gameStateBot)
      console.log(gameStateBot2)
      // should be at ball position
      expect(gameStateBot.tournamentStage).toBe('--- Final Results ---')
    },
    maxTimeout
  )
*/

test(
  'FinalResult',
  async () => {
    await bot.delay(10000)
  //  await bot2.delay(10000)
  //  await bot3.delay(10000)
  //  await bot4.delay(10000)
    
    const gameStateBot = await bot.runHook(BasketballHooks.UseTournamentState)
    console.log(gameStateBot)
    
      expect(gameStateBot.tournamentStage).toBe('finalResults')
    },
    maxTimeout
  )
})
