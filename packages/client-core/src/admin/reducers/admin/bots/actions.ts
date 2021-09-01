import {
  BOT_ADMIN_CREATE,
  BOT_ADMIN_DISPLAY,
  BOT_COMMAND_ADMIN_CREATE,
  BOT_ADMIN_REMOVE,
  BOT_COMMAND_ADMIN_REMOVE,
  BOT_ADMIN_UPDATE
} from '../../actions'

export interface BotsRetrievedResponse {
  type: string
  bots: any[]
}

export interface BotsCreatedResponse {
  type: string
  bot: any
}

export interface botCommandCreatedResponse {
  type: string
  botCommand: any[]
}

export const fetchedBot = (bots: any): BotsRetrievedResponse => {
  return {
    type: BOT_ADMIN_DISPLAY,
    bots: bots
  }
}

export const botCreated = (bot: any): BotsCreatedResponse => {
  return {
    type: BOT_ADMIN_CREATE,
    bot: bot
  }
}

export const botCammandCreated = (botCommand: any): botCommandCreatedResponse => {
  return {
    type: BOT_COMMAND_ADMIN_CREATE,
    botCommand: botCommand
  }
}

export const botRemoved = (bot: any): any => {
  return {
    type: BOT_ADMIN_REMOVE,
    bot: bot
  }
}

export const botCommandRemoved = (botCommand: any): any => {
  return {
    type: BOT_COMMAND_ADMIN_REMOVE,
    botCommand: botCommand
  }
}

export const botPatched = (result: any): any => {
  return {
    type: BOT_ADMIN_UPDATE,
    bot: result
  }
}
