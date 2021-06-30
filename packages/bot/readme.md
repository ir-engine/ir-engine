# Bot API - WORK IN PROGRESS

### Example

```js

const {
  BotAction,
  setupBots,
  runBots
} = require('./src/bot-api');

const BotManager = setupBots();

BotManager.addBot("bot1");
BotManager.addAction("bot1", BotAction.delay(1000));
BotManager.addAction("bot1", BotAction.disconnect());

runBots(BotManager);

```


### API

```
const bot = Bot({ name: string, fakeMediaPath: string, headless: true, autolog: true })

async bot.keyPress(key: string, numMilliSeconds: number)

// ... TODO

```