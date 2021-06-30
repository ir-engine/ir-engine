# WORK IN PROGRESS

## Bot API

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