const xr3ngineBot = require('./src/xr3ngine-bot');
const AgonesSDK = require('@google-cloud/agones-sdk');
const { BotAction } = require('./src/bot-action');
const BotManager = require('./src/bot-manager');

const agonesSDK = new AgonesSDK();

async function run() {
    console.log("=============Start=================");
    console.log(process.env.DOMAIN);

    const domain = process.env.DOMAIN || 'dev.theoverlay.io';
    const locationName = process.env.LOCATION_NAME || 'test';
    const fakeMediaPath = __dirname + "/resources";
    const moveDuration = 2000;
    const botManager = new BotManager({headless: true, fakeMediaPath});

    console.log(fakeMediaPath);

    botManager.addBot("bot1");
    botManager.addBot("bot2");

    botManager.addAction("bot1", BotAction.connect());
    botManager.addAction("bot1", BotAction.enterRoom(domain, locationName));
    botManager.addAction("bot1", BotAction.sendAudio(10000));
    botManager.addAction("bot1", BotAction.receiveAudio(6000));
    botManager.addAction("bot1", BotAction.delay(6000));
    botManager.addAction("bot1", BotAction.keyPress("KeyW", moveDuration));
    botManager.addAction("bot1", BotAction.keyPress("KeyD", moveDuration));
    botManager.addAction("bot1", BotAction.keyPress("KeyS", moveDuration));
    botManager.addAction("bot1", BotAction.keyPress("KeyA", moveDuration));
    botManager.addAction("bot1", BotAction.sendMessage("Hello World! This is bot1."));

    // botManager.addAction("bot2", BotAction.connect());
    // botManager.addAction("bot2", BotAction.enterRoom(domaiin, locationName));
    // botManager.addAction("bot2", BotAction.keyPress("KeyW", moveDuration));
    // botManager.addAction("bot2", BotAction.keyPress("KeyD", moveDuration));
    // botManager.addAction("bot2", BotAction.keyPress("KeyS", moveDuration));
    // botManager.addAction("bot2", BotAction.keyPress("KeyA", moveDuration));
    // botManager.addAction("bot2", BotAction.sendMessage("Hello World! This is bot2."));

    // botManager.addAction("monitor", BotAction.opIf((stats) => console.log(stats)));

    botManager.addAction("bot1", BotAction.disconnect());
    // botManager.addAction("bot2", BotAction.disconnect());

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
    
    console.log("=============End=================");
}

run();
