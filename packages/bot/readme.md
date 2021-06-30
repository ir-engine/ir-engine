# WORK IN PROGRESS

## Bot API

```js

const {
  BotAction,
  setupBots,
  runBots
} = require('./src/bot-api');

const BotManager = setupBots();

botManager.addBot("bot1");
botManager.addAction("bot1", BotAction.delay(1000));
botManager.addAction("bot1", BotAction.disconnect());

runBots();

```