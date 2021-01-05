const xr3ngineBot = require('./src/xr3ngine-bot');

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
    await runDirection(bot, 'KeyW', numSeconds);
    await runDirection(bot, 'KeyD', numSeconds);
    await runDirection(bot,'KeyS', numSeconds);
    await runDirection(bot,'KeyA', numSeconds);
}

async function sendChatMessages(bot) {
    await bot.clickElementByClass('button', 'openChat');
    await bot.clickElementById('textarea', 'newMessage');
    await bot.typeMessage('Hello World! It\'s a me, LeBot!');
    await bot.clickElementByClass('button', 'sendMessage');
}

async function runBot() {
    const bot = new xr3ngineBot();
    await bot.enterRoom('https://localhost:3000/location/test', { name: 'bot1'});
    await runInCircle(bot, 2000);
    await sendChatMessages(bot);
}

runBot();