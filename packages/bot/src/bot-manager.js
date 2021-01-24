const XR3ngineBot = require('./xr3ngine-bot');
const { BotActionType } = require('./bot-action');
class BotManager {
    /**
     * BotManager constructor
     * @param options: 
     *      - headless
     *      - autoLog
     *      - onError
     */
    constructor(options = {}) {
        this.bots = {};
        this.actions = [];
        this.options = options;
    }

    findBotByName(name) {
        return this.bots[name];
    }

    addBot(name) {
        const foundBot = this.findBotByName(name)
        if (foundBot) {
            return foundBot;
        }

        const bot = new XR3ngineBot({
            name, 
            ...this.options
        });

        this.bots[name] = bot;

        return bot;
    }

    addAction(botName, action) {
        this.actions.push({botName, action});
    }

    async keyPress(bot, key, numMiliSeconds) {
        console.log('Running with key ' + key);
        await bot.setFocus('canvas');
        const interval = setInterval(() => {
            bot.pressKey(key);
        }, 100);
        return new Promise((resolve) => setTimeout(() => {
            console.log('Clearing button press for ' + key, numMiliSeconds);
            bot.releaseKey(key);
            clearInterval(interval);
            resolve()
        }, numMiliSeconds));
    }

    async sendMessage(bot, message) {
        await bot.clickElementByClass('button', 'openChat');
        await bot.clickElementById('input', 'newMessage');
        await bot.typeMessage(message);
        await bot.clickElementByClass('button', 'sendMessage');
    }

    async sendAudio(bot, duration) {
        console.log("Sending audio...");
        await bot.clickElementById('svg', 'micOff');
        await bot.waitForTimeout(duration);
    }

    async stopAudio(bot) {
        console.log("Stop audio...");
        await bot.clickElementById('svg', 'micOn');
    }

    async recvAudio(bot, duration) {
        console.log("Receiving audio...");
        await bot.waitForSelector('[class*=PartyParticipantWindow]', duration);
    }

    async sendVideo(bot, duration) {
        console.log("Sending video...");
        await bot.clickElementById('svg', 'videoOff');
        await bot.waitForTimeout(duration);
    }

    async stopVideo(bot) {
        console.log("Stop video...");
        await bot.clickElementById('svg', 'videoOn');
    }

    async recvVideo(bot, duration) {
        console.log("Receiving video...");
        await bot.waitForSelector('[class*=PartyParticipantWindow]', duration);
    }

    async delay(bot, timeout) {
        console.log(`Waiting for ${timeout} ms... `);
        await bot.waitForTimeout(timeout);
    }

    async interactObject() {

    }

    async run() {
        for (const botAction of this.actions) {
            const {botName, action} = botAction;
            const bot = this.findBotByName(botName);

            if (!bot) {
                console.error("Invalid bot name", botName);
                continue;
            }

            switch (action.type) {
                case BotActionType.Connect:
                    await bot.launchBrowser();
                    break;

                case BotActionType.Disconnect:
                    bot.quit();
                    break;

                case BotActionType.EnterRoom:
                    // action.data is type of EnterRoomData.
                    await bot.enterRoom(`https://${action.data.domain}/location/${action.data.locationName}`, {name: botName});
                    break;

                case BotActionType.LeaveRoom:
                    // action.data is type of EnterRoomData.
                    await bot.navigate(`https://${action.data.domain}/location/${action.data.locationName}`)
                    break;

                case BotActionType.KeyPress:
                    // action.data is type of KeyEventData
                    await this.keyPress(bot, action.data.key, action.data.pressedTime);
                    break;

                case BotActionType.SendAudio:
                    await this.sendAudio(bot, action.data.duration);
                    break;

                case BotActionType.StopAudio:
                    await this.stopAudio(bot);
                    break;

                case BotActionType.ReceiveAudio:
                    await this.recvAudio(bot, action.data.duration);
                    break;

                case BotActionType.SendVideo:
                    await this.sendVideo(bot, action.data.duration);
                    break;

                case BotActionType.StopVideo:
                    await this.stopVideo(bot);
                    break;

                case BotActionType.ReceiveVideo:
                    await this.recvVideo(bot, action.data.duration);
                    break;

                case BotActionType.InteractObject:
                    await this.interactObject();
                    break;

                case BotActionType.SendMessage:
                    // action.data is type of MessageData
                    await this.sendMessage(bot, action.data.message);
                    break;

                case BotActionType.Delay:
                    await this.delay(bot, action.data.timeout);
                    break;
                default:
                    console.error("Unknown bot action");
                    break;
            }
        }
    }

    async clear() {
        const bots = Object.values(this.bots);
        for (const bot of bots) {
            bot.quit();
        }

        this.bots = {};
    }
}

module.exports = BotManager;