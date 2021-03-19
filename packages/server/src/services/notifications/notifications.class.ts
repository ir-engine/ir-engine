import { BadRequest } from '@feathersjs/errors';
import { Params } from '@feathersjs/feathers';
import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { QueryTypes } from 'sequelize';
import { Application } from '../../declarations';
import { extractLoggedInUserFromParams } from '../auth-management/auth-management.utils';

/**
 * A class for ARC Feed service
 */
export class Notifications extends Service {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }


  /**
   * @function find it is used to find specific users
   *
   * @param params user id
   * @returns {@Array} of found users
   */

   async find (params: Params): Promise<any> {
    const loggedInUser = extractLoggedInUserFromParams(params);
    if (!loggedInUser?.userId) {
      return Promise.reject(new BadRequest('Could not get fired users list. Users isn\'t logged in! '));
    }
    const action = params.action;   

    if(action === 'getNotificationId'){
      const feedId = params.feedId;
      const type = params.type;

      //common  - TODO -move somewhere
      const loggedInUser = extractLoggedInUserFromParams(params);
      const creatorQuery = `SELECT id  FROM \`creator\` WHERE userId=:userId`;
      const [creator] = await this.app.get('sequelizeClient').query(creatorQuery,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: {userId:loggedInUser.userId}
        });  
      const creatorId = creator?.id ;
      const dataQuery = `SELECT id 
      FROM \`notifications\` 
      WHERE feedId=:feedId AND creatorAuthorId=:creatorId AND type=:type`;
    
      const [feed] = await this.app.get('sequelizeClient').query(dataQuery,
      {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: {
          feedId, 
          creatorId,
          type
        }
      });
      return feed;
    }
    return 1;
  }



}
