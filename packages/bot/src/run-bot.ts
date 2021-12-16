/*import AgonesSDK from '@google-cloud/agones-sdk'
import { BotAction } from './bot-action'
import { BotManager } from './bot-manager'

async function run() {
  const agonesSDK = new AgonesSDK()

  ;(globalThis as any).requestAnimationFrame = requestAnimationFrameOnServer
  const expectedServerDelta = 1000 / 60
  let lastTime = 0
  function requestAnimationFrameOnServer(f) {
    const serverLoop = () => {
      const now = Date.now()
      if (now - lastTime >= expectedServerDelta) {
        lastTime = now
        f(now)
      } else {
        setImmediate(serverLoop)
      }
    }
    serverLoop()
  }
  const domain = process.env.DOMAIN || 'localhost:3000'
  const locationName = process.env.LOCATION_NAME || 'test'
  const fakeMediaPath = __dirname + '/resources'
  const moveDuration = 2000
  const botManager = new BotManager({ headless: true, fakeMediaPath })

  console.log(domain, locationName, fakeMediaPath, botManager)

  console.log(fakeMediaPath)

  botManager.addBot('bot1')
  botManager.addBot('bot2')

  botManager.addAction('bot1', BotAction.delay(1000))
  botManager.addAction('bot1', BotAction.connect())
  botManager.addAction('bot1', BotAction.enterRoom(domain, locationName))
  botManager.addAction('bot1', BotAction.delay(1000))
  botManager.addAction('bot1', BotAction.sendAudio(0))
  botManager.addAction('bot1', BotAction.sendVideo(0))
  // botManager.addAction("bot1", BotAction.receiveAudio(60000));
  botManager.addAction('bot1', BotAction.keyPress('KeyW', moveDuration))
  botManager.addAction('bot1', BotAction.keyPress('KeyD', moveDuration))
  botManager.addAction('bot1', BotAction.keyPress('KeyS', moveDuration))
  botManager.addAction('bot1', BotAction.keyPress('KeyA', moveDuration))
  botManager.addAction('bot1', BotAction.sendMessage('Hello World! This is bot1.'))
  botManager.addAction('bot1', BotAction.sendMessage('/move 0.1,0.1,0.1'))

  // botManager.addAction("bot2", BotAction.connect());
  // botManager.addAction("bot2", BotAction.enterRoom(domaiin, locationName));
  // botManager.addAction("bot2", BotAction.keyPress("KeyW", moveDuration));
  // botManager.addAction("bot2", BotAction.keyPress("KeyD", moveDuration));
  // botManager.addAction("bot2", BotAction.keyPress("KeyS", moveDuration));
  // botManager.addAction("bot2", BotAction.keyPress("KeyA", moveDuration));
  // botManager.addAction("bot2", BotAction.sendMessage("Hello World! This is bot2."));

  // botManager.addAction("monitor", BotAction.opIf((stats) => console.log(stats)));

  botManager.addAction('bot1', BotAction.delay(1000))
  botManager.addAction('bot1', BotAction.disconnect())
  // botManager.addAction("bot2", BotAction.disconnect());

  try {
    if (process.env.KUBERNETES === 'true') {
      agonesSDK.connect()
      agonesSDK.ready()
      setInterval(() => {
        agonesSDK.health()
      }, 1000)
    }

    await botManager.run()

    if (process.env.KUBERNETES === 'true') {
      await agonesSDK.shutdown()
    }
  } catch (e) {
    console.error(e)

    await botManager.clear()
    if (process.env.KUBERNETES === 'true') {
      await agonesSDK.shutdown()
    }
    process.exit(1)
  }

  console.log('=============End=================')
}
run()
*/
