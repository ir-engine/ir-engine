const xr3ngineBot = require('./src/xr3ngine-bot');
const AgonesSDK = require('@google-cloud/agones-sdk');
const { BotAction } = require('./src/bot-action');
const BotManager = require('./src/bot-manager');

const agonesSDK = new AgonesSDK();

async function runDirection(bot, key, numSeconds) {
    console.log('Running with key ' + key);
    const interval = setInterval(() => {bot.pressKey(key) }, 100);
    return new Promise((resolve, reject) => setTimeout(() => {
        console.log('Clearing button press for ' + key);
        bot.releaseKey(key); clearInterval(interval);
        resolve()
    }, numSeconds));
}

async function runInCircle(bot, numSeconds) {
    console.log('Running in circle');
    await runDirection(bot, 'KeyW', numSeconds);
    await runDirection(bot, 'KeyD', numSeconds);
    await runDirection(bot,'KeyS', numSeconds);
    await runDirection(bot,'KeyA', numSeconds);
}

async function sendChatMessages(bot) {
    await bot.clickElementByClass('button', 'openChat');
    await bot.clickElementById('textarea', 'newMessage');
    await bot.typeMessage('Hello World! It\'s a-me, LeBot!');
    await bot.clickElementByClass('button', 'sendMessage');
}

async function runBot() {
    try {
        if (process.env.KUBERNETES === 'true') {
            agonesSDK.connect();
            agonesSDK.ready();
            setInterval(() => {
                agonesSDK.health();
            }, 1000)
        }
        const bot = new xr3ngineBot();
        const domain = process.env.DOMAIN || 'localhost:3000';
        const locationName = process.env.LOCATION_NAME || 'test';
        await bot.enterRoom(`https://${domain}/location/${locationName}`, {name: 'bot1'});
        await runInCircle(bot, 2000);
        await sendChatMessages(bot);
        setTimeout(async () => {
            await bot.browser.close()
            process.exit(0);
        }, 3000)
    } catch(err) {
        console.log('Bot error');
        console.log(err);
        if (bot && bot.browser) bot.browser.close();
        process.exit(1);
    }
}

async function run() {
    const domain = process.env.DOMAIN || 'localhost:3000';
    const locationName = process.env.LOCATION_NAME || 'test';
    const moveDuratioon = 2000;

    const botManager = new BotManager();

    botManager.addBot("bot1");
    botManager.addBot("bot2");

    botManager.addAction("bot1", new BotAction.connect(domain));
    botManager.addAction("bot1", new BotAction.enterRoom(locationName));
    botManager.addAction("bot1", new BotAction.moveLeft(moveDuratioon));
    botManager.addAction("bot1", new BotAction.moveForward(moveDuratioon));
    botManager.addAction("bot1", new BotAction.moveRight(moveDuratioon));
    botManager.addAction("bot1", new BotAction.moveBackward(moveDuratioon));
    botManager.addAction("bot1", new BotAction.sendMessage("Hello World! This is bot1."));

    botManager.addAction("bot2", new BotAction.connect(domain));
    botManager.addAction("bot2", new BotAction.enterRoom(locationName));
    botManager.addAction("bot2", new BotAction.moveLeft(moveDuratioon));
    botManager.addAction("bot2", new BotAction.moveForward(moveDuratioon));
    botManager.addAction("bot2", new BotAction.moveRight(moveDuratioon));
    botManager.addAction("bot2", new BotAction.moveBackward(moveDuratioon));
    botManager.addAction("bot2", new BotAction.sendMessage("Hello World! This is bot2."));

    botManager.addAction("monitor", new BotAction.monitor((stats) => console.log(stats)));

    botManager.addAction("bot1", new BotAction.disconnect());
    botManager.addAction("bot2", new BotAction.disconnect());
}


runBot();