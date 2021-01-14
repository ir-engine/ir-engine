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
                    await bot.EnterRoom(ac)
                    break;

                case BotActionType.LeaveRoom:
                    break;

                case BotActionType.MoveLeft:
                    break;

                case BotActionType.MoveRight:
                    break;

                case BotActionType.MoveForward:
                    break;

                case BotActionType.MoveBackward:
                    break;

                case BotActionType.SendAudio:
                    break;

                case BotActionType.ReceiveAudio:
                    break;

                case BotActionType.InteractObject:
                    break;

                case BotActionType.SendMessage:
                    break;

                default:
                    console.error("Unknown bot action");
                    break;
            }
        }
    }
}

module.exports = BotManager;