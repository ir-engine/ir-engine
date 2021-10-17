export const BotsAction = {
  fetchedBot: (bots: any) => {
    return {
      type: 'BOT_ADMIN_DISPLAY' as const,
      bots: bots
    }
  },
  botCreated: (bot: any) => {
    return {
      type: 'BOT_ADMIN_CREATE' as const,
      bot: bot
    }
  },
  botCammandCreated: (botCommand: any) => {
    return {
      type: 'BOT_COMMAND_ADMIN_CREATE' as const,
      botCommand: botCommand
    }
  },
  botRemoved: (bot: any) => {
    return {
      type: 'BOT_ADMIN_REMOVE' as const,
      bot: bot
    }
  },
  botCommandRemoved: (botCommand: any) => {
    return {
      type: 'BOT_COMMAND_ADMIN_REMOVE' as const,
      botCommand: botCommand
    }
  },
  botPatched: (result: any) => {
    return {
      type: 'BOT_ADMIN_UPDATE' as const,
      bot: result
    }
  }
}

export type BotsActionType = ReturnType<typeof BotsAction[keyof typeof BotsAction]>
