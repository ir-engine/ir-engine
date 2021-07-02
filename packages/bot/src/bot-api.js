const configureNodeContext = () => {
  // polyfill animation frame for node
  globalThis.requestAnimationFrame = requestAnimationFrameOnServer;
  const expectedServerDelta = 1000 / 60;
  let lastTime = 0;
  function requestAnimationFrameOnServer(f) {
    const serverLoop = () => {
      const now = Date.now();
      if (now - lastTime >= expectedServerDelta) {
        lastTime = now;
        f(now);
      } else {
        setImmediate(serverLoop);
      }
    }
    serverLoop()
  }

  // add more

}

const setupBots = () => {
  const BotManager = require('./bot-manager');
  const fakeMediaPath = __dirname + "/resources";
  return new BotManager({ headless: true, fakeMediaPath });
}

const runBots = async (botManager) => {
  const AgonesSDK = require('@google-cloud/agones-sdk');
  const agonesSDK = new AgonesSDK();

  try {
    if (process.env.KUBERNETES === 'true') {
      agonesSDK.connect();
      agonesSDK.ready();
      setInterval(() => {
        agonesSDK.health();
      }, 1000)
    }

    await botManager.run();

    if (process.env.KUBERNETES === 'true') {
      await agonesSDK.shutdown();
    }
  }
  catch (e) {
    console.error(e);

    await botManager.clear();
    if (process.env.KUBERNETES === 'true') {
      await agonesSDK.shutdown();
    }
    process.exit(1);
  }
}

const { BotAction } = require('./bot-action');

module.exports = {
  configureNodeContext,
  BotAction,
  setupBots,
  runBots
}