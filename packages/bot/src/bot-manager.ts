import { XREngineBot } from './bot'
import { BotActionType } from './bot-action'

export class BotManager {
  bots: {
    [x: string]: XREngineBot
  }
  actions: any
  options: any
  /**
   * BotManager constructor
   * @param options:
   *      - headless
   *      - verbose
   *      - onError
   */
  constructor(options = {}) {
    this.bots = {}
    this.actions = []
    this.options = options
  }

  findBotByName(name) {
    return this.bots[name]
  }

  addBot(name) {
    const foundBot = this.findBotByName(name)
    if (foundBot) {
      return foundBot
    }

    const bot = new XREngineBot({
      name,
      ...this.options
    })

    this.bots[name] = bot

    return bot
  }

  addAction(botName, action) {
    this.actions.push({ botName, action })
  }

  async run() {
    for (const botAction of this.actions) {
      const { botName, action } = botAction
      const bot = this.findBotByName(botName)

      if (!bot) {
        console.error('Invalid bot name', botName)
        continue
      }

      switch (action.type) {
        case BotActionType.Connect:
          await bot.launchBrowser()
          break

        case BotActionType.Disconnect:
          bot.quit()
          break

        case BotActionType.EnterRoom:
          // action.data is type of EnterRoomData.
          await bot.enterRoom(`https://${action.data.domain}/location/${action.data.locationName}`)
          break

        case BotActionType.LeaveRoom:
          // action.data is type of EnterRoomData.
          await bot.navigate(`https://${action.data.domain}/location/${action.data.locationName}`)
          break

        case BotActionType.KeyPress:
          // action.data is type of KeyEventData
          await bot.keyPress(action.data.key, action.data.pressedTime)
          break

        case BotActionType.SendAudio:
          await bot.sendAudio(action.data.duration)
          break

        case BotActionType.StopAudio:
          await bot.stopAudio(bot)
          break

        case BotActionType.ReceiveAudio:
          await bot.recvAudio(action.data.duration)
          break

        case BotActionType.SendVideo:
          await bot.sendVideo(action.data.duration)
          break

        case BotActionType.StopVideo:
          await bot.stopVideo(bot)
          break

        case BotActionType.ReceiveVideo:
          await bot.recvVideo(action.data.duration)
          break

        case BotActionType.InteractObject:
          await bot.interactObject()
          break

        case BotActionType.SendMessage:
          // action.data is type of MessageData
          await bot.sendMessage(action.data.message)
          break

        case BotActionType.Delay:
          await bot.delay(action.data.timeout)
          break
        default:
          console.error('Unknown bot action')
          break
      }
    }
  }

  async clear() {
    const bots = Object.values(this.bots)
    for (const bot of bots) {
      bot.quit()
    }

    this.bots = {}
  }
}
