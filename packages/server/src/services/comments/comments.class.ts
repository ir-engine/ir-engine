import { BadRequest } from '@feathersjs/errors';
import { Params } from '@feathersjs/feathers';
import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';
import { extractLoggedInUserFromParams } from '../auth-management/auth-management.utils';

/**
 * A class for ARC Feed service
 */
export class Comments extends Service {
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
      const skip = params.query?.$skip ? params.query.$skip : 0;
      const limit = params.query?.$limit ? params.query.$limit : 100;

      const {
        comments:commentsModel,
        user:userModel,
      } = this.app.get('sequelizeClient').models;

      const feed_comments = await commentsModel.findAndCountAll({
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

      console.log('feed_comments',feed_comments)
      const data = feed_comments.rows.map(comment => {
        const user = comment.user.dataValues;
        return { // TODO: get creator from corresponding table
            creator: {
              userId: user.id,
              id:user.id,
              avatar: 'https://picsum.photos/40/40',
              name: user.name,
              username: user.name,
              verified : true,
            },
            id:comment.id,
            feedId:comment.feedId,
            text:comment.text,
        }  
      });
      console.log('data', data)
      const feedsResult = {
        data,
        skip: skip,
        limit: limit,
        total: feed_comments.count,
      };

      return feedsResult;
    }




    async create (data : any, params?:Params ): Promise<any> {
      const loggedInUser = extractLoggedInUserFromParams(params);
      const {comments:commentsModel, user:userModel} = this.app.get('sequelizeClient').models;
      const newComment =  await commentsModel.create({feedId:data.feedId, authorId:loggedInUser.userId, text: data.text});
      const commentFromDb = await commentsModel.findOne({
        where: {
          id: newComment.id
        },
        include: [
          { model: userModel, as: 'user' },
        ]
      });
      return  {
        creator: {
          userId: commentFromDb.user.dataValues.id,
          id:commentFromDb.user.dataValues.id,
          avatar: 'https://picsum.photos/40/40',
          name: commentFromDb.user.dataValues.name,
          username: commentFromDb.user.dataValues.name,
          verified : true,
        },
        id:commentFromDb.id,
        feedId:commentFromDb.feedId,
        text:commentFromDb.text,
    } ;
    }
}
