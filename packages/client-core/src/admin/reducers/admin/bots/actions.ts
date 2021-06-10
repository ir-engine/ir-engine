import {
   BOT_ADMIN_CREATE,
   BOT_ADMIN_DISPLAY
} from "../../actions";

export interface BotsRetrievedResponse {
      type: string,
      bots: any[]
}

export const fetchedBot = (bots: any): BotsRetrievedResponse => {
    return {
       type: BOT_ADMIN_DISPLAY,
       bots: bots
    };
};
