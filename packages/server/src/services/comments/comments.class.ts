import { BadRequest } from '@feathersjs/errors';
import { Params } from '@feathersjs/feathers';
import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { QueryTypes } from 'sequelize';
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
      const loggedInUser = extractLoggedInUserFromParams(params);

      const dataQuery = loggedInUser?.userId  ? `SELECT comments.*, user.id as userId, user.name as userName, COUNT(cf.id) as fires, iscf.id as fired
          FROM \`comments\` as comments
          JOIN \`user\` as user ON user.id=comments.authorId
          LEFT JOIN \`comments_fires\` as cf ON cf.commentId=comments.id 
          LEFT JOIN \`comments_fires\` as iscf ON iscf.commentId=comments.id  AND iscf.authorId=:loggedInUser
          WHERE 1 
          GROUP BY comments.id
          ORDER BY comments.createdAt DESC    
          LIMIT :skip, :limit` : 
          `SELECT comments.*, user.id as userId, user.name as userName, COUNT(cf.id) as fires
          FROM \`comments\` as comments
          JOIN \`user\` as user ON user.id=comments.authorId
          LEFT JOIN \`comments_fires\` as cf ON cf.commentId=comments.id 
          WHERE 1 
          GROUP BY comments.id
          ORDER BY comments.createdAt DESC    
          LIMIT :skip, :limit`;
        const queryParamsReplacements = {
          skip,
          limit,
        } as any;
        if(loggedInUser && loggedInUser.userId){
          queryParamsReplacements.loggedInUser =  loggedInUser.userId;
        }
      const feed_comments = await this.app.get('sequelizeClient').query(dataQuery,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: queryParamsReplacements
        });


      const data = feed_comments.map(comment => {
        return {
            creator: {
              userId: comment.userId,
              id:comment.userId,
              avatar: 'https://picsum.photos/40/40',
              name: comment.userName,
              username: comment.userName,
              verified : true,
            },
            id:comment.id,
            feedId:comment.feedId,
            text:comment.text,
            fires: comment.fires,
            isFired:comment.fired ? true : false
        }  
      });
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
