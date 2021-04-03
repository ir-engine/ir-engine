import { BadRequest } from '@feathersjs/errors';
import { Params } from '@feathersjs/feathers';
import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { QueryTypes } from 'sequelize';
import { Application } from '../../../declarations';
import { extractLoggedInUserFromParams } from '../../user/auth-management/auth-management.utils';

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
    let action = params.action;   
    
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
    
      const [notification] = await this.app.get('sequelizeClient').query(dataQuery,
      {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: {
          feedId, 
          creatorId,
          type
        }
      });
      return notification;
    }

    action = params.query?.action;
    if(action === 'byCurrentCreator'){
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

        const dataQuery = `SELECT notifications.*, sr.url as previewUrl, creator.username as creator_username,  sr2.url as avatar, comments.text as comment_text 
        FROM \`notifications\` as notifications
        LEFT JOIN \`feed\` as feed ON feed.id=notifications.feedId
        LEFT JOIN \`static_resource\` as sr ON sr.id=feed.previewId
        JOIN \`creator\` as creator ON creator.id=notifications.creatorAuthorId
        LEFT JOIN \`static_resource\` as sr2 ON sr2.id=creator.avatarId
        LEFT JOIN \`comments\` as comments ON comments.id=notifications.commentId
        WHERE notifications.creatorViewerId=:creatorId 
        ORDER BY notifications.createdAt DESC`;

        const notificationList = await this.app.get('sequelizeClient').query(dataQuery,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: {
            creatorId,
          }
        });
        return notificationList;
    }
    return 1;
  }



}
