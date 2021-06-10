import { Dispatch } from "redux";
import { client } from "../../../../feathers";
import {
    fetchedBot
} from "./actions";

export const createBotAsAdmin = (data: any) => async (dispatch: Dispatch, getState: any): Promise<any> =>{
   try {
       const bot = await client.service("bot").create(data);
       console.log(bot);
       
   } catch (error) {
       console.error(error);
       
   }   
};

export const fetchBotAsAdmin = (offset: string) => async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
        const user = getState().get('auth').get('user');
        const skip = getState().get('adminBots').get('bots').get('skip');
        const limit = getState().get('adminBots').get('bots').get('limit');
        if(user.userRole === 'admin'){
            const bots = await client.service("bot").find({
                query: {
                    $sort: {
                        name: 1
                    },
                    $skip: offset === 'decrement' ? skip - limit : offset === 'increment' ? skip + limit : skip,
                    $limit: limit,
                    action: 'admin'
                }
            });
            dispatch(fetchedBot(bots));
        }
    } catch (error) {
       console.error(error);
        
    }
};