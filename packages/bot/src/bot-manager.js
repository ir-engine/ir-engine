const XR3ngineBot = require('./src/xr3ngine-bot');
const { BotActionType } = require('./src/bot-action');

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
            headless: this.options.headless, 
            autoLog: this.options.autoLog
        });

        this.bots[name] = bot;

        return bot;
    }

    addAction(botName, action) {
        this.actions.push({botName, action});
    }

    async keyPress(bot, key, numSeconds) {
        console.log('Running with key ' + key);
        const interval = setInterval(() => {
            bot.pressKey(key);
        }, 100);
        return new Promise((resolve) => setTimeout(() => {
            console.log('Clearing button press for ' + key);
            bot.releaseKey(key);
            clearInterval(interval);
            resolve()
        }, numSeconds));
    }

    async sendMessage(bot, message) {
        await bot.clickElementByClass('button', 'openChat');
        await bot.clickElementById('textarea', 'newMessage');
        await bot.typeMessage(message);
        await bot.clickElementByClass('button', 'sendMessage');
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
                    await bot.browserLaunched
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
                    await this.keyPress(bot, action.data.key, action.data.preseedTime);
                    break;

                case BotActionType.SendAudio:
                    break;

                case BotActionType.ReceiveAudio:
                    break;

                case BotActionType.InteractObject:
                    break;

                case BotActionType.SendMessage:
                    // action.data is type of MessageData
                    await this.sendMessage(action.data.message);
                    break;

                default:
                    console.error("Unknown bot action");
                    break;
            }
        }
    }
}

module.exports = BotManager;