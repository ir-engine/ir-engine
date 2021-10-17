import { AdminBotResult } from '@xrengine/common/src/interfaces/AdminBotResult'
import { AdminBot, BotCommands } from '@xrengine/common/src/interfaces/AdminBot'
export const BotsAction = {
  fetchedBot: (bots: AdminBotResult) => {
    return {
      type: 'BOT_ADMIN_DISPLAY' as const,
      bots: bots
    }
  },
  botCreated: (bot: AdminBot) => {
    return {
      type: 'BOT_ADMIN_CREATE' as const,
      bot: bot
    }
  },
  botCammandCreated: (botCommand: BotCommands) => {
    return {
      type: 'BOT_COMMAND_ADMIN_CREATE' as const,
      botCommand: botCommand
    }
  },
  botRemoved: (bot: AdminBot) => {
    debugger
    return {
      type: 'BOT_ADMIN_REMOVE' as const,
      bot: bot
    }
  },
  botCommandRemoved: (botCommand: BotCommands) => {
    return {
      type: 'BOT_COMMAND_ADMIN_REMOVE' as const,
      botCommand: botCommand
    }
  },
  botPatched: (bot: AdminBot) => {
    return {
      type: 'BOT_ADMIN_UPDATE' as const,
      bot: bot
    }
  }
}

export type BotsActionType = ReturnType<typeof BotsAction[keyof typeof BotsAction]>
