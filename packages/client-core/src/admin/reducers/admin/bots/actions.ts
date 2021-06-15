import {
   BOT_ADMIN_CREATE,
   BOT_ADMIN_DISPLAY,
   BOT_COMMAND_ADMIN_CREATE
} from "../../actions";

export interface BotsRetrievedResponse {
      type: string,
      bots: any[]
}

export interface BotsCreatedResponse {
   type: string,
   bot: any
}

export interface BotCammondCreatedResponse {
   type: string,
   botCammond: any[]
}

export const fetchedBot = (bots: any): BotsRetrievedResponse => {
    return {
       type: BOT_ADMIN_DISPLAY,
       bots: bots
    };
};

export const botCreated = (bot: any): BotsCreatedResponse => {
   return {
      type: BOT_ADMIN_CREATE,
      bot: bot
   }
}

export const botCammandCreated = (botCommand: any): BotCammondCreatedResponse => {
   return {
      type: BOT_COMMAND_ADMIN_CREATE,
      botCammond: botCommand
   }
}