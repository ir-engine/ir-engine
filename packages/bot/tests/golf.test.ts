import XREngineBot from '@xrengine/bot/src/bot';

const maxTimeout = 60 * 1000

const bot = new XREngineBot()

const botName = 'bot-1'
const domain = '192.168.0.16:3000'
const locationName = 'golf'

const run = async () => {
  await bot.launchBrowser()
  await bot.enterRoom(`https://${domain}/location/${locationName}`, { name: botName })
  const result = await bot.evaluate(async () => {
    return globalThis.Engine.isInitialized;
  })
  await bot.delay(3000)
  await bot.quit()
  return result;
}

test('Loads Engine', async () => {
  expect(await run()).toBe(true)
}, maxTimeout)
