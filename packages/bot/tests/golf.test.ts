import XREngineBot from '@xrengine/bot/src/bot';

const maxTimeout = 60 * 1000

const bot = new XREngineBot()

const botName = 'bot-1'
const domain = '192.168.0.16:3000'
const locationName = 'golf'


describe('Golf tests', () => {

  beforeAll(async () => {
    await bot.launchBrowser()
    await bot.enterRoom(`https://${domain}/location/${locationName}`, { name: botName })
  })

  afterAll(async () => {
    await bot.delay(3000)
    await bot.quit()
  })

  test('Engine initialised', async () => {
    const result = await bot.evaluate(async () => {
      return globalThis.Engine.isInitialized;
    })
    expect(result).toBe(true)
  }, maxTimeout)
  
  // test('Engine initialised', async () => {
  //   const result = await bot.evaluate(async () => {
  //     return globalThis.Engine.isInitialized;
  //   })
  //   expect(result).toBe(true)
  // }, maxTimeout)
  
})