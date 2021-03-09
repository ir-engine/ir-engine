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
      return Promise.reject(new BadRequest('Could not remove bookmark. Users isn\'t logged in! '));
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
