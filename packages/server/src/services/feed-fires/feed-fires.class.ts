import { BadRequest } from '@feathersjs/errors';
import { Params } from '@feathersjs/feathers';
import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { QueryTypes } from 'sequelize';
import { Application } from '../../declarations';
import { extractLoggedInUserFromParams } from '../auth-management/auth-management.utils';

/**
 * A class for ARC Feed service
 */
export class FeedFires extends Service {
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
      if (!loggedInUser.userId) {
        return Promise.reject(new BadRequest('Could not get fired users list. Users isn\'t logged in! '));
      }
      const skip = params.query?.$skip ? params.query.$skip : 0;
      const limit = params.query?.$limit ? params.query.$limit : 100;
  
      const {
        feed_fires:feedFiresModel,
        user:userModel,
      } = this.app.get('sequelizeClient').models;

      const feed_fired_users = await feedFiresModel.findAndCountAll({
        where:{
          feedId: params.query?.feedId
        },
        offset: skip,
        limit,
        include: [
          { model: userModel, as: 'user' }
        ],
        order: [ [ 'createdAt', 'DESC' ] ] // order not used in find?
      });

      const data = feed_fired_users.rows.map(fire => {
        const user = fire.user.dataValues;
        return { // TODO: get creator from corresponding table
            userId: user.id,
            id:user.id,
            avatar: 'https://picsum.photos/40/40',
            name: user.name,
            username: user.name,
            verified : true,
        }  
      });
      const feedsResult = {
        data,
        skip: skip,
        limit: limit,
        total: feed_fired_users.count,
      };
  
      return feedsResult;
    }

  async create (data : any, params?:Params): Promise<any> {
    const loggedInUser = extractLoggedInUserFromParams(params);
    if (!loggedInUser.userId) {
      return Promise.reject(new BadRequest('Could not add fire. Users isn\'t logged in! '));
    }
    const {feed_fires:feedFiresModel} = this.app.get('sequelizeClient').models;
    const newFire =  await feedFiresModel.create({feedId:data.feedId, authorId:loggedInUser.userId});
    return  newFire;

  }

  async remove ( feedId: string,  params?:Params): Promise<any> {
    const loggedInUser = extractLoggedInUserFromParams(params);
    if (!loggedInUser.userId) {
      return Promise.reject(new BadRequest('Could not remove fire. Users isn\'t logged in! '));
    }
    
    const dataQuery = `DELETE FROM  \`feed_fires\` WHERE feedId=:feedId AND authorId=:authorId`;
    await this.app.get('sequelizeClient').query(dataQuery,
      {
        type: QueryTypes.DELETE,
        raw: true,
        replacements: {
          feedId:feedId, 
          authorId:loggedInUser.userId
        }
      });
  }
}
