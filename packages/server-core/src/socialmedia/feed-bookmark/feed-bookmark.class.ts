import { BadRequest } from '@feathersjs/errors';
import { Params } from '@feathersjs/feathers';
import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { QueryTypes } from 'sequelize';
import { Application } from '../../../declarations';
import { extractLoggedInUserFromParams } from '../auth-management/auth-management.utils';

/**
 * A class for ARC Feed-bookmark service
 */
export class FeedBookmark extends Service {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async create (data: any, params?: Params): Promise<any> {
    const {feed_bookmark:feedBookmarkModel} = this.app.get('sequelizeClient').models;

    //common  - TODO -move somewhere
    const loggedInUser = extractLoggedInUserFromParams(params);
    const creatorQuery = `SELECT id  FROM \`creator\` as creator WHERE creator.userId=:userId`;
    const [creator] = await this.app.get('sequelizeClient').query(creatorQuery,
      {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: {userId:loggedInUser.userId}
      });   
    const creatorId = creator.id;
    const newBookmark =  await feedBookmarkModel.create({feedId:data.feedId, creatorId});
    return  newBookmark;
  }


  async remove ( feedId: string,  params?: Params): Promise<any> {
   //common  - TODO -move somewhere
   const loggedInUser = extractLoggedInUserFromParams(params);
   const creatorQuery = `SELECT id  FROM \`creator\` as creator WHERE creator.userId=:userId`;
   const [creator] = await this.app.get('sequelizeClient').query(creatorQuery,
     {
       type: QueryTypes.SELECT,
       raw: true,
       replacements: {userId:loggedInUser.userId}
     });   
   const creatorId = creator.id;

    const dataQuery = `DELETE FROM  \`feed_bookmark\`  
    WHERE feedId=:feedId AND creatorId=:creatorId`;
    await this.app.get('sequelizeClient').query(dataQuery,
      {
        type: QueryTypes.DELETE,
        raw: true,
        replacements: {
          feedId:feedId, 
          creatorId
        }
      });
  }
}
