import { Vector3 } from 'three'
import { XREngineBot } from '@xrengine/bot'
import { BotHooks } from '@xrengine/engine/src/bot/enums/BotHooks'

const maxTimeout = 60 * 1000
const bot = new XREngineBot({ name: 'bot-1', verbose: true })
const vector3 = new Vector3()

const domain = process.env.APP_HOST
const locationName = 'test'
const sqrt2 = Math.sqrt(2)

describe('My Bot Tests', () => {

  beforeAll(async () => {
    await bot.launchBrowser()
    await bot.enterLocation(`https://${domain}/location/${locationName}`)
    await bot.awaitHookPromise(BotHooks.LocationLoaded)
    await bot.runHook(BotHooks.InitializeBot)
    await bot.delay(1000)
  }, 2 * maxTimeout)

  afterAll(async () => {
    await bot.delay(1500)
    await bot.quit()
  }, maxTimeout)

  test('Can spawn in the world', async () =>{
    await bot.delay(1000)
    const pos = await bot.runHook(BotHooks.GetPlayerPosition)
    expect(
      vector3.copy(pos).length()
    ).toBeLessThan(sqrt2 * 2) // sqrt2 * 2 is the default size of our spawn area
  })

})



describe.skip('Multi-Bot Tests', () => { 

  const bots = [] as Array<XREngineBot>

  async function addBot() {
    const bot = new XREngineBot({ name: `bot-${bots.length}`, verbose: true })
    bots.push(bot)
    await bot.launchBrowser()
    await bot.enterLocation(`https://${domain}/location/${locationName}`)
    await bot.awaitHookPromise(BotHooks.LocationLoaded)
    await bot.runHook(BotHooks.InitializeBot)
    await bot.delay(1000)
    return bot
  }

  afterAll(async () => {
    console.log("AFTER ALL")
    for (const b of bots) {
      await bot.delay(1500)
      await b.quit()
    }
  }, maxTimeout)

  // skip for now, as loading multiple uses seems to overload github actions and the test fails
  test('Can connect multiple players', async () => {
    const numPlayers = 3
    const addedBots = [] as Promise<XREngineBot>[]
    for (let i = 0; i < numPlayers; i++) addedBots.push(addBot())
    await Promise.all(addedBots)
    const bot = bots[0]
    const clients = await bot.runHook(BotHooks.GetClients)
    console.log(JSON.stringify(clients))
    const clientIds = Object.keys(clients)
    expect(clientIds.length).toEqual(numPlayers)
  }, 5 * maxTimeout)

  // test('Can disconnect players', async () => {
  //   await bot.delay(1000)
  //   await bot.quit()

  //   const bot2 = new XREngineBot({ name: 'bot-2', verbose: true })
  //   await bot2.launchBrowser()
  //   await bot2.enterLocation(`https://${domain}/location/${locationName}`)
  //   await bot2.awaitHookPromise(BotHooks.LocationLoaded)
  //   await bot2.runHook(BotHooks.InitializeBot)

  //   expect(
  //     vector3.copy(await bot.runHook(BotHooks.GetPlayerPosition)).length()
  //   ).toBeLessThan(sqrt2 * 2) // sqrt2 * 2 is the default size of our spawn area
  // })
})