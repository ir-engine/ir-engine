import { AdminBot, BotCommands } from '@xrengine/common/src/interfaces/AdminBot'

import { Application } from '../../../declarations'

export const createBotCommands = async (app: Application, bot: AdminBot, commands: BotCommands[]) => {
  const botId = bot.id
  commands.forEach(async (element: any) => {
    await app.service('bot-command').create({
      name: element.name,
      description: element.description,
      botId: botId
    })
  })
  return context
}
