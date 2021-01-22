const XR3ngineBot = require('./xr3ngine-bot');
const { BotActionType } = require('./bot-action');
const mediaFaker = require('./media-faker');

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

    async sendAudio(bot) {
        await bot.clickElementById('svg', 'micOff');
        // const {
        //     id,
        //     iceParameters,
        //     iceCandidates,
        //     dtlsParameters,
        //     sctpParameters
        // } = mediaFaker.generateTransportRemoteParameters();
    
        // const device = new Device({ handlerFactory: FakeHandler.createFactory(mediaFaker) });
        // sendTransport = device.createSendTransport(
        //     {
        //         id,
        //         iceParameters,
        //         iceCandidates,
        //         dtlsParameters,
        //         sctpParameters,
        //         appData : { baz: 'BAZ' }
        //     });

    
        // expect(sendTransport.id).toBe(id);
        // expect(sendTransport.closed).toBe(false);
        // expect(sendTransport.direction).toBe('send');
        // expect(sendTransport.handler).toBeType('object');
        // expect(sendTransport.handler instanceof FakeHandler).toBe(true);
        // expect(sendTransport.connectionState).toBe('new');
        // expect(sendTransport.appData).toEqual({ baz: 'BAZ' }, 500);
    }

    async recvAudio() {

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
                    await this.sendAudio(bot);
                    break;

                case BotActionType.ReceiveAudio:
                    await this.recvAudio();
                    break;

                case BotActionType.InteractObject:
                    await this.interactObject();
                    break;

                case BotActionType.SendMessage:
                    // action.data is type of MessageData
                    await this.sendMessage(bot, action.data.message);
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