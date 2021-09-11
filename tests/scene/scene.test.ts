import { Vector3 } from 'three'
import { XREngineBot } from '@xrengine/bot'
import { BotHooks } from '@xrengine/engine/src/bot/enums/BotHooks'

const maxTimeout = 60 * 1000
const bot = new XREngineBot({ name: 'bot-1', verbose: true })

const domain = process.env.APP_HOST

console.log('process.env.HEADLESS', process.env.HEADLESS)


describe('creating scene', () => {
    beforeAll(async () => {
      await bot.launchBrowser()
      await bot.navigate(`https://${domain}/editor/projects`)
      console.log("exicutng tests");
      await bot.createLoaction();
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>exicuted tests");
      await bot.delay(1000)
      await bot.runHook(BotHooks.InitializeBot)
    }, 2 * maxTimeout)

    afterAll(async () => {
      await bot.delay(1500)
      await bot.quit()
    }, maxTimeout)

    test('Creating Scene Location', async () =>{
      await bot.delay(1000)
    })
})

